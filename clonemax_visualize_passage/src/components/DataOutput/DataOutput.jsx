import { useRef } from 'react';
import * as d3 from 'd3';
import * as XLSX from 'xlsx';

const DataOutput = ({ plateData, svgRef, fileName, fileIndex, totalFiles }) => {
    const downloadSVG = () => {
        if (!svgRef || !svgRef.current || !svgRef.current.svgRef) return;

        // SVGをXML文字列として取得
        const svgElement = svgRef.current.svgRef;
        const svgString = new XMLSerializer().serializeToString(svgElement);

        // SVG文字列をBlobに変換
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        // ダウンロードリンクを作成して自動クリック
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `${fileName || 'plate'}_visualization.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // オブジェクトURLの解放
        URL.revokeObjectURL(url);
    };

    const downloadPNG = () => {
        if (!svgRef || !svgRef.current || !svgRef.current.svgRef) return;

        // SVGをキャンバスに描画してPNGを生成
        const svgElement = svgRef.current.svgRef;
        const bbox = svgElement.getBBox();

        const canvas = document.createElement('canvas');
        const scale = 2; // 高解像度のための倍率
        canvas.width = svgElement.width.baseVal.value * scale;
        canvas.height = svgElement.height.baseVal.value * scale;

        const context = canvas.getContext('2d');
        context.scale(scale, scale);

        // SVGをキャンバスに描画
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();

        // SVG画像のロード完了時にキャンバスに描画してダウンロード
        img.onload = () => {
            context.drawImage(img, 0, 0);

            // キャンバスからPNG画像をダウンロード
            const dataUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = dataUrl;
            downloadLink.download = `${fileName || 'plate'}_visualization.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };

        // Data URLとしてSVGを読み込み
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    };

    const downloadCSV = () => {
        if (!plateData || plateData.length === 0) return;

        // データを行と列に変換
        const rows = {};
        plateData.forEach(well => {
            if (!rows[well.rowLabel]) {
                rows[well.rowLabel] = Array(12).fill(null);
            }
            rows[well.rowLabel][well.colLabel - 1] = well.value;
        });

        // CSVフォーマットに変換
        let csvContent = ',1,2,3,4,5,6,7,8,9,10,11,12\n';
        Object.keys(rows).sort().forEach(rowLabel => {
            csvContent += `${rowLabel},${rows[rowLabel].join(',')}\n`;
        });

        // ファイルダウンロード
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `${fileName || 'plate'}_data.csv`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    };

    const downloadExcel = () => {
        if (!plateData || plateData.length === 0) return;

        // データを行と列に変換
        const rows = {};
        plateData.forEach(well => {
            if (!rows[well.rowLabel]) {
                rows[well.rowLabel] = Array(12).fill(null);
            }
            rows[well.rowLabel][well.colLabel - 1] = well.value;
        });

        // Excel用のデータ形式に変換
        const header = ['', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const excelData = [header];

        Object.keys(rows).sort().forEach(rowLabel => {
            excelData.push([rowLabel, ...rows[rowLabel]]);
        });

        // ワークブックとワークシートを作成
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, 'PlateData');

        // Excelファイルを生成してダウンロード
        XLSX.writeFile(wb, `${fileName || 'plate'}_data.xlsx`);
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={downloadSVG}
                    className="flex items-center justify-center px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                    <svg className="icon-xs mr-1 text-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    SVG
                </button>

                <button
                    onClick={downloadPNG}
                    className="flex items-center justify-center px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                    <svg className="icon-xs mr-1 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    PNG
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={downloadCSV}
                    className="flex items-center justify-center px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                    <svg className="icon-xs mr-1 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CSV
                </button>

                <button
                    onClick={downloadExcel}
                    className="flex items-center justify-center px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                    <svg className="icon-xs mr-1 text-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Excel
                </button>
            </div>
        </div>
    );
};

export default DataOutput;
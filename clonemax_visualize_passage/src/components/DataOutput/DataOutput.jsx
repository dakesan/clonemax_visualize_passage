import { useRef } from 'react';
import * as d3 from 'd3';
import * as XLSX from 'xlsx';

const DataOutput = ({ plateData, svgRef, fileName }) => {
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
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">データ出力</h2>

            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    onClick={downloadSVG}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                    SVG形式で保存
                </button>

                <button
                    onClick={downloadPNG}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                    PNG形式で保存
                </button>

                <button
                    onClick={downloadCSV}
                    className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                    CSVデータを保存
                </button>

                <button
                    onClick={downloadExcel}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                    Excel形式で保存
                </button>
            </div>
        </div>
    );
};

export default DataOutput;
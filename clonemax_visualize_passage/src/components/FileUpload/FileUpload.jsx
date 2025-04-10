import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

const FileUpload = ({ onDataLoaded }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const processExcel = async (file) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // 指定されたフォーマットからデータを抽出 (B5:E101)
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: "B5:E101" });

            // ヘッダー行を抽出して検証
            const headers = jsonData[0] || [];
            if (!headers.includes("Well") || !headers.includes("% confluence")) {
                throw new Error('必要なカラム (Well, % confluence) が見つかりません。');
            }

            // Wellと% confluenceのインデックスを取得
            const wellIndex = headers.indexOf("Well");
            const confluenceIndex = headers.indexOf("% confluence");

            if (wellIndex === -1 || confluenceIndex === -1) {
                throw new Error('必要なカラム (Well, % confluence) が見つかりません。');
            }

            // B5:E101からデータを抽出し、96ウェルプレートの形式に変換
            const plateData = processPlateData(jsonData.slice(1), wellIndex, confluenceIndex);

            // 親コンポーネントにデータを渡す
            onDataLoaded(plateData, file.name);
        } catch (err) {
            setError('ファイルの処理中にエラーが発生しました: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 96ウェルプレートのデータを処理する関数
    const processPlateData = (rawData, wellIndex, confluenceIndex) => {
        const processedData = [];

        // ウェルの行と列を解析するヘルパー関数
        const parseWellPosition = (wellId) => {
            if (!wellId || typeof wellId !== 'string' || wellId.length < 2) {
                return null;
            }

            const rowLabel = wellId.charAt(0).toUpperCase();
            const colLabel = parseInt(wellId.substring(1));

            if (isNaN(colLabel) || colLabel < 1 || colLabel > 12 ||
                rowLabel < 'A' || rowLabel > 'H') {
                return null;
            }

            const row = rowLabel.charCodeAt(0) - 'A'.charCodeAt(0);
            const col = colLabel - 1;

            return { row, col, rowLabel, colLabel };
        };

        // データを処理
        for (const row of rawData) {
            if (!Array.isArray(row) || row.length <= Math.max(wellIndex, confluenceIndex)) {
                continue;
            }

            const wellId = row[wellIndex];
            const confluenceValue = parseFloat(row[confluenceIndex]);

            if (wellId && !isNaN(confluenceValue)) {
                const wellPosition = parseWellPosition(wellId);

                if (wellPosition) {
                    processedData.push({
                        id: wellId,
                        row: wellPosition.row,
                        col: wellPosition.col,
                        rowLabel: wellPosition.rowLabel,
                        colLabel: wellPosition.colLabel,
                        value: confluenceValue
                    });
                }
            }
        }

        // もし96ウェルの一部のデータしかない場合は、残りのウェルを0値で埋める
        const existingWells = new Set(processedData.map(well => well.id));

        for (let row = 0; row < 8; row++) {
            const rowLabel = String.fromCharCode('A'.charCodeAt(0) + row);

            for (let col = 0; col < 12; col++) {
                const colLabel = col + 1;
                const wellId = `${rowLabel}${colLabel}`;

                if (!existingWells.has(wellId)) {
                    processedData.push({
                        id: wellId,
                        row: row,
                        col: col,
                        rowLabel: rowLabel,
                        colLabel: colLabel,
                        value: 0
                    });
                }
            }
        }

        return processedData;
    };

    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        if (file) {
            // ファイルタイプの検証
            if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
                setError('サポートされていないファイル形式です。Excel形式(.xlsx, .xls)のファイルをアップロードしてください。');
                return;
            }

            processExcel(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        multiple: false
    });

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Excelファイルをアップロード</h2>

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p className="text-blue-500">ここにファイルをドロップ...</p>
                ) : (
                    <div>
                        <p className="mb-2">ここにExcelファイルをドラッグ&ドロップするか</p>
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
                        >
                            ファイルを選択
                        </button>
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full w-3/4 animate-[pulse_1s_ease-in-out_infinite]"></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">ファイル処理中...</p>
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
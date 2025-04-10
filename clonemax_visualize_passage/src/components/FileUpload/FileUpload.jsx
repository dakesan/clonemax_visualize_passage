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
        // 複数ファイルの処理に対応
        for (const file of acceptedFiles) {
            // ファイルタイプの検証
            if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
                setError('サポートされていないファイル形式です。Excel形式(.xlsx, .xls)のファイルをアップロードしてください。');
                continue;
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
        multiple: true // 複数ファイルのアップロードを許可
    });

    return (
        <div className="p-4">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragActive
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.02] shadow-md'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10'
                    }`}
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                    <div className="py-4">
                        <div className="animate-bounce mb-3">
                            <svg className="mx-auto h-3 w-3 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </div>
                        <p className="text-indigo-600 dark:text-indigo-400 font-medium">ここにファイルをドロップ...</p>
                    </div>
                ) : (
                    <div>
                        <svg className="mx-auto h-3 w-3 text-gray-400 mb-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-4 text-gray-600 dark:text-gray-300"><span className="font-medium">Excelファイル</span>をドラッグ&ドロップするか</p>
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <svg className="mr-2 -ml-1 h-2 w-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            ファイルを選択
                        </button>
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                            .xlsx または .xls 形式のファイルをアップロードしてください
                        </p>
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="mt-4">
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full animate-pulse-x"></div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-2 w-2 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        ファイル処理中...
                    </p>
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-md flex items-start">
                    <svg className="h-2 w-2 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
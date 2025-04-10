import { useState, useEffect } from 'react';

const ParameterSettings = ({ onSettingsChange, plateData }) => {
    // 閾値とカラーマッピングの設定
    const [minThreshold, setMinThreshold] = useState(0.2);
    const [maxThreshold, setMaxThreshold] = useState(50);

    // カラーパレット選択
    const [colorPalette, setColorPalette] = useState('blue-red');

    // 表示モード設定
    const [displayMode, setDisplayMode] = useState('heatmap');

    // データロード時に最小値・最大値を自動設定
    useEffect(() => {
        if (plateData && plateData.length > 0) {
            const values = plateData.map(well => well.value).filter(val => val > 0);
            if (values.length > 0) {
                const min = Math.min(...values);
                const max = Math.max(...values);

                setMinThreshold(min);
                setMaxThreshold(max);
            }
        }
    }, [plateData]);

    // 設定変更時に親コンポーネントに通知
    useEffect(() => {
        onSettingsChange({
            minThreshold,
            maxThreshold,
            colorPalette,
            displayMode
        });
    }, [minThreshold, maxThreshold, colorPalette, displayMode, onSettingsChange]);

    // 閾値の最小・最大値を取得
    const getMinValue = () => {
        if (!plateData || plateData.length === 0) return 0;
        const values = plateData.map(well => well.value).filter(val => val > 0);
        return values.length > 0 ? Math.min(...values) : 0;
    };

    const getMaxValue = () => {
        if (!plateData || plateData.length === 0) return 100;
        const values = plateData.map(well => well.value);
        return values.length > 0 ? Math.max(...values) : 100;
    };

    // プレート内のデータ統計情報
    const plateStats = () => {
        if (!plateData || plateData.length === 0) return { min: 0, max: 0, avg: 0, wells: 0 };

        const values = plateData.map(well => well.value).filter(val => val > 0);
        if (values.length === 0) return { min: 0, max: 0, avg: 0, wells: 0 };

        const min = Math.min(...values);
        const max = Math.max(...values);
        const sum = values.reduce((acc, val) => acc + val, 0);
        const avg = sum / values.length;

        return {
            min: min.toFixed(1),
            max: max.toFixed(1),
            avg: avg.toFixed(1),
            wells: values.length
        };
    };

    const stats = plateStats();
    const minValue = getMinValue();
    const maxValue = getMaxValue();

    return (
        <div className="p-4">
            {/* データ統計情報 */}
            <div className="mb-6 bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">プレート統計情報</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">最小値:</span>
                        <span className="float-right font-medium text-gray-900 dark:text-gray-100">{stats.min}</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">最大値:</span>
                        <span className="float-right font-medium text-gray-900 dark:text-gray-100">{stats.max}</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">平均値:</span>
                        <span className="float-right font-medium text-gray-900 dark:text-gray-100">{stats.avg}</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">データ数:</span>
                        <span className="float-right font-medium text-gray-900 dark:text-gray-100">{stats.wells}</span>
                    </div>
                </div>
            </div>

            {/* 閾値設定 */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">閾値設定</h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded border border-gray-100 dark:border-gray-700">
                        範囲: {minThreshold.toFixed(1)} 〜 {maxThreshold.toFixed(1)}
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">下限値</label>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round((minThreshold - minValue) / (maxValue - minValue) * 100) || 0}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min={minValue}
                                max={maxThreshold}
                                step={0.1}
                                value={minThreshold}
                                onChange={(e) => setMinThreshold(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="relative">
                                <input
                                    type="number"
                                    value={minThreshold}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        if (!isNaN(value) && value <= maxThreshold) {
                                            setMinThreshold(value);
                                        }
                                    }}
                                    step={0.1}
                                    className="w-20 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded p-1 pl-2 pr-7"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-2">
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">上限値</label>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round((maxThreshold - minValue) / (maxValue - minValue) * 100) || 0}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min={minThreshold}
                                max={maxValue}
                                step={0.1}
                                value={maxThreshold}
                                onChange={(e) => setMaxThreshold(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="relative">
                                <input
                                    type="number"
                                    value={maxThreshold}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        if (!isNaN(value) && value >= minThreshold) {
                                            setMaxThreshold(value);
                                        }
                                    }}
                                    step={0.1}
                                    className="w-20 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded p-1 pl-2 pr-7"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-2">
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* カラーパレット設定 */}
            <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">カラーマッピング</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div
                        className={`relative rounded-md cursor-pointer border-2 overflow-hidden group transition duration-200 ${colorPalette === 'blue-red' ? 'ring-2 ring-indigo-500 border-transparent' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        onClick={() => setColorPalette('blue-red')}
                    >
                        <div className="h-10 bg-gradient-to-r from-blue-500 via-white to-red-500"></div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-200">
                            <span className="text-xs font-medium text-white bg-black bg-opacity-50 px-2 py-1 rounded">青-赤</span>
                        </div>
                    </div>
                    <div
                        className={`relative rounded-md cursor-pointer border-2 overflow-hidden group transition duration-200 ${colorPalette === 'green-red' ? 'ring-2 ring-indigo-500 border-transparent' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        onClick={() => setColorPalette('green-red')}
                    >
                        <div className="h-10 bg-gradient-to-r from-green-500 via-white to-red-500"></div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-200">
                            <span className="text-xs font-medium text-white bg-black bg-opacity-50 px-2 py-1 rounded">緑-赤</span>
                        </div>
                    </div>
                    <div
                        className={`relative rounded-md cursor-pointer border-2 overflow-hidden group transition duration-200 ${colorPalette === 'purple-yellow' ? 'ring-2 ring-indigo-500 border-transparent' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        onClick={() => setColorPalette('purple-yellow')}
                    >
                        <div className="h-10 bg-gradient-to-r from-purple-500 via-white to-yellow-500"></div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-200">
                            <span className="text-xs font-medium text-white bg-black bg-opacity-50 px-2 py-1 rounded">紫-黄</span>
                        </div>
                    </div>
                    <div
                        className={`relative rounded-md cursor-pointer border-2 overflow-hidden group transition duration-200 ${colorPalette === 'grayscale' ? 'ring-2 ring-indigo-500 border-transparent' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        onClick={() => setColorPalette('grayscale')}
                    >
                        <div className="h-10 bg-gradient-to-r from-gray-100 via-gray-400 to-gray-900"></div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-200">
                            <span className="text-xs font-medium text-white bg-black bg-opacity-50 px-2 py-1 rounded">グレースケール</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 表示モード設定 */}
            <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">表示モード</h3>
                <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-3 gap-px bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                        <label
                            className={`cursor-pointer flex flex-col items-center justify-center px-3 py-2 ${displayMode === 'heatmap'
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <input
                                type="radio"
                                className="sr-only"
                                name="displayMode"
                                value="heatmap"
                                checked={displayMode === 'heatmap'}
                                onChange={() => setDisplayMode('heatmap')}
                            />
                            <svg className="h-2 w-2 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                            </svg>
                            <span className="text-xs font-medium">ヒートマップ</span>
                        </label>
                        <label
                            className={`cursor-pointer flex flex-col items-center justify-center px-3 py-2 ${displayMode === 'numeric'
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <input
                                type="radio"
                                className="sr-only"
                                name="displayMode"
                                value="numeric"
                                checked={displayMode === 'numeric'}
                                onChange={() => setDisplayMode('numeric')}
                            />
                            <svg className="h-2 w-2 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                            <span className="text-xs font-medium">数値表示</span>
                        </label>
                        <label
                            className={`cursor-pointer flex flex-col items-center justify-center px-3 py-2 ${displayMode === 'hybrid'
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <input
                                type="radio"
                                className="sr-only"
                                name="displayMode"
                                value="hybrid"
                                checked={displayMode === 'hybrid'}
                                onChange={() => setDisplayMode('hybrid')}
                            />
                            <svg className="h-2 w-2 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-medium">ハイブリッド</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* 設定リセットボタン */}
            <div className="mt-6 flex justify-end">
                <button
                    className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-medium transition-colors"
                    onClick={() => {
                        if (plateData && plateData.length > 0) {
                            const values = plateData.map(well => well.value).filter(val => val > 0);
                            if (values.length > 0) {
                                setMinThreshold(Math.min(...values));
                                setMaxThreshold(Math.max(...values));
                            }
                            setColorPalette('blue-red');
                            setDisplayMode('heatmap');
                        }
                    }}
                >
                    <svg className="h-2 w-2 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    設定をリセット
                </button>
            </div>
        </div>
    );
};

export default ParameterSettings;
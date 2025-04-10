import { useState, useEffect } from 'react';

const ParameterSettings = ({ onSettingsChange, plateData }) => {
    // 閾値とカラーマッピングの設定
    const [minThreshold, setMinThreshold] = useState(0);
    const [maxThreshold, setMaxThreshold] = useState(100);

    // カラーパレット選択
    const [colorPalette, setColorPalette] = useState('blue-red');

    // 表示モード設定
    const [displayMode, setDisplayMode] = useState('heatmap');

    // データロード時に最小値・最大値を自動設定
    useEffect(() => {
        if (plateData && plateData.length > 0) {
            const values = plateData.map(well => well.value);
            const min = Math.min(...values);
            const max = Math.max(...values);

            setMinThreshold(min);
            setMaxThreshold(max);
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

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">表示設定</h2>

            {/* 閾値設定 */}
            <div className="mb-6">
                <h3 className="text-md font-medium mb-2">閾値設定</h3>

                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">下限値</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min={plateData && plateData.length > 0 ? Math.min(...plateData.map(well => well.value)) : 0}
                            max={maxThreshold}
                            value={minThreshold}
                            onChange={(e) => setMinThreshold(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <input
                            type="number"
                            value={minThreshold}
                            onChange={(e) => setMinThreshold(parseFloat(e.target.value))}
                            className="w-20 text-sm border rounded p-1"
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">上限値</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min={minThreshold}
                            max={plateData && plateData.length > 0 ? Math.max(...plateData.map(well => well.value)) : 100}
                            value={maxThreshold}
                            onChange={(e) => setMaxThreshold(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <input
                            type="number"
                            value={maxThreshold}
                            onChange={(e) => setMaxThreshold(parseFloat(e.target.value))}
                            className="w-20 text-sm border rounded p-1"
                        />
                    </div>
                </div>
            </div>

            {/* カラーパレット設定 */}
            <div className="mb-6">
                <h3 className="text-md font-medium mb-2">カラーマッピング</h3>
                <div className="grid grid-cols-4 gap-2">
                    <div
                        className={`h-8 bg-gradient-to-r from-blue-500 to-red-500 rounded cursor-pointer border-2 ${colorPalette === 'blue-red' ? 'border-blue-700' : 'border-transparent'
                            }`}
                        onClick={() => setColorPalette('blue-red')}
                    ></div>
                    <div
                        className={`h-8 bg-gradient-to-r from-green-500 to-red-500 rounded cursor-pointer border-2 ${colorPalette === 'green-red' ? 'border-blue-700' : 'border-transparent'
                            }`}
                        onClick={() => setColorPalette('green-red')}
                    ></div>
                    <div
                        className={`h-8 bg-gradient-to-r from-purple-500 to-yellow-500 rounded cursor-pointer border-2 ${colorPalette === 'purple-yellow' ? 'border-blue-700' : 'border-transparent'
                            }`}
                        onClick={() => setColorPalette('purple-yellow')}
                    ></div>
                    <div
                        className={`h-8 bg-gradient-to-r from-gray-100 to-gray-900 rounded cursor-pointer border-2 ${colorPalette === 'grayscale' ? 'border-blue-700' : 'border-transparent'
                            }`}
                        onClick={() => setColorPalette('grayscale')}
                    ></div>
                </div>
            </div>

            {/* 表示モード設定 */}
            <div className="mb-2">
                <h3 className="text-md font-medium mb-2">表示モード</h3>
                <div className="flex gap-3">
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            className="form-radio"
                            name="displayMode"
                            value="heatmap"
                            checked={displayMode === 'heatmap'}
                            onChange={() => setDisplayMode('heatmap')}
                        />
                        <span className="ml-2">ヒートマップ</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            className="form-radio"
                            name="displayMode"
                            value="numeric"
                            checked={displayMode === 'numeric'}
                            onChange={() => setDisplayMode('numeric')}
                        />
                        <span className="ml-2">数値表示</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            className="form-radio"
                            name="displayMode"
                            value="hybrid"
                            checked={displayMode === 'hybrid'}
                            onChange={() => setDisplayMode('hybrid')}
                        />
                        <span className="ml-2">ハイブリッド</span>
                    </label>
                </div>
            </div>

            {/* 設定リセットボタン */}
            <div className="mt-6">
                <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded-md text-sm transition-colors"
                    onClick={() => {
                        if (plateData && plateData.length > 0) {
                            const values = plateData.map(well => well.value);
                            setMinThreshold(Math.min(...values));
                            setMaxThreshold(Math.max(...values));
                            setColorPalette('blue-red');
                            setDisplayMode('heatmap');
                        }
                    }}
                >
                    設定をリセット
                </button>
            </div>
        </div>
    );
};

export default ParameterSettings;
import { useState, useRef, useEffect } from 'react';
import './App.css';
import './icon-fix.css'; // SVGアイコンのサイズを修正するためのCSS
import FileUpload from './components/FileUpload/FileUpload';
import ParameterSettings from './components/ParameterSettings/ParameterSettings';
import PlateVisualization from './components/PlateVisualization/PlateVisualization';
import DataOutput from './components/DataOutput/DataOutput';

function App() {
  // 複数ファイルのデータを管理する配列
  const [plateDataList, setPlateDataList] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // 後方互換性のために現在のプレートデータを計算
  const plateData = plateDataList[currentFileIndex]?.data || null;
  const fileName = plateDataList[currentFileIndex]?.name || '';
  const [settings, setSettings] = useState({
    minThreshold: 0.2,
    maxThreshold: 50,
    colorPalette: 'blue-red',
    displayMode: 'heatmap'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const svgRef = useRef(null);

  // スクロール検出のためのイベントリスナー
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ファイルアップロード時のデータ処理
  const handleDataLoaded = (data, name) => {
    // 拡張子を除去したファイル名
    const cleanName = name.replace(/\.[^/.]+$/, "");

    // 新しいプレートデータを作成
    const newPlateData = {
      name: cleanName,
      data: data,
      timestamp: new Date().toISOString()
    };

    // 最大ファイル数を超えないようにする
    setPlateDataList(prevList => {
      // 既に同じ名前のファイルがあるかチェック
      const existingIndex = prevList.findIndex(item => item.name === cleanName);

      let newList;
      if (existingIndex >= 0) {
        // 同名ファイルがあれば上書き
        newList = [...prevList];
        newList[existingIndex] = newPlateData;
        setCurrentFileIndex(existingIndex);
      } else {
        // 新規ファイルの場合、最大数を超えないようにする
        newList = [...prevList, newPlateData].slice(-30); // 最大　30個まで
        setCurrentFileIndex(newList.length - 1); // 新しいファイルを選択
      }

      return newList;
    });
  };

  // 設定変更時の処理
  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 固定ヘッダー */}
      <header className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 ${isScrolled ? 'shadow-md' : ''} transition-shadow duration-300`}>
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mr-4">96ウェルプレートビジュアライザー</h1>
            {plateData && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              >
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                表示設定
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {fileName && (
              <div className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">現在のファイル: </span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">{fileName}</span>
              </div>
            )}

            {/* ファイルアップロードボタン */}
            <div className="relative inline-block">
              <button
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => document.getElementById('file-upload-input').click()}
              >
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                ファイルをアップロード
              </button>
              <input
                id="file-upload-input"
                type="file"
                accept=".xlsx,.xls"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    // 非表示のFileUploadコンポーネントにファイルを渡す
                    const fileUploadComponent = document.getElementById('hidden-file-upload');
                    if (fileUploadComponent) {
                      const dataTransfer = new DataTransfer();

                      // すべてのファイルを追加
                      Array.from(e.target.files).forEach(file => {
                        dataTransfer.items.add(file);
                      });

                      // 非表示のFileUploadコンポーネントの入力要素にファイルを設定
                      const inputElement = fileUploadComponent.querySelector('input[type="file"]');
                      if (inputElement) {
                        inputElement.files = dataTransfer.files;

                        // 変更イベントを発火させてFileUploadコンポーネントの処理を実行
                        const event = new Event('change', { bubbles: true });
                        inputElement.dispatchEvent(event);
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 設定パネル (表示/非表示切り替え) */}
      {showSettings && plateData && (
        <div className="fixed top-16 right-4 z-40 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 px-4 py-2">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">表示設定</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ParameterSettings
            plateData={plateData}
            onSettingsChange={handleSettingsChange}
          />
        </div>
      )}

      <main className="pt-16 pb-12"> {/* ヘッダーの高さ分のパディングを追加 */}
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {/* ファイルがアップロードされていない場合の表示 */}
          {!plateData && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center max-w-2xl mx-auto border-t-4 border-indigo-500">
              <svg className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">96ウェルプレートデータをアップロード</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Excelファイルをアップロードして、ウェルプレートのConfluenceを視覚化</p>
              <FileUpload onDataLoaded={handleDataLoaded} />
            </div>
          )}

          {/* ファイルがアップロードされている場合の表示 */}
          {plateData && (
            <div className="max-w-5xl mx-auto">
              {/* ファイル一覧表示 */}
              {plateDataList.length > 1 && (
                <>
                  {/* 合計値表示 */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">全ファイルの合計</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(() => {
                        // 全ファイルの合計値を計算
                        let totalWells = 0;
                        let totalHitWells = 0;
                        let totalNonZeroWells = 0;

                        plateDataList.forEach(item => {
                          const itemData = item.data || [];
                          const wellsInThreshold = itemData.filter(d =>
                            d.value >= settings.minThreshold && d.value <= settings.maxThreshold
                          ).length;
                          const nonZeroWells = itemData.filter(d => d.value > 0).length;

                          totalWells += itemData.length;
                          totalHitWells += wellsInThreshold;
                          totalNonZeroWells += nonZeroWells;
                        });

                        const hitPercentage = totalNonZeroWells > 0
                          ? Math.round(totalHitWells / totalNonZeroWells * 100)
                          : 0;

                        // ヒット率に基づく背景色
                        let bgColorClass = 'bg-gray-100 dark:bg-gray-700';
                        let textColorClass = 'text-gray-700 dark:text-gray-300';

                        if (hitPercentage >= 50) {
                          bgColorClass = 'bg-green-100 dark:bg-green-900/30';
                          textColorClass = 'text-green-700 dark:text-green-300';
                        } else if (hitPercentage >= 20) {
                          bgColorClass = 'bg-amber-100 dark:bg-amber-900/30';
                          textColorClass = 'text-amber-700 dark:text-amber-300';
                        } else if (hitPercentage > 0) {
                          bgColorClass = 'bg-red-100 dark:bg-red-900/30';
                          textColorClass = 'text-red-700 dark:text-red-300';
                        }

                        return (
                          <>
                            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                              <span className="text-xs text-gray-500 dark:text-gray-400">ファイル数</span>
                              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{plateDataList.length}</span>
                            </div>

                            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                              <span className="text-xs text-gray-500 dark:text-gray-400">全ウェル数</span>
                              <span className="text-xl font-bold text-gray-700 dark:text-gray-300">{totalNonZeroWells} / {totalWells}</span>
                            </div>

                            <div className={`p-3 rounded-lg border border-gray-200 dark:border-gray-700 ${bgColorClass} flex flex-col items-center justify-center`}>
                              <span className="text-xs text-gray-500 dark:text-gray-400">全ヒットウェル</span>
                              <span className={`text-xl font-bold ${textColorClass}`}>
                                {totalHitWells} / {totalNonZeroWells} ({hitPercentage}%)
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* ファイル一覧 */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6 border border-gray-100 dark:border-gray-700 overflow-x-auto">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">ファイル一覧</h3>
                    <div className="flex space-x-2 pb-2 overflow-x-auto">
                      {plateDataList.map((item, index) => {
                        // 閾値内のウェル数を計算
                        const itemData = item.data || [];
                        const wellsInThreshold = itemData.filter(d =>
                          d.value >= settings.minThreshold && d.value <= settings.maxThreshold
                        ).length;
                        const totalNonZeroWells = itemData.filter(d => d.value > 0).length;
                        const hitPercentage = totalNonZeroWells > 0
                          ? Math.round(wellsInThreshold / totalNonZeroWells * 100)
                          : 0;

                        // ヒット率に基づく背景色
                        let bgColorClass = 'bg-gray-100 dark:bg-gray-700';
                        if (hitPercentage >= 50) {
                          bgColorClass = 'bg-green-100 dark:bg-green-900/30';
                        } else if (hitPercentage >= 20) {
                          bgColorClass = 'bg-amber-100 dark:bg-amber-900/30';
                        } else if (hitPercentage > 0) {
                          bgColorClass = 'bg-red-100 dark:bg-red-900/30';
                        }

                        return (
                          <button
                            key={index}
                            onClick={() => setCurrentFileIndex(index)}
                            className={`flex-shrink-0 px-3 py-2 rounded-md text-xs font-medium transition-colors ${index === currentFileIndex
                              ? 'ring-2 ring-indigo-500 ' + bgColorClass
                              : bgColorClass + ' hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                          >
                            <div className="flex flex-col items-start">
                              <span className="truncate max-w-[120px]">{item.name}</span>
                              <span className="text-xs mt-1 font-bold">
                                ヒット: {wellsInThreshold}/{totalNonZeroWells} ({hitPercentage}%)
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* メインコンテンツ - プレート表示 (中央配置) */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 text-center">
                  プレートビジュアライゼーション
                </h2>
                <div className="overflow-x-auto">
                  <PlateVisualization
                    plateData={plateData}
                    settings={settings}
                    ref={svgRef}
                  />
                </div>
              </div>

              {/* データ出力セクション */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 px-4 py-2">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 text-center">データ出力</h3>
                </div>
                <DataOutput
                  plateData={plateData}
                  svgRef={svgRef}
                  fileName={fileName}
                  fileIndex={currentFileIndex + 1}
                  totalFiles={plateDataList.length}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} 96ウェルプレートビジュアライザー
          </p>
        </div>
      </footer>

      {/* 非表示のFileUploadコンポーネント - ファイル処理のために必要 */}
      <div id="hidden-file-upload" className="hidden">
        <FileUpload onDataLoaded={handleDataLoaded} />
      </div>
    </div>
  );
}

export default App;

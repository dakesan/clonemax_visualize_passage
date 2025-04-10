import { useState, useRef } from 'react';
import './App.css';
import FileUpload from './components/FileUpload/FileUpload';
import ParameterSettings from './components/ParameterSettings/ParameterSettings';
import PlateVisualization from './components/PlateVisualization/PlateVisualization';
import DataOutput from './components/DataOutput/DataOutput';

function App() {
  const [plateData, setPlateData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [settings, setSettings] = useState({
    minThreshold: 0,
    maxThreshold: 100,
    colorPalette: 'blue-red',
    displayMode: 'heatmap'
  });
  
  const svgRef = useRef(null);
  
  // ファイルアップロード時のデータ処理
  const handleDataLoaded = (data, name) => {
    setPlateData(data);
    setFileName(name.replace(/\.[^/.]+$/, "")); // 拡張子を除去
  };
  
  // 設定変更時の処理
  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">96ウェルプレートビジュアライザー</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Confluence解析ツール</p>
          </div>
          {fileName && (
            <div className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800">
              <span className="text-xs text-gray-500 dark:text-gray-400">現在のファイル: </span>
              <span className="font-medium text-indigo-600 dark:text-indigo-400">{fileName}</span>
            </div>
          )}
        </div>
      </header>
      
      <main className="pb-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {/* ファイルがアップロードされていない場合の表示 */}
          {!plateData && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center max-w-2xl mx-auto border-t-4 border-indigo-500">
              <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">96ウェルプレートデータをアップロード</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Excelファイルをアップロードして、ウェルプレートのConfluenceを視覚化</p>
              <FileUpload onDataLoaded={handleDataLoaded} />
            </div>
          )}
          
          {/* ファイルがアップロードされている場合の表示 */}
          {plateData && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 左サイドバー - 設定パネル */}
              <div className="col-span-1">
                <div className="space-y-6 sticky top-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 px-4 py-2">
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">データ入力</h3>
                    </div>
                    <FileUpload onDataLoaded={handleDataLoaded} />
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 px-4 py-2">
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">表示設定</h3>
                    </div>
                    <ParameterSettings
                      plateData={plateData}
                      onSettingsChange={handleSettingsChange}
                    />
                  </div>
                </div>
              </div>
              
              {/* メインコンテンツ - プレート表示 */}
              <div className="col-span-1 lg:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
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
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">データ出力</h3>
                  </div>
                  <DataOutput
                    plateData={plateData}
                    svgRef={svgRef}
                    fileName={fileName}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* フッター */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} 96ウェルプレートビジュアライザー
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

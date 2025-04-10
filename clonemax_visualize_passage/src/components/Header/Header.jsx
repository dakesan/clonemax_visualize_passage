import React from 'react';
import '../../icon-fix.css'; // SVGアイコンのサイズを修正するためのCSS

const Header = ({ plateData, fileName, showSettings, setShowSettings, handleDataLoaded }) => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  // スクロール検出のためのイベントリスナー
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 ${isScrolled ? 'shadow-md' : ''} transition-shadow duration-300`}>
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mr-4">96ウェルプレートビジュアライザー</h1>
          {plateData && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              <svg className="icon-sm mr-1 text-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
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
              <svg className="icon-sm mr-1 text-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
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
  );
};

export default Header;

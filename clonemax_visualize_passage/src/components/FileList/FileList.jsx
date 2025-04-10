import React from 'react';

const FileList = ({ plateDataList, currentFileIndex, setCurrentFileIndex, settings, plateData, fileName }) => {
  // 現在のファイルのヒット率を計算
  const calculateHitRate = (data) => {
    const wellsInThreshold = data.filter(d => 
      d.value >= settings.minThreshold && d.value <= settings.maxThreshold
    ).length;
    const totalNonZeroWells = data.filter(d => d.value > 0).length;
    const hitPercentage = totalNonZeroWells > 0 
      ? Math.round(wellsInThreshold / totalNonZeroWells * 100) 
      : 0;
    
    return {
      wellsInThreshold,
      totalNonZeroWells,
      hitPercentage
    };
  };

  // 現在のファイルのヒット率情報
  const currentFileHitRate = calculateHitRate(plateData);

  // 全ファイルの合計値を計算
  const calculateTotals = () => {
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
    
    return {
      totalWells,
      totalHitWells,
      totalNonZeroWells,
      hitPercentage
    };
  };

  // ヒット率に基づく背景色とテキスト色を取得
  const getColorClasses = (hitPercentage) => {
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
    
    return { bgColorClass, textColorClass };
  };

  // 現在のファイルのヒット率に基づく色
  const { bgColorClass, textColorClass } = getColorClasses(currentFileHitRate.hitPercentage);

  return (
    <div className="lg:w-1/4 space-y-4">
      {/* ファイル情報 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">現在のファイル</h3>
          <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded text-indigo-600 dark:text-indigo-400">
            {currentFileIndex + 1} / {plateDataList.length}
          </span>
        </div>
        
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 truncate">{fileName}</div>
        
        {/* ヒット率サマリー */}
        <div className={`${bgColorClass} p-3 rounded-lg border border-gray-200 dark:border-gray-700`}>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">ヒットウェル</span>
            <span className={`text-sm font-bold ${textColorClass}`}>
              {currentFileHitRate.wellsInThreshold} / {currentFileHitRate.totalNonZeroWells} ({currentFileHitRate.hitPercentage}%)
            </span>
          </div>
        </div>
      </div>
      
      {/* ファイル一覧 (複数ファイルがある場合のみ表示) */}
      {plateDataList.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">ファイル一覧</h3>
          <div className="space-y-2">
            {plateDataList.map((item, index) => {
              // 閾値内のウェル数を計算
              const itemData = item.data || [];
              const { wellsInThreshold, totalNonZeroWells, hitPercentage } = calculateHitRate(itemData);
              
              // ヒット率に基づく色
              let indicatorColor = 'bg-gray-400';
              if (hitPercentage >= 50) {
                indicatorColor = 'bg-green-500';
              } else if (hitPercentage >= 20) {
                indicatorColor = 'bg-amber-500';
              } else if (hitPercentage > 0) {
                indicatorColor = 'bg-red-500';
              }
              
              return (
                <button
                  key={index}
                  onClick={() => setCurrentFileIndex(index)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${index === currentFileIndex 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full ${indicatorColor} mr-2 flex-shrink-0`}></span>
                    <div className="truncate">{item.name}</div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-4">
                    ヒット率: {hitPercentage}%
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* 合計値表示 */}
          {plateDataList.length > 1 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">全ファイル合計</h4>
              {(() => {
                // 全ファイルの合計値を計算
                const { totalWells, totalHitWells, totalNonZeroWells, hitPercentage } = calculateTotals();
                  
                // ヒット率に基づく背景色
                const { bgColorClass, textColorClass } = getColorClasses(hitPercentage);
                
                return (
                  <div className={`${bgColorClass} p-3 rounded-lg border border-gray-200 dark:border-gray-700`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">ファイル数</span>
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{plateDataList.length}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">全ウェル数</span>
                      <span className="text-sm font-medium">{totalNonZeroWells} / {totalWells}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">全ヒットウェル</span>
                      <span className={`text-sm font-bold ${textColorClass}`}>
                        {totalHitWells} / {totalNonZeroWells} ({hitPercentage}%)
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileList;

import React from 'react';
import '../../icon-fix.css'; // SVGアイコンのサイズを修正するためのCSS
import PlateVisualization from '../PlateVisualization/PlateVisualization';
import ParameterSettings from '../ParameterSettings/ParameterSettings';
import DataOutput from '../DataOutput/DataOutput';

const MainContent = ({ plateData, settings, onSettingsChange, svgRef, fileName, fileIndex, totalFiles }) => {
  return (
    <div className="lg:w-3/4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 h-full">
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

        {/* データ出力セクション */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">データ出力</h3>
          <DataOutput
            plateData={plateData}
            svgRef={svgRef}
            fileName={fileName}
            fileIndex={fileIndex}
            totalFiles={totalFiles}
          />
        </div>
      </div>
    </div>
  );
};

export default MainContent;

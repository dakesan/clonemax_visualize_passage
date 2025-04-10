import React from 'react';
import ParameterSettings from '../ParameterSettings/ParameterSettings';

const SettingsPanel = ({ showSettings, setShowSettings, plateData, onSettingsChange }) => {
  if (!showSettings || !plateData) return null;
  
  return (
    <div className="fixed top-16 right-4 z-40 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 px-4 py-2">
        <h3 className="font-medium text-gray-700 dark:text-gray-300">表示設定</h3>
        <button
          onClick={() => setShowSettings(false)}
          className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
        >
          <svg className="icon-md text-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <ParameterSettings
        plateData={plateData}
        onSettingsChange={onSettingsChange}
      />
    </div>
  );
};

export default SettingsPanel;

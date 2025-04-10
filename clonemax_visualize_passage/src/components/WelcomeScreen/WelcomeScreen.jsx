import React from 'react';
import '../../icon-fix.css'; // SVGアイコンのサイズを修正するためのCSS
import FileUpload from '../FileUpload/FileUpload';

const WelcomeScreen = ({ onDataLoaded }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center max-w-2xl mx-auto border-t-4 border-indigo-500">
      <svg className="mx-auto icon-xl text-gray mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">96ウェルプレートデータをアップロード</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Excelファイルをアップロードして、ウェルプレートのConfluenceを視覚化</p>
      <FileUpload onDataLoaded={onDataLoaded} />
    </div>
  );
};

export default WelcomeScreen;

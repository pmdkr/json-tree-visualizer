// src/components/ControlPanel.jsx
import React from 'react';

const ControlPanel = () => {
  const handleDownload = () => {
    // This would be implemented to download the tree as an image
    alert('Download functionality would be implemented here');
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
        Controls
      </h3>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          • Use mouse wheel to zoom
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          • Drag to pan around
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          • Click nodes to copy their path
        </p>
        
        <button
          onClick={handleDownload}
          className="w-full mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-200 font-medium"
        >
          Download as Image
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
// src/components/JsonInput.jsx
import React, { useState, useEffect } from 'react';

const JsonInput = ({ onSubmit, onClear, sampleJson, error }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [isSampleUsed, setIsSampleUsed] = useState(false);

  const handleSubmit = () => {
    if (!jsonInput.trim()) {
      return;
    }
    onSubmit(jsonInput);
  };

  const handleClear = () => {
    setJsonInput('');
    onClear();
  };

  const handleUseSample = () => {
    setJsonInput(sampleJson);
    setIsSampleUsed(true);
  };

  useEffect(() => {
    if (isSampleUsed) {
      onSubmit(sampleJson);
      setIsSampleUsed(false);
    }
  }, [isSampleUsed, onSubmit, sampleJson]);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="json-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Paste or type JSON data
        </label>
        <textarea
          id="json-input"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Enter your JSON here..."
          className={`w-full h-64 p-3 border rounded-md font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-md text-sm">
          <strong>JSON Error:</strong> {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSubmit}
          disabled={!jsonInput.trim()}
          className={`flex-1 px-4 py-2 rounded-md transition-colors duration-200 font-medium ${
            jsonInput.trim() 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          Generate Tree
        </button>
        
        <button
          onClick={handleUseSample}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          Use Sample
        </button>
        
        <button
          onClick={handleClear}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default JsonInput;
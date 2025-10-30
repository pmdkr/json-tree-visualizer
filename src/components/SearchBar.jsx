// src/components/SearchBar.jsx
import React from 'react';

const SearchBar = ({ onSearch, searchTerm, setSearchTerm, searchResult }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search by JSON path (e.g., user.address.city or $.user.address.city)"
          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200 font-medium"
        >
          Search
        </button>
      </form>

      {searchResult && (
        <div className={`p-2 rounded-md text-sm ${
          searchResult.found 
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
        }`}>
          {searchResult.found 
            ? `✓ Match found: ${searchResult.node.data.path}` 
            : searchResult.message || '❌ No match found'
          }
        </div>
      )}
    </div>
  );
};

export default SearchBar;
import React, { useState } from 'react';
import api from '../utils/axios';

const SearchBox = () => {
  const [query, setQuery] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      // Save search to database
      await api.post('/api/search', { query: query.trim() });
      console.log('Search saved:', query);
      // TODO: Implement actual search functionality
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 md:w-64"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBox;

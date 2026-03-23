import React, { useState, useEffect } from 'react';
import './EventFilter.css';
// Make sure this data file exists and exports 'categories'
import { categories } from '../data/allEvents';

function EventFilter({ onSearch, onClubSearch, onSelectCategory, selectedCategory, initialSearchTerm, initialClubSearch }) {

  // Local state for the search inputs
  const [localSearch, setLocalSearch] = useState(initialSearchTerm || '');
  const [localClubSearch, setLocalClubSearch] = useState(initialClubSearch || '');

  // Update parent (EventsPage) when user types
  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
    onSearch(e.target.value);
  }

  const handleClubSearchChange = (e) => {
    setLocalClubSearch(e.target.value);
    if (onClubSearch) onClubSearch(e.target.value);
  }

  // Ensure local state updates if initialSearchTerm changes (e.g., from URL)
  useEffect(() => {
    setLocalSearch(initialSearchTerm || '');
    setLocalClubSearch(initialClubSearch || '');
  }, [initialSearchTerm, initialClubSearch]);

  return (
    <div className='filter-container'>
      <div className="search-inputs">
        <input
          type="text"
          placeholder="Search events or colleges..."
          className="search-bar"
          value={localSearch}
          onChange={handleSearchChange}
        />
        <input
          type="text"
          placeholder="Search by Club name..."
          className="search-bar club-search"
          value={localClubSearch}
          onChange={handleClubSearchChange}
        />
      </div>
      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

export default EventFilter;
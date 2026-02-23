import React, { useState, useEffect } from 'react';
import './EventFilter.css';
// Make sure this data file exists and exports 'categories'
import { categories } from '../data/allEvents'; 

function EventFilter({ onSearch, onSelectCategory, selectedCategory, initialSearchTerm }) {
  
  // Local state for the search input
  const [localSearch, setLocalSearch] = useState(initialSearchTerm || '');

  // Update parent (EventsPage) when user types
  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
    onSearch(e.target.value);
  }
  
  // Ensure local state updates if initialSearchTerm changes (e.g., from URL)
  useEffect(() => {
    setLocalSearch(initialSearchTerm || '');
  }, [initialSearchTerm]);

  return (
    <div className='filter-container'>
      <input
        type="text"
        placeholder="Search for events or colleges..."
        className="search-bar"
        value={localSearch} // Use local state
        onChange={handleSearchChange} // Use new handler
      />
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
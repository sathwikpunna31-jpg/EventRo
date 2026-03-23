import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import EventCard from '../components/EventCard';
import EventFilter from '../components/EventFilter';
import Loader from '../components/Loader';
import AuthContext from '../context/AuthContext';
import './EventsPage.css';

// Read query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function EventsPage() {
  const query = useQuery();
  const { user } = useContext(AuthContext);

  // -----------------------------
  // STATE VARIABLES
  // -----------------------------
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(query.get('search') || '');
  const [clubSearchTerm, setClubSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    query.get('category') || 'All'
  );

  // -----------------------------
  // FETCH EVENTS FROM BACKEND
  // -----------------------------
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await axios.get('/api/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // -----------------------------
  // FILTER EVENTS WHEN SEARCH OR CATEGORY CHANGES
  // -----------------------------
  useEffect(() => {
    let results = [...events];

    // Category filter
    if (selectedCategory !== 'All') {
      results = results.filter(
        (event) => event.category === selectedCategory
      );
    }

    // Search filter (Title or College)
    if (searchTerm) {
      results = results.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.college?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Club Search Filter
    if (clubSearchTerm) {
      results = results.filter(
        (event) => {
          // If the backend populated the club with an object containing a 'name'
          const clubName = event.club?.name || '';
          return clubName.toLowerCase().includes(clubSearchTerm.toLowerCase());
        }
      );
    }

    setFilteredEvents(results);
  }, [searchTerm, clubSearchTerm, selectedCategory, events]);

  return (
    <div className="events-page">
      <h1 className="events-page-title">Explore All Events</h1>

      {/* Filter Component */}
      <EventFilter
        onSearch={setSearchTerm}
        onClubSearch={setClubSearchTerm}
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        initialSearchTerm={searchTerm}
        initialClubSearch={clubSearchTerm}
      />

      {/* Events List */}
      {loading ? (
        <Loader />
      ) : (
        <div className="events-grid">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))
          ) : (
            <p className="no-events-message">
              No events found. Try adjusting your filters!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default EventsPage;

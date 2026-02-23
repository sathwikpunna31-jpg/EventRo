import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from './EventCard';
import './FeaturedEvents.css';

function FeaturedEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/events');
        // Get the last 3 events to show as "featured"
        setEvents(data.slice(-3).reverse());
      } catch (error) {
        console.error('Error fetching featured events:', error);
      }
    };

    fetchFeaturedEvents();
  }, []);

  return (
    <section className='featured-events-section'>
      <div className='container'>
        <h2 className='section-title'>Featured Events</h2>
        <div className='events-grid'>
          {events.map(event => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedEvents;
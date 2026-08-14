import API_BASE_URL from '../config';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import EventCard from '../components/EventCard';
import Loader from '../components/Loader';
import '../components/FeaturedEvents.css'; // Reuse styles for the grid
import './EventsPage.css'; // Reuse styles for the header

function PopularEventsPage() {
    const [popularEvents, setPopularEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPopularEvents = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${API_BASE_URL}/api/events/popular`);
                setPopularEvents(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching popular events:', error);
                toast.error('Could not load popular events.');
                setLoading(false);
            }
        };
        fetchPopularEvents();
    }, []); // Runs once on page load

    return (
        <div className="events-page"> {/* Reuse events-page for consistent padding */}
            <h1 className="events-page-title">Popular Events</h1>
            <p style={{ textAlign: 'center', marginTop: '-1.5rem', marginBottom: '2rem', color: 'var(--text-light)' }}>
                Check out the events with the most registrations!
            </p>

            {loading ? (
                <Loader />
            ) : (
                <div className="events-grid">
                    {popularEvents.length > 0 ? (
                        popularEvents.map(event => (
                            <EventCard key={event._id} event={event} />
                        ))
                    ) : (
                        <p className="no-events-message">No popular events found right now.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default PopularEventsPage;
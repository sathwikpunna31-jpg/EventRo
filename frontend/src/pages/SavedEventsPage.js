import API_BASE_URL from '../config';
// src/pages/SavedEventsPage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import EventCard from '../components/EventCard';
import Loader from '../components/Loader';
import '../components/FeaturedEvents.css'; // Reuse grid styles

function SavedEventsPage() {
    const [savedEvents, setSavedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchSavedEvents = async () => {
            if (!user?.token) return;
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                setLoading(true);
                const { data } = await axios.get(`${API_BASE_URL}/api/users/savedevents`, config);
                setSavedEvents(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch saved events', error);
                toast.error("Failed to load saved events.");
                setLoading(false);
            }
        };
        fetchSavedEvents();
    }, [user]); // Re-fetch if user changes

    return (
        // Use a standard container (can reuse CSS)
        <div className="container" style={{ padding: '2rem 24px' }}>
            <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2.5rem' }}>
                My Saved Events
            </h1>

            {loading ? (
                <Loader />
            ) : savedEvents.length === 0 ? (
                <p style={{ textAlign: 'center' }}>You haven't saved any events yet. Click the ♡ icon on an event to save it!</p>
            ) : (
                <div className="events-grid">
                    {savedEvents.map((event) => (
                        // We might need to adjust EventCard or pass props if unsave is needed here too
                        <EventCard key={event._id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default SavedEventsPage;
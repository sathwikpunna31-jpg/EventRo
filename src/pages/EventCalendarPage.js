// src/pages/EventCalendarPage.js
import React, { useState, useEffect, useContext } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';

// Import calendar CSS
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer
const localizer = momentLocalizer(moment);

function EventCalendarPage() {
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRegistrations = async () => {
            if (!user?.token) return;
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                setLoading(true);
                const { data } = await axios.get(`https://eventro-backend.onrender.com/api/users/myregistrations`, config);
                
                // --- Format data for the calendar ---
                const formattedEvents = data.map(event => ({
                    title: event.title,
                    start: new Date(event.date), // Start date/time
                    end: new Date(event.date),   // End date/time (can be adjusted if events have duration)
                    allDay: true, // Treat as an all-day event for simplicity
                    resource: event._id, // Store the event ID
                }));

                setMyEvents(formattedEvents);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch registrations', error);
                toast.error("Failed to load your event calendar.");
                setLoading(false);
            }
        };
        fetchRegistrations();
    }, [user]);

    // Handle clicking on an event in the calendar
    const handleSelectEvent = (event) => {
        navigate(`/event/${event.resource}`); // Navigate to the event details page
    };

    return (
        <div className="calendar-page-container">
            <h1 className="section-title">My Event Calendar</h1>
            <p>Here's a visual overview of your upcoming registered events.</p>
            
            {loading ? (
                <Loader />
            ) : (
                <div className="calendar-wrapper">
                    <Calendar
                        localizer={localizer}
                        events={myEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 600 }} // Give the calendar a set height
                        onSelectEvent={handleSelectEvent} // Add click handler
                    />
                </div>
            )}
        </div>
    );
}

export default EventCalendarPage;
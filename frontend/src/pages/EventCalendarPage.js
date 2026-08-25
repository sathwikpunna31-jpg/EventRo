import API_BASE_URL from '../config';
// src/pages/EventCalendarPage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import './EventCalendarPage.css';

function EventCalendarPage() {
    const [registrations, setRegistrations] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRegistrations = async () => {
            if (!user?.token) return;
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                setLoading(true);
                const { data } = await axios.get(`${API_BASE_URL}/api/users/myregistrations`, config);
                setRegistrations(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch registrations', error);
                toast.error("Failed to load your event calendar.");
                setLoading(false);
            }
        };
        fetchRegistrations();
    }, [user]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Calendar Calculations
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDayIndex = new Date(year, month + 1, 0).getDate();
    const prevLastDayIndex = new Date(year, month, 0).getDate();

    const calendarCells = [];

    // Faded days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        calendarCells.push({
            dayNumber: prevLastDayIndex - i,
            isCurrentMonth: false,
            date: new Date(year, month - 1, prevLastDayIndex - i)
        });
    }

    // Days of current month
    for (let i = 1; i <= lastDayIndex; i++) {
        calendarCells.push({
            dayNumber: i,
            isCurrentMonth: true,
            date: new Date(year, month, i)
        });
    }

    // Faded days from next month
    const totalSlots = 42; // 6 rows * 7 days
    const nextMonthDaysNeeded = totalSlots - calendarCells.length;
    for (let i = 1; i <= nextMonthDaysNeeded; i++) {
        calendarCells.push({
            dayNumber: i,
            isCurrentMonth: false,
            date: new Date(year, month + 1, i)
        });
    }

    // Helper to find events on a date
    const getEventsForDate = (cellDate) => {
        return registrations.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === cellDate.getDate() &&
                   eventDate.getMonth() === cellDate.getMonth() &&
                   eventDate.getFullYear() === cellDate.getFullYear();
        });
    };

    const isToday = (cellDate) => {
        const today = new Date();
        return cellDate.getDate() === today.getDate() &&
               cellDate.getMonth() === today.getMonth() &&
               cellDate.getFullYear() === today.getFullYear();
    };

    return (
        <div className="calendar-page-container">
            <h1 className="section-title">My Event Calendar</h1>
            <p>Here's a visual overview of your upcoming registered events.</p>
            
            {loading ? (
                <Loader />
            ) : (
                <div className="custom-calendar-container">
                    {/* Header Controls */}
                    <div className="calendar-header-controls">
                        <button className="control-btn" onClick={handlePrevMonth}>
                            <LuChevronLeft />
                        </button>
                        <h2 className="current-month-year">
                            {monthNames[month]} {year}
                        </h2>
                        <button className="control-btn" onClick={handleNextMonth}>
                            <LuChevronRight />
                        </button>
                    </div>

                    {/* Calendar Board */}
                    <div className="calendar-board">
                        {/* Weekday headers */}
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                            <div key={day} className="weekday-header-cell">{day}</div>
                        ))}

                        {/* Date grid cells */}
                        {calendarCells.map((cell, idx) => {
                            const dateEvents = getEventsForDate(cell.date);
                            return (
                                <div 
                                    key={idx} 
                                    className={`date-grid-cell ${!cell.isCurrentMonth ? 'off-range-day' : ''} ${isToday(cell.date) ? 'today-day' : ''}`}
                                >
                                    <span className="day-number-label">{cell.dayNumber}</span>
                                    <div className="cell-events-list">
                                        {dateEvents.map(event => (
                                            <div 
                                                key={event._id} 
                                                className="calendar-event-pill"
                                                onClick={() => navigate(`/event/${event._id}`)}
                                                title={event.title}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default EventCalendarPage;
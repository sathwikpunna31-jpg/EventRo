import React from 'react';
import { FaCalendarAlt, FaStar } from 'react-icons/fa';

function HomeHero({ user }) {
    // Mock stats for now, can be replaced with real data later
    const upcomingEventsCount = 2;
    const pendingReviewsCount = 1;

    return (
        <div className="home-hero">
            <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p>Ready to explore what's happening on campus today?</p>

            <div className="hero-stats">
                <div className="stat-item">
                    <FaCalendarAlt className="stat-icon" />
                    <span>{upcomingEventsCount} Upcoming Events</span>
                </div>
                <div className="stat-item">
                    <FaStar className="stat-icon" />
                    <span>{pendingReviewsCount} Pending Review</span>
                </div>
            </div>
        </div>
    );
}

export default HomeHero;

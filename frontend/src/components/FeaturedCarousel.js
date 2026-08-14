import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarDay, FaMapMarkerAlt } from 'react-icons/fa';

function FeaturedCarousel({ events }) {
    // If no events are passed, we can show a placeholder or nothing
    if (!events || events.length === 0) return null;

    return (
        <div className="featured-section">
            <div className="section-header">
                <h2>Featured Events</h2>
                <Link to="/events" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>See All</Link>
            </div>

            <div className="carousel-container">
                {events.map((event) => (
                    <Link to={`/event/${event._id}`} key={event._id} style={{ textDecoration: 'none' }}>
                        <div className="featured-card">
                            <img
                                src={event.imageUrl || 'https://via.placeholder.com/280x160?text=Event'}
                                alt={event.title}
                                className="card-image"
                            />
                            <div className="card-content">
                                <h3 className="card-title">{event.title}</h3>
                                <div className="card-date">
                                    <FaCalendarDay />
                                    <span>{new Date(event.date).toLocaleDateString()}</span>
                                </div>
                                <div className="card-date" style={{ marginTop: '0.3rem' }}>
                                    <FaMapMarkerAlt />
                                    <span>{event.location}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default FeaturedCarousel;

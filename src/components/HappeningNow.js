import React from 'react';
import { Link } from 'react-router-dom';

function HappeningNow({ events }) {
    if (!events || events.length === 0) return null;

    return (
        <div className="happening-now-section" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 'bold' }}>Happening Now</h3>

            <div
                className="stories-container"
                style={{
                    display: 'flex',
                    gap: '1rem',
                    overflowX: 'auto',
                    paddingBottom: '1rem',
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none' // IE 10+
                }}
            >
                <style>
                    {`
            .stories-container::-webkit-scrollbar {
                display: none;
            }
            `}
                </style>

                {events.map((event) => (
                    <Link
                        to={`/event/${event._id}`}
                        key={event._id}
                        className="story-card"
                        style={{
                            minWidth: '140px',
                            width: '140px',
                            height: '200px',
                            borderRadius: '12px',
                            position: 'relative',
                            overflow: 'hidden',
                            flexShrink: 0,
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            textDecoration: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {/* Background Image */}
                        <img
                            src={event.imageUrl?.startsWith('http') ? event.imageUrl : `http://localhost:5000${event.imageUrl}`}
                            alt={event.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />

                        {/* Overlay Gradient */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', height: '60%', zIndex: 1 }}></div>

                        {/* Content */}
                        <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', color: 'white', zIndex: 2 }}>
                            <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '2px', lineHeight: '1.2' }}>{event.title}</p>
                            <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                        </div>

                        {/* "Live" or "Soon" Badge */}
                        <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#e53e3e', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                            SOON
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default HappeningNow;

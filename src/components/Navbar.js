import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import './Navbar.css`;

function Navbar() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // --- Helper function to get the correct image URL ---
    const getProfilePicUrl = () => {
        const defaultPic = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/images/default-avatar.png`;
        if (!user || !user.profilePicture) {
            return defaultPic; // Return default if no user or no picture
        }

        const picPath = user.profilePicture;

        // Check if it`s a server path (starts with /uploads/ or /images/)
        if (picPath.startsWith('/uploads/') || picPath.startsWith('/images/`)) {
            return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${picPath}`;
        }

        // Fallback for any other case
        return defaultPic;
    };

    return (
        <nav className="navbar glass-effect">
            <div className="navbar-container">
                {/* Logo Link (always visible) */}
                <Link to="/" className="navbar-logo">
                    <img src="/logo.jpg.png" alt="EVENTRO Logo" className="navbar-brand-img" />
                </Link>

                {/* Navigation Menu */}
                <ul className="nav-menu">
                    {user ? (
                        // --- 1. USER IS LOGGED IN ---
                        <>
                            <li className="nav-item">
                                <NotificationBell />
                            </li>

                            <li className="nav-item user-menu-item-static">
                                <div className="nav-links user-profile-static">
                                    <img
                                        src={getProfilePicUrl()}
                                        alt={user.name}
                                        className="navbar-profile-pic"
                                        key={user.profilePicture}
                                    />
                                    <span style={{ fontWeight: 600 }}>{user.name.split(` ')[0]}</span>
                                </div>
                            </li>
                        </>
                    ) : (
                        // --- 2. USER IS LOGGED OUT ---
                        <>
                            <li className="nav-item">
                                <Link to="/popular-events" className="nav-links">
                                    Popular Events
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/login" className="nav-links-button get-started-btn">
                                    Get Started
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import './Navbar.css';

function Navbar() {
    const { user } = useContext(AuthContext);

    // --- Helper function to get the correct image URL ---
    const getProfilePicUrl = () => {
        const defaultPic = `https://eventro-backend.onrender.com/images/default-avatar.png`;
        if (!user || !user.profilePicture) {
            return defaultPic; // Return default if no user or no picture
        }

        const picPath = user.profilePicture;

        // Check if it's a server path (starts with /uploads/ or /images/)
        if (picPath.startsWith('/uploads/') || picPath.startsWith('/images/')) {
            return `https://eventro-backend.onrender.com${picPath}`;
        }

        // Fallback for any other case
        return defaultPic;
    };

    return (
        <nav className="navbar glass-effect">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    EVENTRO
                </Link>

                {/* Navigation Menu */}
                <ul className="nav-menu">
                    {user ? (
                        // --- 1. USER IS LOGGED IN ---
                        <>
                            <li className="nav-item">
                                <Link to="/" className="nav-links"> Home </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/events" className="nav-links"> All Events </Link>
                            </li>

                            <li className="nav-item">
                                <NotificationBell />
                            </li>

                            <li className="nav-item user-menu-item">
                                <Link to={user.role === 'student' ? '/student/dashboard' : '/dashboard'} className="nav-links user-menu-button" style={{ textDecoration: 'none' }}>
                                    <img
                                        src={getProfilePicUrl()}
                                        alt={user.name}
                                        className="navbar-profile-pic"
                                        key={user.profilePicture}
                                    />
                                    {user.name.split(' ')[0]}
                                </Link>
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
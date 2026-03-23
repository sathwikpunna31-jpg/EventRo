import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import './Navbar.css';

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Effect to handle clicks outside the user dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [dropdownRef]);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/');
    };

    const toggleDropdown = () => { setDropdownOpen(!dropdownOpen); };
    const closeDropdown = () => { setDropdownOpen(false); };

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
                {/* Logo Link (always visible) */}
                <Link to="/" className="navbar-logo" onClick={closeDropdown}>
                    EVENTRO
                </Link>

                {/* Navigation Menu */}
                <ul className="nav-menu">
                    {user ? (
                        // --- 1. USER IS LOGGED IN ---
                        <>
                            <li className="nav-item">
                                <Link to="/" className="nav-links" onClick={closeDropdown}> Home </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/events" className="nav-links" onClick={closeDropdown}> All Events </Link>
                            </li>

                            <li className="nav-item">
                                <NotificationBell />
                            </li>

                            <li className="nav-item user-menu-item" ref={dropdownRef}>
                                <button onClick={toggleDropdown} className="nav-links user-menu-button">

                                    {/* --- CORRECTED IMG SRC --- */}
                                    <img
                                        src={getProfilePicUrl()}
                                        alt={user.name}
                                        className="navbar-profile-pic"
                                        // Add a key to force re-render when user.profilePicture changes
                                        key={user.profilePicture}
                                    />
                                    {user.name.split(' ')[0]} ▼
                                </button>

                                {dropdownOpen && (
                                    <ul className="user-dropdown-menu">
                                        {user.role === 'collegeAdmin' && (
                                            <li><Link to="/admin/account" onClick={closeDropdown}>My Account</Link></li>
                                        )}
                                        {user.role === 'student' && (
                                            <li><Link to="/student/dashboard" onClick={closeDropdown}>My Dashboard</Link></li>
                                        )}
                                        {user.role === 'student' && (
                                            <li><Link to="/student/account" onClick={closeDropdown}>My Account</Link></li>
                                        )}
                                        {user.role === 'collegeAdmin' && (
                                            <li><Link to="/dashboard" onClick={closeDropdown}>Admin Dashboard</Link></li>
                                        )}
                                        <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
                                    </ul>
                                )}
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
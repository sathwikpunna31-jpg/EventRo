import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import './NotificationBell.css'; // New CSS file

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useContext(AuthContext);

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.read).length;

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!user?.token) return;
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/notifications`, config);
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
            toast.error('Could not load notifications.');
        }
    };

    // Fetch notifications on component mount
    useEffect(() => {
        fetchNotifications();
        // Optional: Set up polling to fetch every 1 minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval); // Clean up interval
    }, [user]); // Refetch if user changes

    // Mark as read when dropdown is opened
    const handleToggle = async () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            // If opening and there are unread items, mark them as read
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/notifications/read`, {}, config);
                // Update frontend state immediately
                setNotifications(notifications.map(n => ({ ...n, read: true })));
            } catch (error) {
                console.error('Failed to mark notifications as read', error);
            }
        }
    };

    const formatDate = (isoDate) => {
        // Simple time ago formatter
        const seconds = Math.floor((new Date() - new Date(isoDate)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "m ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "min ago";
        return Math.floor(seconds) + "s ago";
    };

    return (
        <div className="notification-bell">
            <button onClick={handleToggle} className="bell-button">
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>
            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">Notifications</div>
                    {notifications.length === 0 ? (
                        <div className="notification-item">No new notifications.</div>
                    ) : (
                        <ul className="notification-list">
                            {notifications.map(notif => (
                                <li key={notif._id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                                    <Link to={notif.link} onClick={() => setIsOpen(false)}>
                                        <p>{notif.message}</p>
                                        <small>{formatDate(notif.createdAt)}</small>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
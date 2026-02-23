import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaTicketAlt, FaSearch, FaStar, FaPlusCircle, FaUsers, FaClipboardList, FaChartLine } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

function QuickActions() {
    const { user } = useContext(AuthContext);

    const studentActions = [
        { label: 'My Calendar', icon: <FaCalendarAlt />, path: '/student/calendar' },
        { label: 'My Registrations', icon: <FaTicketAlt />, path: '/my-registrations' },
        { label: 'Find Events', icon: <FaSearch />, path: '/events' },
        { label: 'My Reviews', icon: <FaStar />, path: '/my-reviews' },
    ];

    const adminActions = [
        { label: 'Create Event', icon: <FaPlusCircle />, path: '/create-event' },
        { label: 'Manage Events', icon: <FaClipboardList />, path: '/admin/my-events' },
        { label: 'Manage Students', icon: <FaUsers />, path: '/admin/students' },
        { label: 'Analytics', icon: <FaChartLine />, path: '/admin/analytics' },
    ];

    const actions = user?.role === 'collegeAdmin' ? adminActions : studentActions;

    return (
        <div className="quick-actions-grid">
            {actions.map((action, index) => (
                <Link key={index} to={action.path} className="action-card">
                    <div className="action-icon">{action.icon}</div>
                    <span className="action-label">{action.label}</span>
                </Link>
            ))}
        </div>
    );
}

export default QuickActions;

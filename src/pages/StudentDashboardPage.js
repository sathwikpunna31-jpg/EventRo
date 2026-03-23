import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaCalendarAlt, FaHeart, FaHistory, FaClock, FaMapMarkerAlt, FaUniversity, FaGlobe } from 'react-icons/fa';
import './DashboardPage.css'; // Reusing admin dashboard CSS
import './StudentDashboardPage.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function StudentDashboardPage() {
    const [collegeEvents, setCollegeEvents] = useState([]);
    const [publicEvents, setPublicEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ upcoming: 0, completed: 0 });
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.token) return;
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            setLoading(true);

            try {
                // 1. Fetch My Registrations (for stats)
                const { data: registrations } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/myregistrations`, config);

                // Calculate stats
                const now = new Date();
                let upcomingCount = 0;
                let completedCount = 0;
                registrations.forEach(event => {
                    if (new Date(event.date) >= now) upcomingCount++;
                    else completedCount++;
                });
                setStats({ upcoming: upcomingCount, completed: completedCount });

                // 2. Fetch College Events (Private)
                const collegeIdentifier = user?.college?.name || user?.collegeName?.name || (typeof user?.collegeName === 'string` ? user?.collegeName : null);
                let myCollegeEvents = [];
                if (collegeIdentifier) {
                    const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events?college=${encodeURIComponent(collegeIdentifier)}`, config);
                    myCollegeEvents = data;
                }

                // 3. Fetch Public Events
                const { data: publicEvts } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events?visibility=public', config);

                setCollegeEvents(myCollegeEvents);
                setPublicEvents(publicEvts);

            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
                toast.error('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const EventList = ({ title, events, icon, emptyMessage }) => (
        <div className="dashboard-section">
            <div className="section-header">
                <h3>{icon} {title}</h3>
            </div>
            {events.length > 0 ? (
                <div className="events-grid-compact">
                    {events.slice(0, 4).map(event => (
                        <Link to={`/event/${event._id}`} key={event._id} className="event-card-compact">
                            <div
                                className="card-img`
                                style={{
                                    backgroundImage: `url(${event.imageUrl ? (event.imageUrl.startsWith('http`) ? event.imageUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${event.imageUrl}`) : `https://via.placeholder.com/300x150?text=No+Image'})`
                                }}
                            ></div>
                            <div className=`card-content">
                                <h4>{event.title}</h4>
                                <p className="date"><FaCalendarAlt /> {new Date(event.date).toLocaleDateString()}</p>
                                <p className="college">{event.college?.name || event.college || 'Unknown College'}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-muted">{emptyMessage}</p>
            )}
        </div>
    );

    return (
        <div className="student-dashboard-container">
            <header className="student-header">
                <div>
                    <h1>{getGreeting()}, {user?.name.split(' ')[0]}! 👋</h1>
                    <p className="subtitle">Student at <strong>{user?.college?.name || user?.collegeName?.name || (typeof user?.collegeName === 'string' ? user?.collegeName : 'Your College')}</strong></p>
                </div>
                <div className="header-stats">
                    <div className="stat-badge">
                        <span className="count">{stats.upcoming}</span>
                        <span className="label">Upcoming</span>
                    </div>
                    <div className="stat-badge completed">
                        <span className="count">{stats.completed}</span>
                        <span className="label">Completed</span>
                    </div>
                </div>
            </header>

            {loading ? (<Loader size={40} />) : (
                <div className="dashboard-content">

                    {/* --- Quick Access --- */}
                    <div className="quick-actions">
                        <Link to="/my-registrations" className="action-card blue">
                            <FaCalendarAlt /> My Registrations
                        </Link>
                        <Link to="/saved-events" className="action-card pink">
                            <FaHeart /> Saved Events
                        </Link>
                    </div>

                    {/* --- My College Events --- */}
                    <EventList
                        title="My College Events"
                        events={collegeEvents}
                        icon={<FaUniversity />}
                        emptyMessage="No private events scheduled for your college yet."
                    />

                    {/* --- Public Events --- */}
                    <EventList
                        title="Public Events (All Colleges)"
                        events={publicEvents}
                        icon={<FaGlobe />}
                        emptyMessage="No public events available right now."
                    />

                </div>
            )}
        </div>
    );
}

export default StudentDashboardPage;
import API_BASE_URL from '../config';
//javascript
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import DashboardChart from '../components/DashboardChart';
import Loader from '../components/Loader';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { FaCalendarPlus, FaListAlt, FaUserFriends, FaQuestionCircle, FaChartLine } from 'react-icons/fa';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './DashboardPage.css';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Helper component for the feed item
function ActivityItem({ activity }) {
    const formatDate = (isoDate) => new Date(isoDate).toLocaleString();

    return (
        <li className="activity-item">
            {activity.type === 'registration' && (
                <>
                    <span className="activity-icon reg">&#10004;</span>
                    <span><strong>{activity.userName || 'Someone'}</strong> registered for <strong><Link to={`/event/${activity.eventId}`}>{activity.eventTitle}</Link></strong>.</span>
                </>
            )}
            {activity.type === 'question' && (
                <>
                    <span className="activity-icon qst">?</span>
                    <span><strong>{activity.userName}</strong> asked a question on <strong><Link to={`/event/${activity.eventId}#qna`}>{activity.eventTitle}</Link></strong>.</span>
                </>
            )}
            <span className="activity-time">{formatDate(activity.timestamp)}</span>
        </li>
    );
}

// --- Main Dashboard Component ---
function DashboardPage() {
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyEvents = async () => {
            if (!user?.token) {
                setLoading(false);
                return;
            }
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                setLoading(true);
                const { data } = await axios.get(`${API_BASE_URL}/api/events/myevents`, config);
                setMyEvents(data);
                processActivities(data);

                // Process for Calendar
                const calEvents = data.map(event => ({
                    title: event.title,
                    start: new Date(event.date),
                    end: new Date(new Date(event.date).getTime() + (2 * 60 * 60 * 1000)), // Assume 2 hour duration for visualization
                    resource: event
                }));
                setCalendarEvents(calEvents);

                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch events', error);
                toast.error("Failed to load dashboard data.");
                setLoading(false);
            }
        };
        fetchMyEvents();
    }, [user]);

    const processActivities = (eventsData) => {
        let activities = [];
        const MAX_ACTIVITIES = 10;

        eventsData.forEach(event => {
            if (event.questions && Array.isArray(event.questions)) {
                event.questions.forEach(q => {
                    activities.push({
                        id: `q-${q._id}`,
                        type: 'question',
                        userName: q.name,
                        eventTitle: event.title,
                        eventId: event._id,
                        timestamp: q.createdAt,
                    });
                });
            }
        });

        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setRecentActivities(activities.slice(0, MAX_ACTIVITIES));
    };

    const getUnansweredQuestions = () => {
        if (loading || !myEvents) return [];
        const questions = [];
        myEvents.forEach(event => {
            if (event.questions && Array.isArray(event.questions)) {
                event.questions.forEach(q => {
                    if (!q.answer) {
                        questions.push({ ...q, eventTitle: event.title, eventId: event._id });
                    }
                });
            }
        });
        questions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return questions;
    };

    // --- Calculations ---
    const totalEvents = myEvents.length;
    const totalRegistrations = myEvents.reduce((sum, event) => sum + (event.registrationsCount || 0), 0);
    const unansweredQuestions = getUnansweredQuestions();

    // Top Events Logic
    const topEvents = [...myEvents]
        .sort((a, b) => (b.registrationsCount || 0) - (a.registrationsCount || 0))
        .slice(0, 3);

    return (
        <div className="dashboard-page-container">
            <header className="dashboard-header">
                <div>
                    <h1>Welcome back, {user?.name || 'Admin'}! 👋</h1>
                    <p>Here's what's happening with your events today.</p>
                </div>
                <div className="header-actions">
                    <Link to="/create-event" className="btn-primary-action">
                        <FaCalendarPlus /> Create Event
                    </Link>
                </div>
            </header>

            {loading ? (<Loader size={40} />) : (
                <>
                    {/* --- Summary Cards --- */}
                    <div className="summary-cards">
                        <div className="card summary-card">
                            <div className="card-icon blue"><FaListAlt /></div>
                            <div className="card-info">
                                <h3>Total Events</h3>
                                <p className="stat">{totalEvents}</p>
                            </div>
                        </div>
                        <div className="card summary-card">
                            <div className="card-icon purple"><FaUserFriends /></div>
                            <div className="card-info">
                                <h3>Registrations</h3>
                                <p className="stat">{totalRegistrations}</p>
                            </div>
                        </div>
                        <div className="card summary-card">
                            <div className="card-icon amber"><FaQuestionCircle /></div>
                            <div className="card-info">
                                <h3>Pending Q&A</h3>
                                <p className="stat">{unansweredQuestions.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        {/* --- Left Column (Main Content) --- */}
                        <div className="main-content-column">

                            {/* --- Registration Trend Chart --- */}
                            <div className="dashboard-section chart-section">
                                <div className="section-header">
                                    <h2><FaChartLine /> Registration Trends</h2>
                                </div>
                                <div className="chart-container">
                                    {myEvents.length > 0 ? (
                                        <DashboardChart events={myEvents} />
                                    ) : (
                                        <p className="no-data">No event data available.</p>
                                    )}
                                </div>
                            </div>

                            {/* --- Calendar Widget --- */}
                            <div className="dashboard-section calendar-section">
                                <div className="section-header">
                                    <h2>Upcoming Schedule</h2>
                                </div>
                                <div style={{ height: 400 }}>
                                    <Calendar
                                        localizer={localizer}
                                        events={calendarEvents}
                                        startAccessor="start"
                                        endAccessor="end"
                                        style={{ height: '100%' }}
                                        views={['month', 'agenda']}
                                        onSelectEvent={event => navigate(`/event/${event.resource._id}`)}
                                    />
                                </div>
                            </div>

                            {/* --- Top Events Table --- */}
                            <div className="dashboard-section top-events-section">
                                <div className="section-header">
                                    <h2>Top Performing Events</h2>
                                </div>
                                <div className="table-responsive">
                                    <table className="top-events-table">
                                        <thead>
                                            <tr>
                                                <th>Event Name</th>
                                                <th>Date</th>
                                                <th>Registrations</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topEvents.length > 0 ? topEvents.map(event => (
                                                <tr key={event._id}>
                                                    <td>{event.title}</td>
                                                    <td>{new Date(event.date).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className="badge badge-success">
                                                            {event.registrationsCount || 0}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <Link to={`/admin/event/${event._id}/registrations`} className="btn-sm">View</Link>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="4" className="text-center">No events found</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* --- Right Column (Sidebar) --- */}
                        <div className="sidebar-column">

                            {/* --- Quick Actions Grid --- */}
                            <div className="dashboard-card quick-actions-card">
                                <h2>Quick Actions</h2>
                                <div className="quick-actions-grid">
                                    <Link to="/create-event" className="action-item">
                                        <div className="icon"><FaCalendarPlus /></div>
                                        <span>New Event</span>
                                    </Link>
                                    <Link to="/admin/my-events" className="action-item">
                                        <div className="icon"><FaListAlt /></div>
                                        <span>Manage Events</span>
                                    </Link>
                                    {/* Add more actions if needed */}
                                </div>
                            </div>

                            {/* --- Unanswered Questions --- */}
                            <div className="dashboard-card unanswered-card">
                                <h2>Pending Questions ({unansweredQuestions.length})</h2>
                                {
                                    unansweredQuestions.length === 0 ? (
                                        <div className="empty-state">
                                            <p>All caught up! 🎉</p>
                                        </div>
                                    ) : (
                                        <ul className="unanswered-list">
                                            {unansweredQuestions.slice(0, 5).map(q => (
                                                <li key={q._id}>
                                                    <p className="question-text">"{q.question}"</p>
                                                    <div className="question-meta">
                                                        <span>{q.eventTitle}</span>
                                                        <button onClick={() => navigate(`/event/${q.eventId}`)}>Reply</button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )
                                }
                            </div>

                            {/* --- Recent Activity --- */}
                            <div className="dashboard-card activity-card">
                                <h2>Recent Activity</h2>
                                {
                                    recentActivities.length === 0 ? (
                                        <p className="empty-state">No recent activity.</p>
                                    ) : (
                                        <ul className="activity-list">
                                            {recentActivities.map(act => <ActivityItem key={act.id} activity={act} />)}
                                        </ul>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default DashboardPage;

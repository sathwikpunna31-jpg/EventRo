import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import QuickPost from '../components/QuickPost';
import { FaCalendarPlus, FaBullhorn, FaUsers, FaListAlt, FaQuestionCircle, FaClipboardCheck } from 'react-icons/fa';
import './DashboardPage.css'; // Reuse core styles
import './ManageAnnouncementsPage.css'; // For announcement feed styles

function CoordinatorDashboardPage() {
    const [stats, setStats] = useState({ totalEvents: 0, upcomingEvents: 0, members: 0 });
    const [recentAnnouncements, setRecentAnnouncements] = useState([]);
    const [clubInfo, setClubInfo] = useState(null);
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async (isInitial = false) => {
        if (!user?.token) return;
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        if (isInitial) setLoading(true);

        try {
            // 1. Fetch their Club Details
            const { data: clubs } = await axios.get(`${process.env.REACT_APP_API_URL || `\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}`}/api/clubs`, config);
            const myClub = clubs.find(c => {
                if (!c.coordinators) return false;
                return c.coordinators.some(coord => coord === user._id || coord._id === user._id);
            });
            setClubInfo(myClub || null);

            if (myClub) {
                // 2. Fetch Events for this specific Club
                const { data: events } = await axios.get(`${process.env.REACT_APP_API_URL || `\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}`}/api/events/myevents`, config);
                
                setMyEvents(events);
                const now = new Date();
                const upcoming = events.filter(e => new Date(e.date) >= now).length;

                setStats({
                    totalEvents: events.length,
                    upcomingEvents: upcoming,
                    members: 0
                });

                // 3. Fetch Recent Announcements made by this Club
                const { data: announcements } = await axios.get(`${process.env.REACT_APP_API_URL || `\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}`}/api/announcements`, config);
                const myAnnouncements = announcements
                    .filter(a => a.author._id === user._id)
                    .slice(0, 5); 
                setRecentAnnouncements(myAnnouncements);
            }
        } catch (error) {
            console.error("Error fetching coordinator dash data:", error);
            toast.error("Failed to load dashboard.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchDashboardData(true);
    }, [fetchDashboardData]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getUnansweredQuestions = () => {
        if (!myEvents) return [];
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

    const unansweredQuestions = getUnansweredQuestions();
    
    // Top Events Logic (Upcoming)
    const upcomingEventsList = [...myEvents]
        .filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    if (loading) return <Loader size={40} />;

    return (
        <div className="dashboard-page-container">
            {/* Header Section */}
            <header className="dashboard-header">
                <div>
                    <h1>{getGreeting()}, <span style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{user?.name.split(' ')[0]}</span> 👋</h1>
                    <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)' }}>Coordinator Command Center • <strong style={{ color: 'var(--primary-color)' }}>{clubInfo ? clubInfo.name : 'Your Club'}</strong></p>
                </div>
                <div className="header-actions">
                    <Link to="/create-event" className="btn-primary-action">
                        <FaCalendarPlus /> Host Club Event
                    </Link>
                </div>
            </header>

            {!clubInfo ? (
                <div className="dashboard-section" style={{ padding: '2.5rem', textAlign: 'center', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid #fde68a', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.1)' }}>
                    <h3 style={{ color: '#d97706', marginBottom: '0.8rem', fontSize: '1.5rem', fontWeight: '800' }}>Club Assignment Missing</h3>
                    <p style={{ color: '#92400e', fontSize: '1.1rem' }}>You are logged in as a Coordinator, but we could not trace your primary Club. Please contact your College Admin.</p>
                </div>
            ) : (
                <>
                    {/* --- Stats Row --- */}
                    <div className="summary-cards">
                        <div className="card summary-card">
                            <div className="card-icon blue"><FaCalendarPlus /></div>
                            <div className="card-info">
                                <h3>Total Events Hosted</h3>
                                <p className="stat">{stats.totalEvents}</p>
                            </div>
                        </div>
                        <div className="card summary-card">
                            <div className="card-icon purple"><FaBullhorn /></div>
                            <div className="card-info">
                                <h3>Upcoming Events</h3>
                                <p className="stat">{stats.upcomingEvents}</p>
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
                        {/* --- LEFT COLUMN --- */}
                        <div className="main-content-column">
                            
                            {/* --- Quick Actions Grid (Main Column) --- */}
                            <div className="dashboard-section">
                                <div className="quick-actions-grid" style={{ marginBottom: '1.5rem' }}>
                                    <Link to="/create-event" className="action-item" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)', border: '1px solid #c7d2fe' }}>
                                        <div className="icon" style={{ color: '#4f46e5' }}><FaCalendarPlus /></div>
                                        <span style={{ fontWeight: 600, color: '#4f46e5' }}>Create Event</span>
                                        <div style={{ fontSize: '0.8rem', color: '#6366f1', marginTop: '0.2rem' }}>Host a new club activity</div>
                                    </Link>
                                    <Link to="/admin/my-events" className="action-item" style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #fff1f2 100%)', border: '1px solid #fbcfe8' }}>
                                        <div className="icon" style={{ color: '#e11d48' }}><FaClipboardCheck /></div>
                                        <span style={{ fontWeight: 600, color: '#e11d48' }}>Mark Attendance</span>
                                        <div style={{ fontSize: '0.8rem', color: '#f43f5e', marginTop: '0.2rem' }}>Manage registrations & check-in</div>
                                    </Link>
                                </div>
                            </div>

                            {/* --- Upcoming Events Table --- */}
                            <div className="dashboard-section top-events-section">
                                <div className="section-header">
                                    <h2><FaListAlt /> Upcoming Club Events</h2>
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
                                            {upcomingEventsList.length > 0 ? upcomingEventsList.map(event => (
                                                <tr key={event._id}>
                                                    <td>{event.title}</td>
                                                    <td>{new Date(event.date).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className="badge badge-success">
                                                            {event.registrationsCount || 0}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <Link to={`/admin/event/${event._id}/registrations`} className="btn-sm" style={{ background: '#f59e0b', borderColor: '#f59e0b' }}>
                                                            Manage
                                                        </Link>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="4" className="text-center">No upcoming events found. Host one today!</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* --- Recent Club Announcements --- */}
                            <div className="dashboard-section">
                                <div className="section-header">
                                    <h2><FaBullhorn /> Recent Club Announcements</h2>
                                </div>

                                {recentAnnouncements.length === 0 ? (
                                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '3rem', color: '#e5e7eb', marginBottom: '1rem' }}><FaBullhorn /></div>
                                        <p style={{ color: '#6b7280', marginBottom: '0.8rem', fontSize: '1.1rem', fontWeight: '600' }}>Your club hasn't posted any announcements recently.</p>
                                        <p style={{ fontSize: '0.95rem', color: '#9ca3af' }}>Use the Quick Post widget to broadcast messages to students.</p>
                                    </div>
                                ) : (
                                    <div className="unanswered-list" style={{ padding: '0 1.5rem 1.5rem' }}>
                                        {recentAnnouncements.map(announcement => (
                                            <div key={announcement._id} style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'white', borderRadius: '12px', marginBottom: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'transform 0.2s ease', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 0.8rem 0' }}>
                                                    <h4 style={{ margin: 0, color: '#111827', fontSize: '1.1rem', fontWeight: '700' }}>{announcement.title}</h4>
                                                    <span style={{ fontSize: '0.85rem', color: '#6b7280', background: '#f3f4f6', padding: '0.3rem 0.6rem', borderRadius: '9999px', fontWeight: '500' }}>
                                                        {new Date(announcement.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p style={{ margin: 0, color: '#4b5563', fontSize: '1rem', lineHeight: '1.6' }}>{announcement.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* --- RIGHT COLUMN --- */}
                        <div className="sidebar-column">
                             
                             {/* --- Quick Post Widget --- */}
                             <QuickPost onPostCreated={fetchDashboardData} />

                             {/* --- Unanswered Questions --- */}
                             <div className="dashboard-card unanswered-card" style={{ marginTop: '1.5rem' }}>
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

                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default CoordinatorDashboardPage;

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import HomeHero from './HomeHero';
import QuickPost from './QuickPost';
import HappeningNow from './HappeningNow';
import NewsFeed from './NewsFeed';
import Loader from './Loader';
import { FaHome, FaCalendarAlt, FaBookmark, FaThumbsUp } from 'react-icons/fa';
import '../styles/HomeDashboard.css';

function LoggedInHomePage() {
  const [posts, setPosts] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [happeningEvents, setHappeningEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [postsRes, eventsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/posts`),
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events`)
      ]);

      setPosts(postsRes.data);

      const allEvents = eventsRes.data.events || eventsRes.data;

      // Filter for Happening Now (next 48 hours)
      const now = new Date();
      const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      const happening = Array.isArray(allEvents)
        ? allEvents.filter(e => {
          const eDate = new Date(e.date);
          return eDate >= now && eDate <= in48Hours;
        })
        : [];
      setHappeningEvents(happening);

      const sortedEvents = Array.isArray(allEvents)
        ? allEvents
          .filter(e => new Date(e.date) >= now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5)
        : [];

      setFeaturedEvents(sortedEvents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Delete handler for posts
  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?`)) {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/posts/${postId}`, config);
        setPosts(posts.filter((p) => p._id !== postId));
        toast.success(`Post deleted.');
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post.');
      }
    }
  };

  const handlePostCreated = () => {
    fetchData(); // Refresh posts and events
  };

  if (loading) return <Loader />;

  return (
    <div className={`dashboard-container no-left-sidebar ${user?.role !== 'student' ? 'no-right-sidebar' : ''}`}>
      {/* 2. Center Main Area (Feed) */}
      <div className="dashboard-main" style={{ width: '100%' }}>
        {/* Welcome Hero inside Main Feed */}
        <HomeHero user={user} />

        {/* Admin Quick Post */}
        <QuickPost onPostCreated={handlePostCreated} />

        {/* The Posts Array */}
        <NewsFeed posts={posts} onDelete={handleDeletePost} />
      </div>

      {/* 3. Right Sidebar (Trending/Featured) - Only for Students */}
      {user?.role === 'student' && (
        <div className="home-sidebar-right">
          <div className="trending-card">
            <h3>Upcoming Near You</h3>
            <div className="trending-list">
              {featuredEvents.length > 0 ? (
                featuredEvents.map(event => (
                  <Link to={`/event/${event._id}`} key={event._id} className="trending-item`>
                    <img
                      src={event.imageUrl?.startsWith('http`) ? event.imageUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${event.imageUrl}`}
                      alt={event.title}
                      className=`trending-img"
                      onError={(e) => { e.target.src = `https://via.placeholder.com/60'; }}
                    />
                    <div className="trending-info">
                      <p className="trending-title">{event.title}</p>
                      <p className="trending-meta">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No upcoming events.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoggedInHomePage;

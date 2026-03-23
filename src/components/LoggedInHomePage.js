import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import HomeHero from './HomeHero';
import QuickPost from './QuickPost';
import HappeningNow from './HappeningNow';
import NewsFeed from './NewsFeed';
import Loader from './Loader';
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
        axios.get(`https://eventro-backend.onrender.com/api/posts`),
        axios.get(`https://eventro-backend.onrender.com/api/events`)
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
    if (window.confirm('Are you sure you want to delete this post?')) {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        await axios.delete(`https://eventro-backend.onrender.com/api/posts/${postId}`, config);
        setPosts(posts.filter((p) => p._id !== postId));
        toast.success('Post deleted.');
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
    <div className="dashboard-container">
      {/* Hero Section */}
      <HomeHero user={user} />

      {/* Main Content Area (Feed) - Centered */}
      <div className="dashboard-main" style={{ gridColumn: '1 / -1', maxWidth: '700px', margin: '0 auto', width: '100%' }}>

        {/* Stories / Happening Now */}
        <HappeningNow events={happeningEvents.length > 0 ? happeningEvents : featuredEvents.slice(0, 5)} />

        {/* Admin Quick Post */}
        <QuickPost onPostCreated={handlePostCreated} />

        <NewsFeed posts={posts} onDelete={handleDeletePost} />
      </div>

      {/* Sidebar Area (Widgets) - REMOVED as per request */}
      {/* 
      <div className="dashboard-sidebar">
        <QuickActions />
        <FeaturedCarousel events={featuredEvents} />
      </div> 
      */}
    </div>
  );
}

export default LoggedInHomePage;

import React, { useState, useEffect, useContext } from 'react'; // <-- Add useContext
import axios from 'axios';
import FeedItem from '../components/FeedItem'; // Use the new component
import AuthContext from '../context/AuthContext'; // <-- Add AuthContext
import '../components/FeaturedEvents.css';
function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('http://localhost:5000/api/posts');
        setPosts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        await axios.delete(`http://localhost:5000/api/posts/${postId}`, config);
        setPosts(posts.filter((p) => p._id !== postId)); // Update UI
        alert('Post deleted.');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post.');
      }
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 24px', maxWidth: '800px' }}>
      <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2.5rem' }}>
        Event Feed
      </h1>

      {loading ? (
        <p>Loading feed...</p>
      ) : posts.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No posts yet. College admins can promote events from their dashboard.</p>
      ) : (
        <div className="feed-list">
          {posts.map((post) => (
            <FeedItem key={post._id} post={post} onDelete={handleDeletePost} />
          ))}
        </div>
      )}
    </div>
  );
}

export default FeedPage;
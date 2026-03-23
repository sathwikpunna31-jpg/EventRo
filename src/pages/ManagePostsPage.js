import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
// Reuse PostCard CSS for basic styling or create specific styles
import '../components/PostCard.css';
// Add specific styles if needed
// import './ManagePostsPage.css';

function ManagePostsPage() {
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // Fetch admin's posts
  useEffect(() => {
    const fetchMyPosts = async () => {
      if (!user?.token) return;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        setLoading(true);
        const { data } = await axios.get(`\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/posts/myposts`, config);
        setMyPosts(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch posts', error);
        toast.error("Failed to load your posts.");
        setLoading(false);
      }
    };
    fetchMyPosts();
  }, [user]);

  // Handle delete
  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        await axios.delete(`\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/posts/${postId}`, config);
        setMyPosts(myPosts.filter((p) => p._id !== postId)); // Update UI
        toast.success('Post deleted.');
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post.');
      }
    }
  };

  return (
    // Use a container div (can reuse dashboard-container style or create new)
    <div className="admin-page-container">
      <h1>Manage Promotional Posts</h1>
      <p>A list of all promotional posts you have created.</p>

      {loading ? (
        <Loader />
      ) : myPosts.length === 0 ? (
        <p>You have not created any promotional posts yet. You can create one from the "My Events" page.</p>
      ) : (
        <div className="posts-management-list">
          {myPosts.map((post) => (
            <div key={post._id} className="post-card manage-post-item"> {/* Reuse post-card style */}
              {post.imageUrl && (
                 <img src={post.imageUrl.startsWith('http') ? post.imageUrl : `\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${post.imageUrl}`} alt="Post" className="post-image" style={{ maxHeight: '150px' }}/>
              )}
              <div className="post-content">
                <p className="post-text" style={{ maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.text}</p>
                {post.event && (
                  <div className="post-event-link">
                    For Event: <Link to={`/event/${post.event._id}`}>{post.event.title}</Link>
                  </div>
                )}
                <small className="post-date">Posted on {new Date(post.createdAt).toLocaleDateString()}</small>
                {/* Delete Button */}
                <button
                  onClick={() => handleDeletePost(post._id)}
                  className="btn-delete-post"
                  style={{ float: 'right', marginTop: '-0.5rem' }} // Adjust position slightly
                >
                  Delete Post
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManagePostsPage;
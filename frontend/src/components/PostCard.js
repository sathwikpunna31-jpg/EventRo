import React, { useContext } from 'react'; // <-- Import useContext
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext'; // <-- Import AuthContext
import './PostCard.css';

// --- Accept onDelete as a prop ---
function PostCard({ post, onDelete }) {
  const { user } = useContext(AuthContext); // <-- Get logged-in user

  // Check if the current user is the author of the post
  // Ensure post.user is compared correctly (it might be an object ID or just the ID string)
  const isAuthor = user && post.user && (user._id === post.user._id || user._id === post.user);

  // Format the date nicely
  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // --- This is the single correct return statement ---
  return (
    <div className="post-card">
      {post.imageUrl && (
        <img src={post.imageUrl} alt="Post" className="post-image" />
      )}
      <div className="post-content">
        <p className="post-text">{post.text}</p>
        {post.event && ( // Check if event data was populated
          <div className="post-event-link">
            Promoting: <Link to={`/event/${post.event._id}`}>{post.event.title}</Link>
          </div>
        )}
        <small className="post-date">Posted on {formatDate(post.createdAt)}</small>

        {/* --- Conditionally show Delete Button --- */}
        {isAuthor && (
          <button onClick={() => onDelete(post._id)} className="btn-delete-post">
            Delete Post
          </button>
        )}
      </div>
    </div>
  );
}

export default PostCard;
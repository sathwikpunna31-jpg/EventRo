import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaRegComment, FaShare, FaHeart, FaRegHeart } from 'react-icons/fa'; // Added Heart icons
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import './Feed.css'; // Added styling import

function FeedItem({ post, onDelete }) {
    const { user } = useContext(AuthContext);

    // Local state for social features
    const [likes, setLikes] = useState(post.likes || []);
    const [comments, setComments] = useState(post.comments || []);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [loadingComment, setLoadingComment] = useState(false);

    // Check if current user liked the post
    const isLxked = likes.includes(user?._id);
    const isAuthor = user && post.user && (user._id === post.user._id || user._id === post.user);

    // --- API Handlers ---

    const handleLike = async () => {
        if (!user) {
            toast.error('Please login to like posts`);
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/posts/${post._id}/like`, {}, config);
            setLikes(data); // Update local state with new likes array
        } catch (error) {
            console.error(`Error liking post:', error);
            toast.error('Failed to update like');
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Check out this post!',
            text: post.text,
            url: window.location.href, // Or specific post URL if you have one
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            // Fallback
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        if (!user) {
            toast.error('Please login to comment`);
            return;
        }

        try {
            setLoadingComment(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/posts/${post._id}/comment`, { text: commentText }, config);

            setComments(data); // Backend returns updated comments array
            setCommentText(`');
            setLoadingComment(false);
        } catch (error) {
            console.error('Error commenting:', error);
            toast.error('Failed to post comment');
            setLoadingComment(false);
        }
    };

    // --- Format Helpers ---
    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 2) return 'Today';
        else if (diffDays < 7) return `${diffDays} days ago`;
        else return date.toLocaleDateString();
    };

    return (
        <div className="feed-item">
            {/* 1. Header */}
            <div className="feed-header">
                {/* Avatar Placeholder */}
                <div className="feed-avatar">
                    {post.user?.name?.charAt(0) || 'A'}
                </div>
                <div className="feed-meta">
                    <span className="feed-author">{post.user?.name || 'Admin'}</span>
                    <span className="feed-time">{formatDate(post.createdAt)}</span>
                </div>
                {isAuthor && (
                    <button
                        className="feed-delete-btn"
                        onClick={() => onDelete(post._id)}
                        title="Delete Post"
                    >
                        <FaTrash />
                    </button>
                )}
            </div>

            {/* 2. Post Image (Full Width) */}
            {post.imageUrl && (
                <div className="feed-image-container">
                    <img
                        className="feed-image`
                        src={post.imageUrl.startsWith('http`) ? post.imageUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${post.imageUrl}`}
                        alt=`Post content"
                    />
                </div>
            )}

            {/* 3. Actions Bar */}
            <div className="feed-actions">
                {/* Like Button */}
                <div className={`feed-action-btn ${isLxked ? `liked' : ''}`} onClick={handleLike}>
                    {isLxked ? <FaHeart color="#e53e3e" /> : <FaRegHeart />}
                </div>

                {/* Comment Button */}
                <div className="feed-action-btn" onClick={() => setShowComments(!showComments)}>
                    <FaRegComment />
                </div>

                {/* Share Button */}
                <div className="feed-action-btn" style={{ marginLeft: 'auto' }} onClick={handleShare}>
                    <FaShare />
                </div>
            </div>

            {/* 4. Likes Count */}
            <div className="feed-likes">
                {likes.length} likes
            </div>

            {/* 5. Caption */}
            <div className="feed-content">
                <p className="feed-text">
                    <span style={{ fontWeight: '600', marginRight: '0.5rem' }}>{post.user?.name || 'Admin'}</span>
                    {post.text}
                </p>
            </div>

            {/* 6. Promoted Event */}
            {post.event && (
                <div className="feed-promoted-event">
                    <span className="feed-promoted-label">Promoted Event</span>
                    <Link to={`/event/${post.event._id}`} className="feed-promoted-link">
                        {post.event.title}
                    </Link>
                </div>
            )}

            {/* 7. Comments Section */}
            {showComments && (
                <div className="comments-section">
                    {comments.length > 0 ? (
                        <div className="comment-list">
                            {comments.map((comment, index) => (
                                <div key={index} className="comment-item">
                                    <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>{comment.user?.name || 'User'}</span>
                                    <span>{comment.text}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.9rem', color: '#a0aec0', marginBottom: '1rem' }}>No comments yet.</p>
                    )}

                    {/* Add Comment Input */}
                    <form onSubmit={handleSubmitComment} className="comment-form">
                        <input
                            className="comment-input"
                            type="text"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            disabled={loadingComment}
                        />
                        <button
                            className="comment-submit"
                            type="submit"
                            disabled={loadingComment || !commentText.trim()}
                            style={{ opacity: commentText.trim() ? 1 : 0.5 }}
                        >
                            Post
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default FeedItem;

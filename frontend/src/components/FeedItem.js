import API_BASE_URL from '../config';
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaRegComment, FaShare, FaHeart, FaRegHeart } from 'react-icons/fa'; // Added Heart icons
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';

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
            toast.error('Please login to like posts');
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`${API_BASE_URL}/api/posts/${post._id}/like`, {}, config);
            setLikes(data); // Update local state with new likes array
        } catch (error) {
            console.error('Error liking post:', error);
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
            toast.error('Please login to comment');
            return;
        }

        try {
            setLoadingComment(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${API_BASE_URL}/api/posts/${post._id}/comment`, { text: commentText }, config);

            setComments(data); // Backend returns updated comments array
            setCommentText('');
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
        <div className="feed-item" style={{ padding: '0', overflow: 'hidden', marginBottom: '2rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white' }}>
            {/* 1. Header */}
            <div className="feed-header" style={{ padding: '1rem', display: 'flex', alignItems: 'center' }}>
                {/* Avatar Placeholder */}
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#cbd5e0', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4a5568' }}>
                    {post.user?.name?.charAt(0) || 'A'}
                </div>
                <div className="feed-meta">
                    <span className="feed-author" style={{ fontSize: '1rem', fontWeight: '600', display: 'block' }}>{post.user?.name || 'Admin'}</span>
                    <span className="feed-time" style={{ fontSize: '0.8rem', color: '#718096' }}>{formatDate(post.createdAt)}</span>
                </div>
                {isAuthor && (
                    <button
                        onClick={() => onDelete(post._id)}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#cbd5e0', cursor: 'pointer', fontSize: '1rem' }}
                        title="Delete Post"
                    >
                        <FaTrash />
                    </button>
                )}
            </div>

            {/* 2. Post Image (Full Width) */}
            {post.imageUrl && (
                <div className="feed-image-container" style={{ width: '100%', backgroundColor: '#f0f2f5' }}>
                    <img
                        src={post.imageUrl.startsWith('http') ? post.imageUrl : `${API_BASE_URL}${post.imageUrl}`}
                        alt="Post content"
                        style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '600px', objectFit: 'contain' }}
                    />
                </div>
            )}

            {/* 3. Actions Bar */}
            <div className="feed-actions" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '1rem', fontSize: '1.5rem' }}>
                {/* Like Button */}
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleLike}>
                    {isLxked ? <FaHeart color="#e53e3e" /> : <FaRegHeart color="#2d3748" />}
                </div>

                {/* Comment Button */}
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowComments(!showComments)}>
                    <FaRegComment color="#2d3748" />
                </div>

                {/* Share Button */}
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginLeft: 'auto' }} onClick={handleShare}>
                    <FaShare color="#2d3748" />
                </div>
            </div>

            {/* 4. Likes Count */}
            <div style={{ padding: '0 1rem', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                {likes.length} likes
            </div>

            {/* 5. Caption */}
            <div className="feed-content" style={{ padding: '0 1rem 1rem' }}>
                <p className="feed-text" style={{ fontSize: '1rem', lineHeight: '1.5', margin: '0' }}>
                    <span style={{ fontWeight: '600', marginRight: '0.5rem' }}>{post.user?.name || 'Admin'}</span>
                    {post.text}
                </p>
            </div>

            {/* 6. Promoted Event */}
            {post.event && (
                <div style={{ margin: '0 1rem 1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #edf2f7' }}>
                    <span style={{ fontSize: '0.75rem', color: '#718096', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Promoting Event</span>
                    <Link to={`/event/${post.event._id}`} className="feed-link" style={{ fontSize: '1rem', fontWeight: '600', color: '#3182ce', textDecoration: 'none', display: 'block' }}>
                        {post.event.title}
                    </Link>
                </div>
            )}

            {/* 7. Comments Section */}
            {showComments && (
                <div className="comments-section" style={{ padding: '0 1rem 1rem', borderTop: '1px solid #f7fafc', paddingTop: '1rem' }}>
                    {comments.length > 0 ? (
                        <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
                            {comments.map((comment, index) => (
                                <div key={index} style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>{comment.user?.name || 'User'}</span>
                                    <span>{comment.text}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.9rem', color: '#a0aec0', marginBottom: '1rem' }}>No comments yet.</p>
                    )}

                    {/* Add Comment Input */}
                    <form onSubmit={handleSubmitComment} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            disabled={loadingComment}
                            style={{ flex: 1, padding: '0.5rem', borderRadius: '20px', border: '1px solid #cbd5e0', outline: 'none' }}
                        />
                        <button
                            type="submit"
                            disabled={loadingComment || !commentText.trim()}
                            style={{ color: '#3182ce', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer', opacity: commentText.trim() ? 1 : 0.5 }}
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

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import FeedItem from './FeedItem'; // Import the new component

function NewsFeed({ posts, onDelete }) {
    const { user } = useContext(AuthContext);

    if (!posts || posts.length === 0) {
        return (
            <div className="news-feed-section">
                <h3 style={{ marginBottom: '1rem' }}>Latest Updates</h3>
                <p style={{ color: '#718096', fontSize: '1rem', textAlign: 'center', padding: '2rem' }}>No new updates to show. Admins can post updates here!</p>
            </div>
        );
    }

    return (
        <div className="news-feed-section">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Latest Updates</h3>

            <div className="feed-list">
                {posts.map((post) => (
                    <FeedItem key={post._id} post={post} onDelete={onDelete} />
                ))}
            </div>
        </div>
    );
}

export default NewsFeed;

import API_BASE_URL from '../config';
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import './CreateEventPage.css'; // Reuse form styles

function SuperAdminAnnouncementsPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast.error("Please enter a title and content.");
            return;
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`
            }
        };

        try {
            setLoading(true);
            await axios.post(`${API_BASE_URL}/api/superadmin/announcement`, { title, content }, config);
            toast.success("Platform announcement broadcasted successfully!");
            setTitle('');
            setContent('');
            setLoading(false);
        } catch (error) {
            console.error('Broadcast error:', error);
            toast.error(error.response?.data?.message || 'Failed to broadcast announcement.');
            setLoading(false);
        }
    };

    return (
        <div className="create-event-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
            <div className="form-wrapper" style={{ padding: '2rem', borderRadius: '12px', background: 'var(--glass-bg)', border: 'var(--glass-border)', boxShadow: 'var(--shadow-glow)' }}>
                <h2>Broadcast System Alert 📢</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                    Send a system-wide announcement to all colleges, clubs, and student feeds.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Alert Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Scheduled System Maintenance"
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.1)', color: 'var(--text-color)' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Announcement Body</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Type details of your announcement here..."
                            rows="6"
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.1)', color: 'var(--text-color)', fontFamily: 'inherit' }}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="submit-btn"
                        style={{ width: '100%', background: 'var(--gradient-primary)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        {loading ? 'Broadcasting...' : 'Broadcast Announcement'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SuperAdminAnnouncementsPage;

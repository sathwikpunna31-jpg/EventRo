import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import './ManageAnnouncementsPage.css'; // New CSS file

function ManageAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const { user } = useContext(AuthContext);

    // Fetch existing announcements
    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/announcements`);
            setAnnouncements(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch announcements', error);
            toast.error('Failed to load announcements.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    // Handle create new announcement
    const handlePost = async (e) => {
        e.preventDefault();
        setIsPosting(true);
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        try {
            await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/announcements`, { title, content }, config);
            toast.success('Announcement posted!');
            setTitle('');
            setContent('');
            fetchAnnouncements(); // Refresh the list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post announcement.');
        } finally {
            setIsPosting(false);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this announcement?`)) {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/announcements/${id}`, config);
                toast.success(`Announcement deleted.');
                setAnnouncements(announcements.filter((a) => a._id !== id)); // Update UI
            } catch (error) {
                toast.error('Failed to delete announcement.');
            }
        }
    };

    return (
        <div className="admin-page-container">
            <h1>Manage Announcements</h1>
            
            {/* --- Create Announcement Form --- */}
            <div className="announcement-form-card">
                <h2>Create New Announcement</h2>
                <form onSubmit={handlePost}>
                    <div className="form-group">
                        <label htmlFor="announcementTitle">Title</label>
                        <input
                            type="text"
                            id="announcementTitle"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="announcementContent">Content</label>
                        <textarea
                            id="announcementContent"
                            rows="4"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="submit-btn" disabled={isPosting}>
                        {isPosting ? 'Posting...' : 'Post Announcement'}
                    </button>
                </form>
            </div>

            {/* --- Existing Announcements List --- */}
            <div className="announcement-list">
                <h2>Posted Announcements</h2>
                {loading ? (
                    <Loader />
                ) : announcements.length === 0 ? (
                    <p>No announcements posted yet.</p>
                ) : (
                    announcements.map(announcement => (
                        <div key={announcement._id} className="announcement-item">
                            <div className="announcement-content">
                                <h3>{announcement.title}</h3>
                                <p>{announcement.content}</p>
                                <small>Posted by {announcement.user.name} on {new Date(announcement.createdAt).toLocaleDateString()}</small>
                            </div>
                            <button 
                                onClick={() => handleDelete(announcement._id)} 
                                className="btn-delete-announcement"
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ManageAnnouncementsPage;
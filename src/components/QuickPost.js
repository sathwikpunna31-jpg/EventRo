import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import { FaImage, FaPaperPlane } from 'react-icons/fa';

function QuickPost({ onPostCreated }) {
    const { user } = useContext(AuthContext);
    const [text, setText] = useState('');
    const [selectedEvent, setSelectedEvent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [myEvents, setMyEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [showImageInput, setShowImageInput] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Only show for College Admins (Check inside effect or before return, NOT before hooks)

    // Fetch admin's events to populate the dropdown
    useEffect(() => {
        if (!user || user.role !== 'collegeAdmin') return;

        const fetchMyEvents = async () => {
            try {
                setLoadingEvents(true);
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                // Assuming we have an endpoint to get events created by this admin
                // If not, we might need to filter. usually /api/events/myevents or similar
                // Let's check eventController later. For now, try /api/events/myevents
                const { data } = await axios.get(`https://eventro-backend.onrender.com/api/events/myevents`, config);
                setMyEvents(data);
                setLoadingEvents(false);
            } catch (error) {
                console.error('Error fetching admin events:', error);
                setLoadingEvents(false);
            }
        };
        fetchMyEvents();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEvent) {
            toast.error('Please select an event to promote.');
            return;
        }
        if (!text.trim()) {
            toast.error('Please write something.');
            return;
        }

        try {
            setSubmitting(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            const postData = new FormData();
            postData.append('text', text);
            postData.append('event', selectedEvent);
            postData.append('eventId', selectedEvent);
            if (imageFile) {
                postData.append('image', imageFile);
            }

            await axios.post(`https://eventro-backend.onrender.com/api/posts`, postData, config);

            toast.success('Post created!');
            setText('');
            setImageFile(null);
            setSelectedEvent('');
            setShowImageInput(false);
            setSubmitting(false);

            if (onPostCreated) onPostCreated(); // Refresh feed
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('Failed to create post. ' + (error.response?.data?.message || ''));
            setSubmitting(false);
        }
    };

    // Check if user is allowed to see this AFTER hooks
    if (!user || user.role !== 'collegeAdmin') return null;

    return (
        <div className="quick-post-card" style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.03)'
        }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>✨</span> Quick Post
            </h3>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    {/* Avatar */}
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#667eea', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                        {user.name.charAt(0)}
                    </div>

                    <div style={{ flex: 1 }}>
                        <textarea
                            placeholder={`What's happening at ${user.collegeName || 'your college'}?`}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={3}
                            style={{
                                width: '100%',
                                border: 'none',
                                outline: 'none',
                                fontSize: '1rem',
                                resize: 'none',
                                background: '#f8fafc',
                                padding: '1rem',
                                borderRadius: '12px',
                                marginBottom: '1rem'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>

                            {/* Event Selector */}
                            <select
                                value={selectedEvent}
                                onChange={(e) => setSelectedEvent(e.target.value)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    border: '1px solid #e2e8f0',
                                    outline: 'none',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    maxWidth: '200px'
                                }}
                            >
                                <option value="">Select Event (Required)</option>
                                {loadingEvents ? <option>Loading...</option> :
                                    myEvents.map(e => <option key={e._id} value={e._id}>{e.title}</option>)
                                }
                            </select>

                            {/* Image Toggle */}
                            <button
                                type="button"
                                onClick={() => setShowImageInput(!showImageInput)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#718096', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <FaImage size={18} /> {showImageInput ? 'Hide Image Upload' : 'Add Image'}
                            </button>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    marginLeft: 'auto',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.6rem 1.5rem',
                                    borderRadius: '20px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    opacity: submitting ? 0.7 : 1
                                }}
                            >
                                <FaPaperPlane size={14} /> Post
                            </button>
                        </div>

                        {/* Optional Image Input */}
                        {showImageInput && (
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files[0])}
                                style={{
                                    width: '100%',
                                    marginTop: '1rem',
                                    padding: '0.5rem 1rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    outline: 'none'
                                }}
                            />
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

export default QuickPost;

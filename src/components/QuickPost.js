import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import { FaImage, FaPaperPlane } from 'react-icons/fa';
import './Feed.css'; // Import the new styles

function QuickPost({ onPostCreated }) {
    const { user } = useContext(AuthContext);
    const [text, setText] = useState('');
    const [selectedEvent, setSelectedEvent] = useState('');
    const [category, setCategory] = useState('Tech'); // New state for category
    const [imageFile, setImageFile] = useState(null); // State for image file
    const [myEvents, setMyEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [showImageInput, setShowImageInput] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Only show for College Admins (Check inside effect or before return, NOT before hooks)

    // Fetch admin's events to populate the dropdown
    useEffect(() => {
        if (!user || !['collegeAdmin', 'clubCoordinator', 'superAdmin'].includes(user.role)) return;

        const fetchMyEvents = async () => {
            try {
                setLoadingEvents(true);
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                // Assuming we have an endpoint to get events created by this admin
                // If not, we might need to filter. usually /api/events/myevents or similar
                // Let's check eventController later. For now, try /api/events/myevents
                const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events/myevents`, config);
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

            let finalImageUrl = '';

            // Upload image if selected
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
                const uploadConfig = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
                const uploadRes = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/upload`, formData, uploadConfig);
                finalImageUrl = uploadRes.data;
            }

            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const postData = {
                text,
                event: selectedEvent, // API expects 'eventId' or 'event'? Controller look for 'eventId' in body
                eventId: selectedEvent,
                category, // Included category
                imageUrl: finalImageUrl
            };

            await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/posts`, postData, config);

            toast.success('Post created!');
            setText('');
            setImageFile(null); // Reset image file
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
    if (!user || !['collegeAdmin', 'clubCoordinator', 'superAdmin'].includes(user.role)) return null;

    return (
        <div className="quick-post-card">
            <h3 className="quick-post-header">
                <span style={{ fontSize: '1.5rem' }}>✨</span> Quick Post
            </h3>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    {/* Avatar */}
                    <div className="quick-post-avatar">
                        {user.name.charAt(0)}
                    </div>

                    <div style={{ flex: 1 }}>
                        <textarea
                            className="quick-post-textarea"
                            placeholder={`What's happening at ${user.collegeName || 'your college'}?`}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={3}
                        />

                        <div className="quick-post-controls">

                            {/* Event Selector */}
                            <select
                                className="quick-post-select"
                                value={selectedEvent}
                                onChange={(e) => setSelectedEvent(e.target.value)}
                            >
                                <option value="">Select Event (Required)</option>
                                {loadingEvents ? <option>Loading...</option> :
                                    myEvents.map(e => <option key={e._id} value={e._id}>{e.title}</option>)
                                }
                            </select>

                            {/* Category Selector */}
                            <select
                                className="quick-post-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="Tech">Tech</option>
                                <option value="Cultural">Cultural</option>
                                <option value="Sports">Sports</option>
                                <option value="Workshop">Workshop</option>
                            </select>

                            {/* Image Toggle */}
                            <button
                                className="quick-post-img-btn"
                                type="button"
                                onClick={() => {
                                    setShowImageInput(!showImageInput);
                                    if (showImageInput) {
                                        setImageFile(null); // Clear file if hiding
                                    }
                                }}
                            >
                                <FaImage size={18} /> {showImageInput ? 'Hide Image Upload' : 'Add Image'}
                            </button>

                            {/* Submit Button */}
                            <button
                                className="quick-post-submit"
                                type="submit"
                                disabled={submitting}
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
                                    outline: 'none',
                                    background: 'white'
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

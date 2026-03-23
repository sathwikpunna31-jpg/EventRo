import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import EventReviews from '../components/EventReviews';
import EventQnA from '../components/EventQnA';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';
import RegistrationModal from '../components/RegistrationModal';
import './EventDetailsPage.css';

function EventDetailsPage() {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);
    const [eventPosts, setEventPosts] = useState([]);
    const [isSaved, setIsSaved] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const { eventId } = useParams();
    const { user, login } = useContext(AuthContext);

    // Function to check user`s status (registered/saved)
    const checkUserStatus = async (currentEvent) => {
        if (user && currentEvent) {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                // Use the dedicated endpoint to check registration
                const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events/${eventId}/isregistered`, config);
                setIsRegistered(data.isRegistered);
            } catch (error) {
                console.error("Could not check registration status`, error);
                setIsRegistered(false);
            }
            // Check saved status from context
            setIsSaved(user.savedEvents?.includes(eventId) || false);
        } else {
            setIsRegistered(false);
            setIsSaved(false);
        }
    };

    // Re-usable function to fetch all event data
    const fetchEventData = async () => {
        try {
            // Fetch event details and posts in parallel
            const eventPromise = axios.get(`${process.env.REACT_APP_API_URL || `http://localhost:5000`}/api/events/${eventId}`);
            const postsPromise = axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/posts/event/${eventId}`);
            
            const [eventRes, postsRes] = await Promise.all([eventPromise, postsPromise]);
            
            setEvent(eventRes.data);
            setEventPosts(postsRes.data);
            
            // After event data is set, check user status
            checkUserStatus(eventRes.data);

        } catch (error) {
            console.error(`Error fetching event details:', error);
            toast.error(`Failed to load event details.");
            setEvent(null); // Set event to null on error
        } finally {
            setLoading(false); // Always set loading false at the end
        }
    };
    
    // Initial fetch when component loads
    useEffect(() => {
        setLoading(true);
        fetchEventData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId]); // Run only when eventId changes

    // Re-check user status when user logs in/out (context changes)
    useEffect(() => {
        checkUserStatus(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, event]);

    // --- Handlers ---
    const handleRegisterClick = () => {
        if (!event.isFree) {
            toast.info('Payment functionality is coming soon!`);
            return;
        }
        setShowRegistrationModal(true);
    };
    
    const handleRegistrationSuccess = () => {
        setIsRegistered(true); // Immediately update UI
        // We can optionally refetch all data if needed:
        // fetchEventData(); 
    };
    
    const handleSaveToggle = async () => {
        if (!user) { toast.info("Please log in to save events.`); return; }
        setLoadingSave(true);
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/save/${eventId}`;
        try {
            let newSavedEvents;
            if (isSaved) {
                await axios.delete(url, config);
                toast.success(`Event removed from saved list.");
                setIsSaved(false);
                newSavedEvents = user.savedEvents.filter(id => id !== eventId);
            } else {
                await axios.post(url, {}, config);
                toast.success("Event saved!");
                setIsSaved(true);
                newSavedEvents = [...(user.savedEvents || []), eventId];
            }
            // Update context
            login({ ...user, savedEvents: newSavedEvents });
        } catch (error) {
             if (error.response?.status === 400 && error.response?.data?.message === `Event already saved') {
                 setIsSaved(true);
            } else {
                toast.error(error.response?.data?.message || "Could not update saved status.");
            }
        } finally {
            setLoadingSave(false);
        }
    };

    const formatDate = (isoDate) => {
        if (!isoDate) return '';
        return new Date(isoDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // --- RENDER LOGIC ---

    // 1. Handle Loading State
    if (loading) {
        return (
            <div className="event-details-container" style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Loader size={80} />
            </div>
        );
    }

    // 2. Handle Event Not Found (after loading is false)
    // This is the critical check that was missing or failing
    if (!event) {
        return (
            <div className="not-found-container">
                <h1>Event Not Found</h1>
                <p>Sorry, we couldn't find the event you're looking for.</p>
            </div>
        );
    }

    // 3. Render Page (only if loading is false AND event exists)
    return (
        <>
            <div className="event-details-container">
                {/* --- Event Details --- */}
                <div className="event-details-layout">
                    <div className="event-image-container">
                        <img src={event.imageUrl} alt={event.title} />
                    </div>
                    <div className="event-info">
                        <div className="event-title-header">
                            <h1>{event.title}</h1>
                            {user && (
                                <button
                                    className={`save-button-details ${isSaved ? 'saved' : ''}`}
                                    onClick={handleSaveToggle}
                                    disabled={loadingSave}
                                    title={isSaved ? "Unsave Event" : "Save Event"}
                                >
                                    {loadingSave ? <Loader size={18} color="#dc3545"/> : (isSaved ? '❤️ Saved' : '♡ Save')}
                                </button>
                            )}
                        </div>
                        <div className="event-meta">
                            <div className="meta-item"><strong>College:</strong> {event.college}</div>
                            <div className="meta-item"><strong>Date:</strong> {formatDate(event.date)}</div>
                            <div className="meta-item"><strong>Category:</strong> {event.category}</div>
                            <div className="meta-item">
                                <strong>Price:</strong> {event.isFree ? 'Free' : `₹${event.price}`}
                            </div>
                            <div className="meta-item">
                                <strong>Rating:</strong> {'★'.repeat(Math.round(event.rating))}{'☆'.repeat(5 - Math.round(event.rating))} ({event.numReviews} reviews)
                            </div>
                        </div>
                        <p className="event-description">{event.description}</p>
                        
                        {/* --- Registration Button --- */}
                        {user && user.role === 'student' ? (
                            <button
                                onClick={handleRegisterClick}
                                className="register-button"
                                disabled={isRegistered}
                            >
                                {isRegistered
                                    ? 'Registered'
                                    : event.isFree // This line is now safe
                                        ? 'Register Now'
                                        : `Pay & Register (₹${event.price})`}
                            </button>
                        ) : !user ? (
                            <p>Please <Link to='/login'>login</Link> as a student to register.</p>
                        ) : null}
                    </div>
                </div>

                {/* --- Event Posts --- */}
                <div className="event-posts-section">
                    <h2>Event Updates & Promotions</h2>
                    {eventPosts.length === 0 ? (
                        <p>No promotional posts for this event yet.</p>
                    ) : (
                        <div className="posts-list">
                            {eventPosts.map((post) => (
                                <PostCard key={post._id} post={post} /> 
                            ))}
                        </div>
                    )}
                </div>

                {/* --- Q&A Section --- */}
                <EventQnA event={event} eventId={eventId} onUpdate={fetchEventData} />
                
                {/* --- Reviews Section --- */}
                <EventReviews event={event} eventId={eventId} onReviewSubmitted={fetchEventData} />
            </div>

            {/* --- Registration Modal --- */}
            {showRegistrationModal && (
                <RegistrationModal
                    event={event}
                    onClose={() => setShowRegistrationModal(false)}
                    onRegistrationSuccess={handleRegistrationSuccess}
                />
            )}
        </>
    );
}

export default EventDetailsPage;
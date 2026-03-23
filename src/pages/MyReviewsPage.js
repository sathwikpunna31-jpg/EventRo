// src/pages/MyReviewsPage.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
// Reuse review item styles or create specific ones
import '../components/EventReviews.css'; // Reusing review item styles
import './MyReviewsPage.css'; // Add new CSS file

function MyReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchMyReviews = async () => {
            if (!user?.token) return;
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                setLoading(true);
                const { data } = await axios.get(`\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/myreviews`, config);
                setReviews(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch reviews', error);
                toast.error("Failed to load your reviews.");
                setLoading(false);
            }
        };
        fetchMyReviews();
    }, [user]);

     const formatDate = (isoDate) => new Date(isoDate).toLocaleDateString();

    return (
        <div className="my-reviews-page"> {/* Use specific class */}
            <h1 className="section-title">My Reviews</h1>

            {loading ? (
                <Loader />
            ) : reviews.length === 0 ? (
                <p className="no-reviews-message">You haven't submitted any reviews yet.</p>
            ) : (
                <ul className="review-list"> {/* Reuse class from EventReviews.css */}
                    {reviews.map((review) => (
                        <li key={review.reviewId} className="review-item my-review-item"> {/* Add specific class */}
                           <div className="my-review-header">
                                <div>
                                    Reviewed Event: <Link to={`/event/${review.eventId}`}><strong>{review.eventTitle}</strong></Link>
                                    <small> ({review.eventCollege})</small>
                                </div>
                                <small>Reviewed on: {formatDate(review.reviewDate)}</small>
                           </div>
                            <div className="rating-display">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                            <p>{review.comment}</p>
                            {/* Optionally add Edit/Delete review buttons later */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default MyReviewsPage;
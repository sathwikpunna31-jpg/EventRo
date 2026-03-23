import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './EventReviews.css';

function EventReviews({ event, eventId, onReviewSubmitted }) {
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  // Check if user is registered and hasn't reviewed
  const isRegistered = user && event.registrations.includes(user._id);
  const hasReviewed = user && event.reviews.some(review => review.user === user._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    setError('');

    const review = { rating, comment };
    const config = {
      headers: {
        'Content-Type': 'application/json`,
        Authorization: `Bearer ${user.token}`,
      },
    };

    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events/${eventId}/reviews`, review, config);
      alert(`Review submitted!');
      setRating(0);
      setComment('');
      onReviewSubmitted(); // This will tell the parent page to refetch the event
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting review.');
    }
  };

  return (
    <div className="reviews-container">
      <h2>Reviews & Ratings</h2>
      
      {/* --- Display Existing Reviews --- */}
      {event.reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul className="review-list">
          {event.reviews.map((review) => (
            <li key={review._id} className="review-item">
              <strong>{review.name}</strong>
              <div className="rating-display">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
              <p>{review.comment}</p>
              <small>{new Date(review.createdAt).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      )}

      {/* --- "Write a Review" Form --- */}
      <div className="review-form-container">
        {user && user.role === 'student' && (
          <>
            {isRegistered && !hasReviewed && (
              <form onSubmit={handleSubmit} className="review-form">
                <h4>Write Your Review</h4>
                {error && <div className="review-error">{error}</div>}
                <div className="form-group">
                  <label>Rating</label>
                  <select value={rating} onChange={(e) => setRating(e.target.value)} required>
                    <option value="0">Select...</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Comment</label>
                  <textarea
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="submit-btn">Submit Review</button>
              </form>
            )}
            {isRegistered && hasReviewed && <p>You have already reviewed this event.</p>}
            {!isRegistered && <p>You must be registered for this event to leave a review.</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default EventReviews;
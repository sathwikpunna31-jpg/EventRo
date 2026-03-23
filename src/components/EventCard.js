import React, { useContext, useState, useEffect } from 'react'; // Import hooks
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import axios
import { toast } from 'react-toastify'; // Import toast
import AuthContext from '../context/AuthContext'; // Import AuthContext
import './EventCard.css';

function EventCard({ event }) {
  const { user } = useContext(AuthContext);
  // Add state to track if saved (initially assume not saved for simplicity)
  // We'll improve this later by fetching the initial state
  const [isSaved, setIsSaved] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);


  useEffect(() => {
    // Check if the user exists AND has savedEvents AND the current event is included
    if (user?.savedEvents?.includes(event._id)) {
      setIsSaved(true);
    } else {
      setIsSaved(false); // Ensure it resets if user logs out or list changes
    }
  }, [user, event._id]); // Re-check when user or event changes
  // --- ADD FUNCTION TO HANDLE SAVE/UNSAVE ---
  const handleSaveToggle = async (e) => {
      e.preventDefault(); // Prevent link navigation if clicking button
      e.stopPropagation(); // Stop event bubbling up

      if (!user) {
          toast.info("Please log in to save events.");
          return;
      }
      setLoadingSave(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const url = `\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/save/${event._id}`;

      try {
          if (isSaved) {
              // --- Unsave Event ---
              await axios.delete(url, config);
              toast.success("Event removed from saved list.");
              setIsSaved(false);
          } else {
              // --- Save Event ---
              await axios.post(url, {}, config); // Empty body for POST
              toast.success("Event saved!");
              setIsSaved(true);
          }
      } catch (error) {
           // Handle 'Already saved' error silently for UX, or update state
          if (error.response?.status === 400 && error.response?.data?.message === 'Event already saved') {
               setIsSaved(true); // Correct the state if it was wrong
          } else {
              console.error("Save/Unsave error:", error);
              toast.error(error.response?.data?.message || "Could not update saved status.");
          }
      } finally {
          setLoadingSave(false);
      }
  };


  return (
    // Wrap entire card content for the main link, but allow button click
    <Link to={`/event/${event._id}`} className="event-card-link-wrapper">
      <div className='event-card'>
        {/* --- ADD SAVE BUTTON (Heart Icon) --- */}
        {user && ( // Only show button if logged in
            <button
                className={`save-button ${isSaved ? 'saved' : ''}`}
                onClick={handleSaveToggle}
                disabled={loadingSave}
                title={isSaved ? "Unsave Event" : "Save Event"}
            >
                {loadingSave ? '...' : (isSaved ? '❤️' : '♡')} {/* Filled/Empty Heart */}
            </button>
        )}

        <img src={event.imageUrl} alt={event.title} className='card-image' />
        <div className='card-content'>
          <h3 className='card-title'>{event.title}</h3>
          <p className='card-college'>{event.college}</p>
          <div className='card-footer'>
            <span className='card-date'>
              {new Date(event.date).toLocaleDateString()}
            </span>
            <span className='card-price'>
              {event.isFree ? 'Free' : `₹${event.price}`}
            </span>
          </div>
        </div>
        {/* Removed the invisible full-card link */}
      </div>
    </Link>
  );
}

export default EventCard;
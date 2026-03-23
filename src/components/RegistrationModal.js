import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Loader from './Loader';
import './RegistrationModal.css';

function RegistrationModal({ event, onClose, onRegistrationSuccess }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [collegeName, setCollegeName] = useState(user?.collegeName || user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const registrationData = { collegeName, phoneNumber, yearOfStudy };
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
    };

    try {
      // 'data' is the object sent back from the backend
      const { data } = await axios.post(
        `\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events/${event._id}/register`,
        registrationData,
        config
      );
      
      // --- THIS IS THE FIX ---
      // 1. Log what the backend sent us to be sure
      console.log("Backend response on registration:", data);

      // 2. Check if data._id exists before navigating
      if (data && data._id) {
        toast.success(`Successfully registered for ${event.title}!`);
        onRegistrationSuccess(); // Tell parent page to update
        onClose(); // Close the modal
        
        // 3. Navigate to the new ticket page
        navigate(`/registration/${data._id}`);
      } else {
        // This will happen if the backend response is wrong
        toast.error('Registration succeeded, but could not find ticket. Please check "My Registrations".');
        onRegistrationSuccess();
        onClose();
      }

    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed.');
      setLoading(false); // Only set loading false on error (on success, we navigate away)
    }
    // Removed 'finally' block
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Register for {event.title}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" value={user.name} disabled />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" value={user.email} disabled />
            </div>
            <div className="form-group">
              <label htmlFor="collegeName">College Name</label>
              <input
                type="text"
                id="collegeName"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                placeholder="e.g., 9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="yearOfStudy">Year of Study (Optional)</label>
              <input
                type="text"
                id="yearOfStudy"
                placeholder="e.g., 2nd Year"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn-cancel">
                Cancel
              </button>
              <button type="submit" className="btn-submit-reg" disabled={loading}>
                {loading ? <Loader size={20} color="#fff" /> : 'Confirm Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistrationModal;
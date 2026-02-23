import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import EventCard from '../components/EventCard';
import Loader from '../components/Loader';
import '../components/FeaturedEvents.css'; // Reuse grid styles
import './MyRegistrationsPage.css'; // Reuse specific styles

function MyRegistrationsPage() {
  const [upcomingRegistrations, setUpcomingRegistrations] = useState([]);
  const [pastRegistrations, setPastRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // Function to fetch registrations
  const fetchRegistrations = async () => {
    if (!user?.token) return;
    const config = {
      headers: { Authorization: `Bearer ${user.token}` },
    };
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/users/myregistrations', config);

      // --- Filter events based on date ---
      const now = new Date();
      const upcoming = [];
      const past = [];

      data.forEach(event => {
        if (new Date(event.date) >= now) {
          upcoming.push(event);
        } else {
          past.push(event);
        }
      });

      // Sort upcoming ascending, past descending
      upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
      past.sort((a, b) => new Date(b.date) - new Date(a.date));

      setUpcomingRegistrations(upcoming);
      setPastRegistrations(past);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch registrations', error);
      toast.error('Failed to load your registrations.');
      setLoading(false);
    }
  };

  // Fetch registrations on initial load
  useEffect(() => {
    fetchRegistrations();
  }, [user]);

  // Handle cancellation
  const handleCancel = async (eventId) => {
    if (window.confirm('Are you sure you want to cancel your registration for this event?')) {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        await axios.delete(`http://localhost:5000/api/events/${eventId}/register`, config);
        toast.success('Registration cancelled successfully.');
        // Refetch data to update both lists correctly
        fetchRegistrations();
      } catch (error) {
        console.error('Failed to cancel registration', error);
        toast.error(error.response?.data?.message || 'Failed to cancel registration.');
      }
    }
  };

  return (
    <div className="my-registrations-page"> {/* Removed container class */}
      <h1 className="section-title">My Registrations</h1>

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* --- Upcoming Events Section --- */}
          <section className="registration-section">
            <h2>Upcoming Events ({upcomingRegistrations.length})</h2>
            {upcomingRegistrations.length === 0 ? (
              <p>You have no upcoming registrations.</p>
            ) : (
              <div className="registrations-list">
                {upcomingRegistrations.map((event) => (
                  <div key={event._id} className="registration-item">
                    <EventCard event={event} />
                    <button
                      onClick={() => handleCancel(event._id)}
                      className="btn-cancel-registration"
                    >
                      Cancel Registration
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* --- Past Events Section --- */}
          <section className="registration-section">
            <h2>Past Events ({pastRegistrations.length})</h2>
            {pastRegistrations.length === 0 ? (
              <p>You have no past registrations.</p>
            ) : (
              <div className="registrations-list">
                {pastRegistrations.map((event) => (
                  // Display past events without cancel button
                  <div key={event._id} className="registration-item past-event">
                    <EventCard event={event} />
                    {/* Optionally add a link to leave a review if not already done */}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default MyRegistrationsPage;
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import './EventRegistrationsPage.css';

function EventRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [event, setEvent] = useState(null); // Store the event object
  const [loading, setLoading] = useState(true);
  const { eventId } = useParams();
  const { user } = useContext(AuthContext);

  // Check if the event has already happened
  const now = new Date();
  const isEventOver = event ? new Date(event.date) < now : false;

  // Function to fetch all registrations for this event
  const fetchRegistrations = async () => {
      if (!user?.token) return;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
          // 1. Fetch the event itself to get its date
          const eventRes = await axios.get(`\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events/${eventId}`);
          setEvent(eventRes.data); // Save the event data

          // 2. Fetch the registration data
          const { data } = await axios.get(`\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events/${eventId}/registrations`, config);
          setRegistrations(data);
          
      } catch (error) {
          console.error('Failed to fetch registrations', error);
          toast.error('Failed to load registrations.');
      } finally {
          setLoading(false);
      }
  };

  // Fetch data on page load
  useEffect(() => {
    setLoading(true);
    fetchRegistrations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, user]); // Re-fetch if user or eventId changes

  // Handle Toggling Checkbox
  const handleStatusChange = async (registrationId, field, currentValue) => {
    // Check if event is over before allowing change
    if (!isEventOver) {
        toast.error("You can only update status after the event has occurred.");
        return;
    }
    
    const newValue = !currentValue;
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    
    // Optimistically update the UI first
    setRegistrations(prevRegs => 
      prevRegs.map(reg => 
        reg._id === registrationId ? { ...reg, [field]: newValue } : reg
      )
    );

    try {
      // Send update to the backend
      await axios.put(
        `\${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/registrations/${registrationId}`,
        { [field]: newValue }, // Send only the field to update
        config
      );
      toast.success('Status updated!');
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Update failed. Please try again.');
      // Revert the change in UI if API call fails
       setRegistrations(prevRegs => 
        prevRegs.map(reg => 
          reg._id === registrationId ? { ...reg, [field]: currentValue } : reg
        )
      );
    }
  };


  if (loading) {
    return (
        <div className="registrations-container">
            <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
            <h1>Registrations</h1>
            <Loader />
        </div>
    );
  }

  return (
    <div className="registrations-container">
      <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
      <h1>Registrations for "{event?.title}"</h1>
      <p>Manage student attendance and participation.</p>
      
      {/* Add a warning if the event is in the future */}
      {!isEventOver && event && (
          <div className="status-warning">
              You can mark attendance and winners after the event date: {new Date(event.date).toLocaleDateString()}
          </div>
      )}

      {registrations.length === 0 ? (
        <p>No students have registered for this event yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="registrations-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>College</th>
                <th>Attended?</th>
                <th>Won?</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg._id}>
                  {/* Ensure reg.user exists before accessing name/email */}
                  <td>{reg.user ? reg.user.name : 'User Deleted'}</td>
                  <td>{reg.user ? reg.user.email : 'N/A'}</td>
                  <td>{reg.phoneNumber}</td>
                  <td>{reg.collegeName}</td>
                  <td>
                    <input
                      type="checkbox"
                      className="status-checkbox"
                      checked={reg.attended || false}
                      onChange={() => handleStatusChange(reg._id, 'attended', reg.attended)}
                      disabled={!isEventOver} // Disable if event is not over
                      title={!isEventOver ? "Cannot mark attendance until event is over" : "Mark as attended"}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      className="status-checkbox"
                      checked={reg.didWin || false}
                      onChange={() => handleStatusChange(reg._id, 'didWin', reg.didWin)}
                      disabled={!isEventOver} // Disable if event is not over
                      title={!isEventOver ? "Cannot mark winners until event is over" : "Mark as won"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EventRegistrationsPage;
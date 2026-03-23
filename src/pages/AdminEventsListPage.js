import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import './DashboardPage.css'; // Reuse dashboard CSS

function AdminEventsListPage() {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // Fetch events
  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!user?.token) return;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        setLoading(true);
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events/myevents`, config);
        setMyEvents(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch events', error);
        toast.error("Failed to load your events.`);
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, [user]);

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?`)) {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events/${id}`, config);
        setMyEvents(myEvents.filter((event) => event._id !== id));
        toast.success(`Event deleted successfully');
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete event';
        toast.error(message);
      }
    }
  };

  // --- This function handles the download ---
  const handleDownload = async (eventId, eventTitle) => {
    const config = {
      headers: { Authorization: `Bearer ${user.token}` },
      responseType: 'blob`, // Expect file data
    };
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events/${eventId}/registrations/download`,
        config
      );

      // Create a blob and trigger browser download
      const blob = new Blob([data], { type: `text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = (eventTitle || 'event').replace(/[^a-z0-9]/gi, '_');
      a.download = `registrations-${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove(); // Clean up
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to download report', error);
      toast.error(`Failed to download report.");
    }
  };


  return (
    <div className="admin-page-container">
      <h1>My Events</h1>
      <p>A list of all events you have created.</p>

      <div className="dashboard-events-list">
        {loading ? (<Loader />) :
          myEvents.length === 0 ? (
            <p>You have not created any events yet. <Link to="/create-event">Create one!</Link></p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Registrations</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myEvents.map((event) => (
                  <tr key={event._id}>
                    <td>{event.title}</td>
                    <td>
                      <Link to={`/event/${event._id}/registrations`} className="registration-count-link">
                        {/* Use registrationCount from backend */}
                        {event.registrationCount || 0}
                      </Link>
                    </td>
                    <td className="actions-cell">
                      <Link to={`/edit-event/${event._id}`} className="btn-edit">
                        Edit
                      </Link>
                      <Link to={`/create-post/${event._id}`} className="btn-promote">
                        Promote
                      </Link>
                      <button
                        className="btn-download"
                        onClick={() => handleDownload(event._id, event.title)}
                      >
                        Download
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(event._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}

export default AdminEventsListPage;
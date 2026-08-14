import API_BASE_URL from '../config';
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import Loader from '../components/Loader';
import './CreateEventPage.css';
import '../components/EventForm.css';

function EditEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Form state
  const [title, setTitle] = useState('');
  const [college, setCollege] = useState(''); // <-- Field is back
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Tech');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('0');
  // 'visibility' state removed
  const [loading, setLoading] = useState(true);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      if (!user?.token) return;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/api/events/${eventId}`, config);
        setTitle(data.title);
        setCollege(data.college); // <-- Set college string
        setDate(new Date(data.date).toISOString().split('T')[0]);
        setCategory(data.category);
        setDescription(data.description);
        setIsFree(data.isFree);
        setPrice(data.price.toString());
        // 'visibility' removed
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch event data', error);
        toast.error('Failed to load event data.');
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, user]);

  // Handle update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const eventData = new FormData();
    eventData.append('title', title);
    eventData.append('college', college);
    eventData.append('date', date);
    eventData.append('category', category);
    eventData.append('description', description);
    eventData.append('isFree', isFree);
    eventData.append('price', isFree ? 0 : Number(price));
    if (imageFile) {
      eventData.append('image', imageFile);
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    try {
      await axios.put(
        `${API_BASE_URL}/api/events/${eventId}`,
        eventData,
        config
      );
      toast.success('Event updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating event:', error.response?.data?.message || error.message);
      toast.error(`Error: ${error.response?.data?.message || 'Update failed'}`);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="create-event-container">
      <div className="form-wrapper">
        <h2>Edit Your Event</h2>
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          
          {/* --- College Field is BACK --- */}
          <div className="form-group">
            <label htmlFor="college">College Name</label>
            <input type="text" id="college" value={college} onChange={(e) => setCollege(e.target.value)} required />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Tech">Tech</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>
          </div>
          
          {/* --- Visibility Field REMOVED --- */}

          <div className="form-row">
            <div className="form-group form-group-checkbox" style={{flexDirection: 'row', alignItems: 'center'}}>
              <input
                type="checkbox" id="isFree" checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
              <label htmlFor="isFree" style={{marginBottom: 0}}>This is a free event</label>
            </div>
            {!isFree && (
              <div className="form-group">
                <label htmlFor="price">Registration Fee (₹)</label>
                <input
                  type="number" id="price" value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0" required
                />
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="imageFile">Update Banner Image (Optional)</label>
            <input type="file" id="imageFile" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" rows="5" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
          </div>
          <button type="submit" className="submit-btn">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditEventPage;
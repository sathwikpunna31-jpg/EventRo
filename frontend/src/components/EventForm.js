import API_BASE_URL from '../config';
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';

const EventForm = () => {
  const [title, setTitle] = useState('');
  const [college, setCollege] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Tech');
  const [visibility, setVisibility] = useState('private');
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.token) {
      toast.error('You must be logged in to create an event.');
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const eventData = new FormData();
      eventData.append('title', title);
      eventData.append('college', college);
      eventData.append('date', date);
      eventData.append('category', category);
      eventData.append('visibility', visibility);
      eventData.append('isFree', isFree);
      eventData.append('price', isFree ? 0 : Number(price));
      eventData.append('description', description);
      if (imageFile) {
        eventData.append('image', imageFile);
      }

      await axios.post(`${API_BASE_URL}/api/events`, eventData, config);

      toast.success('Event created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'An unexpected error occurred.';
      console.error('Error creating event:', error);
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <div className="form-group">
        <label htmlFor="title">Event Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* --- College Name Field --- */}
      <div className="form-group">
        <label htmlFor="college">College Name</label>
        <input
          type="text"
          id="college"
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          placeholder="e.g. NGIT"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Tech">Tech</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Workshop">Workshop</option>
          </select>
        </div>
      </div>

      {/* --- Visibility Field --- */}
      <div className="form-group">
        <label htmlFor="visibility">Visibility</label>
        <select
          id="visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
        >
          <option value="private">Private (My College Only)</option>
          <option value="public">Public (All Colleges)</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group form-group-checkbox" style={{ flexDirection: 'row', alignItems: 'center' }}>
          <input
            type="checkbox"
            id="isFree"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
          />
          <label htmlFor="isFree" style={{ marginBottom: 0, marginLeft: '8px' }}>This is a free event</label>
        </div>

        {!isFree && (
          <div className="form-group">
            <label htmlFor="price">Registration Fee (₹)</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              required
            />
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="imageFile">Banner Image</label>
        <input
          type="file"
          id="imageFile"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          rows="5"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}

export default EventForm;
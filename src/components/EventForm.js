import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';

const EventForm = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Tech');
  const [visibility, setVisibility] = useState('private');
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState('');

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.token) {
      toast.error('You must be logged in to create an event.');
      return;
    }

    try {
      let finalImageUrl = '';

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadConfig = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
        const uploadRes = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/upload`, formData, uploadConfig);
        finalImageUrl = uploadRes.data;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const eventData = {
        title,
        date,
        category,
        visibility,
        isFree,
        price: isFree ? 0 : Number(price),
        imageUrl: finalImageUrl,
        description,
      };

      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/events`, eventData, config);

      toast.success('Event created successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'An unexpected error occurred.';
      console.error('Error creating event:', error);
      toast.error(message);
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
        <label htmlFor="imageFile">Banner Image (Upload)</label>
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

      <button type="submit" className="submit-btn">
        Create Event
      </button>
    </form>
  );
}

export default EventForm;
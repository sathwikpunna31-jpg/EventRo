import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './CreateEventPage.css'; // Reuse styles
import '../components/EventForm.css'; // Reuse styles

function CreatePostPage() {
  const { eventId } = useParams(); // Get eventId from URL
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState('Tech'); // State for category

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let finalImageUrl = '';

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadConfig = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
        const uploadRes = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/upload`, formData, uploadConfig);
        finalImageUrl = uploadRes.data;
      }

      const postData = {
        text,
        imageUrl: finalImageUrl,
        category, // Include category
        eventId, // Include the event ID
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/posts`, postData, config);
      alert('Post created successfully!');
      navigate('/dashboard'); // Go back to dashboard after posting
    } catch (error) {
      console.error('Error creating post:', error.response?.data?.message || error.message);
      alert('Error creating post.');
    }
  };

  return (
    <div className="create-event-container">
      <div className="form-wrapper">
        <h2>Create Promotional Post</h2>
        <p>Write something to promote your event.</p>
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="text">Post Content</label>
            <textarea
              id="text"
              rows="5"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's exciting about this event?"
              required
            ></textarea>
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
          <div className="form-group">
            <label htmlFor="imageFile">Optional Image (Upload)</label>
            <input
              type="file"
              id="imageFile"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>
          <button type="submit" className="submit-btn">
            Create Post
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePostPage;
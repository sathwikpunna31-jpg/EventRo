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
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const postData = {
      text,
      imageUrl,
      eventId, // Include the event ID
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
    };

    try {
      await axios.post(`https://eventro-backend.onrender.com/api/posts`, postData, config);
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
            <label htmlFor="imageUrl">Optional Image URL</label>
            <input
              type="text"
              id="imageUrl"
              placeholder="https://example.com/image.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
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
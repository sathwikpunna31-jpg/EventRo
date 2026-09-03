import API_BASE_URL from '../config';
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const postData = new FormData();
    postData.append('text', text);
    if (eventId) {
      postData.append('eventId', eventId);
    }
    if (imageFile) {
      postData.append('image', imageFile);
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    try {
      await axios.post(`${API_BASE_URL}/api/posts`, postData, config);
      alert('Post created successfully!');
      navigate('/dashboard'); // Go back to dashboard after posting
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Unknown error';
      console.error('Error creating post:', errMsg);
      alert(`Error creating post: ${errMsg}`);
    } finally {
      setLoading(false);
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
            <label htmlFor="imageFile">Optional Image</label>
            <input
              type="file"
              id="imageFile"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePostPage;
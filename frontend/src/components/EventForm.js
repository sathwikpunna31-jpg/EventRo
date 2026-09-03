import API_BASE_URL from '../config';
import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaMagic, FaCheckCircle } from 'react-icons/fa';
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
  const [imagePreview, setImagePreview] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const posterInputRef = useRef(null);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handlePosterScan = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    // Set preview & store file for event form submission
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('poster', file);

    try {
      setIsScanning(true);
      setScanSuccess(false);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`,
        },
      };

      const res = await axios.post(`${API_BASE_URL}/api/ai/parse-poster`, formData, config);
      const data = res.data?.data;

      if (data) {
        if (data.title) setTitle(data.title);
        if (data.college) setCollege(data.college);
        if (data.date) {
          const parsed = new Date(data.date);
          if (!isNaN(parsed.getTime())) {
            setDate(parsed.toISOString().split('T')[0]);
          } else {
            setDate(data.date);
          }
        }
        if (data.category) setCategory(data.category);
        if (data.visibility) setVisibility(data.visibility);
        if (typeof data.isFree === 'boolean') {
          setIsFree(data.isFree);
          if (!data.isFree && data.price) {
            setPrice(data.price);
          }
        }
        if (data.description) setDescription(data.description);

        setScanSuccess(true);
        toast.success('✨ Event details auto-filled from poster! Review and submit.');
      }
    } catch (err) {
      console.error('Error scanning poster:', err);
      const msg = err.response?.data?.message || 'Failed to analyze poster image with AI.';
      toast.error(msg);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePosterScan(e.dataTransfer.files[0]);
    }
  };

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
      {/* --- AI Poster Ingestion Box --- */}
      <div
        className={`ai-poster-box ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isScanning && posterInputRef.current?.click()}
      >
        <input
          type="file"
          ref={posterInputRef}
          className="ai-poster-file-input"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handlePosterScan(e.target.files[0]);
            }
          }}
        />

        {isScanning ? (
          <div className="ai-scanning-overlay">
            <div className="ai-scan-spinner"></div>
            <p className="ai-scan-text">
              ✨ Gemini Vision is analyzing poster details...
            </p>
          </div>
        ) : (
          <div className="ai-poster-content">
            <FaMagic className="ai-poster-icon" />
            <h4 className="ai-poster-title">
              Auto-Fill Event with AI Poster Scanner
            </h4>
            <p className="ai-poster-sub">
              Drag & drop or click to upload your event flyer (Canva/PNG/JPG). Gemini Vision will automatically extract Title, Date, Category, Price & Description!
            </p>
          </div>
        )}
      </div>

      {scanSuccess && (
        <div className="ai-success-banner">
          <span>
            <FaCheckCircle style={{ marginRight: '6px' }} />
            Event details extracted! Feel free to review or edit any fields below.
          </span>
        </div>
      )}

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
        {imagePreview ? (
          <div className="ai-preview-card">
            <img src={imagePreview} alt="Banner Preview" className="ai-preview-img" />
            <div className="ai-preview-info">
              <span className="ai-preview-filename">{imageFile?.name || 'Uploaded Poster'}</span>
              <span className="ai-preview-tag">✓ Ready as event banner</span>
            </div>
            <button
              type="button"
              className="ai-prompt-chip"
              onClick={() => {
                setImageFile(null);
                setImagePreview('');
              }}
            >
              Change
            </button>
          </div>
        ) : (
          <input
            type="file"
            id="imageFile"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }
            }}
            required={!imageFile}
          />
        )}
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
// Centralized API Base URL Configuration
// For local development, it falls back to http://localhost:5000.
// For production (e.g. Vercel deployment), it will use the environment variable
// REACT_APP_API_URL or default to the live Render backend.

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://eventro-backend.onrender.com';
console.log("Resolved API_BASE_URL in frontend:", API_BASE_URL);

export default API_BASE_URL;

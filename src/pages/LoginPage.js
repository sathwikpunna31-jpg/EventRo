import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import './LoginPage.css';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCollege, setIsCollege] = useState(false); // Using simple checkbox

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isLogin && password.length < 6) {
        toast.error('Password must be at least 6 characters long.');
        return;
    }

    if (isLogin) {
      // --- Login Logic ---
      try {
        const { data } = await axios.post('http://localhost:5000/api/users/login', { email, password });
        login(data);
        toast.success(`Welcome back, ${data.name.split(' ')[0]}!`);
        navigate('/');
      } catch (error) {
        const message = error.response?.data?.message || 'Login failed. Please check credentials.';
        toast.error(message);
      }
    } else {
      // --- Sign Up Logic (Reverted) ---
      const payload = {
          name,
          email,
          password,
          role: isCollege ? 'collegeAdmin' : 'student',
      };

      try {
        const { data } = await axios.post(`http://localhost:5000/api/users/register`, payload);
        login(data);
        toast.success(`Welcome, ${data.name.split(' ')[0]}! Account created.`);
        navigate('/');
      } catch (error) {
        const message = error.response?.data?.message || 'Registration failed. Please try again.';
        toast.error(message);
      }
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setName('');
    setEmail('');
    setPassword('');
    setIsCollege(false);
  };

  return (
    <div className="login-page-container split-screen">
      <div className="login-image-side">
        <div className="login-branding">
          <h2>EVENTRO</h2>
          <p>Discover your next great event.</p>
        </div>
      </div>
      <div className="login-form-side">
        <div className="auth-form-container">
          <h2>{isLogin ? 'Welcome Back!' : 'Create Your Account'}</h2>
          <p className="auth-subtitle">
            {isLogin ? "Log in to continue to EVENTRO." : "Join the largest college event network."}
          </p>
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            
            {!isLogin && (
              <>
                <div className="form-group">
                  <label htmlFor="name">Full Name or College Name</label>
                  <input
                    type="text" id="name" className="form-control"
                    value={name} onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                {/* --- Reverted to Checkbox --- */}
                <div className="form-group-checkbox">
                  <input
                    type="checkbox" id="isCollege"
                    checked={isCollege} onChange={(e) => setIsCollege(e.target.checked)}
                  />
                  <label htmlFor="isCollege">I am registering a college</label>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email" id="email" className="form-control"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password" id="password" className="form-control"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required minLength="6"
              />
              {!isLogin && password.length > 0 && password.length < 6 && (
                  <small className="validation-error">Password must be at least 6 characters.</small>
              )}
            </div>
            <button type="submit" className="auth-button">
              {isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          <p className="toggle-auth">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span onClick={toggleForm} className="toggle-auth-link">
              {isLogin ? ' Sign Up' : ' Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h2 className="footer-logo">EVENTRO</h2>
            <p>The ultimate platform for managing and discovering events in your campus.</p>
          </div>

          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/events">All Events</Link></li>
              <li><Link to="/popular-events">Popular</Link></li>
              <li><Link to="/login">Login</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h3>Contact Us</h3>
            <p>Email: support@eventro.com</p>
            <p>Phone: +1 234 567 890</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} EVENTRO. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
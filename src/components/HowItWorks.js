import React from 'react';
import './HowItWorks.css'; // We will update this file next

function HowItWorks() {
  return (
    <section className="how-it-works-section">
      <div className="container">
        
        {/* --- New Title Section --- */}
        <div className="section-header">
          <h2 className="section-title">Why You'll Love EVENTRO</h2>
          <p className="section-subtitle">One platform to connect them all.</p>
        </div>

        {/* --- New 3-Column Grid --- */}
        <div className="steps-grid">
          
          <div className="step-card">
            {/* We'll use simple text icons for now, but can upgrade to real icons later */}
            <div className="step-icon-wrapper">
              <span>🔍</span>
            </div>
            <h3>Unified Discovery</h3>
            <p>Track events from your college and others. Never miss an opportunity to learn, compete, or have fun.</p>
          </div>
          
          <div className="step-card">
            <div className="step-icon-wrapper">
              <span>🚀</span> {/* Changed icon */}
            </div>
            <h3>Promote & Share</h3>
            <p>Amplify your college's events using posts and reels. Share your experiences and give valuable feedback.</p>
          </div>
          
          <div className="step-card">
            <div className="step-icon-wrapper">
              <span>👥</span> {/* Changed icon */}
            </div>
            <h3>For Colleges & Students</h3>
            <p>A dedicated space for colleges to manage their events and for students to explore a world of opportunities.</p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
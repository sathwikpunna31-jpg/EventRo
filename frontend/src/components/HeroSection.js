import React from 'react';
import './HeroSection.css';

function HeroSection() {
  // This component is now ONLY shown to logged-out users,
  // so we can remove all the dynamic logic.

  return (
    <div className='hero-container clean-hero'>
      <h1>Discover. Engage. Experience.</h1>
      <p>
        EVENTRO is the ultimate hub for college events. From tech fests to art
        expos, find and join events from colleges everywhere, all in one place.
      </p>
      {/* All buttons are removed. 
        The "Get Started" button is now in the Navbar.
      */}
    </div>
  );
}

export default HeroSection;
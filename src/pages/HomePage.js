import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import PublicLandingPage from '../components/PublicLandingPage';
import LoggedInHomePage from '../components/LoggedInHomePage';

function HomePage() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  
  // If user is logged in, but not at /home, send them to /home
  // This handles the generic "/" route sending them inside the dashboard layout
  if (user && location.pathname === '/') {
    return <Navigate to="/home" replace />;
  }

  // If user is NOT logged in, but tries to access /home, send them to /login
  if (!user && location.pathname === '/home') {
    return <Navigate to="/login" replace />;
  }

  // Normal renders
  return (
    <>
      {user ? <LoggedInHomePage /> : <PublicLandingPage />}
    </>
  );
}

export default HomePage;
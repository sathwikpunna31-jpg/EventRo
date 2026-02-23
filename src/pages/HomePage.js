import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import PublicLandingPage from '../components/PublicLandingPage';
import LoggedInHomePage from '../components/LoggedInHomePage';
// import Loader from '../components/Loader'; // <-- This was unused

function HomePage() {
  const { user } = useContext(AuthContext);
  
  return (
    <>
      {user ? <LoggedInHomePage /> : <PublicLandingPage />}
    </>
  );
}

export default HomePage;
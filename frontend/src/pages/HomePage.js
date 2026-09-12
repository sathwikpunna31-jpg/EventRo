import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import PublicLandingPage from '../components/PublicLandingPage';

function HomePage() {
  const { user } = useContext(AuthContext);

  if (user) {
    const role = user.role ? user.role.toLowerCase() : 'student';

    if (role === 'superadmin') {
      return <Navigate to="/superadmin/dashboard" replace />;
    }

    if (role === 'collegeadmin') {
      return <Navigate to="/admin/home" replace />;
    }

    if (role === 'clubcoordinator') {
      return <Navigate to="/coordinator/dashboard" replace />;
    }

    return <Navigate to="/student/home" replace />;
  }

  return <PublicLandingPage />;
}

export default HomePage;

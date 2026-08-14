import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function StudentRoute() {
  const { user } = useContext(AuthContext); // Get user from context

  // Check if user is logged in AND is a student
  const isStudent = user && user.role === 'student';

  // --- ADD THIS LOG ---
  // This will show us the user data StudentRoute sees
  console.log("StudentRoute Check:", { user, isStudent });
  // --------------------

  // If they are a student, render the child route (Outlet).
  // Otherwise, redirect to the homepage.
  return isStudent ? <Outlet /> : <Navigate to="/" replace />;
}

export default StudentRoute;
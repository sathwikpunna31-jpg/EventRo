import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function AdminRoute() {
  const { user } = useContext(AuthContext);

  // Check if user is logged in and is a collegeAdmin
  const isAdmin = user && user.role === 'collegeAdmin';

  // If they are an admin, render the child route (using Outlet).
  // If not, redirect them to the homepage.
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}

export default AdminRoute;
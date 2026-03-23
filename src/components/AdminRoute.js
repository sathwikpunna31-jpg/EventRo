import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function AdminRoute() {
  const { user } = useContext(AuthContext);

  // Check if user is logged in and is a collegeAdmin OR clubCoordinator
  const isAdminOrCoordinator = user && (user.role === 'collegeAdmin' || user.role === 'clubCoordinator');

  // If they are authorized, render the child route (using Outlet).
  // If not, redirect them to the homepage.
  return isAdminOrCoordinator ? <Outlet /> : <Navigate to="/" replace />;
}

export default AdminRoute;
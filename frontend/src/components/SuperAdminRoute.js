import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function SuperAdminRoute() {
  const { user } = useContext(AuthContext);

  const isSuperAdmin = user && user.role === 'superAdmin';

  return isSuperAdmin ? <Outlet /> : <Navigate to="/" replace />;
}

export default SuperAdminRoute;

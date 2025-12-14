import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but wrong role - redirect to appropriate dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    switch (userRole) {
      case 'Admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'Owner':
        return <Navigate to="/owner/dashboard" replace />;
      case 'Peternak':
        return <Navigate to="/peternak/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // Authorized - render protected content
  return children;
};

export default ProtectedRoute;

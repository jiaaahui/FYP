import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Component to protect routes that require authentication
function ProtectedRoute() {
  const { currentUser } = useAuth();
  
  // If the user is not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Otherwise, render the child routes
  return <Outlet />;
}

export default ProtectedRoute;
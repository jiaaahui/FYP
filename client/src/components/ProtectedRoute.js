import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute
 * - Renders children only when AuthContext finished restoring session and permissions.
 * - If not authenticated, redirects to /login.
 * - While loading, shows a simple loading placeholder (you can replace with a spinner).
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, loadingPermissions } = useAuth();

  // Wait for initial restore to finish
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-600">Restoring session...</div>
      </div>
    );
  }

  // If authenticated but permissions are still loading, show loading state
  if (isAuthenticated() && loadingPermissions) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-600">Loading permissions...</div>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated and ready -> render protected children
  return children;
}
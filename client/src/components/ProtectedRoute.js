import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles = [] }) {
  // Get authentication and role from sessionStorage directly
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  const employeeRole = sessionStorage.getItem('employeeRole');
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has allowed role
  if (allowedRoles.length > 0) {
    const normalizedUserRole = employeeRole ? employeeRole.toLowerCase().trim() : null;
    
    // Normalize allowed roles for comparison
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase().trim());
    
    const hasAccess = normalizedAllowedRoles.includes(normalizedUserRole);
    
    if (!hasAccess) {
      return <Navigate to="/login" replace />;
    }
  }
  return children;
}

export default ProtectedRoute;

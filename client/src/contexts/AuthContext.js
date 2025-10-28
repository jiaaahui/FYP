import React, { useContext, useState, useEffect, createContext } from 'react';

// Create auth context
const AuthContext = createContext();

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Auth provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = () => {
    return sessionStorage.getItem('isAuthenticated') === 'true';
  };

  // Get employee role
  const getEmployeeRole = () => {
    if (employeeData && employeeData.role) {
      return employeeData.role.toLowerCase().trim();
    }
    
    const storedRole = sessionStorage.getItem('employeeRole');
    return storedRole ? storedRole.toLowerCase().trim() : null;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    const currentRole = getEmployeeRole();
    return currentRole === role.toLowerCase().trim();
  };

  // Logout function
  const logout = () => {
    // Clear employee data from state
    setEmployeeData(null);
    setCurrentUser(null);
    
    // Clear sessionStorage
    sessionStorage.removeItem('employeeData');
    sessionStorage.removeItem('employeeRole');
    sessionStorage.removeItem('employeeId');
    sessionStorage.removeItem('employeeName');
    sessionStorage.removeItem('employeeEmail');
    sessionStorage.removeItem('isAuthenticated');
    
    console.log('User logged out successfully');
  };

  // Restore session on mount
  useEffect(() => {
    const storedEmployeeData = sessionStorage.getItem('employeeData');
    const isAuth = sessionStorage.getItem('isAuthenticated');
    
    if (storedEmployeeData && isAuth === 'true') {
      try {
        const parsedData = JSON.parse(storedEmployeeData);
        setEmployeeData(parsedData);
        setCurrentUser({
          email: parsedData.email,
          name: parsedData.name,
          role: parsedData.role,
          employeeId: parsedData.EmployeeID
        });
        console.log('Session restored for:', parsedData.email);
      } catch (err) {
        console.error('Error parsing stored employee data:', err);
        // Clear invalid session data
        logout();
      }
    }
    
    setLoading(false);
  }, []);

  // Context value
  const value = {
    currentUser,
    employeeData,
    isAuthenticated,
    logout,
    getEmployeeRole,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

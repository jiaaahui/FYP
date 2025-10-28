import React, { useContext, useState, useEffect, createContext } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Create context
const AuthContext = createContext();

// Custom hook for consuming context
export function useAuth() {
  return useContext(AuthContext);
}

// Helper to normalize strings
const normalize = (s) => (s || '').toString().toLowerCase().trim();

/**
 * Fetch permissions for a given role.
 * Tries:
 *  1. Roles/{roleId}
 *  2. Roles collection where 'name' matches
 */
async function fetchPermissionsForRole(roleRaw) {
  if (!roleRaw) return [];

  const roleId = normalize(roleRaw);
  try {
    // Direct lookup by doc ID
    const roleRef = doc(db, 'Roles', roleId);
    const snap = await getDoc(roleRef);
    if (snap.exists()) {
      const data = snap.data();
      return Array.isArray(data.permissions)
        ? data.permissions.map(normalize)
        : [];
    }

    // Otherwise, search by name
    const rolesCol = collection(db, 'Roles');
    const rolesSnap = await getDocs(rolesCol);
    for (const d of rolesSnap.docs) {
      const data = d.data() || {};
      const name = normalize(data.name || '');
      const id = normalize(d.id);
      if (name === roleId || id === roleId) {
        return Array.isArray(data.permissions)
          ? data.permissions.map(normalize)
          : [];
      }
    }
  } catch (err) {
    console.warn('fetchPermissionsForRole error:', err);
  }
  return [];
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  // Check authentication
  const isAuthenticated = () =>
    sessionStorage.getItem('isAuthenticated') === 'true';

  // Role helpers
  const getEmployeeRole = () => {
    const role =
      employeeData?.role ||
      sessionStorage.getItem('employeeRole') ||
      '';
    return normalize(role);
  };

  const hasRole = (role) => getEmployeeRole() === normalize(role);

  const hasPermission = (permissionName) =>
    permissions.includes(normalize(permissionName));

  // Login handler
  const signIn = async (empData) => {
    if (!empData) return;

    const roleNorm = normalize(empData.role);
    const userObj = {
      email: empData.email,
      name: empData.name || empData.displayName || '',
      role: empData.role || '',
      employeeId: empData.EmployeeID || empData.id || '',
    };

    // Save locally
    setCurrentUser(userObj);
    setEmployeeData(empData);

    // Save session
    try {
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('employeeData', JSON.stringify(empData));
      sessionStorage.setItem('employeeRole', empData.role || '');
      sessionStorage.setItem('employeeId', userObj.employeeId);
      sessionStorage.setItem('employeeName', userObj.name);
      sessionStorage.setItem('employeeEmail', userObj.email);
    } catch (err) {
      console.warn('Failed to persist sessionStorage', err);
    }

    // Fetch permissions
    setLoadingPermissions(true);
    try {
      const perms = await fetchPermissionsForRole(roleNorm);
      setPermissions(perms);
      sessionStorage.setItem('employeePermissions', JSON.stringify(perms));
    } catch (err) {
      console.warn('Failed to load permissions for role:', err);
      setPermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    setEmployeeData(null);
    setPermissions([]);
    setLoadingPermissions(false);

    sessionStorage.clear();
    console.log('🔒 Logged out successfully');
  };

  // Restore session
  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      setLoading(true);
      try {
        const storedData = sessionStorage.getItem('employeeData');
        const isAuth = sessionStorage.getItem('isAuthenticated');

        if (storedData && isAuth === 'true') {
          const parsed = JSON.parse(storedData);
          if (!mounted) return;

          setEmployeeData(parsed);
          setCurrentUser({
            email: parsed.email,
            name: parsed.name || '',
            role: parsed.role || '',
            employeeId: parsed.EmployeeID || parsed.id || '',
          });

          const storedPerms = sessionStorage.getItem('employeePermissions');
          if (storedPerms) {
            const parsedPerms = JSON.parse(storedPerms);
            setPermissions(parsedPerms.map(normalize));
            setLoadingPermissions(false);
          } else {
            setLoadingPermissions(true);
            const perms = await fetchPermissionsForRole(parsed.role);
            if (!mounted) return;
            setPermissions(perms);
            sessionStorage.setItem('employeePermissions', JSON.stringify(perms));
            setLoadingPermissions(false);
          }

          console.log('✅ Session restored for', parsed.email);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session restore failed:', err);
        logout();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    restoreSession();
    return () => {
      mounted = false;
    };
  }, []);

  const value = {
    currentUser,
    employeeData,
    permissions,
    isAuthenticated,
    logout,
    getEmployeeRole,
    hasRole,
    hasPermission,
    signIn,
    loading,
    loadingPermissions,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

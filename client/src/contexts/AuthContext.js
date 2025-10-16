import React, { useContext, useState, useEffect, createContext } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Create auth context
const AuthContext = createContext();

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Auth provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper function to get user-friendly error messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/user-not-found':
        return 'No account found with this email address. Please sign up first.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled. Please contact support.';
      case 'auth/invalid-verification-code':
        return 'Invalid verification code. Please try again.';
      case 'auth/invalid-verification-id':
        return 'Invalid verification ID. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  // Helper function to update user profile in Firestore Employee collection
  const createUserProfile = async (user, additionalData = {}) => {
    if (!user || !user.email) return;

    // Search Employee collection for document with matching email
    const employeeQuery = query(
      collection(db, "Employee"),
      where("email", "==", user.email)
    );
    const querySnapshot = await getDocs(employeeQuery);

    if (!querySnapshot.empty) {
      // Employee exists, update the existing document
      // const employeeDoc = querySnapshot.docs[0];
      // try {
      //   await updateDoc(employeeDoc.ref, {
      //     displayName: user.displayName || "",
      //     email: user.email,
      //     name: user.displayName || "",
      //     bio: "",
      //     ...additionalData,
      //   });
        console.log("Updated existing employee profile:", querySnapshot.docs[0].id);
      // } catch (error) {
      //   console.error("Error updating employee profile:", error);
      // }
    } else {
      // Employee does NOT exist. Do not create new doc unless you want to!
      // Optionally notify or handle pending approval.
      console.warn("No matching Employee record for email:", user.email);
    }
  };

  // Sign up function
  async function signup(email, password, displayName) {
    try {
      setError('');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, { displayName });
      
      // Update profile in Firestore Employee collection if email exists
      await createUserProfile(result.user, { name: displayName });
      
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      alert(errorMessage);
      throw err;
    }
  }

  // Login function with improved error handling
  async function login(email, password) {
    try {
      setError('');
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Update profile in Firestore Employee collection if email exists
      await createUserProfile(result.user);
      
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      alert(errorMessage);
      throw err;
    }
  }

  // Logout function
  async function logout() {
    try {
      setError('');
      return await signOut(auth);
    } catch (err) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      alert(errorMessage);
      throw err;
    }
  }

  // Google sign in
  async function googleSignIn() {
    try {
      setError('');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Update profile in Firestore Employee collection if email exists
      await createUserProfile(result.user);
      
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      alert(errorMessage);
      throw err;
    }
  }

  // Reset password
  async function resetPassword(email) {
    try {
      setError('');
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent! Check your inbox.');
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      alert(errorMessage);
      throw err;
    }
  }

  // Get auth token
  let cachedToken = null;
  let tokenExpiry = null;

  async function getIdToken() {
    if (!currentUser) return null;

    const now = Date.now();
    const isTokenValid = tokenExpiry && now < tokenExpiry;

    if (cachedToken && isTokenValid) {
      return cachedToken;
    }

    try {
      const token = await currentUser.getIdToken(false);
      const decoded = JSON.parse(atob(token.split('.')[1]));
      tokenExpiry = decoded.exp * 1000; // Convert seconds to ms
      cachedToken = token;
      return token;
    } catch (error) {
      console.error('Token fetch failed:', error);
      return null;
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Update profile in Firestore Employee collection if email exists
        await createUserProfile(user);
      }
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Context value
  const value = {
    currentUser,
    error,
    signup,
    login,
    logout,
    googleSignIn,
    resetPassword,
    getIdToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
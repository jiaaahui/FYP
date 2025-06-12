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
import { doc, setDoc, getDoc } from 'firebase/firestore';
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

  // Helper function to create user profile in Firestore
  const createUserProfile = async (user, additionalData = {}) => {
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      const { displayName, email } = user;
      const createdAt = new Date();
      
      try {
        await setDoc(userRef, {
          displayName,
          email,
          name: displayName || '',
          bio: '',
          createdAt,
          ...additionalData
        });
      } catch (error) {
        console.error('Error creating user profile:', error);
      }
    }
  };

  // Sign up function
  async function signup(email, password, displayName) {
    try {
      setError('');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, { displayName });
      
      // Create profile in Firestore
      await createUserProfile(result.user, { name: displayName });
      
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      
      // Show alert for signup errors
      alert(errorMessage);
      
      throw err;
    }
  }

  // Login function with improved error handling
  async function login(email, password) {
    try {
      setError('');
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Ensure profile exists in Firestore (for existing users)
      await createUserProfile(result.user);
      
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      
      // Show alert for login errors
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
      
      // Create profile in Firestore if it doesn't exist
      await createUserProfile(result.user);
      
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      
      // Show alert for Google sign-in errors
      alert(errorMessage);
      
      throw err;
    }
  }

  // Reset password
  async function resetPassword(email) {
    try {
      setError('');
      await sendPasswordResetEmail(auth, email);
      
      // Show success message
      alert('Password reset email sent! Check your inbox.');
      
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      
      // Show alert for password reset errors
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
        // Ensure profile exists when user logs in
        await createUserProfile(user);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    // Clean up subscription
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
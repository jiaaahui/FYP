import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export function useProfileService() {
  const { currentUser } = useAuth();
  
  // Create initial user profile after signup
  const createUserProfile = async (userData) => {
    if (!currentUser) throw new Error('No authenticated user');
    
    const userRef = doc(db, 'users', currentUser.uid);
    
    try {
      // Check if profile already exists
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        throw new Error('User profile already exists');
      }
      
      // Create new profile
      await setDoc(userRef, {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: userData.displayName || currentUser.displayName || '',
        photoURL: currentUser.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...userData
      });
      
      return true;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };
  
  // Get user profile from Firestore
  const getUserProfile = async () => {
    if (!currentUser) throw new Error('No authenticated user');
    
    const userRef = doc(db, 'users', currentUser.uid);
    
    try {
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        // If no profile exists, create one with basic info
        const basicProfile = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || '',
          photoURL: currentUser.photoURL || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(userRef, basicProfile);
        
        return basicProfile;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  };
  
  // Update user profile
  const updateUserProfile = async (profileData) => {
    if (!currentUser) throw new Error('No authenticated user');
    
    const userRef = doc(db, 'users', currentUser.uid);
    
    try {
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };
  
  return {
    createUserProfile,
    getUserProfile,
    updateUserProfile
  };
}
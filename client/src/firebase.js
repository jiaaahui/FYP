import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCrfTC7tuFPNVR8vhGTeObSdGnefas5OiU",
  authDomain: "fyp-logistics.firebaseapp.com",
  projectId: "fyp-logistics",
  storageBucket: "fyp-logistics.firebasestorage.app",
  messagingSenderId: "242757635933",
  appId: "1:242757635933:web:968346d9406fc2919d22b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
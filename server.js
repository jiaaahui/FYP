const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin with service account
// You'll need to download your service account key from Firebase console
// and save it as serviceAccountKey.json in your project root
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project-id.firebaseio.com"
});

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to verify Firebase ID token
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Public route - no authentication needed
app.get('/api/public', (req, res) => {
  res.json({ message: 'This is a public endpoint' });
});

// Protected route - requires authentication
app.get('/api/protected', authenticateUser, (req, res) => {
  res.json({ 
    message: 'This is a protected endpoint', 
    user: req.user
  });
});

// User data route - get user profile data
app.get('/api/user/profile', authenticateUser, async (req, res) => {
  try {
    // Get user from Firestore
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(req.user.uid)
      .get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    res.json({ profile: userDoc.data() });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// Create or update user profile
app.post('/api/user/profile', authenticateUser, async (req, res) => {
  try {
    const { name, bio } = req.body;
    const userId = req.user.uid;
    
    // Save to Firestore
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .set({
        name,
        bio,
        email: req.user.email,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// Admin-only route
app.get('/api/admin', authenticateUser, async (req, res) => {
  try {
    // Check if user has admin custom claim
    if (!req.user.admin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    // Return admin data
    res.json({ message: 'Admin access granted', adminData: { specialAccess: true } });
  } catch (error) {
    console.error('Error in admin endpoint:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper endpoint to set admin role (typically you'd do this in Firebase Console)
// IMPORTANT: In production, this endpoint should be secured or removed
app.post('/api/make-admin', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Only allow existing admins to create new admins
    if (!req.user.admin) {
      return res.status(403).json({ error: 'Forbidden: Only admins can create other admins' });
    }
    
    await admin.auth().setCustomUserClaims(userId, { admin: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error setting admin claim:', error);
    res.status(500).json({ error: 'Server error setting admin claim' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
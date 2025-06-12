import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../services/api';

function Dashboard() {
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '' });
  const { currentUser, logout } = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      try {
        const data = await api.getUserProfile();

        if (isMounted) {
          setProfile(data.profile || data);
          setFormData({
            name: data.profile?.name || data.name || currentUser?.displayName || '',
            bio: data.profile?.bio || data.bio || '',
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        if (isMounted) {
          // If profile doesn't exist, create a basic one
          if (err.message.includes('not found') || err.message.includes('404')) {
            try {
              // Create basic profile
              const basicProfile = {
                name: currentUser?.displayName || '',
                bio: ''
              };
              
              await api.updateUserProfile(basicProfile);
              setProfile(basicProfile);
              setFormData(basicProfile);
              setLoading(false);
            } catch (createError) {
              setError('Error creating profile: ' + createError.message);
              setLoading(false);
            }
          } else {
            setError('Error fetching profile: ' + err.message);
            setLoading(false);
          }
        }
      }
    }

    if (currentUser) {
      fetchProfile();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [currentUser, api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.updateUserProfile(formData);
      setProfile((prev) => ({ ...prev, ...formData }));
      setEditMode(false);
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to log out: ' + err.message);
    }
  };

  const handleViewPublicContent = async () => {
    try {
      const data = await api.getPublicData();
      console.log('Public content:', data);
      alert('Public content loaded - check console');
    } catch (err) {
      setError('Failed to load public content: ' + err.message);
    }
  };

  const handleViewProtectedContent = async () => {
    try {
      const data = await api.getProtectedData();
      console.log('Protected content:', data);
      alert('Protected content loaded - check console');
    } catch (err) {
      setError('Failed to load protected content: ' + err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-outline-danger">
          Log Out
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="dashboard-content">
        <div className="user-profile-card">
          <div className="profile-header">
            <h2>Profile</h2>
            {!editMode && (
              <button onClick={() => setEditMode(true)} className="btn btn-sm btn-primary">
                Edit Profile
              </button>
            )}
          </div>

          {loading ? (
            <p>Loading profile data...</p>
          ) : editMode ? (
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="form-control"
                  rows="4"
                ></textarea>
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-success" disabled={loading}>
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="btn btn-secondary ml-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <p><strong>Email:</strong> {currentUser?.email}</p>
              <p><strong>Name:</strong> {profile?.name || currentUser?.displayName || 'Not set'}</p>
              <p><strong>Bio:</strong> {profile?.bio || 'No bio provided'}</p>
            </div>
          )}
        </div>

        <div className="dashboard-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="btn btn-info mr-2" onClick={handleViewPublicContent}>
              View Public Content
            </button>
            <button className="btn btn-info" onClick={handleViewProtectedContent}>
              View Protected Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
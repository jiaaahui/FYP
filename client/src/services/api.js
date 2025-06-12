import { useAuth } from '../contexts/AuthContext';

// API base URL - adjust this to match your backend URL
const API_BASE_URL = 'http://localhost:5000/api';

// Create a custom hook for using the API with authentication
export function useApi() {
  const { getIdToken } = useAuth();

  // Helper method to fetch with auth token
  const fetchWithAuth = async (endpoint, options = {}) => {
    const token = await getIdToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Add auth token if available
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const config = {
      ...options,
      headers
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      // Handle API errors
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    }
    
    // Handle non-JSON success responses
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    return await response.text();
  };

  // GET request
  const get = (endpoint) => {
    return fetchWithAuth(endpoint, {
      method: 'GET'
    });
  };

  // POST request
  const post = (endpoint, data) => {
    return fetchWithAuth(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  };

  // PUT request
  const put = (endpoint, data) => {
    return fetchWithAuth(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  };

  // DELETE request
  const remove = (endpoint) => {
    return fetchWithAuth(endpoint, {
      method: 'DELETE'
    });
  };

  // API methods for common operations
  const getUserProfile = () => get('/user/profile');
  const updateUserProfile = (profileData) => post('/user/profile', profileData);
  const getPublicData = () => get('/public');
  const getProtectedData = () => get('/protected');

  return {
    get,
    post,
    put,
    remove,
    getUserProfile,
    updateUserProfile,
    getPublicData,
    getProtectedData
  };
}
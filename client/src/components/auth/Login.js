import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);

      // Call the backend login API
      const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      console.log('Email: ', email);

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to sign in');
        return;
      }

      if (!data.success || !data.employee) {
        setError('Invalid response from server');
        return;
      }

      // Store session in context (using sessionStorage)
      await signIn(data.employee);

      console.log('Login: signIn completed; sessionStorage:', {
        isAuthenticated: sessionStorage.getItem('isAuthenticated'),
        permissions: sessionStorage.getItem('employeePermissions')
      });

      // Redirect to main dashboard
      navigate('/', { replace: true });

    } catch (err) {
      console.error('Login Error:', err);
      setError('Failed to sign in: ' + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Employee Login
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your employee email"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Forgot your password?
          </button>
        </div>

        <div className="text-center mt-4 text-gray-500 text-sm">
          For employee access only
        </div>
      </div>
    </div>
  );
}

export default Login;
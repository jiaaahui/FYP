// client/src/components/Login.js
// Modified to use the simplified server login that returns an employee object on success.
// No token usage. On success we persist minimal employee info to localStorage and navigate.

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || ''; // set to e.g. 'http://localhost:3001' if needed

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If an employee is already present in localStorage, assume logged-in and redirect
  useEffect(() => {
    const emp = localStorage.getItem('employee');
    if (emp) {
      navigate('/dashboard');
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      if (res.status === 401) {
        setError('Incorrect email or password.');
        return;
      }
      if (res.status === 400) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Missing email or password.');
        return;
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        setError(text || 'Login failed. Please try again.');
        return;
      }

      const data = await res.json();
      // Expecting { success: true, employee: { ... } }
      if (!data || !data.success || !data.employee) {
        setError('Invalid server response.');
        return;
      }

      // Persist minimal employee info (no token). In production prefer server session/cookie.
      localStorage.setItem('employee', JSON.stringify(data.employee));
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error', err);
      setError('Failed to sign in: ' + (err.message || 'unknown error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Log In</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              autoComplete="username"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control"
            />
          </div>

          <button disabled={loading} type="submit" className="btn btn-primary w-100">
            {loading ? 'Signing in...' : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-3">
          Need an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
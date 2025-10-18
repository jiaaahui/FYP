import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // On mount: check for existing token/session and validate it with the server
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    // validate token with backend; expect 200 if valid
    (async () => {
      try {
        setLoading(true);
        const resp = await fetch('/api/auth/validate', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (resp.ok) {
          // token valid — navigate straight to dashboard
          navigate('/dashboard');
        } else {
          // invalid/expired token — remove it
          localStorage.removeItem('authToken');
        }
      } catch (err) {
        console.warn('Token validation failed', err);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      // POST to server auth endpoint that verifies employee credentials against Employee table
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      if (res.status === 401) {
        setError('Incorrect email or password.');
        return;
      }
      if (res.status === 409) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Conflict: email duplicated');
        return;
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        setError(text || 'Login failed. Please try again.');
        return;
      }

      const data = await res.json();
      // Expecting { token: '...', employee: { ... } }
      if (!data || !data.token) {
        setError('Invalid server response.');
        return;
      }

      // Save token (or session info). In production, prefer secure, httpOnly cookie set by server.
      localStorage.setItem('authToken', data.token);

      // Optionally save minimal user info
      if (data.employee) localStorage.setItem('employee', JSON.stringify(data.employee));

      navigate('/dashboard');
    } catch (err) {
      console.error('Login error', err);
      setError('Failed to sign in: ' + (err.message || 'unknown error'));
    } finally {
      setLoading(false);
    }
  }

  // Trigger password-reset flow via server (server should send reset email or handle policy)
  // async function handlePasswordReset() {
  //   setError('');
  //   if (!email) {
  //     setError('Please enter your email address first.');
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     const res = await fetch('/api/auth/reset-request', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  //       body: JSON.stringify({ email: email.trim() })
  //     });

  //     if (res.ok) {
  //       alert('Password reset initiated. Check your inbox for instructions.');
  //     } else {
  //       const body = await res.json().catch(() => ({}));
  //       setError(body.error || 'Failed to request password reset.');
  //     }
  //   } catch (err) {
  //     console.error('reset error', err);
  //     setError('Failed to reset password: ' + (err.message || 'unknown error'));
  //   } finally {
  //     setLoading(false);
  //   }
  // }

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

          {/* <div className="text-right mb-3">
            <button
              type="button"
              onClick={handlePasswordReset}
              className="btn btn-link p-0"
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div> */}

          <button disabled={loading} type="submit" className="btn btn-primary w-100">
            {loading ? 'Signing in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
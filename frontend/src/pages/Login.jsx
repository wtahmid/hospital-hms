import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useToast } from '../components/Toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'same-origin',
        body: new URLSearchParams({ username, password }).toString(),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.user) {
        login(data.user);
        const role = data.user.role;
        const map = { admin: '/admin', doctor: '/doctor', patient: '/patient' };
        navigate(map[role] || '/admin');
      } else {
        setError(data.error || 'Invalid username or password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-icon">🏥</span>
          <h1>Hospital Management System</h1>
          <p>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin, dr_sarah_chen, patient_raj_mehta"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123, doctor123, patient123"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Sign In</button>
        </form>
        <div className="auth-footer">
          <a href="/register">Create an account</a>
          <div className="demo-credentials">
            <p><strong>Demo accounts:</strong></p>
            <p>Admin: <code>Admin</code> / <code>Admin123</code></p>
            <p>Doctor: <code>Dr</code> / <code>Dr123</code></p>
            <p>Patient: <code>Patient</code> / <code>Patient123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}

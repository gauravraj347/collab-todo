import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/board');
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const API_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : '/api';
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      navigate('/board');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} autoFocus required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
        <div className="auth-link">No account? <Link to="/register">Register</Link></div>
        {error && <div className="auth-error">{error}</div>}
      </form>
    </div>
  );
}

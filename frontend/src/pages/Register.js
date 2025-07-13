import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function Register() {
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
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      // After successful registration, automatically log in the user
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.message || 'Auto-login failed');
      
      // Store token and user info
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('username', loginData.user.username);
      
      // Redirect to board page
      navigate('/board');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} autoFocus required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
        <div className="auth-link">Already have an account? <Link to="/login">Login</Link></div>
        {error && <div className="auth-error">{error}</div>}
      </form>
    </div>
  );
}

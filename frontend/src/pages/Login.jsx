import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to sign in.');
      login(payload);
      navigate('/intelligence');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return <div style={{ maxWidth: 420, margin: '10vh auto' }} className="panel"><form style={{ padding: 20 }} onSubmit={submit}><h2 style={{ color: 'var(--bc-gold)' }}>Login</h2><label className="field"><span>Email</span><input className="input" type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required /></label><label className="field"><span>Password</span><input className="input" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></label>{error && <p role="alert" style={{ color: 'var(--bc-danger)' }}>{error}</p>}<button className="btn" style={{ marginTop: 12, width: '100%' }} type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button><p><Link to="/register">Create an account</Link></p></form></div>;
}

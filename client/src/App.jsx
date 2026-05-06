import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './styles.css';
import AppShell from './platform/AppShell';
import { apiRequest, getSystemHealth } from './services/api';
import { auditEvent } from './services/audit';
import { DEMO_ACCOUNTS, getStoredAuth, ROLES, setStoredAuth } from './services/auth';
import { makeNotice } from './services/notifications';

function Login({ onLogin }) {
  const [role, setRole] = useState('Buyer');
  const [email, setEmail] = useState(DEMO_ACCOUNTS.Buyer.email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS.Buyer.password);
  const [error, setError] = useState('');

  const syncRole = (nextRole) => {
    setRole(nextRole);
    setEmail(DEMO_ACCOUNTS[nextRole].email);
    setPassword(DEMO_ACCOUNTS[nextRole].password);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await apiRequest('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const session = { ...data, user: { ...(data.user || {}), role } };
      setStoredAuth(session);
      await auditEvent('login', { role, email });
      onLogin(session);
    } catch (err) {
      setError(err.message);
    }
  };

  return <main className="content"><section className="card"><h1>BlackCrest Nexus Login</h1><form className="form-grid" onSubmit={submit}>
    <label>Role<select value={role} onChange={(e) => syncRole(e.target.value)}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></label>
    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
    <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
    <button type="submit">Sign in</button>{error && <p>{error}</p>}
  </form></section></main>;
}

export default function App() {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [health, setHealth] = useState('checking');
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    getSystemHealth().then(() => setHealth('healthy')).catch(() => setHealth('degraded'));
  }, []);

  useEffect(() => {
    setNotices((prev) => [...prev.slice(-2), makeNotice(health === 'healthy' ? 'ok' : 'warn', `System status: ${health}`)]);
  }, [health]);

  return <BrowserRouter><Routes>
    <Route path="/login" element={auth ? <Navigate to="/" replace /> : <Login onLogin={setAuth} />} />
    <Route path="/*" element={auth ? <AppShell auth={auth} onLogout={() => setAuth(null)} notices={notices} /> : <Navigate to="/login" replace />} />
  </Routes></BrowserRouter>;
}

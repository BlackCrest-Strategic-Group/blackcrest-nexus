import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../utils/api.js';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, authLoading, login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (location.state?.reason === 'session-expired') {
      setNote('Your secure session expired. Re-authenticate to continue into BlackCrest OS.');
    }
  }, [location.state]);

  if (!authLoading && user) return <Navigate to="/app" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setNote('');

    try {
      const data = await login(form);
      if (data?.authStorage?.startsWith('memory')) {
        setNote('Signed in with temporary in-memory session due to browser storage restrictions.');
      }
      nav('/app', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to sign in. Verify your credentials and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const sendReset = async () => {
    if (!form.email) {
      setError('Enter your email first, then use forgot password.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await authApi.forgotPassword(form.email);
      setNote('If your account exists, we sent a reset link to your email.');
    } catch {
      setNote('If your account exists, we sent a reset link to your email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page command-theme" data-testid="login-page">
      <div className="auth-intel-bg" />
      <div className="auth-card" data-testid="login-card">
        <p className="landing-kicker">BlackCrest OS Access Gateway</p>
        <h1>Secure Command Authentication</h1>
        <p className="auth-subtitle">MFA-ready enterprise sign-in for procurement, supplier, and executive intelligence workflows.</p>

        {error && <div className="auth-alert auth-alert-error">{error}</div>}
        {note && <div className="auth-alert auth-alert-note">{note}</div>}

        <form onSubmit={submit} className="auth-form" data-testid="login-form">
          <label>
            Email
            <input
              type="email"
              data-testid="login-email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              data-testid="login-password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>

          <div className="auth-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
              />
              Remember secure session
            </label>
            <button type="button" className="link-btn" onClick={sendReset} disabled={submitting}>Forgot password?</button>
          </div>

          <button type="submit" className="btn" disabled={submitting} data-testid="login-submit">{submitting ? 'Authenticating…' : 'Access Platform'}</button>
        </form>

        <p className="auth-footer">Need an account? <Link to="/register">Request enterprise access</Link></p>
      </div>
    </main>
  );
}

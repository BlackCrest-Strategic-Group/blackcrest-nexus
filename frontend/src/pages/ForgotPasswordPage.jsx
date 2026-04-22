import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../utils/api';
import SeoHead from '../components/SeoHead';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      await authApi.forgotPassword(email);
      setStatus('If the account exists, a reset email has been sent.');
    } catch {
      setStatus('If the account exists, a reset email has been sent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <SeoHead title="Forgot Password | BlackCrest OS" description="Recover access to your BlackCrest OS workspace securely." canonicalPath="/forgot-password" />
      <section className="auth-card">
        <h1>Recover Access</h1>
        <p className="auth-subtitle">Enter your work email and we’ll send secure password reset instructions.</p>
        {status && <div className="auth-alert auth-alert-note">{status}</div>}
        <form className="auth-form" onSubmit={submit}>
          <label>Work Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</button>
        </form>
        <p className="auth-footer"><Link to="/login">Back to sign in</Link></p>
      </section>
    </main>
  );
}

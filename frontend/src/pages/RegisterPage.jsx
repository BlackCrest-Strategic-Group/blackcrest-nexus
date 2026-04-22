import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const nav = useNavigate();
  const { user, authLoading, register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', role: '', procurementFocus: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!authLoading && user) return <Navigate to="/app" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await register({ ...form, marketType: 'mixed', categoriesOfInterest: [] });
      nav('/app', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create account right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card auth-card-wide">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Set up access to BlackCrest Procurement Intelligence.</p>
        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        <form className="auth-form" onSubmit={submit}>
          {['name', 'email', 'password', 'company', 'role', 'procurementFocus'].map((k) => (
            <label key={k}>
              {k}
              <input
                type={k === 'password' ? 'password' : k === 'email' ? 'email' : 'text'}
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                required={['name', 'email', 'password'].includes(k)}
              />
            </label>
          ))}
          <button className="btn" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create Account'}</button>
        </form>

        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </main>
  );
}

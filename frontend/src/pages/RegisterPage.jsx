import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const fieldLabels = {
  name: 'Full name',
  email: 'Work email',
  password: 'Password',
  company: 'Organization',
  role: 'Role',
  procurementFocus: 'Primary procurement focus'
};

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
      setError(err.response?.data?.error || err.message || 'Unable to create account right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page command-theme" data-testid="register-page">
      <div className="auth-intel-bg" />
      <div className="auth-card auth-card-wide">
        <p className="landing-kicker">BlackCrest OS Onboarding</p>
        <h1>Request Enterprise Platform Access</h1>
        <p className="auth-subtitle">Provision your secure workspace for procurement intelligence, Sentinel monitoring, and executive briefings.</p>
        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        <form className="auth-form" onSubmit={submit}>
          {Object.keys(fieldLabels).map((k) => (
            <label key={k}>
              {fieldLabels[k]}
              <input
                type={k === 'password' ? 'password' : k === 'email' ? 'email' : 'text'}
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                required={['name', 'email', 'password'].includes(k)}
              />
            </label>
          ))}
          <button className="btn" type="submit" disabled={submitting}>{submitting ? 'Provisioning access…' : 'Create Account'}</button>
        </form>

        <p className="auth-footer">Already provisioned? <Link to="/login">Sign in</Link></p>
      </div>
    </main>
  );
}

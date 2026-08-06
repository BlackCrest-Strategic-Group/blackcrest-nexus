import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to create account.');
      login(payload);
      navigate('/intelligence');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return <div style={{ maxWidth: 420, margin: '10vh auto' }} className="panel"><form style={{ padding: 20 }} onSubmit={submit}><h2 style={{ color: 'var(--bc-gold)' }}>Create account</h2><label className="field"><span>Name</span><input className="input" name="name" autoComplete="name" value={form.name} onChange={update} required /></label><label className="field"><span>Email</span><input className="input" name="email" type="email" autoComplete="email" value={form.email} onChange={update} required /></label><label className="field"><span>Password</span><input className="input" name="password" type="password" minLength="8" autoComplete="new-password" value={form.password} onChange={update} required /></label>{error && <p role="alert" style={{ color: 'var(--bc-danger)' }}>{error}</p>}<button className="btn" style={{ marginTop: 12, width: '100%' }} type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button><p><Link to="/login">Back to login</Link></p></form></div>;
}

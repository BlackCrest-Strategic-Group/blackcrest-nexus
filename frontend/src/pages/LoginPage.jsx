import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeoHead from '../components/SeoHead';

export default function LoginPage() {
  const { user, authLoading, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authLoading && user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(form);
      if (data?.mfaRequired) {
        navigate('/mfa-setup', { replace: true });
        return;
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  return <main className="auth-page"><SeoHead title="Sign in | BlackCrest OS" description="Secure enterprise sign-in." canonicalPath="/login" />
    <section className="auth-card"><h1>Secure Sign In</h1><p className="auth-subtitle">Access BlackCrest OS procurement intelligence workspace.</p>{error && <div className="auth-alert auth-alert-error">{error}</div>}
      <form className="auth-form" onSubmit={onSubmit}><label>Email<input type="email" required value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/></label><label>Password<input type="password" required value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})}/></label><label className="checkbox-label"><input type="checkbox" checked={form.rememberMe} onChange={(e)=>setForm({...form,rememberMe:e.target.checked})}/>Remember secure session</label><button className="btn" type="submit" disabled={loading}>{loading?'Signing in…':'Launch Platform'}</button></form>
      <p className="auth-footer"><Link to="/forgot-password">Forgot password?</Link> · <Link to="/register">Create account</Link></p>
    </section>
  </main>;
}

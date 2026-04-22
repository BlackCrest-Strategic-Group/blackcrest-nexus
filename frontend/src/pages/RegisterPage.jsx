import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeoHead from '../components/SeoHead';

export default function RegisterPage() {
  const { user, authLoading, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', role: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authLoading && user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({ ...form, marketType: 'mixed', categoriesOfInterest: [] });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to register.');
    } finally {
      setLoading(false);
    }
  };

  return <main className="auth-page"><SeoHead title="Register | BlackCrest OS" description="Create enterprise access." canonicalPath="/register" />
    <section className="auth-card"><h1>Request Enterprise Access</h1><p className="auth-subtitle">Provision your secure workspace.</p>{error && <div className="auth-alert auth-alert-error">{error}</div>}
      <form className="auth-form" onSubmit={onSubmit}>{['name','email','password','company','role'].map((k)=><label key={k}>{k}<input type={k==='email'?'email':k==='password'?'password':'text'} value={form[k]} onChange={(e)=>setForm({...form,[k]:e.target.value})} required={['name','email','password'].includes(k)} /></label>)}<button className="btn" type="submit" disabled={loading}>{loading?'Creating…':'Create Account'}</button></form>
      <p className="auth-footer"><Link to="/login">Already have access?</Link></p>
    </section>
  </main>;
}

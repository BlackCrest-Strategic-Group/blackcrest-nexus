import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = async (e) => {
    e.preventDefault();
    await login(form);
    nav('/dashboard');
  };

  return <form className="form card auth" onSubmit={submit}><h2>Log In</h2><input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} /><input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} /><button className="btn">Log In</button><Link to="/register">Create account</Link></form>;
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const nav = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', role: '', procurementFocus: '', categoriesOfInterest: '', marketType: 'mixed' });
  const onChange = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    await register({ ...form, categoriesOfInterest: form.categoriesOfInterest.split(',').map((x) => x.trim()).filter(Boolean) });
    nav('/dashboard');
  };

  return <form className="form card auth" onSubmit={submit}><h2>Create Account</h2>{['name','email','password','company','role','procurementFocus','categoriesOfInterest'].map((k) => <input key={k} type={k==='password'?'password':'text'} placeholder={k} onChange={(e)=>onChange(k,e.target.value)} />)}<select onChange={(e)=>onChange('marketType',e.target.value)}><option value="mixed">Mixed</option><option value="federal">Federal</option><option value="commercial">Commercial</option></select><button className="btn">Sign Up</button></form>;
}

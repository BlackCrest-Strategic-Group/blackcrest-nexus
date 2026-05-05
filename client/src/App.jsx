import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Nexus from './pages/Nexus';
import { auth } from './lib/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [email, setEmail] = useState('demo@blackcrest.com');
  const [password, setPassword] = useState('password123');

  const onAuth = async (path) => {
    const data = await auth(path, { email, password });
    if (data?.token) {
      setToken(data.token);
      localStorage.setItem('token', data.token);
    }
  };

  return (
    <div className="app">
      <Navbar />
      <section className="auth">
        <input value={email} onChange={(e) => setEmail(e.target.value)} aria-label="email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="password" />
        <button onClick={() => onAuth('register')}>Register</button>
        <button onClick={() => onAuth('login')}>Login</button>
        <span>{token ? 'Authenticated' : 'Not logged in'}</span>
      </section>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/nexus" element={<Nexus token={token} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

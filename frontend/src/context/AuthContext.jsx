import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('bc_token');
    if (token) {
      api.get('/profile').then((res) => setUser(res.data.user)).catch(() => localStorage.removeItem('bc_token'));
    }
  }, []);

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    localStorage.setItem('bc_token', data.token);
    setUser(data.user);
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('bc_token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('bc_token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, setUser, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

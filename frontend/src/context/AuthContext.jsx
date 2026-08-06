import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();
const readStored = key => {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
};

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStored('user'));
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = ({ user: nextUser, token: nextToken }) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem('user', JSON.stringify(nextUser));
    localStorage.setItem('token', nextToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return <AuthContext.Provider value={{ user, token, login, logout, isAuthed: Boolean(user && token) }}>{children}</AuthContext.Provider>;
}

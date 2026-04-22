import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { authApi } from '../utils/api.js';
import { clearAuth, getToken, saveAuth } from '../utils/auth.js';

const AuthContext = createContext(null);
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    const activityHandler = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener('click', activityHandler);
    window.addEventListener('keydown', activityHandler);

    const timer = setInterval(() => {
      if (user && Date.now() - lastActivityRef.current > SESSION_TIMEOUT_MS) {
        clearAuth();
        setUser(null);
      }
    }, 30000);

    return () => {
      window.removeEventListener('click', activityHandler);
      window.removeEventListener('keydown', activityHandler);
      clearInterval(timer);
    };
  }, [user]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = getToken();
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const { data } = await authApi.profile();
        if (mounted) setUser(data.user || null);
      } catch {
        clearAuth();
        if (mounted) setUser(null);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const login = async (payload) => {
    const { data } = await authApi.login(payload);
    if (data?.accessToken || data?.token) {
      saveAuth({ accessToken: data.accessToken || data.token, refreshToken: data.refreshToken, user: data.user }, !!payload?.rememberMe);
      setUser(data.user || null);
      lastActivityRef.current = Date.now();
    }
    return data;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    if (data?.accessToken || data?.token) {
      saveAuth({ accessToken: data.accessToken || data.token, refreshToken: data.refreshToken, user: data.user }, true);
      setUser(data.user || null);
      lastActivityRef.current = Date.now();
    }
    return data;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    setUser(null);
  };

  const value = useMemo(() => ({ user, authLoading, login, register, logout }), [user, authLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext) || {};

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../utils/api.js';
import { clearAuth, getToken, saveAuth } from '../utils/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrapAuth() {
      const token = getToken();
      if (!token) {
        if (mounted) setAuthLoading(false);
        return;
      }

      try {
        const { data } = await authApi.profile();
        if (mounted) setUser(data.user);
      } catch {
        clearAuth();
        if (mounted) setUser(null);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    }

    bootstrapAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (payload) => {
    const { data } = await authApi.login(payload);
    if (data?.accessToken || data?.token) {
      const persistence = saveAuth(
        {
          accessToken: data.accessToken || data.token,
          refreshToken: data.refreshToken,
          user: data.user
        },
        !!payload?.rememberMe
      );
      data.authStorage = persistence.storage;
      setUser(data.user || null);
    }
    return data;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    if (data?.accessToken || data?.token) {
      const persistence = saveAuth(
        {
          accessToken: data.accessToken || data.token,
          refreshToken: data.refreshToken,
          user: data.user
        },
        false
      );
      data.authStorage = persistence.storage;
      setUser(data.user || null);
    }
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // no-op: client-side logout must always complete
    } finally {
      clearAuth();
      setUser(null);
    }
  };

  const value = useMemo(() => ({ user, setUser, authLoading, login, register, logout }), [user, authLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext) || {};

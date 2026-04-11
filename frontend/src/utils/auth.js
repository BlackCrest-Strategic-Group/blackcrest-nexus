export const TOKEN_KEY = "govcon_access_token";
const REFRESH_KEY = "govcon_refresh_token";
const USER_KEY = "govcon_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY) || sessionStorage.getItem(REFRESH_KEY);
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuth({ accessToken, refreshToken, user }, remember = false) {
  if (!accessToken) {
    console.warn("saveAuth: accessToken is missing — skipping storage write");
    return false;
  }

  const preferredStore = remember ? localStorage : sessionStorage;
  const fallbackStore = remember ? sessionStorage : localStorage;

  try {
    preferredStore.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) preferredStore.setItem(REFRESH_KEY, refreshToken);
    if (user) preferredStore.setItem(USER_KEY, JSON.stringify(user));
    return true;
  } catch (err) {
    console.warn("saveAuth: preferred storage unavailable, trying fallback storage", err);
    try {
      fallbackStore.setItem(TOKEN_KEY, accessToken);
      if (refreshToken) fallbackStore.setItem(REFRESH_KEY, refreshToken);
      if (user) fallbackStore.setItem(USER_KEY, JSON.stringify(user));
      return true;
    } catch (fallbackErr) {
      console.error("saveAuth: failed to persist auth state", fallbackErr);
      return false;
    }
  }
}

export function clearAuth() {
  [localStorage, sessionStorage].forEach((s) => {
    s.removeItem(TOKEN_KEY);
    s.removeItem(REFRESH_KEY);
    s.removeItem(USER_KEY);
  });
}

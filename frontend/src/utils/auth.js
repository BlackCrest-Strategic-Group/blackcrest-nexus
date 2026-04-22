export const TOKEN_KEY = "govcon_access_token";
const REFRESH_KEY = "govcon_refresh_token";
const USER_KEY = "govcon_user";

const memoryStore = new Map();

function canUseStorage(storage) {
  try {
    const probeKey = "__govcon_storage_probe__";
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

function resolveStorage() {
  const localAvailable = typeof window !== "undefined" && canUseStorage(window.localStorage);
  const sessionAvailable = typeof window !== "undefined" && canUseStorage(window.sessionStorage);

  return {
    local: localAvailable ? window.localStorage : null,
    session: sessionAvailable ? window.sessionStorage : null,
    localAvailable,
    sessionAvailable
  };
}

function readFirstAvailable(key) {
  const { local, session } = resolveStorage();
  return local?.getItem(key) || session?.getItem(key) || memoryStore.get(key) || null;
}

export function getToken() {
  return readFirstAvailable(TOKEN_KEY);
}

export function getRefreshToken() {
  return readFirstAvailable(REFRESH_KEY);
}

export function getUser() {
  try {
    const raw = readFirstAvailable(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuth({ accessToken, refreshToken, user }, remember = false) {
  if (!accessToken) return { persisted: false, storage: "none" };

  const { local, session, localAvailable, sessionAvailable } = resolveStorage();
  const preferredStore = remember ? local : session;
  const fallbackStore = remember ? session : local;

  const writeToStore = (store) => {
    store.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) store.setItem(REFRESH_KEY, refreshToken);
    if (user) store.setItem(USER_KEY, JSON.stringify(user));
  };

  try {
    if (preferredStore) {
      writeToStore(preferredStore);
      memoryStore.clear();
      return { persisted: true, storage: remember ? "local" : "session" };
    }

    if (fallbackStore) {
      writeToStore(fallbackStore);
      memoryStore.clear();
      return { persisted: true, storage: remember ? "session" : "local" };
    }
  } catch {
    // fall back to next persistence option below
  }

  memoryStore.set(TOKEN_KEY, accessToken);
  if (refreshToken) memoryStore.set(REFRESH_KEY, refreshToken);
  if (user) memoryStore.set(USER_KEY, JSON.stringify(user));

  const storageHint = !localAvailable && !sessionAvailable ? "memory" : "memory-fallback";
  return { persisted: false, storage: storageHint };
}

export function clearAuth() {
  const { local, session } = resolveStorage();
  [local, session].forEach((s) => {
    if (!s) return;
    s.removeItem(TOKEN_KEY);
    s.removeItem(REFRESH_KEY);
    s.removeItem(USER_KEY);
  });

  memoryStore.clear();
}

export function getPersistencePreference() {
  const { local, session } = resolveStorage();
  if (local?.getItem(TOKEN_KEY)) return "local";
  if (session?.getItem(TOKEN_KEY)) return "session";
  if (memoryStore.has(TOKEN_KEY)) return "memory";
  return "none";
}

export const storage = {
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  get: (k, fallback = null) => {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  }
};

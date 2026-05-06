const KEY = 'bc-auth';

export const ROLES = ['Admin', 'Executive', 'Buyer', 'Supplier', 'Auditor'];

export const DEMO_ACCOUNTS = {
  Admin: { email: 'admin@blackcrest.ai', password: 'password123' },
  Executive: { email: 'executive@blackcrest.ai', password: 'password123' },
  Buyer: { email: 'buyer@blackcrest.ai', password: 'password123' },
  Supplier: { email: 'supplier@blackcrest.ai', password: 'password123' },
  Auditor: { email: 'auditor@blackcrest.ai', password: 'password123' }
};

export function getStoredAuth() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setStoredAuth(auth) { localStorage.setItem(KEY, JSON.stringify(auth)); }
export function clearStoredAuth() { localStorage.removeItem(KEY); }

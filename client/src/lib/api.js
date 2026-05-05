const API = '/api';

export async function auth(path, payload) {
  const res = await fetch(`${API}/auth/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return res.json();
}

export async function chat(token, payload) {
  const res = await fetch(`${API}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  return res.json();
}

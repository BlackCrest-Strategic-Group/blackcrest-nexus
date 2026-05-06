export async function apiRequest(path, options = {}) {
  const res = await fetch(path, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || json.message || 'Request failed');
  return json;
}

export async function getSystemHealth() {
  return apiRequest('/api/health');
}

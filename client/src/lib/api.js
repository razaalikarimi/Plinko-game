const devFallback = import.meta.env.DEV ? 'http://localhost:4000' : '';
const API_BASE = (
  import.meta.env.VITE_API_URL ||
  devFallback
).replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const message = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(message.message || 'Request failed');
  }

  return response.json();
}

export function commitRound() {
  return request('/api/rounds/commit', { method: 'POST' });
}

export function startRound(id, payload) {
  return request(`/api/rounds/${id}/start`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function revealRound(id) {
  return request(`/api/rounds/${id}/reveal`, { method: 'POST' });
}

export function getRound(id) {
  return request(`/api/rounds/${id}`);
}

export function verifySeeds(params) {
  const url = new URL('/api/verify', window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return request(url.pathname + url.search, { method: 'GET' });
}


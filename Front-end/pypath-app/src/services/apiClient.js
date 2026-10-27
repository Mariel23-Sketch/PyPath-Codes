/* Starting point for talking to the real backend once one exists.
   NOTHING in the app calls this yet: every screen still uses mock data from src/data through the
   services in src/services (studentStore, studentCatalog, adminDb, pointsStore, ...).

   To connect a backend later:
   1. copy .env.example to .env.local and set VITE_API_BASE_URL
   2. replace the body of the service functions with api.get / api.post calls
      (the pages only import from services/, so they should not need to change)
   3. enforce authentication and authorization on the SERVER – frontend route separation is not security. */
const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const err = new Error(`${method} ${path} failed with ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path)
};

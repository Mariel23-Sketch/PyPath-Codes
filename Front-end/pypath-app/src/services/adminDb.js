/* Admin data store: courses, lessons, videos and activities are shared by the Learning Materials and
   Activities screens. Saved in this browser's localStorage under 'pypath:v2:<name>' (same keys as the
   old site) and seeded from data/adminSeed.js the first time.
   FRONTEND DEMO ONLY. When a backend exists, replace load/save with API calls; the screens only use
   adminDb.get / adminDb.set / useAdminData. */
import { useSyncExternalStore } from 'react';
import { SEEDS } from '../data/adminSeed';

const NS = 'pypath:v2:';
const mem = {};
const listeners = new Set();
let failed = false;

function load(key) {
  if (mem[key]) return mem[key];
  try {
    const raw = localStorage.getItem(NS + key);
    if (raw) { mem[key] = JSON.parse(raw); return mem[key]; }
  } catch { failed = true; }
  mem[key] = SEEDS[key]();
  persist(key);
  return mem[key];
}

function persist(key) {
  try { localStorage.setItem(NS + key, JSON.stringify(mem[key])); return true; } catch { failed = true; return false; }
}

export const adminDb = {
  get: load,
  /* set('courses', nextArray) – replaces and saves; always pass a new array so React re-renders */
  set(key, value) {
    mem[key] = value;
    const ok = persist(key);
    listeners.forEach((fn) => fn());
    return ok;
  },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  reset() {
    Object.keys(mem).forEach((k) => delete mem[k]);
    try { Object.keys(localStorage).filter((k) => k.startsWith(NS)).forEach((k) => localStorage.removeItem(k)); } catch { /* ignore */ }
    listeners.forEach((fn) => fn());
  },
  get failed() { return failed; }
};

/* const courses = useAdminData('courses')  – re-renders when any screen saves that collection */
export function useAdminData(key) {
  return useSyncExternalStore(adminDb.subscribe, () => load(key));
}

export const quizPoints = (a) => a.qs.reduce((s, q) => s + (+q.points || 0), 0);
export const actPoints = (a) => (a.type === 'quiz' ? quizPoints(a) : +a.pts || 0);

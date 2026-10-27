/* Student progress store: points, finished lessons, quiz scores, redeemed rewards.
   Saved in this browser (localStorage 'pypath_student') so every page shows the same numbers.
   FRONTEND DEMO ONLY: localStorage can be edited from the browser console. When a backend exists,
   keep these method names and move the logic behind API calls (points must be validated on the server). */
import { useSyncExternalStore } from 'react';

const KEY = 'pypath_student';
const listeners = new Set();

export const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const DEF = () => ({
  name: 'Juan Dela Cruz', user: 'juan', email: 'juan.delacruz@pypath.ph', phone: '', level: 'Beginner',
  points: 820, streak: 7, rank: 12,
  done: [101, 102, 103, 104, 105],
  quiz: { 1: { pct: 100, ok: 3, total: 3, time: '2:41', picks: [1, 1, 1], date: 'Sep 10, 2026' } },
  ex: { 1: { date: 'Sep 3, 2026' } },
  redeemed: [], read: [], notesRead: false,
  history: [
    { what: 'Completed Python Basics Quiz', pts: 50, date: 'Sep 10, 2026' },
    { what: 'Finished lesson: Types of Operators', pts: 10, date: 'Sep 8, 2026' },
    { what: '7-day learning streak', pts: 35, date: 'Sep 6, 2026' },
    { what: 'Solved exercise: Print Hello, World!', pts: 10, date: 'Sep 3, 2026' }
  ]
});

function load() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { /* ignore */ }
  return Object.assign(DEF(), s || {});
}

let state = load();

function commit(next) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage blocked */ }
  listeners.forEach((fn) => fn());
}

export const studentStore = {
  get: () => state,
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  /* update(draft => { draft.read.push(3); }) – draft is a copy; the saved state is replaced */
  update(mutator) {
    const draft = structuredClone(state);
    mutator(draft);
    commit(draft);
  },
  earn(pts, what) {
    this.update((s) => {
      s.points += pts;
      s.history.unshift({ what, pts, date: today() });
    });
  },
  reset() {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    commit(DEF());
  }
};

/* Re-renders the component whenever the student's data changes. */
export function useStudent() {
  return useSyncExternalStore(studentStore.subscribe, studentStore.get);
}

window.addEventListener('storage', (e) => {
  if (e.key === KEY) { state = load(); listeners.forEach((fn) => fn()); }
});

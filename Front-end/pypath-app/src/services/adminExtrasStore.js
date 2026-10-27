/* In-memory store for the admin Progress / Rewards / Announcements / Profile screens.
   Like the old page, edits last until the page is reloaded (nothing is saved to localStorage here,
   except the points rules which the student points store reads).
   FRONTEND DEMO ONLY – swap for API calls when a backend exists. */
import { useSyncExternalStore } from 'react';
import { EXTRAS_SEED } from '../data/adminExtras';

const RULES_KEY = 'pypath_points_rules';
let data = EXTRAS_SEED();
const listeners = new Set();

export const adminExtras = {
  get: (key) => data[key],
  set(key, value) {
    data = { ...data, [key]: value };
    listeners.forEach((fn) => fn());
  },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  saveRules(rules) {
    this.set('rules', rules);
    try { localStorage.setItem(RULES_KEY, JSON.stringify(rules)); } catch { /* storage blocked */ }
  }
};

export function useExtras(key) {
  return useSyncExternalStore(adminExtras.subscribe, () => data[key]);
}

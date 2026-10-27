/* Student points & rewards ledger (used by the "Student: Points and Reward" admin preview page).

   This is the single place that knows the points rules. The UI only calls the methods below and never
   writes a balance itself:

     pointsStore.balance()               current spendable points (derived from the ledger)
     pointsStore.complete({type,id,...}) award points for a finished activity (once per task)
     pointsStore.dailyCheckIn()          streak bonus, at most once per calendar day
     pointsStore.redeem(rewardId)        validate + deduct + record, atomically
     pointsStore.summary(), .badges(), .rewards(), .history()

   Design notes (kept from the original):
   - The balance is NOT stored. It is the sum of an append-only ledger (earn = +, spend = -).
   - Every award carries a unique key ("lesson:py-3"); a key that already exists is rejected, so
     repeating a task can't pay out twice.
   - redeem() re-reads the saved state, validates everything, then writes once, with a re-entrancy lock.
   - This build is a static front end, so the ledger lives in localStorage, which anyone can edit from
     the browser console. Real enforcement needs a server: keep these method names and rules and move
     them behind an API (inside a DB transaction) when a backend exists. */
import { useSyncExternalStore } from 'react';

const KEY = 'pypath_student_v1';
const RULES_KEY = 'pypath_points_rules'; /* written by the admin "Points rules" form */
const DAY = 86400000;
const PASS_MARK = 70; /* % needed to pass a quiz */

const DEFAULT_RULES = { lesson: 10, quiz: 50, practice: 10, course: 100, streak: 5 };
const BADGES = [
  { id: 'beginner', name: 'Python Beginner', pts: 500, color: 'blue', desc: 'Finish your first module.' },
  { id: 'warrior', name: 'Code Warrior', pts: 750, color: 'yellow', desc: 'Solve 25 practice exercises.' },
  { id: 'loop', name: 'Loop Master', pts: 850, color: 'green', desc: 'Finish the Loops module.' },
  { id: 'quiz', name: 'Quiz Master', pts: 900, color: 'purple', desc: 'Score 90% or higher on five quizzes.' },
  { id: 'consistency', name: 'Consistency', pts: 1000, color: 'red', desc: 'Learn for seven days in a row.' }
];
/* Same items as the admin "Redeemable rewards" list. status: Active | Hidden (hidden = not shown to students) */
const CATALOG = [
  { id: 1, name: 'Python Beginner Badge', cost: 500, stock: 999, status: 'Active', icon: 'award', color: 'blue', desc: 'A digital badge for your profile. Show you have started your Python journey.' },
  { id: 5, name: 'Gold Profile Frame', cost: 200, stock: 999, status: 'Active', icon: 'star', color: 'yellow', desc: 'A shiny gold frame around your profile picture.' },
  { id: 4, name: 'Mascot Sticker Pack', cost: 300, stock: 40, status: 'Active', icon: 'gift', color: 'pink', desc: 'A pack of PyPath mascot stickers.' },
  { id: 2, name: 'Python Master Badge', cost: 1000, stock: 999, status: 'Active', icon: 'award', color: 'purple', desc: 'The master badge for learners who go all the way.' },
  { id: 3, name: 'Python Hoodie', cost: 2000, stock: 24, status: 'Active', icon: 'gift', color: 'green', desc: 'A cozy PyPath hoodie, sent to your school.' }
];
/* Sample activities the student can complete (used by the demo panel and as task ids) */
const ACTIVITIES = [
  { type: 'lesson', id: 'py-21', label: 'Lesson: Functions, Part 2' },
  { type: 'lesson', id: 'py-22', label: 'Lesson: Function Arguments' },
  { type: 'quiz', id: 'q-loops-2', label: 'Quiz: Loops Challenge', needsScore: true },
  { type: 'practice', id: 'ex-26', label: 'Exercise: Reverse a String' },
  { type: 'practice', id: 'ex-27', label: 'Exercise: Count the Vowels' },
  { type: 'course', id: 'c-py-basics', label: 'Course: Python Basics' }
];

const clean = (n) => Math.max(0, Math.floor(+n) || 0);
function rules() {
  let r = {};
  try { r = JSON.parse(localStorage.getItem(RULES_KEY) || '{}') || {}; } catch { /* ignore */ }
  const out = {};
  Object.keys(DEFAULT_RULES).forEach((k) => { out[k] = r[k] == null ? DEFAULT_RULES[k] : clean(r[k]); });
  return out;
}

const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

/* seed data: 970 earned - 500 spent = 470 */
function seed() {
  const now = Date.now();
  const ledger = [];
  const done = {};
  let n = 0;
  let t = now - 45 * DAY;
  const add = (key, type, pts, label) => {
    t += (45 * DAY - 2 * 3600000) / 77 + (n % 5) * 1000; n++;
    ledger.push({ id: `L${n}`, kind: 'earn', key, type, pts, label, ts: Math.min(t, now - 3600000) });
    done[key] = 1;
  };
  for (let i = 1; i <= 20; i++) add(`lesson:py-${i}`, 'lesson', 10, `Completed lesson ${i}`); /* 200 */
  for (let i = 1; i <= 25; i++) add(`practice:ex-${i}`, 'practice', 10, `Completed programming exercise ${i}`); /* 250 */
  for (let i = 1; i <= 6; i++) add(`quiz:q-${i}`, 'quiz', 50, `Passed Python Quiz ${i}`); /* 300 */
  add('course:c-intro', 'course', 100, 'Completed course: Introduction to Python'); /* 100 */
  for (let i = 0; i < 24; i++) add(`streak:old-${i}`, 'streak', 5, 'Daily streak bonus'); /* 120 */
  ledger.sort((a, b) => a.ts - b.ts);
  ledger.push({ id: `L${++n}`, kind: 'spend', key: 'redeem:1', type: 'redeem', pts: -500, label: 'Redeemed: Python Beginner Badge', ts: now - 2 * DAY });
  return {
    v: 1, ledger, done, seq: n,
    redemptions: [{ id: 'R1', rewardId: 1, name: 'Python Beginner Badge', cost: 500, ts: now - 2 * DAY }],
    streak: { days: 7, last: dayKey(now) }
  };
}

/* persistence */
let mem = null;
let version = 0;
const listeners = new Set();
const notify = () => { version++; listeners.forEach((fn) => fn()); };

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const s = JSON.parse(raw); if (s && s.v === 1 && Array.isArray(s.ledger)) return s; }
  } catch { /* ignore */ }
  return mem || (mem = seed());
}
function save(s) {
  mem = s;
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
  notify();
}
window.addEventListener('storage', (e) => { if (e.key === KEY) { mem = null; notify(); } });

const sum = (s, f) => s.ledger.reduce((a, x) => a + (f(x) ? x.pts : 0), 0);
const earned = (s) => sum(s, (x) => x.kind === 'earn');
const spent = (s) => -sum(s, (x) => x.kind === 'spend');
const bal = (s) => earned(s) - spent(s);

function award(s, key, type, pts, label) {
  if (s.done[key]) return false;
  s.done[key] = 1; s.seq++;
  s.ledger.push({ id: `L${s.seq}`, kind: 'earn', key, type, pts, label, ts: Date.now() });
  return true;
}

export const pointsStore = {
  PASS_MARK,
  ACTIVITIES,
  rules,
  balance: () => bal(load()),

  summary() {
    const s = load();
    const e = earned(s);
    const b = BADGES.filter((x) => e >= x.pts);
    const next = BADGES.find((x) => e < x.pts) || null;
    return {
      balance: bal(s), earned: e, spent: spent(s),
      badgesEarned: b.length, badgesTotal: BADGES.length,
      redeemed: s.redemptions.length, streak: s.streak.days,
      streakBonus: rules().streak,
      next: next && { name: next.name, pts: next.pts, have: e }
    };
  },

  badges() { const e = earned(load()); return BADGES.map((b) => ({ ...b, earned: e >= b.pts, have: e })); },

  rewards() {
    const s = load();
    const b = bal(s);
    const mine = {};
    const used = {};
    s.redemptions.forEach((r) => { mine[r.rewardId] = r; used[r.rewardId] = (used[r.rewardId] || 0) + 1; });
    return CATALOG.filter((r) => r.status === 'Active').map((r) => {
      const left = Math.max(0, r.stock - (used[r.id] || 0));
      const status = mine[r.id] ? 'redeemed' : left <= 0 ? 'soldout' : b < r.cost ? 'short' : 'available';
      return { ...r, left, status, need: Math.max(0, r.cost - b) };
    });
  },

  isDone: (type, id) => !!load().done[`${type}:${id}`],

  history() { return load().ledger.slice().sort((a, b) => b.ts - a.ts || (b.id > a.id ? 1 : -1)); },

  /* Award points for finishing something. Safe to call repeatedly: a task pays out once. */
  complete(a) {
    const R = rules();
    const type = a && a.type;
    const id = a && String(a.id || '');
    if (!(type in R) || type === 'streak' || !id) return { ok: false, error: 'Unknown activity.' };
    if (type === 'quiz' && !(+a.score >= PASS_MARK)) return { ok: false, error: `You need at least ${PASS_MARK}% to pass this quiz and earn points.` };
    const s = load();
    const pts = R[type];
    if (!pts) return { ok: false, error: 'This activity is not worth points right now.' };
    const before = bal(s);
    const badgesBefore = BADGES.filter((x) => earned(s) >= x.pts).map((x) => x.id);
    const labels = { lesson: 'Completed a lesson', quiz: 'Passed a quiz', practice: 'Completed a programming exercise', course: 'Completed a course' };
    if (!award(s, `${type}:${id}`, type, pts, a.label || labels[type])) {
      return { ok: false, duplicate: true, error: 'You already earned points for this. Points are awarded once per activity.', balance: before };
    }
    save(s);
    const unlocked = BADGES.filter((x) => earned(s) >= x.pts && !badgesBefore.includes(x.id)).map((x) => x.name);
    return { ok: true, points: pts, balance: bal(s), unlocked };
  },

  /* Once per calendar day. Consecutive days extend the streak, a gap restarts it at 1. */
  dailyCheckIn() {
    const s = load();
    const today = dayKey(Date.now());
    if (s.streak.last === today) return { ok: false, duplicate: true };
    const yesterday = dayKey(Date.now() - DAY);
    s.streak = { days: s.streak.last === yesterday ? s.streak.days + 1 : 1, last: today };
    const pts = rules().streak;
    if (pts) award(s, `streak:${today}`, 'streak', pts, `Daily streak bonus (day ${s.streak.days})`);
    save(s);
    return { ok: true, points: pts, days: s.streak.days };
  },

  /* Validate, deduct, record, in one write. Returns {ok, error?, balance, reward?}. */
  redeem(rewardId) {
    if (pointsStore._lock) return { ok: false, error: 'A redemption is already in progress.' };
    pointsStore._lock = true;
    try {
      const s = load(); /* always the freshest saved state */
      const r = CATALOG.find((x) => x.id === +rewardId);
      if (!r || r.status !== 'Active') return { ok: false, error: 'This reward is not available.' };
      if (s.redemptions.some((x) => x.rewardId === r.id)) return { ok: false, error: 'You have already redeemed this reward.', balance: bal(s) };
      if (s.redemptions.filter((x) => x.rewardId === r.id).length >= r.stock) return { ok: false, error: 'Sorry, this reward is out of stock.', balance: bal(s) };
      const have = bal(s);
      if (!(r.cost > 0) || have < r.cost) return { ok: false, error: `Not enough points. You need ${(r.cost - have).toLocaleString()} more to redeem ${r.name}.`, balance: have };
      s.seq++;
      s.ledger.push({ id: `L${s.seq}`, kind: 'spend', key: `redeem:${r.id}`, type: 'redeem', pts: -r.cost, label: `Redeemed: ${r.name}`, ts: Date.now() });
      s.redemptions.push({ id: `R${s.redemptions.length + 1}`, rewardId: r.id, name: r.name, cost: r.cost, ts: Date.now() });
      save(s);
      return { ok: true, balance: bal(s), reward: r.name, cost: r.cost };
    } finally { pointsStore._lock = false; }
  },

  /* demo helper: wipe back to the sample student */
  reset() { try { localStorage.removeItem(KEY); } catch { /* ignore */ } mem = null; notify(); }
};

/* Re-renders the component whenever the ledger changes. Call pointsStore.* inside render. */
export function usePoints() {
  return useSyncExternalStore((fn) => { listeners.add(fn); return () => listeners.delete(fn); }, () => version);
}

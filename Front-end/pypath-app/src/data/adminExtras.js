/* Sample data for the admin Progress, Rewards, Announcements and Profile screens (mock data, ported from
   the old admin-extras/script.js). FRONTEND DEMO ONLY – replace with API calls when a backend exists. */
export const MODS = ['Introduction to Python', 'Variables and Data Types', 'Operators', 'Conditional Statements', 'Loops', 'Functions'];

/* badge colour name -> tile class */
export const COLOR_TILE = { Blue: 't-blue', Green: 't-green', Purple: 't-purple', Yellow: 't-yellow', Red: 't-red' };

export const EXTRAS_SEED = () => ({
  st: [
    { id: 1, name: 'Jasmine Santos', pct: 80, status: 'In progress', last: 'May 18, 2026', score: 80, correct: 8, time: '6:32' },
    { id: 2, name: 'Marco Rivera', pct: 60, status: 'In progress', last: 'May 17, 2026', score: 70, correct: 7, time: '8:10' },
    { id: 3, name: 'Lian Cruz', pct: 40, status: 'In progress', last: 'May 16, 2026', score: 60, correct: 6, time: '9:45' },
    { id: 4, name: 'Aira Delgado', pct: 20, status: 'Inactive', last: 'Apr 28, 2026', score: 40, correct: 4, time: '11:02' },
    { id: 5, name: 'Noah Reyes', pct: 100, status: 'Completed', last: 'May 15, 2026', score: 95, correct: 9, time: '5:20' },
    { id: 6, name: 'Mika Tan', pct: 100, status: 'Completed', last: 'May 14, 2026', score: 90, correct: 9, time: '6:01' },
    { id: 7, name: 'Eli Cruz', pct: 0, status: 'Not started', last: '—', score: 0, correct: 0, time: '—' }
  ],
  bd: [
    { id: 1, name: 'Python Beginner', pts: 500, color: 'Blue', desc: 'Finish your first module.' },
    { id: 2, name: 'Loop Master', pts: 850, color: 'Green', desc: 'Finish the Loops module.' },
    { id: 3, name: 'Quiz Master', pts: 900, color: 'Purple', desc: 'Score 90% or higher on five quizzes.' },
    { id: 4, name: 'Code Warrior', pts: 750, color: 'Yellow', desc: 'Solve 25 practice exercises.' },
    { id: 5, name: 'Consistency', pts: 1000, color: 'Red', desc: 'Learn for seven days in a row.' }
  ],
  rw: [
    { id: 1, name: 'Python Beginner Badge', cost: 500, stock: 999, status: 'Active' },
    { id: 2, name: 'Python Master Badge', cost: 1000, stock: 999, status: 'Active' },
    { id: 3, name: 'Python Hoodie', cost: 2000, stock: 24, status: 'Active' },
    { id: 4, name: 'Mascot Sticker Pack', cost: 300, stock: 40, status: 'Active' },
    { id: 5, name: 'Gold Profile Frame', cost: 200, stock: 999, status: 'Active' }
  ],
  rules: { lesson: 10, quiz: 50, practice: 10, course: 100, streak: 5 },
  an: [
    { id: 1, title: 'System maintenance on May 20', msg: 'PyPath will be offline from 1:00 to 2:00 AM for upgrades.', aud: 'All students', date: 'May 14, 2026', status: 'Published' },
    { id: 2, title: 'New Python module available', msg: 'Module 3: Operators is now open. Keep going!', aud: 'All students', date: 'May 10, 2026', status: 'Published' },
    { id: 3, title: 'Quiz schedule update', msg: 'Python Quiz 1 is now open for Beginner learners.', aud: 'Beginner', date: 'May 8, 2026', status: 'Published' },
    { id: 4, title: 'Welcome to PyPath!', msg: 'Start with Introduction to Python and earn your first badge.', aud: 'All students', date: 'May 1, 2026', status: 'Published' },
    { id: 5, title: 'Hoodie rewards arrive in June', msg: 'Redeem 2,000 points for the Python Hoodie.', aud: 'All students', date: '—', status: 'Draft' }
  ],
  me: { name: 'Admin User', user: 'admin', email: 'admin@pypath.ph', phone: '', site: 'PyPath - Learn Python', desc: 'Learn Python, Build Your Future.', lang: 'English', tz: 'Asia/Manila', tfa: false, notify: true }
});

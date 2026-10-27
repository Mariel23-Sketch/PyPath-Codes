/* =========================================================
   PyPath Student – MAIN UI SCRIPT (shared by every page)
   Load it in <head> before the page script. Parts:
   1 theme  2 icons  3 picture placeholders  4 shared data
   5 student store  6 UI helpers  7 sidebar / top bar
   ========================================================= */
/* =========================================================
   PART 1: LIGHT / DARK THEME (copied from the admin side)
   ========================================================= */
/* PyPath Admin – light / dark theme (loaded in <head> so the page never flashes the wrong theme)
   Saved choice: localStorage 'pp-theme' = 'Light' | 'Dark' | 'System' (default System) */
window.PP = window.PP || {};
(function (PP) {
  const KEY = 'pp-theme';
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function saved() { try { return localStorage.getItem(KEY) || 'System'; } catch (e) { return 'System'; } }
  function resolve(mode) { return mode === 'Dark' || (mode === 'System' && mq && mq.matches) ? 'dark' : 'light'; }
  function apply(mode) {
    const t = resolve(mode);
    document.documentElement.dataset.theme = t;
    document.documentElement.style.colorScheme = t;
    document.dispatchEvent(new CustomEvent('pp-theme', { detail: { mode: mode, theme: t } }));
  }
  PP.theme = {
    get: saved,
    current: () => resolve(saved()),
    set: function (mode) { try { localStorage.setItem(KEY, mode); } catch (e) {} apply(mode); },
    toggle: function () { this.set(this.current() === 'dark' ? 'Light' : 'Dark'); }
  };
  apply(saved());
  if (mq) {
    const onSys = () => { if (saved() === 'System') apply('System'); };
    if (mq.addEventListener) mq.addEventListener('change', onSys); else if (mq.addListener) mq.addListener(onSys);
  }
  /* keep other open tabs in sync */
  window.addEventListener('storage', (e) => { if (e.key === KEY) apply(saved()); });
})(window.PP);

/* =========================================================
   PART 2: ICONS (copied from the admin side, plus a few for students)
   ========================================================= */
/* PyPath – line icon set (24x24, stroke based). Usage: PP.i('home') */
window.PP = window.PP || {};
(function (PP) {
  const P = {
    flame: '<path d="M12 22c4 0 7-2.7 7-6.8 0-3.9-2.6-6.3-4.2-8.7-.5 2.3-1.7 3.7-3.1 4.2C11.9 7.7 10.6 4.3 8 2c.4 3.5-3 5.8-3 9.9C5 18.6 8 22 12 22z"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    cube: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/>',
    quiz: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h1.5M8 12h1.5M8 16h1.5M12 8h4M12 12h4M12 16h4"/>',
    chart: '<rect x="3" y="11" width="4" height="10" rx="1"/><rect x="10" y="3" width="4" height="18" rx="1"/><rect x="17" y="14" width="4" height="7" rx="1"/>',
    megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a4 4 0 0 1 0 6"/><path d="M18 6.5a8 8 0 0 1 0 11"/>',
    gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    right: '<path d="m9 6 6 6-6 6"/>',
    left: '<path d="m15 6-6 6 6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M17.9 17.9A10.1 10.1 0 0 1 12 19c-6.4 0-10-7-10-7a18 18 0 0 1 5.1-5.9"/><path d="M9.9 4.2A9.1 9.1 0 0 1 12 4c6.4 0 10 7 10 7a18 18 0 0 1-2.2 3.2"/><path d="m1 1 22 22"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    star: '<path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v9H5v-9M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    play: '<path d="M7 4.5v15l13-7.5z" fill="currentColor"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    video: '<rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
    code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5"/>',
    arrowup: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    arrowright: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowleft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    database: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    drive: '<rect x="3" y="14" width="18" height="7" rx="2"/><path d="M5 14 7.5 4.5A2 2 0 0 1 9.4 3h5.2a2 2 0 0 1 1.9 1.5L19 14"/><path d="M7 17.5h.01"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 1-1 1.7"/><path d="M12 17h.01"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 17.5 9 5 9-5" opacity=".0"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    dot: '<circle cx="12" cy="12" r="4" fill="currentColor"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    book2: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M6.5 17H20v4H6.5a2.5 2.5 0 0 1 0-4z"/>'
  };
  const SOCIAL = {
    google: '<svg class="i i-brand" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>',
    facebook: '<svg class="i i-brand" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#1877F2"/><path fill="#fff" d="M13.4 21v-7.2h2.4l.4-2.9h-2.8V9.1c0-.8.3-1.4 1.4-1.4h1.5V5.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.6 1.300-3.6 3.700v2.200H8.100v2.900h2.400V21z"/></svg>',
    apple: '<svg class="i i-brand" viewBox="0 0 24 24"><path fill="#111" d="M16.4 12.6c0-2.300 1.900-3.400 2-3.500-1.100-1.600-2.800-1.800-3.400-1.800-1.400-.1-2.800.9-3.500.9s-1.800-.8-3-.8c-1.500 0-3 .9-3.800 2.300-1.600 2.800-.4 7 1.200 9.300.8 1.100 1.700 2.400 2.900 2.300 1.200 0 1.600-.7 3-.7s1.800.7 3 .7c1.300 0 2.100-1.100 2.800-2.300.9-1.300 1.300-2.500 1.300-2.600-.1 0-2.500-1-2.500-3.800zM14.200 5.700c.6-.8 1.100-1.900.9-3-.9 0-2.100.6-2.700 1.400-.6.700-1.100 1.800-1 2.900 1.100.1 2.100-.5 2.800-1.300z"/></svg>'
  };
  PP.i = function (name, extra) {
    if (SOCIAL[name]) return SOCIAL[name];
    return '<svg class="i ' + (extra || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || P.dot) + '</svg>';
  };
  /* Fill every <span data-icon="name"> in a subtree */
  PP.hydrate = function (root) {
    (root || document).querySelectorAll('[data-icon]').forEach(function (el) {
      if (!el.dataset.done) { el.innerHTML = PP.i(el.dataset.icon); el.dataset.done = '1'; }
    });
  };
})(window.PP);

/* =========================================================
   PART 3: PICTURES AND LOGO (placeholders)
   Put your images in  assets/img/  with these names:
     logo-icon.png, mascot-hands.png, mascot-wave.png, mascot-cheer.png,
     mascot-wink.png, mascot-star.png, mascot-sad.png, avatar.png
   Until a file exists, a dashed placeholder box is shown instead.
   ========================================================= */
(function (PP) {
  PP.IMG = '../assets/img/';
  PP.phSrc = function (label) {
    const t = String(label || 'Image').replace(/[<>&"]/g, '');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="3" y="3" width="114" height="114" rx="18" fill="#eef5ff" stroke="#8fb3e6" stroke-width="3" stroke-dasharray="8 6"/>' +
      '<text x="60" y="66" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="15" font-weight="700" fill="#5b86c4">' + t + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };
  /* <img> helper used by the page scripts:  PP.img('mascot-wave.png', 'my-class', 'Mascot') */
  PP.img = (file, cls, label) => '<img class="' + (cls || '') + '" src="' + PP.IMG + file + '" alt="" data-ph="' + (label || 'Image') + '">';
  /* any missing picture becomes a placeholder box */
  window.addEventListener('error', function (e) {
    const t = e.target;
    if (t && t.tagName === 'IMG' && !t.dataset.phDone) {
      t.dataset.phDone = '1';
      t.classList.add('ph-missing');
      t.src = PP.phSrc(t.dataset.ph || t.alt || 'Image');
    }
  }, true);
})(window.PP);

/* =========================================================
   PART 4: SHARED SAMPLE DATA
   Same courses, quizzes, exercises, rewards and announcements as the admin side
   (only the items the admin has published).
   ========================================================= */
(function (PP) {
  const M = (id, courseId, name, open) => ({ id, courseId, name, open });
  const L = (id, moduleId, title, mins, video, desc) => ({ id, moduleId, title, mins, video, desc });
  const Q = (text, opts, correct) => ({ text, opts, correct });

  const D = PP.DATA = {
    courses: [
      { id: 1, title: 'Python Basics', level: 'Beginner', icon: 'python', tone: 'c-blue', desc: 'Learn the fundamentals of Python programming: syntax, variables, data types, operators, control flow and functions.' },
      { id: 2, title: 'Python Data Structures', level: 'Intermediate', icon: 'layers', tone: 'c-green', desc: 'Work with Python lists, tuples, dictionaries and sets, and learn when to use each one.' },
      { id: 3, title: 'Object-Oriented Python', level: 'Intermediate', icon: 'cube', tone: 'c-orange', desc: 'Model real things in Python with classes, objects, methods and inheritance.' }
    ],
    /* open = published by the admin. Closed modules show as "Coming soon". */
    modules: [
      M(11, 1, 'Introduction to Python', true), M(12, 1, 'Variables and Data Types', true), M(13, 1, 'Operators', true),
      M(14, 1, 'Conditional Statements', true), M(15, 1, 'Loops', true), M(16, 1, 'Functions', false),
      M(17, 1, 'Lists and Tuples', false), M(18, 1, 'Dictionaries and Sets', false), M(19, 1, 'File Handling', false), M(20, 1, 'Error Handling', false),
      M(21, 2, 'Lists in Depth', true), M(22, 2, 'Stacks and Queues', true), M(23, 2, 'Dictionaries in Depth', false), M(24, 2, 'Sets and Hashing', false), M(25, 2, 'Sorting Basics', false),
      M(31, 3, 'Classes and Objects', true), M(32, 3, 'Attributes and Methods', true), M(33, 3, 'Inheritance', false), M(34, 3, 'Polymorphism', false)
    ],
    /* video: a YouTube link, or '' if the admin has not added one yet */
    lectures: [
      L(101, 11, 'What is Python?', 10, 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 'A friendly tour of what Python is and where it is used.'),
      L(102, 11, 'Your First Python Program', 8, '', 'Install Python, open the editor and print your first line of text.'),
      L(103, 12, 'Variables and Naming Rules', 9, '', 'Store values in variables and learn which names Python allows.'),
      L(104, 12, 'Numbers, Strings and Booleans', 12, '', 'Meet the basic data types and convert between them.'),
      L(105, 13, 'Types of Operators', 11, 'https://www.youtube.com/watch?v=v5MR5JnKcZI', 'Arithmetic, comparison and logical operators.'),
      L(106, 13, 'Operator Precedence', 7, '', 'Find out which part of an expression Python works out first.'),
      L(107, 14, 'Writing if Statements', 10, 'https://youtu.be/DZwmZ8Usvnk', 'Make decisions in code with if, elif and else.'),
      L(108, 14, 'Nested Conditions', 8, '', 'Put conditions inside conditions and keep them readable.'),
      L(109, 15, 'for Loops and range()', 12, '', 'Repeat code a set number of times with for and range().'),
      L(110, 15, 'while Loops, break and continue', 11, '', 'Loop until a condition changes, and control the loop from inside.'),
      L(111, 21, 'List Methods', 10, '', 'Add, remove, sort and search items in a list.'),
      L(112, 22, 'Stacks and Queues with Lists', 9, '', 'Use lists as stacks (last in, first out) and queues (first in, first out).'),
      L(113, 31, 'Your First Class', 12, '', 'Write a class, create objects from it and give them data.'),
      L(114, 32, 'Methods and self', 10, '', 'Add behaviour to your objects with methods.')
    ],
    quizzes: [
      { id: 1, title: 'Python Basics Quiz', moduleId: 11, diff: 'Easy', due: 'Oct 24, 2026', qs: [
        Q('What is Python?', ['A web browser', 'A programming language', 'A database', 'An operating system'], 1),
        Q('Which function is used to display output in Python?', ['input()', 'print()', 'display()', 'output()'], 1),
        Q('Which symbol starts a comment in Python?', ['//', '#', '--', '/*'], 1)] },
      { id: 2, title: 'Variables Quiz', moduleId: 12, diff: 'Easy', due: 'Oct 27, 2026', qs: [
        Q('Which is a valid variable name?', ['1name', 'my-var', 'my_var', 'class'], 2),
        Q('What type is the value 3.14?', ['int', 'str', 'float', 'bool'], 2)] },
      { id: 3, title: 'Operators Quiz', moduleId: 13, diff: 'Medium', due: 'Oct 30, 2026', qs: [
        Q('What is 7 // 2?', ['3.5', '3', '4', '2'], 1),
        Q('Which operator checks equality?', ['=', '==', '!=', '=>'], 1),
        Q('What does the % operator return?', ['Percentage', 'Remainder', 'Quotient', 'Power'], 1)] },
      { id: 4, title: 'Loops Quiz', moduleId: 15, diff: 'Hard', due: 'Nov 4, 2026', qs: [
        Q('How many times does range(3) loop?', ['2', '3', '4', 'Forever'], 1),
        Q('Which keyword exits a loop early?', ['stop', 'exit', 'break', 'return'], 2)] }
    ],
    /* type: Coding | Multiple choice | Open answer.  expect = the output a Coding answer must print */
    exercises: [
      { id: 1, title: 'Print Hello, World!', moduleId: 11, type: 'Coding', diff: 'Beginner', pts: 10, due: 'Oct 23, 2026', instr: 'Write a program that displays Hello, Python!', code: '# Write your code below\n', expect: 'Hello, Python!' },
      { id: 2, title: 'Swap Two Variables', moduleId: 12, type: 'Coding', diff: 'Beginner', pts: 15, due: 'Oct 26, 2026', instr: 'Swap the values of a and b without a third variable, then print a and b.', code: 'a, b = 1, 2\n# your code here\n', expect: '2 1' },
      { id: 3, title: 'Pick the Right Operator', moduleId: 13, type: 'Multiple choice', diff: 'Beginner', pts: 10, due: 'Oct 29, 2026', instr: 'Which operator gives the remainder of a division?', opts: ['/', '//', '%', '**'], correct: 2 },
      { id: 4, title: 'Even or Odd', moduleId: 14, type: 'Coding', diff: 'Intermediate', pts: 20, due: 'Nov 2, 2026', instr: 'Read a number and print whether it is even or odd.', code: 'n = int(input())\n' },
      { id: 7, title: 'Fibonacci Generator', moduleId: 15, type: 'Coding', diff: 'Advanced', pts: 40, due: 'Nov 9, 2026', instr: 'Return the first n Fibonacci numbers as a list.', code: 'def fib(n):\n    pass\n' },
      { id: 8, title: 'Explain a Loop', moduleId: 15, type: 'Open answer', diff: 'Intermediate', pts: 15, due: 'Nov 6, 2026', instr: 'In your own words, explain the difference between a for loop and a while loop.' }
    ],
    badges: [
      { id: 1, name: 'Python Beginner', pts: 500, color: 't-blue', desc: 'Finish your first module.' },
      { id: 4, name: 'Code Warrior', pts: 750, color: 't-yellow', desc: 'Solve 25 practice exercises.' },
      { id: 2, name: 'Loop Master', pts: 850, color: 't-green', desc: 'Finish the Loops module.' },
      { id: 3, name: 'Quiz Master', pts: 900, color: 't-purple', desc: 'Score 90% or higher on five quizzes.' },
      { id: 5, name: 'Consistency', pts: 1000, color: 't-red', desc: 'Learn for seven days in a row.' }
    ],
    rewards: [
      { id: 1, name: 'Python Beginner Badge', cost: 500, stock: 999, icon: 'award', tone: 't-blue' },
      { id: 2, name: 'Python Master Badge', cost: 1000, stock: 999, icon: 'trophy', tone: 't-purple' },
      { id: 3, name: 'Python Hoodie', cost: 2000, stock: 24, icon: 'gift', tone: 't-orange' }
    ],
    rules: { lesson: 10, quiz: 50, streak: 5 },
    announcements: [
      { id: 1, title: 'System Maintenance', msg: 'The system will undergo maintenance on September 20, 2026 (Sunday) from 8:00 AM to 12:00 NN. During this time, the platform may be temporarily unavailable.', date: 'Sep 17, 2026', icon: 'megaphone', tone: 'blue' },
      { id: 2, title: 'New Learning Materials Available', msg: 'Additional learning materials for the Python Basics course are now available. Please check the Learning Materials section.', date: 'Sep 15, 2026', icon: 'book', tone: 'green' },
      { id: 3, title: 'Upcoming Quiz', msg: 'There will be a quiz on Python Data Structures on September 22, 2026 (Tuesday). Make sure to review the lessons and practice exercises.', date: 'Sep 14, 2026', icon: 'bell', tone: 'purple' },
      { id: 4, title: 'Points and Rewards Update', msg: 'We are now introducing new rewards! You can redeem exclusive items with your earned points. Check the Points & Rewards section for more details.', date: 'Sep 10, 2026', icon: 'star', tone: 'gold' },
      { id: 5, title: 'Welcome to PyPath!', msg: 'We\'re excited to have you on board! Explore the platform, complete lessons, practice exercises, and start earning points!', date: 'Sep 1, 2026', icon: 'help', tone: 'red' }
    ],
    notes: [
      { t: 'New module available!', s: 'Loops is now open in Python Basics.', ago: '2h ago' },
      { t: 'Quiz completed!', s: 'You earned 50 points.', ago: '5h ago' },
      { t: 'Achievement unlocked!', s: 'You got the Code Warrior badge.', ago: '1d ago' },
      { t: 'System maintenance', s: 'Scheduled for Sep 20, 2026.', ago: '2d ago' }
    ]
  };

  /* ---- lookups used by several pages ---- */
  PP.find = {
    course: (id) => D.courses.find((x) => x.id === +id),
    module: (id) => D.modules.find((x) => x.id === +id),
    lecture: (id) => D.lectures.find((x) => x.id === +id),
    quiz: (id) => D.quizzes.find((x) => x.id === +id),
    exercise: (id) => D.exercises.find((x) => x.id === +id)
  };
  PP.lecturesOf = (moduleId) => D.lectures.filter((l) => l.moduleId === moduleId);
  PP.courseLectures = (courseId) => D.lectures.filter((l) => PP.find.module(l.moduleId).courseId === courseId);
  PP.courseProgress = function (courseId) {
    const ls = PP.courseLectures(courseId), done = ls.filter((l) => PP.store.get().done.includes(l.id)).length;
    return { done, total: ls.length, pct: ls.length ? Math.round((done / ls.length) * 100) : 0 };
  };
  PP.moduleStatus = function (m) {
    if (!m.open) return 'Coming soon';
    const ls = PP.lecturesOf(m.id), d = ls.filter((l) => PP.store.get().done.includes(l.id)).length;
    return ls.length && d === ls.length ? 'Completed' : d ? 'In progress' : 'Not started';
  };
  PP.nextLecture = () => D.lectures.find((l) => PP.find.module(l.moduleId).open && !PP.store.get().done.includes(l.id));
})(window.PP);

/* =========================================================
   PART 5: STUDENT STORE (points, finished lessons, quiz scores, redeemed rewards)
   Saved in this browser so every page shows the same numbers.
   Profile > Appearance has a "Reset demo data" button.
   ========================================================= */
(function (PP) {
  const KEY = 'pypath_student';
  PP.today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
  let cache = null;
  PP.store = {
    get() {
      if (!cache) {
        let s = null;
        try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
        cache = Object.assign(DEF(), s || {});
      }
      return cache;
    },
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch (e) {}
      document.dispatchEvent(new CustomEvent('pp-store'));
    },
    earn(pts, what) {
      const s = this.get();
      s.points += pts;
      s.history.unshift({ what, pts, date: PP.today() });
      this.save();
    },
    reset() {
      try { localStorage.removeItem(KEY); } catch (e) {}
      cache = null; this.get();
      document.dispatchEvent(new CustomEvent('pp-store'));
    }
  };
})(window.PP);

/* =========================================================
   PART 6: SMALL UI HELPERS (copied from the admin side)
   toast, chips, avatar, confirm dialog, modals, pagination
   ========================================================= */
(function (PP) {
  const $ = (s, r) => (r || document).querySelector(s);
  PP.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  PP.toast = function (msg, kind) {
    let host = $('#toasts');
    if (!host) { host = document.createElement('div'); host.id = 'toasts'; host.className = 'toasts'; document.body.appendChild(host); }
    const t = document.createElement('div');
    t.className = 'toast' + (kind ? ' toast-' + kind : '');
    t.innerHTML = PP.i(kind === 'error' ? 'x' : 'check') + '<span>' + PP.esc(msg) + '</span>';
    host.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 250); }, 2600);
  };

  PP.chip = (text, kind) => '<span class="chip chip-' + kind + '">' + PP.esc(text) + '</span>';
  const CHIP = { Completed: 'green', Passed: 'green', Correct: 'green', Earned: 'green', Easy: 'green', Beginner: 'green', 'In progress': 'blue', New: 'blue', Student: 'blue', 'Not started': 'purple', 'Coming soon': 'orange', Medium: 'orange', Intermediate: 'orange', Locked: 'orange', Hard: 'red', Advanced: 'red', Failed: 'red', Incorrect: 'red', 'Sold out': 'red' };
  PP.statusChip = (s) => PP.chip(s, CHIP[s] || 'blue');

  const PAL = [['#8ec5ff', '#5b9cf2'], ['#ffc9a8', '#f59a6b'], ['#c8b6ff', '#9a7cf0'], ['#9be3c6', '#4fbf97'], ['#ffc2dc', '#ef8ab5'], ['#ffe08a', '#f2b632']];
  PP.avatar = function (name, cls) {
    const ini = String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    let h = 0; for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) % 997;
    const p = PAL[h % PAL.length];
    return '<span class="avatar ' + (cls || '') + '" style="background:linear-gradient(135deg,' + p[0] + ',' + p[1] + ')">' + PP.esc(ini) + '</span>';
  };

  /* Confirm dialog -> Promise<boolean>.  o = { title, text, confirm, icon, primary } */
  PP.confirm = function (o) {
    return new Promise((resolve) => {
      const wrap = document.createElement('div');
      wrap.className = 'modal-backdrop open';
      wrap.dataset.dynamic = '1';
      wrap.innerHTML = '<div class="modal modal-sm" role="dialog" aria-modal="true"><div class="confirm-ico' + (o.primary ? ' blue' : '') + '">' + PP.i(o.icon || 'alert') + '</div><h3>' + PP.esc(o.title || 'Are you sure?') + '</h3><p>' + PP.esc(o.text || '') + '</p><div class="modal-foot center"><button class="btn btn-ghost" data-v="0">Cancel</button><button class="btn ' + (o.primary ? 'btn-primary' : 'btn-danger-solid') + '" data-v="1">' + PP.esc(o.confirm || 'OK') + '</button></div></div>';
      document.body.appendChild(wrap);
      const done = (v) => { wrap.remove(); resolve(v); };
      wrap.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) done(b.dataset.v === '1'); else if (e.target === wrap) done(false); });
      setTimeout(() => { const b = wrap.querySelector('[data-v="1"]'); if (b) b.focus(); }, 30);
    });
  };

  /* Simple message modal:  PP.modal('Title', '<p>html</p>', 'Close') */
  PP.modal = function (title, html, btn) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop open';
    wrap.dataset.dynamic = '1';
    wrap.innerHTML = '<div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>' + PP.esc(title) + '</h2><button class="icon-btn" data-v aria-label="Close">' + PP.i('x') + '</button></div><div class="modal-body">' + html + '</div><div class="modal-foot"><button class="btn btn-primary" data-v>' + PP.esc(btn || 'Close') + '</button></div></div>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click', (e) => { if (e.target === wrap || e.target.closest('[data-v]')) wrap.remove(); });
  };

  /* Static modals written in a page's HTML (.modal-backdrop with an id) */
  PP.openModal = (id) => { const m = document.getElementById(id); if (m) { m.classList.add('open'); const f = m.querySelector('input,select,textarea'); if (f) setTimeout(() => f.focus(), 30); } };
  PP.closeModal = (id) => { const m = document.getElementById(id); if (m) m.classList.remove('open'); };
  document.addEventListener('click', (e) => {
    const bd = e.target.closest('.modal-backdrop');
    if (!bd || bd.dataset.dynamic) return;
    if (e.target === bd || e.target.closest('[data-close]')) bd.classList.remove('open');
  });

  /* Pagination widget */
  PP.pager = function (el, o) {
    const pages = Math.max(1, Math.ceil(o.total / o.per));
    if (o.page > pages) o.page = pages;
    let b = '<button class="pg" data-p="' + (o.page - 1) + '" ' + (o.page === 1 ? 'disabled' : '') + ' aria-label="Previous">' + PP.i('left') + '</button>';
    for (let i = 1; i <= pages; i++) b += '<button class="pg ' + (i === o.page ? 'on' : '') + '" data-p="' + i + '">' + i + '</button>';
    b += '<button class="pg" data-p="' + (o.page + 1) + '" ' + (o.page === pages ? 'disabled' : '') + ' aria-label="Next">' + PP.i('right') + '</button>';
    el.innerHTML = '<span class="pager-info">' + (o.total ? ((o.page - 1) * o.per + 1) + '–' + Math.min(o.page * o.per, o.total) + ' of ' + o.total : '0 results') + '</span><div class="pager-btns">' + b + '</div>';
    el.onclick = (e) => { const x = e.target.closest('.pg'); if (x && !x.disabled) o.onPage(+x.dataset.p); };
  };
})(window.PP);

/* =========================================================
   PART 7: MAIN UI SHELL (sidebar, top bar, mobile bottom bar, drawer)
   Each page has empty #sidebar, #topbar, #bottomnav and #drawer tags;
   this fills them. <body data-active="..."> picks the highlighted link.
   ========================================================= */
(function (PP) {
  const IMG = PP.IMG;
  const NAV = [
    { key: 'home', label: 'Home', icon: 'home', href: '../home/index.html' },
    { key: 'learning', label: 'Learning Materials', icon: 'book', href: '../learning-materials/index.html' },
    { key: 'activities', label: 'Activities', icon: 'quiz', href: '../activities/index.html' },
    { key: 'announcements', label: 'Announcements', icon: 'megaphone', href: '../announcements/index.html' },
    { key: 'rewards', label: 'Points & Rewards', icon: 'gift', href: '../rewards/index.html' },
    { key: 'profile', label: 'Profile', icon: 'user', href: '../profile/index.html' }
  ];
  const BOTTOM = [
    { key: 'home', label: 'Home', icon: 'home', href: '../home/index.html' },
    { key: 'learning', label: 'Learn', icon: 'book', href: '../learning-materials/index.html' },
    { key: 'activities', label: 'Activities', icon: 'quiz', href: '../activities/index.html' },
    { key: 'rewards', label: 'Rewards', icon: 'gift', href: '../rewards/index.html' },
    { key: 'more', label: 'More', icon: 'menu', more: true }
  ];
  const LOGIN = '../login/index.html';
  const $ = (s) => document.querySelector(s);
  let active = '';

  function navHtml(list, cls) {
    return list.map((n) => '<a class="' + cls + (n.key === active ? ' active' : '') + '" data-key="' + n.key + '" ' +
      (n.more ? 'href="#" data-more="1"' : 'href="' + n.href + '"') + (n.key === active ? ' aria-current="page"' : '') + '>' + PP.i(n.icon) + '<span>' + PP.esc(n.label) + '</span></a>').join('');
  }
  const sparkle = '<svg class="sp" viewBox="0 0 24 24"><path d="M12 1.5 14 9.5 22.5 12 14 14.5 12 22.5 10 14.5 1.5 12 10 9.5z" fill="currentColor"/></svg>';

  function build() {
    active = document.body.dataset.active || active;
    const me = PP.store.get();

    const sb = $('#sidebar');
    if (sb) sb.innerHTML =
      '<div class="brand">' + PP.img('logo-icon.png', '', 'Logo') + '<div><b>PyPath</b><small>Student Portal</small></div></div>' +
      '<nav class="nav" aria-label="Main">' + navHtml(NAV, 'nav-link') + '</nav>' +
      '<div class="side-foot"><div class="cloud"></div>' + PP.img('mascot-hands.png', 'side-mascot', 'Mascot') + '<p>Better Learning<br>for a Brighter Future</p><span class="star-y">' + sparkle + '</span></div>' +
      '<a class="nav-link side-logout" href="' + LOGIN + '" data-logout>' + PP.i('logout') + '<span>Logout</span></a>';

    const tb = $('#topbar');
    if (tb) tb.innerHTML =
      '<button class="icon-btn tb-mobile" id="menuBtn" aria-label="Open menu">' + PP.i('menu') + '</button>' +
      '<div class="tb-brand tb-mobile">' + PP.img('logo-icon.png', '', 'Logo') + '<div><b>PyPath</b><small>Student Portal</small></div></div>' +
      '<label class="searchbox tb-desktop">' + PP.i('search') + '<input id="globalSearch" type="search" placeholder="Search lessons and activities..." autocomplete="off"></label>' +
      '<div class="tb-right">' +
        '<a class="pts-pill tb-desktop" href="../rewards/index.html" title="Your points">' + PP.i('star') + '<b id="tbPts"></b> pts</a>' +
        '<button class="icon-btn" id="themeBtn" aria-label="Switch light or dark mode"></button>' +
        '<div class="menu-host"><button class="icon-btn bell" id="bellBtn" aria-label="Notifications">' + PP.i('bell') + '<i class="dot" id="bellDot"></i></button><div class="dropdown notif" id="notifMenu"></div></div>' +
        '<span class="tb-sep tb-desktop"></span>' +
        '<div class="menu-host"><button class="profile" id="profileBtn" aria-haspopup="true">' + PP.img('avatar.png', 'avatar-img', 'Photo') + '<span class="who tb-desktop"><b id="tbName"></b><small>Student</small></span><span class="tb-desktop">' + PP.i('down') + '</span></button>' +
        '<div class="dropdown prof" id="profMenu"><a href="../profile/index.html">' + PP.i('user') + 'My Profile</a><a href="../profile/index.html#appearance">' + PP.i('gear') + 'Settings</a><a href="' + LOGIN + '" data-logout>' + PP.i('logout') + 'Logout</a></div></div>' +
      '</div>';

    const bn = $('#bottomnav');
    if (bn) bn.innerHTML = navHtml(BOTTOM, 'bn-link');

    const dr = $('#drawer');
    if (dr) dr.innerHTML =
      '<div class="drawer-scrim" data-dclose></div><aside class="drawer-panel" role="dialog" aria-label="Menu">' +
      '<div class="drawer-head"><div class="tb-brand">' + PP.img('logo-icon.png', '', 'Logo') + '<div><b>PyPath</b><small>Student Portal</small></div></div><button class="icon-btn" data-dclose aria-label="Close menu">' + PP.i('x') + '</button></div>' +
      '<div class="drawer-user">' + PP.img('avatar.png', 'avatar-img lg', 'Photo') + '<div><b id="drName"></b><small><span id="drPts"></span> pts · Student</small><a class="mini-btn" href="../profile/index.html">' + PP.i('edit') + 'Edit Profile</a></div></div>' +
      '<nav class="drawer-nav">' + navHtml(NAV, 'dn-link') + '<hr><a class="dn-link logout" href="' + LOGIN + '" data-logout>' + PP.i('logout') + '<span>Logout</span></a></nav></aside>';

    refreshUser();
    renderNotes();
    themeIcon();
    PP.hydrate();
  }

  /* name + points in the top bar (updates when the store changes) */
  function refreshUser() {
    const s = PP.store.get();
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('tbName', s.name); set('drName', s.name);
    set('tbPts', s.points.toLocaleString('en-US')); set('drPts', s.points.toLocaleString('en-US'));
  }
  document.addEventListener('pp-store', refreshUser);

  function themeIcon() {
    const b = $('#themeBtn'); if (!b || !PP.theme) return;
    const dark = PP.theme.current() === 'dark';
    b.innerHTML = PP.i(dark ? 'sun' : 'moon');
    b.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  }
  document.addEventListener('pp-theme', themeIcon);

  function renderNotes() {
    const s = PP.store.get(), notes = PP.DATA.notes;
    const dot = $('#bellDot'); if (dot) dot.style.display = s.notesRead ? 'none' : 'block';
    const m = $('#notifMenu');
    if (m) m.innerHTML = '<div class="dd-head"><b>Notifications</b><button class="link-btn" id="markRead">Mark all read</button></div>' +
      notes.map((n, i) => '<div class="note ' + (!s.notesRead && i < 2 ? 'unread' : '') + '"><b>' + PP.esc(n.t) + '</b><small>' + PP.esc(n.s) + '</small><em>' + n.ago + '</em></div>').join('') +
      '<a class="dd-foot" href="../announcements/index.html">See announcements ' + PP.i('arrowright') + '</a>';
  }

  function closeMenus() { document.querySelectorAll('.dropdown.open').forEach((d) => d.classList.remove('open')); }
  function openDrawer() { const d = $('#drawer'); if (d) { d.classList.add('open'); document.body.classList.add('no-scroll'); } }
  function closeDrawer() { const d = $('#drawer'); if (d) { d.classList.remove('open'); document.body.classList.remove('no-scroll'); } }

  PP.setActive = function (key) {
    active = key;
    document.querySelectorAll('[data-key]').forEach((a) => a.classList.toggle('active', a.dataset.key === key));
  };

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('#menuBtn')) { openDrawer(); return; }
    if (t.closest('#themeBtn')) { if (PP.theme) PP.theme.toggle(); return; }
    if (t.closest('[data-dclose]')) { closeDrawer(); return; }
    const more = t.closest('[data-more]'); if (more) { e.preventDefault(); openDrawer(); return; }
    if (t.closest('[data-logout]')) { try { sessionStorage.removeItem('pypath_student_in'); } catch (x) {} return; }
    if (t.closest('#bellBtn')) { const m = $('#notifMenu'); const was = m.classList.contains('open'); closeMenus(); m.classList.toggle('open', !was); return; }
    if (t.closest('#profileBtn')) { const m = $('#profMenu'); const was = m.classList.contains('open'); closeMenus(); m.classList.toggle('open', !was); return; }
    if (t.closest('#markRead')) { PP.store.get().notesRead = true; PP.store.save(); renderNotes(); PP.toast('All notifications marked as read'); return; }
    if (!t.closest('.dropdown')) closeMenus();
    if (t.closest('.dn-link[href]')) closeDrawer();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach((m) => { if (m.dataset.dynamic) m.remove(); else m.classList.remove('open'); });
      closeDrawer(); closeMenus();
    }
    if (e.key === 'Enter' && e.target && e.target.id === 'globalSearch' && e.target.value.trim()) {
      const q = e.target.value.trim();
      if (typeof PP.onGlobalSearch === 'function') PP.onGlobalSearch(q);
      else location.href = '../activities/index.html?q=' + encodeURIComponent(q);
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})(window.PP);

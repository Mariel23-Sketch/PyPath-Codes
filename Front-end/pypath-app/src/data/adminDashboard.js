/* Sample numbers for the admin dashboard (mock data, ported from the old admin-dashboard/script.js).
   FRONTEND DEMO ONLY – none of this is connected to a real database. */
export const ADMIN_DASHBOARD = {
  stats: [
    { label: 'Total Users', val: 1250, delta: '12%', icon: 'users', tone: 't-blue', to: '/admin/users' },
    { label: 'Total Courses', val: 12, delta: '8%', icon: 'book', tone: 't-green', to: '/admin/learning' },
    { label: 'Total Activities', val: 48, delta: '15%', icon: 'quiz', tone: 't-purple', to: '/admin/activities' },
    { label: 'Course Completions', val: 892, delta: '20%', icon: 'star', tone: 't-yellow', to: '/admin/users' }
  ],
  growth: {
    '7D': { labels: ['May 12', 'May 13', 'May 14', 'May 15', 'May 16', 'May 17', 'May 18'], data: [220, 370, 400, 520, 700, 800, 1050] },
    '30D': { labels: ['Apr 20', 'Apr 27', 'May 4', 'May 11', 'May 18'], data: [300, 480, 640, 820, 1050] },
    '3M': { labels: ['Mar', 'Apr', 'May'], data: [420, 760, 1050] },
    '1Y': { labels: ['Jun', 'Aug', 'Oct', 'Dec', 'Feb', 'Apr', 'May'], data: [90, 210, 380, 560, 720, 910, 1050] }
  },
  activities: [
    { icon: 'user', title: 'New user registered', sub: 'jasmine123', ago: '2 mins ago', tone: 't-blue' },
    { icon: 'star', title: 'Course completed', sub: 'Python Basics', ago: '12 mins ago', tone: 't-yellow' },
    { icon: 'quiz', title: 'New quiz submitted', sub: 'Module 2 Quiz', ago: '25 mins ago', tone: 't-purple' },
    { icon: 'megaphone', title: 'New announcement', sub: 'System Maintenance', ago: '1 hour ago', tone: 't-purple' }
  ],
  courses: [
    { name: 'Python Basics', students: 520, pct: 92, color: '#2f9e86', icon: 'book', tone: 't-green' },
    { name: 'Data Types', students: 420, pct: 78, color: '#4a90e8', icon: 'cube', tone: 't-blue' },
    { name: 'Control Flow', students: 380, pct: 65, color: '#9b5de5', icon: 'layers', tone: 't-purple' },
    { name: 'Functions', students: 310, pct: 58, color: '#f5b942', icon: 'code', tone: 't-orange' },
    { name: 'Loops', students: 290, pct: 52, color: '#ff6fa5', icon: 'clock', tone: 't-pink' }
  ],
  users: [
    { name: 'Jasmine Santos', email: 'jasmine@gmail.com', joined: 'May 18, 2025', status: 'Active' },
    { name: 'Marco Rivera', email: 'marco@sample.com', joined: 'May 17, 2025', status: 'Active' },
    { name: 'Lian Cruz', email: 'lian@domain.com', joined: 'May 16, 2025', status: 'Active' },
    { name: 'Aira Delgado', email: 'aira@test.com', joined: 'May 16, 2025', status: 'Active' },
    { name: 'Noah Reyes', email: 'noah@sample.com', joined: 'May 15, 2025', status: 'Inactive' }
  ]
};

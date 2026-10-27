import { Link } from 'react-router-dom';
import css from '../styles/student/base.css?inline';
import useStyles from '../hooks/useStyles';
import Icon from '../components/Icon';
import Img from '../components/Img';

/* Start page (the old "main-ui/index.html" and admin "index.html" combined):
   jump to any page of either portal while the app is still frontend-only. */
const STUDENT = [
  { to: '/student/login', icon: 'lock', tone: 't-blue', t: 'Login', s: 'Sign in or create an account' },
  { to: '/student/home', icon: 'home', tone: 't-blue', t: 'Home', s: 'Your dashboard' },
  { to: '/student/learning', icon: 'book', tone: 't-green', t: 'Courses', s: 'Courses, modules and lectures' },
  { to: '/student/activities', icon: 'quiz', tone: 't-purple', t: 'Activities', s: 'Quizzes and practice exercises' },
  { to: '/student/announcements', icon: 'megaphone', tone: 't-pink', t: 'Announcements', s: 'News from your teachers' },
  { to: '/student/rewards', icon: 'gift', tone: 't-yellow', t: 'Points & Rewards', s: 'Badges and redeemable rewards' },
  { to: '/student/profile', icon: 'user', tone: 't-orange', t: 'Profile', s: 'Account and settings' }
];
const ADMIN = [
  { to: '/admin/login', icon: 'lock', tone: 't-blue', t: 'Admin Login', s: 'Sign in with admin / admin123' },
  { to: '/admin/dashboard', icon: 'home', tone: 't-blue', t: 'Dashboard', s: 'Overview' },
  { to: '/admin/users', icon: 'users', tone: 't-green', t: 'Manage Users', s: 'Students and admins' },
  { to: '/admin/learning', icon: 'book', tone: 't-green', t: 'Learning Materials', s: 'Courses, lessons, videos' },
  { to: '/admin/activities', icon: 'quiz', tone: 't-purple', t: 'Activities', s: 'Quizzes, exercises' },
  { to: '/admin/progress', icon: 'chart', tone: 't-blue', t: 'Results and Progress', s: 'How learners are doing' },
  { to: '/admin/rewards', icon: 'gift', tone: 't-yellow', t: 'Points and Reward Management', s: 'Badges, rewards, rules' },
  { to: '/admin/student/points-reward', icon: 'star', tone: 't-yellow', t: 'Student: Points and Reward', s: 'Student view' },
  { to: '/admin/announcements', icon: 'megaphone', tone: 't-pink', t: 'Announcement Management', s: 'News' },
  { to: '/admin/profile', icon: 'user', tone: 't-orange', t: 'Admin Profile and Settings', s: 'Settings' }
];

function Section({ title, items }) {
  return (
    <section>
      <h2>{title}</h2>
      <ul className="launch-list">
        {items.map((i) => (
          <li key={i.to}>
            <Link className="card" to={i.to}>
              <span className={`tile ${i.tone}`}><Icon name={i.icon} box /></span>
              <div><b>{i.t}</b><small>{i.s}</small></div>
              <Icon name="right" box />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Launcher() {
  useStyles(css, 0);
  return (
    <main className="launch">
      <header className="launch-head">
        <Img file="logo-icon.png" label="Logo" />
        <div><h1>PyPath</h1><p>Clickable frontend preview. All data is sample data saved in this browser.</p></div>
      </header>
      <Link className="btn btn-primary btn-block" to="/student/login"><Icon name="arrowright" box />Start at Student Login</Link>
      <Section title="Student portal" items={STUDENT} />
      <Section title="Admin portal" items={ADMIN} />
    </main>
  );
}

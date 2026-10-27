import { Link, Outlet, useLocation } from 'react-router-dom';
import Shell from '../components/Shell';
import Icon from '../components/Icon';
import { studentStore, useStudent } from '../services/studentStore';
import { session } from '../services/session';
import { D } from '../services/studentCatalog';
import { useToast } from '../hooks/useToast';

const NAV = [
  { key: 'home', label: 'Home', icon: 'home', to: '/student/home' },
  { key: 'learning', label: 'Learning Materials', icon: 'book', to: '/student/learning' },
  { key: 'activities', label: 'Activities', icon: 'quiz', to: '/student/activities' },
  { key: 'announcements', label: 'Announcements', icon: 'megaphone', to: '/student/announcements' },
  { key: 'rewards', label: 'Points & Rewards', icon: 'gift', to: '/student/rewards' },
  { key: 'profile', label: 'Profile', icon: 'user', to: '/student/profile' }
];
const BOTTOM = [
  { key: 'home', label: 'Home', icon: 'home', to: '/student/home' },
  { key: 'learning', label: 'Learn', icon: 'book', to: '/student/learning' },
  { key: 'activities', label: 'Activities', icon: 'quiz', to: '/student/activities' },
  { key: 'rewards', label: 'Rewards', icon: 'gift', to: '/student/rewards' },
  { key: 'more', label: 'More', icon: 'menu', more: true }
];

/* Student portal shell: sidebar, top bar (points, theme, notifications, profile menu), bottom bar, drawer. */
export default function StudentLayout() {
  const s = useStudent();
  const toast = useToast();
  const { pathname } = useLocation();
  const active = (NAV.find((n) => pathname.startsWith(n.to)) || {}).key;
  const pts = s.points.toLocaleString('en-US');

  const cfg = {
    portalName: 'Student Portal',
    nav: NAV,
    bottom: BOTTOM,
    searchPlaceholder: 'Search lessons and activities...',
    defaultSearch: (q, navigate) => navigate(`/student/activities?q=${encodeURIComponent(q)}`),
    sidebarLogout: true,
    logoutTo: '/student/login',
    onLogout: () => session.signOut('student'),
    topExtra: (
      <Link className="pts-pill tb-desktop" to="/student/rewards" title="Your points">
        <Icon name="star" /><b id="tbPts">{pts}</b> pts
      </Link>
    ),
    notifications: {
      items: D.notes.map((n, i) => ({ ...n, unread: !s.notesRead && i < 2 })),
      onMarkAll: () => { studentStore.update((d) => { d.notesRead = true; }); toast('All notifications marked as read'); },
      footer: { to: '/student/announcements', label: 'See announcements' }
    },
    profile: {
      avatar: 'avatar.png',
      name: s.name,
      role: 'Student',
      menu: [
        { to: '/student/profile', icon: 'user', label: 'My Profile' },
        { to: '/student/profile/appearance', icon: 'gear', label: 'Settings' },
        { to: '/student/login', icon: 'logout', label: 'Logout', logout: true }
      ]
    },
    drawerUser: { title: s.name, sub: `${pts} pts · Student`, editTo: '/student/profile' }
  };

  return <Shell cfg={cfg} active={active}><Outlet /></Shell>;
}

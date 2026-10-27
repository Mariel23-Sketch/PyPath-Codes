import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Shell from '../components/Shell';
import Icon from '../components/Icon';
import { useToast } from '../hooks/useToast';
import { session } from '../services/session';

const NOTES = [
  { t: 'New user registered', s: 'jasmine123 joined PyPath', ago: '2 mins ago', unread: true },
  { t: 'New activity submitted', s: 'Operators Quiz', ago: '25 mins ago', unread: true },
  { t: 'Backup completed', s: 'All data saved safely', ago: '1 hour ago', unread: false }
];

/* Settings is intentionally not in the sidebar; it stays reachable from the profile menu (top right). */
const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home', to: '/admin/dashboard' },
  { key: 'users', label: 'Manage Users', icon: 'users', to: '/admin/users' },
  { key: 'learning', label: 'Learning Materials', icon: 'book', to: '/admin/learning' },
  { key: 'activities', label: 'Activities', icon: 'quiz', to: '/admin/activities' },
  { key: 'progress', label: 'Progress', icon: 'chart', to: '/admin/progress' },
  { key: 'rewards', label: 'Points and Reward', icon: 'gift', to: '/admin/rewards' },
  { key: 'announcements', label: 'Announcements', icon: 'megaphone', to: '/admin/announcements' }
];
const BOTTOM = [
  { key: 'dashboard', label: 'Home', icon: 'home', to: '/admin/dashboard' },
  { key: 'learning', label: 'Learning', icon: 'book', to: '/admin/learning' },
  { key: 'activities', label: 'Activities', icon: 'quiz', to: '/admin/activities' },
  { key: 'announcements', label: 'Announcements', icon: 'megaphone', to: '/admin/announcements' },
  { key: 'more', label: 'More', icon: 'menu', more: true }
];

/* Admin portal shell: sidebar, top bar (theme, notifications, profile menu), bottom bar, drawer. */
export default function AdminLayout() {
  const toast = useToast();
  const { pathname } = useLocation();
  const [notes, setNotes] = useState(NOTES);

  const active = (NAV.find((n) => pathname.startsWith(n.to)) || {}).key;

  const cfg = {
    sidebarName: 'Admin Panel',
    portalName: 'Admin Portal',
    nav: NAV,
    bottom: BOTTOM,
    searchPlaceholder: 'Search anything...',
    defaultSearch: (q, navigate) => navigate(`/admin/users?q=${encodeURIComponent(q)}`),
    sidebarLogout: false,
    logoutTo: '/admin/login',
    onLogout: () => session.signOut('admin'),
    notifications: {
      items: notes,
      onMarkAll: () => { setNotes((l) => l.map((n) => ({ ...n, unread: false }))); toast('All notifications marked as read'); }
    },
    profile: {
      avatar: 'mascot-hands.png',
      name: 'Admin',
      role: 'Administrator',
      menu: [
        { to: '/admin/profile', icon: 'user', label: 'My Profile' },
        { to: '/admin/profile', icon: 'gear', label: 'Settings' },
        { to: '/admin/login', icon: 'logout', label: 'Logout', logout: true }
      ]
    },
    drawerUser: { title: 'Admin', sub: 'ADM001 · Administrator', editTo: '/admin/profile' },
    drawerExtra: (
      <a className="dn-link" href="#" onClick={(e) => { e.preventDefault(); toast('Help & Support is not part of this build yet.'); }}>
        <Icon name="help" /><span>Help &amp; Support</span>
      </a>
    )
  };

  return <Shell cfg={cfg} active={active}><Outlet /></Shell>;
}

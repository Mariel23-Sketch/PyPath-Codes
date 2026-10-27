import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Shell from '../components/Shell';
import Icon from '../components/Icon';
import useBodyAttr from '../hooks/useBodyAttr';
import { useToast } from '../hooks/useToast';
import { pointsStore, usePoints } from '../services/pointsStore';
import { session } from '../services/session';

const NOTES = [
  { t: 'New badge unlocked', s: 'You earned the Quiz Master badge', ago: '1 day ago', unread: true },
  { t: 'Streak going strong', s: 'You are on a 7 day learning streak', ago: 'Today', unread: false }
];
const POINTS = '/admin/student/points-reward';

/* The old admin shell also had a "student mode" (body data-portal="student") used by the
   Points and Reward preview page: most student links there are placeholders ("not part of this build yet"). */
export default function StudentPreviewLayout() {
  const toast = useToast();
  useBodyAttr('portal', 'student');
  usePoints(); // keep the points pill live
  const [notes, setNotes] = useState(NOTES);
  const soon = (label) => () => toast(`${label} is not part of this build yet.`);

  const nav = [
    { key: 'dashboard', label: 'Dashboard', icon: 'home', soon: soon('Dashboard') },
    { key: 'learning', label: 'Learning Materials', icon: 'book', soon: soon('Learning Materials') },
    { key: 'activities', label: 'Activities', icon: 'quiz', soon: soon('Activities') },
    { key: 'points', label: 'Points and Reward', icon: 'gift', to: POINTS },
    { key: 'profile', label: 'Profile', icon: 'user', soon: soon('Profile') },
    { key: 'logout', label: 'Logout', icon: 'logout', to: '/' }
  ];
  const bottom = [
    { key: 'dashboard', label: 'Home', icon: 'home', soon: soon('Dashboard') },
    { key: 'learning', label: 'Learning', icon: 'book', soon: soon('Learning Materials') },
    { key: 'activities', label: 'Activities', icon: 'quiz', soon: soon('Activities') },
    { key: 'points', label: 'Points', icon: 'gift', to: POINTS },
    { key: 'more', label: 'More', icon: 'menu', more: true }
  ];

  const cfg = {
    sidebarName: 'Learning Portal',
    portalName: 'Student Portal',
    nav,
    drawerNav: nav.filter((n) => n.key !== 'logout'),
    bottom,
    searchPlaceholder: 'Search lessons and activities...',
    defaultSearch: (q) => toast(`Search for “${q}” isn’t available in this preview yet.`),
    sidebarLogout: false,
    logoutTo: '/',
    onLogout: () => session.signOut('admin'),
    topExtra: (
      <Link className="pts-pill" id="ptsPill" to={POINTS} aria-label="Your points balance">
        <Icon name="star" box /><b id="ptsVal">{pointsStore.balance().toLocaleString()} pts</b>
      </Link>
    ),
    notifications: {
      items: notes,
      onMarkAll: () => { setNotes((l) => l.map((n) => ({ ...n, unread: false }))); toast('All notifications marked as read'); }
    },
    profile: {
      avatar: 'logo-icon.png',
      name: 'ranz',
      role: 'Student',
      menu: [
        { icon: 'user', label: 'My Profile', soon: soon('Profile') },
        { to: '/', icon: 'logout', label: 'Logout', logout: true }
      ]
    },
    drawerUser: { title: 'ranz', sub: 'Student' },
    drawerExtra: (
      <a className="dn-link" href="#" onClick={(e) => { e.preventDefault(); toast('Help & Support is not part of this build yet.'); }}>
        <Icon name="help" /><span>Help &amp; Support</span>
      </a>
    )
  };

  return <Shell cfg={cfg} active="points"><Outlet /></Shell>;
}

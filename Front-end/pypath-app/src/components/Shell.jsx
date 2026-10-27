import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import Img from './Img';
import useTheme from '../hooks/useTheme';
import { theme } from '../services/theme';
import { SearchCtx } from '../hooks/usePageSearch';

const Sparkle = () => (
  <svg className="sp" viewBox="0 0 24 24"><path d="M12 1.5 14 9.5 22.5 12 14 14.5 12 22.5 10 14.5 1.5 12 10 9.5z" fill="currentColor" /></svg>
);

function NavItem({ item, cls, active, onMore, onClick }) {
  const isActive = item.key === active;
  const inner = (<><Icon name={item.icon} /><span>{item.label}</span></>);
  if (item.more) {
    return <a className={cls} href="#" data-key={item.key} onClick={(e) => { e.preventDefault(); onMore(); }}>{inner}</a>;
  }
  if (item.soon) {
    return <a className={cls} href="#" onClick={(e) => { e.preventDefault(); onClick(); item.soon(); }}>{inner}</a>;
  }
  return (
    <Link className={`${cls}${isActive ? ' active' : ''}`} to={item.to} data-key={item.key} aria-current={isActive ? 'page' : undefined} onClick={onClick}>
      {inner}
    </Link>
  );
}

/*
  Sidebar + top bar + mobile bottom bar + drawer shared by the student and admin portals.
  cfg (see layouts/StudentLayout.jsx and AdminLayout.jsx) describes what differs between them.
*/
export default function Shell({ cfg, active, children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dark = useTheme() === 'dark';
  /* open dropdown / drawer; remembered with the path so navigating to another page closes them */
  const [ui, setUi] = useState({ path: pathname, menu: null, drawer: false });
  const here = ui.path === pathname;
  const menu = here ? ui.menu : null; // 'bell' | 'profile' | null
  const drawer = here ? ui.drawer : false;
  const setMenu = useCallback((m) => setUi((u) => ({ path: pathname, menu: m, drawer: u.path === pathname ? u.drawer : false })), [pathname]);
  const setDrawer = useCallback((d) => setUi((u) => ({ path: pathname, menu: u.path === pathname ? u.menu : null, drawer: d })), [pathname]);
  const searchRef = useRef(null);
  const closeDrawer = useCallback(() => setDrawer(false), [setDrawer]);

  /* the old pages were separate documents: a new page starts at the top */
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  /* click outside / Esc closes dropdowns and the drawer */
  useEffect(() => {
    const onDoc = (e) => { if (!e.target.closest('.menu-host')) setMenu(null); };
    const onKey = (e) => { if (e.key === 'Escape') { setMenu(null); setDrawer(false); } };
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey); };
  }, [setMenu, setDrawer]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', drawer);
    return () => document.body.classList.remove('no-scroll');
  }, [drawer]);

  const onSearchKey = (e) => {
    if (e.key !== 'Enter' || !e.target.value.trim()) return;
    const q = e.target.value.trim();
    if (searchRef.current) searchRef.current(q); else cfg.defaultSearch(q, navigate);
  };

  const unread = cfg.notifications.items.some((n) => n.unread);
  const logout = () => { cfg.onLogout(); setDrawer(false); };
  const profile = cfg.profile;

  return (
    <SearchCtx.Provider value={searchRef}>
      <div className="shell">
        <aside className="sidebar" id="sidebar">
          <div className="brand"><Img file="logo-icon.png" label="Logo" /><div><b>PyPath</b><small>{cfg.sidebarName || cfg.portalName}</small></div></div>
          <nav className="nav" aria-label="Main">
            {cfg.nav.map((n) => <NavItem key={n.key} item={n} cls="nav-link" active={active} onMore={() => {}} onClick={() => {}} />)}
          </nav>
          <div className="side-foot">
            <div className="cloud" />
            <Img file="mascot-hands.png" className="side-mascot" label="Mascot" alt="PyPath mascot" />
            <p>Better Learning<br />for a Brighter Future</p>
            <span className="star-y"><Sparkle /></span>
          </div>
          {cfg.sidebarLogout && (
            <Link className="nav-link side-logout" to={cfg.logoutTo} onClick={cfg.onLogout}><Icon name="logout" /><span>Logout</span></Link>
          )}
        </aside>

        <div className="content">
          <header className="topbar" id="topbar">
            <button className="icon-btn tb-mobile" id="menuBtn" aria-label="Open menu" onClick={() => setDrawer(true)}><Icon name="menu" /></button>
            <div className="tb-brand tb-mobile"><Img file="logo-icon.png" label="Logo" /><div><b>PyPath</b><small>{cfg.portalName}</small></div></div>
            <label className="searchbox tb-desktop">
              <Icon name="search" />
              <input id="globalSearch" type="search" placeholder={cfg.searchPlaceholder} autoComplete="off" onKeyDown={onSearchKey} />
            </label>
            <div className="tb-right">
              {cfg.topExtra}
              <button className="icon-btn" id="themeBtn" aria-label="Switch light or dark mode" title={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => theme.toggle()}>
                <Icon name={dark ? 'sun' : 'moon'} />
              </button>
              <div className="menu-host">
                <button className="icon-btn bell" id="bellBtn" aria-label="Notifications" onClick={() => setMenu(menu === 'bell' ? null : 'bell')}>
                  <Icon name="bell" /><i className="dot" id="bellDot" style={{ display: unread ? 'block' : 'none' }} />
                </button>
                <div className={`dropdown notif${menu === 'bell' ? ' open' : ''}`} id="notifMenu">
                  <div className="dd-head"><b>Notifications</b><button className="link-btn" onClick={cfg.notifications.onMarkAll}>Mark all read</button></div>
                  {cfg.notifications.items.map((n, i) => (
                    <div key={i} className={`note${n.unread ? ' unread' : ''}`}><b>{n.t}</b><small>{n.s}</small><em>{n.ago}</em></div>
                  ))}
                  {cfg.notifications.footer && (
                    <Link className="dd-foot" to={cfg.notifications.footer.to} onClick={() => setMenu(null)}>{cfg.notifications.footer.label} <Icon name="arrowright" /></Link>
                  )}
                </div>
              </div>
              <span className="tb-sep tb-desktop" />
              <div className="menu-host">
                <button className="profile" id="profileBtn" aria-haspopup="true" onClick={() => setMenu(menu === 'profile' ? null : 'profile')}>
                  <Img file={profile.avatar} className="avatar-img" label="Photo" />
                  <span className="who tb-desktop"><b>{profile.name}</b><small>{profile.role}</small></span>
                  <span className="tb-desktop"><Icon name="down" /></span>
                </button>
                <div className={`dropdown prof${menu === 'profile' ? ' open' : ''}`} id="profMenu">
                  {profile.menu.map((m) => (m.soon
                    ? <a key={m.label} href="#" onClick={(e) => { e.preventDefault(); setMenu(null); m.soon(); }}><Icon name={m.icon} />{m.label}</a>
                    : <Link key={m.label} to={m.to} onClick={() => { setMenu(null); if (m.logout) cfg.onLogout(); }}><Icon name={m.icon} />{m.label}</Link>))}
                </div>
              </div>
            </div>
          </header>

          <main className="page">{children}</main>
        </div>
      </div>

      <nav className="bottomnav" id="bottomnav" aria-label="Quick navigation">
        {cfg.bottom.map((n) => <NavItem key={n.key} item={n} cls="bn-link" active={active} onMore={() => setDrawer(true)} onClick={() => {}} />)}
      </nav>

      <div className={`drawer${drawer ? ' open' : ''}`} id="drawer">
        <div className="drawer-scrim" onClick={closeDrawer} />
        <aside className="drawer-panel" role="dialog" aria-label="Menu">
          <div className="drawer-head">
            <div className="tb-brand"><Img file="logo-icon.png" label="Logo" /><div><b>PyPath</b><small>{cfg.portalName}</small></div></div>
            <button className="icon-btn" aria-label="Close menu" onClick={closeDrawer}><Icon name="x" /></button>
          </div>
          <div className="drawer-user">
            <Img file={profile.avatar} className="avatar-img lg" label="Photo" />
            <div>
              <b>{cfg.drawerUser.title}</b>
              <small>{cfg.drawerUser.sub}</small>
              {cfg.drawerUser.editTo && <Link className="mini-btn" to={cfg.drawerUser.editTo} onClick={closeDrawer}><Icon name="edit" />Edit Profile</Link>}
            </div>
          </div>
          <nav className="drawer-nav">
            {(cfg.drawerNav || cfg.nav).map((n) => <NavItem key={n.key} item={n} cls="dn-link" active={active} onMore={() => {}} onClick={closeDrawer} />)}
            <hr />
            {cfg.drawerExtra}
            <Link className="dn-link logout" to={cfg.logoutTo} onClick={logout}><Icon name="logout" /><span>Logout</span></Link>
          </nav>
        </aside>
      </div>
    </SearchCtx.Provider>
  );
}

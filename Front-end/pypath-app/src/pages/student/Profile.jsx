import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import css from '../../styles/student/profile.css?inline';
import useStyles from '../../hooks/useStyles';
import useTheme from '../../hooks/useTheme';
import Icon from '../../components/Icon';
import Img from '../../components/Img';
import { Chip, StatusChip } from '../../components/Chip';
import { EMAIL_RE } from '../../components/Auth';
import { useToast } from '../../hooks/useToast';
import { useDialogs } from '../../hooks/useDialogs';
import { studentStore, useStudent } from '../../services/studentStore';
import { theme } from '../../services/theme';
import { D, moduleStatus } from '../../services/studentCatalog';

/* Tabs are routes: /student/profile, /profile/security, /profile/appearance.
   Saving your name here updates the greeting and top bar on every page. */
const TABS = [['profile', 'Profile'], ['security', 'Security'], ['appearance', 'Appearance']];

function Field({ label, req, wide, children }) {
  return (
    <label className={`field${wide ? ' w' : ''}`}>
      <span className="label">{label}{req && <> <span className="req">*</span></>}</span>
      {children}
    </label>
  );
}

function ProfileForm({ s, error, onError }) {
  const toast = useToast();
  const [f, setF] = useState({ name: s.name, user: s.user, email: s.email, phone: s.phone || '', level: s.level });
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onError('');
    if (!f.name.trim() || !f.user.trim()) { onError('Name and username are required.'); return; }
    if (!EMAIL_RE.test(f.email.trim())) { onError('Enter a valid email address.'); return; }
    studentStore.update((d) => { Object.assign(d, { name: f.name.trim(), user: f.user.trim(), email: f.email.trim(), phone: f.phone.trim(), level: f.level }); });
    toast('Profile saved');
  };

  return (
    <form className="card form" id="pf" noValidate onSubmit={submit}>
      <div className="fg" id="fields">
        <Field label="Full name" req><input className="input" name="name" value={f.name} onChange={set('name')} required /></Field>
        <Field label="Username" req><input className="input" name="user" value={f.user} onChange={set('user')} required /></Field>
        <Field label="Email" req><input className="input" name="email" type="email" value={f.email} onChange={set('email')} required /></Field>
        <Field label="Phone"><input className="input" name="phone" type="tel" placeholder="09xx xxx xxxx" value={f.phone} onChange={set('phone')} /></Field>
        <Field label="Learning level" wide>
          <select className="select" name="level" value={f.level} onChange={set('level')}>{['Beginner', 'Intermediate', 'Advanced'].map((x) => <option key={x}>{x}</option>)}</select>
        </Field>
      </div>
      <div className="err" id="formErr">{error}</div>
      <div className="form-actions" id="formActs"><button className="btn btn-primary" type="submit"><Icon name="check" />Save changes</button></div>
    </form>
  );
}

function SecurityForm({ error, onError }) {
  const toast = useToast();
  const [f, setF] = useState({ cur: '', nw: '', cf: '' });
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onError('');
    if (!f.cur) { onError('Enter your current password.'); return; }
    if (f.nw.length < 8) { onError('New password needs at least 8 characters.'); return; }
    if (f.nw !== f.cf) { onError('New passwords don’t match.'); return; }
    setF({ cur: '', nw: '', cf: '' });
    toast('Password changed (demo only)');
  };

  return (
    <form className="card form" id="pf" noValidate onSubmit={submit}>
      <div className="fg" id="fields">
        <Field label="Current password" wide><input className="input" name="cur" type="password" value={f.cur} onChange={set('cur')} /></Field>
        <Field label="New password"><input className="input" name="nw" type="password" value={f.nw} onChange={set('nw')} /></Field>
        <Field label="Confirm new password"><input className="input" name="cf" type="password" value={f.cf} onChange={set('cf')} /></Field>
      </div>
      <div className="err" id="formErr">{error}</div>
      <div className="form-actions" id="formActs"><button className="btn btn-primary" type="submit"><Icon name="lock" />Change password</button></div>
    </form>
  );
}

function AppearanceForm() {
  const toast = useToast();
  const { confirm } = useDialogs();
  useTheme(); // re-render when the theme changes elsewhere (top-bar button)
  const mode = theme.get();

  const reset = async () => {
    if (!(await confirm({ title: 'Reset demo data?', text: 'Your points, finished lessons, quiz scores and redeemed rewards go back to the sample values.', confirm: 'Reset', icon: 'refresh' }))) return;
    studentStore.reset();
    toast('Demo data reset');
  };

  return (
    <form className="card form" id="pf" noValidate onSubmit={(e) => e.preventDefault()}>
      <div className="fg" id="fields">
        <div className="field w">
          <span className="label">Theme</span>
          <div className="radios">
            {['Light', 'Dark', 'System'].map((x) => (
              <label key={x} className="radio">
                <input type="radio" name="theme" value={x} checked={mode === x} onChange={() => { theme.set(x); toast(`Theme set to ${x}`); }} />{x}
              </label>
            ))}
          </div>
        </div>
        <div className="danger-zone w">
          <div><b>Reset demo data</b><small>Puts points, lessons and quiz scores back to the sample values.</small></div>
          <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={reset}><Icon name="refresh" />Reset</button>
        </div>
      </div>
    </form>
  );
}

export default function Profile() {
  useStyles(css);
  const s = useStudent();
  const toast = useToast();
  const { tab = 'profile' } = useParams();
  const [error, setError] = useState('');
  if (!TABS.some(([k]) => k === tab)) return <Navigate to="/student/profile" replace />;

  const modsDone = D.modules.filter((m) => moduleStatus(m, s) === 'Completed').length;
  const ps = (label, val) => <div className="ps" key={label}><small>{label}</small><b>{val}</b></div>;

  return (
    <>
      <div className="page-head">
        <div><h1>My Profile</h1><p>Manage your account and how PyPath looks.</p></div>
      </div>

      <div className="card prof-card">
        <div className="prof-top">
          <div className="prof-photo">
            <Img file="avatar.png" className="avatar-img xl" label="Photo" />
            <button className="photo-btn" id="photoBtn" type="button" aria-label="Change photo" onClick={() => toast('To change the photo, put your picture in public/assets/img/avatar.png')}><Icon name="edit" box /></button>
          </div>
          <div>
            <h2>{s.name}</h2>
            <p className="sub">{s.email} · @{s.user}</p>
            <div className="chips"><StatusChip status="Student" /><Chip kind="green">{s.level}</Chip><Chip kind="orange">{s.streak}-day streak</Chip></div>
          </div>
        </div>
        <div className="prof-stats" id="pStats">
          {ps('Level', s.level)}{ps('Points', s.points.toLocaleString('en-US'))}{ps('Modules Completed', modsDone)}{ps('Quizzes Completed', Object.keys(s.quiz).length)}{ps('Rank', `#${s.rank}`)}
        </div>
      </div>

      <div className="pills" id="tabs" role="tablist">
        {TABS.map(([k, l]) => <Link key={k} className={`pill${tab === k ? ' on' : ''}`} to={k === 'profile' ? '/student/profile' : `/student/profile/${k}`} onClick={() => setError('')}>{l}</Link>)}
      </div>
      {tab === 'profile' && <ProfileForm key={s.name + s.email} s={s} error={error} onError={setError} />}
      {tab === 'security' && <SecurityForm error={error} onError={setError} />}
      {tab === 'appearance' && <AppearanceForm />}
    </>
  );
}


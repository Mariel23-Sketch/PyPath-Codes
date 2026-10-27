import { useState } from 'react';
import css from '../../../styles/admin/admin-extras.css?inline';
import useStyles from '../../../hooks/useStyles';
import Img from '../../../components/Img';
import { Chip } from '../../../components/Chip';
import { useToast } from '../../../hooks/useToast';
import { adminExtras, useExtras } from '../../../services/adminExtrasStore';
import { Fld, Seg, Tabs } from './parts';

/* Admin Profile and Settings: Profile / General / Security */
const TABS = ['Profile', 'General', 'Security'];

export default function AdminProfile() {
  useStyles(css);
  const toast = useToast();
  const me = useExtras('me');
  const [tab, setTab] = useState('Profile');
  const [v, setV] = useState({ ...me, notifyTxt: me.notify ? 'On' : 'Off', tfaTxt: me.tfa ? 'On' : 'Off', cur: '', nw: '', cf: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e && e.target ? e.target.value : e }));

  const pickTab = (t) => { setTab(t); setErr(''); };

  const submit = (e) => {
    e.preventDefault();
    if (tab === 'Security') {
      if (v.nw || v.cf || v.cur) {
        if (!v.cur) { setErr('Enter your current password.'); return; }
        if (v.nw.length < 8) { setErr('New password needs at least 8 characters.'); return; }
        if (v.nw !== v.cf) { setErr('New passwords don’t match.'); return; }
      }
      adminExtras.set('me', { ...me, tfa: v.tfaTxt === 'On' });
      setV((x) => ({ ...x, cur: '', nw: '', cf: '' }));
      setErr('');
    } else if (tab === 'General') {
      adminExtras.set('me', { ...me, site: v.site, desc: v.desc, lang: v.lang, tz: v.tz, notify: v.notifyTxt === 'On' });
    } else {
      adminExtras.set('me', { ...me, name: v.name, user: v.user, email: v.email, phone: v.phone });
    }
    toast('Settings saved');
  };

  return (
    <>
      <div className="page-head"><div><h1 id="tt">Admin Profile and Settings</h1><p id="ts">Manage your account and how PyPath behaves.</p></div><div id="headAct" /></div>
      <div id="pg" className="stack-v">
        <div className="card">
          <div className="prof-top">
            <Img file="mascot-hands.png" className="avatar-img xl" />
            <div><h2>{me.name}</h2><p className="sub">{me.email}</p><Chip kind="purple">Administrator</Chip></div>
          </div>
        </div>
        <Tabs list={TABS} cur={tab} onPick={pickTab} />
        <form className="card form" id="pf" onSubmit={submit}>
          <div className="fg">
            {tab === 'Profile' && (
              <>
                <Fld label="Full name" req><input className="input" name="name" value={v.name} onChange={set('name')} required /></Fld>
                <Fld label="Username" req><input className="input" name="user" value={v.user} onChange={set('user')} required /></Fld>
                <Fld label="Email" req><input className="input" name="email" type="email" value={v.email} onChange={set('email')} required /></Fld>
                <Fld label="Phone"><input className="input" name="phone" type="tel" value={v.phone} onChange={set('phone')} /></Fld>
              </>
            )}
            {tab === 'General' && (
              <>
                <Fld label="Site name" wide><input className="input" name="site" value={v.site} onChange={set('site')} /></Fld>
                <Fld label="Site description" wide><textarea className="textarea" name="desc" rows="3" value={v.desc} onChange={set('desc')} /></Fld>
                <Fld label="Language"><select className="select" name="lang" value={v.lang} onChange={set('lang')}>{['English', 'Filipino'].map((x) => <option key={x}>{x}</option>)}</select></Fld>
                <Fld label="Time zone"><select className="select" name="tz" value={v.tz} onChange={set('tz')}>{['Asia/Manila', 'UTC', 'America/New_York'].map((x) => <option key={x}>{x}</option>)}</select></Fld>
                <Seg name="Email me about new sign-ups" value={v.notifyTxt} options={['On', 'Off']} onChange={set('notifyTxt')} wide />
              </>
            )}
            {tab === 'Security' && (
              <>
                <Fld label="Current password" wide><input className="input" name="cur" type="password" value={v.cur} onChange={set('cur')} /></Fld>
                <Fld label="New password"><input className="input" name="nw" type="password" value={v.nw} onChange={set('nw')} /></Fld>
                <Fld label="Confirm new password"><input className="input" name="cf" type="password" value={v.cf} onChange={set('cf')} /></Fld>
                <div className="err w" id="err" style={{ gridColumn: '1/-1', margin: '-6px 0 12px' }}>{err}</div>
                <Seg name="Two-step sign-in" value={v.tfaTxt} options={['On', 'Off']} onChange={set('tfaTxt')} wide />
              </>
            )}
          </div>
          <div className="form-actions"><button className="btn btn-primary">Save changes</button></div>
        </form>
      </div>
    </>
  );
}

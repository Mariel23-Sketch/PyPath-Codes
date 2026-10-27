import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import css from '../../styles/admin/admin-login.css?inline';
import useStyles from '../../hooks/useStyles';
import useBodyClass from '../../hooks/useBodyClass';
import { AuthHero, IconField, PasswordField, ThemeFloat } from '../../components/Auth';
import ForgotModal from '../../components/ForgotModal';
import Icon from '../../components/Icon';
import { useToast } from '../../hooks/useToast';
import { session } from '../../services/session';

/* Demo credentials of the original frontend: admin (or admin@pypath.com) / admin123.
   FRONTEND ONLY – replace with a real API login; never ship hardcoded credentials. */
const DEMO = { user: ['admin', 'admin@pypath.com'], pass: 'admin123' };

export default function Login() {
  useStyles(css);
  useBodyClass('auth');
  const navigate = useNavigate();
  const toast = useToast();

  const remembered = session.rememberedUser('admin');
  const [f, setF] = useState({ username: remembered, password: '' });
  const [remember, setRemember] = useState(!!remembered);
  const [errs, setErrs] = useState({});
  const [formErr, setFormErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);

  const set = (k) => (e) => {
    setF((v) => ({ ...v, [k]: e.target.value }));
    setErrs((v) => ({ ...v, [k]: '' }));
    setFormErr('');
  };

  const submit = (e) => {
    e.preventDefault();
    setFormErr('');
    const next = {
      username: f.username.trim() ? '' : 'Please enter your username.',
      password: f.password ? '' : 'Please enter your password.'
    };
    setErrs(next);
    if (next.username || next.password) return;

    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      const ok = DEMO.user.includes(f.username.trim().toLowerCase()) && f.password === DEMO.pass;
      if (!ok) { setFormErr('Incorrect username or password. Try again.'); return; }
      session.signIn('admin');
      session.remember('admin', remember ? f.username.trim() : '');
      toast('Welcome back, Admin!');
      setTimeout(() => navigate('/admin/dashboard'), 600);
    }, 650);
  };

  return (
    <>
      <ThemeFloat />
      <main className="auth-wrap">
        <section className="auth-card" aria-label="Admin login">
          <AuthHero />

          <form className="auth-form" id="loginForm" noValidate onSubmit={submit}>
            <h2>ADMIN LOGIN</h2>
            <p className="lead">Welcome back, Admin! Sign in to manage PyPath.</p>

            <IconField id="username" icon="user" label="Username" type="text" placeholder="Username" autoComplete="username" value={f.username} onChange={set('username')} error={errs.username} />
            <PasswordField id="password" placeholder="Password" autoComplete="current-password" value={f.password} onChange={set('password')} error={errs.password} />

            <div className="opts">
              <label className="check"><input type="checkbox" id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
              <a href="#" id="forgotLink" onClick={(e) => { e.preventDefault(); setForgot(true); }}>Forgot password?</a>
            </div>

            <div className="err form-err" id="formErr" role="alert">{formErr}</div>
            <button className={`btn btn-grad btn-block${busy ? ' loading' : ''}`} type="submit" id="loginBtn">{busy ? 'Signing in…' : 'Log In'}</button>

            <div className="or"><span>OR</span></div>
            {['Google', 'Facebook', 'Apple'].map((p) => (
              <button key={p} type="button" className="btn btn-ghost btn-block social" onClick={() => toast(`${p} sign-in is not available in this demo.`, 'error')}>
                <Icon name={p.toLowerCase()} box />Continue with {p}
              </button>
            ))}
            <p className="demo">Demo account: <b>admin</b> / <b>admin123</b></p>
          </form>
        </section>
      </main>
      {forgot && <ForgotModal who="admin" placeholder="admin@pypath.com" onClose={() => setForgot(false)} />}
    </>
  );
}

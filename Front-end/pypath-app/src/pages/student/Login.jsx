import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import css from '../../styles/student/login.css?inline';
import useStyles from '../../hooks/useStyles';
import useBodyClass from '../../hooks/useBodyClass';
import { AuthHero, EMAIL_RE, IconField, PasswordField, ThemeFloat } from '../../components/Auth';
import ForgotModal from '../../components/ForgotModal';
import Icon from '../../components/Icon';
import { useToast } from '../../hooks/useToast';
import { studentStore } from '../../services/studentStore';
import { session } from '../../services/session';

/* Student login / sign up. Login: any username + password works (frontend demo).
   Sign Up also asks for email and a matching password, then switches back to Login.
   After logging in you go to the Home page. */
export default function Login() {
  useStyles(css);
  useBodyClass('auth');
  const navigate = useNavigate();
  const toast = useToast();

  const remembered = session.rememberedUser('student');
  const [isLogin, setIsLogin] = useState(true);
  const [f, setF] = useState({ username: remembered, password: '', email: '', confirm: '' });
  const [remember, setRemember] = useState(!!remembered);
  const [errs, setErrs] = useState({});
  const [formMsg, setFormMsg] = useState({ text: '', ok: false });
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);

  const set = (k) => (e) => {
    setF((v) => ({ ...v, [k]: e.target.value }));
    setErrs((v) => ({ ...v, [k]: '' }));
    setFormMsg({ text: '', ok: false });
  };

  const switchForm = () => {
    setIsLogin((v) => !v);
    setErrs({});
    setFormMsg({ text: '', ok: false });
  };

  const submit = (e) => {
    e.preventDefault();
    setFormMsg({ text: '', ok: false });
    const name = f.username.trim();
    const next = {
      username: name ? '' : 'Please enter your username.',
      password: f.password ? (!isLogin && f.password.length < 6 ? 'Use at least 6 characters.' : '') : 'Please enter your password.'
    };
    if (!isLogin) {
      next.email = EMAIL_RE.test(f.email.trim()) ? '' : 'Enter a valid email address.';
      next.confirm = f.confirm === f.password ? '' : 'Passwords do not match.';
    }
    setErrs(next);
    if (Object.values(next).some(Boolean)) return;

    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (!isLogin) {
        /* Sign Up: save the new account, then go back to Login */
        studentStore.update((s) => { s.user = name; s.name = name; s.email = f.email.trim(); });
        setIsLogin(true);
        setF((v) => ({ ...v, password: '', confirm: '' }));
        setFormMsg({ text: 'Account created successfully! You can now log in.', ok: true });
        toast('Account created');
        document.getElementById('password')?.focus();
        return;
      }
      const s = studentStore.get();
      if (name.toLowerCase() !== String(s.user).toLowerCase()) studentStore.update((d) => { d.user = name; d.name = name; });
      session.signIn('student');
      session.remember('student', remember ? name : '');
      toast(`Login successful! Welcome, ${name}.`);
      setTimeout(() => navigate('/student/home'), 700);
    }, 600);
  };

  return (
    <>
      <ThemeFloat />
      <main className="auth-wrap">
        <section className="auth-card" aria-label="Student login">
          <AuthHero />

          <form className="auth-form" id="loginForm" noValidate onSubmit={submit}>
            <h2 id="formTitle">{isLogin ? 'STUDENT LOGIN' : 'SIGN UP'}</h2>
            <p className="lead" id="formLead">{isLogin ? 'Welcome back! Sign in to continue learning.' : 'Create your PyPath account to start learning.'}</p>

            <IconField id="username" icon="user" label="Username" type="text" placeholder="Username" autoComplete="username" value={f.username} onChange={set('username')} error={errs.username} />

            {!isLogin && (
              <IconField id="email" icon="mail" label="Email" type="email" placeholder="Email" autoComplete="email" value={f.email} onChange={set('email')} error={errs.email} />
            )}

            <PasswordField id="password" placeholder="Password" autoComplete={isLogin ? 'current-password' : 'new-password'} value={f.password} onChange={set('password')} error={errs.password} />

            {!isLogin && (
              <IconField id="confirmPassword" icon="lock" label="Confirm password" type="password" placeholder="Confirm Password" autoComplete="new-password" value={f.confirm} onChange={set('confirm')} error={errs.confirm} />
            )}

            {isLogin && (
              <div className="opts" id="loginOpts">
                <label className="check"><input type="checkbox" id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
                <a href="#" id="forgotLink" onClick={(e) => { e.preventDefault(); setForgot(true); }}>Forgot password?</a>
              </div>
            )}

            <div className={`err form-err${formMsg.ok ? ' form-ok' : ''}`} id="formErr" role="alert">{formMsg.text}</div>
            <button className={`btn btn-grad btn-block${busy ? ' loading' : ''}`} type="submit" id="submitBtn">
              {busy ? (isLogin ? 'Signing in…' : 'Creating account…') : (isLogin ? 'Log In' : 'Create Account')}
            </button>

            <p className="switch">
              <span id="switchText">{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>{' '}
              <button type="button" id="switchBtn" onClick={switchForm}>{isLogin ? 'Sign Up' : 'Login'}</button>
            </p>

            <div className="or"><span>OR</span></div>
            {['Google', 'Facebook', 'Apple'].map((p) => (
              <button key={p} type="button" className="btn btn-ghost btn-block social" onClick={() => toast(`Continue with ${p} is not available in this demo.`, 'error')}>
                <Icon name={p.toLowerCase()} box />Continue with {p}
              </button>
            ))}
          </form>
        </section>
      </main>
      {forgot && <ForgotModal who="student" placeholder="juan@pypath.ph" onClose={() => setForgot(false)} />}
    </>
  );
}

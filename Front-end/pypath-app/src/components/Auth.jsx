import { useState } from 'react';
import Icon from './Icon';
import Img from './Img';
import { theme } from '../services/theme';
import useTheme from '../hooks/useTheme';

/* Light/dark button floating in the corner of the login pages */
export function ThemeFloat() {
  const dark = useTheme() === 'dark';
  return (
    <button className="icon-btn theme-float" id="themeBtn" type="button" aria-label="Switch light or dark mode" title={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => theme.toggle()}>
      <Icon name={dark ? 'sun' : 'moon'} />
    </button>
  );
}

/* Left side of both login cards: logo, message, mascot */
export function AuthHero() {
  return (
    <aside className="auth-hero">
      <div className="hero-logo"><Img file="logo-icon.png" label="Logo" /><b>PyPath</b></div>
      <h1>Start your Python journey,<br />one line at a time.</h1>
      <p>Learn, practice, and have fun as you build your coding skills. With PyPath, code your way and grow each day!</p>
      <div className="hero-art" aria-hidden="true">
        <span className="cloud c1" /><span className="cloud c2" />
        <Img file="mascot-cheer.png" label="Mascot" />
      </div>
    </aside>
  );
}

/* Icon + input (+ error text) row used by the login forms.
   right: extra node inside the input box (the show/hide eye) */
/* element ids of the error lines, same as the old pages */
const ERR_ID = { username: 'userErr', password: 'passErr', email: 'emailErr', confirmPassword: 'confirmErr' };

export function IconField({ id, icon, label, error, right, ...inputProps }) {
  return (
    <div className="field">
      <label className="sr" htmlFor={id}>{label}</label>
      <div className="input-ico">
        <Icon name={icon} box />
        <input className={`input${error ? ' bad' : ''}`} id={id} {...inputProps} />
        {right}
      </div>
      <div className="err" id={ERR_ID[id] || `${id}Err`}>{error}</div>
    </div>
  );
}

export function PasswordField({ id, label = 'Password', error, ...inputProps }) {
  const [show, setShow] = useState(false);
  return (
    <IconField
      id={id}
      icon="lock"
      label={label}
      error={error}
      type={show ? 'text' : 'password'}
      right={(
        <button type="button" className="eye" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((v) => !v)}>
          <Icon name={show ? 'eyeoff' : 'eye'} box />
        </button>
      )}
      {...inputProps}
    />
  );
}

export const EMAIL_RE = /^\S+@\S+\.\S+$/;

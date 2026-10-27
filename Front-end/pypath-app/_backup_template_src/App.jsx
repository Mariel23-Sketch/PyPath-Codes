import { useState } from 'react';
import './App.css';

function LoginPage() {
  const [showReset, setShowReset] = useState(false);
  return (
    <main className="auth">
      <button
        className="icon-btn theme-float"
        id="themeBtn"
        type="button"
        aria-label="Switch light or dark mode"
      />

      <div className="auth-wrap">
        <section className="auth-card" aria-label="Student login">
          <aside className="auth-hero">
            <div className="hero-logo">
              <img src="/assets/img/logo-icon.png" alt="" />
              <b>PyPath</b>
            </div>

            <h1>
              Start your Python journey,
              <br />
              one line at a time.
            </h1>

            <p>
              Learn, practice, and have fun as you build your coding
              skills. With PyPath, code your way and grow each day!
            </p>

            <div className="hero-art" aria-hidden="true">
              <span className="cloud c1" />
              <span className="cloud c2" />
              <img src="/assets/img/mascot-cheer.png" alt="" />
            </div>
          </aside>

          <form className="auth-form" id="loginForm" noValidate>
            <h2 id="formTitle">STUDENT LOGIN</h2>
            <p className="lead" id="formLead">
              Welcome back! Sign in to continue learning.
            </p>

            <div className="field">
              <label className="sr" htmlFor="username">
                Username
              </label>
              <div className="input-ico">
                <span data-icon="user" />
                <input
                  className="input"
                  id="username"
                  type="text"
                  placeholder="Username"
                  autoComplete="username"
                />
              </div>
              <div className="err" id="userErr" />
            </div>

            <div className="field" id="emailField" hidden>
              <label className="sr" htmlFor="email">
                Email
              </label>
              <div className="input-ico">
                <span data-icon="mail" />
                <input
                  className="input"
                  id="email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                />
              </div>
              <div className="err" id="emailErr" />
            </div>

            <div className="field">
              <label className="sr" htmlFor="password">
                Password
              </label>
              <div className="input-ico">
                <span data-icon="lock" />
                <input
                  className="input"
                  id="password"
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="eye"
                  id="pwToggle"
                  aria-label="Show password"
                >
                  <span data-icon="eye" id="eyeIco" />
                </button>
              </div>
              <div className="err" id="passErr" />
            </div>

            <div className="field" id="confirmField" hidden>
              <label className="sr" htmlFor="confirmPassword">
                Confirm password
              </label>
              <div className="input-ico">
                <span data-icon="lock" />
                <input
                  className="input"
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                />
              </div>
              <div className="err" id="confirmErr" />
            </div>

            <div className="opts" id="loginOpts">
              <label className="check">
                <input type="checkbox" id="remember" /> Remember me
              </label>
              <a
                href="#"
                id="forgotLink"
                onClick={(e) => {
                  e.preventDefault();
                  setShowReset(true);
                }}
              >
                Forgot password?
              </a>
            </div>
            
            <div className="err form-err" id="formErr" role="alert" />
            <button
              className="btn btn-grad btn-block"
              type="submit"
              id="submitBtn"
            >
              Log In
            </button>

            <p className="switch">
              <span id="switchText">Don't have an account?</span>{' '}
              <button type="button" id="switchBtn">
                Sign Up
              </button>
            </p>

            <div className="or">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-block social"
              data-p="Google"
            >
              <span data-icon="google" />
              Continue with Google
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-block social"
              data-p="Facebook"
            >
              <span data-icon="facebook" />
              Continue with Facebook
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-block social"
              data-p="Apple"
            >
              <span data-icon="apple" />
              Continue with Apple
            </button>
          </form>
        </section>
      </div>

            {showReset && (
        <div className="modal-backdrop" onClick={() => setShowReset(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resetTitle"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="resetTitle">Reset password</h3>
            <p>
              Enter your student email and we'll send you a reset link
              (demo only).
            </p>
            <div className="field">
              <label htmlFor="resetEmail">Email</label>
              <input
                className="input input-plain"
                id="resetEmail"
                type="email"
                placeholder="juan@pypath.ph"
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowReset(false)}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-grad">
                Send link
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="toasts" id="toasts" />
    </main>
  );
}

export default LoginPage;

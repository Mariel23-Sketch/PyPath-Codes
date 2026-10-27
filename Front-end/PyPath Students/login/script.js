/* PyPath Student – Login page
   Login: any username + password works (frontend demo).
   Sign Up: also asks for email and a matching password, then switches back to Login.
   After logging in you go to the Home page. */
(function () {
  const $ = (id) => document.getElementById(id);
  const form = $('loginForm'), user = $('username'), pass = $('password');
  const email = $('email'), confirm = $('confirmPassword');
  let isLogin = true;

  /* (the light / dark button at the top right is handled by main-ui/script.js) */

  /* remembered username */
  try {
    const saved = localStorage.getItem('pypath_student_user');
    if (saved) { user.value = saved; $('remember').checked = true; }
  } catch (e) {}

  /* show / hide password */
  $('pwToggle').addEventListener('click', () => {
    const show = pass.type === 'password';
    pass.type = show ? 'text' : 'password';
    $('eyeIco').innerHTML = PP.i(show ? 'eyeoff' : 'eye');
    $('pwToggle').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });

  /* switch between Login and Sign Up */
  function switchForm() {
    isLogin = !isLogin;
    $('formTitle').textContent = isLogin ? 'STUDENT LOGIN' : 'SIGN UP';
    $('formLead').textContent = isLogin ? 'Welcome back! Sign in to continue learning.' : 'Create your PyPath account to start learning.';
    $('submitBtn').textContent = isLogin ? 'Log In' : 'Create Account';
    $('switchText').textContent = isLogin ? "Don't have an account?" : 'Already have an account?';
    $('switchBtn').textContent = isLogin ? 'Sign Up' : 'Login';
    $('emailField').hidden = isLogin;
    $('confirmField').hidden = isLogin;
    $('loginOpts').hidden = !isLogin;
    pass.autocomplete = isLogin ? 'current-password' : 'new-password';
    clearErrors();
  }
  $('switchBtn').addEventListener('click', switchForm);

  function flag(input, errEl, msg) {
    input.classList.toggle('bad', !!msg);
    errEl.textContent = msg || '';
    return !msg;
  }
  function clearErrors() {
    [user, pass, email, confirm].forEach((el) => el.classList.remove('bad'));
    ['userErr', 'passErr', 'emailErr', 'confirmErr', 'formErr'].forEach((id) => ($(id).textContent = ''));
    $('formErr').classList.remove('form-ok');
  }
  [user, pass, email, confirm].forEach((el) => el.addEventListener('input', () => {
    el.classList.remove('bad');
    const map = { username: 'userErr', password: 'passErr', email: 'emailErr', confirmPassword: 'confirmErr' };
    $(map[el.id]).textContent = '';
    $('formErr').textContent = '';
  }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    $('formErr').textContent = '';
    const name = user.value.trim();
    let ok = flag(user, $('userErr'), name ? '' : 'Please enter your username.');
    ok = flag(pass, $('passErr'), pass.value ? (!isLogin && pass.value.length < 6 ? 'Use at least 6 characters.' : '') : 'Please enter your password.') && ok;
    if (!isLogin) {
      ok = flag(email, $('emailErr'), /^\S+@\S+\.\S+$/.test(email.value.trim()) ? '' : 'Enter a valid email address.') && ok;
      ok = flag(confirm, $('confirmErr'), confirm.value === pass.value ? '' : 'Passwords do not match.') && ok;
    }
    if (!ok) return;

    const btn = $('submitBtn');
    btn.classList.add('loading');
    btn.textContent = isLogin ? 'Signing in…' : 'Creating account…';

    setTimeout(() => {
      btn.classList.remove('loading');
      const s = PP.store.get();
      if (!isLogin) {
        /* Sign Up: save the new account, then go back to Login */
        s.user = name; s.name = name; s.email = email.value.trim();
        PP.store.save();
        switchForm();
        pass.value = ''; confirm.value = '';
        $('formErr').classList.add('form-ok');
        $('formErr').textContent = 'Account created successfully! You can now log in.';
        PP.toast('Account created');
        pass.focus();
        return;
      }
      /* Login */
      btn.textContent = 'Log In';
      if (name.toLowerCase() !== String(s.user).toLowerCase()) { s.user = name; s.name = name; PP.store.save(); }
      try {
        sessionStorage.setItem('pypath_student_in', '1');
        if ($('remember').checked) localStorage.setItem('pypath_student_user', name);
        else localStorage.removeItem('pypath_student_user');
      } catch (err) {}
      PP.toast('Login successful! Welcome, ' + name + '.');
      setTimeout(() => { location.href = '../home/index.html'; }, 700);
    }, 600);
  });

  /* forgot password */
  $('forgotLink').addEventListener('click', (e) => { e.preventDefault(); PP.openModal('forgotModal'); });
  $('sendReset').addEventListener('click', () => {
    const v = $('resetEmail').value.trim();
    if (!/^\S+@\S+\.\S+$/.test(v)) { $('resetErr').textContent = 'Enter a valid email address.'; return; }
    $('resetErr').textContent = '';
    PP.closeModal('forgotModal');
    PP.toast('Reset link sent to ' + v);
  });

  /* social buttons (frontend demo only) */
  document.querySelectorAll('.social').forEach((b) => b.addEventListener('click', () => PP.toast('Continue with ' + b.dataset.p + ' is not available in this demo.', 'error')));
})();

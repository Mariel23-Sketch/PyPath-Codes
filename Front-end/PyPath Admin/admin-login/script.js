(function () {
  const $ = (id) => document.getElementById(id);
  const form = $('loginForm'), user = $('username'), pass = $('password');
  const DEMO = { user: ['admin', 'admin@pypath.com'], pass: 'admin123' };

  PP.hydrate();

  // Remembered username
  try {
    const saved = localStorage.getItem('pypath_admin_user');
    if (saved) { user.value = saved; $('remember').checked = true; }
  } catch (e) {}

  // Show / hide password
  $('pwToggle').addEventListener('click', () => {
    const show = pass.type === 'password';
    pass.type = show ? 'text' : 'password';
    $('eyeIco').innerHTML = PP.i(show ? 'eyeoff' : 'eye');
    $('pwToggle').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });

  function flag(input, errEl, msg) {
    input.classList.toggle('bad', !!msg);
    errEl.textContent = msg || '';
    return !msg;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    $('formErr').textContent = '';
    const okU = flag(user, $('userErr'), user.value.trim() ? '' : 'Please enter your username.');
    const okP = flag(pass, $('passErr'), pass.value ? '' : 'Please enter your password.');
    if (!okU || !okP) return;

    const btn = $('loginBtn');
    btn.textContent = 'Signing in…';
    btn.classList.add('loading');

    setTimeout(() => {
      btn.classList.remove('loading');
      btn.textContent = 'Log In';
      const ok = DEMO.user.includes(user.value.trim().toLowerCase()) && pass.value === DEMO.pass;
      if (!ok) { $('formErr').textContent = 'Incorrect username or password. Try again.'; return; }
      try {
        sessionStorage.setItem('pypath_admin', '1');
        if ($('remember').checked) localStorage.setItem('pypath_admin_user', user.value.trim());
        else localStorage.removeItem('pypath_admin_user');
      } catch (err) {}
      PP.toast('Welcome back, Admin!');
      setTimeout(() => { location.href = '../admin-dashboard/index.html'; }, 600);
    }, 650);
  });

  [user, pass].forEach((el) => el.addEventListener('input', () => {
    el.classList.remove('bad');
    $(el === user ? 'userErr' : 'passErr').textContent = '';
    $('formErr').textContent = '';
  }));

  // Forgot password
  $('forgotLink').addEventListener('click', (e) => { e.preventDefault(); PP.openModal('forgotModal'); });
  $('sendReset').addEventListener('click', () => {
    const v = $('resetEmail').value.trim();
    if (!/^\S+@\S+\.\S+$/.test(v)) { $('resetErr').textContent = 'Enter a valid email address.'; return; }
    $('resetErr').textContent = '';
    PP.closeModal('forgotModal');
    PP.toast('Reset link sent to ' + v);
  });

  // Social buttons (frontend demo only)
  document.querySelectorAll('.social').forEach((b) => b.addEventListener('click', () => PP.toast(b.dataset.p + ' sign-in is not available in this demo.', 'error')));
})();

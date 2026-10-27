/* PyPath Student – Profile
   Tabs (switch with the # in the address): #profile  #security  #appearance
   Saving your name here updates the greeting and top bar on every page. */
(function () {
  const $ = (id) => document.getElementById(id);
  const D = PP.DATA, esc = PP.esc;
  const S = () => PP.store.get();
  PP.hydrate();

  function renderHeader() {
    const s = S();
    const modsDone = D.modules.filter((m) => PP.moduleStatus(m) === 'Completed').length;
    const quizDone = Object.keys(s.quiz).length;
    $('pName').textContent = s.name;
    $('pEmail').textContent = s.email + ' · @' + s.user;
    $('pChips').innerHTML = PP.statusChip('Student') + PP.chip(s.level, 'green') + PP.chip(s.streak + '-day streak', 'orange');
    const ps = (label, val) => '<div class="ps"><small>' + label + '</small><b>' + val + '</b></div>';
    $('pStats').innerHTML = ps('Level', esc(s.level)) + ps('Points', s.points.toLocaleString('en-US')) + ps('Modules Completed', modsDone) + ps('Quizzes Completed', quizDone) + ps('Rank', '#' + s.rank);
  }

  /* form fields (same helper style as the admin page) */
  const fld = (k, label, v, o) => {
    o = o || {};
    const t = o.t || 'text', w = o.w ? ' w' : '';
    if (t === 'seg') return '<div class="field' + w + '"><span class="label">' + label + '</span><div class="radios">' + o.o.map((x) => '<label class="radio"><input type="radio" name="' + k + '" value="' + x + '"' + (x === v ? ' checked' : '') + '>' + x + '</label>').join('') + '</div></div>';
    const c = t === 'select' ? '<select class="select" name="' + k + '">' + o.o.map((x) => '<option' + (x === v ? ' selected' : '') + '>' + esc(x) + '</option>').join('') + '</select>'
      : '<input class="input" name="' + k + '" type="' + t + '" value="' + esc(v || '') + '"' + (o.req ? ' required' : '') + (o.ph ? ' placeholder="' + o.ph + '"' : '') + '>';
    return '<label class="field' + w + '"><span class="label">' + label + (o.req ? ' <span class="req">*</span>' : '') + '</span>' + c + '</label>';
  };

  const TABS = {
    profile() {
      const s = S();
      return {
        fields: fld('name', 'Full name', s.name, { req: 1 }) + fld('user', 'Username', s.user, { req: 1 }) + fld('email', 'Email', s.email, { t: 'email', req: 1 }) + fld('phone', 'Phone', s.phone, { t: 'tel', ph: '09xx xxx xxxx' }) + fld('level', 'Learning level', s.level, { t: 'select', o: ['Beginner', 'Intermediate', 'Advanced'], w: 1 }),
        acts: '<button class="btn btn-primary" type="submit">' + PP.i('check') + 'Save changes</button>'
      };
    },
    security() {
      return {
        fields: fld('cur', 'Current password', '', { t: 'password', w: 1 }) + fld('nw', 'New password', '', { t: 'password' }) + fld('cf', 'Confirm new password', '', { t: 'password' }),
        acts: '<button class="btn btn-primary" type="submit">' + PP.i('lock') + 'Change password</button>'
      };
    },
    appearance() {
      return {
        fields: fld('theme', 'Theme', PP.theme.get(), { t: 'seg', o: ['Light', 'Dark', 'System'], w: 1 }) +
          '<div class="danger-zone w"><div><b>Reset demo data</b><small>Puts points, lessons and quiz scores back to the sample values.</small></div><button type="button" class="btn btn-ghost btn-sm" id="resetData" style="color:var(--red)">' + PP.i('refresh') + 'Reset</button></div>',
        acts: ''
      };
    }
  };

  let tab = 'profile';
  function render() {
    renderHeader();
    document.querySelectorAll('#tabs .pill').forEach((p) => p.classList.toggle('on', p.dataset.t === tab));
    const t = TABS[tab]();
    $('fields').innerHTML = t.fields;
    $('formActs').innerHTML = t.acts;
    $('formErr').textContent = '';
  }

  $('pf').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target, fd = Object.fromEntries(new FormData(f)), err = $('formErr');
    err.textContent = '';
    if (tab === 'profile') {
      if (!fd.name.trim() || !fd.user.trim()) { err.textContent = 'Name and username are required.'; return; }
      if (!/^\S+@\S+\.\S+$/.test(fd.email.trim())) { err.textContent = 'Enter a valid email address.'; return; }
      const s = S();
      s.name = fd.name.trim(); s.user = fd.user.trim(); s.email = fd.email.trim(); s.phone = fd.phone.trim(); s.level = fd.level;
      PP.store.save();
      PP.toast('Profile saved');
      render();
    } else if (tab === 'security') {
      if (!fd.cur) { err.textContent = 'Enter your current password.'; return; }
      if (fd.nw.length < 8) { err.textContent = 'New password needs at least 8 characters.'; return; }
      if (fd.nw !== fd.cf) { err.textContent = 'New passwords don’t match.'; return; }
      f.querySelectorAll('input[type=password]').forEach((i) => (i.value = ''));
      PP.toast('Password changed (demo only)');
    }
  });

  /* theme changes right away when you pick one */
  $('pf').addEventListener('change', (e) => { if (e.target.name === 'theme') { PP.theme.set(e.target.value); PP.toast('Theme set to ' + e.target.value); } });
  $('pf').addEventListener('click', async (e) => {
    if (!e.target.closest('#resetData')) return;
    if (!(await PP.confirm({ title: 'Reset demo data?', text: 'Your points, finished lessons, quiz scores and redeemed rewards go back to the sample values.', confirm: 'Reset', icon: 'refresh' }))) return;
    PP.store.reset();
    PP.toast('Demo data reset');
    render();
  });
  $('photoBtn').addEventListener('click', () => PP.toast('To change the photo, put your picture in assets/img/avatar.png'));

  function route() {
    const t = location.hash.replace('#', '');
    tab = TABS[t] ? t : 'profile';
    render();
  }
  window.addEventListener('hashchange', route);
  document.addEventListener('pp-store', renderHeader);
  document.addEventListener('pp-theme', () => { if (tab === 'appearance') render(); });
  route();
})();

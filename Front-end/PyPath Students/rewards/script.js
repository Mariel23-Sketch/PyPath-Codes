/* PyPath Student – Points & Rewards
   Tabs (switch with the # in the address): #badges  #rewards  #earn  #history
   Badges unlock when your total points reach their target.
   Redeeming a reward takes its cost from your points (saved in this browser). */
(function () {
  const $ = (id) => document.getElementById(id);
  const D = PP.DATA, esc = PP.esc;
  const S = () => PP.store.get();
  const fmt = (n) => n.toLocaleString('en-US');
  /* badges use every point you ever earned, so redeeming a reward never takes a badge away */
  const lifetime = () => { const s = S(); return s.points + s.history.filter((h) => h.pts < 0).reduce((a, h) => a - h.pts, 0); };
  PP.hydrate();

  function renderTop() {
    const s = S(), life = lifetime(), earned = D.badges.filter((b) => life >= b.pts), next = D.badges.find((b) => life < b.pts);
    $('heroPts').textContent = fmt(s.points);
    $('heroSub').textContent = 'You have earned ' + earned.length + ' of ' + D.badges.length + ' badges. Keep learning to unlock more!';
    $('nextBadge').innerHTML = next
      ? '<small><span>Next badge: ' + esc(next.name) + '</span><span>' + fmt(life) + ' / ' + fmt(next.pts) + '</span></small><div class="bar"><i style="width:' + Math.round((life / next.pts) * 100) + '%"></i></div>'
      : '<small><span>You unlocked every badge!</span></small>';
    const stat = (tone, icon, label, val, sub) => '<div class="card stat"><span class="tile ' + tone + '">' + PP.i(icon) + '</span><small>' + label + '</small><b>' + val + '</b><span class="vs">' + sub + '</span></div>';
    const spent = s.history.filter((h) => h.pts < 0).reduce((a, h) => a - h.pts, 0);
    $('rwStats').innerHTML =
      stat('t-yellow', 'star', 'Total Points', fmt(s.points), 'Available to spend') +
      stat('t-purple', 'award', 'Badges Earned', earned.length + '<span>/ ' + D.badges.length + '</span>', 'From points you earned') +
      stat('t-green', 'gift', 'Rewards Redeemed', s.redeemed.length, fmt(spent) + ' pts spent') +
      stat('t-orange', 'flame', 'Day Streak', s.streak + '<span>days</span>', '+' + D.rules.streak + ' pts per day');
  }

  const TABS = {
    badges() {
      const life = lifetime();
      return '<div class="badge-grid">' + D.badges.map((b) => {
        const got = life >= b.pts, pct = Math.min(100, Math.round((life / b.pts) * 100));
        return '<div class="card bdg' + (got ? '' : ' locked') + '"><span class="tile ' + b.color + '">' + PP.i(got ? 'award' : 'lock') + '</span><h3>' + esc(b.name) + '</h3>' +
          '<div class="row">' + PP.chip(fmt(b.pts) + ' pts', 'blue') + PP.statusChip(got ? 'Earned' : 'Locked') + '</div><p>' + esc(b.desc) + '</p>' +
          (got ? '' : '<div class="pc"><div class="bar"><i style="width:' + pct + '%"></i></div><b>' + pct + '%</b></div>') + '</div>';
      }).join('') + '</div>';
    },
    rewards() {
      const s = S();
      return '<div class="reward-grid">' + D.rewards.map((r) => {
        const owned = s.redeemed.filter((x) => x === r.id).length, left = r.stock - owned, short = r.cost - s.points;
        const btn = left <= 0 ? '<button class="btn btn-ghost" disabled>Sold out</button>'
          : short > 0 ? '<button class="btn btn-ghost" disabled>' + PP.i('lock') + 'Need ' + fmt(short) + ' more pts</button>'
          : '<button class="btn btn-primary" data-redeem="' + r.id + '">' + PP.i('gift') + 'Redeem</button>';
        return '<div class="card rw"><div class="rw-img ' + r.tone + '">' + PP.i(r.icon) + '</div><h3>' + esc(r.name) + '</h3>' +
          '<div class="rw-cost">' + PP.i('star') + fmt(r.cost) + ' pts</div><small>' + (r.stock > 100 ? 'Always available' : left + ' left in stock') + (owned ? ' · You own ' + owned : '') + '</small>' + btn + '</div>';
      }).join('') + '</div>';
    },
    earn() {
      const r = D.rules;
      const row = (tone, icon, t, sub, pts) => '<div class="earn"><span class="tile ' + tone + '">' + PP.i(icon) + '</span><div><b>' + t + '</b><small>' + sub + '</small></div><span class="plus">' + pts + '</span></div>';
      return '<div class="card"><div class="card-title">' + PP.i('star') + 'How to earn points</div><div class="earn-list">' +
        row('t-blue', 'book', 'Finish a lesson', 'Mark a lecture as done', '+' + r.lesson) +
        row('t-purple', 'quiz', 'Pass a quiz', 'Score ' + 60 + '% or higher', '+' + r.quiz) +
        row('t-green', 'code', 'Solve an exercise', 'Points shown on each exercise', '+10 to +40') +
        row('t-orange', 'flame', 'Keep your streak', 'Learn every day', '+' + r.streak + ' / day') +
        '</div></div>';
    },
    history() {
      const h = S().history;
      return '<div class="card"><div class="table-wrap"><table class="table stack"><thead><tr><th>Activity</th><th>Date</th><th style="width:120px">Points</th></tr></thead><tbody>' +
        (h.length ? h.map((x) => '<tr><td class="primary cell-strong" data-label="Activity">' + esc(x.what) + '</td><td data-label="Date">' + esc(x.date) + '</td><td data-label="Points"><span class="' + (x.pts >= 0 ? 'pts-plus' : 'pts-minus') + '">' + (x.pts >= 0 ? '+' : '−') + fmt(Math.abs(x.pts)) + '</span></td></tr>').join('')
          : '<tr><td colspan="3" class="empty">No points yet.</td></tr>') + '</tbody></table></div></div>';
    }
  };

  let tab = 'badges';
  function render() {
    renderTop();
    document.querySelectorAll('#tabs .pill').forEach((p) => p.classList.toggle('on', p.dataset.t === tab));
    $('tabBody').innerHTML = TABS[tab]();
  }

  $('tabBody').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-redeem]'); if (!b) return;
    const r = D.rewards.find((x) => x.id === +b.dataset.redeem), s = S();
    if (!(await PP.confirm({ title: 'Redeem ' + r.name + '?', text: fmt(r.cost) + ' points will be taken from your ' + fmt(s.points) + ' points.', confirm: 'Redeem', icon: 'gift', primary: true }))) return;
    s.redeemed.push(r.id);
    PP.store.earn(-r.cost, 'Redeemed ' + r.name);
    PP.toast(r.name + ' redeemed! Your teacher will hand it over.');
    render();
  });

  function route() {
    const t = location.hash.replace('#', '');
    tab = TABS[t] ? t : 'badges';
    render();
  }
  window.addEventListener('hashchange', route);
  route();
})();

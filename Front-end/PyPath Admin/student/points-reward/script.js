/* PyPath Student – Points and Reward page.
   All balances, awards and redemptions go through PP.store; this file only draws and asks. */
(function (PP) {
const $ = (s) => document.querySelector(s);
const esc = PP.esc, ic = (n) => PP.i(n);
const IMG = '../../assets/img/';
const store = PP.store, fmt = (n) => Number(n).toLocaleString();
const TABS = [['badges', 'Badges'], ['rewards', 'Redeem Rewards'], ['earn', 'How to Earn'], ['history', 'Points History']];
const TILE = { blue: 't-blue', green: 't-green', purple: 't-purple', yellow: 't-yellow', red: 't-red', pink: 't-pink', orange: 't-orange' };
const S = { tab: 'badges', page: 1, per: 10 };
const fromHash = () => { const h = location.hash.slice(1); return TABS.some((t) => t[0] === h) ? h : 'badges'; };
S.tab = fromHash();

const when = (ts) => new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const TYPE = { lesson: ['Lesson', 'blue'], quiz: ['Quiz', 'purple'], practice: ['Exercise', 'green'], course: ['Course', 'orange'], streak: ['Streak', 'orange'], redeem: ['Reward', 'red'] };

/* ---------- sections ---------- */
function hero(m) {
  const all = !m.next, pct = all ? 100 : Math.min(100, Math.round(m.next.have / m.next.pts * 100));
  return `<section class="card pr-hero" aria-label="Your points">
    <div class="pr-hero-copy">
      <span class="pr-tag">Your points</span>
      <h2><span id="heroPts">${fmt(m.balance)}</span> points</h2>
      <p>${all ? 'You unlocked every badge. Amazing work!' : `You have earned ${m.badgesEarned} of ${m.badgesTotal} badges. Keep learning to unlock more!`}</p>
      <div class="pr-next"><b>${all ? 'All badges unlocked' : 'Next badge: ' + esc(m.next.name)}</b><span>${all ? '' : fmt(m.next.have) + ' / ' + fmt(m.next.pts)}</span></div>
      <div class="pr-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div>
    </div>
    <div class="pr-hero-art" aria-hidden="true">
      <span class="pr-cloud"></span><img src="${IMG}mascot-star.png" alt="">
      <i class="spk a"></i><i class="spk b"></i><i class="spk c"></i><i class="spk d"></i>
    </div>
  </section>`;
}
function stats(m) {
  const card = (tile, icon, label, val, unit, sub) => `<div class="card stat"><span class="tile ${tile}">${ic(icon)}</span><small>${label}</small><b>${val}${unit ? `<em>${unit}</em>` : ''}</b><span class="stat-sub">${sub}</span></div>`;
  return `<div class="stats">
    ${card('t-yellow', 'star', 'Total Points', fmt(m.balance), '', 'Available to spend')}
    ${card('t-purple', 'award', 'Badges Earned', m.badgesEarned, '/ ' + m.badgesTotal, 'From points you earned')}
    ${card('t-green', 'gift', 'Rewards Redeemed', m.redeemed, '', fmt(m.spent) + ' pts spent')}
    ${card('t-orange', 'flame', 'Day Streak', m.streak, m.streak === 1 ? 'day' : 'days', '+' + m.streakBonus + ' pts per day')}
  </div>`;
}
const tabs = () => `<div class="pills" role="tablist" aria-label="Points and Reward sections">${TABS.map(([k, n]) => `<button class="pill${S.tab === k ? ' on' : ''}" role="tab" aria-selected="${S.tab === k}" data-tab="${k}">${n}</button>`).join('')}</div>`;

function badgesPanel() {
  return `<div class="badge-grid">${store.badges().map((b) => {
    const left = Math.max(0, b.pts - b.have), pct = Math.min(100, Math.round(b.have / b.pts * 100));
    return `<article class="card bdg${b.earned ? '' : ' locked'}">
      <span class="tile ${b.earned ? TILE[b.color] : 't-lock'}">${ic(b.earned ? 'award' : 'lock')}</span>
      <h3>${esc(b.name)}</h3>
      <p>${esc(b.desc)}</p>
      <div class="bdg-foot">${b.earned ? PP.chip('Earned', 'green') : `<div class="pr-bar sm"><i style="width:${pct}%"></i></div><small>${fmt(left)} more pts</small>`}<span class="bdg-pts">${fmt(b.pts)} pts</span></div>
    </article>`;
  }).join('')}</div>`;
}

function rewardsPanel(m) {
  const list = store.rewards();
  const btn = (r) => ({
    redeemed: `<button class="btn btn-soft btn-block" disabled>${ic('check')}Redeemed</button>`,
    soldout: `<button class="btn btn-ghost btn-block" disabled>Out of stock</button>`,
    short: `<button class="btn btn-ghost btn-block" data-redeem="${r.id}" aria-label="Redeem ${esc(r.name)} (not enough points)">${ic('lock')}Redeem</button>`,
    available: `<button class="btn btn-primary btn-block" data-redeem="${r.id}" aria-label="Redeem ${esc(r.name)}">${ic('gift')}Redeem</button>`
  })[r.status];
  const note = (r) => ({
    redeemed: PP.chip('Redeemed', 'green'),
    soldout: PP.chip('Out of stock', 'red'),
    short: PP.chip('Need ' + fmt(r.need) + ' more pts', 'orange'),
    available: PP.chip('Available', 'blue')
  })[r.status];
  return `<p class="pr-balance-note">Your balance: <b>${fmt(m.balance)} pts</b></p>
  <div class="rw-grid">${list.map((r) => `<article class="card rw ${r.status}">
    <span class="tile lg ${TILE[r.color] || 't-blue'}">${ic(r.icon)}</span>
    <div class="rw-top"><h3>${esc(r.name)}</h3>${note(r)}</div>
    <p>${esc(r.desc)}</p>
    <div class="rw-meta"><span class="rw-cost">${ic('star')}${fmt(r.cost)} pts</span>${r.stock < 999 ? `<small>${r.left} left</small>` : ''}</div>
    ${btn(r)}
  </article>`).join('')}</div>`;
}

function earnPanel(m) {
  const R = store.rules();
  const row = (tile, icon, t, d, pts) => `<div class="earn-row"><span class="tile ${tile}">${ic(icon)}</span><div><b>${t}</b><small>${d}</small></div><span class="earn-pts">+${pts} pts</span></div>`;
  const acts = store.ACTIVITIES.map((a) => {
    const done = store.isDone(a.type, a.id);
    const act = done ? `<span class="chip chip-green">Done</span>`
      : a.needsScore ? `<div class="acts"><button class="btn btn-soft btn-sm" data-do="${a.type}|${a.id}|85">Pass (85%)</button><button class="btn btn-ghost btn-sm" data-do="${a.type}|${a.id}|55">Fail (55%)</button></div>`
      : `<button class="btn btn-soft btn-sm" data-do="${a.type}|${a.id}|">Complete</button>`;
    return `<div class="demo-row"><span>${esc(a.label)}<small>+${R[a.type]} pts</small></span>${act}</div>`;
  }).join('');
  return `<div class="card"><div class="card-title">${ic('star')}Ways to earn points</div>
    <div class="earn-list">
      ${row('t-blue', 'book', 'Complete a lesson', 'Finish every step of a lesson.', R.lesson)}
      ${row('t-purple', 'quiz', 'Pass a quiz', 'Score at least ' + store.PASS_MARK + '% on a quiz.', R.quiz)}
      ${row('t-green', 'code', 'Complete a programming exercise', 'Submit a working solution.', R.practice)}
      ${row('t-orange', 'award', 'Complete a course', 'Finish all lessons in a course.', R.course)}
      ${row('t-yellow', 'flame', 'Learn every day', 'Open PyPath and learn each day to grow your streak.', R.streak)}
    </div>
    <p class="note-line">Points are awarded once per lesson, quiz, exercise or course, so repeating the same one doesn’t add more.</p>
  </div>
  <div class="card demo"><div class="card-title">${ic('play')}Try it out <span class="chip chip-purple push">Prototype demo</span></div>
    <p class="note-line top">There is no lesson player in this preview yet. Use these buttons to see how points are awarded. Each one can only pay out once.</p>
    ${acts}
    <div class="demo-row"><span>Daily check-in<small>+${R.streak} pts, once per day</small></span><button class="btn btn-soft btn-sm" data-checkin>Check in today</button></div>
    <div class="demo-foot"><button class="link-btn" data-reset>Reset demo data</button></div>
  </div>`;
}

function historyPanel() {
  const all = store.history(), pages = Math.max(1, Math.ceil(all.length / S.per));
  if (S.page > pages) S.page = pages;
  const rows = all.slice((S.page - 1) * S.per, S.page * S.per);
  return `<div class="card"><div class="table-wrap">${rows.length ? `<table class="table stack"><thead><tr><th>Activity</th><th>Type</th><th>Date</th><th style="text-align:right">Points</th></tr></thead><tbody>${rows.map((x) => {
    const t = TYPE[x.type] || ['Other', 'blue'];
    return `<tr><td class="primary"><span class="cell-strong">${esc(x.label)}</span></td><td data-label="Type">${PP.chip(t[0], t[1])}</td><td data-label="Date">${when(x.ts)}</td><td data-label="Points" class="pts-cell ${x.pts < 0 ? 'neg' : 'pos'}">${x.pts > 0 ? '+' : '−'}${fmt(Math.abs(x.pts))}</td></tr>`;
  }).join('')}</tbody></table>` : `<div class="empty"><img src="${IMG}mascot-sad.png" alt="">No points activity yet.</div>`}</div><div class="pager" id="pager"></div></div>`;
}

/* ---------- render ---------- */
function draw() {
  const m = store.summary();
  const panel = { badges: badgesPanel, rewards: () => rewardsPanel(m), earn: () => earnPanel(m), history: historyPanel }[S.tab]();
  $('#pg').innerHTML = hero(m) + stats(m) + tabs() + `<div id="panel" role="tabpanel">${panel}</div>`;
  if (S.tab === 'history') PP.pager($('#pager'), { total: store.history().length, page: S.page, per: S.per, onPage: (p) => { S.page = p; draw(); }, onPer: (n) => { S.per = n; S.page = 1; draw(); } });
  PP.hydrate();
}

/* ---------- actions ---------- */
function confirmRedeem(id) {
  const r = store.rewards().find((x) => x.id === +id); if (!r) return;
  const have = store.balance();
  if (r.status === 'redeemed') return PP.toast('You have already redeemed this reward.', 'error');
  if (r.status === 'soldout') return PP.toast('Sorry, this reward is out of stock.', 'error');
  if (r.status === 'short') return PP.toast('Not enough points. You need ' + fmt(r.need) + ' more pts to redeem ' + r.name + '.', 'error');
  const d = document.createElement('div');
  d.className = 'modal-backdrop open'; d.dataset.dynamic = '1';
  d.innerHTML = `<div class="modal modal-sm" role="dialog" aria-modal="true" aria-label="Redeem ${esc(r.name)}"><div class="confirm-ico ok">${ic('gift')}</div><h3>Redeem ${esc(r.name)}?</h3>
    <p><b>${fmt(r.cost)} pts</b> will be deducted from your balance.<br>You will have <b>${fmt(have - r.cost)} pts</b> left.</p>
    <div class="modal-foot center"><button class="btn btn-ghost" data-v="0">Cancel</button><button class="btn btn-primary" data-v="1">Redeem</button></div></div>`;
  document.body.appendChild(d);
  const ok = d.querySelector('[data-v="1"]'); ok.focus();
  d.addEventListener('click', (e) => {
    if (e.target === d) return d.remove();
    const b = e.target.closest('[data-v]'); if (!b) return;
    if (b.dataset.v === '0') return d.remove();
    d.querySelectorAll('button').forEach((x) => (x.disabled = true));    /* no double clicks */
    const res = store.redeem(id);
    d.remove();
    if (res.ok) PP.toast(res.reward + ' redeemed! ' + fmt(res.cost) + ' pts deducted. Balance: ' + fmt(res.balance) + ' pts.');
    else PP.toast(res.error, 'error');
    draw();
  });
}

function pointsToast(res) {
  if (!res.ok) return PP.toast(res.error, 'error');
  PP.toast('+' + res.points + ' pts earned!' + (res.unlocked && res.unlocked.length ? ' Badge unlocked: ' + res.unlocked.join(', ') + '.' : ''));
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-tab]');
  if (t) { S.tab = t.dataset.tab; S.page = 1; history.replaceState(null, '', '#' + S.tab); draw(); return; }
  const r = e.target.closest('[data-redeem]'); if (r) { confirmRedeem(r.dataset.redeem); return; }
  const g = e.target.closest('[data-do]');
  if (g) { const [type, id, score] = g.dataset.do.split('|'); pointsToast(store.complete({ type, id, score: score === '' ? undefined : +score, label: g.closest('.demo-row').querySelector('span').firstChild.textContent })); draw(); return; }
  if (e.target.closest('[data-checkin]')) { const res = store.dailyCheckIn(); if (res.ok) PP.toast('Day ' + res.days + ' streak! +' + res.points + ' pts'); else PP.toast('You already checked in today. Come back tomorrow!', 'error'); draw(); return; }
  if (e.target.closest('[data-reset]')) { store.reset(); PP.toast('Demo data reset'); draw(); }
});

PP.onGlobalSearch = (q) => PP.toast('Search for “' + q + '” isn’t available in this preview yet.');
addEventListener('hashchange', () => { S.tab = fromHash(); draw(); });
document.addEventListener('pp-points', draw);
draw();
})(window.PP);

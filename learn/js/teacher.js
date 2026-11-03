// Teacher console: class progress, misconceptions, student detail, PINs and units.
import { rpc, token, DEMO, errText } from './api.js';
import { $, $$, esc, view, toast, pct, ago, pref, busy } from './ui.js';
import { UNITS, ACTIVITIES } from './units.js';
import * as E from './engine.js';
import { TRAPS, SHIFTS, MCQ, DATA } from './u25.js';

let me = null, classes = [], cls = null, tab = pref.get('t-tab', 'progress'), live = null, focus = null;
const UNIT = '2.5';
const ITEM = Object.fromEntries([...SHIFTS.map(s => [s.id, { kind: 'Shift', text: s.event, level: s.level }]), ...MCQ.map(q => [q.id, { kind: 'MCQ', text: q.stem, level: q.level }]),
  ...DATA.questions.map(q => [DATA.id + '-' + q.id, { kind: 'Data', text: `(${q.id}) ${q.q}`, level: 1 }])]);
const ACT_NAME = Object.fromEntries(ACTIVITIES[UNIT].map(a => [a.id, a.title]));
const TRAP_IDS = Object.keys(TRAPS);

function header() {
  $('#who').textContent = me ? me.display_name + (DEMO ? ' · demo' : '') : (DEMO ? 'Demo mode' : '');
  const out = $('#out'); out.hidden = !me;
  out.onclick = async () => { stopLive(); try { await rpc('ec_logout', { p_token: token.get() }); } catch { } token.set(null); me = null; header(); login(); };
}
const T = () => token.get();

// ---------- sign in ----------
function login(msg = '') {
  view(`<div class="card" style="max-width:420px;margin:20px auto"><h1>Teacher sign in</h1>
    <form id="f"><label for="u">Username</label><input id="u" autocomplete="username" autocapitalize="none" spellcheck="false" required>
    <label for="p">Password</label><input id="p" type="password" autocomplete="current-password" required>
    <div class="err" id="err" role="alert">${esc(msg)}</div><button style="width:100%">Sign in</button></form>
    ${DEMO ? '<p class="small muted">Demo mode: <b>teacher</b> / <b>demo</b>. Demo students: demo-01, demo-02, demo-03, PIN 1234.</p>' : ''}
    <p class="small muted center">Student? <a href="./${location.search}">Student sign in</a></p></div>`);
  $('#f').onsubmit = async ev => {
    ev.preventDefault();
    await busy($('#f button'), async () => {
      try {
        const r = await rpc('ec_login', { p_username: $('#u').value.trim().toLowerCase(), p_secret: $('#p').value });
        if (r.role !== 'teacher') { token.set(r.token); location.href = './' + location.search; return; }
        token.set(r.token); me = r; header();
        if (me.must_change) return setPassword(true);
        start();
      } catch (e) { $('#err').textContent = errText(e); }
    });
  };
  $('#u').focus();
}
function setPassword(forced) {
  view(`<div class="card" style="max-width:440px;margin:20px auto"><h1>${forced ? 'Choose your password' : 'Change password'}</h1>
    ${forced ? '<p class="muted">Your first password was temporary. Choose your own now (at least 8 characters).</p>' : ''}
    <form id="f"><label for="o">Current password</label><input id="o" type="password" autocomplete="current-password" required>
    <label for="n">New password</label><input id="n" type="password" autocomplete="new-password" minlength="8" required>
    <label for="n2">New password again</label><input id="n2" type="password" autocomplete="new-password" required>
    <div class="err" id="err" role="alert"></div><div class="row"><button class="grow">Save</button>${forced ? '' : '<button class="ghost" type="button" id="back">Back</button>'}</div></form></div>`);
  if (!forced) $('#back').onclick = render;
  $('#f').onsubmit = async ev => {
    ev.preventDefault();
    if ($('#n').value.length < 8) return ($('#err').textContent = 'At least 8 characters.');
    if ($('#n').value !== $('#n2').value) return ($('#err').textContent = 'The two new passwords are different.');
    await busy($('#f button'), async () => {
      try { await rpc('ec_set_secret', { p_token: T(), p_old: $('#o').value, p_new: $('#n').value }); me.must_change = false; toast('Password saved'); start(); }
      catch (e) { $('#err').textContent = e.message === 'wrong-login' ? 'The current password is not right.' : errText(e); }
    });
  };
}

// ---------- data ----------
async function start() {
  try { classes = (await rpc('ec_t_classes', { p_token: T() })) || []; } catch (e) { return fail(e); }
  const want = pref.get('t-class', null), c = classes.find(x => x.code === want) || classes[0];
  if (!c) return addClassPage();
  await load(c.code); startLive(); render();
}
async function load(code) {
  const c = await rpc('ec_t_class', { p_token: T(), p_code: code });
  c.by = {}; c.students.forEach(s => (c.by[s.id] = s));
  cls = c; pref.set('t-class', code);
}
function fail(e) { if (e.message === 'not-signed-in' || e.message === 'teachers-only') { token.set(null); me = null; header(); return login(errText(e)); } toast(errText(e)); }
const stopLive = () => { clearInterval(live); live = null; };
function startLive() {
  stopLive();
  if (!pref.get('t-live', true)) return;
  live = setInterval(async () => {
    if (document.hidden || !cls || ['manage', 'units'].includes(tab) || document.activeElement?.matches('input,textarea')) return;
    try { await load(cls.code); render(true); } catch { }
  }, 20000);
}

// ---------- layout ----------
function render(quiet = false) {
  const y = quiet ? window.scrollY : 0;
  const at = cls.attempts, today = cls.students.filter(s => s.last_seen && Date.now() - new Date(s.last_seen) < 86400e3).length;
  const app = view(`<div class="row" style="margin-bottom:10px"><h1 class="grow" style="margin:0">${esc(cls.name || cls.code)} <span class="muted small">(${esc(cls.code)})</span></h1>
      ${classes.length > 1 ? `<select id="pick" style="width:auto">${classes.map(c => `<option value="${esc(c.code)}" ${c.code === cls.code ? 'selected' : ''}>${esc(c.name || c.code)}</option>`).join('')}</select>` : ''}
      <button class="ghost small" id="refresh">↻ Refresh</button><button class="ghost small" id="live">${live ? '● Live' : '○ Live off'}</button></div>
    <div class="card"><span class="stat"><b>${cls.students.length}</b>students</span><span class="stat"><b>${today}</b>active in last 24 h</span>
      <span class="stat"><b>${at.length}</b>activities saved</span><span class="stat"><b>${new Set(at.map(a => a.user_id)).size}</b>have started</span>
      <span class="small muted stat-units">Open units: ${(cls.open_units || []).join(', ') || 'none'}</span></div>
    <div class="tabs noprint">${[['progress', 'Progress'], ['traps', 'Misconceptions'], ['items', 'Hardest questions'], ['manage', 'Students & PINs'], ['units', 'Units & settings']]
      .map(([k, t]) => `<button class="small ${tab === k ? 'sel' : ''}" data-tab="${k}">${t}</button>`).join('')}</div><div id="body"></div>`);
  $$('[data-tab]').forEach(b => (b.onclick = () => { tab = b.dataset.tab; focus = null; pref.set('t-tab', tab); render(); }));
  $('#refresh').onclick = e => busy(e.target, async () => { try { await load(cls.code); render(); toast('Updated'); } catch (er) { fail(er); } });
  $('#live').onclick = () => { pref.set('t-live', !live); startLive(); render(); };
  $('#pick')?.addEventListener('change', async e => { try { await load(e.target.value); focus = null; render(); } catch (er) { fail(er); } });
  const body = $('#body', app);
  if (focus) studentDetail(body, focus); else ({ progress, traps, items, manage, units })[tab](body);
  if (quiet) window.scrollTo(0, y);
}

const cell = (s, a) => { const x = s[a]; if (!x) return '<td class="muted">–</td>'; return `<td>${pct(x.bestScore, x.max)}% <span class="small muted">×${x.runs}</span>${a === 'shift' || a === 'mcq' ? ' <span class="badge lvl' + x.level + '">' + E.LEVELS[x.level] + '</span>' : ''}</td>`; };
function progress(body) {
  body.innerHTML = `<div class="card"><p class="small muted">Best score and number of tries for each activity. The badge shows the level each student reached (Core, Stretch, Challenge). Tap a student for detail.</p>
    <div class="scroll"><table class="grid"><tr><th>Student</th><th>Last seen</th>${ACTIVITIES[UNIT].map(a => `<th>${esc(a.title)}</th>`).join('')}<th>Main mistake</th></tr>
    ${cls.students.map(st => {
      const mine = cls.attempts.filter(a => a.user_id === st.id), s = E.summarise(mine, UNIT), top = E.topTrap(E.trapCounts(mine, UNIT));
      return `<tr class="click" data-id="${st.id}"><td><b>${esc(st.display_name)}</b> <span class="small muted">${esc(st.username)}</span>${st.locked ? ' <span class="badge">locked</span>' : ''}<br><span class="small muted">${esc(st.full_name)}</span></td>
        <td class="small">${ago(st.last_seen)}</td>${ACTIVITIES[UNIT].map(a => a.id === 'learn' ? `<td>${s.learn ? '✔' : '<span class="muted">–</span>'}</td>` : cell(s, a.id)).join('')}
        <td class="small">${top ? esc(TRAPS[top[0]].label) + ' ×' + top[1] : '<span class="muted">–</span>'}</td></tr>`;
    }).join('')}</table></div></div>`;
  $$('tr[data-id]', body).forEach(r => (r.onclick = () => { focus = r.dataset.id; render(); }));
}
function traps(body) {
  const rows = cls.students.map(st => ({ st, c: E.trapCounts(cls.attempts.filter(a => a.user_id === st.id), UNIT) }));
  const tot = E.trapCounts(cls.attempts, UNIT), ranked = TRAP_IDS.filter(t => tot[t]).sort((a, b) => tot[b] - tot[a]);
  const h = n => (!n ? 'h0' : n === 1 ? 'h1' : n <= 3 ? 'h2' : 'h3');
  body.innerHTML = `${ranked.length ? `<div class="card"><h3>Reteach first</h3>${ranked.slice(0, 3).map(t => `<div class="fb tip"><b>${esc(TRAPS[t].label)} · ${tot[t]} mistakes by ${rows.filter(r => r.c[t]).length} students</b>${esc(TRAPS[t].tip)}</div>`).join('')}</div>` : ''}
    <div class="card"><p class="small muted">Wrong first tries, by the misconception each wrong answer shows. Darker = more often.</p><div class="scroll"><table class="grid">
    <tr><th>Student</th>${TRAP_IDS.map(t => `<th class="heat">${esc(TRAPS[t].label)}</th>`).join('')}</tr>
    ${rows.map(({ st, c }) => `<tr class="click" data-id="${st.id}"><td><b>${esc(st.display_name)}</b></td>${TRAP_IDS.map(t => `<td class="heat ${h(c[t])}">${c[t] || '·'}</td>`).join('')}</tr>`).join('')}
    <tr><td><b>Class</b></td>${TRAP_IDS.map(t => `<td class="heat"><b>${tot[t] || 0}</b></td>`).join('')}</tr></table></div></div>`;
  $$('tr[data-id]', body).forEach(r => (r.onclick = () => { focus = r.dataset.id; render(); }));
}
function items(body) {
  const st = {};
  for (const a of cls.attempts) for (const x of a.answers || []) { if (!ITEM[x.id]) continue; const s = (st[x.id] ||= { n: 0, ok: 0, traps: {} }); s.n++; if (x.first_try) s.ok++; if (x.trap) s.traps[x.trap] = (s.traps[x.trap] || 0) + 1; }
  const list = Object.entries(st).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n);
  body.innerHTML = `<div class="card"><p class="small muted">Every question students have met, hardest first (% right first time).</p>${list.length ? `<div class="scroll"><table class="grid">
    <tr><th>Right 1st try</th><th>Seen</th><th>Type</th><th>Question</th><th>Most common trap</th></tr>
    ${list.map(([id, s]) => { const top = E.topTrap(s.traps); return `<tr><td><b>${pct(s.ok, s.n)}%</b></td><td>${s.n}</td><td>${ITEM[id].kind} <span class="badge lvl${ITEM[id].level}">${E.LEVELS[ITEM[id].level]}</span></td>
      <td style="white-space:normal;min-width:260px">${esc(ITEM[id].text)}</td><td class="small">${top ? esc(TRAPS[top[0]].label) : '–'}</td></tr>`; }).join('')}</table></div>` : '<p>No answers yet.</p>'}</div>`;
}
const drew = t => { try { const d = JSON.parse(t), f = v => (v > 0 ? 'right' : v < 0 ? 'left' : 'no shift'); return `demand ${f(d.D || 0)}, supply ${f(d.S || 0)}`; } catch { return t; } };
function studentDetail(body, id) {
  const st = cls.by[id]; if (!st) { focus = null; return render(); }
  const mine = cls.attempts.filter(a => a.user_id === id).slice().reverse();
  const tc = E.trapCounts(mine, UNIT);
  body.innerHTML = `<p><button class="ghost small" id="bk">← Back</button></p><div class="card"><h2>${esc(st.display_name)} <span class="muted small">${esc(st.username)} · ${esc(st.full_name)}</span></h2>
    <p class="small">Last seen ${ago(st.last_seen)} · ${mine.length} activities saved</p>
    ${Object.keys(tc).length ? `<div>${Object.entries(tc).sort((a, b) => b[1] - a[1]).map(([t, n]) => `<span class="pill miss">${esc(TRAPS[t]?.label || t)} ×${n}</span>`).join('')}</div>` : ''}</div>
    ${mine.map(a => `<details class="card"><summary><b>${esc(ACT_NAME[a.activity] || a.activity)}</b> · ${a.score}/${a.max_score} · ${a.activity === 'shift' || a.activity === 'mcq' ? E.LEVELS[a.level_start] + ' → ' + E.LEVELS[a.level_end] + ' · ' : ''}${Math.round(a.seconds / 60)} min · <span class="muted">${new Date(a.created_at).toLocaleString()}</span></summary>
      <table class="t" style="margin-top:8px">${(a.answers || []).filter(x => ITEM[x.id]).map(x => `<tr><td>${x.first_try ? '✔' : x.ok ? '◐' : '✘'}</td><td style="min-width:220px">${esc(ITEM[x.id].text)}
        ${x.pick ? `<br><span class="small muted">Chose: ${esc(x.pick)}</span>` : ''}${x.text && a.activity === 'data' ? `<br><span class="small muted">${x.text.startsWith('{') ? 'Drew: ' + esc(drew(x.text)) : 'Wrote: ' + esc(x.text)}</span>` : ''}</td>
        <td class="small">${x.score != null ? x.score + '/' + x.marks : ''} ${x.trap ? esc(TRAPS[x.trap]?.label || x.trap) : ''}${x.hinted ? ' (hint)' : ''}</td></tr>`).join('') || '<tr><td>Learning cards viewed.</td></tr>'}</table></details>`).join('') || '<div class="card">No activities yet.</div>'}
    <p class="small muted">✔ right first time · ◐ right after a retry or hint · ✘ wrong</p>`;
  $('#bk').onclick = () => { focus = null; render(); };
}

// ---------- students & PINs ----------
function pinSheet(rows, title) {
  const w = document.createElement('div');
  w.innerHTML = `<div class="card"><div class="row noprint"><h2 class="grow">${esc(title)}</h2><button id="pr">Print slips</button><button class="ghost" id="cl">Close</button></div>
    <p class="small muted noprint">Copy or print now: PINs are stored encrypted and cannot be shown again (you can always reset one).</p>
    <div id="slips" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px">${rows.map(r => `<div style="border:1px dashed var(--line);border-radius:10px;padding:10px">
      <div class="small muted">EcoLogic Learn</div><b style="font-size:1.15rem">${esc(r.display_name)}</b><div class="small muted">${esc(r.full_name)}</div>
      <div class="small">${esc(location.origin + location.pathname.replace(/teacher\.html$/, ''))}</div><div>Username <b>${esc(r.username)}</b> · PIN <b>${esc(r.pin)}</b></div></div>`).join('')}</div></div>`;
  $('#body').prepend(w);
  $('#pr').onclick = () => { document.body.classList.add('printing'); const st = document.createElement('style'); st.textContent = '@media print{.printing #app>*:not(#body),.printing #body>*:not(:first-child),.tabs{display:none!important}}'; document.head.append(st); window.print(); setTimeout(() => { st.remove(); document.body.classList.remove('printing'); }, 500); };
  $('#cl').onclick = () => w.remove();
  w.scrollIntoView();
}
function confirmBtn(btn, label, fn) { // two taps instead of a browser dialog
  btn.onclick = () => {
    if (btn.dataset.armed) return fn();
    btn.dataset.armed = 1; const old = btn.textContent; btn.textContent = label; btn.classList.remove('ghost');
    setTimeout(() => { delete btn.dataset.armed; btn.textContent = old; btn.classList.add('ghost'); }, 4000);
  };
}
function manage(body) {
  body.innerHTML = `<div class="card"><div class="row"><h3 class="grow">Students</h3><button class="ghost small" id="allpins">New PINs for everyone</button></div><div class="scroll"><table class="grid">
    <tr><th>Username</th><th>Full name</th><th>Shown as</th><th></th></tr>
    ${cls.students.map(s => `<tr data-id="${s.id}"><td>${esc(s.username)}${s.locked ? ' <span class="badge">locked</span>' : ''}</td><td>${esc(s.full_name)}</td>
      <td><input value="${esc(s.display_name)}" maxlength="40" style="min-width:120px;padding:6px 8px" aria-label="Name shown for ${esc(s.username)}"></td>
      <td><button class="ghost small" data-act="rename">Save name</button> <button class="ghost small" data-act="pin">Reset PIN</button> <button class="ghost small" data-act="rm">Remove</button></td></tr>`).join('')}</table></div></div>
    <div class="card"><h3>Add students</h3><p class="small muted">One per line: full name, then a TAB or comma, then the English name (or nothing). Students without an English name are shown by their given name.</p>
      <textarea id="paste" placeholder="Nguyễn Văn An&#9;Andy&#10;Trần Thị Bình"></textarea><div id="prev" class="small"></div><button id="add" disabled>Add students</button></div>`;
  $$('tr[data-id]', body).forEach(r => {
    const id = r.dataset.id, s = cls.by[id];
    $('[data-act=rename]', r).onclick = e => busy(e.target, async () => { try { await rpc('ec_t_rename', { p_token: T(), p_user: id, p_display: $('input', r).value }); s.display_name = $('input', r).value.trim(); toast('Name saved'); } catch (er) { fail(er); } });
    confirmBtn($('[data-act=pin]', r), 'Tap again to reset', async () => { try { const p = await rpc('ec_t_reset_pin', { p_token: T(), p_user: id }); pinSheet([{ ...s, pin: p }], 'New PIN for ' + s.display_name); } catch (er) { fail(er); } });
    confirmBtn($('[data-act=rm]', r), 'Tap again: deletes all work', async () => { try { await rpc('ec_t_remove_student', { p_token: T(), p_user: id }); await load(cls.code); render(); toast('Removed'); } catch (er) { fail(er); } });
  });
  confirmBtn($('#allpins'), 'Tap again: replaces ALL PINs', async () => { try { const rows = await rpc('ec_t_new_pins', { p_token: T(), p_code: cls.code }); pinSheet(rows, 'New PINs for ' + (cls.name || cls.code)); } catch (er) { fail(er); } });
  let people = [];
  $('#paste').oninput = () => { people = E.parseRoster($('#paste').value); $('#add').disabled = !people.length;
    $('#prev').innerHTML = people.length ? `<p>${people.length} students: ${people.map(p => `<span class="pill">${esc(p.display_name)} <span class="muted">${esc(p.full_name)}</span></span>`).join('')}</p>` : ''; };
  $('#add').onclick = e => busy(e.target, async () => { try { const rows = await rpc('ec_t_add_students', { p_token: T(), p_code: cls.code, p_people: people }); await load(cls.code); render(); pinSheet(rows, 'New students'); } catch (er) { fail(er); } });
}
function units(body) {
  const open = new Set(cls.open_units || []);
  body.innerHTML = `<div class="card"><h3>Units students can open</h3>${UNITS.map(u => `<label style="font-weight:400;display:flex;gap:10px;align-items:center"><input type="checkbox" value="${u.id}" ${open.has(u.id) ? 'checked' : ''} style="width:auto">
      <span><b>${u.id}</b> ${esc(u.title)} ${u.ready ? '' : '<span class="badge">activities not built yet</span>'}</span></label>`).join('')}
    <button id="save" style="margin-top:12px">Save units</button></div>
    <div class="card"><h3>New class</h3><button class="ghost" id="nc">Create another class</button></div>
    <div class="card"><h3>My account</h3><button class="ghost" id="pw">Change my password</button></div>`;
  $('#save').onclick = e => busy(e.target, async () => { try { const u = $$('input[type=checkbox]:checked', body).map(x => x.value); await rpc('ec_t_set_units', { p_token: T(), p_code: cls.code, p_units: u }); cls.open_units = u; toast('Units saved'); render(); } catch (er) { fail(er); } });
  $('#nc').onclick = addClassPage; $('#pw').onclick = () => setPassword(false);
}
function addClassPage() {
  stopLive();
  view(`<div class="card" style="max-width:640px;margin:0 auto"><h1>New class</h1>
    <label for="c">Class code (used in usernames, e.g. eco9 → eco9-01)</label><input id="c" maxlength="12" autocapitalize="none">
    <label for="n">Class name</label><input id="n" maxlength="60">
    <label for="p">Students (one per line: full name, TAB or comma, English name)</label><textarea id="p"></textarea>
    <div class="err" id="err"></div><div class="row"><button id="go">Create class</button>${cls ? '<button class="ghost" id="bk">Back</button>' : ''}</div></div>`);
  $('#bk')?.addEventListener('click', () => { render(); startLive(); });
  $('#go').onclick = e => busy(e.target, async () => {
    try {
      const code = $('#c').value.trim().toLowerCase();
      const rows = await rpc('ec_t_add_class', { p_token: T(), p_code: code, p_name: $('#n').value.trim(), p_people: E.parseRoster($('#p').value) });
      classes = await rpc('ec_t_classes', { p_token: T() }); await load(code); tab = 'manage'; startLive(); render(); if (rows.length) pinSheet(rows, 'PINs for ' + code);
    } catch (er) { $('#err').textContent = errText(er); }
  });
}

async function boot() {
  const t = token.get();
  if (t) {
    try { me = await rpc('ec_me', { p_token: t }); }
    catch (e) { me = null; if (e.message !== 'offline') token.set(null); header(); return login(e.message === 'offline' ? errText(e) : ''); }
    if (me.role !== 'teacher') { location.href = './' + location.search; return; }
    header(); return me.must_change ? setPassword(true) : start();
  }
  header(); login();
}
boot();

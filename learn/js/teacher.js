// Teacher dashboard, laid out like Checkpoint Quest's: class pills, four stat cards, tabs for Students, Units,
// Skills heat map, Hardest questions, Leaderboard and Manage class, and a tracker page for each student.
import { rpc, token, DEMO, errText } from './api.js';
import { $, $$, esc, view, toast, pct, ago, pref, busy } from './ui.js';
import { UNITS, ACTIVITIES } from './units.js';
import * as E from './engine.js';
import { CONTENT, TRAPS, ITEMS as ITEM, unitTraps } from './content.js';
import { mission, checkBest, CHECK_PASS } from './mission.js';
import { icon, tile } from './icons.js';
import { bandOf, BANDS, BAND_NAMES } from './bands.js';
import { BASELINE_N } from './u1.js';

let me = null, classes = [], cls = null, tab = pref.get('t-tab2', 'students'), live = null, focus = null, lbMode = 'week';
const BUILT = UNITS.filter(u => u.ready && CONTENT[u.id]).map(u => u.id);
let UNIT = BUILT.includes(pref.get('t-unit', '2.5')) ? pref.get('t-unit', '2.5') : BUILT[BUILT.length - 1];
const actName = (unit, id) => (id === 'check' ? 'Unit checkpoint' : id === 'review' ? 'Review' : ((ACTIVITIES[unit] || []).find(a => a.id === id) || { title: id }).title);
const LEVELED = new Set(['shift', 'eqm', 'mcq', 'ppc']);
const pracOf = u => (ACTIVITIES[u] || []).find(a => a.id === 'shift' || a.id === 'eqm' || a.id === 'ppc');
const engChip = bi => (bi.band == null ? '<span class="lvlchip">Not placed</span>' : `<span class="chip mint" title="${BAND_NAMES[bi.band]}">${BANDS[bi.band]}</span>${bi.source === 'teacher' ? ' <span class="note">set by you</span>' : ''}`);
const viClass = () => (classes.find(x => x.code === cls.code) || cls).vi_a1 !== false;
const T = () => token.get();
const TABS = [['students', 'Students'], ['units', 'Units'], ['traps', 'Skills heat map'], ['items', 'Hardest questions'], ['leaderboard', 'Leaderboard'], ['manage', 'Manage class']];

function header() {
  const m = $('#meta'); if (!m) return;
  if (!me) { m.innerHTML = DEMO ? '<span class="pill">Demo mode</span>' : ''; return; }
  m.innerHTML = `<span class="pill who">${esc(me.display_name || 'Teacher')}</span>${DEMO ? '<span class="pill">Demo</span>' : ''}<button class="linkbtn" id="pw">Password</button><button class="linkbtn" id="out">Sign out</button>`;
  $('#out').onclick = async () => { stopLive(); try { await rpc('ec_logout', { p_token: T() }); } catch { } token.set(null); me = null; header(); login(); };
  $('#pw').onclick = () => setPassword(false);
}

// ---------- sign in ----------
function login(msg = '') {
  view(`<div class="narrow" style="max-width:440px"><div class="hero"><p class="eyebrow">Teacher dashboard</p><h1>Teacher sign in</h1></div>
    <form id="f" class="tcard"><label for="u">Username</label><input id="u" autocomplete="username" autocapitalize="none" spellcheck="false" required>
    <label for="p">Password</label><input id="p" type="password" autocomplete="current-password" required>
    <div class="err" id="err" role="alert">${esc(msg)}</div><button style="width:100%">Sign in</button></form>
    ${DEMO ? '<p class="note">Demo mode: <b>teacher</b> / <b>demo</b>. Demo students: demo-01, demo-02, demo-03, PIN 1234.</p>' : ''}
    <p class="note">Student? <a href="./${location.search}">Student sign in</a></p></div>`);
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
  stopLive();
  view(`<div class="narrow" style="max-width:460px"><div class="hero"><p class="eyebrow">Account</p><h1>${forced ? 'Choose your password' : 'Change password'}</h1>
    ${forced ? '<p class="lede">Your first password was temporary. Choose your own now (at least 8 characters).</p>' : ''}</div>
    <form id="f" class="tcard"><label for="o">Current password</label><input id="o" type="password" autocomplete="current-password" required>
    <label for="n">New password</label><input id="n" type="password" autocomplete="new-password" minlength="8" required>
    <label for="n2">New password again</label><input id="n2" type="password" autocomplete="new-password" required>
    <div class="err" id="err" role="alert"></div><div class="row"><button class="grow">Save</button>${forced ? '' : '<button class="alt" type="button" id="back">Back</button>'}</div></form></div>`);
  if (!forced) $('#back').onclick = () => (cls ? (startLive(), render()) : start());
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
  try { await load(c.code); } catch (e) { return fail(e); }
  startLive(); render();
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
const mine = id => cls.attempts.filter(a => a.user_id === id);
const levelOf = (atts, u) => { const p = pracOf(u) || { id: 'mcq' }, r = atts.filter(a => a.unit === u && a.activity === p.id).pop(); return r ? r.level_end : null; };

// ---------- layout ----------
function render(quiet = false) {
  const y = quiet ? window.scrollY : 0;
  const n = cls.students.length, started = cls.students.filter(s => mine(s.id).length).length;
  const lv = [0, 0, 0]; cls.students.forEach(s => { const l = levelOf(mine(s.id), UNIT); if (l != null) lv[l]++; });
  const active7 = cls.students.filter(s => s.last_seen && Date.now() - new Date(s.last_seen) < 7 * 864e5).length;
  const xpWeek = cls.students.reduce((t, s) => t + E.xpTotals(mine(s.id)).week, 0);
  const scoped = ['students', 'traps', 'items'].includes(tab) && !focus;
  const app = view(`<div class="dash-head"><div><p class="eyebrow">Teacher dashboard</p><h1 style="margin:0">Class ${esc(cls.code.toUpperCase())}</h1>
      <p class="note">${esc(cls.name || '')}${cls.name ? ' · ' : ''}Open units: ${(cls.open_units || []).join(', ') || 'none'}</p></div>
      <div class="tabs noprint">${classes.map(c => `<button data-class="${esc(c.code)}" aria-selected="${c.code === cls.code}">${esc(c.code.toUpperCase())}</button>`).join('')}<button id="addc">+ Add class</button></div></div>
    <div class="stats" style="margin:16px 0"><div class="stat"><b>${started}/${n}</b><span>have started</span></div>
      <div class="stat"><b>${lv.join(' · ')}</b><span>Core · Stretch · Challenge in ${UNIT}</span></div>
      <div class="stat"><b>${active7}</b><span>active in the last 7 days</span></div>
      <div class="stat gold"><b>${xpWeek}</b><span>class XP this week</span></div></div>
    <div class="row noprint" style="justify-content:space-between;margin-bottom:10px"><div class="tabs" role="tablist">${TABS.map(([k, t]) => `<button role="tab" data-tab="${k}" aria-selected="${!focus && tab === k}">${t}</button>`).join('')}</div>
      <div class="row"><button class="alt small" id="refresh">↻ Refresh</button><button class="alt small" id="live">${live ? '● Live' : '○ Live off'}</button></div></div>
    ${scoped ? `<div class="tabs scope noprint" style="margin:0 0 12px">${BUILT.map(u => `<button data-unit="${u}" aria-selected="${u === UNIT}">${u} ${esc((UNITS.find(x => x.id === u) || {}).title || '')}</button>`).join('')}</div>` : ''}
    <div id="body"></div>`);
  $$('[data-tab]').forEach(b => (b.onclick = () => { tab = b.dataset.tab; focus = null; pref.set('t-tab2', tab); render(); }));
  $$('[data-unit]').forEach(b => (b.onclick = () => { UNIT = b.dataset.unit; pref.set('t-unit', UNIT); render(); }));
  $$('[data-class]').forEach(b => (b.onclick = async () => { try { await load(b.dataset.class); focus = null; render(); } catch (er) { fail(er); } }));
  $('#addc').onclick = addClassPage;
  $('#refresh').onclick = e => busy(e.target, async () => { try { await load(cls.code); render(); toast('Updated'); } catch (er) { fail(er); } });
  $('#live').onclick = () => { pref.set('t-live', !live); startLive(); render(); };
  const body = $('#body', app);
  if (focus) tracker(body, focus); else ({ students, units, traps, items, leaderboard, manage })[tab](body);
  if (quiet) window.scrollTo(0, y);
}
const openStudent = el => $$('[data-id]', el).forEach(r => (r.onclick = e => { e.preventDefault(); focus = r.dataset.id; render(); }));

// ---------- Students ----------
function students(body) {
  const rows = cls.students.map(st => {
    const a = mine(st.id), s = E.summarise(a, UNIT), m = mission(UNIT, a), xp = E.xpTotals(a), top = E.topTrap(E.trapCounts(a, UNIT)), nh = E.needsHelp(a, UNIT), cb = checkBest(UNIT, a), l = levelOf(a, UNIT), bi = bandOf(a, st.eng_band);
    return { st, a, s, m, xp, top, nh, cb, l, bi };
  });
  const help = rows.filter(r => r.nh), idle = rows.filter(r => !r.st.last_seen || Date.now() - new Date(r.st.last_seen) > 14 * 864e5);
  body.innerHTML = `<div class="scroll"><table class="grid"><tr><th>Student</th><th>Username</th><th>English</th><th>Level</th><th>Mission</th><th class="num">Paper 1 best</th><th class="num">Checkpoint</th><th class="num">XP week</th><th class="num">XP total</th><th class="num">Activities</th><th>Last active</th><th>Main mistake</th></tr>
    ${rows.map(({ st, a, s, m, xp, top, nh, cb, l, bi }) => `<tr><td><a href="#" class="sname" data-id="${st.id}">${esc(st.display_name)}</a>${nh ? ` <span class="chip bad" title="${esc(nh)}">needs help</span>` : ''}${st.locked ? ' <span class="chip gold">locked</span>' : ''}<br><span class="note">${esc(st.full_name)}</span></td>
      <td>${esc(st.username)}</td><td>${engChip(bi)}${bi.baseline != null ? `<br><span class="note">baseline ${bi.baseline}/${BASELINE_N}</span>` : ''}</td><td>${l == null ? '<span class="lvlchip">Not started</span>' : `<span class="lvlchip lvl${l}">${E.LEVELS[l]}</span>`}</td>
      <td>${m.n}/${m.steps.length}${m.complete ? ' ✔' : ''}</td><td class="num">${s.mcq ? pct(s.mcq.bestScore, s.mcq.max) + '%' : '–'}</td>
      <td class="num">${cb == null ? '–' : `<span class="chip ${cb >= CHECK_PASS ? 'ok' : 'bad'}">${Math.round(cb * 100)}%</span>`}</td>
      <td class="num"><b>${xp.week}</b></td><td class="num">${xp.total}</td><td class="num">${a.filter(x => x.unit === UNIT).length}</td><td>${ago(st.last_seen)}</td>
      <td class="note">${top ? esc(TRAPS[top[0]].label) + ' ×' + top[1] : '–'}</td></tr>`).join('')}</table></div>
    ${help.length ? `<div class="panel" style="margin-top:14px"><h3>Needs help in ${esc(UNIT)} (${help.length})</h3>${help.map(r => `<p style="margin:.2em 0"><a href="#" data-id="${r.st.id}">${esc(r.st.display_name)}</a> <span class="note">${esc(r.nh)}</span></p>`).join('')}
      <p class="note">From each student's latest run of each adaptive activity: the strategy card twice, or under 40% right first time.</p></div>` : ''}
    ${idle.length ? `<div class="panel" style="margin-top:14px"><h3>Not active for 2 weeks or more</h3><p style="margin:0">${idle.map(r => esc(r.st.display_name)).join(', ')}</p></div>` : ''}`;
  openStudent(body);
}

// ---------- a student's tracker ----------
const drew = t => { try { const d = JSON.parse(t); if (d.p) return `price line at ${d.p}, gap: ${d.t || '?'}`; const f = v => (v > 0 ? 'right' : v < 0 ? 'left' : 'no shift'); return `demand ${f(d.D || 0)}, supply ${f(d.S || 0)}`; } catch { return t; } };
function tracker(body, id) {
  const st = cls.by[id]; if (!st) { focus = null; return render(); }
  const a = mine(id), xp = E.xpTotals(a), tc = E.trapCounts(a), bi = bandOf(a, st.eng_band), autoB = bandOf(a, null);
  body.innerHTML = `<div class="row" style="margin-bottom:10px"><button class="alt small" id="bk">← All students</button></div>
    <div class="tcard"><div class="uhead">${tile('me', 'm')}<h2>${esc(st.display_name)} <span class="note">${esc(st.username)} · ${esc(st.full_name)}</span></h2></div>
      <div class="stats"><div class="stat gold"><b>${xp.total}</b><span>XP in total</span></div><div class="stat"><b>${xp.week}</b><span>XP this week</span></div>
        <div class="stat"><b>${a.length}</b><span>activities finished</span></div><div class="stat"><b>${ago(st.last_seen)}</b><span>last active</span></div></div></div>
    <div class="tcard" style="margin-top:14px"><div class="uhead">${tile('base', 's')}<h3 style="flex:1">English level</h3>${engChip(bi)}</div>
      <p class="note">${bi.baseline != null ? `Baseline: ${bi.baseline}/${BASELINE_N}. ` : 'Not taken the baseline yet. '}${bi.source === 'auto' ? `Set by the app: it moves up after 3 strong activities in a row (now ${bi.up} of 3) and down after 2 weak ones. ` : bi.source === 'teacher' ? `You set this level. Choose Automatic to let the app decide again (it would be ${autoB.band == null ? 'not placed' : BANDS[autoB.band]}). ` : ''}
        A1: plain English, key-word pills, ${viClass() ? 'Vietnamese help, ' : ''}3 options and ordering tasks for Paper 2 · A2: plain English, pills and word banks · B1: exam wording, some pills, sentence frames · B2: exam wording, no extra help.</p>
      <div class="row"><label for="band" style="margin:0">Level</label><select id="band" style="width:auto"><option value="">Automatic</option>${BANDS.map((b, k) => `<option value="${k}" ${bi.source === 'teacher' && bi.band === k ? 'selected' : ''}>${b} ${BAND_NAMES[k]}</option>`).join('')}</select></div></div>
    <div class="cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;margin:14px 0">${BUILT.map(u => { const m = mission(u, a), nh = E.needsHelp(a, u);
      return `<div class="tcard"><div class="uhead">${tile(u, 's')}<h3 style="flex:1">${u} ${esc((UNITS.find(x => x.id === u) || {}).title)}</h3><span class="chip ${m.complete ? 'ok' : 'gold'}">${m.n}/${m.steps.length}</span></div>
        <ol class="msteps">${m.steps.map(s => `<li class="${s.done ? 'done' : s.locked ? 'locked' : ''}"><span class="mico">${tile(s.ic, 's')}${s.done ? '<span class="mtick">✓</span>' : ''}</span><div><b>${esc(s.label)}</b><br><span class="note">${esc(s.detail)}</span></div></li>`).join('')}</ol>
        ${nh ? `<p class="note"><span class="chip bad">needs help</span> ${esc(nh)}</p>` : ''}</div>`; }).join('')}</div>
    ${Object.keys(tc).length ? `<div class="panel"><h3>Mistakes</h3><div>${Object.entries(tc).sort((x, y) => y[1] - x[1]).map(([t, n]) => `<span class="pill miss">${esc(TRAPS[t]?.label || t)} ×${n}</span>`).join('')}</div></div>` : ''}
    <h3 style="margin-top:14px">History</h3>
    ${a.slice().reverse().map(x => `<details class="card"><summary><b>${esc(x.unit === 'review' ? 'Review' : x.unit === 'base' ? 'English baseline' : x.unit + ' ' + actName(x.unit, x.activity))}</b> · ${x.score}/${x.max_score} · ${LEVELED.has(x.activity) ? E.LEVELS[x.level_start] + ' → ' + E.LEVELS[x.level_end] + ' · ' : ''}${Math.round(x.seconds / 60)} min · <span class="note">${new Date(x.created_at).toLocaleString()}</span></summary>
      <table class="t" style="margin-top:8px">${(x.answers || []).filter(q => ITEM[q.id]).map(q => `<tr><td>${q.first_try ? '✔' : q.ok ? '◐' : '✘'}</td><td style="min-width:220px">${esc(ITEM[q.id].text)}
        ${q.pick ? `<br><span class="note">Chose: ${esc(q.pick)}</span>` : ''}${q.text && x.activity === 'data' ? `<br><span class="note">${q.text.startsWith('{') ? 'Drew: ' + esc(drew(q.text)) : 'Wrote: ' + esc(q.text)}</span>` : ''}</td>
        <td class="note">${q.score != null ? q.score + '/' + q.marks : ''} ${q.trap ? esc(TRAPS[q.trap]?.label || q.trap) : ''}${q.hinted ? ' (hint)' : ''}</td></tr>`).join('') || '<tr><td>Learning cards viewed.</td></tr>'}</table></details>`).join('') || '<p class="note">No activities yet.</p>'}
    <p class="note">✔ right first time · ◐ right after a retry or hint · ✘ wrong</p>`;
  $('#bk').onclick = () => { focus = null; render(); };
  $('#band').onchange = async e => { const v = e.target.value === '' ? null : +e.target.value;
    try { await rpc('ec_t_set_band', { p_token: T(), p_user: id, p_band: v }); st.eng_band = v; toast(v == null ? 'English level: automatic' : 'English level set to ' + BANDS[v]); tracker(body, id); }
    catch (er) { fail(er); } };
}

// ---------- Units ----------
function units(body) {
  const open = new Set(cls.open_units || []);
  body.innerHTML = `<div class="ulist">${UNITS.map(u => {
    const built = u.ready && CONTENT[u.id];
    let info = 'Activities not built yet: students see "Coming soon".';
    if (built) { const ms = cls.students.map(s => mission(u.id, mine(s.id))), done = ms.filter(m => m.complete).length, avg = ms.length ? ms.reduce((t, m) => t + m.n, 0) / ms.length : 0, steps = mission(u.id, []).steps.length;
      info = `Average mission ${avg.toFixed(1)} of ${steps} steps · ${done} of ${cls.students.length} finished · ${cls.students.filter(s => (checkBest(u.id, mine(s.id)) || 0) >= CHECK_PASS).length} passed the checkpoint`; }
    return `<label class="urow${built ? '' : ' locked'}" style="cursor:pointer">${tile(u.id, 'm')}<div><b>${u.id} ${esc(u.title)}</b><span class="note">${info}</span></div>
      <span class="toggle"><input type="checkbox" value="${u.id}" ${open.has(u.id) ? 'checked' : ''}> Open</span></label>`; }).join('')}</div>
    <div class="row" style="margin-top:12px"><button id="save">Save units</button><span class="note">Students see only the units you open.</span></div>`;
  $('#save').onclick = e => busy(e.target, async () => { try { const u = $$('.ulist input[type=checkbox]:checked', body).map(x => x.value).filter(v => UNITS.some(x => x.id === v)); await rpc('ec_t_set_units', { p_token: T(), p_code: cls.code, p_units: u }); cls.open_units = u; toast('Units saved'); render(); } catch (er) { fail(er); } });
}

// ---------- Skills heat map (misconceptions) ----------
function traps(body) {
  const rows = cls.students.map(st => ({ st, c: E.trapCounts(mine(st.id), UNIT) }));
  const tot = E.trapCounts(cls.attempts, UNIT), ranked = unitTraps(UNIT).filter(t => tot[t]).sort((a, b) => tot[b] - tot[a]);
  const h = n => (!n ? 'h0' : n === 1 ? 'h1' : n <= 3 ? 'h2' : 'h3');
  body.innerHTML = `${ranked.length ? `<div class="panel" style="margin-bottom:14px"><h3>Reteach first</h3>${ranked.slice(0, 3).map(t => `<div class="fb tip"><b>${esc(TRAPS[t].label)} · ${tot[t]} mistakes by ${rows.filter(r => r.c[t]).length} students</b>${esc(TRAPS[t].tip)}</div>`).join('')}</div>` : ''}
    <p class="note">Wrong first tries, by the misconception each wrong answer shows. Darker = more often. Tap a name for the student's tracker.</p><div class="scroll"><table class="grid">
    <tr><th>Student</th>${unitTraps(UNIT).map(t => `<th class="heat">${esc(TRAPS[t].label)}</th>`).join('')}</tr>
    ${rows.map(({ st, c }) => `<tr><td><a href="#" class="sname" data-id="${st.id}">${esc(st.display_name)}</a></td>${unitTraps(UNIT).map(t => `<td class="heat ${h(c[t])}">${c[t] || '·'}</td>`).join('')}</tr>`).join('')}
    <tr><td><b>Class</b></td>${unitTraps(UNIT).map(t => `<td class="heat"><b>${tot[t] || 0}</b></td>`).join('')}</tr></table></div>`;
  openStudent(body);
}

// ---------- Hardest questions ----------
function items(body) {
  const st = {};
  for (const a of cls.attempts) for (const x of a.answers || []) { if (!ITEM[x.id] || ITEM[x.id].unit !== UNIT) continue; const s = (st[x.id] ||= { n: 0, ok: 0, traps: {} }); s.n++; if (x.first_try) s.ok++; if (x.trap) s.traps[x.trap] = (s.traps[x.trap] || 0) + 1; }
  const list = Object.entries(st).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n);
  body.innerHTML = `<p class="note">Every question students have met in ${esc(UNIT)}, hardest first (% right first time).</p>${list.length ? `<div class="scroll"><table class="grid">
    <tr><th class="num">Right 1st try</th><th class="num">Seen</th><th>Type</th><th>Question</th><th>Most common mistake</th></tr>
    ${list.map(([id, s]) => { const top = E.topTrap(s.traps); return `<tr><td class="num"><b>${pct(s.ok, s.n)}%</b></td><td class="num">${s.n}</td><td>${ITEM[id].kind} <span class="lvlchip lvl${ITEM[id].level}">${E.LEVELS[ITEM[id].level]}</span></td>
      <td style="white-space:normal;min-width:260px">${esc(ITEM[id].text)}</td><td class="note">${top ? esc(TRAPS[top[0]].label) : '–'}</td></tr>`; }).join('')}</table></div>` : '<div class="panel"><p class="note">No answers yet.</p></div>'}`;
}

// ---------- Leaderboard ----------
function leaderboard(body) {
  const key = lbMode === 'week' ? 'week' : 'total';
  const rows = cls.students.map(st => ({ st, ...E.xpTotals(mine(st.id)) })).sort((a, b) => b[key] - a[key] || a.st.display_name.localeCompare(b.st.display_name));
  body.innerHTML = `<div class="tabs scope" style="margin-bottom:10px">${[['week', 'This week'], ['all', 'All time']].map(([k, l]) => `<button data-lb="${k}" aria-selected="${k === lbMode}">${l}</button>`).join('')}</div>
    <table class="lb">${rows.map((r, k) => `<tr><td style="width:2.6em">${k < 3 && r[key] > 0 ? `<span class="medal m${k + 1}">${k + 1}</span>` : k + 1}</td><td><a href="#" data-id="${r.st.id}">${esc(r.st.display_name)}</a> <span class="note">${esc(r.st.username)}</span></td><td class="num"><b>${r[key]}</b> XP</td></tr>`).join('')}</table>
    <p class="note" style="margin-top:8px">Students see ${boardOn() ? 'the top 10 and their own place (this week and all time)' : 'only their own XP: the class leaderboard is off (Manage class)'}.</p>`;
  $$('[data-lb]', body).forEach(b => (b.onclick = () => { lbMode = b.dataset.lb; render(); }));
  openStudent(body);
}

// ---------- Manage class: students, PINs, leaderboard switch, new class ----------
function pinSheet(rows, title) {
  const w = document.createElement('div');
  w.innerHTML = `<div class="tcard" style="margin-bottom:14px"><div class="row noprint"><h2 class="grow" style="margin:0">${esc(title)}</h2><button id="pr">Print slips</button><button class="alt" id="cl">Close</button></div>
    <p class="note noprint">Copy or print now: PINs are stored encrypted and cannot be shown again (you can always reset one).</p>
    <div id="slips" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px">${rows.map(r => `<div style="border:1px dashed var(--line);border-radius:10px;padding:10px">
      <div class="note">EcoLogic Learn</div><b style="font-size:1.15rem">${esc(r.display_name)}</b><div class="note">${esc(r.full_name)}</div>
      <div class="note">${esc(location.origin + location.pathname.replace(/teacher\.html$/, ''))}</div><div>Username <b>${esc(r.username)}</b> · PIN <b>${esc(r.pin)}</b></div></div>`).join('')}</div></div>`;
  $('#body').prepend(w);
  $('#pr').onclick = () => { const st = document.createElement('style'); st.textContent = '@media print{#app>*:not(#body),#body>*:not(:first-child),.noprint{display:none!important}}'; document.head.append(st); window.print(); setTimeout(() => st.remove(), 500); };
  $('#cl').onclick = () => w.remove();
  w.scrollIntoView();
}
function confirmBtn(btn, label, fn) { // two taps instead of a browser dialog
  btn.onclick = () => {
    if (btn.dataset.armed) return fn();
    btn.dataset.armed = 1; const old = btn.textContent; btn.textContent = label; btn.classList.remove('alt');
    setTimeout(() => { delete btn.dataset.armed; btn.textContent = old; btn.classList.add('alt'); }, 4000);
  };
}
const boardOn = () => (classes.find(x => x.code === cls.code) || {}).board !== false;
function manage(body) {
  body.innerHTML = `<div class="tcard"><div class="row"><h3 class="grow">Students</h3><button class="alt small" id="allpins">New PINs for everyone</button></div><div class="scroll"><table class="grid">
    <tr><th>Username</th><th>Full name</th><th>Shown as</th><th></th></tr>
    ${cls.students.map(s => `<tr data-row="${s.id}"><td>${esc(s.username)}${s.locked ? ' <span class="chip gold">locked</span>' : ''}</td><td>${esc(s.full_name)}</td>
      <td><input value="${esc(s.display_name)}" maxlength="40" style="min-width:120px;padding:6px 8px" aria-label="Name shown for ${esc(s.username)}"></td>
      <td><button class="alt small" data-act="rename">Save name</button> <button class="alt small" data-act="pin">Reset PIN</button> <button class="alt small" data-act="rm">Remove</button></td></tr>`).join('')}</table></div></div>
    <div class="tcard" style="margin-top:14px"><h3>Add students</h3><p class="note">One per line: full name, then a TAB or comma, then the English name (or nothing). Students without an English name are shown by their given name.</p>
      <textarea id="paste" placeholder="Nguyễn Văn An&#9;Andy&#10;Trần Thị Bình"></textarea><div id="prev" class="note"></div><div class="row"><button id="add" disabled>Add students</button></div></div>
    <div class="tcard" style="margin-top:14px"><h3>Class leaderboard</h3><label class="toggle"><input type="checkbox" id="board" ${boardOn() ? 'checked' : ''}>
      <span>Show students the XP leaderboard (top 10 and their own place). When off, each student sees only their own XP.</span></label></div>
    <div class="tcard" style="margin-top:14px"><h3>Vietnamese help</h3><label class="toggle"><input type="checkbox" id="vi" ${viClass() ? 'checked' : ''}>
      <span>Show Vietnamese translations to A1 (Starter) students in Section 1: a Tiếng Việt button under each question and Vietnamese in the key-word pills. Other levels never see Vietnamese.</span></label></div>
    <div class="tcard" style="margin-top:14px"><h3>New class</h3><div class="row"><button class="alt" id="nc">Create another class</button></div></div>`;
  $$('tr[data-row]', body).forEach(r => {
    const id = r.dataset.row, s = cls.by[id];
    $('[data-act=rename]', r).onclick = e => busy(e.target, async () => { try { await rpc('ec_t_rename', { p_token: T(), p_user: id, p_display: $('input', r).value }); s.display_name = $('input', r).value.trim(); toast('Name saved'); } catch (er) { fail(er); } });
    confirmBtn($('[data-act=pin]', r), 'Tap again to reset', async () => { try { const p = await rpc('ec_t_reset_pin', { p_token: T(), p_user: id }); pinSheet([{ ...s, pin: p }], 'New PIN for ' + s.display_name); } catch (er) { fail(er); } });
    confirmBtn($('[data-act=rm]', r), 'Tap again: deletes all work', async () => { try { await rpc('ec_t_remove_student', { p_token: T(), p_user: id }); await load(cls.code); render(); toast('Removed'); } catch (er) { fail(er); } });
  });
  confirmBtn($('#allpins'), 'Tap again: replaces ALL PINs', async () => { try { const rows = await rpc('ec_t_new_pins', { p_token: T(), p_code: cls.code }); pinSheet(rows, 'New PINs for ' + (cls.name || cls.code)); } catch (er) { fail(er); } });
  let people = [];
  $('#paste').oninput = () => { people = E.parseRoster($('#paste').value); $('#add').disabled = !people.length;
    $('#prev').innerHTML = people.length ? `<p>${people.length} students: ${people.map(p => `<span class="pill">${esc(p.display_name)} <span class="muted">${esc(p.full_name)}</span></span>`).join('')}</p>` : ''; };
  $('#add').onclick = e => busy(e.target, async () => { try { const rows = await rpc('ec_t_add_students', { p_token: T(), p_code: cls.code, p_people: people }); await load(cls.code); render(); pinSheet(rows, 'New students'); } catch (er) { fail(er); } });
  $('#board').onchange = async e => { try { await rpc('ec_t_set_board', { p_token: T(), p_code: cls.code, p_on: e.target.checked }); const c = classes.find(x => x.code === cls.code); if (c) c.board = e.target.checked; toast(e.target.checked ? 'Leaderboard on' : 'Leaderboard off'); } catch (er) { e.target.checked = !e.target.checked; fail(er); } };
  $('#vi').onchange = async e => { try { await rpc('ec_t_set_vi', { p_token: T(), p_code: cls.code, p_on: e.target.checked }); cls.vi_a1 = e.target.checked; const c = classes.find(x => x.code === cls.code); if (c) c.vi_a1 = e.target.checked; toast(e.target.checked ? 'Vietnamese help on' : 'Vietnamese help off'); }
    catch (er) { e.target.checked = !e.target.checked; fail(er); } };
  $('#nc').onclick = addClassPage;
}
function addClassPage() {
  stopLive();
  view(`<div class="narrow"><div class="hero"><p class="eyebrow">Teacher dashboard</p><h1>New class</h1></div><div class="tcard">
    <label for="c">Class code (used in usernames, e.g. eco9 → eco9-01)</label><input id="c" maxlength="12" autocapitalize="none">
    <label for="n">Class name</label><input id="n" maxlength="60">
    <label for="p">Students (one per line: full name, TAB or comma, English name)</label><textarea id="p"></textarea>
    <div class="err" id="err"></div><div class="row"><button id="go">Create class</button>${cls ? '<button class="alt" id="bk">Back</button>' : ''}</div></div></div>`);
  $('#bk')?.addEventListener('click', () => { startLive(); render(); });
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

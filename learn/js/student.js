// Student app, laid out like Checkpoint Quest: navy header with XP, bottom tabs (Home, Units, Review, Games, Me),
// Home with Today's workout, unit pages with a Mission, and the activities of every built unit (2.4, 2.5).
import { rpc, token, DEMO, errText } from './api.js';
import { $, $$, esc, view, toast, pct, pref, busy, ago } from './ui.js';
import { UNITS, ACTIVITIES } from './units.js';
import * as E from './engine.js';
import { CONTENT, TRAPS } from './content.js';
import { SHIFTS } from './u25.js';
import { genEq, nextEqKind, LEARN_MARKET } from './u24.js';
import { createDiagram } from './diagram.js';
import { icon, tile } from './icons.js';
import { mission as missionOf, checkBest as checkBestOf, CHECK_PASS, CHECK_N, BADGE } from './mission.js';
const mission = (u, hist = history) => missionOf(u, hist), checkBest = (u, hist = history) => checkBestOf(u, hist);

let me = null, history = [], U = '2.5';
const C = () => CONTENT[U];
const uTitle = (u = U) => (UNITS.find(x => x.id === u) || {}).title || '';
const uName = (u = U) => `${u} ${uTitle(u)}`;
const backLink = () => `<p><a href="#/u/${U}">← ${esc(uName())}</a></p>`;
const VI_ALL = Object.assign({}, ...Object.values(CONTENT).map(c => c.VI || {}));
const vi = () => pref.get('vi', false);
const w = (en, key) => (vi() && VI_ALL[key] ? `${en} <span class="vi">(${VI_ALL[key]})</span>` : en);
const levelBadge = l => `<span class="badge lvl${l}">${E.LEVELS[l]}</span>`;
const trapBox = id => (TRAPS[id] ? `<div class="fb tip"><b>Watch out: ${esc(TRAPS[id].label)}</b>${esc(TRAPS[id].tip)}</div>` : '');
const xpLine = xp => `<p class="xp-gain">${xp ? `+${xp} XP ⭐` : 'No XP this time: you have done this activity 5 times today. Come back tomorrow!'}</p>`;
const fmt = n => Number(n).toLocaleString('en-US');
const go = h => { if (location.hash === h) route(); else location.hash = h; };
const wide = on => document.getElementById('app').classList.toggle('play', on);
window.addEventListener('hashchange', () => wide(false));
const LEVELED = new Set(['shift', 'eqm', 'mcq']);
const TICK = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const BUILT = () => UNITS.filter(u => u.ready && CONTENT[u.id]).map(u => u.id);
const openUnits = () => BUILT().filter(u => (me.open_units || []).includes(u));
const vnDay = iso => new Date(new Date(iso).getTime() + 7 * 3600e3).toISOString().slice(0, 10);
const today = () => vnDay(new Date().toISOString());

// ---------- saving (queued, so a Wi-Fi drop never loses a run) ----------
const QK = DEMO ? 'ecl:demo:pending' : 'ecl:pending';
const readQ = () => { try { return JSON.parse(localStorage.getItem(QK)) || []; } catch { return []; } };
const writeQ = q => { try { localStorage.setItem(QK, JSON.stringify(q)); } catch { } };
async function saveAttempt(a) {
  history.push({ ...a, created_at: new Date().toISOString() });
  writeQ([...readQ(), a]);
  header();
  return flush();
}
async function flush() {
  let q = readQ(), ok = true;
  while (q.length) {
    const a = q[0];
    try {
      await rpc('ec_save_attempt', { p_token: token.get(), p_unit: a.unit, p_activity: a.activity, p_level_start: a.level_start, p_level_end: a.level_end,
        p_score: a.score, p_max: a.max_score, p_seconds: a.seconds, p_answers: a.answers });
      q = q.slice(1); writeQ(q);
    } catch (e) { ok = false; if (e.message !== 'offline' && e.message !== 'not-signed-in') { q = q.slice(1); writeQ(q); } break; }
  }
  return ok;
}
window.addEventListener('online', () => flush());

// ---------- header and bottom navigation ----------
function header() {
  const m = $('#meta'); if (!m) return;
  if (!me) { m.innerHTML = DEMO ? '<span class="pill">Demo mode</span>' : ''; return; }
  m.innerHTML = `<span class="pill xp" title="Your XP">${E.xpTotals(history).total} XP</span>${DEMO ? '<span class="pill">Demo</span>' : ''}<button class="linkbtn" id="out">Sign out</button>`;
  $('#out').onclick = async () => { try { await rpc('ec_logout', { p_token: token.get() }); } catch { } token.set(null); me = null; history = []; header(); nav(null); go('#/'); };
}
const NAV = [['', 'Home', 'home'], ['units', 'Units', 'units'], ['review', 'Review', 'review'], ['games', 'Games', 'games'], ['me', 'Me', 'me']];
// The bar shows on every page except sign-in and while an activity runs. on = null hides it.
function nav(on) {
  let el = $('#nav');
  if (!el) { el = document.createElement('nav'); el.id = 'nav'; el.className = 'bnav'; el.setAttribute('aria-label', 'Main'); document.body.append(el); }
  document.body.classList.toggle('has-nav', on != null);
  if (on == null) { el.hidden = true; return; }
  const due = reviewDue(history).length;
  el.hidden = false;
  el.innerHTML = `<div class="bnav-in">${NAV.map(([k, label, ic]) => `<a href="#/${k}" ${k === on ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span>${k === 'review' && due ? `<b class="nbadge">${due > 99 ? '99+' : due}</b>` : ''}</a>`).join('')}</div>`;
}

// ---------- sign in ----------
function login(msg = '') {
  nav(null);
  view(`<div class="narrow" style="max-width:440px"><div class="hero"><p class="eyebrow">IGCSE Economics 0455</p><h1>Sign in</h1><p class="lede">Use the username and PIN on your login slip.</p></div>
    <form id="f" class="tcard" autocomplete="on">
      <label for="u">Username</label><input id="u" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="e.g. eco9-07" required>
      <label for="p">PIN</label><input id="p" name="password" type="password" inputmode="numeric" autocomplete="current-password" required>
      <div class="err" id="err" role="alert">${esc(msg)}</div>
      <button style="width:100%">Sign in</button>
    </form>
    ${DEMO ? '<p class="note">Demo mode: try <b>demo-01</b> with PIN <b>1234</b>. Nothing is sent to the school database.</p>' : ''}
    <p class="note">Teacher? <a href="teacher.html${location.search}">Teacher dashboard</a></p></div>`);
  $('#f').onsubmit = async ev => {
    ev.preventDefault();
    await busy($('#f button'), async () => {
      try {
        const r = await rpc('ec_login', { p_username: $('#u').value.trim().toLowerCase(), p_secret: $('#p').value.trim() });
        token.set(r.token);
        if (r.role === 'teacher') { location.href = 'teacher.html' + location.search; return; }
        me = r; history = (await rpc('ec_history', { p_token: r.token })) || [];
        header(); flush();
        if (me.must_change) changePin(true); else go('#/');
      } catch (e) { $('#err').textContent = errText(e); $('#p').value = ''; $('#p').focus(); }
    });
  };
  $('#u').focus();
}

function changePin(forced = false) {
  nav(forced ? null : 'me');
  view(`<div class="narrow" style="max-width:440px"><div class="hero"><p class="eyebrow">Settings</p><h1>${forced ? 'Choose your own PIN' : 'Change my PIN'}</h1></div>
    <form id="f" class="tcard"><label for="o">Old PIN</label><input id="o" type="password" inputmode="numeric" autocomplete="current-password" required>
    <label for="n">New PIN (4 to 6 numbers)</label><input id="n" type="password" inputmode="numeric" autocomplete="new-password" pattern="[0-9]{4,6}" required>
    <label for="n2">New PIN again</label><input id="n2" type="password" inputmode="numeric" autocomplete="new-password" required>
    <div class="err" id="err" role="alert"></div>
    <div class="row"><button class="grow">Save PIN</button>${forced ? '' : '<button type="button" class="alt" id="back">Back</button>'}</div></form></div>`);
  if (!forced) $('#back').onclick = () => go('#/me/settings');
  $('#f').onsubmit = async ev => {
    ev.preventDefault();
    const n = $('#n').value.trim();
    if (!/^\d{4,6}$/.test(n)) return ($('#err').textContent = 'Use 4 to 6 numbers.');
    if (n !== $('#n2').value.trim()) return ($('#err').textContent = 'The two new PINs are different.');
    await busy($('#f button'), async () => {
      try { await rpc('ec_set_secret', { p_token: token.get(), p_old: $('#o').value.trim(), p_new: n }); me.must_change = false; toast('PIN saved. Remember it!'); go('#/'); }
      catch (e) { $('#err').textContent = e.message === 'wrong-login' ? 'The old PIN is not right.' : errText(e); }
    });
  };
}

// The unit the student is working on: the latest open unit whose mission is not finished, else the latest open unit.
function focusUnit(hist = history) {
  const us = openUnits();
  return us.find(u => !mission(u, hist).complete) || us[us.length - 1] || null;
}

// ---------- review: Paper 1 questions the student got wrong come back after 0, 1, 3 and 7 days ----------
const MCQ_BY_ID = Object.fromEntries(Object.entries(CONTENT).flatMap(([u, c]) => (c.MCQ || []).map(q => [q.id, { ...q, unit: u }])));
function reviewDue(hist, now = Date.now()) {
  const res = {};
  for (const a of hist.slice().sort((x, y) => new Date(x.created_at) - new Date(y.created_at)))
    for (const x of a.answers || []) if (MCQ_BY_ID[x.id] && (me?.open_units || []).includes(MCQ_BY_ID[x.id].unit)) (res[x.id] ||= []).push({ ok: !!x.first_try, t: new Date(a.created_at || now).getTime() });
  const due = [];
  for (const [id, r] of Object.entries(res)) {
    if (r.every(x => x.ok)) continue;               // never missed: nothing to review
    let k = 0; for (let i = r.length - 1; i >= 0 && r[i].ok; i--) k++;
    if (k >= 4) continue;                            // right 4 times in a row since the last miss: learned
    if (now - r[r.length - 1].t >= [0, 1, 3, 7][k] * 864e5) due.push(id);
  }
  return due;
}

// ---------- weekly streak: 2 activities a week ----------
function streak(hist = history) {
  const wk = iso => E.weekStart(new Date(iso)).getTime(), count = {};
  hist.forEach(a => { const k = wk(a.created_at); count[k] = (count[k] || 0) + 1; });
  const thisWeek = count[E.weekStart().getTime()] || 0;
  let n = 0, t = E.weekStart().getTime();
  if (thisWeek < 2) t -= 7 * 864e5;                 // the current week still counts once it reaches 2
  while ((count[t] || 0) >= 2) { n++; t -= 7 * 864e5; }
  return { weeks: n, thisWeek };
}

// ---------- Today's workout: three tasks, weakest first. Planned from work before today, so it stays the same all day. ----------
function workoutPlan() {
  const t = today(), before = history.filter(a => vnDay(a.created_at) < t), todays = history.filter(a => vnDay(a.created_at) === t);
  const fu = focusUnit(before); if (!fu) return [];
  const items = [], add = it => { if (items.length < 3 && !items.some(x => x.unit === it.unit && x.act === it.act)) items.push(it); };
  const due = reviewDue(before);
  if (due.length >= 2) add({ unit: 'review', act: 'review', ic: 'review', label: `Fix ${Math.min(due.length, 10)} questions you missed` });
  const m = mission(fu, before);
  m.steps.filter(x => !x.done && !x.locked).slice(0, 2).forEach(x => add({ unit: fu, act: x.act, ic: x.ic, label: `${fu}: ${x.label}` }));
  // then the open unit with the weakest Paper 1 result
  const weakest = openUnits().map(u => ({ u, b: (E.summarise(before, u).mcq || { best: -1 }).best })).sort((a, b) => a.b - b.b)[0];
  if (weakest) add({ unit: weakest.u, act: 'mcq', ic: 'mcq', label: `${weakest.u}: Paper 1 practice` });
  openUnits().slice().reverse().forEach(u => { const p = ACTIVITIES[u].find(a => a.id === 'shift' || a.id === 'eqm'); add({ unit: u, act: p.id, ic: p.id, label: `${u}: ${p.title}` }); });
  items.forEach(it => (it.done = todays.some(a => a.unit === it.unit && a.activity === it.act)));
  return items;
}
const itemHref = it => (it.unit === 'review' ? '#/review/go' : `#/u/${it.unit}/${it.act}`);
function ringSVG(items) {
  const n = Math.max(items.length, 1), gap = 16, seg = 360 / n, r = 42;
  const pt = a => [50 + r * Math.sin(a * Math.PI / 180), 50 - r * Math.cos(a * Math.PI / 180)].map(v => v.toFixed(1)).join(' ');
  const arcs = items.map((it, k) => { const a0 = k * seg + gap / 2, a1 = (k + 1) * seg - gap / 2;
    return `<path d="M${pt(a0)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${pt(a1)}"${it.done ? ' class="on"' : ''}/>`; }).join('');
  return `<div class="ring"><svg viewBox="0 0 100 100" aria-hidden="true">${arcs}</svg>${tile('workout', 'm')}</div>`;
}
function workoutCard() {
  const items = workoutPlan(); if (!items.length) return '';
  const n = items.filter(i => i.done).length, next = items.find(i => !i.done);
  return `<div class="tcard workout"><div class="wo-head">${ringSVG(items)}<div><p class="eyebrow">Today's workout</p>
      <h3>${next ? 'Strengthen your weakest areas' : 'Workout complete!'}</h3>
      <p class="note">${next ? `${n} of ${items.length} done. Your weakest areas come first.` : 'Great work. A new workout is ready tomorrow.'}</p></div></div>
    <ol class="wo-list">${items.map(it => `<li class="${it.done ? 'done' : it === next ? 'next' : ''}">${tile(it.ic, 's')}<span>${esc(it.label)}</span>${it.done ? `<span class="wo-tick" aria-label="done">${TICK}</span>` : ''}</li>`).join('')}</ol>
    ${next ? `<a class="btn go" href="${itemHref(next)}">${n ? 'Continue workout' : 'Start workout'}</a>` : ''}</div>`;
}

// ---------- Home ----------
function home() {
  nav('');
  const fu = focusUnit(), st = streak(), xp = E.xpTotals(history), due = reviewDue(history).length;
  let h = `<div class="narrow"><div class="hero"><p class="eyebrow">Class ${esc((me.class_code || '').toUpperCase())}</p><h1>Hi, ${esc(me.display_name)}</h1></div>`;
  if (!fu) h += `<div class="panel"><b>No units are open yet.</b><p class="note">Your teacher will open the first unit when the class starts it.</p></div>`;
  else {
    if (!history.length) h += `<div class="tcard"><span class="tag gold">Start here</span><h3>${esc(uName(fu))}</h3>
      <p class="note" style="font-size:1rem">Start with the Learn cards: five short cards with moving diagrams. Then work through the unit mission, step by step. It takes about 10 minutes to begin.</p>
      <div class="row"><a class="btn" href="#/u/${fu}/learn">Start the Learn cards</a></div></div>`;
    h += workoutCard();
    const m = mission(fu), s = E.summarise(history, fu), prac = ACTIVITIES[fu].find(a => a.id === 'shift' || a.id === 'eqm');
    const q = (href, ic, title, note) => `<a class="qtile" href="${href}">${tile(ic, 'm')}<b>${title}</b><span class="note">${note}</span></a>`;
    h += `<div class="qtiles">${q(`#/u/${fu}`, fu, `Unit ${fu}`, `Mission ${m.n} of ${m.steps.length}`)}
      ${q('#/review', 'review', 'Review', due ? `${due} question${due > 1 ? 's' : ''} to fix` : 'Nothing due')}
      ${q(`#/u/${fu}/${prac.id}`, prac.id, prac.title, s[prac.id] ? `Level: ${E.LEVELS[s[prac.id].level]}` : 'Not started')}
      ${q(`#/u/${fu}/mcq`, 'mcq', 'Paper 1 practice', s.mcq ? `Best ${pct(s.mcq.bestScore, s.mcq.max)}%` : 'Not started')}
      ${q('#/games', 'games', 'Games', 'Play and practise')}
      ${q('#/me', 'stats', 'My stats', `${xp.total} XP in total`)}</div>`;
  }
  h += `<div class="stats"><div class="stat gold"><b>${xp.week}</b><span>XP this week</span></div>
      <div class="stat"><b>${fu ? (E.summarise(history, fu)[ACTIVITIES[fu].find(a => a.id === 'shift' || a.id === 'eqm').id] ? E.LEVELS[E.summarise(history, fu)[ACTIVITIES[fu].find(a => a.id === 'shift' || a.id === 'eqm').id].level] : '–') : '–'}</b><span>level in ${esc(fu || 'unit')}</span></div>
      <div class="stat"><b>${st.weeks} wk</b><span>streak</span></div><div class="stat"><b>${xp.total}</b><span>XP in total</span></div></div>
    <div class="panel goal"><b>This week: ${Math.min(st.thisWeek, 2)} of 2 activities</b><div class="bar"><i style="width:${Math.min(st.thisWeek, 2) * 50}%"></i></div>
      <p class="note">Finish 2 activities a week to keep your streak going.</p></div>
    ${DEMO ? `<p class="note">Demo mode: <button class="linkbtn teal" id="reset">reset the demo data</button></p>` : ''}</div>`;
  view(h);
  $('#reset')?.addEventListener('click', () => { try { Object.keys(localStorage).filter(k => k.startsWith('ecl:demo')).forEach(k => localStorage.removeItem(k)); } catch { } location.reload(); });
}

// ---------- Units ----------
function unitsView() {
  nav('units');
  const open = new Set(me.open_units || []);
  view(`<div class="narrow"><div class="hero"><p class="eyebrow">Units</p><h1>The allocation of resources</h1>
    <p class="lede">Section 2 of the IGCSE Economics syllabus. Tap a unit to see its mission, learning cards, practice and Paper 1 questions.</p></div>
    <div class="ulist">${UNITS.map(u => {
      const built = u.ready && CONTENT[u.id], isOpen = open.has(u.id);
      if (!isOpen) return `<div class="urow locked">${tile('lock', 'm')}<div><b>${u.id} ${esc(u.title)}</b><span class="note">Locked. Your teacher will open ${u.id} when the class gets to it.</span></div></div>`;
      if (!built) return `<div class="urow locked">${tile(u.id, 'm')}<div><b>${u.id} ${esc(u.title)}</b><span class="note">Coming soon: the activities for this unit are being built.</span></div></div>`;
      const m = mission(u.id);
      return `<a class="urow" href="#/u/${u.id}">${tile(u.id, 'm')}<div><b>${u.id} ${esc(u.title)}</b><span class="note">${esc(u.sub)} · Mission ${m.n} of ${m.steps.length}</span>
        <div class="bar" aria-hidden="true"><i style="width:${Math.round(100 * m.n / m.steps.length)}%"></i></div></div>${m.complete ? '<span class="chip ok">Done</span>' : ''}</a>`;
    }).join('')}</div></div>`);
}

// ---------- unit page: Mission, Learn, Practice, Paper 1, Data, Key words ----------
const UTABS = [['mission', 'Mission', 'mission'], ['learn', 'Learn', 'learn'], ['practice', 'Practice', 'shift'], ['paper1', 'Paper 1', 'mcq'], ['data', 'Data response', 'data'], ['words', 'Key words', 'words']];
function aTile(ic, href, title, note, done = false) {
  return `<a class="atile" href="${href}"><span class="ahead" style="--hue:${hueOf(ic)}">${icon(ic, 34)}${done ? `<span class="adone">${TICK}</span>` : ''}</span>
    <span class="abody"><b>${esc(title)}</b><span class="note">${note}</span></span></a>`;
}
const hueOf = ic => ({ learn: '#1E8C87', shift: '#2F6FB5', eqm: '#2F6FB5', mcq: '#D9622B', data: '#7B4FC4', check: '#D29A0F', market: '#B8432F', words: '#2A7A4B' }[ic] || '#1E8C87');
function missionHTML(u) {
  const m = mission(u);
  return `<div class="mission"><div class="row" style="justify-content:space-between"><p class="eyebrow">Unit ${u} mission · ${m.n} of ${m.steps.length} steps</p>${m.complete ? '<span class="chip ok">Badge won</span>' : ''}</div>
    <div class="mbar" aria-hidden="true"><i style="width:${Math.round(100 * m.n / m.steps.length)}%"></i></div>
    <ol class="msteps">${m.steps.map(s => `<li class="${s.done ? 'done' : s.locked ? 'locked' : m.next === s ? 'next' : ''}"><span class="mico">${tile(s.ic, 's')}${s.done ? `<span class="mtick">${TICK}</span>` : ''}</span>
      <div><b>${esc(s.label)}</b><br><span class="note">${esc(s.detail)}</span></div>
      ${!s.locked ? `<a class="btn small${m.next === s ? '' : ' alt'}" href="#/u/${u}/${s.act}">${s.done ? 'Again' : s.key === 'check' ? 'Start' : 'Go'}</a>` : ''}</li>`).join('')}</ol>
    <p class="note">${m.complete ? `You won the <b>${esc(m.badge)}</b> badge.` : `Finish the final challenge to win the <b>${esc(m.badge)}</b> badge.`}</p></div>`;
}
function unitPage(tab = 'mission') {
  nav('units');
  const s = E.summarise(history, U), acts = ACTIVITIES[U], prac = acts.find(a => a.id === 'shift' || a.id === 'eqm'), m = mission(U), top = E.topTrap(E.trapCounts(history, U));
  const cur = UTABS.find(t => t[0] === tab) || UTABS[0];
  const bestNote = id => (s[id] ? `Best ${pct(s[id].bestScore, s[id].max)}% · ${s[id].runs} ${s[id].runs === 1 ? 'try' : 'tries'}${LEVELED.has(id) ? ' · ' + E.LEVELS[s[id].level] : ''}` : 'Not started');
  const cb = checkBest(U);
  let body = '';
  if (cur[0] === 'mission') body = missionHTML(U) + (top ? `<div class="panel" style="margin-top:12px"><b>Your most common mistake in ${U}</b>${trapBox(top[0])}</div>` : '');
  if (cur[0] === 'learn') body = `<div class="tiles">${aTile('learn', `#/u/${U}/learn`, 'Learn cards', `${C().LEARN.length} cards with moving diagrams`, !!s.learn)}</div>
    <ol class="note" style="margin-top:12px">${C().LEARN.map(c => `<li>${esc(c.title)}</li>`).join('')}</ol>`;
  if (cur[0] === 'practice') body = `<div class="tiles">${aTile(prac.id, `#/u/${U}/${prac.id}`, prac.title, bestNote(prac.id), !!s[prac.id])}</div>
    <p class="note" style="margin-top:12px">${esc(prac.sub)}. Two right first time in a row moves you up a level (Core, Stretch, Challenge).</p>`;
  if (cur[0] === 'paper1') body = `<div class="tiles">${aTile('mcq', `#/u/${U}/mcq`, 'Paper 1 practice', bestNote('mcq'), !!s.mcq && s.mcq.best >= 0.6)}
      ${aTile('check', `#/u/${U}/check`, 'Unit checkpoint', cb != null ? `Best ${Math.round(cb * 100)}%` : `${CHECK_N} questions, no hints`, cb != null && cb >= CHECK_PASS)}</div>
    <div class="minicard${cb != null && cb >= CHECK_PASS ? ' won' : ''}">${tile('check', 'm')}<div><p class="eyebrow">Unit checkpoint</p><b>${esc(uName())} checkpoint</b>
      <p class="note">${cb != null && cb >= CHECK_PASS ? `Passed with ${Math.round(cb * 100)}%.` : `${CHECK_N} Paper 1 questions from Core to Challenge, with no hints. Score ${CHECK_PASS * 100}% to pass. Best taken after the mission.`}</p></div>
      <a class="btn small${cb != null && cb >= CHECK_PASS ? ' alt' : ''}" href="#/u/${U}/check">${cb != null ? 'Try again' : 'Start'}</a></div>`;
  if (cur[0] === 'data') body = `<div class="tiles">${aTile('data', `#/u/${U}/data`, C().DATA.title, s.data ? `Best ${s.data.bestScore}/${s.data.max}` : 'Not started', !!s.data)}</div>
    <p class="note" style="margin-top:12px">A Paper 2 style case study: identify, calculate, draw and explain. Two tries on each part.</p>`;
  if (cur[0] === 'words') body = `<table class="lb">${Object.entries(C().VI || {}).map(([en, v]) => `<tr><td><b>${esc(en)}</b></td><td>${esc(v)}</td></tr>`).join('')}</table>`;
  view(`<div class="narrow"><div class="row"><a href="#/units">← All units</a></div>
    <div class="tcard ucard"><div class="uhead">${tile(U, 'm')}<h2>${esc(uName())}</h2><span class="chip ${m.complete ? 'ok' : 'gold'}">${m.complete ? 'Done' : `${m.n}/${m.steps.length}`}</span></div>
      <div class="utabs" role="tablist" aria-label="Unit ${U} sections">${UTABS.map(([k, label, ic]) => `<a role="tab" href="#/u/${U}/tab/${k}" aria-selected="${k === cur[0]}">${icon(k === 'practice' ? prac.id : ic, 16)}${label}</a>`).join('')}</div>
      <div role="tabpanel" aria-label="${cur[1]}">${body}</div></div></div>`);
}

// ---------- Review ----------
function reviewView() {
  nav('review');
  const due = reviewDue(history), traps = Object.entries(E.trapCounts(history.filter(a => (me.open_units || []).includes(a.unit)))).sort((a, b) => b[1] - a[1]).slice(0, 4);
  view(`<div class="narrow"><div class="hero"><p class="eyebrow">Review</p><h1>Questions to fix</h1></div>
    ${due.length ? `<div class="tcard"><h3>${due.length} question${due.length > 1 ? 's' : ''} due today</h3>
      <p class="note">Paper 1 questions you missed, from ${esc([...new Set(due.map(id => MCQ_BY_ID[id].unit))].join(' and '))}.</p>
      <div class="row"><a class="btn" href="#/review/go">Review ${Math.min(due.length, 10)} questions</a></div></div>`
      : `<div class="panel"><p style="margin:0"><b>Nothing due today.</b> Well done! Try a Paper 1 practice to find more to work on.</p></div>`}
    <div class="panel"><p class="note" style="margin:0">A question you miss comes back straight away. When you get it right it comes back after 1, then 3 and 7 days, so it stays in your memory.</p></div>
    ${traps.length ? `<h2>Mistakes you make most</h2>${traps.map(([t, n]) => `<div class="fb tip"><b>${esc(TRAPS[t].label)} · ${n}×</b>${esc(TRAPS[t].tip)}</div>`).join('')}` : ''}
    <h2>Key words</h2><table class="lb">${openUnits().flatMap(u => Object.entries(CONTENT[u].VI || {})).filter((x, i, a) => a.findIndex(y => y[0] === x[0]) === i).map(([en, v]) => `<tr><td><b>${esc(en)}</b></td><td>${esc(v)}</td></tr>`).join('')}</table></div>`);
}
function reviewRun() {
  const ids = reviewDue(history).slice(0, 10);
  if (!ids.length) return go('#/review');
  nav(null); wide(true);
  const t0 = Date.now(), answers = []; let i = 0, score = 0;
  const show = () => {
    if (i >= ids.length) return done();
    const it = MCQ_BY_ID[ids[i]], opts = E.shuffle(it.options.map((o, k) => ({ ...o, right: k === 0 })));
    const rec = { id: it.id, level: it.level, first_try: false, trap: null, ok: false, hinted: false };
    view(`<p><a href="#/review">← Review</a></p><div class="row"><b class="grow">Question ${i + 1} of ${ids.length}</b><span class="chip mint">${it.unit}</span></div>
      <div class="steps" style="margin-top:8px">${ids.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="card"><p class="event">${esc(it.stem)}</p><div class="${it.diagram ? 'play-grid' : ''}">${it.diagram ? '<div class="dgwrap" id="dg"></div>' : ''}<div>
      <div class="choices">${opts.map((o, k) => `<button class="choice" data-k="${k}"><b style="margin-right:8px">${'ABCD'[k]}</b> ${esc(o.t)}</button>`).join('')}</div>
      <button class="alt small" id="hint">Show a hint</button><div id="fb" aria-live="polite"></div></div></div></div>`);
    if (it.diagram) createDiagram($('#dg'), { start: it.diagram });
    $('#hint').onclick = () => { rec.hinted = true; $('#hint').outerHTML = `<div class="fb tip"><b>Hint</b>${esc(it.hint)}</div>`; };
    $$('.choice').forEach(b => (b.onclick = () => {
      const o = opts[+b.dataset.k];
      $$('.choice').forEach((x, k) => { x.disabled = true; if (opts[k].right) x.classList.add('right'); });
      rec.pick = o.t; rec.ok = o.right; rec.first_try = o.right && !rec.hinted; if (!o.right) { b.classList.add('wrong'); rec.trap = o.trap || null; }
      if (rec.first_try) score++;
      answers.push(rec); $('#hint')?.remove();
      $('#fb').innerHTML = `<div class="fb ${o.right ? 'ok' : 'no'}"><b>${o.right ? 'Right! ⭐' : 'Not this time. It will come back soon.'}</b>${esc(it.explain)}</div>${o.right ? '' : trapBox(o.trap)}
        <button id="nx" style="width:100%">${i + 1 < ids.length ? 'Next question' : 'See my results'}</button>`;
      $('#nx').onclick = () => { i++; show(); };
    }));
  };
  const done = async () => {
    wide(false);
    const a = { unit: 'review', activity: 'review', level_start: 0, level_end: 0, score, max_score: ids.length, seconds: Math.round((Date.now() - t0) / 1000), answers };
    const xp = E.xpForNew(history, a);
    view(`<div class="narrow"><div class="tcard" style="text-align:center"><h1>Review done</h1><p style="font:800 2.4rem var(--font-display);margin:.2em 0">${score} / ${ids.length}</p>
      <p class="note">right first time</p>${xpLine(xp)}<p class="note" id="saved">Saving…</p></div><a class="btn" href="#/review">Back to Review</a></div>`);
    const ok = await saveAttempt(a);
    $('#saved').textContent = ok ? '✔ Saved' : 'Saved on this device. It will upload when you are back online.';
  };
  show();
}

// ---------- Games ----------
function gamesView() {
  nav('games');
  const us = openUnits();
  view(`<div class="narrow"><div class="hero"><p class="eyebrow">Games</p><h1>Play and practise</h1>
    <p class="lede">The practice games adapt to you: two right first time in a row and they get harder. Market Town is the class trading game your teacher runs.</p></div>
    ${us.map(u => { const p = ACTIVITIES[u].find(a => a.id === 'shift' || a.id === 'eqm'), s = E.summarise(history, u);
      return `<h2>${esc(uName(u))}</h2><div class="tiles">${aTile(p.id, `#/u/${u}/${p.id}`, p.title, s[p.id] ? `Level: ${E.LEVELS[s[p.id].level]}` : esc(p.sub), !!s[p.id])}
        ${aTile('mcq', `#/u/${u}/mcq`, 'Paper 1 race', s.mcq ? `Best ${pct(s.mcq.bestScore, s.mcq.max)}%` : '10 questions that adapt', !!s.mcq)}</div>`; }).join('')}
    <h2>Class games</h2><div class="tiles">${aTile('market', '../', 'Market Town', 'Buy and sell in a live class market. Your teacher starts it.')}</div></div>`);
}

// ---------- Me: stats, leaderboard, settings ----------
function meView(tab = 'stats') {
  nav('me');
  const tabs = `<div class="tabs" role="tablist">${[['stats', 'My stats'], ['leaderboard', 'Leaderboard'], ['settings', 'Settings']].map(([k, l]) => `<a role="tab" href="#/me/${k}" aria-selected="${k === tab}">${l}</a>`).join('')}</div>`;
  const headH = `<div class="hero"><p class="eyebrow">Me</p><h1>${esc(me.display_name)}</h1></div>${tabs}`;
  if (tab === 'leaderboard') { view(`<div class="narrow">${headH}<div id="lb"><p class="note">Loading…</p></div></div>`); return leaderboard(); }
  if (tab === 'settings') {
    const mode = pref.get('mode', '');
    view(`<div class="narrow">${headH}<div class="tcard"><h3>Vietnamese help words</h3><p class="note">Show Vietnamese for key words like demand (cầu) and supply (cung).</p>
        <div class="tabs">${[[true, 'On'], [false, 'Off']].map(([v, l]) => `<button data-vi="${v}" aria-selected="${vi() === v}">${l}</button>`).join('')}</div></div>
      <div class="tcard"><h3>Colours</h3><div class="tabs">${[['', 'Device'], ['light', 'Light'], ['dark', 'Dark']].map(([v, l]) => `<button data-mode="${v}" aria-selected="${mode === v}">${l}</button>`).join('')}</div></div>
      <div class="tcard"><h3>My PIN</h3><p class="note">Signed in as ${esc(me.username)}.</p><div class="row"><button class="alt" id="pin">Change my PIN</button></div></div></div>`);
    $$('[data-vi]').forEach(b => (b.onclick = () => { pref.set('vi', b.dataset.vi === 'true'); meView('settings'); }));
    $$('[data-mode]').forEach(b => (b.onclick = () => { pref.set('mode', b.dataset.mode); if (b.dataset.mode) document.documentElement.dataset.mode = b.dataset.mode; else delete document.documentElement.dataset.mode; meView('settings'); }));
    $('#pin').onclick = () => changePin(false);
    return;
  }
  const us = openUnits(), xp = E.xpTotals(history), st = streak();
  const unitScore = u => { const cb = checkBest(u), s = E.summarise(history, u); return cb != null ? Math.round(cb * 100) : s.mcq ? pct(s.mcq.bestScore, s.mcq.max) : null; };
  const scores = us.map(unitScore).filter(x => x != null), overall = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const srow = (name, v, big = false, note = '') => `<div class="srow${big ? ' big' : ''}"><div class="sname">${esc(name)}</div><div class="sline"><div class="sbar"><i style="width:${v || 0}%"></i></div><b>${v == null ? '–' : v + '%'}</b></div>${note ? `<p class="note">${note}</p>` : ''}</div>`;
  // right first time on each kind of task, from the last 20 answers of that kind
  const rft = (acts, u) => { const xs = history.filter(a => (!u || a.unit === u) && acts.includes(a.activity)).flatMap(a => (a.answers || []).filter(x => x.id !== 'meta')).slice(-20); return xs.length ? pct(xs.filter(x => x.first_try).length, xs.length) : null; };
  const skill = (label, v) => `<div class="skillrow"><span>${esc(label)}</span><div class="bar"><i class="${v != null && v < 50 ? 'low' : ''}" style="width:${v || 0}%"></i></div><span>${v == null ? '–' : v + '%'}</span></div>`;
  const traps = Object.entries(E.trapCounts(history)).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const ACT = Object.fromEntries(Object.entries(ACTIVITIES).flatMap(([u, as]) => as.map(a => [u + a.id, a.title])));
  view(`<div class="narrow">${headH}
    <div class="scard"><div class="shead">${icon('workout', 16)} Unit scores</div>
      ${srow('Overall', overall, true)}
      ${us.map(u => { const cb = checkBest(u), s = E.summarise(history, u); return srow(uName(u), unitScore(u), false, cb != null ? `Best unit checkpoint` : s.mcq ? 'Best Paper 1 practice (take the unit checkpoint to update)' : 'Not started'); }).join('')}</div>
    <h2>My progress</h2>
    <div class="stats"><div class="stat gold"><b>${xp.total}</b><span>XP in total</span></div><div class="stat"><b>${xp.week}</b><span>XP this week</span></div>
      <div class="stat"><b>${st.weeks} wk</b><span>streak (${Math.min(st.thisWeek, 2)}/2 this week)</span></div><div class="stat"><b>${history.length}</b><span>activities finished</span></div></div>
    <div class="panel"><h3>Skills</h3><div class="skills">
      ${skill('Practice games', rft(['shift', 'eqm']))}${skill('Paper 1 questions', rft(['mcq', 'check', 'review']))}${skill('Data response', rft(['data']))}
      ${us.map(u => skill(`${u} overall`, rft(['shift', 'eqm', 'mcq', 'check', 'data'], u))).join('')}</div>
      <p class="note">Right first time, from your last 20 answers of each kind.</p></div>
    <div class="panel"><h3>Mistakes to watch</h3>${traps.length ? traps.map(([t, n]) => `<div class="fb tip"><b>${esc(TRAPS[t].label)} · ${n}×</b>${esc(TRAPS[t].tip)}</div>`).join('') : '<p class="note">No mistakes recorded yet.</p>'}</div>
    <div class="panel"><h3>History</h3>${history.length ? `<ul class="hist">${history.slice().reverse().slice(0, 15).map(a => `<li>${tile(a.activity === 'review' ? 'review' : a.activity === 'check' ? 'check' : a.activity, 's')}<span>${esc(a.unit === 'review' ? 'Review' : `${a.unit} ${ACT[a.unit + a.activity] || (a.activity === 'check' ? 'Unit checkpoint' : a.activity)}`)}</span><span class="note">${a.score}/${a.max_score} · ${ago(a.created_at)}</span></li>`).join('')}</ul>` : '<p class="note">Nothing yet.</p>'}</div></div>`);
}
async function leaderboard() {
  let b; try { b = await rpc('ec_board', { p_token: token.get() }); } catch { b = null; }
  const el = $('#lb'); if (!el) return;
  if (!b) { el.innerHTML = '<div class="panel"><p class="note">The leaderboard needs an internet connection.</p></div>'; return; }
  if (!b.on) { el.innerHTML = `<div class="panel"><b>Your teacher has turned the class leaderboard off.</b><p class="note">Your XP this week: ${(b.rows[0] || {}).week || 0}. In total: ${(b.rows[0] || {}).xp || 0}.</p></div>`; return; }
  const draw = mode => {
    const key = mode === 'week' ? 'week' : 'xp', rows = b.rows.slice().sort((x, y) => y[key] - x[key]).filter(r => r[key] > 0 || r.me);
    const myPos = rows.findIndex(r => r.me), top = rows.slice(0, 10);
    const row = (r, k) => `<tr class="${r.me ? 'me' : ''}"><td style="width:2.4em">${k < 3 && r[key] > 0 ? `<span class="medal m${k + 1}">${k + 1}</span>` : k + 1}</td><td>${esc(r.name)}${r.me ? ' (you)' : ''}</td><td class="num">${r[key]} XP</td></tr>`;
    el.innerHTML = `<div class="tabs scope">${[['week', 'This week'], ['all', 'All time']].map(([k, l]) => `<button data-lb="${k}" aria-selected="${k === mode}">${l}</button>`).join('')}</div>
      <table class="lb" style="margin-top:10px">${top.map(row).join('')}${myPos >= 10 ? `<tr><td colspan="3" class="note">…</td></tr>${row(rows[myPos], myPos)}` : ''}</table>
      <p class="note" style="margin-top:8px">Earn XP: 10 for each answer right first time, 2 for each question you finish, 20 for the Learn cards. This week starts again every Monday.</p>`;
    $$('[data-lb]', el).forEach(x => (x.onclick = () => draw(x.dataset.lb)));
  };
  draw('week');
}

// ---------- Learn ----------
const DEMO_SHIFT = { four: [{ D: 1 }, { D: -1 }, { S: 1 }, { S: -1 }], move: [{}, { D: 1 }, { S: -1 }], two: [{ D: 1, S: -1 }, { D: 1, S: 1 }, { D: -1, S: 1 }] };
const effect = d => { const e = E.equilibrium((d.D || 0) * 0.2, (d.S || 0) * 0.2), f = v => (v > 0.001 ? 'rises' : v < -0.001 ? 'falls' : 'stays the same'); return `Price ${f(e.y - 0.5)}, quantity ${f(e.x - 0.5)}.`; };
const M = LEARN_MARKET, mY = P => 0.5 + (P - M.pe) * 0.02;
function explorerText(P) {
  const qd = M.qd(P), qs = M.qs(P);
  if (qd === qs) return `<b>Equilibrium.</b> At ${P}k, buyers want ${fmt(qd)} kg and sellers offer ${fmt(qs)} kg. Everything offered is bought: the market clears.`;
  return qd > qs ? `<b>Shortage of ${fmt(qd - qs)} kg.</b> At ${P}k, buyers want ${fmt(qd)} kg but sellers offer only ${fmt(qs)} kg. Buyers compete, so the price is pushed <b>up</b>.`
    : `<b>Surplus of ${fmt(qs - qd)} kg.</b> At ${P}k, sellers offer ${fmt(qs)} kg but buyers want only ${fmt(qd)} kg. Sellers cut prices to sell, so the price is pushed <b>down</b>.`;
}
function learn() {
  wide(true);
  const L = C().LEARN;
  let i = 0; const t0 = Date.now();
  const show = () => {
    const c = L[i];
    let body = `<p>${esc(c.text || '')}</p>`;
    if (c.kind === 'four') body += `<div class="choices two">${['Demand increases', 'Demand decreases', 'Supply increases', 'Supply decreases'].map((t, k) => `<button class="choice ${k < 2 ? 'd' : 's'}" data-k="${k}">${t}</button>`).join('')}</div>`;
    if (c.kind === 'move' || c.kind === 'two') body += `<div class="choices">${c.rows.map((r, k) => `<button class="choice" data-k="${k}"><span><b>${esc(r[0])}</b><br><span class="small">${esc(r[1])}</span></span></button>`).join('')}</div>`;
    if (c.kind === 'rows') body += c.rows.map(r => `<div class="fb tip"><b>${esc(r[0])}</b>${esc(r[1])}</div>`).join('');
    if (c.kind === 'causes') body += `<div class="choices two"><div class="card" style="border-left:8px solid var(--d)"><h3>${w('Demand', 'demand')} shifts</h3><ul>${c.demand.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="card" style="border-left:8px solid var(--s)"><h3>${w('Supply', 'supply')} shifts</h3><ul>${c.supply.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div>`;
    if (c.kind === 'method') body += `<ol>${c.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol><p><b>Sentence frame</b></p><p class="frame">${esc(c.frame)}</p>`;
    if (c.kind === 'explorer') body += `<label for="pr">Price: <span id="prv"></span> ${esc(M.priceUnit)}</label>
      <input type="range" class="slider" id="pr" min="0" max="${M.prices.length - 1}" step="1" value="${c.market ? 1 : 0}" aria-describedby="eff">
      <div class="readout"><div class="d"><b id="rqd"></b>${w('quantity demanded', 'quantity demanded')}</div><div class="s"><b id="rqs"></b>${w('quantity supplied', 'quantity supplied')}</div><div><b id="rgap"></b><span id="rkind"></span></div></div>
      ${c.market ? '<button class="alt" id="work" style="width:100%">Let the market work ▶</button>' : ''}`;
    if (c.kind === 'schedule') body += `<div class="scroll"><table class="sched"><tr><th>Price (${esc(M.priceUnit)})</th><th>${w('Quantity demanded', 'quantity demanded')} (kg)</th><th>${w('Quantity supplied', 'quantity supplied')} (kg)</th></tr>
      ${M.prices.map(P => `<tr data-p="${P}"><td>${P}</td><td>${fmt(M.qd(P))}</td><td>${fmt(M.qs(P))}</td></tr>`).join('')}</table></div>
      <button class="alt" id="showeq" style="width:100%">Show me the equilibrium</button><p id="eff" aria-live="polite"></p>`;
    const hasDg = ['four', 'move', 'two', 'explorer'].includes(c.kind);
    let under = '';   // the explorer's slider and readout sit directly under the diagram, so students see both while dragging
    if (c.kind === 'explorer') { const k = body.indexOf('<label for="pr">'); under = body.slice(k); body = body.slice(0, k); }
    view(`${backLink()}
      <div class="steps">${L.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="card"><h2>${i + 1}. ${esc(c.title)}</h2>${hasDg ? `<div class="play-grid"><div><div class="dgwrap" id="dg"></div>${under}<p class="center" id="eff" aria-live="polite"></p></div><div>${body}</div></div>` : body}</div>
      <div class="sticky-foot"><button class="alt" id="prev" ${i ? '' : 'disabled'}>Back</button><button id="next">${i === L.length - 1 ? 'Finish' : 'Next'}</button></div>`);
    if (hasDg) {
      const dg = createDiagram($('#dg'));
      if (c.kind === 'explorer') {
        const sl = $('#pr');
        const upd = () => { const P = M.prices[+sl.value], qd = M.qd(P), qs = M.qs(P); dg.priceLine(mY(P), 'P');
          $('#prv').textContent = P; $('#rqd').textContent = fmt(qd); $('#rqs').textContent = fmt(qs);
          $('#rgap').textContent = qd === qs ? '0' : fmt(Math.abs(qd - qs)); $('#rkind').textContent = qd === qs ? 'equilibrium' : qd > qs ? 'shortage' : 'surplus';
          $('#eff').innerHTML = explorerText(P); };
        sl.oninput = upd; upd();
        let timer;
        $('#work')?.addEventListener('click', () => {
          clearInterval(timer); const target = M.prices.indexOf(M.pe);
          if (+sl.value === target) { sl.value = 0; upd(); }
          timer = setInterval(() => { const v = +sl.value; if (v === target) { clearInterval(timer); $('#eff').innerHTML += ' <b>The market has reached equilibrium.</b>'; return; }
            sl.value = v + Math.sign(target - v); upd(); }, 900);
        });
      } else $$('.choice[data-k]').forEach(b => (b.onclick = () => {
        $$('.choice').forEach(x => x.classList.remove('sel')); b.classList.add('sel');
        const d = DEMO_SHIFT[c.kind][+b.dataset.k];
        if (c.kind === 'move' && +b.dataset.k === 0) return dg.along(-1, ph => {
          $('#eff').innerHTML = ph === 1 ? 'The price rises, so buyers move <b>up along</b> the demand curve: a <b>contraction of demand</b>. Quantity demanded falls. The demand curve does not move.'
            : 'Why did the price rise? Something on the <b>supply</b> side, e.g. milk costs rose: supply shifted left. The demand curve stayed where it was.';
        });
        dg.set(d);
        $('#eff').innerHTML = c.kind === 'two' ? esc(c.rows[+b.dataset.k][1]) + '.' : effect(d);
      }));
    }
    $('#showeq')?.addEventListener('click', () => { $(`tr[data-p="${M.pe}"]`).classList.add('eqrow');
      $('#eff').innerHTML = `At <b>${M.pe}k</b>, quantity demanded = quantity supplied = <b>${fmt(M.qd(M.pe))} kg</b>. That is the equilibrium price and equilibrium quantity.`; });
    $('#prev').onclick = () => { i--; show(); };
    $('#next').onclick = async () => {
      if (i < L.length - 1) { i++; return show(); }
      const la = { unit: U, activity: 'learn', level_start: 0, level_end: 0, score: L.length, max_score: L.length, seconds: Math.round((Date.now() - t0) / 1000), answers: L.map(x => ({ id: 'learn-' + x.id, ok: true })) };
      const xp = E.xpForNew(history, la);
      await saveAttempt(la);
      const nextAct = ACTIVITIES[U][1];
      view(`<div class="card center"><h1>Cards done ✔</h1>${xp ? xpLine(xp) : ''}<p>Now test yourself.</p><div class="row" style="justify-content:center"><button id="n">${esc(nextAct.title)} →</button><button class="alt" id="b">Back to ${U}</button></div></div>`);
      $('#n').onclick = () => go('#/u/' + U + '/' + nextAct.id); $('#b').onclick = () => go('#/u/' + U);
    };
  };
  show();
}

// ---------- shared run machinery for the adaptive activities ----------
function newRun(activity, n) {
  const lvl = E.startLevel(history, U, activity);
  return { activity, n, i: 0, t0: Date.now(), levelStart: lvl, lad: { level: lvl, up: 0, down: 0 }, used: new Set(), seen: E.seenIds(history), answers: [], score: 0 };
}
function afterItem(run, rec, next) {
  run.answers.push(rec); if (rec.first_try) run.score++;
  const prev = run.lad.level; run.lad = E.ladder(run.lad, rec.first_try);
  if (run.lad.level > prev) toast('⬆ Level up: ' + E.LEVELS[run.lad.level]);
  run.i++;
  if (run.lad.rescue) run.rescues = (run.rescues || 0) + 1;
  if (run.lad.rescue && run.i < run.n) return rescue(run, rec.trap, prev === 0, next);
  next();
}
// The steps of a 2.5 shift case, filled in with the answers (for worked examples and revealed answers)
const CURVE_NAME = { D: 'Demand', S: 'Supply', both: 'Both curves', none: 'Neither: a movement along a curve' };
const ARROW = { up: '↑ rises', down: '↓ falls', same: 'no change', depends: 'it depends' };
const dirText = it => ['D', 'S'].filter(c => it.dir[c]).map(c => `${CURVE_NAME[c]} shifts <b>${it.dir[c] > 0 ? 'right (increase)' : 'left (decrease)'}</b>`).join('; ');
const answerSteps = it => `<ol class="worked">
  <li>Which curve shifts? <b>${CURVE_NAME[it.curve]}</b>. <span class="muted">${esc(it.hint)}</span></li>
  ${it.curve === 'none' ? '' : `<li>Which way? ${dirText(it)}.</li>`}
  <li>What happens? ${it.out.map(o => `${esc(o.label)} <b>${ARROW[o.ans]}</b>`).join(', ')}.</li></ol><p style="margin:.4em 0 0">${esc(it.why)}</p>`;
// 2.4 schedule items
const stepAnswer = st => (st.type === 'number' ? `${fmt(st.answer)} ${st.unit}` : st.options.find(o => o.v === st.answer).t);
const eqSteps = it => `<ol class="worked">${it.steps.map(st => `<li>${esc(st.q)} <b>${esc(stepAnswer(st))}</b><br><span class="muted">${esc(st.why)}</span></li>`).join('')}</ol>`;
function schedTable(it, showEq = false) {
  const head = it.market ? `<th>Price (${esc(it.priceUnit)})</th><th>${esc(it.groups[0])}: demand</th><th>${esc(it.groups[1])}: demand</th><th>${w('Quantity supplied', 'quantity supplied')}</th>`
    : `<th>Price (${esc(it.priceUnit)})</th><th>${w('Quantity demanded', 'quantity demanded')}</th><th>${w('Quantity supplied', 'quantity supplied')}</th>`;
  return `<div class="scroll"><table class="sched"><tr>${head}</tr>${it.prices.map((p, k) => `<tr class="${k === it.at ? 'hl' : ''}${showEq && k === it.e ? ' eqrow' : ''}"><td>${fmt(p)}</td>${it.market ? `<td>${fmt(it.qa[k])}</td><td>${fmt(it.qb[k])}</td>` : `<td>${fmt(it.qd[k])}</td>`}<td>${fmt(it.qs[k])}</td></tr>`).join('')}</table></div>
    <p class="small muted">Quantities in ${esc(it.unit)}.</p>`;
}
function rescue(run, trap, atCore, next) {
  let ex = '', after = null;
  if (atCore && U === '2.5') {
    const s = E.pickItem(SHIFTS.filter(x => x.level === 0), 0, run.used, run.seen) || SHIFTS.find(x => x.level === 0);
    if (run.activity === 'shift') run.used.add(s.id);
    ex = `<div class="small muted">Market: <b>${esc(s.market)}</b></div><p class="event">${esc(s.event)}</p><div class="play-grid"><div class="dgwrap" id="wdg"></div><div>${answerSteps(s)}</div></div>`;
    after = () => { const dg = createDiagram($('#wdg')); setTimeout(() => dg.set(s.dir), 700); };
  }
  if (atCore && U === '2.4') {
    const it = genEq('eq-find', Math.floor(Math.random() * 2 ** 31));
    ex = `<div class="small muted">Market: <b>${esc(it.good)}</b></div>${schedTable(it, true)}${eqSteps(it)}`;
  }
  const method = C().LEARN.find(c => c.kind === 'method');
  view(`<div class="card"><h2>Strategy card 🧭</h2><p>Two tricky ones in a row. Use this before the next question.</p>${trapBox(trap)}
    <ol>${method.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>
    ${ex ? `<div class="card"><h2>Worked example 📝</h2>${ex}</div>` : ''}
    <button id="ok" style="width:100%">Got it: next question</button>`);
  if (after) after();
  $('#ok').onclick = next;
}
async function finish(run, title, again) {
  wide(false);
  const traps = [...new Set(run.answers.map(a => a.trap).filter(Boolean))];
  const a = { unit: U, activity: run.activity, level_start: run.levelStart, level_end: run.lad.level, score: run.score, max_score: run.n, seconds: Math.round((Date.now() - run.t0) / 1000),
    answers: [...run.answers, { id: 'meta', rescues: run.rescues || 0 }] };
  const xp = E.xpForNew(history, a);
  view(`<div class="card center"><h1>${esc(title)} done</h1><p style="font:800 2.4rem var(--font-display);margin:.2em 0">${run.score} / ${run.n}</p>
    <p class="muted">right first time · finished at ${levelBadge(run.lad.level)}</p>${xpLine(xp)}<p class="small" id="saved">Saving…</p></div>
    ${traps.length ? `<div class="card"><h3>Things to watch</h3>${traps.map(trapBox).join('')}</div>` : '<div class="card center">No mistakes: excellent! ⭐</div>'}
    <div class="row"><button class="grow" id="again">Try again</button><button class="alt grow" id="back">Back to ${U}</button></div>`);
  $('#again').onclick = again; $('#back').onclick = () => go('#/u/' + U);
  const ok = await saveAttempt(a);
  const el = $('#saved'); if (el) el.textContent = ok ? '✔ Saved' : 'Saved on this device. It will upload when you are back online.';
}
const runHead = (run, label) => `${backLink()}
  <div class="row"><b class="grow">${label} ${run.i + 1} of ${run.n}</b>${levelBadge(run.lad.level)}</div>
  <div class="steps" style="margin-top:8px">${Array.from({ length: run.n }, (_, k) => `<i class="${k < run.i ? 'done' : k === run.i ? 'on' : ''}"></i>`).join('')}</div>`;

// ---------- 2.5 Shift detective ----------
const CURVE_LABEL = { D: () => w('Demand', 'demand'), S: () => w('Supply', 'supply') };
const ANS = [['up', '↑ Rises'], ['down', '↓ Falls'], ['same', 'No change'], ['depends', 'It depends']];
function shift(run = newRun('shift', 6)) {
  wide(true);
  if (run.i >= run.n) return finish(run, 'Shift detective', () => shift());
  const it = E.pickItem(SHIFTS, run.lad.level, run.used, run.seen); run.used.add(it.id);
  const rec = { id: it.id, level: it.level, first_try: true, trap: null, ok: false, wrong: [] };
  let step = 1;
  const curves = it.curve === 'both' ? ['D', 'S'] : it.curve === 'none' ? [] : [it.curve];
  const choice = { 2: {}, 3: [] }, tries = {};
  view(`${runHead(run, 'Case')}<div class="card"><div class="small muted">Market: <b>${esc(it.market)}</b></div><p class="event">${esc(it.event)}</p>
    <div class="play-grid"><div class="dgwrap" id="dg"></div><div><div id="step"></div><div id="fb" aria-live="polite"></div></div></div></div>`);
  const dg = createDiagram($('#dg'), { showNew: true });
  const reveal = () => {
    rec.revealed = true; rec.ok = false; if (it.curve === 'none') dg.along(-1, () => {}, false); else dg.set(it.dir); $('#fb').innerHTML = '';
    $('#step').innerHTML = `<div class="fb tip"><b>Here is the answer. Read it, then try the next case.</b>${answerSteps(it)}</div>${trapBox(rec.trap)}
      <button id="nx" style="width:100%">${run.i + 1 < run.n ? 'Next case' : 'See my results'}</button>`;
    $('#nx').onclick = () => afterItem(run, rec, () => shift(run)); $('#nx').focus();
  };
  const wrong = s => { rec.first_try = false; rec.wrong.push(s); rec.trap ||= E.shiftTrap(it, s, s === 1 ? choice[1] : choice[s]);
    tries[s] = (tries[s] || 0) + 1; if (tries[s] >= 2) return reveal();
    $('#fb').innerHTML = `<div class="fb no"><b>Not yet. Try again.</b>Hint: ${esc(it.hint)}</div>${trapBox(E.shiftTrap(it, s, s === 1 ? choice[1] : choice[s]))}`; };
  const render = () => {
    $('#fb').innerHTML = '';
    const el = $('#step');
    if (step === 1) {
      el.innerHTML = `<h3>Step 1 · Which curve shifts?</h3><div class="choices two">
        <button class="choice d" data-c="D">${w('Demand', 'demand')}</button><button class="choice s" data-c="S">${w('Supply', 'supply')}</button>
        <button class="choice" data-c="both">Both curves</button><button class="choice" data-c="none">Neither: a movement along a curve</button></div>`;
      $$('[data-c]', el).forEach(b => (b.onclick = () => {
        choice[1] = b.dataset.c;
        if (E.checkShift(it, 1, b.dataset.c)) { step = curves.length ? 2 : 3; render(); }
        else { b.classList.add('wrong'); b.disabled = true; wrong(1); }
      }));
    } else if (step === 2) {
      el.innerHTML = `<h3>Step 2 · Which way?</h3>${curves.map(c => `<p style="margin:10px 0 4px"><b>${CURVE_LABEL[c]()}</b></p>
        <div class="seg" data-curve="${c}"><button data-v="-1">← Left (decrease)</button><button data-v="1">Right (increase) →</button></div>`).join('')}
        <button id="chk" style="width:100%;margin-top:12px" disabled>Check</button>`;
      $$('.seg', el).forEach(sg => $$('button', sg).forEach(b => (b.onclick = () => {
        $$('button', sg).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); choice[2][sg.dataset.curve] = +b.dataset.v;
        $('#chk').disabled = curves.some(c => !choice[2][c]);
      })));
      $('#chk').onclick = () => { if (E.checkShift(it, 2, choice[2])) { dg.set(it.dir); step = 3; render(); } else wrong(2); };
    } else if (step === 3) {
      const opts = it.level === 2 ? ANS : ANS.filter(a => a[0] !== 'depends');
      el.innerHTML = `<h3>${curves.length ? 'Step 3' : 'Step 2'} · What happens?</h3>${it.curve === 'none' ? '<p class="small muted">No curve shifts here.</p>' : ''}
        ${it.out.map((o, k) => `<p style="margin:10px 0 4px"><b>${esc(o.label)}</b></p><div class="seg" data-k="${k}">${opts.map(([v, t]) => `<button data-v="${v}">${t}</button>`).join('')}</div>`).join('')}
        <button id="chk" style="width:100%;margin-top:12px" disabled>Check</button>`;
      $$('.seg', el).forEach(sg => $$('button', sg).forEach(b => (b.onclick = () => {
        $$('button', sg).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); choice[3][+sg.dataset.k] = b.dataset.v;
        $('#chk').disabled = it.out.some((_, k) => !choice[3][k]);
      })));
      $('#chk').onclick = () => {
        if (!E.checkShift(it, 3, choice[3])) return wrong(3);
        rec.ok = true;
        if (it.curve === 'none') dg.along(-1, () => {}, false);
        el.innerHTML = `<div class="fb ok"><b>${rec.first_try ? 'Right first time! ⭐' : 'Solved.'}</b>${esc(it.why)}</div><button id="nx" style="width:100%">${run.i + 1 < run.n ? 'Next case' : 'See my results'}</button>`;
        $('#fb').innerHTML = '';
        $('#nx').onclick = () => afterItem(run, rec, () => shift(run));
        $('#nx').focus();
      };
    }
  };
  render();
}

// ---------- 2.4 Equilibrium finder (a new generated schedule every time) ----------
function slidePrice(dg, from, to) {
  const t0 = performance.now(), dur = 1200;
  const step = now => { const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3); dg.priceLine(from + (to - from) * e, 'P'); if (t < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function eqm(run = newRun('eqm', 6)) {
  wide(true);
  if (run.i >= run.n) return finish(run, 'Equilibrium finder', () => eqm());
  run.k ||= {};
  const lvl = run.lad.level, n = (run.k[lvl] = (run.k[lvl] || 0) + 1);
  const it = genEq(nextEqKind(lvl, n - 1 + (run.i % 2)), Math.floor(Math.random() * 2 ** 31));
  const rec = { id: it.id, seed: it.seed, level: it.level, first_try: true, trap: null, ok: false };
  if (DEMO) window.__eqItem = it;   // lets the automated tests read the generated question (demo mode only)
  view(`${runHead(run, 'Question')}<div class="card"><div class="small muted">Market: <b>${esc(it.good)}</b> · prices in ${esc(it.priceUnit)}</div><p class="event">${esc(it.title)}</p>
    <div class="${it.y != null ? 'play-grid' : ''}">${it.y != null ? '<div class="dgwrap" id="dg"></div>' : ''}<div>${it.table ? schedTable(it) : ''}
    <ul class="done-steps" id="done"></ul><div id="step"></div><div id="fb" aria-live="polite"></div></div></div></div>`);
  let dg = null; if (it.y != null) { dg = createDiagram($('#dg')); dg.priceLine(it.y, 'P', true); }   // the gap is named once the student has answered
  let si = 0, tries = 0;
  const nextBtn = () => `<button id="nx" style="width:100%">${run.i + 1 < run.n ? 'Next question' : 'See my results'}</button>`;
  const bindNext = () => { $('#nx').onclick = () => afterItem(run, rec, () => eqm(run)); $('#nx').focus(); };
  const reveal = () => {
    rec.revealed = true; rec.ok = false; $('#fb').innerHTML = '';
    if (dg) slidePrice(dg, it.y, 0.5);
    $('#step').innerHTML = `<div class="fb tip"><b>Here is the answer. Read it, then try the next one.</b><ol class="worked" start="${si + 1}">${it.steps.slice(si).map(st => `<li>${esc(st.q)} <b>${esc(stepAnswer(st))}</b><br><span class="muted">${esc(st.why)}</span></li>`).join('')}</ol></div>${trapBox(rec.trap)}${nextBtn()}`;
    bindNext();
  };
  const wrong = trap => {
    rec.first_try = false; rec.trap ||= trap || null; tries++;
    if (tries >= 2) return reveal();
    $('#fb').innerHTML = `<div class="fb no"><b>Not yet. Try again.</b>Hint: ${esc(it.hint)}</div>${trapBox(trap)}`;
  };
  const right = () => {
    const st = it.steps[si];
    $('#done').insertAdjacentHTML('beforeend', `<li>✔ ${esc(st.q)} <b>${esc(stepAnswer(st))}</b></li>`);
    if (dg && (st.answer === 'shortage' || st.answer === 'surplus')) dg.priceLine(it.y, 'P');
    if (dg && (st.answer === 'up' || st.answer === 'down')) slidePrice(dg, it.y, 0.5);
    si++; tries = 0; $('#fb').innerHTML = '';
    if (si < it.steps.length) return render();
    rec.ok = true;
    $('#step').innerHTML = `<div class="fb ok"><b>${rec.first_try ? 'Right first time! ⭐' : 'Solved.'}</b>${esc(it.why)}</div>${nextBtn()}`;
    bindNext();
  };
  const render = () => {
    const st = it.steps[si], el = $('#step');
    if (st.type === 'choice') {
      el.innerHTML = `<h3>${esc(st.q)}</h3><div class="choices ${st.options.length > 3 && st.options.every(o => o.t.length < 14) ? 'two' : ''}">${st.options.map((o, k) => `<button class="choice" data-k="${k}">${esc(o.t)}</button>`).join('')}</div>`;
      $$('.choice', el).forEach(b => (b.onclick = () => { const o = st.options[+b.dataset.k];
        if (o.v === st.answer) return right();
        b.classList.add('wrong'); b.disabled = true; wrong(o.trap); }));
    } else {
      el.innerHTML = `<h3>${esc(st.q)}</h3><div class="numrow"><input id="num" inputmode="numeric" aria-label="Your answer"><span>${esc(st.unit)}</span></div><button id="chk" style="width:100%;margin-top:10px">Check</button>`;
      const check = () => { const v = $('#num').value; if (!v.trim()) return; if (E.markNumber(v, st.answer, 0).ok) right(); else { wrong(st.trap); $('#num').select(); } };
      $('#chk').onclick = check; $('#num').onkeydown = e => { if (e.key === 'Enter') check(); }; $('#num').focus();
    }
  };
  render();
}

// ---------- Paper 1 MCQ ----------
function mcq(run = newRun('mcq', 10)) {
  wide(true);
  if (run.i >= run.n) return finish(run, 'Paper 1 practice', () => mcq());
  const it = E.pickItem(C().MCQ, run.lad.level, run.used, run.seen); run.used.add(it.id);
  const opts = E.shuffle(it.options.map((o, k) => ({ ...o, right: k === 0 })));
  const rec = { id: it.id, level: it.level, first_try: false, trap: null, ok: false, hinted: false };
  view(`${runHead(run, 'Question')}<div class="card"><p class="event">${esc(it.stem)}</p><div class="${it.diagram ? 'play-grid' : ''}">${it.diagram ? '<div class="dgwrap" id="dg"></div>' : ''}<div>
    <div class="choices">${opts.map((o, k) => `<button class="choice" data-k="${k}"><b style="margin-right:8px">${'ABCD'[k]}</b> ${esc(o.t)}</button>`).join('')}</div>
    <button class="alt small" id="hint">Show a hint</button><div id="fb" aria-live="polite"></div></div></div></div>`);
  if (it.diagram) createDiagram($('#dg'), { start: it.diagram });
  $('#hint').onclick = () => { rec.hinted = true; $('#hint').outerHTML = `<div class="fb tip"><b>Hint</b>${esc(it.hint)}</div>`; };
  $$('.choice').forEach(b => (b.onclick = () => {
    const o = opts[+b.dataset.k];
    $$('.choice').forEach((x, k) => { x.disabled = true; if (opts[k].right) x.classList.add('right'); });
    rec.pick = o.t; rec.ok = o.right; rec.first_try = o.right && !rec.hinted; if (!o.right) { b.classList.add('wrong'); rec.trap = o.trap || null; }
    $('#hint')?.remove();
    $('#fb').innerHTML = `<div class="fb ${o.right ? 'ok' : 'no'}"><b>${o.right ? (rec.hinted ? 'Right (with a hint).' : 'Right! ⭐') : 'Not this time.'}</b>${esc(it.explain)}</div>${o.right ? '' : trapBox(o.trap)}
      <button id="nx" style="width:100%">${run.i + 1 < run.n ? 'Next question' : 'See my results'}</button>`;
    $('#nx').onclick = () => afterItem(run, rec, () => mcq(run));
    $('#nx').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }));
}

// ---------- Data response ----------
function data() {
  const D = C().DATA, t0 = Date.now(), res = {}, maxScore = D.questions.reduce((s, q) => s + q.marks, 0);
  view(`${backLink()}<h1>${esc(D.title)}</h1>
    <div class="card"><h3>Source</h3><div class="src">${D.source.map(p => `<p>${esc(p)}</p>`).join('')}
      <table class="t"><tr>${D.table.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${D.table.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div></div>
    <div id="qs"></div>`);
  const qs = $('#qs');
  const done = async () => {
    const score = Object.values(res).reduce((s, r) => s + r.score, 0);
    const answers = D.questions.map(q => ({ id: D.id + '-' + q.id, level: 1, first_try: res[q.id].first, ok: res[q.id].score === q.marks, trap: res[q.id].trap || null, score: res[q.id].score, marks: q.marks, text: res[q.id].text }));
    const da = { unit: U, activity: 'data', level_start: 1, level_end: 1, score, max_score: maxScore, seconds: Math.round((Date.now() - t0) / 1000), answers };
    qs.insertAdjacentHTML('beforeend', `<div class="card center"><h2>Total: ${score} / ${maxScore}</h2>${xpLine(E.xpForNew(history, da))}<p class="small" id="saved">Saving…</p><div class="row" style="justify-content:center"><button id="again">Try again</button><button class="alt" id="back">Back to ${U}</button></div></div>`);
    $('#again').onclick = () => data(); $('#back').onclick = () => go('#/u/' + U);
    const ok = await saveAttempt(da);
    $('#saved').textContent = ok ? '✔ Saved' : 'Saved on this device. It will upload when you are back online.';
  };
  const ask = k => {
    if (k >= D.questions.length) return done();
    const q = D.questions[k], id = 'q' + q.id, r = (res[q.id] = { score: 0, first: true, tries: 0 });
    const card = document.createElement('div'); card.className = 'card'; card.id = id;
    let input = '';
    if (q.type === 'calc') input = `<div class="row"><input id="${id}i" inputmode="decimal" style="max-width:180px" aria-label="Your answer"><b>${esc(q.unit)}</b></div>`;
    if (q.type === 'short') input = `<textarea id="${id}i" aria-label="Your answer" style="min-height:${q.marks > 1 ? 150 : 70}px"></textarea>${q.marks > 1 ? `<button class="alt small" id="${id}f" type="button">Show the sentence frame</button>` : ''}`;
    if (q.type === 'diagram') input = `<div class="dgwrap" id="${id}dg"></div>${['D', 'S'].map(c => `<p style="margin:10px 0 4px"><b>${CURVE_LABEL[c]()}</b></p>
      <div class="seg" data-curve="${c}"><button data-v="-1">← Left</button><button data-v="0">No shift</button><button data-v="1">Right →</button></div>`).join('')}`;
    if (q.type === 'priceline') input = `<div class="dgwrap" id="${id}dg"></div><p style="margin:10px 0 4px"><b>Price line (thousand VND)</b></p>
      <div class="seg" data-k="p">${q.prices.map(p => `<button data-v="${p}">${p}</button>`).join('')}</div>
      <p style="margin:10px 0 4px"><b>The gap between the curves shows</b></p>
      <div class="seg" data-k="t"><button data-v="shortage">A shortage</button><button data-v="surplus">A surplus</button><button data-v="eq">No gap</button></div>`;
    card.innerHTML = `<div class="row"><h3 class="grow">(${q.id}) ${esc(q.q)}</h3><span class="badge">${q.marks} mark${q.marks > 1 ? 's' : ''}</span></div>${input}
      <div class="row" style="margin-top:10px"><button id="${id}c">Check</button><button class="alt small" id="${id}h" type="button">Hint</button></div><div id="${id}fb" aria-live="polite"></div>`;
    qs.append(card); card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const fb = $('#' + id + 'fb'), chk = $('#' + id + 'c');
    $('#' + id + 'h').onclick = e => { e.target.outerHTML = `<div class="fb tip"><b>Hint</b>${esc(q.hint)}</div>`; };
    $('#' + id + 'f')?.addEventListener('click', e => { e.target.outerHTML = `<p class="frame">${esc(q.frame || q.hint)}</p>`; });
    let dg, pick = {};
    const pyOf = p => 0.5 + ((p - q.pe) / (q.prices[q.prices.length - 1] - q.prices[0])) * 0.6;
    if (q.type === 'diagram' || q.type === 'priceline') {
      dg = createDiagram($('#' + id + 'dg'));
      $$('.seg', card).forEach(sg => $$('button', sg).forEach(b => (b.onclick = () => {
        $$('button', sg).forEach(x => x.classList.remove('sel')); b.classList.add('sel');
        if (q.type === 'diagram') { pick[sg.dataset.curve] = +b.dataset.v; dg.set(pick); }
        else { pick[sg.dataset.k] = b.dataset.v; if (sg.dataset.k === 'p') dg.priceLine(pyOf(+b.dataset.v), b.dataset.v, true); }   // gap named only after Check
      })));
    }
    const lock = msg => { fb.innerHTML = msg; chk.remove(); $('#' + id + 'h')?.remove(); card.querySelectorAll('input,textarea,.seg button').forEach(x => (x.disabled = true));
      const nx = document.createElement('button'); nx.textContent = k + 1 < D.questions.length ? 'Next question' : 'Finish'; nx.style.width = '100%'; nx.onclick = () => { nx.remove(); ask(k + 1); }; card.append(nx); };
    const twoPart = (s, show) => {   // diagram-style questions marked out of 2, with one retry
      if (s === 2 || r.tries >= 2) { r.score = r.tries === 1 ? s : Math.min(s, q.marks - 1); if (s < 2) { r.first = false; r.trap = q.trap || null; }
        lock(`<div class="fb ${s === 2 ? 'ok' : 'no'}"><b>${s === 2 ? 'Correct' : 'Here is the answer'} · ${r.score}/${q.marks}</b>${esc(q.why)}</div>`); show(); return; }
      r.first = false; r.trap = q.trap || null;
      fb.innerHTML = `<div class="fb no"><b>${s} of 2 right. One more try.</b>${esc(q.hint)}</div>`;
    };
    chk.onclick = () => {
      const isPick = q.type === 'diagram' || q.type === 'priceline';
      const val = isPick ? null : $('#' + id + 'i').value;
      if (!isPick && !String(val).trim()) return (fb.innerHTML = '<div class="fb tip"><b>Write an answer first.</b></div>');
      if (q.type === 'priceline' && (!pick.p || !pick.t)) return (fb.innerHTML = '<div class="fb tip"><b>Choose a price and what the gap shows.</b></div>');
      r.tries++;
      r.text = isPick ? JSON.stringify(pick) : String(val).slice(0, 600);
      if (q.type === 'calc') {
        const m = E.markNumber(val, q.answer, q.tol);
        if (m.ok) { r.score = r.tries === 1 ? q.marks : Math.max(1, q.marks - 1); return lock(`<div class="fb ok"><b>Correct · ${r.score}/${q.marks}</b>${esc(q.why)}</div>`); }
        r.first = false; r.trap = q.trap || null;
        if (r.tries >= 2) { r.score = 0; return lock(`<div class="fb no"><b>Not quite · 0/${q.marks}</b>${esc(q.why)}</div>`); }
        return (fb.innerHTML = `<div class="fb no"><b>Not quite. One more try.</b>${esc(q.hint)}</div>`);
      }
      if (q.type === 'diagram') return twoPart(['D', 'S'].filter(c => (pick[c] || 0) === q.dir[c]).length, () => dg.set(q.dir));
      if (q.type === 'priceline') return twoPart((+pick.p === q.target) + (pick.t === q.answer), () => dg.priceLine(pyOf(q.target), String(q.target)));
      // short answers, marked by keyword groups
      const m = E.markShort(val, q.groups, q.need);
      r.score = Math.max(r.score, m.score);
      const pills = q.groups.length > 1 ? `<div>${q.groups.map(g => `<span class="pill ${m.hits.includes(g.label) ? 'hit' : 'miss'}">${m.hits.includes(g.label) ? '✔' : '…'} ${esc(g.label)}</span>`).join('')}</div>` : '';
      if (m.ok || r.tries >= 2) {
        if (!m.ok) { r.first = false; r.trap = (m.missing.find(g => g.trap === 'shortage-surplus') || m.missing.find(g => g.trap) || {}).trap || q.trap || null; }
        return lock(`<div class="fb ${m.ok ? 'ok' : 'no'}"><b>${r.score}/${q.marks}</b>${pills}<p style="margin:.5em 0 0"><b>A full answer:</b> ${esc(q.why)}</p></div>`);
      }
      r.first = false;
      fb.innerHTML = `<div class="fb no"><b>${m.score}/${q.marks} so far. Improve your answer once.</b>${pills}${m.missing.filter(g => g.ask).map(g => `<p style="margin:.4em 0 0">• ${esc(g.ask)}</p>`).join('') || esc(q.hint)}</div>`;
      chk.textContent = 'Check again';
    };
  };
  ask(0);
}


// ---------- Unit checkpoint: 12 Paper 1 questions (4 Core, 4 Stretch, 4 Challenge), no hints, marked at the end ----------
function checkpoint() {
  wide(true);
  const pool = C().MCQ, qs = [0, 1, 2].flatMap(l => E.shuffle(pool.filter(q => q.level === l)).slice(0, CHECK_N / 3));
  const t0 = Date.now(), answers = []; let i = 0;
  const show = () => {
    if (i >= qs.length) return done();
    const it = qs[i], opts = E.shuffle(it.options.map((o, k) => ({ ...o, right: k === 0 })));
    view(`${backLink()}<div class="row"><b class="grow">${esc(U)} checkpoint · question ${i + 1} of ${qs.length}</b><span class="chip gold">No hints</span></div>
      <div class="steps" style="margin-top:8px">${qs.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="card"><p class="event">${esc(it.stem)}</p><div class="${it.diagram ? 'play-grid' : ''}">${it.diagram ? '<div class="dgwrap" id="dg"></div>' : ''}<div>
      <div class="choices">${opts.map((o, k) => `<button class="choice" data-k="${k}"><b style="margin-right:8px">${'ABCD'[k]}</b> ${esc(o.t)}</button>`).join('')}</div>
      <p class="note">Your answers are marked at the end.</p></div></div></div>`);
    if (it.diagram) createDiagram($('#dg'), { start: it.diagram });
    $$('.choice').forEach(b => (b.onclick = () => {
      const o = opts[+b.dataset.k];
      answers.push({ id: it.id, level: it.level, first_try: o.right, ok: o.right, trap: o.right ? null : o.trap || null, pick: o.t });
      i++; show();
    }));
  };
  const done = async () => {
    wide(false);
    const score = answers.filter(a => a.ok).length, passed = score / qs.length >= CHECK_PASS;
    const a = { unit: U, activity: 'check', level_start: 0, level_end: 0, score, max_score: qs.length, seconds: Math.round((Date.now() - t0) / 1000), answers };
    const xp = E.xpForNew(history, a);
    view(`<div class="narrow"><div class="tcard" style="text-align:center"><span class="tag ${passed ? '' : 'gold'}" style="align-self:center">${passed ? 'Passed' : 'Not yet'}</span>
        <h1>${esc(U)} checkpoint</h1><p style="font:800 2.4rem var(--font-display);margin:.2em 0">${score} / ${qs.length}</p>
        <p class="note">${passed ? `You passed (${CHECK_PASS * 100}% needed).${mission(U).steps.slice(0, 5).every(s => s.done) ? ` You won the <b>${esc(BADGE[U] || 'Unit champion')}</b> badge.` : ''}` : `You need ${Math.ceil(CHECK_PASS * qs.length)} to pass. Look at the answers below, then try again.`}</p>
        ${xpLine(xp)}<p class="note" id="saved">Saving…</p></div>
      <div class="panel"><h3>Your answers</h3>${answers.map((x, k) => { const q = qs[k]; return `<div class="fb ${x.ok ? 'ok' : 'no'}"><b>${k + 1}. ${x.ok ? '✔' : '✘'} ${esc(q.stem)}</b>
        ${x.ok ? '' : `You chose: ${esc(x.pick)}<br>Answer: <b>${esc(q.options[0].t)}</b><br>`}<span class="note">${esc(q.explain)}</span></div>`; }).join('')}</div>
      <div class="row"><a class="btn" href="#/u/${U}/tab/paper1">Back to ${esc(U)}</a><a class="btn alt" href="#/review">Review</a></div></div>`);
    const ok = await saveAttempt(a);
    $('#saved').textContent = ok ? '✔ Saved' : 'Saved on this device. It will upload when you are back online.';
  };
  show();
}

// ---------- router ----------
const ACT = { learn, shift: () => shift(), eqm: () => eqm(), mcq: () => mcq(), data, check: checkpoint };
function route() {
  if (!me) return login();
  if (me.must_change) return changePin(true);
  const [a, u, act, sub] = location.hash.replace(/^#\/?/, '').split('/');
  if (a === 'units') return unitsView();
  if (a === 'review') return u === 'go' ? reviewRun() : reviewView();
  if (a === 'games') return gamesView();
  if (a === 'me') return meView(u || 'stats');
  const unit = UNITS.find(x => x.id === u);
  if (a === 'u' && unit && unit.ready && CONTENT[u] && (me.open_units || []).includes(u)) {
    U = u;
    if (act === 'tab') return unitPage(sub);
    if (act && ACT[act] && (act === 'check' || ACTIVITIES[U].some(x => x.id === act))) { nav(null); return ACT[act](); }
    return unitPage();
  }
  if (a === 'u') return unitsView();
  home();
}
window.addEventListener('hashchange', route);

async function boot() {
  const t = token.get();
  if (t) {
    try {
      me = await rpc('ec_me', { p_token: t });
      if (me.role === 'teacher') { location.href = 'teacher.html' + location.search; return; }
      history = (await rpc('ec_history', { p_token: t })) || [];
    } catch (e) { me = null; if (e.message !== 'offline') token.set(null); header(); return login(e.message === 'offline' ? errText(e) : ''); }
  }
  header(); flush(); route();
}
boot();

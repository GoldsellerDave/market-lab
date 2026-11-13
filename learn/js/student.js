// Student app, laid out like Checkpoint Quest: navy header with XP, bottom tabs (Home, Units, Review, Games, Me),
// Home with Today's workout, unit pages with a Mission, and the activities of every built unit (2.4, 2.5).
import { rpc, token, DEMO, errText, aiMark } from './api.js?v=a4c0cc27';
import { $, $$, esc, view, toast, pct, pref, busy, ago } from './ui.js?v=a4c0cc27';
import { UNITS, ACTIVITIES, SECTIONS } from './units.js?v=a4c0cc27';
import * as E from './engine.js?v=a4c0cc27';
import { CONTENT, TRAPS, GLOSSARY } from './content.js?v=a4c0cc27';
import { BASELINE, BASELINE_N } from './u1.js?v=a4c0cc27';
import { bandOf, BANDS, BAND_NAMES, BASE_UNIT, baselineBand, plainChain, gapsOf, orderScore, marksFor, UP_AFTER } from './bands.js?v=a4c0cc27';
import { createPPC } from './ppc.js?v=a4c0cc27';
import * as S from './sound.js?v=a4c0cc27';
import * as EM from './eengine.js?v=a4c0cc27';
import { EBANK, EREADY } from './ebank.js?v=a4c0cc27';
import * as Cel from './celebrate.js?v=a4c0cc27';
import { SCEN_BY_UNIT, scenAct, CAST, SCEN_CAST, SORT_EXAMPLE } from './u1s.js?v=a4c0cc27';
import { scene } from './scenes.js?v=a4c0cc27';
import { SHIFTS } from './u25.js?v=a4c0cc27';
import { SHIFT_EVENTS as SHIFT_EVENTS2 } from './u2.js?v=a4c0cc27';
import { genEq, nextEqKind, LEARN_MARKET } from './u24.js?v=a4c0cc27';
import { createDiagram } from './diagram.js?v=a4c0cc27';
import { createCurve } from './curve.js?v=a4c0cc27';
import { PAPERS, PAPER_KEYS, paperHome, paperRun, paperName } from './papers.js?v=a4c0cc27';
import { icon, tile } from './icons.js?v=a4c0cc27';
import { mission as missionOf, checkBest as checkBestOf, CHECK_PASS, checkN, BADGE } from './mission.js?v=a4c0cc27';
const mission = (u, hist = history) => missionOf(u, hist), checkBest = (u, hist = history) => checkBestOf(u, hist);

let me = null, history = [], U = '2.5';
const C = () => CONTENT[U];
// 1.4 learn cards: what each point means, and three events that shift the curve (new maximums for rice x and phones y)
const PPC_INFO = {
  A: 'Point A: all [[resources]] make phones: 10 million phones and no rice.',
  B: 'Point B is ON the curve: 6 million tonnes of rice and 8 million phones. All resources are used fully.',
  C: 'Point C is ON the curve: 8 million tonnes of rice and 6 million phones. All resources are used fully.',
  D: 'Point D: all resources make rice: 10 million tonnes and no phones.',
  E: 'Point E is INSIDE the curve. Some resources are [[unemployed resources|unemployed]]: the economy could make more of both goods.',
  F: 'Point F is OUTSIDE the curve. It is [[unattainable]] now. [[economic growth|Economic growth]] could make it possible.'
};
const PPC_SHIFTS = [
  ['Better technology', { x: 12, y: 12 }, 'Better [[technology]] lets the economy make more of both goods. The PPC shifts outwards: [[economic growth]].'],
  ['A flood', { x: 7, y: 8 }, 'A flood destroys farms and factories. There are fewer [[resources]], so the PPC shifts inwards.'],
  ['New rice seeds', { x: 13, y: 10 }, 'New seeds help rice only. The curve moves out on the rice [[axis]] only; the most phones stays at 10 million.']
];
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
const LEVELED = new Set(['shift', 'eqm', 'mcq', 'ppc']);
const pracOf = u => (ACTIVITIES[u] || []).find(a => a.id === 'shift' || a.id === 'eqm' || a.id === 'ppc');
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
  S.soundUser(me.username); const on = S.soundOn();
  m.innerHTML = `<span class="pill xp" title="Your XP">${E.xpTotals(history).total} XP</span>${DEMO ? '<span class="pill">Demo</span>' : ''}<button class="pill snd" id="snd" aria-pressed="${on}" aria-label="Sound effects ${on ? 'on' : 'off'}" title="Sound effects ${on ? 'on' : 'off'}">${on ? SOUND_ON : SOUND_OFF}</button><button class="linkbtn" id="out">Sign out</button>`;
  $('#snd').onclick = () => { S.setSound(!S.soundOn()); S.play('ok'); header(); };
  $('#out').onclick = async () => { try { await rpc('ec_logout', { p_token: token.get() }); } catch { } token.set(null); me = null; history = []; header(); nav(null); go('#/'); };
}
const SOUND_ON = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const SOUND_OFF = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
// Feedback sounds: every activity shows right/wrong feedback as .fb.ok / .fb.no, so one watcher covers them all.
new MutationObserver(ms => {
  for (const m of ms) for (const n of m.addedNodes) {
    if (n.nodeType !== 1 || !n.matches('.fb.ok, .fb.no')) continue;
    return S.play(n.matches('.fb.ok') ? 'ok' : 'bad');
  }
}).observe(document.getElementById('app'), { childList: true, subtree: true });
// At the end of an activity: coins, stars and the XP counting up; a mission completed or an English level up gets the big celebration.
function reward(xp, { wasDone = true, bandBefore = null } = {}) {
  const mission = U && CONTENT[U] && !wasDone && missionOf(U, history).complete;
  const after = bandInfo().band, up = bandBefore != null && after != null && after > bandBefore;
  if (mission) Cel.big({ icon: '🏅', title: `Mission complete, ${me.display_name}!`, sub: `${BADGE[U] || 'Unit champion'} badge · ${U}${up ? ` · English level up: ${BANDS[after]}` : ''}`, xp });
  else if (up) Cel.big({ icon: '🎓', title: `Level up! You are now ${BANDS[after]}`, sub: `${BAND_NAMES[after]}. You will get a little less help.`, xp });
  else Cel.set(xp);
}
const missionDone = () => !!(U && CONTENT[U] && missionOf(U, history).complete);
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
  if (bandOf(before, me.eng_band).source === 'none') add({ unit: BASE_UNIT, act: 'baseline', ic: 'base', label: 'English and economics baseline' });
  const rep = EM.repairs(EM.mastery(before), Date.now(), BUILD_OK).concat(EM.dueReviews(EM.mastery(before), Date.now(), BUILD_OK));
  if (rep[0]) add({ unit: 'city', act: rep[0], ic: 'city', label: `Build it up: ${EM.EBLOCKS[rep[0]].name}` });
  const due = reviewDue(before);
  if (due.length >= 2) add({ unit: 'review', act: 'review', ic: 'review', label: `Fix ${Math.min(due.length, 10)} questions you missed` });
  const m = mission(fu, before);
  m.steps.filter(x => !x.done && !x.locked).slice(0, 2).forEach(x => add({ unit: fu, act: x.act, ic: x.ic, label: `${fu}: ${x.label}` }));
  // then the open unit with the weakest Paper 1 result
  const weakest = openUnits().map(u => ({ u, b: (E.summarise(before, u).mcq || { best: -1 }).best })).sort((a, b) => a.b - b.b)[0];
  if (weakest) add({ unit: weakest.u, act: 'mcq', ic: 'mcq', label: `${weakest.u}: Paper 1 practice` });
  openUnits().slice().reverse().forEach(u => { const p = pracOf(u) || ACTIVITIES[u].find(a => a.id === 'p2'); add({ unit: u, act: p.id, ic: p.id, label: `${u}: ${p.title}` }); });
  items.forEach(it => (it.done = todays.some(a => it.unit === 'city' ? a.activity === 'build' && (a.answers || []).some(x => x.block === it.act) : a.unit === it.unit && (it.act === 'scen' ? a.activity.startsWith('sc-') : a.activity === it.act))));
  return items;
}
const itemHref = it => (it.unit === 'review' ? '#/review/go' : it.unit === BASE_UNIT ? '#/baseline' : it.unit === 'city' ? `#/city/${it.act}` : `#/u/${it.unit}/${it.act}`);
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
    if (bandInfo().source === 'none') h += `<div class="tcard"><span class="tag gold">Start here</span><h3>English and economics baseline</h3>
      <p class="note" style="font-size:1rem">Three short texts about economics with 12 questions and no hints. Your score sets how much help you get with English. It takes about 15 minutes.</p>
      <div class="row"><a class="btn" href="#/baseline">Start the baseline</a></div></div>`;
    else if (history.length <= 1) h += `<div class="tcard"><span class="tag gold">Start here</span><h3>${esc(uName(fu))}</h3>
      <p class="note" style="font-size:1rem">Start with the Learn cards: five short cards with moving diagrams. Then work through the unit mission, step by step. It takes about 10 minutes to begin.</p>
      <div class="row"><a class="btn" href="#/u/${fu}/learn">Start the Learn cards</a></div></div>`;
    h += workoutCard();
    if ((me.open_units || []).some(u => u[0] === '1' || u[0] === '2')) { const st = est(), ids = CITY_IDS(), n = ids.filter(id => EM.isMastered(st, id)).length;
      h += `<a class="tcard citycard" href="#/city"><div class="uhead">${tile('city', 'm')}<div class="grow"><p class="eyebrow">My concept city</p><h3 style="margin:0">${n} of ${ids.length} buildings built</h3></div><span aria-hidden="true">→</span></div>${skylineSVG(st, ids, { small: true })}</a>`; }
    const m = mission(fu), s = E.summarise(history, fu), prac = pracOf(fu) || ACTIVITIES[fu].find(a => a.id === 'p2');
    const q = (href, ic, title, note) => `<a class="qtile" href="${href}">${tile(ic, 'm')}<b>${title}</b><span class="note">${note}</span></a>`;
    h += `<div class="qtiles">${q(`#/u/${fu}`, fu, `Unit ${fu}`, `Mission ${m.n} of ${m.steps.length}`)}
      ${q('#/review', 'review', 'Review', due ? `${due} question${due > 1 ? 's' : ''} to fix` : 'Nothing due')}
      ${q(`#/u/${fu}/${prac.id}`, prac.id, prac.title, s[prac.id] ? (LEVELED.has(prac.id) ? `Level: ${E.LEVELS[s[prac.id].level]}` : `Best ${s[prac.id].bestScore}/${s[prac.id].max}`) : 'Not started')}
      ${q(`#/u/${fu}/mcq`, 'mcq', 'Paper 1 practice', s.mcq ? `Best ${pct(s.mcq.bestScore, s.mcq.max)}%` : 'Not started')}
      ${q('#/games', 'games', 'Games', 'Play and practise')}
      ${q('#/me', 'stats', 'My stats', `${xp.total} XP in total`)}</div>`;
  }
  h += `<div class="stats"><div class="stat gold"><b>${xp.week}</b><span>XP this week</span></div>
      <div class="stat"><b>${bandInfo().band == null ? '–' : BANDS[bandInfo().band]}</b><span>English level</span></div>
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
  view(`<div class="narrow"><div class="hero"><p class="eyebrow">Units</p><h1>IGCSE Economics</h1>
    <p class="lede">Tap a unit to see its mission, learning cards, practice and exam questions.</p></div>
    <div class="ulist">${UNITS.map((u, k) => {
      const head = k === 0 || UNITS[k - 1].id[0] !== u.id[0] ? `<h2 style="margin:10px 0 0">Section ${u.id[0]}: ${esc(SECTIONS[u.id[0]])}</h2>` : '';
      return head + unitRow(u); }).join('')}</div></div>`);
}
function unitRow(u) {
  const open = new Set(me.open_units || []);
  return [u].map(u => {
      const built = u.ready && CONTENT[u.id], isOpen = open.has(u.id);
      if (u.paper && isOpen) { const done = PAPER_KEYS.filter(k => history.some(a => a.unit === u.id && a.activity === k)).length;
        return `<a class="urow paperrow" href="#/u/${u.id}">${tile('p2', 'm')}<div><b>${esc(u.title)}</b><span class="note">${esc(u.sub)} · ${done} of 4 papers done</span>
          <div class="bar" aria-hidden="true"><i style="width:${25 * done}%"></i></div></div>${done === 4 ? '<span class="chip ok">Done</span>' : ''}</a>`; }
      if (u.paper) return `<div class="urow locked">${tile('lock', 'm')}<div><b>${esc(u.title)}</b><span class="note">Locked. Your teacher will open the exam papers at the end of the section.</span></div></div>`;
      if (!isOpen) return `<div class="urow locked">${tile('lock', 'm')}<div><b>${u.id} ${esc(u.title)}</b><span class="note">Locked. Your teacher will open ${u.id} when the class gets to it.</span></div></div>`;
      if (!built) return `<div class="urow locked">${tile(u.id, 'm')}<div><b>${u.id} ${esc(u.title)}</b><span class="note">Coming soon: the activities for this unit are being built.</span></div></div>`;
      const m = mission(u.id);
      return `<a class="urow" href="#/u/${u.id}">${tile(u.id, 'm')}<div><b>${u.id} ${esc(u.title)}</b><span class="note">${esc(u.sub)} · Mission ${m.n} of ${m.steps.length}</span>
        <div class="bar" aria-hidden="true"><i style="width:${Math.round(100 * m.n / m.steps.length)}%"></i></div></div>${m.complete ? '<span class="chip ok">Done</span>' : ''}</a>`;
    })[0];
}

// ---------- unit page: Mission, Learn, Practice, Paper 1, Data, Key words ----------
const UTABS = [['mission', 'Mission', 'mission'], ['learn', 'Learn', 'learn'], ['practice', 'Practice', 'shift'], ['paper1', 'Paper 1', 'mcq'], ['data', 'Data response', 'data'], ['words', 'Key words', 'words']];
function aTile(ic, href, title, note, done = false) {
  return `<a class="atile" href="${href}"><span class="ahead" style="--hue:${hueOf(ic)}">${icon(ic, 34)}${done ? `<span class="adone">${TICK}</span>` : ''}</span>
    <span class="abody"><b>${esc(title)}</b><span class="note">${note}</span></span></a>`;
}
const hueOf = ic => ({ city: '#E76F51', scen: '#FF7A59', p2: '#7B4FC4', ppc: '#2F6FB5', learn: '#1E8C87', shift: '#2F6FB5', eqm: '#2F6FB5', mcq: '#D9622B', data: '#7B4FC4', check: '#D29A0F', market: '#B8432F', words: '#2A7A4B' }[ic] || '#1E8C87');
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
  const s = E.summarise(history, U), acts = ACTIVITIES[U], prac = pracOf(U), m = mission(U), top = E.topTrap(E.trapCounts(history, U));
  const has = id => acts.some(a => a.id === id);
  const tabs = UTABS.filter(t => (t[0] !== 'practice' || prac) && (t[0] !== 'data' || has('data'))).flatMap(t => (t[0] === 'data' && false ? [] : [t]));
  if (has('p2')) tabs.splice(tabs.findIndex(t => t[0] === 'paper1') + 1, 0, ['paper2', 'Paper 2', 'p2']);
  const cur = tabs.find(t => t[0] === tab) || tabs[0];
  const bestNote = id => (s[id] ? `Best ${pct(s[id].bestScore, s[id].max)}% · ${s[id].runs} ${s[id].runs === 1 ? 'try' : 'tries'}${LEVELED.has(id) ? ' · ' + E.LEVELS[s[id].level] : ''}` : 'Not started');
  const cb = checkBest(U);
  let body = '';
  if (cur[0] === 'mission') body = missionHTML(U) + (top ? `<div class="panel" style="margin-top:12px"><b>Your most common mistake in ${U}</b>${trapBox(top[0])}</div>` : '');
  if (cur[0] === 'learn') body = `<div class="tiles">${aTile('learn', `#/u/${U}/learn`, 'Learn cards', `${C().LEARN.length} short cards`, !!s.learn)}</div>${scenTiles(U)}
    <ol class="note" style="margin-top:12px">${C().LEARN.map(c => `<li>${esc(c.title)}</li>`).join('')}</ol>`;
  if (cur[0] === 'paper2') body = `<div class="tiles">${aTile('p2', `#/u/${U}/p2`, 'Paper 2 builder', s.p2 ? `Best ${s.p2.bestScore}/${s.p2.max}` : 'Not started', !!s.p2)}</div>
    <p class="note" style="margin-top:12px">${['Put the sentences in the right order to build each answer.', 'Choose the missing words to complete each answer.', 'Write each answer with a sentence frame to help you.', 'Write each answer yourself, then compare it with the mark scheme.'][band()]} Your level: ${bandChip(bandInfo().band)}</p>`;
  if (cur[0] === 'practice') body = `<div class="tiles">${aTile(prac.id, `#/u/${U}/${prac.id}`, prac.title, bestNote(prac.id), !!s[prac.id])}</div>
    <p class="note" style="margin-top:12px">${esc(prac.sub)}. Two right first time in a row moves you up a level (Core, Stretch, Challenge).</p>`;
  if (cur[0] === 'paper1') body = `<div class="tiles">${aTile('mcq', `#/u/${U}/mcq`, 'Paper 1 practice', bestNote('mcq'), !!s.mcq && s.mcq.best >= 0.6)}
      ${aTile('check', `#/u/${U}/check`, 'Unit checkpoint', cb != null ? `Best ${Math.round(cb * 100)}%` : `${checkN(U)} questions, no hints`, cb != null && cb >= CHECK_PASS)}</div>
    <div class="minicard${cb != null && cb >= CHECK_PASS ? ' won' : ''}">${tile('check', 'm')}<div><p class="eyebrow">Unit checkpoint</p><b>${esc(uName())} checkpoint</b>
      <p class="note">${cb != null && cb >= CHECK_PASS ? `Passed with ${Math.round(cb * 100)}%.` : `${checkN(U)} Paper 1 questions from Core to Challenge, with no hints. Score ${CHECK_PASS * 100}% to pass. Best taken after the mission.`}</p></div>
      <a class="btn small${cb != null && cb >= CHECK_PASS ? ' alt' : ''}" href="#/u/${U}/check">${cb != null ? 'Try again' : 'Start'}</a></div>`;
  if (cur[0] === 'data') body = `<div class="tiles">${aTile('data', `#/u/${U}/data`, C().DATA.title, s.data ? `Best ${s.data.bestScore}/${s.data.max}` : 'Not started', !!s.data)}</div>
    <p class="note" style="margin-top:12px">A Paper 2 style case study: identify, calculate, draw and explain. Two tries on each part.</p>`;
  if (cur[0] === 'words') body = C().TERMS ? `<table class="lb">${C().TERMS.map(t => `<tr><td><b>${esc(t)}</b>${viOn() && GLOSSARY[t].vi ? `<br><span class="vi">${esc(GLOSSARY[t].vi)}</span>` : ''}</td><td>${esc(GLOSSARY[t].def)}<br><span class="note">e.g. ${esc(GLOSSARY[t].ex)}</span></td></tr>`).join('')}</table>`
    : `<table class="lb">${Object.entries(C().VI || {}).map(([en, v]) => `<tr><td><b>${esc(en)}</b></td><td>${esc(v)}</td></tr>`).join('')}</table>`;
  view(`<div class="narrow"><div class="row"><a href="#/units">← All units</a></div>
    <div class="tcard ucard"><div class="uhead">${tile(U, 'm')}<h2>${esc(uName())}</h2><span class="chip ${m.complete ? 'ok' : 'gold'}">${m.complete ? 'Done' : `${m.n}/${m.steps.length}`}</span></div>
      <div class="utabs" role="tablist" aria-label="Unit ${U} sections">${tabs.map(([k, label, ic]) => `<a role="tab" href="#/u/${U}/tab/${k}" aria-selected="${k === cur[0]}">${icon(k === 'practice' ? prac.id : ic, 16)}${label}</a>`).join('')}</div>
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
    const it = MCQ_BY_ID[ids[i]], P = mcqParts(it), opts = P.options;
    const rec = { id: it.id, level: it.level, first_try: false, trap: null, ok: false, hinted: false };
    view(`<p><a href="#/review">← Review</a></p><div class="row"><b class="grow">Question ${i + 1} of ${ids.length}</b><span class="chip mint">${it.unit}</span></div>
      <div class="steps" style="margin-top:8px">${ids.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="card"><p class="event">${P.stem}</p><div class="${it.diagram ? 'play-grid' : ''}">${it.diagram ? '<div class="dgwrap" id="dg"></div>' : ''}<div>
      <div class="choices">${opts.map((o, k) => `<button class="choice" data-k="${k}"><b style="margin-right:8px">${'ABCD'[k]}</b> <span class="otext">${P.text(o)}</span></button>`).join('')}</div>
      ${toolsHTML(it)}<div id="fb" aria-live="polite"></div></div></div></div>`);
    if (it.diagram) createDiagram($('#dg'), { start: it.diagram });
    bindTools(it, () => { rec.hinted = true; });
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
    reward(xp);
  };
  show();
}

// ---------- Games ----------
function gamesView() {
  nav('games');
  const us = openUnits();
  view(`<div class="narrow"><div class="hero"><p class="eyebrow">Games</p><h1>Play and practise</h1>
    <p class="lede">The practice games adapt to you: two right first time in a row and they get harder. Market Town is the class trading game your teacher runs.</p></div>
    ${us.map(u => { const p = pracOf(u), s = E.summarise(history, u);
      return `<h2>${esc(uName(u))}</h2><div class="tiles">${p ? aTile(p.id, `#/u/${u}/${p.id}`, p.title, s[p.id] ? `Level: ${E.LEVELS[s[p.id].level]}` : esc(p.sub), !!s[p.id]) : ''}
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
  const bi = bandInfo();
  view(`<div class="narrow">${headH}
    <div class="tcard"><div class="uhead">${tile('base', 'm')}<h2>English level</h2>${bandChip(bi.band)}</div>
      <p class="note">${bi.source === 'none' ? 'Take the baseline on your home page to find your level.' : bi.source === 'teacher' ? 'Your teacher set this level.' : bi.band === 3 ? 'The top level: full exam questions with no extra help.' : `Get 80% or more right first time, without hints or translations, in ${UP_AFTER} activities in a row to move up. So far: ${bi.up} of ${UP_AFTER}.`}${bi.baseline != null ? ` Baseline: ${bi.baseline}/${BASELINE_N}.` : ''}</p>
      ${bi.source === 'none' ? '<div class="row"><a class="btn" href="#/baseline">Start the baseline</a></div>' : ''}</div>
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
    const R = t => (C().BANDED ? rich(t, Math.min(band(), 2)) : esc(t));
    let body = `<p>${R(c.text || '')}</p>`;
    if (c.kind === 'text' && c.example) body += `<div class="fb tip"><b>Example</b>${R(c.example)}</div>`;
    if (c.kind === 'ppc') body += `<div class="choices two">${Object.keys(PPC_INFO).map(k => `<button class="choice" data-pt="${k}"><b>Point ${k}</b></button>`).join('')}</div>`;
    if (c.kind === 'ppc-move') body += `<div class="choices">${[['B', 'C'], ['C', 'D']].map(([a, b2]) => `<button class="choice" data-mv="${a}${b2}"><b>${a} → ${b2}</b></button>`).join('')}</div>`;
    if (c.kind === 'ppc-shift') body += `<div class="choices">${PPC_SHIFTS.map((x, k) => `<button class="choice" data-sh="${k}"><b>${esc(x[0])}</b></button>`).join('')}</div>`;
    if (c.kind === 'four') body += `<div class="choices two">${['Demand increases', 'Demand decreases', 'Supply increases', 'Supply decreases'].map((t, k) => `<button class="choice ${k < 2 ? 'd' : 's'}" data-k="${k}">${t}</button>`).join('')}</div>`;
    if (c.kind === 'move' || c.kind === 'two') body += `<div class="choices">${c.rows.map((r, k) => `<button class="choice" data-k="${k}"><span><b>${esc(r[0])}</b><br><span class="small">${esc(r[1])}</span></span></button>`).join('')}</div>`;
    if (c.kind === 'curve') body += `<label for="cpr">Price of a cup: <b id="cprv"></b>,000 đồng</label><input type="range" class="slider" id="cpr" min="20" max="60" step="10" value="40">
      <div class="readout"><div class="${c.curve === 'D' ? 'd' : 's'}"><b id="cq"></b>${c.curve === 'D' ? w('quantity demanded', 'quantity demanded') : w('quantity supplied', 'quantity supplied')} (cups a day)</div></div>`;
    if (c.kind === 'curve-shift') body += `<div class="choices">${C().SHIFT_EVENTS[c.curve].map((x, k) => `<button class="choice" data-ev="${k}"><b>${esc(x[0])}</b></button>`).join('')}</div>`;
    if (c.kind === 'rows') body += c.rows.map(r => `<div class="fb tip"><b>${R(r[0])}</b>${R(r[1])}</div>`).join('');
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
    const hasDg = ['four', 'move', 'two', 'explorer'].includes(c.kind), hasPPC = c.kind.startsWith('ppc'), hasCv = c.kind.startsWith('curve');
    let under = '';   // the explorer's slider and readout sit directly under the diagram, so students see both while dragging
    if (c.kind === 'explorer') { const k = body.indexOf('<label for="pr">'); under = body.slice(k); body = body.slice(0, k); }
    view(`${backLink()}
      <div class="steps">${L.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="card"><h2>${i + 1}. ${esc(c.title)}</h2>${hasCv ? `<div class="play-grid"><div><div class="dgwrap" id="cv"></div><p class="center" id="eff" aria-live="polite"></p></div><div>${body}</div></div>` : hasPPC ? `<div class="play-grid"><div><div class="dgwrap" id="pg"></div><p class="center" id="eff" aria-live="polite"></p></div><div>${body}</div></div>` : hasDg ? `<div class="play-grid"><div><div class="dgwrap" id="dg"></div>${under}<p class="center" id="eff" aria-live="polite"></p></div><div>${body}</div></div>` : body}</div>
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
    if (hasPPC) {
      const pg = createPPC($('#pg'), { show: c.kind === 'ppc' ? Object.keys(PPC_INFO) : c.kind === 'ppc-move' ? ['B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'F'] });
      $$('[data-pt]').forEach(x => (x.onclick = () => { $$('.choice').forEach(y => y.classList.remove('sel')); x.classList.add('sel'); pg.points(Object.keys(PPC_INFO), x.dataset.pt); $('#eff').innerHTML = rich(PPC_INFO[x.dataset.pt], Math.min(band(), 2)); }));
      $$('[data-mv]').forEach(x => (x.onclick = () => { $$('.choice').forEach(y => y.classList.remove('sel')); x.classList.add('sel'); const [a, b2] = x.dataset.mv.split(''); pg.arrow(a, b2);
        $('#eff').innerHTML = a === 'B' ? 'From B to C: <b>+2 rice</b>, <b>−2 phones</b>. The opportunity cost of 2 more rice is 2 million phones.' : 'From C to D: <b>+2 rice</b>, <b>−6 phones</b>. The same extra rice now costs 6 million phones: the opportunity cost rises.'; }));
      $$('[data-sh]').forEach(x => (x.onclick = () => { $$('.choice').forEach(y => y.classList.remove('sel')); x.classList.add('sel'); const sh = PPC_SHIFTS[+x.dataset.sh]; pg.shift(sh[1]); $('#eff').innerHTML = rich(sh[2], Math.min(band(), 2)); }));
    }
    if (hasCv) curveCard(c, $('#cv'), $('#eff'));
    $('#showeq')?.addEventListener('click', () => { $(`tr[data-p="${M.pe}"]`).classList.add('eqrow');
      $('#eff').innerHTML = `At <b>${M.pe}k</b>, quantity demanded = quantity supplied = <b>${fmt(M.qd(M.pe))} kg</b>. That is the equilibrium price and equilibrium quantity.`; });
    $('#prev').onclick = () => { i--; show(); };
    $('#next').onclick = async () => {
      if (i < L.length - 1) { i++; return show(); }
      const la = { unit: U, activity: 'learn', level_start: 0, level_end: 0, score: L.length, max_score: L.length, seconds: Math.round((Date.now() - t0) / 1000), answers: L.map(x => ({ id: 'learn-' + x.id, ok: true })) };
      const xp = E.xpForNew(history, la), wasDone = missionDone();
      await saveAttempt(la);
      const nextAct = ACTIVITIES[U][1];
      if (C().BANDED) helpCount = 0;
      view(`<div class="card center"><h1>Cards done ✔</h1>${xp ? xpLine(xp) : ''}<p>Now test yourself.</p><div class="row" style="justify-content:center"><button id="n">${esc(nextAct.title)} →</button><button class="alt" id="b">Back to ${U}</button></div></div>`);
      reward(xp, { wasDone });
      $('#n').onclick = () => go('#/u/' + U + '/' + nextAct.id); $('#b').onclick = () => go('#/u/' + U);
    };
  };
  show();
}

// 2.2 and 2.3 curve cards: move the price along one curve, or tap events and watch it shift (or not)
const CV_WORD = { D: ['demanded', 'buyers buy'], S: ['supplied', 'sellers make'] };
function curveMove(curve, from, to, names) {
  if (from == null || from === to) return '';
  const up = to > from, D = curve === 'D', more = D ? !up : up;
  return `Price ${up ? 'up' : 'down'} → quantity ${CV_WORD[curve][0]} ${more ? 'up' : 'down'}.${names ? ` A movement along the curve: <b>${more ? 'an extension' : 'a contraction'}</b>.` : ''}`;
}
function curveCard(c, host, eff, onSeen = () => {}) {
  const cv = createCurve(host, { curve: c.curve }), R = t => rich(t, Math.min(band(), 2));
  if (c.kind === 'curve' || c.type === 'curve') {
    const sl = $('#cpr'), seen = new Set(); let prev = null;
    const upd = () => { const P = +sl.value; if (P === prev) return; const q = cv.at(P); $('#cprv').textContent = P; $('#cq').textContent = q;
      eff.innerHTML = `At ${P},000 đồng ${CV_WORD[c.curve][1]} <b>${q} cups</b> a day. ${curveMove(c.curve, prev, P, c.names)}`; prev = P; seen.add(P); onSeen(seen.size); };
    sl.oninput = upd; upd();
  } else $$('[data-ev]').forEach(b => (b.onclick = () => {
    $$('[data-ev]').forEach(x => x.classList.remove('sel')); b.classList.add('sel');
    const ev = C().SHIFT_EVENTS[c.curve][+b.dataset.ev]; cv.shift(ev[1]); eff.innerHTML = R(ev[2]); onSeen(+b.dataset.ev);
  }));
  return cv;
}

// The 3-step price-change chain for a 2.5 question (after the answer)
const ARW = { up: '↑ rises', down: '↓ falls', '?': 'it depends' };
const chainHTML = ch => `<div class="fb tip chainbox"><b>⛓ Chain it</b><ol class="worked">
  <li>Which curve? <b>${ch.c === 'DS' ? 'Both demand and supply' : ch.c === 'D' ? 'Demand' : 'Supply'}</b></li>
  <li>Which way? <b>${['D', 'S'].filter(k => ch.d[k]).map(k => `${k === 'D' ? 'demand' : 'supply'} ${ch.d[k] > 0 ? 'right (more)' : 'left (less)'}`).join(', ')}</b></li>
  <li>What happens? Price <b>${ARW[ch.P]}</b>, quantity <b>${ARW[ch.Q]}</b></li></ol></div>`;

// ---------- shared run machinery for the adaptive activities ----------
function newRun(activity, n) {
  const lvl = E.startLevel(history, U, activity);
  return { activity, n, i: 0, t0: Date.now(), levelStart: lvl, lad: { level: lvl, up: 0, down: 0 }, used: new Set(), seen: E.seenIds(history), answers: [], score: 0 };
}
function afterItem(run, rec, next) {
  run.answers.push(rec); if (rec.first_try) run.score++;
  const prev = run.lad.level; run.lad = E.ladder(run.lad, rec.first_try);
  if (run.lad.level > prev) { toast('⬆ Level up: ' + E.LEVELS[run.lad.level]); S.play('level'); }
  run.i++;
  if (run.lad.rescue) run.rescues = (run.rescues || 0) + 1;
  if (run.lad.rescue && run.i < run.n && !run.skipRescue) return rescue(run, rec.trap, prev === 0, next);
  run.skipRescue = false;
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
    ${method ? `<ol>${method.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : `<ol><li>Read the question twice. Tap the key words you do not know.</li><li>Find the key idea: which topic is it about?</li><li>Cross out answers you know are wrong.</li><li>Choose, then check your answer against the question.</li></ol>`}</div>
    ${ex ? `<div class="card"><h2>Worked example 📝</h2>${ex}</div>` : ''}
    <button id="ok" style="width:100%">Got it: next question</button>`);
  if (after) after();
  $('#ok').onclick = next;
}
async function finish(run, title, again) {
  wide(false);
  const traps = [...new Set(run.answers.map(a => a.trap).filter(Boolean))];
  const a = { unit: U, activity: run.activity, level_start: run.levelStart, level_end: run.lad.level, score: run.score, max_score: run.n, seconds: Math.round((Date.now() - run.t0) / 1000),
    answers: [...run.answers, { id: 'meta', rescues: run.rescues || 0, ...(C().BANDED ? { band: band(), help: helpCount } : {}) }] };
  const xp = E.xpForNew(history, a), before = run.bandBefore ?? bandInfo().band, wasDone = missionDone();
  view(`<div class="card center"><h1>${esc(title)} done</h1><p style="font:800 2.4rem var(--font-display);margin:.2em 0">${run.score} / ${run.n}</p>
    <p class="muted">right first time · finished at ${levelBadge(run.lad.level)}</p>${xpLine(xp)}<p class="small" id="saved">Saving…</p><p id="lvl"></p></div>
    ${traps.length ? `<div class="card"><h3>Things to watch</h3>${traps.map(trapBox).join('')}</div>` : '<div class="card center">No mistakes: excellent! ⭐</div>'}
    <div class="row"><button class="grow" id="again">Try again</button><button class="alt grow" id="back">Back to ${U}</button></div>`);
  $('#again').onclick = again; $('#back').onclick = () => go('#/u/' + U);
  const ok = await saveAttempt(a);
  const el = $('#saved'); if (el) el.textContent = ok ? '✔ Saved' : 'Saved on this device. It will upload when you are back online.';
  if (C().BANDED) levelUpNote(before);
  reward(xp, { wasDone, bandBefore: C().BANDED ? before : null });
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
  run.n = Math.min(run.n, C().MCQ.length);
  const forced = run.force && C().MCQ.find(q => q.id === run.force); run.force = null;
  const it = forced || E.pickItem(C().MCQ, run.lad.level, run.used, run.seen); run.used.add(it.id);
  if (run.i === 0 && !run.help0) { helpCount = 0; run.help0 = true; run.bandBefore = bandInfo().band; }
  const P = mcqParts(it), opts = P.options;
  const rec = { id: it.id, level: it.level, first_try: false, trap: null, ok: false, hinted: false };
  view(`${runHead(run, 'Question')}<div class="card">${it.plain ? `<div class="row" style="justify-content:flex-end">${bandChip(P.band)}</div>` : ''}<p class="event">${P.stem}</p><div class="${it.diagram ? 'play-grid' : ''}">${it.diagram ? '<div class="dgwrap" id="dg"></div>' : ''}<div>
    <div class="choices">${opts.map((o, k) => `<button class="choice" data-k="${k}"><b style="margin-right:8px">${'ABCD'[k]}</b> <span class="otext">${P.text(o)}</span></button>`).join('')}</div>
    ${toolsHTML(it)}<div id="fb" aria-live="polite"></div></div></div></div>`);
  if (it.diagram) createDiagram($('#dg'), { start: it.diagram });
  bindTools(it, () => { rec.hinted = true; });
  $$('.choice').forEach(b => (b.onclick = () => {
    const o = opts[+b.dataset.k];
    $$('.choice').forEach((x, k) => { x.disabled = true; if (opts[k].right) x.classList.add('right'); });
    rec.pick = o.t; rec.ok = o.right; rec.first_try = o.right && !rec.hinted; if (!o.right) { b.classList.add('wrong'); rec.trap = o.trap || null; }
    $('#hint')?.remove();
    const bl = !o.right && C().BANDED ? (EM.blockOfTrap(o.trap) || EM.itemBlock(it.id)) : null, canBuild = bl && BUILD_OK(bl);
    if (canBuild) { run.miss = run.miss || {}; run.miss[bl] = (run.miss[bl] || 0) + 1; }
    const auto = canBuild && run.miss[bl] >= 2;
    $('#fb').innerHTML = `<div class="fb ${o.right ? 'ok' : 'no'}"><b>${o.right ? (rec.hinted ? 'Right (with a hint).' : 'Right! ⭐') : 'Not this time.'}</b>${esc(it.explain)}</div>${it.chain ? chainHTML(it.chain) : ''}${o.right ? '' : trapBox(o.trap)}
      ${auto ? buildBtn(bl, true) : `<button id="nx" style="width:100%">${run.i + 1 < run.n ? 'Next question' : 'See my results'}</button>${canBuild ? buildBtn(bl, false) : ''}`}`;
    const goBuild = () => buildUp(bl, { fromExam: P.band >= 2, onDone: () => {
      run.miss[bl] = 0; run.skipRescue = true;
      const fresh = E.shuffle(C().MCQ.filter(q => !run.used.has(q.id) && EM.itemBlock(q.id) === bl))[0];
      if (fresh && run.i + 1 < run.n) { run.force = fresh.id; toast('Now try a new question on this idea'); }
      afterItem(run, rec, () => mcq(run)); } });
    $('#bu-go')?.addEventListener('click', goBuild);
    if ($('#nx')) $('#nx').onclick = () => afterItem(run, rec, () => mcq(run));
    ($('#nx') || $('#bu-go')).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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
    const wasDone = missionDone(), ok = await saveAttempt(da);
    $('#saved').textContent = ok ? '✔ Saved' : 'Saved on this device. It will upload when you are back online.';
    reward(E.xpForNew(history.slice(0, -1), da), { wasDone });
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
    chk.onclick = async () => {
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
      const m = await markWritten(String(val), q.groups, q.need, { item: `${C().DATA.id}-${q.id}`, q: q.q, context: [].concat(C().DATA.source || []).join(' '), model: q.why }, chk);
      r.score = Math.max(r.score, m.score); r.by = m.by;
      const pills = q.groups.length > 1 ? `<div>${q.groups.map(g => `<span class="pill ${m.hits.includes(g.label) ? 'hit' : 'miss'}">${m.hits.includes(g.label) ? '✔' : '…'} ${esc(g.label)}</span>`).join('')}</div>` : '';
      if (m.ok || r.tries >= 2) {
        if (!m.ok) { r.first = false; r.trap = (m.missing.find(g => g.trap === 'shortage-surplus') || m.missing.find(g => g.trap) || {}).trap || q.trap || null; }
        return lock(`<div class="fb ${m.ok ? 'ok' : 'no'}"><b>${r.score}/${q.marks}</b>${pills}${aiNote(m)}<p style="margin:.5em 0 0"><b>A full answer:</b> ${esc(q.why)}</p></div>`);
      }
      r.first = false;
      fb.innerHTML = `<div class="fb no"><b>${m.score}/${q.marks} so far. Improve your answer once.</b>${pills}${aiNote(m)}${m.missing.filter(g => g.ask).map(g => `<p style="margin:.4em 0 0">• ${esc(g.ask)}</p>`).join('') || esc(q.hint)}</div>`;
      chk.textContent = 'Check again';
    };
  };
  ask(0);
}


// ---------- Unit checkpoint: 12 Paper 1 questions (4 Core, 4 Stretch, 4 Challenge), no hints, marked at the end ----------
function checkpoint() {
  wide(true);
  const pool = C().MCQ, qs = [0, 1, 2].flatMap(l => E.shuffle(pool.filter(q => q.level === l)).slice(0, checkN(U) / 3)), before = bandInfo().band;
  const t0 = Date.now(), answers = []; let i = 0;
  const show = () => {
    if (i >= qs.length) return done();
    const it = qs[i], P = mcqParts(it), opts = P.options;
    view(`${backLink()}<div class="row"><b class="grow">${esc(U)} checkpoint · question ${i + 1} of ${qs.length}</b><span class="chip gold">No hints</span></div>
      <div class="steps" style="margin-top:8px">${qs.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="card"><p class="event">${P.stem}</p><div class="${it.diagram ? 'play-grid' : ''}">${it.diagram ? '<div class="dgwrap" id="dg"></div>' : ''}<div>
      <div class="choices">${opts.map((o, k) => `<button class="choice" data-k="${k}"><b style="margin-right:8px">${'ABCD'[k]}</b> <span class="otext">${P.text(o)}</span></button>`).join('')}</div>
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
    const a = { unit: U, activity: 'check', level_start: 0, level_end: 0, score, max_score: qs.length, seconds: Math.round((Date.now() - t0) / 1000), answers: C().BANDED ? [...answers, { id: 'meta', band: band(), help: 0 }] : answers };
    const xp = E.xpForNew(history, a);
    view(`<div class="narrow"><div class="tcard" style="text-align:center"><span class="tag ${passed ? '' : 'gold'}" style="align-self:center">${passed ? 'Passed' : 'Not yet'}</span>
        <h1>${esc(U)} checkpoint</h1><p style="font:800 2.4rem var(--font-display);margin:.2em 0">${score} / ${qs.length}</p>
        <p class="note">${passed ? `You passed (${CHECK_PASS * 100}% needed).${mission(U).steps.filter(s => s.key !== 'check').every(s => s.done) ? ` You won the <b>${esc(BADGE[U] || 'Unit champion')}</b> badge.` : ''}` : `You need ${Math.ceil(CHECK_PASS * qs.length)} to pass. Look at the answers below, then try again.`}</p>
        ${xpLine(xp)}<p class="note" id="saved">Saving…</p><p id="lvl"></p></div>
      <div class="panel"><h3>Your answers</h3>${answers.map((x, k) => { const q = qs[k]; return `<div class="fb ${x.ok ? 'ok' : 'no'}"><b>${k + 1}. ${x.ok ? '✔' : '✘'} ${esc(q.stem)}</b>
        ${x.ok ? '' : `You chose: ${esc(x.pick)}<br>Answer: <b>${esc(q.options[0].t)}</b><br>`}<span class="note">${esc(q.explain)}</span></div>`; }).join('')}</div>
      <div class="row"><a class="btn" href="#/u/${U}/tab/paper1">Back to ${esc(U)}</a><a class="btn alt" href="#/review">Review</a></div></div>`);
    const wasDone = missionDone(), ok = await saveAttempt(a);
    $('#saved').textContent = ok ? '✔ Saved' : 'Saved on this device. It will upload when you are back online.';
    if (C().BANDED) levelUpNote(before);
    reward(xp, { wasDone, bandBefore: C().BANDED ? before : null });
  };
  show();
}


// =================== Section 1: English bands, key-word pills, baseline, Paper 2 builder, PPC explorer ===================
const bandInfo = () => bandOf(history, me && me.eng_band);
const band = () => { const b = bandInfo().band; return b == null ? 1 : b; };   // before the baseline: A2 support
const viOn = () => band() === 0 && !!me && me.vi_a1 !== false;
const bandChip = b => (b == null ? '<span class="chip locked">Not placed</span>' : `<span class="chip mint">${BANDS[b]} · ${BAND_NAMES[b]}</span>`);
const stripMarks = s => String(s || '').replace(/\[\[([^|\]]+)(?:\|([^\]]*))?\]\]/g, (m, key, shown) => shown || key);
// [[shown|term]] → a key-word pill you can tap (A1 to B1). B2 sees plain words.
function rich(text, b = band()) {
  return esc(text).replace(/\[\[([^|\]]+)(?:\|([^\]]*))?\]\]/g, (m, key, shown) => {
    const t = shown || key;
    return b >= 3 || !GLOSSARY[key] ? t : `<span class="pillterm${b === 2 ? ' soft' : ''}" role="button" tabindex="0" data-term="${esc(key)}">${t}</span>`;
  });
}
// Exam wording at B1: the first few glossary words become soft pills, so help is there without plain English.
const GKEYS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
const GRE = new RegExp(`\\b(${GKEYS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
function autoPill(text, b = band()) {
  if (b !== 2) return esc(text);
  let n = 0;
  return esc(text).replace(GRE, m => { const key = GKEYS.find(k => k.toLowerCase() === m.toLowerCase()); if (!key || n >= 3) return m; n++;
    return `<span class="pillterm soft" role="button" tabindex="0" data-term="${esc(key)}">${m}</span>`; });
}
let helpCount = 0;   // hints and translations used in the current activity
function openPill(el) {
  const old = $('.gloss'); const same = old && old.dataset.for === el.dataset.term && old.previousElementSibling === el;
  if (old) old.remove(); if (same) return;
  const g = GLOSSARY[el.dataset.term]; if (!g) return;
  const pop = document.createElement('span'); pop.className = 'gloss'; pop.dataset.for = el.dataset.term; pop.setAttribute('role', 'note');
  pop.innerHTML = `<b>${esc(el.dataset.term)}:</b> ${esc(g.def)}<span class="gx"><i>Example:</i> ${esc(g.ex)}</span>${viOn() && g.vi ? `<span class="vi">Tiếng Việt: ${esc(g.vi)}</span>` : ''}`;
  el.after(pop);
}
// Capture phase: a pill inside an answer button opens the pill and does not choose the answer.
document.addEventListener('click', e => {
  const p = e.target.closest('.pillterm');
  if (p) { e.preventDefault(); e.stopPropagation(); return openPill(p); }
  if (!e.target.closest('.gloss')) $('.gloss')?.remove();
}, true);
document.addEventListener('keydown', e => { const p = e.target.closest && e.target.closest('.pillterm'); if (p && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openPill(p); } });
const say = text => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(stripMarks(text)); u.lang = 'en-GB'; u.rate = 0.85; speechSynthesis.speak(u); } catch { } };
const canSay = () => 'speechSynthesis' in window;
// The tools under a question: hint, Vietnamese (A1) and read aloud (A1)
function toolsHTML(it, hints = true) {
  const b = band();
  return `<div class="row qtools">${hints && !(it.plain && b === 3) ? '<button class="alt small" id="hint">Show a hint</button>' : ''}
    ${it.vi && viOn() ? '<button class="alt small" id="vibtn">Tiếng Việt</button>' : ''}${b === 0 && canSay() ? '<button class="alt small" id="say">🔊 Listen</button>' : ''}</div>
    ${it.vi && viOn() ? `<p class="vi" id="vitext" hidden>${esc(it.vi)}</p>` : ''}`;
}
function bindTools(it, onHint) {
  $('#vibtn')?.addEventListener('click', () => { $('#vitext').hidden = false; $('#vibtn').remove(); helpCount++; });
  $('#say')?.addEventListener('click', () => say((band() <= 1 && it.plain) || it.stem || it.q));
  $('#hint')?.addEventListener('click', () => { helpCount++; onHint && onHint(); $('#hint').outerHTML = `<div class="fb tip"><b>Hint</b>${esc(it.hint)}</div>`; });
}
// A Paper 1 question at the student's band: plain words for A1 and A2 (3 options at A1), exam words for B1 and B2.
function mcqParts(it) {
  const b = band(), plain = !!it.plain && b <= 1;
  let options = it.options.map((o, k) => ({ ...o, right: k === 0 }));
  if (it.plain && b === 0) options = options.slice(0, 3);
  options = E.shuffle(options);
  const stem = it.plain ? (plain ? rich(it.plain, b) : autoPill(it.stem, b)) : esc(it.stem);
  const text = o => (it.plain ? (plain ? rich(o.p, b) : autoPill(o.t, b)) : esc(o.t));
  return { options, stem, text, band: b };
}

// ---------- Baseline: three texts, 12 questions, no hints. Sets the starting English band. ----------
function baselineRun() {
  nav(null); wide(true);
  const t0 = Date.now(), picks = {}, order = BASELINE.map(t => t.qs.map(q => E.shuffle(q.options.map((o, k) => ({ o, right: k === 0 })))));
  const intro = () => view(`<div class="narrow"><div class="hero"><p class="eyebrow">Start here</p><h1>English and economics baseline</h1>
      <p class="lede">Three short texts about economics, from easier to harder. Read each one and answer 4 questions. There are no hints. It takes about 15 minutes.</p></div>
      <div class="panel"><p style="margin:0">Your score shows how much help you need with English. The app then gives you questions at the right level, and gives you less help as you improve.</p></div>
      <button class="btn go" id="go">Start</button></div>`) && ($('#go').onclick = () => show(0));
  const show = t => {
    const T = BASELINE[t];
    view(`<div class="row"><b class="grow">Text ${t + 1} of ${BASELINE.length}</b><span class="chip gold">No hints</span></div>
      <div class="steps" style="margin-top:8px">${BASELINE.map((_, k) => `<i class="${k < t ? 'done' : k === t ? 'on' : ''}"></i>`).join('')}</div>
      <div class="card"><div class="play-grid"><div class="passage"><h2>${esc(T.title)}</h2>${T.paras.map((p, k) => `<p><b class="pn">${k + 1}</b> ${esc(p)}</p>`).join('')}</div>
      <div>${T.qs.map((q, k) => `<div class="bq" data-q="${k}"><p class="event" style="font-size:1rem">${k + 1}. ${esc(q.q)}</p>
        <div class="choices">${order[t][k].map((x, j) => `<button class="choice" data-j="${j}">${esc(x.o)}</button>`).join('')}</div></div>`).join('')}
      <button id="next" style="width:100%" disabled>${t + 1 < BASELINE.length ? 'Next text' : 'Finish'}</button></div></div></div>`);
    $$('.bq').forEach(box => $$('.choice', box).forEach(btn => (btn.onclick = () => {
      $$('.choice', box).forEach(x => x.classList.remove('sel')); btn.classList.add('sel');
      picks[`${t}-${box.dataset.q}`] = +btn.dataset.j;
      $('#next').disabled = T.qs.some((_, k) => picks[`${t}-${k}`] == null);
    })));
    $('#next').onclick = () => (t + 1 < BASELINE.length ? show(t + 1) : done());
  };
  const done = async () => {
    wide(false);
    const answers = BASELINE.flatMap((T, t) => T.qs.map((q, k) => { const x = order[t][k][picks[`${t}-${k}`]]; return { id: `${T.id}-${k + 1}`, level: t, first_try: x.right, ok: x.right, pick: x.o, skill: q.skill }; }));
    const score = answers.filter(a => a.ok).length, b = baselineBand(score, BASELINE_N);
    const a = { unit: BASE_UNIT, activity: 'baseline', level_start: b, level_end: b, score, max_score: BASELINE_N, seconds: Math.round((Date.now() - t0) / 1000), answers };
    const xp = E.xpForNew(history, a);
    const what = ['Short, simple questions with key words you can tap, three answer choices, hints and Vietnamese help. Paper 2: put sentences in order to build the answer.',
      'Simple questions with key words you can tap and hints. Paper 2: choose the missing words to complete the answer.',
      'Exam-style questions with some key words you can tap. Paper 2: write your answer using a sentence frame.',
      'Full exam-style questions with no extra help. Paper 2: write your own answers.'][b];
    view(`<div class="narrow"><div class="tcard" style="text-align:center"><p class="eyebrow">Baseline done</p><h1>${score} / ${BASELINE_N}</h1>
      <p style="margin:6px 0">Your starting level: ${bandChip(b)}</p><p class="note">${esc(what)}</p>${xpLine(xp)}<p class="note" id="saved">Saving…</p></div>
      <div class="panel"><p class="note" style="margin:0">When you get 80% or more right first time in 3 activities in a row, without hints or translations, you move up a level and get less help.</p></div>
      <a class="btn go" href="#/">Start learning</a></div>`);
    const ok = await saveAttempt(a);
    $('#saved').textContent = ok ? '✔ Saved' : 'Saved on this device. It will upload when you are back online.';
    Cel.big({ icon: '🎯', title: `Your English level: ${BANDS[b]}`, sub: `${BAND_NAMES[b]} · ${score} / ${BASELINE_N} right`, xp });
  };
  intro();
}

// ---------- Paper 2 builder: one model answer, four ways in (order / word bank / frame / free) ----------
// Paper 2 builder: every question is a ladder of four steps (order, word bank, sentence frame, write it yourself).
// Students start at the step for their English band and climb to writing the answer alone; they can step back for more help.
// The question's mark is the mark for the final, unaided answer. "Right first time" (for the band) is judged on the starting step.
const P2_STEPS = [['order', 'Put in order', '🧩'], ['bank', 'Word bank', '🔤'], ['frame', 'Sentence frame', '🪜'], ['free', 'Write it yourself', '✍️']];
const P2_LEAD = {
  order: 'Use ▲ and ▼ to put the sentences in the right order. Together they make the answer.',
  bank: 'Choose the missing words to complete the answer.',
  frame: 'Write the answer in your own words. Use the sentence frame to help you.',
  free: 'Write the answer by yourself.'
};
const LINKS = /\b(because|so|since|as|this means|which means|therefore|thus|hence|consequently|as a result|due to|leads? to|led to|results? in|then|if|when|causing|causes|so that|meaning|forced to|must|have to|has to)\b/i;
function p2() {
  wide(true); helpCount = 0;
  const b = band(), items = C().P2.slice().sort((x, y) => x.level - y.level || x.marks - y.marks), t0 = Date.now(), answers = [];
  const start = Math.min(3, b ?? 1);
  let i = 0;
  const show = () => {
    if (i >= items.length) return done();
    const q = items[i], rec = { id: q.id, level: q.level, first_try: false, ok: false, score: 0, marks: q.marks, start, steps: [] };
    let s = start, reached = start;
    const ladder = () => `<ol class="ladder" aria-label="Steps for this question">${P2_STEPS.map(([k, label, ic], j) => {
        const cls = j === s ? 'on' : rec.steps.some(x => x.s === j) ? 'done' : j <= reached || j < start ? 'open' : 'locked';
        return `<li class="${cls}">${cls === 'locked' || j === s ? `<span>${ic} ${label}</span>` : `<button class="linkbtn" data-step="${j}">${ic} ${label}</button>`}</li>`; }).join('')}</ol>`;
    const stage = () => {
      const mode = P2_STEPS[s][0], plainQ = b <= 1 && mode !== 'free';
      view(`${backLink()}<div class="row"><b class="grow">Paper 2 builder · question ${i + 1} of ${items.length}</b>${bandChip(b)}</div>
        <div class="steps" style="margin-top:8px">${items.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'on' : ''}"></i>`).join('')}</div>
        <div class="card"><div class="row"><p class="event grow">${q.cmd === 'analyse' ? '<span class="cmdtag">Analyse</span> ' : ''}${plainQ ? rich(q.plain, b) : autoPill(q.q, b)}</p><span class="badge">${q.marks} marks</span></div>
        ${ladder()}
        ${toolsHTML({ ...q, hint: q.groups.map(x => x.ask).join(' '), stem: q.q }, mode === 'free')}
        <p class="note">${P2_LEAD[mode]}${q.cmd === 'analyse' && mode !== 'order' ? ' Analyse = explain each step and link it to the next one (because… so… this means…).' : ''}</p>
        <div id="work"></div><div id="fb" aria-live="polite"></div>
        ${s > 0 ? `<p class="center" style="margin:10px 0 0"><button class="linkbtn" id="easier">Need more help? Go back to: ${P2_STEPS[s - 1][2]} ${P2_STEPS[s - 1][1]}</button></p>` : ''}</div>`);
      bindTools({ ...q, hint: q.groups.map(x => x.ask).join(' '), stem: q.q });
      $$('[data-step]').forEach(x => (x.onclick = () => { s = +x.dataset.step; stage(); }));
      $('#easier')?.addEventListener('click', () => { s--; stage(); });
      const W = $('#work'), fb = $('#fb'), n = q.chain.length;
      // one step finished: record it, then offer the next step (or the next question after writing it yourself)
      const stepDone = (score, first, note = '', model = false) => {
        if (s === start && !rec.steps.some(x => x.s === s)) rec.first_try = first;
        rec.steps.push({ s, score, first });
        const last = s === 3, full = score === q.marks;
        if (last) { rec.score = Math.max(rec.score, score); rec.ok = rec.score === q.marks; }
        reached = Math.max(reached, s + 1);
        fb.innerHTML = `<div class="fb ${full ? 'ok' : 'no'}"><b>${mode === 'order' || mode === 'bank' ? (full ? 'All right! ⭐' : 'Done. Look at the right answer above.') : `${score}/${q.marks}${full && first ? ' · right first time ⭐' : ''}`}</b>${note}
          ${model ? `<p style="margin:.4em 0 0"><b>Model answer:</b> ${rich(q.chain.map(plainChain).join(' '), Math.min(b, 2))}</p>` : ''}</div>
          ${last ? `<button id="nx" style="width:100%">${i + 1 < items.length ? 'Next question' : 'See my results'}</button>`
            : `<button id="up" style="width:100%">Next step: ${P2_STEPS[s + 1][2]} ${P2_STEPS[s + 1][1]} →</button>`}`;
        W.querySelectorAll('button,select,textarea').forEach(x => (x.disabled = true));
        $('#easier')?.remove();
        if (last) $('#nx').onclick = () => { answers.push(rec); i++; show(); };
        else $('#up').onclick = () => { s++; stage(); };
      };
      if (mode === 'order') {
        let ord = E.shuffle(q.chain.map((_, k) => k)); if (ord.every((v, k) => v === k)) ord = ord.slice().reverse();
        let tries = 0, marked = false;
        const draw = () => {
          W.innerHTML = `<ol class="chain">${ord.map((k, pos) => `<li class="ctile${marked ? (k === pos ? ' good' : ' bad') : ''}"><span class="ctext">${rich(plainChain(q.chain[k]), b)}</span>
              <span class="cmove"><button class="alt small" data-up="${pos}" ${pos === 0 ? 'disabled' : ''} aria-label="Move up">▲</button><button class="alt small" data-down="${pos}" ${pos === n - 1 ? 'disabled' : ''} aria-label="Move down">▼</button></span></li>`).join('')}</ol>
            <button id="chk" style="width:100%">Check my order</button>`;
          const swap = (x, y) => { [ord[x], ord[y]] = [ord[y], ord[x]]; marked = false; draw(); };
          $$('[data-up]', W).forEach(x => (x.onclick = () => swap(+x.dataset.up, +x.dataset.up - 1)));
          $$('[data-down]', W).forEach(x => (x.onclick = () => swap(+x.dataset.down, +x.dataset.down + 1)));
          $('#chk', W).onclick = () => {
            tries++; const frac = orderScore(ord, n);
            if (frac === 1) { marked = true; draw(); return stepDone(q.marks, tries === 1); }
            if (tries >= 2) { ord = q.chain.map((_, k) => k); marked = true; draw(); return stepDone(marksFor(frac, q.marks), false); }
            marked = true; draw();
            fb.innerHTML = `<div class="fb no"><b>${Math.round(frac * n)} of ${n} in the right place.</b> Green = right place. Move the red ones and check again.</div>`;
          };
        };
        draw();
      }
      if (mode === 'bank') {
        const gaps = gapsOf(q.chain), words = E.shuffle([...new Set([...gaps, ...(q.bank || [])])]);
        let tries = 0, gi = 0;
        W.innerHTML = `<div class="bank">${words.map(x => `<span class="chip mint">${esc(x)}</span>`).join(' ')}</div>
          <div class="gapped">${q.chain.map(t => `<p>${esc(t).replace(/\{([^}]*)\}/g, () => `<select class="gap" data-g="${gi++}" aria-label="Missing word ${gi}"><option value="">…</option>${words.map(x => `<option>${esc(x)}</option>`).join('')}</select>`)}</p>`).join('')}</div>
          <button id="chk" style="width:100%">Check</button>`;
        $('#chk', W).onclick = () => {
          const sel = $$('select.gap', W); if (sel.some(x => !x.value)) return (fb.innerHTML = '<div class="fb tip"><b>Choose a word for every gap first.</b></div>');
          tries++;
          const right = sel.filter((x, k) => x.value === gaps[k]); sel.forEach((x, k) => { x.classList.toggle('good', x.value === gaps[k]); x.classList.toggle('bad', x.value !== gaps[k]); if (x.value === gaps[k]) x.disabled = true; });
          const frac = right.length / gaps.length;
          if (frac === 1) return stepDone(q.marks, tries === 1);
          if (tries >= 2) { sel.forEach((x, k) => { x.value = gaps[k]; x.classList.remove('bad'); x.classList.add('fixgap'); }); return stepDone(marksFor(frac, q.marks), false); }
          fb.innerHTML = `<div class="fb no"><b>${right.length} of ${gaps.length} right.</b> Change the red ones and check again.</div>`;
        };
      }
      if (mode === 'frame' || mode === 'free') {
        let tries = 0, best = 0;
        W.innerHTML = `${mode === 'frame' ? `<p class="frame">${esc(q.frame)}</p>` : ''}<textarea id="ans" aria-label="Your answer" style="min-height:${q.marks > 4 ? 200 : 150}px"></textarea>
          <button id="chk" style="width:100%">Check my answer</button>`;
        $('#chk', W).onclick = async () => {
          const v = $('#ans').value; if (!v.trim()) return (fb.innerHTML = '<div class="fb tip"><b>Write an answer first.</b></div>');
          tries++; if (mode === 'free') rec.text = v.slice(0, 900);
          const m = await markWritten(v, q.groups, q.need, { item: q.id, q: q.q, model: q.chain.map(plainChain).join(' '), cmd: q.cmd }, $('#chk', W)); best = Math.max(best, m.score); rec.by = m.by;
          const pills = `<div>${q.groups.map(x => `<span class="pill ${m.hits.includes(x.label) ? 'hit' : 'miss'}">${m.hits.includes(x.label) ? '✔' : '…'} ${esc(x.label)}</span>`).join('')}</div>`;
          const capNote = m.listOnly ? '<p style="margin:.4em 0 0"><b>Tip:</b> an Analyse answer must link the points: use because, so, this means, as a result. A list gets at most 2 marks.</p>' : '';
          if (m.ok || tries >= 2) return stepDone(best, m.ok && tries === 1, pills + aiNote(m) + capNote, true);
          fb.innerHTML = `<div class="fb no"><b>${m.score}/${q.marks} so far. Improve your answer once.</b>${pills}${aiNote(m)}${capNote}${m.missing.map(x => `<p style="margin:.3em 0 0">• ${esc(x.ask)}</p>`).join('')}</div>`;
          $('#chk', W).textContent = 'Check again';
        };
      }
    };
    stage();
  };
  const done = async () => {
    wide(false);
    const score = answers.reduce((t, a) => t + a.score, 0), max = items.reduce((t, q) => t + q.marks, 0);
    const a = { unit: U, activity: 'p2', level_start: 0, level_end: 0, score, max_score: max, seconds: Math.round((Date.now() - t0) / 1000), answers: [...answers, { id: 'meta', band: b, help: helpCount }] };
    const xp = E.xpForNew(history, a), before = bandInfo().band, wasDone = missionDone();
    view(`<div class="narrow"><div class="tcard" style="text-align:center"><h1>Paper 2 builder done</h1><p style="font:800 2.4rem var(--font-display);margin:.2em 0">${score} / ${max}</p>
      <p class="note">marks for the answers you wrote yourself</p>${xpLine(xp)}<p class="note" id="saved">Saving…</p><p id="lvl"></p></div>
      <div class="row"><a class="btn" href="#/u/${U}/p2">Try again</a><a class="btn alt" href="#/u/${U}">Back to ${U}</a></div></div>`);
    const ok = await saveAttempt(a);
    $('#saved').textContent = ok ? '✔ Saved' : 'Saved on this device. It will upload when you are back online.';
    levelUpNote(before);
    reward(xp, { wasDone, bandBefore: before });
  };
  show();
}
// After a Section 1 activity: tell the student if their English level changed.
function levelUpNote(before) {
  const after = bandInfo().band, el = $('#lvl'); if (!el || before == null || after == null || after === before) return;
  el.innerHTML = after > before ? `<span class="tag gold" style="align-self:center">Level up!</span> You are now ${bandChip(after)}. You will get a little less help.`
    : `You are now ${bandChip(after)}. You will get more help for a while.`;
}

// ---------- PPC explorer (1.4): read points, opportunity cost and shifts on one PPC ----------
function ppcRun(run = newRun('ppc', 6)) {
  wide(true); if (run.i === 0 && !run.help0) { helpCount = 0; run.help0 = true; run.bandBefore = bandInfo().band; }
  if (run.i >= run.n) return finish(run, 'PPC explorer', () => ppcRun());
  const it = E.pickItem(C().PPC, run.lad.level, run.used, run.seen); run.used.add(it.id);
  const rec = { id: it.id, level: it.level, first_try: true, trap: null, ok: false };
  view(`${runHead(run, 'Question')}<div class="card"><p class="event">${esc(it.title)}</p>
    <div class="play-grid"><div class="dgwrap" id="pg"></div><div><ul class="done-steps" id="done"></ul><div id="step"></div>${toolsHTML({ ...it, stem: it.steps[0].q })}<div id="fb" aria-live="polite"></div></div></div></div>`);
  const pg = createPPC($('#pg'), { show: it.show || ['A', 'B', 'C', 'D'] });
  bindTools({ ...it, stem: it.steps[0].q });
  let si = 0, tries = 0;
  const after = () => { if (it.arrow) pg.arrow(...it.arrow); if (it.shift) pg.shift(it.shift); };
  const nextBtn = () => `<button id="nx" style="width:100%">${run.i + 1 < run.n ? 'Next question' : 'See my results'}</button>`;
  const bindNext = () => { $('#nx').onclick = () => afterItem(run, rec, () => ppcRun(run)); $('#nx').focus(); };
  const reveal = () => { rec.revealed = true; $('#fb').innerHTML = ''; after();
    $('#step').innerHTML = `<div class="fb tip"><b>Here is the answer.</b><ol class="worked" start="${si + 1}">${it.steps.slice(si).map(st => `<li>${esc(st.q)} <b>${esc(stepAnswer(st))}</b><br><span class="muted">${esc(st.why)}</span></li>`).join('')}</ol></div>${trapBox(rec.trap)}${nextBtn()}`; bindNext(); };
  const wrong = trap => { rec.first_try = false; rec.trap ||= trap || null; tries++; if (tries >= 2) return reveal();
    $('#fb').innerHTML = `<div class="fb no"><b>Not yet. Try again.</b>Hint: ${esc(it.hint)}</div>${trapBox(trap)}`; };
  const right = () => {
    const st = it.steps[si]; $('#done').insertAdjacentHTML('beforeend', `<li>✔ ${esc(st.q)} <b>${esc(stepAnswer(st))}</b></li>`);
    si++; tries = 0; $('#fb').innerHTML = '';
    if (si < it.steps.length) { if (si === 1 && it.shift) pg.shift(it.shift); return render(); }
    rec.ok = true; after();
    $('#step').innerHTML = `<div class="fb ok"><b>${rec.first_try ? 'Right first time! ⭐' : 'Solved.'}</b>${esc(it.why)}</div>${nextBtn()}`; bindNext();
  };
  const render = () => {
    const st = it.steps[si], el = $('#step');
    if (st.type === 'choice') {
      const opts = E.shuffle(st.options);
      el.innerHTML = `<h3>${esc(st.q)}</h3><div class="choices">${opts.map((o, k) => `<button class="choice" data-k="${k}">${esc(o.t)}</button>`).join('')}</div>`;
      $$('.choice', el).forEach(btn => (btn.onclick = () => { const o = opts[+btn.dataset.k]; if (o.v === st.answer) return right(); btn.classList.add('wrong'); btn.disabled = true; wrong(o.trap); }));
    } else {
      el.innerHTML = `<h3>${esc(st.q)}</h3><div class="numrow"><input id="num" inputmode="numeric" aria-label="Your answer"><span>${esc(st.unit)}</span></div><button id="chk" style="width:100%;margin-top:10px">Check</button>`;
      const check = () => { const v = $('#num').value; if (!v.trim()) return; if (E.markNumber(v, st.answer, 0).ok) right(); else { wrong(st.trap); $('#num').select(); } };
      $('#chk').onclick = check; $('#num').onkeydown = e => { if (e.key === 'Enter') check(); }; $('#num').focus();
    }
  };
  render();
}


// ---------- Scenarios (Section 1): stories in Ho Chi Minh City where students apply the ideas; XP for each one solved ----------
const UHUE = { '1.1': ['#FF7A59', '#FFC15E'], '1.2': ['#1E9E8F', '#7ED6A5'], '1.3': ['#7B4FC4', '#C79BF2'], '1.4': ['#2F6FB5', '#6EC6FF'] };
const scenSolved = (u, hist = history) => (SCEN_BY_UNIT[u] || []).filter(s => hist.some(a => a.unit === u && a.activity === scenAct(s.id)));
const hueVars = u => `--h1:${(UHUE[u] || UHUE['1.1'])[0]};--h2:${(UHUE[u] || UHUE['1.1'])[1]}`;
function scenHero(s, k, n) {
  return `<div class="scen-hero" style="${hueVars(s.unit)}">${scene(s.scene, s.title)}
    <div class="scen-stk" aria-hidden="true">${s.stickers.map((e, i) => `<span style="animation-delay:${i * 0.15}s">${e}</span>`).join('')}</div>
    <div class="scen-title"><span class="scen-kicker">Scenario ${k + 1} of ${n} · ${s.unit}</span><h2>${esc(s.title)}</h2></div></div>`;
}
function scenTiles(u) {
  const list = SCEN_BY_UNIT[u] || [], done = new Set(scenSolved(u).map(s => s.id));
  if (!list.length) return '';
  return `<h3 style="margin:18px 0 8px"><a href="#/u/${u}/scen">Scenario cards</a>: use the ideas <span class="chip mint">${done.size} of ${list.length} solved</span></h3>
    <div class="scen-grid">${list.map((s, k) => `<a class="scen-tile${done.has(s.id) ? ' done' : ''}" href="#/u/${u}/scen/${s.id}" style="${hueVars(u)}">
      <span class="scen-thumb">${scene(s.scene, '')}<span class="scen-tstk">${s.stickers.slice(0, 3).join('')}</span>${done.has(s.id) ? `<span class="scen-tick">${TICK}</span>` : ''}</span>
      <span class="scen-tbody"><b>${k + 1}. ${esc(s.title)}</b><span class="note">${done.has(s.id) ? 'Solved ✔ · play again for more XP' : `${s.steps.length + (s.explain ? 1 : 0)} tasks · earn XP`}</span></span></a>`).join('')}</div>`;
}
function castHTML(keys) {
  const b = band();
  return `<div class="cast">${keys.map(k => CAST[k]).map(c => `<div class="castrow"><span class="cast-e" aria-hidden="true">${c.e}</span>
    <span><b>${esc(c.name)}</b> <span class="chip mint">${esc(c.role)}</span><br>${esc(c.line)}${b === 0 && viOn() ? `<span class="vi">${esc(c.vi)}</span>` : ''}</span></div>`).join('')}</div>`;
}
const unitCast = u => [...new Set((SCEN_BY_UNIT[u] || []).flatMap(s => SCEN_CAST[s.id] || []))];
const scenCrumbs = () => `<nav class="crumbs" aria-label="You are here"><a href="#/u/${U}">← ${esc(uName())}</a><span aria-hidden="true">›</span><a href="#/u/${U}/scen">Scenario cards</a></nav>`;
function scenPrevNext(idx) {
  const list = SCEN_BY_UNIT[U], pv = list[idx - 1], nx = list[idx + 1];
  return `<nav class="prevnext" aria-label="Other scenarios">${pv ? `<a class="btn alt" href="#/u/${U}/scen/${pv.id}">← ${esc(pv.title)}</a>` : `<a class="btn alt" href="#/u/${U}/scen">← Scenario cards</a>`}
    ${nx ? `<a class="btn alt" href="#/u/${U}/scen/${nx.id}">${esc(nx.title)} →</a>` : `<a class="btn alt" href="#/u/${U}/scen">All scenario cards →</a>`}</nav>`;
}
function scenGroup() {
  const list = SCEN_BY_UNIT[U] || [], solved = new Set(scenSolved(U).map(s => s.id)), next = list.find(s => !solved.has(s.id)) || list[0], cast = unitCast(U);
  view(`<div class="narrow"><nav class="crumbs" aria-label="You are here"><a href="#/u/${U}">← ${esc(uName())}</a></nav>
    <div class="hero" style="${hueVars(U)}"><p class="eyebrow">Unit ${U}</p><h1>Scenario cards</h1><p class="lede">Short stories in Ho Chi Minh City. Use what you learned to solve them. Each one gives you XP.</p>
      <div class="row"><a class="btn" href="#/u/${U}/scen/${next.id}">${solved.size ? (solved.size === list.length ? 'Play again' : 'Continue') : 'Start'}: ${esc(next.title)} →</a></div></div>
    ${cast.length ? `<div class="tcard" style="${hueVars(U)}"><h2 style="margin:0 0 6px">👥 Meet the people</h2><p class="note">You will meet these people in the stories.</p>${castHTML(cast)}</div>`
      : `<div class="tcard"><h2 style="margin:0 0 6px">🇻🇳 Vietnam: rice or phones?</h2><p class="note">These stories are about the whole country. Vietnam can use its resources to grow rice in the Mekong Delta or to make phones in factories in Thủ Đức.</p></div>`}
    ${scenTiles(U)}</div>`);
}
function scenRun(id) {
  const list = SCEN_BY_UNIT[U] || [];
  if (!list.length) return unitPage();
  if (!id) return scenGroup();
  const s = list.find(x => x.id === id); if (!s) return unitPage('learn');
  wide(true); helpCount = 0;
  const b = band(), idx = list.indexOf(s), t0 = Date.now(), answers = [], wasDone = missionDone(), plain = b <= 1;
  const steps = [...s.steps, ...(b === 3 && s.explain ? [{ type: 'explain', ...s.explain }] : [])];
  const T = (exam, simple) => (plain ? rich(simple, b) : autoPill(exam, b));
  const firstTime = !history.some(a => a.activity.startsWith('sc-')), cast = SCEN_CAST[s.id] || [];
  view(`${scenCrumbs()}<div class="scen-card" style="${hueVars(U)}">${scenHero(s, idx, list.length)}<div class="scen-body">
      <div class="row" style="justify-content:space-between"><div class="steps" style="flex:1;margin:0">${steps.map(() => '<i></i>').join('')}</div>${bandChip(b)}</div>
      <div class="scen-story">${T(s.story, s.plain)}</div>
      ${s.table ? `<div class="tablewrap"><table class="sched"><tr>${s.table.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${s.table.rows.map(r => `<tr>${r.map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</table></div>` : ''}
      ${toolsHTML({ vi: s.vi, stem: s.story, plain: s.plain, hint: '' }, false)}
      ${cast.length ? `<div><button class="alt small" id="who" aria-expanded="${firstTime}">👥 Who's who?</button></div><div id="castbox" ${firstTime ? '' : 'hidden'}>${castHTML(cast)}</div>` : ''}
      <div id="sstep"></div><div id="fb" aria-live="polite"></div>${scenPrevNext(idx)}</div></div>`);
  bindTools({ vi: s.vi, stem: s.story, plain: s.plain });
  $('#who')?.addEventListener('click', e => { const box = $('#castbox'); box.hidden = !box.hidden; e.currentTarget.setAttribute('aria-expanded', String(!box.hidden)); });
  const dots = () => $$('.scen-body .steps i').forEach((d, j) => (d.className = j < k ? 'done' : j === k ? 'on' : ''));
  let k = 0;
  const el = () => $('#sstep'), fb = () => $('#fb');
  const smiss = {};
  const nextBtn = () => {
    const last = answers[answers.length - 1], st = steps[k];
    const bl = last && !last.first_try && st.type !== 'explain' ? (EM.blockOfTrap(last.trap) || EM.itemBlock(last.id)) : null, canBuild = bl && BUILD_OK(bl);
    if (canBuild) smiss[bl] = (smiss[bl] || 0) + 1;
    const auto = canBuild && smiss[bl] >= 2, label = k + 1 < steps.length ? 'Next →' : 'Finish';
    fb().insertAdjacentHTML('beforeend', auto ? buildBtn(bl, true) : `<button id="nx" style="width:100%;margin-top:10px">${label}</button>${canBuild ? buildBtn(bl, false) : ''}`);
    const cont = () => { k++; show(); };
    $('#bu-go')?.addEventListener('click', () => buildUp(bl, { fromExam: b >= 2, onDone: () => { smiss[bl] = 0; cont(); } }));
    if ($('#nx')) { $('#nx').onclick = cont; $('#nx').focus({ preventScroll: true }); }
  };
  const show = () => {
    fb().innerHTML = ''; if (k >= steps.length) return done(); dots();
    const st = steps[k], rec = { id: st.type === 'explain' ? `${s.id}-x` : `${s.id}-${k + 1}`, ok: false, first_try: false, trap: null };
    const q = `<h3 class="scen-q">${T(st.q, st.plain || st.q)}</h3>`;
    if (st.type === 'choice') {
      let opts = st.options.map((o, j) => ({ ...o, right: j === 0 }));
      if (b === 0) opts = opts.slice(0, 3);
      opts = E.shuffle(opts);
      let tries = 0;
      el().innerHTML = `${st.ppc ? '<div class="dgwrap" id="spg"></div>' : ''}${q}<div class="choices">${opts.map((o, j) => `<button class="choice" data-j="${j}"><span class="otext">${T(o.t, o.p)}</span></button>`).join('')}</div>`;
      const pg = st.ppc ? createPPC($('#spg'), { show: st.ppc.show || [] }) : null;
      const after = () => { if (!pg) return; if (st.ppc.arrow) pg.arrow(...st.ppc.arrow); if (st.ppc.shift) pg.shift(st.ppc.shift); };
      $$('#sstep .choice').forEach(btn => (btn.onclick = () => {
        const o = opts[+btn.dataset.j]; tries++;
        if (o.right) {
          rec.ok = true; rec.first_try = tries === 1; btn.classList.add('right'); $$('#sstep .choice').forEach(x => (x.disabled = true)); after();
          fb().innerHTML = `<div class="fb ok"><b>${tries === 1 ? 'Right! ⭐' : 'Right.'}</b>${esc(st.why)}</div>`; answers.push(rec); return nextBtn();
        }
        btn.classList.add('wrong'); btn.disabled = true; rec.trap ||= o.trap || null; rec.pick ||= o.t;
        if (tries >= 2) {
          const r = $$('#sstep .choice').find(x => opts[+x.dataset.j].right); r.classList.add('right'); $$('#sstep .choice').forEach(x => (x.disabled = true)); after();
          fb().innerHTML = `<div class="fb no"><b>The answer is: ${esc(opts.find(x => x.right).t)}</b>${esc(st.why)}</div>${trapBox(o.trap)}`; answers.push(rec); return nextBtn();
        }
        fb().innerHTML = `<div class="fb no"><b>Not this one. Try again.</b></div>${trapBox(o.trap)}`;
      }));
    }
    if (st.type === 'sort') {
      const ex = b === 0 && SORT_EXAMPLE[s.id] && st === s.steps.find(x => x.type === 'sort') ? SORT_EXAMPLE[s.id] : null;
      const all = st.items.map((it, j) => ({ ...it, j })), items = ex ? [all[0], ...E.shuffle(all.slice(1))] : E.shuffle(all), pick = ex ? { 0: all[0].b } : {};
      let tries = 0;
      el().innerHTML = `${q}<div class="sortlist">${items.map(it => { const isEx = ex && it.j === 0;
          return `<div class="sortrow${isEx ? ' example' : ''}" data-j="${it.j}"><span class="sort-e" aria-hidden="true">${it.e}</span><span class="sort-t">${isEx ? '<span class="ex-tag">Example</span> ' : ''}${T(it.t, it.p)}${isEx ? `<span class="ex-note">${esc(ex)}</span>` : ''}</span>
          <div class="sort-b n${st.buckets.length}" role="group">${st.buckets.map((bk, bi) => `<button data-b="${bi}"${isEx ? ` disabled class="${bi === it.b ? 'sel' : ''}"` : ''}>${esc(bk)}</button>`).join('')}</div></div>`; }).join('')}</div>
        <button id="chk" style="width:100%" disabled>Check</button>`;
      $$('#sstep .sortrow:not(.example)').forEach(row => $$('button', row).forEach(btn => (btn.onclick = () => {
        pick[row.dataset.j] = +btn.dataset.b; $$('button', row).forEach(x => x.classList.toggle('sel', x === btn)); row.classList.remove('bad');
        $('#chk').disabled = Object.keys(pick).length < items.length;
      })));
      $('#chk').onclick = () => {
        tries++;
        const wrong = items.filter(it => pick[it.j] !== it.b);
        $$('#sstep .sortrow').forEach(row => { const it = st.items[+row.dataset.j], good = pick[row.dataset.j] === it.b; row.classList.toggle('good', good); row.classList.toggle('bad', !good); if (good) $$('button', row).forEach(x => (x.disabled = true)); });
        if (!wrong.length || tries >= 2) {
          rec.ok = !wrong.length; rec.first_try = !wrong.length && tries === 1; if (!rec.first_try) rec.trap = st.trap;
          if (wrong.length) $$('#sstep .sortrow.bad').forEach(row => { const it = st.items[+row.dataset.j]; $$('button', row).forEach((x, bi) => { x.classList.toggle('sel', bi === it.b); x.classList.toggle('fix', bi === it.b); x.disabled = true; }); });
          $('#chk').remove();
          fb().innerHTML = `<div class="fb ${rec.ok ? 'ok' : 'no'}"><b>${rec.ok ? (rec.first_try ? 'All right! ⭐' : 'All right now.') : `${items.length - wrong.length} of ${items.length} right. The right answers are shown.`}</b>${esc(st.why)}</div>${rec.ok ? '' : trapBox(st.trap)}`;
          answers.push(rec); return nextBtn();
        }
        fb().innerHTML = `<div class="fb no"><b>${items.length - wrong.length} of ${items.length} right.</b>Change the red ones and check again.</div>${trapBox(st.trap)}`;
      };
    }
    if (st.type === 'order') {
      const n = st.lines.length; let ord = E.shuffle(st.lines.map((_, j) => j)); if (ord.every((v, j) => v === j)) ord = ord.slice().reverse();
      let tries = 0, marked = false;
      const draw = () => {
        el().innerHTML = `${q}<ol class="chain">${ord.map((j, pos) => `<li class="ctile${marked ? (j === pos ? ' good' : ' bad') : ''}"><span class="ctext">${esc(st.lines[j])}</span>
          <span class="cmove"><button class="alt small" data-up="${pos}" ${pos === 0 ? 'disabled' : ''} aria-label="Move up">▲</button><button class="alt small" data-down="${pos}" ${pos === n - 1 ? 'disabled' : ''} aria-label="Move down">▼</button></span></li>`).join('')}</ol>
          <button id="chk" style="width:100%">Check my order</button>`;
        const swap = (x, y) => { [ord[x], ord[y]] = [ord[y], ord[x]]; marked = false; draw(); };
        $$('#sstep [data-up]').forEach(x => (x.onclick = () => swap(+x.dataset.up, +x.dataset.up - 1)));
        $$('#sstep [data-down]').forEach(x => (x.onclick = () => swap(+x.dataset.down, +x.dataset.down + 1)));
        $('#chk').onclick = () => {
          tries++; const frac = orderScore(ord, n);
          if (frac === 1 || tries >= 2) {
            if (frac < 1) ord = st.lines.map((_, j) => j);
            marked = true; draw(); $('#chk').remove(); $$('#sstep .cmove button').forEach(x => (x.disabled = true));
            rec.ok = frac === 1; rec.first_try = rec.ok && tries === 1;
            fb().innerHTML = `<div class="fb ${rec.ok ? 'ok' : 'no'}"><b>${rec.ok ? (rec.first_try ? 'Perfect order! ⭐' : 'Right order.') : 'Here is the right order.'}</b>${esc(st.why)}</div>`;
            answers.push(rec); return nextBtn();
          }
          marked = true; draw(); fb().innerHTML = `<div class="fb no"><b>${Math.round(frac * n)} of ${n} in the right place.</b>Green = right place. Move the red ones.</div>`;
        };
      };
      draw();
    }
    if (st.type === 'explain') {
      let tries = 0, best = 0;
      el().innerHTML = `<h3 class="scen-q">${esc(st.q)} <span class="badge">B2 challenge</span></h3><textarea id="ans" aria-label="Your answer" style="min-height:120px"></textarea><button id="chk" style="width:100%">Check my answer</button>`;
      $('#chk').onclick = async () => {
        const v = $('#ans').value; if (!v.trim()) return (fb().innerHTML = '<div class="fb tip"><b>Write an answer first.</b></div>');
        tries++; rec.text = v.slice(0, 600);
        const m = await markWritten(v, st.groups, st.need, { item: rec.id, q: st.q, context: s.story }, $('#chk')); best = Math.max(best, m.score); rec.by = m.by;
        const pills = `<div>${st.groups.map(x => `<span class="pill ${m.hits.includes(x.label) ? 'hit' : 'miss'}">${m.hits.includes(x.label) ? '✔' : '…'} ${esc(x.label)}</span>`).join('')}</div>`;
        if (m.ok || tries >= 2) {
          rec.ok = m.ok; rec.first_try = m.ok && tries === 1; rec.score = best; rec.marks = st.need; $('#chk').remove(); $('#ans').disabled = true;
          fb().innerHTML = `<div class="fb ${m.ok ? 'ok' : 'no'}"><b>${best}/${st.need}${m.ok ? ' ⭐' : ''}</b>${pills}${aiNote(m)}</div>`; answers.push(rec); return nextBtn();
        }
        fb().innerHTML = `<div class="fb no"><b>${m.score}/${st.need} so far. Improve your answer once.</b>${pills}${aiNote(m)}${m.missing.map(x => `<p style="margin:.3em 0 0">• ${esc(x.ask)}</p>`).join('')}</div>`;
        $('#chk').textContent = 'Check again';
      };
    }
    if (k > 0) el().scrollIntoView({ block: 'nearest' });
  };
  const done = async () => {
    wide(false);
    const score = answers.filter(a => a.first_try).length, a = { unit: U, activity: scenAct(s.id), level_start: 0, level_end: 0, score, max_score: steps.length,
      seconds: Math.round((Date.now() - t0) / 1000), answers: [...answers, { id: 'meta', band: b, help: helpCount }] };
    const xp = E.xpForNew(history, a), nx = list[idx + 1];
    view(`<div class="narrow"><div class="scen-card" style="${hueVars(U)}">${scenHero(s, idx, list.length)}<div class="scen-body center">
        <span class="tag gold" style="align-self:center">Scenario solved</span><p style="font:800 2.2rem var(--font-display);margin:.2em 0">${score} / ${steps.length}</p>
        <p class="note">right first time</p>${xpLine(xp)}<p class="note" id="saved">Saving…</p>
        <div class="row" style="justify-content:center">${nx ? `<a class="btn" href="#/u/${U}/scen/${nx.id}">Next scenario: ${esc(nx.title)} →</a>` : `<a class="btn" href="#/u/${U}/scen">All scenario cards</a>`}
          <a class="btn alt" href="#/u/${U}/scen/${s.id}">Play again</a></div>
        <nav class="crumbs" style="justify-content:center"><a href="#/u/${U}/scen">← Scenario cards</a><span aria-hidden="true">·</span><a href="#/u/${U}">${esc(uName())}</a></nav></div></div></div>`);
    const ok = await saveAttempt(a);
    $('#saved').textContent = ok ? '✔ Saved' : 'Saved on this device. It will upload when you are back online.';
    reward(xp, { wasDone });
  };
  show();
}

// ---------- written answers: keywords first, then AI marking when it is set up ----------
// ctx: { item, q (question), context, model }. Returns the keyword-style result { score, max, ok, hits, missing } plus
// by ('ai' or 'keywords') and the AI's feedback sentence. Any AI problem leaves the keyword result.
async function markWritten(text, groups, need, ctx, btn) {
  const kw = E.markShort(text, groups, need);
  const old = btn && btn.textContent; if (btn) { btn.disabled = true; btn.textContent = 'Checking your answer… 🤖'; }
  const ai = await aiMark({ unit: U, item: ctx.item, question: ctx.q, context: String(ctx.context || '').replace(/\[\[([^|\]]+)(?:\|([^\]]*))?\]\]/g, (m, k, s) => s || k),
    model: ctx.model || '', command: ctx.cmd || 'explain', points: groups.map(g => g.label), need, answer: text, band: band(), name: String(me.display_name || '').split(/\s+/)[0],
    keyword_ok: kw.ok, keyword_hits: kw.hits });
  if (btn) { btn.disabled = false; btn.textContent = old; }
  if (!ai) {
    if (ctx.cmd === 'analyse' && kw.score > 2 && !LINKS.test(text)) return { ...kw, score: 2, ok: false, listOnly: true, by: 'keywords' };
    return { ...kw, by: 'keywords' };
  }
  const hits = groups.filter(g => ai.hits.includes(g.label)).map(g => g.label);
  return { score: Math.min(hits.length, need), max: need, ok: hits.length >= need, hits, missing: groups.filter(g => !hits.includes(g.label)), by: 'ai', feedback: ai.feedback };
}
const aiNote = m => (m.by === 'ai' ? `<p class="ainote">🤖 ${esc(m.feedback || '')}<span class="note"> · marked by AI</span></p>` : '');


// ---------- Econ engine: Build it up (drop down to the idea underneath) and My city (the skyline) ----------
// A miss in Paper 1 practice or a scenario points at a block (eengine.js). After one miss the student can choose "Build it up";
// after a second miss on the same block it starts by itself. One block = an intuition builder, the idea, and 3 checks
// (the first in plain English, to tell a language problem from a concept problem). Fail the checks and it goes ONE floor
// down to the weakest block underneath, then back up. Fail again and it becomes a guided walkthrough: half a building,
// which comes back the next day. Then the student returns to their question and gets a fresh one on the same idea.
const est = () => EM.mastery(history);
const BUILD_OK = id => EREADY.has(id);
function buildBtn(block, auto) {
  return `<button class="${auto ? '' : 'alt '}buildbtn" id="bu-go" style="width:100%;margin-top:8px">🏗️ ${auto ? 'Build it up first' : 'Build it up (2 min)'}: ${esc(EM.EBLOCKS[block].name)}${auto ? ' →' : ''}</button>`;
}
function buildBuilder(host, bl, onDone) {
  const B = EBANK[bl].builder, b = band(), T = (t, p) => (b <= 1 ? rich(p || t, b) : autoPill(t, b));
  let finished = false; const doneOnce = () => { if (!finished) { finished = true; onDone(); } };
  if (B.type === 'sort') {
    const items = E.shuffle(B.items.map((it, j) => ({ t: it[0], e: it[1], b: it[2], p: it[3] || it[0], j }))), pick = {};
    host.innerHTML = `<p class="scen-q"><b>${esc(B.q)}</b></p><div class="sortlist">${items.map(it => `<div class="sortrow" data-j="${it.j}"><span class="sort-e" aria-hidden="true">${it.e}</span><span class="sort-t">${esc(it.p)}</span>
      <div class="sort-b n${B.buckets.length}" role="group">${B.buckets.map((bk, bi) => `<button data-b="${bi}">${esc(bk)}</button>`).join('')}</div></div>`).join('')}</div>
      <button id="bchk" style="width:100%" disabled>Check</button><div id="bfb"></div>`;
    $$('.sortrow', host).forEach(row => $$('button', row).forEach(btn => (btn.onclick = () => { pick[row.dataset.j] = +btn.dataset.b; $$('button', row).forEach(x => x.classList.toggle('sel', x === btn)); $('#bchk', host).disabled = Object.keys(pick).length < items.length; })));
    $('#bchk', host).onclick = () => {
      let right = 0;
      $$('.sortrow', host).forEach(row => { const it = items.find(x => x.j === +row.dataset.j), ok = pick[it.j] === it.b; right += ok; row.classList.add(ok ? 'good' : 'bad');
        $$('button', row).forEach((x, bi) => { x.disabled = true; x.classList.toggle('sel', bi === it.b); x.classList.toggle('fix', !ok && bi === it.b); }); });
      $('#bchk', host).remove(); $('#bfb', host).innerHTML = `<div class="fb ${right === items.length ? 'ok' : 'tip'}"><b>${right} of ${items.length} right.</b>${right === items.length ? 'Great!' : 'The green answers show the right group.'}</div>`; doneOnce();
    };
  }
  if (B.type === 'budget') {
    const fmtd = v => v.toLocaleString('en-US') + ' đồng'; let spent = 0; const got = new Set();
    host.innerHTML = `<p class="scen-q"><b>${esc(B.q)}</b></p><div class="budget"><div class="purse">👛 <b id="left">${fmtd(B.money)}</b> left</div>
      <div class="choices two">${B.items.map(([n, e, pr], k) => `<button class="choice" data-k="${k}"><span class="otext">${e} ${esc(n)}<br><span class="note">${fmtd(pr)}</span></span></button>`).join('')}</div></div>
      <button id="bdone" class="alt" style="width:100%">I can't buy any more</button><div id="bfb"></div>`;
    $$('.budget .choice', host).forEach(btn => (btn.onclick = () => {
      const [n, , pr] = B.items[+btn.dataset.k]; if (got.has(btn.dataset.k)) return;
      if (spent + pr > B.money) { btn.classList.add('wrong'); btn.animate?.([{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }], 250); $('#bfb', host).innerHTML = `<div class="fb no"><b>Not enough money for the ${esc(n.toLowerCase())}.</b></div>`; return; }
      spent += pr; got.add(btn.dataset.k); btn.classList.add('right'); $('#left', host).textContent = fmtd(B.money - spent); $('#bfb', host).innerHTML = '';
    }));
    $('#bdone', host).onclick = () => { $$('.budget .choice', host).forEach(x => (x.disabled = true)); $('#bdone', host).remove(); $('#bfb', host).innerHTML = `<div class="fb tip"><b>What happened?</b>${T(B.after)}</div>`; doneOnce(); };
  }
  if (B.type === 'pickone') {
    host.innerHTML = `<p class="scen-q"><b>${esc(B.q)}</b></p><div class="choices two pickone">${[B.a, B.b].map(([n, e], k) => `<button class="choice" data-k="${k}"><span class="otext"><span style="font-size:2rem">${e}</span><br>${esc(n)}</span></button>`).join('')}</div><div id="bfb"></div>`;
    $$('.pickone .choice', host).forEach(btn => (btn.onclick = () => {
      const k = +btn.dataset.k, ch = [B.a, B.b][k], lost = [B.a, B.b][1 - k];
      $$('.pickone .choice', host).forEach((x, j) => { x.disabled = true; x.classList.add(j === k ? 'right' : 'gone'); });
      $('#bfb', host).innerHTML = `<div class="fb tip"><b>${lost[1]} ➜ ❌</b>${esc(B.after.replace('{chosen}', ch[0].toLowerCase()).replace('{lost}', lost[0].toLowerCase()))}</div>`; doneOnce();
    }));
  }
  if (B.type === 'cards') {
    let open = 0;
    host.innerHTML = `<p class="scen-q"><b>${esc(B.q)}</b></p><div class="flipcards">${B.cards.map(([f, back], k) => `<button class="flip" data-k="${k}"><span class="f">${esc(f)}</span><span class="bk" hidden>${esc(back)}</span></button>`).join('')}</div>`;
    $$('.flip', host).forEach(btn => (btn.onclick = () => { if (btn.classList.contains('open')) return; btn.classList.add('open'); $('.bk', btn).hidden = false; if (++open === B.cards.length) doneOnce(); }));
  }
  if (B.type === 'tapone') {
    host.innerHTML = `<p class="scen-q"><b>${esc(B.q)}</b></p><div class="choices">${B.items.map(([n, e], k) => `<button class="choice" data-k="${k}"><span class="otext">${e} ${esc(n)}</span></button>`).join('')}</div><div id="bfb"></div>`;
    $$('.choice', host).forEach(btn => (btn.onclick = () => { const ok = +btn.dataset.k === B.answer; $$('.choice', host).forEach((x, j) => { x.disabled = true; if (j === B.answer) x.classList.add('right'); }); if (!ok) btn.classList.add('wrong');
      $('#bfb', host).innerHTML = `<div class="fb ${ok ? 'ok' : 'tip'}"><b>${ok ? 'Yes!' : 'Look again.'}</b>${esc(ok ? B.right : B.wrong)}</div>`; doneOnce(); }));
  }
  if (B.type === 'graph') {
    let k = 0;
    host.innerHTML = `<p class="scen-q"><b>${esc(B.q)}</b></p><div class="play-grid"><div class="dgwrap" id="bpg"></div><div><p id="bask" class="event"></p><div class="choices two" id="bpts"></div><div id="bfb"></div></div></div>`;
    const pg = createPPC($('#bpg', host), { show: B.show });
    const ask = () => {
      if (k >= B.asks.length) { $('#bask', host).textContent = 'All done!'; $('#bpts', host).innerHTML = ''; return doneOnce(); }
      $('#bask', host).innerHTML = `Which point shows: <b>${esc(B.asks[k][1])}</b>?`;
      $('#bpts', host).innerHTML = B.show.map(n => `<button class="choice" data-n="${n}"><b>Point ${n}</b></button>`).join('');
      $$('#bpts .choice', host).forEach(btn => (btn.onclick = () => { const ok = btn.dataset.n === B.asks[k][0]; pg.points(B.show, B.asks[k][0]);
        $('#bfb', host).innerHTML = `<div class="fb ${ok ? 'ok' : 'tip'}"><b>${ok ? 'Right!' : `It is point ${B.asks[k][0]}.`}</b></div>`; k++; setTimeout(ask, 900); }));
    };
    ask();
  }
  if (B.type === 'ppcslider') {
    const ph = x => Math.round(10 * Math.sqrt(Math.max(0, 1 - (x / 10) ** 2)) * 10) / 10;
    host.innerHTML = `<p class="scen-q"><b>${esc(B.q)}</b></p><div class="play-grid"><div class="dgwrap" id="bpg"></div><div>
      <label for="rice">Rice (million tonnes): <b id="rv">0</b></label><input type="range" id="rice" min="0" max="10" step="${B.steps ? 2 : 1}" value="0" style="width:100%">
      <div class="stats"><div class="stat"><b id="pv">10</b><span>million phones</span></div><div class="stat"><b id="lost">0</b><span>phones given up${B.steps ? ' this step' : ' so far'}</span></div></div>
      ${B.steps ? '<table class="lb" id="steps"><tr><th>Rice</th><th>Phones given up</th></tr></table>' : ''}<div id="bfb"></div></div></div>`;
    const pg = createPPC($('#bpg', host), {}); pg.dot(0, 10); let prev = 0;
    $('#rice', host).oninput = e => {
      const x = +e.target.value, y = ph(x); pg.dot(x, y); $('#rv', host).textContent = x; $('#pv', host).textContent = y;
      if (B.steps && x > prev) { const lost = Math.round((ph(prev) - y) * 10) / 10; $('#lost', host).textContent = lost; $('#steps', host).insertAdjacentHTML('beforeend', `<tr><td>${prev} → ${x}</td><td><b>${lost}</b></td></tr>`); }
      else if (!B.steps) $('#lost', host).textContent = Math.round((10 - y) * 10) / 10;
      prev = x;
      if (x >= (B.steps ? 10 : 6) && !finished) { $('#bfb', host).innerHTML = `<div class="fb tip"><b>What happened?</b>${T(B.after)}</div>`; doneOnce(); }
    };
  }
  if (B.type === 'shift') {
    const seen = new Set();
    host.innerHTML = `<p class="scen-q"><b>${esc(B.q)}</b></p><div class="play-grid"><div class="dgwrap" id="bpg"></div><div><div class="choices">${PPC_SHIFTS.map((x, k) => `<button class="choice" data-k="${k}"><b>${esc(x[0])}</b></button>`).join('')}
      <button class="choice" data-k="m"><b>Move workers from farms to factories</b></button></div><p id="beff"></p></div></div>`;
    const pg = createPPC($('#bpg', host), { show: ['B', 'C'] });
    $$('.choice', host).forEach(btn => (btn.onclick = () => { $$('.choice', host).forEach(x => x.classList.remove('sel')); btn.classList.add('sel'); seen.add(btn.dataset.k);
      if (btn.dataset.k === 'm') { pg.shift(null, false); pg.points(['B', 'C']); pg.arrow('B', 'C'); $('#beff', host).innerHTML = 'Same resources, used differently: a <b>movement along</b> the PPC (from B to C). No shift.'; }
      else { const sh = PPC_SHIFTS[+btn.dataset.k]; pg.arrow(null); pg.shift(sh[1]); $('#beff', host).innerHTML = rich(sh[2], Math.min(band(), 2)); }
      if (seen.size >= 3) doneOnce(); }));
  }
  if (B.type === 'curve') {
    host.innerHTML = `<p class="scen-q"><b>${esc(B.q)}</b></p><div class="play-grid"><div><div class="dgwrap" id="bcv"></div><p class="center" id="beff" aria-live="polite"></p></div><div>
      <label for="cpr">Price of a cup: <b id="cprv"></b>,000 đồng</label><input type="range" class="slider" id="cpr" min="20" max="60" step="10" value="40">
      <div class="readout"><div class="${B.curve === 'D' ? 'd' : 's'}"><b id="cq"></b>quantity ${CV_WORD[B.curve][0]} (cups a day)</div></div><p class="note">Try at least three prices.</p><div id="bfb"></div></div></div>`;
    curveCard(B, $('#bcv', host), $('#beff', host), n => { if (n >= 3 && !finished) { $('#bfb', host).innerHTML = `<div class="fb tip"><b>What happened?</b>${T(B.after)}</div>`; doneOnce(); } });
  }
  if (B.type === 'curveshift') {
    const evs = SHIFT_EVENTS2[B.curve], seen = new Set();
    host.innerHTML = `<p class="scen-q"><b>${esc(B.q)}</b></p><div class="play-grid"><div><div class="dgwrap" id="bcv"></div></div><div><div class="choices">${evs.map((x, k) => `<button class="choice" data-ev="${k}"><b>${esc(x[0])}</b></button>`).join('')}</div><p id="beff" aria-live="polite"></p></div></div>`;
    const cv = createCurve($('#bcv', host), { curve: B.curve });
    $$('[data-ev]', host).forEach(btn => (btn.onclick = () => { $$('[data-ev]', host).forEach(x => x.classList.remove('sel')); btn.classList.add('sel');
      const ev = evs[+btn.dataset.ev]; cv.shift(ev[1]); $('#beff', host).innerHTML = rich(ev[2], Math.min(band(), 2)); seen.add(btn.dataset.ev); if (seen.size >= 4) doneOnce(); }));
  }
  if (B.type === 'market') {
    host.innerHTML = `<p class="scen-q"><b>${esc(B.q)}</b></p><div class="play-grid"><div><div class="dgwrap" id="bdg"></div></div><div>
      <label for="bpr">Price: <b id="bprv"></b> ${esc(M.priceUnit)}</label><input type="range" class="slider" id="bpr" min="0" max="${M.prices.length - 1}" step="1" value="0">
      <div class="readout"><div class="d"><b id="bqd"></b>quantity demanded</div><div class="s"><b id="bqs"></b>quantity supplied</div></div>
      ${B.work ? '<button class="alt" id="bwork" style="width:100%">Let the market work ▶</button>' : ''}<p id="beff" aria-live="polite"></p><div id="bfb"></div></div></div>`;
    const dg = createDiagram($('#bdg', host)), sl = $('#bpr', host), seen = new Set();
    const fin = () => { if (!finished) { $('#bfb', host).innerHTML = `<div class="fb tip"><b>What happened?</b>${T(B.after)}</div>`; doneOnce(); } };
    const upd = () => { const P = M.prices[+sl.value]; dg.priceLine(mY(P), 'P'); $('#bprv', host).textContent = P; $('#bqd', host).textContent = fmt(M.qd(P)); $('#bqs', host).textContent = fmt(M.qs(P));
      $('#beff', host).innerHTML = explorerText(P); seen.add(Math.sign(P - M.pe)); if (!B.work && seen.has(1) && seen.has(-1)) fin(); };
    sl.oninput = upd; upd();
    $('#bwork', host)?.addEventListener('click', () => { const target = M.prices.indexOf(M.pe); if (+sl.value === target) { sl.value = 0; upd(); }
      const tm = setInterval(() => { const v = +sl.value; if (v === target) { clearInterval(tm); $('#beff', host).innerHTML += ' <b>The market has reached equilibrium.</b>'; return fin(); } sl.value = v + Math.sign(target - v); upd(); }, 500); });
  }
  if (B.type === 'chain') {
    let e = 0;
    host.innerHTML = `<p class="scen-q"><b>${esc(B.q)}</b></p><div class="play-grid"><div><div class="dgwrap" id="bdg"></div></div><div id="bchain"></div></div>`;
    const dg = createDiagram($('#bdg', host));
    const ask = () => {
      if (e >= B.events.length) return doneOnce();
      const [ev, cv, dir, P, Q] = B.events[e]; dg.set({}, false);
      const steps = [['1. Which curve shifts?', [['Demand', 'D'], ['Supply', 'S']], cv], ['2. Which way?', [['Right: more', 1], ['Left: less', -1]], dir],
        ['3. Price and quantity?', [['P ↑ Q ↑', 'up,up'], ['P ↑ Q ↓', 'up,down'], ['P ↓ Q ↑', 'down,up'], ['P ↓ Q ↓', 'down,down']], `${P},${Q}`]];
      let k = 0;
      const step = () => {
        if (k >= 3) { $('#bchain', host).insertAdjacentHTML('beforeend', `<button id="bnext" style="width:100%;margin-top:8px">${e + 1 < B.events.length ? 'Next event →' : 'Done'}</button>`); $('#bnext', host).onclick = () => { e++; ask(); }; return; }
        const [q, opts, ans] = steps[k];
        $('#bchain', host).insertAdjacentHTML('beforeend', `<p class="note" style="margin:8px 0 4px"><b>${q}</b></p><div class="choices two" data-s="${k}">${opts.map(([t, v]) => `<button class="choice" data-v="${v}"><b>${t}</b></button>`).join('')}</div>`);
        $$(`[data-s="${k}"] .choice`, host).forEach(btn => (btn.onclick = () => {
          if (btn.dataset.v !== String(ans)) { btn.classList.add('wrong'); btn.disabled = true; return; }
          $$(`[data-s="${k}"] .choice`, host).forEach(x => (x.disabled = true)); btn.classList.add('right');
          if (k === 1) dg.set({ [cv]: dir });
          k++; step();
        }));
      };
      $('#bchain', host).innerHTML = `<p class="event">Event ${e + 1} of ${B.events.length}: ${esc(ev)}</p>`; step();
    };
    ask();
  }
}
// One block: builder, the idea, then checks (quiz) or a guided walkthrough. Calls back with { right, n, answers }.
function buildBlock(box, bl, { guided = false, retry = false, depth = 0, fromExam = false, title = '' }, cb) {
  const L = EBANK[bl], b = band(), Bk = EM.EBLOCKS[bl], answers = [];
  const pool = E.shuffle(L.checks.map((c, k) => ({ ...c, k }))), checks = pool.slice(0, retry ? 2 : 3);
  box.innerHTML = `<div class="bu-head"><span class="bu-floor">${depth ? '⬇️ One floor down' : '🏗️ Build it up'} · ${esc(EM.LAYERS[Bk.layer] || '')}</span><h2>${esc(Bk.name)}</h2>${title ? `<p class="note">${title}</p>` : ''}</div>
    ${retry ? '' : '<div id="bbld" class="bu-builder"></div>'}
    <div id="bsay" ${retry ? '' : 'hidden'}><div class="bu-say"><b>💡 The idea</b><p>${b <= 1 ? rich(L.plain, b) : autoPill(L.say, b)}</p>${b === 0 && viOn() ? `<p class="vi">${esc(L.vi)}</p>` : ''}</div>
    <div id="bq"></div></div>`;
  const startChecks = () => {
    $('#bsay', box).hidden = false; let i = 0;
    const one = () => {
      if (i >= checks.length) return cb({ right: answers.filter(a => a.first_try).length, n: checks.length, answers });
      const c = checks[i], plainOne = b <= 1 || (i === 0 && !guided), opts = E.shuffle(c.options.map((o, j) => ({ ...o, right: j === 0 })));
      const q = `<p class="scen-q"><b>${guided ? 'Guided' : 'Check'} ${i + 1} of ${checks.length}</b>${i === 0 && b >= 2 && !guided ? ' <span class="chip mint">in simple English</span>' : ''}<br>${plainOne ? rich(c.plain, Math.min(b, 1)) : autoPill(c.q, b)}</p>`;
      $('#bq', box).innerHTML = `${q}<div class="choices">${opts.map((o, j) => `<button class="choice" data-j="${j}"><span class="otext">${plainOne ? rich(o.p, Math.min(b, 1)) : esc(o.t)}</span></button>`).join('')}</div><div id="bfb2"></div>`;
      let tries = 0;
      $$('#bq .choice', box).forEach(btn => (btn.onclick = () => {
        const o = opts[+btn.dataset.j]; tries++;
        if (guided && !o.right) { btn.classList.add('wrong'); btn.disabled = true; $('#bfb2', box).innerHTML = `<div class="fb tip"><b>Look again.</b>${esc(c.why)}</div>`; return; }
        const rec = { id: `b:${bl}:${c.k}`, eng: 1, block: bl, first_try: !guided && o.right && tries === 1, ...(guided ? { guided: true } : {}), ...(i === 0 && plainOne && fromExam && b >= 2 && !guided ? { plain: true } : {}) };
        if (!o.right) rec.pick = o.t;
        answers.push(rec);
        $$('#bq .choice', box).forEach((x, j) => { x.disabled = true; if (opts[j].right) x.classList.add('right'); }); if (!o.right) btn.classList.add('wrong');
        $('#bfb2', box).innerHTML = `<div class="fb ${o.right ? 'ok' : 'no'}"><b>${o.right ? (guided ? 'Yes, that\'s it.' : 'Right! ⭐') : 'Not this one.'}</b>${esc(c.why)}</div><button id="bnx" style="width:100%">${i + 1 < checks.length ? 'Next' : 'Finish'}</button>`;
        $('#bnx', box).onclick = () => { i++; one(); }; $('#bnx', box).scrollIntoView({ block: 'nearest' });
      }));
    };
    one();
  };
  if (retry) return startChecks();
  buildBuilder($('#bbld', box), bl, () => {
    if ($('#bgo', box)) return;
    $('#bbld', box).insertAdjacentHTML('beforeend', `<button id="bgo" style="width:100%;margin-top:10px">${guided ? 'Show me step by step →' : 'Now try some questions →'}</button>`);
    $('#bgo', box).onclick = () => { $('#bgo', box).remove(); startChecks(); $('#bsay', box).scrollIntoView({ block: 'start', behavior: 'smooth' }); };
  });
}
/** The whole Build it up detour for block bl. opts: { fromExam, onDone(result) }. Saves one 'build' attempt. */
function buildUp(bl, { fromExam = false, onDone = () => {} } = {}) {
  let ov = $('#bu'); if (!ov) { ov = document.createElement('div'); ov.id = 'bu'; ov.className = 'bu-overlay'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); document.body.append(ov); }
  ov.innerHTML = '<div class="narrow"><div class="tcard" id="bubox"></div></div>'; ov.hidden = false; document.body.classList.add('bu-open'); ov.scrollTop = 0;
  const box = $('#bubox', ov), t0 = Date.now(), all = [], built = [], half = [];
  let langNote = '';
  const pass = r => r.right >= Math.ceil(r.n * 2 / 3);
  const end = () => {
    const st = est(), unit = UNITS.some(u => u.id === EM.EBLOCKS[bl].unit) ? EM.EBLOCKS[bl].unit : U;
    const a = { unit, activity: 'build', level_start: 0, level_end: 0, score: all.filter(x => x.first_try).length, max_score: all.length, seconds: Math.round((Date.now() - t0) / 1000),
      answers: [...all, ...built.map(id => ({ id: `b:${id}:built`, eng: 1, block: id, built: true }))] };
    const xp = E.xpForNew(history, a);
    box.innerHTML = `<div class="center"><span class="tag gold">Build it up done</span>
      <div class="bu-result">${built.map(id => `<div class="bu-brick built">🏢 <b>${esc(EM.EBLOCKS[id].name)}</b><br><span class="note">building finished</span></div>`).join('')}
        ${half.map(id => `<div class="bu-brick half">🏗️ <b>${esc(EM.EBLOCKS[id].name)}</b><br><span class="note">half built: it comes back tomorrow</span></div>`).join('')}</div>
      ${langNote}${xpLine(xp)}<p class="note" id="busaved">Saving…</p>
      <button id="buback" style="width:100%">Back to my question →</button><p><a href="#/city" id="bucity">See my city 🏙️</a></p></div>`;
    $('#buback', box).onclick = () => close(true); $('#bucity', box).onclick = e => { e.preventDefault(); close(false); go('#/city'); };
    saveAttempt(a).then(ok => { const el = $('#busaved', box); if (el) el.textContent = ok ? '✔ Saved' : 'Saved on this device.'; });
    if (location.hash.startsWith('#/city')) cityView(bl);   // the skyline behind the overlay shows the new building straight away
    if (built.length) Cel.big({ icon: '🏢', title: `New building: ${EM.EBLOCKS[built[0]].name}`, sub: 'Your city is growing', xp }); else Cel.set(xp);
  };
  const close = resume => { ov.hidden = true; ov.innerHTML = ''; document.body.classList.remove('bu-open'); if (resume) onDone({ built, half }); };
  const st0 = est();
  // 1. the block itself
  buildBlock(box, bl, { fromExam, title: 'Let\'s build the idea you need for this question.' }, r1 => {
    all.push(...r1.answers);
    if (fromExam && r1.answers[0] && r1.answers[0].plain && r1.answers[0].first_try) {
      r1.answers[0].lang = true;
      langNote = `<div class="fb tip"><b>You know the idea 👍</b>The exam English was the hard part. Learn these words: ${(EBANK[bl].plain.match(/\[\[([^|\]]+)/g) || []).map(x => `<span class="chip mint">${esc(x.slice(2))}</span>`).join(' ')}</div>`;
    }
    if (pass(r1)) { built.push(bl); return end(); }
    const under = EM.underneath(st0, bl);
    const guidedTop = () => buildBlock(box, bl, { guided: true, retry: true, title: 'Step by step: you can\'t get this wrong. Tap the right answer.' }, rg => { all.push(...rg.answers); half.push(bl); end(); });
    if (!under || !BUILD_OK(under)) return guidedTop();
    // 2. one floor down, then back up
    box.scrollIntoView?.({ block: 'start' }); ov.scrollTop = 0;
    buildBlock(box, under, { depth: 1, title: `This idea sits under "${esc(EM.EBLOCKS[bl].name)}". Build it first.` }, r2 => {
      all.push(...r2.answers); ov.scrollTop = 0;
      if (pass(r2)) {
        built.push(under);
        return buildBlock(box, bl, { retry: true, title: 'Now back up a floor. Try again.' }, r3 => { all.push(...r3.answers); ov.scrollTop = 0; if (pass(r3)) { built.push(bl); end(); } else guidedTop(); });
      }
      buildBlock(box, under, { guided: true, retry: true, depth: 1, title: 'Step by step: you can\'t get this wrong.' }, rg => { all.push(...rg.answers); half.push(under); ov.scrollTop = 0; guidedTop(); });
    });
  });
}
// ---------- My city: one building per block. Built = lit windows; half built = scaffolding; ready = crane; locked = outline ----------
const CITY_HUE = ['#F4A261', '#2A9D8F', '#E76F51', '#457B9D', '#9B5DE5', '#E9C46A', '#06D6A0'];
function skylineSVG(st, ids, { small = false } = {}) {
  const w = 40, gap = 8, W = ids.length * (w + gap) + gap, H = 230, G = 200;
  const bld = (id, k) => {
    const Bk = EM.EBLOCKS[id], x = gap + k * (w + gap), h = 46 + Bk.layer * 28, y = G - h, s = BUILD_OK(id) ? EM.stateOf(st, id) : 'soon', hue = CITY_HUE[Bk.layer % CITY_HUE.length];
    const win = Array.from({ length: Math.floor((h - 14) / 16) }, (_, r) => [0, 1].map(c => `<rect x="${x + 8 + c * 15}" y="${y + 10 + r * 16}" width="9" height="9" rx="1.5" class="${s === 'built' ? 'lit' : 'dark'}"/>`).join('')).join('');
    const body = s === 'built' ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${hue}"/>${win}<path d="M${x + w / 2} ${y} v-12" stroke="#16324F" stroke-width="2"/><path d="M${x + w / 2} ${y - 12} h10 l-3 4 l3 4 h-10z" fill="#E63946"/>`
      : s === 'guided' ? `<rect x="${x}" y="${y + h / 2}" width="${w}" height="${h / 2}" rx="3" fill="${hue}"/><rect x="${x}" y="${y}" width="${w}" height="${h / 2}" fill="none" stroke="${hue}" stroke-width="2" stroke-dasharray="4 3"/><path d="M${x} ${y} l${w} ${h / 2} M${x + w} ${y} l${-w} ${h / 2}" stroke="${hue}" stroke-width="1.5" opacity=".7"/>`
      : s === 'ready' ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#fff" fill-opacity=".55" stroke="${hue}" stroke-width="2.5" stroke-dasharray="6 4"/><path d="M${x + 6} ${G} V${y - 26} H${x + w + 10} M${x + 6} ${y - 18} L${x + 18} ${y - 26} M${x + w + 6} ${y - 26} v12" stroke="#E9C46A" stroke-width="3" fill="none"/>`
      : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="none" stroke="currentColor" stroke-width="1.5" opacity="${s === 'soon' ? 0.18 : 0.35}"/>`;
    return `<g class="bld ${s}" data-b="${id}" tabindex="${small || s === 'soon' ? -1 : 0}" role="button" aria-label="${esc(Bk.name)}: ${s}"><title>${esc(Bk.name)}</title>${body}<rect x="${x - 2}" y="${y - 30}" width="${w + 4}" height="${h + 30}" fill="transparent"/></g>`;
  };
  return `${small ? '' : '<div class="skyscroll">'}<svg class="skyline${small ? ' small' : ''}" viewBox="0 0 ${W} ${H}" ${small ? '' : `style="min-width:${Math.round(W * 0.9)}px"`} preserveAspectRatio="xMidYMax meet" role="img" aria-label="Your concept city">
    <defs><linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB88C"/><stop offset="1" stop-color="#FFE7C7"/></linearGradient></defs>
    <rect width="${W}" height="${G}" fill="url(#skyg)"/><circle cx="${W - 40}" cy="40" r="18" fill="#FFF3B0"/>
    <rect y="${G}" width="${W}" height="${H - G}" fill="#3E9BD6"/><path d="M0 ${G + 12} q15 -4 30 0 t30 0" stroke="#9CD6F5" stroke-width="2" fill="none" transform="scale(${W / 60} 1)"/>
    ${ids.map(bld).join('')}</svg>${small ? '' : '</div>'}`;
}
const S1_BLOCKS = () => Object.values(EM.EBLOCKS).filter(b => b.unit[0] === '1').sort((a, b) => a.layer - b.layer).map(b => b.id);
const S2_BLOCKS = () => Object.values(EM.EBLOCKS).filter(b => b.unit[0] === '2').sort((a, b) => a.layer - b.layer).map(b => b.id);
// Buildings that count on the home card: Section 1, plus the Section 2 blocks that have a lesson once a 2.x unit is open
const CITY_IDS = () => S1_BLOCKS().concat((me.open_units || []).some(u => u[0] === '2') ? S2_BLOCKS().filter(BUILD_OK) : []);
function cityView(only) {
  const st = est(), s1 = S1_BLOCKS(), s2 = S2_BLOCKS(), ids = CITY_IDS(), on2 = ids.length > s1.length;
  const n = ids.filter(id => EM.isMastered(st, id)).length, halfN = ids.filter(id => EM.stateOf(st, id) === 'guided').length;
  const n2 = s2.filter(id => EM.isMastered(st, id)).length;
  const rep = EM.repairs(st, Date.now(), BUILD_OK), next = rep[0] || ids.find(id => EM.stateOf(st, id) === 'ready' || EM.stateOf(st, id) === 'guided') || ids.find(id => !EM.isMastered(st, id));
  view(`<div class="narrow"><div class="hero"><p class="eyebrow">My concept city</p><h1>${n} of ${ids.length} buildings</h1>
      <p class="lede">Every idea you master becomes a building in your Ho Chi Minh City skyline. Build from the ground up: everyday ideas first, then the ideas that stand on them.</p>
      ${next ? `<div class="row"><a class="btn" href="#/city/${next}">${rep[0] ? 'Repair' : 'Build next'}: ${esc(EM.EBLOCKS[next].name)} →</a></div>` : ''}</div>
    <div class="tcard"><h2 style="margin:0 0 6px">District 1: The basic economic problem</h2>${skylineSVG(st, s1)}
      <p class="note">🏢 built ${n} · 🏗️ half built ${halfN} · dashed with a crane = ready to build · faint = build the ones underneath first. Tap a building${innerWidth < 700 ? '; swipe to see the whole street' : ''}.</p><div id="binfo" class="binfo"></div></div>
    <div class="tcard"><h2 style="margin:0 0 6px">District 2: Markets ${on2 ? `<span class="chip">${n2} built</span>` : '<span class="chip">opens with Section 2</span>'}</h2>${skylineSVG(st, s2, { small: !on2 })}
      <div class="binfo" aria-live="polite"></div><p class="note">${on2 ? 'Markets, demand, supply, equilibrium and price changes (2.1 to 2.5).' : 'Demand, supply and prices: these buildings open when your teacher opens a unit in Section 2.'}</p></div></div>`);
  const info = id => {
    const Bk = EM.EBLOCKS[id], s = EM.stateOf(st, id), p = Math.round(100 * EM.pOf(st, id)), box = $(`.bld[data-b="${id}"]`)?.closest('.tcard').querySelector('.binfo') || $('#binfo');
    if (!BUILD_OK(id)) return (box.innerHTML = `<div class="fb tip"><b>${esc(Bk.name)}</b>Coming with unit ${Bk.unit}.</div>`);
    box.innerHTML = `<div class="fb tip"><b>${esc(Bk.name)}</b>${{ built: 'Built ✔', guided: 'Half built: finish it today', ready: 'Ready to build', locked: 'Build the ideas underneath first' }[s]} · strength ${p}%
      ${Bk.pre.length ? `<br><span class="note">Stands on: ${Bk.pre.map(q => esc(EM.EBLOCKS[q].name)).join(', ')}</span>` : '<br><span class="note">An everyday idea: the ground floor.</span>'}
      <div class="row" style="margin-top:8px"><a class="btn${s === 'built' ? ' alt' : ''}" href="#/city/${id}">${s === 'built' ? 'Practise again' : 'Build it'} →</a></div></div>`;
  };
  $$('.skyline:not(.small) .bld').forEach(g => { g.onclick = () => info(g.dataset.b); g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); info(g.dataset.b); } }; });
  if (only && EM.EBLOCKS[only]) info(only);
}

// ---------- router ----------
const ACT = { learn, shift: () => shift(), eqm: () => eqm(), mcq: () => mcq(), data, check: checkpoint, p2, ppc: () => ppcRun() };
function route() {
  if (!me) return login();
  if (me.must_change) return changePin(true);
  const [a, u, act, sub] = location.hash.replace(/^#\/?/, '').split('/');
  if (a === 'units') return unitsView();
  if (a === 'baseline') return baselineRun();
  if (a === 'city') {
    if (u && EM.EBLOCKS[u] && BUILD_OK(u)) { cityView(u); nav('me'); return buildUp(u, { onDone: () => cityView(u) }); }
    nav('me'); return cityView();
  }
  if (a === 'review') return u === 'go' ? reviewRun() : reviewView();
  if (a === 'games') return gamesView();
  if (a === 'me') return meView(u || 'stats');
  const unit = UNITS.find(x => x.id === u);
  if (a === 'u' && unit && unit.paper && PAPERS[u] && (me.open_units || []).includes(u)) {
    U = null; wide(false); nav(act ? null : 'units');
    return act ? paperRun(paperCtx(), u, act) : paperHome(paperCtx(), u);
  }
  if (a === 'u' && unit && unit.ready && CONTENT[u] && (me.open_units || []).includes(u)) {
    U = u;
    if (act === 'tab') return unitPage(sub);
    if (act === 'scen') { nav(null); return scenRun(sub); }
    if (act && ACT[act] && (act === 'check' || ACTIVITIES[U].some(x => x.id === act))) { nav(null); return ACT[act](); }
    return unitPage();
  }
  if (a === 'u') return unitsView();
  home();
}
// What the exam papers (papers.js) need from the app
const paperCtx = () => ({ me, history: () => history, save: saveAttempt, aiMark, band, xpFor: a => E.xpForNew(history, a), reward: xp => Cel.set(xp),
  sound: ok => S.play(ok ? 'ok' : 'bad'), isOpen: u => openUnits().includes(u) });
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

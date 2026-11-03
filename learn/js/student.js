// Student app: sign in, unit map (2.1 to 2.6), and the activities of every built unit (2.4 Price determination, 2.5 Price changes).
import { rpc, token, DEMO, errText } from './api.js';
import { $, $$, esc, view, toast, pct, pref, busy } from './ui.js';
import { UNITS, ACTIVITIES } from './units.js';
import * as E from './engine.js';
import { CONTENT, TRAPS } from './content.js';
import { SHIFTS } from './u25.js';
import { genEq, nextEqKind, LEARN_MARKET } from './u24.js';
import { createDiagram } from './diagram.js';

let me = null, history = [], U = '2.5';
const C = () => CONTENT[U];
const uName = (u = U) => `${u} ${(UNITS.find(x => x.id === u) || {}).title || ''}`;
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

// ---------- saving (queued, so a Wi-Fi drop never loses a run) ----------
const QK = DEMO ? 'ecl:demo:pending' : 'ecl:pending';
const readQ = () => { try { return JSON.parse(localStorage.getItem(QK)) || []; } catch { return []; } };
const writeQ = q => { try { localStorage.setItem(QK, JSON.stringify(q)); } catch { } };
async function saveAttempt(a) {
  history.push({ ...a, created_at: new Date().toISOString() });
  writeQ([...readQ(), a]);
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

// ---------- header ----------
function header() {
  $('#who').textContent = me ? me.display_name + (DEMO ? ' · demo' : '') : (DEMO ? 'Demo mode' : '');
  const out = $('#out'); out.hidden = !me;
  out.onclick = async () => { try { await rpc('ec_logout', { p_token: token.get() }); } catch { } token.set(null); me = null; history = []; header(); go('#/'); };
}

// ---------- sign in ----------
function login(msg = '') {
  view(`<div class="card" style="max-width:420px;margin:20px auto">
    <h1>Sign in</h1><p class="muted">Use the username and PIN on your login slip.</p>
    <form id="f" autocomplete="on">
      <label for="u">Username</label><input id="u" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="e.g. eco9-07" required>
      <label for="p">PIN</label><input id="p" name="password" type="password" inputmode="numeric" autocomplete="current-password" required>
      <div class="err" id="err" role="alert">${esc(msg)}</div>
      <button style="width:100%">Sign in</button>
    </form>
    ${DEMO ? '<p class="small muted">Demo mode: try <b>demo-01</b> with PIN <b>1234</b>. Nothing is sent to the school database.</p>' : ''}
    <p class="small muted center">Teacher? <a href="teacher.html${location.search}">Teacher console</a></p></div>`);
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
  view(`<div class="card" style="max-width:420px;margin:20px auto">
    <h1>${forced ? 'Choose your own PIN' : 'Change my PIN'}</h1>
    <form id="f"><label for="o">Old PIN</label><input id="o" type="password" inputmode="numeric" autocomplete="current-password" required>
    <label for="n">New PIN (4 to 6 numbers)</label><input id="n" type="password" inputmode="numeric" autocomplete="new-password" pattern="[0-9]{4,6}" required>
    <label for="n2">New PIN again</label><input id="n2" type="password" inputmode="numeric" autocomplete="new-password" required>
    <div class="err" id="err" role="alert"></div>
    <div class="row"><button class="grow">Save PIN</button>${forced ? '' : '<button type="button" class="ghost" id="back">Back</button>'}</div></form></div>`);
  if (!forced) $('#back').onclick = () => go('#/');
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

// ---------- home: the unit map ----------
function home() {
  const open = new Set(me.open_units || []);
  view(`<h1>Hi ${esc(me.display_name)} 👋</h1><p class="muted">Unit 2: The allocation of resources</p>
    <div class="units">${UNITS.map(u => {
      const can = open.has(u.id) && u.ready && CONTENT[u.id];
      const acts = ACTIVITIES[u.id] || [], s = E.summarise(history, u.id), done = acts.filter(a => s[a.id]).length;
      const tag = can ? `<span class="badge">${done}/${acts.length} done</span>` : `<span class="badge">${open.has(u.id) ? 'Coming soon' : '🔒 Locked'}</span>`;
      return `<button class="unit ${can ? 'open' : 'locked'}" ${can ? `data-u="${u.id}"` : 'disabled aria-disabled="true"'}>
        <span class="num">${u.id}</span><span class="grow"><span class="t">${esc(u.title)}</span><br><span class="s">${esc(u.sub)}</span></span>${tag}</button>`;
    }).join('')}</div>
    <div class="card" id="xp" style="margin-top:18px"><h3>⭐ XP</h3><p class="muted small">Loading…</p></div>
    <div class="card"><h3>Settings</h3>
      <div class="row"><span class="grow">Vietnamese help words <span class="vi">(từ vựng tiếng Việt)</span></span><button class="ghost small" id="vi">${vi() ? 'On' : 'Off'}</button></div>
      <div class="row" style="margin-top:8px"><span class="grow">My PIN</span><button class="ghost small" id="pin">Change PIN</button></div>
      <p class="small muted" style="margin-top:10px">Signed in as ${esc(me.username)}</p></div>`);
  $$('.unit[data-u]').forEach(b => (b.onclick = () => go('#/u/' + b.dataset.u)));
  $('#vi').onclick = () => { pref.set('vi', !vi()); home(); };
  $('#pin').onclick = () => changePin(false);
  board();
}
async function board() {
  let b;
  try { b = await rpc('ec_board', { p_token: token.get() }); }
  catch { const x = E.xpTotals(history); b = { on: false, rows: [{ name: me.display_name, xp: x.total, week: x.week, me: true }], offline: true }; }
  const el = $('#xp'); if (!el) return;
  const mine = b.rows.find(r => r.me) || { xp: 0, week: 0 }, rank = b.rows.findIndex(r => r.me) + 1;
  const row = (r, k) => `<tr class="${r.me ? 'me' : ''}"><td>${k < 3 && r.week > 0 ? ['🥇', '🥈', '🥉'][k] : k + 1}</td><td>${esc(r.name)}${r.me ? ' (you)' : ''}</td><td class="num">${r.week}</td></tr>`;
  const shown = b.rows.filter(r => r.week > 0 || r.me), top = shown.slice(0, 10), myPos = shown.findIndex(r => r.me) + 1;
  el.innerHTML = `<h3>⭐ XP</h3><div class="row"><span class="stat"><b>${mine.week}</b>this week</span><span class="stat"><b>${mine.xp}</b>total</span>${b.on && rank ? `<span class="stat"><b>#${rank}</b>in class this week</span>` : ''}</div>
    ${b.on ? `<h3 style="margin-top:12px">Class leaderboard · this week</h3><table class="t board">${top.map(row).join('')}
      ${myPos > 10 ? `<tr><td colspan="3" class="muted center">…</td></tr>${row(shown[myPos - 1], myPos - 1)}` : ''}</table>` : ''}
    <p class="small muted" style="margin-top:8px">Earn XP: 10 for each answer right first time, 2 for each question you finish, 20 for the Learn cards. The leaderboard starts again every Monday.${b.offline ? ' (Offline: showing XP saved on this device.)' : ''}</p>`;
}

// ---------- unit page ----------
function unitPage() {
  const s = E.summarise(history, U), top = E.topTrap(E.trapCounts(history, U));
  view(`<p><a href="#/">← All units</a></p><h1>${esc(uName())}</h1>
    <p class="muted">Work through them in order. Each activity adapts: get two right first time and it gets harder.</p>
    <div class="acts">${ACTIVITIES[U].map(a => {
      const x = s[a.id];
      return `<button class="act" data-a="${a.id}"><div class="t">${a.icon} ${esc(a.title)}</div><div class="s">${esc(a.sub)}</div>
        ${x ? `<div class="small" style="margin-top:6px">Best ${pct(x.bestScore, x.max)}% · ${x.runs} ${x.runs === 1 ? 'try' : 'tries'}${LEVELED.has(a.id) ? ' · ' + levelBadge(x.level) : ''}</div><div class="meter"><i style="width:${pct(x.bestScore, x.max)}%"></i></div>`
          : '<div class="small muted" style="margin-top:6px">Not started</div>'}</button>`;
    }).join('')}</div>
    ${top ? `<div class="card" style="margin-top:14px"><h3>Your most common mistake so far</h3>${trapBox(top[0])}</div>` : ''}
    <details class="card" style="margin-top:14px"><summary><b>Key words</b> <span class="vi">(từ vựng)</span></summary>
      <table class="t" style="margin-top:8px">${Object.entries(C().VI || {}).map(([en, v]) => `<tr><td><b>${esc(en)}</b></td><td>${esc(v)}</td></tr>`).join('')}</table></details>`);
  $$('.act').forEach(b => (b.onclick = () => go('#/u/' + U + '/' + b.dataset.a)));
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
      ${c.market ? '<button class="ghost" id="work" style="width:100%">Let the market work ▶</button>' : ''}`;
    if (c.kind === 'schedule') body += `<div class="scroll"><table class="sched"><tr><th>Price (${esc(M.priceUnit)})</th><th>${w('Quantity demanded', 'quantity demanded')} (kg)</th><th>${w('Quantity supplied', 'quantity supplied')} (kg)</th></tr>
      ${M.prices.map(P => `<tr data-p="${P}"><td>${P}</td><td>${fmt(M.qd(P))}</td><td>${fmt(M.qs(P))}</td></tr>`).join('')}</table></div>
      <button class="ghost" id="showeq" style="width:100%">Show me the equilibrium</button><p id="eff" aria-live="polite"></p>`;
    const hasDg = ['four', 'move', 'two', 'explorer'].includes(c.kind);
    let under = '';   // the explorer's slider and readout sit directly under the diagram, so students see both while dragging
    if (c.kind === 'explorer') { const k = body.indexOf('<label for="pr">'); under = body.slice(k); body = body.slice(0, k); }
    view(`${backLink()}
      <div class="steps">${L.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="card"><h2>${i + 1}. ${esc(c.title)}</h2>${hasDg ? `<div class="play-grid"><div><div class="dgwrap" id="dg"></div>${under}<p class="center" id="eff" aria-live="polite"></p></div><div>${body}</div></div>` : body}</div>
      <div class="sticky-foot"><button class="ghost" id="prev" ${i ? '' : 'disabled'}>Back</button><button id="next">${i === L.length - 1 ? 'Finish' : 'Next'}</button></div>`);
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
      view(`<div class="card center"><h1>Cards done ✔</h1>${xp ? xpLine(xp) : ''}<p>Now test yourself.</p><div class="row" style="justify-content:center"><button id="n">${esc(nextAct.title)} →</button><button class="ghost" id="b">Back to ${U}</button></div></div>`);
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
    <div class="row"><button class="grow" id="again">Try again</button><button class="ghost grow" id="back">Back to ${U}</button></div>`);
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
  let dg = null; if (it.y != null) { dg = createDiagram($('#dg')); dg.priceLine(it.y, 'P'); }
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
    <button class="ghost small" id="hint">Show a hint</button><div id="fb" aria-live="polite"></div></div></div></div>`);
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
    qs.insertAdjacentHTML('beforeend', `<div class="card center"><h2>Total: ${score} / ${maxScore}</h2>${xpLine(E.xpForNew(history, da))}<p class="small" id="saved">Saving…</p><div class="row" style="justify-content:center"><button id="again">Try again</button><button class="ghost" id="back">Back to ${U}</button></div></div>`);
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
    if (q.type === 'short') input = `<textarea id="${id}i" aria-label="Your answer" style="min-height:${q.marks > 1 ? 150 : 70}px"></textarea>${q.marks > 1 ? `<button class="ghost small" id="${id}f" type="button">Show the sentence frame</button>` : ''}`;
    if (q.type === 'diagram') input = `<div class="dgwrap" id="${id}dg"></div>${['D', 'S'].map(c => `<p style="margin:10px 0 4px"><b>${CURVE_LABEL[c]()}</b></p>
      <div class="seg" data-curve="${c}"><button data-v="-1">← Left</button><button data-v="0">No shift</button><button data-v="1">Right →</button></div>`).join('')}`;
    if (q.type === 'priceline') input = `<div class="dgwrap" id="${id}dg"></div><p style="margin:10px 0 4px"><b>Price line (thousand VND)</b></p>
      <div class="seg" data-k="p">${q.prices.map(p => `<button data-v="${p}">${p}</button>`).join('')}</div>
      <p style="margin:10px 0 4px"><b>The gap between the curves shows</b></p>
      <div class="seg" data-k="t"><button data-v="shortage">A shortage</button><button data-v="surplus">A surplus</button><button data-v="eq">No gap</button></div>`;
    card.innerHTML = `<div class="row"><h3 class="grow">(${q.id}) ${esc(q.q)}</h3><span class="badge">${q.marks} mark${q.marks > 1 ? 's' : ''}</span></div>${input}
      <div class="row" style="margin-top:10px"><button id="${id}c">Check</button><button class="ghost small" id="${id}h" type="button">Hint</button></div><div id="${id}fb" aria-live="polite"></div>`;
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
        else { pick[sg.dataset.k] = b.dataset.v; if (sg.dataset.k === 'p') dg.priceLine(pyOf(+b.dataset.v), b.dataset.v); }
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

// ---------- router ----------
const ACT = { learn, shift: () => shift(), eqm: () => eqm(), mcq: () => mcq(), data };
function route() {
  if (!me) return login();
  if (me.must_change) return changePin(true);
  const [a, u, act] = location.hash.replace(/^#\/?/, '').split('/');
  const unit = UNITS.find(x => x.id === u);
  if (a === 'u' && unit && unit.ready && CONTENT[u] && (me.open_units || []).includes(u)) {
    U = u;
    return act && ACT[act] && ACTIVITIES[U].some(x => x.id === act) ? ACT[act]() : unitPage();
  }
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

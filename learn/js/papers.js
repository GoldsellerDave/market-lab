// Section exam papers: Paper 1 (20 multiple-choice, answers revealed with a reason for every option) and Paper 2 (two sets of 2, 4 and
// 6-mark questions: first BUILD the answer by dragging tiles into a chain, then WRITE it; the written answer is marked by AI, or by
// key words if AI is not available). A timer runs (it never cuts a student off), and the score is saved at the end.
// Content: px1.js (Section 1) and px2.js (Section 2). Unit ids '1.P' and '2.P'; activities p1a, p1b, p2a, p2b.
// The student app (student.js) passes in `ctx`: its helpers and the signed-in student.
import { PAPERS1 } from './px1.js?v=b37cc519';
import { PAPERS2 } from './px2.js?v=b37cc519';
import { $, $$, esc, view, toast } from './ui.js?v=b37cc519';
import * as E from './engine.js?v=b37cc519';
import { createPPC } from './ppc.js?v=b37cc519';
import { UNITS } from './units.js?v=b37cc519';

export const PAPERS = { '1.P': PAPERS1, '2.P': PAPERS2 };
export const PAPER_KEYS = ['p1a', 'p1b', 'p2a', 'p2b'];
export const P1_MIN = 30, P2_MIN = 40;   // suggested time: about 1.5 minutes a mark
export const paperName = key => `Paper ${key[1]} · Form ${key[2].toUpperCase()}`;
export const p2Max = sets => sets.reduce((t, s) => t + s.qs.reduce((n, q) => n + q.marks + q.chain.length, 0), 0);
const LINKS = /\b(because|so|since|as|this means|which means|therefore|thus|hence|consequently|as a result|due to|leads? to|led to|results? in|then|if|when|causing|causes|so that|meaning)\b/i;
const LETTER = ['A', 'B', 'C', 'D'], PART = ['a', 'b', 'c'];
const CMD = { define: 'Define', identify: 'Identify', calculate: 'Calculate', explain: 'Explain', analyse: 'Analyse' };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const mmss = s => `${Math.floor(Math.abs(s) / 60)}:${String(Math.floor(Math.abs(s)) % 60).padStart(2, '0')}`;
const tableHTML = t => (t ? `<div class="tablewrap"><table class="sched"><tr>${t.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${t.rows.map(r => `<tr>${r.map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</table></div>` : '');
const tableText = t => (t ? ` Table: ${t.head.join(' | ')}. ${t.rows.map(r => r.join(' | ')).join('. ')}.` : '');

// ---------- saved progress (a reload or a closed tab does not lose the paper) ----------
const skey = (ctx, unit, key) => `ecl:paper:${ctx.me.id || ctx.me.username}:${unit}:${key}`;
const load = (ctx, unit, key) => { try { const s = JSON.parse(localStorage.getItem(skey(ctx, unit, key))); return s && Date.now() - s.t0 < 3 * 3600e3 ? s : null; } catch { return null; } };
const store = (ctx, unit, key, s) => { try { localStorage.setItem(skey(ctx, unit, key), JSON.stringify(s)); } catch { } };
const clear = (ctx, unit, key) => { try { localStorage.removeItem(skey(ctx, unit, key)); } catch { } };

// ---------- timer ----------
let tick = null;
function startTimer(t0, minutes) {
  clearInterval(tick);
  const draw = () => {
    const el = $('#ptimer'); if (!el) return clearInterval(tick);
    const left = minutes * 60 - (Date.now() - t0) / 1000;
    el.textContent = left >= 0 ? `⏱ ${mmss(left)}` : `⏱ +${mmss(left)} over`;
    el.className = 'ptimer' + (left < 0 ? ' over' : left < 300 ? ' low' : '');
  };
  draw(); tick = setInterval(draw, 1000);
}
const head = (P, key, right) => `<p class="noprint"><a href="#/u/${P.unit}">← ${esc(P.title)}</a></p>
  <div class="phead"><div><p class="eyebrow">${esc(P.title)}</p><h1>${paperName(key)}</h1></div><span id="ptimer" class="ptimer" aria-label="Time left"></span></div>${right || ''}`;

// ---------- the papers page of a section ----------
export function paperHome(ctx, unit) {
  const P = PAPERS[unit], hist = ctx.history().filter(a => a.unit === unit);
  const card = key => {
    const mine = hist.filter(a => a.activity === key).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)), first = mine[0], best = mine.reduce((b, a) => (!b || a.score / a.max_score > b.score / b.max_score ? a : b), null);
    const going = load(ctx, unit, key), p1 = key[1] === '1';
    return `<a class="tcard pcard" href="#/u/${unit}/${key}"><h3>${paperName(key)}</h3>
      <p class="note">${p1 ? `20 multiple-choice questions · about ${P1_MIN} minutes` : `2 sets of 2, 4 and 6-mark questions: build each answer, then write it · about ${P2_MIN} minutes`}</p>
      ${best ? `<p><span class="chip ok">Best ${best.score}/${best.max_score}</span> <span class="chip">First try ${first.score}/${first.max_score}</span></p>` : going ? '<p><span class="chip gold">In progress: tap to continue</span></p>' : '<p><span class="chip">Not started</span></p>'}</a>`;
  };
  view(`<div class="narrow"><p><a href="#/units">← Units</a></p><div class="hero"><p class="eyebrow">Exam papers</p><h1>${esc(P.title)}</h1>
    <p class="lede">Test yourself on units ${P.covers[0]} to ${P.covers[P.covers.length - 1]}. The papers are in exam English, with a timer. There are two forms of each paper: do Form A first, revise, then try Form B.</p></div>
    <h2>Paper 1: multiple choice</h2><div class="pgrid">${card('p1a')}${card('p1b')}</div>
    <h2>Paper 2: structured questions</h2><div class="pgrid">${card('p2a')}${card('p2b')}</div>
    <p class="note">You see the answer and the reason after every question. Your first try at each form is the score your teacher looks at.</p></div>`);
}

export function paperRun(ctx, unit, key) {
  if (!PAPERS[unit] || !PAPER_KEYS.includes(key)) return paperHome(ctx, unit);
  return key[1] === '1' ? paper1(ctx, unit, key) : paper2(ctx, unit, key);
}

// ---------- Paper 1 ----------
function paper1(ctx, unit, key) {
  const P = PAPERS[unit], QS = P.p1[key[2]];
  let st = load(ctx, unit, key);
  if (!st || !st.order || st.order.length !== QS.length) st = { t0: Date.now(), order: shuffle(QS.map((_, i) => i)), perm: QS.map(() => shuffle([0, 1, 2, 3])), ans: [] };
  const save = () => store(ctx, unit, key, st);
  save();
  const show = () => {
    const i = st.ans.length;
    if (i >= QS.length) return done();
    const q = QS[st.order[i]], perm = st.perm[st.order[i]];
    view(`<div class="narrow paper">${head(P, key)}
      <div class="bar" aria-hidden="true"><i style="width:${Math.round(100 * i / QS.length)}%"></i></div>
      <div class="card"><p class="note" id="pcount">Question ${i + 1} of ${QS.length}</p>
        ${q.ppc ? '<div class="dgwrap" id="pppc"></div>' : ''}${tableHTML(q.table)}
        <p class="pstem"><b>${esc(q.stem)}</b></p>
        <div class="choices">${perm.map((o, k) => `<div class="popt"><button class="choice" data-o="${o}"><b>${LETTER[k]}</b><span class="otext">${esc(q.options[o].t)}</span></button><div class="pwhy" hidden></div></div>`).join('')}</div>
        <div id="pnext"></div></div></div>`);
    startTimer(st.t0, P1_MIN);
    if (q.ppc) createPPC($('#pppc'), { show: q.ppc });
    $$('.choice').forEach(b => (b.onclick = () => {
      const pick = +b.dataset.o, ok = pick === 0;
      $$('.choice').forEach(x => {
        const o = +x.dataset.o; x.disabled = true;
        if (o === 0) x.classList.add('right'); else if (o === pick) x.classList.add('wrong');
        const w = x.parentNode.querySelector('.pwhy'); w.hidden = false; w.className = 'pwhy ' + (o === 0 ? 'ok' : 'no') + (o === pick ? ' mine' : '');
        w.innerHTML = `<b>${o === 0 ? '✓ Right' : '✗ Wrong'}${o === pick ? ': your answer' : ''}.</b> ${esc(q.options[o].why)}`;
      });
      ctx.sound(ok);
      st.ans.push({ id: q.id, pick, ok }); save();
      $('#pnext').innerHTML = `<p class="pverdict ${ok ? 'ok' : 'no'}">${ok ? 'Correct ⭐' : 'Not this time. Read the reasons, then go on.'}</p><button id="nx" style="width:100%">${st.ans.length < QS.length ? 'Next question' : 'See my score'}</button>`;
      $('#nx').onclick = show; $('#nx').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }));
  };
  const done = async () => {
    clearInterval(tick);
    const seconds = Math.round((Date.now() - st.t0) / 1000), byId = Object.fromEntries(QS.map(q => [q.id, q]));
    const score = st.ans.filter(a => a.ok).length;
    const attempt = { unit, activity: key, level_start: 0, level_end: 0, score, max_score: QS.length, seconds,
      answers: st.ans.map(a => ({ id: a.id, first_try: a.ok, ok: a.ok, pick: byId[a.id].options[a.pick].t, trap: a.ok ? undefined : byId[a.id].options[a.pick].trap })) };
    const xp = ctx.xpFor(attempt); clear(ctx, unit, key);
    await ctx.save(attempt);
    const units = P.covers.map(u => { const a = st.ans.filter(x => byId[x.id].unit === u); return { u, n: a.length, ok: a.filter(x => x.ok).length }; });
    const wrong = st.ans.filter(a => !a.ok);
    view(`<div class="narrow paper">${head(P, key)}
      ${scoreHTML(score, QS.length, seconds, P1_MIN, xp)}
      <div class="card"><h2>By unit</h2>${units.map(x => unitBar(ctx, x)).join('')}</div>
      ${wrong.length ? `<div class="card"><h2>Questions to look at again</h2>${wrong.map(a => { const q = byId[a.id]; return `<div class="pmiss"><p><b>${esc(q.stem)}</b> <span class="note">(${q.unit})</span></p>
        <p class="pwhy no mine"><b>✗ You chose:</b> ${esc(q.options[a.pick].t)}. ${esc(q.options[a.pick].why)}</p><p class="pwhy ok"><b>✓ Answer:</b> ${esc(q.options[0].t)}. ${esc(q.options[0].why)}</p></div>`; }).join('')}</div>` : '<div class="card"><p><b>Every question right. Excellent!</b></p></div>'}
      ${endButtons(unit, key)}</div>`);
    ctx.reward(xp);
  };
  show();
}
const scoreHTML = (score, max, seconds, minutes, xp, extra = '') => `<div class="card pscore"><p class="eyebrow">Your score</p>
  <p class="pbig"><b id="pscore">${score}</b> / ${max} <span class="ppct">${Math.round(100 * score / max)}%</span></p>${extra}
  <p class="note">Time: ${mmss(seconds)} (suggested ${minutes}:00)${seconds > minutes * 60 ? ' · over the suggested time: work on your speed next' : ''}${xp ? ` · +${xp} XP ⭐` : ''}</p></div>`;
const unitBar = (ctx, x) => `<div class="punit"><span><b>${x.u}</b> ${esc((UNITS.find(u => u.id === x.u) || {}).title || '')}</span><span>${x.ok}/${x.n}</span>
  <div class="bar" aria-hidden="true"><i style="width:${x.n ? Math.round(100 * x.ok / x.n) : 0}%"></i></div>${x.ok < x.n && ctx.isOpen(x.u) ? `<a class="note" href="#/u/${x.u}">Revise ${x.u} →</a>` : ''}</div>`;
const endButtons = (unit, key) => { const other = key.slice(0, 2) + (key[2] === 'a' ? 'b' : 'a');
  return `<div class="row"><a class="btn" href="#/u/${unit}">Back to the papers</a><a class="btn ghost" href="#/u/${unit}/${other}">Try ${paperName(other)}</a></div>`; };

// ---------- Paper 2 ----------
function paper2(ctx, unit, key) {
  const P = PAPERS[unit], SETS = P.p2[key[2]], FLAT = SETS.flatMap((s, si) => s.qs.map((q, qi) => ({ q, si, qi })));
  let st = load(ctx, unit, key);
  if (!st || !st.res) st = { t0: Date.now(), pos: 0, phase: 'build', res: {} };
  const save = () => store(ctx, unit, key, st);
  save();
  const caseHTML = (s, si) => `<div class="card pcase"><p class="eyebrow">Set ${si + 1} of ${SETS.length}</p><p>${esc(s.case)}</p>${tableHTML(s.table)}</div>`;
  const qHead = it => `<p class="pstem"><b>(${PART[it.qi]}) ${esc(it.q.q)}</b> <span class="chip">${it.q.marks} marks</span></p>`;
  const show = () => {
    if (st.pos >= FLAT.length) return done();
    const it = FLAT[st.pos];
    view(`<div class="narrow paper">${head(P, key)}
      <div class="bar" aria-hidden="true"><i style="width:${Math.round(100 * (st.pos * 2 + (st.phase === 'write' ? 1 : 0)) / (FLAT.length * 2))}%"></i></div>
      ${caseHTML(SETS[it.si], it.si)}<div class="card" id="pq"></div></div>`);
    startTimer(st.t0, P2_MIN);
    (st.phase === 'write' ? write : build)(it);
  };

  // Step 1: build the chain
  const build = it => {
    const q = it.q, n = q.chain.length, tiles = q.chain.map((t, i) => ({ t, i })).concat(q.traps.map((x, k) => ({ t: x.t, i: n + k, why: x.why })));
    const r = (st.res[q.id] ||= {}); r.bank ||= shuffle(tiles.map(x => x.i)); r.slots ||= Array(n).fill(null); save();
    const T = i => tiles.find(x => x.i === i);
    const box = $('#pq');
    const draw = () => {
      const used = new Set(r.slots.filter(x => x != null));
      box.innerHTML = `${qHead(it)}
        <p class="pstep"><b>Step 1: build your answer.</b> Drag the tiles into the boxes${q.free ? '' : ' in the right order'}, or tap a tile and it goes into the next empty box. ${q.traps.length} tiles do not belong.</p>
        <ol class="pslots${q.free ? ' free' : ''}">${r.slots.map((v, k) => `<li class="pslot${v == null ? ' empty' : ''}" data-slot="${k}">${v == null ? '<span class="note">Drop a tile here</span>' : tileHTML(T(v))}</li>`).join('')}</ol>
        <div class="pbank" data-bank="1">${r.bank.filter(i => !used.has(i)).map(i => tileHTML(T(i))).join('') || '<span class="note">All tiles are placed. Tap a tile in a box to take it out.</span>'}</div>
        <button id="pcheck" style="width:100%" ${r.slots.some(x => x == null) ? 'disabled' : ''}>Check my chain</button>`;
      bind();
    };
    const tileHTML = x => `<div class="ptile" data-t="${x.i}" role="button" tabindex="0"><span class="pgrip" aria-hidden="true">⠿</span><span>${esc(x.t)}</span></div>`;
    const place = (i, slot) => {      // slot: a number, or null = back to the bank
      const from = r.slots.indexOf(i);
      if (slot == null) { if (from >= 0) r.slots[from] = null; }
      else { const there = r.slots[slot]; if (from >= 0) r.slots[from] = there; r.slots[slot] = i; }
      save(); draw();
    };
    const bind = () => {
      $$('.ptile', box).forEach(el => {
        const i = +el.dataset.t; let drag = null;
        const tap = () => { const at = r.slots.indexOf(i); if (at >= 0) return place(i, null); const free = r.slots.indexOf(null); if (free < 0) return toast('All the boxes are full. Tap a tile in a box to take it out.'); place(i, free); };
        el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(); } };
        el.onpointerdown = e => {
          if (e.button) return;
          const touch = e.pointerType === 'touch', onGrip = !!e.target.closest('.pgrip');
          drag = { x: e.clientX, y: e.clientY, on: false, can: !touch || onGrip, ghost: null };
          if (drag.can) { try { el.setPointerCapture(e.pointerId); } catch { } }
        };
        el.onpointermove = e => {
          if (!drag || !drag.can) return;
          if (!drag.on && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8) return;
          if (!drag.on) { drag.on = true; const b = el.getBoundingClientRect(); drag.dx = e.clientX - b.left; drag.dy = e.clientY - b.top;
            drag.ghost = el.cloneNode(true); drag.ghost.classList.add('ghost'); drag.ghost.style.width = b.width + 'px'; document.body.append(drag.ghost); el.classList.add('lifting'); }
          drag.ghost.style.transform = `translate(${e.clientX - drag.dx}px, ${e.clientY - drag.dy}px)`;
          $$('.pslot', box).forEach(s => s.classList.remove('over'));
          const over = document.elementFromPoint(e.clientX, e.clientY)?.closest('.pslot'); if (over) over.classList.add('over');
        };
        const end = e => {
          if (!drag) return; const d = drag; drag = null;
          if (!d.on) return e.type === 'pointerup' ? tap() : null;
          d.ghost.remove(); el.classList.remove('lifting');
          const under = e.type === 'pointerup' ? document.elementFromPoint(e.clientX, e.clientY) : null;
          const slot = under?.closest('.pslot'), bank = under?.closest('.pbank');
          if (slot) place(i, +slot.dataset.slot); else if (bank) place(i, null); else draw();
        };
        el.onpointerup = end; el.onpointercancel = end;
      });
      $('#pcheck', box).onclick = check;
    };
    const check = () => {
      const good = r.slots.map((v, k) => (q.free ? v < n : v === k));
      r.build = good.filter(Boolean).length; st.phase = 'write'; save();
      ctx.sound(r.build === n);
      box.innerHTML = `${qHead(it)}<p class="pstep"><b>Step 1: your chain.</b> <span class="chip ${r.build === n ? 'ok' : 'gold'}" id="pbuilt">${r.build} / ${n}</span></p>
        <ol class="pslots checked">${r.slots.map((v, k) => { const x = T(v); return `<li class="pslot ${good[k] ? 'good' : 'bad'}"><span>${good[k] ? '✓' : '✗'} ${esc(x.t)}</span>${good[k] ? '' : `<span class="pwhy no">${esc(x.why || 'This link is right, but it is in the wrong place in the chain.')}</span>`}</li>`; }).join('')}</ol>
        ${r.build === n ? '<p class="pverdict ok">A complete chain ⭐</p>' : `<div class="fb tip"><b>The full answer:</b><ol class="worked">${q.chain.map(t => `<li>${esc(t)}</li>`).join('')}</ol></div>`}
        <button id="pgo" style="width:100%">Step 2: now write it yourself →</button>`;
      $('#pgo').onclick = () => write(it);
      $('#pgo').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
    if (r.build != null) { st.phase = 'write'; return write(it); }
    draw();
  };

  // Step 2: write it (marked by AI; by key words if AI is not available)
  const write = it => {
    const q = it.q, r = (st.res[q.id] ||= {}), box = $('#pq');
    const marked = () => {
      const w = r.write, labels = q.groups.map(g => g.label);
      box.innerHTML = `${qHead(it)}<p class="pstep"><b>Step 2: your written answer.</b> <span class="chip ${w.score >= q.marks ? 'ok' : 'gold'}" id="pwrote">${w.score} / ${q.marks}</span>
          <span class="note">${w.by === 'ai' ? '🤖 marked by AI' : w.by === 'skip' ? 'not answered' : 'marked by key words (AI was not available)'}</span></p>
        ${w.text ? `<blockquote class="pans">${esc(w.text)}</blockquote>` : ''}
        ${w.feedback ? `<p class="ainote">🤖 ${esc(w.feedback)}</p>` : ''}${w.next ? `<p class="ainote"><b>Next step:</b> ${esc(w.next)}</p>` : ''}
        ${w.listOnly ? '<p class="note">For “Analyse”, link your points with words like because, so, therefore: a list of points gets 2 marks at most.</p>' : ''}
        <p><b>Mark scheme points</b>${q.need < labels.length ? ` (any ${q.need})` : ''}</p><ul class="ppoints">${labels.map(l => `<li class="${w.hits.includes(l) ? 'good' : 'bad'}">${w.hits.includes(l) ? '✓' : '✗'} ${esc(l)}</li>`).join('')}${(w.other || []).map(o => `<li class="good other">✓ Another valid point: ${esc(o)}</li>`).join('')}</ul>
        <div class="fb tip"><b>Model answer</b><p>${esc(q.model)}</p></div>
        <button id="pnx" style="width:100%">${st.pos + 1 < FLAT.length ? 'Next question' : 'See my score'}</button>`;
      $('#pnx').onclick = () => { st.pos++; st.phase = 'build'; save(); show(); };
    };
    if (r.write) return marked();
    box.innerHTML = `${qHead(it)}<p class="pstep"><b>Step 2: now write your answer in full sentences.</b> The tiles are hidden: use your own words.${q.cmd === 'analyse' ? ' Link your points (because, so, therefore…).' : ''}</p>
      <textarea id="ptext" rows="${q.marks >= 6 ? 9 : q.marks >= 4 ? 6 : 3}" placeholder="Type your answer here" aria-label="Your answer"></textarea>
      <div class="row"><button id="pmark" style="flex:1">Check my answer</button><button id="pskip" class="ghost">Skip (0 marks)</button></div>`;
    const ta = $('#ptext'); ta.value = r.draft || ''; ta.oninput = () => { r.draft = ta.value; save(); };
    $('#pskip').onclick = () => { r.write = { score: 0, hits: [], by: 'skip', text: '' }; save(); marked(); };
    $('#pmark').onclick = async e => {
      const text = ta.value.trim();
      if (text.split(/\s+/).filter(Boolean).length < 3) return toast('Write a full sentence first.');
      const btn = e.target; btn.disabled = true; btn.textContent = 'Checking your answer… 🤖';
      r.write = await markPaper(ctx, unit, SETS[it.si], q, text); r.write.text = text; delete r.draft; save();
      ctx.sound(r.write.score >= q.marks); marked();
    };
  };

  const done = async () => {
    clearInterval(tick);
    const seconds = Math.round((Date.now() - st.t0) / 1000);
    const rows = FLAT.map(it => ({ ...it, b: (st.res[it.q.id] || {}).build || 0, w: ((st.res[it.q.id] || {}).write || {}).score || 0 }));
    const written = rows.reduce((t, x) => t + x.w, 0), built = rows.reduce((t, x) => t + x.b, 0), wMax = rows.reduce((t, x) => t + x.q.marks, 0), bMax = rows.reduce((t, x) => t + x.q.chain.length, 0);
    const attempt = { unit, activity: key, level_start: 0, level_end: 0, score: written + built, max_score: wMax + bMax, seconds,
      answers: rows.map(x => ({ id: x.q.id, first_try: x.w >= x.q.marks, ok: x.w >= x.q.marks, score: x.w, marks: x.q.marks, build: x.b, of: x.q.chain.length, text: String(((st.res[x.q.id] || {}).write || {}).text || '').slice(0, 1500) })) };
    const xp = ctx.xpFor(attempt); clear(ctx, unit, key);
    await ctx.save(attempt);
    view(`<div class="narrow paper">${head(P, key)}
      ${scoreHTML(written + built, wMax + bMax, seconds, P2_MIN, xp, `<p class="psplit"><span class="chip ok" id="pwritten">Written answers ${written} / ${wMax}</span> <span class="chip" id="pchains">Chains built ${built} / ${bMax}</span></p>`)}
      <div class="card"><h2>By question</h2><div class="tablewrap"><table class="sched"><tr><th>Question</th><th>Unit</th><th>Chain</th><th>Written</th></tr>
        ${rows.map(x => `<tr><td style="text-align:left">Set ${x.si + 1} (${PART[x.qi]}) ${CMD[x.q.cmd]} · ${x.q.marks} marks</td><td>${x.q.unit}</td><td>${x.b}/${x.q.chain.length}</td><td>${x.w}/${x.q.marks}</td></tr>`).join('')}</table></div>
        <p class="note">The written mark is the exam mark. If your chains are strong but your written marks are low, practise writing the links in full sentences.</p></div>
      ${endButtons(unit, key)}</div>`);
    ctx.reward(xp);
  };
  show();
}

/** Mark one written answer: key words first, then AI (which decides when it answers). Returns { score, hits, other, by, feedback, next, listOnly }.
 *  other = valid points the AI found that are not on the mark scheme; they count like listed points (Cambridge marks any valid point). */
export async function markPaper(ctx, unit, set, q, text) {
  const kw = E.markShort(text, q.groups, q.need), cmd = q.cmd === 'analyse' ? 'analyse' : 'explain';
  const ai = await ctx.aiMark({ unit, item: q.id, question: q.q, context: set.case + tableText(set.table), model: q.model, command: q.cmd || cmd, points: q.groups.map(g => g.label), need: q.need,
    answer: text, band: ctx.band(), name: String(ctx.me.display_name || '').split(/\s+/)[0], keyword_ok: kw.ok, keyword_hits: kw.hits, detail: true });
  if (ai) { const hits = q.groups.map(g => g.label).filter(l => ai.hits.includes(l)), other = (ai.other || []).map(String).slice(0, q.need);
    return { score: Math.min(hits.length + other.length, q.need), hits, other, by: 'ai', feedback: ai.feedback || '', next: ai.next || '' }; }
  if (cmd === 'analyse' && kw.score > 2 && !LINKS.test(text)) return { score: 2, hits: kw.hits.slice(0, 2), by: 'keywords', listOnly: true };
  return { score: kw.score, hits: kw.hits, by: 'keywords' };
}

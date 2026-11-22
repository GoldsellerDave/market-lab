// 2.6 Price elasticity of demand: content, marking, scenarios, the engine and the PED lab. node --test learn/tests/u26.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as U26 from '../js/u26.js';
import { CONTENT, GLOSSARY as GALL, TRAPS as TALL, ITEMS } from '../js/content.js';
import { markShort, norm, markNumber } from '../js/engine.js';
import { plainChain, gapsOf } from '../js/bands.js';
import { SCENARIOS, SCEN_BY_UNIT, CAST, SCEN_CAST } from '../js/u1s.js';
import { SCENE_KEYS } from '../js/scenes.js';
import * as EM from '../js/eengine.js';
import { EREADY } from '../js/ebank.js';
import { UNITS, ACTIVITIES } from '../js/units.js';
import { mission, checkN, BADGE } from '../js/mission.js';
import * as U1 from '../js/u1.js';
import * as U2 from '../js/u2.js';
import { PED_SHAPES, pedCurveSVG, REV_GOODS, revenueSVG, revM } from '../js/peddia.js';

const pills = s => [...String(s).matchAll(/\[\[([^|\]]+)(?:\|[^\]]*)?\]\]/g)].map(m => m[1]);
const strip = s => String(s || '').replace(/\[\[([^|\]]+)(?:\|([^\]]*))?\]\]/g, (m, k, sh) => sh || k);

test('2.6 is open: built, wired into content, activities, mission and badge', () => {
  const u = UNITS.find(x => x.id === '2.6');
  assert.ok(u && u.ready);
  assert.ok(CONTENT['2.6'] && CONTENT['2.6'].BANDED && CONTENT['2.6'].TERMS.length >= 10);
  assert.deepEqual(ACTIVITIES['2.6'].map(a => a.id), ['learn', 'scen', 'ped', 'mcq', 'p2']);
  assert.equal(checkN('2.6'), 12);
  const m = mission('2.6', []);
  assert.deepEqual(m.steps.map(s => s.key), ['learn', 'scen', 'practice', 'stretch', 'mcq', 'p2', 'check']);
  assert.equal(m.steps.find(s => s.key === 'practice').act, 'ped');
  assert.equal(BADGE['2.6'], 'Elasticity expert');
  Object.keys(U26.TRAPS).forEach(t => assert.ok(TALL[t], t));
});

test('2.6 MCQ: 12 (4 per level), right first, plain and Vietnamese, known traps and glossary words, fair lengths', () => {
  const qs = U26.MCQ; assert.equal(qs.length, 12);
  for (const l of [0, 1, 2]) assert.equal(qs.filter(q => q.level === l).length, 4, `level ${l}`);
  let longest = { t: 0, p: 0 };
  for (const q of qs) {
    assert.ok(q.stem && q.plain && q.vi && q.hint && q.explain && q.options.length === 4, q.id);
    assert.ok(!q.options[0].trap, q.id);
    q.options.slice(1).forEach(o => assert.ok(U26.TRAPS[o.trap], `${q.id}: trap ${o.trap}`));
    assert.equal(new Set(q.options.map(o => o.t)).size, 4, q.id);
    [q.plain, ...q.options.map(o => o.p)].flatMap(pills).forEach(t => assert.ok(GALL[t], `${q.id}: [[${t}]]`));
    for (const f of ['t', 'p']) {
      const L = q.options.map(o => strip(o[f]).length), r = L[0], mx = Math.max(...L.slice(1));
      assert.ok(r <= 1.35 * mx, `${q.id} (${f}): right answer much longer (${r} vs ${mx})`);
      if (r > mx) longest[f]++;
    }
    assert.ok(ITEMS[q.id] && EREADY.has(EM.blockOfOptions(q.options)), `${q.id}: listed, and its block has a lesson`);
  }
  for (const f of ['t', 'p']) assert.ok(longest[f] / qs.length <= 0.35, `the right answer is the longest too often (${f}: ${longest[f]})`);
});

test('2.6 MCQ arithmetic is right', () => {
  const q = id => U26.MCQ.find(x => x.id === id).options[0].t;
  assert.equal(q('q26-calc'), '−2');                               // −20 ÷ 10
  assert.equal(q('q26-pct'), '+25%');                              // 10 ÷ 40
  assert.match(q('q26-rev-calc'), /40 to 48 million.*elastic/);    // 100k × 400, 80k × 600; −20% price, +50% quantity
  assert.equal((+50 / -20), -2.5);
});

test('2.6 Paper 2: model answers get full marks, empty answers 0, more points than marks, one Analyse', () => {
  assert.equal(U26.P2.filter(q => q.cmd === 'analyse' && q.marks === 6).length, 1);
  for (const q of U26.P2) {
    const m = markShort(q.chain.map(plainChain).join(' '), q.groups, q.need);
    assert.ok(m.ok, `${q.id}: model answer scores ${m.score}/${q.marks}`);
    assert.ok(q.groups.length > q.marks && q.need === q.marks, `${q.id}: more valid points than marks`);
    assert.ok(q.groups.every(g => g.ask && g.k.every(k => norm(k).length >= 2)), `${q.id}: every point has a question and real keywords`);
    assert.ok(q.frame && q.plain && q.vi && gapsOf(q.chain).length >= 2, q.id);
    assert.equal(markShort('I do not know.', q.groups, q.need).score, 0, q.id);
    [q.plain].flatMap(pills).forEach(t => assert.ok(GALL[t], `${q.id}: [[${t}]]`));
  }
  // the calculation question's model numbers are right: (50 − 40) ÷ 40 = 25%, (70 − 80) ÷ 80 = −12.5%, PED −0.5
  const c = U26.P2.find(q => q.id === 'p26-calc').chain.join(' ');
  assert.ok(/\{25\}/.test(c) && /\{−12\.5\}/.test(c) && /\{−0\.5\}/.test(c) && /\{inelastic\}/.test(c));
  // an answer that says the wrong kind of demand does not earn the 'inelastic' point in the analyse question by accident
  const an = U26.P2.find(q => q.id === 'p26-analyse');
  assert.equal(markShort('Demand is elastic.', an.groups, an.need).hits.includes('demand is inelastic'), false);
});

test('2.6 learn cards: known words, and both diagram cards draw', () => {
  const all = [];
  const walk = x => (typeof x === 'string' ? all.push(x) : x && typeof x === 'object' && Object.values(x).forEach(walk));
  walk(U26.LEARN);
  all.flatMap(pills).forEach(t => assert.ok(GALL[t], `[[${t}]] is in the glossary`));
  assert.ok(U26.LEARN.some(c => c.kind === 'pedcurves') && U26.LEARN.some(c => c.kind === 'revenue'));
  for (const k of Object.keys(PED_SHAPES)) assert.match(pedCurveSVG(k), /^<svg[\s\S]*<path[\s\S]*<\/svg>$/);
  assert.deepEqual(Object.keys(PED_SHAPES), ['pi', 'in', 'un', 'el', 'pe']);
  // the revenue card: elastic revenue rises after the 20% cut (40 → 48 million), inelastic falls (40 → 35.2 million)
  assert.deepEqual([revM('el', 0), revM('el', 1), revM('in', 0), revM('in', 1)], [40, 48, 40, 35.2]);
  for (const k of ['el', 'in']) { const G = REV_GOODS[k]; assert.equal(G.q(G.P[0]), G.Q[0]); assert.equal(G.q(G.P[1]), G.Q[1]); assert.match(revenueSVG(k, 1), /million/); }
});

test('2.6 scenarios: 4, complete, traps and cast known, explain answers marked fairly', () => {
  assert.equal(SCEN_BY_UNIT['2.6'].length, 4);
  for (const s of SCEN_BY_UNIT['2.6']) {
    assert.ok(s.story && s.plain && s.vi && s.stickers.length >= 2 && SCENE_KEYS.includes(s.scene), s.id);
    (SCEN_CAST[s.id] || []).forEach(k => assert.ok(CAST[k], `${s.id}: cast ${k}`));
    const texts = [s.plain];
    for (const [k, st] of s.steps.entries()) {
      texts.push(st.plain);
      if (st.type === 'choice') { assert.ok(!st.options[0].trap && st.why, s.id); st.options.slice(1).forEach(o => assert.ok(U26.TRAPS[o.trap], `${s.id}: ${o.trap}`)); st.options.forEach(o => texts.push(o.p));
        assert.ok(EREADY.has(EM.blockOfOptions(st.options)), `${s.id}-${k + 1}: its block has a lesson`); }
      if (st.type === 'sort') { assert.ok(U26.TRAPS[st.trap], s.id); st.buckets.forEach((_, b) => assert.ok(st.items.some(i => i.b === b), `${s.id}: bucket ${b}`)); st.items.forEach(i => texts.push(i.p)); }
    }
    texts.flatMap(pills).forEach(t => assert.ok(GALL[t], `${s.id}: [[${t}]]`));
    const X = s.explain;
    assert.ok(X && X.groups.length > X.need && X.groups.every(g => g.k.every(k => norm(k).length >= 2)), s.id);
    assert.ok(markShort(X.groups.map(g => g.k[0]).join('. '), X.groups, X.need).ok, `${s.id}: a full answer`);
    assert.equal(markShort('I like it.', X.groups, X.need).score, 0, s.id);
  }
  // 'elastic' keywords must not be earned by writing 'inelastic'
  const thu = SCEN_BY_UNIT['2.6'].find(s => s.id === 's26-thu').explain;
  assert.equal(markShort('Demand is inelastic.', thu.groups, thu.need).hits.includes('demand is elastic'), false);
  // scenario numbers: 40k × 80 = 3.2 million, 50k × 40 = 2 million; −50% ÷ 25% = −2; −2% ÷ 10% = −0.2
  assert.equal(40000 * 80, 3.2e6); assert.equal(50000 * 40, 2e6);
});

test('2.6 engine: every trap points at a block, every 2.6 block has a lesson, and the map has no loops', () => {
  for (const t of Object.keys(U26.TRAPS)) assert.ok(EM.TRAP_BLOCK[t] && EM.EBLOCKS[EM.TRAP_BLOCK[t]], `trap ${t}`);
  for (const b of Object.values(EM.EBLOCKS).filter(b => b.unit === '2.6')) assert.ok(EREADY.has(b.id), `${b.id} needs a lesson`);
  for (const b of Object.values(EM.EBLOCKS)) assert.ok(b.layer < EM.LAYERS.length, `${b.id}: layer ${b.layer} has a name`);
  // (the app registers these with EM.registerItems in content.js; the tests load a separate copy of the engine, so only the map is checked here)
  for (const [k, b] of Object.entries(U26.PED_BLOCK)) assert.ok(EM.EBLOCKS[b] && EREADY.has(b) && U26.PED_KINDS[k] != null, k);
});

test('PED lab: thousands of generated questions, every answer valid and consistent', () => {
  assert.deepEqual(Object.values(U26.PED_KINDS).sort(), [0, 0, 1, 1, 2, 2]);
  for (const k of Object.keys(U26.PED_KINDS)) {
    assert.ok(ITEMS[k], `${k} is listed for the teacher`);
    for (let s = 1; s <= 1500; s++) {
      const it = U26.genPed(k, s * 2654435761);
      assert.ok(it.lines.length && it.steps.length >= 2 && it.hint && it.why, `${k} ${s}`);
      for (const st of it.steps) {
        if (st.type === 'number') { assert.ok(isFinite(st.answer), `${k} ${s}: ${st.q}`); assert.ok(markNumber(String(st.answer), st.answer, st.tol ?? 0).ok); }
        else { assert.ok(st.options.some(o => o.v === st.answer), `${k} ${s}: ${st.q}`); assert.equal(new Set(st.options.map(o => o.v)).size, st.options.length); }
        if (st.trap) assert.ok(U26.TRAPS[st.trap], st.trap);
        (st.options || []).filter(o => o.v !== st.answer).forEach(o => assert.ok(U26.TRAPS[o.trap], `${k}: wrong option without a trap`));
      }
      if (k === 'ped-raw') {   // PED = % change in quantity ÷ % change in price, from the table
        const [a, b, c, d] = it.steps, dP = (it.P1 - it.P0) / it.P0 * 100, dQ = (it.Q1 - it.Q0) / it.Q0 * 100;
        assert.ok(Math.abs(a.answer - dP) < 0.01 && Math.abs(b.answer - dQ) < 0.01 && Math.abs(c.answer - dQ / dP) < 0.01, `${k} ${s}`);
        assert.ok(c.answer < 0 && d.answer === U26.classOf(c.answer));
      }
      if (k === 'ped-rev') {   // revenue and the PED class agree: inelastic → price and revenue move the same way
        const [a, b, c, d] = it.steps;
        assert.equal(a.answer, it.P0 * it.Q0); assert.equal(b.answer, it.P1 * it.Q1);
        assert.equal(c.answer, b.answer > a.answer ? 'up' : 'down');
        assert.equal((c.answer === 'up') === (it.P1 > it.P0), d.answer === 'in', `${k} ${s}: revenue and PED agree`);
      }
      if (k === 'ped-advice') { const c = it.steps[0].answer; assert.equal(it.steps[1].answer, c === 'el' ? 'cut' : 'raise'); }
      // realistic values: petrol, rice and electricity always get inelastic demand; one brand or one cinema never does
      const necessity = ['petrol', 'rice', 'electricity'].includes(it.good), pedNow = +((it.lines.join(' ').match(/PED (?:for [^.]* )?is (−?[\d.]+)/) || [])[1] || '').replace('−', '-');
      const cls = it.steps.find(st => st.options && st.options.some(o => o.v === 'el') && st.q.startsWith('How would'))?.answer
        ?? (isFinite(pedNow) && pedNow !== 0 ? U26.classOf(pedNow) : null) ?? (k === 'ped-rev' ? it.steps[3].answer : null);
      if (cls && k !== 'ped-read') assert.equal(cls === 'in', necessity, `${k} ${s}: ${it.good} gets ${cls}`);
      if (k === 'ped-find') { const [a, b] = it.steps; const Q0 = +it.lines[1].match(/now ([\d,]+)/)[1].replace(/,/g, ''); assert.ok(Math.abs(b.answer - Q0 * (1 + a.answer / 100)) < 0.01); }
    }
  }
  assert.equal(U26.classOf(-0.5), 'in'); assert.equal(U26.classOf(-2), 'el'); assert.equal(U26.classOf(-1), 'un'); assert.equal(U26.classOf(0), 'pi');
  assert.equal(U26.fmt(-0.5), '−0.5');
});

test('no mark-scheme keyword anywhere is empty once normalised (it would match every answer)', () => {
  const groups = [];
  const walk = x => { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === 'object') { if (Array.isArray(x.groups)) groups.push(...x.groups); Object.values(x).forEach(walk); } };
  walk([U1.P2, U2.P2, U26.P2, SCENARIOS.map(s => s.explain), Object.values(CONTENT).map(C => C.DATA)]);
  assert.ok(groups.length > 150);
  const bad = groups.flatMap(g => (g.k || []).filter(k => norm(k).length < 2).map(k => `${g.label}: "${k}"`));
  assert.deepEqual(bad, []);
});

test('formula boxes: every PED calculation shows its formula and a calculation hint that does not give the answer away', () => {
  const formulas = new Set(Object.values(U26.F));
  const known = f => formulas.has(f) || [...formulas].some(x => f.startsWith(x));
  const giveaway = (hint, ans) => new RegExp(`(^|[^\\d.,])${ans.replace(/[.+]/g, m => '\\' + m)}(?![\\d.,])`).test(hint);
  const mcq = id => U26.MCQ.find(q => q.id === id);
  for (const id of ['q26-calc', 'q26-pct', 'q26-unit', 'q26-rev-calc']) {
    const q = mcq(id); assert.ok(q.calc && q.calc.f.every(known) && q.calc.h, id);
    const ans = q.options[0].t.split(':')[0].replace(/^\+/, '').replace(/%$/, '');
    assert.ok(!giveaway(q.calc.h, ans), `${id}: the hint gives away ${ans}`);
  }
  assert.ok(!mcq('q26-formula').calc, 'the question that asks for the formula does not show it');
  for (const id of ['p26-calc', 'p26-rev']) { const q = U26.P2.find(x => x.id === id); assert.ok(q.calc && q.calc.f.every(known) && q.calc.h, id); }
  assert.ok(!giveaway(U26.P2.find(x => x.id === 'p26-calc').calc.h, '−0.5'));
  const steps = SCEN_BY_UNIT['2.6'].flatMap(s => s.steps.map((st, k) => ({ s: s.id, k: k + 1, st }))).filter(x => x.st.calc);
  assert.deepEqual(steps.map(x => `${x.s}-${x.k}`), ['s26-thu-1', 's26-thu-2', 's26-thu-3', 's26-thu-5', 's26-petrol-1', 's26-petrol-4', 's26-shirts-2']);
  for (const { s, k, st } of steps) {
    assert.ok(st.calc.f.every(known) && st.calc.h, `${s}-${k}`);
    const ans = st.options[0].t.split(':')[0].replace(/^\+/, '').replace(/%$/, '');
    assert.ok(!giveaway(st.calc.h, ans), `${s}-${k}: the hint gives away ${ans}`);
  }
  for (const k of Object.keys(U26.PED_KINDS)) { const it = U26.genPed(k, 99); assert.ok(it.calc.f.length && it.calc.f.every(known) && it.calc.h === it.hint, k); }
});

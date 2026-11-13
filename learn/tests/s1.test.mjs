// Section 1 content and English bands: node --test learn/tests/s1.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as U1 from '../js/u1.js';
import { baselineBand, bandOf, plainChain, gapsOf, orderScore, marksFor, UP_AFTER, DOWN_AFTER } from '../js/bands.js';
import { markShort } from '../js/engine.js';
import { CONTENT } from '../js/content.js';
import { checkN } from '../js/mission.js';

const UNITS = ['1.1', '1.2', '1.3', '1.4'];
const pills = s => [...String(s).matchAll(/\[\[([^|\]]+)(?:\|[^\]]*)?\]\]/g)].map(m => m[1]);

test('baseline thresholds: 0-4 A1, 5-7 A2, 8-10 B1, 11-12 B2', () => {
  const want = [0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3];
  want.forEach((b, s) => assert.equal(baselineBand(s, 12), b, `score ${s}`));
  assert.equal(U1.BASELINE_N, 12); assert.equal(U1.BASELINE.length, 3);
  U1.BASELINE.forEach(t => { assert.equal(t.qs.length, 4); t.qs.forEach(q => assert.equal(new Set(q.options).size, q.options.length, q.q)); });
});

const at = (n, extra) => ({ created_at: new Date(Date.UTC(2026, 10, 1, 0, n)).toISOString(), ...extra });
const base = s => at(0, { unit: 'base', activity: 'baseline', score: s, max_score: 12, answers: [] });
const run = (n, right, total, help = 0) => at(n, { unit: '1.1', activity: 'mcq', score: right, max_score: total,
  answers: [...Array.from({ length: total }, (_, k) => ({ id: 'x' + k, ok: true, first_try: k < right })), { id: 'meta', band: 1, help }] });

test('bands move up after 3 strong runs and down after 2 weak ones; the teacher override wins', () => {
  assert.equal(bandOf([]).source, 'none');
  assert.equal(bandOf([base(6)]).band, 1);
  const strong = [1, 2, 3].map(n => run(n, 9, 9));
  assert.equal(UP_AFTER, 3); assert.equal(DOWN_AFTER, 2);
  assert.equal(bandOf([base(6), ...strong.slice(0, 2)]).band, 1);
  assert.equal(bandOf([base(6), ...strong]).band, 2);
  assert.equal(bandOf([base(6), run(1, 9, 9), run(2, 9, 9, 2), run(3, 9, 9)]).band, 1, 'heavy help breaks the run');
  assert.equal(bandOf([base(6), run(1, 2, 9), run(2, 1, 9)]).band, 0);
  assert.equal(bandOf([base(0), run(1, 0, 9), run(2, 0, 9)]).band, 0, 'never below A1');
  assert.equal(bandOf([base(12), ...strong]).band, 3, 'never above B2');
  const t = bandOf([base(2)], 3); assert.equal(t.band, 3); assert.equal(t.source, 'teacher'); assert.equal(t.baseline, 2);
});

test('Paper 2 helpers', () => {
  const c = ['A {x} b.', 'C {y}.'];
  assert.deepEqual(gapsOf(c), ['x', 'y']); assert.equal(plainChain(c[0]), 'A x b.');
  assert.equal(orderScore([0, 1, 2], 3), 1); assert.equal(orderScore([1, 0, 2], 3), 1 / 3);
  assert.equal(marksFor(1, 4), 4); assert.equal(marksFor(0.5, 4), 2); assert.equal(marksFor(0, 4), 0);
});

test('every Section 1 MCQ: right answer first, plain and Vietnamese versions, known traps and glossary words', () => {
  for (const u of UNITS) {
    const qs = U1.MCQ[u]; assert.equal(qs.length, 9, u);
    for (const l of [0, 1, 2]) assert.equal(qs.filter(q => q.level === l).length, 3, `${u} level ${l}`);
    assert.equal(checkN(u), 9);
    for (const q of qs) {
      assert.ok(q.stem && q.plain && q.vi && q.hint && q.explain, q.id);
      assert.equal(q.options.length, 4, q.id);
      assert.ok(!q.options[0].trap, q.id + ': first option is the right one');
      q.options.slice(1).forEach(o => assert.ok(U1.TRAPS[o.trap], `${q.id}: wrong option has a known trap (${o.trap})`));
      assert.ok(q.options.slice(1, 3).every(o => o.trap), q.id + ': the A1 options keep two wrong answers');
      [q.plain, ...q.options.map(o => o.p)].flatMap(pills).forEach(t => assert.ok(U1.GLOSSARY[t], `${q.id}: [[${t}]] is in the glossary`));
    }
  }
});

test('every Paper 2 question: the model answer gets full marks; gaps are in the word bank; the frame exists', () => {
  for (const u of UNITS) for (const q of U1.P2[u]) {
    const model = q.chain.map(plainChain).join(' ');
    const m = markShort(model, q.groups, q.need);
    assert.ok(m.ok, `${q.id}: model answer scores ${m.score}/${q.marks}`);
    assert.ok(q.chain.length >= 3 && gapsOf(q.chain).length >= 2, q.id);
    assert.ok(q.frame && q.plain && q.vi, q.id);
    assert.ok(markShort('I do not know.', q.groups, q.need).score === 0, `${q.id}: an empty answer scores 0`);
  }
});

test('PPC items agree with the points on the diagram', () => {
  const P = U1.PPC_POINTS, onCurve = ([x, y]) => Math.abs((x / 10) ** 2 + (y / 10) ** 2 - 1) < 0.01;
  for (const k of ['A', 'B', 'C', 'D']) assert.ok(onCurve(P[k]), k + ' is on the curve');
  assert.ok((P.E[0] / 10) ** 2 + (P.E[1] / 10) ** 2 < 1, 'E is inside'); assert.ok((P.F[0] / 10) ** 2 + (P.F[1] / 10) ** 2 > 1, 'F is outside');
  const bc = U1.PPC_ITEMS.find(i => i.id === 'ppc-bc'), cd = U1.PPC_ITEMS.find(i => i.id === 'ppc-cd');
  assert.equal(bc.steps[0].answer, P.C[0] - P.B[0]); assert.equal(bc.steps[1].answer, P.B[1] - P.C[1]);
  assert.equal(cd.steps[0].answer, P.C[1] - P.D[1]);
  for (const it of U1.PPC_ITEMS) for (const st of it.steps) if (st.type === 'choice') assert.ok(st.options.some(o => o.v === st.answer), it.id);
});

test('Section 1 units are registered with their glossary words', () => {
  for (const u of UNITS) { assert.ok(CONTENT[u].BANDED); assert.ok(CONTENT[u].TERMS.length >= 8, u); }
  assert.equal(CONTENT['1.4'].PPC.length, 8);
});

import { SCENARIOS, SCEN_BY_UNIT, CAST, SCEN_CAST } from '../js/u1s.js';
import * as U2 from '../js/u2.js';
import { GLOSSARY as GALL, TRAPS as TALL } from '../js/content.js';
import { SCENE_KEYS } from '../js/scenes.js';
test('scenarios: 5 per unit, complete, pills in the glossary, traps known, answers valid', () => {
  for (const u of UNITS) assert.equal(SCEN_BY_UNIT[u].length, 5, u);
  const S1S = SCENARIOS.filter(s => s.unit[0] === '1');
  assert.equal(new Set(S1S.map(s => s.id)).size, 20);
  for (const s of S1S) {
    assert.ok(s.story && s.plain && s.vi && s.title && s.stickers.length >= 2, s.id);
    assert.ok(SCENE_KEYS.includes(s.scene), `${s.id}: scene ${s.scene}`);
    assert.ok(!/Đà Nẵng/.test(s.story + s.plain + s.vi), `${s.id}: set in Ho Chi Minh City`);
    const texts = [s.plain];
    for (const st of s.steps) {
      texts.push(st.plain);
      if (st.type === 'choice') {
        assert.ok(st.options.length >= 3 && !st.options[0].trap && st.why, s.id);
        st.options.slice(1).forEach(o => assert.ok(U1.TRAPS[o.trap], `${s.id}: trap ${o.trap}`));
        st.options.forEach(o => texts.push(o.p));
        if (st.ppc) (st.ppc.show || []).concat(st.ppc.arrow || []).forEach(p => assert.ok(U1.PPC_POINTS[p], `${s.id}: point ${p}`));
      }
      if (st.type === 'sort') {
        assert.ok(U1.TRAPS[st.trap], `${s.id}: sort trap`);
        st.items.forEach(i => { assert.ok(i.b >= 0 && i.b < st.buckets.length && i.e, `${s.id}: ${i.t}`); texts.push(i.p); });
        st.buckets.forEach((_, b) => assert.ok(st.items.some(i => i.b === b), `${s.id}: every bucket used`));
      }
      if (st.type === 'order') assert.ok(st.lines.length >= 3, s.id);
    }
    texts.flatMap(pills).forEach(t => assert.ok(U1.GLOSSARY[t], `${s.id}: [[${t}]] is in the glossary`));
    if (s.explain) {
      const good = s.explain.groups.map(g => g.k[0]).join('. ');
      assert.ok(markShort(good, s.explain.groups, s.explain.need).ok, `${s.id}: a full answer is marked right`);
      assert.equal(markShort('I like it.', s.explain.groups, s.explain.need).score, 0, `${s.id}: an empty answer scores 0`);
    }
  }
});
test('the PPC scenarios agree with the diagram', () => {
  const P = U1.PPC_POINTS, cost = SCENARIOS.find(s => s.id === 's14-cost');
  assert.equal(cost.steps[0].options[0].t, `${P.B[1] - P.C[1]} million phones`);
  assert.equal(cost.steps[1].options[0].t, `${P.C[1] - P.D[1]} million phones`);
  assert.deepEqual(P.B, [6, 8]);
});

// The right answer must not give itself away by being the longest option.
test('answer lengths: the right option is not usually the longest', () => {
  const strip = s => String(s || '').replace(/\[\[([^|\]]+)(?:\|([^\]]*))?\]\]/g, (m, k, sh) => sh || k);
  const pools = { 'Paper 1 (1.x)': [], 'scenarios': [], 'Paper 1 (2.x)': [] };
  for (const u of UNITS) U1.MCQ[u].forEach(q => pools['Paper 1 (1.x)'].push([q.id, q.options]));
  SCENARIOS.forEach(s => s.steps.forEach((st, k) => st.type === 'choice' && pools.scenarios.push([`${s.id}-${k + 1}`, st.options])));
  for (const u of ['2.4', '2.5']) CONTENT[u].MCQ.forEach(q => pools['Paper 1 (2.x)'].push([q.id, q.options]));
  pools['Paper 1 (2.1 to 2.3)'] = Object.values(U2.MCQ).flat().map(q => [q.id, q.options]);
  for (const [name, list] of Object.entries(pools)) for (const f of ['t', 'p']) {
    let longest = 0;
    for (const [id, opts] of list) {
      const L = opts.map(o => strip(o[f] ?? o.t).length), r = L[0], mx = Math.max(...L.slice(1));
      if (r > mx) longest++;
      assert.ok(r <= 1.35 * mx, `${id} (${f}): right answer is much longer than the others (${r} vs ${mx})`);
    }
    assert.ok(longest / list.length <= 0.35, `${name} (${f}): right answer is the longest in ${longest} of ${list.length}`);
  }
});

// ---------- Section 2, units 2.1 to 2.3 (same formats as Section 1)
const U2U = ['2.1', '2.2', '2.3'];
test('2.1 to 2.3: 9 MCQ per unit (3 per level), right answer first, plain and Vietnamese, known traps and glossary words', () => {
  for (const u of U2U) {
    const qs = U2.MCQ[u]; assert.equal(qs.length, 9, u); assert.equal(checkN(u), 9);
    for (const l of [0, 1, 2]) assert.equal(qs.filter(q => q.level === l).length, 3, `${u} level ${l}`);
    for (const q of qs) {
      assert.ok(q.stem && q.plain && q.vi && q.hint && q.explain && q.options.length === 4, q.id);
      assert.ok(!q.options[0].trap, q.id);
      q.options.slice(1).forEach(o => assert.ok(U2.TRAPS[o.trap], `${q.id}: trap ${o.trap}`));
      assert.equal(new Set(q.options.map(o => o.t)).size, 4, q.id);
      [q.plain, ...q.options.map(o => o.p)].flatMap(pills).forEach(t => assert.ok(GALL[t], `${q.id}: [[${t}]]`));
    }
    assert.ok(CONTENT[u].BANDED && CONTENT[u].TERMS.length >= 8, u);
  }
});
test('2.1 to 2.3: Paper 2 model answers get full marks, empty answers 0; one Analyse question per unit', () => {
  for (const u of U2U) {
    assert.equal(U2.P2[u].filter(q => q.cmd === 'analyse' && q.marks === 6).length, 1, u);
    for (const q of U2.P2[u]) {
      const m = markShort(q.chain.map(plainChain).join(' '), q.groups, q.need);
      assert.ok(m.ok, `${q.id}: model answer scores ${m.score}/${q.marks}`);
      assert.equal(q.groups.length, q.marks, q.id); assert.ok(q.groups.every(g => g.ask), q.id);
      assert.ok(q.frame && q.plain && q.vi && gapsOf(q.chain).length >= 2, q.id);
      assert.equal(markShort('I do not know.', q.groups, q.need).score, 0, q.id);
      [q.plain].flatMap(pills).forEach(t => assert.ok(GALL[t], `${q.id}: [[${t}]]`));
    }
  }
});
test('2.1 to 2.3: learn cards and curve events use known words', () => {
  const all = [];
  const walk = x => (typeof x === 'string' ? all.push(x) : x && typeof x === 'object' && Object.values(x).forEach(walk));
  walk(U2.LEARN); walk(U2.SHIFT_EVENTS);
  all.flatMap(pills).forEach(t => assert.ok(GALL[t], `[[${t}]] is in the glossary`));
  for (const u of U2U) U2.LEARN[u].filter(c => c.kind.startsWith('curve')).forEach(c => assert.ok(['D', 'S'].includes(c.curve), c.id));
});
test('2.1 to 2.3 scenarios: 4 per unit, complete, traps known, cast known', () => {
  for (const u of U2U) assert.equal(SCEN_BY_UNIT[u].length, 4, u);
  for (const s of SCENARIOS.filter(s => U2U.includes(s.unit))) {
    assert.ok(s.story && s.plain && s.vi && s.stickers.length >= 2 && SCENE_KEYS.includes(s.scene), s.id);
    (SCEN_CAST[s.id] || []).forEach(k => assert.ok(CAST[k], `${s.id}: cast ${k}`));
    const texts = [s.plain];
    for (const st of s.steps) {
      texts.push(st.plain);
      if (st.type === 'choice') { assert.ok(!st.options[0].trap && st.why, s.id); st.options.slice(1).forEach(o => assert.ok(U2.TRAPS[o.trap], `${s.id}: ${o.trap}`)); st.options.forEach(o => texts.push(o.p)); }
      if (st.type === 'sort') { assert.ok(U2.TRAPS[st.trap], s.id); st.buckets.forEach((_, b) => assert.ok(st.items.some(i => i.b === b), `${s.id}: bucket ${b}`)); st.items.forEach(i => texts.push(i.p)); }
      if (st.type === 'order') assert.ok(st.lines.length >= 3, s.id);
    }
    texts.flatMap(pills).forEach(t => assert.ok(GALL[t], `${s.id}: [[${t}]]`));
    if (s.explain) {
      assert.ok(markShort(s.explain.groups.map(g => g.k[0]).join('. '), s.explain.groups, s.explain.need).ok, `${s.id}: a full answer`);
      assert.equal(markShort('I like it.', s.explain.groups, s.explain.need).score, 0, s.id);
    }
  }
  Object.keys(U2.TRAPS).forEach(t => assert.ok(TALL[t], t));
});

// ---------- 2.4 and 2.5 joined to the bands and the engine
import * as U245 from '../js/u245.js';
import * as EMX from '../js/eengine.js';
import { EREADY as ERX, EBANK as EBX } from '../js/ebank.js';
test('2.4 and 2.5: every Paper 1 question has plain English, Vietnamese, known words, and a block with a lesson', () => {
  for (const u of ['2.4', '2.5']) {
    assert.ok(CONTENT[u].BANDED && CONTENT[u].TERMS.length >= 5, u);
    for (const q of CONTENT[u].MCQ) {
      assert.ok(U245.PLAIN[q.id], `${q.id}: plain English`);
      assert.ok(q.plain && q.vi && q.options.every(o => o.p), q.id);
      if (U245.PLAIN[q.id][2]) assert.equal(U245.PLAIN[q.id][2].length, q.options.length, `${q.id}: one plain option each`);
      [q.plain, ...q.options.map(o => o.p)].flatMap(pills).forEach(t => assert.ok(GALL[t], `${q.id}: [[${t}]]`));
      q.options.slice(1).forEach(o => assert.ok(EMX.TRAP_BLOCK[o.trap], `${q.id}: trap ${o.trap} points at a block`));
      assert.ok(ERX.has(EMX.blockOfOptions(q.options)), `${q.id}: its block has a lesson`);
    }
    CONTENT[u].LEARN.flatMap(c => [c.text || '']).flatMap(pills).forEach(t => assert.ok(GALL[t], `${u} learn: [[${t}]]`));
  }
  for (const id of Object.keys(U245.CHAIN)) assert.ok(CONTENT['2.5'].MCQ.find(q => q.id === id && q.chain), `chain ${id}`);
  for (const b of Object.values(EMX.EBLOCKS)) assert.ok(ERX.has(b.id), `${b.id}: every block up to 2.5 has a lesson`);
  for (const ev of EBX['price-chain'].builder.events) assert.ok(['D', 'S'].includes(ev[1]) && [1, -1].includes(ev[2]));
});
test('2.4 and 2.5 scenarios: 4 per unit, traps known, cast known, model answers mark full', () => {
  for (const u of ['2.4', '2.5']) assert.equal(SCEN_BY_UNIT[u].length, 4, u);
  for (const s of SCENARIOS.filter(s => ['2.4', '2.5'].includes(s.unit))) {
    assert.ok(s.story && s.plain && s.vi && SCENE_KEYS.includes(s.scene), s.id);
    (SCEN_CAST[s.id] || []).forEach(k => assert.ok(CAST[k], `${s.id}: cast ${k}`));
    for (const st of s.steps) {
      if (st.type === 'choice') { assert.ok(!st.options[0].trap, s.id); st.options.slice(1).forEach(o => assert.ok(TALL[o.trap], `${s.id}: ${o.trap}`)); }
      if (st.type === 'sort') assert.ok(TALL[st.trap], s.id);
      [st.plain, ...(st.options || []).map(o => o.p), ...(st.items || []).map(i => i.p)].flatMap(pills).forEach(t => assert.ok(GALL[t], `${s.id}: [[${t}]]`));
    }
    if (s.explain) assert.ok(markShort(s.explain.groups.map(g => g.k[0]).join('. '), s.explain.groups, s.explain.need).ok, `${s.id}: a full answer`);
  }
});
test('2.4 and 2.5 plain options: the right answer is not usually the longest', () => {
  const strip = s => String(s).replace(/\[\[([^|\]]+)(?:\|([^\]]*))?\]\]/g, (m, k, sh) => sh || k);
  const qs = ['2.4', '2.5'].flatMap(u => CONTENT[u].MCQ).concat(SCENARIOS.filter(s => ['2.4', '2.5'].includes(s.unit)).flatMap(s => s.steps.filter(st => st.type === 'choice')));
  let longest = 0;
  for (const q of qs) { const L = q.options.map(o => strip(o.p).length), mx = Math.max(...L.slice(1)); if (L[0] > mx) longest++; assert.ok(L[0] <= 15 || L[0] <= 1.35 * mx, `${q.id || q.q}: ${L}`); }
  assert.ok(longest <= 0.35 * qs.length, `right answer longest in ${longest} of ${qs.length}`);
});

// ---------- Audit (Nov 2026): rules that keep exercises fair
import { readFileSync } from 'node:fs';
test('sorting tasks are real tasks: more items than groups, and every group is used', () => {
  for (const s of SCENARIOS) for (const st of s.steps.filter(x => x.type === 'sort')) {
    assert.ok(st.items.length > st.buckets.length, `${s.id}: ${st.items.length} items for ${st.buckets.length} groups`);
    st.buckets.forEach((_, b) => assert.ok(st.items.some(i => i.b === b), `${s.id}: group ${b} is empty`));
  }
});
test('AI marking: no word-list cap on top of the AI, identical answers reuse the verdict, positive marking rules', () => {
  const src = readFileSync(new URL('../supabase/functions/ecl-grade/index.ts', import.meta.url), 'utf8');
  assert.ok(!/hits\.splice\(2\)/.test(src), 'the function must not cut Analyse answers to 2 marks by a word list');
  assert.ok(/cached: true/.test(src) && /PROMPT_V/.test(src));
  for (const rule of ['when it is a close call, give the mark', 'different correct point', 'Never hold back a point just because a linking word is missing', 'praise only points you put in hits'])
    assert.ok(src.includes(rule), `marking rule: ${rule}`);
});
test('one clear movement-or-shift tip is shown in 2.4 and 2.5', () => {
  assert.ok(/OWN price/.test(TALL['move-vs-shift'].tip) && /equilibrium/.test(TALL['move-vs-shift'].tip));
});

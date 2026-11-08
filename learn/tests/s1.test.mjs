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

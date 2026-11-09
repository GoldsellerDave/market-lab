// Econ engine: map, lessons and mastery. node --test learn/tests/eengine.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as EM from '../js/eengine.js';
import { EBANK, EREADY } from '../js/ebank.js';
import * as U1 from '../js/u1.js';
import { SCENARIOS } from '../js/u1s.js';

const pills = s => [...String(s).matchAll(/\[\[([^|\]]+)(?:\|[^\]]*)?\]\]/g)].map(m => m[1]);
const strip = s => String(s || '').replace(/\[\[([^|\]]+)(?:\|([^\]]*))?\]\]/g, (m, k, sh) => sh || k);

test('the map: prerequisites exist, sit on lower layers, and there are no loops', () => {
  for (const b of Object.values(EM.EBLOCKS)) for (const p of b.pre) {
    assert.ok(EM.EBLOCKS[p], `${b.id}: unknown block ${p}`);
    assert.ok(EM.EBLOCKS[p].layer < b.layer, `${b.id} (layer ${b.layer}) stands on ${p} (layer ${EM.EBLOCKS[p].layer})`);
  }
  for (const id of Object.keys(EM.EBLOCKS)) assert.ok(!EM.below(id).has(id), `${id} is in a loop`);
});

test('every Section 1 misconception points at a block, and every Section 1 block has a lesson', () => {
  for (const t of Object.keys(U1.TRAPS)) assert.ok(EM.TRAP_BLOCK[t] && EM.EBLOCKS[EM.TRAP_BLOCK[t]], `trap ${t}`);
  for (const b of Object.values(EM.EBLOCKS).filter(b => b.unit[0] === '1')) assert.ok(EREADY.has(b.id), `${b.id} needs a lesson`);
  for (const q of Object.values(U1.MCQ).flat()) assert.ok(EREADY.has(EM.blockOfOptions(q.options)), `${q.id}: its block has a lesson`);
  for (const s of SCENARIOS) s.steps.forEach((st, k) => {
    const b = st.type === 'choice' ? EM.blockOfOptions(st.options) : st.type === 'sort' ? EM.blockOfTrap(st.trap) : 'skip';
    assert.ok(b === 'skip' || EREADY.has(b), `${s.id}-${k + 1}: block ${b}`);
  });
});

test('lessons: a builder, the idea in three versions, and at least 4 fair checks', () => {
  const G = U1.GLOSSARY;
  for (const [id, L] of Object.entries(EBANK)) {
    assert.ok(EM.EBLOCKS[id], id);
    assert.ok(L.say && L.plain && L.vi && L.builder && L.builder.type, id);
    assert.ok(L.checks.length >= 4, `${id}: ${L.checks.length} checks`);
    pills(L.plain).forEach(t => assert.ok(G[t], `${id}: [[${t}]] is in the glossary`));
    const B = L.builder;
    if (B.type === 'sort') { B.items.forEach(i => assert.ok(i[2] >= 0 && i[2] < B.buckets.length, `${id}: ${i[0]}`)); B.buckets.forEach((_, k) => assert.ok(B.items.some(i => i[2] === k), `${id}: bucket ${k} used`)); }
    if (B.type === 'budget') { assert.ok(B.items.reduce((t, i) => t + i[2], 0) > B.money, `${id}: wants are more than the money`); assert.ok(B.items.some(i => i[2] <= B.money), id); }
    if (B.type === 'tapone') assert.ok(B.answer >= 0 && B.answer < B.items.length, id);
    if (B.type === 'graph') B.asks.forEach(([pt]) => { assert.ok(U1.PPC_POINTS[pt] && B.show.includes(pt), `${id}: point ${pt}`); });
    let longest = 0;
    for (const c of L.checks) {
      assert.ok(c.q && c.plain && c.why && c.options.length >= 3, `${id}: ${c.q}`);
      assert.equal(new Set(c.options.map(o => o.t)).size, c.options.length, `${id}: options differ (${c.q})`);
      pills(c.plain).concat(c.options.flatMap(o => pills(o.p))).forEach(t => assert.ok(G[t], `${id}: [[${t}]]`));
      for (const f of ['t', 'p']) { const L2 = c.options.map(o => strip(o[f]).length); if (L2[0] > Math.max(...L2.slice(1))) longest++;
        assert.ok(L2[0] <= 15 || L2[0] <= 1.35 * Math.max(...L2.slice(1)), `${id}: right answer much longer (${c.q})`); }
    }
    assert.ok(longest <= L.checks.length, `${id}: the right answer is the longest too often`);
  }
});

const at = (n, answers, activity = 'build') => ({ created_at: new Date(Date.UTC(2026, 10, 1, 0, n)).toISOString(), activity, answers });
const e = (block, first_try, extra = {}) => ({ id: `b:${block}:0`, eng: 1, block, first_try, ...extra });
test('mastery: three right builds a block; a guided walkthrough is only half; an English miss does not count against the idea', () => {
  let st = EM.mastery([at(1, [e('factors', true), e('factors', true), e('factors', true)])]);
  assert.ok(EM.isMastered(st, 'factors')); assert.equal(EM.stateOf(st, 'factors'), 'built');
  st = EM.mastery([at(1, [e('rewards', true), e('rewards', true), e('rewards', false), { id: 'b:rewards:built', eng: 1, block: 'rewards', built: true }])]);
  assert.ok(EM.isMastered(st, 'rewards'), 'passing Build it up (2 of 3) finishes the building');
  st = EM.mastery([at(1, [e('factors', false, { guided: true }), e('factors', false, { guided: true })])]);
  assert.ok(!EM.isMastered(st, 'factors')); assert.equal(EM.stateOf(st, 'factors'), 'guided');
  const before = EM.pOf(EM.mastery([at(1, [e('scarcity', true)])]), 'scarcity');
  st = EM.mastery([at(1, [e('scarcity', true)]), at(2, [e('scarcity', false, { lang: true })])]);
  assert.equal(EM.pOf(st, 'scarcity'), before, 'a language miss leaves the concept alone');
  st = EM.mastery([at(1, [e('scarcity', true)]), at(2, [e('scarcity', false)])]);
  assert.ok(EM.pOf(st, 'scarcity') < before, 'a concept miss lowers it');
});
test('a missed question lowers its block and the block its misconception points to; drop-down picks the weakest block underneath', () => {
  EM.registerItems([['q-test', 'money-capital']]);
  const st = EM.mastery([at(1, [{ id: 'q-test', first_try: false, trap: 'factor-type' }], 'mcq')]);
  assert.ok(EM.pOf(st, 'money-capital') < EM.START_P && EM.pOf(st, 'factors') < EM.START_P);
  assert.equal(EM.underneath(st, 'money-capital'), 'factors');
  const st2 = EM.mastery([at(1, [e('resources', true), e('resources', true), e('resources', true)])]);
  assert.equal(EM.underneath(st2, 'factors'), 'goods-services', 'mastered blocks are skipped');
  assert.deepEqual(EM.repairs(st, Date.UTC(2026, 10, 2)), ['factors', 'money-capital'].sort((a, b) => EM.pOf(st, a) - EM.pOf(st, b)));
});

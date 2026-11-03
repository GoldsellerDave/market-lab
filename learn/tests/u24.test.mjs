import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../js/engine.js';
import { TRAPS, MCQ, DATA, LEARN, LEARN_MARKET, genEq, EQ_KINDS, nextEqKind, schedule, rng } from '../js/u24.js';
import { CONTENT, ITEMS, TRAPS as ALL_TRAPS } from '../js/content.js';

test('schedules: one equilibrium row, demand falls and supply rises with price, no negatives', () => {
  for (let seed = 1; seed <= 500; seed++) {
    const s = schedule(rng(seed));
    assert.equal(s.qd[s.e], s.qs[s.e]);
    s.prices.forEach((_, i) => { if (i !== s.e) assert.notEqual(s.qd[i], s.qs[i]); assert.ok(s.qs[i] >= 0 && s.qd[i] > 0); });
    for (let i = 1; i < 5; i++) { assert.ok(s.qd[i] < s.qd[i - 1]); assert.ok(s.qs[i] > s.qs[i - 1]); assert.ok(s.prices[i] > s.prices[i - 1]); }
  }
});
test('every generated item is answerable: answers are among the options, numbers are right, traps exist', () => {
  for (const kind of Object.keys(EQ_KINDS)) for (let seed = 1; seed <= 400; seed++) {
    const it = genEq(kind, seed);
    assert.equal(it.level, EQ_KINDS[kind]); assert.ok(it.steps.length >= 1 && it.hint && it.why);
    for (const st of it.steps) {
      assert.ok(st.q && st.why);
      if (st.type === 'choice') {
        assert.equal(st.options.filter(o => o.v === st.answer).length, 1, `${kind}/${seed}: answer once in options`);
        assert.equal(new Set(st.options.map(o => String(o.v))).size, st.options.length, `${kind}/${seed}: unique options`);
        st.options.filter(o => o.v !== st.answer).forEach(o => assert.ok(TRAPS[o.trap], `${kind}/${seed}: trap ${o.trap}`));
      } else { assert.ok(Number.isInteger(st.answer) && st.answer > 0); assert.ok(TRAPS[st.trap]); }
    }
    if (kind === 'eq-gap') assert.equal(it.steps[1].answer, Math.abs(it.qd[it.at] - it.qs[it.at]));
    if (kind === 'eq-gap' || kind === 'eq-dia') {
      const short = it.qd[it.at] > it.qs[it.at];
      assert.equal(it.steps[0].answer, short ? 'shortage' : 'surplus');
      if (kind === 'eq-dia') assert.ok(short ? it.y < 0.5 : it.y > 0.5, 'diagram price on the right side of equilibrium');
    }
    if (kind === 'eq-read') { const i = it.prices.indexOf(it.steps[0].answer); assert.ok(i > it.e); assert.ok(it.qs[i] > it.qd[i]); }
    if (kind === 'eq-market') { it.prices.forEach((_, k) => assert.equal(it.qa[k] + it.qb[k], it.qd[k])); assert.ok(it.qa.every(x => x > 0) && it.qb.every(x => x > 0)); assert.equal(it.steps[1].answer, it.pe); }
  }
});
test('the finder rotates through every kind at each level', () => {
  for (const l of [0, 1, 2]) { const ks = new Set([0, 1, 2, 3].map(n => nextEqKind(l, n))); assert.deepEqual([...ks].sort(), Object.keys(EQ_KINDS).filter(k => EQ_KINDS[k] === l).sort()); }
});
test('the generator is repeatable from its seed (teacher can rebuild a question)', () => { assert.deepEqual(genEq('eq-gap', 42), genEq('eq-gap', 42)); });
test('MCQ: 6 per level, unique ids, wrong options tagged with known traps', () => {
  for (const l of [0, 1, 2]) assert.equal(MCQ.filter(q => q.level === l).length, 6);
  assert.equal(new Set(MCQ.map(q => q.id)).size, MCQ.length);
  for (const q of MCQ) { assert.equal(q.options.length, 4); assert.ok(!q.options[0].trap); q.options.slice(1).forEach(o => assert.ok(TRAPS[o.trap], q.id)); assert.ok(q.hint && q.explain); }
});
test('Learn market and data response are internally consistent', () => {
  assert.equal(LEARN_MARKET.qd(LEARN_MARKET.pe), LEARN_MARKET.qs(LEARN_MARKET.pe));
  assert.ok(LEARN_MARKET.prices.includes(LEARN_MARKET.pe)); assert.equal(LEARN.length, 5); assert.ok(LEARN.find(c => c.kind === 'method'));
  const rows = DATA.table.rows.map(r => r.map(Number)), eq = rows.find(r => r[1] === r[2]);
  assert.equal(DATA.questions[0].answer, eq[0]);
  const at30 = rows.find(r => r[0] === 30); assert.equal(DATA.questions[1].answer, at30[1] - at30[2]);
  const at60 = rows.find(r => r[0] === 60); assert.ok(at60[2] > at60[1]); assert.equal(DATA.questions[2].answer, 'surplus');
  const d = DATA.questions[3];
  assert.equal(E.markShort('At 60 there is a surplus because supply is more than demand. Sellers cut the price. Quantity demanded extends and quantity supplied contracts until equilibrium at 40.', d.groups, d.need).score, 4);
  assert.equal(E.markShort('There is a surplus.', d.groups, d.need).score, 1);
  assert.equal(DATA.questions.reduce((s, q) => s + q.marks, 0), 9);
});
test('content registry: unique question ids across units, every trap known', () => {
  const ids = Object.values(CONTENT).flatMap(c => (c.MCQ || []).map(q => q.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const [id, it] of Object.entries(ITEMS)) assert.ok(it.unit && it.kind && it.text, id);
  for (const c of Object.values(CONTENT)) for (const q of c.MCQ) q.options.forEach(o => !o.trap || assert.ok(ALL_TRAPS[o.trap]));
});

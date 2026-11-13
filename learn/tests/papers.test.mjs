// Section exam papers: content rules. Run: node --test learn/tests/papers.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { PAPERS, PAPER_KEYS, p2Max, markPaper } from '../js/papers.js';
import { TRAPS, ITEMS } from '../js/content.js';
import { markShort } from '../js/engine.js';
import * as EM from '../js/eengine.js';
import { EREADY } from '../js/ebank.js';
import { PPC_POINTS } from '../js/u1.js';
import { UNITS } from '../js/units.js';

const FORMS = Object.values(PAPERS).flatMap(P => ['a', 'b'].map(f => ({ P, f })));
test('each section has two forms of each paper, opened by the teacher like a unit', () => {
  assert.deepEqual(Object.keys(PAPERS), ['1.P', '2.P']); assert.deepEqual(PAPER_KEYS, ['p1a', 'p1b', 'p2a', 'p2b']);
  for (const id of Object.keys(PAPERS)) { const u = UNITS.find(x => x.id === id); assert.ok(u && u.paper && u.ready, id); }
  assert.ok(UNITS.findIndex(u => u.id === '1.P') === UNITS.findIndex(u => u.id === '1.4') + 1 && UNITS.findIndex(u => u.id === '2.P') === UNITS.findIndex(u => u.id === '2.5') + 1, 'papers come at the end of their section');
});
test('Paper 1: 20 new questions a form, every unit covered, a reason and a known misconception for every option', () => {
  const stems = new Set(), practice = new Set(Object.values(ITEMS).filter(i => i.kind === 'MCQ').map(i => i.text));
  for (const { P, f } of FORMS) {
    const qs = P.p1[f]; assert.equal(qs.length, 20, `${P.unit} ${f}`);
    for (const u of P.covers) assert.ok(qs.filter(q => q.unit === u).length >= 2, `${P.unit} ${f}: unit ${u} has at least 2 questions`);
    let longest = 0;
    for (const q of qs) {
      assert.ok(P.covers.includes(q.unit) && q.stem && q.options.length === 4, q.id);
      assert.ok(!stems.has(q.stem) && !practice.has(q.stem), `${q.id}: a new question`); stems.add(q.stem);
      assert.ok(!q.options[0].trap, `${q.id}: the right option is first`);
      assert.equal(new Set(q.options.map(o => o.t)).size, 4, q.id);
      q.options.forEach(o => assert.ok(o.why && o.why.length > 15 || /=/.test(o.why), `${q.id}: a reason for "${o.t}"`));
      q.options.slice(1).forEach(o => assert.ok(TRAPS[o.trap] && EM.TRAP_BLOCK[o.trap], `${q.id}: misconception ${o.trap}`));
      assert.ok(EREADY.has(EM.blockOfOptions(q.options)), `${q.id}: practises a block with a lesson`);
      (q.ppc || []).forEach(p => assert.ok(PPC_POINTS[p], `${q.id}: point ${p}`));
      if (q.table) q.table.rows.forEach(r => assert.equal(r.length, q.table.head.length, q.id));
      const L = q.options.map(o => o.t.length), mx = Math.max(...L.slice(1));
      if (L[0] > mx) longest++; assert.ok(L[0] <= 15 || L[0] <= 1.35 * mx, `${q.id}: the right answer is much longer than the others (${L})`);
      assert.ok(![q.stem, ...q.options.flatMap(o => [o.t, o.why])].some(t => /\[\[/.test(t)), `${q.id}: exam English, no key-word pills`);
    }
    assert.ok(longest <= 7, `${P.unit} ${f}: right answer is the longest in ${longest} of 20`);
  }
});
test('Paper 2: two sets of 2, 4 and 6 marks; chains, trap tiles with reasons, mark points, model answers', async () => {
  const ctx = { aiMark: async () => null, band: () => 3, me: { display_name: 'Test' } };
  for (const { P, f } of FORMS) {
    const sets = P.p2[f]; assert.equal(sets.length, 2); assert.equal(p2Max(sets), 48);
    for (const s of sets) {
      assert.ok(s.case.length > 80, 'a case to read'); assert.deepEqual(s.qs.map(q => q.marks), [2, 4, 6]); assert.equal(s.qs[2].cmd, 'analyse');
      for (const q of s.qs) {
        assert.ok(P.covers.includes(q.unit) && ITEMS[q.id], q.id);
        assert.equal(q.chain.length, q.marks, `${q.id}: one tile for each mark`);
        assert.ok(q.traps.length >= 2 && q.traps.every(t => t.why && !q.chain.includes(t.t)), `${q.id}: trap tiles with reasons`);
        assert.equal(new Set([...q.chain, ...q.traps.map(t => t.t)]).size, q.chain.length + q.traps.length, `${q.id}: tiles are all different`);
        assert.ok(q.groups.length >= q.need && q.need === q.marks && q.groups.every(g => g.label && g.k.length && g.ask), `${q.id}: mark points`);
        assert.ok(markShort(q.model, q.groups, q.need).ok, `${q.id}: the model answer earns ${q.marks}: ` + markShort(q.model, q.groups, q.need).missing.map(g => g.label));
        assert.equal(markShort('I am not sure about this one.', q.groups, q.need).score, 0, `${q.id}: an empty answer earns 0`);
        for (const t of q.traps) assert.ok(markShort(t.t, q.groups, q.need).score < q.need, `${q.id}: a trap tile alone is not a full answer`);
        const m = await markPaper(ctx, P.unit, s, q, q.model); assert.equal(m.score, q.marks, `${q.id}: marked ${m.score}`); assert.equal(m.by, 'keywords');
      }
    }
  }
});
test('Paper 2 marking: AI decides when it answers; without AI a bare list is capped for Analyse', async () => {
  const P = PAPERS['2.P'], s = P.p2.a[1], q = s.qs[2], labels = q.groups.map(g => g.label);
  let sent = null;
  const ai = { aiMark: async x => { sent = x; return { ok: false, hits: labels.slice(0, 3).concat('not a label'), feedback: 'Good.', next: 'Add the shortage.' }; }, band: () => 1, me: { display_name: 'An Nguyen' } };
  const m = await markPaper(ai, P.unit, s, q, q.model);
  assert.deepEqual([m.score, m.by, m.next, m.hits.length], [3, 'ai', 'Add the shortage.', 3]);
  assert.ok(sent.command === 'analyse' && sent.detail && sent.name === 'An' && sent.need === 6 && sent.context.includes('500') && sent.model === q.model, 'the AI gets the case, the table, the model answer and the command word');
  const none = { ...ai, aiMark: async () => null };
  const list = 'cost. profit. left. shortage. price rise. quantity falls.';
  const capped = await markPaper(none, P.unit, s, q, list); assert.deepEqual([capped.score, capped.listOnly], [2, true]);
});

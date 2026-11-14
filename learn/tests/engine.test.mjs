import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../js/engine.js';
import { TRAPS, SHIFTS, MCQ, DATA, LEARN } from '../js/u25.js';

test('ladder: two right first time moves up, two misses rescue and move down', () => {
  let s = { level: 0 };
  s = E.ladder(s, true); assert.equal(s.level, 0);
  s = E.ladder(s, true); assert.equal(s.level, 1); assert.equal(s.moved, 1);
  s = E.ladder(s, false); s = E.ladder(s, false); assert.equal(s.level, 0); assert.equal(s.rescue, true);
  s = E.ladder({ level: 0 }, false); s = E.ladder(s, false); assert.equal(s.level, 0); assert.equal(s.rescue, true);
  s = E.ladder({ level: 2, up: 1 }, true); assert.equal(s.level, 2);
});
test('pickItem prefers unseen items at the level, then nearest level', () => {
  const pool = [{ id: 'a', level: 0 }, { id: 'b', level: 0 }, { id: 'c', level: 1 }];
  assert.equal(E.pickItem(pool, 0, new Set(), new Set(['a'])).id, 'b');
  assert.equal(E.pickItem(pool, 0, new Set(['a', 'b']), new Set()).id, 'c');
  assert.equal(E.pickItem(pool, 2, new Set(), new Set()).id, 'c');
  assert.equal(E.pickItem(pool, 0, new Set(['a', 'b', 'c']), new Set()), null);
});
test('a full adaptive run never runs out of items', () => {
  for (const [pool, n] of [[SHIFTS, 6], [MCQ, 10]]) for (const pattern of [[1], [0], [1, 0], [1, 1, 0]]) {
    let s = { level: 0 }; const used = new Set();
    for (let i = 0; i < n; i++) { const it = E.pickItem(pool, s.level, used, new Set()); assert.ok(it, 'item ' + i); used.add(it.id); s = E.ladder(s, !!pattern[i % pattern.length]); }
  }
});
test('markNumber and markShort', () => {
  assert.ok(E.markNumber('50%', 50, 0.5).ok); assert.ok(E.markNumber(' 50.0 ', 50, 0.5).ok); assert.ok(!E.markNumber('150', 50, 0.5).ok); assert.ok(!E.markNumber('', 50).ok);
  const d = DATA.questions.find(q => q.id === 'd');
  const full = E.markShort('The drought cut the harvest so supply fell. Coffee drinking in China grew so demand increased. There was a shortage so the price rose.', d.groups, d.need);
  assert.equal(full.score, 4);
  const part = E.markShort('Because of the drought supply decreased.', d.groups, d.need);
  assert.equal(part.score, 2); assert.equal(part.missing.length, d.groups.length - 2); assert.ok(d.groups.length > d.need, 'any 4 from');
  assert.equal(E.markShort('it rained a lot less, dry weather', DATA.questions[1].groups, 1).score, 1);
});
test('equilibrium moves the right way for each shift', () => {
  const e = (d, s) => E.equilibrium(d * 0.2, s * 0.2);
  assert.ok(e(1, 0).y > 0.5 && e(1, 0).x > 0.5); assert.ok(e(0, -1).y > 0.5 && e(0, -1).x < 0.5);
  assert.ok(e(0, 1).y < 0.5 && e(0, 1).x > 0.5); assert.ok(e(-1, 0).y < 0.5 && e(-1, 0).x < 0.5);
});
test('every shift item is consistent with the diagram maths', () => {
  const ids = new Set();
  for (const it of SHIFTS) {
    assert.ok(!ids.has(it.id), 'unique ' + it.id); ids.add(it.id);
    assert.ok(['D', 'S', 'both', 'none'].includes(it.curve));
    if (it.trapStep1) assert.ok(TRAPS[it.trapStep1]); if (it.trapStep3) assert.ok(TRAPS[it.trapStep3]);
    assert.ok(E.checkShift(it, 1, it.curve)); assert.ok(E.checkShift(it, 2, it.dir)); assert.ok(E.checkShift(it, 3, it.out.map(o => o.ans)));
    if (it.curve === 'none') continue;
    const eq = E.equilibrium((it.dir.D || 0) * 0.2, (it.dir.S || 0) * 0.2);
    const sign = v => (Math.abs(v) < 1e-9 ? 'depends' : v > 0 ? 'up' : 'down');
    const [p, q] = it.out;
    if (it.curve === 'both') { // one certain, one depends
      const pSame = Math.sign(it.dir.D || 0) === -Math.sign(it.dir.S || 0);
      assert.equal(p.ans, pSame ? (it.dir.D > 0 ? 'up' : 'down') : 'depends', it.id + ' price');
      assert.equal(q.ans, pSame ? 'depends' : (it.dir.D > 0 ? 'up' : 'down'), it.id + ' qty');
    } else { assert.equal(p.ans, sign(eq.y - 0.5), it.id + ' price'); assert.equal(q.ans, sign(eq.x - 0.5), it.id + ' qty'); }
    for (const st of [1, 2, 3]) assert.ok(TRAPS[E.shiftTrap(it, st, 'D')], it.id + ' trap step ' + st);
  }
});
test('MCQ: unique ids, 4 options, every wrong option tagged with a known trap', () => {
  const ids = new Set();
  for (const q of MCQ) {
    assert.ok(!ids.has(q.id)); ids.add(q.id); assert.equal(q.options.length, 4); assert.ok(!q.options[0].trap, q.id + ' right option untagged');
    q.options.slice(1).forEach(o => assert.ok(TRAPS[o.trap], q.id + ': ' + o.t));
    assert.ok(q.hint && q.explain);
  }
  for (const l of [0, 1, 2]) assert.equal(MCQ.filter(q => q.level === l).length, 6);
});
test('learn cards and data response are complete', () => {
  assert.equal(LEARN.length, 5);
  assert.equal(DATA.questions.reduce((s, q) => s + q.marks, 0), 9);
  assert.equal(Math.round((4500 - 3000) / 3000 * 100), DATA.questions[0].answer);
});
test('roster parsing and display names', () => {
  const r = E.parseRoster('Trần Văn Minh Khoa\t-\nLê Thị Hoa\tRose\nPHẠM VĂN ĐỨC\nLee Mei Lin\t-\nVÕ THỊ KIM ANH, Kim');
  assert.deepEqual(r.map(p => p.display_name), ['Khoa', 'Rose', 'Đức', 'Mei Lin', 'Kim']);
  assert.equal(r[2].full_name, 'Phạm Văn Đức'); assert.equal(r[4].full_name, 'Võ Thị Kim Anh');
});
test('summaries, trap counts, start level', () => {
  const at = [{ unit: '2.5', activity: 'mcq', score: 6, max_score: 10, level_end: 1, answers: [{ id: 'q-tax', trap: 'tax-subsidy' }, { id: 'q-tv', trap: 'two-shifts' }, { id: 'q-x', trap: 'two-shifts' }] },
    { unit: '2.5', activity: 'mcq', score: 8, max_score: 10, level_end: 2, answers: [] }];
  const s = E.summarise(at, '2.5'); assert.equal(s.mcq.runs, 2); assert.equal(s.mcq.bestScore, 8); assert.equal(s.mcq.level, 2);
  assert.deepEqual(E.topTrap(E.trapCounts(at, '2.5')), ['two-shifts', 2]);
  assert.equal(E.startLevel(at, '2.5', 'mcq'), 2); assert.equal(E.startLevel(at, '2.5', 'shift'), 0);
  assert.ok(E.seenIds(at).has('q-tax'));
});
test('XP: points, daily cap of 5 runs (Learn once), weekly window from Monday in Vietnam', () => {
  assert.equal(E.xpOf({ activity: 'mcq', score: 8, max_score: 10 }), 100);
  assert.equal(E.xpOf({ activity: 'learn', score: 5, max_score: 5 }), 20);
  const now = new Date('2026-11-04T05:00:00Z'); // Wed 12:00 Vietnam
  const day = '2026-11-04T03:00:00Z', lastWeek = '2026-11-01T10:00:00Z'; // Sun 17:00 Vietnam = last week
  const runs = [...Array(7)].map(() => ({ activity: 'shift', score: 6, max_score: 6, created_at: day }));
  runs.push({ activity: 'learn', score: 5, max_score: 5, created_at: day }, { activity: 'learn', score: 5, max_score: 5, created_at: day });
  runs.push({ activity: 'mcq', score: 5, max_score: 10, created_at: lastWeek });
  const x = E.xpTotals(runs, now);
  assert.equal(x.week, 5 * 72 + 20); assert.equal(x.total, 5 * 72 + 20 + 70);
  assert.equal(E.xpForNew(runs, { activity: 'shift', score: 6, max_score: 6 }, now), 0);
  assert.equal(E.xpForNew(runs, { activity: 'mcq', score: 6, max_score: 10 }, now), 80);
  assert.equal(E.weekStart(new Date('2026-11-01T16:59:00Z')).toISOString(), '2026-10-25T17:00:00.000Z'); // Sun 23:59 VN → previous Monday
  assert.equal(E.weekStart(new Date('2026-11-01T17:00:00Z')).toISOString(), '2026-11-01T17:00:00.000Z'); // Mon 00:00 VN
});
test('needs help: two strategy cards, or under 40% right first time, in the latest run', () => {
  const a = (activity, score, max, rescues) => ({ unit: '2.5', activity, score, max_score: max, answers: [{ id: 'meta', rescues }] });
  assert.equal(E.needsHelp([a('shift', 5, 6, 0)]), null);
  assert.match(E.needsHelp([a('shift', 3, 6, 2)]), /strategy card 2/);
  assert.match(E.needsHelp([a('mcq', 3, 10, 1)]), /3\/10/);
  assert.equal(E.needsHelp([a('mcq', 3, 10, 1), a('mcq', 8, 10, 0)]), null); // latest run is fine
});

// The step-level event log (js/log.js) in demo mode, and the PED lab's mistake diagnosis. node --test learn/tests/log.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';

// A browser-like setting: demo mode, a working localStorage, window and document events
const store = new Map();
globalThis.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
globalThis.window = { addEventListener() {}, MARKET_CONFIG: {} };
globalThis.document = { addEventListener() {}, visibilityState: 'visible' };
globalThis.location = { search: '?demo=1' };

const API = await import('../js/api.js');
const L = await import('../js/log.js');
const U26 = await import('../js/u26.js');
const EM = await import('../js/eengine.js');
const { markNumber } = await import('../js/engine.js');

test('hashVersion is stable and changes with the content', () => {
  const a = { q: 'What is PED?', options: [['A', '', '']] };
  assert.equal(L.hashVersion(a), L.hashVersion(JSON.parse(JSON.stringify(a))));
  assert.notEqual(L.hashVersion(a), L.hashVersion({ ...a, q: 'What is the PED?' }));
  assert.match(L.hashVersion('x'), /^[0-9a-z]{1,7}$/);
});

test('cleanRow keeps only the DATA-SPEC fields and rejects bad rows', () => {
  assert.equal(L.cleanRow({ item_id: '', outcome: 'correct' }), null);
  assert.equal(L.cleanRow({ item_id: 'q1', outcome: 'right' }), null);
  const r = L.cleanRow({ item_id: 'q1', outcome: 'incorrect', unit: '2.6', activity: 'mcq', kc: ['a', 'a', 'b'], help: 'hint', item: { q: 'x' },
    response: 'y'.repeat(900), duration_ms: -5, secret: 'no', user_id: 'forged' });
  assert.deepEqual(r.kc, ['a', 'b']); assert.deepEqual(r.help, ['hint']);
  assert.equal(r.response.length, 400); assert.equal(r.duration_ms, 0);
  assert.equal(r.mode, 'practice'); assert.equal(r.attempt, 1); assert.ok(r.session_id && r.client_t && r.item_version);
  assert.ok(!('secret' in r) && !('user_id' in r) && !('item' in r), 'user and class come from the server token only');
});

test('rows queue while signed out, then upload to the demo store in batches', async () => {
  for (let i = 0; i < 130; i++) L.logStep({ item_id: 'q' + i, outcome: i % 2 ? 'correct' : 'incorrect', unit: '2.6', activity: 'mcq' });
  assert.equal(L.pending(), 130);
  assert.equal(await L.flush(), false, 'no token: nothing is sent');
  const t = await API.rpc('ec_login', { p_username: 'demo-03', p_secret: '1234' });
  API.token.set(t.token);
  assert.equal(await L.flush(), true);
  assert.equal(L.pending(), 0);
  const d = JSON.parse(store.get('ecl:demo:db'));
  assert.equal(d.steps.length, 130);
  assert.ok(d.steps.every(s => s.user_id && s.class_code), 'the demo store adds the student, like the SQL function');
  const tt = await API.rpc('ec_login', { p_username: 'teacher', p_secret: 'demo' });
  const rows = await API.rpc('ec_t_steps', { p_token: tt.token, p_code: d.steps[0].class_code });
  assert.equal(rows.length, 130);
  API.token.set(t.token);
});

test('the queue keeps at most 1000 rows', () => {
  API.token.set(null);
  for (let i = 0; i < 1100; i++) L.logStep({ item_id: 'x', outcome: 'skip' });
  assert.equal(L.pending(), 1000);
  store.delete('ecl:steps:queue');
});

test('KC_DIM covers every block', () => {
  for (const id of Object.keys(EM.EBLOCKS)) assert.ok(['math', 'concept', 'both'].includes(EM.KC_DIM[id]), id);
  assert.equal(EM.KC_DIM['ped-calc'], 'math'); assert.equal(EM.KC_DIM['ped-det'], 'concept');
});

test('PED lab: every named mistake is diagnosed, the right answer never is', () => {
  const seen = {};
  for (const kind of Object.keys(U26.PED_KINDS)) for (let seed = 1; seed <= 800; seed++) {
    const it = U26.genPed(kind, seed);
    for (const st of it.steps) {
      if (st.type !== 'number') continue;
      assert.equal(U26.diagnosePed(st, String(st.answer)), null, `${kind} ${seed}: right answer diagnosed`);
      for (const d of st.diag || []) {
        assert.ok(U26.PED_DIAG[d.id], d.id);
        assert.ok(!markNumber(String(d.v), st.answer, st.tol || 0).ok, `${kind} ${seed}: ${d.id} would be marked right`);
        const typed = String(Math.round(d.v * 100) / 100);
        const got = U26.diagnosePed(st, typed);
        assert.ok(got, `${kind} ${seed}: ${d.id} (${typed}) not diagnosed`);
        seen[d.id] = 1;
      }
    }
    if (it.fade) assert.ok(it.fade.every(j => j < it.steps.length - 1), 'the final step is never faded');
  }
  for (const id of ['inverted', 'wrong-base', 'raw-change', 'revenue-added', 'pct-as-units', 'change-only']) assert.ok(seen[id], id + ' never generated');
  for (const d of Object.values(U26.PED_DIAG)) assert.ok(EM.EBLOCKS[d.block], d.block);
});

test('PED key-word warm-up: unique words and meanings, blocks exist', () => {
  assert.equal(new Set(U26.PED_VOCAB.map(v => v.w)).size, U26.PED_VOCAB.length);
  assert.equal(new Set(U26.PED_VOCAB.map(v => v.d)).size, U26.PED_VOCAB.length);
  for (const v of U26.PED_VOCAB) assert.ok(EM.EBLOCKS[v.kc], v.kc);
});

test('every Paper 2 practice question has knowledge components', async () => {
  const { CONTENT, P2_KC } = await import('../js/content.js');
  for (const C of Object.values(CONTENT)) for (const q of C.P2 || []) {
    assert.ok(P2_KC[q.id] && P2_KC[q.id].length, q.id);
    for (const b of P2_KC[q.id]) assert.ok(EM.EBLOCKS[b], `${q.id}: ${b}`);
  }
});

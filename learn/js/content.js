// Every built unit's content, keyed by unit id, plus merged lookups for traps and items (used by the teacher console).
import * as U24 from './u24.js?v=a4c0cc27';
import * as U25 from './u25.js?v=a4c0cc27';
import * as U1 from './u1.js?v=a4c0cc27';
import * as U2 from './u2.js?v=a4c0cc27';
import { PAPERS1 } from './px1.js?v=a4c0cc27';
import { PAPERS2 } from './px2.js?v=a4c0cc27';
import * as U245 from './u245.js?v=a4c0cc27';
import * as EM from './eengine.js?v=a4c0cc27';
import { SCENARIOS } from './u1s.js?v=a4c0cc27';
import { EQ_TITLES } from './u24.js?v=a4c0cc27';

// Section 1 units share one glossary and one set of traps; each has its own cards and questions. BANDED: English adapts to the band.
const G = { ...U1.GLOSSARY, ...U2.GLOSSARY, ...U245.GLOSSARY };
const pillsIn = x => (typeof x === 'string' ? [...x.matchAll(/\[\[([^|\]]+)(?:\|[^\]]*)?\]\]/g)].map(m => m[1]) : x && typeof x === 'object' ? Object.values(x).flatMap(pillsIn) : []);
const terms = (S, u) => [...new Set(pillsIn([S.LEARN[u], S.MCQ[u], S.P2[u]]))].filter(t => G[t]);
const s1 = u => ({ BANDED: true, TRAPS: U1.TRAPS, LEARN: U1.LEARN[u], MCQ: U1.MCQ[u], P2: U1.P2[u], TERMS: terms(U1, u), VI: {} });
// Section 2 units built the same way (2.1 to 2.3): their own traps, plus the curve cards' events
const s2 = u => ({ BANDED: true, TRAPS: U2.TRAPS, LEARN: U2.LEARN[u], MCQ: U2.MCQ[u], P2: U2.P2[u], TERMS: terms(U2, u), VI: {}, SHIFT_EVENTS: U2.SHIFT_EVENTS });
// 2.4 and 2.5: their questions get plain English, Vietnamese and (2.5) the price-change chain from u245.js
const banded = M => M.MCQ.map(q => { const P = U245.PLAIN[q.id]; if (!P) return q;
  return { ...q, plain: P[0], vi: P[1], options: q.options.map((o, k) => ({ ...o, p: (P[2] && P[2][k]) || o.t })), ...(U245.CHAIN[q.id] ? { chain: U245.CHAIN[q.id] } : {}) }; });
const s3 = M => { const MCQ = banded(M); return { ...M, BANDED: true, MCQ, TERMS: [...new Set(pillsIn([MCQ.map(q => [q.plain, q.options.map(o => o.p)])]))].filter(t => G[t]) }; };
export const CONTENT = { '1.1': s1('1.1'), '1.2': s1('1.2'), '1.3': s1('1.3'), '1.4': { ...s1('1.4'), PPC: U1.PPC_ITEMS }, '2.1': s2('2.1'), '2.2': s2('2.2'), '2.3': s2('2.3'), '2.4': s3(U24), '2.5': s3(U25) };
export const GLOSSARY = G;
export const PAPER_SETS = [PAPERS1, PAPERS2];
export const TRAPS = { ...U25.TRAPS, ...U24.TRAPS, ...U1.TRAPS, ...U2.TRAPS,
  'move-vs-shift': { label: 'Movement vs shift', tip: 'A change in the good’s OWN price is a movement ALONG the curve (an extension or a contraction). The whole curve shifts only when something else changes. When the price moves towards equilibrium, the curves do not shift.' } };
/** Traps that can appear in one unit (for the heat map) */
export const unitTraps = u => Object.keys((CONTENT[u] || {}).TRAPS || {});
/** id → {kind, text, level} for every question, across units */
export const ITEMS = {};
for (const [u, C] of Object.entries(CONTENT)) {
  (C.MCQ || []).forEach(q => (ITEMS[q.id] = { unit: u, kind: 'MCQ', text: q.stem, level: q.level }));
  (C.SHIFTS || []).forEach(s => (ITEMS[s.id] = { unit: u, kind: 'Shift', text: s.event, level: s.level }));
  if (C.DATA) C.DATA.questions.forEach(q => (ITEMS[C.DATA.id + '-' + q.id] = { unit: u, kind: 'Data', text: `(${q.id}) ${q.q}`, level: 1 }));
  (C.P2 || []).forEach(q => (ITEMS[q.id] = { unit: u, kind: 'Paper 2', text: q.q, level: q.level }));
  (C.PPC || []).forEach(q => (ITEMS[q.id] = { unit: u, kind: 'PPC', text: q.title + ': ' + q.steps[0].q, level: q.level }));
}
// The econ engine: which block each Section 1 and 2.1 to 2.3 question practises (from the misconceptions on its wrong answers)
EM.registerItems([
  ...[...Object.values(U1.MCQ), ...Object.values(U2.MCQ), U24.MCQ, U25.MCQ].flat().map(q => [q.id, EM.blockOfOptions(q.options)]),
  ...U25.SHIFTS.map(s => [s.id, 'price-chain']), ...Object.keys(EQ_TITLES).map(k => [k, k === 'eq-market' ? 'market-demand' : k === 'eq-find' || k === 'eq-dia' ? 'equilibrium' : 'shortage-surplus']),
  ...SCENARIOS.flatMap(s => s.steps.map((st, k) => [`${s.id}-${k + 1}`, st.type === 'choice' ? EM.blockOfOptions(st.options) : st.type === 'sort' ? EM.blockOfTrap(st.trap) : null]))]);
SCENARIOS.forEach(s => { s.steps.forEach((st, k) => (ITEMS[`${s.id}-${k + 1}`] = { unit: s.unit, kind: 'Scenario', text: `${s.title}: ${st.q}`, level: 0 }));
  if (s.explain) ITEMS[`${s.id}-x`] = { unit: s.unit, kind: 'Scenario (B2)', text: `${s.title}: ${s.explain.q}`, level: 2 }; });
// Section exam papers: every question is listed for the teacher, and each multiple-choice question practises an engine block
for (const P of [PAPERS1, PAPERS2]) for (const f of ['a', 'b']) {
  P.p1[f].forEach(q => (ITEMS[q.id] = { unit: P.unit, kind: `Paper 1 Form ${f.toUpperCase()}`, text: q.stem, level: 1, topic: q.unit }));
  P.p2[f].forEach(s => s.qs.forEach(q => (ITEMS[q.id] = { unit: P.unit, kind: `Paper 2 Form ${f.toUpperCase()}`, text: `${q.q} [${q.marks}]`, level: 1, topic: q.unit })));
  EM.registerItems(P.p1[f].map(q => [q.id, EM.blockOfOptions(q.options)]));
}
U1.BASELINE.forEach(t => t.qs.forEach((q, k) => (ITEMS[`${t.id}-${k + 1}`] = { unit: 'base', kind: `Baseline ${t.level}`, text: `${t.title}: ${q.q}`, level: 0 })));
Object.entries(EQ_TITLES).forEach(([k, t]) => (ITEMS[k] = { unit: '2.4', kind: 'Finder', text: t + ' (a new schedule each time)', level: U24.EQ_KINDS[k] }));

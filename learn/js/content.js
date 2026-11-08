// Every built unit's content, keyed by unit id, plus merged lookups for traps and items (used by the teacher console).
import * as U24 from './u24.js?v=7490a618';
import * as U25 from './u25.js?v=7490a618';
import * as U1 from './u1.js?v=7490a618';
import { SCENARIOS } from './u1s.js?v=7490a618';
import { EQ_TITLES } from './u24.js?v=7490a618';

// Section 1 units share one glossary and one set of traps; each has its own cards and questions. BANDED: English adapts to the band.
const terms = u => [...new Set([...JSON.stringify([U1.LEARN[u], U1.MCQ[u], U1.P2[u]]).matchAll(/\[\[([^|\]]+)(?:\|[^\]]*)?\]\]/g)].map(m => m[1]))].filter(t => U1.GLOSSARY[t]);
const s1 = u => ({ BANDED: true, TRAPS: U1.TRAPS, LEARN: U1.LEARN[u], MCQ: U1.MCQ[u], P2: U1.P2[u], TERMS: terms(u), VI: {} });
export const CONTENT = { '1.1': s1('1.1'), '1.2': s1('1.2'), '1.3': s1('1.3'), '1.4': { ...s1('1.4'), PPC: U1.PPC_ITEMS }, '2.4': U24, '2.5': U25 };
export const GLOSSARY = U1.GLOSSARY;
export const TRAPS = { ...U25.TRAPS, ...U24.TRAPS, ...U1.TRAPS };
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
SCENARIOS.forEach(s => { s.steps.forEach((st, k) => (ITEMS[`${s.id}-${k + 1}`] = { unit: s.unit, kind: 'Scenario', text: `${s.title}: ${st.q}`, level: 0 }));
  if (s.explain) ITEMS[`${s.id}-x`] = { unit: s.unit, kind: 'Scenario (B2)', text: `${s.title}: ${s.explain.q}`, level: 2 }; });
U1.BASELINE.forEach(t => t.qs.forEach((q, k) => (ITEMS[`${t.id}-${k + 1}`] = { unit: 'base', kind: `Baseline ${t.level}`, text: `${t.title}: ${q.q}`, level: 0 })));
Object.entries(EQ_TITLES).forEach(([k, t]) => (ITEMS[k] = { unit: '2.4', kind: 'Finder', text: t + ' (a new schedule each time)', level: U24.EQ_KINDS[k] }));

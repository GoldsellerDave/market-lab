// Every built unit's content, keyed by unit id, plus merged lookups for traps and items (used by the teacher console).
import * as U24 from './u24.js';
import * as U25 from './u25.js';
import { EQ_TITLES } from './u24.js';

export const CONTENT = { '2.4': U24, '2.5': U25 };
export const TRAPS = { ...U25.TRAPS, ...U24.TRAPS };
/** Traps that can appear in one unit (for the heat map) */
export const unitTraps = u => Object.keys((CONTENT[u] || {}).TRAPS || {});
/** id → {kind, text, level} for every question, across units */
export const ITEMS = {};
for (const [u, C] of Object.entries(CONTENT)) {
  (C.MCQ || []).forEach(q => (ITEMS[q.id] = { unit: u, kind: 'MCQ', text: q.stem, level: q.level }));
  (C.SHIFTS || []).forEach(s => (ITEMS[s.id] = { unit: u, kind: 'Shift', text: s.event, level: s.level }));
  if (C.DATA) C.DATA.questions.forEach(q => (ITEMS[C.DATA.id + '-' + q.id] = { unit: u, kind: 'Data', text: `(${q.id}) ${q.q}`, level: 1 }));
}
Object.entries(EQ_TITLES).forEach(([k, t]) => (ITEMS[k] = { unit: '2.4', kind: 'Finder', text: t + ' (a new schedule each time)', level: U24.EQ_KINDS[k] }));

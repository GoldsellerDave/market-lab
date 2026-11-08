// English bands: A1, A2, B1, B2 (estimates for grouping, not an official CEFR test).
// The baseline sets the starting band; Section 1 activities move it up or down; a teacher's override wins.
export const BANDS = ['A1', 'A2', 'B1', 'B2'];
export const BAND_NAMES = ['Starter', 'Builder', 'Core', 'Exam ready'];
export const BASE_UNIT = 'base';
export const BANDED_ACTS = new Set(['mcq', 'p2', 'ppc', 'check']);
export const UP_AFTER = 3, DOWN_AFTER = 2;

/** Baseline score out of 12 → band: 0–4 A1, 5–7 A2, 8–10 B1, 11–12 B2 (scaled if the test length changes) */
export function baselineBand(score, n = 12) {
  const r = n ? score / n : 0;
  return r < 5 / 12 ? 0 : r < 8 / 12 ? 1 : r < 11 / 12 ? 2 : 3;
}
const metaOf = a => (a.answers || []).find(x => x.id === 'meta') || {};
/** Right first time, from an attempt's answers (meta excluded) */
export function rftOf(a) {
  const xs = (a.answers || []).filter(x => x.id !== 'meta');
  if (!xs.length) return a.max_score ? a.score / a.max_score : 0;
  return xs.filter(x => x.first_try).length / xs.length;
}
/** Strong: 80%+ right first time with at most one hint or translation. Weak: under 40%. */
export const isStrong = a => rftOf(a) >= 0.8 && (metaOf(a).help || 0) <= 1;
export const isWeak = a => rftOf(a) < 0.4;

/** The band now: { band (0-3 or null before the baseline), source: 'teacher' | 'auto' | 'none', up, down, baseline } */
export function bandOf(history, override = null) {
  const hist = (history || []).slice().sort((x, y) => new Date(x.created_at) - new Date(y.created_at));
  const bases = hist.filter(a => a.unit === BASE_UNIT && a.activity === 'baseline');
  const base = bases[bases.length - 1];
  if (override != null && override !== '') return { band: +override, source: 'teacher', up: 0, down: 0, baseline: base ? base.score : null };
  if (!base) return { band: null, source: 'none', up: 0, down: 0, baseline: null };
  let band = baselineBand(base.score, base.max_score), up = 0, down = 0;
  for (const a of hist) {
    if (new Date(a.created_at) <= new Date(base.created_at) || !BANDED_ACTS.has(a.activity) || metaOf(a).band == null) continue;
    if (isStrong(a)) { up++; down = 0; } else if (isWeak(a)) { down++; up = 0; } else { up = 0; down = 0; }
    if (up >= UP_AFTER && band < 3) { band++; up = 0; }
    if (down >= DOWN_AFTER && band > 0) { band--; down = 0; }
  }
  return { band, source: 'auto', up, down, baseline: base.score };
}

// ---------- Paper 2 helpers ----------
/** "Resources are {limited}." → "Resources are limited." */
export const plainChain = s => String(s).replace(/\{([^}]*)\}/g, '$1');
/** The gap words of a chain, in order */
export const gapsOf = chain => chain.flatMap(s => [...String(s).matchAll(/\{([^}]*)\}/g)].map(m => m[1]));
/** Ordering task: how many sentences are in the right place */
export const orderScore = (order, n) => order.filter((v, i) => v === i).length / n;
/** Marks for a proportion right, never more than the marks available */
export const marksFor = (frac, marks) => Math.max(0, Math.min(marks, Math.round(frac * marks)));

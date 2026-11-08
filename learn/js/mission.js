// The unit mission: six steps per unit, shared by the student app and the teacher dashboard.
import { ACTIVITIES } from './units.js';
import { CONTENT } from './content.js';
import * as E from './engine.js';
export const CHECK_PASS = 0.7, CHECK_N = 12;
export const BADGE = { '2.4': 'Market maker', '2.5': 'Shift spotter' };
const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
export function mission(u, hist) {
  const acts = ACTIVITIES[u], s = E.summarise(hist, u), prac = acts.find(a => a.id === 'shift' || a.id === 'eqm'), cont = CONTENT[u];
  const best = id => (s[id] ? pct(s[id].bestScore, s[id].max) : null);
  const steps = [
    { key: 'learn', act: 'learn', ic: 'learn', label: 'Learn the ideas', detail: `${cont.LEARN.length} cards with moving diagrams`, done: !!s.learn },
    { key: 'practice', act: prac.id, ic: prac.id, label: `Play ${prac.title}`, detail: s[prac.id] ? `Best ${best(prac.id)}% right first time` : 'Six questions that adapt to you', done: !!s[prac.id] },
    { key: 'stretch', act: prac.id, ic: prac.id, label: 'Reach Stretch level', detail: `Get 2 right first time in a row in ${prac.title}`, done: hist.some(a => a.unit === u && a.activity === prac.id && a.level_end >= 1) },
    { key: 'mcq', act: 'mcq', ic: 'mcq', label: 'Paper 1: score 60% or more', detail: s.mcq ? `Best so far ${best('mcq')}%` : '10 multiple-choice questions', done: !!s.mcq && s.mcq.best >= 0.6 },
    { key: 'data', act: 'data', ic: 'data', label: 'Data response', detail: s.data ? `Best ${s.data.bestScore}/${s.data.max}` : 'A Paper 2 style case study', done: !!s.data }
  ];
  const ready = steps.every(x => x.done), cb = checkBest(u, hist);
  steps.push({ key: 'check', act: 'check', ic: 'check', label: 'Final challenge: unit checkpoint', locked: !ready && cb == null,
    detail: cb != null ? `Best ${Math.round(cb * 100)}%. Pass mark ${CHECK_PASS * 100}%.` : ready ? `${CHECK_N} questions, no hints. Score ${CHECK_PASS * 100}% to pass.` : 'Opens when the other steps are done.',
    done: cb != null && cb >= CHECK_PASS });
  const next = steps.find(x => !x.done && !x.locked);
  return { steps, next, n: steps.filter(x => x.done).length, complete: steps.every(x => x.done), badge: BADGE[u] || 'Unit champion' };
}
export function checkBest(u, hist) {
  const r = hist.filter(a => a.unit === u && a.activity === 'check' && a.max_score);
  return r.length ? Math.max(...r.map(a => a.score / a.max_score)) : null;
}

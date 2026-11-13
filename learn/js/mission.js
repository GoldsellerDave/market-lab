// The unit mission: six steps per unit, shared by the student app and the teacher dashboard.
import { ACTIVITIES } from './units.js?v=7351257f';
import { CONTENT } from './content.js?v=7351257f';
import * as E from './engine.js?v=7351257f';
import { SCEN_BY_UNIT, scenAct } from './u1s.js?v=7351257f';
export const CHECK_PASS = 0.7, CHECK_N = 12;
export const BADGE = { '1.1': 'Scarcity scout', '1.2': 'Factor finder', '1.3': 'Choice champion', '1.4': 'Curve master', '2.1': 'Market mover', '2.2': 'Demand detective', '2.3': 'Supply star', '2.4': 'Market maker', '2.5': 'Shift spotter' };
/** Checkpoint length: 4 questions per level, or fewer if the unit has fewer */
export const checkN = u => 3 * Math.min(4, ...[0, 1, 2].map(l => (CONTENT[u].MCQ || []).filter(q => q.level === l).length));
const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
export function mission(u, hist) {
  const acts = ACTIVITIES[u], s = E.summarise(hist, u), prac = acts.find(a => a.id === 'shift' || a.id === 'eqm' || a.id === 'ppc'), cont = CONTENT[u];
  const written = acts.find(a => a.id === 'data' || a.id === 'p2'), n = checkN(u);
  const best = id => (s[id] ? pct(s[id].bestScore, s[id].max) : null);
  const steps = [
    { key: 'learn', act: 'learn', ic: 'learn', label: 'Learn the ideas', detail: `${cont.LEARN.length} short cards`, done: !!s.learn },
    ...(SCEN_BY_UNIT[u] ? [(() => { const all = SCEN_BY_UNIT[u], n = all.filter(x => hist.some(a => a.unit === u && a.activity === scenAct(x.id))).length;
      return { key: 'scen', act: 'scen', ic: 'scen', label: 'Solve the scenarios', detail: `${n} of ${all.length} solved`, done: n === all.length }; })()] : []),
    ...(prac ? [{ key: 'practice', act: prac.id, ic: prac.id, label: `Play ${prac.title}`, detail: s[prac.id] ? `Best ${best(prac.id)}% right first time` : 'Six questions that adapt to you', done: !!s[prac.id] },
      { key: 'stretch', act: prac.id, ic: prac.id, label: 'Reach Stretch level', detail: `Get 2 right first time in a row in ${prac.title}`, done: hist.some(a => a.unit === u && a.activity === prac.id && a.level_end >= 1) }] : []),
    { key: 'mcq', act: 'mcq', ic: 'mcq', label: 'Paper 1: score 60% or more', detail: s.mcq ? `Best so far ${best('mcq')}%` : `${Math.min(10, cont.MCQ.length)} multiple-choice questions`, done: !!s.mcq && s.mcq.best >= 0.6 },
    written.id === 'data' ? { key: 'data', act: 'data', ic: 'data', label: 'Data response', detail: s.data ? `Best ${s.data.bestScore}/${s.data.max}` : 'A Paper 2 style case study', done: !!s.data }
      : { key: 'p2', act: 'p2', ic: 'p2', label: 'Paper 2: build your answers', detail: s.p2 ? `Best ${s.p2.bestScore}/${s.p2.max}` : `${cont.P2.length} written questions, step by step`, done: !!s.p2 }
  ];
  const ready = steps.every(x => x.done), cb = checkBest(u, hist);
  steps.push({ key: 'check', act: 'check', ic: 'check', label: 'Final challenge: unit checkpoint', locked: !ready && cb == null,
    detail: cb != null ? `Best ${Math.round(cb * 100)}%. Pass mark ${CHECK_PASS * 100}%.` : ready ? `${n} questions, no hints. Score ${CHECK_PASS * 100}% to pass.` : 'Opens when the other steps are done.',
    done: cb != null && cb >= CHECK_PASS });
  const next = steps.find(x => !x.done && !x.locked);
  return { steps, next, n: steps.filter(x => x.done).length, complete: steps.every(x => x.done), badge: BADGE[u] || 'Unit champion' };
}
export function checkBest(u, hist) {
  const r = hist.filter(a => a.unit === u && a.activity === 'check' && a.max_score);
  return r.length ? Math.max(...r.map(a => a.score / a.max_score)) : null;
}

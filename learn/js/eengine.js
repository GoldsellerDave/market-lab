// Econ engine: one map of concept blocks for IGCSE Economics 0455, sections 1 and 2 (to 2.5), like the Checkpoint Quest
// grammar engine. A block is an idea a student needs; pre lists the blocks it builds on (layer 0 = everyday intuition).
//   EBLOCKS        name, layer, unit (where it is first needed), pre. Blocks with a lesson in ebank.js are "ready".
//   TRAP_BLOCK     each misconception (trap) on a wrong answer -> the block that the mistake shows is weak.
//   mastery(hist)  each block's p (0 to 1) from all answers, oldest first. Right first time raises p; a miss lowers the
//                  block of the question and the block its trap points to. A "language" miss (right in plain English,
//                  wrong in exam English) does not lower the concept. A guided walkthrough gives half a brick only.
//   Mastered = p >= MASTERED and not only guided. Reviews come back 1, 7 and 30 days after a block is mastered.
// Build-it-up answers save as { id: 'b:<block>:<n>', eng: 1, block, first_try, guided?, lang? }, plus { built: true } when the block
// was passed (it is then mastered). Don't rename block ids.
export const MASTERED = 0.85, START_P = 0.3, REVIEW_DAYS = [1, 7, 30];
const B = (name, layer, unit, pre) => ({ name, layer, unit, pre });
export const EBLOCKS = {
  // ---- layer 0: everyday intuition
  'goods-services': B('Goods and services', 0, '1.1', []),
  'needs-wants': B('Needs and wants', 0, '1.1', []),
  'resources': B('What are resources?', 0, '1.1', []),
  'limited': B('Limited or unlimited?', 0, '1.1', []),
  'choose-lose': B('Choose one, lose the other', 0, '1.3', []),
  'graph-read': B('Reading a graph', 0, '1.4', []),
  'market-place': B('What is a market?', 0, '2.1', []),
  'two-hats': B("Buyer's hat or seller's hat?", 0, '2.2', []),
  'inside-outside': B('On the axis or not? (move or shift)', 1, '2.2', ['graph-read']),
  // ---- layer 1
  'scarcity': B('Scarcity', 1, '1.1', ['needs-wants', 'resources', 'limited']),
  'agents': B('Who has to choose?', 1, '1.1', ['goods-services']),
  'factors': B('The four factors of production', 1, '1.2', ['resources', 'goods-services']),
  'opp-cost': B('Opportunity cost', 1, '1.3', ['choose-lose', 'scarcity']),
  'price-signal': B('Price as a signal', 1, '2.1', ['market-place', 'two-hats']),
  'eff-demand': B('Effective demand: willing and able', 1, '2.2', ['needs-wants', 'limited']),
  // ---- layer 2
  'econ-free': B('Economic or free good?', 2, '1.1', ['scarcity', 'resources']),
  'three-q': B('The three questions', 2, '1.1', ['scarcity', 'agents']),
  'money-capital': B('Money is not capital', 2, '1.2', ['factors']),
  'rewards': B('Rewards: rent, wages, interest, profit', 2, '1.2', ['factors']),
  'quan-qual': B('More or better? (quantity or quality)', 2, '1.2', ['factors']),
  'mobility': B('Mobility of factors', 2, '1.2', ['factors']),
  'next-best': B('Next best, not all', 2, '1.3', ['opp-cost']),
  'oc-decide': B('Opportunity cost in decisions', 2, '1.3', ['opp-cost', 'agents']),
  'ppc-points': B('Points on a PPC', 2, '1.4', ['graph-read', 'scarcity']),
  'market-3q': B('How a market answers the three questions', 2, '2.1', ['three-q', 'price-signal']),
  'law-demand': B('The law of demand', 2, '2.2', ['two-hats', 'eff-demand', 'graph-read']),
  'law-supply': B('The law of supply', 2, '2.3', ['two-hats', 'rewards', 'graph-read']),
  // ---- layer 3
  'ppc-oc': B('Opportunity cost on a PPC', 3, '1.4', ['ppc-points', 'opp-cost']),
  'market-demand': B('Individual and market demand', 3, '2.2', ['law-demand']),
  'market-supply': B('Individual and market supply', 3, '2.3', ['law-supply']),
  'ext-con': B('Extension and contraction', 3, '2.2', ['law-demand', 'inside-outside']),
  'demand-causes': B('What shifts demand?', 3, '2.2', ['law-demand', 'inside-outside']),
  'supply-causes': B('What shifts supply?', 3, '2.3', ['law-supply', 'inside-outside', 'factors']),
  // ---- layer 4
  'ppc-curve': B('Why the PPC is curved', 4, '1.4', ['ppc-oc', 'factors']),
  'ppc-shift': B('Shifts and movements of a PPC', 4, '1.4', ['ppc-points', 'quan-qual']),
  'shortage-surplus': B('Shortage and surplus', 4, '2.4', ['law-demand', 'law-supply', 'scarcity']),
  'equilibrium': B('Market equilibrium', 5, '2.4', ['shortage-surplus', 'graph-read']),
  'price-chain': B('The price-change chain', 6, '2.5', ['demand-causes', 'supply-causes', 'equilibrium'])
};
for (const [id, b] of Object.entries(EBLOCKS)) b.id = id;
// A block's layer is one above the highest block it stands on (the layer numbers above are only a guide when reading)
const layerOf = id => (EBLOCKS[id].pre.length ? 1 + Math.max(...EBLOCKS[id].pre.map(layerOf)) : 0);
for (const b of Object.values(EBLOCKS)) b.layer = layerOf(b.id);
export const LAYERS = ['Everyday ideas', 'First concepts', 'Building on them', 'Diagrams and markets', 'Advanced', 'Equilibrium', 'Price changes'];

// Misconceptions on wrong answers -> the block they show is weak
export const TRAP_BLOCK = {
  'scarcity-def': 'scarcity', 'needs-wants': 'needs-wants', 'free-good': 'econ-free', 'three-questions': 'three-q',
  'factor-type': 'factors', 'money-capital': 'money-capital', 'reward-match': 'rewards', 'quantity-quality': 'quan-qual', 'mobility': 'mobility',
  'oc-def': 'opp-cost', 'oc-all': 'next-best', 'ppc-point': 'ppc-points', 'ppc-oc': 'ppc-oc', 'ppc-shift': 'ppc-shift', 'ppc-dir': 'ppc-shift',
  // 2.1 to 2.3
  'market-def': 'market-place', 'price-signal': 'price-signal', 'planned': 'market-3q', 'want-vs-demand': 'eff-demand', 'law-demand': 'law-demand', 'law-supply': 'law-supply',
  'hats': 'two-hats', 'move-shift': 'inside-outside', 'ext-con': 'ext-con', 'd-causes': 'demand-causes', 'subs-comp': 'demand-causes', 's-causes': 'supply-causes',
  'costs-supply': 'supply-causes', 'add-up': 'market-demand',
  // 2.4 and 2.5
  'move-vs-shift': 'inside-outside', 'related-goods': 'demand-causes', 'tax-subsidy': 'supply-causes', 'market-sum': 'market-demand', 'price-mechanism': 'market-3q',
  'eq-def': 'equilibrium', 'shortage-surplus': 'shortage-surplus', 'price-pressure': 'shortage-surplus', 'gap-calc': 'shortage-surplus',
  'd-vs-s': 'price-chain', 'direction': 'price-chain', 'pq-link': 'price-chain', 'two-shifts': 'price-chain'
};
// The block a question practises: the most common block among its wrong answers' traps (ties: the first)
export function blockOfOptions(options) {
  const n = {};
  for (const o of options.slice(1)) { const b = TRAP_BLOCK[o.trap]; if (b) n[b] = (n[b] || 0) + 1; }
  let best = null; for (const [b, c] of Object.entries(n)) if (!best || c > n[best]) best = b;
  return best;
}
const ITEM = {};          // question id -> block (filled by registerItems)
export function registerItems(list) { for (const [id, block] of list) if (block && EBLOCKS[block]) ITEM[id] = block; }
export const itemBlock = id => ITEM[id] || null;
export const blockOfTrap = trap => TRAP_BLOCK[trap] || null;

const DAY = 864e5;
const up = (p, k) => p + (1 - p) * k, down = (p, k) => p * (1 - k);
/** Mastery of every block from the history (oldest first): { id: { p, n, right, miss, guided, last, mastered, masteredAt } } */
export function mastery(history) {
  const st = {}, g = id => (st[id] ||= { p: START_P, n: 0, right: 0, miss: 0, guided: false, last: 0, masteredAt: 0, missAt: 0 });
  const hist = history.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  for (const a of hist) {
    const t = +new Date(a.created_at) || 0;
    for (const x of a.answers || []) {
      if (!x || x.id === 'meta') continue;
      const block = x.eng ? x.block : itemBlock(x.id);
      if (!block || !EBLOCKS[block]) continue;
      const s = g(block); s.n++; s.last = t;
      if (x.built) { s.p = Math.max(s.p, MASTERED); s.guided = false; if (!s.masteredAt) s.masteredAt = t; s.n--; continue; }   // passed a Build it up
      if (x.guided) { s.guided = true; s.p = Math.max(s.p, 0.6); continue; }
      if (x.first_try) {
        s.right++; s.p = up(s.p, x.eng ? 0.45 : 0.3); if (x.eng) s.guided = false;
        for (const pre of EBLOCKS[block].pre) { const q = g(pre); q.p = up(q.p, 0.1); }
      } else if (!x.lang) {
        s.miss++; s.missAt = t; s.p = down(s.p, 0.4);
        const tb = TRAP_BLOCK[x.trap]; if (tb && tb !== block) { const q = g(tb); q.miss++; q.missAt = t; q.p = down(q.p, 0.3); }
      }
      if (s.p >= MASTERED && !s.guided && !s.masteredAt) s.masteredAt = t;
      if (s.p < MASTERED - 0.15) s.masteredAt = 0;
    }
  }
  for (const s of Object.values(st)) s.mastered = s.p >= MASTERED && !s.guided;
  return st;
}
export const pOf = (st, id) => (st[id] ? st[id].p : START_P);
export const isMastered = (st, id) => !!(st[id] && st[id].mastered);
export const stateOf = (st, id) => isMastered(st, id) ? 'built' : st[id] && st[id].guided ? 'guided' : EBLOCKS[id].pre.every(q => isMastered(st, q)) ? 'ready' : 'locked';
/** The block to drop down to under b: its weakest prerequisite that is not mastered (null if all are) */
export function underneath(st, b) {
  const pre = EBLOCKS[b].pre.filter(q => !isMastered(st, q));
  return pre.sort((x, y) => pOf(st, x) - pOf(st, y))[0] || null;
}
/** Blocks to repair: missed in the last 7 days and not mastered, weakest first */
export function repairs(st, now = Date.now(), ready = () => true) {
  return Object.entries(st).filter(([id, s]) => s.missAt && now - s.missAt < 7 * DAY && !s.mastered && ready(id)).sort((a, b) => a[1].p - b[1].p).map(([id]) => id);
}
/** Guided blocks come back the next day; mastered blocks come back 1, 7 and 30 days later */
export function dueReviews(st, now = Date.now(), ready = () => true) {
  const out = [];
  for (const [id, s] of Object.entries(st)) {
    if (!ready(id)) continue;
    if (s.guided && now - s.last >= DAY * 0.5) out.push(id);
    else if (s.masteredAt) { const days = (now - s.masteredAt) / DAY, since = (now - s.last) / DAY; if (REVIEW_DAYS.some(d => days >= d && since >= d * 0.9)) out.push(id); }
  }
  return out;
}
/** Every block under (and including) id, for the teacher's view of a weak foundation */
export function below(id, seen = new Set()) { for (const p of EBLOCKS[id].pre) if (!seen.has(p)) { seen.add(p); below(p, seen); } return seen; }
export const unitBlocks = unit => Object.values(EBLOCKS).filter(b => b.unit === unit).map(b => b.id);

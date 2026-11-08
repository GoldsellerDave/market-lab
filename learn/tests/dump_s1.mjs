// Writes the Section 1 content as JSON for the browser test: node learn/tests/dump_s1.mjs > s1.json
import * as U1 from '../js/u1.js';
import { plainChain } from '../js/bands.js';
import { SCENARIOS } from '../js/u1s.js';
const strip = s => String(s || '').replace(/\[\[([^|\]]+)(?:\|([^\]]*))?\]\]/g, (m, k, sh) => sh || k);
const MCQ = Object.entries(U1.MCQ).flatMap(([u, qs]) => qs.map(q => ({ unit: u, id: q.id, stem: q.stem, plain: strip(q.plain), right: [q.options[0].t, strip(q.options[0].p)] })));
const P2 = Object.entries(U1.P2).flatMap(([u, qs]) => qs.map(q => ({ unit: u, id: q.id, chain: q.chain.map(c => strip(plainChain(c))), gaps: q.chain.flatMap(c => [...c.matchAll(/\{([^}]*)\}/g)].map(m => m[1])), groups: q.groups, marks: q.marks })));
const SCEN = SCENARIOS.map(x => ({ id: x.id, unit: x.unit, title: x.title, explain: x.explain && { answer: x.explain.groups.map(g => g.k[0]).join(', ') },
  steps: x.steps.map(st => ({ type: st.type, right: st.options ? [st.options[0].t, strip(st.options[0].p)] : null,
    items: st.items ? st.items.map(i => ({ t: [i.t, strip(i.p)], b: i.b })) : null, lines: st.lines || null })) }));
console.log(JSON.stringify({ MCQ, P2, PPC: U1.PPC_ITEMS, BASELINE: U1.BASELINE, SCEN }));

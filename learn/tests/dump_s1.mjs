// Writes the Section 1 content as JSON for the browser test: node learn/tests/dump_s1.mjs > s1.json
import * as U1 from '../js/u1.js';
import * as U2 from '../js/u2.js';
import { CONTENT } from '../js/content.js';
import { plainChain } from '../js/bands.js';
import { SCENARIOS } from '../js/u1s.js';
import { EBANK } from '../js/ebank.js';
import { EBLOCKS } from '../js/eengine.js';
const strip = s => String(s || '').replace(/\[\[([^|\]]+)(?:\|([^\]]*))?\]\]/g, (m, k, sh) => sh || k);
const MCQ = [...Object.entries(U1.MCQ), ...Object.entries(U2.MCQ), ['2.4', CONTENT['2.4'].MCQ], ['2.5', CONTENT['2.5'].MCQ]].flatMap(([u, qs]) => qs.map(q => ({ unit: u, id: q.id, stem: q.stem, plain: strip(q.plain), right: [q.options[0].t, strip(q.options[0].p)], chain: !!q.chain })));
const P2 = [...Object.entries(U1.P2), ...Object.entries(U2.P2)].flatMap(([u, qs]) => qs.map(q => ({ unit: u, id: q.id, chain: q.chain.map(c => strip(plainChain(c))), gaps: q.chain.flatMap(c => [...c.matchAll(/\{([^}]*)\}/g)].map(m => m[1])), groups: q.groups, marks: q.marks })));
const SCEN = SCENARIOS.map(x => ({ id: x.id, unit: x.unit, title: x.title, explain: x.explain && { answer: x.explain.groups.map(g => g.k[0]).join(', ') },
  steps: x.steps.map(st => ({ type: st.type, right: st.options ? [st.options[0].t, strip(st.options[0].p)] : null,
    items: st.items ? st.items.map(i => ({ t: [i.t, strip(i.p)], b: i.b })) : null, lines: st.lines || null })) }));
const EB = Object.fromEntries(Object.entries(EBANK).map(([id, L]) => [id, { name: EBLOCKS[id].name, type: L.builder.type, right: L.checks.flatMap(c => [c.options[0].t, strip(c.options[0].p)]), checks: L.checks.map(c => ({ q: [c.q, strip(c.plain)], right: [c.options[0].t, strip(c.options[0].p)] })) }]));
console.log(JSON.stringify({ MCQ, P2, PPC: U1.PPC_ITEMS, BASELINE: U1.BASELINE, SCEN, EB }));

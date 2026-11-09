// Writes the 2.4 and 2.5 content as JSON for the browser test: node learn/tests/dump_u25.mjs > u25.json
// Paper 1 questions come from CONTENT, so they carry the plain-English stem and options the lower bands see.
import * as U25 from '../js/u25.js';
import { CONTENT } from '../js/content.js';
import { TRAP_BLOCK } from '../js/eengine.js';
const strip = s => String(s || '').replace(/\[\[([^|\]]+)(?:\|([^\]]*))?\]\]/g, (m, k, sh) => sh || k);
const mcq = qs => qs.map(q => ({ ...q, plain: strip(q.plain), rights: [q.options[0].t, strip(q.options[0].p)], blocks: q.options.map(o => [o.t, strip(o.p), TRAP_BLOCK[o.trap] || null]) }));
console.log(JSON.stringify({ SHIFTS: U25.SHIFTS, MCQ: mcq(CONTENT['2.5'].MCQ), DATA: U25.DATA, MCQ24: mcq(CONTENT['2.4'].MCQ), TB: TRAP_BLOCK }));

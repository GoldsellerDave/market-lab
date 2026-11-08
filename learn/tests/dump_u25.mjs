// Writes the 2.4 and 2.5 content as JSON for the browser test: node learn/tests/dump_u25.mjs > u25.json
import * as U25 from '../js/u25.js';
import * as U24 from '../js/u24.js';
console.log(JSON.stringify({ SHIFTS: U25.SHIFTS, MCQ: U25.MCQ, DATA: U25.DATA, MCQ24: U24.MCQ }));

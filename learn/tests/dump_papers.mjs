// Writes the exam papers as JSON for the browser test: node learn/tests/dump_papers.mjs > papers.json
import { PAPERS1 } from '../js/px1.js';
import { PAPERS2 } from '../js/px2.js';
console.log(JSON.stringify({ '1.P': PAPERS1, '2.P': PAPERS2 }));

// The step-level event log (learn/docs/DATA-SPEC.md). The browser marks every step instantly; this module only records it.
// Rows wait in a queue (kept in localStorage, so nothing is lost offline or before schema_steps.sql has been run) and go to
// the server in batches of up to 100 through ec_log_steps. Logging never blocks or interrupts the student: every failure
// is silent and the rows are tried again later.
import { rpc, token } from './api.js?v=2fc9fcde';

const QKEY = 'ecl:steps:queue', CAP = 1000, BATCH = 100;
const FIELDS = ['session_id', 'client_t', 'unit', 'activity', 'mode', 'item_id', 'item_version', 'step', 'template', 'params', 'kc', 'attempt',
  'outcome', 'score', 'max_score', 'response', 'diagnosis', 'help', 'band', 'confidence', 'duration_ms', 'level', 'condition'];
const OUTCOMES = ['correct', 'incorrect', 'hint', 'partial', 'skip'];

// FNV-1a hash of an item's content, in base 36: a reworded item gets a new version, so its data are not mixed with the old.
export function hashVersion(obj) {
  const s = typeof obj === 'string' ? obj : JSON.stringify(obj, (k, v) => (typeof v === 'function' ? undefined : v));
  let h = 0x811c9dc5;
  for (let i = 0; i < (s || '').length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}

const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
let session = rid();
// One session per sitting of one activity
export function newSession() { session = rid(); return session; }
export const sessionId = () => session;

// Experiment arm for in-class experiments (PILOT.md); empty when no experiment runs. Set by the class settings, never by Claude.
let condition = '';
export function setCondition(c) { condition = String(c || '').slice(0, 40); }
export const conditionOf = () => condition;

const readQ = () => { try { const q = JSON.parse(localStorage.getItem(QKEY) || '[]'); return Array.isArray(q) ? q : []; } catch { return []; } };
let mem = null; // fallback when localStorage is blocked
const getQ = () => mem || readQ();
const putQ = q => { q = q.slice(-CAP); try { localStorage.setItem(QKEY, JSON.stringify(q)); mem = null; } catch { mem = q; } };

// Clean one row to the fields in DATA-SPEC.md. Returns null when it cannot be logged.
export function cleanRow(r) {
  if (!r || !r.item_id || !OUTCOMES.includes(r.outcome)) return null;
  const o = { session_id: session, client_t: new Date().toISOString(), mode: 'practice', attempt: 1, step: '', kc: [], help: [], condition, ...r };
  if (r.item && !r.item_version) o.item_version = hashVersion(r.item);
  const out = {};
  for (const k of FIELDS) if (o[k] !== undefined && o[k] !== null) out[k] = o[k];
  out.item_id = String(out.item_id).slice(0, 60); out.step = String(out.step ?? '').slice(0, 20);
  out.kc = [...new Set((Array.isArray(out.kc) ? out.kc : [out.kc]).filter(Boolean).map(String))].slice(0, 8);
  out.help = [...new Set((Array.isArray(out.help) ? out.help : [out.help]).filter(Boolean).map(String))].slice(0, 8);
  if (out.response !== undefined) out.response = String(out.response).slice(0, 400);
  if (out.duration_ms !== undefined) out.duration_ms = Math.max(0, Math.min(3600000, Math.round(+out.duration_ms) || 0));
  return out;
}

export function logStep(r) {
  const row = cleanRow(r); if (!row) return null;
  putQ([...getQ(), row]); schedule();
  return row;
}

let busy = false, timer = null;
function schedule() { if (!timer) timer = setTimeout(() => { timer = null; flush(); }, 4000); }

export async function flush() {
  if (busy || !token.get()) return false;
  busy = true;
  try {
    let q = getQ();
    while (q.length) {
      const part = q.slice(0, BATCH);
      try { await rpc('ec_log_steps', { p_token: token.get(), p_rows: part }); }
      catch (e) { if (e && e.message === 'bad-steps') { q = q.slice(part.length); putQ(q); continue; } return false; }
      q = getQ().slice(part.length); putQ(q);
    }
    return true;
  } finally { busy = false; }
}

export const pending = () => getQ().length;

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => flush());
  window.addEventListener('pagehide', () => flush());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
}

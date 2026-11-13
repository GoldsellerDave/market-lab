// Every database call goes through rpc(): Supabase ec_* functions, or a demo store in this browser
// (demo mode: ?demo=1, or no Supabase settings in ../config.js). Demo logins: demo-01 / 1234, teacher / demo.
import { xpTotals } from './engine.js?v=65021f42';
const CFG = window.MARKET_CONFIG || {};
const PARAMS = new URLSearchParams(location.search);
export const DEMO = PARAMS.has('demo') || !String(CFG.supabaseUrl || '').trim();
const TKEY = DEMO ? 'ecl:demo:token' : 'ecl:token';

export const ERRORS = {
  'wrong-login': 'That username or PIN is not right. Check your login slip.',
  'locked': 'Too many wrong tries. Wait 5 minutes, or ask your teacher.',
  'not-signed-in': 'Please sign in again.',
  'teachers-only': 'This page is for teachers.',
  'weak-secret': 'Choose a longer password (at least 8 characters).',
  'class-exists': 'A class with that code already exists.',
  'bad-class-code': 'Class code: 2 to 12 letters or numbers, no spaces.',
  'not-your-class': 'That class belongs to another teacher.',
  'offline': 'No connection. Check the Wi-Fi and try again.'
};
export const errText = e => ERRORS[e && e.message] || (e && e.message) || 'Something went wrong.';

export const token = { get: () => { try { return localStorage.getItem(TKEY); } catch { return null; } },
  set: v => { try { v ? localStorage.setItem(TKEY, v) : localStorage.removeItem(TKEY); } catch { } } };

export async function rpc(fn, args = {}) {
  if (DEMO) {
    const out = await demo(fn, JSON.parse(JSON.stringify(args)));
    if (out && typeof out === 'object' && !Array.isArray(out) && out.error) throw new Error(out.error);
    return out;
  }
  const key = String(CFG.supabaseAnonKey || '');
  const headers = { 'Content-Type': 'application/json', apikey: key };
  if (key.startsWith('eyJ')) headers.Authorization = 'Bearer ' + key;
  const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 20000);
  let r;
  try { r = await fetch(`${String(CFG.supabaseUrl).replace(/\/$/, '')}/rest/v1/rpc/${fn}`, { method: 'POST', headers, body: JSON.stringify(args), signal: ctrl.signal }); }
  catch { throw new Error('offline'); }
  finally { clearTimeout(timer); }
  const body = await r.json().catch(() => null);
  if (!r.ok) throw new Error((body && body.message) || 'HTTP ' + r.status);
  if (body && typeof body === 'object' && !Array.isArray(body) && body.error) throw new Error(body.error);
  return body;
}

// AI marking of a written answer by the "ecl-grade" Edge Function. Returns { ok, hits, feedback },
// or null on any problem (not deployed, no key, daily limit, slow), so the keyword mark stands.
// Demo mode has no AI; ?demo=1&aidemo=1 imitates it (it agrees with the keywords) so the screens can be tried.
export async function aiMark(q) {
  if (DEMO) {
    if (!PARAMS.has('aidemo')) return null;
    await new Promise(r => setTimeout(r, 400));
    const d = db(), u = d.users.find(x => x.id === d.tokens[token.get()]);
    const out = { ok: !!q.keyword_ok, hits: q.keyword_hits || [], feedback: q.keyword_ok ? 'Well done: your answer makes the points.' : 'Good start. Explain your idea in one more step.' };
    (d.ai = d.ai || []).push({ id: d.ai.length + 1, user_id: u && u.id, username: u && u.username, display_name: u && u.display_name, is_test: !!(u && u.is_test), unit: q.unit, item: q.item, band: q.band,
      question: q.question, answer: q.answer, ok: out.ok, hits: out.hits, need: q.need, keyword_ok: q.keyword_ok, feedback: out.feedback, model: 'demo', overruled: false, created_at: new Date().toISOString() });
    save(d); return out;
  }
  const t = token.get(); if (!t) return null;
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 25000);
  try {
    const res = await fetch(`${String(CFG.supabaseUrl).replace(/\/$/, '')}/functions/v1/ecl-grade`, {
      method: 'POST', signal: ctl.signal, headers: { 'Content-Type': 'application/json', apikey: String(CFG.supabaseAnonKey || '') },
      body: JSON.stringify({ token: t, ...q, keyword_hits: undefined })
    });
    const body = await res.json().catch(() => null);
    return res.ok && body && typeof body.ok === 'boolean' && Array.isArray(body.hits) ? body : null;
  } catch { return null; } finally { clearTimeout(timer); }
}

// ---------- demo store (same behaviour as the SQL functions, kept in localStorage) ----------
const DKEY = 'ecl:demo:db';
function db() {
  let d; try { d = JSON.parse(localStorage.getItem(DKEY)); } catch { }
  if (!d) {
    d = { users: [{ id: 't1', username: 'teacher', role: 'teacher', secret: 'demo', display_name: 'Demo Teacher', full_name: 'Demo Teacher', is_admin: true }],
      classes: [{ code: 'demo', name: 'Demo class', teacher_id: 't1', open_units: ['1.1', '1.2', '1.3', '1.4', '2.4', '2.5'], board: true, vi_a1: true }], tokens: {}, attempts: [], seq: 1, s1: true };
    ['An', 'Tony', 'Mia'].forEach((n, i) => d.users.push({ id: 's' + (i + 1), username: 'demo-0' + (i + 1), role: 'student', class_code: 'demo', secret: '1234', display_name: n, full_name: 'Demo ' + n }));
  }
  if (!d.s1) { d.s1 = true; d.classes.forEach(c => { c.open_units = [...new Set(['1.1', '1.2', '1.3', '1.4', ...(c.open_units || [])])]; if (c.vi_a1 == null) c.vi_a1 = true; }); }
  return d;
}
const save = d => { try { localStorage.setItem(DKEY, JSON.stringify(d)); } catch { } };
const pin = () => String(1000 + Math.floor(Math.random() * 9000));
function demo(fn, a) {
  const d = db(), now = new Date().toISOString();
  const me = () => { const id = d.tokens[a.p_token]; const u = d.users.find(x => x.id === id); if (!u) throw new Error('not-signed-in'); u.last_seen = now; return u; };
  const teacher = () => { const u = me(); if (u.role !== 'teacher') throw new Error('teachers-only'); return u; };
  const cls = code => { const c = d.classes.find(x => x.code === String(code).toLowerCase()); if (!c) throw new Error('no-such-class'); return c; };
  const prof = u => ({ role: u.role, username: u.username, display_name: u.display_name, full_name: u.full_name, class_code: u.class_code || null, must_change: !!u.must_change, is_admin: !!u.is_admin, open_units: (d.classes.find(c => c.code === u.class_code) || {}).open_units || [], eng_band: u.eng_band ?? null, vi_a1: (d.classes.find(c => c.code === u.class_code) || {}).vi_a1 !== false });
  const addPeople = (c, people) => {
    let n = Math.max(0, ...d.users.filter(u => u.class_code === c.code && u.role === 'student').map(u => +u.username.split('-').pop() || 0));
    return people.map(p => { n++; const u = { id: 'u' + Date.now() + n, username: c.code + '-' + String(n).padStart(2, '0'), role: 'student', class_code: c.code, secret: pin(), full_name: p.full_name || '', display_name: p.display_name || p.full_name };
      d.users.push(u); return { username: u.username, full_name: u.full_name, display_name: u.display_name, pin: u.secret }; });
  };
  let out;
  switch (fn) {
    case 'ec_login': { const u = d.users.find(x => x.username === String(a.p_username).trim().toLowerCase()); if (!u || u.secret !== a.p_secret) return { error: 'wrong-login' };
      const t = 'tok' + Math.random().toString(36).slice(2); d.tokens[t] = u.id; u.last_seen = now; out = { token: t, ...prof(u) }; break; }
    case 'ec_me': out = prof(me()); break;
    case 'ec_logout': delete d.tokens[a.p_token]; out = null; break;
    case 'ec_set_secret': { const u = me(); if (u.secret !== a.p_old) throw new Error('wrong-login'); u.secret = a.p_new; u.must_change = false; out = null; break; }
    case 'ec_save_attempt': { const u = me(); if (u.role !== 'student') return null;
      const at = { id: d.seq++, user_id: u.id, class_code: u.class_code, unit: a.p_unit, activity: a.p_activity, level_start: a.p_level_start, level_end: a.p_level_end, score: a.p_score, max_score: a.p_max, seconds: a.p_seconds, answers: a.p_answers, created_at: now };
      d.attempts.push(at); out = at.id; break; }
    case 'ec_history': { const u = me(); out = d.attempts.filter(x => x.user_id === u.id); break; }
    case 'ec_t_classes': { const t = teacher(); out = d.classes.filter(c => c.teacher_id === t.id || t.is_admin).map(c => ({ ...c, vi_a1: c.vi_a1 !== false, students: d.users.filter(u => u.class_code === c.code && u.role === 'student').length })); break; }
    case 'ec_t_add_class': { const t = teacher(), code = String(a.p_code).trim().toLowerCase(); if (!/^[a-z0-9]{2,12}$/.test(code)) throw new Error('bad-class-code'); if (d.classes.some(c => c.code === code)) throw new Error('class-exists');
      const c = { code, name: a.p_name || '', teacher_id: t.id, open_units: ['2.5'] }; d.classes.push(c); out = addPeople(c, a.p_people || []); break; }
    case 'ec_t_add_students': teacher(); out = addPeople(cls(a.p_code), a.p_people || []); break;
    case 'ec_t_class': { teacher(); const c = cls(a.p_code), st = d.users.filter(u => u.class_code === c.code && u.role === 'student');
      out = { code: c.code, name: c.name, open_units: c.open_units, vi_a1: c.vi_a1 !== false, students: st.map(u => ({ id: u.id, username: u.username, full_name: u.full_name, display_name: u.display_name, last_seen: u.last_seen || null, locked: false, eng_band: u.eng_band ?? null, is_test: !!u.is_test })),
        attempts: d.attempts.filter(x => st.some(u => u.id === x.user_id)) }; break; }
    case 'ec_t_ai_log': { teacher(); const c = cls(a.p_code), ids = new Set(d.users.filter(u => u.class_code === c.code).map(u => u.id));
      out = (d.ai || []).filter(x => ids.has(x.user_id)).slice().reverse(); break; }
    case 'ec_t_ai_flag': { teacher(); const x = (d.ai || []).find(r => r.id === +a.p_id); if (x) x.overruled = !!a.p_overruled; out = null; break; }
    case 'ec_t_set_band': { teacher(); const u = d.users.find(x => x.id === a.p_user); if (u) u.eng_band = a.p_band == null ? null : +a.p_band; out = null; break; }
    case 'ec_t_set_vi': teacher(); cls(a.p_code).vi_a1 = !!a.p_on; out = null; break;
    case 'ec_t_add_test': { teacher(); const c = cls(a.p_code), b = Math.max(0, Math.min(3, +a.p_band || 0)), lv = ['A1', 'A2', 'B1', 'B2'][b], un = `${c.code}-test-${lv.toLowerCase()}`;
      let u = d.users.find(x => x.username === un);
      if (!u) { u = { id: 's' + (++d.seq) + 't', username: un, role: 'student', class_code: c.code, display_name: 'Test ' + lv, full_name: `Test account (${lv})`, is_test: true }; d.users.push(u); }
      d.attempts = d.attempts.filter(x => x.user_id !== u.id); u.secret = pin(); u.eng_band = b; out = { username: un, pin: u.secret, level: lv }; break; }
    case 'ec_t_set_units': teacher(); cls(a.p_code).open_units = a.p_units || []; out = null; break;
    case 'ec_t_reset_pin': { teacher(); const u = d.users.find(x => x.id === a.p_user); u.secret = pin(); out = u.secret; break; }
    case 'ec_t_new_pins': { teacher(); const c = cls(a.p_code); out = d.users.filter(u => u.class_code === c.code && u.role === 'student' && !u.is_test).map(u => { u.secret = pin(); return { username: u.username, full_name: u.full_name, display_name: u.display_name, pin: u.secret }; }); break; }
    case 'ec_t_rename': { teacher(); const u = d.users.find(x => x.id === a.p_user); if (u && a.p_display.trim()) u.display_name = a.p_display.trim(); out = null; break; }
    case 'ec_t_remove_student': { teacher(); d.users = d.users.filter(x => x.id !== a.p_user); d.attempts = d.attempts.filter(x => x.user_id !== a.p_user); out = null; break; }
    case 'ec_board': { const u = me(), c = d.classes.find(x => x.code === u.class_code) || {}, on = c.board !== false;
      const rows = d.users.filter(x => x.role === 'student' && x.class_code === u.class_code && (on || x.id === u.id) && (!x.is_test || x.id === u.id))
        .map(x => ({ name: x.display_name, ...(({ total, week }) => ({ xp: total, week }))(xpTotals(d.attempts.filter(t => t.user_id === x.id))), me: x.id === u.id }))
        .sort((a, b) => b.week - a.week || b.xp - a.xp || a.name.localeCompare(b.name));
      out = { on, rows }; break; }
    case 'ec_t_set_board': teacher(); cls(a.p_code).board = a.p_on !== false; out = null; break;
    default: throw new Error('unknown ' + fn);
  }
  save(d);
  return Promise.resolve(out);
}

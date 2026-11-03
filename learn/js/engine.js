// Pure rules (no DOM), shared by the student app, the teacher console and the tests.
export const LEVELS = ['Core', 'Stretch', 'Challenge'];

/** Fisher-Yates shuffle; rnd injectable for tests */
export function shuffle(a, rnd = Math.random) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

/** The level ladder: 2 right first time in a row → up; 2 missed in a row → down, with a strategy rescue */
export function ladder(state, firstTry) {
  const s = { level: state.level, up: state.up || 0, down: state.down || 0, rescue: false, moved: 0 };
  if (firstTry) { s.up++; s.down = 0; if (s.up >= 2 && s.level < 2) { s.level++; s.up = 0; s.moved = 1; } }
  else { s.down++; s.up = 0; if (s.down >= 2) { s.rescue = true; s.down = 0; if (s.level > 0) { s.level--; s.moved = -1; } } }
  return s;
}

/** Next item: at this level, not used in this run, preferring items never seen before; else the nearest level */
export function pickItem(pool, level, usedIds, seenIds) {
  const free = pool.filter(x => !usedIds.has(x.id));
  for (const d of [0, 1, -1, 2, -2]) {
    const at = free.filter(x => x.level === level + d);
    if (!at.length) continue;
    const fresh = at.filter(x => !seenIds.has(x.id));
    return (fresh.length ? fresh : at)[0];
  }
  return null;
}

/** Normalise typed text for keyword marking */
export const norm = s => String(s || '').toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9%.\s'-]/g, ' ').replace(/\s+/g, ' ').trim();

/** Keyword-group marking: one mark per group hit, up to `need`; returns the groups still missing */
export function markShort(text, groups, need) {
  const t = ' ' + norm(text) + ' ';
  const hits = [], missing = [];
  groups.forEach(g => (g.k.some(k => t.includes(norm(k))) ? hits : missing).push(g));
  return { score: Math.min(hits.length, need), max: need, ok: hits.length >= need, hits: hits.map(g => g.label), missing };
}

/** Numeric answers: accepts "50", "50%", "50.0", "1,500" */
export function markNumber(raw, answer, tol = 0) {
  const v = parseFloat(String(raw || '').replace(/,/g, '').replace(/[^0-9.\-]/g, ''));
  return { value: v, ok: isFinite(v) && Math.abs(v - answer) <= tol };
}

/** Shift detective: compare one step's choice with the item */
export function checkShift(item, step, choice) {
  if (step === 1) return choice === item.curve;
  if (step === 2) return ['D', 'S'].every(c => (item.dir[c] || 0) === (choice[c] || 0));
  if (step === 3) return item.out.every((o, i) => choice[i] === o.ans);
  return false;
}
/** Which misconception a wrong shift-detective step shows */
export function shiftTrap(item, step, choice) {
  if (step === 1) {
    if (item.trapStep1 && (choice !== 'none' || item.curve === 'none')) return item.trapStep1;
    if (choice === 'none' || item.curve === 'none') return 'move-vs-shift';
    if (item.curve === 'both' || choice === 'both') return 'two-shifts';
    return 'd-vs-s';
  }
  if (step === 2) return item.trapStep1 === 'tax-subsidy' ? 'tax-subsidy' : 'direction';
  if (step === 3) return item.trapStep3 || (item.curve === 'none' ? 'move-vs-shift' : 'pq-link');
  return null;
}

/** Equilibrium on the teaching diagram: D: y = 0.9 − 0.8(x − kD), S: y = 0.1 + 0.8(x − kS) */
export const equilibrium = (kD, kS) => ({ x: 0.5 + (kD + kS) / 2, y: 0.5 + 0.4 * (kD - kS) });

/** Summaries from attempt history (a student's own, or one student's within a class) */
export function summarise(attempts, unit) {
  const mine = attempts.filter(a => a.unit === unit);
  const by = {};
  for (const a of mine) {
    const s = (by[a.activity] ||= { runs: 0, best: 0, bestScore: 0, max: 0, last: null, level: 0 });
    s.runs++; s.last = a.created_at; s.level = a.level_end ?? s.level;
    const pct = a.max_score ? a.score / a.max_score : 0;
    if (pct >= s.best) { s.best = pct; s.bestScore = a.score; s.max = a.max_score; }
  }
  return by;
}
/** Misconception counts: wrong first tries tagged with a trap */
export function trapCounts(attempts, unit) {
  const c = {};
  for (const a of attempts) { if (unit && a.unit !== unit) continue; for (const x of (a.answers || [])) if (x.trap) c[x.trap] = (c[x.trap] || 0) + 1; }
  return c;
}
export const topTrap = counts => Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || null;
/** Items seen before, so new runs pick fresh ones first */
export const seenIds = attempts => new Set(attempts.flatMap(a => (a.answers || []).map(x => x.id)).filter(Boolean));
/** Where the next run starts: the level the last run of that activity ended on */
export function startLevel(attempts, unit, activity) { const r = attempts.filter(a => a.unit === unit && a.activity === activity).pop(); return r && r.level_end != null ? r.level_end : 0; }

/** Display name for a roster line: English name if given, else the Vietnamese given name (the last word) */
export function displayName(full, english) {
  const e = String(english || '').trim();
  if (e && e !== '-') return e;
  const words = titleCase(full).split(/\s+/).filter(Boolean);
  if (words[0] === 'Lee' && words.length === 3) return words.slice(1).join(' ');   // Chinese order: family name first, two-part given name
  return words[words.length - 1] || full;
}
export const titleCase = s => String(s || '').trim().toLocaleLowerCase('vi').replace(/(^|\s)(\p{L})/gu, (m, a, b) => a + b.toLocaleUpperCase('vi'));
/** Parse pasted roster lines: "Full name<TAB>English name" (or two spaces / comma); "-" means none */
export function parseRoster(text) {
  return String(text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => {
    const parts = l.split(/\t| {2,}|,/).map(x => x.trim()).filter(Boolean);
    const full = titleCase(parts[0] || ''), eng = parts[1] && parts[1] !== '-' ? parts[1] : '';
    return { full_name: full, display_name: displayName(full, eng) };
  }).filter(p => p.full_name);
}

// ---------- XP (same rules as ec_xp_table in the database) ----------
// Learn 20 XP (once a day); other activities 10 per answer right first time + 2 per question done.
// Only the first 5 runs of an activity each day earn XP. Weeks start Monday, Vietnam time (UTC+7).
export const xpOf = a => (a.activity === 'learn' ? 20 : Math.min(a.score, a.max_score) * 10 + a.max_score * 2);
const vnDay = iso => new Date(new Date(iso).getTime() + 7 * 3600e3).toISOString().slice(0, 10);
export function weekStart(now = new Date()) {
  const vn = new Date(now.getTime() + 7 * 3600e3), dow = (vn.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate() - dow) - 7 * 3600e3);
}
/** {total, week} XP for one student's attempts */
export function xpTotals(attempts, now = new Date()) {
  const seen = {}, ws = weekStart(now); let total = 0, week = 0;
  for (const a of attempts.slice().sort((x, y) => new Date(x.created_at) - new Date(y.created_at))) {
    const k = a.activity + '|' + vnDay(a.created_at), n = (seen[k] = (seen[k] || 0) + 1);
    if (n > (a.activity === 'learn' ? 1 : 5)) continue;
    const xp = xpOf(a); total += xp; if (new Date(a.created_at) >= ws) week += xp;
  }
  return { total, week };
}
/** XP earned by one new run, given the earlier attempts (respects the daily cap) */
export function xpForNew(attempts, a, now = new Date()) {
  const day = vnDay(now.toISOString()), n = attempts.filter(x => x.activity === a.activity && vnDay(x.created_at) === day).length;
  return n >= (a.activity === 'learn' ? 1 : 5) ? 0 : xpOf(a);
}

// ---------- needs help ----------
/** A reason string if the student's latest Shift detective or Paper 1 run shows they are struggling, else null */
export function needsHelp(attempts, unit = '2.5') {
  const why = [];
  for (const act of ['shift', 'mcq']) {
    const a = attempts.filter(x => x.unit === unit && x.activity === act).pop();
    if (!a) continue;
    const meta = (a.answers || []).find(x => x.id === 'meta') || {};
    const name = act === 'shift' ? 'Shift detective' : 'Paper 1';
    if ((meta.rescues || 0) >= 2) why.push(`${name}: strategy card ${meta.rescues}×`);
    else if (a.max_score && a.score / a.max_score < 0.4) why.push(`${name}: ${a.score}/${a.max_score} right first time`);
  }
  return why.length ? why.join('; ') : null;
}

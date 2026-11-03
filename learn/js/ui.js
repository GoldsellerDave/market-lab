// Small DOM helpers shared by the student app and the teacher console.
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function view(html) { const app = $('#app'); app.innerHTML = html; window.scrollTo(0, 0); return app; }
let toastTimer;
export function toast(msg, ms = 2600) {
  let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, ms);
}
export const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
export function ago(iso) {
  if (!iso) return 'never';
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 90) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago';
  return Math.round(s / 86400) + ' d ago';
}
export const pref = {
  get: (k, d) => { try { const v = localStorage.getItem('ecl:pref:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem('ecl:pref:' + k, JSON.stringify(v)); } catch { } }
};
/** Busy state for a button while a promise runs */
export async function busy(btn, fn) { const t = btn.textContent; btn.disabled = true; btn.textContent = '…'; try { return await fn(); } finally { btn.disabled = false; btn.textContent = t; } }

// Line icons (24×24, drawn in the current text colour) and coloured icon tiles, in the Checkpoint Quest style.
const P = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  units: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  me: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  mission: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  learn: '<path d="M3 5.5C5.5 4.5 8.5 4.5 12 6.5c3.5-2 6.5-2 9-1V19c-2.5-1-5.5-1-9 1-3.5-2-6.5-2-9-1z"/><path d="M12 6.5V20"/>',
  shift: '<path d="M4 4v16h16"/><path d="M7 7l10 10" opacity=".45"/><path d="M10 6l10 10"/><path d="M14 9h3v3"/>',
  eqm: '<path d="M12 4v16M7 20h10"/><path d="M4 8h16"/><path d="M4 8l-2.5 6a2.5 2.5 0 0 0 5 0zM20 8l-2.5 6a2.5 2.5 0 0 0 5 0z"/>',
  mcq: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l1.5 1.5L11 8M7 15h.01M13 9h4M13 15h4"/>',
  data: '<path d="M4 20h16"/><rect x="5" y="11" width="3" height="7" rx="1"/><rect x="10.5" y="6" width="3" height="12" rx="1"/><rect x="16" y="13" width="3" height="5" rx="1"/>',
  check: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v3M8 21h8M9 21l1-4h4l1 4"/>',
  review: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>',
  games: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10.5v4M5 12.5h4"/><circle cx="15.5" cy="11.5" r="1" fill="currentColor"/><circle cx="18" cy="14" r="1" fill="currentColor"/>',
  stats: '<path d="M4 20h16"/><rect x="5" y="11" width="3" height="7" rx="1"/><rect x="10.5" y="6" width="3" height="12" rx="1"/><rect x="16" y="13" width="3" height="5" rx="1"/>',
  workout: '<path d="M13 2L5 13h6l-1 9 8-11h-6z"/>',
  words: '<path d="M4 5h16v11H10l-5 4v-4H4z"/><path d="M8 13l2-6 2 6M8.7 11h2.6M14.5 10.5a1.6 1.6 0 1 1 0 2.5M16.1 9.5v3.5"/>',
  market: '<path d="M3 9l2-5h14l2 5"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8M10 20v-5h4v5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  tick: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  badge: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/>',
  p2: '<rect x="3" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="5" rx="1.5"/><rect x="3" y="17" width="8" height="4" rx="1.5"/><path d="M11 5.5h4v4.5M13 12.5H7v4.5"/>',
  ppc: '<path d="M4 4v16h16"/><path d="M5 7a13 13 0 0 1 12 12"/><circle cx="10" cy="13" r="1.4" fill="currentColor"/>',
  scen: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M3 8l3-5h4l-3 5M10 8l3-5h4l-3 5M17 8l2-4"/><path d="M10 12l4 2-4 2z" fill="currentColor"/>',
  base: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
  '1.1': '<path d="M12 3v18"/><path d="M5 8h14"/><path d="M5 8l-2.5 6a2.5 2.5 0 0 0 5 0zM19 8l-2.5 6a2.5 2.5 0 0 0 5 0z"/>',
  '1.2': '<path d="M3 21V10l5 3V10l5 3V6l8 4v11z"/><path d="M7 17h2M12 17h2M17 17h2"/>',
  '1.3': '<path d="M12 21V11"/><path d="M12 11L6 5M12 11l6-6"/><path d="M6 5H9M6 5v3M18 5h-3M18 5v3"/>',
  '1.4': '<path d="M4 4v16h16"/><path d="M5 7a13 13 0 0 1 12 12"/>',
  '2.1': '<path d="M3 9l2-5h14l2 5"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/>',
  '2.2': '<path d="M4 4v16h16"/><path d="M7 6c2 7 6 10 12 11"/>',
  '2.3': '<path d="M4 4v16h16"/><path d="M7 17c6-1 10-5 12-11"/>',
  '2.4': '<path d="M4 4v16h16"/><path d="M6 6l13 12M6 18L19 6"/><circle cx="12.5" cy="12" r="1.6" fill="currentColor"/>',
  '2.5': '<path d="M4 4v16h16"/><path d="M6 8l9 10" opacity=".45"/><path d="M10 6l9 10"/><path d="M13 7h3v3"/>',
  '2.6': '<path d="M4 4v16h16"/><path d="M6 12c2-2 3 2 5 0s3 2 5 0 2 1 3 0"/>'
};
const HUE = { scen: '#FF7A59', p2: '#7B4FC4', ppc: '#2F6FB5', base: '#1E8C87', mission: '#D29A0F', learn: '#1E8C87', shift: '#2F6FB5', eqm: '#2F6FB5', mcq: '#D9622B', data: '#7B4FC4', check: '#D29A0F', review: '#D9622B',
  games: '#C2417A', stats: '#C98A0B', workout: '#D9622B', words: '#2A7A4B', market: '#B8432F', lock: '#7A8794', badge: '#C98A0B', unit: '#1E8C87' };

export function icon(name, size = 22) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${P[name] || ''}</svg>`;
}
/** A rounded coloured square with a white icon. size: "s" (32px), "m" (44px) or "l" (64px). */
export function tile(name, size = 'm') {
  const hue = HUE[name] || (/^\d\.\d$/.test(name) ? HUE.unit : '#1E8C87');
  return `<span class="itile ${size}" style="--hue:${hue}">${icon(name, size === 'l' ? 34 : size === 's' ? 18 : 24)}</span>`;
}
export const hue = name => HUE[name] || HUE.unit;

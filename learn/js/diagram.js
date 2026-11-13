// An animated demand and supply diagram (SVG). Curves shift horizontally; the new equilibrium is marked.
import { equilibrium } from './engine.js?v=a433765c';

const X0 = 56, X1 = 336, Y0 = 268, Y1 = 22;
const px = x => X0 + (X1 - X0) * x, py = y => Y0 - (Y0 - Y1) * y;
const lineD = k => [[0.12 + k, 0.9 - 0.8 * 0.12], [0.88 + k, 0.9 - 0.8 * 0.88]];
const lineS = k => [[0.12 + k, 0.1 + 0.8 * 0.12], [0.88 + k, 0.1 + 0.8 * 0.88]];
const pts = l => l.map(([x, y]) => `${px(x).toFixed(1)},${py(y).toFixed(1)}`).join(' ');
const STEP = 0.2;

export function createDiagram(host, opts = {}) {
  host.innerHTML = `<svg class="dg" viewBox="0 0 360 312" role="img" aria-label="${opts.label || 'Demand and supply diagram'}">
    <defs><clipPath id="dgclip${host.id || ''}"><rect x="${X0}" y="${Y1 - 6}" width="${X1 - X0 + 6}" height="${Y0 - Y1 + 6}"/></clipPath>
      <marker id="dgarr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dg-arrowhead"/></marker></defs>
    <g class="dg-axes"><line x1="${X0}" y1="${Y1 - 8}" x2="${X0}" y2="${Y0}"/><line x1="${X0}" y1="${Y0}" x2="${X1 + 10}" y2="${Y0}"/>
      <text x="${X0 - 8}" y="${Y1 - 10}" text-anchor="end">Price</text><text x="${X1 + 10}" y="${Y0 - 8}" text-anchor="end">Quantity</text></g>
    <g clip-path="url(#dgclip${host.id || ''})">
      <polyline class="dg-old dg-d" data-k="d0"/><polyline class="dg-old dg-s" data-k="s0"/>
      <polyline class="dg-d" data-k="d"/><polyline class="dg-s" data-k="s"/>
    </g>
    <g class="dg-guides" data-k="g"></g><g class="dg-move" data-k="mv"></g><g class="dg-pline" data-k="pl"></g>
    <text class="dg-lab dg-dl" data-k="dl"></text><text class="dg-lab dg-sl" data-k="sl"></text>
    <text class="dg-lab dg-dl dg-faint" data-k="dl0"></text><text class="dg-lab dg-sl dg-faint" data-k="sl0"></text>
  </svg>`;
  const svg = host.querySelector('svg'), q = k => svg.querySelector(`[data-k="${k}"]`);
  let cur = { kD: 0, kS: 0 }, raf = null, mvOn = false, plOn = false;
  function draw(kD, kS) {
    const moved = { D: Math.abs(kD) > 0.001, S: Math.abs(kS) > 0.001 };
    q('d0').setAttribute('points', pts(lineD(0))); q('s0').setAttribute('points', pts(lineS(0)));
    q('d0').style.display = moved.D ? '' : 'none'; q('s0').style.display = moved.S ? '' : 'none';
    q('d').setAttribute('points', pts(lineD(kD))); q('s').setAttribute('points', pts(lineS(kS)));
    const lab = (el, l, txt) => { const [x, y] = l[1]; el.setAttribute('x', Math.min(px(x) + 4, X1 + 8)); el.setAttribute('y', py(y) + (el.classList.contains('dg-dl') ? 0 : 4)); el.textContent = txt; };
    lab(q('dl'), lineD(kD), moved.D ? 'D2' : 'D'); lab(q('sl'), lineS(kS), moved.S ? 'S2' : 'S');
    lab(q('dl0'), lineD(0), moved.D ? 'D1' : ''); lab(q('sl0'), lineS(0), moved.S ? 'S1' : '');
    const e0 = equilibrium(0, 0), e1 = equilibrium(kD, kS), any = moved.D || moved.S, g = q('g');
    const guide = (e, cls, p, qq) => `<polyline class="dg-guide ${cls}" points="${px(0)},${py(e.y)} ${px(e.x)},${py(e.y)} ${px(e.x)},${py(0)}"/><circle class="dg-eq ${cls}" cx="${px(e.x)}" cy="${py(e.y)}" r="5"/>
      <text class="dg-tick ${cls}" x="${X0 - 6}" y="${py(e.y) + 5}" text-anchor="end">${p}</text><text class="dg-tick ${cls}" x="${px(e.x)}" y="${Y0 + 18}" text-anchor="middle">${qq}</text>`;
    g.innerHTML = guide(e0, any ? 'dg-faint' : '', plOn ? 'Pe' : any || mvOn ? 'P1' : 'P', plOn ? 'Qe' : any || mvOn ? 'Q1' : 'Q') + (any && opts.showNew !== false ? guide(e1, 'dg-new', 'P2', 'Q2') : '');
  }
  function set(target, animate = true, keepMove = false) {
    if (!keepMove) { clearTimeout(alongTimer); q('mv').innerHTML = ''; mvOn = false; }
    const from = { ...cur }, to = { kD: (target.D || 0) * STEP, kS: (target.S || 0) * STEP };
    cancelAnimationFrame(raf);
    if (!animate || matchMedia('(prefers-reduced-motion: reduce)').matches) { cur = to; draw(to.kD, to.kS); return; }
    const t0 = performance.now(), dur = 750;
    const step = now => { const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3);
      cur = { kD: from.kD + (to.kD - from.kD) * e, kS: from.kS + (to.kS - from.kS) * e }; draw(cur.kD, cur.kS); if (t < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }
  // A movement along the demand curve: the point slides from E1 to where the price is higher (sDir -1) or lower (+1).
  // Then, if showCause, supply shifts to explain why the price changed; the demand curve never moves.
  let alongTimer;
  function along(sDir = -1, onPhase = () => {}, showCause = true) {
    set({}, false); mvOn = true; draw(0, 0);
    const e0 = equilibrium(0, 0), e1 = equilibrium(0, sDir * STEP), mv = q('mv');
    const paint = t => {
      const x = e0.x + (e1.x - e0.x) * t, y = 0.9 - 0.8 * x;
      mv.innerHTML = `<line class="dg-mvline" x1="${px(e0.x)}" y1="${py(e0.y)}" x2="${px(x)}" y2="${py(y)}" marker-end="url(#dgarr)"/>
        <circle class="dg-mvdot" cx="${px(x)}" cy="${py(y)}" r="7"/>
        ${t > 0.98 ? `<text class="dg-mvlab" x="${px(x) + 12}" y="${py(y) - 10}">${sDir < 0 ? 'Contraction' : 'Extension'} of demand</text>
          <polyline class="dg-guide dg-new" points="${px(0)},${py(y)} ${px(x)},${py(y)} ${px(x)},${py(0)}"/>
          <text class="dg-tick" x="${X0 - 6}" y="${py(y) + 5}" text-anchor="end">P2</text><text class="dg-tick" x="${px(x)}" y="${Y0 + 18}" text-anchor="middle">Q2</text>` : ''}`;
    };
    onPhase(1);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { paint(1); if (showCause) { set({ S: sDir }, false, true); onPhase(2); } return; }
    const t0 = performance.now(), dur = 1100;
    const step = now => { const t = Math.min(1, (now - t0) / dur); paint(1 - Math.pow(1 - t, 3)); if (t < 1) raf = requestAnimationFrame(step);
      else if (showCause) alongTimer = setTimeout(() => { set({ S: sDir }, true, true); onPhase(2); }, 1400); };
    raf = requestAnimationFrame(step);
  }
  draw(0, 0);
  if (opts.start) set(opts.start, false);
  // A price line at height y (0 to 1, equilibrium 0.5): marks Qd on the demand curve, Qs on the supply curve,
  // and the shortage or surplus between them. y = null removes it. label: the text at the price axis.
  // hideGap: for questions that ask what the gap is. The gap is drawn in a neutral colour with no label,
  // so the diagram does not give the answer away; call again without hideGap after Check to name it.
  function priceLine(y, label = 'P', hideGap = false) {
    const g = q('pl');
    if (y == null) { g.innerHTML = ''; if (plOn) { plOn = false; draw(cur.kD, cur.kS); } return null; }
    if (!plOn) { plOn = true; draw(cur.kD, cur.kS); }
    const xd = (0.9 - y) / 0.8, xs = (y - 0.1) / 0.8, gap = xd - xs, kind = Math.abs(gap) < 0.004 ? 'eq' : gap > 0 ? 'shortage' : 'surplus';
    const lo = Math.min(xd, xs), hi = Math.max(xd, xs), by = py(y) - (kind === 'surplus' ? -16 : 16);
    g.innerHTML = `<line class="dg-pl" x1="${px(0)}" y1="${py(y)}" x2="${px(1.02)}" y2="${py(y)}"/>
      <text class="dg-tick dg-pltick" x="${X0 - 6}" y="${py(y) + 5}" text-anchor="end">${label}</text>
      ${kind === 'eq' ? '' : `<line class="dg-gap ${hideGap ? 'hidden' : kind}" x1="${px(lo)}" y1="${py(y)}" x2="${px(hi)}" y2="${py(y)}"/>
        <line class="dg-qline" x1="${px(xd)}" y1="${py(y)}" x2="${px(xd)}" y2="${py(0)}"/><line class="dg-qline" x1="${px(xs)}" y1="${py(y)}" x2="${px(xs)}" y2="${py(0)}"/>
        <text class="dg-tick dg-d-t" x="${px(xd)}" y="${Y0 + 32}" text-anchor="middle">Qd</text><text class="dg-tick dg-s-t" x="${px(xs)}" y="${Y0 + 32}" text-anchor="middle">Qs</text>
        ${hideGap ? '' : `<text class="dg-gaplab ${kind}" x="${px((lo + hi) / 2)}" y="${by}" text-anchor="middle">${kind === 'shortage' ? 'Shortage' : 'Surplus'}</text>`}`}
      <circle class="dg-ddot" cx="${px(xd)}" cy="${py(y)}" r="6"/><circle class="dg-sdot" cx="${px(xs)}" cy="${py(y)}" r="6"/>`;
    return kind;
  }
  return { set, along, priceLine, reset: () => set({}, true) };
}

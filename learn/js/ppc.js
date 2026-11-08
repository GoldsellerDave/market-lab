// Production possibility curve diagram (SVG): rice on the horizontal axis, phones on the vertical axis.
// The main curve is a quarter ellipse through (0,10) and (10,0); a second curve shows a shift (rx, ry = the new maximums).
import { PPC_POINTS } from './u1.js?v=7490a618';

const W = 360, H = 320, X0 = 56, Y0 = 270, MAX = 14, S = (300 - X0) / MAX;
const px = x => X0 + x * S, py = y => Y0 - y * S;
const arc = (rx, ry) => `M${px(0)},${py(ry)} A${rx * S},${ry * S} 0 0 1 ${px(rx)},${py(0)}`;

export function createPPC(host, opts = {}) {
  const ticks = [2, 4, 6, 8, 10, 12];
  host.innerHTML = `<svg class="dg ppc" viewBox="0 0 ${W} ${H}" role="img" aria-label="${opts.label || 'Production possibility curve for rice and phones'}">
    <defs><marker id="ppcarr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="dg-arrowhead"/></marker></defs>
    <g class="dg-axes"><line x1="${X0}" y1="${py(MAX)}" x2="${X0}" y2="${Y0}"/><line x1="${X0}" y1="${Y0}" x2="${px(MAX)}" y2="${Y0}"/>
      ${ticks.map(t => `<line class="ppc-grid" x1="${px(t)}" y1="${Y0}" x2="${px(t)}" y2="${py(MAX)}"/><line class="ppc-grid" x1="${X0}" y1="${py(t)}" x2="${px(MAX)}" y2="${py(t)}"/>
        <text x="${px(t)}" y="${Y0 + 16}" text-anchor="middle">${t}</text><text x="${X0 - 8}" y="${py(t) + 4}" text-anchor="end">${t}</text>`).join('')}
      <text x="${X0 - 6}" y="${py(MAX) - 8}" text-anchor="start">Phones (millions)</text><text x="${px(MAX)}" y="${Y0 + 36}" text-anchor="end">Rice (million tonnes)</text></g>
    <path class="ppc-old" data-k="old" d="" style="display:none"/>
    <path class="ppc-curve" data-k="curve" d="${arc(10, 10)}"/>
    <text class="ppc-lab" data-k="lab" x="${px(7.4)}" y="${py(7.4) - 8}">PPC</text>
    <g data-k="arrow"></g><g data-k="pts"></g></svg>`;
  const q = k => host.querySelector(`[data-k="${k}"]`);
  let cur = { x: 10, y: 10 }, raf;
  function points(names = [], hi = null) {
    q('pts').innerHTML = names.map(n => { const [x, y] = PPC_POINTS[n];
      return `<circle class="ppc-pt${n === hi ? ' hi' : ''}" cx="${px(x)}" cy="${py(y)}" r="${n === hi ? 7 : 5.5}"/><text class="ppc-ptlab" x="${px(x) + 8}" y="${py(y) - 8}">${n}</text>`; }).join('');
  }
  function arrow(a, b) {
    if (!a) return (q('arrow').innerHTML = '');
    const [x1, y1] = PPC_POINTS[a], [x2, y2] = PPC_POINTS[b];
    q('arrow').innerHTML = `<polyline class="ppc-move" points="${px(x1)},${py(y1)} ${px(x1)},${py(y2)} ${px(x2)},${py(y2)}" />
      <line class="ppc-drop" x1="${px(x1)}" y1="${py(y1)}" x2="${px(x1)}" y2="${py(y2)}" marker-end="url(#ppcarr)"/>
      <line class="ppc-gain" x1="${px(x1)}" y1="${py(y2)}" x2="${px(x2)}" y2="${py(y2)}" marker-end="url(#ppcarr)"/>
      <text class="ppc-note" x="${px(x1) - 6}" y="${(py(y1) + py(y2)) / 2 + 4}" text-anchor="end">−${y1 - y2} phones</text>
      <text class="ppc-note" x="${(px(x1) + px(x2)) / 2}" y="${py(y2) + 16}" text-anchor="middle">+${x2 - x1} rice</text>`;
  }
  // Move the curve to new maximums (rx on the rice axis, ry on the phone axis); the old curve stays dashed.
  function shift(to, animate = true) {
    const from = { ...cur }, target = to || { x: 10, y: 10 };
    q('old').style.display = to ? '' : 'none'; q('old').setAttribute('d', arc(10, 10));
    cancelAnimationFrame(raf);
    const draw = c => { q('curve').setAttribute('d', arc(c.x, c.y)); q('lab').setAttribute('x', px(c.x * 0.74)); q('lab').setAttribute('y', py(c.y * 0.74) - 8); q('lab').textContent = to ? 'PPC₂' : 'PPC'; };
    if (!animate || matchMedia('(prefers-reduced-motion: reduce)').matches) { cur = target; return draw(cur); }
    const t0 = performance.now();
    const step = now => { const t = Math.min(1, (now - t0) / 800), e = 1 - Math.pow(1 - t, 3); cur = { x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e }; draw(cur); if (t < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }
  points(opts.show || []);
  if (opts.arrow) arrow(...opts.arrow);
  return { points, arrow, shift };
}

// One demand curve or one supply curve (SVG), for 2.2 and 2.3. Bubble tea in District 3: price in thousand đồng, cups a day.
//   Demand Qd = 160 − 2P, supply Qs = 2P (the same numbers as u2.js). A shift moves the curve 30 cups right (+1) or left (−1).
//   at(P)        marks the point on the curve at price P, with an arrow from the last point (a movement along the curve)
//   shift(dir)   animates the curve right (+1) or left (−1); 0 puts it back and shows a movement along it instead
export const QD = P => 160 - 2 * P, QS = P => 2 * P;
const X0 = 56, X1 = 336, Y0 = 268, Y1 = 22, PMAX = 80, QMAX = 200, SH = 30;
const px = q => X0 + ((X1 - X0) * q) / QMAX, py = p => Y0 - ((Y0 - Y1) * p) / PMAX;

export function createCurve(host, opts = {}) {
  const D = (opts.curve || 'D') === 'D', Q = (P, k = 0) => (D ? QD(P) : QS(P)) + k * SH, name = D ? 'D' : 'S', cls = D ? 'dg-d' : 'dg-s';
  const uid = 'cv' + Math.random().toString(36).slice(2, 7);
  host.innerHTML = `<svg class="dg" viewBox="0 0 360 312" role="img" aria-label="${D ? 'Demand' : 'Supply'} curve for bubble tea">
    <defs><clipPath id="${uid}"><rect x="${X0}" y="${Y1 - 6}" width="${X1 - X0 + 6}" height="${Y0 - Y1 + 6}"/></clipPath>
      <marker id="${uid}a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dg-arrowhead"/></marker></defs>
    <g class="dg-axes"><line x1="${X0}" y1="${Y1 - 8}" x2="${X0}" y2="${Y0}"/><line x1="${X0}" y1="${Y0}" x2="${X1 + 10}" y2="${Y0}"/>
      <text x="${X0 - 8}" y="${Y1 - 10}" text-anchor="end">Price</text><text x="${X1 + 10}" y="${Y0 - 8}" text-anchor="end">Cups a day</text>
      ${[20, 40, 60].map(p => `<text class="dg-tick dg-faint" x="${X0 - 6}" y="${py(p) + 4}" text-anchor="end">${p}k</text>`).join('')}
      ${[40, 80, 120, 160].map(q => `<text class="dg-tick dg-faint" x="${px(q)}" y="${Y0 + 18}" text-anchor="middle">${q}</text>`).join('')}</g>
    <g clip-path="url(#${uid})"><polyline class="dg-old ${cls}" data-k="c0"/><polyline class="${cls}" data-k="c"/></g>
    <g data-k="mv"></g><g data-k="pt"></g>
    <text class="dg-lab ${D ? 'dg-dl' : 'dg-sl'}" data-k="l"></text><text class="dg-lab ${D ? 'dg-dl' : 'dg-sl'} dg-faint" data-k="l0"></text>
  </svg>`;
  const svg = host.querySelector('svg'), q = k => svg.querySelector(`[data-k="${k}"]`);
  let k = 0, raf = null, last = null;
  const line = kk => { const ps = []; for (let P = 0; P <= PMAX; P += 5) ps.push(`${px(Q(P, kk)).toFixed(1)},${py(P).toFixed(1)}`); return ps.join(' '); };
  const labAt = kk => { const P = D ? 14 : 66; return [Math.min(px(Q(P, kk)) + 6, X1 + 6), py(P) + 4]; };
  function draw() {
    const moved = Math.abs(k) > 0.001;
    q('c').setAttribute('points', line(k)); q('c0').setAttribute('points', line(0)); q('c0').style.display = moved ? '' : 'none';
    const [x, y] = labAt(k), [x0, y0] = labAt(0);
    q('l').setAttribute('x', x); q('l').setAttribute('y', y); q('l').textContent = moved ? name + '2' : name;
    q('l0').setAttribute('x', x0); q('l0').setAttribute('y', y0); q('l0').textContent = moved ? name + '1' : '';
  }
  const dot = (P, kk, tag) => { const x = px(Q(P, kk)), y = py(P);
    return `<polyline class="dg-guide dg-new" points="${X0},${y} ${x},${y} ${x},${Y0}"/><circle class="dg-eq" cx="${x}" cy="${y}" r="6"/>
      <text class="dg-tick" x="${X0 - 6}" y="${y + 4}" text-anchor="end">${tag ? 'P' + tag : P + 'k'}</text><text class="dg-tick" x="${x}" y="${Y0 + 32}" text-anchor="middle">${tag ? 'Q' + tag : Q(P, kk)}</text>`; };
  /** Mark the point at price P (an arrow from the last point shows the movement along the curve). Returns the quantity. */
  function at(P) {
    const from = last; last = P;
    q('pt').innerHTML = dot(P, k);
    q('mv').innerHTML = from != null && from !== P ? `<line class="dg-mvline" x1="${px(Q(from, k))}" y1="${py(from)}" x2="${px(Q(P, k))}" y2="${py(P)}" marker-end="url(#${uid}a)"/><circle class="dg-faint dg-eq" cx="${px(Q(from, k))}" cy="${py(from)}" r="4"/>` : '';
    return Q(P, k);
  }
  function shift(dir, animate = true) {
    cancelAnimationFrame(raf); q('pt').innerHTML = ''; q('mv').innerHTML = ''; last = null;
    if (!dir) {   // a movement along the curve: the price rises from 40 to 50
      k = 0; draw();
      q('pt').innerHTML = dot(50, 0, 2) + `<circle class="dg-faint dg-eq" cx="${px(Q(40))}" cy="${py(40)}" r="5"/>`;
      q('mv').innerHTML = `<line class="dg-mvline" x1="${px(Q(40))}" y1="${py(40)}" x2="${px(Q(50))}" y2="${py(50)}" marker-end="url(#${uid}a)"/>
        <text class="dg-mvlab" x="${px(Q(50)) + (D ? 10 : -10)}" y="${py(50) - 10}" text-anchor="${D ? 'start' : 'end'}">${D ? 'Contraction' : 'Extension'}</text>`;
      return;
    }
    const from = k, to = dir;
    if (!animate || matchMedia('(prefers-reduced-motion: reduce)').matches) { k = to; draw(); return; }
    const t0 = performance.now();
    const step = now => { const t = Math.min(1, (now - t0) / 750); k = from + (to - from) * (1 - Math.pow(1 - t, 3)); draw(); if (t < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }
  draw();
  return { at, shift, reset: () => { k = 0; last = null; q('pt').innerHTML = ''; q('mv').innerHTML = ''; draw(); } };
}

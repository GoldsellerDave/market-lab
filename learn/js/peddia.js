// 2.6 diagrams as SVG strings: the five kinds of PED (one demand curve each) and the total revenue boxes.
// Colours come from the app's CSS variables (--d demand, --ink text, --acc accent), so dark mode follows.
const W = 320, H = 260, X0 = 44, Y0 = 222, X1 = 300, Y1 = 22;
const axes = (xl, yl) => `<line x1="${X0}" y1="${Y1 - 6}" x2="${X0}" y2="${Y0}" stroke="var(--ink)" stroke-width="2"/><line x1="${X0}" y1="${Y0}" x2="${X1 + 6}" y2="${Y0}" stroke="var(--ink)" stroke-width="2"/>
  <text x="${X0 + 8}" y="${Y1 + 2}" text-anchor="start" font-size="13" fill="var(--ink)">${yl}</text><text x="${X1 + 4}" y="${Y0 + 20}" text-anchor="end" font-size="13" fill="var(--ink)">${xl}</text>
  <text x="${X0 - 6}" y="${Y0 + 16}" text-anchor="end" font-size="12" fill="var(--ink)">0</text>`;
const svg = (label, inner) => `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}" class="peddia" style="width:100%;height:auto;max-width:420px">${inner}</svg>`;
const D = (d, extra = '') => `<path d="${d}" fill="none" stroke="var(--d)" stroke-width="4" stroke-linecap="round" ${extra}/>`;
const lab = (x, y, t) => `<text x="${x}" y="${y}" font-size="15" font-weight="700" fill="var(--d)">${t}</text>`;

// key -> [title, PED, what it means, example, drawing]
export const PED_SHAPES = {
  pi: ['Perfectly inelastic', 'PED = 0', 'Quantity demanded does not change at all when the price changes. The curve is vertical.', 'Close to it: a life-saving medicine.',
    () => D(`M 170 ${Y1 + 8} L 170 ${Y0 - 4}`) + lab(178, Y1 + 24, 'D')],
  in: ['Inelastic', 'PED between 0 and −1', 'Quantity demanded changes by a SMALLER % than the price. The curve is drawn steep.', 'Petrol, rice, electricity, cigarettes.',
    () => D(`M 140 ${Y1 + 8} L 210 ${Y0 - 6}`) + lab(214, Y0 - 12, 'D')],
  un: ['Unitary elastic', 'PED = −1', 'Quantity demanded changes by the SAME % as the price. Total revenue is the same at every price, so the curve bends.', 'In between: no common everyday example.',
    () => D(`M ${X0 + 22} ${Y1 + 6} C ${X0 + 40} ${Y0 - 40}, ${X0 + 90} ${Y0 - 20}, ${X1 - 6} ${Y0 - 14}`) + lab(X1 - 22, Y0 - 24, 'D')],
  el: ['Elastic', 'PED more than 1 (e.g. −2)', 'Quantity demanded changes by a BIGGER % than the price. The curve is drawn flat.', 'One brand of bubble tea, cinema tickets, holidays.',
    () => D(`M ${X0 + 10} 90 L ${X1 - 6} 160`) + lab(X1 - 20, 150, 'D')],
  pe: ['Perfectly elastic', 'PED is infinite', 'At any price above this one, quantity demanded falls to zero. The curve is horizontal.', 'Close to it: one farmer selling rice at a higher price than everyone else.',
    () => D(`M ${X0 + 4} 120 L ${X1 - 4} 120`) + lab(X1 - 20, 110, 'D')]
};
export const pedCurveSVG = k => svg(`Demand curve: ${PED_SHAPES[k][0]}`, axes('Quantity', 'Price') + PED_SHAPES[k][4]());

// Total revenue boxes. Two goods with the same starting point (100k, 400) and the same 20% price cut.
export const REV_GOODS = {
  el: { name: 'Cinema tickets (elastic demand)', P: [100, 80], Q: [400, 600], q: P => 400 + (100 - P) * 10 },
  in: { name: 'Rice (inelastic demand)', P: [100, 80], Q: [400, 440], q: P => 400 + (100 - P) * 2 }
};
const px = Q => X0 + (Q / 700) * (X1 - X0), py = P => Y0 - (P / 120) * (Y0 - Y1);
export const revM = (k, i) => (REV_GOODS[k].P[i] * REV_GOODS[k].Q[i]) / 1000;   // million đồng
export function revenueSVG(k, i) {
  const G = REV_GOODS[k], top = 118, bot = k === 'el' ? 70 : 40;
  const box = j => { const x = px(G.Q[j]), y = py(G.P[j]);
    return `<rect x="${X0}" y="${y}" width="${x - X0}" height="${Y0 - y}" ${j === i ? 'fill="var(--orange)" fill-opacity=".28" stroke="var(--orange)" stroke-width="2"' : 'fill="none" stroke="var(--ink)" stroke-opacity=".45" stroke-dasharray="5 4"'}/>`; };
  // quantity labels: when the two quantities are close (rice: 400 and 440), push them apart so they do not overlap
  const close = Math.abs(px(G.Q[1]) - px(G.Q[0])) < 34, qa = j => (close ? (G.Q[j] < G.Q[1 - j] ? 'end' : 'start') : 'middle');
  const ticks = [0, 1].map(j => `<text x="${X0 - 6}" y="${py(G.P[j]) + 4}" text-anchor="end" font-size="12" fill="var(--ink)">${G.P[j]}</text>
    <text x="${px(G.Q[j]) + (close ? (qa(j) === 'end' ? -3 : 3) : 0)}" y="${Y0 + 16}" text-anchor="${qa(j)}" font-size="12" fill="var(--ink)">${G.Q[j]}</text>`).join('');
  const x = px(G.Q[i]), y = py(G.P[i]);
  return svg(`${G.name}: total revenue at a price of ${G.P[i]} thousand đồng`, axes('Quantity', 'Price (thousand đồng)') + box(1 - i) + box(i)
    + D(`M ${px(G.q(top))} ${py(top)} L ${px(G.q(bot))} ${py(bot)}`) + lab(px(G.q(bot)) + 4, py(bot) - 4, 'D') + ticks
    + `<circle cx="${x}" cy="${y}" r="6" fill="var(--d)"/><text x="${(X0 + x) / 2}" y="${(y + Y0) / 2 + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="var(--ink)">${revM(k, i)} million</text>`);
}

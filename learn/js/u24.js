// 2.4 Price determination (Cambridge 0455, exams 2027-2029): price mechanism, market equilibrium, disequilibrium.
// Content as data. Levels: 0 Core, 1 Stretch, 2 Challenge. Every wrong option names the misconception ("trap") it shows.

export const TRAPS = {
  'eq-def': { label: 'What equilibrium means', tip: 'Equilibrium is the price where quantity demanded EQUALS quantity supplied. Look for the row where the two numbers are the same.' },
  'shortage-surplus': { label: 'Shortage or surplus?', tip: 'Shortage: quantity demanded is MORE than quantity supplied (price below equilibrium). Surplus: quantity supplied is MORE than quantity demanded (price above equilibrium).' },
  'price-pressure': { label: 'Which way the price moves', tip: 'A shortage pushes the price UP (buyers compete). A surplus pushes the price DOWN (sellers cut prices to sell stock).' },
  'gap-calc': { label: 'Size of the gap', tip: 'The size of a shortage or surplus is the DIFFERENCE: quantity demanded minus quantity supplied (or the other way round). Not one number on its own.' },
  'market-sum': { label: 'Adding up market demand', tip: 'Market demand = the demand of ALL buyer groups added together at each price.' },
  'price-mechanism': { label: 'What, how and for whom', tip: 'Prices answer three questions: WHAT to produce (firms make what earns more), HOW (firms use the cheaper resources) and FOR WHOM (those willing and able to pay).' },
  'move-vs-shift': { label: 'Movement vs shift', tip: 'When the price moves towards equilibrium, buyers and sellers move ALONG the curves (extensions and contractions). The curves do not shift.' }
};

export const VI = { equilibrium: 'cân bằng', disequilibrium: 'mất cân bằng', shortage: 'thiếu hụt', surplus: 'dư thừa', 'price mechanism': 'cơ chế giá', 'quantity demanded': 'lượng cầu', 'quantity supplied': 'lượng cung', schedule: 'biểu (bảng)', extension: 'mở rộng', contraction: 'thu hẹp' };

// ---------- Learn ----------
// The explorer and schedule cards use one market: mangoes, price in thousand VND per kg. Qd = 1050 − 15P, Qs = 15P; equilibrium 35k, 525 kg.
export const LEARN_MARKET = { good: 'Mangoes at a city market', unit: 'kg a day', priceUnit: 'thousand VND per kg', prices: [20, 25, 30, 35, 40, 45, 50], qd: P => 1050 - 15 * P, qs: P => 15 * P, pe: 35 };
export const LEARN = [
  { id: 'eq', title: 'Equilibrium', kind: 'explorer',
    text: 'Drag the price. At most prices, buyers and sellers want different amounts. At ONE price they want the same amount: the [[equilibrium price]].' },
  { id: 'schedule', title: 'Reading a schedule', kind: 'schedule',
    text: 'A demand and supply [[schedule]] is a table. To find [[equilibrium]], find the row where [[quantity demanded]] = [[quantity supplied]].' },
  { id: 'gap', title: 'Shortage and surplus', kind: 'explorer', market: true,
    text: 'Set a price away from [[equilibrium]], then press “Let the market work”. Watch how a [[shortage]] or a [[surplus]] pushes the price back to equilibrium.' },
  { id: 'mechanism', title: 'The price mechanism', kind: 'rows',
    text: 'In a [[market]], the [[price mechanism]] answers the three basic questions without anyone in charge.',
    rows: [['WHAT to produce?', 'If buyers pay more for bubble tea, making it earns more, so firms make more bubble tea and less of other things.'],
      ['HOW to produce?', 'If wages rise but machines get cheaper, firms use more machines: the cheaper way to produce.'],
      ['FOR WHOM?', 'Goods go to the people willing and able to pay the market price.']] },
  { id: 'method', title: 'The 4-step method', kind: 'method',
    steps: ['Find the price you are asked about.', 'Compare quantity demanded and quantity supplied at that price.', 'Equal = equilibrium. Qd bigger = shortage. Qs bigger = surplus. Size = the difference.', 'Say what happens next: shortage → price rises; surplus → price falls, until Qd = Qs.'],
    frame: 'At a price of [P], quantity demanded is [Qd] and quantity supplied is [Qs], so there is a [shortage / surplus] of [difference]. [Buyers compete / Sellers cut prices], so the price [rises / falls]. Quantity demanded [contracts / extends] and quantity supplied [extends / contracts] until the market reaches equilibrium at [Pe].' }
];

// ---------- Equilibrium finder: generated schedules ----------
export function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const GOODS = [
  { good: 'Bubble tea', unit: 'cups a day', priceUnit: 'thousand VND', base: 20, step: 5 },
  { good: 'Mangoes', unit: 'kg a day', priceUnit: 'thousand VND per kg', base: 30, step: 10 },
  { good: 'Cinema tickets', unit: 'tickets a week', priceUnit: 'thousand VND', base: 60, step: 10 },
  { good: 'Phone cases', unit: 'cases a week', priceUnit: 'thousand VND', base: 50, step: 25 },
  { good: 'Bánh mì', unit: 'a day', priceUnit: 'thousand VND', base: 15, step: 5 },
  { good: 'Football shirts', unit: 'shirts a month', priceUnit: 'thousand VND', base: 150, step: 50 }
];
const GROUPS = [['Students', 'Office workers'], ['Tourists', 'Local people'], ['Teenagers', 'Adults']];
export const EQ_KINDS = { 'eq-find': 0, 'eq-dia': 0, 'eq-gap': 1, 'eq-read': 1, 'eq-market': 2 };
export const EQ_TITLES = { 'eq-find': 'Find the equilibrium in a schedule', 'eq-dia': 'Read a price on a diagram', 'eq-gap': 'Shortage or surplus, and how big', 'eq-read': 'Find the price with a surplus', 'eq-market': 'Add up market demand' };
const pick = (r, a) => a[Math.floor(r() * a.length)];
const uniq = opts => { const seen = new Set(); return opts.filter(o => { const k = String(o.v); if (seen.has(k)) return false; seen.add(k); return true; }); };
const fmt = n => n.toLocaleString('en-US');

/** A schedule: 5 prices, equilibrium at row e (1 to 3); Qd falls and Qs rises with price, by different steps */
export function schedule(r) {
  const g = pick(r, GOODS), e = 1 + Math.floor(r() * 3);
  const qe = 160 + 20 * Math.floor(r() * 13);
  let a = pick(r, [20, 30, 40, 50]); while (a > 20 && qe - a * (4 - e) < 60) a -= 10;   // keep demand at the top price at least 60
  let b = pick(r, [20, 30, 40, 50]); if (b === a) b = a === 50 ? 30 : a + 10;
  while (b > 20 && qe - b * e < 60) b -= 10; if (b === a) b = a + 10 <= 50 && qe - (a + 10) * e >= 60 ? a + 10 : a - 10;   // supply at the lowest price at least 60
  const prices = [0, 1, 2, 3, 4].map(i => g.base + g.step * i);
  const qd = prices.map((_, i) => qe + a * (e - i)), qs = prices.map((_, i) => qe - b * (e - i));
  return { ...g, prices, qd, qs, e, qe, pe: prices[e] };
}
/** Generate one Equilibrium finder item of a kind from a seed. Steps are choice or number questions. */
export function genEq(kind, seed) {
  const r = rng(seed), s = schedule(r), lvl = EQ_KINDS[kind], P = p => `${fmt(p)}k`;
  const it = { id: kind, seed, level: lvl, kind, ...s, title: EQ_TITLES[kind] };
  const typeOpts = [{ t: 'A shortage', v: 'shortage' }, { t: 'A surplus', v: 'surplus' }, { t: 'Equilibrium', v: 'eq' }];
  const dirOpts = [{ t: '↑ The price rises', v: 'up' }, { t: '↓ The price falls', v: 'down' }, { t: 'The price stays the same', v: 'same' }];
  if (kind === 'eq-find') {
    it.table = true;
    it.steps = [
      { q: 'What is the equilibrium price?', type: 'choice', answer: s.pe, options: s.prices.map(p => ({ t: P(p), v: p, trap: 'eq-def' })), why: `At ${P(s.pe)}, quantity demanded = quantity supplied = ${fmt(s.qe)}.` },
      { q: 'What is the equilibrium quantity?', type: 'choice', answer: s.qe,
        options: uniq([{ t: fmt(s.qe), v: s.qe }, { t: fmt(s.qd[0]), v: s.qd[0], trap: 'eq-def' }, { t: fmt(s.qs[4]), v: s.qs[4], trap: 'eq-def' }, { t: fmt(2 * s.qe), v: 2 * s.qe, trap: 'eq-def' }]),
        why: `The equilibrium quantity is the amount bought and sold at equilibrium: ${fmt(s.qe)} ${s.unit}.` }];
    it.hint = 'Look along each row. Where are the two quantities the same?';
    it.why = `Equilibrium is where Qd = Qs: ${P(s.pe)} and ${fmt(s.qe)} ${s.unit}.`;
  }
  if (kind === 'eq-gap' || kind === 'eq-dia') {
    let i = Math.floor(r() * 4); if (i >= s.e) i++;   // any row except equilibrium
    const short = s.qd[i] > s.qs[i], gap = Math.abs(s.qd[i] - s.qs[i]);
    it.at = i; it.atPrice = s.prices[i]; it.table = kind === 'eq-gap';
    it.y = kind === 'eq-dia' ? (short ? 0.3 : 0.7) - 0.05 + 0.1 * r() : null;
    it.steps = [
      { q: kind === 'eq-dia' ? 'At the price P shown on the diagram, what is there?' : `At ${P(s.prices[i])}, what is there?`, type: 'choice', answer: short ? 'shortage' : 'surplus',
        options: typeOpts.map(o => ({ ...o, trap: o.v === 'eq' ? 'eq-def' : 'shortage-surplus' })),
        why: kind === 'eq-dia' ? (short ? 'P is below equilibrium: quantity demanded (Qd) is more than quantity supplied (Qs). That is a shortage.' : 'P is above equilibrium: quantity supplied (Qs) is more than quantity demanded (Qd). That is a surplus.')
          : `Qd = ${fmt(s.qd[i])} and Qs = ${fmt(s.qs[i])}. ${short ? 'Qd is bigger: a shortage.' : 'Qs is bigger: a surplus.'}` }];
    if (kind === 'eq-gap') it.steps.push({ q: `How big is the ${short ? 'shortage' : 'surplus'}?`, type: 'number', answer: gap, unit: s.unit, trap: 'gap-calc',
      why: `${short ? `${fmt(s.qd[i])} − ${fmt(s.qs[i])}` : `${fmt(s.qs[i])} − ${fmt(s.qd[i])}`} = ${fmt(gap)}.` });
    it.steps.push({ q: 'What will happen to the price next?', type: 'choice', answer: short ? 'up' : 'down', options: dirOpts.map(o => ({ ...o, trap: 'price-pressure' })),
      why: short ? 'Buyers compete for the few goods, so the price rises.' : 'Sellers cut the price to sell the unsold goods, so the price falls.' });
    if (kind === 'eq-dia') it.steps.push({ q: 'As the price moves, what happens to quantity demanded?', type: 'choice', answer: short ? 'contract' : 'extend',
      options: [{ t: 'It contracts (falls): a movement along the demand curve', v: 'contract', trap: 'price-pressure' }, { t: 'It extends (rises): a movement along the demand curve', v: 'extend', trap: 'price-pressure' }, { t: 'The demand curve shifts', v: 'shift', trap: 'move-vs-shift' }],
      why: short ? 'The price rises, so buyers move up along the demand curve: a contraction of demand. Supply extends at the same time.' : 'The price falls, so buyers move down along the demand curve: an extension of demand. Supply contracts at the same time.' });
    it.hint = kind === 'eq-dia' ? 'Is P above or below the point where the curves cross? Compare Qd and Qs at P.' : 'Compare the two quantities at that price. Which is bigger?';
    it.why = short ? 'Below equilibrium there is a shortage, so the price rises until Qd = Qs.' : 'Above equilibrium there is a surplus, so the price falls until Qd = Qs.';
  }
  if (kind === 'eq-read') {
    const above = [3, 4].filter(i => i > s.e).concat(s.e < 3 ? [] : [4]); const i = above.length ? pick(r, above) : 4;
    const gap = s.qs[i] - s.qd[i];
    it.table = true; it.at = null;
    it.steps = [{ q: `At which price is there a surplus of ${fmt(gap)}?`, type: 'choice', answer: s.prices[i],
      options: s.prices.map((p, k) => ({ t: P(p), v: p, trap: k < s.e ? 'shortage-surplus' : 'gap-calc' })), why: `At ${P(s.prices[i])}: Qs ${fmt(s.qs[i])} − Qd ${fmt(s.qd[i])} = ${fmt(gap)}. Supply is bigger, so it is a surplus.` },
      { q: `At that price, what will happen to the price next?`, type: 'choice', answer: 'down', options: dirOpts.map(o => ({ ...o, trap: 'price-pressure' })), why: 'A surplus: sellers cut the price to sell their stock.' }];
    it.hint = 'A surplus is above equilibrium, where quantity supplied is bigger. Work out Qs − Qd for each row.';
    it.why = `The surplus of ${fmt(gap)} is at ${P(s.prices[i])}.`;
  }
  if (kind === 'eq-market') {
    const [ga, gb] = pick(r, GROUPS);
    it.groups = [ga, gb];
    it.qa = s.qd.map(q => Math.min(q - 10, Math.max(10, Math.round((q * (0.35 + 0.3 * r())) / 10) * 10))); it.qb = s.qd.map((q, k) => q - it.qa[k]);
    let i = Math.floor(r() * 4); if (i >= s.e) i++;
    const short = s.qd[i] > s.qs[i], gap = Math.abs(s.qd[i] - s.qs[i]);
    it.table = true; it.market = true;
    it.steps = [
      { q: `What is MARKET demand at ${P(s.prices[i])}?`, type: 'number', answer: s.qd[i], unit: s.unit, trap: 'market-sum', why: `${ga} ${fmt(it.qa[i])} + ${gb} ${fmt(it.qb[i])} = ${fmt(s.qd[i])}.` },
      { q: 'What is the equilibrium price of the whole market?', type: 'choice', answer: s.pe, options: s.prices.map(p => ({ t: P(p), v: p, trap: 'market-sum' })),
        why: `Add the two groups at each price. Market demand = supply (${fmt(s.qe)}) at ${P(s.pe)}.` },
      { q: `At ${P(s.prices[i])}, how big is the ${short ? 'shortage' : 'surplus'} in the whole market?`, type: 'number', answer: gap, unit: s.unit, trap: 'gap-calc',
        why: `Market demand ${fmt(s.qd[i])} and supply ${fmt(s.qs[i])}: the difference is ${fmt(gap)}.` }];
    it.hint = 'First add the two buyer groups together at each price. Then compare with supply.';
    it.why = `Market demand is the sum of all buyers. Equilibrium is at ${P(s.pe)}, where market demand = supply.`;
  }
  return it;
}
/** Pick the kind for the next item at a level (rotates through the kinds at that level) */
export function nextEqKind(level, n) { const ks = Object.keys(EQ_KINDS).filter(k => EQ_KINDS[k] === level); return ks[n % ks.length]; }

// ---------- Paper 1 practice (MCQ). The right option is listed first; options are shuffled on screen. ----------
export const MCQ = [
  // Core
  { id: 'q4-def', level: 0, stem: 'What is market equilibrium?',
    options: [{ t: 'The point where quantity demanded equals quantity supplied' }, { t: 'The point where demand for the good is at its highest', trap: 'eq-def' }, { t: 'The point where the price is as low as it can go', trap: 'eq-def' }, { t: 'The point where sellers make the most profit', trap: 'eq-def' }],
    hint: 'Equilibrium means balance. What is balanced?', explain: 'Market equilibrium is where the quantity buyers want equals the quantity sellers want to sell, so there is no shortage or surplus.' },
  { id: 'q4-below', level: 0, stem: 'The price of a good is BELOW its equilibrium price. What exists in the market?',
    options: [{ t: 'A shortage' }, { t: 'A surplus', trap: 'shortage-surplus' }, { t: 'Equilibrium', trap: 'eq-def' }, { t: 'A fall in demand', trap: 'move-vs-shift' }],
    hint: 'A low price: do buyers want more or less? Do sellers offer more or less?', explain: 'Below equilibrium, quantity demanded is greater than quantity supplied: a shortage.' },
  { id: 'q4-surplus-next', level: 0, stem: 'There is a surplus of mangoes at the current price. What is likely to happen?',
    options: [{ t: 'The price falls' }, { t: 'The price rises', trap: 'price-pressure' }, { t: 'The demand curve shifts to the right', trap: 'move-vs-shift' }, { t: 'The supply curve shifts to the right', trap: 'move-vs-shift' }],
    hint: 'Sellers have mangoes they cannot sell. What do they do?', explain: 'Sellers cut the price to sell their unsold stock. The price falls towards equilibrium.' },
  { id: 'q4-schedule', level: 0, stem: 'Price $2: Qd 50, Qs 20. Price $3: Qd 40, Qs 40. Price $4: Qd 30, Qs 60. What is the equilibrium price?',
    options: [{ t: '$3' }, { t: '$2', trap: 'eq-def' }, { t: '$4', trap: 'eq-def' }, { t: '$2.50', trap: 'eq-def' }],
    hint: 'Find the price where the two quantities are the same.', explain: 'At $3, quantity demanded (40) = quantity supplied (40).' },
  { id: 'q4-shortage-def', level: 0, stem: 'What is a shortage?',
    options: [{ t: 'Quantity demanded is greater than quantity supplied' }, { t: 'Quantity supplied is greater than quantity demanded', trap: 'shortage-surplus' }, { t: 'The demand curve has shifted to the left', trap: 'move-vs-shift' }, { t: 'Firms have stopped producing the good', trap: 'shortage-surplus' }],
    hint: 'A shortage = not enough for everyone who wants to buy.', explain: 'A shortage means buyers want more than sellers offer at the current price.' },
  { id: 'q4-what', level: 0, stem: 'Consumers pay more for electric scooters, so firms make more of them. Which basic question is the price mechanism answering?',
    options: [{ t: 'What to produce' }, { t: 'How to produce', trap: 'price-mechanism' }, { t: 'For whom to produce', trap: 'price-mechanism' }, { t: 'Where to produce', trap: 'price-mechanism' }],
    hint: 'Firms are choosing WHICH goods to make.', explain: 'Higher prices signal what consumers want, so resources move to making more of it: WHAT to produce.' },
  // Stretch
  { id: 'q4-gap', level: 1, stem: 'At a price of $5, quantity demanded is 120 and quantity supplied is 80. What is the situation?',
    options: [{ t: 'A shortage of 40' }, { t: 'A surplus of 40', trap: 'shortage-surplus' }, { t: 'A shortage of 200', trap: 'gap-calc' }, { t: 'A shortage of 120', trap: 'gap-calc' }],
    hint: 'Which is bigger? Then find the difference.', explain: 'Qd (120) is more than Qs (80): a shortage of 120 − 80 = 40.' },
  { id: 'q4-forwhom', level: 1, stem: 'How does the price mechanism decide FOR WHOM goods are produced?',
    options: [{ t: 'Goods go to those willing and able to pay the price' }, { t: 'The government decides who receives the goods', trap: 'price-mechanism' }, { t: 'Firms choose the customers they like best to sell to', trap: 'price-mechanism' }, { t: 'Everyone receives an equal amount of the good', trap: 'price-mechanism' }],
    hint: 'In a market, who gets the good?', explain: 'In a market system, goods go to the people who are willing and able to pay the market price.' },
  { id: 'q4-how', level: 1, stem: 'Wages rise while the price of machines falls. Using the price mechanism, how are firms likely to respond?',
    options: [{ t: 'Use more machines and fewer workers' }, { t: 'Hire more workers and use fewer machines', trap: 'price-mechanism' }, { t: 'Stop producing the good completely', trap: 'price-mechanism' }, { t: 'Ask the government which method to use', trap: 'price-mechanism' }],
    hint: 'Firms choose the cheaper way to produce.', explain: 'Relative prices tell firms HOW to produce: machines are now cheaper than workers, so firms use more machines.' },
  { id: 'q4-dia-above', level: 1, stem: 'On a demand and supply diagram, the price is above the point where the curves cross. What does the horizontal gap between the curves at that price show?',
    options: [{ t: 'A surplus' }, { t: 'A shortage', trap: 'shortage-surplus' }, { t: 'The equilibrium quantity', trap: 'eq-def' }, { t: 'The total spending of consumers', trap: 'gap-calc' }],
    hint: 'Above equilibrium, which curve is further to the right?', explain: 'Above equilibrium, the supply curve is further right than the demand curve: quantity supplied > quantity demanded, a surplus.' },
  { id: 'q4-signal', level: 1, stem: 'A popular toy runs short before Tết. How does the price mechanism remove the shortage?',
    options: [{ t: 'The price rises: quantity demanded contracts and quantity supplied extends' }, { t: 'The price falls until every buyer who wants one can buy one', trap: 'price-pressure' }, { t: 'The government orders firms to make more until the shortage ends', trap: 'price-mechanism' }, { t: 'The demand curve shifts to the left until the shortage ends', trap: 'move-vs-shift' }],
    hint: 'A shortage pushes the price which way? Then what do buyers and sellers do?', explain: 'Buyers compete, the price rises, buyers move up along demand (contraction) and sellers along supply (extension) until Qd = Qs.' },
  { id: 'q4-diseq', level: 1, stem: 'Which situation shows market DISequilibrium?',
    options: [{ t: 'At 30k: quantity demanded 200, quantity supplied 260' }, { t: 'At 30k: quantity demanded 200, quantity supplied 200', trap: 'eq-def' }, { t: 'The price is high but quantity demanded equals quantity supplied', trap: 'eq-def' }, { t: 'There are many buyers and many sellers', trap: 'eq-def' }],
    hint: 'Disequilibrium: the two quantities are NOT equal.', explain: 'Disequilibrium is any price where Qd and Qs differ. 200 and 260 are different: a surplus of 60.' },
  // Challenge
  { id: 'q4-market', level: 2, stem: 'Two groups buy bánh mì. At 20k, students demand 300 and workers demand 200. Supply at 20k is 450. What is there at 20k?',
    options: [{ t: 'A shortage of 50' }, { t: 'A surplus of 150', trap: 'market-sum' }, { t: 'A surplus of 250', trap: 'market-sum' }, { t: 'Equilibrium', trap: 'eq-def' }],
    hint: 'Market demand = students + workers.', explain: 'Market demand = 300 + 200 = 500. Supply is 450, so there is a shortage of 50.' },
  { id: 'q4-traded', level: 2, stem: 'At 40k: Qd 500, Qs 300. At 50k: Qd 400, Qs 400. The price starts at 40k. What happens?',
    options: [{ t: 'The price rises to 50k and the quantity bought and sold rises from 300 to 400' }, { t: 'The price falls and the quantity bought and sold rises', trap: 'price-pressure' }, { t: 'The price rises to 50k and the quantity bought and sold falls from 500 to 400', trap: 'gap-calc' }, { t: 'The price rises and quantity supplied falls', trap: 'price-pressure' }],
    hint: 'At 40k, only 300 can be bought, because sellers only offer 300.', explain: 'At 40k there is a shortage and only 300 are sold. The price rises to 50k, where 400 are bought and sold.' },
  { id: 'q4-why-not', level: 2, stem: 'Why does a surplus not usually last long in a free market?',
    options: [{ t: 'Sellers cut prices: quantity demanded extends and quantity supplied contracts' }, { t: 'Buyers offer higher prices, so sellers can sell all their stock', trap: 'price-pressure' }, { t: 'The government buys the surplus, so the price stays the same', trap: 'price-mechanism' }, { t: 'The demand curve shifts to the right by itself until the surplus ends', trap: 'move-vs-shift' }],
    hint: 'Who has a problem in a surplus, and what do they do?', explain: 'With unsold stock, sellers cut prices. Buyers buy more (extension), sellers offer less (contraction) until Qd = Qs.' },
  { id: 'q4-clears', level: 2, stem: 'The equilibrium price is best described as the price at which…',
    options: [{ t: 'the market clears, with no shortage and no surplus' }, { t: 'every seller makes a profit on each good it sells', trap: 'eq-def' }, { t: 'everyone who wants the good can afford to buy it', trap: 'price-mechanism' }, { t: 'quantity supplied is at its highest possible level', trap: 'eq-def' }],
    hint: '“The market clears” means everything offered is bought.', explain: 'At equilibrium, everything sellers offer is bought: the market clears.' },
  { id: 'q4-ration', level: 2, stem: 'A shortage of rambutan pushes its price up. Which role is the price playing?',
    options: [{ t: 'Rationing: only buyers willing and able to pay more get it' }, { t: 'A tax: rambutan buyers pay extra money to the government', trap: 'price-mechanism' }, { t: 'A shift: the demand curve for rambutan moves to the left', trap: 'move-vs-shift' }, { t: 'A government decision about which families receive rambutan', trap: 'price-mechanism' }],
    hint: 'A higher price decides who gets the scarce rambutan.', explain: 'The higher price rations the scarce good: it goes to those willing and able to pay. It also signals farmers to supply more.' },
  { id: 'q4-moves', level: 2, stem: 'A surplus exists. As the price falls towards equilibrium, which happens?',
    options: [{ t: 'An extension of demand and a contraction of supply' }, { t: 'An increase in demand (the curve shifts right)', trap: 'move-vs-shift' }, { t: 'A contraction of demand and an extension of supply', trap: 'price-pressure' }, { t: 'A decrease in supply (the curve shifts left)', trap: 'move-vs-shift' }],
    hint: 'A falling price moves buyers and sellers ALONG the curves.', explain: 'A lower price makes buyers buy more (extension of demand) and sellers offer less (contraction of supply). No curve shifts.' }
];

// ---------- Data response (Paper 2 style) ----------
export const DATA = {
  id: 'dr-rambutan', title: 'Rambutan at the Tết market',
  source: ['Before Tết, rambutan sellers at a market in Đồng Nai sell to families and to restaurants. The table shows the market demand and supply schedule for one week.',
    'One seller said: “If we charge too much, we take fruit home at the end of the day. If we charge too little, it is gone by 9 a.m.”'],
  table: { head: ['Price (thousand VND per kg)', 'Quantity demanded (kg)', 'Quantity supplied (kg)'],
    rows: [['20', '900', '300'], ['30', '750', '450'], ['40', '600', '600'], ['50', '450', '750'], ['60', '300', '900']] },
  questions: [
    { id: 'a', marks: 1, type: 'calc', q: 'Identify the equilibrium price of rambutan.', answer: 40, tol: 0, unit: 'thousand VND per kg',
      hint: 'Find the row where quantity demanded = quantity supplied.', why: 'At 40 thousand VND, quantity demanded = quantity supplied = 600 kg.', trap: 'eq-def' },
    { id: 'b', marks: 2, type: 'calc', q: 'Calculate the shortage at a price of 30 thousand VND per kg.', answer: 300, tol: 0, unit: 'kg',
      hint: 'Shortage = quantity demanded − quantity supplied at that price.', why: '750 − 450 = 300 kg.', trap: 'gap-calc' },
    { id: 'c', marks: 2, type: 'priceline', q: 'Move the price line to 60 thousand VND, then identify what the gap between the curves shows.', prices: [20, 30, 40, 50, 60], pe: 40, target: 60, answer: 'surplus',
      hint: '60 is above equilibrium. Which curve is further right there?', why: 'At 60 thousand VND, quantity supplied (900) is more than quantity demanded (300): a surplus of 600 kg.', trap: 'shortage-surplus' },
    { id: 'd', marks: 4, type: 'short', q: 'Explain what will happen in this market if sellers charge 60 thousand VND per kg.',
      groups: [{ label: 'surplus at 60k', k: ['surplus', 'excess supply', 'supply is greater', 'supply is more', 'more than demand', 'unsold', 'take fruit home', 'left over'], ask: 'Is there a shortage or a surplus at 60k? How do you know?', trap: 'shortage-surplus' },
        { label: 'price falls', k: ['price fall', 'price falls', 'price will fall', 'lower the price', 'lower price', 'cut the price', 'cut price', 'price decrease', 'reduce the price', 'price drops', 'price goes down', 'decrease the price'], ask: 'What do sellers do with unsold rambutan?', trap: 'price-pressure' },
        { label: 'Qd extends / Qs contracts', k: ['extension', 'extend', 'quantity demanded rise', 'quantity demanded increase', 'buy more', 'contraction', 'contract', 'supply less', 'quantity supplied fall', 'quantity supplied decrease', 'demand more'], ask: 'As the price falls, what happens to quantity demanded and quantity supplied?', trap: 'move-vs-shift' },
        { label: 'until equilibrium (40k, 600 kg)', k: ['equilibrium', '40', '600', 'until', 'equal', 'clears'], ask: 'Where does the price stop falling?', trap: 'eq-def' }, { label: 'unsold fruit / sellers compete', k: ['compete', 'unsold', 'left over', 'cannot sell', 'can\'t sell', 'waste'], ask: 'What problem do sellers have?' }, { label: 'surplus disappears', k: ['surplus disappears', 'no surplus', 'clears', 'no longer', 'eliminat', 'surplus is gone'], ask: 'What happens to the surplus in the end?' }],
      need: 4, frame: 'At 60 thousand VND there is a … of … kg, because quantity supplied is … than quantity demanded. Sellers … the price. Quantity demanded … and quantity supplied … until the market reaches equilibrium at …',
      hint: 'Use the 4 steps: surplus or shortage → what sellers do → what buyers and sellers do → where it stops.',
      why: 'At 60 thousand VND there is a surplus of 600 kg (900 supplied, 300 demanded). Sellers cut the price to sell their fruit. As the price falls, quantity demanded extends and quantity supplied contracts, until the market reaches equilibrium at 40 thousand VND and 600 kg.' }
  ]
};

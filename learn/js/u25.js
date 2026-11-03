// 2.5 Price changes: content as data. Levels: 0 Core, 1 Stretch, 2 Challenge.
// Misconception tags ("traps") are listed in TRAPS; every wrong option names the trap it shows.
// MCQ rule: the right option is listed first in the data; options are shuffled on screen.

export const TRAPS = {
  'move-vs-shift': { label: 'Movement vs shift', tip: 'A change in the good’s OWN price moves along the curve. Anything else shifts the whole curve.' },
  'd-vs-s': { label: 'Demand or supply?', tip: 'Buyers’ reasons (income, tastes, other goods’ prices) move demand. Sellers’ reasons (costs, technology, weather, taxes) move supply.' },
  'direction': { label: 'Left or right?', tip: 'More at every price = shift RIGHT. Less at every price = shift LEFT. A supply decrease is a shift left, even though it looks “up”.' },
  'pq-link': { label: 'Price and quantity', tip: 'Demand shifts: price and quantity move the SAME way. Supply shifts: price and quantity move OPPOSITE ways.' },
  'related-goods': { label: 'Substitutes and complements', tip: 'Substitute gets dearer → demand for this good rises. Complement gets dearer → demand for this good falls.' },
  'tax-subsidy': { label: 'Taxes and subsidies', tip: 'A tax on producers raises costs: supply shifts left. A subsidy lowers costs: supply shifts right.' },
  'shortage-surplus': { label: 'Shortage or surplus?', tip: 'Price below equilibrium → shortage → price rises. Price above → surplus → price falls.' },
  'two-shifts': { label: 'Two shifts at once', tip: 'When both curves shift, one of price or quantity is certain and the other “depends on which shift is bigger”.' }
};

export const VI = { demand: 'cầu', supply: 'cung', price: 'giá', quantity: 'lượng', equilibrium: 'cân bằng', shift: 'dịch chuyển', shortage: 'thiếu hụt', surplus: 'dư thừa', substitute: 'hàng thay thế', complement: 'hàng bổ sung', subsidy: 'trợ cấp', tax: 'thuế' };

// ---------- Learn ----------
export const LEARN = [
  { id: 'four', title: 'Four big changes', kind: 'four',
    text: 'Every price change starts with a shift of demand or supply. Tap a change to see what happens to price (P) and quantity (Q).' },
  { id: 'move', title: 'Shift or movement?', kind: 'move',
    text: 'If the good’s own price changes, we move along the curve (an extension or a contraction). If anything else changes, the whole curve shifts.',
    rows: [['Bubble tea price rises', 'Movement along the demand curve: quantity demanded falls'], ['Incomes rise', 'Demand curve shifts right'], ['Milk costs rise', 'Supply curve shifts left']] },
  { id: 'causes', title: 'What shifts each curve?', kind: 'causes',
    demand: ['Income', 'Tastes and fashion, advertising', 'Price of a substitute (tea vs coffee)', 'Price of a complement (petrol and motorbikes)', 'Population'],
    supply: ['Costs of production (wages, materials)', 'Technology', 'Weather and natural disasters', 'Taxes (left) and subsidies (right)', 'Number of firms'] },
  { id: 'method', title: 'The 4-step method', kind: 'method',
    steps: ['Which curve shifts: demand or supply?', 'Which way: left (less) or right (more)?', 'Find the new equilibrium.', 'Say what happens to price AND quantity.'],
    frame: 'The [event] causes [demand / supply] to [increase / decrease], so the curve shifts [left / right]. At the old price there is a [shortage / surplus], so the price [rises / falls] and the quantity [rises / falls].' },
  { id: 'two', title: 'Challenge: two shifts at once', kind: 'two',
    text: 'If demand AND supply shift, one effect is certain and the other depends on which shift is bigger.',
    rows: [['Demand right + supply left', 'Price rises for sure; quantity: it depends'], ['Demand right + supply right', 'Quantity rises for sure; price: it depends'], ['Demand left + supply right', 'Price falls for sure; quantity: it depends']] }
];

// ---------- Shift detective ----------
// curve: 'D' | 'S' | 'both' | 'none' ; dir: {D: 1|-1, S: 1|-1}; out: [{label, ans}] with ans 'up' | 'down' | 'same' | 'depends'
// trap: which trap a wrong choice at each step shows
export const SHIFTS = [
  // Core
  { id: 'sd-kpop', level: 0, market: 'Bubble tea', event: 'A famous K-pop star posts a video drinking bubble tea.', curve: 'D', dir: { D: 1 }, out: [{ label: 'Price', ans: 'up' }, { label: 'Quantity', ans: 'up' }],
    hint: 'Who changed: buyers or sellers? The video changes what buyers want.', why: 'Tastes changed, so demand shifts right. At the old price there is a shortage, so price rises and quantity rises.' },
  { id: 'sd-typhoon', level: 0, market: 'Durian', event: 'A typhoon destroys many durian farms in the Mekong Delta.', curve: 'S', dir: { S: -1 }, out: [{ label: 'Price', ans: 'up' }, { label: 'Quantity', ans: 'down' }],
    hint: 'The typhoon hits the farms, which are the sellers.', why: 'Weather cut what farmers can sell, so supply shifts left. Price rises and quantity falls.' },
  { id: 'sd-machine', level: 0, market: 'Coffee drinks', event: 'Cafés buy new machines that make coffee faster and cheaper.', curve: 'S', dir: { S: 1 }, out: [{ label: 'Price', ans: 'down' }, { label: 'Quantity', ans: 'up' }],
    hint: 'Cheaper to make = the sellers’ costs fall.', why: 'Better technology lowers costs, so supply shifts right. Price falls and quantity rises.' },
  { id: 'sd-health', level: 0, market: 'Fizzy drinks', event: 'A news report says fizzy drinks are bad for teenagers’ health.', curve: 'D', dir: { D: -1 }, out: [{ label: 'Price', ans: 'down' }, { label: 'Quantity', ans: 'down' }],
    hint: 'The report changes what buyers want.', why: 'Buyers want less at every price, so demand shifts left. Price falls and quantity falls.' },
  { id: 'sd-income', level: 0, market: 'Restaurant meals', event: 'Incomes in Ho Chi Minh City rise.', curve: 'D', dir: { D: 1 }, out: [{ label: 'Price', ans: 'up' }, { label: 'Quantity', ans: 'up' }],
    hint: 'Income belongs to buyers.', why: 'Higher income means buyers can afford more meals at every price: demand shifts right. Price and quantity rise.' },
  { id: 'sd-firms', level: 0, market: 'Bánh mì', event: 'Ten new bánh mì stalls open on the same street.', curve: 'S', dir: { S: 1 }, out: [{ label: 'Price', ans: 'down' }, { label: 'Quantity', ans: 'up' }],
    hint: 'More stalls = more sellers.', why: 'More firms means more is offered at every price: supply shifts right. Price falls, quantity rises.' },
  // Stretch
  { id: 'sd-coffee-tea', level: 1, market: 'Tea', event: 'The price of coffee rises sharply.', curve: 'D', dir: { D: 1 }, out: [{ label: 'Price of tea', ans: 'up' }, { label: 'Quantity of tea', ans: 'up' }],
    trapStep1: 'related-goods', hint: 'Coffee and tea are substitutes. If coffee is dearer, what do buyers do?', why: 'Buyers switch from coffee to tea (a substitute), so demand for tea shifts right. Tea price and quantity rise.' },
  { id: 'sd-petrol', level: 1, market: 'Large motorbikes', event: 'The price of petrol rises a lot.', curve: 'D', dir: { D: -1 }, out: [{ label: 'Price', ans: 'down' }, { label: 'Quantity', ans: 'down' }],
    trapStep1: 'related-goods', hint: 'Petrol and motorbikes are used together (complements).', why: 'Petrol is a complement: it makes riding dearer, so demand for big motorbikes shifts left. Price and quantity fall.' },
  { id: 'sd-tax', level: 1, market: 'Cigarettes', event: 'The government adds a tax on every pack of cigarettes.', curve: 'S', dir: { S: -1 }, out: [{ label: 'Price', ans: 'up' }, { label: 'Quantity', ans: 'down' }],
    trapStep1: 'tax-subsidy', hint: 'A tax paid by producers is a cost.', why: 'The tax raises producers’ costs, so supply shifts left. Price rises and quantity falls.' },
  { id: 'sd-subsidy', level: 1, market: 'Rice', event: 'The government gives a subsidy to rice farmers.', curve: 'S', dir: { S: 1 }, out: [{ label: 'Price', ans: 'down' }, { label: 'Quantity', ans: 'up' }],
    trapStep1: 'tax-subsidy', hint: 'A subsidy is money that lowers producers’ costs.', why: 'The subsidy lowers costs, so supply shifts right. Price falls and quantity rises.' },
  { id: 'sd-ownprice', level: 1, market: 'Bubble tea', event: 'A bubble tea shop raises its price from 40k to 50k.', curve: 'none', dir: {}, out: [{ label: 'Quantity demanded', ans: 'down' }],
    trapStep1: 'move-vs-shift', hint: 'This is the good’s OWN price. Does the whole curve move?', why: 'Its own price changed, so there is no shift: we move up along the demand curve and quantity demanded falls (a contraction).' },
  { id: 'sd-wages', level: 1, market: 'T-shirts', event: 'Wages of garment factory workers rise.', curve: 'S', dir: { S: -1 }, out: [{ label: 'Price', ans: 'up' }, { label: 'Quantity', ans: 'down' }],
    hint: 'Wages are a cost for the factory.', why: 'Higher wages raise costs, so supply shifts left. Price rises, quantity falls.' },
  // Challenge (two shifts)
  { id: 'sd-tet', level: 2, market: 'Flowers before Tết', event: 'Demand for flowers rises before Tết, and cold weather damages many flower farms.', curve: 'both', dir: { D: 1, S: -1 }, out: [{ label: 'Price', ans: 'up' }, { label: 'Quantity', ans: 'depends' }],
    trapStep3: 'two-shifts', hint: 'Do each shift on its own. Which effects agree, and which fight each other?', why: 'Demand right pushes price up; supply left pushes price up too: price rises for sure. Quantity: demand pushes it up, supply pushes it down, so it depends which shift is bigger.' },
  { id: 'sd-tv', level: 2, market: 'Televisions', event: 'New technology cuts the cost of making TVs, and a recession cuts incomes.', curve: 'both', dir: { D: -1, S: 1 }, out: [{ label: 'Price', ans: 'down' }, { label: 'Quantity', ans: 'depends' }],
    trapStep3: 'two-shifts', hint: 'Technology moves supply; incomes move demand.', why: 'Supply right pushes price down; demand left pushes price down: price falls for sure. Quantity depends on which shift is bigger.' },
  { id: 'sd-ebike', level: 2, market: 'Electric motorbikes', event: 'Electric motorbikes become fashionable, and more factories start making them.', curve: 'both', dir: { D: 1, S: 1 }, out: [{ label: 'Price', ans: 'depends' }, { label: 'Quantity', ans: 'up' }],
    trapStep3: 'two-shifts', hint: 'Both curves shift right. What do both shifts do to quantity?', why: 'Both shifts raise quantity, so quantity rises for sure. Demand pushes price up and supply pushes it down, so price depends on which shift is bigger.' },
  { id: 'sd-coffee-frost', level: 2, market: 'Coffee beans', event: 'A drought cuts the coffee harvest, and a health study says coffee is bad for you.', curve: 'both', dir: { D: -1, S: -1 }, out: [{ label: 'Price', ans: 'depends' }, { label: 'Quantity', ans: 'down' }],
    trapStep3: 'two-shifts', hint: 'Both curves shift left. What do both shifts do to quantity?', why: 'Both shifts cut quantity, so quantity falls for sure. Supply pushes price up and demand pushes it down, so price depends.' }
];

// ---------- Paper 1 practice (MCQ) ----------
export const MCQ = [
  // Core
  { id: 'q-income', level: 0, stem: 'What would shift the demand curve for bubble tea to the right?',
    options: [{ t: 'A rise in consumers’ incomes' }, { t: 'A fall in the price of bubble tea', trap: 'move-vs-shift' }, { t: 'A rise in the cost of milk', trap: 'd-vs-s' }, { t: 'A new tax on sugar', trap: 'd-vs-s' }],
    hint: 'Look for a buyer reason that is NOT the price of bubble tea itself.', explain: 'Higher incomes mean buyers want more at every price: demand shifts right. A change in bubble tea’s own price is a movement along the curve, and costs and taxes move supply.' },
  { id: 'q-frost', level: 0, stem: 'A frost destroys much of Vietnam’s coffee harvest. What happens in the coffee market?',
    options: [{ t: 'Supply shifts left and the price rises' }, { t: 'Supply shifts right and the price falls', trap: 'direction' }, { t: 'Demand shifts left and the price falls', trap: 'd-vs-s' }, { t: 'Demand shifts right and the price rises', trap: 'd-vs-s' }],
    hint: 'The frost hits the farmers, the sellers.', explain: 'Less coffee can be sold at every price, so supply shifts left. At the old price there is a shortage, so the price rises.' },
  { id: 'q-mango', level: 0, stem: 'The price of mangoes falls. What happens?',
    options: [{ t: 'A movement along the demand curve: quantity demanded rises' }, { t: 'The demand curve shifts to the right', trap: 'move-vs-shift' }, { t: 'The supply curve shifts to the left', trap: 'move-vs-shift' }, { t: 'The demand curve shifts to the left', trap: 'direction' }],
    hint: 'Is this the good’s own price?', explain: 'A change in the good’s own price is a movement along the demand curve (an extension), not a shift.' },
  { id: 'q-tech', level: 0, stem: 'A firm uses new machines that lower its costs. What happens in the market?',
    options: [{ t: 'Supply increases; price falls; quantity rises' }, { t: 'Supply increases; price rises; quantity rises', trap: 'pq-link' }, { t: 'Demand increases; price rises; quantity rises', trap: 'd-vs-s' }, { t: 'Supply decreases; price rises; quantity falls', trap: 'direction' }],
    hint: 'Lower costs: sellers offer more at every price.', explain: 'Lower costs shift supply right. With a supply shift, price and quantity move opposite ways: price falls, quantity rises.' },
  { id: 'q-fizzy', level: 0, stem: 'Doctors report that a fizzy drink is bad for health. What happens to its equilibrium price and quantity?',
    options: [{ t: 'Price falls; quantity falls' }, { t: 'Price falls; quantity rises', trap: 'pq-link' }, { t: 'Price rises; quantity falls', trap: 'd-vs-s' }, { t: 'Price rises; quantity rises', trap: 'direction' }],
    hint: 'Buyers want less. With a demand shift, P and Q move the same way.', explain: 'Demand shifts left. With a demand shift, price and quantity move the same way: both fall.' },
  { id: 'q-shortage', level: 0, stem: 'Demand for a good increases. What is there at the OLD price, and what happens next?',
    options: [{ t: 'A shortage, so the price rises' }, { t: 'A surplus, so the price falls', trap: 'shortage-surplus' }, { t: 'A shortage, so the price falls', trap: 'shortage-surplus' }, { t: 'Nothing, because the price has not changed', trap: 'move-vs-shift' }],
    hint: 'More buyers want it at the old price than sellers offer.', explain: 'At the old price, quantity demanded is now greater than quantity supplied: a shortage. Buyers compete, so the price rises.' },
  // Stretch
  { id: 'q-subst', level: 1, stem: 'The price of coffee rises sharply. What happens in the market for tea, a substitute?',
    options: [{ t: 'Demand for tea shifts right and the price of tea rises' }, { t: 'Demand for tea shifts left and the price of tea falls', trap: 'related-goods' }, { t: 'Supply of tea shifts left and the price of tea rises', trap: 'd-vs-s' }, { t: 'Nothing happens in the tea market', trap: 'related-goods' }],
    hint: 'If coffee is dearer, what do coffee drinkers buy instead?', explain: 'Buyers switch to tea, so demand for tea shifts right and its price rises.' },
  { id: 'q-compl', level: 1, stem: 'Petrol prices rise. What happens to the demand for large motorbikes?',
    options: [{ t: 'It shifts to the left' }, { t: 'It shifts to the right', trap: 'related-goods' }, { t: 'There is a movement along the demand curve', trap: 'move-vs-shift' }, { t: 'The supply curve shifts to the left instead', trap: 'd-vs-s' }],
    hint: 'Petrol and motorbikes are used together.', explain: 'Petrol is a complement. Dearer petrol makes owning a big motorbike less attractive: demand shifts left.' },
  { id: 'q-tax', level: 1, stem: 'The government puts a tax on each pack of cigarettes. What happens?',
    options: [{ t: 'Supply shifts left; price rises; quantity falls' }, { t: 'Demand shifts left; price falls; quantity falls', trap: 'd-vs-s' }, { t: 'Supply shifts right; price falls; quantity rises', trap: 'tax-subsidy' }, { t: 'Supply shifts left; price falls; quantity falls', trap: 'pq-link' }],
    hint: 'Who pays the tax to the government: producers. What does it do to their costs?', explain: 'The tax raises costs, so supply shifts left. Price rises and quantity falls.' },
  { id: 'q-subsidy', level: 1, stem: 'Rice farmers receive a government subsidy. What happens in the rice market?',
    options: [{ t: 'Supply shifts right; price falls; quantity rises' }, { t: 'Demand shifts right; price rises; quantity rises', trap: 'd-vs-s' }, { t: 'Supply shifts left; price rises; quantity falls', trap: 'tax-subsidy' }, { t: 'Supply shifts right; price rises; quantity rises', trap: 'pq-link' }],
    hint: 'A subsidy lowers producers’ costs.', explain: 'Lower costs shift supply right: price falls and quantity rises.' },
  { id: 'q-diagram', level: 1, diagram: { S: -1 }, stem: 'The diagram shows the supply curve shifting from S1 to S2. What could have caused this?',
    options: [{ t: 'A rise in the wages of the workers' }, { t: 'A rise in consumers’ incomes', trap: 'd-vs-s' }, { t: 'New technology in the factory', trap: 'direction' }, { t: 'A fall in the price of the product', trap: 'move-vs-shift' }],
    hint: 'The supply curve moved left: less at every price. What raises costs?', explain: 'A shift left of supply comes from higher costs, such as higher wages. Technology would shift supply right.' },
  { id: 'q-qd', level: 1, stem: 'The quantity of phones demanded falls, but the demand curve does not move. What caused this?',
    options: [{ t: 'A rise in the price of phones' }, { t: 'A fall in consumers’ incomes', trap: 'move-vs-shift' }, { t: 'A rise in the price of a substitute', trap: 'related-goods' }, { t: 'An advertising campaign by a rival', trap: 'move-vs-shift' }],
    hint: 'Only one thing moves us ALONG the demand curve.', explain: 'Only a change in the phone’s own price causes a movement along the curve (a contraction of demand).' },
  // Challenge
  { id: 'q-tet', level: 2, stem: 'Before Tết, demand for flowers rises while bad weather cuts their supply. What happens to the equilibrium?',
    options: [{ t: 'Price rises; the change in quantity is uncertain' }, { t: 'Price rises and quantity rises', trap: 'two-shifts' }, { t: 'Price falls; the change in quantity is uncertain', trap: 'direction' }, { t: 'The change in price is uncertain; quantity falls', trap: 'two-shifts' }],
    hint: 'Do the two shifts one at a time. Which effect do both agree on?', explain: 'Both shifts push price up. For quantity, demand pushes up and supply pushes down, so it depends which shift is bigger.' },
  { id: 'q-tv', level: 2, stem: 'The supply of televisions increases and, at the same time, demand for televisions decreases. What happens?',
    options: [{ t: 'Price falls; the change in quantity is uncertain' }, { t: 'Price falls and quantity falls', trap: 'two-shifts' }, { t: 'Price rises; the change in quantity is uncertain', trap: 'direction' }, { t: 'Price is uncertain; quantity rises', trap: 'two-shifts' }],
    hint: 'Supply right and demand left: which way does each push the price?', explain: 'Both shifts push price down, so price falls. Quantity depends on which shift is bigger.' },
  { id: 'q-ink', level: 2, stem: 'Printers become cheaper, and new technology cuts the cost of making printer ink. What happens in the ink market?',
    options: [{ t: 'Quantity rises; the change in price is uncertain' }, { t: 'Price falls and quantity rises', trap: 'two-shifts' }, { t: 'Quantity falls; the change in price is uncertain', trap: 'related-goods' }, { t: 'Price rises and quantity rises', trap: 'two-shifts' }],
    hint: 'Printers are a complement of ink. Cheaper printers: demand for ink…? New technology: supply of ink…?', explain: 'Cheaper printers raise demand for ink (complement) and better technology raises supply. Both raise quantity; price depends which shift is bigger.' },
  { id: 'q-rice', level: 2, stem: 'The price of rice rose by 20% and the quantity sold fell by 5%. What is the most likely cause?',
    options: [{ t: 'A decrease in supply' }, { t: 'An increase in demand', trap: 'pq-link' }, { t: 'A decrease in demand', trap: 'direction' }, { t: 'An increase in supply', trap: 'direction' }],
    hint: 'Price and quantity moved in OPPOSITE directions. Which curve does that?', explain: 'Opposite movements of price and quantity mean a supply shift. Price up and quantity down: supply decreased.' },
  { id: 'q-icecream', level: 2, stem: 'In summer the price of ice cream rose AND the quantity sold rose. Which explanation is correct?',
    options: [{ t: 'Demand increased' }, { t: 'Supply increased', trap: 'pq-link' }, { t: 'Supply decreased', trap: 'pq-link' }, { t: 'The higher price made demand increase', trap: 'move-vs-shift' }],
    hint: 'Price and quantity moved the SAME way. Which curve does that?', explain: 'Same-direction changes in price and quantity mean a demand shift: hot weather raised demand.' },
  { id: 'q-contract', level: 2, stem: 'A fall in supply raises the price of a good. What happens to demand?',
    options: [{ t: 'There is a contraction of demand: a movement up along the demand curve' }, { t: 'Demand decreases: the demand curve shifts left', trap: 'move-vs-shift' }, { t: 'Demand increases: the demand curve shifts right', trap: 'move-vs-shift' }, { t: 'Nothing, because only supply changed', trap: 'pq-link' }],
    hint: 'The demand curve itself does not move. Buyers react to the new price.', explain: 'Only supply shifted. The higher price causes a movement up along the unchanged demand curve: a contraction of demand.' }
];

// ---------- Data response (Paper 2 style) ----------
export const DATA = {
  id: 'dr-coffee', title: 'Vietnam’s coffee market',
  source: ['Vietnam is the world’s second-largest coffee producer. In 2024 a long drought hit the Central Highlands, where most coffee is grown, and the harvest fell.',
    'At the same time, coffee drinking kept growing in China and Europe. Traders say the world price of coffee beans rose to its highest level in many years.'],
  table: { head: ['', '2023', '2024'], rows: [['Price (USD per tonne)', '3 000', '4 500'], ['Vietnam’s coffee output (million tonnes)', '1.8', '1.5']] },
  questions: [
    { id: 'a', marks: 2, type: 'calc', ao: 'AO2', q: 'Calculate the percentage change in the price of coffee between 2023 and 2024.', answer: 50, tol: 0.5, unit: '%',
      hint: '% change = (new − old) ÷ old × 100', why: '(4 500 − 3 000) ÷ 3 000 × 100 = 50%' },
    { id: 'b', marks: 1, type: 'short', ao: 'AO1', q: 'Identify ONE cause of the change in the supply of coffee.',
      groups: [{ label: 'drought / weather', k: ['drought', 'dry', 'weather', 'rain', 'water', 'climate', 'hot'] }], need: 1,
      hint: 'Look at the first paragraph of the source.', why: 'The drought in the Central Highlands cut the harvest.' },
    { id: 'c', marks: 2, type: 'diagram', ao: 'AO2', q: 'Show the changes on the diagram: which curves shift, and which way?', dir: { D: 1, S: -1 },
      hint: 'There are TWO changes in the source: one for buyers and one for sellers.', why: 'Growing coffee drinking shifts demand right; the drought shifts supply left. Both push the price up.' },
    { id: 'd', marks: 4, type: 'short', ao: 'AO2', q: 'Explain, using the source, why the price of coffee rose.',
      groups: [{ label: 'supply fell / shifted left', k: ['supply fell', 'supply decrease', 'supply decreased', 'less supply', 'supply shift', 'supply curve shift', 'supply to the left', 'shifts left', 'shift left', 'lower supply', 'supply falls', 'reduce supply', 'reduces supply', 'decrease in supply', 'fall in supply'], ask: 'What happened to supply, and why?' },
        { label: 'demand rose / shifted right', k: ['demand rose', 'demand increase', 'demand increased', 'more demand', 'demand shift', 'shift right', 'shifts right', 'higher demand', 'demand grew', 'demand rises', 'increase in demand', 'rise in demand'], ask: 'What happened to demand, and why?' },
        { label: 'a cause from the source', k: ['drought', 'harvest', 'china', 'europe', 'drinking', 'weather'], ask: 'Use evidence from the source.' },
        { label: 'shortage → price rises', k: ['shortage', 'excess demand', 'demand is greater', 'demand greater than supply', 'more than supply', 'not enough'], ask: 'At the old price, was there a shortage or a surplus?' }],
      need: 4, hint: 'Use the frame: The drought caused supply to… At the same time demand… At the old price there was a…, so the price…',
      why: 'The drought cut the harvest, so supply decreased (shifted left). Coffee drinking grew in China and Europe, so demand increased (shifted right). At the old price there was a shortage, so the price rose.' }
  ]
};

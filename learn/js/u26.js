// 2.6 Price elasticity of demand (Cambridge IGCSE Economics 0455, syllabus for exams 2027 to 2029):
//   2.6.1 definition · 2.6.2 calculation, the five kinds of value, demand curve diagrams · 2.6.3 determinants ·
//   2.6.4 PED, consumer expenditure and firms' revenue (diagram and calculation) · 2.6.5 significance for consumers,
//   workers, producers/firms and government.
// Same format as u2.js (2.1 to 2.3): exam wording, plain English with [[term]] pills, Vietnamese, the right option first,
// a trap on every wrong option. PED = % change in quantity demanded ÷ % change in price. It is negative for a normal
// demand curve; elastic / inelastic compares the number WITHOUT the minus sign with 1.
// genPed() makes the PED lab questions (new numbers every time), like genEq() in u24.js.
import { rng } from './u24.js?v=9c916a59';

export const GLOSSARY = {
  'price elasticity of demand': { def: 'How much the quantity demanded of a good changes when its own price changes.', ex: 'Bubble tea rises 10% and cups sold fall 20%: PED is −2.', vi: 'độ co giãn của cầu theo giá' },
  'PED': { def: 'Short for price elasticity of demand: % change in quantity demanded ÷ % change in price.', ex: '−20% ÷ 10% = −2.', vi: 'độ co giãn của cầu theo giá (PED)' },
  'percentage change': { def: '(new value − old value) ÷ old value × 100.', ex: 'From 40,000 to 50,000 đồng: 10,000 ÷ 40,000 × 100 = 25%.', vi: 'phần trăm thay đổi' },
  'elastic': { def: 'Demand is elastic when quantity demanded changes by a BIGGER percentage than the price. PED is more than 1 (ignore the minus sign).', ex: 'One brand of bubble tea: many other stalls nearby.', vi: 'co giãn' },
  'inelastic': { def: 'Demand is inelastic when quantity demanded changes by a SMALLER percentage than the price. PED is between 0 and 1 (ignore the minus sign).', ex: 'Petrol, rice, electricity.', vi: 'kém co giãn' },
  'unitary elastic': { def: 'Quantity demanded changes by the SAME percentage as the price. PED = −1.', ex: 'Price falls 10%, quantity demanded rises 10%.', vi: 'co giãn đơn vị' },
  'perfectly inelastic': { def: 'Quantity demanded does not change at all when the price changes. PED = 0. The demand curve is vertical.', ex: 'A life-saving medicine (almost).', vi: 'hoàn toàn không co giãn' },
  'perfectly elastic': { def: 'Any rise in price makes quantity demanded fall to zero. PED is infinite. The demand curve is horizontal.', ex: 'One farmer selling rice at a higher price than everyone else.', vi: 'co giãn hoàn toàn' },
  'total revenue': { def: 'The money a firm gets from sales: price × quantity sold.', ex: '50 cups at 40,000 đồng = 2,000,000 đồng.', vi: 'tổng doanh thu' },
  'consumer expenditure': { def: 'The money consumers spend on a good: price × quantity bought. It equals the firms\' total revenue.', ex: 'Families spend 30,000 đồng × 10 litres = 300,000 đồng on petrol.', vi: 'chi tiêu của người tiêu dùng' },
  'necessity': { def: 'A good people need and keep buying even when its price rises.', ex: 'Rice, water, electricity.', vi: 'hàng thiết yếu' },
  'luxury': { def: 'A good people would like but can easily do without.', ex: 'A holiday in Phú Quốc, designer clothes.', vi: 'hàng xa xỉ' },
  'habit-forming': { def: 'A good people find hard to stop buying, because of habit or addiction.', ex: 'Cigarettes, coffee for a daily coffee drinker.', vi: 'gây thói quen, gây nghiện' },
  'proportion of income': { def: 'The share of a person\'s income spent on a good.', ex: 'Salt is a tiny part of income; a motorbike is a big part.', vi: 'tỷ lệ thu nhập' }
};

export const TRAPS = {
  'ped-def': { label: 'What PED measures', tip: 'PED is about the good\'s OWN price and the QUANTITY DEMANDED: how much buyers react to a price change. It is not about supply or income.' },
  'ped-formula': { label: 'The PED formula', tip: 'PED = % change in quantity demanded ÷ % change in price. Quantity goes on TOP, price underneath.' },
  'ped-pct': { label: 'Percentage change', tip: 'Percentage change = (new − old) ÷ OLD × 100. Always divide by the old (starting) value.' },
  'ped-class': { label: 'Elastic or inelastic?', tip: 'Ignore the minus sign and compare with 1. More than 1: elastic. Less than 1: inelastic. Exactly 1: unitary. 0: perfectly inelastic.' },
  'ped-sign': { label: 'The minus sign', tip: 'PED is negative because price and quantity demanded move in opposite directions. The minus sign does not mean inelastic: compare the number with 1.' },
  'ped-diagram': { label: 'Steep or flat?', tip: 'Inelastic demand is drawn steep; elastic demand is drawn flat. Perfectly inelastic is vertical; perfectly elastic is horizontal.' },
  'ped-vs-shift': { label: 'PED is a movement, not a shift', tip: 'PED measures a movement ALONG one demand curve when the good\'s own price changes. It does not shift the curve.' },
  'ped-det': { label: 'What makes demand elastic?', tip: 'Elastic: many close substitutes, a big share of income, a luxury, a long time to react. Inelastic: few substitutes, a small share of income, a necessity, habit-forming, a short time.' },
  'ped-revenue': { label: 'PED and revenue', tip: 'Inelastic: price and revenue move the SAME way. Elastic: price and revenue move OPPOSITE ways. Unitary: revenue does not change.' },
  'ped-decide': { label: 'Using PED in decisions', tip: 'To earn more revenue, raise the price if demand is inelastic and cut it if demand is elastic. Governments raise most tax from goods with inelastic demand.' }
};

const R = row => row;   // one row of a learn card: [heading, text]
export const LEARN = [
  { id: 'what', title: 'What is PED?', kind: 'text',
    text: '[[price elasticity of demand|Price elasticity of demand]] ([[PED]]) measures how much the [[quantity demanded]] of a good changes when its own price changes. Some goods react a lot to a price change; others hardly react at all.',
    example: 'Chị Thu raises her bubble tea price and loses many customers to the stalls next door. The petrol station raises its price, and motorbike riders still buy almost the same amount.' },
  { id: 'formula', title: 'Calculating PED', kind: 'rows', text: 'Work out two [[percentage change|percentage changes]], then divide.',
    rows: [R(['The formula', 'PED = % change in quantity demanded ÷ % change in price']),
      R(['A percentage change', '(new − old) ÷ old × 100. Always divide by the OLD number.']),
      R(['Example', 'Bubble tea rises from 40,000 to 50,000 đồng: +25%. Cups sold fall from 80 to 70 a day: −12.5%. PED = −12.5 ÷ 25 = −0.5.']),
      R(['The minus sign', 'PED is negative because price and quantity demanded move in opposite directions. To decide elastic or inelastic, compare the number without its sign with 1.'])] },
  { id: 'values', title: 'Five kinds of PED', kind: 'pedcurves', text: 'Tap each kind to see its demand curve. The flatter the curve, the more buyers react to a price change.' },
  { id: 'det', title: 'What makes demand elastic or inelastic?', kind: 'rows', text: 'These are the main influences on PED.',
    rows: [R(['Substitutes', 'Many close [[substitute|substitutes]] → elastic (people switch to another stall). Few substitutes → inelastic (petrol).']),
      R(['Share of income', 'A big [[proportion of income]] → elastic (a motorbike). A tiny share → inelastic (salt, matches).']),
      R(['Necessity or luxury', 'A [[necessity]] → inelastic (rice, electricity). A [[luxury]] → elastic (a holiday in Phú Quốc).']),
      R(['Habit', '[[habit-forming|Habit-forming]] goods → inelastic (cigarettes).']),
      R(['Time', 'Over a longer time people find substitutes, so demand becomes more elastic.'])] },
  { id: 'revenue', title: 'PED and total revenue', kind: 'revenue',
    text: '[[total revenue|Total revenue]] = price × quantity sold. It is also the [[consumer expenditure]] on the good: the box under the demand curve. Change the price and compare the boxes.' },
  { id: 'rule', title: 'The revenue rule', kind: 'rows', text: 'Whether revenue rises or falls depends on PED.',
    rows: [R(['Demand is inelastic', 'Price and revenue move the SAME way. Raise the price: revenue rises.']),
      R(['Demand is elastic', 'Price and revenue move OPPOSITE ways. Cut the price: revenue rises.']),
      R(['Unitary elastic', 'Revenue stays the same when the price changes.'])] },
  { id: 'use', title: 'Who uses PED?', kind: 'rows', text: 'PED helps people make decisions.',
    rows: [R(['Firms', 'To raise revenue: put the price up if demand is inelastic, down if demand is elastic.']),
      R(['Government', 'A [[tax]] on goods with inelastic demand (petrol, cigarettes) raises a lot of tax revenue, because people keep buying. To cut what people buy, a tax works better when demand is elastic.']),
      R(['Consumers', 'When the price of a good with inelastic demand rises, consumers spend more on it and have less for other things.']),
      R(['Workers', 'If demand for the product is inelastic, a firm can pay higher wages and raise its price without losing many sales, so jobs are safer.'])] }
];

const Q = (id, level, stem, plain, vi, options, hint, explain) => ({ id, level, stem, plain, vi, options, hint, explain });
const o = (t, p, trap) => ({ t, p: p || t, trap });
export const MCQ = [
  // ---- Core
  Q('q26-def', 0, 'What does price elasticity of demand measure?', 'What does [[PED]] measure?', 'Độ co giãn của cầu theo giá đo lường điều gì?',
    [o('How much quantity demanded reacts to a change in the good\'s price', 'How much people\'s buying changes when the price changes'),
      o('How much the price changes when the demand curve shifts', 'How much the price changes when demand moves', 'ped-formula'),
      o('How much quantity supplied reacts to a change in the price', 'How much sellers\' supply changes with the price', 'ped-def'),
      o('How far the demand curve shifts when incomes change', 'How far the demand curve moves when income changes', 'ped-vs-shift')],
    'It is about BUYERS and the good\'s OWN price.', 'PED measures how responsive quantity demanded is to a change in the good\'s own price.'),
  Q('q26-formula', 0, 'Which is the formula for price elasticity of demand?', 'Which is the [[PED]] formula?', 'Công thức tính độ co giãn của cầu theo giá là gì?',
    [o('% change in quantity demanded ÷ % change in price'), o('% change in price ÷ % change in quantity demanded', null, 'ped-formula'),
      o('Change in quantity demanded ÷ change in price', null, 'ped-pct'), o('Price × quantity demanded', null, 'ped-revenue')],
    'Quantity goes on top.', 'PED = % change in quantity demanded ÷ % change in price. Price × quantity is total revenue.'),
  Q('q26-calc', 0, 'The price of bubble tea rises by 10% and the quantity demanded falls by 20%. What is the PED?', 'Bubble tea costs 10% more. People buy 20% fewer cups. What is the [[PED]]?', 'Giá trà sữa tăng 10% và lượng cầu giảm 20%. PED bằng bao nhiêu?',
    [o('−2'), o('−0.5', null, 'ped-formula'), o('−10', null, 'ped-formula'), o('−30', null, 'ped-formula')],
    'Divide the % change in quantity by the % change in price.', '−20% ÷ 10% = −2.'),
  Q('q26-elastic', 0, 'The PED for cinema tickets is −2.5. What does this mean?', '[[PED]] for cinema tickets is −2.5. What does it mean?', 'PED của vé xem phim là −2,5. Điều này có nghĩa là gì?',
    [o('Demand is elastic', 'Demand is [[elastic]]'), o('Demand is inelastic', 'Demand is [[inelastic]]', 'ped-class'),
      o('Demand is unitary elastic', 'Demand is [[unitary elastic]]', 'ped-class'), o('Demand is inelastic as PED is negative', 'Demand is [[inelastic]]: the number is negative', 'ped-sign')],
    'Ignore the minus sign. Is 2.5 more or less than 1?', '2.5 is more than 1, so demand is elastic: quantity demanded changes by a bigger percentage than the price.'),
  // ---- Stretch
  Q('q26-pct', 1, 'The price of a bowl of phở rises from 40,000 đồng to 50,000 đồng. What is the percentage change in price?', 'Phở goes from 40,000 to 50,000 đồng. What is the [[percentage change]]?', 'Giá một tô phở tăng từ 40.000 lên 50.000 đồng. Phần trăm thay đổi của giá là bao nhiêu?',
    [o('+25%'), o('+20%', null, 'ped-pct'), o('+10%', null, 'ped-pct'), o('+125%', null, 'ped-pct')],
    'Divide by the OLD price.', '(50,000 − 40,000) ÷ 40,000 × 100 = 25%. Dividing by the new price gives 20%, which is wrong.'),
  Q('q26-steep', 1, 'A demand curve is drawn very steep, close to vertical. What does it show?', 'A [[demand curve]] is very steep, almost straight up. What does it show?', 'Một đường cầu rất dốc, gần như thẳng đứng. Nó thể hiện điều gì?',
    [o('Inelastic demand', '[[inelastic|Inelastic]] demand'), o('Elastic demand', '[[elastic|Elastic]] demand', 'ped-diagram'),
      o('Perfectly elastic demand', '[[perfectly elastic|Perfectly elastic]] demand', 'ped-diagram'), o('A fall in demand', 'Demand going down', 'ped-vs-shift')],
    'Steep: a big price change, a small quantity change.', 'On a steep curve, a big change in price causes only a small change in quantity demanded: inelastic demand.'),
  Q('q26-subs', 1, 'Which of these is most likely to have elastic demand?', 'Which one probably has [[elastic]] demand?', 'Hàng hóa nào sau đây có khả năng có cầu co giãn nhất?',
    [o('One brand of bottled water', 'One brand of bottled water'), o('Salt for cooking', 'Salt for cooking', 'ped-det'),
      o('Electricity for homes', 'Electricity for homes', 'ped-det'), o('Cigarettes for a smoker', 'Cigarettes for a smoker', 'ped-det')],
    'Which one has many close substitutes?', 'There are many other brands of bottled water, so buyers switch when one brand raises its price. Salt and electricity are necessities; cigarettes are habit-forming.'),
  Q('q26-unit', 1, 'The price of a phone case falls by 10% and the quantity demanded rises by 10%. How would demand be described?', 'Phone cases get 10% cheaper. People buy 10% more. What kind of demand is it?', 'Giá ốp điện thoại giảm 10% và lượng cầu tăng 10%. Cầu này được mô tả như thế nào?',
    [o('Unitary elastic', '[[unitary elastic|Unitary elastic]]'), o('Perfectly elastic', '[[perfectly elastic|Perfectly elastic]]', 'ped-class'),
      o('Perfectly inelastic', '[[perfectly inelastic|Perfectly inelastic]]', 'ped-class'), o('Elastic', '[[elastic|Elastic]]', 'ped-class')],
    'Work out the PED.', '+10% ÷ −10% = −1: unitary elastic. Quantity demanded changes by the same percentage as the price.'),
  // ---- Challenge
  Q('q26-rev-in', 2, 'Demand for petrol is inelastic. Petrol stations raise the price. What happens to their total revenue?', 'Demand for petrol is [[inelastic]]. The price goes up. What happens to [[total revenue]]?', 'Cầu xăng kém co giãn. Các cây xăng tăng giá. Tổng doanh thu của họ thay đổi thế nào?',
    [o('It rises: quantity falls by a smaller % than price rises', 'It goes up: people buy only a little less'),
      o('It falls: people buy less petrol than before', 'It goes down: people buy less petrol', 'ped-revenue'),
      o('It stays the same, because demand is inelastic', 'It stays the same', 'ped-revenue'),
      o('It falls: the demand curve shifts to the left', 'It goes down: demand moves left', 'ped-vs-shift')],
    'Inelastic: price and revenue move the same way.', 'Quantity demanded falls by a smaller percentage than the price rises, so price × quantity rises.'),
  Q('q26-rev-calc', 2, 'A cinema cuts its ticket price from 100,000 đồng to 80,000 đồng. Tickets sold rise from 400 to 600 a day. What happens to its revenue, and what does this show?', 'Tickets go from 100,000 to 80,000 đồng. Sales go from 400 to 600. What happens to [[total revenue]]? What does it show?', 'Rạp chiếu phim giảm giá vé từ 100.000 xuống 80.000 đồng. Số vé bán tăng từ 400 lên 600 vé mỗi ngày. Doanh thu thay đổi thế nào và điều đó cho thấy gì?',
    [o('It rises from 40 to 48 million đồng: demand is elastic', 'Up from 40 to 48 million: [[elastic]]'),
      o('It rises from 40 to 48 million đồng: demand is inelastic', 'Up from 40 to 48 million: [[inelastic]]', 'ped-revenue'),
      o('It falls, because each ticket is now cheaper', 'Down, because each ticket is cheaper', 'ped-revenue'),
      o('It stays the same: demand is unitary elastic', 'The same: [[unitary elastic]]', 'ped-revenue')],
    'Price × quantity before and after.', '100,000 × 400 = 40 million; 80,000 × 600 = 48 million. A price cut raised revenue, so demand is elastic (PED = +50% ÷ −20% = −2.5).'),
  Q('q26-gov', 2, 'The government wants to raise as much tax revenue as possible from a new tax. Which good should it tax?', 'The [[government]] wants a lot of [[tax]] money. Which good should it tax?', 'Chính phủ muốn thu được nhiều tiền thuế nhất từ một loại thuế mới. Nên đánh thuế hàng hóa nào?',
    [o('A good with inelastic demand, such as petrol', 'Petrol ([[inelastic]] demand)'), o('A good with elastic demand, such as one snack brand', 'One snack brand ([[elastic]] demand)', 'ped-decide'),
      o('A good with many close substitutes', 'A good with many [[substitute|substitutes]]', 'ped-det'), o('A good whose demand is perfectly elastic', 'A [[perfectly elastic|perfectly elastic]] good', 'ped-decide')],
    'Which buyers keep buying after the price rises?', 'With inelastic demand, people keep buying after the tax raises the price, so the government collects tax on almost the same quantity.'),
  Q('q26-workers', 2, 'Workers in a shirt factory get a pay rise, so the firm raises the price of its shirts. When are the workers\' jobs safest?', 'Workers get more pay, so the shirts cost more. When are the jobs SAFEST?', 'Công nhân xưởng may được tăng lương nên xưởng tăng giá áo. Khi nào việc làm của công nhân an toàn nhất?',
    [o('When demand for the shirts is inelastic', 'When demand for shirts is [[inelastic]]'), o('When demand for the shirts is elastic', 'When demand for shirts is [[elastic]]', 'ped-decide'),
      o('When demand is perfectly elastic', 'When demand is [[perfectly elastic]]', 'ped-decide'), o('When the demand curve shifts left', 'When the demand curve moves left', 'ped-vs-shift')],
    'Which firm loses fewest sales when its price rises?', 'With inelastic demand, the higher price cuts sales only a little, so the firm still needs most of its workers.')
];

const P = (id, level, marks, q, plain, vi, chain, bank, frame, groups, cmd) => ({ id, level, marks, q, plain, vi, chain, bank, frame, groups, need: marks, ...(cmd ? { cmd } : {}) });
const g = (label, k, ask) => ({ label, k, ask });
export const P2 = [
  P('p26-define', 0, 2, 'Define price elasticity of demand.', 'What is [[price elasticity of demand]]? Give its meaning.', 'Định nghĩa độ co giãn của cầu theo giá.',
    ['PED measures how much the {quantity demanded} of a good changes', 'when its own {price} changes.'],
    ['supply', 'income'], 'PED measures how much the … of a good changes when its … changes.',
    [g('responsiveness of quantity demanded', ['quantity demanded', 'how much demand', 'responsive', 'how much people buy', 'amount demanded'], 'What changes?'),
      g('to a change in its price', ['price change', 'change in price', 'change in its price', 'price changes', 'price rises', 'price falls', 'its own price'], 'What causes the change?'),
      g('as a formula: % change in Qd ÷ % change in price', ['% change in quantity', 'percentage change in quantity', 'divided by'], 'How is it calculated?')], 'define'),
  P('p26-calc', 1, 4, 'The price of a cup of bubble tea rises from 40,000 đồng to 50,000 đồng, and sales fall from 80 to 70 cups a day. Calculate the PED and explain what it shows.', 'Bubble tea goes from 40,000 to 50,000 đồng. Sales go from 80 to 70 cups. Work out the [[PED]]. What does it show?', 'Giá một ly trà sữa tăng từ 40.000 lên 50.000 đồng, lượng bán giảm từ 80 xuống 70 ly mỗi ngày. Tính PED và giải thích ý nghĩa.',
    ['The % change in price is 10,000 ÷ 40,000 × 100 = {25}%.', 'The % change in quantity demanded is −10 ÷ 80 × 100 = {−12.5}%.', 'PED = −12.5 ÷ 25 = {−0.5}.', 'This is less than 1, so demand is {inelastic}: quantity changes by a smaller % than price.'],
    ['−2', 'elastic'], 'The % change in price is … . The % change in quantity demanded is … . PED = … ÷ … = … . So demand is … .',
    [g('% change in price = 25%', ['25%', '25 %', '25 per cent', '25 percent'], 'What is the % change in price?'),
      g('% change in Qd = −12.5%', ['12.5'], 'What is the % change in quantity demanded?'),
      g('PED = −0.5', ['0.5'], 'What is the PED?'),
      g('demand is inelastic', ['inelastic'], 'Is demand elastic or inelastic?'),
      g('quantity changes by a smaller % than price', ['smaller', 'less than the price', 'less than 1', 'below 1'], 'What does the value show?'),
      g('uses the formula: % change in Qd ÷ % change in price', ['divided by', 'formula', '% change in quantity', 'percentage change in quantity'], 'Which formula do you use?')], 'calculate'),
  P('p26-det', 1, 4, 'Explain two reasons why the demand for rice in Vietnam is likely to be price inelastic.', 'Why is demand for rice [[inelastic]]? Explain two reasons.', 'Giải thích hai lý do vì sao cầu về gạo ở Việt Nam có khả năng kém co giãn theo giá.',
    ['Rice is a {necessity}: families eat it every day.', 'So they keep buying it even when the price rises.', 'Rice also has few close {substitutes} for most families.', 'So when its price rises, people cannot easily switch, and quantity demanded falls only a little.'],
    ['luxury', 'elastic'], 'Rice is a … , so families … . Rice also has few … , so when the price rises … .',
    [g('a necessity', ['necessity', 'need', 'essential', 'every day', 'staple'], 'What kind of good is rice?'),
      g('keep buying when price rises', ['keep buying', 'still buy', 'continue to buy', 'buy the same', 'still need'], 'What do families do when the price rises?'),
      g('few close substitutes', ['few substitutes', 'no substitute', 'few close substitutes', 'no close substitute', 'cannot switch', 'can\'t switch', 'nothing to replace'], 'Can people switch to something else?'),
      g('quantity demanded falls only a little', ['falls only a little', 'small fall', 'smaller percentage', 'only a little', 'falls a little', 'slightly'], 'So what happens to quantity demanded?'),
      g('small proportion of income', ['proportion of income', 'share of income', 'small part of income', 'cheap', 'part of their income'], 'How much of their income do families spend on it?'),
      g('habit / part of daily meals', ['habit', 'tradition', 'culture', 'every meal'], 'Is eating rice a habit?')]),
  P('p26-rev', 1, 4, 'Explain why a firm facing elastic demand might cut its price to increase its total revenue.', 'Demand is [[elastic]]. Why could a lower price bring more [[total revenue]]? Explain.', 'Giải thích vì sao doanh nghiệp có cầu co giãn có thể giảm giá để tăng tổng doanh thu.',
    ['With elastic demand, quantity demanded changes by a {bigger} percentage than the price.', 'So a price cut makes quantity demanded rise a {lot}.', 'Total revenue is price × {quantity}.', 'The rise in quantity is bigger than the fall in price, so total revenue {rises}.'],
    ['smaller', 'falls'], 'With elastic demand, quantity changes by a … percentage than price. So a price cut … . Total revenue is … . So total revenue … .',
    [g('Qd changes by a bigger % than price', ['bigger percentage', 'larger percentage', 'more than the price', 'greater percentage', 'bigger %', 'more than 1'], 'What does elastic mean?'),
      g('a price cut raises Qd a lot', ['rise a lot', 'rises a lot', 'buy a lot more', 'much more', 'many more', 'increase a lot', 'buy more'], 'What happens to quantity demanded?'),
      g('total revenue = price × quantity', ['price × quantity', 'price x quantity', 'price times quantity', 'price multiplied'], 'How is total revenue worked out?'),
      g('total revenue rises', ['revenue rise', 'revenue increase', 'revenue goes up', 'more revenue', 'earn more', 'revenue will rise'], 'So what happens to total revenue?'),
      g('customers switch from rivals (substitutes)', ['switch', 'substitute', 'rival', 'competitor', 'other firms', 'other shops'], 'Where do the extra customers come from?'),
      g('example with numbers', ['for example', 'e.g', 'million', '000'], 'Can you show it with numbers?')]),
  { ...P('p26-analyse', 2, 6, 'Analyse how the price elasticity of demand for cigarettes affects the success of a tax on cigarettes.', 'Analyse: demand for cigarettes is [[inelastic]]. What happens when the [[government]] puts a [[tax]] on them?', 'Hãy phân tích độ co giãn của cầu theo giá đối với thuốc lá ảnh hưởng đến hiệu quả của thuế thuốc lá như thế nào.',
    ['Cigarettes are {habit-forming}, so demand for them is inelastic.', 'A tax raises the firms\' costs, so the price of cigarettes {rises}.', 'Because demand is inelastic, quantity demanded falls by only a {small} percentage.', 'So most smokers keep buying, and the government collects a lot of tax {revenue}.', 'But the tax does not cut smoking by much, so it is less successful at improving {health}.', 'Smokers also spend more on cigarettes, so they have less money for other goods.'],
    ['elastic', 'subsidy'], 'Cigarettes are … , so demand is … . A tax makes the price … . Because demand is inelastic, quantity … . So the government … . But …',
    [g('cigarettes are habit-forming', ['habit', 'addict', 'hard to stop', 'hard to give up'], 'Why is demand for cigarettes inelastic?'),
      g('demand is inelastic', ['inelastic'], 'What kind of demand is it?'),
      g('the tax raises the price', ['price rise', 'price increase', 'higher price', 'more expensive', 'price goes up'], 'What does the tax do to the price?'),
      g('quantity falls by only a small %', ['small percentage', 'only a little', 'falls a little', 'small fall', 'slightly', 'smaller percentage'], 'What happens to quantity demanded?'),
      g('a lot of tax revenue', ['tax revenue', 'a lot of tax', 'much tax', 'raise money', 'collect', 'more revenue'], 'What does the government get?'),
      g('smoking falls only a little (health aim)', ['health', 'not cut smoking', 'still smoke', 'keep smoking', 'smoking falls a little'], 'Does the tax cut smoking much?'),
      g('smokers spend more, less for other goods', ['spend more', 'less money for', 'less to spend', 'expenditure', 'other goods'], 'What happens to smokers\' spending?'),
      g('few substitutes', ['few substitutes', 'no substitute', 'no close substitute'], 'Can smokers switch to something else?')]), cmd: 'analyse' }
];

// ---------- PED lab: generated questions (a new set of numbers every time) ----------
// kind -> level. Steps: { q, type: 'number', answer, unit, tol, signFree, trap, why } or { q, type: 'choice', answer, options: [{t, v, trap}], why }
// signFree: the number is accepted with or without its minus sign (PED and % changes); the feedback then reminds about the sign.
// anySign: the question asks for a size ("falls by what %"), so 10 and −10 are both simply right.
export const PED_KINDS = { 'ped-pct': 0, 'ped-read': 0, 'ped-raw': 1, 'ped-find': 1, 'ped-rev': 2, 'ped-advice': 2 };
export const PED_TITLES = { 'ped-pct': 'Calculate PED from percentages', 'ped-read': 'Read a PED value', 'ped-raw': 'Calculate PED from prices and quantities',
  'ped-find': 'Use PED to predict sales', 'ped-rev': 'PED and total revenue', 'ped-advice': 'Advise a firm on its price' };
// the engine block each PED lab question practises
export const PED_BLOCK = { 'ped-pct': 'ped-calc', 'ped-read': 'ped-values', 'ped-raw': 'pct-change', 'ped-find': 'ped-calc', 'ped-rev': 'ped-revenue', 'ped-advice': 'ped-use' };
export const nextPedKind = (level, n) => { const ks = Object.keys(PED_KINDS).filter(k => PED_KINDS[k] === level); return ks[n % ks.length]; };
export const fmt = n => (Math.round(n * 100) / 100).toLocaleString('en-US').replace('-', '−');   // a real minus sign on screen
export const classOf = e => { const a = Math.abs(e); return a === 0 ? 'pi' : a < 1 ? 'in' : a === 1 ? 'un' : 'el'; };
const CLASS = [{ t: 'Elastic', v: 'el' }, { t: 'Inelastic', v: 'in' }, { t: 'Unitary elastic', v: 'un' }];
const CLASS5 = [...CLASS, { t: 'Perfectly inelastic', v: 'pi' }, { t: 'Perfectly elastic', v: 'pe' }];
const CLASS_WHY = { el: 'more than 1: elastic. Quantity demanded changes by a bigger % than the price.', in: 'less than 1: inelastic. Quantity demanded changes by a smaller % than the price.',
  un: 'exactly 1: unitary elastic. Quantity demanded changes by the same % as the price.', pi: '0: perfectly inelastic. Quantity demanded does not change.' };
const pick = (r, a) => a[Math.floor(r() * a.length)];
// Goods: name, unit, prices (thousand đồng) and quantities that suit them, and whether demand is usually elastic
const GOODS = [
  { good: 'Chị Thu\'s bubble tea', unit: 'cups a day', p: [20, 40, 50], q: [80, 100, 200, 400], el: true },
  { good: 'cinema tickets at one cinema', unit: 'tickets a day', p: [80, 100, 120], q: [200, 400, 500], el: true },
  { good: 'one brand of phone case', unit: 'cases a week', p: [50, 100, 200], q: [100, 200, 500], el: true },
  { good: 'petrol', unit: 'litres a day', p: [20, 25], q: [1000, 2000, 5000], el: false },
  { good: 'rice', unit: 'kg a day', p: [20, 25], q: [500, 1000, 2000], el: false },
  { good: 'electricity', unit: 'kWh a day', p: [2, 4], q: [1000, 5000], el: false }
];
const ELASTIC = [1.5, 2, 2.5, 3, 4], INELASTIC = [0.2, 0.4, 0.5, 0.6, 0.8];
// PED values that suit the good: elastic goods (one brand, one cinema) get elastic or unitary values; petrol, rice and electricity get inelastic ones
const fits = G => (G.el ? [...ELASTIC, 1] : INELASTIC);
const pctOf = (from, to) => Math.round(((to - from) / from) * 10000) / 100;

export function genPed(kind, seed) {
  const r = rng(seed), lvl = PED_KINDS[kind], G = pick(r, GOODS);
  const it = { id: kind, seed, level: lvl, kind, good: G.good, unit: G.unit, title: PED_TITLES[kind] };
  const up = r() < 0.6;   // price rises (or falls)
  if (kind === 'ped-pct') {
    let pp, e;
    do { pp = pick(r, [5, 10, 20, 25, 50]); e = pick(r, fits(G)); } while (!Number.isInteger(pp * e) || pp * e > 90);
    const qq = pp * e, ped = -e;   // negative either way: price and quantity demanded move in opposite directions
    it.lines = [`The price of ${G.good} ${up ? 'rises' : 'falls'} by ${pp}%.`, `The quantity demanded ${up ? 'falls' : 'rises'} by ${qq}%.`];
    it.steps = [
      { q: 'What is the PED?', type: 'number', answer: ped, unit: '', tol: 0.01, signFree: true, trap: 'ped-formula', why: `PED = % change in quantity demanded ÷ % change in price = ${up ? '−' : '+'}${qq} ÷ ${up ? '+' : '−'}${pp} = ${fmt(ped)}.` },
      { q: 'How would you describe demand?', type: 'choice', answer: classOf(ped), options: CLASS.map(c => ({ ...c, trap: 'ped-class' })), why: `Ignore the minus sign: ${fmt(e)} is ${CLASS_WHY[classOf(ped)]}` }];
    it.hint = 'Quantity on top: % change in quantity demanded ÷ % change in price.';
    it.why = `PED = ${fmt(ped)}, so demand is ${CLASS.find(c => c.v === classOf(ped)).t.toLowerCase()}.`;
  }
  if (kind === 'ped-read') {
    const e = pick(r, [...(G.el ? ELASTIC : INELASTIC), 1, 0]), ped = e === 0 ? 0 : -e, pp = pick(r, [10, 20]);
    it.lines = [`Economists find that the PED for ${G.good} is ${fmt(ped)}.`];
    it.steps = [
      { q: 'How would you describe demand?', type: 'choice', answer: classOf(ped), options: CLASS5.map(c => ({ ...c, trap: c.v === 'pe' || c.v === 'pi' ? 'ped-class' : 'ped-sign' })), why: `Ignore the minus sign: ${fmt(e)} is ${CLASS_WHY[classOf(ped)]}` },
      { q: `If the price rises by ${pp}%, by what percentage does the quantity demanded fall?`, type: 'number', answer: e * pp, unit: '%', tol: 0.01, anySign: true, trap: 'ped-formula',
        why: `% change in quantity demanded = PED × % change in price = ${fmt(ped)} × ${pp} = ${fmt(-e * pp)}%. It falls by ${fmt(e * pp)}%.` }];
    it.hint = 'Compare the number (without the minus sign) with 1. Then: % change in Qd = PED × % change in price.';
    it.why = e === 0 ? 'PED 0: quantity demanded does not change at all.' : `A PED of ${fmt(ped)} means quantity demanded changes ${fmt(e)} times as much as the price, in percentage terms.`;
  }
  if (kind === 'ped-raw' || kind === 'ped-rev') {
    let P0, pp, e, Q0, P1, Q1, tries = 0;
    do {
      P0 = pick(r, G.p); pp = pick(r, [10, 20, 25, 50]); e = kind === 'ped-rev' ? pick(r, G.el ? ELASTIC : INELASTIC) : pick(r, fits(G));
      Q0 = pick(r, G.q); P1 = P0 * (1 + (up ? pp : -pp) / 100); Q1 = Q0 * (1 - (up ? 1 : -1) * (pp * e) / 100);
      tries++;
      // For revenue questions the revenue change must agree with the PED class. With large percentage changes the two can
      // disagree (price +50% and PED −0.8 lowers revenue), so those numbers are skipped; so is PED −1, which never leaves
      // revenue exactly unchanged when worked out with percentages.
    } while ((!Number.isInteger(P1 * 2) || !Number.isInteger(Q1) || pp * e >= 90 || Q1 <= 0
      || (kind === 'ped-rev' && (e === 1 || ((P1 * Q1 > P0 * Q0) === (P1 > P0)) !== (e < 1)))) && tries < 400);
    if (tries >= 400) { P0 = 40; pp = 25; e = 0.5; Q0 = 80; P1 = up ? 50 : 30; Q1 = up ? 70 : 90; }
    const dP = pctOf(P0, P1), dQ = pctOf(Q0, Q1), ped = Math.round((dQ / dP) * 100) / 100;
    Object.assign(it, { table: true, P0, P1, Q0, Q1, priceUnit: 'thousand đồng' });
    it.lines = [`The price of ${G.good} ${P1 > P0 ? 'rises' : 'falls'} from ${fmt(P0)} to ${fmt(P1)} thousand đồng.`, `Sales ${Q1 < Q0 ? 'fall' : 'rise'} from ${fmt(Q0)} to ${fmt(Q1)} ${G.unit}.`];
    if (kind === 'ped-raw') {
      it.steps = [
        { q: 'What is the percentage change in price?', type: 'number', answer: dP, unit: '%', tol: 0.01, signFree: true, trap: 'ped-pct', why: `(${fmt(P1)} − ${fmt(P0)}) ÷ ${fmt(P0)} × 100 = ${fmt(dP)}%.` },
        { q: 'What is the percentage change in quantity demanded?', type: 'number', answer: dQ, unit: '%', tol: 0.01, signFree: true, trap: 'ped-pct', why: `(${fmt(Q1)} − ${fmt(Q0)}) ÷ ${fmt(Q0)} × 100 = ${fmt(dQ)}%.` },
        { q: 'What is the PED?', type: 'number', answer: ped, unit: '', tol: 0.01, signFree: true, trap: 'ped-formula', why: `${fmt(dQ)} ÷ ${fmt(dP)} = ${fmt(ped)}.` },
        { q: 'How would you describe demand?', type: 'choice', answer: classOf(ped), options: CLASS.map(c => ({ ...c, trap: 'ped-class' })), why: `Ignore the minus sign: ${fmt(Math.abs(ped))} is ${CLASS_WHY[classOf(ped)]}` }];
      it.hint = 'Percentage change = (new − old) ÷ OLD × 100. Then PED = % change in quantity ÷ % change in price.';
      it.why = `PED = ${fmt(dQ)}% ÷ ${fmt(dP)}% = ${fmt(ped)}.`;
    } else {
      const R0 = P0 * Q0, R1 = P1 * Q1, way = R1 > R0 ? 'up' : R1 < R0 ? 'down' : 'same';
      it.steps = [
        { q: 'What is total revenue BEFORE the change?', type: 'number', answer: R0, unit: 'thousand đồng', tol: 0.5, trap: 'ped-revenue', why: `Price × quantity = ${fmt(P0)} × ${fmt(Q0)} = ${fmt(R0)} thousand đồng.` },
        { q: 'What is total revenue AFTER the change?', type: 'number', answer: R1, unit: 'thousand đồng', tol: 0.5, trap: 'ped-revenue', why: `${fmt(P1)} × ${fmt(Q1)} = ${fmt(R1)} thousand đồng.` },
        { q: 'What happened to total revenue?', type: 'choice', answer: way, options: [{ t: '↑ It rose', v: 'up', trap: 'ped-revenue' }, { t: '↓ It fell', v: 'down', trap: 'ped-revenue' }, { t: 'It stayed the same', v: 'same', trap: 'ped-revenue' }],
          why: `${fmt(R0)} → ${fmt(R1)} thousand đồng.` },
        { q: 'So, over this price change, demand is…', type: 'choice', answer: classOf(ped), options: CLASS.map(c => ({ ...c, trap: 'ped-revenue' })),
          why: way === 'same' ? 'Revenue did not change: unitary elastic.' : (way === 'up') === (P1 > P0) ? 'Price and revenue moved the SAME way: inelastic.' : 'Price and revenue moved OPPOSITE ways: elastic.' }];
      it.hint = 'Total revenue = price × quantity. Did price and revenue move the same way (inelastic) or opposite ways (elastic)?';
      it.why = `Revenue went from ${fmt(R0)} to ${fmt(R1)} thousand đồng, and PED = ${fmt(ped)}.`;
    }
  }
  if (kind === 'ped-find') {
    let e, pp, Q0, tries = 0;
    do { e = pick(r, fits(G)); pp = pick(r, [10, 20, 25]); Q0 = pick(r, G.q); tries++; } while ((!Number.isInteger(Q0 * pp * e / 100) || pp * e >= 90) && tries < 400);
    const dq = pp * e, Q1 = Q0 * (1 - (up ? 1 : -1) * dq / 100);
    it.lines = [`The PED for ${G.good} is ${fmt(-e)}.`, `The seller ${up ? 'raises' : 'cuts'} the price by ${pp}%. Sales are now ${fmt(Q0)} ${G.unit}.`];
    it.steps = [
      { q: 'By what percentage will the quantity demanded change?', type: 'number', answer: up ? -dq : dq, unit: '%', tol: 0.01, signFree: true, trap: 'ped-formula', why: `% change in Qd = PED × % change in price = ${fmt(-e)} × ${up ? '+' : '−'}${pp} = ${up ? '−' : '+'}${fmt(dq)}%.` },
      { q: 'What will sales be after the change?', type: 'number', answer: Q1, unit: G.unit, tol: 0.5, trap: 'ped-pct', why: `${fmt(Q0)} ${up ? '−' : '+'} ${fmt(dq)}% of ${fmt(Q0)} = ${fmt(Q1)}.` }];
    it.hint = 'Turn the formula round: % change in quantity demanded = PED × % change in price.';
    it.why = `Sales go from ${fmt(Q0)} to ${fmt(Q1)} ${G.unit}.`;
  }
  if (kind === 'ped-advice') {
    const e = pick(r, G.el ? ELASTIC : INELASTIC), c = classOf(-e);
    it.lines = [`The seller of ${G.good} wants to earn more total revenue. The PED is ${fmt(-e)}.`];
    it.steps = [
      { q: 'How would you describe demand?', type: 'choice', answer: c, options: CLASS.map(x => ({ ...x, trap: 'ped-class' })), why: `Ignore the minus sign: ${fmt(e)} is ${CLASS_WHY[c]}` },
      { q: 'What should the seller do to the price?', type: 'choice', answer: c === 'el' ? 'cut' : 'raise',
        options: [{ t: '↑ Raise the price', v: 'raise', trap: 'ped-decide' }, { t: '↓ Cut the price', v: 'cut', trap: 'ped-decide' }, { t: 'Keep it the same', v: 'keep', trap: 'ped-decide' }],
        why: c === 'el' ? 'Elastic: price and revenue move opposite ways, so a price cut raises revenue.' : 'Inelastic: price and revenue move the same way, so a price rise raises revenue.' },
      { q: 'Why does this work?', type: 'choice', answer: 'why',
        options: c === 'el' ? [{ t: 'Sales rise by a bigger % than the price falls', v: 'why' }, { t: 'Sales rise by a smaller % than the price falls', v: 'no1', trap: 'ped-revenue' }, { t: 'The demand curve shifts to the right', v: 'no2', trap: 'ped-vs-shift' }]
          : [{ t: 'Sales fall by a smaller % than the price rises', v: 'why' }, { t: 'Sales fall by a bigger % than the price rises', v: 'no1', trap: 'ped-revenue' }, { t: 'The demand curve shifts to the right', v: 'no2', trap: 'ped-vs-shift' }],
        why: 'Total revenue = price × quantity: it rises if the % change in quantity is smaller than the % change in price (inelastic), or if a price cut brings a bigger % rise in quantity (elastic).' }];
    it.hint = 'Inelastic: price and revenue move the same way. Elastic: opposite ways.';
    it.why = c === 'el' ? 'With elastic demand, cutting the price raises total revenue.' : 'With inelastic demand, raising the price raises total revenue.';
  }
  return it;
}

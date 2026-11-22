// Lessons for the econ engine's market blocks (2.1 to 2.3) and the price elasticity blocks (2.6). Same format as ebank.js; builders: sort, budget, cards, tapone,
// curve (move the price along one demand or supply curve) and curveshift (tap events and watch the curve shift or not).
const c = (q, plain, options, why) => ({ q, plain: plain || q, options: options.map(o => (Array.isArray(o) ? { t: o[0], p: o[1] || o[0] } : { t: o, p: o })), why });

export const EBANK2 = {
  'market-place': {
    builder: { type: 'sort', q: 'Is it a market? (Do buyers and sellers trade?)', buckets: ['Market', 'Not a market'],
      items: [['Bến Thành Market', '🏬', 0], ['A shopping app', '📱', 0], ['Ordering phở by phone', '☎️', 0], ['A street food stall', '🍜', 0], ['A family dinner at home', '🍳', 1], ['A free library book', '📚', 1]] },
    say: 'A market is any place or way in which buyers and sellers trade goods and services. It does not have to be a building: it can be online or by phone.',
    plain: 'A [[market]] is any place or way where [[buyer|buyers]] and [[seller|sellers]] trade. It can be online.',
    vi: 'Thị trường là bất kỳ nơi hay cách nào để người mua và người bán trao đổi hàng hóa, dịch vụ. Không cần là một tòa nhà: có thể trên mạng hoặc qua điện thoại.',
    checks: [
      c('Which of these is a market?', 'Which one is a [[market]]?', [['An app to buy clothes', 'An app to buy clothes'], ['A family meal at home', 'A family meal at home'], ['A free public park', 'A free park'], ['A school sports day', 'A sports day']], 'Buyers and sellers trade on the app.'),
      c('What does every market need?', 'What does every [[market]] need?', [['Buyers and sellers who trade', 'Buyers and sellers'], ['A large building with stalls', 'A big building'], ['A government officer', 'A government officer'], ['Goods that are free', 'Free goods']], 'A market needs buyers and sellers.'),
      c('Lan sells her old phone online to a stranger. Is this a market?', 'Lan sells her old phone on the internet. Is it a [[market]]?', [['Yes, a buyer and a seller trade', 'Yes: a buyer and a seller trade'], ['No, there is no building', 'No: there is no building'], ['No, the phone is second-hand', 'No: the phone is old'], ['Only if the government agrees', 'Only if the government says yes']], 'Online trade between a buyer and a seller is a market.'),
      c('Which is NOT a market?', 'Which one is NOT a [[market]]?', [['Friends sharing food for free', 'Friends sharing food'], ['A night market in District 5', 'A night market'], ['A Grab food delivery order', 'A Grab food order'], ['A phone shop in Thủ Đức', 'A phone shop']], 'Nobody buys or sells when food is shared for free.')
    ]
  },
  'two-hats': {
    builder: { type: 'sort', q: 'Put on a hat! Who says it: the buyer or the seller?', buckets: ['🧢 Buyer', '🎩 Seller'],
      items: [['"I want a LOW price"', '🛒', 0], ['"I want a HIGH price"', '💰', 1], ['"If the price falls, I buy more"', '⬇️', 0], ['"If the price rises, I want to sell more"', '⬆️', 1], ['"I pay the money"', '💸', 0], ['"I get the money and the profit"', '🏪', 1]] },
    say: 'Buyers (consumers) want low prices and buy more when the price falls. Sellers (producers) want high prices and sell more when the price rises, because they make more profit.',
    plain: '[[buyer|Buyers]] want LOW prices. [[seller|Sellers]] want HIGH prices, because they get more [[profit]].',
    vi: 'Người mua muốn giá thấp và mua nhiều hơn khi giá giảm. Người bán muốn giá cao và bán nhiều hơn khi giá tăng vì lãi nhiều hơn.',
    checks: [
      c('Who is happy when the price of rice rises?', 'The price of rice goes UP. Who is happy?', [['The rice sellers', 'The sellers'], ['The rice buyers', 'The buyers'], ['Both of them', 'Both'], ['Neither of them', 'Nobody']], 'Sellers get more money for each bag.'),
      c('The price of phở falls. What do buyers do?', 'Phở gets cheaper. What do [[buyer|buyers]] do?', [['They buy more phở', 'They buy more'], ['They buy less phở', 'They buy less'], ['They sell their phở', 'They sell phở'], ['They stop eating phở', 'They stop eating it']], 'Buyers buy more at a lower price.'),
      c('The price of durian rises. What do sellers want to do?', 'Durian gets dearer. What do [[seller|sellers]] want to do?', [['Offer more durian for sale', 'Sell more durian'], ['Offer less durian for sale', 'Sell less durian'], ['Buy more durian themselves', 'Buy more durian'], ['Give their durian away', 'Give durian away']], 'More profit on each one: sellers want to sell more.'),
      c('Why do sellers want a high price?', 'Why do [[seller|sellers]] like a HIGH price?', [['They make more profit', 'More [[profit]]'], ['They can buy more goods', 'They can buy more'], ['Their costs disappear', 'Their costs go away'], ['Buyers will buy more', 'Buyers buy more']], 'A higher price means more profit on each unit.')
    ]
  },
  'inside-outside': {
    builder: { type: 'sort', q: 'Bubble tea. Is the change the price of bubble tea itself (on the price axis), or something else?', buckets: ['Its own price: move along', 'Something else: shift'],
      items: [['Bubble tea goes up to 50,000 đồng', '🧋', 0], ['Bubble tea goes down to 30,000 đồng', '🧋', 0], ['Parents get a pay rise', '💵', 1], ['Milk costs more', '🥛', 1], ['An advert on TikTok', '📺', 1], ['Coffee gets cheaper', '☕', 1]] },
    say: 'The price of the good itself is on the vertical axis, so a change in it is shown by a movement along the curve. A change in anything else that is not on the axes shifts the whole curve.',
    plain: 'The good\'s OWN price is on the [[axis]]: move ALONG the curve. Anything else: the curve [[shift|shifts]].',
    vi: 'Giá của chính hàng hóa nằm trên trục tung, nên khi giá đổi ta di chuyển dọc đường. Thay đổi khác (không có trên trục) làm cả đường dịch chuyển.',
    checks: [
      c('Which change is shown by a movement along the demand curve for phở?', 'Which one is a move ALONG the phở curve?', [['The price of phở rises', 'Phở costs more'], ['People earn more money', 'People earn more'], ['A TV advert for phở', 'A phở advert'], ['More people move to the city', 'More people in the city']], 'Only phở\'s own price is on the axis.'),
      c('Why does a change in income shift the demand curve?', 'Why does [[income]] SHIFT the curve?', [['Income is not on the axes', 'Income is not on the [[axis]]'], ['Income is the price of the good', 'Income is the price'], ['Income is on the price axis', 'Income is on the price axis'], ['Income never changes demand', 'Income does not matter']], 'Anything not on the axes shifts the curve.'),
      c('A famous singer advertises bubble tea. For bubble tea demand this is...', 'A singer advertises bubble tea. For bubble tea [[demand]] this is...', [['a shift of the curve', 'a shift'], ['a movement along the curve', 'a movement along'], ['no change at all', 'no change'], ['a change in its price', 'a price change']], 'An advert is not the price of bubble tea itself.'),
      c('What is on the vertical axis of a demand curve?', 'What is on the UP axis?', [['The price of the good', 'The price'], ['The income of buyers', 'Income'], ['The number of sellers', 'Number of sellers'], ['The cost of production', 'The cost']], 'Price on the vertical axis, quantity on the horizontal.')
    ]
  },
  'price-signal': {
    builder: { type: 'cards', q: 'The price of durian doubles. Tap each card to see what happens next.',
      cards: [['1. What does the high price TELL farmers?', 'A signal: buyers want more durian.'], ['2. What does it MEAN for a farmer?', 'More profit for each durian: an incentive.'], ['3. What do farmers DO?', 'Plant more durian trees, hire more workers.'], ['4. What happens to RESOURCES?', 'Land and labour move from other crops to durian.'], ['5. And if the price FALLS?', 'The opposite: farmers grow less, and resources move away.']] },
    say: 'A change in price acts as a signal and an incentive. A higher price signals that buyers want more and offers more profit, so producers move resources into making the good. A lower price does the opposite.',
    plain: 'A higher price is a [[signal]]: buyers want more. It is an [[incentive]]: more [[profit]]. So firms move [[resources]] to make it.',
    vi: 'Giá là tín hiệu và động lực. Giá tăng báo hiệu người mua muốn nhiều hơn và mang lại nhiều lợi nhuận hơn, nên nhà sản xuất chuyển nguồn lực sang làm hàng đó.',
    checks: [
      c('The price of mangoes rises. What does this signal?', 'Mangoes get dearer. What does this TELL farmers?', [['Buyers want more mangoes', 'People want more'], ['Buyers want fewer mangoes', 'People want fewer'], ['Mangoes are a free good', 'Mangoes are free'], ['Farmers must stop selling', 'Farmers must stop']], 'A higher price signals high demand.'),
      c('Why does a higher price give farmers an incentive to grow more?', 'Why do farmers WANT to grow more?', [['They can make more profit', 'More [[profit]]'], ['Their costs fall to zero', 'Their costs are zero'], ['Buyers will pay less', 'Buyers pay less'], ['The government orders it', 'The government says so']], 'An incentive is the chance of more profit.'),
      c('The price of DVDs keeps falling. What happens to resources?', 'DVDs keep getting cheaper. What happens to [[resources]]?', [['They move to other goods', 'They go to other goods'], ['They move into DVDs', 'They go into DVDs'], ['They are destroyed', 'They are destroyed'], ['Nothing happens to them', 'Nothing happens']], 'Lower prices and profits push resources away.'),
      c('In a market system, what moves resources between goods?', 'What MOVES resources between goods?', [['Changes in prices', 'Prices changing'], ['Orders from the state', 'Government orders'], ['The weather each year', 'The weather'], ['Chance and luck', 'Luck']], 'The price mechanism allocates resources.')
    ]
  },
  'eff-demand': {
    builder: { type: 'budget', q: 'You have 60,000 đồng. You WANT all of these. Tap what you can actually buy.', money: 60000,
      items: [['Bubble tea', '🧋', 40000], ['Bánh mì', '🥖', 20000], ['A new phone', '📱', 8000000], ['A motorbike', '🏍️', 30000000], ['A sticker', '⭐', 10000]],
      after: 'You WANTED all five, but you could only buy what your money allowed. Only those count as [[demand]]: [[effective demand]] means willing AND able to pay.' },
    say: 'Demand is effective demand: the quantity buyers are willing and able to buy at each price. A want without the money to pay for it is not demand.',
    plain: '[[demand|Demand]] = you WANT it AND you CAN pay. Wanting without money is not demand.',
    vi: 'Cầu là cầu có khả năng thanh toán: muốn mua VÀ có tiền để mua. Chỉ muốn mà không có tiền thì không phải là cầu.',
    checks: [
      c('Which is an example of demand?', 'Which one is [[demand]]?', [['Lan buys tea for 40,000 đồng', 'Lan pays for her tea'], ['Lan dreams of a sports car', 'Lan wants a sports car'], ['Lan wants a phone with no money', 'Lan wants a phone, no money'], ['Lan looks at a shop window', 'Lan looks in a shop']], 'Demand means willing and able to pay.'),
      c('Effective demand means...', '[[effective demand|Effective demand]] means...', [['willing and able to buy', 'want it and can pay'], ['wanting a good very much', 'wanting it a lot'], ['needing a good to live', 'needing it to live'], ['selling a good for profit', 'selling it for profit']], 'Both willing and able.'),
      c('Minh wants a 30 million đồng motorbike but has 1 million đồng. This is...', 'Minh wants a motorbike but has little money. This is...', [['a want, not demand', 'a want, not demand'], ['effective demand', 'effective demand'], ['market supply', 'market supply'], ['an incentive', 'an incentive']], 'He is not able to pay.'),
      c('Demand is measured...', 'We measure [[demand]]...', [['at each price, over a period', 'at each price, in a time'], ['only at one fixed price', 'at one price only'], ['by the number of sellers', 'by counting sellers'], ['by the cost of making it', 'by the cost']], 'Quantity at each price, in a period of time.')
    ]
  },
  'market-3q': {
    builder: { type: 'sort', q: 'A market system answers the three questions. Which question does each answer?', buckets: ['What?', 'How?', 'For whom?'],
      items: [['Make more bubble tea, because people buy it', '🧋', 0], ['Stop making DVDs', '📀', 0], ['Use machines because wages are high', '🤖', 1], ['Use the cheapest method', '⚙️', 1], ['Sell to people who can pay the price', '💳', 2], ['Goods go to buyers with the money', '🛍️', 2]] },
    say: 'In a market system the price mechanism answers the three questions. What: goods consumers are willing and able to buy. How: the cheapest method, to maximise profit. For whom: the people willing and able to pay the price.',
    plain: 'In a [[market system]]: WHAT = what people buy. HOW = the cheapest way. FOR WHOM = people who can pay.',
    vi: 'Trong hệ thống thị trường, cơ chế giá trả lời ba câu hỏi: sản xuất cái gì (hàng người tiêu dùng mua), như thế nào (cách rẻ nhất), cho ai (người sẵn lòng và có khả năng trả).',
    checks: [
      c('In a market system, who decides what is produced?', 'Who decides WHAT to make?', [['Buyers and sellers via prices', 'Buyers and sellers, by prices'], ['A central government plan', 'The government, with a plan'], ['The biggest bank in the city', 'The biggest bank in the city'], ['The workers in each firm', 'The workers in each firm']], 'The price mechanism, not a plan.'),
      c('In a market system, who gets the goods?', 'In a [[market system]], who gets the goods (FOR WHOM)?', [['Those who can pay the price', 'People who can pay'], ['Those who need them most', 'People who need them most'], ['Those who ask first', 'People who ask first'], ['Those the state picks', 'People the government picks']], 'Goods go to those willing and able to pay.'),
      c('Wages rise, so a factory buys robots. Which question is this?', 'Workers cost more, so a factory buys robots. Which question?', [['How to produce', 'HOW'], ['What to produce', 'WHAT'], ['For whom', 'FOR WHOM'], ['How much to tax', 'HOW MUCH TAX']], 'The method of production: HOW.'),
      c('People buy fewer DVDs and firms stop making them. Which question?', 'People buy fewer DVDs. Firms stop making them. Which question?', [['What to produce', 'WHAT'], ['How to produce', 'HOW'], ['For whom', 'FOR WHOM'], ['Where to sell', 'WHERE']], 'Which goods to make: WHAT.')
    ]
  },
  'law-demand': {
    builder: { type: 'curve', curve: 'D', q: 'Be the buyer. Move the price of bubble tea and watch how many cups people buy.',
      after: 'Price UP → fewer cups. Price DOWN → more cups. So the [[demand curve]] slopes DOWN.' },
    say: 'As the price of a good rises, the quantity demanded falls; as the price falls, the quantity demanded rises. So the demand curve slopes downwards from left to right.',
    plain: 'Price goes UP: people buy LESS. Price goes DOWN: people buy MORE. The [[demand curve]] goes DOWN.',
    vi: 'Giá tăng thì lượng cầu giảm; giá giảm thì lượng cầu tăng. Vì vậy đường cầu dốc xuống từ trái sang phải.',
    checks: [
      c('The price of bubble tea falls. The quantity demanded...', 'Bubble tea gets cheaper. People buy...', [['rises', 'more'], ['falls', 'less'], ['stays the same', 'the same'], ['becomes zero', 'none']], 'Lower price, higher quantity demanded.'),
      c('Which way does a demand curve slope?', 'Which way does the [[demand curve]] go?', [['Down from left to right', 'Down to the right'], ['Up from left to right', 'Up to the right'], ['It is flat', 'Flat'], ['It is vertical', 'Straight up']], 'Down from left to right.'),
      c('At 30,000 đồng, 100 cups are demanded. At 50,000 đồng, the quantity demanded is most likely...', 'At 30,000 đồng, people buy 100 cups. At 50,000 đồng they buy...', [['60 cups', '60 cups'], ['140 cups', '140 cups'], ['100 cups', '100 cups'], ['200 cups', '200 cups']], 'A higher price: fewer cups.'),
      c('Why do people buy more when the price falls?', 'Why do people buy MORE when it is cheaper?', [['Their money buys more of it', 'Their money buys more'], ['Sellers make more profit', 'Sellers get more profit'], ['The good gets worse', 'The good is worse'], ['Their income falls', 'They earn less']], 'Cheaper goods: money goes further, and people switch from other goods.')
    ]
  },
  'law-supply': {
    builder: { type: 'curve', curve: 'S', q: 'Be the seller (Chị Thu and the other stalls). Move the price and watch how many cups they make.',
      after: 'Price UP → more [[profit]] → more cups. Price DOWN → fewer cups. So the [[supply curve]] slopes UP.' },
    say: 'As the price of a good rises, the quantity supplied rises, because producers can earn more profit. So the supply curve slopes upwards from left to right.',
    plain: 'Price goes UP: sellers make MORE, because they get more [[profit]]. The [[supply curve]] goes UP.',
    vi: 'Giá tăng thì lượng cung tăng vì nhà sản xuất lãi nhiều hơn. Vì vậy đường cung dốc lên từ trái sang phải.',
    checks: [
      c('The price of bánh mì rises. The quantity supplied...', 'Bánh mì gets dearer. Sellers make...', [['rises', 'more'], ['falls', 'less'], ['stays the same', 'the same'], ['becomes zero', 'none']], 'Higher price, higher quantity supplied.'),
      c('Which way does a supply curve slope?', 'Which way does the [[supply curve]] go?', [['Up from left to right', 'Up to the right'], ['Down from left to right', 'Down to the right'], ['It is flat', 'Flat'], ['It is vertical', 'Straight up']], 'Up from left to right.'),
      c('Why do firms supply more at a higher price?', 'Why do firms make MORE when the price is higher?', [['They earn more profit', 'More [[profit]]'], ['Buyers want more', 'Buyers want more'], ['Their costs fall', 'Costs go down'], ['They pay less tax', 'Less tax']], 'The profit motive.'),
      c('At 40,000 đồng, 80 cups are supplied. At 30,000 đồng, the quantity supplied is most likely...', 'At 40,000 đồng, sellers make 80 cups. At 30,000 đồng they make...', [['60 cups', '60 cups'], ['100 cups', '100 cups'], ['80 cups', '80 cups'], ['160 cups', '160 cups']], 'A lower price: fewer cups supplied.')
    ]
  },
  'market-demand': {
    builder: { type: 'tapone', q: 'At 40,000 đồng a cup, Lan buys 3 cups a week, Minh 2 and An 5. What is the demand of the three together?',
      items: [['10 cups', '🧋'], ['5 cups', '🧋'], ['3 cups', '🧋'], ['40,000 đồng', '💵']], answer: 0,
      right: '3 + 2 + 5 = 10. Market demand adds every buyer at the same price.', wrong: 'Add all three buyers at the same price: 3 + 2 + 5 = 10 cups.' },
    say: 'Individual demand is the demand of one consumer. Market demand is the total demand of all consumers, found by adding their quantities demanded at each price.',
    plain: '[[individual demand|Individual demand]]: one buyer. [[market demand|Market demand]]: ADD all the buyers at each price.',
    vi: 'Cầu cá nhân là cầu của một người mua. Cầu thị trường là tổng cầu của tất cả người mua tại mỗi mức giá.',
    checks: [
      c('How is market demand found?', 'How do we get [[market demand]]?', [['Add all buyers at each price', 'Add all buyers'], ['Take the biggest buyer', 'Take the biggest buyer'], ['Average the prices', 'Average the prices'], ['Add all the sellers', 'Add all sellers']], 'Add quantities at each price.'),
      c('At 30,000 đồng, Lan buys 4, Minh 3, An 6. Market demand is...', 'At 30,000 đồng: 4 + 3 + 6 cups. [[market demand|Market demand]] is...', [['13 cups', '13 cups'], ['6 cups', '6 cups'], ['10 cups', '10 cups'], ['4 cups', '4 cups']], '4 + 3 + 6 = 13.'),
      c('More people move into District 3. Market demand for bubble tea...', 'More people live in District 3. Market demand...', [['rises at every price', 'goes up'], ['falls at every price', 'goes down'], ['stays the same', 'stays the same'], ['contracts along', 'contracts']], 'More buyers to add: market demand rises.'),
      c('Individual demand means the demand of...', '[[individual demand|Individual demand]] is the demand of...', [['one consumer', 'one buyer'], ['all consumers', 'all buyers'], ['one firm', 'one seller'], ['the government', 'the government']], 'One consumer.')
    ]
  },
  'market-supply': {
    builder: { type: 'tapone', q: 'At 40,000 đồng a cup, Chị Thu sells 30 cups a day, stall B 25 and stall C 25. What is the market supply?',
      items: [['80 cups', '🧋'], ['30 cups', '🧋'], ['25 cups', '🧋'], ['3 stalls', '🏪']], answer: 0,
      right: '30 + 25 + 25 = 80. Market supply adds every seller at the same price.', wrong: 'Add all the sellers at the same price: 30 + 25 + 25 = 80 cups.' },
    say: 'Individual supply is the supply of one producer. Market supply is the total supply of all producers, found by adding their quantities supplied at each price.',
    plain: 'One seller: individual supply. [[market supply|Market supply]]: ADD all the sellers at each price.',
    vi: 'Cung cá nhân là cung của một người bán. Cung thị trường là tổng cung của tất cả người bán tại mỗi mức giá.',
    checks: [
      c('How is market supply found?', 'How do we get [[market supply]]?', [['Add all sellers at each price', 'Add all sellers'], ['Take the biggest seller', 'Take the biggest seller'], ['Add all the buyers', 'Add all buyers'], ['Average the prices', 'Average the prices']], 'Add quantities at each price.'),
      c('At 50,000 đồng the stalls sell 35, 33 and 32 cups. Market supply is...', '35 + 33 + 32 cups. [[market supply|Market supply]] is...', [['100 cups', '100 cups'], ['35 cups', '35 cups'], ['80 cups', '80 cups'], ['110 cups', '110 cups']], '35 + 33 + 32 = 100.'),
      c('Ten new stalls open. Market supply of bubble tea...', 'Ten new stalls open. Market supply...', [['rises at every price', 'goes up'], ['falls at every price', 'goes down'], ['stays the same', 'stays the same'], ['contracts along', 'contracts']], 'More sellers to add: market supply rises.'),
      c('Market supply at 50,000 đồng is bigger than at 40,000 đồng because...', 'At 50,000 đồng, market supply is BIGGER because...', [['each seller supplies more', 'each seller makes more'], ['each buyer buys more', 'each buyer buys more'], ['costs are higher', 'costs are higher'], ['stalls close down', 'stalls close']], 'A higher price: every seller supplies more.')
    ]
  },
  'ext-con': {
    builder: { type: 'curve', curve: 'D', names: true, q: 'Move the price. Each move along the curve has a name: extension or contraction.',
      after: 'Price DOWN → bigger quantity: an [[extension]]. Price UP → smaller quantity: a [[contraction]]. The curve itself never moved.' },
    say: 'A change in the price of the good itself causes a movement along its demand (or supply) curve. A movement to a larger quantity is an extension; a movement to a smaller quantity is a contraction.',
    plain: 'Own price changes → move ALONG the curve. Bigger quantity = [[extension]]. Smaller quantity = [[contraction]].',
    vi: 'Khi giá của chính hàng hóa thay đổi, ta di chuyển dọc đường cầu (hoặc cung). Lượng lớn hơn là mở rộng; lượng nhỏ hơn là thu hẹp.',
    checks: [
      c('The price of phở falls. On the demand curve this is...', 'Phở gets cheaper. On the demand curve this is...', [['an extension of demand', 'an [[extension]]'], ['a contraction of demand', 'a [[contraction]]'], ['a shift to the right', 'a shift right'], ['a shift to the left', 'a shift left']], 'Lower price, bigger quantity demanded: extension.'),
      c('The price of bubble tea rises from 40,000 to 50,000 đồng. On the demand curve this is...', 'Bubble tea goes from 40,000 to 50,000 đồng. On the demand curve this is...', [['a contraction of demand', 'a [[contraction]]'], ['an extension of demand', 'an [[extension]]'], ['a shift to the left', 'a shift left'], ['a shift to the right', 'a shift right']], 'Higher price, smaller quantity demanded: contraction.'),
      c('What causes a contraction of demand?', 'What causes a [[contraction]] of demand?', [['A rise in the good\'s price', 'Its price goes up'], ['A fall in buyers\' income', 'People earn less'], ['A bad advert', 'A bad advert'], ['A fall in its price', 'Its price goes down']], 'Only the own price; a rise gives a contraction.'),
      c('During an extension of demand, the demand curve...', 'In an [[extension]], the demand curve...', [['does not move', 'stays still'], ['shifts right', 'moves right'], ['shifts left', 'moves left'], ['gets steeper', 'gets steeper']], 'Movement along: the curve stays where it is.')
    ]
  },
  'demand-causes': {
    builder: { type: 'curveshift', curve: 'D', q: 'Tap each event. Watch the demand curve for bubble tea: does it shift, and which way?' },
    say: 'The demand curve shifts when a condition of demand changes: income, the price of substitutes or complements, advertising, tastes and fashion, or population. An increase in demand shifts it right; a decrease shifts it left.',
    plain: 'The [[demand curve]] SHIFTS when [[income]], [[substitute|substitutes]], [[complement|complements]], adverts, tastes or population change. More: RIGHT. Less: LEFT.',
    vi: 'Đường cầu dịch chuyển khi các yếu tố khác giá thay đổi: thu nhập, giá hàng thay thế hoặc bổ sung, quảng cáo, thị hiếu, dân số. Cầu tăng: dịch phải. Cầu giảm: dịch trái.',
    checks: [
      c('Incomes rise. Demand for restaurant meals...', 'People earn more. Demand for restaurant meals...', [['shifts right', 'moves right'], ['shifts left', 'moves left'], ['extends', 'extends along'], ['does not change', 'stays the same']], 'More income: more demand at every price.'),
      c('Coffee gets dearer. Demand for tea (a substitute)...', 'Coffee costs more. Demand for tea (a [[substitute]])...', [['shifts right', 'moves right'], ['shifts left', 'moves left'], ['contracts', 'contracts along'], ['does not change', 'stays the same']], 'People switch to the substitute.'),
      c('Petrol gets much dearer. Demand for motorbikes (a complement)...', 'Petrol costs much more. Demand for motorbikes (a [[complement]])...', [['shifts left', 'moves left'], ['shifts right', 'moves right'], ['extends', 'extends along'], ['does not change', 'stays the same']], 'Complements are used together: less demand.'),
      c('Which would shift demand for bubble tea to the right?', 'Which one moves bubble tea demand RIGHT?', [['A popular advert', 'A popular advert'], ['A rise in its price', 'Its price goes up'], ['A health warning', 'A health warning'], ['Lower incomes', 'People earn less']], 'Advertising increases demand at every price.')
    ]
  },
  'supply-causes': {
    builder: { type: 'curveshift', curve: 'S', q: 'Tap each event. Watch the supply curve for bubble tea: does it shift, and which way?' },
    say: 'The supply curve shifts when a condition of supply changes: costs of production, technology, taxes and subsidies, the weather, or the number of firms. An increase in supply shifts it right; a decrease shifts it left.',
    plain: 'The [[supply curve]] SHIFTS when [[costs of production|costs]], [[technology]], [[tax|taxes]], [[subsidy|subsidies]], weather or the number of firms change. More: RIGHT. Less: LEFT.',
    vi: 'Đường cung dịch chuyển khi các yếu tố khác giá thay đổi: chi phí sản xuất, công nghệ, thuế, trợ cấp, thời tiết, số lượng doanh nghiệp. Cung tăng: dịch phải. Cung giảm: dịch trái.',
    checks: [
      c('Wages for café workers rise. Supply of coffee...', 'Café workers get more [[wages]]. Coffee [[supply]]...', [['shifts left', 'moves left'], ['shifts right', 'moves right'], ['extends', 'extends along'], ['does not change', 'stays the same']], 'Higher costs: less supplied at every price.'),
      c('A subsidy is given to rice farmers. Supply of rice...', 'Rice farmers get a [[subsidy]]. Rice [[supply]]...', [['shifts right', 'moves right'], ['shifts left', 'moves left'], ['contracts', 'contracts along'], ['does not change', 'stays the same']], 'A subsidy lowers costs: supply rises.'),
      c('A typhoon destroys much of the rice crop. Supply of rice...', 'A typhoon destroys rice. Rice [[supply]]...', [['shifts left', 'moves left'], ['shifts right', 'moves right'], ['extends', 'extends along'], ['does not change', 'stays the same']], 'Bad weather: less supply.'),
      c('Which would shift the supply of phones to the right?', 'Which one moves phone supply RIGHT?', [['Better technology', 'Better [[technology]]'], ['A new tax on phones', 'A new [[tax]]'], ['Higher wages', 'Higher [[wages]]'], ['A rise in its price', 'Its price goes up']], 'Better technology lowers costs.')
    ]
  },
  // ---------- 2.4 and 2.5
  'shortage-surplus': {
    builder: { type: 'market', q: 'Mangoes at a city market. Move the price and compare buyers (D) and sellers (S). Try a low price and a high price.',
      after: 'Price BELOW equilibrium: buyers want more than sellers offer, a [[shortage]], so the price is pushed UP. Price ABOVE: a [[surplus]], so the price is pushed DOWN.' },
    say: 'At a price below equilibrium, quantity demanded is greater than quantity supplied: a shortage. Buyers compete, so the price rises. At a price above equilibrium, quantity supplied is greater than quantity demanded: a surplus. Sellers cut prices, so the price falls. The size of the gap is the difference between the two quantities.',
    plain: 'Price too LOW: buyers want more than sellers have, a [[shortage]], so the price goes UP. Price too HIGH: sellers have too much, a [[surplus]], so the price goes DOWN.',
    vi: 'Giá thấp hơn mức cân bằng: lượng cầu lớn hơn lượng cung, gọi là thiếu hụt, nên giá bị đẩy lên. Giá cao hơn: lượng cung lớn hơn lượng cầu, gọi là dư thừa, nên giá bị đẩy xuống.',
    checks: [
      c('At a price below equilibrium there is...', 'The price is LOWER than [[equilibrium]]. There is...', [['a shortage', 'a [[shortage]]'], ['a surplus', 'a [[surplus]]'], ['equilibrium', '[[equilibrium]]'], ['no demand', 'no demand']], 'Low price: buyers want more than sellers offer.'),
      c('At 30k, Qd = 100 and Qs = 60. What is there?', 'At 30k: buyers 100, sellers 60. What is there?', [['A shortage of 40', 'A [[shortage]] of 40'], ['A surplus of 40', 'A [[surplus]] of 40'], ['A shortage of 160', 'A [[shortage]] of 160'], ['A shortage of 100', 'A [[shortage]] of 100']], '100 − 60 = 40 short.'),
      c('There is a surplus. What happens to the price?', 'There is a [[surplus]]. What happens to the price?', [['It falls', 'It goes down'], ['It rises', 'It goes up'], ['It stays the same', 'It stays the same'], ['It becomes zero', 'It becomes zero']], 'Sellers cut prices to sell their stock.'),
      c('Why does a shortage push the price up?', 'Why does a [[shortage]] make the price go UP?', [['Buyers compete for the goods', 'Buyers compete to get one'], ['Sellers have too much stock', 'Sellers have too many'], ['The government adds a tax', 'A new [[tax]]'], ['Costs fall for the sellers', 'Costs go down']], 'Buyers offer more to get the scarce goods.')
    ]
  },
  'equilibrium': {
    builder: { type: 'market', work: true, q: 'Start at a low price, then press "Let the market work" and watch where the price stops.',
      after: 'The price stops where quantity demanded = quantity supplied: the [[equilibrium price]]. There is no shortage and no surplus: the [[market clears]].' },
    say: 'Market equilibrium is where quantity demanded equals quantity supplied. At the equilibrium price the market clears: there is no shortage and no surplus, so there is no pressure on the price to change. Away from equilibrium, the price moves towards it, and quantities extend or contract along the curves.',
    plain: '[[equilibrium|Equilibrium]]: buyers want the SAME amount that sellers sell. No [[shortage]], no [[surplus]], so the price stays there.',
    vi: 'Cân bằng thị trường là khi lượng cầu bằng lượng cung. Ở giá cân bằng không có thiếu hụt hay dư thừa nên giá không còn áp lực thay đổi.',
    checks: [
      c('Market equilibrium is where...', '[[equilibrium|Equilibrium]] is where...', [['Qd equals Qs', 'buyers = sellers'], ['Qd is at its highest', 'buyers want the most'], ['the price is lowest', 'the price is lowest'], ['profit is highest', 'profit is highest']], 'Quantity demanded = quantity supplied.'),
      c('Price 30k: Qd 100, Qs 60. Price 40k: Qd 80, Qs 80. The equilibrium price is...', '30k: buyers 100, sellers 60. 40k: buyers 80, sellers 80. The [[equilibrium price]] is...', [['40k', '40k'], ['30k', '30k'], ['35k', '35k'], ['80k', '80k']], 'At 40k the two quantities are equal.'),
      c('Why does the price stay at equilibrium?', 'Why does the price STAY at [[equilibrium]]?', [['No shortage or surplus pushes it', 'Nothing pushes it up or down'], ['The government fixes it there', 'The government fixes it'], ['Sellers agree on one price', 'Sellers agree on a price'], ['Buyers stop buying the good', 'Buyers stop buying']], 'With no gap, there is no pressure to change.'),
      c('A surplus exists. As the price falls to equilibrium...', 'There is a [[surplus]]. The price falls to [[equilibrium]]. Then...', [['demand extends, supply contracts', 'buyers want more, sellers offer less'], ['demand shifts to the right', 'the demand curve moves right'], ['supply shifts to the left', 'the supply curve moves left'], ['demand contracts, supply extends', 'buyers want less, sellers offer more']], 'Movements along the curves, not shifts.')
    ]
  },
  'price-chain': {
    builder: { type: 'chain', q: 'Chain it! Three steps for every price change.',
      events: [['A famous singer advertises bubble tea', 'D', 1, 'up', 'up'], ['A typhoon destroys durian farms', 'S', -1, 'up', 'down'], ['Cafés get faster, cheaper coffee machines', 'S', 1, 'down', 'up']] },
    say: 'To analyse a price change, use three steps. 1: Which curve shifts, demand or supply? Buyers\' reasons move demand; sellers\' reasons move supply. 2: Which way? More at every price is a shift right, less is a shift left. 3: What happens to the equilibrium price and quantity? A demand shift moves price and quantity the same way; a supply shift moves them in opposite ways.',
    plain: 'Three steps. 1. Which curve moves: demand (buyers) or supply (sellers)? 2. Which way: right (more) or left (less)? 3. What happens to price and quantity?',
    vi: 'Ba bước: 1. Đường nào dịch chuyển: cầu (người mua) hay cung (người bán)? 2. Hướng nào: phải (nhiều hơn) hay trái (ít hơn)? 3. Giá và lượng cân bằng thay đổi thế nào?',
    checks: [
      c('Milk becomes more expensive. For bubble tea, which curve shifts?', 'Milk costs more. For bubble tea, which curve moves?', [['Supply'], ['Demand'], ['Both'], ['Neither']], 'Milk is a cost for the sellers.'),
      c('Supply shifts left. What happens to price and quantity?', 'Supply moves LEFT. Price and quantity?', [['Price up, quantity down', 'Price up, quantity down'], ['Price up, quantity up', 'Price up, quantity up'], ['Price down, quantity down', 'Price down, quantity down'], ['Price down, quantity up', 'Price down, quantity up']], 'A supply shift: price and quantity move in opposite ways.'),
      c('Incomes rise. What happens in the market for restaurant meals?', 'People earn more. Restaurant meals?', [['D right: P up, Q up', 'Demand right: price up, quantity up'], ['S right: P down, Q up', 'Supply right: price down, quantity up'], ['D left: P down, Q down', 'Demand left: price down, quantity down'], ['D right: P up, Q down', 'Demand right: price up, quantity down']], 'Demand shifts right; P and Q both rise.'),
      c('Demand shifts right and supply shifts left at once. The price...', 'Demand moves right AND supply moves left. The price...', [['rises for sure', 'goes up for sure'], ['falls for sure', 'goes down for sure'], ['stays the same', 'stays the same'], ['might rise or fall', 'might go up or down']], 'Both shifts push the price up; only quantity depends.')
    ]
  },
  // ---------------- 2.6 Price elasticity of demand ----------------
  'pct-change': {
    builder: { type: 'sort', q: 'Each price rises. Is it a rise of 25% or of 50%? (Divide by the OLD price.)', buckets: ['A 25% rise', 'A 50% rise'],
      items: [['40 → 50', '📈', 0], ['20 → 25', '📈', 0], ['80 → 100', '📈', 0], ['20 → 30', '📈', 1], ['40 → 60', '📈', 1], ['100 → 150', '📈', 1]] },
    say: 'A percentage change compares the change with the starting value: (new − old) ÷ old × 100. A rise from 40 to 50 is 10 ÷ 40 × 100 = 25%. Always divide by the old value.',
    plain: 'A [[percentage change]] is (new − old) ÷ OLD × 100. From 40 to 50: 10 ÷ 40 × 100 = 25%.',
    vi: 'Phần trăm thay đổi = (giá trị mới − giá trị cũ) ÷ giá trị cũ × 100. Từ 40 lên 50: 10 ÷ 40 × 100 = 25%. Luôn chia cho giá trị cũ.',
    checks: [
      c('The price rises from 20 to 30. What is the percentage change?', 'From 20 to 30. What is the [[percentage change]]?', [['+50%'], ['+33%'], ['+10%'], ['+150%']], '10 ÷ 20 × 100 = 50%.'),
      c('Sales fall from 200 to 150. What is the percentage change?', 'Sales go from 200 to 150. What is the % change?', [['−25%'], ['−33%'], ['−50%'], ['−150%']], '−50 ÷ 200 × 100 = −25%.'),
      c('In a percentage change, which number do you divide by?', 'Which number do you divide by?', [['The old (starting) value', 'The OLD number'], ['The new (final) value', 'The NEW number'], ['The change itself', 'The change'], ['Always 100', 'Always 100']], 'Divide by the starting value, then multiply by 100.'),
      c('A price falls from 50 to 40. What is the percentage change?', 'From 50 down to 40. What is the % change?', [['−20%'], ['−25%'], ['−10%'], ['+20%']], '−10 ÷ 50 × 100 = −20%.')
    ]
  },
  'ped-calc': {
    builder: { type: 'sort', q: 'Work out the PED: is it −2 or −0.5? (% change in quantity ÷ % change in price)', buckets: ['PED = −2', 'PED = −0.5'],
      items: [['Price +10%, quantity −20%', '🧋', 0], ['Price +5%, quantity −10%', '🎬', 0], ['Price −20%, quantity +40%', '📱', 0], ['Price +20%, quantity −10%', '⛽', 1], ['Price +10%, quantity −5%', '🍚', 1], ['Price −40%, quantity +20%', '💡', 1]] },
    say: 'Price elasticity of demand (PED) measures how much the quantity demanded responds to a change in the good\'s own price. PED = % change in quantity demanded ÷ % change in price. Quantity goes on top.',
    plain: '[[PED]] = % change in [[quantity demanded]] ÷ % change in price. Quantity goes on TOP.',
    vi: 'Độ co giãn của cầu theo giá (PED) = % thay đổi lượng cầu ÷ % thay đổi giá. Lượng cầu ở trên, giá ở dưới.',
    checks: [
      c('The price rises by 10% and quantity demanded falls by 30%. What is the PED?', 'Price +10%, quantity −30%. What is the [[PED]]?', [['−3'], ['−0.3'], ['−20'], ['−40']], '−30 ÷ 10 = −3.'),
      c('What goes on top of the PED formula?', 'What goes on TOP of the [[PED]] formula?', [['% change in quantity demanded', '% change in quantity'], ['% change in the price of the good', '% change in price'], ['The new price of the good', 'The new price'], ['The total revenue of the firm', 'Total revenue']], 'PED = % change in quantity demanded ÷ % change in price.'),
      c('The price falls by 20% and quantity demanded rises by 10%. What is the PED?', 'Price −20%, quantity +10%. What is the [[PED]]?', [['−0.5'], ['−2'], ['+0.5'], ['−30']], '+10 ÷ −20 = −0.5.'),
      c('What does PED measure?', 'What does [[PED]] measure?', [['How buyers react to a price change', 'How much buyers react to the price'], ['How sellers react to a price change', 'How much sellers react to the price'], ['How far the demand curve shifts', 'How far the demand curve moves'], ['How much profit a firm makes', 'How much profit firms make']], 'PED is about buyers (quantity demanded) and the good\'s own price.')
    ]
  },
  'ped-values': {
    builder: { type: 'sort', q: 'Elastic or inelastic? Ignore the minus sign and compare the number with 1.', buckets: ['Elastic', 'Inelastic'],
      items: [['PED −2', '🔺', 0], ['PED −1.5', '🔺', 0], ['PED −4', '🔺', 0], ['PED −0.3', '🔻', 1], ['PED −0.8', '🔻', 1], ['PED −0.5', '🔻', 1]] },
    say: 'To read a PED value, ignore the minus sign and compare the number with 1. More than 1: elastic. Less than 1: inelastic. Exactly 1: unitary elastic. 0: perfectly inelastic. Infinite: perfectly elastic. The minus sign only shows that price and quantity demanded move in opposite directions.',
    plain: 'Ignore the minus sign. More than 1: [[elastic]]. Less than 1: [[inelastic]]. Exactly 1: [[unitary elastic]].',
    vi: 'Bỏ dấu trừ và so sánh với 1. Lớn hơn 1: co giãn. Nhỏ hơn 1: kém co giãn. Bằng 1: co giãn đơn vị. Bằng 0: hoàn toàn không co giãn.',
    checks: [
      c('PED = −0.4. Demand is...', '[[PED]] = −0.4. Demand is...', [['inelastic'], ['elastic'], ['unitary elastic'], ['perfectly elastic']], '0.4 is less than 1.'),
      c('PED = −3. Demand is...', '[[PED]] = −3. Demand is...', [['elastic'], ['inelastic'], ['unitary elastic'], ['perfectly inelastic']], '3 is more than 1.'),
      c('Why is PED usually a negative number?', 'Why does [[PED]] have a minus sign?', [['Price and quantity move opposite ways', 'Price and quantity go opposite ways'], ['Demand is always inelastic', 'Demand is always inelastic'], ['Firms lose money on each sale', 'Firms lose money on each sale'], ['Price and quantity move the same way', 'Price and quantity go the same way']], 'Price up, quantity demanded down: the two changes have opposite signs.'),
      c('PED = 0. Demand is...', '[[PED]] = 0. Demand is...', [['perfectly inelastic'], ['perfectly elastic'], ['unitary elastic'], ['elastic']], 'Quantity demanded does not change at all.')
    ]
  },
  'ped-curves': {
    builder: { type: 'sort', q: 'Would you draw the demand curve steep or flat?', buckets: ['Steep (inelastic)', 'Flat (elastic)'],
      items: [['Petrol', '⛽', 0], ['Salt', '🧂', 0], ['Electricity', '💡', 0], ['One brand of bubble tea', '🧋', 1], ['A holiday in Phú Quốc', '🏝️', 1], ['One cinema\'s tickets', '🎬', 1]] },
    say: 'On a diagram, inelastic demand is drawn as a steep demand curve and elastic demand as a flat one. Perfectly inelastic demand is a vertical line (PED = 0), perfectly elastic demand is a horizontal line (PED infinite), and unitary elastic demand is a curve on which total revenue is the same at every price. A price change is shown by a movement along one curve; it does not shift the curve.',
    plain: '[[inelastic|Inelastic]]: a steep curve. [[elastic|Elastic]]: a flat curve. [[perfectly inelastic|Perfectly inelastic]]: vertical. [[perfectly elastic|Perfectly elastic]]: horizontal.',
    vi: 'Cầu kém co giãn: đường cầu dốc. Cầu co giãn: đường cầu thoải. Hoàn toàn không co giãn: đường thẳng đứng. Co giãn hoàn toàn: đường nằm ngang.',
    checks: [
      c('A vertical demand curve shows...', 'A demand curve that goes straight UP shows...', [['perfectly inelastic demand', 'perfectly inelastic'], ['perfectly elastic demand', 'perfectly elastic'], ['unitary elastic demand', 'unitary elastic'], ['a fall in demand', 'demand going down']], 'Quantity demanded is the same at every price: PED = 0.'),
      c('A horizontal demand curve shows...', 'A flat, level demand curve shows...', [['perfectly elastic demand', 'perfectly elastic'], ['perfectly inelastic demand', 'perfectly inelastic'], ['inelastic demand', 'inelastic'], ['a rise in demand', 'demand going up']], 'Any higher price and quantity demanded falls to zero.'),
      c('On a flat demand curve, a small price change causes...', 'On a FLAT curve, a small price change causes...', [['a big change in quantity demanded', 'a big change in quantity'], ['a small change in quantity demanded', 'a small change in quantity'], ['a shift of the demand curve', 'the curve to move'], ['no change in quantity demanded', 'no change at all']], 'Flat means elastic: buyers react a lot.'),
      c('The price of petrol rises. What happens on the diagram?', 'Petrol costs more. What happens on the diagram?', [['A movement along a steep curve', 'Move along a steep curve'], ['The curve shifts to the left', 'The curve moves left'], ['A movement along a flat curve', 'Move along a flat curve'], ['The curve becomes horizontal', 'The curve goes flat']], 'A price change is a movement along the curve; petrol has inelastic (steep) demand.')
    ]
  },
  'ped-det': {
    builder: { type: 'sort', q: 'Is demand likely to be elastic or inelastic?', buckets: ['Elastic', 'Inelastic'],
      items: [['One brand of shampoo (many substitutes)', '🧴', 0], ['A new car (a big share of income)', '🚗', 0], ['A holiday abroad (a luxury)', '✈️', 0], ['Salt (a tiny share of income)', '🧂', 1], ['Cigarettes (habit-forming)', '🚬', 1], ['Rice (a necessity)', '🍚', 1]] },
    say: 'Demand is more elastic when a good has many close substitutes, takes a large share of income, is a luxury, or when buyers have a long time to react. It is more inelastic when there are few substitutes, it takes a small share of income, it is a necessity, or it is habit-forming.',
    plain: 'Many [[substitute|substitutes]], a big [[proportion of income]], a [[luxury]]: [[elastic]]. Few substitutes, a [[necessity]], [[habit-forming]]: [[inelastic]].',
    vi: 'Cầu co giãn hơn khi có nhiều hàng thay thế gần, chiếm phần lớn thu nhập, là hàng xa xỉ hoặc người mua có nhiều thời gian. Cầu kém co giãn khi ít hàng thay thế, chiếm phần nhỏ thu nhập, là hàng thiết yếu hoặc gây thói quen.',
    checks: [
      c('Why is demand for one brand of bubble tea elastic?', 'Why is demand for ONE brand of bubble tea [[elastic]]?', [['It has many close substitutes', 'Many other stalls sell it'], ['It is a necessity', 'People must have it'], ['It is habit-forming', 'People drink it from habit'], ['It is a tiny share of income', 'It costs very little']], 'Buyers switch to the stall next door.'),
      c('Which makes demand more inelastic?', 'Which one makes demand more [[inelastic]]?', [['The good is a necessity', 'It is a [[necessity]]'], ['The good has many substitutes', 'It has many substitutes'], ['The good is a luxury', 'It is a [[luxury]]'], ['Buyers have a long time to react', 'People have a long time']], 'People keep buying necessities when the price rises.'),
      c('Over a longer time, demand for petrol becomes...', 'After a few years, demand for petrol becomes...', [['more elastic'], ['more inelastic'], ['perfectly inelastic'], ['unitary elastic']], 'People find substitutes: electric motorbikes, the bus.'),
      c('Which good probably has the most inelastic demand?', 'Which one has the most [[inelastic]] demand?', [['Salt'], ['A holiday'], ['Designer jeans'], ['One phone case brand']], 'Salt is a necessity, a tiny share of income, with few substitutes.')
    ]
  },
  'ped-revenue': {
    builder: { type: 'sort', q: 'Does total revenue rise or fall?', buckets: ['Revenue rises', 'Revenue falls'],
      items: [['Inelastic demand, price rises', '⬆️', 0], ['Elastic demand, price falls', '⬇️', 0], ['Petrol (inelastic), price rises', '⛽', 0], ['Inelastic demand, price falls', '⬇️', 1], ['Elastic demand, price rises', '⬆️', 1], ['Cinema (elastic), price rises', '🎬', 1]] },
    say: 'Total revenue (the same as consumer expenditure) is price × quantity. If demand is inelastic, price and total revenue move in the same direction. If demand is elastic, they move in opposite directions. If demand is unitary elastic, total revenue does not change.',
    plain: '[[total revenue|Total revenue]] = price × quantity. [[inelastic|Inelastic]]: price and revenue move the SAME way. [[elastic|Elastic]]: OPPOSITE ways.',
    vi: 'Tổng doanh thu (bằng chi tiêu của người tiêu dùng) = giá × lượng. Cầu kém co giãn: giá và doanh thu thay đổi cùng chiều. Cầu co giãn: ngược chiều. Co giãn đơn vị: doanh thu không đổi.',
    checks: [
      c('Demand is inelastic and the price rises. Total revenue...', '[[inelastic|Inelastic]] demand, the price goes up. Revenue...', [['rises'], ['falls'], ['stays the same'], ['becomes zero']], 'Inelastic: price and revenue move the same way.'),
      c('Demand is elastic and the price falls. Total revenue...', '[[elastic|Elastic]] demand, the price goes down. Revenue...', [['rises'], ['falls'], ['stays the same'], ['becomes zero']], 'Elastic: price and revenue move opposite ways.'),
      c('Price 10k, 100 sold. Then price 12k, 90 sold. What happened to revenue?', '10k × 100, then 12k × 90. What happened to [[total revenue]]?', [['It rose from 1,000k to 1,080k'], ['It fell from 1,000k to 900k'], ['It stayed at 1,000k'], ['It rose from 1,000k to 1,200k']], '10 × 100 = 1,000k; 12 × 90 = 1,080k. Price and revenue rose together: inelastic.'),
      c('Total revenue is the same as...', '[[total revenue|Total revenue]] is the same as...', [['consumer expenditure', 'what consumers spend on it'], ['the firm\'s profit', 'the profit the firm makes'], ['the price of one unit', 'the price of one of them'], ['the firm\'s costs', 'what the firm pays for it']], 'What firms receive is what consumers spend: price × quantity.')
    ]
  },
  'ped-use': {
    builder: { type: 'sort', q: 'To earn more revenue, should the seller raise the price or cut it?', buckets: ['Raise the price', 'Cut the price'],
      items: [['Petrol station (inelastic)', '⛽', 0], ['Electricity company (inelastic)', '💡', 0], ['Rice seller (inelastic)', '🍚', 0], ['One bubble tea stall (elastic)', '🧋', 1], ['One cinema (elastic)', '🎬', 1], ['One phone case shop (elastic)', '📱', 1]] },
    say: 'PED helps decision makers. A firm that wants more revenue raises its price if demand is inelastic and cuts it if demand is elastic. A government raises most tax revenue from goods with inelastic demand, but a tax cuts consumption more when demand is elastic. Consumers spend more on goods with inelastic demand when their prices rise. Workers\' jobs are safer when demand for the product is inelastic, because a higher price after a pay rise loses few sales.',
    plain: 'Firms: raise the price if demand is [[inelastic]], cut it if [[elastic]]. [[government|Governments]] get most [[tax]] from goods with inelastic demand.',
    vi: 'Doanh nghiệp: tăng giá nếu cầu kém co giãn, giảm giá nếu cầu co giãn. Chính phủ thu được nhiều thuế nhất từ hàng có cầu kém co giãn. Việc làm của công nhân an toàn hơn khi cầu về sản phẩm kém co giãn.',
    checks: [
      c('Demand for one café\'s coffee is elastic. To raise revenue the café should...', 'Demand is [[elastic]]. To get more revenue the café should...', [['cut its price', 'make it cheaper'], ['raise its price', 'make it dearer'], ['keep the price the same', 'change nothing'], ['stop selling coffee', 'stop selling it']], 'Elastic: a price cut brings a bigger % rise in sales.'),
      c('Why does a tax on petrol raise a lot of tax revenue?', 'Why does a [[tax]] on petrol bring in a lot of money?', [['Demand for petrol is inelastic', 'People keep buying petrol'], ['Demand for petrol is elastic', 'People stop buying petrol'], ['Petrol has many substitutes', 'There are many other fuels'], ['The tax shifts demand right', 'Demand for petrol moves right']], 'People keep buying petrol, so tax is paid on almost the same quantity.'),
      c('Demand for cigarettes is inelastic. A tax on them will...', 'Demand is [[inelastic]]. A [[tax]] on cigarettes will...', [['raise revenue; smoking falls a little', 'bring in money; smoking falls a little'], ['cut smoking by a large amount', 'make most people stop smoking'], ['raise almost no tax revenue', 'bring in almost no money at all'], ['make cigarettes much cheaper', 'make cigarettes a lot cheaper']], 'Smokers keep buying: lots of tax, but smoking falls only a little.'),
      c('When are factory workers\' jobs safest after a pay rise?', 'Workers get more pay. When are their jobs SAFEST?', [['When demand for the product is inelastic', 'When demand is [[inelastic]]'], ['When demand for the product is elastic', 'When demand is [[elastic]]'], ['When the product has many substitutes', 'When there are many substitutes'], ['When demand is perfectly elastic', 'When demand is [[perfectly elastic]]']], 'The firm raises its price and loses few sales, so it keeps its workers.')
    ]
  }
};

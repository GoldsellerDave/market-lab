// Lessons for the econ engine's market blocks (2.1 to 2.3). Same format as ebank.js; builders: sort, budget, cards, tapone,
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
      items: [['"I want a LOW price"', '🛒', 0], ['"I want a HIGH price"', '💰', 1], ['"If the price falls, I buy more"', '⬇️', 0], ['"If the price rises, I sell more"', '⬆️', 1], ['"I pay the money"', '💸', 0], ['"I get the money and the profit"', '🏪', 1]] },
    say: 'Buyers (consumers) want low prices and buy more when the price falls. Sellers (producers) want high prices and sell more when the price rises, because they make more profit.',
    plain: '[[buyer|Buyers]] want LOW prices. [[seller|Sellers]] want HIGH prices, because they get more [[profit]].',
    vi: 'Người mua muốn giá thấp và mua nhiều hơn khi giá giảm. Người bán muốn giá cao và bán nhiều hơn khi giá tăng vì lãi nhiều hơn.',
    checks: [
      c('Who is happy when the price of rice rises?', 'The price of rice goes UP. Who is happy?', [['The rice sellers', 'The sellers'], ['The rice buyers', 'The buyers'], ['Both of them', 'Both'], ['Neither of them', 'Nobody']], 'Sellers get more money for each bag.'),
      c('The price of phở falls. What do buyers do?', 'Phở gets cheaper. What do [[buyer|buyers]] do?', [['They buy more phở', 'They buy more'], ['They buy less phở', 'They buy less'], ['They sell their phở', 'They sell phở'], ['They stop eating phở', 'They stop eating it']], 'Buyers buy more at a lower price.'),
      c('The price of durian rises. What do sellers do?', 'Durian gets dearer. What do [[seller|sellers]] do?', [['They sell more durian', 'They sell more'], ['They sell less durian', 'They sell less'], ['They buy more durian', 'They buy more'], ['They give durian away', 'They give it away']], 'More profit: sellers offer more.'),
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
      c('The cost of milk rises. For bubble tea supply this is...', 'Milk costs more. For bubble tea [[supply]] this is...', [['a shift of the curve', 'a shift'], ['a movement along the curve', 'a movement along'], ['no change at all', 'no change'], ['a change in demand', 'a change in demand']], 'Milk cost is not bubble tea\'s own price.'),
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
      c('"For whom" is answered by...', '"FOR WHOM" means...', [['who can pay the price', 'who can pay'], ['who needs it most', 'who needs it most'], ['who asks first', 'who asks first'], ['who the state picks', 'who the government picks']], 'Goods go to those willing and able to pay.'),
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
      c('The price of bánh mì rises. On the supply curve this is...', 'Bánh mì gets dearer. On the [[supply curve]] this is...', [['an extension of supply', 'an [[extension]]'], ['a contraction of supply', 'a [[contraction]]'], ['a shift to the left', 'a shift left'], ['a shift to the right', 'a shift right']], 'Higher price, bigger quantity supplied: extension.'),
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
  }
};

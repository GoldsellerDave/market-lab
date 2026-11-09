// Lessons for the econ engine's blocks (eengine.js), Section 1. Each block:
//   builder  an intuition builder to DO first (sort, budget, pick one, cards, tap one, graph, PPC slider, PPC shift)
//   say      the idea in exam English; plain: the same in simple English with [[pills]]; vi: Vietnamese (A1, if allowed)
//   checks   short questions: the first option is right (shuffled on screen), each option [exam, plain?]; why = the reason.
// The first check is always shown in plain English, to tell a language problem from a concept problem.
// Keep the right option from usually being the longest (a test checks). Don't rename block ids.
import { EBANK2 } from './ebank2.js?v=4e7248ff';
const c = (q, plain, options, why) => ({ q, plain: plain || q, options: options.map(o => (Array.isArray(o) ? { t: o[0], p: o[1] || o[0] } : { t: o, p: o })), why });

export const EBANK = {
  'goods-services': {
    builder: { type: 'sort', q: 'Is it a good (a thing you can touch) or a service (something done for you)?', buckets: ['Good', 'Service'],
      items: [['A bánh mì', '🥖', 0], ['A haircut', '💇', 1], ['A phone', '📱', 0], ['A bus ride', '🚌', 1], ['A maths lesson', '🧑‍🏫', 1], ['A bag of rice', '🍚', 0]] },
    say: 'Goods are things you can touch, such as rice or a phone. Services are actions done for you, such as a haircut or a bus ride. Both satisfy wants.',
    plain: '[[goods|Goods]] are things you can touch. [[services|Services]] are things people DO for you.',
    vi: 'Hàng hóa là những thứ có thể chạm vào. Dịch vụ là việc người khác làm cho bạn.',
    checks: [
      c('Which of these is a service?', 'Which one is a [[services|service]]?', [['A haircut'], ['A bag of rice'], ['A new phone'], ['A bicycle']], 'A haircut is something done for you.'),
      c('Which of these is a good?', 'Which one is a [[goods|good]]?', [['A football'], ['A taxi ride'], ['A doctor\'s visit'], ['A guitar lesson']], 'A football is a thing you can touch.'),
      c('What do goods and services have in common?', 'What is the SAME for goods and services?', [['They satisfy people\'s wants', 'They give people what they want'], ['They are always free to use', 'They are always free'], ['They can always be touched', 'You can touch them'], ['They are only made by the government', 'Only the government makes them']], 'Goods and services both satisfy wants.'),
      c('A bus company takes Lan to school. What does it provide?', 'A bus takes Lan to school. What is this?', [['A service'], ['A good'], ['A resource'], ['A want']], 'The bus ride is an action done for her: a service.')
    ]
  },
  'needs-wants': {
    builder: { type: 'sort', q: 'Need (you must have it to live) or want (nice to have)?', buckets: ['Need', 'Want'],
      items: [['Clean water', '💧', 0], ['Bubble tea', '🧋', 1], ['Medicine', '💊', 0], ['A video game', '🎮', 1], ['Food', '🍚', 0], ['New trainers', '👟', 1]] },
    say: 'Needs are things people must have to survive, such as food, water and shelter. Wants are things people would like to have. People\'s wants are unlimited: when one want is satisfied, there is always another.',
    plain: '[[needs|Needs]]: we must have them to live. [[wants|Wants]]: we would like them. Our wants never end.',
    vi: 'Nhu cầu thiết yếu là thứ phải có để sống. Mong muốn là thứ ta thích có. Mong muốn của con người là vô hạn.',
    checks: [
      c('Which of these is a need?', 'Which one is a [[needs|need]]?', [['Clean drinking water', 'Clean water'], ['A new video game', 'A video game'], ['A trip to the cinema', 'A cinema ticket'], ['A designer handbag', 'A designer bag']], 'People must have water to live.'),
      c('Why are wants described as unlimited?', 'Why do we say [[wants]] never end?', [['When one want is satisfied, people want more', 'When we get one thing, we want another'], ['Shops always have enough goods for everyone', 'Shops have enough for everyone'], ['People only want things they need to live', 'We only want what we need'], ['Most goods are free to everyone', 'Most things are free']], 'Wants never end: there is always something else people would like.'),
      c('Which is a want, not a need?', 'Which one is a [[wants|want]], not a need?', [['Bubble tea'], ['Medicine'], ['A safe home'], ['Rice']], 'People can live without bubble tea.'),
      c('Which statement is correct?', 'Which sentence is right?', [['Wants are unlimited, needs keep us alive', 'Wants never end. Needs keep us alive.'], ['Needs are unlimited, wants keep us alive', 'Needs never end. Wants keep us alive.'], ['Needs and wants are always the same', 'Needs and wants are the same'], ['Only rich people have unlimited wants', 'Only rich people have many wants']], 'Needs keep us alive; wants are unlimited.')
    ]
  },
  'resources': {
    builder: { type: 'sort', q: 'Lan\'s aunt runs a bánh mì stall. Is each one a resource she uses, or the product she makes?', buckets: ['Resource (used to make it)', 'Product (what is made)'],
      items: [['Flour', '🌾', 0], ['The oven', '🔥', 0], ['The baker', '🧑‍🍳', 0], ['The ground the stall stands on', '🟫', 0, 'The ground for the stall'], ['A bánh mì', '🥖', 1], ['A bag of bánh mì for a customer', '🛍️', 1, 'A bag of bánh mì to sell']] },
    say: 'Resources are the things used to produce goods and services: natural things, people\'s work, machines and buildings, and someone to organise them.',
    plain: '[[resources|Resources]] are what we USE to make [[goods]] and [[services]]: things from nature, workers, machines.',
    vi: 'Nguồn lực là những thứ được dùng để sản xuất hàng hóa và dịch vụ: tài nguyên thiên nhiên, người lao động, máy móc.',
    checks: [
      c('Which of these is a resource used to make bánh mì?', 'Which one is USED to make bánh mì?', [['An oven'], ['A customer'], ['A finished bánh mì'], ['The price of bánh mì']], 'The oven is used to make the bread: a resource.'),
      c('What are resources used for?', 'What do we use [[resources]] for?', [['To produce goods and services', 'To make goods and services'], ['To decide prices in shops', 'To choose prices'], ['To buy things from abroad', 'To buy things from other countries'], ['To pay taxes to the government', 'To pay taxes']], 'Resources are used to produce goods and services.'),
      c('Which is a product, not a resource?', 'Which one is MADE, not used?', [['A cup of coffee for a customer', 'A cup of coffee to sell'], ['A coffee machine in the café', 'A coffee machine'], ['A barista who makes drinks', 'A barista'], ['Water from the river', 'Water from the river']], 'The cup of coffee is what is made.'),
      c('Which list contains only resources?', 'Which list is ONLY [[resources]]?', [['Land, workers, machines', 'Land, workers, machines'], ['Rice, phones, haircuts', 'Rice, phones, haircuts'], ['Prices, taxes, profits', 'Prices, taxes, profits'], ['Wants, needs, choices', 'Wants, needs, choices']], 'Land, workers and machines are all used to produce things.')
    ]
  },
  'limited': {
    builder: { type: 'budget', money: 200000, q: 'You have 200,000 đồng for the weekend. Tap what you want to buy.',
      items: [['Bubble tea', '🧋', 35000], ['Cinema ticket', '🎬', 90000], ['New book', '📚', 120000], ['Bánh mì', '🥖', 25000], ['New trainers', '👟', 650000]],
      after: 'You could not buy everything. Your money is LIMITED (there is only so much). Your wants are UNLIMITED (there is always more to want).' },
    say: 'Something is limited (finite) when there is only a certain amount of it. Money, time, land and workers are all limited. Wants are unlimited.',
    plain: '[[finite|Limited]] means there is only a certain amount. Money, time and land are limited. [[wants|Wants]] are not.',
    vi: 'Có hạn nghĩa là chỉ có một lượng nhất định. Tiền, thời gian, đất đai đều có hạn. Mong muốn thì vô hạn.',
    checks: [
      c('Which of these is limited?', 'Which one is limited?', [['The hours in a day'], ['People\'s wants for new things', 'People\'s wants'], ['The number of things people would like', 'The things people would like'], ['Ideas for new products', 'Ideas for new products']], 'A day has only 24 hours.'),
      c('Lan has 200,000 đồng but wants things worth 900,000 đồng. What does this show?', 'Lan has 200,000 đồng. She wants things that cost 900,000 đồng. What does this show?', [['Her money is limited but her wants are not', 'Her money is limited, her wants are not'], ['Her wants are limited but her money is not', 'Her wants are limited, her money is not'], ['She has unlimited money to spend this weekend', 'She has unlimited money to spend'], ['She does not have any wants at all', 'She does not have any wants']], 'Her money is limited; her wants are greater.'),
      c('What does "finite" mean?', 'What does [[finite]] mean?', [['There is only a certain amount', 'There is only some'], ['There is always more of it', 'There is always more'], ['It costs nothing to get', 'It is free'], ['Only rich people can have it', 'Only rich people have it']], 'Finite = limited: there is only a certain amount.'),
      c('Which is unlimited?', 'Which one has NO limit?', [['People\'s wants'], ['Land in a city'], ['A family\'s income'], ['Hours in a week']], 'Wants are unlimited; the others are limited.')
    ]
  },
  'choose-lose': {
    builder: { type: 'pickone', q: 'You have 30,000 đồng and time for one snack. Choose one.', a: ['Bánh mì', '🥖'], b: ['Coconut', '🥥'],
      after: 'You chose the {chosen}. The {lost} is gone. When you choose one thing, you lose the chance to have the other.' },
    say: 'Choosing one thing means giving up something else. Every choice has a cost: the thing you did not choose.',
    plain: 'When you [[choice|choose]] one thing, you give up the other thing.',
    vi: 'Khi bạn chọn một thứ, bạn phải từ bỏ thứ kia.',
    checks: [
      c('Anh can watch a football match or study on Saturday. He studies. What does he lose?', 'Anh studies on Saturday. He cannot watch football. What does he lose?', [['Watching the football match', 'The football match'], ['Nothing, because studying is free', 'Nothing'], ['The time spent studying', 'The study time'], ['His books and his pen', 'His books']], 'He gives up the football match.'),
      c('Why does choosing mean giving something up?', 'Why do we lose something when we choose?', [['We cannot have both at the same time', 'We cannot have both'], ['Everything we choose is always free', 'Everything is free'], ['Shops only sell one good each', 'Shops sell only one thing'], ['The government decides for us', 'The government chooses']], 'With limited money and time, we cannot have both.'),
      c('Mr Minh uses his shop for a café, not a phone shop. What does he give up?', 'Mr Minh makes a café, not a phone shop. What does he give up?', [['The phone shop he could have had', 'The phone shop'], ['The café that he chose to open', 'The café he opened'], ['The money he spent on the café', 'The money he spent'], ['Nothing, because it is his shop', 'Nothing: it is his shop']], 'He gives up the phone shop.'),
      c('Which sentence is true?', 'Which sentence is right?', [['Every choice has something given up', 'Every choice loses something'], ['Some choices give up everything', 'Some choices lose everything'], ['Free choices never exist', 'No choice is ever free'], ['Choices only matter for firms', 'Only firms make choices']], 'Every choice means giving up the other option.')
    ]
  },
  'graph-read': {
    builder: { type: 'graph', q: 'This graph shows rice (across) and phones (up). Tap the point for each description.', show: ['B', 'C', 'E'],
      asks: [['B', '6 rice and 8 phones'], ['E', '4 rice and 5 phones'], ['C', '8 rice and 6 phones']] },
    say: 'A graph has two axes. The horizontal axis (across) shows one thing; the vertical axis (up) shows another. A point shows one value on each axis.',
    plain: 'A graph has two [[axis|axes]]. Read ACROSS for one number and UP for the other.',
    vi: 'Một đồ thị có hai trục. Trục ngang cho một giá trị, trục dọc cho giá trị kia. Mỗi điểm cho biết hai giá trị.',
    checks: [
      c('On a graph of rice (across) and phones (up), point B is at 6 across and 8 up. What does B show?', 'Point B is 6 across and 8 up. Rice is across, phones are up. What does B show?', [['6 rice and 8 phones'], ['8 rice and 6 phones'], ['6 rice and 6 phones'], ['14 rice and no phones']], 'Across = rice (6), up = phones (8).'),
      c('Which axis is the vertical one?', 'Which [[axis]] goes UP?', [['The one that goes up'], ['The one that goes across'], ['The longer one'], ['The one with words']], 'Vertical = up and down.'),
      c('A point is at 0 across and 10 up. What does it show?', 'A point is 0 across and 10 up (rice across, phones up). What does it show?', [['10 phones and no rice'], ['10 rice and no phones'], ['10 rice and 10 phones'], ['Nothing is produced']], 'Zero across: no rice. Ten up: 10 phones.'),
      c('Point E is at 4 across and 5 up. Point B is at 6 across and 8 up. Which shows more of both?', 'E is 4 across, 5 up. B is 6 across, 8 up. Which has MORE of both?', [['B'], ['E'], ['They are the same'], ['You cannot tell']], 'B is further across and further up.')
    ]
  },
  'scarcity': {
    builder: { type: 'budget', money: 40000000, q: 'Mr Minh has 40 million đồng for his café this year. Tap what he would like.',
      items: [['New coffee machine', '☕', 30000000], ['Bigger shop', '🏠', 100000000], ['Two more baristas', '🧑‍🍳', 20000000], ['New tables', '🪑', 10000000]],
      after: 'Mr Minh wants more than his money can buy. This is SCARCITY: wants are greater than the resources to satisfy them, so he must choose.' },
    say: 'Scarcity means that resources are limited (finite) but wants are unlimited, so not every want can be satisfied and choices must be made. Scarcity affects everyone: consumers, workers, producers and governments.',
    plain: '[[scarcity|Scarcity]]: [[resources]] are limited, [[wants]] are not. So we cannot have everything, and we must [[choice|choose]].',
    vi: 'Khan hiếm: nguồn lực có hạn nhưng mong muốn là vô hạn, nên không thể có mọi thứ và phải lựa chọn.',
    checks: [
      c('What is scarcity?', 'What is [[scarcity]]?', [['Unlimited wants but limited resources', 'Wants never end, resources are limited'], ['When a good is very expensive to buy', 'When something costs a lot of money'], ['When a shop has no goods left to sell', 'When a shop has nothing left'], ['When a good is very rare in nature', 'When something is very rare']], 'Scarcity is about limited resources and unlimited wants, not price or rarity.'),
      c('Who faces scarcity?', 'Who has the problem of [[scarcity]]?', [['Everyone: consumers, firms and governments', 'Everyone'], ['Only poor families with low incomes', 'Only poor families'], ['Only small firms with few workers', 'Only small firms'], ['Nobody who lives in a rich country', 'Nobody in rich countries']], 'Everyone has limited resources and unlimited wants.'),
      c('Scarcity means people must...', 'Because of [[scarcity]], people must...', [['make choices', 'choose'], ['stop wanting things', 'stop wanting'], ['pay higher prices', 'pay more'], ['work in factories', 'work in factories']], 'Not every want can be satisfied, so we choose.'),
      c('Even a very rich country faces scarcity. Why?', 'Why does a rich country still have [[scarcity]]?', [['Its wants are still greater than its resources', 'It still wants more than it has'], ['It has no money left in its budget', 'It has no money'], ['People in rich countries have no wants', 'Rich countries want nothing'], ['The goods it makes are all very rare', 'Its goods are rare']], 'Wants are unlimited everywhere.')
    ]
  },
  'agents': {
    builder: { type: 'sort', q: 'Who is making each choice?', buckets: ['Consumer (buys)', 'Producer (makes and sells)', 'Worker (chooses a job)', 'Government (spends public money)'],
      items: [['Lan buys bubble tea or a book', '👧', 0], ['Mr Minh sells coffee or smoothies', '☕', 1], ['A barista takes a hotel job or stays', '🧑‍🍳', 2], ['The city builds a metro or schools', '🏛️', 3], ['Mrs Hoa grows rice or fruit', '🌾', 1], ['A family buys a fridge or a holiday', '👨‍👩‍👧', 0]] },
    say: 'Economic agents are the groups who make choices: consumers (households), producers (firms), workers and the government. All of them face scarcity.',
    plain: 'Four groups make [[choice|choices]]: [[consumer|consumers]] buy, [[producer|producers]] make and sell, [[worker|workers]] choose jobs, the [[government]] spends public money.',
    vi: 'Bốn nhóm phải lựa chọn: người tiêu dùng mua, nhà sản xuất làm và bán, người lao động chọn việc, chính phủ chi tiêu tiền công.',
    checks: [
      c('Mrs Hoa decides to grow fruit instead of rice. What kind of economic agent is she here?', 'Mrs Hoa grows fruit, not rice. What is she?', [['A producer'], ['A consumer'], ['A worker'], ['The government']], 'She makes and sells goods: a producer.'),
      c('Which choice is made by a consumer?', 'Which choice does a [[consumer]] make?', [['Buying a phone or a bicycle', 'Buy a phone or a bicycle'], ['Building a road or a hospital', 'Build a road or a hospital'], ['Making rice or fruit to sell', 'Grow rice or fruit to sell'], ['Taking a job at a bank or a shop', 'Work at a bank or a shop']], 'Consumers choose what to buy.'),
      c('A city chooses between a new metro line and new schools. Who is choosing?', 'A city chooses: metro or schools. Who chooses?', [['The government'], ['A consumer'], ['A producer'], ['A worker']], 'The city government spends public money.'),
      c('A barista decides whether to work at a hotel or a café. What is she here?', 'A barista chooses a job: hotel or café. What is she?', [['A worker'], ['A producer'], ['A consumer'], ['The government']], 'Choosing a job is a worker\'s choice.')
    ]
  },
  'factors': {
    builder: { type: 'sort', q: 'Mr Minh is opening a café. Which factor of production is each one?', buckets: ['Land', 'Labour', 'Capital', 'Enterprise'],
      items: [['The ground the café stands on', '🟫', 0], ['Water from the river', '💧', 0], ['Three baristas', '🧑‍🍳', 1], ['A cleaner', '🧹', 1], ['A coffee machine', '☕', 2], ['The café building', '🏠', 2], ['Mr Minh\'s idea and risk', '💡', 3]] },
    say: 'The factors of production are the resources used to produce goods and services. Land: natural resources. Labour: human effort. Capital: man-made goods used to produce other goods. Enterprise: organising the other factors and taking risks.',
    plain: '[[land|Land]] = from nature. [[labour|Labour]] = people working. [[capital|Capital]] = machines and buildings people made. [[enterprise|Enterprise]] = the person who organises and takes the risk.',
    vi: 'Đất đai = tài nguyên thiên nhiên. Lao động = sức người. Tư bản = máy móc, nhà xưởng do con người làm ra. Doanh nhân = người tổ chức và chịu rủi ro.',
    checks: [
      c('A delivery motorbike used by a café is an example of...', 'A café\'s delivery motorbike is...', [['capital'], ['land'], ['labour'], ['enterprise']], 'It is a man-made good used to produce a service.'),
      c('Which of these is land?', 'Which one is [[land]]?', [['Fish in the sea'], ['A fishing boat'], ['A fisherman'], ['The fishing company\'s owner']], 'Land is natural resources, such as fish.'),
      c('Which factor organises the others and takes the risk?', 'Which factor organises and takes the risk?', [['Enterprise'], ['Labour'], ['Capital'], ['Land']], 'The entrepreneur organises and takes the risk.'),
      c('A teacher at a school is an example of...', 'A teacher is...', [['labour'], ['capital'], ['land'], ['enterprise']], 'Labour is human effort.')
    ]
  },
  'opp-cost': {
    builder: { type: 'pickone', q: 'Saturday afternoon. You can do only one: play football with friends, or visit Thảo Cầm Viên zoo.', a: ['Football', '⚽'], b: ['The zoo', '🦒'],
      after: 'You chose {chosen}. Your opportunity cost is {lost}: the next best thing you gave up. It is not money: it is the other choice.' },
    say: 'Opportunity cost is the next best alternative given up when a choice is made.',
    plain: '[[opportunity cost|Opportunity cost]] is the [[next best alternative|next best thing]] you give up when you [[choice|choose]].',
    vi: 'Chi phí cơ hội là phương án tốt nhất tiếp theo bị bỏ qua khi đưa ra lựa chọn.',
    checks: [
      c('What is opportunity cost?', 'What is [[opportunity cost]]?', [['The next best alternative given up', 'The next best thing you give up'], ['The price you pay for a good', 'The price you pay'], ['All the choices you did not make', 'Everything you did not choose'], ['The cost of making a good', 'The cost of making something']], 'Opportunity cost is only the next best alternative.'),
      c('Lan chooses a book instead of a cinema ticket. What is her opportunity cost?', 'Lan buys a book, not a cinema ticket. What is her [[opportunity cost]]?', [['The cinema ticket'], ['The book'], ['The money she paid'], ['Nothing at all']], 'She gave up the cinema ticket.'),
      c('Why do choices have an opportunity cost?', 'Why do choices have an [[opportunity cost]]?', [['Resources are scarce, so we cannot have both', 'We cannot have both'], ['Shops always charge a price that is too high', 'Prices are high'], ['The government adds a tax to every choice', 'There is a tax'], ['People do not like making choices', 'People do not like to choose']], 'Scarcity means choosing one thing gives up another.'),
      c('A farmer grows rice on a field instead of fruit. The opportunity cost is...', 'A farmer grows rice, not fruit. The [[opportunity cost]] is...', [['the fruit she could have grown', 'the fruit'], ['the rice that she grows', 'the rice'], ['the money she spends on seeds', 'the money for seeds'], ['the field that she uses', 'the field']], 'The fruit is the next best use of the field.')
    ]
  },
  'econ-free': {
    builder: { type: 'sort', q: 'Free good (not scarce, no opportunity cost) or economic good (uses scarce resources)?', buckets: ['Free good', 'Economic good'],
      items: [['Sea air', '🌬️', 0], ['Sunshine', '☀️', 0], ['Rain falling on the sea', '🌧️', 0], ['Bottled water', '🍶', 1], ['A free school lunch', '🍱', 1], ['A hired sunbed', '⛱️', 1]] },
    say: 'A free good is not scarce: there is enough for everyone and no resources are used to make it, so it has no opportunity cost. An economic good uses scarce resources, so it has an opportunity cost, even if the user does not pay.',
    plain: '[[free good|Free good]]: enough for everyone, nothing is given up. [[economic good|Economic good]]: made with [[scarce]] [[resources]], so something is given up, even if it is free to you.',
    vi: 'Hàng hóa tự do: đủ cho mọi người, không mất chi phí cơ hội. Hàng hóa kinh tế: dùng nguồn lực khan hiếm, nên có chi phí cơ hội, kể cả khi bạn không phải trả tiền.',
    checks: [
      c('Which is a free good?', 'Which one is a [[free good]]?', [['Air in the countryside', 'Air'], ['A free school book', 'A free school book'], ['Water from a tap', 'Tap water'], ['A free government vaccine', 'A free vaccine']], 'Air is not scarce and uses no resources.'),
      c('A free school lunch is an economic good because...', 'Why is a free school lunch an [[economic good]]?', [['it uses scarce resources to make', 'it uses scarce resources'], ['students do not pay anything for it', 'students do not pay for it'], ['it is a need for students, not a want', 'it is a need, not a want'], ['the government gives it away free', 'the government gives it away']], 'Food, cooks and buildings are scarce resources.'),
      c('What is the opportunity cost of a free good?', 'What is the [[opportunity cost]] of a [[free good]]?', [['Zero: nothing is given up', 'Nothing'], ['Its price in the shop', 'Its price in the shop'], ['The cost of the workers', 'The wages of workers'], ['The tax that people pay', 'The tax people pay']], 'Free goods have no opportunity cost.'),
      c('Which is the best test of an economic good?', 'How do we know it is an [[economic good]]?', [['It uses resources that have other uses', 'Its resources could make other things'], ['It always has a price above zero', 'It always has a price in shops'], ['It is sold only in shops and markets', 'It is sold only in shops and markets'], ['It is made by a private firm to sell', 'A private firm makes it to sell']], 'Scarce resources with other uses means an opportunity cost.')
    ]
  },
  'three-q': {
    builder: { type: 'sort', q: 'Which question does each decision answer?', buckets: ['What?', 'How?', 'For whom?'],
      items: [['Build a hospital or a park?', '🏥', 0], ['Grow rice or fruit?', '🌾', 0], ['Use many workers or big machines?', '🏗️', 1], ['Pick rice by hand or with a harvester?', '🚜', 1], ['Free for children or a fee for all?', '🧒', 2], ['Sell in Vietnam or export to Japan?', '🚢', 2]] },
    say: 'Because of scarcity, every economy must answer three questions: what to produce, how to produce it, and for whom to produce it.',
    plain: 'Every economy must answer: WHAT to make, HOW to make it, and FOR WHOM to make it.',
    vi: 'Mọi nền kinh tế phải trả lời: sản xuất cái gì, sản xuất như thế nào và sản xuất cho ai.',
    checks: [
      c('"Should the factory use more robots or more workers?" Which question is this?', 'Robots or workers? Which question is it?', [['How to produce'], ['What to produce'], ['For whom to produce'], ['Why to produce']], 'Methods and resources: how.'),
      c('"Should Vietnam grow more rice or make more phones?" Which question is this?', 'More rice or more phones? Which question is it?', [['What to produce'], ['How to produce'], ['For whom to produce'], ['Where to produce']], 'Which goods: what.'),
      c('"Should medicine go to everyone, or only to those who can pay?" Which question is this?', 'Medicine for everyone, or only people who pay? Which question?', [['For whom to produce'], ['What to produce'], ['How to produce'], ['When to produce']], 'Who gets the goods: for whom.'),
      c('Why must every economy answer these questions?', 'Why must every economy answer the three questions?', [['Because resources are scarce', 'Because of scarcity'], ['Because prices are always rising', 'Because prices rise'], ['Because the government says so', 'Because the government says so'], ['Because people have few wants', 'Because people want little']], 'Scarcity forces choices.')
    ]
  },
  'money-capital': {
    builder: { type: 'cards', q: 'Tap each card to see the answer.', cards: [
      ['💵 50 million đồng in a drawer. Can it make a cup of coffee?', 'No. Money cannot make anything by itself.'],
      ['☕ An espresso machine. Can it make a cup of coffee?', 'Yes (with a barista). It is CAPITAL: a man-made good used to make other goods.'],
      ['💵➡️☕ Mr Minh spends the money on the machine.', 'Money BUYS capital. In economics the machine is capital, not the money.']] },
    say: 'Capital is man-made goods used to produce other goods and services, such as machines, tools and buildings. Money is not a factor of production: it cannot produce anything itself, but it can be used to buy capital.',
    plain: '[[capital|Capital]] = machines, tools and buildings that MAKE things. Money cannot make anything. Money only BUYS capital.',
    vi: 'Tư bản là máy móc, công cụ, nhà xưởng dùng để sản xuất. Tiền không tự sản xuất được gì, tiền chỉ dùng để mua tư bản.',
    checks: [
      c('Which of these is capital?', 'Which one is [[capital]]?', [['A sewing machine in a factory', 'A sewing machine'], ['Money saved in a bank account', 'Money in the bank'], ['A worker in a factory', 'A factory worker'], ['A forest used for timber', 'A forest']], 'The machine is man-made and used to produce.'),
      c('Why is money not a factor of production?', 'Why is money NOT a factor of production?', [['It cannot produce anything by itself', 'It cannot make anything'], ['It is too easy for people to get', 'It is easy to get'], ['Only banks are allowed to use it', 'Only banks use it'], ['It is a natural resource like land', 'It comes from nature']], 'Money only buys factors.'),
      c('A firm borrows 1 billion đồng and buys a delivery truck. What is the capital?', 'A firm borrows money and buys a truck. What is the [[capital]]?', [['The delivery truck', 'The truck'], ['The 1 billion đồng loan', 'The money'], ['The bank that lent it', 'The bank'], ['The interest on the loan', 'The interest']], 'The truck is the capital good.'),
      c('Which pair is correct?', 'Which pair is right?', [['Machine = capital, money = not a factor', 'Machine is capital; money is not a factor'], ['Money = capital, machine = land', 'Money is capital; a machine is land'], ['Money = labour, machine = enterprise', 'Money is labour; a machine is enterprise'], ['Money = land, machine = capital', 'Money is land; a machine is capital']], 'Capital means man-made goods used in production.')
    ]
  },
  'rewards': {
    builder: { type: 'sort', q: 'Mrs Hoa\'s rice farm in Củ Chi. Which reward does each one get?', buckets: ['Rent', 'Wages', 'Interest', 'Profit'],
      items: [['Mr Tâm, who owns the land', '🧓', 0], ['The four farm workers', '👩‍🌾', 1], ['The bank that lent money for the pump', '🏦', 2], ['Mrs Hoa, who takes the risk', '🌾', 3], ['The owner of the café building', '🏠', 0], ['A barista', '🧑‍🍳', 1]] },
    say: 'Each factor of production earns a reward: land earns rent, labour earns wages, capital earns interest and enterprise earns profit.',
    plain: '[[land|Land]] gets [[rent]]. [[labour|Labour]] gets [[wages]]. [[capital|Capital]] gets [[interest]]. [[enterprise|Enterprise]] gets [[profit]].',
    vi: 'Đất đai nhận tiền thuê, lao động nhận tiền lương, tư bản nhận tiền lãi, doanh nhân nhận lợi nhuận.',
    checks: [
      c('What is the reward for enterprise?', 'What does [[enterprise]] get?', [['Profit'], ['Wages'], ['Rent'], ['Interest']], 'The entrepreneur takes the risk and earns profit.'),
      c('What is the reward for land?', 'What does [[land]] get?', [['Rent'], ['Profit'], ['Interest'], ['Wages']], 'Land earns rent.'),
      c('A worker in a phone factory earns...', 'A factory worker gets...', [['wages'], ['rent'], ['profit'], ['interest']], 'Labour earns wages.'),
      c('Which pair is correct?', 'Which pair is right?', [['Capital: interest', 'Capital gets interest'], ['Capital: wages', 'Capital gets wages'], ['Labour: rent', 'Labour gets rent'], ['Land: profit', 'Land gets profit']], 'Capital earns interest.')
    ]
  },
  'quan-qual': {
    builder: { type: 'sort', q: 'Does each change give MORE of a factor (quantity) or a BETTER factor (quality)?', buckets: ['Quantity (more)', 'Quality (better)'],
      items: [['50,000 workers move to the city', '🚌', 0], ['A flood washes away farmland', '🌊', 0], ['A factory buys 20 more machines', '🏭', 0], ['Baristas take a training course', '🎓', 1], ['Fertiliser makes the soil better', '🌱', 1], ['New robots replace old machines', '🤖', 1]] },
    say: 'The quantity of a factor is how much of it there is; the quality is how good or productive it is. Education and training raise the quality of labour; investment in new technology raises the quality of capital.',
    plain: '[[quantity|Quantity]] = HOW MUCH. [[quality|Quality]] = HOW GOOD. Training makes [[labour]] better. New [[technology]] makes [[capital]] better.',
    vi: 'Số lượng là có bao nhiêu. Chất lượng là tốt đến mức nào. Đào tạo nâng cao chất lượng lao động; công nghệ mới nâng cao chất lượng tư bản.',
    checks: [
      c('Which change increases the quality of labour?', 'What makes [[labour]] BETTER?', [['Training courses for workers', 'Training for workers'], ['More people moving to the city', 'More people come to the city'], ['Building more factories', 'More factories'], ['Higher rent for land', 'Higher rent']], 'Training gives workers more skills.'),
      c('A typhoon destroys farmland. What changes?', 'A typhoon destroys farmland. What changes?', [['The quantity of land falls', 'There is less land'], ['The quality of labour rises', 'Workers get better'], ['The quantity of capital rises', 'There are more machines'], ['The quality of enterprise falls', 'Owners get worse']], 'There is less land: quantity.'),
      c('A factory replaces old machines with faster new ones. What changes?', 'Old machines are replaced by faster ones. What changes?', [['The quality of capital rises', 'Capital gets better'], ['The quantity of labour rises', 'There are more workers'], ['The quantity of land falls', 'There is less land'], ['The quality of land rises', 'Land gets better']], 'Better machines: quality of capital.'),
      c('Which increases the quantity of labour?', 'What gives MORE [[labour]]?', [['More young people starting work', 'More young people start work'], ['A training course for nurses', 'Training courses for nurses'], ['Better health care for workers', 'Better health care for workers'], ['New computers in offices', 'New computers in offices']], 'More people working: quantity.')
    ]
  },
  'mobility': {
    builder: { type: 'sort', q: 'Is it about moving to a new PLACE (geographical) or a new JOB (occupational)?', buckets: ['Geographical (place)', 'Occupational (job)'],
      items: [['A farmer moves from An Giang to the city', '🚌', 0], ['Rooms in the city are expensive', '🏠', 0], ['Leaving family behind', '👪', 0], ['A farmer becomes a factory worker', '🏭', 1], ['Needing new skills for the job', '🛠️', 1], ['A nurse needs a certificate first', '🩺', 1]] },
    say: 'Mobility is how easily a factor of production can move. Geographical mobility is moving to a different place; occupational mobility is moving to a different job or use. Land is geographically immobile.',
    plain: '[[geographical mobility|Geographical mobility]] = moving to a new PLACE. [[occupational mobility|Occupational mobility]] = moving to a new JOB. [[land|Land]] cannot move to a new place.',
    vi: 'Di chuyển địa lý là chuyển đến nơi khác. Di chuyển nghề nghiệp là chuyển sang việc khác. Đất đai không thể di chuyển.',
    checks: [
      c('A worker moves from Hà Nội to Ho Chi Minh City. This is...', 'A worker moves to another city. This is...', [['geographical mobility'], ['occupational mobility'], ['the quality of labour', 'quality of labour'], ['an opportunity cost', 'opportunity cost']], 'A new place: geographical.'),
      c('Which factor is least geographically mobile?', 'Which factor can NOT move to a new place?', [['Land'], ['Labour'], ['A laptop (capital)'], ['Enterprise']], 'Land cannot move.'),
      c('What could stop a rice farmer becoming a factory worker?', 'What stops a farmer from becoming a factory worker?', [['Not having the skills needed', 'No skills for the job'], ['The price of rice falls', 'Rice is cheaper'], ['The factory pays wages', 'The factory pays wages'], ['Land is in the countryside', 'Land is far away']], 'Missing skills limit occupational mobility.'),
      c('A teacher retrains as a programmer. This is...', 'A teacher learns to be a programmer. This is...', [['occupational mobility'], ['geographical mobility'], ['a fall in quantity', 'less labour'], ['a free good', 'a free good']], 'A new job: occupational.')
    ]
  },
  'next-best': {
    builder: { type: 'tapone', q: 'Lan can do ONE thing on Sunday. Her list from best to worst is below. She chooses number 1. Tap her opportunity cost.',
      items: [['1. Study for the test', '📖'], ['2. Bến Thành night market', '🏮'], ['3. Video games', '🎮'], ['4. Watch TV', '📺']], answer: 1,
      right: 'Yes! Only the NEXT best (number 2) is the opportunity cost, not everything else.', wrong: 'Not quite. Opportunity cost is only the NEXT best choice: number 2 on her list.' },
    say: 'Opportunity cost is only the next best alternative, not all the alternatives given up.',
    plain: 'The [[opportunity cost]] is only the NEXT best thing, not everything you did not choose.',
    vi: 'Chi phí cơ hội chỉ là phương án tốt nhất tiếp theo, không phải tất cả những thứ bị bỏ qua.',
    checks: [
      c('Anh ranks: 1 work overtime, 2 English class, 3 football, 4 sleep. He works overtime. Opportunity cost?', 'Anh\'s list: 1 work, 2 English class, 3 football, 4 sleep. He works. [[opportunity cost|Opportunity cost]]?', [['The English class'], ['English class, football and sleep', 'All three others'], ['Sleep'], ['Working overtime']], 'Only number 2.'),
      c('Why is opportunity cost only one thing?', 'Why is [[opportunity cost]] only ONE thing?', [['You could only have had one other choice', 'You could only have chosen one other thing'], ['The others cost too much money', 'The others cost too much money'], ['The others are always free', 'The others are always free to do'], ['The government decides it', 'The government decides it for you']], 'You give up the chance of your next best choice.'),
      c('The city builds a hospital. The next best choice was a school; then a park. Opportunity cost?', 'The city builds a hospital. Next best: a school; then a park. [[opportunity cost|Opportunity cost]]?', [['The school'], ['The school and the park', 'The school and the park'], ['The park'], ['The hospital']], 'Only the next best: the school.'),
      c('Which is a common mistake?', 'Which is a mistake?', [['Counting every alternative given up', 'Counting all the other choices'], ['Choosing the next best alternative', 'Choosing only the next best one'], ['Ranking the choices first', 'Ranking the choices from best to worst'], ['Using scarcity to explain choice', 'Using scarcity to explain it']], 'Only the next best counts.')
    ]
  },
  'oc-decide': {
    builder: { type: 'tapone', q: 'The city government has money for ONE project. It builds a new hospital. Its next best choice was a metro line. Tap the opportunity cost.',
      items: [['The new hospital', '🏥'], ['The metro line', '🚇'], ['The tax money', '💰'], ['Nothing', '❌']], answer: 1,
      right: 'Yes. Governments, firms, workers and consumers all compare what they get with what they give up.', wrong: 'Not quite. The opportunity cost is the metro line: the next best choice it gave up.' },
    say: 'Consumers, workers, producers and governments compare the benefit of a choice with its opportunity cost. A good decision is one where the benefit is greater than what is given up.',
    plain: 'Everyone compares what they GET with what they give up. A good choice: you get more than you give up.',
    vi: 'Mọi người so sánh cái nhận được với cái phải bỏ qua. Lựa chọn tốt là khi lợi ích lớn hơn chi phí cơ hội.',
    checks: [
      c('Mr Minh could open at night (+3 million đồng) but would stop guitar teaching (2 million đồng). Should he, on money alone?', 'Open at night: +3 million. Stop guitar lessons: −2 million. Should he open, on money alone?', [['Yes: he gains more than he gives up', 'Yes: he gains more'], ['No: he gives up 3 million đồng', 'No: he loses 3 million'], ['It makes no difference to him', 'No difference'], ['No: guitar teaching costs nothing', 'No: guitar is free']], '3 million is more than the 2 million opportunity cost.'),
      c('A student goes to university. What is a likely opportunity cost?', 'A student goes to university. What does she give up?', [['The wages from a full-time job', 'Wages from a job'], ['The university fees she pays', 'The fees'], ['Her future higher salary', 'Her future salary'], ['Her degree certificate', 'Her degree']], 'She cannot work full-time while studying.'),
      c('A firm uses a factory to make phones, not laptops. What is the opportunity cost?', 'A factory makes phones, not laptops. What is given up?', [['The laptops it could have made', 'The laptops'], ['The phones that it made', 'The phones'], ['The factory building it uses', 'The factory'], ['The wages paid to its workers', 'The wages']], 'The laptops are the next best use.'),
      c('Why do governments think about opportunity cost?', 'Why does the [[government]] think about [[opportunity cost]]?', [['Spending on one project means less for another', 'Money for one thing is not there for another'], ['Governments have unlimited budgets to spend', 'Governments have unlimited money to spend'], ['Taxes are always too low to pay for anything', 'Taxes are too low to pay for anything'], ['Projects have no costs because they are public', 'Public projects cost nothing']], 'Budgets are limited too.')
    ]
  },
  'ppc-points': {
    builder: { type: 'graph', q: 'The PPC shows the most Vietnam can make of rice and phones. Tap the point for each description.', show: ['B', 'E', 'F'],
      asks: [['B', 'All resources are used fully'], ['E', 'Some workers have no job'], ['F', 'Cannot be reached now']] },
    say: 'A point ON the PPC means all resources are used fully and efficiently. A point INSIDE means some resources are unemployed or used inefficiently. A point OUTSIDE is unattainable with current resources.',
    plain: 'ON the [[PPC]]: all [[resources]] are used. INSIDE: some are not used ([[unemployed resources]]). OUTSIDE: [[unattainable|cannot be reached]] now.',
    vi: 'Điểm nằm TRÊN đường PPC: dùng hết nguồn lực. Điểm BÊN TRONG: có nguồn lực bị bỏ phí. Điểm BÊN NGOÀI: chưa thể đạt được.',
    checks: [
      c('A point inside the PPC shows...', 'A point INSIDE the [[PPC]] shows...', [['some resources are unemployed', 'some resources are not used'], ['all resources are used fully', 'all resources are used'], ['output that cannot be reached', 'output we cannot reach'], ['the economy has grown', 'the economy has grown']], 'Inside: unemployed or wasted resources.'),
      c('A point outside the PPC is...', 'A point OUTSIDE the [[PPC]] is...', [['unattainable with current resources', 'not possible now'], ['where some workers have no job', 'where some workers have no job'], ['where all resources are used', 'where all resources are used'], ['the best place to produce', 'the best place']], 'Outside: unattainable now.'),
      c('Factories close and many workers lose their jobs. The economy moves...', 'Factories close. Many workers have no job. The economy goes...', [['to a point inside the PPC', 'inside the curve'], ['to a point outside the PPC', 'outside the curve'], ['along the PPC', 'along the curve'], ['to a point on the axis', 'onto an axis']], 'Unemployed resources: inside.'),
      c('Which point shows efficient use of all resources?', 'Which point uses ALL [[resources]]?', [['A point on the curve', 'A point on the curve'], ['A point inside the curve', 'A point inside'], ['A point outside the curve', 'A point outside'], ['The origin (0, 0)', 'The corner at zero']], 'On the curve: full and efficient use.')
    ]
  },
  'ppc-oc': {
    builder: { type: 'ppcslider', q: 'Move the slider to grow more rice. Watch how many phones Vietnam gives up.',
      after: 'To get more rice, Vietnam must make fewer phones. The phones given up are the OPPORTUNITY COST of the extra rice.' },
    say: 'A movement along the PPC shows opportunity cost: to produce more of one good, the economy must produce less of the other. The amount of the other good given up is the opportunity cost.',
    plain: 'Moving along the [[PPC]]: more of one good means less of the other. What you give up is the [[opportunity cost]].',
    vi: 'Di chuyển dọc theo đường PPC: làm thêm hàng này thì phải bớt hàng kia. Phần bị bỏ đi là chi phí cơ hội.',
    checks: [
      c('Vietnam moves from 6 to 8 million tonnes of rice, and phones fall from 8 to 6 million. Opportunity cost of the extra rice?', 'Rice 6 → 8. Phones 8 → 6. What is the [[opportunity cost]] of the extra rice?', [['2 million phones'], ['2 million tonnes of rice'], ['8 million phones'], ['6 million phones']], 'Phones fall by 2 million.'),
      c('What does a movement along the PPC show?', 'What does moving ALONG the [[PPC]] show?', [['More of one good means less of the other', 'More of one, less of the other'], ['The economy is growing every year', 'The economy grows'], ['Some resources are unemployed', 'Some resources are not used'], ['Both goods increase at the same time', 'Both goods go up']], 'Along the curve: a trade-off.'),
      c('To produce more phones on the PPC, Vietnam must...', 'To make more phones on the [[PPC]], Vietnam must...', [['produce less rice', 'make less rice'], ['produce more rice too', 'make more rice too'], ['close its factories', 'close factories'], ['import more workers', 'bring in workers']], 'Resources move from rice to phones.'),
      c('From C to D, rice rises by 2 and phones fall from 6 to 0. Opportunity cost?', 'C to D: rice +2, phones 6 → 0. [[opportunity cost|Opportunity cost]]?', [['6 million phones'], ['2 million phones'], ['0 phones'], ['2 million tonnes of rice']], 'Phones fall by 6 million.')
    ]
  },
  'ppc-curve': {
    builder: { type: 'ppcslider', steps: true, q: 'Move the slider in steps of 2 million tonnes of rice. Each step, how many phones are given up?',
      after: 'Each extra 2 million tonnes of rice costs MORE phones than the last. Resources are not equally good at both goods, so opportunity cost rises and the curve bends.' },
    say: 'The PPC is usually curved (concave to the origin) because resources are not equally suited to producing both goods. As more of one good is produced, resources less suited to it are used, so its opportunity cost rises.',
    plain: 'The [[PPC]] bends because [[resources]] are not equally good at making both goods. Making more of one good costs more and more of the other.',
    vi: 'Đường PPC cong vì nguồn lực không phù hợp như nhau cho cả hai loại hàng. Càng làm nhiều hàng này, chi phí cơ hội càng tăng.',
    checks: [
      c('Why is the PPC usually curved?', 'Why is the [[PPC]] curved?', [['Resources are not equally good at both goods', 'Resources are not equally good at both'], ['Some resources are always unemployed', 'Some resources are never used'], ['The economy is always growing', 'The economy always grows'], ['Both goods have the same price', 'Both goods cost the same']], 'Unequal resources mean rising opportunity cost.'),
      c('As Vietnam makes more and more rice, the opportunity cost of rice...', 'Vietnam makes more and more rice. Its [[opportunity cost]]...', [['rises'], ['falls'], ['stays the same'], ['becomes zero']], 'Each extra tonne costs more phones.'),
      c('Why does the last extra rice cost so many phones?', 'Why does the LAST extra rice cost many phones?', [['Skilled phone engineers move to farming', 'Phone engineers must farm'], ['Rice becomes very cheap to buy', 'Rice is cheap'], ['The rice farmers stop working', 'Farmers stop working'], ['Phones become unattainable', 'Phones cannot be made']], 'Engineers are bad at farming, so many phones are lost.'),
      c('A straight-line PPC would mean the opportunity cost...', 'A STRAIGHT [[PPC]] would mean the [[opportunity cost]]...', [['stays the same', 'is always the same'], ['rises all the time', 'gets bigger every time'], ['falls all the time', 'gets smaller every time'], ['is always zero', 'is zero every time']], 'A constant slope means a constant opportunity cost.')
    ]
  },
  'ppc-shift': {
    builder: { type: 'shift', q: 'Tap each event and watch the PPC.' },
    say: 'An increase in the quantity or quality of resources, or better technology, shifts the PPC outwards: economic growth. A fall in resources (a disaster, emigration) shifts it inwards. Using the same resources differently is a movement along the curve, not a shift.',
    plain: 'More or better [[resources]] or new [[technology]]: the [[PPC]] moves OUT ([[economic growth]]). Fewer resources: it moves IN. Same resources used differently: move ALONG it.',
    vi: 'Nhiều hơn hoặc tốt hơn về nguồn lực, công nghệ mới: PPC dịch ra ngoài. Ít nguồn lực hơn: dịch vào trong. Dùng cùng nguồn lực khác đi: di chuyển dọc đường.',
    checks: [
      c('Better technology in farms and factories shifts the PPC...', 'New [[technology]] for farms and factories. The [[PPC]]...', [['outwards on both axes', 'moves out on both axes'], ['inwards on both axes', 'moves in on both axes'], ['along the same curve', 'moves along the curve'], ['out on one axis only', 'moves out on one axis']], 'More of both goods can be made.'),
      c('A typhoon destroys farms and factories. The PPC...', 'A typhoon destroys farms and factories. The [[PPC]]...', [['shifts inwards', 'moves in'], ['shifts outwards', 'moves out'], ['does not change at all', 'does not change'], ['becomes a straight line', 'becomes straight']], 'Fewer resources: inwards.'),
      c('Vietnam moves workers from farms to factories. This is...', 'Workers move from farms to factories. This is...', [['a movement along the PPC', 'moving along the curve'], ['an outward shift of the PPC', 'the curve moving out'], ['an inward shift of the PPC', 'the curve moving in'], ['a point outside the PPC', 'a point outside']], 'Same resources, different use: along.'),
      c('New rice seeds double harvests, but phone technology is unchanged. The PPC...', 'New rice seeds. Phone technology is the same. The [[PPC]]...', [['moves out on the rice axis only', 'moves out on the rice axis only'], ['moves out on both axes', 'moves out on both axes'], ['moves out on the phone axis only', 'moves out on the phone axis only'], ['moves inwards on both axes', 'moves in']], 'Only the rice maximum changes.')
    ]
  }
};
Object.assign(EBANK, EBANK2);   // the market blocks (2.1 to 2.3)
export const EREADY = new Set(Object.keys(EBANK));

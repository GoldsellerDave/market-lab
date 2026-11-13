// Units 2.4 and 2.5 joined to the English bands and the econ engine.
//   GLOSSARY  key words for the pills (merged with the Section 1 and 2.1 to 2.3 glossaries)
//   PLAIN     for every Paper 1 question in u24.js / u25.js: [plain stem, Vietnamese, plain options (same order, right first)]
//             (an option left null keeps its exam wording). A1 sees the first three options.
//   CHAIN     2.5 questions about one event: the 3-step price-change chain shown after the answer
//             c: the curve that shifts (D, S, or DS for two shifts), d: +1 right / −1 left (per curve), P and Q: up / down / ? (it depends)
export const GLOSSARY = {
  'equilibrium': { def: 'The price where quantity demanded equals quantity supplied. There is no shortage and no surplus.', ex: 'At 40,000 đồng, buyers want 80 cups and sellers make 80 cups.', vi: 'cân bằng' },
  'equilibrium price': { def: 'The price at which quantity demanded equals quantity supplied.', ex: 'Mangoes: 35,000 đồng a kg, where buyers and sellers both want 525 kg.', vi: 'giá cân bằng' },
  'shortage': { def: 'When quantity demanded is MORE than quantity supplied. It happens when the price is below equilibrium.', ex: 'At 20,000 đồng, buyers want 120 cups but sellers make only 40.', vi: 'thiếu hụt' },
  'surplus': { def: 'When quantity supplied is MORE than quantity demanded. It happens when the price is above equilibrium.', ex: 'At 60,000 đồng, sellers make 120 cups but buyers want only 40.', vi: 'dư thừa' },
  'disequilibrium': { def: 'Any price where quantity demanded and quantity supplied are NOT equal: there is a shortage or a surplus.', ex: 'At 30,000 đồng there is a shortage of 40 cups.', vi: 'mất cân bằng' },
  'schedule': { def: 'A table showing the quantity demanded and supplied at each price.', ex: 'Price 30k: Qd 100, Qs 60. Price 40k: Qd 80, Qs 80.', vi: 'biểu (bảng số liệu)' },
  'market clears': { def: 'Everything sellers offer is bought: no shortage and no surplus.', ex: 'At the equilibrium price the market clears.', vi: 'thị trường thông suốt' },
  'rationing': { def: 'Sharing out a scarce good. A higher price rations it to the buyers who are willing and able to pay.', ex: 'Before Tết, high flower prices ration flowers to buyers who pay more.', vi: 'phân phối' }
};

export const PLAIN = {
  // ---------- 2.4
  'q4-def': ['What is market [[equilibrium]]?', 'Cân bằng thị trường là gì?', ['Buyers want the same amount that sellers offer', 'Demand for the good is at its very highest', 'The price is as low as it can go', 'Sellers make the most profit possible']],
  'q4-below': ['The price is LOWER than the [[equilibrium price]]. What do we see?', 'Giá thấp hơn giá cân bằng. Trên thị trường có gì?', ['A [[shortage]]', 'A [[surplus]]', '[[equilibrium|Equilibrium]]', 'A fall in demand']],
  'q4-surplus-next': ['Sellers have too many mangoes (a [[surplus]]). What will happen?', 'Thị trường xoài đang dư thừa. Điều gì có thể xảy ra?', ['The price goes down', 'The price goes up', 'The demand curve moves right', 'The supply curve moves right']],
  'q4-schedule': ['$2: buyers 50, sellers 20. $3: buyers 40, sellers 40. $4: buyers 30, sellers 60. What is the [[equilibrium price]]?', 'Giá $2: cầu 50, cung 20. Giá $3: cầu 40, cung 40. Giá $4: cầu 30, cung 60. Giá cân bằng là bao nhiêu?', null],
  'q4-shortage-def': ['What is a [[shortage]]?', 'Thiếu hụt là gì?', ['Buyers want more than sellers offer', 'Sellers offer more than buyers want', 'The demand curve has moved to the left', 'Firms have stopped making the good']],
  'q4-what': ['People pay more for electric scooters, so firms make more. Which question is this?', 'Người tiêu dùng trả nhiều tiền hơn cho xe điện nên doanh nghiệp sản xuất nhiều hơn. Đây là câu hỏi nào?', ['WHAT to make', 'HOW to make it', 'FOR WHOM to make it', 'WHERE to make it']],
  'q4-gap': ['Price $5: buyers want 120, sellers offer 80. What is it?', 'Ở giá $5, lượng cầu là 120 và lượng cung là 80. Đây là tình trạng gì?', ['A [[shortage]] of 40', 'A [[surplus]] of 40', 'A [[shortage]] of 200', 'A [[shortage]] of 120']],
  'q4-forwhom': ['How do prices decide WHO gets the goods?', 'Cơ chế giá quyết định sản xuất CHO AI như thế nào?', ['People who want them and can pay', 'The government chooses who gets them', 'Firms choose the customers they like', 'Everyone gets the same amount']],
  'q4-how': ['Workers cost more. Machines cost less. What do firms do?', 'Tiền lương tăng, còn máy móc rẻ hơn. Doanh nghiệp sẽ làm gì?', ['Use more machines, fewer workers', 'Hire more workers, use fewer machines', 'Stop making the good at all', 'Ask the government what to do']],
  'q4-dia-above': ['The price is ABOVE the point where the curves cross. What is the gap between the curves?', 'Giá cao hơn điểm hai đường cắt nhau. Khoảng cách ngang giữa hai đường thể hiện điều gì?', ['A [[surplus]]', 'A [[shortage]]', 'The [[equilibrium]] quantity', 'What buyers spend in total']],
  'q4-signal': ['A toy runs out before Tết (a [[shortage]]). How do prices fix it?', 'Một món đồ chơi bị thiếu hàng trước Tết. Cơ chế giá giải quyết thiếu hụt như thế nào?', ['The price rises: buyers want fewer, sellers offer more', 'The price falls until every buyer can get one', 'The government orders firms to make more', 'The demand curve moves left by itself']],
  'q4-diseq': ['Which one is [[disequilibrium]]?', 'Tình huống nào cho thấy thị trường mất cân bằng?', ['At 30k: buyers 200, sellers 260', 'At 30k: buyers 200, sellers 200', 'The price is high but buyers = sellers', 'There are many buyers and sellers']],
  'q4-market': ['At 20k: students want 300 bánh mì, workers want 200. Sellers sell 450. What is it?', 'Ở giá 20k: học sinh cầu 300, người đi làm cầu 200. Lượng cung là 450. Có tình trạng gì?', ['A [[shortage]] of 50', 'A [[surplus]] of 150', 'A [[surplus]] of 250', '[[equilibrium|Equilibrium]]']],
  'q4-traded': ['40k: buyers 500, sellers 300. 50k: buyers 400, sellers 400. The price starts at 40k. What happens?', 'Giá 40k: cầu 500, cung 300. Giá 50k: cầu 400, cung 400. Giá bắt đầu ở 40k. Điều gì xảy ra?', ['Price goes up to 50k; sold goes from 300 to 400', 'Price goes down; the quantity sold goes up', 'Price goes up to 50k; sold goes from 500 to 400', 'Price goes up and sellers sell less']],
  'q4-why-not': ['Why does a [[surplus]] not last long?', 'Vì sao tình trạng dư thừa thường không kéo dài?', ['Sellers cut prices: people buy more, sellers offer less', 'Buyers pay more, so sellers sell all their stock', 'The government buys all of the extra goods', 'The demand curve moves right by itself']],
  'q4-clears': ['The [[equilibrium price]] is the price where…', 'Giá cân bằng là mức giá mà tại đó…', ['the [[market clears|market clears]]: no shortage, no surplus', 'every seller makes a profit on each good', 'everyone who wants it can pay for it', 'sellers make the most they possibly can']],
  'q4-ration': ['Too little rambutan, so its price goes up. What is the price doing?', 'Thiếu chôm chôm nên giá tăng. Giá đang đóng vai trò gì?', ['[[rationing|Rationing]]: only people who pay more get it', 'A tax: buyers pay extra to the government', 'A shift: the demand curve moves left', 'The government chooses who gets it']],
  'q4-moves': ['There is a [[surplus]]. The price falls to [[equilibrium]]. What happens?', 'Đang dư thừa. Khi giá giảm về mức cân bằng, điều gì xảy ra?', ['[[extension|Extension]] of demand, [[contraction]] of supply', 'Demand increases: the curve moves right', '[[contraction|Contraction]] of demand, [[extension]] of supply', 'Supply decreases: the curve moves left']],
  // ---------- 2.5
  'q-income': ['What moves the demand curve for bubble tea to the RIGHT?', 'Điều gì làm đường cầu trà sữa dịch sang phải?', ['People earn more money', 'Bubble tea gets cheaper', 'Milk costs more to buy', 'A new tax on sugar']],
  'q-frost': ['A drought kills a lot of Vietnam\'s coffee. What happens?', 'Hạn hán làm hỏng nhiều cà phê của Việt Nam. Thị trường cà phê thay đổi thế nào?', ['Supply moves left; price goes up', 'Supply moves right; price goes down', 'Demand moves left; price goes down', 'Demand moves right; price goes up']],
  'q-mango': ['Mangoes get cheaper. What happens?', 'Giá xoài giảm. Điều gì xảy ra?', ['Move along the demand curve: people buy more', 'Demand curve moves right: demand goes up', 'Supply curve moves left: supply goes down', 'Demand curve moves left: demand goes down']],
  'q-tech': ['A firm gets new machines. Its costs go down. What happens?', 'Doanh nghiệp dùng máy mới làm giảm chi phí. Thị trường thay đổi thế nào?', ['Supply up; price down; quantity up', 'Supply up; price up; quantity up', 'Demand up; price up; quantity up', 'Supply down; price up; quantity down']],
  'q-fizzy': ['Doctors say a fizzy drink is bad for health. What happens to price and quantity?', 'Bác sĩ nói một loại nước ngọt có hại cho sức khỏe. Giá và lượng cân bằng thay đổi thế nào?', ['Price down; quantity down', 'Price down; quantity up', 'Price up; quantity down', 'Price up; quantity up']],
  'q-shortage': ['Demand goes up. What is there at the OLD price? What happens next?', 'Cầu tăng. Ở mức giá CŨ có tình trạng gì, và sau đó điều gì xảy ra?', ['A [[shortage]], so the price goes up', 'A [[surplus]], so the price goes down', 'A [[shortage]], so the price goes down', 'Nothing: the price has not changed']],
  'q-subst': ['Coffee gets much more expensive. What happens to tea (a [[substitute]])?', 'Giá cà phê tăng mạnh. Thị trường trà (hàng thay thế) thay đổi thế nào?', ['Tea demand moves right; tea price up', 'Tea demand moves left; tea price down', 'Tea supply moves left; tea price up', 'Nothing: tea is a different market']],
  'q-compl': ['Petrol costs more. What happens to demand for big motorbikes (a [[complement]])?', 'Giá xăng tăng. Cầu về xe máy phân khối lớn thay đổi thế nào?', ['It moves left', 'It moves right', 'A movement along the curve', 'The supply curve moves left']],
  'q-tax': ['The government puts a [[tax]] on cigarettes. What happens?', 'Chính phủ đánh thuế mỗi bao thuốc lá. Điều gì xảy ra?', ['Supply left; price up; quantity down', 'Demand left; price down; quantity down', 'Supply right; price down; quantity up', 'Supply left; price down; quantity down']],
  'q-subsidy': ['Rice farmers get a [[subsidy]]. What happens?', 'Nông dân trồng lúa được trợ cấp. Thị trường gạo thay đổi thế nào?', ['Supply right; price down; quantity up', 'Demand right; price up; quantity up', 'Supply left; price up; quantity down', 'Supply right; price up; quantity up']],
  'q-diagram': ['The supply curve moves from S1 to S2. What could cause this?', 'Đường cung dịch chuyển từ S1 sang S2. Nguyên nhân có thể là gì?', ['Workers get higher [[wages]]', 'People earn more money', 'New [[technology]] in the factory', 'The product gets cheaper']],
  'q-qd': ['People buy fewer phones, but the demand curve does not move. Why?', 'Lượng cầu điện thoại giảm nhưng đường cầu không dịch chuyển. Nguyên nhân là gì?', ['Phones got more expensive', 'People earn less money', 'A [[substitute]] got dearer', 'A rival made a new advert']],
  'q-tet': ['Before Tết, more people want flowers. Bad weather means fewer flowers. What happens?', 'Trước Tết, cầu về hoa tăng trong khi thời tiết xấu làm giảm cung. Điểm cân bằng thay đổi thế nào?', ['Price up; quantity: it depends', 'Price up and quantity up', 'Price down; quantity: it depends', 'Price: it depends; quantity down']],
  'q-tv': ['More TVs are supplied AND fewer people want TVs. What happens?', 'Cung tivi tăng, đồng thời cầu tivi giảm. Điều gì xảy ra?', ['Price down; quantity: it depends', 'Price down and quantity down', 'Price up; quantity: it depends', 'Price: it depends; quantity up']],
  'q-ink': ['Printers get cheaper. Ink costs less to make. What happens to ink?', 'Máy in rẻ hơn, và công nghệ mới giảm chi phí làm mực in. Thị trường mực in thay đổi thế nào?', ['Quantity up; price: it depends', 'Price down and quantity up', 'Quantity down; price: it depends', 'Price up and quantity up']],
  'q-rice': ['Rice price went up 20%. Rice sold went down 5%. Why?', 'Giá gạo tăng 20% và lượng bán giảm 5%. Nguyên nhân có khả năng nhất là gì?', ['Supply went down', 'Demand went up', 'Demand went down', 'Supply went up']],
  'q-icecream': ['In summer, ice cream price went up AND more was sold. Why?', 'Mùa hè, giá kem tăng VÀ lượng bán cũng tăng. Giải thích nào đúng?', ['Demand went up', 'Supply went up', 'Supply went down', 'The higher price made demand go up']],
  'q-contract': ['Supply falls, so the price goes up. What happens to demand?', 'Cung giảm làm giá tăng. Cầu thay đổi thế nào?', ['[[contraction|Contraction]]: move up along the curve', 'Demand down: the curve moves left', 'Demand up: the curve moves right', 'Nothing: only supply changed']]
};

export const CHAIN = {
  'q-frost': { c: 'S', d: { S: -1 }, P: 'up', Q: 'down' }, 'q-tech': { c: 'S', d: { S: 1 }, P: 'down', Q: 'up' },
  'q-fizzy': { c: 'D', d: { D: -1 }, P: 'down', Q: 'down' }, 'q-shortage': { c: 'D', d: { D: 1 }, P: 'up', Q: 'up' },
  'q-subst': { c: 'D', d: { D: 1 }, P: 'up', Q: 'up' }, 'q-compl': { c: 'D', d: { D: -1 }, P: 'down', Q: 'down' },
  'q-tax': { c: 'S', d: { S: -1 }, P: 'up', Q: 'down' }, 'q-subsidy': { c: 'S', d: { S: 1 }, P: 'down', Q: 'up' },
  'q-income': { c: 'D', d: { D: 1 }, P: 'up', Q: 'up' },
  'q-tet': { c: 'DS', d: { D: 1, S: -1 }, P: 'up', Q: '?' }, 'q-tv': { c: 'DS', d: { D: -1, S: 1 }, P: 'down', Q: '?' },
  'q-ink': { c: 'DS', d: { D: 1, S: 1 }, P: '?', Q: 'up' }, 'q-rice': { c: 'S', d: { S: -1 }, P: 'up', Q: 'down' },
  'q-icecream': { c: 'D', d: { D: 1 }, P: 'up', Q: 'up' }
};

# EcoLogic Market Lab: Chợ Lớp 9

Two classroom market lessons for Cambridge IGCSE Economics 0455, in one web app. Students join on tablets or laptops with a room code; the teacher runs each lesson from a console and the projector view.

| File | What it is |
|---|---|
| `index.html` | The app's home page: students join any lesson here; teachers open Level 0 or Level 1; setup check |
| `level0.html` | Lesson 1, Level 0: the market opens |
| `level1.html` | Lesson 2, Level 1: the trading floor |
| `level2.html` | Lessons 3–4, Level 2: the online market with shocks, price locks and real prizes |
| `blended.html` | Optional extra lesson: the blended market with real goods and laptop tills |
| `config.js` | **The only file you edit**: Supabase details for online joining and AI marking |
| `supabase/functions/mark/index.ts` | The AI marking function (runs on Supabase, holds the Claude API key) |

Students always go to the home page, type the room code and a nickname, and the app opens the right lesson. Nicknames, the chosen good and badges carry over between lessons on the same device.

## Deploying

### 1. Put the app on GitHub Pages
1. Create a free GitHub account, then a new **public** repository (for example `market-lab`).
2. **Add file → Upload files**, drag in everything from this folder (including the `supabase` folder), and commit.
3. **Settings → Pages → Build and deployment → Deploy from a branch → main → / (root) → Save.**
4. After a minute or two the site is at `https://<your-username>.github.io/market-lab/`. The home page should say **Test mode only**.

### 2. Try it in test mode
Open the site, choose **Open Level 0**, then **Open a new room**, then **Open a test student tab** two or three times. Each tab is a student. Run a few steps of the lesson. Do the same for Level 1.

### 3. Let students join from their own devices (Supabase)
1. Create a free account at supabase.com and a new project (choose a nearby region, such as Singapore).
2. In the project: **Project Settings → API Keys**. Copy the **Project URL** and the **publishable key** (starts `sb_publishable_`; the older "anon" key also works). Never use a secret key.
3. On GitHub, open `config.js`, click the pencil icon, paste the two values between the quotes, and commit.
4. Wait a minute, open the home page: it should say **Online**. Open **Setup check → Test the online connection**. It should say ✓ Connected.
No database tables are needed: the app only uses Realtime Broadcast, and nothing about students is stored on Supabase. If the test fails, check that Realtime allows public channels and ask school IT to allow `*.supabase.co`.

### 4. Turn on AI marking (Level 1 Explain question)
1. Get a Claude API key at console.anthropic.com (this needs credit on the account).
2. Install Node.js on your computer if you don't have it. In a terminal, in the folder that contains `supabase/functions/mark`:
   ```
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase secrets set ANTHROPIC_API_KEY=<your-claude-key>
   npx supabase secrets set ALLOWED_ORIGINS=https://<your-username>.github.io
   npx supabase functions deploy mark --no-verify-jwt
   ```
   The project ref is the part of your Supabase URL before `.supabase.co`. `--no-verify-jwt` is needed because the new publishable keys are not JWTs.
3. On the home page: **Setup check → Test AI marking**. It should mark a sample answer (a good marker gives it 2 or 3 out of 4).
Without this step, Level 1 still works and gives a clearly labelled keyword estimate instead.

### 5. Rehearse on the school network
With the teacher laptop and two or three student devices on school Wi-Fi: run both setup tests, then a short Level 0 and Level 1 with real devices (robots fill the rest of the Level 1 market).

### Data and privacy
Students use nicknames only. The lesson runs in the teacher's browser, and results stay there (download them as CSV). Supabase only passes messages between devices. With AI marking on, a student's written answer, without any name, is sent to the Claude API to be marked; check this fits your school's policy.

---

# The game layer (all levels)

Every level shares one game layer: the same look, sounds and rewards. It is built into each page (no extra files). Sounds are generated in the browser, and pictures are drawn in code, so pages stay light on cheap tablets.

**On students' screens**
- **Avatar and table.** Students pick an avatar on the join page or in the lobby, and a table (🔴 🔵 🟢 🟡) for team scores. Avatars appear on the board, leaderboard, podium and badge feed.
- **Market stalls and wallets.** Shops and businesses see a stall with an awning and their units on a shelf. Sold units get a SOLD stamp. Buyers see their card as a shopping list with a basket that fills as they buy. In Level 2 offers mode, buyers walk a "market street" of shop stalls, and shops can name their shop.
- **Tap-to-price.** A big price tag with −/+ buttons and a slider replaces typing.
- **Live price ticker.** Recent trade prices, with ▲ or ▼ against the trade before.
- **Prize jar.** In Level 2 the jar fills with the sweets the student will actually take home. In Levels 0 and 1 it is a coin jar for points.
- **Titles.** Street Vendor → Market Trader → Merchant → Tycoon (with Vietnamese names). Level 2 titles come from the market score; Levels 0 and 1 from points.
- **Breaking news.** Every shock (cacao harvest, Halloween, …) opens with a full-screen headline, a theme and a sound, in English and Vietnamese. Round starts, activity starts and the envelope reveal get a short headline too.
- **Feedback.** Coins fly to the jar after a trade, "+3k" floats up, a soft "bonk" and shake explain a blocked move, and the timer turns red and ticks in the last 10 seconds.

**New game mechanics that teach**
- **Level 2 badges** reward good economic play, never the number of trades: Deal maker, Bargain hunter (bought 5k or more below value), Sold out (all 4 units of a product, at a profit), Price finder (within 1k of equilibrium), Nothing wasted (menu round: no surplus and nobody turned away), Forecaster, Every round, Hot streak, Tycoon.
- **Level 2 predictions.** Before a shock round, the console offers "Ask: up, down or the same?". Students predict the price move on their device; starting the round locks the answers. The answer is judged from the cards (the equilibrium before and after the shock), not from the class's trades. Each correct prediction adds a quarter of a round to the market score, so it adds to the sweets without changing the total.
- **Level 1 envelope guess** (optional step after Round 3). Students guess the sealed equilibrium price; within one price step earns +5 points and the Envelope cracker badge.
- **Fair leaderboard.** Level 2 ranks by market score: 100 pts = what an average trader earns at the equilibrium price in one round, so buyers and shops can win equally. Only the top 5 and a "most improved" are shown; the bottom is never shown. Levels 0 and 1 rank by points.
- **Teams.** Buyers vs shops (Level 2) or buyers vs businesses (Level 1), and table teams, all as an average per member so small teams are not at a disadvantage.

**On the projector**
- **Trading floor** (Level 2 board view, the default): each trade is a dot in the order it happened, with the average of the last 5 trades. After you reveal the equilibrium, the demand and supply curves from the cards appear behind the dots.
- **Leaderboard and teams** view (Level 2), and a top-5 leaderboard in the side panel on every level.
- **▶ Replay** the last round (Level 2) or the lesson's trade prices (Level 1).
- **🏆 Podium**: 3rd, 2nd and 1st are revealed with a drumroll; Level 2 also shows the most improved trader.

**Sound and motion controls**
- The teacher's **Sound on/off** controls the projector. **Student sounds on/off** mutes every student device at once. Students' own sound starts off and is quieter than the projector, so the room is not 30 tablets beeping.
- **✨ Effects on/off** (every device) turns off animations and particles. It is also off automatically when a device asks for reduced motion.

# Level 1: the trading floor

File: `level1.html`. Every student gets one card: a **buyer card** (what one item is worth to them, with a persona such as Busy nurse) or a **business card** (the ingredient cost of one item, such as Mall counter). Robot traders fill the market to 30. Prices move in 5.000đ steps for trà sữa (2.500đ for bánh mì and chocolate). The cards are designed so the market clears at **30.000đ, 8 items** (15.000đ for the other goods) for any class size.

| Step | Students | Projector |
|---|---|---|
| Diagnostic check (optional) | 10 Paper 1 style questions | Number submitted |
| Deal the cards | See their card | Story banner, sealed envelope |
| Practice round, Round 1 | Buy now / sell now, or post an offer with the price stepper and gain zone | **Live demand and supply staircases** built from current offers and asks, trade prices by round, a trade ticker |
| Prediction | Will prices get closer together in Round 2? Judged automatically when Round 2 ends | Poll results |
| Rounds 2 and 3 | Same cards | Same, with sound |
| Open the sealed envelope | | The true curves from the cards, the equilibrium marker, and the equilibrium line on the trade-price chart. Locked until Round 3 is played |
| Debrief (own pace, marked) | Paper 2 style questions with command words and marks (see below). The schedule and the plotting grid come first, side by side with the questions | |
| Knowledge check | 10 Paper 1 style questions on the price mechanism, equilibrium and disequilibrium, including 2 built from the class's own cards and trades | Class results by question, when you choose |
| Badges | Badge wall plus Level 0 badges | Badge wall |

**Private cards.** Each student's card is encrypted for that student only (ECDH key agreement with AES-GCM in the browser), so classmates cannot read other cards with developer tools. This needs HTTPS or localhost, which GitHub Pages and test mode both provide.

**Badges (13).** First trade, Every round, Market opened (class), Bargain hunter (gain of 15.000đ or more), Profit maker (profit of 15.000đ or more), Market maker (posted an offer someone accepted), On target (traded within one step of equilibrium in Round 3), Market forecaster, Curve plotter, Explainer, Word collector, Exam ready, Perfect paper.

**Teacher tools.** Round summary, robot check (200 simulated markets), trade log CSV in đồng, debrief dashboard with "right first time" by task, homework question from the class's data, knowledge-check dashboard with diagnostic vs final marks and CSV.

**Keyboard (laptops).** ← → change the price, Enter sends, B buys now, S sells now, Esc cancels.


## Level 1 debrief and lesson grades

The debrief is marked like Paper 2. The first answer to each question counts; students can try again to learn.

| Question | Marks | How it is marked |
|---|---|---|
| Using the schedule, plot the demand and supply curves | 2 | 1 per curve with all 5 points right at the first check. Double-tap a point to remove it |
| Identify the equilibrium price | 1 | First answer |
| State the equilibrium quantity | 1 | First answer |
| State whether your card is counted at the equilibrium price | 1 | First answer |
| Calculate the shortage | 2 | 2 if right first time, 1 if right second time |
| Calculate total revenue | 2 | As above |
| Calculate the gap between the class's average price and equilibrium | 2 | As above |
| Explain how the price mechanism decided which businesses sold | 4 | AI marking against a 4-point mark scheme, with instant feedback and a next step |

**Lesson grade** = debrief (15) + knowledge check (10) = **25**. The teacher console shows each student's marks, the class average and standard deviation, and flags students more than 1 standard deviation below the average, plus anyone who has not finished. You can change any Explain mark, and download the grades as CSV.

AI marking setup: see **Deploying → 4. Turn on AI marking** at the top of this file.

---


# Level 2: the online market with prizes

File: `level2.html`. Every student trades online. **Buyers** get a value card each round (what one unit is worth to them; one of each product at most). **Shops** (A–E) get 4 units of each product per round and a **supply schedule**: the lowest price they'll accept for the 1st, 2nd, 3rd and 4th unit. Earnings turn into real prizes at the end. Robots fill empty shops and buyer cards, so the market always has 5 shops and 19 buyer cards.

**When you open a room** you choose:
- **Products:** chocolate only (default), candy only, or both.
- **Lesson plan:** Standard (default) or Advanced.

**Standard plan** (fast mode: an open order book; buyers post offers, shops post asks, trades happen automatically):

| Round | What it shows | Chocolate, from the cards |
|---|---|---|
| Practice (1 minute, unscored) | Learning the buttons | |
| 1: Find the price | Equilibrium (2.4.2) | about 15–16k, 10 sold |
| 2: Menu prices | Each shop chooses ONE price for the whole round. Too high: unsold stock (a surplus). Too low: buyers turned away (a shortage). (2.4.3) | |
| 3: Cacao harvest hit | Costs +3k: decrease in supply (2.3.3) | about 17k, 9 sold |
| 4: Halloween | Values +4k: increase in demand (2.2.3) | about 17k, 13 sold |

For candy only, round 3 is the sugar harvest instead. In fast mode a shop's ask stays up for its next unit if it is still at or above that unit's lowest price, so shops don't re-enter prices after every sale.

**Advanced plan** (7 rounds, shops + offers: buyers buy at a shop's price or send an offer the shop can accept, counter or decline): practice, board off, board on, fast mode, menu prices, cacao, Halloween, Halloween + sugar.

**Events** (only those that fit your products are shown): cacao harvest hit, sugar harvest hit, Halloween, pocket money day, new factory opens (costs −2k: increase in supply), health campaign (values −3k: decrease in demand). Plan rounds set the events for that round; events you add yourself start with the next round.

**Fixed price (optional):** fix the price for a round. Below equilibrium shows a shortage, above shows a surplus (2.4.3). It uses disequilibrium language only; later you can reuse it as an example of maximum and minimum prices (2.10.3).

**Reveal and explain:** **Reveal** shows the last round's equilibrium (price band and quantity) on the board. The **Signal, incentive, rationing** view explains each shock against the latest round without it, using the class's own cards: the shortage or surplus at the old price, the extension or contraction in supply and demand, and the new equilibrium. After menu prices, the board lists each shop's price, sales, and whether it had a surplus or a shortage.

**Prizes.** You choose the total number of sweets and how many each student gets for taking part. The rest are shared in proportion to earnings, scaled so an average buyer and an average shop earn the same share. Practice rounds don't count. Students see their running prize; the console prints a prize list with a tick column.

**Cards and fairness.** Buyer cards are reshuffled every round and encrypted for their owner. **Deal new roles** gives the shops to students who haven't run one yet (use it at the start of lesson 2).

**After the lesson:** download the trades CSV and print the prize list.

**Not in this version:** the debrief questions and grades for Level 2.

---

# Optional extra: the blended market (real goods)

File: `blended.html`. Real chocolate and candy in the room. **Buyers** have only a buyer number and play money; they keep what they buy, so they buy because they want it. **Five shops** (A–E) sell from tables, haggle, and record each sale on a laptop till. Only you and the five shops use devices.

**Setting up a room:** number of buyers, play money per buyer (default 25k), a fresh budget each round or one for the whole lesson, and round length. Shop teams go to the home page, type the room code and a team name, and choose their shop letter. **Print buyer numbers, shop signs and play money** from the console.

**The till:** each shop sees the lowest price it accepts for its 1st to 4th unit of each product (rising, because extra stock costs more to get). For each sale: set the agreed price, type the buyer number, tap Sold and confirm. A sale below the lowest price needs "Sell anyway". Stock (4 of each product per round) and profit update live. "Undo last sale" fixes mistakes. English/Vietnamese toggle. **If the Wi-Fi drops,** sales are saved on the laptop and sent when it returns; a sale is never counted twice.

**The console:** a lesson plan you step through, rounds with a countdown and pause, events, price lock, the board, and every sale with Undo.

| Round | Lesson | What happens |
|---|---|---|
| 1: board off | 1 | Prices hidden; buyers walk round and compare |
| 2: board on | 1 | Live prices on the board |
| 3: price lock | 1 | Lock a price (e.g. chocolate at 10k). Tills only accept that price. Ask for hands up: who still wants one? The board shows the shortage |
| 4: cacao harvest hit | 2 | Chocolate costs +3k at every shop: supply shifts left. Watch candy too (a substitute) |
| 5: Halloween | 2 | Announcement only: demand rises for both |
| 6: Halloween + sugar harvest hit | 2 | Both product costs +2k with high demand: price rises, quantity is unclear |

Custom events: a headline, which product, and either a change in shop costs (in k, negative lowers them) or an announcement only. Cost events stay on until you end them.

**The board (projector):** live shops (stock and last price), latest deals, a price chart of every sale by round with the middle price, and a round summary (units sold, middle price and range per product, with events). Big banners announce each event in English and Vietnamese.

**Checks:** the console flags any buyer who spent more than their budget (usually a typing mistake) and sales that arrived after their round ended. The tills reject buyer numbers that don't exist.

**After the lesson:** download the sales CSV (every sale with round, shop, product, buyer, price, unit, lowest price, profit and events).

**Not in this version:** debrief diagrams (draw them from the round summary and CSV), demand curves, predicted equilibria and grades.

---

# Level 0: Chợ Lớp 9 opens (bridging activities)

Run this lesson first. File: `level0.html`.

Open `level0.html?mode=teacher`, choose the good (trà sữa, bánh mì or chocolate bar), then work through the steps. The projector view drives the lesson; student tablets and laptops follow along.

| Step | What students do | What the projector shows | Syllabus |
|---|---|---|---|
| Diagnostic check (optional) | 10 Paper 1 style questions before the activities | Number submitted | |
| Read your card | Six one-item decisions in đồng: buy if satisfaction is more than the price and affordable; make if the price is more than the ingredient cost; rent doesn't change the decision | Class progress | 2.2, 2.3, 3.6 |
| Would you buy it? | Each student gets a different buyer card (budget, satisfaction from a 1st and 2nd item; each card stands for 40 customers) and chooses 0, 1 or 2 at each price | Market demand, adding up every card | 2.2.1, 2.2.2 |
| Would you sell it? | Each student runs a different business (ingredient cost, capacity, rent) and chooses none, half or full capacity. Then fixed vs variable cost questions, break-even, and a written "why does supply slope up?" | Market supply, adding up every business | 2.3.1, 2.3.2, 3.6 |
| Where do they meet? | Predict the equilibrium, then spot shortages and surpluses | Both curves, the reveal, gap arrows | 2.4.2, 2.4.3 |
| Deals with Robo-Trader | Bargain in đồng as buyer and seller, then walk away from a no-win deal | Class progress | Prepares for Level 1 |
| Knowledge check | 10 Paper 1 style questions (A–D), no glossary, exam-pace timer, marked on submit with explanations | Submissions; class results by question when you choose | All of the above |
| Badges | Badge wall and points | Badge wall and final curves | |

**Knowledge check.** Each student gets 10 questions drawn from a bank of 22, plus 2 built from the class's own schedule, following a fixed blueprint (definition, market sum, law of demand/supply ×2, equilibrium, class data ×2, shortage/surplus ×2, costs). Options are shuffled per student. The teacher panel shows each student's diagnostic and final mark, the percentage correct per question (weakest first), and a CSV download. Badges for the final check only: Exam ready (8+) and Perfect paper (10/10).

**Badges (17).** Everyone can reach: Opening day, Every price, Market opened (class meter at 50%), Word collector (opened 5 glossary words). Skill: Card reader, Smart shopper, Profit maker, Market forecaster, Gap spotter, Cost expert, Break-even, Haggler, Smart walk-away, Exam ready, Perfect paper. Thinking: Self-corrector (fixed an answer after the "Is that what you meant?" prompt), Explainer.

**Profile cards.** The buyer and business cards are in `BUYER_PROFILES` and `SELLER_PROFILES` near the top of the second script in `level0.html` (numbers in thousand đồng, written for trà sữa; they scale for the other goods). As shipped, if students choose sensibly, the curves cross at or just below 30.000đ for any class size from 3 to 36. Students can still choose differently, and the curves show what they actually chose.

**Costs.** Ingredients are a variable cost: the same for every item. Rent is a fixed cost: paid per day, whether the business makes anything or not, so it affects profit but not how many to make. Supply slopes up because businesses have different costs: as the price rises, more of them can cover their ingredient cost.

**Sound** plays on the teacher's computer only (no sound files: it is generated in the browser). Student devices are muted unless the student turns sound on.

**Points and badges** reward learning as well as trading: answering, predicting, spotting gaps, reading cards and bargaining. All points go into one class meter, so there is no individual leaderboard.

**Keyboard shortcuts** for laptops: Y/N to answer, 1/2 in the card quiz, arrows plus Enter to bargain, A to accept, W to walk away.

**Tip:** in "Where do they meet?", show three different prices so students can earn the Gap spotter badge.

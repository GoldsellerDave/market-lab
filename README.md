# EcoLogic Market Lab: Chợ Lớp 9

Two classroom market lessons for Cambridge IGCSE Economics 0455, in one web app. Students join on tablets or laptops with a room code; the teacher runs each lesson from a console and the projector view.

| File | What it is |
|---|---|
| `index.html` | The app's home page: students join any lesson here; teachers open Level 0 or Level 1; setup check |
| `level0.html` | Lesson 1, Level 0: the market opens |
| `level1.html` | Lesson 2, Level 1: the trading floor |
| `level2.html` | Lessons 3–4, Level 2: the blended market with real goods (first version) |
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


# Level 2: the blended market (first version)

File: `level2.html`. Real chocolate and candy in the room. **Buyers** have only a buyer number and play money; they keep what they buy, so they buy because they want it. **Five shops** (A–E) sell from tables, haggle, and record each sale on a laptop till. Only you and the five shops use devices.

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

# EcoLogic Market Lab: Market Town

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

#### Does the free plan fit a class of 30?
Yes, for a class of 30. The free plan allows 200 devices at once, 100 messages a second and 2 million messages a month. Supabase counts every copy of a message: 1 when it is sent, plus 1 for each device that receives it. The app is built to stay well under the limits:
- The room channel carries only what everyone needs: the shared state from your console.
- Each student also has a private channel that only that student and your console join. Cards, marks and everything a student sends go there, so each message counts 2, not 31.
- Your console paces what it sends (at most about 45 a second). A newer update replaces one that is still waiting.
- No updates every second during a round. Devices count the timer down themselves, and your console sends a heartbeat every 3 seconds.

Measured with 30 simulated students trading in Level 1 (each sending an order every few seconds):

| | Before | Now |
|---|---|---|
| Waiting between rounds | 12 a second | 10 a second |
| Round start (busiest second) | 915 | 52 |
| During a round (average / busiest second) | 270 / 671 | 41 / 65 |

Level 2 is similar (31 a second on average in a round, 71 in the busiest second). A 50-minute lesson uses roughly 60,000–80,000 messages, so the monthly allowance covers about 25–30 lessons with a class of 30. Over the monthly allowance, or for several classes at once, the Pro plan ($25 a month) allows 500 a second and 5 million a month.

Two other things to know:
- A free project **pauses after 7 days without use**. Open the Supabase dashboard and press **Restore** before a lesson if you haven't used it for a week.
- AI marking: the free plan includes 500,000 function calls a month, far more than you need. The Claude API is paid separately: about half a US cent per marked answer, roughly $1–2 per lesson for 30 students.

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
| Debrief, extension and Paper 2 | Debrief from the class's cards and rounds, an extension, and Paper 2 Sections A and B (see "Debrief, extension and Paper 2") | |
| Knowledge check | 10 Paper 1 style questions on the price mechanism, equilibrium and disequilibrium, including 2 built from the class's own cards and trades | Class results by question, when you choose |
| Badges | Badge wall plus Level 0 badges | Badge wall |

**Private cards.** Each student's card is encrypted for that student only (ECDH key agreement with AES-GCM in the browser), so classmates cannot read other cards with developer tools. This needs HTTPS or localhost, which GitHub Pages and test mode both provide.

**Badges (13).** First trade, Every round, Market opened (class), Bargain hunter (gain of 15.000đ or more), Profit maker (profit of 15.000đ or more), Market maker (posted an offer someone accepted), On target (traded within one step of equilibrium in Round 3), Market forecaster, Curve plotter, Explainer, Word collector, Exam ready, Perfect paper.

**Teacher tools.** Round summary, robot check (200 simulated markets), trade log CSV in đồng, the Debrief and Paper 2 dashboard, knowledge-check dashboard with diagnostic vs final marks and CSV.

**Keyboard (laptops).** ← → change the price, Enter sends, B buys now, S sells now, Esc cancels.


## Debrief, extension and Paper 2 (all levels)

At the end of each level, open the **Debrief and Paper 2** panel in the teacher console and click **Open the debrief from our data**. The app freezes that lesson's data, so every student answers about the same numbers. It builds four sections, which you switch on and off from the panel:

| Section | What it is | Marks |
|---|---|---|
| **Debrief** | Short tasks that read the class's own tables, with instant feedback and an explanation. One personal question uses the student's own card or shop. | Formative: the dashboard shows "right first time" per student and per task |
| **Extension** | Uses the level's idea in a new situation, with a stretch part. Level 0: build market demand from three buyer cards. Level 1: work out the schedule and equilibrium for ten new traders. Level 2: find tomorrow's market-clearing menu price, then a 2.5 preview (a new factory opens). | Not graded |
| **Paper 2 · Section A** (in class) | A data-response question in the 2027 specimen format: Calculate [2], Identify [2], Explain [2], Draw [4], Analyse [4], Discuss [6]. The sources are the class's own tables. | 20 |
| **Paper 2 · Section B** (homework) | A structured question: Define [2], Explain two [4], Analyse [6], Discuss [8], marked with the levels-of-response table. Level 2's Section B covers 2.5 (changes in demand and supply). | 20 |

**Where the data comes from.** Level 0: the class demand and supply schedules. Level 1: the schedule hidden in everyone's cards, and the prices in each round. Level 2: the menu-prices round, the market before and after the cacao (or sugar) harvest shock, and the average price in each round. If the class data cannot give an answer (for example, the class curves never crossed), the app uses the cards instead and says so on the panel and the source.

**Marking.**
- Calculate, Identify and order questions are marked instantly.
- **Draw** is done on the tablet: students tap the demand points, the supply points and the equilibrium, then choose the axis labels. 1 mark each.
- Explain, Analyse and Discuss answers are marked by AI against the mark schemes in the Supabase `mark` function (redeploy it: there are 21 new schemes). If AI marking is not set up, a keyword estimate is shown, marked "estimate", and flagged for you to check.
- You can change any written mark in the panel.

**Grades.** The panel shows each student's debrief, extension, Section A, Section B and the Paper 1 check (every level). It also shows the total and percentage, the class average and standard deviation, and flags anyone more than 1 SD below the average. "Which parts the class found hard" lists the average per part, and grades download as CSV. Level 1's old /15 debrief and /25 lesson grade are replaced by this.

**Printables.** Print Section A, Section B, the debrief and extension, or the teacher mark scheme (answers, model points, the levels table and a worked diagram). Each print includes the class's data, with a name line and answer lines.

**Homework on the device.** Section B can be done at home on the student's tablet or laptop, even when your console is closed. Answers and marks are saved on the device and sent to you the next time the student joins the room. Use **Resume room** next lesson so the room code stays the same.

AI marking setup: see **Deploying → 4. Turn on AI marking** at the top of this file.

### Level 0: keeping the curves clean with a small class
With few students, one wrong tap can make a curve slope the wrong way. Level 0 has three safeguards:
- **Robot cards.** Robots answer exactly as their card says for every card no student holds, so the market always has at least 12 cards (6 buyers and 6 sellers). The projector and the student screen say how many robots joined. Turn them on or off at setup (**Robot cards fill the empty places**) or under **Robot cards** in the settings panel during the lesson. With 12 or more students, robots are not needed.
- **Check your card.** If a student's answer goes against their own card (for example, buying when the price is above what the card allows), a message asks them to check. They can choose **Change my answer** or **Keep** it.
- **Debrief data.** The debrief step has a **Data** choice: *class answers (if the curves are normal)* or *the cards (always clean)*. On automatic, the app uses the cards if a class curve is unfinished, slopes the wrong way, or never crosses the other one. The source then says that the data came from the cards and that robot cards were included.

### Level 2 Paper 2 Section A: one table
Level 2's Section A (20 marks) uses one source only: **the chocolate market before and after the cacao harvest hit**, with 7 rows taken from your class's cards. The candy version uses the sugar harvest instead. The parts are:
- **(a) Calculate [2]:** the shortage at the old price after the harvest hit.
- **(b) Identify [1+1]:** the new equilibrium price and quantity.
- **(c) Explain [2]:** why quantity supplied fell at every price.
- **(d) Draw [4]:** demand, S1 (before), S2 (after) and both equilibria (E1 and E2), drawn on the tablet. The price axis starts just below the data.
- **(e) Analyse [4]:** how the price mechanism (signal, incentive, rationing) moved the market to the new equilibrium, using data.
- **(f) Discuss [6]:** whether or not the harvest hit is bad for everyone in the market.

The debrief keeps the menu-price and price-by-round tables. Parts (c), (e) and (f) have AI mark schemes. After updating, redeploy the marking function once (`npx supabase functions deploy mark --no-verify-jwt`). Until then, those parts get a keyword estimate that is flagged for you to check.

### Level 2 missions, price guesses, round results and the team race
**Missions.** At the start of every round each student gets a private mission that their card can achieve. A buyer whose card is worth more than the price gets a trading goal (for example "Buy with a gain of at least 2k"). A buyer who is priced out gets something they can still do, such as haggling with two shops, posting an offer, or a quick "Spot it" question ("Which shop has the cheapest price?", "Why is it harder to buy this round?"). Shops get goals such as "Sell 2 units", "Make at least 4k profit" or "Make a counter-offer that a buyer accepts". The app checks missions itself. "Spot it" questions have one try and can be answered until the next round starts.

**Price guess.** For the first 30 seconds of each scored round, students tap a guess for the class's average price. A guess within 1k of the actual average counts as correct, and the closest guess is named on the result card.

**Bonus sweets.** Each mission done and each correct guess earns 1 bonus sweet on top of the prize pool. When you open the room, you can choose "None" instead. The prize table and the printed prize list include the bonus. New badges: 🗺️ Mission master (3 missions) and 👁️ Sharp eye (a guess within 1k).

**Round result card.** When a round ends, every student's device shows the demand and supply curves drawing in, with the equilibrium marked. After a shock, the old curve fades and the new one slides across. Under the chart are two or three short lines in English, with Vietnamese support, plus a line about the student's own result. For example: "Your card was worth 13k, less than the price of about 15.5k. You were priced out: that is the demand curve at work." The card also shows the student's mission and guess results and their team's place. Students tap **Got it** to close it, and can play it again from their between-rounds screen. It closes by itself when you open the knowledge check or the debrief.

**Team race.** Choose **Team race** on the board (or **🏁 Team race on the board** in the Missions panel). Tables race each other (students pick a table in the lobby). If fewer than two tables are in use, buyers race the shops. A team's score is the average per member of market score + 20 points per mission + 10 per correct guess, so big and small tables are treated the same. The **🎯 Missions** panel on your console shows how many missions are done, the guesses and who had which mission.

### Level 2 knowledge check (Paper 1 style)
At the end of Level 2, open **📝 Knowledge check** in the console (between rounds). Each student gets **10 multiple-choice questions (A–D)** on their device, and every wrong option is a common misconception. The questions cover:
- **Shifts or movements (2.2, 2.3):** what shifts demand or supply, compared with a movement along a curve.
- **Price changes (2.5):** which way price and quantity move when demand or supply rises or falls, when both shift together, and what happens first after a shock.
- **Diagrams and tables:** reading a shift and finding a new equilibrium.
- **Shortages and surpluses (2.4):** from fixed or menu prices.
- **The price mechanism (2.4):** signal, incentive and rationing.

Two questions come from your class's market: which curve the harvest shock moved, and the shortage at the old price. Papers are shuffled per student, marked when submitted, and explain every answer.

The console shows results by question (weakest first) and by student, with a CSV download. **Show class results on the board** puts the results on the projector. Marks also appear as "Paper 1 check" in the Debrief and Paper 2 grades panel. **Close** hides the check; **Open again** keeps the results. If the debrief is open at the same time, students get two tabs: **📝 Knowledge check** and **📊 Debrief, extension and Paper 2**. After submitting the check, a button takes them to the debrief. Section A and Section B appear only once you switch them on in the Debrief and Paper 2 panel.

### Round length (Levels 1 and 2)
Rounds can be 1 to 5 minutes long in Level 1, and 1 to 6 minutes long in Level 2. Choose a length when you open the room. You can change it between rounds with **Round length** next to the start button, and it applies to the next round. In tests with 1-minute rounds, the robots still reached the equilibrium quantity (10 chocolate bars in Level 2, 8 in Level 1). Suggested lengths: 1–2 minutes for fast-mode and menu rounds, and 2–3 minutes for rounds with offers, because offers last 30 seconds.

### Vietnamese on or off
The game is called **Market Town** (Thị Trấn Chợ). Every teacher console has a **🇻🇳 Tiếng Việt: on / Vietnamese: off** button in the top bar; the home page has one for that device, which also sets the default for your new rooms.
- **On:** Vietnamese appears as before: headlines, news broadcasts, chips, team names, titles and the glossary.
- **Off:** no Vietnamese on the console or the board, including headlines, broadcasts, the news crawl, chips and tooltips. On students' devices, Vietnamese stays only as **small support text**: the subtitle under a headline, the line under each "What changes" card and story line, team names, titles, the up/down/same buttons, and the glossary when a student taps a word. Vietnamese is removed from the student headline strips and the news crawl.
- Names of goods (trà sữa, bánh mì), prices in đồng and place names stay in every setting.
- The blended lesson's till laptops keep their own English/Vietnamese button.

### The demand and supply panel, the equilibrium and the news
Each level now has a big **demand and supply panel** across the top of the teacher console, with chips for the **equilibrium price** and **equilibrium quantity**.
- **Level 0:** the class curves fill the panel as students answer. When you reveal "Where do they meet?", the chips show the equilibrium price and quantity. The chart marks them on both axes (P* and Q*), on the console and the board.
- **Level 1:** the panel shows the live order book during a round. Between rounds it shows that round's trades in order, next to the prices by round. After each round a "Round over" flash gives the average price and says whether prices came closer together. The equilibrium stays sealed until the envelope opens. **Peek** shows you the true curves on your screen only (never on the board).
- **Level 2:** at the end of every round the equilibrium is revealed automatically. A flash on the board and every student device gives the equilibrium price and quantity. The board switches to the trading floor. After a shock, the panel shows **both markets**: the old curve faded (D₁ or S₁) and the new curve (D₂ or S₂). The new curve slides into place, with an arrow ("Supply decreases") and both equilibria (E₁ → E₂, P₁ → P₂, Q₁ → Q₂). A sentence explains the change ("costs +3k → supply decreases (S shifts left). The price rises and the quantity falls"). **▶ Show the shift again** replays it, **Hide equilibrium** hides it, and **Peek** shows the curves to you during a round.

**News broadcasts (Level 2).** Every event (cacao harvest, sugar harvest, Halloween, pocket money, new factory, health campaign) now comes as a TV-style broadcast on the board and every student device, in about 20 seconds:
1. **Breaking news:** the headline in English and Vietnamese.
2. **The story:** an animated picture (storm, drought, Halloween night…) and three short reporter lines, each with a Vietnamese subtitle.
3. **What changes:** who is affected. Each student sees their own change, such as "Your lowest price for each unit: 9k→12k, 11k→14k…" for a shop, or "Chocolate was worth 22k, now 26k" for a buyer.

The broadcast plays when you open the prediction ("COMING NEXT ROUND"); the round itself then starts with a short flash. If you start an event round without a prediction, the broadcast plays at the start, and the round clock and the robots wait for it. While an event is on, a **news crawl** runs along the bottom of the board and every student screen. Tap moves to the next scene; **Skip** closes it. The ✨ Effects switch keeps the scenes but stops the animation.

### Levels 1 and 2: why the curves stay clean
In Levels 1 and 2, demand and supply come from the **cards**, not from what students tap, so students cannot bend them. With robots on (the default), every game gets the full designed market: Level 1 always has 30 cards crossing at the designed equilibrium (price step 6), and Level 2 always has 19 buyer cards and 5 shops. Every shock moves the equilibrium the right way for any class size from 19 to 45 buyers. What students do changes the **trade prices**, so the app also does the following:
- **Robots learn.** Level 1 robots aim halfway between last round's average and the equilibrium. In Level 2, Round 1 is a free-for-all; from Round 2, and in the menu round, robots aim at that round's equilibrium. A shock (cacao harvest, Halloween) then shows up in the prices.
- **Questions follow the data.** Level 1's Paper 2 (c) asks "why the trading prices moved closer to one price" only when the prices actually came closer together. Otherwise it asks why prices *usually* move closer as traders gain experience. Level 2's debrief question about the shock round takes its answer from your class's prices.
- **Robots off.** Level 1 uses a smaller card set that still slopes and crosses at exactly 6, and every card is dealt. Level 2 spreads the buyer cards across the full range, and empty shops always get a robot. With a small class the curves have only a few steps, so the app warns you when you deal. Keep robots on unless you have 30 or more students.

---


# Level 2: the online market with prizes

File: `level2.html`. Every student trades online. **Buyers** get a value card each round (what one unit is worth to them; one of each product at most). **Shops** (A–E) get 4 units of each product per round and a **supply schedule**: the lowest price they'll accept for the 1st, 2nd, 3rd and 4th unit. Earnings turn into real prizes at the end. Robots fill empty shops and buyer cards, so the market always has 5 shops and 19 buyer cards.

**When you open a room** you choose:
- **Products:** chocolate only (default), candy only, or both.
- **Lesson plan:** Standard (default) or Advanced.

**Standard plan** (a bargaining round, then fast mode: an open order book where buyers post offers, shops post asks and trades happen automatically):

| Round | What it shows | Chocolate, from the cards |
|---|---|---|
| Practice (1 minute, unscored) | Learning the buttons | |
| 1: Bargaining (board off) | Buyers buy at a shop's price or haggle: send an offer, and the shop accepts, counters or declines. No price board, so prices are spread out. Use 2–3 minutes. | about 15–16k, 10 sold |
| 2: Find the price | Equilibrium (2.4.2): with an open market, prices close in | about 15–16k, 10 sold |
| 3: Menu prices | Each shop chooses ONE price for the whole round. Too high: unsold stock (a surplus). Too low: buyers turned away (a shortage). (2.4.3) | |
| 4: Cacao harvest hit | Costs +3k: decrease in supply (2.3.3) | about 17k, 9 sold |
| 5: Halloween | Values +4k: increase in demand (2.2.3) | about 17k, 13 sold |

For candy only, round 3 is the sugar harvest instead. In fast mode a shop's ask stays up for its next unit if it is still at or above that unit's lowest price, so shops don't re-enter prices after every sale.

**Advanced plan** (7 rounds, shops + offers: buyers buy at a shop's price or send an offer the shop can accept, counter or decline): practice, board off, board on, fast mode, menu prices, cacao, Halloween, Halloween + sugar.

**Events** (only those that fit your products are shown): cacao harvest hit, sugar harvest hit, Halloween, pocket money day, new factory opens (costs −2k: increase in supply), health campaign (values −3k: decrease in demand). Plan rounds set the events for that round; events you add yourself start with the next round.

**Fixed price (optional):** fix the price for a round. Below equilibrium shows a shortage, above shows a surplus (2.4.3). It uses disequilibrium language only; later you can reuse it as an example of maximum and minimum prices (2.10.3).

**Reveal and explain:** **Reveal** shows the last round's equilibrium (price band and quantity) on the board. The **Signal, incentive, rationing** view explains each shock against the latest round without it, using the class's own cards: the shortage or surplus at the old price, the extension or contraction in supply and demand, and the new equilibrium. After menu prices, the board lists each shop's price, sales, and whether it had a surplus or a shortage.

**Prizes.** You choose the total number of sweets and how many each student gets for taking part. The rest are shared in proportion to earnings, scaled so an average buyer and an average shop earn the same share. Practice rounds don't count. Students see their running prize; the console prints a prize list with a tick column.

**Cards and fairness.** Buyer cards are reshuffled every round and encrypted for their owner. **Deal new roles** gives the shops to students who haven't run one yet (use it at the start of lesson 2).

**After the lesson:** download the trades CSV and print the prize list.

**Debrief and Paper 2:** see "Debrief, extension and Paper 2" (built from the menu round, the shock and the round prices).

---

# Review: Saigon Chocolate Crisis breakout

File: `breakout.html` (built from `src/breakout/` by `build.sh`). Five teams, one device each, rescue Minh's chocolate business in about 40 minutes. There are four levels and a finale, covering syllabus 2.1–2.5. Use it after Level 2. Print one worksheet per student; the worksheet and answer key are in a separate document.

**Each level:**
1. The team device shows Minh's file: a story and a data table.
2. The Lead Economist enters the short answers, which the device checks at once.
3. Every student writes the worksheet. Members tick their names when done, then the team taps **Ready for inspection**, and its lane lights up on the projector.
4. You check every sheet against the OK-to-pass checklist, then show the team the passcode. The code opens the next level.
5. After 3 wrong codes, the device locks for 30 seconds. You can clear the lock, or open a level by hand, from the Teams panel.

| Level | Topic | Syllabus |
|---|---|---|
| 1 | Minh's markets: product and factor markets, market supply, what, how and for whom | 2.1 |
| 2 | Demand decoder: movement or shift, substitutes and complements | 2.2 |
| 3 | Supply audit: costs, technology, a tax per unit | 2.3 |
| 4 (Boss) | Equilibrium, shortage and surplus from a table | 2.4 |
| Finale | The storm: Halloween and a drought in the same week | 2.5 |

**Passcodes** are the same every lesson: `MARKET21` (after Level 1), `DEMAND22`, `SUPPLY23`, `EQUIL24`, and `STORM25` (after the finale, for the licence). They are on the console under **Passcodes → Show** and never appear on the projector. You can change them for a room, and **Print a passcode card**.

**Gamification:**
- A race map on the projector, Minh's market health meter, and a countdown (30–60 minutes, with +5 minutes and pause).
- **Consultancy fees:** 2k for each short answer right first time, 10k per passcode, plus 5k, 3k or 1k for the first three teams to open each level. A hint costs 2k (free after 2 wrong tries).
- The **Bonus Vault**: quick questions while a team waits for you.
- **Breaking news:** you send a 60-second question to every team.
- Badges: ⚡ First to unlock, 🎯 Sharp shooters, 🧠 No hints, 🗞️ News hounds, 🔐 Vault cracker, 🏅 Licensed.
- Roles rotate each level: Lead Economist, Data Scribe, Diagram Specialist and Spokesperson.
- At the end: a podium, printable **HCMC Market Rescuer Licences** with team members' names, and a CSV log of when each team passed each level.

**Joining.** On each team's device, open the home page, type the room code and type the team name as the nickname. The team then enters its members' first names.

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

# Level 0: Market Town opens (bridging activities)

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
| Debrief, extension and Paper 2 | Debrief from the class schedule, "build a market" extension, Paper 2 Sections A and B (see "Debrief, extension and Paper 2") | The class market chart | |
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

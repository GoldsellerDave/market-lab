# EcoLogic Learn

## AI marking (optional)
Written answers (Paper 2 builder at B1/B2, the B2 task on scenario cards, and the 2.4/2.5 data responses) are marked by
keywords first, then by the `ecl-grade` Edge Function, which uses Claude to check the economics in the student's own words.
If the function is not set up, or anything goes wrong, the keyword mark stands, so the site works without it.

1. Run `learn/supabase/schema_ai.sql` in the Supabase SQL Editor (it creates the AI marking log for the teacher page).
2. In Supabase, open **Edge Functions → Secrets** and add `ANTHROPIC_API_KEY` (the same key as Checkpoint Quest works).
   Optional: `AI_MODEL` (default `claude-opus-5-5`; `claude-haiku-5-5` is much cheaper) and `AI_DAILY_LIMIT`
   (AI checks per student per day, default 60).
3. Create a function called `ecl-grade` from `learn/supabase/functions/ecl-grade/index.ts` (dashboard editor, or
   `supabase functions deploy ecl-grade --no-verify-jwt`). Turn **JWT verification off**: the function checks the site's own
   sign-in tokens.

Only the question, its story or data, the mark scheme, the student's answer, English level and first name are sent.
Teachers see every AI decision in the **AI marking** tab and can flag one; a flag does not change marks or XP.
To try the screens without AI, open the demo with `?demo=1&aidemo=1`.

Before every commit run `python3 learn/tools/stamp.py`.

## Econ engine (concept city)
`js/eengine.js` is a map of concept blocks for 1.1 to 2.5, from everyday ideas (layer 0) up to price changes; each block lists the
blocks it stands on. Wrong answers carry a misconception (trap) that points at a block. After a miss in Paper 1 practice or a
scenario, students can choose **Build it up**; after a second miss on the same idea it starts by itself. A block is an intuition
builder, the idea, and 3 checks (the first in simple English, to separate a language gap from a concept gap). Failing goes one
floor down to the weakest block underneath and back up; failing again gives a guided walkthrough (half a building, back the next
day). Lessons for the Section 1 blocks are in `js/ebank.js`, and for the market blocks of 2.1 to 2.3 in `js/ebank2.js` (builders include
a price slider along one demand or supply curve, and events that shift the curve or not). Students see their skyline at `#/city`
(District 2 opens when the teacher opens a 2.x unit); teachers see the **Concept city** tab. Shortage, equilibrium and the
price-change chain (2.4, 2.5) get their lessons in the next step.

## Units 2.1 to 2.3
Built like Section 1, inside the engine: `js/u2.js` (glossary, misconceptions, learn cards including the `curve` and
`curve-shift` cards, 9 Paper 1 questions and 3 Paper 2 questions per unit, one of them a 6-mark Analyse question) and
`js/u2s.js` (12 scenario cards in Ho Chi Minh City, with Chị Thu's bubble tea stall). Every wrong option carries a misconception
that points at a block. The curves are drawn by `js/curve.js` (demand 160 − 2P, supply 2P; prices in thousand đồng).

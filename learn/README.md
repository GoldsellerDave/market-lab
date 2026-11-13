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

How it marks (the rules are the `SYSTEM` text in `functions/ecl-grade/index.ts`): positively, like a Cambridge examiner. Any wording,
a correct example, a point applied to the story, or a valid alternative point earns the mark; wrong economics does not. For Analyse
questions the AI itself judges whether the answer is a chain of reasoning (there is no word-list cap). The same answer to the same
question from the same student gets the same verdict again without a new AI call. After changing the rules, raise `PROMPT_V` in the
function and deploy it again (Supabase → Edge Functions → ecl-grade → Code → paste → Deploy).
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

## Section exam papers
At the end of Section 1 (after 1.4) and of Section 2 so far (after 2.5) there is a papers unit (`1.P`, `2.P`). The teacher opens it in the
Units tab like any unit. Each has two forms (A and B) of:
- **Paper 1**: 20 multiple-choice questions in exam English. After each answer the student sees the right answer and a reason for every option.
- **Paper 2**: two sets, each a short case with a 2, a 4 and a 6-mark question. For every question the student first builds the answer by
  dragging tiles into a chain (some tiles are traps, each with its reason), then writes it. The written answer is marked by AI with a
  "next step" (by key words if AI is not available), the mark scheme points are ticked, and a model answer is shown.

A timer counts down (about 1.5 minutes a mark, as in the real papers: 30 minutes for Paper 1, 40 for Paper 2) and then counts the time
over; it never stops a student. A paper survives a reload. The score is saved as an attempt (`p1a`, `p1b`, `p2a`, `p2b`); Paper 2 is
out of 48: 24 for the written answers and 24 for the chains. Questions: `js/px1.js`, `js/px2.js`; the engine: `js/papers.js`;
tests: `tests/papers.test.mjs`, `tests/e2e_papers.py`. The questions follow the 0455 syllabus for 2027 to 2029 (for example, mobility of
factors and the shape of the PPC are not in sections 1 and 2 of that syllabus, so the papers do not test them).

## Units 2.1 to 2.3
Built like Section 1, inside the engine: `js/u2.js` (glossary, misconceptions, learn cards including the `curve` and
`curve-shift` cards, 9 Paper 1 questions and 3 Paper 2 questions per unit, one of them a 6-mark Analyse question) and
`js/u2s.js` (12 scenario cards in Ho Chi Minh City, with Chị Thu's bubble tea stall). Every wrong option carries a misconception
that points at a block. The curves are drawn by `js/curve.js` (demand 160 − 2P, supply 2P; prices in thousand đồng).

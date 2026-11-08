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

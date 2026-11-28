# Project directives (market-lab / EcoLogic Learn)

- **Merging:** always merge pull requests automatically once tests pass. The owner does not need to be asked before a merge.
- **Supabase SQL:** whenever a change adds or edits a `.sql` file that must be run, always give the owner the link to the Supabase SQL Editor for project "Market simulator" (https://supabase.com/dashboard/project/qdeakgxqsffomgnhczmi/sql/new) together with the file (its GitHub link and the file itself).
- Never commit student data (names, PIN sheets) or secret keys to this public repo; `learn/js/config.js` holds only the publishable key.
- **Before every commit:** run `python3 learn/tools/stamp.py`. It puts one `?v=` version on every JS/CSS file and every module import, so browsers never mix new and cached old files (that mix made the app hang on "Loading…").
- **Edge Functions:** whenever a change edits a file under `learn/supabase/functions/`, deploy it to the Supabase project "Market simulator" (`qdeakgxqsffomgnhczmi`) after the pull request is merged. The owner does not need to be asked first. Method:
  1. Read the merged `learn/supabase/functions/<name>/index.ts` and send its exact text (no edits) with the Supabase connector's `deploy_edge_function` tool: `project_id` `qdeakgxqsffomgnhczmi`, `name` the function's folder name (for example `ecl-grade`), `entrypoint_path` `index.ts`, one file named `index.ts`.
  2. Keep `verify_jwt` **false** for `ecl-grade`: students sign in with the site's own tokens, which the function checks itself.
  3. Secrets (`ANTHROPIC_API_KEY`, `AI_MODEL`, `AI_DAILY_LIMIT`) stay in Supabase > Edge Functions > Secrets. A deploy does not change them; never put them in the file.
  4. Check the result says `status: ACTIVE` with a higher `version`, and tell the owner the version number.
  5. If the deploy is refused or fails, do not try another route. Give the owner the file and the link https://supabase.com/dashboard/project/qdeakgxqsffomgnhczmi/functions/<name>/code to paste it (Verify JWT off).
- **Roadmap (EcoLogic Learn):** every change follows the plan in `learn/docs/ROADMAP.md`, agreed with the owner on 28 November 2026: a production-grade app for schools, teachers and individual students, grounded in CMU-style learning engineering and the science of learning, with a planned pilot before any efficacy claim. Supporting documents: `learn/docs/RESEARCH.md` (research and why the plan departs from it), `learn/docs/DATA-SPEC.md` (the step-level event log and skill map), `learn/docs/PILOT.md` (study design). In practice:
  1. New features state the learning principle and the hypothesis they test, in the pull request.
  2. Every new item or step is tagged with concept-engine blocks (knowledge components) and logged through `js/log.js` with the fields in DATA-SPEC.md. Content without tags or logging is not finished.
  3. Economics difficulty and English support stay separate axes. Content stays inside the Cambridge 0455 syllabus (2027 to 2029).
  4. Simple mastery models until the data supports IRT; never show an estimate as a grade; no efficacy claims beyond the pilot data.
  5. Keep the stack lean (static ES modules, Supabase, Edge Functions only for secrets) unless ROADMAP.md says otherwise.
  6. Decisions marked as the owner's in ROADMAP.md (private repo, staging, paid plans, consent, pricing) are not made by Claude.
  7. Keep ROADMAP.md's Phase 0 table up to date when a step is done.

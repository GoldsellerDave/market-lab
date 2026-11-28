# EcoLogic Learn: roadmap

Agreed with David on 28 November 2026. This is the plan every change to EcoLogic Learn follows. The research behind it is in
[RESEARCH.md](RESEARCH.md), the data the app must collect in [DATA-SPEC.md](DATA-SPEC.md), and the pilot study design in
[PILOT.md](PILOT.md).

## Goal

A production-grade IGCSE Economics (0455, syllabus for exams 2027 to 2029) learning app for **schools, teachers and
individual students**, grounded in **learning engineering as taught at Carnegie Mellon** (the Knowledge-Learning-Instruction
framework, knowledge components, DataShop-style data, learning curves, in-class experiments) and the **science of learning**.
It has two modes that share one student record:

- **Self-paced** (what exists now): learn cards, practice, scenarios, Paper 1 and Paper 2, the concept engine.
- **Live, teacher-led** (to build): a live-session engine for lessons (projector, teacher controls, student devices).

Before selling, it needs a **track record**: a planned pilot with David's own classes (about 50 students), then 2 to 3
partner schools.

## Principles (apply to every change)

1. **Learning-engineering loop.** Design → deploy → collect data → analyse → redesign. Every new feature states the
   learning principle it uses and the hypothesis it tests ("faded worked examples reduce errors on PED calculation").
2. **Knowledge components first.** Every item and step is tagged with the concept-engine blocks it practises (the skill
   map in DATA-SPEC.md). New content without tags is not finished.
3. **Log every step.** Every student step goes to the step-level event log with the fields in DATA-SPEC.md, so learning
   curves, IRT and experiments are possible later. Data never logged can never be analysed.
4. **Two axes, kept apart.** Economics difficulty (Core, Stretch, Challenge) adapts separately from English support
   (bands A1 to B2, simple English, Vietnamese). Track maths, economics concept and English as separate abilities.
5. **Science of learning by default:** retrieval practice with feedback, spacing and interleaving, worked examples that
   fade, pre-training of key words, dual coding (diagrams with words), mastery learning, misconception diagnosis,
   metacognition (confidence ratings).
6. **Cambridge only.** Content stays inside the 0455 syllabus; Challenge means the hardest IGCSE, never A-level. Check
   theory against Cambridge material (syllabus, specimen papers, mark schemes) before writing content.
7. **Simple models until the data supports more.** Mastery tallies and a light knowledge-tracing rule now; calibrated IRT and
   multidimensional IRT only when items have enough first attempts (see DATA-SPEC.md). Never present an estimate as a grade.
8. **Evidence before claims.** No efficacy claim beyond what the pilot data supports (ESSA tiers, PILOT.md).
9. **Keep the stack lean.** Static ES modules (no build step), Supabase, Edge Functions only where a secret is needed
   (AI marking). Marking runs in the browser for instant feedback; the server stores and checks identity.
10. **Students' data is protected.** No student data in the repo; anonymised exports; consent as in PILOT.md.

## Phases

### Phase 0: foundations (December 2026 to January 2027)

| Step | Status |
|---|---|
| Plan, research and data spec saved in the repo with a directive in CLAUDE.md | done |
| Step-level event log `ec_steps` with IRT fields, token-checked `ec_log_steps`; `js/log.js` queues rows offline | done in the app; `schema_steps.sql` to be run in Supabase (rows wait in the browser until then) |
| Skill map: items and steps tagged with concept-engine blocks; maths / concept / English dimensions | done for Paper 1, scenarios, Paper 2 practice, PED lab (`kcOf`, `P2_KC`, `PED_BLOCK`, `KC_DIM`); exam papers next |
| PED lab: mistake diagnosis (6 named mistakes + dropped sign), fading after two right-first-time solutions, key-word warm-up, confidence ratings, experiment arms ready | done |
| Log Paper 1 (practice, checkpoint, review), scenarios, Paper 2 builder, PED lab | done |
| Log data response, learn cards, Build it up, exam papers, other practice games; teacher export of the log | next |
| **Private repo** (answers and pilot tests must not be public) | decision for David (cost) |
| **Staging copy** (changes reach students only after checks) | decision for David (cost) |
| Supabase Pro with backups; error monitoring | decision for David (cost) |
| Pilot plan written and pre-registered (PILOT.md) | draft written |

### Phase 1: the pilot (next semester)

David's classes, about 50 students. Two or three in-class experiments (students randomised to two versions of one
feature), external pre and post tests, learning curves per skill, surveys. See PILOT.md.

### Phase 2: platform for schools and individuals (summer 2027)

- **Accounts:** Supabase Auth; organisations (schools) with roles (school admin, teacher, student); teachers without a
  school; school-managed student accounts (Google Workspace for Education, Microsoft, or class code with PIN); individual
  sign-up with parental consent for under-16s. **Progress belongs to the student, not to a class.**
- **Licences:** free individual, premium individual, per-seat school licence (payments later).
- **Live-session engine:** teacher controls, projector view, student devices by code or QR, reconnect and resume; plug-ins:
  live quiz, poll, chain building, structured questioning (random fair picker, wait time, no opt out), peer marking, Market
  Town, the breakout. Every live answer goes to the same event log.
- **Content as data:** questions, scenarios and diagrams become versioned data with stable ids, shared by both modes.
- **Peer marking** with student-facing mark schemes; **Vietnamese reasoning credited in practice mode**; printable export;
  scheme-of-work dates.

### Phase 3: partner schools, then launch (school year 2027 to 2028)

The same study at 2 to 3 partner schools, a written case study (Learning at Scale or Educational Data Mining), then
commercial launch, schools first.

## Decisions that are David's (not made by Claude)

- Making the repo private and how to host it (GitHub paid plan, or Netlify / Vercel / Cloudflare Pages).
- A staging copy (second Supabase project or branch) and Supabase Pro.
- School approval, parent information and consent for the pilot; the pre-registration.
- Pricing, licences and the order of markets.

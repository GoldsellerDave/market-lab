# Data specification: the step-level event log

Every student step is logged so that learning curves (CMU DataShop style), knowledge tracing, IRT and in-class experiments
are possible. Table `ec_steps`, written only through the token-checked function `ec_log_steps` (SQL in
`learn/supabase/schema_steps.sql`). The site writes through `js/log.js`, which batches rows, keeps them in the browser while
offline and never blocks the student.

## Fields

| Field | Meaning | DataShop column |
|---|---|---|
| `user_id`, `class_code` | Set by the server from the sign-in token (never sent by the browser) | Anon Student Id (hashed on export) |
| `session_id` | One sitting of one activity (made in the browser) | Session Id |
| `client_t`, `created_at` | Browser time of the step; server time of saving | Time |
| `unit`, `activity` | Unit (2.6) and activity (`mcq`, `check`, `ped`, `scen`, `p2`, `review`, …) | Level (Unit), Problem View |
| `mode` | `practice`, `checkpoint`, `review`, `live`, `exam` | Condition-like context |
| `item_id` | Stable id of the item (`q26-calc`, `s26-thu`, `ped-raw`) | Problem Name |
| `item_version` | Short hash of the item's content; a reworded item is a new version | (Problem Name + version) |
| `step` | Step within the item (`1`, `2`, … or `''` for one-step items) | Step Name |
| `template`, `params` | Generated items (PED lab): the kind and the numbers / seed | (Problem Name family) |
| `kc` | Knowledge components: concept-engine block ids | KC (Default) |
| `attempt` | 1 = first attempt at this step | Attempt At Step |
| `outcome` | `correct`, `incorrect`, `hint` (help asked), `partial`, `skip` | Outcome |
| `score`, `max_score` | Written answers (points) | — |
| `response` | Option chosen or value typed (max 400 characters) | Input |
| `diagnosis` | Misconception trap or mistake id (`ped-formula`, `inverted`, `sign-dropped`, …) | Feedback Classification |
| `help` | Support used before answering: `hint`, `calc_hint`, `vi`, `plain`, `frame`, `glossary` | — |
| `band` | English band shown (0 A1 to 3 B2) | — |
| `confidence` | 1 not sure, 2 fairly sure, 3 sure (asked before checking, where shown) | — |
| `duration_ms` | Time from showing the step to this answer | Duration |
| `level` | Difficulty level shown (0 Core, 1 Stretch, 2 Challenge) | — |
| `condition` | Experiment arm (`fade:A`), empty when no experiment | Condition |

## The skill map (Q-matrix)

- **Knowledge components** are the concept-engine blocks in `js/eengine.js` (`EBLOCKS`). An item's components come from
  its options' traps (`blockOfOptions`), its registered block (`registerItems`, `itemBlock`) or, for generated items, a
  fixed map (`PED_BLOCK` in `js/u26.js`).
- In the code: `kcOf(id, options)` in `js/eengine.js` (registered block plus the blocks of the options' traps); `P2_KC` in
  `js/content.js` for Paper 2 practice questions; a scenario step without its own block takes the scenario's blocks.
- **Dimensions** for multidimensional models: `KC_DIM` in `js/eengine.js` marks each block `math`, `concept` or both.
  English is measured through `band`, `help` and the `vocab` steps (the PED key-word warm-up), not through blocks.
- New content is not finished until every item and step maps to at least one block.

## What is logged now

| Activity | `activity`, `mode` | Rows |
|---|---|---|
| Paper 1 practice, unit checkpoint, review | `mcq` / `check` / `review`, mode to match | one per answer; `response` the option, `diagnosis` its trap |
| Scenarios | `scen` | every attempt at every step (choice, sort, order, written); `step` 1, 2, … or `x` |
| Paper 2 builder | `p2` | one per finished support step (`step` = `order`, `bank`, `frame`, `free`), with `score` |
| PED lab | `ped` | every attempt at every step; `template`, `params` (seed and numbers), `diagnosis`, `confidence`; warm-up words as `ped-vocab` |

Not yet: data response, learn cards, Build it up, exam papers, the other practice games.

## What each model needs from the log

| Model | Use | Needs |
|---|---|---|
| Learning curves, Additive Factors Model, Performance Factors Analysis | Is the skill map right? Are students learning each skill? | `kc`, first `attempt`, `outcome`, order in time |
| Knowledge tracing (the concept engine) | Adapting during practice | the same, per student |
| IRT (1PL/2PL), partial credit models | Item difficulty; checkpoint and exam measurement | first attempts, `item_id` + `item_version`, `outcome` or `score`; few hundred first attempts per item for 2PL |
| Multidimensional IRT | Separate maths, concept and English abilities | the above plus `KC_DIM`, `band`, `help` |
| Distractor analysis, nominal response model | Which wrong answers attract whom | `response`, `diagnosis` |
| Speed and guessing | Rapid guessing, effort | `duration_ms` |
| In-class experiments | Which version works better | `condition`, randomised per student |

Rules: calibrate IRT only on **first attempts without help** in a known `mode`; treat retries as learning data. Serve a
small share of items at random (not only by the engine) so hard items are also seen by weaker students (exposure). Until
items have enough data, adapt with the engine's mastery rule, not with IRT.

## Privacy

`user_id` is a random id; names stay in `ec_users`. Exports for analysis replace `user_id` with a salted hash and drop
`response` text for written answers unless consent covers it. No log data goes into the repo.

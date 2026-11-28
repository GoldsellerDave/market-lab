# Research behind the roadmap

What the plan is based on, and where it agrees or departs, with reasons. Sources at the end.

## 1. Documents David supplied

### 1.1 "Adaptive PED module for ESL learners" (research from Gemini, 28 November 2026)

Cognitive Load Theory, CMU LearnLab research and multidimensional IRT applied to teaching 2.6 PED to ESL learners.

| The research says | In the plan |
|---|---|
| ESL learners carry a double load: the maths of PED and decoding English | Separate economics and English axes; language support on the same item; Vietnamese help |
| Pre-train vocabulary before the maths | Key-word warm-up at the start of the PED lab |
| Worked examples, then faded scaffolding | Strategy card and step-by-step questions; fading by level in the PED lab |
| Reduce split attention: visuals with audio, not dense text | Interactive diagrams; read-aloud at A1 |
| Track maths, economics concept and English abilities separately (MIRT) | Separate tallies now; MIRT once data allows (DATA-SPEC.md) |
| Diagnose errors: inversion, dropped minus sign, right number with wrong term | PED lab mistake diagnosis, extended with wrong base for %, raw change, revenue added |
| Fine-grained knowledge components | Concept-engine blocks as knowledge components; skill map |
| Detect wheel-spinning | "Needs help" flag; measurable from the step log |
| Learning rates are similar; students differ in prior knowledge | Mastery learning: adapt the amount of practice, not the label |

Where the plan departs, and why:

| Research or its proposed stack | Plan | Reason |
|---|---|---|
| Ability scores moved by fixed amounts (±0.1, −0.25) per answer | Mastery tallies now, calibrated IRT later | Fixed steps are not IRT; calibration needs a few hundred first attempts per item |
| A dropped minus sign is a concept error | Accepted with a reminder, but logged as `sign-dropped` | Mark schemes are often lenient on the sign; the log still gives the data |
| Right number, wrong label = English problem | English only if it repeats with Vietnamese or simple English shown, or for A1/A2 | The same error can be an economics misconception |
| Help ends with a button back to the same question | A fresh question after help; support fades over the next questions | Retrying is not fading |
| React front end; server decides every step; Supabase Auth | Current front end; marking in the browser; Supabase Auth in Phase 2 | Instant feedback on school Wi-Fi; no rewrite; auth changes for the commercial plan, not for the research |
| Step-level telemetry in CMU DataShop format | Adopted, plus the IRT fields | The research's own requirement, completed |

### 1.2 "Review: two blueprints for an adaptive IGCSE Economics app" (3 November 2026)

Comparison of the Checkpoint Quest blueprint and an adaptive-platform PDF. Still agreed: simple mastery rules rather than
IRT for small classes; two axes (economics and language) with support layers, not separate versions; misconception tags
including Vietnamese translation traps (vốn, đất, cung tăng vs lượng cung tăng); Cambridge only; language support that
fades. Changed since, because the goal is now schools and individuals: Supabase Auth with organisations instead of own
logins only; a live-session engine (kept exam-focused); a planned pilot. Still to do from the review: **private repo**
(public answers), **peer marking with student-facing mark schemes**, **Vietnamese reasoning credited in practice mode**,
printable export, scheme-of-work dates. Corrections to the review: Paper 1 in the 2027 to 2029 specimen is 40 questions in
1 hour (not 30 in 45 minutes); the syllabus uses David's numbering (2.1 The role of markets to 2.6 PED).

## 2. Learning engineering and the science of learning

- **Knowledge-Learning-Instruction framework** (Koedinger, Corbett and Perfetti, 2012): instruction is designed per
  knowledge component; learning curves test whether the skill model is right.
- **Learning rates are similar across students** (Koedinger et al., 2023, PNAS); confirmed on new data by a 2024 EDM
  replication, which notes the data came from maths tutoring software and that starting knowledge varies widely. Basis for
  mastery learning (more practice opportunities, not different labels).
- **Wheel-spinning** (Beck and Gong, 2013): students who fail to master a skill after many attempts need a different
  intervention, not more of the same.
- **Worked examples and fading; cognitive load** (Sweller; Renkl and Atkinson); **pre-training** and **dual coding /
  split attention** (Mayer's multimedia principles).
- **Retrieval practice, spacing and interleaving** (Dunlosky et al., 2013; Roediger and Karpicke, 2006).
- **In-class (in vivo) experiments**: randomising students to two versions of a feature inside real classes, as in the
  Pittsburgh Science of Learning Center (LearnLab).
- **Learning-curve models for practice data**: Additive Factors Model and Performance Factors Analysis; **IRT** for item
  calibration and checkpoint measurement (ability assumed fixed during a test).
- **Evidence tiers for schools**: ESSA tiers (Tier 4 rationale, Tier 3 promising, Tier 2 moderate, Tier 1 strong).

## 3. Sources

- Cambridge IGCSE Economics 0455 syllabus 2027 to 2029: https://cambridgeinternational.org/Images/718148-2027-2029-syllabus.pdf
- Koedinger et al. (2023), An astonishing regularity in student learning rate, PNAS. Summary: https://phys.org/news/2023-04-myth-fast-learner.html
- Replicating an "Astonishing Regularity in Student Learning Rate", EDM 2024: https://educationaldatamining.org/EDM2024/proceedings/2024.EDM-short-papers.40/index.html
- Beck and Gong (2013), Wheel-spinning: students who fail to master a skill, AIED 2013: https://researchr.org/publication/BeckG13
- CMU DataShop (PSLC): https://pslcdatashop.web.cmu.edu

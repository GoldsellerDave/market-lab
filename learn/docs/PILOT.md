# Pilot study design (draft, for David to finalise and pre-register)

## Aim

Produce honest, credible evidence about EcoLogic Learn with David's classes (about 50 Grade 9 students, IGCSE Economics
0455), good enough to show schools and to improve the app. With 50 students the pilot cannot prove efficacy; it can give
causal evidence about specific features (in-class experiments) and promising correlational evidence about the app as a whole.

## Research questions

1. Do students learn each skill over practice opportunities (falling error rates per knowledge component)?
2. Do specific design choices help? (Two or three in-class experiments, below.)
3. Is more mastery in the app associated with higher scores on an external test, controlling for prior attainment?
4. How do students and the teacher experience the language support (English bands, Vietnamese)?

## Measures

- **Pre-test and post-test:** Cambridge-style questions that are **not in the app** (and not in the repo), or the school's
  mock exams; Paper 1 multiple choice plus Section B parts (2, 4, 6, 8 marks). Same form or parallel forms.
- **Step log** (`ec_steps`, DATA-SPEC.md): learning curves, mastery, help use, time.
- **Short surveys** (start and end) and a few student interviews; teacher notes.

## In-class experiments (students randomised to two versions of one feature)

Randomise per student (stratified by English band), record the arm in `condition`, and compare on the next unit's items and
the post-test. Candidates:

| Experiment | Version A | Version B | Outcome |
|---|---|---|---|
| Faded worked examples | Steps fade by level (current PED lab) | Full steps at every level | Errors on unassisted PED calculations |
| Key-word pre-training | Warm-up before the PED lab | No warm-up | First-attempt accuracy, time |
| Confidence ratings | Asked before checking | Not asked | Accuracy, calibration, later retention |
| Mistake-specific feedback | Named mistake + lesson link | General "not yet" | Repeat of the same mistake |

Only one or two at a time, each on one unit. Every student gets normal teaching; no one is denied the app.

## Design for the app as a whole

If David teaches two classes: a crossover by unit (class A uses the app heavily for unit X, class B for unit Y), compared on
unit tests. Otherwise a dose-response analysis (mastery reached vs post-test, controlling for pre-test).

## Ethics and consent

School leadership approval; information for parents with an opt-out from research use (the app remains part of normal
teaching); students' data anonymised for analysis (DATA-SPEC.md, Privacy); no names in reports; data kept in Supabase only.

## Pre-registration

Write the questions, measures, experiments and analysis plan on OSF (osf.io) before the semester starts. Report all
results, including null ones.

## What can be claimed afterwards

ESSA Tier 4 (a research-based rationale) now; Tier 3 (promising: correlational with controls) after the pilot if the
results support it. Stronger tiers need the partner-school phase (ROADMAP.md, Phase 3).

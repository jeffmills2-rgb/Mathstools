# Legacy Engine — `stage4-pythagoras`

Real Stage 4 **Pythagoras** source material (CHHS "Exam Builder").

## Files

- **`original-engine.js`** — the real Pythagoras **question bank** (7 types).
  Exports `getPythagorasQuestionTypes()` and
  `generatePythagorasQuestions({ count, allowedTypes })`. Pure (no DOM). Only
  change from the upload: import paths repointed to the local shims
  (`../schemas/question.schema.js`, `../utils/translation.js`).
- **`original-diagram-engine.js`** — the real Pythagoras **diagram renderer**
  (`window.MMT_PYTHAGORAS_ENGINE`, DOM/SVG). **Reference only — never imported.**
  Its right-triangle, student-diagram and ramp designs were re-created in React
  (`PythagorasTriangleDiagram`, `StudentDiagramSpace`, `PythagorasRampDiagram`).

## Adopted skills → legacy type → answer mode → diagram

| skill | legacy type | answer mode | diagram |
|-------|-------------|-------------|---------|
| pythagoras-squares | squares | simple (numeric) | — |
| pythagoras-square-roots | square-roots | simple (numeric) | — |
| pythagoras-hypotenuse | unknown-sides (c = x) | simple (numeric) | pythagorasTriangle |
| pythagoras-shorter-side | unknown-sides (a/b = x) | simple (numeric) | pythagorasTriangle |
| pythagoras-decimal-sides | decimal-sides | simple (numeric, 1 dp) | pythagorasTriangle |
| pythagoras-triads | triads (yes/no) | trueFalse (Yes/No choice) | — |
| pythagoras-real-world | real-world | simple (numeric, 1 dp) | pythagorasLadder / pythagorasRectangle / pythagorasRamp / none |
| pythagoras-multi-step | multi-step | simple (numeric, 1 dp) | none |

## Adapter behaviour (`src/maths/adapters/pythagorasAdapter.js`)

- **Answer checking** is tolerant: a leading `x =` and trailing unit words
  (`cm`, `m`, `km`, `mm`) are stripped, and the answer matches if it equals the
  rounded value the prompt asks for (nearest whole / 1 dp), the precise value
  within a small tolerance, or the same value after rounding. Students are NOT
  failed for omitting or adding units. Expected answers are stored WITH units
  (e.g. `12.7 m`) plus a bare-number acceptable form.
- **Rounding** dp is read from the answer (`12.7 m` → 1 dp, `5 cm` → 0 dp).
- **Unknown-side skills** rejection-sample the `unknown-sides` type and keep the
  question whose `x` is the requested side (hypotenuse `c`, or a shorter side
  `a`/`b`), reading the legacy diagram `labels`.
- **Triads** (Phase 2N patch): the legacy multiple-choice variant is filtered
  out; the **yes/no** variant is used as a CHOICE question — `answerMode:
  "trueFalse"` with `options: ["Yes", "No"]`, so the student taps Yes/No instead
  of typing into a numeric box. The prompt is reworded
  ("Do the side lengths a, b and c form a right-angled triangle?" — no "Justify
  your answer"); the justification is kept as `feedback`, shown after answering.
- **Difficulty** is type-based (`PYTHAGORAS_TYPE_LEVELS` in
  `difficultyProfiles.js`): squares/roots → 1, hypotenuse/shorter → 2,
  decimal/triads → 3, real-world → 4, multi-step → 5. Each skill honours the
  requested 1–5 for XP/metadata (`requested == actual`).

## Diagram contract

| legacy config / scenario | our `diagramType` | component |
|--------------------------|-------------------|-----------|
| right-triangle | pythagorasTriangle | PythagorasTriangleDiagram |
| ramp / driveway | pythagorasRamp | PythagorasRampDiagram |
| ladder scenarios | pythagorasLadder | PythagorasLadderDiagram |
| rectangle / screen / paper / square diagonal | pythagorasRectangle | PythagorasRectangleDiagram |
| (everything else worded) | — (no diagram) | — |

The React triangle uses a fixed, readable orientation (right angle bottom-left)
with the right-angle marker and labels placed OUTSIDE each side — no collision,
no modal overflow.

**Phase 2N patch — no "Draw a diagram" box in-game:** the legacy bank attaches a
`student-diagram-space` (blank draw box) to most worded problems. That box is
useless in the 3D modal (students can't draw in it), so the adapter NEVER
renders it. Instead, worded problems are mapped to a **contextual** figure
(ladder / rectangle / ramp), with the two given lengths read from the prompt; if
a scenario can't be sensibly diagrammed (distance/compass, gate brace, guy wire,
multi-step) the diagram is **omitted**. The `StudentDiagramSpace` component +
type remain registered for possible future worksheet/print use, but are never
emitted by the game adapter. The legacy DOM ladder/rectangle/compass/gate/
guy-wire renderers are kept in `original-diagram-engine.js` for reference only.

## Not in this phase

No world NPC, no story mission, no new gate/zone. Pythagoras routes to the Area
Meadow marker (an existing Measurement-style target) with the Mission Board as
the safe fallback. Teacher/free-choice Pythagoras missions never progress the
main story.

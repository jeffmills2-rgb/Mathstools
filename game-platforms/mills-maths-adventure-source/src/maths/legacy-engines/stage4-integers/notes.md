# Legacy Engine — `stage4-integers`

Real Stage 4 **Integers** source material from the MMT / CHHS "Exam Builder".

## Files

- **`original-engine.js`** — the real Integers **question bank** (17 question
  types). Exports `getIntegerQuestionTypes()` and
  `generateIntegerQuestions({ count, allowedTypes })`. Pure (no DOM); uses
  `crypto.randomUUID` and `Math.random`.
  - The **only** change from the uploaded original is the import path: it now
    points at `../schemas/question.schema.js` (our shim) instead of the
    exam-builder's schema. No generator logic was altered.
- **`original-diagram-engine.js`** — the real Integer **diagram renderer**
  (`window.MMT_INTEGER_ENGINE`). This is **DOM/SVG, browser-global code** and is
  kept here as **reference source material only**. It is **not imported anywhere**
  — instead its number-line / thermometer designs were re-created as isolated
  React components under `src/ui/diagrams/`. Mixing this DOM code into the React
  app is explicitly avoided.

## How the bank's output looks (legacy shape)

```js
{
  id, topic: "Integers", level: "mixed", type, marks,
  prompt,                 // question wording (uses Unicode minus "−")
  answer,                 // STRING, e.g. "−40" or "2°C"
  working: [ ... ],       // array of worked-solution lines
  diagram?: { engine: "integer-engine", caption?, config: { diagramType, ... } },
  space, tags, mcEligible?
}
```

The adapter (`src/maths/adapters/integersAdapter.js`) is the only importer of
`original-engine.js`. It maps this shape into the current core question shape.

## Adopted question types → skills (Phase 2F)

Numeric, typed-answer types that fit the game's input + checking:

| legacy type            | skill id                | input  | diagram            |
|------------------------|-------------------------|--------|--------------------|
| integer-calculations   | addingIntegers, subtractingIntegers, multiplyingIntegers, dividingIntegers, mixedIntegerOperations | simple | — |
| order-of-operations    | orderOfOperations       | simple | — |
| substitution-negatives | substitution            | simple | — |
| number-line-jump       | numberLineJumps         | simple | integerNumberLine  |
| thermometer-read       | thermometer             | simple | thermometer        |

The add/subtract/multiply/divide skills reuse the **real** `integer-calculations`
generator and simply filter its output by operator (no invented content).

### Not adopted yet (future)

`place-number-line`, `division-remainder`, `rounding`, `estimation`,
`place-value`, `compare-integers`, `ordering-integers`, `combining-signs`,
`real-world-integers`, `true-false-integers`, `error-spot`,
`multi-part-integers`. These need non-numeric answer handling (e.g. `<`/`>`/`=`,
remainders, multi-part), comparison input, or richer answer checking. They can be
adopted later with dedicated input/answer strategies.

## Difficulty limitation (important)

The legacy bank has **no difficulty parameter** — every item is `level: "mixed"`.
So in this phase difficulty maps to **metadata + XP only** (via the curriculum
registry / `decorateQuestion`), plus a **light operand-magnitude filter** for the
calculation skills (small operands at low levels, larger at high levels). Deeper
per-level complexity will require either extending the bank or richer adapter
heuristics. The adapter clamps to difficultyLevel 1–5 as the rest of the system
expects.

## Answer normalisation

Legacy answers use a Unicode minus (`−`, U+2212) and sometimes a unit suffix
(`°C`). The adapter normalises these to an ASCII form (e.g. `-40`, `2`) as the
canonical answer so the simple-input validator + matcher work, while keeping the
original forms in `acceptableAnswers`.

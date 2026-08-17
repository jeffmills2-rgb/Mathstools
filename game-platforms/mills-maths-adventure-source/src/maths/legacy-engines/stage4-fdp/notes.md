# Legacy Engine — `stage4-fdp`

Real Stage 4 **Fractions, Decimals & Percentages** source material (CHHS "Exam
Builder").

## Files

- **`original-engine.js`** — the real FDP **question bank** (26 types). Exports
  `getFdpQuestionTypes()` and `generateFdpQuestions({ count, allowedTypes })`.
  Pure (no DOM). Only change from the upload: import paths repointed to the
  local shims (`../schemas/question.schema.js`, `../utils/translation.js`).
- **`original-diagram-engine.js`** — the real FDP **diagram renderer**
  (`window.MMT_FDP_ENGINE`, DOM/SVG). **Reference only — never imported.** Only
  the fraction-circle design was re-created in React (`FractionCircleDiagram`).

## Output quirks the adapter handles

- Fractions use a token: `[[frac:n:d]]` (mixed numbers like `4 [[frac:5:6]]`).
  The adapter converts these to `n/d` for prompts/feedback and to a canonical
  `n/d` answer.
- Answers carry units/symbols: `"$24.00"` (money), `"27 students"` (unit word),
  `"10%"` (percent). The adapter strips these to a numeric canonical and keeps
  the original forms acceptable.

## Adopted skills → input mode → diagram

MathLive (structured fractions, simplest-form checked):
`shadedFractionCircle` (fraction circle), `simplifyFractions`,
`equivalentFractions` (exact denominator), `fractionOperations`,
`mixedImproper` (improper answers only), `errorSpotFractions`,
`fdpConversions` (when the answer is a fraction).

Simple input (decimals / percentages / money / whole numbers):
`fractionOfQuantity`, `percentageOf`, `roundDecimals`, `decimalOperations`,
`percentageChange`, `discounts`, `gstTax`, `findOriginalValue`,
`fdpConversions` (when the answer is a decimal/percentage).

### Diagram-heavy skills (Slice 2B — now adopted)

| skill | legacy type | diagramType | input |
|-------|-------------|-------------|-------|
| shadedFractions | shaded-fractions | fractionBar | MathLive (simplest) |
| fractionOfGroup | fraction-of-group | fractionSet | MathLive (simplest) |
| placeFractionNumberLine | place-fraction-number-line | fractionNumberLine | MathLive |
| equivalentFractionVisual | equivalent-fraction-visual | equivalentFractionBars | simple (box) |
| fractionMultiplyArea | fraction-multiply-area | fractionMultiplicationArea | MathLive (simplest) |
| proportionDoubleLine | proportion-double-line | doubleNumberLine | simple |
| shadedFractionCircle | shaded-fraction-circle | fractionCircle | MathLive (simplest) |

These are **answer-entry** questions (no interactive drag/click): the diagram is
shown and the student types the fraction/number. Two prompts were lightly
reframed by the adapter (not the bank): the number-line "Mark X…" task becomes
"What fraction is marked on the number line?" (the mark is drawn), and the
"Shade the bar" mode is filtered out in favour of "What fraction is shaded?".

### Adopted in Phase 2K (new answer modes)

The new reusable answer-mode system (`src/maths/answerModes.js` +
`src/ui/answer-modes/`) lets these previously-deferred types be adopted safely:

| skill | legacy type | answerMode |
|-------|-------------|------------|
| compareFractions | compare-fractions | comparison (`<` `>` `=`) |
| orderDecimals | compare-decimals | orderedList (comma list, exact order) |
| trueFalseFdp | true-false-fdp | trueFalse |
| multiPartPercentage | multi-part-percentage | multiPart (a)(b)(c) |

The adapter maps each legacy question to a plain-text prompt + the right
`answerMode` + the mode's fields (`comparisonOptions`, `orderedItems`,
`expectedParts`). Money answers keep `$`/numeric acceptable forms; ordered lists
accept equivalent numeric forms. Mission scoring counts a multiPart question
correct only when ALL parts are correct (part-level feedback is still shown).

### Still deferred (and why)

`decimal-place-value` — its answer is the value of a single digit (a normal
simple answer), but it ships a place-value **display table**; rather than build a
read-only place-value table renderer it remains deferred. The new `tableInput`
mode is for *editable* tables (e.g. Algebra's pattern-table); a display-only
table renderer can be added later to adopt this type.

## FDP diagram types → React components (legacy config → contract)

| legacy `diagram.config.diagramType` | our `diagramType` | component |
|-------------------------------------|-------------------|-----------|
| fraction-circle | fractionCircle | FractionCircleDiagram |
| fraction-bar | fractionBar | FractionBarDiagram |
| fraction-of-set | fractionSet | FractionSetDiagram |
| number-line-fraction | fractionNumberLine | FractionNumberLineDiagram |
| equivalent-bars | equivalentFractionBars | EquivalentFractionBarsDiagram |
| fraction-multiply-area | fractionMultiplicationArea | FractionMultiplicationAreaDiagram |
| double-number-line | doubleNumberLine | DoubleNumberLineDiagram |

The mapping lives in `DIAGRAM_MAP` in `fdpAdapter.js`. The legacy DOM diagram
engine (`original-diagram-engine.js`) is reference only and is never imported.

## Difficulty (limitation)

The bank has no difficulty (all `level:"mixed"`). FDP difficulty is expressed by
**which type/skill** is used (see `FDP_TYPE_LEVELS` in
`src/maths/difficulty/difficultyProfiles.js`). Each skill honours the requested
1–5 for XP/metadata and applies a **light content filter** where the type allows
it (fraction/denominator size, percentage amount, decimal magnitude). For other
types difficulty affects XP/metadata only — recorded in `difficultyNotes`.
`requestedDifficultyLevel === actualDifficultyLevel` for FDP, so mission
difficulty ranges are always respected.

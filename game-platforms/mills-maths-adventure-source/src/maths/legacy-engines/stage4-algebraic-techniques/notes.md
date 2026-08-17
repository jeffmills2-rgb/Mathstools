# Legacy Engine — `stage4-algebraic-techniques`

Real Stage 4 **Algebraic Techniques** source material (CHHS "Exam Builder").

## Files

- **`original-engine.js`** — the real Algebra **question bank** (21 types).
  Exports `getAlgebraicTechniquesQuestionTypes()` and
  `generateAlgebraicTechniquesQuestions({ count, allowedTypes })`. Pure. Only
  change from the upload: import paths repointed to the local shims.
- **`original-diagram-engine.js`** — the real Algebra **diagram renderer**
  (`window.MMT_ALGEBRA_ENGINE`, DOM/SVG). **Reference only — never imported.**
  Four of its designs were re-created in React.

## Input choice & checking

- **MathLive ("math")** for algebraic-expression answers, checked with a
  commutativity-aware normaliser (`makeAlgebraCheck`): "2k + 9b" === "9b + 2k",
  "36xc" === "36cx", Unicode/ASCII minus both accepted. Bracketed/fractional
  answers (factorise, algebraic fractions) are compared as normalised strings.
- **simple** for numeric answers (substitution, numeric function machines,
  `use-expression-solve` where "n = 9" is reduced to "9"). `intro-notation` and
  `function-machine` pick the mode per question (auto).

## Adopted skills (18)

`introNotation, simplifySimple, simplifyMixed, multiplyTerms, translateWords,
subTwo, subTwoVars, factorise, expandSimplify, expandNegativeBracket,
algebraicFractions, wordedExpression, useExpressionSolve, errorSpotAlgebra,
likeTermsTiles*, expandArea*, perimeterExpression*, functionMachine*`
(* = diagram-based).

## Algebra diagrams → React components

| legacy `config.diagramType` | our `diagramType` | component |
|-----------------------------|-------------------|-----------|
| algebra-tiles | algebraTiles | AlgebraTilesDiagram |
| expand-area-model | expandAreaModel | AlgebraAreaModelDiagram |
| perimeter-figure | perimeterFigure | PerimeterExpressionDiagram (rectangle + triangle) |
| function-machine | functionMachine | FunctionMachineDiagram |

These were ported because three of them (tiles, perimeter, function machine)
carry data that exists **only** in the diagram — the question is unanswerable
without it. The legacy DOM diagram engine is never imported.

## Adopted in Phase 2K (new answer modes)

The reusable answer-mode system (`src/maths/answerModes.js` +
`src/ui/answer-modes/`) lets these previously-deferred types be adopted:

| skill | legacy type | answerMode |
|-------|-------------|------------|
| patternTable | pattern-table | tableInput (the blank value-row cells are graded) |
| trueFalseEquivalent | true-false-equivalent | trueFalse |
| multiPartAlgebra | multi-part-algebra | multiPart (a)(b)(c) |

The adapter maps the legacy `table.rows` blank cells to editable `tableConfig`
input cells; expression part-answers keep with/without-unit acceptable forms.
A multiPart/table question counts as correct only when ALL cells/parts are
correct (part-level feedback is still shown).

### Still deferred / limitation

- `multi-part-algebra` ships a perimeter **diagram**; the adapter currently drops
  it when mapping to `multiPart` (the parts are answerable from the wording).
  Re-attaching the diagram to a multi-part question is a small future addition.
- Algebra expression parts use tolerant string/numeric matching (not the full
  commutativity-aware algebra check), so accepted forms are the canonical answer
  ± its unit. Documented so a stricter per-part math check can be added later.

## Limitations

- The bank has no difficulty (all `level:"mixed"`). Algebra difficulty is
  **type-based** (`ALGEBRA_TYPE_LEVELS`); each skill honours the requested level
  for XP/metadata (`requested == actual`), recorded in `difficultyNotes`.
- Answer checking is commutativity-aware for simple sums/products but does NOT
  expand brackets: `factorise` and `algebraic-fractions` expect the bank's form
  (or a value-equivalent constant expression). Reordering terms inside brackets
  is not accepted.

# Answer Modes (Phase 2K)

A small, reusable answer/input system so questions can ask for more than a single
typed box or a MathLive expression. The **pure logic** lives in
`src/maths/answerModes.js` (testable in plain Node); the **UI** lives here.

## How it fits together

```
question  ──►  AnswerRenderer  ──►  <SomeAnswerInput value onChange disabled />
   │                                         │
   │ answerMode + fields                     │ student value (shape per mode)
   ▼                                         ▼
maths/answerModes.js  ◄──  gradeAnswer(question, value)  ──►  { correct, score, total,
                                                               correctCount, partResults }
```

- `AnswerRenderer` is a **router**: it reads `answerModeOf(question)` and renders
  the matching input component, with one uniform interface
  (`value`, `onChange`, `disabled`, `invalid`, `result`).
- `MathsEncounter` holds the per-question `value`, calls `gradeAnswer()` to check,
  and uses `result.correct` for mission scoring (unchanged: 1 correct per
  question, 60% pass threshold).

Existing **simple** and **math** questions flow through unchanged — they simply
have no `answerMode` and default from `inputMode`.

## Modes & question fields

| answerMode | component | value shape | extra question fields |
|------------|-----------|-------------|-----------------------|
| `simple` | SimpleAnswerInput | string | — |
| `math` | MathAnswerInput (wraps MathLive) | string (plain) | — |
| `trueFalse` | TrueFalseAnswerInput | `"True"`/`"False"` | `options` |
| `comparison` | ComparisonSymbolInput | `"<"`/`">"`/`"="` | `comparisonOptions` |
| `orderedList` | OrderedListInput | comma string / string[] | `orderedItems`, `validationRules.allowEquivalent` |
| `multiPart` | MultiPartAnswerInput | string[] (one per part) | `expectedParts:[{label,prompt,answer,acceptableAnswers?,mode?}]`, `feedbackParts` |
| `tableInput` | TableAnswerInput | string[] (editable cells, row-major) | `tableConfig:{caption?,headerRow?,rows:Cell[][]}` where `Cell = string | {input:true,answer,acceptableAnswers?}` |

All fields are optional and carried through `makeQuestion` → `decorateQuestion`,
so adapters opt in per skill and everything else stays `null`.

## Scoring (multi-part / table)

Policy: **single-answer modes** are correct/incorrect. **multiPart** and
**tableInput** are graded all-or-nothing for mission scoring — a question counts
as correct only when **every** part/cell is correct. `gradeAnswer` still returns
`score` (0..1), `correctCount` and `partResults`, which the UI uses for
**part-level feedback** (✓/✗ per part/cell). Full partial credit can be layered
on later without touching the scoring architecture.

## Enter / keyboard

- `simple`, `orderedList`, `trueFalse`, `comparison` → **Enter checks**.
- `math` → the MathLive field handles Enter.
- `multiPart`, `tableInput` → Enter does **not** submit (avoid premature submit
  while typing); the student clicks **Check**.
- Once answered, Enter advances to the next question for every mode.
- `trueFalse` (T/F) and `comparison` (`<`,`>`,`=`) accept keyboard shortcuts but
  ignore them while another input is focused, so the world's `E`/`Shift` keys and
  typed answers never collide.

## Adding a new answer mode (future topics)

1. Add the mode id to `ANSWER_MODES` and a grader in `src/maths/answerModes.js`
   (and wire it into `gradeAnswer`, `buildModeCheck`, `isAnswerReady`).
2. Add a controlled input component here and a `case` in `AnswerRenderer`.
3. Have the adapter/skill set `answerMode` + the mode's fields on the question.

No changes to `MathsEncounter`, missions, or scoring are required — the renderer
and grader do the rest.

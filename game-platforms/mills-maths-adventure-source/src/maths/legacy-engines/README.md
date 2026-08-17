# Legacy Engines & Adapters

How real Mills Maths Tools (MMT / CHHS "Exam Builder") engines and question banks
are brought into the game without polluting the rest of the codebase.

## The pipeline

```
legacy source            adapter                     curriculum skill            game
(legacy-engines/*)   →   (adapters/*)            →   (curriculum/stage*/...)  →  (NPCs,
 question bank /          maps legacy output to       thin generate(level)        missions,
 diagram engine          the CORE question shape      wrapper                     adaptive,
                         + diagram metadata                                       diagrams)
```

**Golden rule:** only files in `src/maths/adapters/` may import from
`src/maths/legacy-engines/`. The game, UI, encounters, missions, progress and the
curriculum **registry** never import a legacy engine directly. A system check +
a source grep enforce this.

## What lives where

- `legacy-engines/<topic>/original-engine.js` — the real question bank, kept as
  close to the uploaded original as possible. The only permitted edit is
  repointing its schema import to `../schemas/question.schema.js`.
- `legacy-engines/<topic>/original-diagram-engine.js` — a real DOM/SVG diagram
  renderer (`window.MMT_*`). **Reference only — never imported.** Its design is
  re-created as isolated React components under `src/ui/diagrams/`.
- `legacy-engines/schemas/question.schema.js` — a tiny shim providing
  `createQuestion` / `SPACE_SIZES` / `QUESTION_KINDS` so banks run unchanged.
- `legacy-engines/<topic>/notes.md` — what the engine contains, which types are
  adopted, and any limitations (e.g. difficulty).

## Adapters

- `mmtEngineAdapter.js` — generic: `adaptToCoreQuestion(descriptor)` and
  `createAdaptedGenerator(legacyGenerate, mapper)`. Turns a mapped descriptor
  into a real core question via `makeQuestion` (carrying diagram fields).
- `legacyAdapterHelpers.js` — pure helpers (numeric normalisation incl. the
  Unicode minus `−`, unit stripping, acceptable-answer builders, validation).
- one adapter per topic (`integersAdapter.js`, `areaAdapter.js`, …) — imports the
  legacy source, maps each adopted type to a descriptor (incl. `diagramType` /
  `diagramData`), and exports `generate(level)` functions for the skills.

## Adding a future topic (step by step)

1. Drop the engine in `legacy-engines/<topic>/original-engine.js`; repoint its
   schema import to `../schemas/question.schema.js`. Add `notes.md`.
2. Write `adapters/<topic>Adapter.js`: import the legacy generator, map its
   output to descriptors, export `generate*(level)` functions. Reuse
   `mmtEngineAdapter` + `legacyAdapterHelpers`.
3. Add curriculum skills under `curriculum/stage4/<topic>/…` whose
   `generate(level)` call the adapter. Tag them `source: "legacy-adapter"`.
4. Register the topic's skills in `curriculum/stage4/index.js`.
5. (Optional) add the topic to a sample mission. It now appears automatically in
   the Teacher Mission Setup (it reads the registry).

## Adding a future diagram-heavy topic (angles, Pythagoras, number lines, coords)

1. Keep the legacy DOM diagram engine as `original-diagram-engine.js` (reference).
2. Build a React/SVG component under `src/ui/diagrams/` (e.g.
   `AngleDiagram.jsx`).
3. Add its type id to `src/ui/diagrams/diagramTypes.js` and a `case` in
   `DiagramRenderer.jsx`.
4. In the topic adapter, map the legacy diagram `config` into
   `diagramType` + `diagramData` (plain serialisable data only — no functions,
   no DOM). The encounter renders it automatically above the answer input.

Already implemented this way: Area (`rectangleArea`, `triangleArea`,
`compositeRectangleArea`) and Integers (`integerNumberLine`, `thermometer`).

## Mapping legacy difficulty → `difficultyLevel` 1–5

- If the legacy engine **has** difficulty, map its bands onto 1–5 in the adapter.
- If it **doesn't** (e.g. the Integers bank is all `level: "mixed"`), difficulty
  drives **metadata + XP** (via the registry/`decorateQuestion`) and, where cheap,
  a **soft content filter** in the adapter (e.g. operand magnitude by level).
  Always clamp to 1–5. Document the limitation in the topic's `notes.md`.

## Exposing a topic to teacher missions

Nothing special: once a topic + skills are registered in the curriculum
registry, the Teacher Mission Setup panel lists them automatically, and the
mission engine generates only from the selected stage/topic/skills.

## Status

| topic    | bank present | adapted | diagrams                         |
|----------|--------------|---------|----------------------------------|
| Integers | yes          | yes     | integerNumberLine, thermometer   |
| Area     | (built-in)   | yes     | rectangle/triangle/composite     |
| FDP      | yes          | pending | (fdp diagram engine available)   |
| Algebra  | **missing**  | pending | (algebra diagram engine present) |

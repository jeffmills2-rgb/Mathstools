# Legacy Engines — `stage4-area`

This folder holds **older Mills Maths Tools (MMT) engines / question banks**, kept
as *source material*. They are intentionally **not** wired into the game directly.

## Why quarantine legacy engines?

Legacy engines were written before the current question contract
(Phase 2C/2D: stage → topic → skill, decorated questions, adaptive difficulty,
diagram fields). Their output shapes are different and idiosyncratic. If we let
that shape leak into the game we'd have to special-case it everywhere.

Instead:

```
legacy engine  →  adapter  →  current decorated-question shape  →  game
(this folder)     (src/maths/adapters)                            (unchanged)
```

The **adapter layer** (`src/maths/adapters/`) is the *only* code allowed to import
from this folder. It translates the legacy output into the standard core question
(`makeQuestion(...)`) and attaches `diagramType` / `diagramData` so the renderer
can draw a figure.

## Rules

1. **Do not import legacy engine files from game, world, progress, UI, or
   curriculum code.** Only adapters import them.
2. **Do not edit the rest of the app to match a legacy shape.** Edit the adapter.
3. Legacy engines should stay **pure** (no React/DOM/stores), just like the rest
   of the maths layer.

## `original-area-engine.js`

A small stand-in for a real historical area engine. It exposes:

- `generateRectangle(level)` → rectangle area
- `generateTriangle(level)` → right-triangle area
- `generateComposite(level)` → L-shape (outer rectangle minus a corner notch)

Each returns the **legacy shape**:

```js
{ kind, prompt, answer /* number */, unit, workings, ...dimensions }
```

The mapping from this shape to the current question + diagram data lives in
`src/maths/adapters/areaAdapter.js`.

## Adding more legacy engines later

Create a sibling folder (e.g. `stage5-pythagoras/`), drop the original engine in,
write an adapter in `src/maths/adapters/`, then expose a curriculum skill whose
`generate(level)` calls the adapter. No game wiring changes.

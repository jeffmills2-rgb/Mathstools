# Classroom Pilot (Phase 2O–2P)

Mills Maths Adventure is a **local prototype**. This folder holds the small,
pure data the Year 7 classroom pilot shares between the UI and the system checks
(`pilotInfo.js`).

## Important
- **Results are device-local.** They live in this browser's `localStorage`
  (separate key from game/story progress). There is **no cloud collection,
  account, or class sync yet**.
- **Export before clearing.** Clearing browser data — or "Clear results only" —
  removes saved attempts. Export JSON/CSV (or copy the teacher summary) first.

## Suggested Year 7 launch workflow
1. Each student enters a display name and (optional) student code on the start
   screen.
2. Mission Board → **Year 7 Missions**.
3. Recommended first mission: **Mixed Year 7 Review** or **Integer Foundations**.
4. Students aim for **60%+** to pass.
5. Attempts save locally as they finish; **Try Again** creates a new attempt.
6. Teacher reviews/exports in the **Results Centre** (filter by name/code, topic,
   kind, pass/fail).
7. **Export before** using "Clear results only" (which never clears story/game
   progress).

## Mission lengths
- Year 7 presets are short (10–12 questions); the Mission Builder defaults to 10.
- Longer custom missions are still supported and use a condensed progress bar
  (a single bar instead of per-question dots) above 15 questions.

## Mission kinds (kept separate)
- `story` — the curated Number Island quest (Pip/Fern/Alby/Grove). Only these
  progress story gates.
- `teacher` / `free` — Mission Builder + library missions.
- `preset` — the Year 7 classroom presets.

A teacher/free/preset mission never progresses the main story.

## Known limitation
No cloud collection yet — this is a single-device local pilot. A future phase
(not this one) would add Firebase; the result record shape is already aligned
for that move.

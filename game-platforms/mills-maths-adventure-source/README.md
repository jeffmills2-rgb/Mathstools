# Mills Maths Adventure — Version 1

A web-based 3D maths exploration game for students. The student creates a
simple character, explores a small 3D island, meets friendly NPCs, and
completes short maths encounters to earn XP and coins.

Built with **Vite + React + React Three Fiber**. Version 1 uses placeholder
maths engines designed to be swapped for your real Mills Maths Tools question
engines later.

## Running it locally

You need [Node.js](https://nodejs.org/) 18 or newer.

```bash
npm install      # install dependencies (first time only)
npm run dev      # start the dev server, opens http://localhost:5173
```

Other commands:

```bash
npm run build    # production build into /dist
npm run preview  # preview the production build locally
```

## How to play

1. On the start screen, type a name and pick an avatar colour, then press
   **Start Adventure**.
2. Move with **WASD** or the **arrow keys**. The camera follows you, and
   **Z / X** orbit the camera left/right around your character.
3. Walk up to one of the three characters. When you're close enough a
   **Press E** prompt appears.
4. Press **E** to open a maths encounter: answer 5 questions, get instant
   feedback with a worked explanation, and earn XP + coins.
   - Typed answers are validated (numbers, decimals, fractions, percentages).
   - **Enter** submits your answer, then **Enter** again moves to the next one.
5. Your progress (XP, level, coins, completed challenges) is saved
   automatically to the browser (localStorage) and reloads on refresh.
6. Open the **📜 Quests** panel (top-right, or press **Q**) to see your
   current quest, objectives and rewards.
7. Toggle **🔊 sound** on/off (top-right); the preference is remembered.
8. **↺ Reset** (top-right) clears your save and returns to the start.

## Developer testing panel

A hidden panel for testing. Open it with the **⚙ Dev** tab in the bottom-right
corner, or press the **backtick (`)** key. From it you can inspect live state,
grant XP/coins, mark challenges complete, jump straight into any encounter,
run the maths-engine self-test, and reset progress. To remove it for a student
build, delete `<DevPanel />` from `src/App.jsx`.

## Project structure

```
src/
  App.jsx              Top-level orchestrator (creator vs. playing); E-to-interact
  main.jsx             React entry point
  game/                Everything inside the 3D canvas + session state
    World.jsx          Scene: lights, island, scenery, interactables, player
    Player.jsx         Keyboard movement + third-person follow camera
    Interactable.jsx   Generic world object (npc / chest / gate) by data
    useKeyboard.js     WASD / arrow-key hook
    sessionStore.js    Transient state (phase, nearbyId, activeEncounterId)
  ui/                  2D HTML overlays
    CharacterCreator.jsx
    HUD.jsx            Name, level, XP bar, coins, quest tracker, buttons
    QuestLog.jsx       Openable quest panel (Q key / 📜 button)
    InteractionPrompt.jsx
    EncounterModal.jsx ROUTER: picks the component for an encounter's type
    DevPanel.jsx       Hideable developer testing panel
    encounters/        One component per encounter type
      MathsEncounter.jsx     5-question quiz (validation + feedback + rewards)
      CompletionScreen.jsx   shared end-of-encounter results screen
      DialogueEncounter.jsx  conversation lines
      TreasureEncounter.jsx  one-time coin reward
      GateEncounter.jsx      locked-area placeholder
      BattlePlaceholder.jsx  stub for a future battle system
      BossPlaceholder.jsx    stub for a future boss system
    effects/           Student-experience polish (Phase 2A)
      uiStore.js       Quest-log open state, toast queue, sound on/off
      sound.js         Synthesised sound effects (no audio files)
      announce.js      Turns a completion result into toasts + sounds
      ToastLayer.jsx   Renders level-up / quest-complete toasts
    math-input/        Equation-style answer input (Phase 2B)
      MathAnswerInput.jsx  MathLive-based editor + structure toolbar
      mathInputUtils.js    Pure latex/ascii → plain + validation (no MathLive)
      mathInput.css        Styles for the editor + toolbar
  game/
    interactableStatus.js  Picks the floating badge icon/colour per type+state
  maths/               Modular maths engines (fully self-contained)
    index.js           Legacy engine registry + buildQuestionSet() + self-test
    integers.js / fractions.js / algebra.js
    mathExamples.js    Example engine demonstrating math-mode input (not a topic)
    helpers.js         makeQuestion(), validation, simple + math answer-checking
    curriculum/        Stage → Topic → Skill content (Phase 2C)
      curriculumRegistry.js  Browse the tree + generate/build questions
      shared/curriculumUtils.js  Difficulty labels, XP scaling, decorateQuestion()
      stage3/ stage4/ stage5/    Each: index.js (topics) + skill files
    adaptive/
      adaptiveSelector.js  Pure adaptive-difficulty logic (suggestDifficulty)
  quests/
    questEngine.js     Pure quest logic (unlocked / requirements / status)
  progress/            Saved progress
    store.js           XP, coins, level, completeEncounter(), quest sync
    storage.js         localStorage read/write (swap for Firebase here)
  data/                Data-driven content
    encounters.js      All encounters (id, type, config, rewards)
    interactables.js   World objects, each referencing an encounterId
    quests.js          Quest definitions (requirements, rewards, unlocks)
  dev/
    systemChecks.js    Integrity checks run from the DevPanel
  styles/
    index.css
```

## Architecture: encounters & quests

The game is **data-driven**. Three layers stay cleanly separated:

- **Content** (`src/data/`): plain objects describing encounters, the world
  objects that trigger them, and quests. No behaviour here.
- **Behaviour** (`src/ui/encounters/`, `src/quests/`, `src/progress/`): the
  components that render each encounter type, the pure quest logic, and the
  saved-progress store.
- **World** (`src/game/`): renders interactables and reports proximity. It
  never references maths or encounter logic — an interactable only knows it has
  an `encounterId`.

Flow: walk near an interactable → it reports `nearbyId` → press **E** →
`App.jsx` looks up the interactable's `encounterId` and opens it →
`EncounterModal` routes to the right component by `type` → on finish the
component calls `progress.completeEncounter()`, which records the encounter,
re-checks quests, and grants rewards. The maths engines are reached only by
`MathsEncounter`, keeping them fully separate from game/UI/progress code.

## Student experience (Phase 2A)

These additions are pure polish — the encounter/quest architecture above is
unchanged.

**Quest Log.** A panel (📜 button or **Q** key; **Esc**/click-away to close)
in `ui/QuestLog.jsx`. Open state lives in `ui/effects/uiStore.js` so the button
and the key control the same panel. It lists every quest grouped active →
completed → locked, and for active quests shows a progress bar plus an
objective checklist (each required encounter ticked when done). It reads the
same pure helpers in `quests/questEngine.js` as the rest of the game, so it can
never disagree with the real state. The HUD also has an always-visible **Quest
Tracker** showing the current quest's objective and progress.

**Interactable status indicators.** `game/interactableStatus.js` maps an
interactable's encounter `type` + completion state to a floating badge
(`{ icon, tone, label }`), rendered by `game/Interactable.jsx` as an HTML badge
above the object: maths-available (blue "?", pulsing) vs maths-completed (green
"✓"), dialogue (💬), treasure-available (gold "✨", pulsing) vs claimed (grey,
dimmed), and locked gate (🔒). The badge scales up when you're in range. Add a
new encounter type → add one `case` here and a `.tone-*` colour in the CSS, and
every interactable using it updates automatically.

**Reward animations.** Two channels:
- *Inline* (inside the modal): a gentle "pop" on each answer's feedback and on
  the completion-screen reward chips (CSS `@keyframes pop`).
- *Toasts* (top-centre): level-ups and quest-completions. Encounter components
  call `announceResult(result)` (`ui/effects/announce.js`) after
  `completeEncounter()`; it reads the result's `leveledUp` / `newlyCompletedQuests`
  and pushes toasts via `uiStore.pushToast`, which `ToastLayer.jsx` renders and
  auto-dismisses. The HUD level badge also pulses when the level number rises.
So: *correct answer* → pop + sound; *encounter complete* → completion screen +
sound; *quest complete* / *level up* → toast + sound.

**Completion screen.** `ui/encounters/CompletionScreen.jsx` shows XP earned,
coins earned, any quest just completed, and the updated progress bar of the
current quest (read after the encounter is recorded, so it reflects new totals).

**Sound.** `ui/effects/sound.js` synthesises short, soft blips with the Web
Audio API — no audio files. Every sound goes through `uiStore.playSound(name)`,
which is a no-op when sound is off, so the single 🔊/🔇 HUD toggle (preference
saved in localStorage) disables everything.

**Classroom-friendly feedback.** Per-question feedback is calm and
instructional — "Correct" / "Let's look at this one" with the worked
explanation, warm amber (not alarming red) for misses — saving celebration for
the completion/level-up/quest moments.

**Responsive.** Media queries in `styles/index.css` shrink the HUD, modal and
panels on narrow/short laptop screens; the modal and quest log scroll if tall.

## Camera & UI polish (Phase 2A follow-up)

**Labels don't overlap the modal.** `Interactable.jsx` reads
`session.activeEncounterId`; when any encounter modal is open it adds
`ix-hidden` to each floating badge, which fades it out (`opacity: 0`,
`pointer-events: none`) via CSS. Closing the modal restores them.

**The chest opens once claimed.** The chest's lid is a separate hinged group in
`Interactable.jsx`'s `Model`. It receives `open={completed}` (i.e. whether the
encounter is in `completedEncounters`), and when open the lid swings back and a
gold glint shows inside. Because it's driven by saved progress it persists
across refresh, and **Reset** clears `completedEncounters` so the chest closes
again.

**DevPanel encounter buttons renamed.** The section is now "Test encounter
(opens modal — no teleport)"; the handler is `testEncounter()`. It only opens
the encounter UI — it does not move the player or camera.

**E-key no longer leaks into the answer box.** When **E** opens an encounter,
`App.jsx` calls `e.preventDefault()` on that keystroke, which cancels the
keypress/text-insertion so the letter "e" can't land in the answer input that
is about to focus. The input still starts blank, and Enter-to-check,
Enter-to-advance, validation, and the Check/Next/Finish/Leave buttons are
unaffected (Enter is handled by a separate window listener, not the input).

**Z / X camera rotation.** `useKeyboard.js` maps **Z → rotateLeft**,
**X → rotateRight**. `Player.jsx` keeps a `camYaw` angle that those keys turn
at a fixed speed while held. Each frame the camera is placed "behind" the player
at that yaw (`distance` + `height`) and smoothly lerped, so it keeps following
after you rotate. Crucially, movement is **camera-relative**: "forward/right"
are derived from `camYaw`, so pushing forward always means "into the screen"
regardless of the camera angle — the controls stay natural after rotating.
(Rotation is frozen while an encounter is open.)

## Mathematical answer input (Phase 2B)

Questions can be answered two ways, chosen per question/encounter via
`inputMode`:

- **`"simple"`** (default) — the original plain text box, for numbers,
  decimals and `a/b` fractions.
- **`"math"`** — a proper equation editor (`MathAnswerInput`) for fractions,
  square/nth roots, exponents and algebraic expressions.

**Library: MathLive.** The editor wraps [MathLive](https://mathlive.io)'s
`<math-field>` web component (added to `package.json`). It was chosen over
building an editor from scratch because it is well maintained and gives, out of
the box: clickable fraction/root/exponent templates, arrow-key navigation
between placeholders, natural Backspace/Delete around structures, and clean
LaTeX / ascii-math output. The maths fonts are self-hosted: `MathAnswerInput.jsx`
imports `mathlive/fonts.css` (Vite bundles it and the `.woff2` files) and sets
`MathfieldElement.fontsDirectory = null`, so fonts load locally with no CDN.
Without the proper fonts MathLive falls back to the page font and
radicals/placeholders render incorrectly (e.g. the nth-root index colliding with
the radical sign).

**How `MathAnswerInput` works.** It registers `<math-field>` (side-effect
`import "mathlive"`), renders a toolbar (fraction, √, nth-root, exponent, `x`,
clear) whose buttons `insert()` LaTeX templates with `#?` placeholders, and on
every edit calls `onChange({ latex, ascii, plain })`. It is **lazy-loaded** —
MathLive only loads when a math question actually appears, so simple-only play
stays light. Remounting it (we use `key={questionIndex}`) resets it to blank.

**How a question chooses its input.** Set `inputMode: "math"` on the question
(via `makeQuestion`) or `config.inputMode: "math"` on the encounter; either one
switches the editor on. The matcher is selected to match: math-mode questions
use the expression-aware matcher, simple questions use the plain one. The three
curriculum NPCs stay `"simple"`; the `demo-math-input` encounter (DevPanel →
Test encounter) shows the editor using the `mathExamples` engine.

**Internal representation.** Structures map to plain strings the matcher
understands: a fraction → `a/b` (MathLive ascii-math), a square root →
`sqrt(x)`, an nth root → `root(n)(x)`, an exponent → `x^n`. The editor returns
`{ latex, ascii, plain }`; we check against `plain` (derived from ascii-math,
or from LaTeX via `latexToPlain` as a fallback).

**How answer checking works.** `helpers.js` provides `answersMatchMath`, which
accepts an answer if **either**: (1) it matches a canonical string form
(lowercased, spaces/`*`/brackets removed, so `x^(2)` = `x^2`), **or** (2) it is
**numerically equal** — variable-free expressions are safely evaluated
(supporting `+ - * /`, `^`, `sqrt`, nth roots), so `1/2` = `0.5`,
`sqrt(2)` = `2^(1/2)`, and `root(3)(8)` = `2`. Anything containing a variable
(like `x`) skips numeric evaluation and relies on the canonical string match.
All of this lives in the maths module, so the engines stay fully separate from
the UI and are testable in plain Node.

## Curriculum & adaptive difficulty (Phase 2C)

Maths content is organised as **Stage → Topic → Skill**, ready to scale to a
full Stage 3–5 curriculum without changing the game.

**The tree.** A *stage* (`stage3`/`stage4`/`stage5`) has *topics*; a topic has
*skills*; a skill knows how to `generate(difficultyLevel)` a question. Each
piece lives in its own file under `src/maths/curriculum/<stage>/<topic>/`, and
each stage's `index.js` lists its topics and skills. Only skills with a working
generator are listed; the empty folders in the suggested layout are where future
content slots in. Currently sampled: Stage 3 Number; Stage 4 Integers, FDP
(percentages + simplify-fractions), Algebra; Stage 5 Indices, Surds — with a mix
of difficulty levels.

**The registry** (`curriculumRegistry.js`) is the single entry point. It can
browse the tree (`getStages`, `getTopics`, `getTopic`, `getSkill`) and produce
questions (`generateCurriculumQuestion(stage, topic, skill, level)` and
`buildEncounterQuestions(config, resolveDifficulty)`). Every question comes out
in one rich shape: `id, stage, topicId, topicName, subtopicId, skillId,
skillName, syllabusArea, difficultyLevel (1–5), difficultyLabel
(Mild/Medium/Spicy/Challenge/Boss), xpValue, inputMode, text, answer,
acceptableAnswers, feedback, check(), prerequisiteSkillIds, nextSkillIds`. The
registry imports only other maths modules — never game/UI/progress — so the
maths layer stays isolated (a system check enforces this).

**Adapting existing Mills Maths Tools engines.** A skill can wrap an existing
engine: `stage4/integers/integerOps.js` and `stage4/algebra/linearEquations.js`
simply call the old `integers`/`algebra` engines and return their core question;
the registry adds the curriculum metadata. So to bring a real engine in, write a
thin skill whose `generate(level)` calls your engine (optionally passing `level`
once the engine supports it) and returns `{ text, answer, acceptableAnswers,
feedback, inputMode, check }` (use `makeQuestion` if helpful). Register the skill
in its stage's `index.js`. Nothing else changes.

**The three NPCs** now draw from the registry: their encounter configs are
`{ stage: "stage4", topicId: "integers" | "fdp" | "algebra" }` instead of a
hardcoded topic. They behave the same (Pip→Integers, Fern→FDP, Alby→Algebra).

**Adaptive difficulty.** Each player has a per-skill performance profile saved
in localStorage (`progress.skillProfiles`): `attempts, correct,
workingDifficulty, streak, incorrectStreak, accuracy, lastAttempt`. After each
answer, `recordSkillAttempt(skillId, isCorrect)` updates the profile and asks
the pure `adaptiveSelector.suggestDifficulty()` whether to nudge the working
difficulty: 3 correct in a row → +1 level, 2 wrong in a row → −1, mixed → stay,
always clamped to 1–5 and moving one step at a time. When an encounter starts it
picks each skill's difficulty from this profile, so students gradually settle at
the right level. (The engine is intentionally simple — swap
`suggestDifficulty()` for a richer model later.)

**XP scaling.** XP per question scales with difficulty
(`L1=10, L2=15, L3=20, L4=30, L5=45`), so harder questions are worth more while
easier ones still reward effort. An encounter awards the sum of the `xpValue` of
correctly-answered questions plus a small completion bonus.

**Simple vs math input** is chosen per skill: simple typed input for whole
numbers, integers, decimals, percentages and simple equations (x = 9); the
MathLive editor for simplified/equivalent fractions, algebraic expressions,
powers/indices and roots/surds.

**DevPanel → Curriculum & adaptive** lets you browse stages/topics/skills,
generate a sample at any difficulty (showing inputMode, difficultyLevel,
xpValue, feedback), and simulate correct/incorrect attempts to watch the
adaptive selector move the suggested difficulty.

## Plugging in your real Mills Maths Tools engines

The `src/maths/` module is **fully self-contained** — it imports nothing from
the 3D world, the UI, or the progress store, so you can build and test engines
in isolation. Each topic file exports an object with a `generate()` method that
returns a **standardised question** built with the `makeQuestion()` helper:

```js
{
  topic: "integers",                 // which engine produced it
  difficulty: "easy",                // "easy" | "medium" | "hard"
  text: "What is 7 + (-3)?",         // the question shown to the student
  answer: "4",                       // the single canonical correct answer
  acceptableAnswers: ["4"],          // every form counted as correct
  feedback: "Adding a negative ...", // a worked explanation shown after answering
  check: (input) => boolean,         // true if a typed answer is acceptable
}
```

`check()` is generated for you from `acceptableAnswers` (with numeric tolerance,
so `0.50` matches `0.5`). To use your existing question banks:

1. Open a topic file (e.g. `src/maths/integers.js`) and replace the body of
   `generate()` with a call into your engine, wrapping the result in
   `makeQuestion({ topic, difficulty, text, answer, acceptableAnswers, feedback })`.
   Look for the `PLUG-IN POINT` comment.
2. See "Add a new maths topic" below for adding a brand-new topic.

Nothing else in the game needs to change. `runEngineSelfTest()` in
`src/maths/index.js` (also wired into the dev panel) checks that every engine's
answers pass their own `check()`.

## How the Enter key works (encounter modal)

The answer input is **disabled** after you check an answer, and a disabled
input receives no keyboard events — that was the original bug. So Enter is
handled by a **window-level listener** in `MathsEncounter.jsx` instead of on the
input:

- While typing (status `answering`), **Enter checks** the answer.
- After checking (correct *or* incorrect), **Enter advances** to the next
  question, and on the last question **Enter finishes** the encounter.

The listener is recreated whenever the relevant state changes (so it always
sees fresh values) and is removed once the encounter finishes. The on-screen
**Check / Next / Finish / Leave** buttons call the same functions, so both
paths stay in sync.

In **math** mode the equation editor intercepts Enter itself (capture phase)
and calls the same `handleEnter()`, so check → advance → finish behaves
identically whether the question uses the plain box or the equation editor.

## Extending the game

### Add a new maths topic
1. Create `src/maths/yourtopic.js` exporting `{ id, title, description,
   generate() }`, with `generate()` returning `makeQuestion({ ... })`.
2. Register it in `src/maths/index.js` (`import` it and add to `ENGINES`).
3. Add an encounter in `src/data/encounters.js`:
   `{ id: "maths-yourtopic", type: "mathsChallenge", title, config: { topic: "yourtopic", questionCount: 5 } }`.
4. Point a world object at it in `src/data/interactables.js`
   (`encounterId: "maths-yourtopic"`), or jump to it from the DevPanel.

### Add a battle encounter
1. Replace the body of `src/ui/encounters/BattlePlaceholder.jsx` with your real
   battle UI. On win, call
   `useProgress.getState().completeEncounter({ encounterId: encounter.id, xp, coins })`
   and then `useSession.getState().closeEncounter()`.
2. Add/adjust the encounter in `encounters.js`
   (`type: "battlePlaceholder"` — or rename the type to `"battle"` and update
   the `switch` in `EncounterModal.jsx`).
3. Attach it to an interactable (e.g. an enemy) in `interactables.js`.
The router already dispatches the type, so no other wiring is required.

### Add a boss encounter
Identical to a battle: edit `BossPlaceholder.jsx` (or add a new `"boss"` type +
`case` in `EncounterModal.jsx`), define the encounter in `encounters.js`, and
attach it to an interactable. Bosses can be gated behind a quest by checking
`getQuestStatus()` before opening, or behind a `gate` interactable.

### Add a new quest chain
1. Add quests to `src/data/quests.js`, each with `requiredEncounters`,
   `rewards`, and `unlock.requiredQuests` pointing at the previous quest's id.
2. That's it — the progress store auto-detects completion in `_syncQuests()`
   and grants rewards once. The HUD and DevPanel read quest state through the
   pure helpers in `src/quests/questEngine.js`.

## Swapping localStorage for Firebase

All persistence lives in `src/progress/storage.js` behind `loadProgress()` and
`saveProgress()`. Replace those two function bodies with Firestore reads/writes
and the rest of the app keeps working. The saved shape now includes `xp`,
`coins`, `level`, `completedEncounters` and `completedQuests` (one-time treasure
is tracked via `completedEncounters`). (See the `SWAPPING IN FIREBASE` comment
in that file.)

## Internal checks

The DevPanel's **Run system checks** button (and `src/dev/systemChecks.js`)
verifies: maths engines still pass, every interactable's `encounterId` exists,
every quest's required encounters exist, quest unlock chains are valid, and that
progress (XP, coins, completed encounters & quests) survives a save + reload.

## Notes / scope

- Single player only (no multiplayer yet); no Firebase yet.
- Simple primitive shapes instead of external 3D models, for fast loading and
  easy debugging. The world is still a small island.
- Encounter types: `mathsChallenge` (full), `dialogue`, `treasure`, `gate`
  (working), `battlePlaceholder`, `bossPlaceholder` (stubs).

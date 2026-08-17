# Chapter 2 — sandbox defaults & the Schoolyard region (plan)

> Supersedes `region-expansion-plan.md` for the world-expansion work. Two
> sequenced workstreams: **(1) turn the base game into an open arithmetic
> sandbox**, then **(2) build the Schoolyard as a second region**. Designed
> 2026-07-01. NOT yet built — approve/adjust before building.

---

## 0. Confirmed decisions

- **Open sandbox base game.** When a character has **no teacher task**, its
  default mission is **basic arithmetic** (below): every character, **both
  regions**. Defaults award **XP/coins only — no badges, no gate progression**.
- **Open world in free-play.** All gates are **open by default** so a student can
  roam to any character and never get stuck. The locked badge/gate/Champion
  *progression* becomes the **teacher-driven** ("get to the end") layer.
- **Real content = teacher tasks.** Badges/trophies/Champion come from
  teacher-assigned tasks, not from the arithmetic defaults.
- **Schoolyard = second region**, reachable from an always-open **Teleport Gate**
  (the north gate), lockable later. Themed on the real school (top-down + panorama
  refs), including its **stepped/terraced** quad. Three characters: **Helen,
  Darby, Elka** (teacher-assignable down the track).

**The three default arithmetic skills** (new, foundational):
1. **Addition & subtraction within 20** (non-negative answers).
2. **Multiplication facts** — times tables, factors 1–10.
3. **Division facts** — whole-number quotients from the 1–10 tables.

Balanced across characters: each unassigned character is given **one** of the
three, assigned **round-robin** by a stable order, so the set spreads evenly (six
characters → two each) and a roaming student meets all three.

---

## 1. Why this order

Workstream 1 changes the **shared** mission/reward/gate model that *both* regions
use. Building the Schoolyard first would mean building it on the old badge-gated
model and retrofitting it. So: **sandbox model first, Schoolyard on top.**

---

## 2. Workstream 1 — Sandbox defaults & progression

### 2.1 New arithmetic content
- Add three skills (Stage 3 "number facts" topic, mirroring the existing
  `stage3/number/wholeNumberOps.js` pattern + `makeQuestion`): `addSubTo20`,
  `multFacts`, `divFacts`. Register in `curriculumRegistry`. Foundational
  difficulty; small ranges only.

### 2.2 Balanced defaults, XP/coins only
- Each character's **default** mission (used when no teacher task is present) draws
  from its round-robin arithmetic skill, short (~8–10 Qs), **no `rewardBadge`**.
- Mechanically: replace the static NPC missions' content (today `npc-pip-1` etc.
  teach integers/FDP/algebra + award topic badges) with the arithmetic defaults,
  and strip their badge rewards. The teacher-task runtime overlay is unchanged —
  it still prepends real tasks ahead of the default.

### 2.3 Open world
- Gates (`worldUnlocks.js`) currently require topic badges. Add a **sandbox
  default = open**: gates render passable unless a future structured/teacher mode
  locks them. Keep the gate data for later re-use. Net effect: free roam.

### 2.4 Badges / Champion via teacher tasks ("get to the end")
- Teacher tasks can already carry a `rewardBadge` (validated in
  `createAdventureTask`/`updateAdventureTask`) — **surface it in the Set-task
  form**, and add a "final / awards trophy" notion so a teacher task can drive the
  badge → gate → Champion progression. This is the mechanism that makes "set a task
  to get to the end → finish with the relevant trophies" real.

### 2.5 Story / dialogue / checks
- Update Sage + NPC dialogue: drop the hard-wired "my challenge powers the Fraction
  Bridge" lines for sandbox-friendly encouragement ("try a challenge; your teacher
  may set you a task"). Overlaps with the "deeper story" goal.
- **Update the 251 system checks** to the new model (defaults award no badges;
  gates open; arithmetic skills exist and are balanced; main-quest/gate assertions
  revised). Expect to touch a fair number — they encode the old wiring.

### 2.6 Phases
- **W1-A** Arithmetic skills + registry + checks for them.
- **W1-B** Character defaults → balanced arithmetic, XP/coins only (badges
  stripped).
- **W1-C** Open the gates by default (free roam) + guidance/dialogue update.
- **W1-D** Teacher-task rewards: reward-badge + "get to the end" in the Set-task
  form + functions surface.
- **W1-E** System-checks overhaul to the new model; local playtest.

---

## 3. Workstream 2 — The Schoolyard region

### 3.1 Region system (foundation)
- New `regions.js` keyed by `regionId`; `currentRegion` in the session store.
  `World.jsx`/`Player.jsx` read the **active region's** geometry, spawn, colliders,
  and **walkable bounds**. Wrap today's island as `island-1` (no visible change).
- **Generalize the player clamp** from a circle to **per-region bounds** (polygon
  or rectangle) — required because the schoolyard is a rounded rectangle, not a
  disc.

### 3.2 The Schoolyard map (from the real school)
- Central **plaza** hub; **stepped/terraced** quad using the existing height/step
  system (`groundHeightAt`, `STEP_UP/DOWN`, `PLATEAU/STAIRS`) — this is already a
  strength. Signature low-poly landmarks for recognisability: big **fig/gum
  trees**, curved **brick planters**, the **blue-painted wall**, the **covered
  verandah** building, and the **accessibility ramp**.
- Three character zones per the sketch: **① north, ② southeast, ③ west**
  → Helen / Darby / Elka. **Teleport Gate** at the north/east edge (the sketch's
  "exit"), always open for now.

### 3.3 Characters + maths
- Helen / Darby / Elka each get an interactable, a quest chain, and a **default**
  arithmetic skill (round-robin, per W1). Home topics (for teacher tasks) TBD —
  candidates: the orphan **Area** and **Pythagoras** banks + an extension/mixed.
- **Teacher-assignable:** add `helen`,`darby`,`elka` to `ADVENTURE_NPCS` (function
  whitelist) and the website `adventureManifest.js` so teachers can set their
  tasks.

### 3.4 Travel + story
- Teleport Gate ↔ schoolyard arrival, short fade transition, "Return" option.
- A light story framing tying the island and school (no hard gate for now).

### 3.5 Phases
- **W2-A** Region system + wrap island-1 (no visible change) + generalized clamp.
- **W2-B** Schoolyard geometry: bounds, terrain, steps/ramp, landmarks, spawn.
- **W2-C** Teleport Gate + travel/transition between regions.
- **W2-D** Helen/Darby/Elka: interactables, chains, arithmetic defaults + teacher
  whitelist/manifest.
- **W2-E** Story/dialogue pass; region-integrity checks; playtest; build & ship.

---

## 4. Cross-cutting

- **Don't-break** (CLAUDE.md): story/onboarding/missions/badges/unlocks/gates/
  MathLive/diagrams/collision/jump/camera. Both workstreams touch these — keep the
  checks green at every phase; each phase is locally testable.
- **Deploy:** functions first (any whitelist/reward changes), then build the game
  and push the website. Rules unchanged unless the assignment shape changes.
- **Teacher-task feature (Phases 1–2)** is already shipped — this builds on it.

## 5. To decide as we go
- Home topics for Helen/Darby/Elka (Area / Pythagoras / extension?).
- Exact "get to the end" UX (a special task flag vs a badge picker).
- How much of the old island story to keep vs rewrite for the sandbox framing.
- When to introduce optional gate-locking (structured mode).

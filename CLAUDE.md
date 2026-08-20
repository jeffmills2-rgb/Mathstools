# Mills Maths Tools — Project Brief

> Hand this file to Claude at the start of any chat to get up to speed without
> re-uploading everything. Keep it short, current, high-signal. If a fact here
> stops being true, fix it here first.
>
> **NEW (2026-08-17): SINGLE-REPO CONSOLIDATION.** The game SOURCE is no longer a
> separate folder — it now lives IN this repo at
> `game-platforms/mills-maths-adventure-source/` (the Vite project), with its
> BUILT/deployed copy in the sibling `game-platforms/mills-maths-adventure/`.
> There is now ONE folder for everything: the local clone at
> `~/Documents/GitHub/Mills Maths Tools/` (GitHub repo `jeffmills2-rgb/mathstools`,
> Netlify-deployed on push to `main`). **Deploy an Adventure change:** edit in
> `game-platforms/mills-maths-adventure-source/` → `npm run build` → copy `dist/.`
> into `../mills-maths-adventure/` → `git add -A && git commit && git push`.
> §2 "TWO folders", §3 deploy paths and §5's `mathstools-main 2` heading below
> describe the OLD layout — this block supersedes them.
>
> **NEW (2026-08-20, session — being pushed): ADDING AND SUBTRACTING FRACTIONS
> family.** The teaching tool
> (`interactive-tools/stage-4/number/adding-fractions/index.html`, built the
> night before as "Adding Fractions") grew up and gained its two siblings:
>
> 1. **Teaching tool upgrades.** (a) The EQUIVALENT FRACTIONS now appear in a
>    band between the joined bar and the number line once the split step is
>    reached (e.g. 3/6 + 2/6 under their segments; subtraction writes −C/D
>    inside the pink hatch) — the line moved down to make room (viewBox 436).
>    (b) **Negative answers allowed**: the take-away may exceed the start; the
>    axis extends to −1 (`axisMin()`), sign-aware fraction rendering everywhere,
>    the swap/validation removed, narration adapts ("straight past zero").
>    (c) Below-line labels sit lower and the landing tick is shorter, so labels
>    like 17/20 no longer collide with ticks. (d) A "Tools ▾" menu links the two
>    siblings. Retitled **Adding and Subtracting Fractions**.
> 2. **Student quiz** `online-quizzes/stage-4/number/adding-subtracting-fractions.html`
>    (registry id `adding-subtracting-fractions-quiz`). Sweet/Mild/Medium/Spicy,
>    15 questions; the ladder raises the RENAMING demand while the model stays —
>    Sweet same denominators, Mild related (one bar re-splits), Medium unrelated
>    (both re-split, improper sums, simplifying), **Spicy = Medium with NO model
>    + take-aways that pass zero** (negative answers). Estimate-first (drag the
>    marker, never marked), then the bars, then an optional reveal (tagged
>    `usedRenameReveal`) on **every modelled level — Sweet ("Show the pieces"),
>    Mild and Medium ("Show the renaming")**; what disappears at Spicy and Extra
>    hot is the model itself. The reveal is a **back/forward arrow pair** (forward
>    disabled once revealed, back greyed until then) and the pieces ANIMATE
>    falling into place and lifting back out (slideIn/slideOut on the strip
>    segments, faded ticks/labels) instead of snapping; the same smooth BACK now
>    exists on the teaching tool (`state.animExit` + exit classes slideOut /
>    tickOut / fadeOut / popOut — one-step Back plays the current step's exit,
>    then lands). A **fifth level, Extra hot** (`extrahot`): coprime denominator
>    pairs, both <= 10, product >= 18, and BOTH fractions in simplest form
>    (2/6 would quietly reduce to 1/3) — e.g. 3/8 + 4/7, where the new unit is
>    the denominators multiplied; no model, improper sums + negative take-aways.
>    The MathLive box sits on the equation's own line, vertically CENTRED with
>    it (padding only — a min-height taller than the content top-aligns the
>    fraction), and the fraction button + its translated "Click to enter a
>    fraction" hint sit in their own centred row ABOVE the whole question card
>    (`#fracBarRow`, revealed with the field, hidden in the estimate phase and
>    when MathLive fails to load); landing labels drop a row near endpoint
>    labels ("1 whole"). **Answers are entered in a MathLive fraction editor** —
>    the Adventure's MathAnswerInput pattern trimmed to ONE fraction-template
>    button (`\frac{#?}{#?}`, so a typed whole number stays outside → mixed
>    numbers work), menu/keyboard icons hidden, Enter captured; loaded from
>    jsDelivr (`mathlive@0.101.2`), and if the CDN is unreachable the plain
>    typed input silently remains. **Never set `display`/flex on `<math-field>`**
>    — it breaks MathLive's own hit-testing and the first keystroke after a click
>    is swallowed (cost a debugging round); size it with min-height + padding.
>    Marking reads the LATEX (never ascii-math,
>    which flattens "1 3/20" to "13/20") via `latexToEntry()`, handling
>    MathLive's brace-less `\frac44` form. Matched as EXACT rationals,
>    any equivalent form (10/12 = 5/6 = mixed); one attempt per question. Carries
>    the byte-identical v2 login block (now **eleven** quizzes — §8 updated).
>    **Trilingual EN/AR/FA** (same convention as the Fractions Number Line Quiz:
>    selected language on top, English beneath; maths/numerals stay Western/LTR;
>    lang toggle in the top row, persisted as `mmt-asf-lang`; non-English
>    attempts tagged `lang:ar`/`lang:fa` in `types[]`).
> 3. **Worksheet creator** `worksheet-creators/stage-4/number/adding-subtracting-fractions.html`.
>    Level ladder (same/related/unrelated/mixed spice), add/sub/both, past-1-whole
>    and negative toggles, answer key. "Show the model" prints the two bars in
>    their own units above a number line already cut into the COMMON unit with
>    the start marked (the answer is NOT marked — counting on/back is the work;
>    the count-on arrow hint was removed on teacher feedback); an **Extra hot
>    tier** (value `coprime`) mirrors the quiz's fifth level — coprime pairs
>    <= 10 (model pool capped at product 20 for readable ticks), its own dark-red
>    badge, and Mixed spice now deals a ladder of all FOUR tiers;
>    2×4 per A4 with the model, 3×6 without. **"Fade the model"** scaffolds the
>    first half of the paper and withdraws support in the second half (pages
>    labelled "scaffolded" / "on your own", numbering continuous) — the
>    differentiation option. A **Worksheet language** select (EN / AR / FA,
>    persisted as `mmt-asf-ws-lang`) prints every card instruction, the Answer
>    label and Name/Date bilingually — Arabic or Farsi on top, English beneath —
>    re-rendering the SAME questions on change.
>
> All three are filed under **MA4-FRC-C-01** in `resources/toolLinks.js`, mini
> cards added on the homepage, quiz registered in `mmtToolRegistry.js`
> (masteryTopic `adding-subtracting-fractions`).
>
> **NEW (2026-08-18, session — DEPLOYED, commits `34cbb73` / `9d962b3` /
> `5c9029e`): FRACTION TO PERCENTAGE family, a shared quiz SIGN-IN BANNER, and
> per-kind RESOURCE ICONS.**
>
> 1. **Fraction to Percentage.** The teaching tool
>    (`interactive-tools/stage-4/number/fraction-to-percentage/`, built the night
>    before) now has two siblings —
>    `worksheet-creators/stage-4/number/fraction-to-percentage.html` and
>    `online-quizzes/stage-4/number/fraction-to-percentage.html`. The tool's
>    "Tools ▾" menu holds ONLY those two. All three are filed under
>    **MA4-FRC-C-01** in `resources/toolLinks.js`, so they appear on Resources by
>    Stage → Stage 4 → Fractions, Decimals and Percentages.
>    - *Worksheet:* "Show number line" ON prints the tool's FIRST REVEAL — whole
>      partitioned, fraction marked, shaded distance, blank under the tick — 2×4
>      per A4; OFF is the plain conversion card, 3×6. The tier is re-checked
>      AFTER reducing, so a "Friendly" question can never arrive recurring.
>      Denominators cap at 20 when the model shows, or ticks become unreadable.
>    - *Quiz:* 15 questions, Sweet / Mild / Medium / Spicy (**Spicy = Medium's
>      bank with NO model**). Each model question runs estimate → a HELD beat to
>      read the estimate → placement → one part named (100 ÷ d) → the student
>      counts on. **No unit fractions in any bank** — with the first part
>      revealed, 1/d would BE the answer. Recurring answers accept `66 2/3`,
>      `200/3` or `66.7` and reject `66.6`. One attempt per question, so the
>      score is a true /15; the estimate is never marked.
>
> 2. **Shared quiz login block v2.** The **ten** quizzes carrying
>    `mmtLoginOverlay` now hold a BYTE-IDENTICAL copy. To change it: edit the
>    copy in `online-quizzes/stage-4/number/fraction-to-percentage.html`, then
>    re-apply to the other nine by replacing the span from
>    `<!-- ===== MMT student-code login` to the `</script>` after
>    `window.MMTMode=`. New in v2:
>    - a status chip painted into **`#mmtAuthSlot`** (added beside each quiz's
>      Reset button) — "Signed in as NAME", or "Guest mode" + a Sign in button
>      that reopens the overlay. It sits in the page's own flow so it stays
>      BEHIND the quiz's modals instead of bleeding over them;
>    - `window.MMTAuth { mode, student, name, signedIn, signIn, certTail, shareLine }`;
>    - certificate wording that follows the sign-in state — **Google Classroom is
>      mentioned only when nothing is being saved**. The block rewrites every
>      `.certSub`; a quiz's OWN certificate / clipboard / canvas text calls
>      `MMTAuth.certTail()` or `.shareLine()`.
>    **Firestore rules did NOT need changing** — the live `achievements` block
>    already allows create for the signed-in student, and these write that same
>    shape. Do not re-investigate this.
>
> 3. **Resources by Stage icons.** Uploaded files badge with a TEXT label, so a
>    GLYPH badge now means "this opens a page" and the drawing says which kind:
>    teacher tool (screen + cursor), student quiz (clipboard + tick), worksheet
>    maker (ruled sheet), lesson plan (open book), flip/flash cards, game (die).
>    Edit `KIND_VARIANT` / `KIND_ICON` in `resources/index.html`; a `kind` with
>    no entry falls back to the old globe.
>
> **Bridge gotcha (cost an hour):** a Claude session that dies mid-write leaves
> `.git/index.lock` / `HEAD.lock` behind, and the desktop-bridge shell can only
> `mv`, never delete — so git then refuses every commit with "Another git process
> seems to be running". Check `find .git -name '*.lock'` and clear them in
> Terminal. The bridge also has NO network, so `git push` must be run by hand.
>
> **NEW (2026-08-17, session — being pushed): STAGE 3 MULTIPLICATIVE RELATIONS
> + GEOMETRIC MEASURE.** Two more Stage 3 banks, taking the stage to **6 of 8**
> topics. **Geometric Measure** (18 types) reuses the linear, angle and length
> engines. **Multiplicative Relations** (21 types) needed the one genuinely new
> engine, `engines/array-area/array-area-engine.js`, which draws four things:
> an array, an area model (build it, read it), a factor-rectangle set, and a
> hundred chart with multiples shaded. Twelve of its twenty-one types carry a
> figure, because "use partitioning and place value to multiply" is a claim
> about a picture. Division reuses the SAME rectangle with the quotient
> missing, so the inverse is visible rather than asserted.
> Every Stage 3 bank now has its own harness in `assessment/exam-builder/tools/`
> (`node tools/stage3-<topic>.mjs`) that re-derives every answer independently
> of the bank — the new `stage3-multiplicative.mjs` caught a live defect, where
> `a − b × c` could evaluate negative (Stage 3 has no integers yet); the bank
> now builds the product first and places the start number above it.
>
> **NEW (2026-08-04, session — being pushed): REVISION GENERATOR overhaul +
> Stage 3.** Big session on `assessment/exam-builder/` (the "Revision Generator"
> on the homepage). Three strands:
>
> 1. **Print/layout rules, all universal across the five templates.** Stacked
>    fractions no longer spill into the line above (`--frac-scale` /
>    `--frac-leading` in `hsc-template.css`); diagrams are sized at a CONSTANT
>    SCALE from their own ink so a label is the same physical size in every
>    question (`fitDiagramSvg()`); tables, diagrams and answer rules all align
>    with the prompt text via `--content-indent`; topic bands can never be
>    stranded from their questions; an expression that ends a prompt is set on
>    its own line and is never split; thousands separators are non-breaking.
>    `styles/print.css` now suppresses the "A4 preview" watermark.
> 2. **The worksheet template was rebuilt.** Answer space is a KIND, not a
>    t-shirt size — see `utils/answer-space-rules.js` `resolveAnswerSpace()`:
>    a short answer gets a small inline box, working gets ruled lines sized by
>    marks, and a question answered on its diagram gets nothing. Same paper went
>    from 61 pages to 20. Two columns, like the textbook template.
> 3. **STAGE 3 (Years 5–6) added.** Stages are now DATA (`STAGES` registry in
>    `app.js`) rather than hardcoded pairs, so a new stage is one entry. **Five**
>    banks built so far — Represents Numbers, Additive Relations, Fractions,
>    2D Space and Area, and **Geometric Measure** (18 types: coordinate plane in
>    one and four quadrants, metric length, perimeter, protractor reading, and
>    angles on a straight line / at a point — reusing the linear, angle and
>    length engines, no new engine needed). See
>    `assessment/exam-builder/docs/stage-3-syllabus-reference.md`, which is the
>    source of truth for scope, outcome mapping and the calibration conventions
>    every further Stage 3 bank should follow.
>
> New `assessment/exam-builder/tools/` harnesses (plain `node`, no deps except
> `picker.mjs` which needs jsdom and skips without it), plus `layout-check.html`
> which renders real questions in the browser and measures the boxes.
>
> Last reviewed: 2026-08-18. **All LIVE** — the Adventure now has **14 Stage 4
> topics** (deployed 2026-07-08, commit `aad2142`): the Phase 3A–3G expansion
> (Ratios & Rates, Length, Equations, Probability, Indices, Linear) PLUS Angle
> Relationships (3G), Properties of Geometrical Figures (3H) and Data
> Classification & Visualisation (3I). Also live: schoolyard NPCs now default to
> a RANDOM Stage 4 topic (a teacher task still overrides). `adventureManifest.js`
> lists all 14 topics and matches the live game.
>
> **NEW (2026-07-22, session — deployed): portal UX + teacher-visibility + game
> compass.** (1) **Login readiness on both portals** (`portal/teacher/` +
> `portal/student/`): the Sign in button starts disabled ("Connecting…" + spinner)
> until the page scripts/Firebase SDK load, a progress bar runs through BOTH
> sign-in AND the dashboard data load (no more mid-load flip back to a clickable
> "Sign in"), and a 12s safety net prevents a lockout. (2) **Portal→game sign-in:**
> the student dashboard "Play" link now carries `?code=` so the game auto-signs-in
> (game side rebuilt). (3) **Results & Analytics Topic column** shows the actual
> challenge/mission name for Adventure rows (e.g. "The Round-Up") instead of a
> generic label — display-side, so existing rows are fixed too. (4) **Teacher
> dashboard Refresh button** reloads results/completions and updates an open
> Results / Manage Tasks view in place. (5) **Farm progress now reaches the
> teacher:** the game uploads any farm set finished while signed in, and back-fills
> locally-earned farm trophies on sign-in (see the game repo CLAUDE.md). (6)
> **Task navigation compass** in the Adventure — a top-of-screen arrow to the next
> teacher task (see the game repo CLAUDE.md). Deployed via commits `8fae9af` /
> `9df6990` / `bae6a94`.

> **NEW (being pushed 2026-07-08):** a **Fraction Bar + Number Line** teacher
> interactive tool (`interactive-tools/stage-4/number/fraction-bar-number-line/`)
> with a "Tools ▾" menu, plus two student pages in `online-quizzes/stage-4/number/`:
> the **Fraction Thinking Explorer** (open shuffler) and the **Fractions Number
> Line Quiz** (guided 8-stage progression; file kept as `fraction-thinking-quest.html`).
> The Quiz is **trilingual (EN/AR/FA)** and now **randomises every stage's values**
> each attempt (same learning intention). Both student pages are registered in
> `mmtToolRegistry.js`. See §5.
> Full details: the game repo's CLAUDE.md (per-phase sections + "Schoolyard
> default topics").
> **The Adventure's "Fraction Farm"** (deployed 2026-07-18, commit `0ec63a1`)
> — a THIRD region (large late-afternoon farming world, portal BEHIND the
> island spawn) with in-world fraction challenges, each 15 rounds +
> local-only bests + a trophy stand (trophy.glb): **Fence Challenge**
> (fraction of a length on a locked side-on number-line view, banded points
> + BULLSEYE), **The Round-Up** (f/d/% OF AN AMOUNT — herd cows into a pen;
> herd regroups into equal groups), **Order the Parts** (order f/d/% — swap
> carrots, confetti/reveal), **Crate Packing** (HCF as biggest common group
> size — animated fruit splitting, spill = remainder; host Peck the Bird).
> Also live: portal renames ("Fraction Farm" / "Retrieval Practice
> Playground"), rigged main1.glb player (Space = jump, Shift = run),
> name-only welcome screen (character creator retired).
> **NOT yet deployed (built 2026-07-18, game source): The Milk Splitter** —
> terminating vs recurring decimals: the machine performs the division live
> (digits grow, tank drains; recurring = endless drip loop 🔁), predict
> STOPS/REPEATS then pick the dot-notation jug; host Milkman Pearce + a
> Meshy milk-truck.glb. Needs `npm run build` → copy `dist/.` → push.
> Game-source checks 391 → 425, all passing. Full details: the game repo's
> CLAUDE.md (F1–F8, W7).
>
> **NEW (built 2026-07-22, TEACHER PLATFORM v2 — being deployed):** the Teacher
> Platform (`portal/teacher/index.html`) was redesigned **button-first** (a home
> screen of tiles; every action opens a pop-up window). New capabilities, all
> keeping the secure server-authed model:
> - **Add Student** now supports **bulk** (paste one "First Surname" per line).
> - **Saved classes** — new callables `createClass` / `setClassActive` + a
>   `classes` collection (a teacher reads only their own). Classes now persist
>   (even empty) instead of being derived from students.
> - **Set Dashboard Task** — assign online quizzes to a class with a due date via
>   new callables `createDashboardTask` / `updateDashboardTask` /
>   `setDashboardTaskActive` + a `dashboardAssignments` collection. The **student
>   portal** shows a **task pop-up** on login (+ a "Tasks set by your teacher"
>   section). A task can be a **whole quiz** OR a **custom sub-topic subset**: the
>   portal opens a quiz's existing "Create student quiz link" builder in a pop-up
>   and reads the generated link back (same-origin), storing it site-relative.
>   Only the 4 quizzes with a builder support subsets (integers, angles, fdp,
>   algebraic-techniques).
> - **Set Adventure Task** — reworked into locations (Number Island / Retrieval
>   Practice Playground / **Fraction Farm**). Farm challenges are now assignable
>   (see below). Number Island wording shows Pip = Addition & Subtraction facts,
>   Alby = Multiplication facts, Fern = Division facts (portal display only).
> - **Fraction Farm Adventure tasks** — a farm task = an `adventureAssignments`
>   doc with `location:"farm"` + `challengeId` (the game reads it, shows an
>   in-world objective, and writes a cloud completion tagged with the task id).
>   Needs the game built + pushed. Full game side: the game repo's CLAUDE.md
>   (DONE 2026-07-22 — Fraction Farm teacher tasks).
> - **Rules:** the live rules now include `adventureAssignments`,
>   `dashboardAssignments` AND `classes` blocks (an earlier go-live copy was
>   missing `adventureAssignments` — restored). `firestore.golive.claims.rules`
>   in the website repo matches the live rules.

---

## 1. What this is
A hub-and-spoke website of interactive maths tools for NSW Years 7–10, built by a
NSW maths teacher. It now also has a **secure Student/Teacher Platform** and
**Mills Maths Adventure** (a 3D low-poly maths game), all live.

- **Live site:** https://www.millsmathstools.au (Netlify + custom domain)
- **GitHub repo (the website):** https://github.com/jeffmills2-rgb/mathstools (branch `main`)
- **Firebase project:** `mills-maths-tools` (Blaze plan)

## 2. TWO folders / two projects (important)
1. **`mathstools-main 2/` = THE WEBSITE** (what deploys). Plain static HTML +
   the portal + the *built* Adventure. It is a **git clone of the repo above**;
   Netlify auto-deploys `main` on every push (`netlify.toml` = `publish="."`,
   no build step).
2. **`Mills Maths Adventure/` = THE GAME SOURCE** (Vite + React + R3F + Zustand +
   MathLive). Not uploadable as-is — must be **built**. Also holds the **Cloud
   Functions** (`functions/`).

## 3. Deploy workflows
- **Website change** (HTML tool, quiz, homepage, portal): edit in
  `mathstools-main 2` → `git add -A && git commit -m "…" && git push`. Live in ~1 min.
- **Adventure change:** edit in `Mills Maths Adventure` → `npm run build` → copy
  `dist/.` into `mathstools-main 2/game-platforms/mills-maths-adventure/` → push
  the website. (`vite.config.js` has `base:"./"` so it works in that subfolder.)
- **Cloud Functions change:** edit `Mills Maths Adventure/functions/index.js` →
  `firebase deploy --only functions --project mills-maths-tools`.
- **Firestore rules:** deploy MANUALLY via Firebase Console → Firestore → Rules
  (never from code). Current live rules = `firestore.golive.claims.rules` (kept in
  the website repo for reference).
- Rollback safety branch on GitHub: `backup/pre-portal-…`.

## 4. Security model (the core of the rebuild)
- **No anonymous auth, no client identity reads.** Everyone signs in via the
  **secure code exchange**: Cloud Functions `exchangeStudentCode` /
  `exchangeTeacherCode` validate a typed code server-side and mint a Firebase
  custom token with claims `{ role, studentCode | teacherCode, … }`; clients
  `signInWithCustomToken`.
- **`createStudentForTeacher`** (callable, teacher-authed) creates students
  server-side, stamped with the caller's own `teacherCode`.
- **`setStudentAvatar`** (callable, student-authed) saves the Adventure player's
  customisable avatar to the caller's OWN `students/{code}` doc (code from the
  verified claim). Admin-SDK write (no rules change); avatar is returned by
  `exchangeStudentCode` and applied on sign-in so the character follows the
  student across devices. Cosmetic only — no answers/PII stored.
- **Teacher-set Adventure tasks** (callables `createAdventureTask`,
  `updateAdventureTask`, `setAdventureTaskActive`, all teacher-authed and stamped
  with the caller's own `teacherCode`) write the `adventureAssignments` collection;
  rules let a teacher manage their class's tasks and a student read active tasks
  matching their `teacherCode`+`className` claims. See §6 + the game repo's
  `docs/teacher-adventure-tasks-plan.md`. **Farm tasks (2026-07-22):** the same
  callables also accept a farm shape (`location:"farm"` + `challengeId`, no NPC/
  topic) — the game writes the completion (game repo CLAUDE.md).
- **Saved classes (2026-07-22):** callables `createClass` (idempotent, doc id
  `<TEACHERCODE>__<NAME>`) / `setClassActive`, both teacher-authed and stamped
  with the caller's `teacherCode`, write a `classes` collection. Rules: a teacher
  reads only their own; client writes denied.
- **Dashboard tasks (2026-07-22):** callables `createDashboardTask` (one doc per
  quiz), `updateDashboardTask`, `setDashboardTaskActive`, teacher-authed, write a
  `dashboardAssignments` collection (fields `toolId`, `title`, `launchUrl`,
  `className`, `dueAt`, `active`). Rules mirror `adventureAssignments` (teacher
  reads own; student reads active tasks matching teacherCode+className). The
  `launchUrl` can carry a quiz's `?assignment=1&level=…&types=…` subset params.
- **Live Firestore rules are strict + claim-based:** a student reads only their
  own data; a teacher reads only their own class; results are create-only and
  scoped to the signed-in student; no client identity writes; no result
  edits/deletes; default deny. Identity is managed server-side only.
- **Never store typed student answers in Firebase.** The web API key is public by
  design. The **arcade/flip-card games** use a **different** Firebase project
  (`mmt-firebase-games`) and are out of scope for these rules — BUT **Mills Maths
  Adventure is on `mills-maths-tools`** (it joined the secure ecosystem), so the
  claim-based rules above DO apply to it.
- Functions region: **us-central1**. Test codes: student `8F6AYH`, teacher `MILLS0423`.

## 5. Website structure (`mathstools-main 2`)
```
index.html                         hub / homepage (nav links to portal + Adventure)
portal/                            THE PLATFORM
  student/index.html               Student Platform (results/progress + teacher-set task pop-up)
  teacher/index.html               Teacher Platform — BUTTON-FIRST (v2, 2026-07-22): a tile home
                                   screen → pop-ups for Add Student (single+bulk), Add Class,
                                   Set Dashboard Task (quizzes + sub-topic builder), Set Adventure
                                   Task (island/playground/farm), Students, Results, Manage Tasks
  admin/index.html                 disabled page (admin via Firebase Console)
  shared/ firebaseConfig.js · codeExchangeClient.js · quizClient.js ·
          mmtToolRegistry.js · resultUtils.js · portalStyles.css ·
          adventureManifest.js (Stage-4 topics/NPCs for the Set-task form)
online-quizzes/ , interactive-tools/ , worksheet-creators/ , flip-cards/ , games/
assessment/exam-builder/
assessment/exam-builder/           THE REVISION GENERATOR (homepage calls it that)
  app.js                           UI + the STAGES registry (stage3/4/5) + generation
  question-banks/<topic>/          Stage 4 · stage-5/<topic>/ · stage-3/<topic>/
  engines/<name>/                  18 SVG diagram engines, one file each
  renderers/                       question-renderer (one question) + exam-renderer (the paper)
  templates/<name>/                hsc-style (base) · class-test · revision-package ·
                                   worksheet · textbook-template
  utils/answer-space-rules.js      what answer space a question gets, and why
  docs/stage-3-syllabus-reference.md  Stage 3 scope, outcomes, calibration rules
  tools/verify.mjs                 all banks: schema, diagrams, token leaks
  tools/stages.mjs · stage3*.mjs · picker.mjs   targeted harnesses (see the header block)
  layout-check.html                renders real questions in-browser and measures them
game-platforms/mills-maths-adventure/   the BUILT Adventure (index.html + assets/)
dashboards/                        OLD dashboards → now redirect stubs to /portal/*
firestore.golive.claims.rules      the live security rules (reference copy)
portal/PLACEMENT.md , portal/README.md   migration + structure notes
```
- **Tool registry** (`portal/shared/mmtToolRegistry.js`) declares which tools feed
  the platform — add/disable entries here; nothing else hardcodes a tool. Each
  entry's `achievementToolName` must match the EXACT `tool` string the quiz writes.
- All Firebase quizzes were migrated to the secure exchange (via `quizClient.js`
  or inline). The decimal-zoom rounding quiz was converted from a public
  leaderboard to a secure achievements quiz.
- **Fraction to Percentage family (2026-08-18):** teacher tool
  `interactive-tools/stage-4/number/fraction-to-percentage/` (double number line,
  fraction above / percentage below, step reveals, predict mode) +
  `worksheet-creators/stage-4/number/fraction-to-percentage.html` +
  `online-quizzes/stage-4/number/fraction-to-percentage.html` (registered in
  `mmtToolRegistry.js` as `fraction-to-percentage-student-quiz`). See the
  2026-08-18 header block.
- **Fraction Bar + Number Line family (2026-07-08):**
  - **Teacher tool** `interactive-tools/stage-4/number/fraction-bar-number-line/index.html`
    — self-contained (inline CSS/JS): a fraction shown as a part-whole bar, a
    point/decimal on a (double) number line, and as division (Animate). Denominator
    2–100, Bar/Number-Line/Decimal/Simplify toggles, smooth zoom-out, drag the
    point, arrow-key nudge. Has a **"Tools ▾"** menu → **Student Quiz** link.
  - **Student pages** in `online-quizzes/stage-4/number/`, both registered in
    `mmtToolRegistry.js` and using the secure `MMTQuiz` save (dynamic import → work
    offline; **no typed answers stored**, only structured `types[]` flags):
    - `fraction-thinking-explorer.html` — open "Explore + shuffler" (superseded for
      classroom use by the Quiz; kept enabled).
    - `fraction-thinking-quest.html` — **"Fractions Number Line Quiz"** (title/registry
      renamed; filename kept). Guided **8-stage** progression
      (understand→equivalence→density→recurring→division→improper→compare→convince),
      **trilingual EN/AR/FA** (selected language on top, English beneath; number line
      stays LTR/Western numerals), part-b checkable inputs + reasoning chips stored as
      `types[]` tags. **Every stage randomises its values per attempt** via per-stage
      `gen()` functions cached in `P` (`{token}` templates filled by `fill()`); same
      learning intention each time, cleared on reset. `score/total` = stages completed.
    - Tested headlessly (jsdom): all 8 stages generate valid params in all 3 langs,
      no leftover `{tokens}`, satisfiable across 200 random trials.
    - TODO: AR/FA strings want a fluent proofread; hub cards for the student pages;
      teacher portal export of the `types[]` reasoning tags.

## 6. Mills Maths Adventure (game source repo)
- Vite + React + R3F. `src/` (game), `functions/` (Cloud Functions),
  `portal/` (a DEV copy used only by the automated checks — the **website**
  `portal/` is the deployed one).
- **Dev panel** shows only in `npm run dev` (hidden in the production build).
- Defaults: **Camera Lock ON, Quest HUD OFF**.
- **391 headless system checks** in `src/dev/systemChecks.js` — run via the babel
  parse-check + Node harness (set `package.json` `type:module` temporarily, shim
  localStorage/window/document, run `runSystemChecks()`; restore package.json).
  esbuild can't run in that harness (platform mismatch) — don't rely on it.
- **Player avatar cloud-save (W3):** customisable "shape" avatar saved to the
  student's `students/{code}` doc via `setStudentAvatar` (follows them across
  devices). **Touch controls (W4):** tap-to-move / tap-to-interact / on-screen
  keypad, ⚙-toggled. **Soft-cartoon graphics (W5):** ⚙ **Graphics** High/Low
  (auto-low on touch) — lighting/AO/bloom/outlines/wind-grass; needs the
  `@react-three/postprocessing` dep (`npm install` before build). **World redesign
  (W6):** bigger irregular island, square plaza, snow/ash themed zones, grove→
  SchoolYard portal. FPV toggle is PARKED (not working). Full where-everything-
  lives: the game repo's `CLAUDE.md` (W3–W6 sections).
- Cloud save: completed attempts write a compact `achievements` record + a rich
  `adventureAttempts` record (no typed answers). Demo/skip stays local-only.
  Curriculum/adapters/diagram systems are isolated — only adapters touch legacy banks.
- **Teacher-set tasks (Phases 1–2, built 2026-07-01):** teachers assign tasks from
  the Teacher Platform; students get them roster-pushed by class, delivered by the
  chosen NPC (Pip/Fern/Alby, off-theme allowed). New `adventureAssignments`
  collection + functions (§4). Game side: `cloudSession.loadAssignments()` →
  runtime missions + NPC chain overlay (teacher steps prepended so they show even
  for a finished student). Completion is tagged with `taskId` and surfaced in the
  teacher portal (per-task Done count + View breakdown, and a "Teacher task" badge
  per student). Full design/where-everything-lives:
  `Mills Maths Adventure/docs/teacher-adventure-tasks-plan.md`.

## 7. Working agreement with Claude
- **Test before deploying** where practical: website pages via a local server
  (`python3 -m http.server` from `mathstools-main 2`, open the page); bigger
  changes via a branch + Netlify deploy preview.
- Keep the secure-exchange model; never re-open anonymous writes or client
  identity writes; never store typed answers; don't weaken the live rules without
  a clear reason.
- Match existing design tokens / folder casing (lowercase-hyphenated).
- When a change spans both repos (e.g. a teacher feature + a function), deploy the
  **function first**, then push the website.

## 8. Open / future items
- **Student-quiz sign-in sweep:** 11 of 26 quizzes carry the v2 login block
  (adding-subtracting-fractions joined 2026-08-20).
  The other **15** still have bespoke inline sign-in and their own completion
  screens (9 of those have no `.certSub` at all) — extend the v2 block to them
  when convenient. Within the ten, `collecting-like-terms` and `factor-circles`
  have no `.certSub` (they end with a copy-a-message panel), so only the chip
  changed there; their "paste into Google Classroom" copy tips are about a
  celebration message, not a result, and were left alone (the trilingual one
  has AR/FA translations of that string too).
- **Revision Generator — Stage 3**: 6 of 8 topics built (Represents Numbers,
  Additive Relations, Multiplicative Relations, Fractions, 2D Space and Area,
  Geometric Measure). Each remaining topic needs a new diagram engine first:
  **3D Space and Volume** (nets) and **Mass and Time** (analog clock). Data and
  Chance are deliberately deferred. Geometric Measure shipped WITHOUT its
  optional grid-map engine — the syllabus's grid-reference-vs-coordinate
  distinction is asked in prose for now; a grid-map engine would improve it.
  Scope, outcome mapping and the calibration conventions are in
  `assessment/exam-builder/docs/stage-3-syllabus-reference.md` — read it before
  writing a bank, and add the new conventions it records to any new one.
- Revision Generator — smaller follow-ups: right-align the worksheet answer
  boxes into a consistent column for faster marking (trade-off: short prompts
  wrap awkwardly around them); page numbers need Chrome's own print
  header/footer since CSS cannot generate them; the protractor and thermometer
  diagrams still carry more whitespace than they need.
- Adventure: **interactive plot-a-point input mode** (student taps the
  Cartesian grid — flagged during the Linear Relationships build); **Stage 5
  depth** (still just 2 sample skills); **Area extension** as a further Stage 4
  topic. (The 14 Stage 4 topics — through Angles, Geometry and Data — are all
  LIVE; see the game repo's Phase 3A–3J sections.)
- Consider a **DevPanel diagram/chart gallery** to eyeball every new figure at
  once, and a live-review polish pass on the newest diagrams (protractor,
  geometry shapes, data charts).
- Teacher portal: revisit **graphs** (engagement/leaderboard — removed for now),
  add student **enable/disable/edit**. (Adventure-TASK create/edit/remove +
  completion view, **saved classes**, **dashboard/quiz tasks + sub-topic builder**
  and **farm Adventure tasks** are now DONE — see the 2026-07-22 header block, §4.)
  Follow-ups: subset builders for the other quizzes; a systemChecks farm-task
  check; a class rename/merge view.
- Adventure tasks — future polish: per-skill selection in the Set-task form (only
  topic-level today — now 14 Stage 4 topics), in-game due-date
  display/overdue handling, more stages/NPCs.
- Functions runtime: bump **Node 20 → 22** before Oct 2026 (Google deprecation).
- Consider **App Check**; consider consolidating the 3 Firebase projects later.
- Old pre-reorg URLs (e.g. `/factor-circles/`) now 404 — add redirects if any were
  widely shared.

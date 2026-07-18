# Mills Maths Tools — Project Brief

> Hand this file to Claude at the start of any chat to get up to speed without
> re-uploading everything. Keep it short, current, high-signal. If a fact here
> stops being true, fix it here first.
> Last reviewed: 2026-07-08. **All LIVE** — the Adventure now has **14 Stage 4
> topics** (deployed 2026-07-08, commit `aad2142`): the Phase 3A–3G expansion
> (Ratios & Rates, Length, Equations, Probability, Indices, Linear) PLUS Angle
> Relationships (3G), Properties of Geometrical Figures (3H) and Data
> Classification & Visualisation (3I). Also live: schoolyard NPCs now default to
> a RANDOM Stage 4 topic (a teacher task still overrides). `adventureManifest.js`
> lists all 14 topics and matches the live game.
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
> **NEW (being pushed 2026-07-18): the Adventure's "Fraction Farm"** — a THIRD
> region (large late-afternoon farming world, portal BEHIND the island spawn)
> with FOUR in-world fraction challenges, each 15 rounds + local-only bests +
> a trophy stand (trophy.glb): **Fence Challenge** (fraction of a length on a
> locked side-on number-line view, banded points + BULLSEYE), **The Round-Up**
> (f/d/% OF AN AMOUNT — herd cows into a pen; herd regroups into equal
> groups), **Order the Parts** (order f/d/% — swap carrots, confetti/reveal),
> **Crate Packing** (HCF as biggest common group size — animated fruit
> splitting, spill = remainder). Also: island + schoolyard renamed on portals
> ("Fraction Farm" / "Retrieval Practice Playground"), the player is now a
> rigged main1.glb (Space = jump, Shift = run), and the welcome screen is
> name-only (character creator retired). Game-source checks 391 → 420, all
> passing. Full details: the game repo's CLAUDE.md (F1–F7, W7).

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
  `docs/teacher-adventure-tasks-plan.md`.
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
  student/index.html               Student Platform (own results/progress)
  teacher/index.html               Teacher Platform (class results, roster, Add-student,
                                   Set Adventure task: create/edit/remove + completion view)
  admin/index.html                 disabled page (admin via Firebase Console)
  shared/ firebaseConfig.js · codeExchangeClient.js · quizClient.js ·
          mmtToolRegistry.js · resultUtils.js · portalStyles.css ·
          adventureManifest.js (Stage-4 topics/NPCs for the Set-task form)
online-quizzes/ , interactive-tools/ , worksheet-creators/ , flip-cards/ , games/
assessment/exam-builder/
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
- Adventure: **interactive plot-a-point input mode** (student taps the
  Cartesian grid — flagged during the Linear Relationships build); **Stage 5
  depth** (still just 2 sample skills); **Area extension** as a further Stage 4
  topic. (The 14 Stage 4 topics — through Angles, Geometry and Data — are all
  LIVE; see the game repo's Phase 3A–3J sections.)
- Consider a **DevPanel diagram/chart gallery** to eyeball every new figure at
  once, and a live-review polish pass on the newest diagrams (protractor,
  geometry shapes, data charts).
- Teacher portal: revisit **graphs** (engagement/leaderboard — removed for now),
  add student **enable/disable/edit** + a class-management view. (Adventure-TASK
  create/edit/remove + completion view are now DONE — see §6.)
- Adventure tasks — future polish: per-skill selection in the Set-task form (only
  topic-level today — now 14 Stage 4 topics), in-game due-date
  display/overdue handling, more stages/NPCs.
- Functions runtime: bump **Node 20 → 22** before Oct 2026 (Google deprecation).
- Consider **App Check**; consider consolidating the 3 Firebase projects later.
- Old pre-reorg URLs (e.g. `/factor-circles/`) now 404 — add redirects if any were
  widely shared.

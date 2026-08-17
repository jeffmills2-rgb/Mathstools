# Phase 4A — MMT Platform Rebuild (Student + Teacher)

A clean replacement for the patched dashboards, built around secure code exchange
and designed to be the central place all MMT tools/quizzes feed results into.
Standalone static site in `portal/` (no build step) — easy to host on GitHub
Pages and upload to the MMT website repo.

**Not in this phase:** task assignment, class topic settings, required mission
queue, broad-practice settings, teacher-created missions, public admin writes,
any rules deployment, any data migration.

## New folder structure
```
portal/
  student/index.html    Student Platform
  teacher/index.html    Teacher Platform
  admin/index.html      Admin disabled page
  shared/
    firebaseConfig.js
    codeExchangeClient.js
    mmtToolRegistry.js
    resultUtils.js
    portalStyles.css
  README.md
```
The old `/portals/*.html` (Phase 3D.1) stay as references; the quiz template there
(`algebraic-techniques.html`) is still canonical. Mills Maths Adventure (repo
root) is unchanged.

## How code exchange works
Student/teacher enters a code → `exchangeStudentCode` / `exchangeTeacherCode`
(deployed, `us-central1`) validates server-side and returns `{token, profile,
claims}` → `signInWithCustomToken(token)` → claim-based rules scope all reads to
the owner. No anonymous auth; no `students/{code}` read before login. All of this
lives in `portal/shared/codeExchangeClient.js` (`loginStudent`, `loginTeacher`,
`logout`, session in `localStorage` for UI hydrate).

## Student Platform
- Code login (+ optional PIN, prompted only if the server requires it).
- Profile card (class / teacher / school).
- Summary cards: attempts, average %, best %, total XP.
- Mills Maths Adventure section (compact attempts, with `missionKind`).
- All-results table with tool / topic / date filters.
- Copy summary + print, sign out / change code, friendly empty states.
- Reads **only** the signed-in student's own `achievements`. No class leaderboard
  (denied under claim rules).

## Teacher Platform
- Code login → teacher profile card.
- Filters: class, student search, tool, topic, date.
- Summary cards: students, attempts, average %, needing support (avg < 50%).
- Student rollup table (attempts, best, average, last active, support flag).
- Results table (student, class, tool, topic, type, score, %, date).
- CSV export + copy summary.
- Per-student detail modal with their results **and** rich `adventureAttempts`
  details when available.
- Queries are teacher-scoped: `students where teacherCode == claim`,
  `achievements where teacherCode == claim`, `adventureAttempts where teacherCode
  == claim`.

## Adventure attempt support
The teacher detail modal shows, per Adventure attempt: `missionTitle`,
`missionKind`, score/percent/pass, topic summary, and per-question correctness
(✓/✗) — **no typed answers** (the app never stores them). The
`adventureAttempts` query is **best-effort**: wrapped in try/catch, and if it is
unavailable or denied the platform shows a note and continues from compact
`achievements`. A missing rich attempt never breaks the dashboard.

## Admin Console decision
`portal/admin/index.html` is an **explicit disabled page**: a banner ("Admin
identity management is temporarily disabled… use Firebase Console"), a summary of
what a future secure admin tool will do, and no write actions. No admin secret in
client code; anonymous writes not enabled.

## Tool registry
`portal/shared/mmtToolRegistry.js` is the single source of which tools feed the
platform. Includes Mills Maths Adventure (rich `adventureAttempts`) + Algebraic
Techniques (enabled) and disabled placeholders for Integers / FDP / Area /
Pythagoras. Flip `enabled` / add an entry to control the platform's tool filters
and result grouping. See `portal/README.md`.

## How Mills Maths Adventure feeds the platform
Unchanged: on a completed attempt the app writes a compact `achievements` record
(studentCode/studentName/teacherCode/teacherName/school/tool="Mills Maths
Adventure"/topic/score/total/xpEarned) and a rich `adventureAttempts` record (no
typed answers). The Student Platform surfaces the compact records in its Adventure
section; the Teacher Platform surfaces compact records in tables + rich attempts
in the student modal.

## How existing quizzes feed the platform
Via compact `achievements` writes using the secure pattern in
`docs/quiz-migration-guide.md`. Register each quiz in `mmtToolRegistry.js` so it
shows in the filters. The canonical migrated quiz is
`portals/algebraic-techniques.html`.

## Rules-draft changes
**None.** The platform's queries already fit `firestore.phase3d.claims.rules`
(student own-reads; teacher teacherCode-scoped reads incl. `adventureAttempts`;
no identity writes; results create-only, no update/delete; default deny). The two
intentional gaps (student class leaderboard; teacher legacy IN queries) are
handled on the client, not by loosening rules.

## What still needs migration
The Integers / FDP / Area / Pythagoras quiz pages (and any other Firebase quiz on
the old anonymous pattern) — migrate with the guide before deploying strict rules.
Old `/portals` dashboards are superseded by `portal/`.

## What must be tested before deploying strict rules
1. Student Platform: real code signs in, loads own results; PIN student prompted;
   bad/inactive rejected.
2. Teacher Platform: real teacher code loads students + results; CSV/copy work;
   student modal opens; Adventure rich panel shows (or degrades gracefully).
3. Mills Maths Adventure: sign-in + a saved mission appears in both platforms.
4. Rules Playground: run the 3D checklist.
5. Only then deploy `firestore.phase3d.claims.rules` manually.

## ⚠️ Do not deploy the strict Firestore rules yet
Live rules are still open. Deploy the Phase 3D claim rules only after the platform
+ all Firebase quizzes are tested live — deploying earlier locks out anything not
yet on the exchange.

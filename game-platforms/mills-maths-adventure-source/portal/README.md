# MMT Platform (`portal/`)

A clean, static, secure replacement for the old Student/Teacher dashboards
(Phase 4A). Built around the deployed code-exchange Cloud Functions + custom-token
sign-in, designed to be compatible with the Phase 3D claim-based Firestore rules.

No build step — plain HTML + ES modules + the Firebase SDK from gstatic. Drop the
`portal/` folder onto GitHub Pages / any static host.

## Structure
```
portal/
  student/index.html      Student Platform (own results + progress)
  teacher/index.html      Teacher Platform (class results + reporting)
  admin/index.html        Admin disabled page (manage in Firebase Console)
  shared/
    firebaseConfig.js     Public config, SDK version, collections, fn names
    codeExchangeClient.js  Secure auth: exchange*, signInWithCustomToken, session, signout
    mmtToolRegistry.js    Which tools/quizzes feed the platform (enable/disable here)
    resultUtils.js        Pure helpers: normalise records, summaries, CSV, copy text
    portalStyles.css      Shared MMT styling
  README.md
```

## How sign-in works (both platforms)
1. User enters their **student/teacher code** (no other identity typed).
2. The page calls the deployed Cloud Function `exchangeStudentCode` /
   `exchangeTeacherCode` (in `us-central1`). The server validates the code
   (and PIN/active) and mints a **custom token**.
3. The page calls `signInWithCustomToken`. From here the user is a real
   authenticated identity carrying `{role, studentCode|teacherCode, ...}` claims.
4. All Firestore reads are **claim-scoped**: students read only their own
   `achievements`; teachers read only their own `students` / `achievements` /
   `adventureAttempts` (filtered by `teacherCode`).

There is **no anonymous sign-in** and **no `students/{code}` read before login**.

## Student Platform
Profile card (class/teacher/school), summary cards (attempts, average, best, XP),
a Mills Maths Adventure section, an "all results" table with tool/topic/date
filters, copy-summary + print, sign out. Reads only the signed-in student's own
`achievements`. No class leaderboard (denied under claim rules).

## Teacher Platform
Profile card, filters (class / search / tool / topic / date), summary cards
(students, attempts, average, needing support), a student rollup table, a results
table, CSV export, copy summary, and a per-student detail modal. It also tries to
load **rich `adventureAttempts`** (teacher-scoped) for the detail panel — and if
that query is unavailable/denied it shows a note and keeps working from compact
`achievements`.

## Tool registry — add a quiz/tool later
Open `shared/mmtToolRegistry.js` and add an entry (or flip `enabled`). Each tool
declares `toolId`, `title`, `category`, `enabled`, `resultCollection`,
`richCollection`, `achievementToolName`, `topics`, `stage`, `launchUrl`,
`supportsAdventureAttempts`, `supportsSkillBreakdown`, `notes`. The platforms
build their tool filters and result grouping from this registry — nothing else
hardcodes a single tool. A record is matched to a tool by its `tool` field
(`achievementToolName`).

## What still uses the old files
- The previous `/portals/*.html` (migrated in Phase 3D.1) remain as references;
  this `portal/` platform supersedes the dashboards. The migrated **quiz**
  `portals/algebraic-techniques.html` is still the canonical quiz template.
- Mills Maths Adventure (the app at repo root) is unchanged and already feeds the
  platform via compact `achievements` + rich `adventureAttempts`.

## Deploy / hosting
Upload the `portal/` folder. The pages live at `…/portal/student/`,
`…/portal/teacher/`, `…/portal/admin/`. They need the Cloud Functions deployed
(done) and will fully lock down once the Phase 3D rules are deployed.

## ⚠️ Do not deploy the strict Firestore rules until this platform is live-tested
The live rules are still open. Test the platforms end-to-end first (see
`docs/phase-4a-platform-rebuild.md`), then deploy `firestore.phase3d.claims.rules`
manually.

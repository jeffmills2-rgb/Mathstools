# Phase 3D.1 — Portal + Quiz Migration to Secure Code Exchange

Migrates the external MMT portals + the quiz pattern from anonymous auth +
direct `students/{code}` / `teachers/{code}` reads to the **secure code-exchange**
flow (Cloud Functions custom tokens), so the Phase 3D claim-based rules can later
be deployed without breaking them.

**Live status (confirmed by you):** Blaze active; `exchangeStudentCode` /
`exchangeTeacherCode` deployed in `us-central1`; the runtime service account has
`iam.serviceAccounts.signBlob`; Mills Maths Adventure sign-in works and wrote a
compact `achievements` record. **Firestore rules are still the open rules — do
NOT deploy the claim rules until the migrated portals/quizzes are tested live.**

Migrated files live in **`/portals`** (standalone HTML; copy back over your hosted
pages after testing). The migration markers are pinned in
`src/cloud/portalMigration.js` and verified by `runPortalMigrationChecks` + the
headless harness (which greps the real files).

## The common pattern
```js
import { getFunctions, httpsCallable } from ".../firebase-functions.js";
import { signInWithCustomToken } from ".../firebase-auth.js";   // not signInAnonymously
// connect: init app/auth/db/functions only — NO sign-in
const call = httpsCallable(functions, "exchangeStudentCode");   // or exchangeTeacherCode
const { data } = await call({ studentCode: code, pin });        // server validates
await signInWithCustomToken(auth, data.token);                  // identity = custom token
const profile = data.profile;                                   // safe profile from server
```

## Student Dashboard (`portals/student-dashboard.html`)
- Imports `getFunctions/httpsCallable` + `signInWithCustomToken`; **removed
  `signInAnonymously`**.
- `initFirebase` now only initialises handles (no sign-in).
- New `exchangeStudentCode(code)` calls the function (passing the optional PIN),
  signs in with the custom token, returns the safe profile. The PIN field is
  shown when the server reports a PIN is required/incorrect.
- Achievements load via `where('studentCode','==', currentStudent.studentCode)`
  while signed in — allowed by the claim rules.
- **Class leaderboard removed** (`where('className', …)` is denied under 3D).
  `loadClassLeaderboard()` is now a no-op. Profile card, XP, badges, progress,
  certificates, history, and Adventure compact achievements are unchanged.

## Teacher Dashboard (`portals/teacher-dashboard.html`)
- Imports the Functions SDK + `signInWithCustomToken`; **removed
  `signInAnonymously`**.
- `initFirebase` initialises handles only; `loginTeacher` now calls
  `exchangeTeacherCode` + `signInWithCustomToken` (no direct `teachers/{code}`
  read).
- Student list stays `where('teacherCode','==', currentTeacher.teacherCode)` and
  achievements stay `where('teacherCode','==', …)` — both allowed by the teacher
  claim (the filter is what makes the list rule-legal).
- The legacy `studentCode in […]` / `code in […]` recovery queries are now
  **best-effort only** (kept in try/catch; they are not teacher-scoped and will
  be denied under 3D — modern records carry `teacherCode`; legacy ones need a
  one-off backfill later).
- **Client student-management writes disabled**: `createTeacherStudent` now
  throws a friendly "use the Firebase Console" error (identity writes are
  server-side only). Filters, results table, CSV export, copy summary, and the
  student profile modal still work on teacher-scoped data.

## Quiz template (`portals/algebraic-techniques.html` — canonical)
- Imports the Functions SDK + `signInWithCustomToken`; **removed
  `signInAnonymously`** and the direct `getDoc(students/{code})`.
- Code entry → `exchangeStudentCode` → custom-token sign-in → uses the returned
  profile. The compact `addDoc('achievements', …)` save is unchanged (XP fields,
  certificate text, assignment-link mode preserved) and runs as the signed-in
  student, so the create rule allows it.
- **Skip/demo unchanged**: no sign-in, `saveAchievement` still no-ops unless
  `mode === 'registered'`.
- This is the template — apply the same five-step recipe to the other quizzes
  (see "Pending migration").

## Admin Console (`portals/admin-console.html`)
- **Intentionally read-only.** Added a prominent warning banner ("Admin identity
  writes are disabled under the secure rules model — use the Firebase Console").
- All mutating controls (create teacher/student, bulk add/assign/disable/
  reactivate/delete, edit-save) are disabled, and create/edit/toggle/delete
  clicks + form submits are intercepted with the warning.
- No admin secret added to client code; anonymous writes are **not** re-opened.
  Admin identity management happens in the Firebase Console until an admin-auth
  Cloud Function phase is built.

## Mills Maths Adventure
Already migrated in Phase 3D and confirmed live: cloud sign-in uses
`exchangeStudentCode`; demo/skip stays local; compact `achievements` + rich
`adventureAttempts` write; story attempts tag `missionKind:"story"`; typed
answers stripped; local save first; cloud failure never blocks completion. No
changes needed in 3D.1 (re-verified by checks).

## Phase 3D rules-draft changes
**None required.** The migrated client queries already match the existing
`firestore.phase3d.claims.rules` (student own-reads/creates; teacher
teacherCode-scoped reads; no identity writes; no result update/delete). The two
intentional gaps (student class leaderboard; teacher legacy IN queries) are
handled on the client (disabled / best-effort), not by loosening the rules.

## Pending migration (other quizzes)
The canonical template is `algebraic-techniques.html`. Apply the same recipe to
the remaining Firebase-enabled quizzes still on `signInAnonymously` +
`getDoc(students/{code})`: the Integers, FDP, Area, and Pythagoras quiz pages and
any other quiz HTML. Until each is migrated, that quiz's anonymous writes will be
**denied** once the 3D rules are deployed — migrate them (or stage the rollout)
first. (Tracked in `QUIZZES_PENDING_MIGRATION` in `src/cloud/portalMigration.js`.)

## What must be tested live before deploying rules
1. Student Dashboard: real code → loads own achievements; PIN student prompted;
   bad/inactive code rejected; (leaderboard absent).
2. Teacher Dashboard: real teacher code → student list + results load; CSV/copy
   work; add-student shows the disabled message.
3. Migrated quiz: real code saves a compact achievement; skip saves nothing.
4. Admin Console: banner shows; create/edit/delete blocked.
5. Mills Maths Adventure: sign-in + a saved mission (already confirmed).
6. Only then: test `firestore.phase3d.claims.rules` in the Rules Playground and
   deploy manually.

## ⚠️ Do not deploy the Firestore rules yet
The live rules are still open. Deploy the Phase 3D claim rules **only after** all
hosted portals + every Firebase-enabled quiz are updated to the exchange and
tested live. Deploying earlier will break any page still on anonymous auth.

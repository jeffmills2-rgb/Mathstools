# Phase 3D — Secure Code Exchange + Portal Compatibility

**Goal:** make the Student Dashboard, Teacher Dashboard and Mills Maths Adventure
work under SAFE, claim-based Firestore rules by introducing a Cloud Functions
code-exchange layer. **Not** task assignment, broad-practice, or portal redesign.

**Nothing is deployed from this repo.** Cloud Functions and rules are deployed
manually (steps at the end).

> **Phase 3D.1 follow-up:** the external portals + the quiz template have now been
> migrated to this exchange — see `docs/phase-3d1-portal-quiz-migration.md` and the
> migrated files in `/portals`. The patch plans below are realised there.

## Why this phase exists
- Open rules (`allow read, write: if true`) expose all student/teacher PII and
  let anyone forge/delete data.
- Phase 3C's compatibility rules are safer but **break the Teacher Dashboard
  student list and the Admin Console** because the client can't prove who it is.
- A typed `studentCode`/`teacherCode` is a **shared secret, not identity** —
  Firestore rules only see `request.auth`. To scope access we must turn a valid
  code into a real authenticated identity. That is what the exchange does.

## How the exchange works
```
Student types code → callable exchangeStudentCode(studentCode, pin?)
  → Function reads students/{code} with the Admin SDK (bypasses rules)
  → rejects missing / inactive / bad PIN
  → mints a custom token uid "student:CODE" with claims {role,studentCode,teacherCode,className,school}
  → returns { token, profile, claims }
Client → signInWithCustomToken(token) → now request.auth.token.role === "student"
  → claim-based rules scope every read/write to that student.
```
Teacher flow is identical with `exchangeTeacherCode(teacherCode)` →
`{role,teacherCode,school}`.

The validation + claim/profile logic is shared:
- **Server:** `functions/index.js` (`exchangeStudentCode`, `exchangeTeacherCode`).
- **Pure mirror (unit-tested):** `src/cloud/codeExchange.js`
  (`validateStudentForExchange`, `buildStudentClaims`, `buildSafeStudentProfile`,
  teacher equivalents). Keep them in sync.

## Claims issued (kept minimal — no extra PII)
- Student: `{ role:"student", studentCode, teacherCode, className, school }`
- Teacher: `{ role:"teacher", teacherCode, school }`
(No name/PIN in claims.)

## What changed in Mills Maths Adventure (this repo)
- `src/cloud/codeExchange.js` — **new** pure shared logic + function names.
- `functions/` — **new** Cloud Functions package (`package.json`, `index.js`).
- `src/cloud/firebaseClient.js` — now loads the Functions SDK, calls
  `exchangeStudentCode`, and `signInWithCustomToken`. **It no longer reads
  `students/{code}` directly.** Anonymous sign-in removed (identity = custom
  token). Added `signOutCloud`.
- `src/cloud/cloudSession.js` — `registerWithCode(code, pin?)` now uses the
  exchange; `clearSession()` signs out.
- Everything else (skip/demo, local-first, dual-save, story tagging, answer
  stripping, completion statuses) is unchanged. The result writers run while
  signed in as the student, so the claim rules permit create.

**Important:** after this change, MMA cloud sign-in needs the deployed
`exchangeStudentCode` function. Until you deploy it, **demo/skip + all local play
still work** — only online sign-in is unavailable.

## Student Dashboard (standalone HTML — patch plan)
The dashboard is outside this repo, so here is the exact migration (small):
1. Add the Functions SDK import: `import { getFunctions, httpsCallable } from ".../firebase-functions.js"` and `import { signInWithCustomToken } from ".../firebase-auth.js"`.
2. Replace the login `getDoc(students/{code})` with:
   ```js
   const call = httpsCallable(getFunctions(app), "exchangeStudentCode");
   const { data } = await call({ studentCode: code, pin: pinInput.value || undefined });
   await signInWithCustomToken(auth, data.token);
   currentStudent = data.profile;   // name/class/teacher from the function
   ```
   (Remove the client-side `active`/PIN checks — the function does them.)
3. Keep the achievements query `where('studentCode','==', currentStudent.studentCode)`
   — now allowed because the claim's `studentCode` matches.
4. **Remove the class-leaderboard query** (`where('className','==',…)`) — it is
   denied under 3D (not own studentCode, not teacher). Hide that section or move
   it behind a future teacher/Function path.
XP/badges/certificates/Adventure compact achievements all keep working (they're
derived from the student's own `achievements`, incl. `tool:"Mills Maths Adventure"`).

## Teacher Dashboard (standalone HTML — patch plan)
1. Add Functions SDK + `signInWithCustomToken` imports.
2. Replace login `getDoc(teachers/{code})` with:
   ```js
   const call = httpsCallable(getFunctions(app), "exchangeTeacherCode");
   const { data } = await call({ teacherCode: code });
   await signInWithCustomToken(auth, data.token);
   currentTeacher = data.profile;
   ```
3. Keep the **student list** query exactly as `where('teacherCode','==', currentTeacher.teacherCode)`
   — now allowed because the claim's `teacherCode` matches the per-doc read rule
   (the query filter is what makes the list legal).
4. Keep achievements queries `where('teacherCode','==', …)`. The legacy
   `studentCode in […]` / `code in […]` recovery queries **may fail** under 3D
   (those docs lack `teacherCode`); wrap them in try/catch and treat as
   best-effort, or backfill `teacherCode` later (not this phase).
5. **Disable the manage-student writes** (`setDoc(students/…)`) — identity writes
   are server-side only now. Show a "managed in admin" note.
Filters, CSV export, copy summary, student profile modal keep working (they
operate on already-loaded, teacher-scoped data).

## Admin Console
**Intentionally deferred / locked down.** Under 3D, identity writes are
server-side only, so the Admin Console can no longer create/edit/disable/delete
students or teachers from the client. **Do admin changes in the Firebase
Console** for now. A future phase can add admin-only callable Functions behind a
real admin auth mechanism (do NOT put an admin secret in client code; do NOT
re-open anonymous admin writes). The console should show a clear "writes disabled
— use Firebase Console / admin tools" notice.

## Existing Firebase quiz (e.g. `algebraic-techniques.html`) — migration note
Same student migration as the dashboard:
- Replace anonymous sign-in + `getDoc(students/{code})` with
  `exchangeStudentCode` + `signInWithCustomToken`.
- Keep `addDoc('achievements', …)` — now allowed because the create rule checks
  `studentCode == request.auth.token.studentCode`. Ensure the payload's
  `studentCode` equals the signed-in student's code (it already does — it comes
  from the returned profile).
- Skip/demo stays local (no sign-in → no writes).
Until each quiz is migrated, it will **fail to save** under 3D rules (its
anonymous writes are denied). Migrate quizzes before enforcing 3D, or stage the
rollout.

## Manual deployment steps (you perform these)
1. `cd functions && npm install`.
2. Ensure the Blaze project is selected: `firebase use mills-maths-tools`.
3. Deploy functions: `firebase deploy --only functions`
   (creates `exchangeStudentCode`, `exchangeTeacherCode`).
4. Test the functions (emulator or live) with a known code → expect `{token,profile,claims}`;
   bad/inactive code → HttpsError.
5. Migrate at least one quiz + the dashboards + confirm MMA sign-in works against
   the deployed functions.
6. In the **Rules Playground**, test `firestore.phase3d.claims.rules` (see
   `docs/firestore-phase3d-claims-rules.md`).
7. Deploy rules **only after** functions + clients are migrated:
   `firebase deploy --only firestore:rules` (after pointing `firestore.rules` at
   the 3D file, or pasting it in the console).
8. Enable **App Check** + restrict **Authorized domains**.

## What still needs securing later
- Backfill `teacherCode` onto legacy `achievements` (so teachers see history).
- Replace the Student Dashboard class leaderboard with a teacher/Function path.
- Admin-auth Functions for identity management.
- Token lifetime/refresh UX (custom tokens → ID tokens auto-refresh; re-exchange
  on a new session).

## ⚠️ Do not deploy blindly
- Don't deploy 3D **rules** before the **functions** are live and clients are
  migrated — you'll lock everyone out (fail-closed).
- Don't keep `allow read, write: if true`.
- Don't put admin secrets in client code or re-open anonymous identity writes.
- `teacherCode`/`studentCode` are validated server-side now, but treat the
  rollout as supervised until tested end-to-end.

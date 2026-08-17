# Firestore Phase 3C — Compatibility Rules (review + manual deploy)

> **Superseded by Phase 3D** (`firestore.phase3d.claims.rules` +
> `docs/firestore-phase3d-claims-rules.md`). 3C is the no-Functions interim tier
> (broad reads, Teacher list/Admin writes break). 3D adds the code-exchange
> Cloud Functions + custom claims to scope reads/writes to the owner and restore
> the Teacher Dashboard student list. Prefer 3D once the Functions are deployed.

**Do not deploy these from code.** They are a reviewed DRAFT to replace the
current unsafe open rules. Deploy manually via the Firebase console/CLI **after**
reviewing the breakage table below.

- Canonical source (verified by system checks): `src/cloud/firestoreRulesDraft.js`
  (`PHASE3C_COMPATIBILITY_RULES`).
- Deployable copy: `firestore.phase3c.compatibility.rules` (repo root).
- Access audit: `docs/portal-compatibility-audit.md`.
- Background + production model: `docs/adventure-security-rules-plan.md`,
  `docs/firestore-phase3b-rules-draft.md`.

## The problem
Current LIVE rules are fully open:
```js
match /{document=**} { allow read, write: if true; }
```
Anyone can read/list/edit/delete all students, teachers and results. This must
not remain.

## What the 3C rules ALLOW
- Anonymous sign-in (unchanged).
- **`get`** a single `students/{code}` or `teachers/{code}` (code login — quizzes,
  Adventure, Student Dashboard, Teacher Dashboard login).
- **Read** `achievements` and `adventureAttempts` (dashboards query by code).
- **Create** `achievements` (validated: `studentCode`, `teacherCode`, `tool`,
  numeric `score`/`total`, `percent` 0–100, `score ≤ total+1`).
- **Create** `adventureAttempts` (validated: doc id `== attemptId`, `studentCode`,
  `teacherCode`, `missionKind`, `source == "mills-maths-adventure"`, non-negative
  `questionCount`/`correctCount`, `percent` 0–100, `createdAtClient`).

## What the 3C rules BLOCK
- **Listing** all `students`/`teachers` (stops PII enumeration).
- **All client writes** to `students`/`teachers` (no create/update/delete) — locks
  down anonymous Admin-Console identity writes.
- **Any update/delete** of `achievements` and `adventureAttempts` (results are
  append-only; no tampering, no forged edits, no deletes from the web).
- **Everything else** by default (`allow read, write: if false`).

## What works / breaks after deploy
| App | Result |
|-----|--------|
| Existing quiz | ✅ works |
| Student Dashboard | ✅ works |
| Teacher Dashboard | ⚠️ login + achievement reads work; **student-list query + manage-student writes break** |
| Admin Console | ❌ create/edit/disable/delete blocked — use the Firebase Console for now |
| Mills Maths Adventure | ✅ works (local + cloud) |

To keep the Teacher Dashboard's student list working **temporarily**, a commented
exception in the rules re-allows `list` for signed-in clients — **not
production-safe** (re-exposes enumeration). Prefer the Phase 3D mirror/claims fix.

## What REMAINS unsafe (be honest)
1. **Anonymous auth + typed codes = shared secret, not identity.** Rules can't
   prove "this is student/teacher X". 3C is *much* safer than open rules but is
   **not production-grade authentication**.
2. **Broad result reads:** any signed-in (anonymous) client can read
   `achievements`/`adventureAttempts` by querying a code. Scoping reads to the
   owner needs custom claims (3D).
3. **No deep array validation:** rules can't cheaply check `questionResults` for a
   stray `studentAnswer`; the **client mapper strips it** (`stripTypedAnswers`).
   A hand-crafted malicious client could include one — mitigated by App Check.

## Cheap hardening to apply alongside (recommended)
- Enable **App Check** (reCAPTCHA/Play Integrity) for the project.
- Restrict **Authorized domains** to the real hosting origins.

## Phase 3D / production direction (NOT built here)
A Cloud Function validates a typed code once and mints a Firebase Auth **custom
token** with claims `{ role, studentCode | teacherCode, classId }`. Rules then
scope `get`/`list`/reads/writes to `request.auth.token.*`; admin/teacher identity
writes move server-side; teacher/student **mirror views** are maintained by
Function triggers (see `docs/adventure-firestore-schema.md`).

## Manual test checklist (in the Firebase Rules Playground, BEFORE deploy)
1. `get students/AB12` as an anonymous user → **allow**.
2. `list students` → **deny**.
3. `update students/AB12` / `delete students/AB12` → **deny**.
4. `create achievements` with valid fields → **allow**; with `percent: 150` →
   **deny**; missing `studentCode` → **deny**.
5. `update`/`delete` any `achievements` doc → **deny**.
6. `create adventureAttempts/ATT1` where `attemptId == "ATT1"`, `source ==
   "mills-maths-adventure"` → **allow**; with mismatched id → **deny**.
7. `update`/`delete` any `adventureAttempts` doc → **deny**.
8. Read `achievements`/`adventureAttempts` as anonymous → **allow** (documented).
9. Any access to an unknown collection (e.g. `adventureTasks`) → **deny**.
Then smoke-test in the live apps: Student Dashboard loads; a quiz + an Adventure
mission save; Teacher Dashboard login works but its student list is empty (expected).

## ⚠️ What NOT to deploy blindly
- Do **not** keep `allow read, write: if true`.
- Do **not** deploy 3C without first warning that the **Teacher Dashboard student
  list** and the **Admin Console** will stop working (by design) until 3D.
- Do **not** enable the temporary `list` exception on a publicly-linked
  deployment.
- Do **not** treat `teacherCode`/`studentCode` as real authentication.

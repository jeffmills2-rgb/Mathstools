# Firestore Phase 3D — Claim-Based Rules

Deployable draft: **`firestore.phase3d.claims.rules`**
Canonical source (verified by checks): `src/cloud/firestoreRulesDraft.js` → `PHASE3D_CLAIMS_RULES`.

**These rules require the code-exchange Cloud Functions to be deployed first.**
They are fail-closed: without a custom-token sign-in, every request is denied.

## What changes from 3C
3C scoped *writes* but kept *reads broad* and denied the Teacher Dashboard list.
3D uses `request.auth.token.role / studentCode / teacherCode` (set by the
exchange functions) to scope **reads and writes to the owner**, and restores a
secure Teacher Dashboard student list.

## What it ALLOWS
- **students**: a student reads only `students/{ownCode}`; a teacher reads
  students where `teacherCode == claim.teacherCode` (list works **only** when the
  query filters by that teacherCode).
- **teachers**: a teacher reads only `teachers/{ownCode}`. No listing.
- **achievements**: a student reads only their own; a teacher reads their class's
  (`teacherCode == claim`). **Create only**, and only for the signed-in student's
  own `studentCode` (validated: teacherCode/tool strings, numeric score/total,
  percent 0–100).
- **adventureAttempts**: same read scoping. **Create only** for the signed-in
  student, with `attemptId == docId`, `source == "mills-maths-adventure"`,
  `missionKind` present, non-negative counts, percent 0–100, `createdAtClient`.

## What it BLOCKS
- Listing students/teachers without the owning-teacher filter.
- **All** client writes to `students` / `teachers` (create/update/delete) →
  identity is managed server-side (Admin SDK / Functions) only.
- **Any** update/delete of `achievements` / `adventureAttempts` (append-only).
- A student writing a result for **another** `studentCode`.
- Everything else (default `if false`).

## What this intentionally breaks (and the fix)
- **Student Dashboard class leaderboard** (read by `className`) → denied. Drop or
  move behind a teacher/Function path.
- **Legacy `achievements` without `teacherCode`** → invisible to teachers until
  backfilled (separate migration; not this phase).
- **Admin Console identity writes** → use Firebase Console / future admin Function.
- **Un-migrated anonymous quizzes** → their writes are denied until they switch to
  `exchangeStudentCode` + custom-token sign-in.

## Manual test checklist (Rules Playground)
Authenticate the simulator with custom claims to mimic the exchange tokens.

Student token `{role:"student", studentCode:"AB12", teacherCode:"MILLS4821"}`:
- `get students/AB12` → **allow**; `get students/ZZ99` → **deny**.
- `list students` filtered `teacherCode=="MILLS4821"` → **deny** (student role).
- `create achievements` with `studentCode:"AB12"` valid → **allow**;
  with `studentCode:"ZZ99"` → **deny**; `percent:150` → **deny**.
- `create adventureAttempts/ATT1` `{attemptId:"ATT1",studentCode:"AB12",source:"mills-maths-adventure",…}` → **allow**;
  mismatched id or `source` → **deny**.
- `update`/`delete` any achievement or attempt → **deny**.

Teacher token `{role:"teacher", teacherCode:"MILLS4821"}`:
- `get teachers/MILLS4821` → **allow**; `get teachers/OTHER` → **deny**.
- `list students` filtered `teacherCode=="MILLS4821"` → **allow**;
  unfiltered `list students` → **deny**.
- `list achievements` filtered `teacherCode=="MILLS4821"` → **allow**.
- any write to `students`/`teachers`/results → **deny**.

Unauthenticated / no role claim:
- any read or write → **deny** (fail-closed).

## Deploy order (critical)
1. Deploy the **Cloud Functions** first.
2. Migrate clients (dashboards + quizzes + MMA already done in repo).
3. Test in the **Rules Playground**.
4. Only then deploy these rules manually.

Deploying rules before functions/clients locks everyone out. Never deploy from
code; never keep `allow read, write: if true`.

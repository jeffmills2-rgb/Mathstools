# Mills Maths Adventure — Firebase & Portal Architecture Plan (Phase 3A)

**Status:** planning only. No Firebase code is added in this phase. Nothing in
`src/` changed. The local `resultStore`/localStorage pilot loop is unchanged and
remains the offline/demo fallback.

This document is the index. See also:
- `docs/adventure-firestore-schema.md` — exact collection shapes + examples.
- `docs/adventure-security-rules-plan.md` — staged Firestore rules + risks.
- `docs/phase-3b-cloud-attempts-mvp.md` — the smallest useful implementation slice.

---

## 1. What the attached files contain

| File | Role | Key facts |
|------|------|-----------|
| `algebraic-techniques.html` | **Firebase-enabled student quiz** | SDK 10.12.5 (gstatic ESM); `firebaseConfig` for project `mills-maths-tools`; `signInAnonymously`; reads `students/{studentCode}` with `getDoc`; **skip/demo mode**; writes one compact record to `achievements` via `addDoc`. Exposes `window.MMTFirebase` with `db`, `mode` (`pending`/`registered`/`skip`), `currentStudent`, `saveAchievement(payload)`. Only saves when `mode==='registered'`. |
| `index (1).html` | **MMT Student Dashboard** | Anonymous auth; `getDoc('students',code)`; **optional PIN** read from the student doc (`pin`/`studentPin`/`dashboardPin`); loads achievements `where('studentCode','==',code)`; class leaderboard `where('className','==',...)` filtered by `teacherCode`; shows name/class/teacher, XP, mastery (avg %, "Developing/Consolidating/Secure"), certificates, badges. |
| `teacher-facing.html` | **MMT Teacher Progress Dashboard** | Anonymous auth; `getDoc('teachers',code)` + `active!==false` ownership; loads `students where teacherCode==code`; matches achievements **3 ways**: (1) `where('teacherCode','==',code)`, (2) `where('studentCode','in', chunk)` (chunks of 30), (3) legacy `where('code','in',chunk)`. **Best attempt is computed live** (`best(list)=max(pct)`); there is **no summary document** today. Filters: class/topic/level/range. Exports: copy summary, CSV, print code cards. Student profile modal shows attempts, personal bests, compare, recommendations. |
| `index (2).html` | **MMT Admin Console** | Anonymous auth + `onAuthStateChanged`. `generateUniqueStudentCode()` (random, checks `students/{code}` free), `generateUniqueTeacherCode(name)` (`surnameStem + 4 digits`). `createTeacher` → `setDoc('teachers',code,{teacherCode,teacherName,school,active,createdAt,updatedAt})`. `createStudent` → `setDoc('students',code,{studentCode,firstName,surname,name,className,teacher,teacherName,teacherCode,school,active,...})`. Bulk assign teacher / disable / reactivate (`active` flag) / delete. **Explicit note in the UI:** *"this page is for setup/admin use. Do not add it publicly until Firestore rules and teacher access are secured."* |

> The Firestore **rules file itself was not in the uploads** (only the apps).
> The current rules behaviour is **inferred** from the code + the admin note:
> anonymous users can currently read/write `students`, `teachers`, and
> `achievements`. **Confirm the live rules before 3B** (see §16 questions).

## 2. Existing Firebase collections & fields

### `students/{studentCode}` (doc id = studentCode)
`studentCode, firstName, surname, name, className, teacher, teacherName,
teacherCode, school, active (bool), createdAt, updatedAt` and **optional**
`pin`/`studentPin`/`dashboardPin`, plus teacher-facing free-text the dashboards
read opportunistically (`teacherComment`, `nextStep`, `goal`, `dashboardMessage`).

### `teachers/{teacherCode}` (doc id = teacherCode)
`teacherCode, teacherName, school, active (bool), createdAt, updatedAt`.

### `achievements/{auto-id}` (compact result records; append-only via `addDoc`)
`studentCode, studentName, firstName, surname, className, teacherCode,
teacherName, school, topic, tool, level, levelKey, score, total, percent,
xpEarned, baseXP, xpMultiplier, xpRuleVersion, masteryTopic, masteryScore,
streakEligible, badgeEligible, platformVersion, types[], assignmentMode,
assignedTypes[], assignedCount, assignmentSource, certificateText, createdAt
(serverTimestamp), createdAtClient (ISO)`. Legacy records may use `code` instead
of `studentCode` (the teacher dashboard still recovers these).

## 3. Existing login / access patterns (reuse, do not reinvent)

- **Auth:** `signInAnonymously` on every tool. No email/password, no Google.
- **Student identity:** type a `studentCode` → `getDoc('students',code)` → reject
  if missing or `active===false`. Name comes from the student doc.
- **Teacher identity:** type a `teacherCode` → `getDoc('teachers',code)` → reject
  if missing or `active===false`. Ownership of data = `where('teacherCode','==',code)`.
- **Skip/demo:** the quiz lets a student skip the code and play in guest mode;
  **nothing is saved**. Adventure must keep this.
- **Code normalisation:** `String(code).trim().toUpperCase().replace(/[^A-Z0-9-]/g,'')`.
  Adventure should reuse the exact same normalisation so codes match.

**Adventure decision:** Adventure reuses this model verbatim. It does **not**
collect a display name — the student's name comes from `students/{studentCode}`.
The local `profile.studentCode` (Phase 2O) becomes the cloud login code; the local
`profile.name` is only used in pure-local/demo mode.

## 4. Current rules risks (summary — full plan in the rules doc)

With anonymous auth + client-held codes and (inferred) permissive rules:
1. **PII exposure / enumeration:** anyone anonymous can read/list `students`
   (names, codes, class, school) and `teachers`.
2. **Forgery / tampering:** clients can write/overwrite/delete `students` and
   `teachers` (admin operations share the same anonymous auth as students), and
   can forge or alter `achievements`.
3. **No identity binding:** a `studentCode`/`teacherCode` typed in the browser is
   a shared secret; rules cannot tie a request to a specific student/teacher
   without server-issued claims.
4. **Achievements are queryable by any code:** the student dashboard queries
   `where('studentCode','==',X)` — any anonymous client can read any student's
   achievements.

These are acceptable for a **closed, supervised prototype** but must be staged
toward stronger auth before wide classroom use. See the rules doc.

## 5. Recommended new Adventure collections

Separate Adventure data from the platform `achievements` (dual-save), and connect
to the existing identity via `studentCode`, `teacherCode`, and `className`.

| Collection | Purpose | Doc id |
|------------|---------|--------|
| `adventureClasses` | class-level config (broad-practice topic set, active flag, archive) | `${teacherCode}__${classSlug}` (deterministic) |
| `adventureTasks` | required missions assigned to a class (mission settings + lifecycle) | auto-id (`taskId`) |
| `adventureAttempts` | every **completed** attempt (rich, question-level snapshot) | the local `attemptId` (so local+cloud dedupe) |
| `adventureStudentTaskSummaries` | one fast-display roll-up per (task, student); best attempt highlighted | `${taskId}__${studentCode}` (deterministic) |
| `adventurePracticeSummaries` *(optional)* | per-student broad-practice roll-up | `${studentCode}` |

Notes:
- **`adventureClassSettings` is folded into `adventureClasses`** (one doc per class
  holds settings) to avoid an extra join. Split later only if it grows.
- **`adventurePracticeSessions` is not a separate collection.** Broad practice is
  just an `adventureAttempts` doc with `missionKind:"broadPractice"` and
  `taskId:null`; an optional per-student practice summary covers fast display.
- Adventure does **not** duplicate the student profile — it stores `studentCode`
  + denormalised display fields (name/class/teacher/school) copied from
  `students/{studentCode}` at write time for fast teacher reporting.

Exact field lists + example documents: `docs/adventure-firestore-schema.md`.

## 6. Mission kinds (extends the local model; story stays separate)

`requiredTask | broadPractice | preset | teacher | story | demo`

- Cloud-saveable: `requiredTask`, `broadPractice`, `preset`, `teacher`, `demo`
  (demo only when the teacher wants guest attempts logged; default = not saved).
- **`story` is never cloud-saved and never affected by cloud tasks.** Cloud
  tasks/broad practice must **not** complete or unlock main-story gates (the local
  rule already holds: story steps key off `npc-*` mission ids; cloud tasks use
  other ids/kinds).

## 7. Student flow (target)

1. Open Adventure → student-code overlay (reuse quiz pattern) **or** Skip/Demo.
2. `getDoc('students',code)`; reject inactive; (optional) PIN check; load name/class/teacher.
3. Resolve `classId = ${teacherCode}__${slug(className)}`.
4. Query active `adventureTasks` for that class → show **Required missions first**.
   Completed/expired tasks drop out of "required" (their attempts remain stored).
5. After required tasks, **broad practice** unlocks, limited to the class's
   `allowedTopics`; the world's topic routes only offer approved topics.
6. Complete a mission → local save (always) → if `registered` and not `story`:
   write compact `achievements` + rich `adventureAttempts` → update the matching
   `adventureStudentTaskSummaries` (or practice summary).
7. Student sees the existing completion screen (score, per-question correctness,
   XP/badges, saved status). No full cloud history inside Adventure for now.

## 8. Teacher flow (target)

1. Teacher enters existing `teacherCode` → `getDoc('teachers',code)` + `active`.
2. Existing achievements dashboard stays. Add an **Adventure** tab.
3. Class selector (classes derived from owned students' `className`, with an
   `adventureClasses` doc per class once configured).
4. **Broad topic settings:** pick `allowedTopics` for the class → `adventureClasses`.
5. **Create required missions:** mission settings (stage/topics/skills/difficulty/
   count/adaptive/passThreshold) + `expiresAt` → `adventureTasks` (status `active`).
6. View active/expired/archived tasks; per-task student completion table read from
   `adventureStudentTaskSummaries` (fast), with **best attempt highlighted**;
   drill into `adventureAttempts` for question/skill breakdown.
7. Export CSV / copy summary / filter by class/task/topic / flag `needsSupport`.

## 9. Broad-practice flow (target)

- Teacher sets `adventureClasses.allowedTopics` (subset of Adventure topics:
  `integers, fdp, algebra, area, pythagoras`).
- Student finishes required tasks → broad practice available; the Mission Board's
  free-choice/broad-practice list and the world topic routes are filtered to the
  allowed set. Mixed-topic practice routes to the Mission Board (existing fallback).
- Each attempt saves as `adventureAttempts` with `missionKind:"broadPractice"`,
  `taskId:null`, and `classId` so the teacher can review practice separately from
  required tasks.

## 10. Required-task flow & expiry

- **Task status:** `draft → active → expired → archived`. `expired` is **derived**
  from `expiresAt < now` even if the stored `status` is still `active`, so absent
  students returning late are **not** shown a backlog of old required tasks.
- **Multiple active tasks** per class are allowed; required list = active AND not
  expired AND not yet completed by this student (from the summary).
- **Whole-class task:** a task with `appliesToWholeClass:true` (or simply any
  active task for the class) is what students see on login.
- **Data retention:** expired/archived tasks and all attempts/summaries are
  **kept** (only hidden from the student's required list).

## 11. Attempt & summary model

- **Attempts:** save every **completed** attempt; retries = new `attemptId` →
  new `adventureAttempts` doc; **abandoned attempts are not saved** (matches the
  local rule — the local save only happens on the finish path). Rich snapshot:
  topic/skill breakdown, answer-mode summary, question-level correctness, and a
  **safe question snapshot** (prompt text + expected answer + diagram type), so
  reports survive future generator changes. **Typed student answers are NOT
  stored by default** (privacy) — an explicit `storeTypedAnswers` class/task flag
  can opt in later.
- **Best attempt:** **save every attempt + update a summary after each completed
  attempt** (your stated preference). The summary stores `bestAttemptId/bestPercent`
  so the teacher portal is fast and doesn't recompute over all attempts. (The
  current MMT teacher dashboard computes best live; Adventure adds the summary so
  the portal scales.) In **production**, compute summaries via a Cloud Function
  trigger on `adventureAttempts` to avoid trusting client writes; in the
  prototype, a guarded client merge is acceptable (documented risk).

## 12. Compact `achievements` compatibility (dual-save)

On each saved Adventure attempt, also `addDoc('achievements', {...})` with the
**existing compact field names** so the current Student/Teacher dashboards, XP and
certificates keep working unchanged:

```
studentCode, studentName, firstName, surname, className, teacherCode, teacherName,
school, topic (mapped MMT topic name), tool: "Mills Maths Adventure",
level (mission title), score, total, percent, xpEarned, masteryTopic, masteryScore,
streakEligible, badgeEligible, createdAt (serverTimestamp), createdAtClient (ISO),
// adventure links (extra, ignored by old dashboards):
adventureAttemptId, adventureTaskId|null, missionKind
```

**Do not** put the full question-level record into `achievements` — that lives in
`adventureAttempts`.

## 13. Portal redesign recommendation

- **Student portal:** keep the single student-code login; add a *"Play Mills Maths
  Adventure"* section that shows required Adventure missions, optional broad
  practice, and the latest Adventure result, alongside existing quiz achievements/
  XP/badges. **No separate student login.**
- **Teacher portal:** keep the existing achievements dashboard; add an **Adventure
  tab** (class selector, broad-topic settings, create/manage tasks, completion
  table with best attempts, question/skill breakdown, CSV/copy, needs-support
  flag). May live inside the current teacher portal for now; split later.
- **Admin console:** minimal changes — keep managing teachers/students/classes/
  active flags. Optional later: a generated `classCode` field, an `adventureEnabled`
  flag per class/school, and code cards that mention Adventure. **Do not overbuild.**

## 14. Security rules strategy (summary)

Staged — never `allow read, write: if true`. Full snippets in
`docs/adventure-security-rules-plan.md`.
- **Prototype (3B, closed pilot):** require `request.auth != null`; allow `get`
  (single doc) but **deny `list`** on `students`/`teachers` to stop enumeration;
  `achievements` and `adventureAttempts` are **create-only + shape-validated**
  (no update/delete from web); lock `students`/`teachers`/`adventureTasks`/
  `adventureClasses` **writes** away from the open student build (admin/teacher
  build only) — ideally move admin/teacher writes behind a Cloud Function.
- **Classroom-trial:** add field validation, size caps, and a Cloud Function (or
  separately authenticated admin) for all `students`/`teachers`/task writes.
- **Production:** mint Firebase Auth **custom claims** (`role`, `studentCode`,
  `teacherCode`) via a Cloud Function that validates the code once; rules then
  check `request.auth.token.*`. This is the only way to truly scope reads/writes.

**Honest position:** `teacherCode`/`studentCode` typed in a browser is **not**
sufficient for production security. It is fine for a supervised prototype. State
this to stakeholders.

## 15. Recommended Phase 3B slice

**Cloud Attempts MVP (write-only, no task assignment yet).** See
`docs/phase-3b-cloud-attempts-mvp.md`. In short: optional student-code login
(reusing the quiz pattern) + dual-save (compact `achievements` + rich
`adventureAttempts`) on completion of non-story missions, behind a clean
`src/cloud/` adapter, with Skip/Demo and the local store fully intact. Tasks,
class settings, summaries and the teacher Adventure tab come in 3C+.

## 16. Questions to answer before implementation

1. **Live Firestore rules:** please paste the current `firestore.rules`. The plan
   assumes they are permissive (per the admin note) but must be confirmed.
2. **Admin auth:** is the Admin Console meant to stay anonymous-auth + client
   writes, or can admin/teacher writes move behind a Cloud Function / a real admin
   login? This decides how strict student-build rules can be.
3. **Cloud Functions available?** Summaries + custom claims need Functions (Blaze
   plan). If not available now, we ship prototype client-merge summaries with a
   documented risk and defer claims.
4. **Web App registration:** reuse the existing web app config, or register a new
   Web App inside `mills-maths-tools` for Adventure (same project, cleaner
   analytics/origin allow-list)? Recommendation: new Web App, same project.
5. **Class identity:** OK to derive `classId = teacherCode + className slug`
   deterministically (no admin change), or do you want an explicit `classCode`
   generated in the Admin Console?
6. **Demo attempts:** should Skip/Demo ever write to cloud (as `missionKind:"demo"`),
   or stay strictly local? Default proposed: strictly local.
7. **Typed answers:** confirm we store **only** question-level correctness + safe
   snapshots by default (no typed student answers) for Phase 3.
8. **Topic→MMT mapping:** confirm the `masteryTopic` names to use in `achievements`
   for Adventure topics (e.g. `Pythagoras`, `Algebraic Techniques`, `Fractions,
   Decimals & Percentages`, `Integers`, `Area`).

## 17. Files created in this phase (docs only; no `src/` changes)

- `docs/firebase-adventure-architecture.md` (this file)
- `docs/adventure-firestore-schema.md`
- `docs/adventure-security-rules-plan.md`
- `docs/phase-3b-cloud-attempts-mvp.md`

No application code, Firebase SDK, or Firestore rules were added or changed.
192/192 system checks remain valid (no `src/` files were touched).

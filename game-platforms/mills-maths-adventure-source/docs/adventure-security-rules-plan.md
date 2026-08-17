# Adventure Firestore Security Rules — Plan (Phase 3A)

> **Phase 3C update:** the staged plan below is now realised as a concrete,
> reviewable draft. See `docs/firestore-phase3c-compatibility-rules.md`,
> `docs/portal-compatibility-audit.md`, and the deployable
> `firestore.phase3c.compatibility.rules` (canonical source:
> `src/cloud/firestoreRulesDraft.js`). Phase 3C = the "compatibility-trial" tier
> with identity writes locked down; the custom-claims tier below is Phase 3D.


**Planning only.** No rules are deployed in this phase. The live rules file was
**not** in the uploads; this plan must be reconciled with the actual
`firestore.rules` before any deploy (see question 1 in the architecture doc).

Golden rule: **never `allow read, write: if true`.** Where strong security is
impossible with the current anonymous-auth + typed-code model, this is stated
plainly and a staged path is given.

---

## 1. Current situation (inferred from the apps)

- Every tool uses `signInAnonymously` (no real per-user identity).
- The Admin Console UI explicitly says: *"Do not add it publicly until Firestore
  rules and teacher access are secured."* → strongly implies the live rules are
  currently permissive for `students`, `teachers`, `achievements`.
- Therefore the **honest baseline** is: an anonymous client can read/list student
  PII, overwrite/delete student & teacher docs, and forge achievements.

### Core constraint
A `studentCode`/`teacherCode` typed into a browser is a **shared secret**, not an
identity. Firestore rules can only see `request.auth` (here: an anonymous uid),
not "which student/teacher this is". So rules **cannot** scope reads/writes to a
specific student/teacher **until** the code is exchanged server-side for a token
with **custom claims**. Everything below works within that limitation.

---

## 2. Staged strategy

### Stage A — Prototype rules (Phase 3B, closed supervised pilot)
Goal: stop the worst problems (enumeration, tampering, forgery) while keeping the
existing code-login flow working on trusted devices.

Principles:
- Require `request.auth != null` for everything (no fully public access).
- **`students` / `teachers`:** allow **`get`** (single doc by id — needed for code
  login) but **deny `list`** (stops enumeration of all PII). **Deny all client
  writes** from the student build; admin/teacher writes happen from a separate
  trusted context (ideally a Cloud Function or a separately-gated admin build).
- **`achievements`:** **create-only**, with field validation; **deny update/delete**;
  reads needed by the student/teacher dashboards stay as today (acknowledged
  weakness — any code can be queried; mitigated in Stage C).
- **`adventureAttempts`:** **create-only**, validated; no update/delete.
- **`adventureTasks` / `adventureClasses`:** read by authed clients; **writes only
  from teacher/admin context** (Stage A: a gated build; Stage C: claims/Functions).
- **`adventureStudentTaskSummaries`:** prototype allows a guarded client merge
  (documented risk: a malicious client could write another student's summary);
  Stage C moves this to a Cloud Function trigger.

Illustrative Stage A rules (reconcile with live rules first):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    function isAuthed() { return request.auth != null; }
    function pct(v) { return v is number && v >= 0 && v <= 100; }

    // Existing identity: single-doc reads for code login; NO listing; NO client writes.
    match /students/{code} {
      allow get: if isAuthed();
      allow list, write: if false;          // writes via admin/Function only
    }
    match /teachers/{code} {
      allow get: if isAuthed();
      allow list, write: if false;
    }

    // Compact platform results: create-only + shape-checked. (Reads kept for now.)
    match /achievements/{id} {
      allow read: if isAuthed();            // weakness acknowledged (Stage C fixes)
      allow create: if isAuthed()
        && request.resource.data.studentCode is string
        && pct(request.resource.data.percent)
        && request.resource.data.tool is string;
      allow update, delete: if false;
    }

    // Rich Adventure attempts: create-only + shape-checked; never edited/deleted.
    match /adventureAttempts/{id} {
      allow read: if isAuthed();
      allow create: if isAuthed()
        && request.resource.data.studentCode is string
        && request.resource.data.missionKind in
             ['requiredTask','broadPractice','preset','teacher','demo']
        && pct(request.resource.data.percentage)
        && request.resource.data.source == 'adventure';
      allow update, delete: if false;
    }

    // Class config + tasks: readable by authed clients; writes gated (Stage A: closed build).
    match /adventureClasses/{classId} {
      allow read: if isAuthed();
      allow write: if false;                // teacher/admin build or Function only
    }
    match /adventureTasks/{taskId} {
      allow read: if isAuthed();
      allow write: if false;
    }

    // Prototype-only summaries (documented risk; Stage C → Cloud Function trigger).
    match /adventureStudentTaskSummaries/{id} {
      allow read: if isAuthed();
      allow create, update: if isAuthed()
        && request.resource.data.studentCode is string
        && pct(request.resource.data.bestPercent);
      allow delete: if false;
    }
  }
}
```

> `write: if false` means those collections are written from a **trusted context**
> (a Cloud Function, or a build/console that is not the public student app). If
> the Admin Console must keep doing client writes with anonymous auth, Stage A
> cannot fully hold for `students`/`teachers`; that is the central decision in
> question 2 of the architecture doc.

### Stage B — Classroom-trial rules
- Add stricter **field validation** (types, required keys, max sizes, string
  length caps) on `achievements` and `adventureAttempts` creates.
- Move **all** `students`/`teachers`/`adventureTasks`/`adventureClasses` writes
  behind a **Cloud Function** (callable, admin-key or teacher-code validated) — so
  the public app never writes identity/config docs.
- Keep `get`-only, `list`-denied on identity collections.
- Rate-limit creates where feasible (Function-side).

### Stage C — Production rules (custom claims)
- A **Cloud Function** validates a typed `studentCode`/`teacherCode` once and
  mints a Firebase Auth **custom token** with claims `{ role, studentCode |
  teacherCode, classId }`.
- Rules then scope precisely, e.g.:
  - `students/{code}`: `allow get: if request.auth.token.studentCode == code ||
    request.auth.token.role in ['teacher','admin'];`
  - `achievements`/`adventureAttempts` read: `if request.auth.token.role in
    ['teacher','admin'] || resource.data.studentCode == request.auth.token.studentCode`.
  - `adventureTasks`/`adventureClasses` write: `if request.auth.token.role in
    ['teacher','admin'] && request.resource.data.teacherCode ==
    request.auth.token.teacherCode`.
  - `adventureStudentTaskSummaries` write: **Function-only** (deny client writes).
- This is the first stage where **teacherCode/studentCode are real identity**, not
  shared secrets.

---

## 3. What students can / cannot do (target)

| Action | Prototype (A) | Trial (B) | Production (C) |
|---|---|---|---|
| Read own `students` doc (by code) | get only | get only | get only, claim-scoped |
| List all students | denied | denied | denied |
| Write `students`/`teachers` | denied (Function/admin) | Function only | Function only |
| Create `achievements` / `adventureAttempts` | yes, validated | yes, stricter | yes, claim-scoped |
| Edit/delete results | denied | denied | denied |
| Write tasks/classes | denied | Function only | teacher claim only |
| Write summaries | guarded client merge (risk) | Function | Function only |

## 4. Risks to disclose

1. **Anonymous auth ≠ identity.** Until Stage C, rules cannot prove "this is
   student X / teacher Y". Treat the pilot as supervised.
2. **Achievement/attempt reads** are broad in Stage A (any code queryable) — fine
   for a closed trial, fixed by claims in Stage C.
3. **Admin writes** sharing anonymous auth is the biggest gap; resolve by moving
   admin/teacher writes behind a Function (Stage B).
4. **Client summary writes** in the prototype are spoofable; move to a Function
   trigger for the trial/production.
5. **API key in client** is expected for Firebase web (not a secret), but the
   project's **Authorized domains** + App Check should be enabled to limit abuse.

## 5. Recommended near-term hardening (cheap wins, even before Stage B)
- Turn on **App Check** (reCAPTCHA/Play Integrity) for the project.
- Restrict **Authorized domains** to the real hosting origins.
- Deny `list` on `students`/`teachers` immediately (most impactful single change).
- Make `achievements`/`adventureAttempts` **create-only** with validation.

These can be applied without changing the existing login UX.

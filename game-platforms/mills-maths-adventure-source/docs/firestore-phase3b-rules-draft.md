# Firestore Rules — Phase 3B Draft (NOT deployed)

The **current live rules are fully open** and unsafe:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if true; }
  }
}
```

This must not be treated as acceptable for classroom use. Below are **two draft
rule sets** to review. **Nothing here is deployed from code** — these are
proposals. They are not "production-perfect"; see the limitations.

> Reconcile with the existing apps before deploying: the Admin Console, Teacher
> Dashboard, and Student Dashboard currently write/read with anonymous auth.
> Strict rules **will** change what those tools can do (see §3 compatibility).

---

## 1) Compatibility-trial rules (safer than open; keeps tools mostly working)

Goal: stop the worst issues (PII enumeration, attempt tampering) while the
existing anonymous-auth tools keep functioning during the trial.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    function authed() { return request.auth != null; }
    function pct(v) { return v is number && v >= 0 && v <= 100; }

    // Identity: single-doc reads by code (login) but NO listing (stops scraping
    // all student PII). Writes stay OPEN for the trial so the Admin Console +
    // Teacher Dashboard still function — THIS IS THE WEAK POINT (see §3/§4).
    match /students/{code} {
      allow get: if authed();
      allow list: if false;                 // <-- biggest single safety win
      allow write: if authed();             // trial only; tighten in production
    }
    match /teachers/{code} {
      allow get: if authed();
      allow list: if false;
      allow write: if authed();             // trial only
    }

    // Compact platform results: create-only + shape-checked; never edited/deleted.
    // Reads kept (dashboards query by code) — acknowledged weakness, fixed in §2.
    match /achievements/{id} {
      allow read: if authed();
      allow create: if authed()
        && request.resource.data.studentCode is string
        && request.resource.data.tool is string
        && pct(request.resource.data.percent);
      allow update, delete: if false;
    }

    // Rich Adventure attempts: create-only + shape-checked; never edited/deleted.
    match /adventureAttempts/{id} {
      allow read: if authed();
      allow create: if authed()
        && request.resource.data.studentCode is string
        && request.resource.data.source == 'mills-maths-adventure'
        && request.resource.data.missionKind in
             ['requiredTask','broadPractice','preset','teacher','demo']
        && pct(request.resource.data.percent);
      allow update, delete: if false;
    }

    // Everything else: closed.
    match /{document=**} { allow read, write: if false; }
  }
}
```

What this fixes vs open rules:
- No more **listing** all students/teachers (enumeration of PII).
- Results (`achievements`, `adventureAttempts`) become **append-only + validated**
  — they can't be edited or deleted from the web, and percent is range-checked.
- All unknown collections are denied by default.

What it does **not** yet fix (trial-grade):
- `students`/`teachers` **writes are still open** to any authed (anonymous)
  client, because the Admin Console + Teacher Dashboard write with anonymous
  auth. A malicious client could still alter identity docs.
- `achievements`/`adventureAttempts` are **readable** by any authed client (the
  dashboards query by code) — a determined user could read others' results.

These remain because removing them would **break the existing tools** today.

---

## 2) Future production rules (needs Cloud Functions / custom claims)

Goal: real identity. A Cloud Function validates a typed code **once** and mints a
Firebase Auth **custom token** with claims `{ role, studentCode | teacherCode,
classId }`. Rules then scope precisely. (Cloud Functions are explicitly **out of
scope for 3B** — this is the target, documented now.)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    function role() { return request.auth.token.role; }            // 'student'|'teacher'|'admin'
    function isTeacher() { return role() in ['teacher','admin']; }
    function ownStudent(code) { return request.auth.token.studentCode == code; }
    function pct(v) { return v is number && v >= 0 && v <= 100; }

    match /students/{code} {
      allow get: if ownStudent(code) || isTeacher();
      allow list: if isTeacher();                       // teacher lists own class via query rules/indexes
      allow write: if role() == 'admin';                // identity managed by Functions/admin only
    }
    match /teachers/{code} {
      allow get: if request.auth.token.teacherCode == code || role() == 'admin';
      allow write: if role() == 'admin';
    }

    match /achievements/{id} {
      allow read: if isTeacher()
        || resource.data.studentCode == request.auth.token.studentCode;
      allow create: if request.auth != null
        && request.resource.data.studentCode == request.auth.token.studentCode
        && pct(request.resource.data.percent);
      allow update, delete: if false;
    }

    match /adventureAttempts/{id} {
      allow read: if isTeacher()
        || resource.data.studentCode == request.auth.token.studentCode;
      allow create: if request.auth != null
        && request.resource.data.studentCode == request.auth.token.studentCode
        && request.resource.data.source == 'mills-maths-adventure';
      allow update, delete: if false;
    }

    // Future Adventure config/tasks/summaries (3C+):
    match /adventureClasses/{classId} {
      allow read: if request.auth != null;
      allow write: if isTeacher()
        && request.resource.data.teacherCode == request.auth.token.teacherCode;
    }
    match /adventureTasks/{taskId} {
      allow read: if request.auth != null;
      allow write: if isTeacher()
        && request.resource.data.teacherCode == request.auth.token.teacherCode;
    }
    match /adventureStudentTaskSummaries/{id} {
      allow read: if request.auth != null;
      allow write: if false;                            // Cloud Function trigger only
    }

    match /{document=**} { allow read, write: if false; }
  }
}
```

---

## 3) Existing portal/admin compatibility under safer rules

| Tool | Under trial rules (§1) | Under production rules (§2) |
|------|------------------------|------------------------------|
| **Quiz / Adventure** (read 1 student, create achievement) | ✅ works (`get` + create) | ✅ works (claim = own studentCode) |
| **Student Dashboard** (query achievements by own code) | ✅ works (read allowed) | ✅ works (read scoped to own code) |
| **Teacher Dashboard** (list own students, query achievements) | ⚠️ **`list` on students is denied** → its `where('teacherCode','==',...)` student query **breaks**; achievements `in`-queries still work. Needs a `list`-allow for teachers or a teacher claim. | ✅ works (teacher claim allows list/read) |
| **Admin Console** (list + write students/teachers) | ⚠️ **`list` denied** → its `orderBy` listing breaks; writes still allowed in trial. | ❌ writes require `admin` role → must move behind admin auth / Function |

**Key compatibility risk:** denying `list` on `students`/`teachers` (the single
biggest safety win) **breaks the Teacher Dashboard's student query and the Admin
Console's listing** as written today. Options:
1. Keep `list` open during the trial (weaker, but tools keep working), **or**
2. Add a minimal teacher/admin gate now (e.g. allow `list` only if a teacher
   claim exists) — which requires the custom-claims path (production), **or**
3. Move admin/teacher reads behind a Cloud Function.

This is the decision to make with stakeholders (architecture-doc question 2).

## 4) Honest limitations
- Anonymous auth + typed codes = **shared secret, not identity**. Until custom
  claims (§2) exist, rules can't prove "this is student/teacher X".
- The Phase 3B Adventure writes (`achievements` create, `adventureAttempts`
  create) are safe to ship under §1; the **reads + identity writes** are the
  parts that need §2.
- Recommended cheap wins regardless: enable **App Check**, restrict **Authorized
  domains**, and deploy the **append-only + validated** result rules from §1 even
  if `list`/`write` on identity stays open during the supervised trial.

**Do not deploy from code.** Apply rules via the Firebase console/CLI after review.

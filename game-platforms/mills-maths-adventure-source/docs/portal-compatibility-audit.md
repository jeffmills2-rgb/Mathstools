# Portal & Tool Firestore Access Audit (Phase 3C)

How each app reads/writes Firestore today, and whether it survives the Phase 3C
compatibility rules (`firestore.phase3c.compatibility.rules` /
`src/cloud/firestoreRulesDraft.js`). Derived from the uploaded source files +
this repo's `src/cloud/`.

Legend: **get** = single doc by id · **list/query** = collection query ·
**create/update/delete** = writes. ✅ works under 3C · ⚠️ degraded/documented ·
❌ blocked by 3C (intended).

---

## Existing Firebase quiz (`algebraic-techniques.html`)
| Operation | Collection | 3C |
|-----------|------------|----|
| anonymous sign-in | — | ✅ |
| `getDoc(students/{code})` (login) | students | ✅ get allowed |
| `addDoc(achievements, …)` (compact result) | achievements | ✅ create allowed (record has studentCode/teacherCode/tool/score/total/percent) |
| update/delete | — | n/a (never does) |

**Verdict:** ✅ Fully works. (Confirm each quiz's achievement payload includes
`teacherCode` + `score`/`total`/`percent` — the algebra quiz does.)

## Student Dashboard (`index (1).html`)
| Operation | Collection | 3C |
|-----------|------------|----|
| `getDoc(students/{code})` (login, profile, optional PIN) | students | ✅ get allowed |
| `query(achievements where studentCode == code)` | achievements | ✅ read allowed |
| `query(achievements where className == …)` (class leaderboard) | achievements | ✅ read allowed |
| student listing | students | not used (✅) |
| writes | — | none (✅) |

**Verdict:** ✅ Works unchanged. It never lists students and never writes —
exactly the safe pattern. Optional PIN logic (reads `pin`/`studentPin`/
`dashboardPin` from the student doc) keeps working via the single `get`.

## Teacher Dashboard (`teacher-facing.html`)
| Operation | Collection | 3C |
|-----------|------------|----|
| `getDoc(teachers/{code})` (login + `active`) | teachers | ✅ get allowed |
| `query(students where teacherCode == code)` (its student list) | students | ❌ **list denied → BREAKS** |
| `query(achievements where teacherCode == code)` | achievements | ✅ read allowed |
| `query(achievements where studentCode in […])` | achievements | ✅ read allowed |
| `query(achievements where code in […])` (legacy) | achievements | ✅ read allowed |
| `setDoc(students/{code})` (manage-student panel) | students | ❌ **write denied** |

**Verdict:** ⚠️ **Partially breaks.** Teacher login + achievement reads still
work, but the **student-list query** and the **manage-student writes** are
blocked. To restore the student list safely without re-opening `list`, the
dashboard must migrate to a **teacher-owned mirror** (`teacherViews/{teacherCode}/
students/*`) maintained by a Cloud Function, OR a **custom-claims** model (Phase
3D). Temporary option: enable the commented `list` exception in the rules (NOT
production-safe — re-exposes enumeration).

## Admin Console (`index (2).html`)
| Operation | Collection | 3C |
|-----------|------------|----|
| `getDoc(students/{code})` / `getDoc(teachers/{code})` (uniqueness) | students/teachers | ✅ get allowed |
| `query(teachers orderBy)` / `query(students orderBy)` (listing) | teachers/students | ❌ **list denied → BREAKS** |
| `setDoc(teachers/{code})` / `setDoc(students/{code})` (create) | teachers/students | ❌ **write denied** |
| `updateDoc(…)` (toggle active / edit / bulk reassign) | teachers/students | ❌ **write denied** |
| `deleteDoc(students/{code})` | students | ❌ **delete denied** |

**Verdict:** ❌ **Intentionally locked down** (chosen approach: *admin via the
Firebase Console for now*). The Admin Console cannot create/edit/disable/delete
identity from the open web under 3C — this removes the single biggest risk
(anyone forging/deleting student/teacher identity). Admin operations move to the
Firebase Console until a Cloud Functions/admin-auth path exists (Phase 3D).

## Mills Maths Adventure (this repo, `src/cloud/`)
| Operation | Collection | 3C |
|-----------|------------|----|
| anonymous sign-in (`firebaseClient.ensureConnected`) | — | ✅ |
| `getDoc(students/{code})` (`getStudentDoc`) | students | ✅ get allowed |
| reject invalid/inactive (`studentIsActive`) | — | ✅ client-side |
| skip/demo (no writes) | — | ✅ local only |
| `addDoc(achievements, …)` (`writeAchievement`) | achievements | ✅ create allowed (mapper emits studentCode/teacherCode/tool/score/total/percent) |
| `setDoc(adventureAttempts/{attemptId})` (`writeAdventureAttempt`) | adventureAttempts | ✅ create allowed (id == attemptId; source/missionKind/counts/percent/createdAtClient present; **no studentAnswer**) |
| update/delete attempts | — | none (✅ — never edits/deletes) |

**Verdict:** ✅ **Fully compatible.** The adapter already uses the safe pattern
(get-by-code, create-only, never edits/deletes, strips typed answers). One
nuance: `adventureAttempts` uses `setDoc(id=attemptId)`. Under 3C a *new* id is a
create (allowed); re-writing the *same* id would be an update (denied) — but the
app only ever writes once per attempt (awarded-once guard, new id per retry), so
this is fine and even desirable (no silent overwrites).

---

## Summary: who survives Phase 3C rules
| App | Status under 3C |
|-----|-----------------|
| Existing quiz | ✅ works |
| Student Dashboard | ✅ works |
| **Teacher Dashboard** | ⚠️ login + achievement reads work; **student list + manage writes break** (needs mirror/claims or temporary `list` exception) |
| **Admin Console** | ❌ intentionally locked down (use Firebase Console; Functions later) |
| Mills Maths Adventure | ✅ works |

## What still needs Phase 3D (Cloud Functions / custom claims)
- Scope identity `get`/`list` and result **reads** to the owner (today reads are
  broad for any signed-in client).
- Restore the Teacher Dashboard student list safely (teacher claim or mirror).
- Restore Admin Console writes behind real admin auth / a callable Function.
- Mint custom tokens from a validated code so `request.auth.token.*` carries real
  identity (the only way to truly fix the shared-secret problem).

## Phase 3D update — these are now built
The shared-secret problem is addressed in Phase 3D via the secure code-exchange
Cloud Functions (`exchangeStudentCode` / `exchangeTeacherCode`) + claim-based
rules (`firestore.phase3d.claims.rules`). Under 3D: the Teacher Dashboard student
list works again (teacher claim), result reads scope to the owner, and identity
writes stay server-side. See `docs/phase-3d-secure-code-exchange.md` and
`docs/firestore-phase3d-claims-rules.md`.

| App | Status under 3D (after deploy + client migration) |
|-----|-----|
| Existing quiz | ✅ (after migrating to `exchangeStudentCode`) |
| Student Dashboard | ✅ (minus class leaderboard by `className`) |
| Teacher Dashboard | ✅ student list restored (minus client identity writes) |
| Admin Console | ❌ server-side identity management only |
| Mills Maths Adventure | ✅ migrated in-repo |

## Phase 3D.1 update — portals + quiz migrated
The Student Dashboard, Teacher Dashboard, Admin Console and the canonical quiz
template have been migrated to the secure exchange (files in `/portals`, details
in `docs/phase-3d1-portal-quiz-migration.md`). Student/Teacher dashboards now sign
in via custom tokens and run claim-scoped queries; the Admin Console is read-only
with a warning; the quiz template uses `exchangeStudentCode` and preserves
skip/demo. Remaining Firebase quizzes (Integers/FDP/Area/Pythagoras) still need
the same recipe before rules are deployed.

## Phase 4A update — clean platform rebuild
The dashboards are superseded by a clean static platform in `portal/`
(`portal/student`, `portal/teacher`, `portal/admin`, `portal/shared`). It is built
entirely on secure code exchange + custom-token sign-in, scopes every query to the
owner's claim, includes a tool registry (`portal/shared/mmtToolRegistry.js`), and
reads rich `adventureAttempts` for teachers with graceful fallback. The admin page
is an explicit disabled page. No rules change required. See
`docs/phase-4a-platform-rebuild.md` and `portal/README.md`. The old `/portals`
dashboards remain only as references; the migrated quiz template
(`portals/algebraic-techniques.html`) is still canonical.

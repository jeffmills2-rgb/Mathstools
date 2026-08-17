# Teacher-set Adventure Tasks — implementation plan

> Feature: a teacher signs into the Teacher Platform, opens **Set Adventure
> Task**, picks a character (Pip / Fern / Alby), a stage + topic(s) + skills,
> difficulty, and a due date, and submits. Every student in that class then
> sees the assigned task delivered by the chosen character inside Mills Maths
> Adventure.
>
> Decisions locked in: **roster-push** delivery (whole class, no codes typed) and
> **teacher picks any character + topic** (full flexibility, off-theme allowed).
> Last reviewed: 2026-07-01.
>
> **STATUS: Phases 1 & 2 BUILT (2026-07-01).** End-to-end and passing the 251
> system checks. Functions (`createAdventureTask`, `updateAdventureTask`,
> `setAdventureTaskActive`) deployed manually; rules block added to
> `firestore.phase3d.claims.rules` + `src/cloud/firestoreRulesDraft.js` and
> published via the Console. Teacher UI (create/edit/remove + completion view)
> lives in the website repo `portal/teacher/`. Remaining = the "future polish"
> items in §7 (per-skill selection, in-game due-date display, more stages/NPCs).

---

## 1. Why this is mostly additive

The expensive pieces already exist:

- **The assignment data model is built.** `src/data/missions.js` defines a
  validated *mission* shape (stages, topics, skills, difficulty range, adaptive,
  question count, pass threshold, rewards, due date) and already carries
  Firebase-ready fields: `classCode`, `taskCode`, `createdBy`, `assignedAt`,
  `dueAt`, `studentProgress`. The file's own comment says a teacher portal would
  write *this same shape* and the game would read it unchanged.
- **The Adventure is on the same Firebase project as the portal**
  (`mills-maths-tools`), not the separate arcade-games project. It joined the
  secure ecosystem in Phase 3B. *(Doc note: the root CLAUDE.md line "games use
  `mmt-firebase-games`" is true for the arcade/flip-card games but NOT the
  Adventure — fix when convenient.)*
- **The game already does secure student sign-in.**
  `src/cloud/cloudSession.js → registerWithCode()` calls `exchangeStudentCode`,
  signs in with the custom token, and the student's claims already include
  **`teacherCode` and `className`** — exactly the key needed to fetch "my class's
  assignments" via the same claim-scoped read pattern already used for
  achievements/adventureAttempts.

So there is **no new auth path and no cross-project bridge**. The work is: one new
Cloud Function, one new Firestore collection + rules, a teacher form, and a game
read path that feeds the existing mission engine.

---

## 2. Data model

New Firestore collection **`adventureAssignments`** (parallels
`adventureAttempts`). One document per assigned task:

```
adventureAssignments/{assignmentId}
  assignmentId        string   (== doc id)
  npcId               "pip" | "fern" | "alby"      // who delivers it
  title               string
  description         string
  stages              string[]                     // mission shape …
  selectedTopics      string[]
  selectedSkills      string[]                      // empty = all skills of topics
  difficultyRange     { min, max }                  // 1..5
  adaptiveOn          boolean
  requiredQuestions   number
  completionCriteria  { type, count }               // "answered" | "correct"
  passThreshold       number                        // 0..1
  rewardXP            number
  rewardCoins         number
  rewardBadge         string | null
  teacherNotes        string
  // --- scoping / lifecycle (stamped server-side) ---
  teacherCode         string                        // from caller's claim, never client input
  className           string                        // target class (UPPER)
  createdBy           string                        // "teacher-portal"
  createdAtServer     timestamp
  assignedAt          number                        // epoch ms
  dueAt               number | null                 // epoch ms
  active              boolean                        // teacher can disable (Phase 2)
```

The mission half is exactly `normaliseMission()` output from `missions.js`. The
game converts an assignment doc back into a mission with `normaliseMission(doc)` —
no consumer changes needed.

---

## 3. Cloud Function — `createAdventureTask`

Add to `Mills Maths Adventure/functions/index.js`, mirroring
`createStudentForTeacher`:

- **Authorise** on the verified claim: `auth.token.role === "teacher"` and a
  non-empty `auth.token.teacherCode`. Reject otherwise.
- **Stamp** `teacherCode` from the claim (never client input), same as the
  student-creation function.
- **Validate** the incoming mission server-side: stages/topics/skills are
  strings, difficulty range sane (1..5, min ≤ max), `npcId ∈ {pip,fern,alby}`,
  `className` present. Reuse the same logic as `validateMission` (kept in sync
  with the pure module).
- **Write** the `adventureAssignments/{assignmentId}` doc with a generated id and
  server timestamp; return the safe assignment.
- Deploy: `firebase deploy --only functions --project mills-maths-tools`
  (functions first, then the website — per the working agreement).

Phase 2 adds `setAdventureTaskActive` (enable/disable) and optionally
`deleteAdventureTask`.

---

## 4. Firestore rules

Add a block to **both** the live rules and the source of truth, then deploy
manually via the Firebase console (never from code):

- `firestore.phase3d.claims.rules` (reference copy in this repo + the website
  repo)
- `src/cloud/firestoreRulesDraft.js` (`PHASE3D_CLAIMS_RULES`) — the
  system-checks source of truth; keep them identical.

```
match /adventureAssignments/{id} {
  // Teacher reads their own class's tasks; student reads tasks for their
  // class that are active. The query MUST be filtered by these fields.
  allow read: if (isTeacher() && resource.data.teacherCode == myTeacher())
              || (isStudent()
                  && resource.data.teacherCode == request.auth.token.teacherCode
                  && resource.data.className  == request.auth.token.className
                  && resource.data.active == true);
  allow create, update, delete: if false;   // via createAdventureTask only
}
```

No typed answers are ever stored here, so this stays inside the secure model.
Student list queries must include `where teacherCode == … && className == … &&
active == true` to satisfy the per-doc rule (same constraint pattern as the
teacher students list).

---

## 5. Teacher portal UI — "Set Adventure Task"

In `mathstools-main 2/portal/teacher/index.html` (+ a client call in
`portal/shared/codeExchangeClient.js`):

- **Add** `createAdventureTask(payload)` to `codeExchangeClient.js`, mirroring the
  existing `createStudent()` (httpsCallable wrapper).
- **Form fields:** class selector (the teacher's existing classes), **character**
  dropdown (Pip / Fern / Alby), **stage** → **topic(s)** → **skills** (cascading
  from a small curriculum manifest), difficulty min/max, question count, adaptive
  toggle, optional due date, optional title/notes.
- **Off-theme guard (cosmetic):** when the chosen character's default topic
  doesn't match the selected topic, show a soft inline note ("Pip usually teaches
  integers — students will see a short generic intro"). Not a blocker.
- **On submit:** call the function, then show the new task in a "Current Adventure
  tasks for this class" list (read back via a claim-scoped query).
- The curriculum manifest (stage→topic→skill ids/labels) needs to be available to
  the static portal. Export a tiny JSON manifest from the game build, or hand-mirror
  the Stage 4 ids — decide in Phase 1 (lean: ship a small static manifest now).

---

## 6. Game read path + dynamic NPC delivery

In the game (`src/cloud/` + `src/data/npcQuestChains.js` consumers):

- **New `src/cloud/assignmentsReader.js`:** after a registered sign-in, query
  `adventureAssignments` where `teacherCode == profile.teacherCode &&
  className == profile.className && active == true`, ordered by `assignedAt`.
  Convert each via `normaliseMission()`.
- **Expose on `cloudSession`:** add `assignments` state + `loadAssignments()`
  called right after `registerWithCode()` succeeds.
- **Dynamic NPC chains:** today `getChain(npcId)` returns static data
  (`NPC_QUEST_CHAINS`). Introduce a resolver that, when a teacher assignment
  exists for an NPC, builds that NPC's quest step(s) from the assignment;
  otherwise falls back to the curated static chain. The static chains stay as the
  default single-player experience.
- **Dialogue fallback:** for an off-theme pairing, render a generic intro
  ("<NPC> has a task from your teacher today") so a mismatched theme never reads
  as broken.
- **Results:** completed assignment attempts already flow through the existing
  dual-save (achievements + adventureAttempts). Tag the attempt with
  `assignmentId` so Phase 2 can show per-task completion to the teacher.

---

## 7. Phasing

**Phase 1 — end-to-end skeleton (one task per character).**
1. `createAdventureTask` function (+ deploy).
2. `adventureAssignments` rules in both files (+ manual console deploy).
3. Teacher form + client call + "current tasks" list.
4. Game read path + dynamic NPC chain + dialogue fallback.
5. System checks for the new shape/rules; local dev test end-to-end.

**Phase 2 — class-grade experience.**
- Multiple tasks per character / multiple active tasks; due-date display + overdue
  handling.
- Per-student completion tracking surfaced to the teacher (via `assignmentId` on
  attempts), reusing the Results/teacher views.
- Enable/disable/edit a task (`setAdventureTaskActive`), and a class-management
  view.
- Off-theme dialogue polish; reward/badge guidance.

---

## 8. Guardrails (from both CLAUDE.md files)

- Keep the secure-exchange model: identity writes server-side only; assignments
  are written by the function, never client-side.
- Never store typed student answers (assignments contain none — fine).
- Deploy **function first, then the website**; deploy **rules manually** via the
  console after the function is live.
- Run the **251 headless system checks** after game changes; don't break
  story/onboarding/missions/MathLive/diagrams/gates.
- Match existing design tokens and lowercase-hyphenated folder casing.

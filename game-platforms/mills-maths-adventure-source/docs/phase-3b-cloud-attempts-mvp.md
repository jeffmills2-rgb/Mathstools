# Phase 3B — Cloud Attempts MVP (recommended slice)

The smallest useful slice that connects Mills Maths Adventure to the existing
`mills-maths-tools` Firebase ecosystem **without** building the full portal.
**Not implemented yet — this is the proposed 3B scope for review.**

## Goal

> Student enters existing student code → Firebase validates the student →
> Skip/Demo still available → student completes a **non-story** mission (preset /
> teacher / broad practice) → app **dual-saves** a compact `achievements` record
> and a rich `adventureAttempts` record → existing MMT dashboards keep working,
> and a future Teacher Adventure tab can read the rich attempts.

What 3B **does**:
- Optional cloud login (reuse the quiz pattern); Skip/Demo unchanged.
- Dual-save completed non-story attempts (compact + rich).
- Keep the local `resultStore` as source of truth + offline/demo fallback.
- A small cloud status chip + a "saved to class account" note on completion.

What 3B **defers** to 3C+:
- Required-task assignment, class settings, broad-practice gating.
- `adventureStudentTaskSummaries` (can be a stretch goal if Functions exist).
- The Teacher Portal Adventure tab / Student Portal "Play Adventure" section.
- Custom claims / Cloud Functions (Stage C rules).

## Hard constraints (unchanged)
- No new topics / zones / NPCs. No story changes. 60% threshold unchanged.
- Story missions are **never** uploaded and **never** unlocked by cloud data.
- Local resultStore + Skip/Demo remain. Abandoned attempts are not saved.
- Retries create a new `attemptId` → a new `adventureAttempts` doc.
- Do not force Adventure data into `achievements` (dual-save).

## Proposed file layout (clean, optional, isolated)

```
src/cloud/
  firebaseClient.js      // lazy init: initializeApp + signInAnonymously + getFirestore
  cloudConfig.js         // firebaseConfig (same project) + an enable flag
  studentAuth.js         // normaliseCode, fetchStudent(code), session: mode pending|registered|skip
  achievementWriter.js   // toCompactAchievement(localResult, student) + addDoc('achievements')
  attemptWriter.js       // toAdventureAttempt(localResult, student) + addDoc('adventureAttempts', id=attemptId)
  cloudResultStore.js    // orchestrates dual-save; no-op in skip/demo or when disabled
```

- **Lazy + guarded:** the Firebase SDK loads only when cloud is enabled and a
  student logs in. With cloud disabled or in Skip/Demo, `src/cloud/*` is a no-op
  and the app behaves exactly as the current local pilot.
- **Pure transforms** (`toCompactAchievement`, `toAdventureAttempt`) live as
  testable functions so system checks can validate the shapes **without** a
  network/Firebase dependency (mirrors how the local checks already work).

## Integration points (minimal)

1. **Login overlay** (reuse `algebraic-techniques.html` logic):
   - Shown optionally at start or from a "Connect to class account" button.
   - `Continue` → `getDoc('students',code)`, reject inactive → `mode='registered'`,
     set `currentStudent` (name/class/teacher/school). `Skip` → `mode='skip'`.
   - Does **not** collect a display name (comes from the student doc).
   - Reuses the local `profile.studentCode` to prefill the code.

2. **On completed attempt** (in `MathsEncounter.saveAttemptResult`, after the
   existing local `addResult`):
   - If `mode==='registered'` and `missionKind !== 'story'`:
     `cloudResultStore.saveAttempt(localRecord, currentStudent)` →
     `addDoc('achievements', compact)` **and**
     `setDoc('adventureAttempts', attemptId, rich)` (id = local attemptId; safe
     idempotent re-write).
   - Failures are non-fatal: the local save already succeeded; show a small
     "couldn't sync (saved locally)" note and continue. No retries block the game.

3. **Completion screen / Results Centre:** add a tiny "☁ Saved to class account
   ({className})" line when a cloud save succeeded; keep the existing
   "💾 Saved locally" line always.

## Compact `achievements` record (3B)
Use the exact existing field names (see architecture doc §12), `tool:"Mills Maths
Adventure"`, `level = missionTitle`, plus `adventureAttemptId`, `missionKind`, and
`masteryTopic` mapped to the MMT topic name. Compact only — no question array.

## Rich `adventureAttempts` record (3B)
The full shape in `docs/adventure-firestore-schema.md`, derived from the local
`resultTypes` record with `text → promptSnapshot`, `expectedAnswer` kept, and
`studentAnswer` **omitted** (privacy default).

## Rules needed for 3B (Stage A)
Deploy the **Stage A prototype rules** from `docs/adventure-security-rules-plan.md`:
`students/teachers` get-only + list-denied; `achievements`/`adventureAttempts`
create-only + validated; turn on App Check + restrict Authorized domains.
**Confirm the live rules first.**

## Acceptance checklist (3B)
- [ ] Cloud disabled / Skip / demo → app identical to current local pilot; no SDK load.
- [ ] Valid student code → name/class/teacher loaded from `students/{code}`.
- [ ] Inactive code rejected; bad code rejected; Skip always works.
- [ ] Completing a preset/teacher/broad-practice mission writes 1 `achievements`
      doc + 1 `adventureAttempts` doc; story writes neither.
- [ ] Retry writes a **new** `adventureAttempts` doc (new attemptId).
- [ ] Abandoned (left mid-mission) writes nothing to cloud (or local).
- [ ] `achievements` record appears in the existing Student/Teacher dashboards.
- [ ] Local results unchanged; export/clear still work; story progress untouched.
- [ ] Pure transform functions covered by new system checks (shape, mapping,
      story-excluded, no typed answers, attemptId reuse).
- [ ] No Firebase calls in the headless check harness (transforms are pure).

## Suggested 3B system checks (pure, no network)
1. `toAdventureAttempt(local)` produces required fields + `source:"adventure"`.
2. Story missions are excluded from cloud save (`shouldCloudSave` returns false).
3. `studentAnswer` is omitted from the cloud attempt by default.
4. Cloud attempt reuses the local `attemptId` (idempotent id).
5. `toCompactAchievement` includes the existing dashboard field names + `tool`.
6. `masteryTopic` maps each Adventure topic to its MMT name.
7. Skip/demo → `shouldCloudSave` false → no-op.
8. Existing 192 checks still pass; no `src/cloud/*` import pulls Firebase at test time.

## Out of scope for 3B (explicitly)
Task assignment, class topic gating, summaries-as-Function, teacher Adventure tab,
custom claims. These are 3C/3D once the live rules + Functions decision (questions
2–3) are settled.

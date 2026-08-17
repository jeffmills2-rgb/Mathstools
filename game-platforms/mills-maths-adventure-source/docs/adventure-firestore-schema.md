# Adventure Firestore Schema (Phase 3A plan)

Exact collection shapes for the Mills Maths Adventure cloud layer, inside the
existing `mills-maths-tools` Firebase project. Connects to existing identity via
`studentCode`, `teacherCode`, `className`. **Planning only — not implemented.**

Conventions:
- Code normalisation (reuse the quiz/admin function):
  `String(code).trim().toUpperCase().replace(/[^A-Z0-9-]/g,'')`.
- `classSlug(className) = className.trim().toUpperCase().replace(/[^A-Z0-9]/g,'')`.
- `classId = ${teacherCode}__${classSlug}` (deterministic; no admin change needed).
- Timestamps: `createdAt`/`updatedAt` = `serverTimestamp()`; `*AtClient` = ISO string.
- Denormalised display fields (name/class/teacher/school) are **copied from
  `students/{studentCode}` at write time** for fast teacher reporting; the student
  profile is never duplicated as a record.

Existing collections (`students`, `teachers`, `achievements`) are **unchanged**.

---

## `adventureClasses/{classId}`  — class config (broad practice + lifecycle)

- **id:** `${teacherCode}__${classSlug}` (deterministic).
- **created/updated by:** teacher (or admin) build.
- **read by:** teacher build (own classes); student build (its own class, to know
  `allowedTopics`).
- **kept after archive:** yes (set `archived:true`, `active:false`).

```jsonc
{
  "classId": "MILLS4821__7M",
  "teacherCode": "MILLS4821",
  "className": "7M",
  "school": "Example High School",
  "classCode": null,                 // optional friendly code if admin generates one
  "allowedTopics": ["integers","fdp","algebra","area"],   // Adventure topic ids
  "active": true,
  "archived": false,
  "createdAt": "<serverTimestamp>",
  "updatedAt": "<serverTimestamp>",
  "createdBy": "MILLS4821",          // teacherCode
  "schemaVersion": 1
}
```

Required: `classId, teacherCode, className, allowedTopics, active`.
Optional: `school, classCode, archived`.

---

## `adventureTasks/{taskId}`  — a required mission assigned to a class

- **id:** auto-id (`taskId`).
- **created/updated by:** teacher build.
- **read by:** teacher build (own tasks); student build (active, non-expired tasks
  for its class).
- **kept after expiry/archive:** yes (only hidden from the student required list).

```jsonc
{
  "taskId": "<auto>",
  "classId": "MILLS4821__7M",
  "teacherCode": "MILLS4821",
  "className": "7M",
  "school": "Example High School",
  "title": "Integer Foundations (set task)",
  "missionKind": "requiredTask",
  "appliesToWholeClass": true,
  "missionConfig": {                 // generated on-device per student
    "stage": "stage4",
    "topicIds": ["integers"],
    "skillIds": ["addingIntegers","subtractingIntegers","mixedIntegerOperations"],
    "difficultyRange": { "min": 1, "max": 3 },
    "questionCount": 10,
    "adaptiveOn": true,
    "passThreshold": 0.6
  },
  "status": "active",                // draft | active | expired | archived
  "activeFrom": "<serverTimestamp>",
  "expiresAt": "<timestamp>",        // effectiveStatus=expired when now > expiresAt
  "createdAt": "<serverTimestamp>",
  "updatedAt": "<serverTimestamp>",
  "createdBy": "MILLS4821",
  "schemaVersion": 1
}
```

Required: `taskId, classId, teacherCode, title, missionKind, missionConfig, status`.
Optional: `expiresAt` (no expiry = perpetual), `appliesToWholeClass, school`.

**Effective status (client):** `expired` if `expiresAt` exists and `now > expiresAt`,
else the stored `status`. The student "required" list = tasks where
`effectiveStatus==='active'` AND not completed (per summary).

---

## `adventureAttempts/{attemptId}`  — every completed attempt (rich)

- **id:** the local `attemptId` from `resultTypes.makeAttemptId()` (so a local
  record and its cloud copy share an id; idempotent re-writes are safe).
- **created by:** student build, on the **finish path only** (no abandoned saves).
- **read by:** teacher build. Student build does not need to re-read its history.
- **updated/deleted:** never from the client (create-only).
- **kept:** permanently.

```jsonc
{
  "attemptId": "attempt-ab12-3-x9k2",
  "source": "adventure",
  "appVersion": "2P",
  // identity (denormalised from students/{studentCode})
  "studentCode": "ZK7Q2",
  "studentName": "Jordan Smith",
  "firstName": "Jordan", "surname": "Smith",
  "className": "7M", "teacherCode": "MILLS4821",
  "teacherName": "A. Mills", "school": "Example High School",
  // mission context
  "missionKind": "requiredTask",     // requiredTask|broadPractice|preset|teacher|demo (never story)
  "taskId": "<auto|null>",           // null for broadPractice/preset/teacher
  "classId": "MILLS4821__7M",
  "missionId": "y7-integer-foundations",
  "missionTitle": "Integer Foundations",
  "stage": "stage4",
  "topicIds": ["integers"], "topicNames": ["Integers"],
  "skillIds": ["addingIntegers","mixedIntegerOperations"],
  "skillNames": ["Adding Integers","Mixed Operations"],
  "difficultyRange": { "min": 1, "max": 3 },
  "adaptiveOn": true,
  "passThreshold": 0.6,
  // result
  "questionCount": 10, "correctCount": 8, "percentage": 80, "passed": true,
  "startedAt": "<ms>", "completedAt": "<ms>", "durationSeconds": 142,
  "xpAwarded": 60,
  "answerModeSummary": "simple:7/8; comparison:1/2",
  // question-level snapshot (NO typed answers by default)
  "questionResults": [
    {
      "questionId": "stage4.integers.addingIntegers.L1.x",
      "promptSnapshot": "-4 + 9",          // safe snapshot so reports survive generator changes
      "topicId": "integers", "skillId": "addingIntegers",
      "difficultyLevel": 1, "answerMode": "simple",
      "expectedAnswer": "5",                // canonical expected (safe)
      "correct": true,
      "partResults": null,                  // [bool] for multiPart/tableInput
      "diagramType": null, "sourceType": "legacy-adapter"
      // "studentAnswer": OMITTED by default (privacy). Optional only if class flag set.
    }
  ],
  "createdAt": "<serverTimestamp>",
  "createdAtClient": "<ISO>",
  "schemaVersion": 1
}
```

Required: `attemptId, studentCode, missionKind, missionId, questionCount,
correctCount, percentage, passed, completedAt, questionResults`.
Privacy: `studentAnswer` is **omitted** unless an explicit class/task
`storeTypedAnswers` flag is set (deferred decision).

This maps 1:1 from the local `resultTypes` record (Phase 2L): add
`promptSnapshot`/`expectedAnswer` (already present locally as `text`/
`expectedAnswer`) and drop `studentAnswer`.

---

## `adventureStudentTaskSummaries/{summaryId}`  — fast teacher roll-up

- **id:** `${taskId}__${studentCode}` (deterministic; one per task+student).
- **created/updated by:** **prototype:** student build (guarded merge after each
  completed attempt). **production:** a Cloud Function trigger on `adventureAttempts`.
- **read by:** teacher build (primary completion table).
- **kept:** permanently.

```jsonc
{
  "summaryId": "TASK123__ZK7Q2",
  "taskId": "TASK123",
  "classId": "MILLS4821__7M",
  "studentCode": "ZK7Q2",
  "studentName": "Jordan Smith",
  "className": "7M", "teacherCode": "MILLS4821",
  "missionTitle": "Integer Foundations",
  "attemptCount": 3,
  "completed": true,
  "passedEver": true,
  "bestAttemptId": "attempt-...-best",
  "bestPercent": 80,
  "bestPassed": true,
  "latestAttemptId": "attempt-...-latest",
  "latestPercent": 70,
  "firstCompletedAt": "<ms>", "lastCompletedAt": "<ms>",
  "topicSummary": [ { "topicId": "integers", "avgPercent": 78 } ],
  "skillSummary": [ { "skillId": "addingIntegers", "correct": 6, "questions": 8, "avgPercent": 75 } ],
  "needsSupport": false,             // bestPercent < passThreshold*100
  "suggestedNextStep": "Secure on Integers — try Mixed Year 7 Review.",
  "updatedAt": "<serverTimestamp>",
  "schemaVersion": 1
}
```

**Best attempt is stored** (not recomputed): on each completed attempt, update
`attemptCount`, `latest*`, and `best*` if `percentage > bestPercent`, recompute
`completed/passedEver/needsSupport`.

---

## `adventurePracticeSummaries/{studentCode}`  *(optional)* — broad-practice roll-up

- **id:** `studentCode`. One per student; broad practice has no task.
- Same idea as the task summary but keyed per student + topic, e.g.
  `{ studentCode, className, teacherCode, byTopic: [{topicId, attempts, bestPercent, avgPercent, lastAt}], updatedAt }`.
- Optional in 3B — broad-practice attempts already live in `adventureAttempts`
  with `missionKind:"broadPractice"`; this is only for fast display.

---

## Required composite indexes (when queries are added)

- `adventureTasks`: `classId ==` + `status ==` (+ optionally `expiresAt` ordering).
- `adventureAttempts`: `teacherCode ==` + `completedAt desc`; `studentCode ==` +
  `completedAt desc`; `taskId ==` + `completedAt desc`.
- `adventureStudentTaskSummaries`: `teacherCode ==` (+ `taskId ==`).

(Define in `firestore.indexes.json` during 3B/3C.)

---

## Mapping to existing local types

| Local (`src/results/resultTypes.js`) | Cloud `adventureAttempts` |
|---|---|
| `attemptId` | `attemptId` (same id) |
| `missionKind` (story/teacher/free/preset/practice) | `missionKind` (+ `requiredTask`/`broadPractice`/`demo`; `story` never uploaded) |
| `studentName` | `studentName` (overwritten from `students/{code}` when registered) |
| `studentCode` | `studentCode` (the login code) |
| `topicIds/topicNames/skillIds/skillNames` | same |
| `questionResults[].text` | `questionResults[].promptSnapshot` |
| `questionResults[].expectedAnswer` | same (kept) |
| `questionResults[].studentAnswer` | **omitted** by default |
| `percentage/passed/correctCount/questionCount/...` | same |

The local result record is already "Firebase-ready" (Phase 2L `FIREBASE_RESULT_FIELDS`);
the cloud writer is a thin transform, not a redesign of `resultStore`.

# Local Results & Reporting (Phase 2L)

A **local-only** attempt history + reporting foundation. No Firebase, no login,
no class/task codes (only documented placeholders). The record shape is aligned
with a future Firestore document so the cloud move is a storage swap.

## Files
- `resultTypes.js` — record shape, `normaliseResult`/`validateResult`, mastery
  status rule, and field constants (`RESULT_RECORD_FIELDS`,
  `QUESTION_RESULT_FIELDS`, `FIREBASE_RESULT_FIELDS`).
- `resultUtils.js` — pure aggregation (`summariseByTopic`, `summariseBySkill`,
  `summariseByAnswerMode`, `teacherSummary`, `studentProgress`) + export
  (`toJSON`, `toCSV`).
- `resultStore.js` — zustand store over its OWN localStorage key
  (`mills-maths-adventure:results`), with dedupe, a cap (`MAX_RESULTS = 200`,
  newest kept), and robust loading.

## How a result is created
`MathsEncounter` records one question-result per `Check`, and on finish saves a
single attempt record (guarded so a re-render can't duplicate it). **Try again**
remounts the run → a fresh `attemptId` → a new attempt. **Leaving mid-attempt**
never reaches the finish path, so nothing is saved (an `abandoned` status is
reserved in `ATTEMPT_STATUS` but not yet captured — documented for later).

## Stored per attempt
Mission/topic/skill metadata, difficulty range, pass threshold,
correct/percentage/passed/status (`completed` ≥ threshold, else `failed`),
timing, XP/coins/badge, routedTarget, `source:"local"`, placeholder
class/task/student/createdBy codes, and a `questionResults[]` array with the
prompt, answer mode, student answer, expected/acceptable answers, correctness,
and `partResults` for multiPart/tableInput.

## Scoring
A question is correct only when all parts/cells are (the Phase 2K policy);
`partResults` are stored for per-part feedback. Attempt percentage = correct /
questionCount; passed = percentage ≥ passThreshold·100 (default 60%).

## Topic / skill status rule
`statusForAverage(avg, attempts)`: none → **Not attempted**, <50% → **Needs
practice**, 50–79% → **Developing**, ≥80% → **Secure**.

## Storage safety
Separate localStorage key from game progress, so **clearing results never
touches story/mission progress**. Old saves with no result data start empty;
malformed entries are dropped on load; the history is capped at 200 attempts.

## Future Firebase shape
`FIREBASE_RESULT_FIELDS` documents the Firestore document a teacher dashboard
would use (attemptId, missionId, taskCode, classCode, studentCode, studentName,
started/completedAt, score, percentage, passed, topicBreakdown, skillBreakdown,
questionResults, answerModeResults, created/updatedAt). The breakdowns are
derived by `resultUtils` from the stored attempts. Only `resultStore.js`'s
load/save would change for the cloud move.

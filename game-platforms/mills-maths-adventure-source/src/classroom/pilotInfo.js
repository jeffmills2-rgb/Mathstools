/**
 * CLASSROOM PILOT INFO (Phase 2P) — pure data for the Year 7 pilot dry run.
 *
 * The teacher-facing launch card, the local-only warning, and a short dry-run
 * checklist live here as plain data so the UI and the system checks share ONE
 * source of truth. No React, no stores, no Firebase — this is a LOCAL prototype.
 */

// The one-line warning shown wherever results can be cleared/lost.
export const LOCAL_ONLY_WARNING =
  "Results are saved on this device only. Export or copy results before clearing browser data or switching devices.";

// Short, practical teacher launch workflow.
export const PILOT_WORKFLOW = [
  "Ask each student to enter a display name and (optional) student code.",
  "Go to the Mission Board → Year 7 Missions.",
  "Recommended first mission: Mixed Year 7 Review or Integer Foundations.",
  "Students aim for 60% or higher to pass.",
  "Results save on this device only (no cloud yet).",
  "Use the Results Centre to filter and export attempts.",
  "Export results (JSON/CSV) BEFORE clearing local results.",
];

// A dry-run checklist a teacher can work through before a real lesson.
export const PILOT_CHECKLIST = [
  "Start as Student A (enter name + code).",
  "Complete Integer Foundations.",
  "Fail one mission on purpose.",
  "Retry that mission (a new attempt is created).",
  "Open the Results Centre and export the attempts CSV.",
  "Change to Student B (new name + code).",
  "Complete another Year 7 preset.",
  "Filter the Results Centre by name/code.",
  "Clear results ONLY after exporting.",
];

// Known limitations to set expectations for the pilot.
export const PILOT_LIMITATIONS = [
  "Local prototype: results live in this browser/device only.",
  "No cloud collection, accounts, or class sync yet.",
  "Clearing browser data removes saved results — export first.",
];

// Cloud mode note (Phase 3B). Cloud save is opt-in via a student code; demo and
// "not signed in" stay local only. Local results + exports always work.
export const CLOUD_NOTE =
  "Cloud save only happens when a student signs in with a valid student code. " +
  "Demo mode and 'not signed in' stay on this device only. Local results and " +
  "exports work either way.";

export const PILOT_CARD = {
  title: "Teacher Pilot — Year 7 local dry run",
  warning: LOCAL_ONLY_WARNING,
  cloudNote: CLOUD_NOTE,
  workflow: PILOT_WORKFLOW,
  checklist: PILOT_CHECKLIST,
  limitations: PILOT_LIMITATIONS,
  recommendedFirstMissions: ["y7-mixed-review", "y7-integer-foundations"],
};

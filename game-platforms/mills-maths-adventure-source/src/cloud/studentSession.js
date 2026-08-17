/**
 * STUDENT SESSION HELPERS (Phase 3B) — PURE code/profile helpers shared by the
 * cloud session store. Imports nothing (testable in Node).
 */

// EXACT same normalisation the existing MMT quiz/admin/dashboards use, so codes
// match across tools: trim, uppercase, keep only A–Z, 0–9 and hyphen.
export function normaliseStudentCode(code) {
  return String(code || "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

/** Is a fetched student document usable for a registered session? */
export function studentIsActive(student) {
  return Boolean(student) && student.active !== false;
}

/** A short chip label, e.g. "Alex · 7MAB". Name comes from the Firebase profile. */
export function studentChipLabel(student) {
  if (!student) return "";
  const name = student.name || [student.firstName, student.surname].filter(Boolean).join(" ") || "Student";
  return student.className ? `${name} · ${student.className}` : name;
}

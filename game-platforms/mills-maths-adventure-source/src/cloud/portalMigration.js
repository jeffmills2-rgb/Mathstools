/**
 * PORTAL MIGRATION MANIFEST (Phase 3D.1) — single source of truth for the
 * secure-code-exchange migration of the external MMT portals + quiz template
 * (which live in /portals as standalone HTML, outside the app build).
 *
 * Each entry declares the markers a migrated file MUST contain and MUST NOT
 * contain. The pure system checks (runPortalMigrationChecks) verify this manifest
 * is the SECURE shape; the headless verify harness additionally greps the real
 * /portals/*.html files against the same manifest, so the two cannot drift.
 *
 * No Firebase / network / filesystem access from this module — it is plain data.
 */

export const EXCHANGE_FN = Object.freeze({ student: "exchangeStudentCode", teacher: "exchangeTeacherCode" });

export const PORTAL_FILES = Object.freeze([
  {
    id: "studentDashboard",
    file: "portals/student-dashboard.html",
    label: "Student Dashboard",
    mustContain: [
      "exchangeStudentCode",          // secure code exchange
      "signInWithCustomToken",        // custom-token sign-in
      "getFunctions",                 // functions SDK
      "where('studentCode', '==', currentStudent.studentCode)", // own-achievements read
    ],
    mustNotContain: [
      "signInAnonymously",            // no anonymous auth
      "where('className', '==', currentStudent.className)", // class leaderboard removed
    ],
  },
  {
    id: "teacherDashboard",
    file: "portals/teacher-dashboard.html",
    label: "Teacher Dashboard",
    mustContain: [
      "exchangeTeacherCode",
      "signInWithCustomToken",
      "getFunctions",
      "where('teacherCode','==',currentTeacher.teacherCode)",   // teacher-scoped student list
      "where('teacherCode','==',currentTeacher.teacherCode)",   // teacher-scoped achievements
      "disabled here under the secure rules model",             // student writes disabled
    ],
    mustNotContain: [
      "signInAnonymously",
      "await setDoc(doc(db,COLLECTIONS.students,studentCode),record)", // client identity write removed
    ],
  },
  {
    id: "quizTemplate",
    file: "portals/algebraic-techniques.html",
    label: "Quiz template (Algebraic Techniques)",
    mustContain: [
      "exchangeStudentCode",
      "signInWithCustomToken",
      "getFunctions",
      "addDoc(collection(db, 'achievements')",  // compact achievement save preserved
      "xpEarned",                               // XP fields preserved
      "Guest mode",                             // skip/demo path preserved
      "isAssignmentLink",                       // assignment link mode preserved
    ],
    mustNotContain: [
      "signInAnonymously",
      "await getDoc(doc(db, 'students', code))", // direct student read removed
    ],
  },
  {
    id: "adminConsole",
    file: "portals/admin-console.html",
    label: "Admin Console",
    mustContain: [
      "secureRulesWarning",                 // visible warning banner
      "Admin identity writes are disabled", // clear message
      "WRITE_DISABLED_MSG",                 // write controls intercepted
    ],
    mustNotContain: [
      // No admin secret / service-account material in client code.
      "privateKey", "service_account", "AIzaSyADMIN",
    ],
  },
]);

// What each portal can/can't do under the Phase 3D claim rules once migrated.
export const RULES_READINESS = Object.freeze([
  { id: "student-read-own-profile", ok: true, how: "student claim get students/{ownCode}" },
  { id: "student-read-own-achievements", ok: true, how: "query achievements where studentCode == own (claim-scoped)" },
  { id: "student-create-own-achievement", ok: true, how: "create achievements where studentCode == claim" },
  { id: "teacher-read-own-teacher-profile", ok: true, how: "teacher claim get teachers/{ownCode}" },
  { id: "teacher-query-students-by-teacherCode", ok: true, how: "query students where teacherCode == claim" },
  { id: "teacher-query-achievements-by-teacherCode", ok: true, how: "query achievements where teacherCode == claim" },
  { id: "no-client-identity-writes", ok: true, how: "students/teachers create/update/delete denied" },
  { id: "no-result-update-delete", ok: true, how: "achievements/adventureAttempts update/delete denied" },
  { id: "student-class-leaderboard", ok: false, how: "read by className denied — disabled in dashboard" },
  { id: "teacher-legacy-in-queries", ok: false, how: "studentCode/code IN queries not teacher-scoped — best-effort try/catch" },
]);

// Quizzes still on the OLD anonymous pattern that must be migrated with the same
// recipe before the Phase 3D rules are deployed (the canonical template above is
// algebraic-techniques.html). Update this list as the real quiz set is migrated.
export const QUIZZES_PENDING_MIGRATION = Object.freeze([
  "integers quiz", "fdp quiz", "area quiz", "pythagoras quiz",
  "any other Firebase-enabled quiz pages using signInAnonymously + getDoc(students/{code})",
]);

export const MIGRATION_RECIPE = Object.freeze([
  "Import getFunctions + httpsCallable; import signInWithCustomToken (drop signInAnonymously).",
  "On connect: init app/auth/db/functions only — no sign-in.",
  "On code entry: httpsCallable(functions,'exchangeStudentCode')({studentCode, pin?}) → signInWithCustomToken(auth, token) → use returned profile.",
  "Keep create-only achievements write with studentCode from the returned profile.",
  "Skip/demo stays local (no sign-in, no save).",
]);

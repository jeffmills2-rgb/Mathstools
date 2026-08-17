/**
 * PLATFORM MANIFEST (Phase 4A) — single source of truth for the secure markers
 * the new static platform (portal/) must contain / must not contain. The pure
 * system checks (runPlatformChecks) validate this manifest is the SECURE shape;
 * the headless verify harness additionally greps the real portal/*.html + shared
 * client against the same manifest, so intent and files cannot drift.
 *
 * Plain data — no Firebase / DOM / filesystem.
 */
export const PLATFORM_FILES = Object.freeze([
  {
    id: "studentPlatform",
    file: "portal/student/index.html",
    label: "Student Platform",
    mustContain: [
      "loginStudent",                                   // shared secure login
      'where("studentCode","==", current.studentCode)', // own-achievements read
    ],
    mustNotContain: ["signInAnonymously", 'getDoc(doc(db, "students"'],
  },
  {
    id: "teacherPlatform",
    file: "portal/teacher/index.html",
    label: "Teacher Platform",
    mustContain: [
      "loginTeacher",
      'where("teacherCode","==", teacher.teacherCode)', // teacher-scoped students + achievements
      "COLLECTIONS.adventureAttempts",                  // rich attempts query present
      "adventureAttempts not available",                // graceful fallback note
    ],
    mustNotContain: ["signInAnonymously", 'getDoc(doc(db, "teachers"'],
  },
  {
    id: "sharedClient",
    file: "portal/shared/codeExchangeClient.js",
    label: "Shared code-exchange client",
    mustContain: ["loginStudent", "loginTeacher", "EXCHANGE_FUNCTIONS", "signInWithCustomToken", "signOut"],
    mustNotContain: ["signInAnonymously"],
  },
  {
    id: "sharedConfig",
    file: "portal/shared/firebaseConfig.js",
    label: "Shared Firebase config",
    mustContain: ["exchangeStudentCode", "exchangeTeacherCode", "adventureAttempts"],
    mustNotContain: ["privateKey", "service_account"],
  },
  {
    id: "adminPlatform",
    file: "portal/admin/index.html",
    label: "Admin disabled page",
    mustContain: ["temporarily disabled", "Firebase Console"],
    mustNotContain: ["privateKey", "service_account", "signInAnonymously", "setDoc(", "deleteDoc("],
  },
]);

// Docs/templates that must exist for the platform to be complete.
export const PLATFORM_DOCS = Object.freeze([
  "docs/phase-4a-platform-rebuild.md",
  "docs/quiz-migration-guide.md",
  "portal/README.md",
]);

// Rules-readiness for the platform under firestore.phase3d.claims.rules.
export const PLATFORM_RULES_READINESS = Object.freeze([
  { id: "student-reads-own-achievements", ok: true },
  { id: "teacher-reads-students-by-teacherCode", ok: true },
  { id: "teacher-reads-achievements-by-teacherCode", ok: true },
  { id: "teacher-reads-attempts-by-teacherCode", ok: true },
  { id: "no-client-identity-writes", ok: true },
  { id: "no-result-update-delete", ok: true },
  { id: "attempts-create-only", ok: true },
  { id: "default-deny", ok: true },
]);

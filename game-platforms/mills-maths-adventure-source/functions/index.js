/**
 * Mills Maths Tools — Cloud Functions (Phase 3D): SECURE CODE EXCHANGE.
 *
 * NOT deployed from this repo automatically. Deploy manually:
 *   cd functions && npm install && firebase deploy --only functions
 *
 * Two callable functions validate a typed code SERVER-SIDE with the Admin SDK
 * (which bypasses Firestore rules) and mint a Firebase Auth CUSTOM TOKEN with
 * small role claims. The client signs in with that token; claim-based Firestore
 * rules (firestore.phase3d.claims.rules) then scope all reads/writes.
 *
 * The validation/claim/profile logic mirrors the pure module
 * src/cloud/codeExchange.js (kept in sync; that module is unit-tested headlessly).
 */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// EXACT same normalisation as the rest of the MMT ecosystem.
function normaliseCode(code) {
  return String(code || "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}
function fullName(d) {
  return d.name || [d.firstName, d.surname].filter(Boolean).join(" ") || "Student";
}

/**
 * exchangeStudentCode({ studentCode, pin? }) →
 *   { token, profile, claims }
 * Rejects missing / inactive students and bad PINs. Custom-token uid is
 * `student:<CODE>` with role claims.
 */
exports.exchangeStudentCode = onCall(async (request) => {
  const code = normaliseCode(request.data && request.data.studentCode);
  if (!code) throw new HttpsError("invalid-argument", "Enter your student code.");

  const snap = await db.collection("students").doc(code).get();
  if (!snap.exists) throw new HttpsError("not-found", "Student code not found.");
  const doc = { studentCode: code, ...snap.data() };

  if (doc.active === false) throw new HttpsError("permission-denied", "This student code is not active.");
  const requiredPin = doc.pin || doc.studentPin || doc.dashboardPin;
  if (requiredPin && String((request.data && request.data.pin) || "") !== String(requiredPin)) {
    throw new HttpsError("permission-denied", "Incorrect PIN. Check it with your teacher.");
  }

  const claims = {
    role: "student",
    studentCode: code,
    teacherCode: doc.teacherCode || "",
    className: doc.className || "",
    school: doc.school || "",
  };
  const token = await admin.auth().createCustomToken(`student:${code}`, claims);
  const profile = {
    studentCode: code,
    firstName: doc.firstName || "",
    surname: doc.surname || "",
    name: fullName(doc),
    className: doc.className || "",
    teacherCode: doc.teacherCode || "",
    teacherName: doc.teacherName || doc.teacher || "",
    school: doc.school || "",
    // The student's saved explorer avatar (W3-B), if they've designed one. The
    // game applies this on sign-in so their character follows them across devices.
    avatar: sanitiseAvatar(doc.avatar),
  };
  return { token, profile, claims };
});

/**
 * Whitelist + type-clamp the customisable player avatar (W3-B). Only known keys
 * with the expected primitive types survive; anything else is dropped. Returns
 * null when there's nothing usable (so a brand-new student has no saved avatar).
 */
function sanitiseAvatar(a) {
  if (!a || typeof a !== "object") return null;
  const hex = (v, fb) => (typeof v === "string" && /^#[0-9a-fA-F]{3,8}$/.test(v) ? v : fb);
  const pick = (v, allowed, fb) => (allowed.includes(v) ? v : fb);
  const out = {
    color: hex(a.color, "#3a86ff"),
    skin: hex(a.skin, "#f1c27d"),
    hair: hex(a.hair, "#3b2a1a"),
    hairStyle: pick(a.hairStyle, ["none", "short", "long", "bun", "spiky"], "short"),
    hat: pick(a.hat, ["none", "cap", "beanie"], "none"),
    hatColour: hex(a.hatColour, "#e63946"),
    glasses: Boolean(a.glasses),
  };
  return out;
}

/**
 * setStudentAvatar({ avatar }) → { ok, avatar }
 *
 * Caller MUST be signed in as a student (role:"student" claim from
 * exchangeStudentCode). The avatar is written to the CALLER'S OWN
 * students/{code} doc (code taken from the verified claim, never client input),
 * so a student can only change their own character. Admin SDK write (bypasses
 * client-write rules); no typed answers or PII are stored — just cosmetic choices.
 */
exports.setStudentAvatar = onCall(async (request) => {
  const auth = request.auth;
  if (!auth || auth.token.role !== "student" || !auth.token.studentCode) {
    throw new HttpsError("permission-denied", "Sign in with your student code first.");
  }
  const code = normaliseCode(auth.token.studentCode);
  const avatar = sanitiseAvatar(request.data && request.data.avatar);
  if (!avatar) throw new HttpsError("invalid-argument", "No avatar to save.");
  await db.collection("students").doc(code).set(
    { avatar, avatarUpdatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );
  return { ok: true, avatar };
});

/**
 * exchangeTeacherCode({ teacherCode }) → { token, profile, claims }
 * Rejects missing / inactive teachers. uid `teacher:<CODE>` with role claims.
 */
exports.exchangeTeacherCode = onCall(async (request) => {
  const code = normaliseCode(request.data && request.data.teacherCode);
  if (!code) throw new HttpsError("invalid-argument", "Enter your teacher code.");

  const snap = await db.collection("teachers").doc(code).get();
  if (!snap.exists) throw new HttpsError("not-found", "Teacher code not found.");
  const doc = { teacherCode: code, ...snap.data() };

  if (doc.active === false) throw new HttpsError("permission-denied", "This teacher code is not active.");

  const claims = { role: "teacher", teacherCode: code, school: doc.school || "" };
  const token = await admin.auth().createCustomToken(`teacher:${code}`, claims);
  const profile = {
    teacherCode: code,
    teacherName: doc.teacherName || "",
    school: doc.school || "",
    active: doc.active !== false,
  };
  return { token, profile, claims };
});

/**
 * createStudentForTeacher({ firstName, surname, className }) → safe student.
 *
 * Caller MUST be signed in as a teacher (role:"teacher" claim from
 * exchangeTeacherCode). The new student is stamped with the CALLER'S OWN
 * teacherCode (from the verified claim, never client input), so a teacher can
 * only create students in their own classes. Generates a unique student code and
 * writes server-side with the Admin SDK (bypasses Firestore client-write rules).
 * "Creating a class" = just supplying a new className.
 */
const STUDENT_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1/L

function randomStudentCode() {
  let c = "";
  for (let i = 0; i < 6; i++) c += STUDENT_CODE_ALPHABET[Math.floor(Math.random() * STUDENT_CODE_ALPHABET.length)];
  return c;
}

async function generateUniqueStudentCode() {
  for (let i = 0; i < 40; i++) {
    const code = randomStudentCode();
    const snap = await db.collection("students").doc(code).get();
    if (!snap.exists) return code;
  }
  throw new HttpsError("internal", "Could not generate a unique code. Please try again.");
}

exports.createStudentForTeacher = onCall(async (request) => {
  const auth = request.auth;
  if (!auth || auth.token.role !== "teacher" || !auth.token.teacherCode) {
    throw new HttpsError("permission-denied", "Sign in with your teacher code first.");
  }
  const teacherCode = normaliseCode(auth.token.teacherCode);
  const firstName = String((request.data && request.data.firstName) || "").trim();
  const surname = String((request.data && request.data.surname) || "").trim();
  const className = String((request.data && request.data.className) || "").trim().toUpperCase();
  const name = [firstName, surname].filter(Boolean).join(" ");
  if (!name) throw new HttpsError("invalid-argument", "Enter the student's name.");
  if (!className) throw new HttpsError("invalid-argument", "Enter a class name.");

  // Stamp teacherName / school from the teacher's own record (best effort).
  let teacherName = "", school = "";
  try {
    const t = await db.collection("teachers").doc(teacherCode).get();
    if (t.exists) { const d = t.data() || {}; teacherName = d.teacherName || ""; school = d.school || ""; }
  } catch (e) { /* best effort */ }

  const studentCode = await generateUniqueStudentCode();
  await db.collection("students").doc(studentCode).set({
    studentCode, firstName, surname, name, className,
    teacherCode, teacherName, school,
    active: true,
    createdBy: "teacher-portal",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { studentCode, firstName, surname, name, className, teacherCode, teacherName, school, active: true };
});

/**
 * createAdventureTask(payload) → safe assignment.
 *
 * Caller MUST be signed in as a teacher (role:"teacher" claim from
 * exchangeTeacherCode). The assignment is stamped with the CALLER'S OWN
 * teacherCode (from the verified claim, never client input), so a teacher can
 * only set tasks for their own classes. Writes the curriculum "mission" slice +
 * an npcId (who delivers it) + the target className to `adventureAssignments`,
 * server-side with the Admin SDK (bypasses client-write rules).
 *
 * Structural validation only here (types/ranges/npcId/className). Deep curriculum
 * validity (real stage/topic/skill ids) is enforced where the curriculum registry
 * lives: the portal builds the form from a manifest, and the game runs the
 * assignment through normaliseMission/validateMission on read.
 */
const ADVENTURE_NPCS = [
  "pip", "fern", "alby",
  "pearce", "mahoney", "ewings", "kellahan", "dawson", "heywood", "morgan", "bacon", "brookes",
];

// Fraction Farm challenge ids (mirror src/data/farm/farmRecords.js keys). A farm
// task carries location:"farm" + one of these instead of an NPC + topic.
const FARM_CHALLENGE_IDS = ["fence", "roundup", "order", "crate", "milk", "weigh", "trade", "veggie", "plank", "shop"];

// Badges a teacher task may award on completion ("get to the end" → trophy).
// Must match the game's badge catalogue (src/data/badges.js). Anything else is
// dropped to null so a task can never inject an unknown badge id.
const ADVENTURE_BADGE_IDS = ["fraction-explorer", "integer-adventurer", "algebra-apprentice", "stage4-quest-champion"];
function cleanBadge(v) {
  const s = String(v || "").trim();
  return ADVENTURE_BADGE_IDS.includes(s) ? s : null;
}

function strArray(v) {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x || "").trim()).filter(Boolean);
}
function clampInt(v, lo, hi, dflt) {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return dflt;
  return Math.min(hi, Math.max(lo, n));
}

// Build + persist a Fraction Farm challenge assignment (no NPC/topic). The game
// reads location:"farm" + challengeId, shows the objective, and writes a cloud
// completion tagged with this doc id when the student finishes the set.
async function createFarmTask(teacherCode, d) {
  const challengeId = String(d.challengeId || "").trim().toLowerCase();
  if (!FARM_CHALLENGE_IDS.includes(challengeId)) {
    throw new HttpsError("invalid-argument", "Choose a farm challenge.");
  }
  const className = String(d.className || "").trim().toUpperCase();
  if (!className) throw new HttpsError("invalid-argument", "Choose a class.");
  const dueAt = Number.isFinite(Number(d.dueAt)) && Number(d.dueAt) > 0 ? Math.round(Number(d.dueAt)) : null;
  const ref = db.collection("adventureAssignments").doc();
  const now = Date.now();
  const assignment = {
    assignmentId: ref.id,
    location: "farm",
    challengeId,
    npcId: `farm-${challengeId}-sign`,
    title: String(d.title || "").trim() || "Farm challenge task",
    description: String(d.description || "").trim(),
    stages: [], selectedTopics: [], selectedSkills: [],
    difficultyRange: { min: 1, max: 5 }, adaptiveOn: true, requiredQuestions: 15,
    completionCriteria: { type: "answered", count: 15 }, passThreshold: 0,
    rewardXP: clampInt(d.rewardXP, 0, 1000, 50), rewardCoins: clampInt(d.rewardCoins, 0, 1000, 30),
    rewardBadge: cleanBadge(d.rewardBadge),
    teacherCode, className,
    createdBy: "teacher-portal",
    createdAtServer: admin.firestore.FieldValue.serverTimestamp(),
    assignedAt: now, dueAt, active: true,
  };
  await ref.set(assignment);
  return { ...assignment, createdAtServer: now };
}

exports.createAdventureTask = onCall(async (request) => {
  const auth = request.auth;
  if (!auth || auth.token.role !== "teacher" || !auth.token.teacherCode) {
    throw new HttpsError("permission-denied", "Sign in with your teacher code first.");
  }
  const teacherCode = normaliseCode(auth.token.teacherCode);
  const d = request.data || {};

  // Fraction Farm challenge task takes a different (NPC-free) shape.
  if (String(d.location || "").trim().toLowerCase() === "farm") {
    return await createFarmTask(teacherCode, d);
  }

  const npcId = String(d.npcId || "").trim().toLowerCase();
  if (!ADVENTURE_NPCS.includes(npcId)) {
    throw new HttpsError("invalid-argument", "Choose a character (Pip, Fern or Alby).");
  }
  const className = String(d.className || "").trim().toUpperCase();
  if (!className) throw new HttpsError("invalid-argument", "Choose a class.");

  const stages = strArray(d.stages);
  if (stages.length === 0) throw new HttpsError("invalid-argument", "Choose at least one stage.");
  const selectedTopics = strArray(d.selectedTopics);
  if (selectedTopics.length === 0) throw new HttpsError("invalid-argument", "Choose at least one topic.");
  const selectedSkills = strArray(d.selectedSkills); // empty = all skills of topics

  const min = clampInt(d.difficultyRange && d.difficultyRange.min, 1, 5, 1);
  const max = Math.max(min, clampInt(d.difficultyRange && d.difficultyRange.max, 1, 5, 5));
  const requiredQuestions = clampInt(d.requiredQuestions, 1, 50, 10);
  const ccType = (d.completionCriteria && d.completionCriteria.type) === "correct" ? "correct" : "answered";
  const ccCount = clampInt(d.completionCriteria && d.completionCriteria.count, 1, 50, requiredQuestions);
  const ptRaw = typeof d.passThreshold === "number" ? d.passThreshold : 0.6;
  const passThreshold = Math.min(1, Math.max(0, ptRaw));

  const dueAt = Number.isFinite(Number(d.dueAt)) && Number(d.dueAt) > 0 ? Math.round(Number(d.dueAt)) : null;

  const ref = db.collection("adventureAssignments").doc();
  const now = Date.now();
  const assignment = {
    assignmentId: ref.id,
    npcId,
    title: String(d.title || "").trim() || "Teacher task",
    description: String(d.description || "").trim(),
    stages,
    selectedTopics,
    selectedSkills,
    difficultyRange: { min, max },
    adaptiveOn: d.adaptiveOn !== false,
    requiredQuestions,
    completionCriteria: { type: ccType, count: ccCount },
    passThreshold,
    rewardXP: clampInt(d.rewardXP, 0, 1000, 50),
    rewardCoins: clampInt(d.rewardCoins, 0, 1000, 30),
    rewardBadge: cleanBadge(d.rewardBadge),
    teacherNotes: String(d.teacherNotes || "").trim(),
    // --- scoping / lifecycle (server-stamped) ---
    location: "island",
    teacherCode,
    className,
    createdBy: "teacher-portal",
    createdAtServer: admin.firestore.FieldValue.serverTimestamp(),
    assignedAt: now,
    dueAt,
    active: true,
  };
  await ref.set(assignment);
  // Return a JSON-safe copy (serverTimestamp isn't serialisable).
  return { ...assignment, createdAtServer: now };
});

/**
 * updateAdventureTask({ assignmentId, ...fields }) → safe assignment.
 *
 * Teacher-only. Edits a task the caller owns (verified by teacherCode claim vs
 * the stored doc) instead of remove-and-recreate. Re-validates the same fields
 * as createAdventureTask. teacherCode/createdAt/active/assignmentId are NOT
 * changed here (use setAdventureTaskActive to enable/disable).
 */
exports.updateAdventureTask = onCall(async (request) => {
  const auth = request.auth;
  if (!auth || auth.token.role !== "teacher" || !auth.token.teacherCode) {
    throw new HttpsError("permission-denied", "Sign in with your teacher code first.");
  }
  const teacherCode = normaliseCode(auth.token.teacherCode);
  const d = request.data || {};
  const assignmentId = String(d.assignmentId || "").trim();
  if (!assignmentId) throw new HttpsError("invalid-argument", "Missing assignmentId.");

  const ref = db.collection("adventureAssignments").doc(assignmentId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Task not found.");
  if (normaliseCode((snap.data() || {}).teacherCode) !== teacherCode) {
    throw new HttpsError("permission-denied", "You can only change your own tasks.");
  }

  // Farm task edit (challenge + class + due only — no NPC/topic).
  if (String(d.location || "").trim().toLowerCase() === "farm"
      || String((snap.data() || {}).location || "") === "farm") {
    const challengeId = String(d.challengeId || "").trim().toLowerCase();
    if (!FARM_CHALLENGE_IDS.includes(challengeId)) throw new HttpsError("invalid-argument", "Choose a farm challenge.");
    const className = String(d.className || "").trim().toUpperCase();
    if (!className) throw new HttpsError("invalid-argument", "Choose a class.");
    const dueAt = Number.isFinite(Number(d.dueAt)) && Number(d.dueAt) > 0 ? Math.round(Number(d.dueAt)) : null;
    await ref.update({
      location: "farm", challengeId, npcId: `farm-${challengeId}-sign`,
      className, dueAt, rewardBadge: cleanBadge(d.rewardBadge),
      title: String(d.title || "").trim() || "Farm challenge task",
      description: String(d.description || "").trim(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const after = (await ref.get()).data() || {};
    return { ...after, assignmentId, createdAtServer: undefined };
  }

  const npcId = String(d.npcId || "").trim().toLowerCase();
  if (!ADVENTURE_NPCS.includes(npcId)) throw new HttpsError("invalid-argument", "Choose a character (Pip, Fern or Alby).");
  const className = String(d.className || "").trim().toUpperCase();
  if (!className) throw new HttpsError("invalid-argument", "Choose a class.");
  const stages = strArray(d.stages);
  if (stages.length === 0) throw new HttpsError("invalid-argument", "Choose at least one stage.");
  const selectedTopics = strArray(d.selectedTopics);
  if (selectedTopics.length === 0) throw new HttpsError("invalid-argument", "Choose at least one topic.");
  const selectedSkills = strArray(d.selectedSkills);
  const min = clampInt(d.difficultyRange && d.difficultyRange.min, 1, 5, 1);
  const max = Math.max(min, clampInt(d.difficultyRange && d.difficultyRange.max, 1, 5, 5));
  const requiredQuestions = clampInt(d.requiredQuestions, 1, 50, 10);
  const dueAt = Number.isFinite(Number(d.dueAt)) && Number(d.dueAt) > 0 ? Math.round(Number(d.dueAt)) : null;

  const patch = {
    npcId, className, stages, selectedTopics, selectedSkills,
    difficultyRange: { min, max },
    adaptiveOn: d.adaptiveOn !== false,
    requiredQuestions,
    rewardBadge: cleanBadge(d.rewardBadge),
    title: String(d.title || "").trim() || "Teacher task",
    description: String(d.description || "").trim(),
    dueAt,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await ref.update(patch);
  const after = (await ref.get()).data() || {};
  return { ...after, assignmentId, createdAtServer: undefined };
});

/**
 * setAdventureTaskActive({ assignmentId, active }) → { assignmentId, active }.
 *
 * Teacher-only. Enables/disables (soft-removes) a task the caller owns. Verifies
 * the assignment's teacherCode matches the CALLER'S OWN claim before updating, so
 * a teacher can only change their own tasks. Soft, not destructive: the doc is
 * preserved (active:false) so past attempts still resolve the task. Students only
 * ever read active==true tasks, so deactivating removes it for them immediately.
 */
exports.setAdventureTaskActive = onCall(async (request) => {
  const auth = request.auth;
  if (!auth || auth.token.role !== "teacher" || !auth.token.teacherCode) {
    throw new HttpsError("permission-denied", "Sign in with your teacher code first.");
  }
  const teacherCode = normaliseCode(auth.token.teacherCode);
  const d = request.data || {};
  const assignmentId = String(d.assignmentId || "").trim();
  if (!assignmentId) throw new HttpsError("invalid-argument", "Missing assignmentId.");
  const active = d.active === true; // default false (remove) unless explicitly true

  const ref = db.collection("adventureAssignments").doc(assignmentId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Task not found.");
  if (normaliseCode((snap.data() || {}).teacherCode) !== teacherCode) {
    throw new HttpsError("permission-denied", "You can only change your own tasks.");
  }
  await ref.update({ active, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  return { assignmentId, active };
});

/**
 * createClass({ name }) → { classId, name, teacherCode, active, existed }.
 *
 * Teacher-only. Persists a class as a first-class object so it survives reload
 * and fills the pickers even before it has any students. Doc id is deterministic
 * (`<TEACHERCODE>__<NAME>`) so re-adding the same class is idempotent; a
 * previously soft-removed class is reactivated. Stamped with the CALLER'S OWN
 * teacherCode (from the verified claim, never client input). Admin-SDK write
 * (bypasses client-write rules). Students are untouched.
 */
exports.createClass = onCall(async (request) => {
  const auth = request.auth;
  if (!auth || auth.token.role !== "teacher" || !auth.token.teacherCode) {
    throw new HttpsError("permission-denied", "Sign in with your teacher code first.");
  }
  const teacherCode = normaliseCode(auth.token.teacherCode);
  const name = String((request.data && request.data.name) || "").trim().toUpperCase();
  if (!name) throw new HttpsError("invalid-argument", "Enter a class name.");
  if (name.length > 40) throw new HttpsError("invalid-argument", "That class name is too long.");

  const classId = `${teacherCode}__${name}`;
  const ref = db.collection("classes").doc(classId);
  const existing = await ref.get();
  const wasActive = existing.exists && (existing.data() || {}).active !== false;
  await ref.set({
    classId, name, teacherCode,
    active: true,
    createdBy: "teacher-portal",
    createdAt: existing.exists ? (existing.data() || {}).createdAt || admin.firestore.FieldValue.serverTimestamp()
                               : admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  return { classId, name, teacherCode, active: true, existed: wasActive };
});

/**
 * setClassActive({ classId | name, active }) → { classId, active }.
 *
 * Teacher-only. Soft-removes (active:false) a class the caller owns so it stops
 * appearing in the pickers. Verifies the class's teacherCode matches the CALLER'S
 * OWN claim before updating. Does NOT delete or move students in that class —
 * their records are preserved (a class with students still surfaces via the
 * roster union in the portal, so you can only fully clear an EMPTY class).
 */
exports.setClassActive = onCall(async (request) => {
  const auth = request.auth;
  if (!auth || auth.token.role !== "teacher" || !auth.token.teacherCode) {
    throw new HttpsError("permission-denied", "Sign in with your teacher code first.");
  }
  const teacherCode = normaliseCode(auth.token.teacherCode);
  const d = request.data || {};
  let classId = String(d.classId || "").trim();
  if (!classId) {
    const name = String(d.name || "").trim().toUpperCase();
    if (!name) throw new HttpsError("invalid-argument", "Missing class.");
    classId = `${teacherCode}__${name}`;
  }
  const active = d.active === true; // default false (remove) unless explicitly true

  const ref = db.collection("classes").doc(classId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Class not found.");
  if (normaliseCode((snap.data() || {}).teacherCode) !== teacherCode) {
    throw new HttpsError("permission-denied", "You can only change your own classes.");
  }
  await ref.update({ active, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  return { classId, active };
});

/**
 * createDashboardTask({ className, quizzes:[{toolId,title,launchUrl?}], dueAt }) →
 *   { created:[assignment...] }.
 *
 * Teacher-only. Assigns one or more online quizzes to a class as "dashboard
 * tasks". Writes ONE doc per quiz to `dashboardAssignments` (so completion is
 * tracked per quiz and each shows as its own to-do), stamped with the CALLER'S
 * OWN teacherCode. Admin-SDK batch write (bypasses client-write rules). The
 * student portal reads active tasks for its class and shows the pop-up.
 */
exports.createDashboardTask = onCall(async (request) => {
  const auth = request.auth;
  if (!auth || auth.token.role !== "teacher" || !auth.token.teacherCode) {
    throw new HttpsError("permission-denied", "Sign in with your teacher code first.");
  }
  const teacherCode = normaliseCode(auth.token.teacherCode);
  const d = request.data || {};
  const className = String(d.className || "").trim().toUpperCase();
  if (!className) throw new HttpsError("invalid-argument", "Choose a class.");
  const quizzes = Array.isArray(d.quizzes) ? d.quizzes : [];
  if (!quizzes.length) throw new HttpsError("invalid-argument", "Choose at least one quiz.");
  const dueAt = Number.isFinite(Number(d.dueAt)) && Number(d.dueAt) > 0 ? Math.round(Number(d.dueAt)) : null;

  const batch = db.batch();
  const created = [];
  const now = Date.now();
  const seen = new Set();
  for (const q of quizzes.slice(0, 50)) {
    const toolId = String((q && q.toolId) || "").trim().slice(0, 80);
    if (!toolId || seen.has(toolId)) continue;
    seen.add(toolId);
    const title = String((q && q.title) || "").trim().slice(0, 160) || toolId;
    const launchUrl = String((q && q.launchUrl) || "").trim().slice(0, 300);
    const ref = db.collection("dashboardAssignments").doc();
    const assignment = {
      assignmentId: ref.id,
      teacherCode, className,
      toolId, title, launchUrl,
      dueAt, assignedAt: now,
      createdBy: "teacher-portal",
      createdAtServer: admin.firestore.FieldValue.serverTimestamp(),
      active: true,
    };
    batch.set(ref, assignment);
    created.push({ ...assignment, createdAtServer: now });
  }
  if (!created.length) throw new HttpsError("invalid-argument", "No valid quizzes to assign.");
  await batch.commit();
  return { created };
});

/**
 * updateDashboardTask({ assignmentId, dueAt }) → { assignmentId, dueAt }.
 * Teacher-only. Changes the due date on a dashboard task the caller owns
 * (verified by teacherCode claim vs the stored doc).
 */
exports.updateDashboardTask = onCall(async (request) => {
  const auth = request.auth;
  if (!auth || auth.token.role !== "teacher" || !auth.token.teacherCode) {
    throw new HttpsError("permission-denied", "Sign in with your teacher code first.");
  }
  const teacherCode = normaliseCode(auth.token.teacherCode);
  const d = request.data || {};
  const assignmentId = String(d.assignmentId || "").trim();
  if (!assignmentId) throw new HttpsError("invalid-argument", "Missing assignmentId.");
  const dueAt = Number.isFinite(Number(d.dueAt)) && Number(d.dueAt) > 0 ? Math.round(Number(d.dueAt)) : null;

  const ref = db.collection("dashboardAssignments").doc(assignmentId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Task not found.");
  if (normaliseCode((snap.data() || {}).teacherCode) !== teacherCode) {
    throw new HttpsError("permission-denied", "You can only change your own tasks.");
  }
  await ref.update({ dueAt, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  return { assignmentId, dueAt };
});

/**
 * setDashboardTaskActive({ assignmentId, active }) → { assignmentId, active }.
 * Teacher-only. Soft-removes (active:false) a dashboard task the caller owns.
 * Verified by teacherCode claim vs the stored doc. Students only read active
 * tasks, so deactivating removes it from their pop-up immediately.
 */
exports.setDashboardTaskActive = onCall(async (request) => {
  const auth = request.auth;
  if (!auth || auth.token.role !== "teacher" || !auth.token.teacherCode) {
    throw new HttpsError("permission-denied", "Sign in with your teacher code first.");
  }
  const teacherCode = normaliseCode(auth.token.teacherCode);
  const d = request.data || {};
  const assignmentId = String(d.assignmentId || "").trim();
  if (!assignmentId) throw new HttpsError("invalid-argument", "Missing assignmentId.");
  const active = d.active === true;

  const ref = db.collection("dashboardAssignments").doc(assignmentId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Task not found.");
  if (normaliseCode((snap.data() || {}).teacherCode) !== teacherCode) {
    throw new HttpsError("permission-denied", "You can only change your own tasks.");
  }
  await ref.update({ active, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  return { assignmentId, active };
});

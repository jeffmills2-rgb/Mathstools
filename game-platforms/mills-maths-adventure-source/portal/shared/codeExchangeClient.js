/**
 * MMT Platform — secure code-exchange client (Phase 4A). The ONLY auth path for
 * the portals. There is NO anonymous sign-in and NO client read of
 * `students/{code}` / `teachers/{code}` before login: a Cloud Function validates
 * the code server-side and mints a custom token, and we sign in with it. After
 * sign-in, claim-based Firestore rules scope every read/write to the owner.
 *
 * Loaded as a browser ES module by the portal pages (imports the Firebase SDK
 * straight from gstatic — no bundler needed).
 */
import { FIREBASE_CONFIG, FUNCTIONS_REGION, EXCHANGE_FUNCTIONS } from "./firebaseConfig.js";

// Firebase JS SDK 10.12.5 from gstatic. Static imports need literal URLs; keep
// this version in sync with firebaseConfig.FIREBASE_SDK_VERSION.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInWithCustomToken, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-functions.js";

const SESSION_KEY = "mmt-portal-session";

let _app = null, _auth = null, _db = null, _functions = null;
let _session = null; // { role, profile }

/** Initialise Firebase handles. No sign-in here. Idempotent. */
export function initPortal() {
  if (_app) return { app: _app, auth: _auth, db: _db, functions: _functions };
  _app = initializeApp(FIREBASE_CONFIG);
  _auth = getAuth(_app);
  _db = getFirestore(_app);
  _functions = getFunctions(_app, FUNCTIONS_REGION);
  // Hydrate the cached profile (UI only — real access still needs a live token).
  try { const s = localStorage.getItem(SESSION_KEY); if (s) _session = JSON.parse(s); } catch { /* noop */ }
  return { app: _app, auth: _auth, db: _db, functions: _functions };
}

export function getDb() { return _db; }
export function getAuthInstance() { return _auth; }
export function getSession() { return _session; }
export function getProfile() { return _session ? _session.profile : null; }
export function getRole() { return _session ? _session.role : null; }

function persist(role, profile) {
  _session = { role, profile };
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(_session)); } catch { /* noop */ }
}

function friendlyError(err) {
  const m = String((err && err.message) || err || "");
  if (/not found/i.test(m)) return "That code was not found. Check it and try again.";
  if (/not active|inactive/i.test(m)) return "That code is not active. Please contact your teacher/admin.";
  if (/pin/i.test(m)) return m; // PIN messages are already friendly
  if (/internal|unavailable|network/i.test(m)) return "Sign-in service is unavailable right now. Please try again shortly.";
  return m || "Could not sign in. Please try again.";
}

/**
 * Secure student sign-in. Validates the code (+ optional PIN) via the Cloud
 * Function, signs in with the returned custom token, caches the safe profile.
 * Returns { ok, profile?, error? }.
 */
export async function loginStudent(code, pin) {
  initPortal();
  try {
    const call = httpsCallable(_functions, EXCHANGE_FUNCTIONS.student);
    const res = await call({ studentCode: code, pin: pin || undefined });
    const data = res.data || {};
    if (!data.token) return { ok: false, error: "Sign-in failed. Please try again." };
    await signInWithCustomToken(_auth, data.token);
    persist("student", data.profile);
    return { ok: true, profile: data.profile, claims: data.claims };
  } catch (err) { return { ok: false, error: friendlyError(err) }; }
}

/** Secure teacher sign-in (mirror of loginStudent). */
export async function loginTeacher(code) {
  initPortal();
  try {
    const call = httpsCallable(_functions, EXCHANGE_FUNCTIONS.teacher);
    const res = await call({ teacherCode: code });
    const data = res.data || {};
    if (!data.token) return { ok: false, error: "Sign-in failed. Please try again." };
    await signInWithCustomToken(_auth, data.token);
    persist("teacher", data.profile);
    return { ok: true, profile: data.profile, claims: data.claims };
  } catch (err) { return { ok: false, error: friendlyError(err) }; }
}

/** Clear the session + sign out. Never deletes any data. */
export async function logout() {
  _session = null;
  try { localStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
  try { if (_auth) await signOut(_auth); } catch { /* noop */ }
}

/** Subscribe to auth restoration (custom-token sessions persist by default). */
export function onAuth(cb) { initPortal(); return onAuthStateChanged(_auth, cb); }

export function normaliseCode(code) {
  return String(code || "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

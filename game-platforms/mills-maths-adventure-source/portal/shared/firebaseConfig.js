/**
 * MMT Platform — shared Firebase configuration (Phase 4A).
 *
 * Public web config (safe to ship in a static site). Security comes from the
 * Cloud Functions code exchange + claim-based Firestore rules, NOT from hiding
 * these values. Loaded as a plain ES module by the portal pages.
 */
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDYoJuHGslYY-cvV2rtuLkL6bE_hRDOESw",
  authDomain: "mills-maths-tools.firebaseapp.com",
  projectId: "mills-maths-tools",
  storageBucket: "mills-maths-tools.firebasestorage.app",
  messagingSenderId: "835000359454",
  appId: "1:835000359454:web:d7876be83ee367b5006c0f",
  measurementId: "G-35YCH5NJEG",
};

// Firebase JS SDK loaded from gstatic (no bundler needed for the static portal).
export const FIREBASE_SDK_VERSION = "10.12.5";
export const FIREBASE_SDK = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;

// Callable Cloud Functions live in us-central1 (the deployed default region).
export const FUNCTIONS_REGION = "us-central1";

// Existing + new collections. Do not rename — these are live.
export const COLLECTIONS = Object.freeze({
  students: "students",
  teachers: "teachers",
  achievements: "achievements",
  adventureAttempts: "adventureAttempts",
});

// The deployed secure code-exchange callables.
export const EXCHANGE_FUNCTIONS = Object.freeze({
  student: "exchangeStudentCode",
  teacher: "exchangeTeacherCode",
});

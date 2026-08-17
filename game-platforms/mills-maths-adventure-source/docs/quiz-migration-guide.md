# MMT Quiz Migration Guide — Secure Code Exchange

Every Firebase-enabled quiz/tool should authenticate the same way the platform
does: validate the code with a Cloud Function and sign in with a custom token.
Quizzes keep writing compact records to `achievements` exactly as before.

## Old pattern (remove)
```js
import { getAuth, signInAnonymously } from ".../firebase-auth.js";
await signInAnonymously(getAuth(app));
const snap = await getDoc(doc(db, "students", code));   // direct identity read
```

## New pattern (use)
```js
import { getFunctions, httpsCallable } from ".../firebase-functions.js";
import { getAuth, signInWithCustomToken } from ".../firebase-auth.js";

const functions = getFunctions(app, "us-central1");
const call = httpsCallable(functions, "exchangeStudentCode");
const { data } = await call({ studentCode: code, pin });   // server validates
await signInWithCustomToken(getAuth(app), data.token);     // identity = token
const student = data.profile;                              // safe profile
```

## Reusable snippet (copy into a quiz `<script type="module">`)
```js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-functions.js";

const firebaseConfig = { /* mills-maths-tools config */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app), db = getFirestore(app), functions = getFunctions(app, "us-central1");
let mode = "pending", currentStudent = null;

export async function signIn(code, pin){
  const { data } = await httpsCallable(functions, "exchangeStudentCode")({ studentCode: code, pin: pin || undefined });
  await signInWithCustomToken(auth, data.token);
  currentStudent = data.profile; mode = "registered";
  return currentStudent;
}
export function skipDemo(){ mode = "skip"; currentStudent = null; }   // local only, no save

export async function saveAchievement(payload){
  if(mode !== "registered" || !currentStudent) return { skipped:true };   // demo never saves
  const total = Number(payload.total||0), score = Number(payload.score||0);
  const percent = total ? Math.round((score/total)*100) : 0;
  await addDoc(collection(db, "achievements"), {
    studentCode: currentStudent.studentCode,           // must match the signed-in claim
    studentName: currentStudent.name || "",
    className: currentStudent.className || "",
    teacherCode: currentStudent.teacherCode || "",
    teacherName: currentStudent.teacherName || "",
    school: currentStudent.school || "",
    tool: payload.tool,            // register this name in mmtToolRegistry.achievementToolName
    topic: payload.topic || "",
    score, total, percent,
    xpEarned: Number(payload.xpEarned||0),
    createdAt: serverTimestamp(),
    createdAtClient: new Date().toISOString(),
  });
  return { saved:true };
}
```

## Rules / behaviour notes
- The compact `achievements` create is allowed by the Phase 3D rules **only when
  `studentCode` equals the signed-in student's claim** — always use
  `currentStudent.studentCode` from the returned profile.
- **Never** store typed student answers in Firebase.
- Keep **skip/demo** local (no sign-in, no save).
- Register the quiz in `portal/shared/mmtToolRegistry.js` (set `enabled: true`,
  matching `achievementToolName`) so it appears in the platform filters.

## Status
- Migrated: `portals/algebraic-techniques.html` (canonical template).
- Pending: Integers, FDP, Area, Pythagoras quiz pages (and any other Firebase
  quiz still on the old pattern). Migrate each before deploying strict rules.

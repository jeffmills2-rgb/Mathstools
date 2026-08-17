import React, { useState } from "react";

import { useResults } from "../results/resultStore.js";
import { useUI } from "./effects/uiStore.js";
import { useProgress } from "../progress/store.js";
import { toJSON } from "../results/resultUtils.js";
import { makeAttemptId } from "../results/resultTypes.js";
import { runResultChecks } from "../dev/systemChecks.js";

/**
 * RESULTS TESTING (DevPanel section, Phase 2L). Inspect the local result count,
 * generate a sample attempt, clear ONLY the results (never game/story progress),
 * export the results JSON, inspect the latest attempt, and run the result checks.
 */
export function ResultsTesting() {
  const results = useResults((s) => s.results);
  const addResult = useResults((s) => s.addResult);
  const clearResults = useResults((s) => s.clearResults);
  const setResults = useUI((s) => s.setResults);
  const profile = useProgress((s) => s.profile);
  const setProfile = useProgress((s) => s.setProfile);
  const [checks, setChecks] = useState(null);

  // Clear ONLY the local player identity (name/code) — never game/story progress.
  function clearIdentity() {
    setProfile({ ...profile, name: "", studentCode: "" });
  }

  // Clear ONLY results — with an export-first reminder; never story/game progress.
  function handleClearResults() {
    if (results.length === 0) { clearResults(); return; }
    const ok = window.confirm(
      `Clear all ${results.length} local result(s)?\n\n` +
      "Export or copy your results FIRST — this cannot be undone.\n" +
      "This will NOT clear story/game progress, badges, or player name/code."
    );
    if (ok) clearResults();
  }

  const latest = results[0] || null;

  // Build a sample attempt of a given flavour (Phase 2M — richer test data).
  function makeSample(flavour) {
    const base = {
      attemptId: makeAttemptId(), studentName: "Dev Tester", stage: "stage4",
      difficultyRange: { min: 1, max: 3 }, adaptiveOn: true, passThreshold: 0.6,
      startedAt: Date.now() - 60000, completedAt: Date.now() - Math.floor(Math.random() * 5000),
      xpAwarded: 60, coinsAwarded: 30,
    };
    if (flavour === "fdp") {
      return { ...base, missionId: "sample-fdp", missionKind: "teacher", missionTitle: "Sample FDP Mission",
        topicIds: ["fdp"], topicNames: ["Fractions, Decimals & Percentages"],
        skillIds: ["percentageOf", "compareFractions", "orderDecimals"], skillNames: ["Percentage of a Quantity", "Compare Fractions (< > =)", "Order Decimals"],
        questionCount: 4, correctCount: 3,
        questionResults: [
          { questionId: "f1", text: "25% of 80", topicId: "fdp", skillId: "percentageOf", difficultyLevel: 2, answerMode: "simple", studentAnswer: "20", expectedAnswer: "20", correct: true },
          { questionId: "f2", text: "1/2 ___ 3/4", topicId: "fdp", skillId: "compareFractions", difficultyLevel: 3, answerMode: "comparison", studentAnswer: "<", expectedAnswer: "<", correct: true },
          { questionId: "f3", text: "Order 0.3, 0.45, 0.6", topicId: "fdp", skillId: "orderDecimals", difficultyLevel: 3, answerMode: "orderedList", studentAnswer: "0.45, 0.3, 0.6", expectedAnswer: "0.3, 0.45, 0.6", correct: false },
          { questionId: "f4", text: "Round 3.456 to 1 dp", topicId: "fdp", skillId: "roundDecimals", difficultyLevel: 1, answerMode: "simple", studentAnswer: "3.5", expectedAnswer: "3.5", correct: true },
        ] };
    }
    if (flavour === "algebra") {
      return { ...base, missionId: "sample-alg", missionKind: "free", missionTitle: "Sample Algebra Mission",
        topicIds: ["algebra"], topicNames: ["Algebraic Techniques"],
        skillIds: ["patternTable", "multiPartAlgebra"], skillNames: ["Table of Values", "Multi-part Algebra"],
        questionCount: 2, correctCount: 1,
        questionResults: [
          { questionId: "a1", text: "Complete the table for 4n+1", topicId: "algebra", skillId: "patternTable", difficultyLevel: 2, answerMode: "tableInput", studentAnswer: "5 | 9 | 13 | 17", expectedAnswer: "5, 9, 13, 17", correct: true, partResults: [true, true, true, true] },
          { questionId: "a2", text: "Rectangle perimeter & area", topicId: "algebra", skillId: "multiPartAlgebra", difficultyLevel: 3, answerMode: "multiPart", studentAnswer: "2x+14 | x(x+7) | wrong", expectedAnswer: "(a) 2x + 14 cm; (b) x(x + 7) cm²; (c) 26 cm", correct: false, partResults: [true, true, false] },
        ] };
    }
    if (flavour === "preset") {
      return { ...base, missionId: "y7-mixed-review", missionKind: "preset", missionTitle: "Mixed Year 7 Review",
        studentName: profile.name || "Year 7 Student", studentCode: profile.studentCode || "7M-01",
        topicIds: ["integers", "fdp", "algebra", "area"], topicNames: ["Integers", "Fractions, Decimals & Percentages", "Algebraic Techniques", "Area"],
        skillIds: ["addingIntegers", "percentageOf"], skillNames: ["Adding Integers", "Percentage of a Quantity"],
        questionCount: 12, correctCount: 9,
        questionResults: [
          { questionId: "y1", text: "-4 + 9", topicId: "integers", skillId: "addingIntegers", difficultyLevel: 1, answerMode: "simple", studentAnswer: "5", expectedAnswer: "5", correct: true },
          { questionId: "y2", text: "20% of 50", topicId: "fdp", skillId: "percentageOf", difficultyLevel: 2, answerMode: "simple", studentAnswer: "10", expectedAnswer: "10", correct: true },
        ] };
    }
    if (flavour === "pythagoras") {
      return { ...base, missionId: "sample-pyth", missionKind: "teacher", missionTitle: "Sample Pythagoras Mission",
        topicIds: ["pythagoras"], topicNames: ["Pythagoras"],
        skillIds: ["pythagoras-hypotenuse", "pythagoras-triads"], skillNames: ["Find the Hypotenuse", "Pythagorean Triads"],
        questionCount: 3, correctCount: 2,
        questionResults: [
          { questionId: "p1", text: "Find x (hypotenuse)", topicId: "pythagoras", skillId: "pythagoras-hypotenuse", difficultyLevel: 2, answerMode: "simple", studentAnswer: "13 cm", expectedAnswer: "13 cm", correct: true, diagramType: "pythagorasTriangle", sourceType: "legacy-adapter" },
          { questionId: "p2", text: "Do 6, 8, 11 form a right triangle?", topicId: "pythagoras", skillId: "pythagoras-triads", difficultyLevel: 3, answerMode: "simple", studentAnswer: "no", expectedAnswer: "No", correct: true, sourceType: "legacy-adapter" },
          { questionId: "p3", text: "Ramp length to 1 dp", topicId: "pythagoras", skillId: "pythagoras-real-world", difficultyLevel: 4, answerMode: "simple", studentAnswer: "18", expectedAnswer: "18.7 m", correct: false, diagramType: "pythagorasRamp", sourceType: "legacy-adapter" },
        ] };
    }
    // failed integer attempt
    return { ...base, missionId: "sample-int", missionKind: "teacher", missionTitle: "Sample Integer Mission",
      topicIds: ["integers"], topicNames: ["Integers"], skillIds: ["addingIntegers"], skillNames: ["Adding Integers"],
      questionCount: 5, correctCount: 1, passThreshold: 0.6,
      questionResults: [
        { questionId: "i1", text: "-3 + 5", topicId: "integers", skillId: "addingIntegers", difficultyLevel: 1, answerMode: "simple", studentAnswer: "2", expectedAnswer: "2", correct: true },
        { questionId: "i2", text: "-8 + 3", topicId: "integers", skillId: "addingIntegers", difficultyLevel: 2, answerMode: "simple", studentAnswer: "5", expectedAnswer: "-5", correct: false },
      ] };
  }

  function sample(flavour) { addResult(makeSample(flavour)); }
  function sampleAll() { ["fdp", "algebra", "failed"].forEach((f) => addResult(makeSample(f))); }

  function exportJSON() {
    try {
      // eslint-disable-next-line no-alert
      if (navigator.clipboard) navigator.clipboard.writeText(toJSON(results));
    } catch { /* ignore */ }
  }

  return (
    <div className="dev-section">
      <div className="dev-subtitle">Results / reporting (Phase 2L)</div>

      <div className="dev-line">stored attempts: <code>{results.length}</code></div>
      {latest && (
        <div className="dev-sample">
          <div className="dev-line">latest: <code>{latest.missionTitle}</code> · {latest.percentage}% · <code>{latest.status}</code></div>
          <div className="dev-line">kind: <code>{latest.missionKind}</code> · topics: <code>{(latest.topicNames || []).join(", ")}</code></div>
          <div className="dev-line">questions saved: <code>{(latest.questionResults || []).length}</code></div>
        </div>
      )}

      <div className="dev-row">
        <button onClick={() => setResults(true)}>Open Results Centre</button>
        <button onClick={exportJSON}>Copy results JSON</button>
      </div>
      <div className="dev-line">Generate sample:</div>
      <div className="dev-row">
        <button onClick={sampleAll}>Rich set (3)</button>
        <button onClick={() => sample("fdp")}>FDP (modes)</button>
        <button onClick={() => sample("algebra")}>Multi-part/table</button>
        <button onClick={() => sample("pythagoras")}>Pythagoras</button>
        <button onClick={() => sample("preset")}>Year 7 preset</button>
        <button onClick={() => sample("failed")}>One failed</button>
      </div>

      {/* Local classroom identity (no login / accounts). */}
      <div className="dev-line" style={{ marginTop: 6 }}>
        local identity: <code>{profile.name || "—"}</code>{profile.studentCode ? <> · code <code>{profile.studentCode}</code></> : null}
      </div>
      <div className="dev-row">
        <button className="dev-danger" onClick={clearIdentity}>Clear player name/code only</button>
      </div>
      <div className="dev-row">
        <button onClick={() => setResults(true)}>Open Results Centre</button>
        <button onClick={() => useUI.getState().setPilot(true)}>🍎 Teacher Pilot card</button>
      </div>
      <div className="dev-row">
        <button className="dev-danger" onClick={handleClearResults}>Clear results only</button>
        <button onClick={() => setChecks(runResultChecks())}>Run result checks</button>
      </div>

      {checks && (
        <div className="dev-test-results">
          {checks.map((c) => (
            <div key={c.name} className={`dev-test-row ${c.pass ? "pass" : "fail"}`}>
              {c.pass ? "✓" : "✗"} {c.name} — {c.detail}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

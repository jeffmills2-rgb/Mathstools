import React, { useState } from "react";

import { useCloud } from "../cloud/cloudSession.js";
import { useUI } from "./effects/uiStore.js";
import { useResults } from "../results/resultStore.js";
import {
  mapResultToAchievement,
  mapResultToAdventureAttempt,
  shouldCloudSave,
} from "../cloud/adventureAttemptMapper.js";

/**
 * CLOUD TESTING (DevPanel section, Phase 3B). Inspect the cloud session, preview
 * the compact achievement + rich adventure-attempt mappings for the latest local
 * result, and clear the local cloud SESSION only. No destructive Firebase tools —
 * nothing here deletes any cloud data.
 */
export function CloudTesting() {
  const mode = useCloud((s) => s.mode);
  const status = useCloud((s) => s.status);
  const student = useCloud((s) => s.student);
  const lastSave = useCloud((s) => s.lastSave);
  const clearSession = useCloud((s) => s.clearSession);
  const setCloudLogin = useUI((s) => s.setCloudLogin);
  const results = useResults((s) => s.results);

  const [preview, setPreview] = useState(null);

  // Use the latest local result (or a tiny sample) + the current student (or a fake).
  function sampleStudent() {
    return student || { studentCode: "DEMO-CODE", name: "Demo Student", firstName: "Demo", surname: "Student", className: "7Z", teacherCode: "TCH0000", teacherName: "Teacher", school: "Demo School", active: true };
  }
  function latestOrSample() {
    return results[0] || {
      attemptId: "sample-attempt", missionKind: "preset", missionId: "y7-fdp-check", missionTitle: "FDP Check",
      topicIds: ["fdp"], topicNames: ["Fractions, Decimals & Percentages"], skillIds: ["percentageOf"], skillNames: ["Percentage of a Quantity"],
      questionCount: 10, correctCount: 8, percentage: 80, passed: true, passThreshold: 0.6, xpAwarded: 60,
      questionResults: [{ questionId: "q1", text: "20% of 50", topicId: "fdp", skillId: "percentageOf", difficultyLevel: 2, answerMode: "simple", studentAnswer: "10", expectedAnswer: "10", correct: true }],
    };
  }

  // A story-mission sample (Phase 3B.1) — shows the missionKind:"story" tagging.
  function storySample() {
    return {
      attemptId: "sample-story-attempt", missionKind: "story", missionId: "npc-pip-1", missionTitle: "Pip's Integer Trial",
      topicIds: ["integers"], topicNames: ["Integers"], skillIds: ["addingIntegers"], skillNames: ["Adding Integers"],
      questionCount: 4, correctCount: 3, percentage: 75, passed: true, passThreshold: 0.6, xpAwarded: 40,
      questionResults: [{ questionId: "s1", text: "-3 + 8", topicId: "integers", skillId: "addingIntegers", difficultyLevel: 1, answerMode: "simple", studentAnswer: "5", expectedAnswer: "5", correct: true }],
    };
  }

  function previewAchievement() {
    setPreview({ kind: "achievement", data: mapResultToAchievement(latestOrSample(), sampleStudent()) });
  }
  function previewAttempt() {
    setPreview({ kind: "adventureAttempt", data: mapResultToAdventureAttempt(latestOrSample(), sampleStudent()) });
  }
  function previewStory() {
    const s = sampleStudent();
    setPreview({ kind: "story attempt (achievement + adventureAttempt)", data: {
      achievement: mapResultToAchievement(storySample(), s),
      adventureAttempt: mapResultToAdventureAttempt(storySample(), s),
    } });
  }

  return (
    <div className="dev-section">
      <div className="dev-subtitle">Cloud / Firebase (Phase 3B)</div>

      <div className="dev-line">
        session: <code>{mode}</code> · status <code>{status}</code>
        {lastSave ? <> · lastSave <code>{lastSave.status}</code></> : null}
      </div>
      <div className="dev-line">
        student: <code>{student ? `${student.name || student.studentCode} · ${student.className || "—"}` : "none"}</code>
      </div>
      <div className="dev-line">
        would cloud-save latest (preset): <code>{String(shouldCloudSave(latestOrSample(), mode === "registered" ? student : null))}</code>
      </div>

      <div className="dev-row">
        <button onClick={() => setCloudLogin(true)}>Open sign-in</button>
        <button onClick={clearSession}>Clear cloud session only</button>
      </div>
      <div className="dev-row">
        <button onClick={previewAchievement}>Preview → achievement</button>
        <button onClick={previewAttempt}>Preview → adventureAttempt</button>
        <button onClick={previewStory}>Preview → story attempt</button>
      </div>

      {preview && (
        <div className="dev-sample">
          <div className="dev-line">{preview.kind} (typed answers stripped in adventureAttempt):</div>
          <pre className="dev-pre">{JSON.stringify(preview.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";

import { generateCurriculumQuestion, getTopic } from "../maths/curriculum/curriculumRegistry.js";
import { runDiagramChecks } from "../dev/systemChecks.js";
import DiagramRenderer from "./diagrams/DiagramRenderer.jsx";

/**
 * AREA / DIAGRAM TESTING (DevPanel section, Phase 2E).
 *
 * Lets you generate a sample Area question, preview its diagram, inspect the
 * diagramType + diagramData, type an answer and check it, read the feedback,
 * and run the diagram system checks — all without entering the world.
 */
export function AreaTesting() {
  const areaTopic = getTopic("stage4", "area");
  const skills = areaTopic ? areaTopic.skills : [];

  const [skillId, setSkillId] = useState(skills[0]?.id || "");
  const [level, setLevel] = useState(2);
  const [q, setQ] = useState(null);
  const [answer, setAnswer] = useState("");
  const [verdict, setVerdict] = useState(null);
  const [checks, setChecks] = useState(null);

  function generate() {
    const question = generateCurriculumQuestion("stage4", "area", skillId, level);
    setQ(question);
    setAnswer("");
    setVerdict(null);
  }

  function check() {
    if (!q) return;
    setVerdict(q.check(answer) ? "correct" : "wrong");
  }

  return (
    <div className="dev-section">
      <div className="dev-subtitle">Area / diagram testing</div>

      <div className="dev-row">
        <select value={skillId} onChange={(e) => { setSkillId(e.target.value); setQ(null); }}>
          {skills.map((k) => (
            <option key={k.id} value={k.id}>{k.name}</option>
          ))}
        </select>
        <select value={level} onChange={(e) => setLevel(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map((l) => <option key={l} value={l}>Difficulty {l}</option>)}
        </select>
        <button onClick={generate}>Generate Area question</button>
      </div>

      {q && (
        <div className="dev-sample">
          <div className="dev-line">prompt: <code>{q.text}</code></div>

          {/* Diagram preview */}
          <DiagramRenderer question={q} />

          <div className="dev-line">diagramType: <code>{q.diagramType}</code></div>
          <div className="dev-line">diagramData: <code>{JSON.stringify(q.diagramData)}</code></div>
          <div className="dev-line">
            answer: <code>{q.answer}</code> · inputMode: <code>{q.inputMode}</code> · xp: <code>{q.xpValue}</code> · diff: <code>{q.difficultyLevel}</code>
          </div>

          {/* Check an answer */}
          <div className="dev-row">
            <input
              type="text"
              value={answer}
              placeholder="Type an answer"
              onChange={(e) => { setAnswer(e.target.value); setVerdict(null); }}
            />
            <button onClick={check}>Check answer</button>
          </div>
          {verdict === "correct" && <div className="dev-test-row pass">✓ Correct</div>}
          {verdict === "wrong" && <div className="dev-test-row fail">✗ Not quite — answer is {q.answer}</div>}

          <div className="dev-line">feedback: <code>{q.feedback}</code></div>
        </div>
      )}

      <div className="dev-row">
        <button onClick={() => setChecks(runDiagramChecks())}>Run diagram system checks</button>
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

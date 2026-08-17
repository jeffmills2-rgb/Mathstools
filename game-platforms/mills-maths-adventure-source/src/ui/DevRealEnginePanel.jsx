import React, { useState } from "react";

import {
  getStages,
  getTopics,
  getSkill,
  generateCurriculumQuestion,
} from "../maths/curriculum/curriculumRegistry.js";
import DiagramRenderer from "./diagrams/DiagramRenderer.jsx";

/**
 * REAL ENGINE TESTING (DevPanel section, Phase 2F).
 *
 * Generic tester across the whole curriculum: pick stage → topic → skill →
 * difficulty, generate a sample, preview input mode / acceptable answers /
 * feedback / diagram, test answer checking, and see whether the skill is backed
 * by a LEGACY ADAPTER or a NATIVE curriculum engine (skill.source).
 */
export function RealEngineTesting() {
  const stages = getStages();
  const [stage, setStage] = useState("stage4");
  const topics = getTopics(stage);
  const [topicId, setTopicId] = useState(topics[0]?.id || "");
  const topicSkills = (topics.find((t) => t.id === topicId) || {}).skills || [];
  const [skillId, setSkillId] = useState(topicSkills[0]?.id || "");
  const [level, setLevel] = useState(2);
  const [q, setQ] = useState(null);
  const [answer, setAnswer] = useState("");
  const [verdict, setVerdict] = useState(null);

  function onStage(id) {
    setStage(id);
    const ts = getTopics(id);
    setTopicId(ts[0]?.id || "");
    setSkillId(ts[0]?.skills[0]?.id || "");
    setQ(null);
  }
  function onTopic(id) {
    setTopicId(id);
    const t = getTopics(stage).find((x) => x.id === id);
    setSkillId(t?.skills[0]?.id || "");
    setQ(null);
  }

  function generate() {
    setQ(generateCurriculumQuestion(stage, topicId, skillId, level));
    setAnswer("");
    setVerdict(null);
  }
  function check() {
    if (q) setVerdict(q.check(answer) ? "correct" : "wrong");
  }

  const source = getSkill(stage, topicId, skillId)?.source || "native";

  return (
    <div className="dev-section">
      <div className="dev-subtitle">Real engine testing</div>

      <div className="dev-row">
        <select value={stage} onChange={(e) => onStage(e.target.value)}>
          {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={topicId} onChange={(e) => onTopic(e.target.value)}>
          {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="dev-row">
        <select value={skillId} onChange={(e) => { setSkillId(e.target.value); setQ(null); }}>
          {topicSkills.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
        </select>
        <select value={level} onChange={(e) => setLevel(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map((l) => <option key={l} value={l}>Difficulty {l}</option>)}
        </select>
        <button onClick={generate}>Generate</button>
      </div>

      <div className="dev-line">
        source: <code>{source === "legacy-adapter" ? "legacy adapter" : "native engine"}</code>
      </div>

      {q && (
        <div className="dev-sample">
          <div className="dev-line">prompt: <code>{q.text}</code></div>
          {q.diagramType && q.diagramData && <DiagramRenderer question={q} />}

          {/* --- difficulty provenance (Phase 2F) --- */}
          <div className="dev-line">
            requested: <code>{q.requestedDifficultyLevel}</code> → actual: <code>{q.actualDifficultyLevel} ({q.difficultyLabel})</code>
            {q.requestedDifficultyLevel !== q.actualDifficultyLevel && <strong> ⚠ adjusted</strong>}
          </div>
          <div className="dev-line">
            xp: <code>{q.xpValue}</code> · sourceType: <code>{q.sourceType}</code> · legacyType: <code>{q.legacyType || "—"}</code>
          </div>
          {q.difficultyNotes && (
            <div className="dev-line">difficulty notes: <code>{q.difficultyNotes}</code></div>
          )}

          <div className="dev-line">
            inputMode: <code>{q.inputMode}</code> · answerMode: <code>{q.answerMode || "(simple/math)"}</code>
          </div>
          {/* Phase 2K: expected answer STRUCTURE for the new modes. */}
          {q.comparisonOptions && (
            <div className="dev-line">options: <code>{q.comparisonOptions.join(" ")}</code></div>
          )}
          {q.orderedItems && (
            <div className="dev-line">orderedItems: <code>{q.orderedItems.join(", ")}</code></div>
          )}
          {q.expectedParts && (
            <div className="dev-line">
              parts: <code>{q.expectedParts.map((p) => `${p.label}=${p.answer}`).join("  |  ")}</code>
            </div>
          )}
          {q.tableConfig && (
            <div className="dev-line">tableConfig: <code>{JSON.stringify(q.tableConfig.rows)}</code></div>
          )}
          <div className="dev-line">answer: <code>{q.answer}</code></div>
          <div className="dev-line">acceptable: <code>{q.acceptableAnswers.join("  |  ")}</code></div>
          {q.diagramType && (
            <div className="dev-line">diagramType: <code>{q.diagramType}</code> · diagramData: <code>{JSON.stringify(q.diagramData)}</code></div>
          )}
          <div className="dev-line">feedback: <code>{q.feedback}</code></div>

          <div className="dev-row">
            <input
              type="text"
              value={answer}
              placeholder="Type an answer to check"
              onChange={(e) => { setAnswer(e.target.value); setVerdict(null); }}
            />
            <button onClick={check}>Check answer</button>
          </div>
          {verdict === "correct" && <div className="dev-test-row pass">✓ Correct</div>}
          {verdict === "wrong" && <div className="dev-test-row fail">✗ Not accepted (answer: {q.answer})</div>}
        </div>
      )}
    </div>
  );
}

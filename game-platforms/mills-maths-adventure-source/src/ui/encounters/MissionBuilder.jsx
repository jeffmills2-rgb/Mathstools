import React, { useState } from "react";

import { useProgress } from "../../progress/store.js";
import { useSession } from "../../game/sessionStore.js";
import { getStages, getTopics } from "../../maths/curriculum/curriculumRegistry.js";
import { getAllBadges } from "../../data/badges.js";
import { routeForMission } from "../../data/topicWorldRoutes.js";
import { getInteractable } from "../../data/interactables.js";

/**
 * MissionBuilder (Phase 2J) — a clean, STUDENT/TEACHER-facing mission builder,
 * separate from the DevPanel. Opened from the Mission Board. It uses the EXISTING
 * mission system (activateCustomMission → normaliseMission/validateMission), so a
 * built mission is just a normal local mission of kind "teacher". No login or
 * Firebase — the shape is already portal-ready (see data/missions.js).
 *
 * After a mission is assigned it shows WHERE to go (topic→world route), so the
 * student is guided to the right zone/NPC to play it.
 */
export default function MissionBuilder() {
  const closeEncounter = useSession((s) => s.closeEncounter);
  const openEncounter = useSession((s) => s.openEncounter);
  const activateCustomMission = useProgress((s) => s.activateCustomMission);

  const stages = getStages();
  const [stage, setStage] = useState(stages[0]?.id || "");
  const topics = getTopics(stage);
  const [pickedTopics, setPickedTopics] = useState([]);
  const [pickedSkills, setPickedSkills] = useState([]);
  const [title, setTitle] = useState("");
  const [count, setCount] = useState(10); // classroom-friendly default (Phase 2O)
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(3);
  const [adaptive, setAdaptive] = useState(true);
  const [badge, setBadge] = useState("");
  const [assigned, setAssigned] = useState(null); // { mission, route } once created
  const [error, setError] = useState("");

  const visibleTopics = pickedTopics.length
    ? topics.filter((t) => pickedTopics.includes(t.id))
    : topics;
  const availableSkills = visibleTopics.flatMap((t) =>
    (t.skills || []).map((k) => ({ ...k, topicName: t.name }))
  );

  function onStage(id) {
    setStage(id);
    setPickedTopics([]);
    setPickedSkills([]);
    setError("");
  }
  function toggle(list, setList, id) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
    setError("");
  }

  function assign() {
    const raw = {
      kind: "teacher",
      title: title.trim() || `${stageName(stages, stage)} mission`,
      description: "Teacher / free-choice mission.",
      stages: [stage],
      selectedTopics: pickedTopics,
      selectedSkills: pickedSkills,
      difficultyRange: { min: Number(min), max: Number(max) },
      adaptiveOn: adaptive,
      requiredQuestions: Number(count),
      rewardXP: 60,
      rewardCoins: 30,
      rewardBadge: badge || null,
      // Future-portal placeholders, filled locally for now.
      createdBy: "local-teacher",
      assignedAt: Date.now(),
    };
    const r = activateCustomMission(raw);
    if (!r.ok) {
      setError(r.problems.join("; ") || "Could not build that mission.");
      return;
    }
    setAssigned({ mission: r.mission, route: routeForMission(r.mission) });
  }

  // --- Confirmation view (after a mission is assigned) ---
  if (assigned) {
    const { mission, route } = assigned;
    const target = getInteractable(route.targetId);
    return (
      <div className="modal-card mission-builder-card">
        <button className="modal-close" onClick={closeEncounter} title="Close" aria-label="Close">✕</button>
        <div className="modal-header">
          <span className="modal-npc" style={{ color: "#2a9d8f" }}>✅ Mission assigned</span>
        </div>
        <p className="builder-assigned-title">“{mission.title}”</p>
        <div className="builder-assigned-meta">
          <span>Topics: {mission.selectedTopics.join(", ") || "all in stage"}</span>
          <span>Difficulty {mission.difficultyRange.min}–{mission.difficultyRange.max}</span>
          <span>{mission.requiredQuestions} questions · {mission.adaptiveOn ? "adaptive" : "fixed"}</span>
        </div>
        <div className="builder-route-hint">
          🧭 {route.fallback
            ? "Open the Mission Board to play this mission."
            : `${route.text}${target ? ` (${target.name})` : ""} to begin.`}
        </div>
        <div className="modal-actions">
          <button className="primary-button" onClick={() => openEncounter("mission-active")}>
            ▶ Start now
          </button>
          <button className="link-button" onClick={closeEncounter}>Go find it in the world</button>
        </div>
      </div>
    );
  }

  // --- Builder form ---
  const canAssign = pickedTopics.length > 0;
  return (
    <div className="modal-card mission-builder-card">
      <button className="modal-close" onClick={closeEncounter} title="Close" aria-label="Close">✕</button>
      <div className="modal-header">
        <span className="modal-npc" style={{ color: "#2a9d8f" }}>🛠️ Mission Builder</span>
        <span className="modal-topic">Build a custom mission</span>
      </div>

      <label className="builder-field">
        <span>Mission name</span>
        <input
          className="text-input" type="text" value={title}
          placeholder="e.g. Percentage Change practice"
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label className="builder-field">
        <span>Stage</span>
        <select value={stage} onChange={(e) => onStage(e.target.value)}>
          {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>

      <div className="builder-field">
        <span>Topics</span>
        <div className="builder-chips">
          {topics.map((t) => (
            <label key={t.id} className={pickedTopics.includes(t.id) ? "chip on" : "chip"}>
              <input type="checkbox" checked={pickedTopics.includes(t.id)}
                onChange={() => toggle(pickedTopics, setPickedTopics, t.id)} />
              {t.name}
            </label>
          ))}
        </div>
      </div>

      <div className="builder-field">
        <span>Skills <em>(optional — empty = all skills of chosen topics)</em></span>
        <div className="builder-chips">
          {availableSkills.length === 0 && <span className="builder-muted">Pick a topic first</span>}
          {availableSkills.map((k) => (
            <label key={k.id} className={pickedSkills.includes(k.id) ? "chip on" : "chip"}>
              <input type="checkbox" checked={pickedSkills.includes(k.id)}
                onChange={() => toggle(pickedSkills, setPickedSkills, k.id)} />
              {k.name}
            </label>
          ))}
        </div>
      </div>

      <div className="builder-row">
        <label>Questions
          <input type="number" min="1" max="30" value={count} style={{ width: 56 }}
            onChange={(e) => setCount(e.target.value)} />
        </label>
        <label>Difficulty
          <select value={min} onChange={(e) => setMin(e.target.value)}>
            {[1, 2, 3, 4, 5].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <span>–</span>
          <select value={max} onChange={(e) => setMax(e.target.value)}>
            {[1, 2, 3, 4, 5].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label className="builder-check">
          <input type="checkbox" checked={adaptive} onChange={(e) => setAdaptive(e.target.checked)} />
          Adaptive
        </label>
      </div>

      <label className="builder-field">
        <span>Reward badge <em>(optional)</em></span>
        <select value={badge} onChange={(e) => setBadge(e.target.value)}>
          <option value="">— none —</option>
          {getAllBadges().map((b) => (
            <option key={b.badgeId} value={b.badgeId}>{b.icon} {b.badgeName}</option>
          ))}
        </select>
      </label>

      {error && <div className="validation-msg">{error}</div>}

      <div className="modal-actions">
        <button className="primary-button" onClick={assign} disabled={!canAssign}>
          Assign mission
        </button>
        <button className="link-button" onClick={() => openEncounter("mission-board")}>
          Back to board
        </button>
      </div>
    </div>
  );
}

function stageName(stages, id) {
  return (stages.find((s) => s.id === id) || {}).name || "Custom";
}

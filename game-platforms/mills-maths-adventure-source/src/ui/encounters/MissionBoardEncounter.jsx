import React from "react";

import { useProgress } from "../../progress/store.js";
import { useSession } from "../../game/sessionStore.js";
import { useCloud } from "../../cloud/cloudSession.js";
import { isFarmTaskDone } from "../../cloud/farmCompletion.js";
import { taskTarget } from "../../data/taskCompass.js";
import { FARM_TASK_META } from "../../data/farm/farmTaskObjective.js";

/**
 * MissionBoardEncounter — the STUDENT-facing mission board.
 *
 * Rebuilt to show ONLY the tasks the teacher has set for this student's class,
 * with their completeness and an overall progress bar. There are no sample /
 * free-choice / Year 7 preset missions, no custom-mission builder and no Teacher
 * Pilot here — teacher tasks are the only objectives. When every task is done we
 * cheer the student on to keep exploring.
 *
 * Tasks are begun by walking to the character / challenge the compass points to
 * (the arrow + the HUD objective use the same source), so the board is a status
 * tracker rather than a launcher.
 */
export default function MissionBoardEncounter() {
  const closeEncounter = useSession((s) => s.closeEncounter);

  const cloudMode = useCloud((s) => s.mode);
  const assignments = useCloud((s) => s.assignments);
  const completedMissions = useProgress((s) => s.completedMissions) || [];

  const isDone = (t) =>
    t.location === "farm"
      ? isFarmTaskDone(t.assignmentId)
      : completedMissions.includes(t.assignmentId);

  const tasks = [...(assignments || [])]
    .filter(Boolean)
    .sort((a, b) => (a.assignedAt || 0) - (b.assignedAt || 0));

  const total = tasks.length;
  const doneCount = tasks.filter(isDone).length;
  const allDone = total > 0 && doneCount === total;
  const firstOutstanding = tasks.find((t) => !isDone(t)) || null;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  function whereTo(t) {
    if (t.location === "farm") {
      const m = FARM_TASK_META[t.challengeId];
      return m ? `${m.name} · Fraction Farm` : "Fraction Farm";
    }
    const tgt = taskTarget(t);
    return (tgt && tgt.name) || t.npcId || "";
  }

  function focusOf(t) {
    if (t.location === "farm") return "Fraction Farm challenge";
    if (Array.isArray(t.selectedTopics) && t.selectedTopics.length) return t.selectedTopics.join(", ");
    if (Array.isArray(t.stages) && t.stages.length) return t.stages.join(", ");
    return "";
  }

  function dueOf(t) {
    if (!t.dueAt) return "";
    try {
      return new Date(t.dueAt).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
    } catch { return ""; }
  }

  function renderTask(t) {
    const done = isDone(t);
    const current = !done && t === firstOutstanding;
    const status = done ? "s-done" : current ? "s-current" : "s-upcoming";
    const statusLabel = done ? "✓ Completed" : current ? "● Current task" : "Upcoming";
    const focus = focusOf(t);
    const due = dueOf(t);
    return (
      <div key={t.assignmentId} className={`tb-task ${done ? "done" : ""} ${current ? "current" : ""}`}>
        <div className="tb-task-top">
          <span className="tb-task-title">{t.title || "Teacher task"}</span>
          <span className={`tb-task-status ${status}`}>{statusLabel}</span>
        </div>
        {t.description ? <p className="tb-task-desc">{t.description}</p> : null}
        <div className="tb-task-meta">
          {!done && <span className="tb-task-where">👉 Go to {whereTo(t)}</span>}
          {focus && <span>Focus: {focus}</span>}
          {due && <span>Due {due}</span>}
        </div>
      </div>
    );
  }

  let body;
  if (cloudMode !== "registered") {
    body = (
      <div className="tb-empty">
        <div className="tb-big">Sign in to see your tasks</div>
        Use the ☁ button (top-right) and enter your student code, then your teacher's tasks will appear here.
      </div>
    );
  } else if (total === 0) {
    body = (
      <div className="tb-empty">
        <div className="tb-big">No tasks set right now</div>
        Keep exploring to sharpen your mathematics skills! 🌟
      </div>
    );
  } else {
    body = (
      <>
        {allDone && (
          <div className="tb-alldone">🎉 All complete, keep exploring to sharpen your mathematics skills!</div>
        )}
        <div className="task-board-progress">
          <div className="tb-track"><div className="tb-fill" style={{ width: `${pct}%` }} /></div>
          <span className="tb-count">{doneCount} of {total} complete</span>
        </div>
        <div className="task-board-list">{tasks.map(renderTask)}</div>
      </>
    );
  }

  return (
    <div className="modal-card mission-board-card">
      <button className="modal-close" onClick={closeEncounter} title="Close" aria-label="Close">✕</button>
      <div className="modal-header">
        <span className="modal-npc" style={{ color: "#2a9d8f" }}>📋 Mission Board</span>
        <span className="modal-topic">Tasks set by your teacher</span>
      </div>

      <p className="task-board-intro">
        These are the tasks your teacher has set. Follow the compass arrow at the top of the screen to find each one.
      </p>

      {body}

      <div className="modal-actions">
        <button className="link-button" onClick={closeEncounter}>Close</button>
      </div>
    </div>
  );
}

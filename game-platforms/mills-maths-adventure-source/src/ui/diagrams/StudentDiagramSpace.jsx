import React from "react";

/**
 * StudentDiagramSpace (Phase 2N) — a bordered "draw a diagram" box for worded
 * Pythagoras problems (ladder, walk, multi-step…). Ported from the legacy
 * engine's student-diagram-space. Reads diagramData: { label }.
 *
 * It's intentionally light so it doesn't dominate the modal; it just signals
 * "sketch the right triangle here" for the student.
 */
export default function StudentDiagramSpace({ data }) {
  const label = data && data.label === false ? "" : (data && data.label) || "Draw a diagram";

  return (
    <svg className="diagram-svg" viewBox="0 0 300 150" role="img" aria-label="Space to draw a diagram">
      <rect x="8" y="10" width="284" height="130" rx="8" ry="8"
        fill="#ffffff" stroke="#94a3b8" strokeWidth="1.6" />
      {/* faint centre guides */}
      <line x1="150" y1="24" x2="150" y2="126" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5 6" />
      <line x1="24" y1="75" x2="276" y2="75" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5 6" />
      {label && (
        <text x="18" y="28" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700"
          letterSpacing="0.04em" fill="#64748b">{String(label).toUpperCase()}</text>
      )}
    </svg>
  );
}

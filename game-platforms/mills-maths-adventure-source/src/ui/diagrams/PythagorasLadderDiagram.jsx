import React from "react";

/**
 * PythagorasLadderDiagram (Phase 2N patch) — a schematic ladder-against-a-wall
 * right triangle for ladder word problems. Ported from the legacy engine's
 * ladder-wall renderer (fixed, readable layout — not to scale).
 *
 * diagramData: { heightLabel, baseLabel, ladderLabel }
 *   height = up the wall, base = along the ground, ladder = the slope ("x").
 */
export default function PythagorasLadderDiagram({ data }) {
  const { heightLabel = "", baseLabel = "", ladderLabel = "x" } = data || {};

  const wallX = 90;
  const baseY = 150;
  const footX = 240;
  const topY = 50;

  return (
    <svg className="diagram-svg" viewBox="0 0 280 190" role="img" aria-label="Ladder against a wall (right triangle)">
      {/* wall (vertical) + ground (horizontal) */}
      <line x1={wallX} y1={topY - 14} x2={wallX} y2={baseY + 14} stroke="#111827" strokeWidth="2.2" strokeLinecap="round" />
      <line x1={wallX - 16} y1={baseY} x2={footX + 18} y2={baseY} stroke="#111827" strokeWidth="2.2" strokeLinecap="round" />
      {/* ladder (hypotenuse) */}
      <line x1={wallX} y1={topY} x2={footX} y2={baseY} stroke="#111827" strokeWidth="2.4" strokeLinecap="round" />
      {/* right-angle marker at the wall base */}
      <path className="diagram-right-angle" d={`M ${wallX + 13} ${baseY} L ${wallX + 13} ${baseY - 13} L ${wallX} ${baseY - 13}`} />

      <text className="diagram-dim" x={wallX - 14} y={(topY + baseY) / 2} textAnchor="middle"
        transform={`rotate(-90 ${wallX - 14} ${(topY + baseY) / 2})`}>{heightLabel}</text>
      <text className="diagram-dim" x={(wallX + footX) / 2} y={baseY + 22} textAnchor="middle">{baseLabel}</text>
      <text className="diagram-dim" x={(wallX + footX) / 2 + 22} y={(topY + baseY) / 2 - 12} textAnchor="middle">{ladderLabel}</text>
    </svg>
  );
}

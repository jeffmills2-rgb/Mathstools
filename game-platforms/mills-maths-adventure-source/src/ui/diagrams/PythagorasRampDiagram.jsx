import React from "react";

/**
 * PythagorasRampDiagram (Phase 2N) — a ramp/slope right triangle (right angle
 * bottom-right) for the "driveway/ramp" real-world question. Ported from the
 * legacy engine's ramp renderer. Reads diagramData:
 *   { baseLabel, heightLabel, rampLabel }
 */
export default function PythagorasRampDiagram({ data }) {
  const { baseLabel = "", heightLabel = "", rampLabel = "x" } = data || {};

  // A = bottom-left, B = bottom-right (right angle), C = top-right.
  const A = { x: 50, y: 150 };
  const B = { x: 230, y: 150 };
  const C = { x: 230, y: 70 };

  return (
    <svg className="diagram-svg" viewBox="0 0 280 190" role="img" aria-label="Ramp right triangle for Pythagoras">
      <polygon className="diagram-shape" points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} />

      {/* right-angle marker at B */}
      <path className="diagram-right-angle" d={`M ${B.x - 13} ${B.y} L ${B.x - 13} ${B.y - 13} L ${B.x} ${B.y - 13}`} />

      {/* base (A-B) below */}
      <text className="diagram-dim" x={(A.x + B.x) / 2} y={B.y + 22} textAnchor="middle">{baseLabel}</text>
      {/* height (B-C) to the right */}
      <text className="diagram-dim" x={B.x + 16} y={(B.y + C.y) / 2} textAnchor="start">{heightLabel}</text>
      {/* ramp/hypotenuse (A-C) above-left of its midpoint */}
      <text className="diagram-dim" x={(A.x + C.x) / 2 - 6} y={(A.y + C.y) / 2 - 12} textAnchor="middle">{rampLabel}</text>
    </svg>
  );
}

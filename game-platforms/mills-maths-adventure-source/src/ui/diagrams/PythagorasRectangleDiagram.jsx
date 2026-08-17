import React from "react";

/**
 * PythagorasRectangleDiagram (Phase 2N patch) — a rectangle with one diagonal,
 * for "diagonal of a rectangle/screen/paper/square" problems. Ported from the
 * legacy engine's rectangle-diagonal renderer (fixed, readable layout).
 *
 * diagramData: { widthLabel, heightLabel, diagonalLabel }
 */
export default function PythagorasRectangleDiagram({ data }) {
  const { widthLabel = "", heightLabel = "", diagonalLabel = "x" } = data || {};

  const x = 70, y = 50, w = 150, h = 95;
  const A = { x, y };
  const B = { x: x + w, y };
  const C = { x: x + w, y: y + h };
  const D = { x, y: y + h };

  return (
    <svg className="diagram-svg" viewBox="0 0 280 190" role="img" aria-label="Rectangle with a diagonal (right triangle)">
      <polygon className="diagram-shape" points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`} />
      {/* diagonal A–C */}
      <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#111827" strokeWidth="2.2" strokeLinecap="round" />
      {/* right-angle marker at D (bottom-left) */}
      <path className="diagram-right-angle" d={`M ${D.x + 12} ${D.y} L ${D.x + 12} ${D.y - 12} L ${D.x} ${D.y - 12}`} />

      <text className="diagram-dim" x={x + w / 2} y={y + h + 22} textAnchor="middle">{widthLabel}</text>
      <text className="diagram-dim" x={x - 14} y={y + h / 2} textAnchor="middle"
        transform={`rotate(-90 ${x - 14} ${y + h / 2})`}>{heightLabel}</text>
      <text className="diagram-dim" x={x + w / 2 + 16} y={y + h / 2 - 8} textAnchor="start">{diagonalLabel}</text>
    </svg>
  );
}

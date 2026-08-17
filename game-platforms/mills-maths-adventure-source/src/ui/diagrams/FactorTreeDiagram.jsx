import React from "react";

import { factorChain } from "./factorTreeUtils.js";

/**
 * FactorTreeDiagram (Phase 3E; layout reworked 3G to the teacher's sketch) —
 * a CLASSIC branching factor tree: the number at the top centre, each split
 * sending its prime leaf down-LEFT and the remaining quotient down-RIGHT,
 * exactly like a hand-drawn tree. Primes are circled; with `hideLeaves` the
 * prime leaves show "?" so the student completes the tree.
 *
 * diagramData: { number, hideLeaves?: boolean }
 */
export default function FactorTreeDiagram({ data }) {
  const n = Math.max(2, Math.floor(Number(data?.number ?? 12)));
  const hideLeaves = Boolean(data?.hideLeaves);
  const chain = factorChain(n);
  const levels = chain.length;

  const dx = 38, dy = 48, r = 15;
  // The quotient chain drifts right by dx each level; centre the whole span.
  const x0 = 180 - ((levels - 1) * dx) / 2;
  const H = 46 + levels * dy + 20;
  const nodeX = (i) => x0 + i * dx; // composite node at level i
  const nodeY = (i) => 30 + i * dy;

  const label = (v, hidden) => (hidden ? "?" : String(v));

  return (
    <svg className="diagram-svg" viewBox={`0 0 360 ${H}`} role="img"
      aria-label={`Factor tree for ${n}`}>
      {/* Root */}
      <text className="fd-label" x={nodeX(0)} y={nodeY(0) + 5} textAnchor="middle">{n}</text>

      {chain.map(([p, q], i) => {
        const px = nodeX(i), py = nodeY(i);
        const ly = nodeY(i + 1);
        const leftX = px - dx;   // prime leaf, down-left
        const rightX = px + dx;  // quotient, down-right
        const isLastQ = i === levels - 1; // the final quotient is prime
        return (
          <g key={i}>
            <line className="ln-mark" x1={px - 6} y1={py + 9} x2={leftX + 8} y2={ly - r - 2} />
            <line className="ln-mark" x1={px + 6} y1={py + 9} x2={rightX - 6} y2={ly - (isLastQ ? r + 2 : 12)} />
            {/* Prime leaf (circled), down-left */}
            <circle className="ln-mark" cx={leftX} cy={ly} r={r} fill="#fff" />
            <text className={hideLeaves ? "ln-accent-label" : "fd-label"} x={leftX} y={ly + 5} textAnchor="middle">
              {label(p, hideLeaves)}
            </text>
            {/* Quotient, down-right (circled once it's the final prime) */}
            {isLastQ && <circle className="ln-mark" cx={rightX} cy={ly} r={r} fill="#fff" />}
            <text
              className={isLastQ && hideLeaves ? "ln-accent-label" : "fd-label"}
              x={rightX} y={ly + 5} textAnchor="middle"
            >
              {label(q, isLastQ && hideLeaves)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

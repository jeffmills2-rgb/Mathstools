import React from "react";

import { fitPoints, pathFromPoints, resolveLabelPositions } from "./lengthDiagramUtils.js";

/**
 * CompositeRectilinearDiagram (Phase 3B) — an L / T / step shaped rectilinear
 * figure for composite-perimeter questions. Points come in ABSTRACT grid units
 * (y-up) and are auto-fitted; labels are placed by the collision-aware
 * resolver in lengthDiagramUtils (short notch edges push their labels apart so
 * they can never overlap — teacher fix), and a missing edge can be
 * accent-highlighted with its "x" label.
 *
 * diagramData: { points: [{x,y}…], edgeLabels: [{ edge: i, text, highlight? }] }
 * (edge i runs points[i] → points[i+1 mod n].)
 */
export default function CompositeRectilinearDiagram({ data }) {
  const raw = Array.isArray(data?.points) ? data.points : [];
  if (raw.length < 4) return null;
  const pts = fitPoints(raw, { left: 62, top: 30, width: 236, height: 160 });
  const n = pts.length;
  const edgeLabels = Array.isArray(data?.edgeLabels) ? data.edgeLabels : [];
  const positions = resolveLabelPositions(pts, edgeLabels.map((e) => e.edge));

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 360 236" role="img"
      aria-label="Composite figure perimeter diagram">
      <path className="ln-shape" d={pathFromPoints(pts)} />
      {edgeLabels.map((item, i) => {
        const a = pts[item.edge];
        const b = pts[(item.edge + 1) % n];
        if (!a || !b) return null;
        const pos = positions[i];
        return (
          <g key={i}>
            {item.highlight && <line className="ln-accent" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />}
            {item.text && (
              <text className={item.highlight ? "ln-accent-label" : "fd-label-sm"}
                x={pos.x} y={pos.y + 4} textAnchor="middle">{item.text}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

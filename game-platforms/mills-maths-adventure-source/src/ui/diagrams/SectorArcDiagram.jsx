import React from "react";

import { polar, arcPath } from "./lengthDiagramUtils.js";

/**
 * SectorArcDiagram (Phase 3B) — a sector (or quadrant/semicircle) with its
 * measurements labelled; the arc can be highlighted for arc-length questions.
 *
 * Label placement is PERPENDICULAR to the labelled edge, pushed away from the
 * sector's interior, so the text never clashes with the line (teacher fix).
 * Semicircles label the DIAMETER along the flat edge (labelMode "diameter").
 *
 * diagramData: { angle, radius, unit, highlightArc?: boolean,
 *                labelMode?: "radius" | "diameter", labelValue?: number }
 */
export default function SectorArcDiagram({ data }) {
  const angle = Math.min(355, Math.max(15, Number(data?.angle ?? 90)));
  const unit = data?.unit || "cm";
  const labelMode = data?.labelMode === "diameter" ? "diameter" : "radius";
  const labelValue = data?.labelValue ?? data?.radius ?? "";
  const highlightArc = Boolean(data?.highlightArc);
  const labelText = `${labelValue} ${unit}`;

  const cx = 180;
  const isQuadrant = angle === 90;
  const isSemi = angle === 180;
  // Quadrant: vertical + horizontal edges. Semicircle: flat bottom. Otherwise
  // symmetric about 12 o'clock.
  const start = isQuadrant ? 0 : isSemi ? 270 : -angle / 2;
  const end = start + angle;
  const r = angle > 180 ? 88 : 100;
  const cy = isSemi ? 168 : angle > 180 ? 118 : 178;

  const a = polar(cx, cy, r, start);
  const b = polar(cx, cy, r, end);
  const large = angle > 180 ? 1 : 0;
  const mid = (start + end) / 2;

  // Angle marker (small inner arc + label); skipped for the semicircle.
  const innerR = 26;
  const anglePos = polar(cx, cy, innerR + 24, mid);

  // Radius label: midpoint of the FIRST straight edge, offset perpendicular to
  // the edge, on the side AWAY from the sector interior.
  const eMid = { x: (cx + a.x) / 2, y: (cy + a.y) / 2 };
  const eLen = Math.hypot(a.x - cx, a.y - cy) || 1;
  const eu = { x: (a.x - cx) / eLen, y: (a.y - cy) / eLen };
  let n = { x: -eu.y, y: eu.x };
  const interior = polar(cx, cy, r * 0.5, mid);
  if ((eMid.x + n.x - interior.x) ** 2 + (eMid.y + n.y - interior.y) ** 2 <
      (eMid.x - n.x - interior.x) ** 2 + (eMid.y - n.y - interior.y) ** 2) {
    n = { x: -n.x, y: -n.y };
  }
  const radLabel = { x: eMid.x + n.x * 26, y: eMid.y + n.y * 26 };

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 360 236" role="img"
      aria-label={isSemi ? "Semicircle" : isQuadrant ? "Quadrant" : `Sector of ${angle} degrees`}>
      <path className="ln-shape"
        d={`M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y} Z`} />
      {highlightArc && <path className="ln-accent" d={arcPath(cx, cy, r, start, end)} />}

      {isQuadrant ? (
        <g>
          <path className="ln-mark" d={`M ${cx} ${cy - 14} L ${cx + 14} ${cy - 14} L ${cx + 14} ${cy}`} />
          <text className="fd-label-sm" x={cx + 34} y={cy - 26} textAnchor="start">90°</text>
        </g>
      ) : !isSemi ? (
        <g>
          <path className="ln-mark" d={arcPath(cx, cy, innerR, start, end)} />
          <text className="fd-label-sm" x={anglePos.x} y={anglePos.y + 4} textAnchor="middle">{angle}°</text>
        </g>
      ) : null}

      {isSemi && labelMode === "diameter" ? (
        // Diameter along the whole flat edge (teacher fix: never label a
        // semicircle with a half-edge radius).
        <text className="fd-label" x={cx} y={cy + 24} textAnchor="middle">{labelText}</text>
      ) : isSemi ? (
        <g>
          <circle className="ln-dot" cx={cx} cy={cy} r={3.5} />
          <line className="ln-accent" x1={cx} y1={cy} x2={cx + r} y2={cy} />
          <text className="fd-label" x={cx + r / 2} y={cy + 24} textAnchor="middle">{labelText}</text>
        </g>
      ) : (
        <text className="fd-label" x={radLabel.x} y={radLabel.y + 5} textAnchor="middle">{labelText}</text>
      )}
    </svg>
  );
}

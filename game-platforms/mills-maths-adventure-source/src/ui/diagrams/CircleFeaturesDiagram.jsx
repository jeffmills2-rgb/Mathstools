import React from "react";

import { polar, arcPath } from "./lengthDiagramUtils.js";

/**
 * CircleFeaturesDiagram (Phase 3B) — a circle with ONE feature highlighted for
 * naming questions: radius, diameter, chord, arc, sector, segment or tangent.
 * The question text refers to "the highlighted part".
 *
 * diagramData: { feature }
 */
export default function CircleFeaturesDiagram({ data }) {
  const feature = data?.feature || "radius";
  const cx = 180, cy = 112, r = 82;

  let mark = null;
  if (feature === "radius") {
    const p = polar(cx, cy, r, 60);
    mark = <line className="ln-accent" x1={cx} y1={cy} x2={p.x} y2={p.y} />;
  } else if (feature === "diameter") {
    const a = polar(cx, cy, r, 240), b = polar(cx, cy, r, 60);
    mark = <line className="ln-accent" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
  } else if (feature === "chord") {
    const a = polar(cx, cy, r, 300), b = polar(cx, cy, r, 45);
    mark = <line className="ln-accent" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
  } else if (feature === "arc") {
    mark = <path className="ln-accent" d={arcPath(cx, cy, r, 20, 110)} />;
  } else if (feature === "sector") {
    const a = polar(cx, cy, r, 25), b = polar(cx, cy, r, 95);
    mark = (
      <path className="ln-accent-fill"
        d={`M ${cx} ${cy} L ${a.x} ${a.y} ${arcPath(cx, cy, r, 25, 95).replace(/^M[^A]*/, "")} Z`} />
    );
  } else if (feature === "segment") {
    const a = polar(cx, cy, r, 120), b = polar(cx, cy, r, 205);
    mark = (
      <path className="ln-accent-fill"
        d={`M ${a.x} ${a.y} ${arcPath(cx, cy, r, 120, 205).replace(/^M[^A]*/, "")} L ${a.x} ${a.y} Z`} />
    );
  } else if (feature === "tangent") {
    const t = polar(cx, cy, r, 90); // rightmost point
    mark = (
      <g>
        <line className="ln-accent" x1={t.x} y1={t.y - 92} x2={t.x} y2={t.y + 92} />
        <circle className="ln-dot" cx={t.x} cy={t.y} r={4} />
      </g>
    );
  }

  return (
    <svg className="diagram-svg" viewBox="0 0 360 224" role="img"
      aria-label="Circle with a highlighted feature">
      <circle className="ln-shape" cx={cx} cy={cy} r={r} />
      <circle className="ln-dot" cx={cx} cy={cy} r={4} />
      {mark}
    </svg>
  );
}

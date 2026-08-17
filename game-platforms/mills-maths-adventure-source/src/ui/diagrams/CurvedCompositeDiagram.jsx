import React from "react";

/**
 * CurvedCompositeDiagram (Phase 3B) — composite figures with circular parts
 * for perimeter questions. Dashed construction lines show where the straight
 * shape ends and the curve begins (an improvement on the legacy engine, which
 * left several shapes without construction cues).
 *
 * diagramData: { shape: "rectangleSemicircle" | "stadium" | "archRectangle" |
 *                        "squareQuadrantCutout" | "fourSemicircleSquare",
 *                unit, w?, h?, side? }   (labels show "<value> <unit>")
 */
export default function CurvedCompositeDiagram({ data }) {
  const shape = data?.shape || "rectangleSemicircle";
  const unit = data?.unit || "cm";
  const lab = (v) => `${v} ${unit}`;

  if (shape === "stadium") {
    // Straight length w, width (diameter of the end caps) h.
    const x = 88, y = 82, w = 184, h = 84, r = h / 2;
    return (
      <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 360 236" role="img" aria-label="Stadium shape">
        <path className="ln-shape" d={`M ${x} ${y} H ${x + w} A ${r} ${r} 0 0 1 ${x + w} ${y + h} H ${x} A ${r} ${r} 0 0 1 ${x} ${y} Z`} />
        <line className="ln-dash" x1={x} y1={y} x2={x} y2={y + h} />
        <line className="ln-dash" x1={x + w} y1={y} x2={x + w} y2={y + h} />
        <text className="fd-label" x={x + w / 2} y={y - 12} textAnchor="middle">{lab(data?.w)}</text>
        <text className="fd-label" x={x - 54} y={y + h / 2 + 5} textAnchor="middle">{lab(data?.h)}</text>
      </svg>
    );
  }

  if (shape === "archRectangle") {
    // Rectangle w×h with a semicircle ON TOP (diameter w).
    const x = 108, y = 108, w = 144, h = 84, r = w / 2;
    return (
      <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 360 236" role="img" aria-label="Arch shape">
        <path className="ln-shape" d={`M ${x} ${y} A ${r} ${r} 0 0 1 ${x + w} ${y} V ${y + h} H ${x} Z`} />
        <line className="ln-dash" x1={x} y1={y} x2={x + w} y2={y} />
        <text className="fd-label" x={x + w / 2} y={y + 22} textAnchor="middle">{lab(data?.w)}</text>
        <text className="fd-label" x={x - 44} y={y + h / 2 + 5} textAnchor="middle">{lab(data?.h)}</text>
      </svg>
    );
  }

  if (shape === "squareQuadrantCutout") {
    // A square of side s with a quadrant "bite" — boundary: two sides + arc.
    const x = 118, y = 42, s = 152;
    return (
      <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 360 236" role="img" aria-label="Square with quadrant arc">
        <path className="ln-shape" d={`M ${x} ${y} H ${x + s} A ${s} ${s} 0 0 1 ${x} ${y + s} Z`} />
        <line className="ln-dash" x1={x + s} y1={y} x2={x + s} y2={y + s} />
        <line className="ln-dash" x1={x + s} y1={y + s} x2={x} y2={y + s} />
        <text className="fd-label" x={x + s / 2} y={y - 12} textAnchor="middle">{lab(data?.side)}</text>
        <text className="fd-label" x={x - 44} y={y + s / 2 + 5} textAnchor="middle">{lab(data?.side)}</text>
      </svg>
    );
  }

  if (shape === "fourSemicircleSquare") {
    // Four semicircles on a (dashed) square of side s — a "flower" boundary.
    const x = 122, y = 48, s = 140, r = s / 2;
    return (
      <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 360 246" role="img" aria-label="Four semicircles on a square">
        <path className="ln-shape" d={[
          `M ${x} ${y}`,
          `A ${r} ${r} 0 0 1 ${x + s} ${y}`,
          `A ${r} ${r} 0 0 1 ${x + s} ${y + s}`,
          `A ${r} ${r} 0 0 1 ${x} ${y + s}`,
          `A ${r} ${r} 0 0 1 ${x} ${y}`,
          "Z",
        ].join(" ")} />
        <rect className="ln-dash" x={x} y={y} width={s} height={s} fill="none" />
        <text className="fd-label" x={x + s / 2} y={y + r + 5} textAnchor="middle">{lab(data?.side)}</text>
      </svg>
    );
  }

  // Default: rectangle w×h with a semicircle on the RIGHT end (diameter h).
  const x = 66, y = 76, w = 158, h = 96, r = h / 2;
  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox="0 0 360 236" role="img" aria-label="Rectangle with semicircular end">
      <path className="ln-shape" d={`M ${x} ${y} H ${x + w} A ${r} ${r} 0 0 1 ${x + w} ${y + h} H ${x} Z`} />
      <line className="ln-dash" x1={x + w} y1={y} x2={x + w} y2={y + h} />
      <text className="fd-label" x={x + w / 2} y={y - 12} textAnchor="middle">{lab(data?.w)}</text>
      <text className="fd-label" x={x - 44} y={y + h / 2 + 5} textAnchor="middle">{lab(data?.h)}</text>
    </svg>
  );
}

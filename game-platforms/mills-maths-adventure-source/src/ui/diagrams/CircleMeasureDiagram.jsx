import React from "react";

/**
 * CircleMeasureDiagram (Phase 3B) — a circle for circumference questions with
 * the radius OR diameter labelled; for reverse questions the circumference is
 * given (dashed highlight around the outside) and the asked line shows "?".
 *
 * diagramData: { given: "radius"|"diameter"|"circumference", value, unit,
 *                askFor?: "radius"|"diameter" }   (askFor used with circumference)
 */
export default function CircleMeasureDiagram({ data }) {
  const given = data?.given || "radius";
  const value = data?.value ?? "";
  const unit = data?.unit || "cm";
  const askFor = data?.askFor || "diameter";
  const cx = 180, cy = 116, r = 84;
  const text = `${value} ${unit}`;

  if (given === "circumference") {
    // C labelled outside; the asked line carries "?".
    const askDiameter = askFor === "diameter";
    return (
      <svg className="diagram-svg" viewBox="0 0 360 232" role="img" aria-label="Circle with circumference given">
        <circle className="ln-shape" cx={cx} cy={cy} r={r} />
        <circle className="ln-dash" cx={cx} cy={cy} r={r + 8} fill="none" />
        <circle className="ln-dot" cx={cx} cy={cy} r={4} />
        <line className="ln-accent" x1={askDiameter ? cx - r : cx} y1={cy} x2={cx + r} y2={cy} />
        <text className="ln-accent-label" x={askDiameter ? cx : cx + r / 2} y={cy - 10} textAnchor="middle">?</text>
        <text className="fd-label" x={cx} y={cy - r - 16} textAnchor="middle">{`C = ${text}`}</text>
      </svg>
    );
  }

  const isDiameter = given === "diameter";
  return (
    <svg className="diagram-svg" viewBox="0 0 360 232" role="img"
      aria-label={`Circle with ${given} labelled`}>
      <circle className="ln-shape" cx={cx} cy={cy} r={r} />
      <circle className="ln-dot" cx={cx} cy={cy} r={4} />
      <line className="ln-accent" x1={isDiameter ? cx - r : cx} y1={cy} x2={cx + r} y2={cy} />
      <text className="fd-label" x={isDiameter ? cx : cx + r / 2} y={cy - 10} textAnchor="middle">{text}</text>
    </svg>
  );
}

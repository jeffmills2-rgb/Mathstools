import React from "react";

/**
 * RectangleAreaDiagram — draws a rectangle roughly to scale with its width and
 * height (and units) labelled on the outside. Reads diagramData:
 *   { width, height, unit }
 *
 * Pure presentational SVG: no state, no stores. Safe to render above any input.
 */
export default function RectangleAreaDiagram({ data }) {
  const { width, height, unit } = data || {};
  if (!(width > 0) || !(height > 0)) return null;

  // Fit the rectangle into a 180×120 drawing region, anchored bottom-left at
  // (50, 150) inside a 260×200 viewBox (leaving room for outside labels).
  const s = Math.min(180 / width, 120 / height);
  const w = width * s;
  const h = height * s;
  const x0 = 50;
  const yB = 150; // bottom baseline
  const yT = yB - h;

  return (
    <svg className="diagram-svg" viewBox="0 0 260 200" role="img"
      aria-label={`Rectangle ${width} by ${height} ${unit}`}>
      <rect className="diagram-shape" x={x0} y={yT} width={w} height={h} />

      {/* width label (bottom) */}
      <text className="diagram-dim" x={x0 + w / 2} y={yB + 22} textAnchor="middle">
        {width} {unit}
      </text>
      {/* height label (left, rotated) */}
      <text className="diagram-dim" x={x0 - 14} y={yT + h / 2}
        textAnchor="middle" transform={`rotate(-90 ${x0 - 14} ${yT + h / 2})`}>
        {height} {unit}
      </text>
    </svg>
  );
}

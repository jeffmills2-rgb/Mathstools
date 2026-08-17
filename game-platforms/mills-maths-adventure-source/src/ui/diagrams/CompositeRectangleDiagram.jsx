import React from "react";

/**
 * CompositeRectangleDiagram — draws an L-shape: an outer rectangle (W×H) with a
 * rectangular notch (notchW×notchH) removed from the top-right corner. The
 * removed corner is shown with dashed lines so it reads as a cut-out. Reads
 * diagramData: { W, H, notchW, notchH, unit }
 *
 * Pure presentational SVG.
 */
export default function CompositeRectangleDiagram({ data }) {
  const { W, H, notchW, notchH, unit } = data || {};
  if (!(W > 0) || !(H > 0) || !(notchW > 0) || !(notchH > 0)) return null;

  const s = Math.min(180 / W, 120 / H);
  const pw = W * s;
  const ph = H * s;
  const nw = notchW * s;
  const nh = notchH * s;

  const x0 = 50;
  const yB = 150;
  const yT = yB - ph;
  const xR = x0 + pw;

  // L outline (clockwise from top-left), notch removed from top-right.
  const points = [
    `${x0},${yT}`,
    `${xR - nw},${yT}`,
    `${xR - nw},${yT + nh}`,
    `${xR},${yT + nh}`,
    `${xR},${yB}`,
    `${x0},${yB}`,
  ].join(" ");

  return (
    <svg className="diagram-svg" viewBox="0 0 270 200" role="img"
      aria-label={`L-shape ${W} by ${H} with ${notchW} by ${notchH} corner removed, ${unit}`}>
      <polygon className="diagram-shape" points={points} />

      {/* dashed outline of the removed corner */}
      <path className="diagram-cut" d={`M ${xR - nw} ${yT} L ${xR} ${yT} L ${xR} ${yT + nh}`} />

      {/* outer width (bottom) + outer height (left) */}
      <text className="diagram-dim" x={x0 + pw / 2} y={yB + 22} textAnchor="middle">
        {W} {unit}
      </text>
      <text className="diagram-dim" x={x0 - 14} y={yT + ph / 2}
        textAnchor="middle" transform={`rotate(-90 ${x0 - 14} ${yT + ph / 2})`}>
        {H} {unit}
      </text>

      {/* notch width (above the cut) + notch height (right of the cut) */}
      <text className="diagram-dim diagram-dim-sm" x={xR - nw / 2} y={yT - 6} textAnchor="middle">
        {notchW} {unit}
      </text>
      <text className="diagram-dim diagram-dim-sm" x={xR + 14} y={yT + nh / 2}
        textAnchor="middle" transform={`rotate(-90 ${xR + 14} ${yT + nh / 2})`}>
        {notchH} {unit}
      </text>
    </svg>
  );
}

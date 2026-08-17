import React from "react";

/**
 * DistanceTimeGraphDiagram (Phase 3A2) — a distance–time graph made of
 * straight-line segments (out / stop / return journeys). Ported from the CHHS
 * Exam-Builder rates engine design, redrawn with the shared diagram styles.
 *
 * Reads diagramData:
 *   { xMax, yMax, xTick, yTick, points: [{x,y}, …], xLabel?, yLabel? }
 * Points are the journey's vertices in order; x is time, y is distance.
 */
export default function DistanceTimeGraphDiagram({ data }) {
  const xMax = Number(data?.xMax ?? 60);
  const yMax = Number(data?.yMax ?? 400);
  const xTick = Number(data?.xTick ?? 10);
  const yTick = Number(data?.yTick ?? 100);
  const points = Array.isArray(data?.points) ? data.points : [];
  const xLabel = data?.xLabel ?? "Time (minutes)";
  const yLabel = data?.yLabel ?? "Distance (m)";

  const W = 380, H = 270;
  const plot = { left: 64, right: W - 18, top: 18, bottom: H - 52 };
  const px = (v) => plot.left + (v / xMax) * (plot.right - plot.left);
  const py = (v) => plot.bottom - (v / yMax) * (plot.bottom - plot.top);

  const xGrid = [];
  for (let v = xTick; v <= xMax + 1e-9; v += xTick) xGrid.push(Math.round(v * 100) / 100);
  const yGrid = [];
  for (let v = yTick; v <= yMax + 1e-9; v += yTick) yGrid.push(Math.round(v * 100) / 100);

  const path = points.map((p) => `${px(p.x)},${py(p.y)}`).join(" ");

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label="Distance-time graph">
      {/* Grid */}
      {xGrid.map((v) => (
        <line key={`gx${v}`} className="fd-tick-minor" x1={px(v)} y1={plot.top} x2={px(v)} y2={plot.bottom} />
      ))}
      {yGrid.map((v) => (
        <line key={`gy${v}`} className="fd-tick-minor" x1={plot.left} y1={py(v)} x2={plot.right} y2={py(v)} />
      ))}
      {/* Axes */}
      <line className="fd-line" x1={plot.left} y1={plot.top} x2={plot.left} y2={plot.bottom} />
      <line className="fd-line" x1={plot.left} y1={plot.bottom} x2={plot.right} y2={plot.bottom} />
      {/* Axis tick values */}
      <text className="fd-label-sm" x={plot.left} y={plot.bottom + 18} textAnchor="middle">0</text>
      {xGrid.map((v) => (
        <text key={`lx${v}`} className="fd-label-sm" x={px(v)} y={plot.bottom + 18} textAnchor="middle">{v}</text>
      ))}
      {yGrid.map((v) => (
        <text key={`ly${v}`} className="fd-label-sm" x={plot.left - 8} y={py(v) + 4} textAnchor="end">{v}</text>
      ))}
      {/* Axis titles */}
      <text className="fd-axis" x={(plot.left + plot.right) / 2} y={H - 14} textAnchor="middle">{xLabel}</text>
      <text
        className="fd-axis"
        x={16}
        y={(plot.top + plot.bottom) / 2}
        textAnchor="middle"
        transform={`rotate(-90 16 ${(plot.top + plot.bottom) / 2})`}
      >
        {yLabel}
      </text>
      {/* The journey */}
      {points.length > 1 && (
        <polyline points={path} fill="none" stroke="#2a9d8f" strokeWidth="3.5"
          strokeLinejoin="round" strokeLinecap="round" />
      )}
      {points.map((p, i) => (
        <circle key={`p${i}`} cx={px(p.x)} cy={py(p.y)} r="4" fill="#1d3557" />
      ))}
    </svg>
  );
}

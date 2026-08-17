import React from "react";

import { dotStacks, stemAndLeaf, round } from "./chartUtils.js";

/**
 * StatPlotChartDiagram (Phase 3I) — dot plots (stacked accurately over each
 * value) and ordered stem-and-leaf plots (with a key). Full furniture (title,
 * axis label, source, key) is baked in.
 *
 * diagramData: { chartType: "dotPlot"|"stemLeaf", title, source, xLabel, raw:[numbers] }
 */
const W = 384, H = 300;

export default function StatPlotChartDiagram({ data }) {
  const type = data?.chartType || "dotPlot";
  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${type} plot`}>
      <text className="ch-title" x={W / 2} y={18} textAnchor="middle">{data?.title}</text>
      {type === "dotPlot" ? <DotPlot data={data} /> : <StemLeaf data={data} />}
      {data?.source && <text className="ch-source" x={16} y={H - 6} textAnchor="start">{data.source}</text>}
    </svg>
  );
}

function DotPlot({ data }) {
  const stacks = dotStacks(data.raw || []);
  const left = 46, right = 348, baseline = 232;
  const n = stacks.length;
  const band = (right - left) / n;
  const dotR = Math.min(6, band * 0.32);
  const gap = dotR * 2 + 2;
  const maxStack = Math.max(1, ...stacks.map((s) => s.count));
  const topRoom = baseline - 40;
  const step = Math.min(gap, topRoom / maxStack);
  return (
    <g>
      <line className="ch-axis" x1={left - 6} y1={baseline} x2={right + 6} y2={baseline} />
      {stacks.map((s, i) => {
        const cx = left + band * (i + 0.5);
        return (
          <g key={i}>
            {Array.from({ length: s.count }).map((_, k) => (
              <circle key={k} className="ch-dot-plot" cx={round(cx)} cy={round(baseline - 10 - k * step)} r={dotR} />
            ))}
            <text className="ch-cat" x={round(cx)} y={baseline + 16} textAnchor="middle">{s.value}</text>
          </g>
        );
      })}
      <text className="ch-axis-label" x={(left + right) / 2} y={H - 22} textAnchor="middle">{data.xLabel}</text>
    </g>
  );
}

function StemLeaf({ data }) {
  const { rows, key } = stemAndLeaf(data.raw || []);
  const top = 52, rowH = Math.min(20, (H - 110) / Math.max(rows.length, 1));
  const stemX = 150, divX = 158, leafX = 168;
  return (
    <g>
      <text className="ch-sl-head" x={stemX} y={top - 10} textAnchor="end">Stem</text>
      <text className="ch-sl-head" x={leafX} y={top - 10} textAnchor="start">Leaf</text>
      <line className="ch-axis" x1={divX} y1={top - 4} x2={divX} y2={top + rowH * rows.length + 2} />
      {rows.map((r, i) => {
        const y = top + rowH * (i + 0.7);
        return (
          <g key={i}>
            <text className="ch-sl-stem" x={stemX} y={y} textAnchor="end">{r.stem}</text>
            <text className="ch-sl-leaf" x={leafX} y={y} textAnchor="start">{r.leaves.join(" ")}</text>
          </g>
        );
      })}
      <text className="ch-key" x={W / 2} y={top + rowH * rows.length + 26} textAnchor="middle">Key: {key}</text>
    </g>
  );
}

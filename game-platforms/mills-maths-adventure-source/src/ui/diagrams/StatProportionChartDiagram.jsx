import React from "react";

import { sectorAngles, sum, round } from "./chartUtils.js";

/**
 * StatProportionChartDiagram (Phase 3I) — parts-of-a-whole displays: sector
 * (pie) graphs with angles GENUINELY proportional to the data, divided bar
 * graphs, and pictograms with a key and correct partial icons. A
 * `misleading:"iconSize"` flag scales pictogram icons by value (bigger rows use
 * bigger icons) so area exaggerates the differences — for contrast questions.
 *
 * diagramData: {
 *   chartType: "sector"|"dividedBar"|"pictogram",
 *   title, source, categories: [{label,freq}], unit?, perIcon?, misleading?,
 * }
 */
const W = 384, H = 300;
const PALETTE = ["#2a9d8f", "#e76f51", "#457b9d", "#e9c46a", "#6d597a", "#f4a261", "#264653"];

export default function StatProportionChartDiagram({ data }) {
  const type = data?.chartType || "sector";
  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${type} graph`}>
      <text className="ch-title" x={W / 2} y={18} textAnchor="middle">{data?.title}</text>
      {type === "sector" && <Pie data={data} />}
      {type === "dividedBar" && <DividedBar data={data} />}
      {type === "pictogram" && <Pictogram data={data} />}
      {data?.source && <text className="ch-source" x={16} y={H - 6} textAnchor="start">{data.source}</text>}
    </svg>
  );
}

function polar(cx, cy, r, deg) {
  const a = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) };
}

function Pie({ data }) {
  const cats = data.categories || [];
  const segs = sectorAngles(cats.map((c) => c.freq));
  const cx = 118, cy = 168, r = 84;
  return (
    <g>
      {segs.map((s, i) => {
        const a = polar(cx, cy, r, s.startDeg), b = polar(cx, cy, r, s.endDeg);
        const large = s.angle > 180 ? 1 : 0;
        const mid = polar(cx, cy, r * 0.62, (s.startDeg + s.endDeg) / 2);
        return (
          <g key={i}>
            <path className="ch-sector" d={`M ${cx} ${cy} L ${round(a.x)} ${round(a.y)} A ${r} ${r} 0 ${large} 1 ${round(b.x)} ${round(b.y)} Z`} fill={PALETTE[i % PALETTE.length]} />
            {s.percent >= 8 && <text className="ch-sector-label" x={round(mid.x)} y={round(mid.y) + 3} textAnchor="middle">{s.percent}%</text>}
          </g>
        );
      })}
      <Legend cats={cats} x={224} y={70} />
    </g>
  );
}

function DividedBar({ data }) {
  const cats = data.categories || [];
  const total = sum(cats.map((c) => c.freq)) || 1;
  const x0 = 40, x1 = 344, y = 120, h = 44;
  let x = x0;
  return (
    <g>
      {cats.map((c, i) => {
        const w = (c.freq / total) * (x1 - x0);
        const seg = <g key={i}>
          <rect className="ch-sector" x={round(x)} y={y} width={round(w)} height={h} fill={PALETTE[i % PALETTE.length]} />
          {w > 22 && <text className="ch-sector-label" x={round(x + w / 2)} y={y + h / 2 + 3} textAnchor="middle">{Math.round((c.freq / total) * 100)}%</text>}
        </g>;
        x += w;
        return seg;
      })}
      <rect className="ch-axis" x={x0} y={y} width={x1 - x0} height={h} fill="none" />
      <Legend cats={cats} x={40} y={186} horizontal />
    </g>
  );
}

function Pictogram({ data }) {
  const cats = data.categories || [];
  const maxF = Math.max(...cats.map((c) => c.freq));
  const per = data.perIcon || (maxF > 24 ? 5 : maxF > 10 ? 2 : 1);
  const rowH = Math.min(30, (H - 96) / cats.length);
  const x0 = 96, top = 46, iconR = 7;
  return (
    <g>
      {cats.map((c, i) => {
        const cy = top + rowH * (i + 0.5);
        const whole = Math.floor(c.freq / per);
        const frac = (c.freq % per) / per;
        const scale = data.misleading === "iconSize" ? 0.7 + (c.freq / maxF) * 0.8 : 1; // distortion
        const rr = iconR * scale;
        const icons = [];
        for (let k = 0; k < whole; k++) icons.push(<circle key={k} className="ch-icon" cx={x0 + 8 + k * 20} cy={cy} r={rr} />);
        if (frac > 0) icons.push(<path key="p" className="ch-icon" d={halfCircle(x0 + 8 + whole * 20, cy, rr)} />);
        return (
          <g key={i}>
            <text className="ch-cat" x={x0 - 8} y={cy + 3.5} textAnchor="end">{c.label}</text>
            {icons}
          </g>
        );
      })}
      <text className="ch-key" x={16} y={H - 22} textAnchor="start">Key: each ⬤ = {per} {data.unit || "items"}</text>
    </g>
  );
}
function halfCircle(cx, cy, r) {
  return `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`;
}

function Legend({ cats, x, y, horizontal }) {
  return (
    <g>
      {cats.map((c, i) => {
        const px = horizontal ? x + (i % 3) * 108 : x;
        const py = horizontal ? y + Math.floor(i / 3) * 18 : y + i * 20;
        return (
          <g key={i}>
            <rect className="ch-swatch" x={px} y={py - 9} width={12} height={12} fill={PALETTE[i % PALETTE.length]} />
            <text className="ch-legend" x={px + 17} y={py + 1}>{c.label} ({c.freq})</text>
          </g>
        );
      })}
    </g>
  );
}

import React from "react";

import { niceScale, scaleLinear, polygonPoints, truncatedAxis, sum, round } from "./chartUtils.js";

/**
 * StatAxisChartDiagram (Phase 3I) — the axis-based charts that share one frame:
 * column, (horizontal) bar, line, frequency histogram, and frequency polygon
 * (optionally overlaying a histogram). Full chart furniture (title, axis labels,
 * scale, source) is baked in. A `misleading:"truncated"` flag starts the value
 * axis above zero (with a broken-axis mark) so a question can contrast it with
 * the honest, zero-based version.
 *
 * diagramData: {
 *   chartType: "column"|"bar"|"line"|"histogram"|"polygon",
 *   title, source, xLabel, yLabel,
 *   categories?: [{label,freq}], bins?: [{lo,hi,count}], series?: [{label,value}],
 *   overlayHistogram?: boolean, misleading?: "truncated"|null, color?: string,
 * }
 */
const W = 384, H = 300;
const BOX = { left: 50, right: 366, top: 36, bottom: 246 };

export default function StatAxisChartDiagram({ data }) {
  const type = data?.chartType || "column";
  const isBar = type === "bar";
  const values = valuesOf(data);
  const maxV = Math.max(1, ...values);
  const truncated = data?.misleading === "truncated";
  const vStart = truncated ? truncatedAxis(Math.min(...values), maxV).start : 0;
  // `yStep` (optional) forces the tick step so every data point lands on a
  // gridline — used by line graphs so the increment / values are readable.
  const scale = truncated
    ? { max: truncatedAxis(Math.min(...values), maxV).end, ticks: buildTicks(vStart, truncatedAxis(Math.min(...values), maxV).end) }
    : data?.yStep ? customScale(maxV, data.yStep) : niceScale(maxV);

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${type} graph`}>
      <text className="ch-title" x={W / 2} y={18} textAnchor="middle">{data?.title}</text>
      {isBar ? <HBar data={data} values={values} scale={scale} /> : <VChart data={data} type={type} values={values} scale={scale} vStart={vStart} truncated={truncated} />}
      {data?.source && <text className="ch-source" x={BOX.left} y={H - 6} textAnchor="start">{data.source}</text>}
    </svg>
  );
}

function valuesOf(d) {
  if (d?.chartType === "histogram" || d?.chartType === "polygon") return (d.bins || []).map((b) => b.count);
  if (d?.chartType === "line") return (d.series || []).map((s) => s.value);
  return (d?.categories || []).map((c) => c.freq);
}
// Ticks at exact multiples of `step` from zero, up past the max value — so data
// values that are multiples of `step` sit exactly on gridlines.
function customScale(maxV, step) {
  const max = Math.max(step, Math.ceil(maxV / step) * step);
  const ticks = [];
  for (let v = 0; v <= max + 1e-9; v += step) ticks.push(round(v, 4));
  return { max, step, ticks };
}
function buildTicks(a, b) {
  const step = niceScale(b - a).ticks[1] || 1;
  const s = Math.ceil(a / step) * step;
  const t = [a];
  for (let v = s; v <= b + 1e-9; v += step) if (v > a) t.push(round(v, 4));
  return t;
}

// Vertical charts: column, line, histogram, polygon.
function VChart({ data, type, values, scale, vStart, truncated }) {
  const { left, right, top, bottom } = BOX;
  const yFor = scaleLinear(vStart, scale.max, bottom, top);
  const color = data?.color || "#2a9d8f";

  const grid = scale.ticks.map((t, i) => (
    <g key={`g${i}`}>
      <line className="ch-grid" x1={left} y1={yFor(t)} x2={right} y2={yFor(t)} />
      <text className="ch-tick" x={left - 6} y={yFor(t) + 3.5} textAnchor="end">{t}</text>
    </g>
  ));

  let content = null, xaxis = null;
  if (type === "column") {
    const cats = data.categories || [];
    const band = (right - left) / cats.length;
    const bw = Math.min(46, band * 0.6);
    content = cats.map((c, i) => {
      const cx = left + band * (i + 0.5);
      return <rect key={i} className="ch-bar" x={cx - bw / 2} y={yFor(c.freq)} width={bw} height={bottom - yFor(c.freq)} fill={color} />;
    });
    xaxis = cats.map((c, i) => <text key={i} className="ch-cat" x={left + band * (i + 0.5)} y={bottom + 14} textAnchor="middle">{c.label}</text>);
  } else if (type === "line") {
    const s = data.series || [];
    const band = (right - left) / s.length;
    const pts = s.map((p, i) => ({ x: left + band * (i + 0.5), y: yFor(p.value) }));
    content = (
      <g>
        <polyline className="ch-line" points={pts.map((p) => `${round(p.x)},${round(p.y)}`).join(" ")} />
        {pts.map((p, i) => <circle key={i} className="ch-dot" cx={p.x} cy={p.y} r={3.2} />)}
      </g>
    );
    xaxis = s.map((p, i) => <text key={i} className="ch-cat" x={left + band * (i + 0.5)} y={bottom + 14} textAnchor="middle">{p.label}</text>);
  } else {
    // histogram / polygon share a numeric x-axis over the class boundaries.
    const bins = data.bins || [];
    const xLo = bins[0].lo, xHi = bins[bins.length - 1].hi;
    const xFor = scaleLinear(xLo, xHi, left, right);
    const bars = bins.map((b, i) => (
      <rect key={i} className={type === "polygon" ? "ch-bar-faint" : "ch-bar"} x={xFor(b.lo)} y={yFor(b.count)} width={xFor(b.hi) - xFor(b.lo)} height={bottom - yFor(b.count)} fill={type === "polygon" ? "#cbd5e1" : color} />
    ));
    const showBars = type === "histogram" || data.overlayHistogram;
    const poly = type === "polygon" ? polygonPoints(bins).map((p) => `${round(xFor(p.mid))},${round(yFor(p.count))}`).join(" ") : null;
    content = <g>{showBars && bars}{poly && <polyline className="ch-line" points={poly} />}{poly && polygonPoints(bins).map((p, i) => <circle key={i} className="ch-dot" cx={round(xFor(p.mid))} cy={round(yFor(p.count))} r={2.8} />)}</g>;
    // boundary ticks
    const bounds = [bins[0].lo, ...bins.map((b) => b.hi)];
    xaxis = bounds.map((v, i) => <text key={i} className="ch-tick" x={xFor(v)} y={bottom + 13} textAnchor="middle">{v}</text>);
  }

  return (
    <g>
      {grid}
      {truncated && <BrokenAxis x={left} y={bottom} />}
      <line className="ch-axis" x1={left} y1={top} x2={left} y2={bottom} />
      <line className="ch-axis" x1={left} y1={bottom} x2={right} y2={bottom} />
      {content}
      {xaxis}
      <text className="ch-axis-label" x={(left + right) / 2} y={H - 24} textAnchor="middle">{data.xLabel}</text>
      <text className="ch-axis-label" transform={`rotate(-90 14 ${(top + bottom) / 2})`} x={14} y={(top + bottom) / 2} textAnchor="middle">{data.yLabel}</text>
    </g>
  );
}

// Horizontal bar chart.
function HBar({ data, values, scale }) {
  const { left, right, top, bottom } = BOX;
  const cats = data.categories || [];
  const xFor = scaleLinear(0, scale.max, left, right);
  const band = (bottom - top) / cats.length;
  const bh = Math.min(30, band * 0.6);
  return (
    <g>
      {scale.ticks.map((t, i) => (
        <g key={i}><line className="ch-grid" x1={xFor(t)} y1={top} x2={xFor(t)} y2={bottom} /><text className="ch-tick" x={xFor(t)} y={bottom + 13} textAnchor="middle">{t}</text></g>
      ))}
      <line className="ch-axis" x1={left} y1={top} x2={left} y2={bottom} />
      <line className="ch-axis" x1={left} y1={bottom} x2={right} y2={bottom} />
      {cats.map((c, i) => {
        const cy = top + band * (i + 0.5);
        return <g key={i}><rect className="ch-bar" x={left} y={cy - bh / 2} width={xFor(c.freq) - left} height={bh} fill={data.color || "#2a9d8f"} /><text className="ch-cat" x={left - 5} y={cy + 3.5} textAnchor="end">{c.label}</text></g>;
      })}
      <text className="ch-axis-label" x={(left + right) / 2} y={H - 24} textAnchor="middle">{data.yLabel}</text>
    </g>
  );
}

function BrokenAxis({ x, y }) {
  return <polyline className="ch-broken" points={`${x - 4},${y - 10} ${x + 4},${y - 16} ${x - 4},${y - 22} ${x + 4},${y - 28}`} />;
}

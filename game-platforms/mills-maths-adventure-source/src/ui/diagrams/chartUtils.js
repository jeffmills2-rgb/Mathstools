/**
 * chartUtils (Phase 3I — Data classification & visualisation) — the PURE
 * charting core shared by the three chart renderers AND the system checks (no
 * React, no DOM). Everything that must be "genuinely right" about a graph lives
 * here: honest auto-scaling from zero, proportional sector angles, equal-width
 * histogram bins, frequency-polygon midpoints, dot stacking, ordered stem-and-
 * leaf, pictogram icon maths, and the misleading-axis transform.
 */

export function round(v, dp = 2) {
  const m = 10 ** dp;
  return Math.round(Number(v) * m) / m;
}
export function sum(arr) {
  return arr.reduce((a, b) => a + Number(b || 0), 0);
}

// A "nice" number (1, 2, 5 × 10^k) at or above x.
function niceNum(x, round) {
  const exp = Math.floor(Math.log10(x || 1));
  const f = (x || 1) / 10 ** exp;
  let nf;
  if (round) nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  else nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * 10 ** exp;
}

/**
 * An honest axis scale that STARTS AT ZERO (the default the syllabus wants),
 * with nice round ticks. Returns { max, step, ticks: [0, step, ...] }.
 */
export function niceScale(maxValue, targetTicks = 5) {
  const range = niceNum(Math.max(1, maxValue), false);
  const step = niceNum(range / Math.max(1, targetTicks - 1), true);
  const max = Math.ceil(Math.max(1, maxValue) / step) * step;
  const ticks = [];
  for (let v = 0; v <= max + 1e-9; v += step) ticks.push(round(v, 4));
  return { max, step, ticks };
}

// A linear map from [d0,d1] (data) to [r0,r1] (pixels).
export function scaleLinear(d0, d1, r0, r1) {
  const m = (r1 - r0) / ((d1 - d0) || 1);
  return (v) => r0 + (v - d0) * m;
}

/**
 * Sector angles GENUINELY proportional to the data. Returns one entry per value
 * with its angle, running start/end (degrees, clockwise from 12 o'clock) and a
 * rounded percentage. The angles sum to 360°.
 */
export function sectorAngles(values) {
  const total = sum(values) || 1;
  let start = 0;
  return values.map((v) => {
    const angle = (Number(v) / total) * 360;
    const seg = { value: Number(v), angle: round(angle, 2), percent: Math.round((Number(v) / total) * 100), startDeg: round(start, 4), endDeg: round(start + angle, 4) };
    start += angle;
    return seg;
  });
}
// The whole-degree sector angle for one value out of a total (for "compute the
// angle" construction questions).
export function sectorAngleOf(value, total) {
  return Math.round((Number(value) / (total || 1)) * 360);
}

// Bin raw values into equal-width classes [lo, lo+width).
export function histogramBins(values, width, start) {
  const lo0 = start != null ? start : Math.floor(Math.min(...values) / width) * width;
  const hi = Math.max(...values);
  const bins = [];
  for (let lo = lo0; lo <= hi; lo += width) {
    bins.push({ lo, hi: lo + width, mid: lo + width / 2, count: values.filter((v) => v >= lo && v < lo + width).length });
  }
  return bins;
}

// Frequency-polygon points: plotted at class MIDPOINTS, anchored to zero one
// class-width before the first and after the last midpoint.
export function polygonPoints(bins) {
  if (!bins.length) return [];
  const w = bins[0].hi - bins[0].lo;
  const pts = [{ mid: bins[0].mid - w, count: 0 }, ...bins.map((b) => ({ mid: b.mid, count: b.count })), { mid: bins[bins.length - 1].mid + w, count: 0 }];
  return pts;
}

// Dot-plot stacks: for each distinct value, how many dots stack above it.
export function dotStacks(values) {
  const map = new Map();
  for (const v of values) map.set(v, (map.get(v) || 0) + 1);
  const min = Math.min(...values), max = Math.max(...values);
  const out = [];
  for (let v = min; v <= max; v++) out.push({ value: v, count: map.get(v) || 0 });
  return out;
}

// Ordered stem-and-leaf. Returns { rows:[{stem, leaves:[sorted]}], key }.
export function stemAndLeaf(values) {
  const s = [...values].sort((a, b) => a - b);
  const map = new Map();
  for (const v of s) {
    const stem = Math.floor(v / 10), leaf = v % 10;
    if (!map.has(stem)) map.set(stem, []);
    map.get(stem).push(leaf);
  }
  const lo = Math.floor(s[0] / 10), hi = Math.floor(s[s.length - 1] / 10);
  const rows = [];
  for (let st = lo; st <= hi; st++) rows.push({ stem: st, leaves: map.get(st) || [] });
  const firstLeaf = rows.find((r) => r.leaves.length);
  return { rows, key: `${firstLeaf.stem} | ${firstLeaf.leaves[0]} means ${firstLeaf.stem * 10 + firstLeaf.leaves[0]}` };
}

// Pictogram icon maths: how many whole icons + the trailing partial fraction.
export function pictogramIcons(value, perIcon) {
  const whole = Math.floor(value / perIcon);
  const partial = round((value % perIcon) / perIcon, 2);
  return { whole, partial, total: whole + (partial > 0 ? 1 : 0) };
}

// Basic single-variable statistics for read/interpret questions.
export function stats(values) {
  const s = [...values].sort((a, b) => a - b);
  const n = s.length;
  const total = sum(s);
  const mean = round(total / n, 2);
  const median = n % 2 ? s[(n - 1) / 2] : round((s[n / 2 - 1] + s[n / 2]) / 2, 2);
  const range = s[n - 1] - s[0];
  const freq = new Map();
  for (const v of s) freq.set(v, (freq.get(v) || 0) + 1);
  let mode = s[0], best = 0;
  for (const [v, c] of freq) if (c > best) { best = c; mode = v; }
  return { n, total, mean, median, range, mode, min: s[0], max: s[n - 1] };
}

/**
 * MISLEADING truncated axis: instead of starting at zero, start just below the
 * smallest value so small differences look huge. Returns { start, end } for the
 * y-axis of the dishonest chart (the honest one uses niceScale from 0).
 */
export function truncatedAxis(minValue, maxValue) {
  const pad = Math.max(1, Math.round((maxValue - minValue) * 0.15));
  const start = Math.max(0, minValue - pad);
  const end = maxValue + pad;
  return { start: Math.floor(start), end: Math.ceil(end) };
}

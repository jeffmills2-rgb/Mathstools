import React from "react";

/**
 * CartesianPlaneDiagram (Phase 3F) — THE renderer for the Linear Relationships
 * topic: a properly scaled coordinate grid with plotted points and straight
 * lines. Rebuilt from the CHHS linear engine with deliberate upgrades:
 *
 *   - Lines get ARROWHEADS at both clipped ends — the line keeps going, which
 *     is exactly the "infinitely many ordered pairs" idea the syllabus wants.
 *   - A half-unit sub-grid appears automatically whenever any point has a
 *     non-integer coordinate, so halves are READABLE, not guesswork.
 *   - Point labels are placed quadrant-aware (offset away from the axes).
 *   - Tick labels auto-skip when the range is dense.
 *
 * diagramData: { xMin, xMax, yMin, yMax,
 *                points?: [{ x, y, label?, accent?, showCoords? }],
 *                lines?:  [{ m, c, label? }],
 *                showIntersection?: boolean }
 */

const LINE_CLASSES = ["cp-line-a", "cp-line-b", "cp-line-c"];

export default function CartesianPlaneDiagram({ data }) {
  const xMin = Math.floor(Number(data?.xMin ?? -6));
  const xMax = Math.ceil(Number(data?.xMax ?? 6));
  const yMin = Math.floor(Number(data?.yMin ?? -6));
  const yMax = Math.ceil(Number(data?.yMax ?? 6));
  const points = Array.isArray(data?.points) ? data.points : [];
  const lines = Array.isArray(data?.lines) ? data.lines : [];

  const W = 360, H = 330;
  const plot = { left: 34, right: W - 16, top: 14, bottom: H - 30 };
  const sx = (x) => plot.left + ((x - xMin) / (xMax - xMin)) * (plot.right - plot.left);
  const sy = (y) => plot.bottom - ((y - yMin) / (yMax - yMin)) * (plot.bottom - plot.top);

  const halfGrid = points.some((p) => !Number.isInteger(p.x) || !Number.isInteger(p.y));
  const xSkip = xMax - xMin > 12 ? 2 : 1;
  const ySkip = yMax - yMin > 12 ? 2 : 1;

  const gridX = [];
  for (let x = xMin; x <= xMax; x++) gridX.push(x);
  const gridY = [];
  for (let y = yMin; y <= yMax; y++) gridY.push(y);

  // Clip y = mx + c to the plot bounds; returns [p1, p2] or null.
  function clip(m, c) {
    const cand = [];
    for (const x of [xMin, xMax]) {
      const y = m * x + c;
      if (y >= yMin - 1e-9 && y <= yMax + 1e-9) cand.push({ x, y });
    }
    if (Math.abs(m) > 1e-12) {
      for (const y of [yMin, yMax]) {
        const x = (y - c) / m;
        if (x >= xMin - 1e-9 && x <= xMax + 1e-9) cand.push({ x, y });
      }
    } else {
      // Horizontal line y = c.
      if (c >= yMin && c <= yMax) return [{ x: xMin, y: c }, { x: xMax, y: c }];
    }
    const uniq = [];
    for (const p of cand) {
      if (!uniq.some((u) => Math.abs(u.x - p.x) < 1e-8 && Math.abs(u.y - p.y) < 1e-8)) uniq.push(p);
    }
    return uniq.length >= 2 ? [uniq[0], uniq[1]] : null;
  }

  // A small arrowhead at `tip`, pointing away from `from`.
  function arrow(tip, from, cls) {
    const dx = tip.x - from.x, dy = tip.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const px = -uy, py = ux;
    const L = 9, Wd = 5.5;
    return (
      <polygon className={cls}
        points={`${tip.x},${tip.y} ${tip.x - ux * L + px * Wd},${tip.y - uy * L + py * Wd} ${tip.x - ux * L - px * Wd},${tip.y - uy * L - py * Wd}`} />
    );
  }

  const fmt = (v) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100));

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label="Cartesian plane">
      {/* Half-unit sub-grid (only when non-integer coordinates are in play). */}
      {halfGrid && gridX.slice(0, -1).map((x) => (
        <line key={`hx${x}`} className="cp-halfgrid" x1={sx(x + 0.5)} y1={plot.top} x2={sx(x + 0.5)} y2={plot.bottom} />
      ))}
      {halfGrid && gridY.slice(0, -1).map((y) => (
        <line key={`hy${y}`} className="cp-halfgrid" x1={plot.left} y1={sy(y + 0.5)} x2={plot.right} y2={sy(y + 0.5)} />
      ))}
      {/* Unit grid */}
      {gridX.map((x) => (
        <line key={`gx${x}`} className="cp-grid" x1={sx(x)} y1={plot.top} x2={sx(x)} y2={plot.bottom} />
      ))}
      {gridY.map((y) => (
        <line key={`gy${y}`} className="cp-grid" x1={plot.left} y1={sy(y)} x2={plot.right} y2={sy(y)} />
      ))}
      {/* Axes (drawn only if 0 is inside the range) */}
      {yMin <= 0 && yMax >= 0 && (
        <g>
          <line className="cp-axis" x1={plot.left} y1={sy(0)} x2={plot.right} y2={sy(0)} />
          {arrow({ x: plot.right + 6, y: sy(0) }, { x: plot.left, y: sy(0) }, "cp-axis-head")}
          <text className="fd-axis" x={plot.right + 2} y={sy(0) - 8}>x</text>
        </g>
      )}
      {xMin <= 0 && xMax >= 0 && (
        <g>
          <line className="cp-axis" x1={sx(0)} y1={plot.bottom} x2={sx(0)} y2={plot.top} />
          {arrow({ x: sx(0), y: plot.top - 6 }, { x: sx(0), y: plot.bottom }, "cp-axis-head")}
          <text className="fd-axis" x={sx(0) + 8} y={plot.top + 4}>y</text>
        </g>
      )}
      {/* Tick labels along the axes */}
      {gridX.filter((x) => x !== 0 && x % xSkip === 0).map((x) => (
        <text key={`tx${x}`} className="cp-tick" x={sx(x)} y={(yMin <= 0 && yMax >= 0 ? sy(0) : plot.bottom) + 14} textAnchor="middle">{x}</text>
      ))}
      {gridY.filter((y) => y !== 0 && y % ySkip === 0).map((y) => (
        <text key={`ty${y}`} className="cp-tick" x={(xMin <= 0 && xMax >= 0 ? sx(0) : plot.left) - 6} y={sy(y) + 4} textAnchor="end">{y}</text>
      ))}
      {yMin <= 0 && yMax >= 0 && xMin <= 0 && xMax >= 0 && (
        <text className="cp-tick" x={sx(0) - 6} y={sy(0) + 14} textAnchor="end">0</text>
      )}

      {/* Lines with double arrowheads (they extend forever). */}
      {lines.map((ln, i) => {
        const seg = clip(Number(ln.m), Number(ln.c));
        if (!seg) return null;
        const cls = LINE_CLASSES[i % LINE_CLASSES.length];
        const a = { x: sx(seg[0].x), y: sy(seg[0].y) };
        const b = { x: sx(seg[1].x), y: sy(seg[1].y) };
        // Label placement (teacher fix): sit the label ALONG the line (rotated
        // to its on-screen gradient) and offset PERPENDICULAR so it floats just
        // ABOVE the line and never overlaps it. Coloured to match the line.
        let label = null;
        if (ln.label) {
          const dxu = b.x - a.x, dyu = b.y - a.y;
          const plen = Math.hypot(dxu, dyu) || 1;
          // Keep text upright/left-to-right.
          let angle = (Math.atan2(dyu, dxu) * 180) / Math.PI;
          if (angle > 90) angle -= 180;
          else if (angle < -90) angle += 180;
          // Perpendicular unit vector pointing UP the screen (negative y).
          let nx = -dyu / plen, ny = dxu / plen;
          if (ny > 0) { nx = -nx; ny = -ny; }
          // Anchor a little before the top end so a longer label still fits,
          // then clamp inside the plot so it can't spill off the canvas.
          const t = a.y < b.y ? 0.34 : 0.66; // 34%/66% → nearer the upper end
          const ax = a.x + dxu * t, ay = a.y + dyu * t;
          const off = 13;
          const lx = Math.max(plot.left + 14, Math.min(plot.right - 14, ax + nx * off));
          const ly = Math.max(plot.top + 12, Math.min(plot.bottom - 6, ay + ny * off));
          label = (
            <text className={`cp-line-label ${cls}-label`} x={lx} y={ly}
              textAnchor="middle" transform={`rotate(${angle} ${lx} ${ly})`}>{ln.label}</text>
          );
        }
        return (
          <g key={`ln${i}`}>
            <line className={cls} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            {arrow(a, b, `${cls}-head`)}
            {arrow(b, a, `${cls}-head`)}
            {label}
          </g>
        );
      })}

      {/* Intersection marker (when exactly two non-parallel lines are shown). */}
      {data?.showIntersection && lines.length >= 2 && (() => {
        const [A, B] = lines;
        if (Math.abs(A.m - B.m) < 1e-12) return null;
        const ix = (B.c - A.c) / (A.m - B.m);
        const iy = A.m * ix + A.c;
        if (ix < xMin || ix > xMax || iy < yMin || iy > yMax) return null;
        return <circle className="cp-intersection" cx={sx(ix)} cy={sy(iy)} r={5.5} />;
      })()}

      {/* Points, labelled away from the axes (quadrant-aware). */}
      {points.map((p, i) => {
        const cx = sx(p.x), cy = sy(p.y);
        const dx = p.x >= (xMin + xMax) / 2 ? -12 : 12;
        const dy = p.y >= (yMin + yMax) / 2 ? 16 : -10;
        const text = p.showCoords ? `${p.label ? `${p.label} ` : ""}(${fmt(p.x)}, ${fmt(p.y)})` : p.label;
        return (
          <g key={`pt${i}`}>
            <circle className={p.accent ? "cp-point-accent" : "cp-point"} cx={cx} cy={cy} r={4.5} />
            {text && (
              <text className="cp-point-label" x={cx + dx} y={cy + dy}
                textAnchor={dx < 0 ? "end" : "start"}>{text}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

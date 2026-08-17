import React from "react";

/**
 * AlgebraTilesDiagram — `x` long "x-tiles" and `ones` small unit tiles modelling
 * an expression like 4x + 2. Reads diagramData: { variable, x, ones }.
 * From the legacy algebra-tiles design (reference only).
 */
export default function AlgebraTilesDiagram({ data }) {
  const variable = String(data?.variable ?? "x");
  const xCount = Math.max(0, Math.round(data?.x ?? 0));
  const ones = Math.max(0, Math.round(data?.ones ?? 0));

  const xW = 26, xH = 56, oneS = 22, gap = 8, pad = 10;
  const xBlock = xCount * (xW + gap);
  const oneBlock = ones * (oneS + gap);
  const width = pad * 2 + xBlock + (xCount && ones ? 16 : 0) + oneBlock;
  const height = pad * 2 + xH;

  const tiles = [];
  let cx = pad;
  for (let i = 0; i < xCount; i++) {
    tiles.push(
      <g key={`x${i}`}>
        <rect className="alg-tile-x" x={cx} y={pad} width={xW} height={xH} rx="3" />
        <text className="alg-tile-label" x={cx + xW / 2} y={pad + xH / 2 + 5} textAnchor="middle">{variable}</text>
      </g>
    );
    cx += xW + gap;
  }
  if (xCount && ones) cx += 16;
  for (let i = 0; i < ones; i++) {
    const y = pad + (xH - oneS) / 2;
    tiles.push(
      <g key={`o${i}`}>
        <rect className="alg-tile-one" x={cx} y={y} width={oneS} height={oneS} rx="3" />
        <text className="alg-tile-label" x={cx + oneS / 2} y={y + oneS / 2 + 5} textAnchor="middle">1</text>
      </g>
    );
    cx += oneS + gap;
  }

  return (
    <svg className="diagram-svg diagram-svg-wide" viewBox={`0 0 ${Math.max(width, 80)} ${height}`} role="img"
      aria-label={`${xCount} ${variable}-tiles and ${ones} unit tiles`}>
      {tiles}
    </svg>
  );
}

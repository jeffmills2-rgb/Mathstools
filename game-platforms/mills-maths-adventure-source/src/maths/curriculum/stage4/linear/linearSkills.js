import { randInt, pick, makeQuestion } from "../../../helpers.js";

/**
 * STAGE 4 · Linear Relationships — NATIVE skills (Phase 3F), covering EVERY
 * NESA content statement. Rebuilt WELL beyond the CHHS linear engine (see the
 * CartesianPlaneDiagram / TilePatternDiagram headers for the rendering
 * upgrades; the generator upgrades are documented per skill below).
 *
 *   Cartesian plane ............ readCoordinates, identifyPoint (incl. halves)
 *   Patterns & tables .......... tilePattern, patternToRule, applyRule,
 *                                tableFromRule (incl. DECREASING patterns)
 *   Five representations ....... representations (the flagship: every
 *                                direction between pattern/equation/table/
 *                                coordinates/graph), pointOnLine (incl. the
 *                                infinitely-many-pairs idea)
 *   Graphical techniques ....... solveFromGraph, intersection (graph AND
 *                                table-of-values methods + verification),
 *                                compareLines, realLifeLinear
 *
 * DESIGN PRINCIPLES:
 *   - Rules are graded STRUCTURALLY: "y = 3x + 1", "3x+1" and "1+3x" all
 *     parse to {m:3, c:1}; the wrong gradient or intercept fails even when
 *     some points coincide.
 *   - Distractors are PEDAGOGICAL: swapped (y, x) coordinates, sign-flipped
 *     gradients, gradient/intercept exchanges — the actual mistakes kids make.
 *   - Every generated line/point is constructed to sit INSIDE the plotted
 *     range (checked by the system checks), so graphs are always readable.
 */
const SYL = "MA4-LIN";

// ---- helpers -----------------------------------------------------------------

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build EXACTLY `n` distinct options that always include `correct`, drawing
// distractors from `pool` (in order) and skipping any that duplicate one
// already chosen. Guarantees a full set of 4 real choices — multiple-choice
// questions must never render fewer than 4 (teacher fix). Callers supply a
// pool with more than enough candidates so back-filling never runs dry.
function optionsOf(correct, pool, n = 4) {
  const out = [correct];
  for (const cand of pool) {
    if (out.length >= n) break;
    if (cand != null && !out.includes(cand)) out.push(cand);
  }
  return shuffle(out);
}

// Non-zero gradient in [-max, max].
function grad(max, allowNeg) {
  let m;
  do { m = randInt(allowNeg ? -max : 1, max); } while (m === 0);
  return m;
}

// "y = 2x + 3" / "y = -x" / "y = 4 - x" style display (canonical mx + c form).
export function ruleStr(m, c) {
  const mPart = m === 1 ? "x" : m === -1 ? "-x" : `${m}x`;
  if (c === 0) return `y = ${mPart}`;
  return c > 0 ? `y = ${mPart} + ${c}` : `y = ${mPart} - ${-c}`;
}

/**
 * Parse a typed rule into { m, c }. Accepts "y=3x+1", "3x+1", "1+3x", "y=x",
 * "-x+4", "y=5-2x" (unicode minus tolerated). Returns null if unparseable.
 */
export function parseRule(input) {
  let s = String(input ?? "").toLowerCase().replace(/−/g, "-").replace(/\s+/g, "");
  s = s.replace(/^y=/, "");
  if (s === "") return null;
  // mx + c
  let m = s.match(/^(-?\d*)x([+-]\d+(?:\.\d+)?)?$/);
  if (m) {
    const g = m[1] === "" ? 1 : m[1] === "-" ? -1 : Number(m[1]);
    return { m: g, c: m[2] ? Number(m[2]) : 0 };
  }
  // c + mx
  m = s.match(/^(-?\d+(?:\.\d+)?)([+-]\d*)x$/);
  if (m) {
    const g = m[2] === "+" ? 1 : m[2] === "-" ? -1 : Number(m[2]);
    return { m: g, c: Number(m[1]) };
  }
  return null;
}

function ruleCheck(m, c) {
  return (input) => {
    const r = parseRule(input);
    return Boolean(r && r.m === m && r.c === c);
  };
}

// A rule-question via the MathLive editor with structural grading.
function ruleQ(config, m, c) {
  const q = makeQuestion({ ...config, inputMode: "math" });
  q.check = ruleCheck(m, c);
  return q;
}

const fmtN = (v) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100));
// Coordinates use a NON-BREAKING space after the comma so a pair like (2, 3)
// can never split across lines (teacher fix, 3G).
const coordStr = (x, y) => `(${fmtN(x)},\u00A0${fmtN(y)})`;

// A DISPLAY table of values (proper cells — see ValuesTableDiagram).
const valuesTable = (xs, m, c, xLabel = "x", yLabel = "y") => ({
  diagramType: "valuesTable",
  diagramData: { tables: [{ rows: [
    { label: xLabel, values: xs.map(String) },
    { label: yLabel, values: xs.map((x) => String(m * x + c)) },
  ] }] },
});

/**
 * Single-box coordinate entry (teacher fix, 3G): the student types "(a, b)".
 * Brackets are REQUIRED; all spacing is ignored; "a, b" without brackets is
 * wrong. Works with the touch keypad's ( ) , keys.
 */
function coordCheck(x, y) {
  return (input) => {
    const s = String(input ?? "").replace(/\s+/g, "").replace(/−/g, "-");
    const m = s.match(/^\((-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\)$/);
    return Boolean(m && Number(m[1]) === x && Number(m[2]) === y);
  };
}

function coordQ(config, x, y) {
  const q = makeQuestion({ ...config, inputMode: "simple" });
  q.check = coordCheck(x, y);
  return q;
}

// A plane just big enough to show the given points/lines comfortably.
function planeFor(points, lines, pad = 2) {
  let xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  for (const ln of lines) { ys.push(ln.c); xs.push(0); }
  const xMin = Math.min(-2, Math.floor(Math.min(...xs, 0)) - pad);
  const xMax = Math.max(2, Math.ceil(Math.max(...xs, 0)) + pad);
  const yMin = Math.min(-2, Math.floor(Math.min(...ys, 0)) - pad);
  const yMax = Math.max(2, Math.ceil(Math.max(...ys, 0)) + pad);
  return { xMin, xMax, yMin, yMax };
}

// ---- 1. Read coordinates -------------------------------------------------------

export const readCoordinates = {
  id: "readCoordinates",
  name: "Reading Coordinates",
  syllabusArea: SYL,
  prerequisiteSkillIds: [],
  nextSkillIds: ["identifyPoint"],

  generate(level) {
    let x, y;
    if (level <= 1) { x = randInt(0, 6); y = randInt(0, 6); }
    else if (level === 2) { x = randInt(-5, 5); y = randInt(-5, 5); }
    else if (level === 3) { const onX = pick([true, false]); x = onX ? randInt(-5, 5) : 0; y = onX ? 0 : randInt(-5, 5); }
    else { x = randInt(-4, 4) + pick([0, 0.5]); y = randInt(-4, 4) + pick([0, 0.5, 0.5]); }

    const range = level <= 1 ? { xMin: 0, xMax: 7, yMin: 0, yMax: 7 } : { xMin: -6, xMax: 6, yMin: -6, yMax: 6 };
    const q = coordQ({
      topic: "readCoordinates",
      text: `Write down the coordinates of point P.\nGive your answer in the form (a, b) — brackets included.`,
      answer: coordStr(x, y),
      feedback: `Across first, then up/down: P is at ${coordStr(x, y)}.${x === 0 || y === 0 ? " Points on an axis have a 0 coordinate." : ""}`,
    }, x, y);
    q.diagramType = "cartesianPlane";
    q.diagramData = { ...range, points: [{ x, y, label: "P", accent: true }] };
    return q;
  },
};

// ---- 2. Identify the point -------------------------------------------------------

export const identifyPoint = {
  id: "identifyPoint",
  name: "Locating Points",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["readCoordinates"],
  nextSkillIds: ["pointOnLine"],

  generate(level) {
    const half = level >= 4;
    const rand = () => randInt(level <= 1 ? 1 : -4, level <= 1 ? 5 : 4) + (half && pick([true, false]) ? 0.5 : 0);
    const tx = rand(), ty = rand();

    // Pedagogical distractors: the swap (y, x), a reflection, and a near miss.
    const spots = [{ x: tx, y: ty }];
    const cands = [
      { x: ty, y: tx }, { x: -tx, y: ty }, { x: tx, y: -ty },
      { x: tx + 1, y: ty }, { x: tx, y: ty + 1 }, { x: -tx, y: -ty },
    ];
    for (const c of cands) {
      if (spots.length >= 4) break;
      if (!spots.some((s) => Math.abs(s.x - c.x) < 0.25 && Math.abs(s.y - c.y) < 0.25)) spots.push(c);
    }
    while (spots.length < 4) {
      const c = { x: rand(), y: rand() };
      if (!spots.some((s) => Math.abs(s.x - c.x) < 0.25 && Math.abs(s.y - c.y) < 0.25)) spots.push(c);
    }
    const labels = ["A", "B", "C", "D"];
    const order = shuffle([0, 1, 2, 3]);
    const points = order.map((si, i) => ({ ...spots[si], label: labels[i] }));
    const answer = labels[order.indexOf(0)];

    return makeQuestion({
      topic: "identifyPoint",
      text: `Which labelled point has coordinates ${coordStr(tx, ty)}?`,
      answer,
      feedback: `${coordStr(tx, ty)} means x = ${fmtN(tx)} across and y = ${fmtN(ty)} up/down — that's point ${answer}. (Watch out for the swapped point at ${coordStr(ty, tx)}!)`,
      answerMode: "multipleChoice",
      options: labels,
      diagramType: "cartesianPlane",
      diagramData: { ...planeFor(points, []), points },
    });
  },
};

// ---- 3. Geometric tile patterns ----------------------------------------------------

export const tilePattern = {
  id: "tilePattern",
  name: "Geometric Patterns",
  syllabusArea: SYL,
  prerequisiteSkillIds: [],
  nextSkillIds: ["patternToRule"],

  generate(level) {
    // Growth is USUALLY more than 1 per figure (teacher fix): +1 patterns
    // still appear occasionally, but +2..+5 dominate. Always linear.
    const a = level <= 1 ? pick([2, 2, 3, 1]) : pick([2, 2, 3, 3, 4, 1, level >= 4 ? 5 : 4]);
    const b = level <= 1 ? pick([0, 1, 2]) : randInt(1, 5);
    const count = (n) => a * n + b;
    // Visual variety (visualpatterns.org-style): towers always work; rows for
    // small growth; L-shapes when the growth is exactly 2 (two arms of n).
    const styles = ["towers"];
    if (a <= 3) styles.push("row");
    if (a === 2) styles.push("L");
    const style = pick(styles);

    if (level <= 3) {
      // Complete the table of values from the pattern.
      const upTo = level <= 1 ? 4 : 5;
      const blanks = level <= 1 ? [4] : level === 2 ? [4, 5] : [3, 4, 5];
      const rows = [
        Array.from({ length: upTo }, (_, i) => String(i + 1)),
        Array.from({ length: upTo }, (_, i) =>
          blanks.includes(i + 1) ? { input: true, answer: String(count(i + 1)) } : String(count(i + 1))),
      ];
      return makeQuestion({
        topic: "tilePattern",
        text: `The pattern grows by the same number of tiles each time.\nComplete the table of values.`,
        answer: blanks.map((n) => String(count(n))).join(", "),
        feedback: `Each new figure adds ${a} tile${a > 1 ? "s" : ""}${b ? ` to the ${b} fixed starting tile${b > 1 ? "s" : ""}` : ""}: tiles = ${a} × figure${b ? ` + ${b}` : ""}.`,
        answerMode: "tableInput",
        tableConfig: {
          caption: "Tiles in each figure",
          headerRow: ["Figure", ...rows[0]],
          rows: [["Tiles", ...rows[1]]],
        },
        diagramType: "tilePattern",
        diagramData: { a, b, figures: 3, showCounts: level <= 2, style },
      });
    }

    // Levels 4–5: apply the pattern to a LARGER figure (no table to lean on).
    const n = level === 4 ? pick([10, 12, 15]) : pick([20, 50, 100]);
    return makeQuestion({
      topic: "tilePattern",
      text: `The pattern continues in the same way.\nHow many tiles are in Figure ${n}?`,
      answer: count(n),
      feedback: `tiles = ${a} × figure${b ? ` + ${b}` : ""}: ${a} × ${n}${b ? ` + ${b}` : ""} = ${count(n)}.`,
      inputMode: "simple",
      diagramType: "tilePattern",
      diagramData: { a, b, figures: 3, showCounts: true, style },
    });
  },
};

// ---- 4. Pattern → rule (incl. decreasing) -----------------------------------------

export const patternToRule = {
  id: "patternToRule",
  name: "Finding the Rule",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["tilePattern"],
  nextSkillIds: ["applyRule", "representations"],

  generate(level) {
    const decreasing = level >= 3 && pick([true, false]);
    const m = decreasing ? -randInt(1, 3) : randInt(1, level <= 2 ? 4 : 5);
    const c = decreasing ? randInt(8, 15) : randInt(0, 8);
    const xs = [1, 2, 3, 4];

    if (level <= 2) {
      const correct = ruleStr(m, c);
      // A deep pool of PEDAGOGICAL distractors (wrong intercept, wrong
      // gradient, gradient/intercept swap, sign flip) so optionsOf always
      // back-fills to a full set of 4 (teacher fix — never fewer than 4).
      const pool = [
        ruleStr(m, c + 1), ruleStr(m, c - 1),
        ruleStr(m + 1, c), ruleStr(m - 1 === 0 ? m + 2 : m - 1, c),
        ruleStr(c === 0 ? m + 2 : c, c === 0 ? c : m),
        ruleStr(-m, c),
      ];
      return makeQuestion({
        topic: "patternToRule",
        text: `The table shows a number pattern.\nWhich rule matches the table?`,
        answer: correct,
        feedback: `y goes up by ${m} each time x goes up by 1 (so the rule has ${m}x), and at x = 1, y = ${m + c} — that's ${correct}.`,
        answerMode: "multipleChoice",
        options: optionsOf(correct, pool),
        ...valuesTable(xs, m, c),
      });
    }

    if (level === 5 && pick([true, false])) {
      // Words → symbols (describe a pattern in words, generate the equation).
      const story = m > 0
        ? `To get y, multiply x by ${m}${c ? ` and then add ${c}` : ""}`
        : `To get y, start at ${c} and subtract ${-m} for each x`;
      return ruleQ({
        topic: "patternToRule",
        text: `A pattern is described in words:\n"${story}."\nWrite the rule using algebraic symbols (y = …).`,
        answer: ruleStr(m, c),
        feedback: `In symbols: ${ruleStr(m, c)}.`,
      }, m, c);
    }

    const q = ruleQ({
      topic: "patternToRule",
      text: `The table shows a number pattern${decreasing ? " (a DECREASING pattern)" : ""}.\nWrite the rule (y = …).`,
      answer: ruleStr(m, c),
      feedback: `Each step changes y by ${m > 0 ? `+${m}` : m} → the rule has ${m === 1 ? "" : m === -1 ? "-" : m}x. At x = 0 the value would be ${c}: ${ruleStr(m, c)}.`,
    }, m, c);
    Object.assign(q, valuesTable(xs, m, c));
    return q;
  },
};

// ---- 5. Apply the rule ----------------------------------------------------------------

export const applyRule = {
  id: "applyRule",
  name: "Using a Rule",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["patternToRule"],
  nextSkillIds: [],

  generate(level) {
    const m = grad(level <= 2 ? 4 : 6, level >= 3);
    const c = randInt(level >= 3 ? -8 : 0, 10);
    const rule = ruleStr(m, c);

    if (level >= 4 && pick([true, false])) {
      // Inverse: given y, find x.
      const x = randInt(2, 12);
      const y = m * x + c;
      return makeQuestion({
        topic: "applyRule",
        text: `A pattern has the rule ${rule}.\nFind x when y = ${y}.`,
        answer: x,
        feedback: `${y} = ${m === 1 ? "" : m === -1 ? "-" : m}x ${c >= 0 ? `+ ${c}` : `- ${-c}`} → x = (${y} − ${c}) ÷ ${m} = ${x}.`,
        inputMode: "simple",
      });
    }

    // The syllabus asks for BOTH smaller and larger inputs.
    const x = level <= 1 ? randInt(2, 8) : level <= 3 ? pick([randInt(2, 9), randInt(15, 40)]) : pick([randInt(20, 60), 100]);
    return makeQuestion({
      topic: "applyRule",
      text: `A pattern has the rule ${rule}.\nFind y when x = ${x}.`,
      answer: m * x + c,
      feedback: `y = ${m} × ${x}${c ? (c > 0 ? ` + ${c}` : ` − ${-c}`) : ""} = ${m * x + c}.`,
      inputMode: "simple",
    });
  },
};

// ---- 6. Table of values from a rule -----------------------------------------------------

export const tableFromRule = {
  id: "tableFromRule",
  name: "Completing Tables of Values",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["applyRule"],
  nextSkillIds: ["representations"],

  generate(level) {
    const decreasing = level >= 3 && pick([true, false]);
    const m = decreasing ? -randInt(1, 3) : randInt(1, 4);
    const c = randInt(decreasing ? 5 : 0, 10);
    const xs = level >= 4 ? [-2, -1, 0, 1, 2] : [0, 1, 2, 3, 4];
    const blanks = level <= 1 ? [xs[3]] : level <= 3 ? [xs[2], xs[4]] : [xs[0], xs[2], xs[4]];

    const rows = [[
      "y",
      ...xs.map((x) => (blanks.includes(x) ? { input: true, answer: String(m * x + c) } : String(m * x + c))),
    ]];
    return makeQuestion({
      topic: "tableFromRule",
      text: `Complete the table of values for ${ruleStr(m, c)}.`,
      answer: blanks.map((x) => String(m * x + c)).join(", "),
      feedback: `Substitute each x into ${ruleStr(m, c)} — e.g. x = ${blanks[0]}: y = ${m} × ${blanks[0]} ${c >= 0 ? `+ ${c}` : `- ${-c}`} = ${m * blanks[0] + c}.`,
      answerMode: "tableInput",
      tableConfig: {
        caption: ruleStr(m, c),
        headerRow: ["x", ...xs.map(String)],
        rows,
      },
    });
  },
};

// ---- 7. The five representations (flagship) ------------------------------------------------

export const representations = {
  id: "representations",
  name: "Linking the Representations",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["patternToRule", "tableFromRule"],
  nextSkillIds: ["pointOnLine", "solveFromGraph"],

  generate(level) {
    let m, c;
    do {
      m = grad(3, level >= 3);
      c = randInt(level >= 3 ? -4 : 0, 5);
    } while (Math.abs(2 * m + c) > 5); // both marked points must fit the grid
    const rule = ruleStr(m, c);
    const xs = [0, 1, 2, 3];

    if (level <= 1) {
      // Table → equation (the table is a REAL table of values).
      const correct = rule;
      const pool = [
        ruleStr(m, c + 1), ruleStr(m, c - 1),
        ruleStr(m + 1, c), ruleStr(m - 1 === 0 ? m + 2 : m - 1, c),
        ruleStr(c === 0 ? m + 1 : c, c === 0 ? 1 : m),
        ruleStr(-m, c),
      ];
      return makeQuestion({
        topic: "representations",
        text: `The table of values shows a linear relationship.\nWhich equation matches the table?`,
        answer: correct,
        feedback: `y changes by ${m} per step and starts at ${c} when x = 0: ${correct}. The same relationship can appear as a pattern, a rule, a table, coordinates or a line.`,
        answerMode: "multipleChoice",
        options: optionsOf(correct, pool),
        ...valuesTable(xs, m, c),
      });
    }

    if (level === 2) {
      // Table → coordinate pairs (options STACK one pair per line, and each
      // pair is non-breaking — teacher fix).
      const correct = xs.map((x) => coordStr(x, m * x + c)).join("\n");
      const swapped = xs.map((x) => coordStr(m * x + c, x)).join("\n");
      const off = xs.map((x) => coordStr(x, m * x + c + 1)).join("\n");
      const wrongRule = xs.map((x) => coordStr(x, (m + 1) * x + c)).join("\n");
      const offDown = xs.map((x) => coordStr(x, m * x + c - 1)).join("\n");
      const q = makeQuestion({
        topic: "representations",
        text: `A pattern has this table of values.\nWhich set of coordinates shows the SAME relationship?`,
        answer: correct,
        feedback: `Each column becomes a pair (x, y). (The swapped set (y, x) is a different relationship!)`,
        answerMode: "multipleChoice",
        options: optionsOf(correct, [swapped, off, wrongRule, offDown]),
        ...valuesTable(xs, m, c),
      });
      // Centre each stacked coordinate set inside its option card (teacher fix).
      q.centerOptions = true;
      return q;
    }

    if (level === 3) {
      // Graph → equation (multiple choice with sign/intercept distractors).
      const correct = rule;
      const pool = [
        ruleStr(-m, c), ruleStr(m, -c === 0 ? 3 : -c), ruleStr(m === 1 ? 2 : 1, c),
        ruleStr(m, c + 1), ruleStr(m + 1, c),
      ];
      return makeQuestion({
        topic: "representations",
        text: `Which equation matches the graphed line?`,
        answer: correct,
        feedback: `The line crosses the y-axis at ${c} (the intercept) and rises ${m} for each step right (the gradient): ${correct}.`,
        answerMode: "multipleChoice",
        options: optionsOf(correct, pool),
        diagramType: "cartesianPlane",
        diagramData: { xMin: -6, xMax: 6, yMin: -6, yMax: 6, lines: [{ m, c }] },
      });
    }

    if (level === 4) {
      // Graph → equation, TYPED (two marked points make the gradient readable).
      const q = ruleQ({
        topic: "representations",
        text: `The line passes through the two marked points.\nWrite its equation (y = …).`,
        answer: rule,
        feedback: `From ${coordStr(0, c)} to ${coordStr(2, 2 * m + c)}, y changes by ${2 * m} over 2 steps → gradient ${m}. The y-intercept is ${c}: ${rule}.`,
      }, m, c);
      q.diagramType = "cartesianPlane";
      q.diagramData = {
        xMin: -6, xMax: 6, yMin: -6, yMax: 6,
        lines: [{ m, c }],
        points: [
          { x: 0, y: c, accent: true, showCoords: true },
          { x: 2, y: 2 * m + c, accent: true, showCoords: true },
        ],
      };
      return q;
    }

    // Level 5: coordinates → rule, typed (one pair per line — teacher fix).
    const pts = [1, 2, 3].map((x) => coordStr(x, m * x + c)).join("\n");
    return ruleQ({
      topic: "representations",
      text: `A line passes through the points\n${pts}\nWrite its rule (y = …).`,
      answer: rule,
      feedback: `y changes by ${m} for each step in x, and extending back to x = 0 gives y = ${c}: ${rule}.`,
    }, m, c);
  },
};

// ---- 8. Points on a line (incl. infinitely many) ----------------------------------------------

export const pointOnLine = {
  id: "pointOnLine",
  name: "Points on a Line",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["representations"],
  nextSkillIds: ["solveFromGraph"],

  generate(level) {
    const m = grad(3, level >= 3);
    const c = randInt(level >= 3 ? -4 : 0, 5);
    const rule = ruleStr(m, c);

    if (level <= 2) {
      const x = randInt(-3, 3);
      const onLine = pick([true, false]);
      const y = m * x + c + (onLine ? 0 : pick([-2, -1, 1, 2]));
      return makeQuestion({
        topic: "pointOnLine",
        text: `Does the point ${coordStr(x, y)} lie on the line ${rule}?`,
        answer: onLine ? "Yes" : "No",
        feedback: `Substitute x = ${x}: y = ${m} × ${x} ${c >= 0 ? `+ ${c}` : `- ${-c}`} = ${m * x + c}${onLine ? ` ✓ — the point satisfies the equation.` : `, not ${y} — so the point is NOT on the line.`} Every point ON a line satisfies its equation.`,
        answerMode: "trueFalse",
        options: ["Yes", "No"],
        diagramType: "cartesianPlane",
        // No plotted point — showing (x, y) on the grid would give the answer
        // away (teacher fix). Just graph the line; the student substitutes.
        diagramData: { ...planeFor([{ x, y }], [{ m, c }]), lines: [{ m, c, label: rule }] },
      });
    }

    if (level === 3) {
      const xs = shuffle([-2, -1, 1, 2, 3]).slice(0, 4);
      const goodIdx = randInt(0, 3);
      const opts = xs.map((x, i) => coordStr(x, m * x + c + (i === goodIdx ? 0 : pick([-2, -1, 1, 2]))));
      return makeQuestion({
        topic: "pointOnLine",
        text: `Which point lies on the line ${rule}?`,
        answer: opts[goodIdx],
        feedback: `Only ${opts[goodIdx]} satisfies the equation — substitute its x and the rule gives exactly its y.`,
        answerMode: "multipleChoice",
        options: opts,
      });
    }

    if (level === 4) {
      const x = randInt(-3, 4);
      return makeQuestion({
        topic: "pointOnLine",
        text: `The line ${rule} passes through the point (${x}, ?).\nFind the missing y-coordinate.`,
        answer: m * x + c,
        feedback: `Substitute x = ${x} into ${rule}: y = ${m * x + c}.`,
        inputMode: "simple",
        diagramType: "cartesianPlane",
        diagramData: { xMin: -6, xMax: 6, yMin: -6, yMax: 6, lines: [{ m, c, label: rule }] },
      });
    }

    // Level 5: the infinitely-many-ordered-pairs idea.
    return makeQuestion({
      topic: "pointOnLine",
      text: `How many points (ordered pairs) satisfy the equation ${rule}?`,
      answer: "Infinitely many",
      feedback: `The line extends forever in both directions (see the arrows) — every point on it, including fraction and decimal coordinates, satisfies ${rule}. So there are infinitely many.`,
      answerMode: "multipleChoice",
      options: shuffle(["Infinitely many", "Exactly 5", "One for each whole number", "None"]),
      diagramType: "cartesianPlane",
      diagramData: { xMin: -6, xMax: 6, yMin: -6, yMax: 6, lines: [{ m, c, label: rule }] },
    });
  },
};

// ---- 9. Solve equations from the graph ------------------------------------------------------------

export const solveFromGraph = {
  id: "solveFromGraph",
  name: "Solving from a Graph",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["pointOnLine"],
  nextSkillIds: ["intersection"],

  generate(level) {
    const m = grad(level <= 2 ? 2 : 3, level >= 3);
    const c = randInt(-4, 4);
    const x = level <= 2 ? randInt(0, 3) : randInt(-3, 4);
    const k = m * x + c;
    if (Math.abs(k) > 6) return this.generate(level); // keep the read on the grid
    const rule = ruleStr(m, c);

    // No marked point — that would give the answer away (teacher fix).
    return makeQuestion({
      topic: "solveFromGraph",
      text: `The graph shows ${rule}.\nUse the graph to work out the value of x when y equals ${k}.`,
      answer: x,
      feedback: `Find y = ${k} on the y-axis, move across to the line, then read down: x = ${x}. Check by substituting: ${m} × ${x} ${c >= 0 ? `+ ${c}` : `- ${-c}`} = ${k} ✓.`,
      inputMode: "simple",
      diagramType: "cartesianPlane",
      diagramData: {
        xMin: -6, xMax: 6, yMin: -6, yMax: 6,
        lines: [{ m, c, label: rule }],
      },
    });
  },
};

// ---- 10. Intersecting lines --------------------------------------------------------------------------

export const intersection = {
  id: "intersection",
  name: "Intersecting Lines",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["solveFromGraph"],
  nextSkillIds: ["compareLines"],

  generate(level) {
    // Build two lines through a chosen integer intersection point.
    let x0, y0, m1, m2, c1, c2;
    do {
      x0 = randInt(-3, 3);
      y0 = randInt(-3, 3);
      m1 = grad(2, level >= 2);
      do { m2 = grad(2, true); } while (m2 === m1);
      c1 = y0 - m1 * x0;
      c2 = y0 - m2 * x0;
    } while (Math.abs(c1) > 5 || Math.abs(c2) > 5);
    const rA = ruleStr(m1, c1);
    const rB = ruleStr(m2, c2);

    if (level === 3) {
      // Table-of-values method (the syllabus's second technique) — with REAL
      // tables of values, one per rule.
      const xs = [x0 - 1, x0, x0 + 1];
      return makeQuestion({
        topic: "intersection",
        text: `The tables of values show two rules.\nAt which x do the two rules give the SAME y?`,
        answer: x0,
        feedback: `At x = ${x0} both tables show y = ${y0} — the lines intersect at ${coordStr(x0, y0)}.`,
        inputMode: "simple",
        diagramType: "valuesTable",
        diagramData: {
          tables: [
            { label: rA, rows: [
              { label: "x", values: xs.map(String) },
              { label: "y", values: xs.map((v) => String(m1 * v + c1)) },
            ] },
            { label: rB, rows: [
              { label: "x", values: xs.map(String) },
              { label: "y", values: xs.map((v) => String(m2 * v + c2)) },
            ] },
          ],
        },
      });
    }

    if (level >= 4) {
      // VERIFY the intersection satisfies BOTH equations.
      return makeQuestion({
        topic: "intersection",
        text: `The lines ${rA} and ${rB} intersect at ${coordStr(x0, y0)}.\nVerify this by substituting x = ${x0} into each equation.`,
        answer: `${y0}, ${y0}`,
        feedback: `Line A: ${m1} × ${x0} ${c1 >= 0 ? `+ ${c1}` : `- ${-c1}`} = ${y0} ✓. Line B: ${m2} × ${x0} ${c2 >= 0 ? `+ ${c2}` : `- ${-c2}`} = ${y0} ✓. The point satisfies BOTH equations — that's what intersection means.`,
        answerMode: "multiPart",
        expectedParts: [
          { label: "(a)", prompt: `y from ${rA}`, answer: String(y0) },
          { label: "(b)", prompt: `y from ${rB}`, answer: String(y0) },
        ],
        diagramType: "cartesianPlane",
        diagramData: { xMin: -6, xMax: 6, yMin: -6, yMax: 6, lines: [{ m: m1, c: c1, label: "Line A" }, { m: m2, c: c2, label: "Line B" }], showIntersection: true },
      });
    }

    // Levels 1–2: read the intersection off the graph (single (a, b) box).
    const q = coordQ({
      topic: "intersection",
      text: `The two lines intersect at one point.\nWrite down its coordinates in the form (a, b) — brackets included.`,
      answer: coordStr(x0, y0),
      feedback: `The lines cross at ${coordStr(x0, y0)} — the only point that lies on BOTH lines.`,
    }, x0, y0);
    q.diagramType = "cartesianPlane";
    q.diagramData = { xMin: -6, xMax: 6, yMin: -6, yMax: 6, lines: [{ m: m1, c: c1, label: "Line A" }, { m: m2, c: c2, label: "Line B" }] };
    return q;
  },
};

// ---- 11. Comparing lines --------------------------------------------------------------------------------

export const compareLines = {
  id: "compareLines",
  name: "Comparing Lines",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["representations"],
  nextSkillIds: [],

  generate(level) {
    if (level <= 2) {
      // Which line is steeper?
      const m1 = randInt(1, 2);
      const m2 = m1 + randInt(1, 2);
      const [cA, cB] = [randInt(-2, 2), randInt(-2, 2)];
      const steepFirst = pick([true, false]);
      const lines = steepFirst
        ? [{ m: m2, c: cA, label: "Line A" }, { m: m1, c: cB, label: "Line B" }]
        : [{ m: m1, c: cA, label: "Line A" }, { m: m2, c: cB, label: "Line B" }];
      const answer = steepFirst ? "Line A" : "Line B";
      return makeQuestion({
        topic: "compareLines",
        text: `Two lines are graphed on the same axes.\nWhich line is STEEPER?`,
        answer,
        feedback: `${answer} rises ${m2} for each step right; the other rises only ${m1}. A bigger gradient means a steeper line.`,
        answerMode: "multipleChoice",
        options: ["Line A", "Line B"],
        diagramType: "cartesianPlane",
        diagramData: { xMin: -6, xMax: 6, yMin: -6, yMax: 6, lines },
      });
    }

    if (level <= 4) {
      // What do the lines share? (parallel / same intercept)
      const parallel = pick([true, false]);
      const m = grad(2, true);
      const lines = parallel
        ? [{ m, c: randInt(-3, 1), label: "Line A" }, { m, c: randInt(2, 4), label: "Line B" }]
        : (() => { const c = randInt(-3, 3); let m2; do { m2 = grad(2, true); } while (m2 === m); return [{ m, c, label: "Line A" }, { m: m2, c, label: "Line B" }]; })();
      const answer = parallel ? "They have the same gradient (they are parallel)" : "They cross the y-axis at the same point";
      const wrong = parallel
        ? ["They cross the y-axis at the same point", "They are the same line", "They intersect at (1, 1)"]
        : ["They have the same gradient (they are parallel)", "They are the same line", "They never intersect"];
      return makeQuestion({
        topic: "compareLines",
        text: `Two lines are graphed on the same axes.\nWhat do Line A and Line B have in common?`,
        answer,
        feedback: parallel
          ? `Both lines have gradient ${m} — same steepness, so they are parallel and never meet. Their y-intercepts differ.`
          : `Both lines pass through (0, ${lines[0].c}) — same y-intercept. Their gradients differ, so they are not parallel.`,
        answerMode: "multipleChoice",
        options: shuffle([answer, ...wrong]),
        diagramType: "cartesianPlane",
        diagramData: { xMin: -6, xMax: 6, yMin: -6, yMax: 6, lines },
      });
    }

    // Level 5: reason about parallel lines and intersections.
    const m = grad(2, true);
    const items = [
      ["Lines with the SAME gradient and DIFFERENT y-intercepts never intersect", "True", "equal gradients mean parallel lines — they never meet"],
      ["Lines with different gradients always intersect exactly once", "True", "unequal steepness means they must cross at exactly one point"],
      ["Two different lines can intersect at two points", "False", "two distinct straight lines cross at most once"],
      ["Parallel lines have the same y-intercept", "False", `parallel means same GRADIENT — e.g. ${ruleStr(m, 1)} and ${ruleStr(m, 4)} are parallel with different intercepts`],
    ];
    const [claim, answer, why] = pick(items);
    return makeQuestion({
      topic: "compareLines",
      text: `True or false:\n${claim}.`,
      answer,
      feedback: `${answer} — ${why}.`,
      answerMode: "trueFalse",
      options: ["True", "False"],
    });
  },
};

// ---- 12. Real-life linear relationships -----------------------------------------------------------------

const CONTEXTS = [
  { story: (m, c) => `A plumber charges a $${c} call-out fee plus $${m} per hour`, xName: "hours", yName: "cost ($)" },
  { story: (m, c) => `A plant is ${c} cm tall and grows ${m} cm each week`, xName: "weeks", yName: "height (cm)" },
  { story: (m, c) => `A phone plan costs $${c} plus $${m} per gigabyte`, xName: "gigabytes", yName: "cost ($)" },
];

export const realLifeLinear = {
  id: "realLifeLinear",
  name: "Linear Relationships in Real Life",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["applyRule"],
  nextSkillIds: [],

  generate(level) {
    // Level 4–5 (half the time): a DECREASING context — the draining tank.
    if (level >= 4 && pick([true, false])) {
      const rate = pick([10, 20, 25, 50]);
      const start = rate * pick([8, 10, 12, 20]);
      const t = start / rate;
      const askEmpty = pick([true, false]);
      const tt = randInt(2, t - 2);
      return makeQuestion({
        topic: "realLifeLinear",
        text: `A tank holds ${start} litres and drains at ${rate} litres per minute, so V = ${start} - ${rate}t.\n${askEmpty ? "After how many minutes is the tank EMPTY?" : `How much water is left after ${tt} minutes?`}`,
        answer: askEmpty ? t : start - rate * tt,
        feedback: askEmpty
          ? `Empty means V = 0: 0 = ${start} − ${rate}t → t = ${start} ÷ ${rate} = ${t} minutes. (A decreasing linear relationship!)`
          : `V = ${start} − ${rate} × ${tt} = ${start - rate * tt} litres.`,
        inputMode: "simple",
      });
    }

    const ctx = pick(CONTEXTS);
    const money = ctx.yName.includes("$");
    const m = money ? pick([5, 10, 15, 20, 25]) : randInt(2, 8);
    const c = money ? pick([10, 20, 30, 40, 50]) : randInt(2, 12);

    if (level <= 2) {
      const x = randInt(2, 8);
      return makeQuestion({
        topic: "realLifeLinear",
        text: `${ctx.story(m, c)}.\nWhat is the ${ctx.yName.split(" ")[0]} after ${x} ${ctx.xName}?`,
        answer: c + m * x,
        feedback: `${ctx.yName.split(" ")[0]} = ${c} + ${m} × ${x} = ${c + m * x}.`,
        inputMode: "simple",
      });
    }

    if (level === 3) {
      return ruleQ({
        topic: "realLifeLinear",
        text: `${ctx.story(m, c)}.\nUsing y for the ${ctx.yName} and x for the ${ctx.xName}, write the rule (y = …).`,
        answer: ruleStr(m, c),
        feedback: `Fixed part ${c} + ${m} per ${ctx.xName.replace(/s$/, "")}: ${ruleStr(m, c)}.`,
      }, m, c);
    }

    // Inverse in context.
    const x = randInt(3, 12);
    const y = c + m * x;
    return makeQuestion({
      topic: "realLifeLinear",
      text: `${ctx.story(m, c)}.\nFor a total of ${ctx.yName.includes("$") ? `$${y}` : `${y} ${ctx.yName.replace(/.*\(|\)/g, "")}`}, how many ${ctx.xName} is that?`,
      answer: x,
      feedback: `${y} = ${c} + ${m}x → x = (${y} − ${c}) ÷ ${m} = ${x}.`,
      inputMode: "simple",
    });
  },
};

// The full ordered skill list — the ORDER is the conceptual progression.
export const LINEAR_SKILLS_LIST = [
  readCoordinates,
  identifyPoint,
  tilePattern,
  patternToRule,
  applyRule,
  tableFromRule,
  representations,
  pointOnLine,
  solveFromGraph,
  intersection,
  compareLines,
  realLifeLinear,
];

export default LINEAR_SKILLS_LIST;

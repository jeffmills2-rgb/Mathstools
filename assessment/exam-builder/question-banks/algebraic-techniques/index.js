/*
  CHHS Exam Builder — Algebraic Techniques Question Bank
  ------------------------------------------------------
  Save as:

  question-banks/algebraic-techniques/index.js

  Uses the EXPECTED question types from the existing Algebraic Techniques generator:
  - Translate words to expressions
  - Factorising
  - Substitute and evaluate: two-step
  - Substitute and evaluate: two pronumerals
  - Simplify simple like terms
  - Simplify mixed like terms
  - Multiplying terms
  - Expand and simplify
  - Simplify algebraic fractions
  - Complete a table of values
*/

import {
  createQuestion,
  QUESTION_KINDS,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../utils/translation.js";

const TOPIC = "Algebraic Techniques";

const TYPE_LIST = [
  { id: "translate-rich", label: "Translate words → expression" },
  { id: "factorise", label: "Factorising" },
  { id: "sub-two", label: "Substitute and evaluate: two-step" },
  { id: "sub-two-vars", label: "Substitute and evaluate: two pronumerals" },
  { id: "simplify-simple", label: "Simplify simple like terms" },
  { id: "simplify-mixed", label: "Simplify mixed like terms" },
  { id: "multiply-terms", label: "Multiplying terms" },
  { id: "expand-simplify", label: "Expand and simplify" },
  { id: "algebraic-fractions", label: "Simplify algebraic fractions" },
  { id: "pattern-table", label: "Complete a table of values" },
  { id: "use-expression-solve", label: "Write and use an expression to solve a problem" },
  { id: "expand-negative-bracket", label: "Expand brackets with a negative coefficient" },
  { id: "intro-notation", label: "Algebraic notation and terms" },
  { id: "like-terms-tiles", label: "Like terms with algebra tiles" },
  { id: "expand-area-model", label: "Expand a bracket (area model)" },
  { id: "perimeter-expression", label: "Perimeter expression from a figure" },
  { id: "function-machine", label: "Function machines" },
  { id: "worded-expression", label: "Write an expression for a context" },
  { id: "error-spot-algebra", label: "Spot the error (reasoning)" },
  { id: "true-false-equivalent", label: "Equivalent expressions: true or false" },
  { id: "multi-part-algebra", label: "Multi-part algebra problem" }
];

const VARS = ["x", "a", "b", "m", "n", "p", "y"];
const OTHER_VARS = ["a", "b", "c", "d", "e", "f", "y", "p", "w", "k"];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(items) {
  return items[randInt(0, items.length - 1)];
}

function shuffle(items) {
  const arr = items.slice();

  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function randomId(prefix = "algebra") {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random()}`;
}

function pickVar() {
  return Math.random() < 0.3 ? "x" : choice(OTHER_VARS);
}

function fmt(n) {
  return n < 0 ? `−${Math.abs(n)}` : String(n);
}

function sign(n) {
  return n < 0 ? ` − ${Math.abs(n)}` : ` + ${n}`;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);

  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }

  return a || 1;
}

function buildExpression(terms) {
  const parts = [];

  terms.forEach((term, index) => {
    if (term.coeff === 0) return;

    const neg = term.coeff < 0;
    const abs = Math.abs(term.coeff);

    const body = term.v
      ? `${abs === 1 ? "" : abs}${term.v}`
      : String(abs);

    if (index === 0 && parts.length === 0) {
      parts.push(neg ? `−${body}` : body);
    } else {
      parts.push(neg ? ` − ${body}` : ` + ${body}`);
    }
  });

  return parts.length ? parts.join("") : "0";
}

function simplifyTerms(terms) {
  const map = new Map();
  let constant = 0;

  for (const term of terms) {
    if (!term.v) constant += term.coeff;
    else map.set(term.v, (map.get(term.v) || 0) + term.coeff);
  }

  const out = [];

  [...map.keys()].sort().forEach(v => {
    const coeff = map.get(v);
    if (coeff !== 0) out.push({ coeff, v });
  });

  if (constant !== 0 || !out.length) out.push({ coeff: constant, v: null });

  return buildExpression(out);
}

function makeBalancedPlan(typeIds, count) {
  const ids = typeIds.length ? typeIds.slice() : TYPE_LIST.map(t => t.id);
  const plan = [];

  let i = 0;

  while (plan.length < count) {
    plan.push(ids[i % ids.length]);
    i += 1;
  }

  return shuffle(plan);
}

function algebraQuestion({ type, marks = 1, prompt, answer, working = [], space = SPACE_SIZES.MEDIUM }) {
  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type,
    marks,
    prompt,
    answer,
    working,
    space,
    tags: ["algebraic techniques", type]
  });
}

/* -----------------------------
   Generators
----------------------------- */

function translateRichQuestion() {
  const v = pickVar();

  const stems = [
    {
      text: `three more than twice ${v}`,
      answer: `2${v} + 3`
    },
    {
      text: `five less than three times ${v}`,
      answer: `3${v} − 5`
    },
    {
      text: `the sum of ${v} and 7, multiplied by 2`,
      answer: `2(${v} + 7)`
    },
    {
      text: `half of (${v} + 6)`,
      answer: `(${v} + 6) ÷ 2`
    },
    {
      text: `the difference between 10 and ${v}`,
      answer: `10 − ${v}`
    }
  ];

  const stem = choice(stems);

  return algebraQuestion({
    type: "translate-rich",
    marks: 1,
    prompt: `Write an algebraic expression for: "${stem.text}".`,
    answer: stem.answer,
    working: [`Expression: ${stem.answer}`],
    space: SPACE_SIZES.SMALL
  });
}

function factoriseQuestion() {
  const v = pickVar();
  const template = choice(["two-terms", "negative", "three-terms"]);

  if (template === "two-terms") {
    const g = randInt(2, 9);
    let a = randInt(1, 7);
    let b = randInt(1, 9);

    while (gcd(a, b) !== 1) {
      a = randInt(1, 7);
      b = randInt(1, 9);
    }

    const expr = `${g * a}${v} + ${g * b}`;
    const answer = `${g}(${a}${v} + ${b})`;

    return algebraQuestion({
      type: "factorise",
      marks: 2,
      prompt: `Factorise: ${expr}`,
      answer,
      working: [
        `The highest common factor is ${g}.`,
        `${expr} = ${answer}`
      ]
    });
  }

  if (template === "negative") {
    const g = randInt(2, 9);
    const a = randInt(1, 7);
    const b = randInt(1, 9);
    const expr = `−${g * a}${v} − ${g * b}`;
    const answer = `−${g}(${a}${v} + ${b})`;

    return algebraQuestion({
      type: "factorise",
      marks: 2,
      prompt: `Factorise: ${expr}`,
      answer,
      working: [
        `The common factor is −${g}.`,
        `${expr} = ${answer}`
      ]
    });
  }

  let v2 = pickVar();
  while (v2 === v) v2 = pickVar();

  const g = randInt(2, 6);
  const a = randInt(1, 5);
  const b = randInt(1, 5);
  const c = randInt(1, 8);
  const expr = `${g * a}${v} + ${g * b}${v2} + ${g * c}`;
  const answer = `${g}(${a}${v} + ${b}${v2} + ${c})`;

  return algebraQuestion({
    type: "factorise",
    marks: 2,
    prompt: `Factorise: ${expr}`,
    answer,
    working: [
      `The highest common factor is ${g}.`,
      `${expr} = ${answer}`
    ]
  });
}

function substituteTwoQuestion() {
  const v = pickVar();
  const x = randInt(-4, 8);
  const a = randInt(2, 5);
  const b = randInt(1, 9);
  const kind = choice(["a(v+b)", "a(v-b)", "av+b"]);

  let expr;
  let value;

  if (kind === "a(v+b)") {
    expr = `${a}(${v} + ${b})`;
    value = a * (x + b);
  } else if (kind === "a(v-b)") {
    expr = `${a}(${v} − ${b})`;
    value = a * (x - b);
  } else {
    expr = `${a}${v} + ${b}`;
    value = a * x + b;
  }

  return algebraQuestion({
    type: "sub-two",
    marks: 2,
    prompt: `Evaluate ${expr} when ${v} = ${fmt(x)}.`,
    answer: fmt(value),
    working: [
      `Substitute ${v} = ${fmt(x)}.`,
      `${expr} = ${fmt(value)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function substituteTwoVarsQuestion() {
  let v1 = pickVar();
  let v2 = pickVar();

  while (v2 === v1) v2 = pickVar();

  const val1 = randInt(1, 10);
  const val2 = randInt(1, 10);
  const kind = choice(["sumConst", "productConst", "coeffSum", "mixedCoeff", "difference", "bracketMul"]);

  let expr;
  let value;

  if (kind === "sumConst") {
    const c = randInt(1, 12);
    expr = `${v1} + ${v2} + ${c}`;
    value = val1 + val2 + c;
  } else if (kind === "productConst") {
    const c = randInt(1, 12);
    expr = `${v1}${v2} + ${c}`;
    value = val1 * val2 + c;
  } else if (kind === "coeffSum") {
    const a = randInt(2, 12);
    expr = `${a}${v1} + ${v2}`;
    value = a * val1 + val2;
  } else if (kind === "mixedCoeff") {
    const a = randInt(2, 12);
    const b = randInt(2, 12);
    expr = `${a}${v1} + ${b}${v2}`;
    value = a * val1 + b * val2;
  } else if (kind === "difference") {
    const a = randInt(2, 12);
    expr = `${a}${v1} − ${v2}`;
    value = a * val1 - val2;
  } else {
    const a = randInt(2, 12);
    expr = `${a}(${v1} + ${v2})`;
    value = a * (val1 + val2);
  }

  return algebraQuestion({
    type: "sub-two-vars",
    marks: 2,
    prompt: `Evaluate ${expr} when ${v1} = ${val1} and ${v2} = ${val2}.`,
    answer: fmt(value),
    working: [
      `Substitute ${v1} = ${val1} and ${v2} = ${val2}.`,
      `${expr} = ${fmt(value)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function simpleLikeTermsQuestion() {
  const v = pickVar();
  const a = randInt(2, 9);
  let b = randInt(1, 9);
  const subtract = Math.random() < 0.35;

  if (subtract && b >= a) b = randInt(1, a - 1);

  const secondCoeff = subtract ? -b : b;
  const expr = `${a}${v}${subtract ? " − " : " + "}${b}${v}`;
  const answer = buildExpression([{ coeff: a + secondCoeff, v }]);

  return algebraQuestion({
    type: "simplify-simple",
    marks: 1,
    prompt: `Simplify: ${expr}`,
    answer,
    working: [
      `Collect the ${v} terms.`,
      `${expr} = ${answer}`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function simplifyMixedQuestion() {
  let v1 = pickVar();
  let v2 = pickVar();

  while (v2 === v1) v2 = pickVar();

  const totalTerms = randInt(4, 5);
  const counts = totalTerms === 4
    ? [2, 2]
    : (Math.random() < 0.5 ? [3, 2] : [2, 3]);

  function makeLikeGroup(v, count) {
    let coeffs;
    let sum;

    do {
      coeffs = Array.from({ length: count }, () => choice([1, -1]) * randInt(1, 9));
      sum = coeffs.reduce((total, coeff) => total + coeff, 0);
    } while (sum === 0);

    return coeffs.map(coeff => ({ coeff, v }));
  }

  const terms = [
    ...makeLikeGroup(v1, counts[0]),
    ...makeLikeGroup(v2, counts[1])
  ];

  const mixed = shuffle(terms);
  const expr = buildExpression(mixed);
  const answer = simplifyTerms(mixed);

  return algebraQuestion({
    type: "simplify-mixed",
    marks: 2,
    prompt: `Simplify: ${expr}`,
    answer,
    working: [
      "Collect the two groups of like terms.",
      `${expr} = ${answer}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function multiplyTermsQuestion() {
  const v1 = pickVar();
  let v2 = pickVar();

  if (Math.random() < 0.45) v2 = v1;
  while (v2 === v1 && Math.random() > 0.55) v2 = pickVar();

  const a = randInt(2, 9);
  const b = randInt(2, 9);

  const factors = shuffle([`${a}`, `${b}`, v1, v2]);
  const expr = factors.join(" × ");

  const coeff = a * b;
  const vars = [v1, v2].sort().join("");
  const answer = `${coeff}${vars}`;

  return algebraQuestion({
    type: "multiply-terms",
    marks: 1,
    prompt: `Simplify: ${expr}`,
    answer,
    working: [
      `Multiply the numbers: ${a} × ${b} = ${coeff}.`,
      `Collect the pronumerals: ${vars}.`,
      `Answer: ${answer}`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function expandSimplifyQuestion() {
  const template = choice(["c_plus_k_bracket", "k_bracket_plus_var", "two_var_bracket_plus", "two_var_big"]);

  if (template === "c_plus_k_bracket") {
    const v = pickVar();
    const c0 = randInt(1, 9);
    const k = randInt(2, 6);
    const b = randInt(1, 9);
    const plus = Math.random() < 0.5;
    const expr = `${c0} + ${k}(${v} ${plus ? "+" : "−"} ${b})`;
    const answer = buildExpression([
      { coeff: k, v },
      { coeff: c0 + k * (plus ? b : -b), v: null }
    ]);

    return algebraQuestion({
      type: "expand-simplify",
      marks: 2,
      prompt: `Expand and simplify: ${expr}`,
      answer,
      working: [
        `Expand the bracket.`,
        `${expr} = ${answer}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (template === "k_bracket_plus_var") {
    const v = pickVar();
    const k = randInt(2, 6);
    const b = randInt(1, 9);
    const m = randInt(1, 6);
    const addC = randInt(0, 9);
    const plusB = Math.random() < 0.5;
    const plusM = Math.random() < 0.5;

    const expr = `${k}(${v} ${plusB ? "+" : "−"} ${b}) ${plusM ? "+" : "−"} ${m}${v}${addC ? ` + ${addC}` : ""}`;
    const answer = buildExpression([
      { coeff: k + (plusM ? m : -m), v },
      { coeff: k * (plusB ? b : -b) + addC, v: null }
    ]);

    return algebraQuestion({
      type: "expand-simplify",
      marks: 2,
      prompt: `Expand and simplify: ${expr}`,
      answer,
      working: [
        `Expand the bracket and collect like terms.`,
        `${expr} = ${answer}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  let v1 = pickVar();
  let v2 = pickVar();

  while (v2 === v1) v2 = pickVar();

  const k = randInt(2, 5);
  const a = randInt(1, 4);
  const b = randInt(1, 4);
  const e1 = randInt(0, 6);
  const e2 = randInt(0, 6);

  const expr = `${k}(${a}${v1} + ${b}${v2})${e2 ? ` + ${e2}${v2}` : ""}${e1 ? ` + ${e1}${v1}` : ""}`;
  const answer = simplifyTerms([
    { coeff: k * a + e1, v: v1 },
    { coeff: k * b + e2, v: v2 }
  ]);

  return algebraQuestion({
    type: "expand-simplify",
    marks: 2,
    prompt: `Expand and simplify: ${expr}`,
    answer,
    working: [
      `Expand the bracket and collect like terms.`,
      `${expr} = ${answer}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function algebraicFractionQuestion() {
  let v1 = pickVar();
  let v2 = pickVar();

  while (v2 === v1) v2 = pickVar();

  const topCoeff = randInt(2, 9) * randInt(2, 6);
  const bottomCoeff = randInt(2, 9) * randInt(2, 6);
  const g = gcd(topCoeff, bottomCoeff);

  const template = choice(["oneCommonVar", "twoVarsCancelOne", "numOnly"]);

  let top;
  let bottom;
  let answer;

  if (template === "oneCommonVar") {
    top = `${topCoeff}${v1}`;
    bottom = `${bottomCoeff}${v1}`;
    answer = `${topCoeff / g}/${bottomCoeff / g}`;
  } else if (template === "twoVarsCancelOne") {
    top = `${topCoeff}${v1}${v2}`;
    bottom = `${bottomCoeff}${v1}`;
    answer = `${topCoeff / g}${v2}/${bottomCoeff / g}`;
  } else {
    top = `${topCoeff}${v1}`;
    bottom = `${bottomCoeff}`;
    answer = `${topCoeff / g}${v1}/${bottomCoeff / g}`;
  }

  if (answer.endsWith("/1")) answer = answer.replace("/1", "");

  return algebraQuestion({
    type: "algebraic-fractions",
    marks: 2,
    prompt: `Simplify: (${top}) ÷ (${bottom})`,
    answer,
    working: [
      `Write as a fraction: ${top}/${bottom}.`,
      `Cancel common factors.`,
      `Answer: ${answer}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function patternTableQuestion() {
  const forms = ["n_plus_b", "n_minus_b", "an", "an_plus_b", "an_minus_b"];
  const form = choice(forms);
  const m = randInt(2, 6);
  const b = randInt(1, 9);
  const ns = [1, 2, 3, 4];

  let expr;
  let vals;

  if (form === "n_plus_b") {
    expr = `n + ${b}`;
    vals = ns.map(n => n + b);
  } else if (form === "n_minus_b") {
    expr = `n − ${b}`;
    vals = ns.map(n => n - b);
  } else if (form === "an") {
    expr = `${m}n`;
    vals = ns.map(n => m * n);
  } else if (form === "an_plus_b") {
    expr = `${m}n + ${b}`;
    vals = ns.map(n => m * n + b);
  } else {
    expr = `${m}n − ${b}`;
    vals = ns.map(n => m * n - b);
  }

  const question = algebraQuestion({
    type: "pattern-table",
    marks: 2,
    prompt: `Complete the table of values for ${expr}, where n = 1, 2, 3, 4.`,
    answer: vals.map(fmt).join(", "),
    working: ns.map((n, i) => `n = ${n}: ${expr} = ${fmt(vals[i])}`),
    // The table itself is the student response area, so no separate writing space is needed.
    space: SPACE_SIZES.NONE
  });

  question.table = {
    className: "values",
    rows: [
      ["n", ...ns.map(String)],
      ["value", ...ns.map(() => "")]
    ]
  };

  return question;
}

// ── Write and use an expression to solve a problem ───────

function useExpressionSolveQuestion() {
  const v = "n";
  const scenarios = [
    // Perimeter of a rectangle
    () => {
      const w = randInt(2, 8);
      const perimeter = randInt(20, 40) * 2;
      const length = perimeter / 2 - w;
      return {
        prompt: `A rectangle has a width of ${w} cm. Its length is n cm. Write an expression for the perimeter, then find n if the perimeter is ${perimeter} cm.`,
        expression: `2(n + ${w})`,
        equation: `2(n + ${w}) = ${perimeter}`,
        answer: `n = ${length}`,
        working: [
          `Perimeter = 2(n + ${w})`,
          `2(n + ${w}) = ${perimeter}`,
          `n + ${w} = ${perimeter / 2}`,
          `n = ${length} cm`
        ]
      };
    },
    // Consecutive integers
    () => {
      const first = randInt(3, 20);
      const second = first + 1;
      const third = first + 2;
      const total = first + second + third;
      return {
        prompt: `Three consecutive integers have a sum of ${total}. Let the smallest integer be n. Write an expression for the sum and find n.`,
        expression: `n + (n + 1) + (n + 2) = 3n + 3`,
        equation: `3n + 3 = ${total}`,
        answer: `n = ${first}`,
        working: [
          `Sum = n + (n + 1) + (n + 2) = 3n + 3`,
          `3n + 3 = ${total}`,
          `3n = ${total - 3}`,
          `n = ${first}`
        ]
      };
    },
    // Ages problem
    () => {
      const age = randInt(5, 20);
      const olderBy = randInt(2, 10);
      const totalAge = age + age + olderBy;
      return {
        prompt: `One person is ${olderBy} years older than another. Let the younger person's age be n. If the sum of their ages is ${totalAge}, find n.`,
        expression: `n + (n + ${olderBy})`,
        equation: `2n + ${olderBy} = ${totalAge}`,
        answer: `n = ${age}`,
        working: [
          `Sum of ages = n + (n + ${olderBy}) = 2n + ${olderBy}`,
          `2n + ${olderBy} = ${totalAge}`,
          `2n = ${totalAge - olderBy}`,
          `n = ${age}`
        ]
      };
    },
    // Cost problem
    () => {
      const unitCost = randInt(3, 12);
      const fixed = randInt(5, 20);
      const total = unitCost * randInt(4, 10) + fixed;
      const qty = (total - fixed) / unitCost;
      return {
        prompt: `A plumber charges $${fixed} call-out fee plus $${unitCost} per hour. Write an expression for the total cost for n hours, then find n if the total bill is $${total}.`,
        expression: `${unitCost}n + ${fixed}`,
        equation: `${unitCost}n + ${fixed} = ${total}`,
        answer: `n = ${qty}`,
        working: [
          `Total cost = ${unitCost}n + ${fixed}`,
          `${unitCost}n + ${fixed} = ${total}`,
          `${unitCost}n = ${total - fixed}`,
          `n = ${qty} hours`
        ]
      };
    }
  ];

  const made = choice(scenarios)();

  return algebraQuestion({
    type: "use-expression-solve",
    marks: 3,
    prompt: made.prompt,
    answer: made.answer,
    working: made.working,
    space: SPACE_SIZES.LARGE
  });
}

// ── Expand brackets with a negative coefficient ──────────

function expandNegativeBracketQuestion() {
  const v = pickVar();
  const form = choice(["neg-outside", "neg-inside-both", "double-neg"]);

  if (form === "neg-outside") {
    // −a(x + b) or −a(x − b)
    const a = randInt(2, 6);
    const b = randInt(1, 9);
    const sign = Math.random() < 0.5 ? "+" : "−";
    const bVal = sign === "+" ? b : -b;
    const expr = `−${a}(${v} ${sign} ${b})`;
    const coeff = -a;
    const constant = -a * bVal;
    const answer = buildExpression([
      { coeff, v },
      { coeff: constant, v: null }
    ]);

    return algebraQuestion({
      type: "expand-negative-bracket",
      marks: 2,
      prompt: `Expand: ${expr}`,
      answer,
      working: [
        `Multiply each term inside the bracket by −${a}:`,
        `${expr} = ${fmt(coeff)}${v} ${constant >= 0 ? "+" : "−"} ${Math.abs(constant)}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (form === "neg-inside-both") {
    // a(−x − b)
    const a = randInt(2, 5);
    const b = randInt(1, 8);
    const expr = `${a}(−${v} − ${b})`;
    const answer = buildExpression([
      { coeff: -a, v },
      { coeff: -a * b, v: null }
    ]);

    return algebraQuestion({
      type: "expand-negative-bracket",
      marks: 2,
      prompt: `Expand: ${expr}`,
      answer,
      working: [
        `Multiply each term by ${a}:`,
        `${expr} = ${fmt(-a)}${v} − ${a * b}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  // double-neg: −a(−x + b)
  const a = randInt(2, 5);
  const b = randInt(1, 8);
  const expr = `−${a}(−${v} + ${b})`;
  const answer = buildExpression([
    { coeff: a, v },
    { coeff: -a * b, v: null }
  ]);

  return algebraQuestion({
    type: "expand-negative-bracket",
    marks: 2,
    prompt: `Expand: ${expr}`,
    answer,
    working: [
      `Multiply each term by −${a}:`,
      `−${a} × −${v} = ${a}${v}`,
      `−${a} × ${b} = −${a * b}`,
      `${expr} = ${answer}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

// ── Algebraic notation & terms (4A) ──────────────────────

function introNotationQuestion() {
  const v = pickVar();
  const a = randInt(2, 9);
  const b = randInt(2, 12);
  const variants = [
    () => ({
      prompt: `Write an expression for "a number ${v} multiplied by ${a}, then ${b} added".`,
      answer: `${a}${v} + ${b}`,
      working: [`"multiplied by ${a}" → ${a}${v}`, `"then ${b} added" → ${a}${v} + ${b}`]
    }),
    () => ({
      prompt: `In the expression ${a}${v} + ${b}, what is the coefficient of ${v}?`,
      answer: `${a}`,
      working: [`The coefficient is the number multiplying ${v}, which is ${a}.`]
    }),
    () => ({
      prompt: `In the expression ${a}${v} + ${b}, what is the constant term?`,
      answer: `${b}`,
      working: [`The constant term has no pronumeral: ${b}.`]
    }),
    () => ({
      prompt: `How many terms are in the expression ${a}${v} + ${b} − ${v}?`,
      answer: `3`,
      working: [`Terms are separated by + and −: ${a}${v}, ${b}, ${v} → 3 terms.`]
    }),
    () => ({
      prompt: `Write "${b} less than ${a} lots of ${v}" as an expression.`,
      answer: `${a}${v} − ${b}`,
      working: [`"${a} lots of ${v}" → ${a}${v}`, `"${b} less than" → ${a}${v} − ${b}`]
    })
  ];
  const made = choice(variants)();
  return algebraQuestion({
    type: "intro-notation",
    marks: 1,
    prompt: made.prompt,
    answer: made.answer,
    working: made.working,
    space: SPACE_SIZES.SMALL
  });
}

// ── Like terms with algebra tiles (diagram) ──────────────

function likeTermsTilesQuestion() {
  const v = "x";
  const xCount = randInt(2, 5);
  const ones = randInt(1, 5);
  const answer = `${xCount}${v} + ${ones}`;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "like-terms-tiles",
    marks: 1,
    prompt: `Write the expression modelled by the algebra tiles below.`,
    diagram: {
      engine: "algebra-engine",
      caption: "Long tiles are x; small tiles are 1.",
      config: { diagramType: "algebra-tiles", variable: v, x: xCount, ones }
    },
    answer,
    working: [`${xCount} x-tiles and ${ones} unit tiles → ${answer}.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["algebraic techniques", "like terms", "diagram"]
  });
}

// ── Expand a single bracket using an area model ──────────

function expandAreaModelQuestion() {
  const v = pickVar();
  const m = randInt(2, 6);
  const c = randInt(2, 9);
  const minus = Math.random() < 0.4;
  const op = minus ? "−" : "+";
  const p1 = `${m}${v}`;
  const p2 = `${m * c}`;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "expand-area-model",
    marks: 2,
    prompt: `Use the area model to expand ${m}(${v} ${op} ${c}).`,
    diagram: {
      engine: "algebra-engine",
      caption: "Multiply each part by the number on the left.",
      config: {
        diagramType: "expand-area-model",
        multiplier: String(m),
        parts: [v, `${op === "−" ? "−" : ""}${c}`],
        products: [p1, `${op === "−" ? "−" : ""}${p2}`],
        showProducts: false
      }
    },
    answer: `${p1} ${op} ${p2}`,
    working: [
      `${m} × ${v} = ${p1}`,
      `${m} × ${c} = ${p2}`,
      `${m}(${v} ${op} ${c}) = ${p1} ${op} ${p2}`
    ],
    space: SPACE_SIZES.SMALL,
    tags: ["algebraic techniques", "expanding", "diagram"]
  });
}

// ── Perimeter expression from a figure (diagram) ─────────

function perimeterExpressionQuestion() {
  const v = "x";
  const shapeChoice = choice(["rectangle", "rectangle", "triangle"]);

  if (shapeChoice === "triangle") {
    const k = randInt(1, 6);
    const c = randInt(3, 9);
    // sides: x, x + k, c  → perimeter 2x + (k + c)
    const answer = buildExpression(simplifyToTerms([{ coeff: 2, v }, { coeff: k + c, v: null }]));
    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "perimeter-expression",
      marks: 2,
      prompt: `Write an expression for the perimeter of the triangle, then simplify.`,
      diagram: {
        engine: "algebra-engine",
        config: { diagramType: "perimeter-figure", shape: "triangle", sides: [v, `${v} + ${k}`, String(c)] }
      },
      answer,
      working: [`P = ${v} + (${v} + ${k}) + ${c}`, `P = ${answer}`],
      space: SPACE_SIZES.SMALL,
      tags: ["algebraic techniques", "perimeter", "diagram", "applying algebra"]
    });
  }

  const k = randInt(1, 8);
  // rectangle width x, length x + k → perimeter 4x + 2k
  const answer = buildExpression(simplifyToTerms([{ coeff: 4, v }, { coeff: 2 * k, v: null }]));
  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "perimeter-expression",
    marks: 2,
    prompt: `Write an expression for the perimeter of the rectangle, then simplify.`,
    diagram: {
      engine: "algebra-engine",
      config: { diagramType: "perimeter-figure", shape: "rectangle", width: v, length: `${v} + ${k}` }
    },
    answer,
    working: [`P = 2(${v}) + 2(${v} + ${k})`, `P = 2${v} + 2${v} + ${2 * k}`, `P = ${answer}`],
    space: SPACE_SIZES.SMALL,
    tags: ["algebraic techniques", "perimeter", "diagram", "applying algebra"]
  });
}

function simplifyToTerms(terms) {
  const map = new Map();
  let constant = 0;
  for (const t of terms) {
    if (!t.v) constant += t.coeff;
    else map.set(t.v, (map.get(t.v) || 0) + t.coeff);
  }
  const out = [];
  [...map.keys()].sort().forEach(v => { if (map.get(v) !== 0) out.push({ coeff: map.get(v), v }); });
  if (constant !== 0 || !out.length) out.push({ coeff: constant, v: null });
  return out;
}

// ── Function machines (diagram) ──────────────────────────

function functionMachineQuestion() {
  const v = "x";
  const a = randInt(2, 5);
  const b = randInt(1, 9);
  const algebraic = Math.random() < 0.5;

  if (algebraic) {
    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "function-machine",
      marks: 1,
      prompt: `Write an expression for the output of this function machine when the input is ${v}.`,
      diagram: {
        engine: "algebra-engine",
        config: { diagramType: "function-machine", input: v, operations: [{ text: `× ${a}` }, { text: `+ ${b}` }], output: "?" }
      },
      answer: `${a}${v} + ${b}`,
      working: [`${v} × ${a} = ${a}${v}`, `${a}${v} + ${b}`],
      space: SPACE_SIZES.SMALL,
      mcEligible: false,
      tags: ["algebraic techniques", "function machine", "diagram"]
    });
  }

  const input = randInt(2, 9);
  const output = a * input + b;
  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "function-machine",
    marks: 1,
    prompt: `Find the output of this function machine when the input is ${input}.`,
    diagram: {
      engine: "algebra-engine",
      config: { diagramType: "function-machine", input: String(input), operations: [{ text: `× ${a}` }, { text: `+ ${b}` }], output: "?" }
    },
    answer: String(output),
    working: [`${input} × ${a} = ${a * input}`, `${a * input} + ${b} = ${output}`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["algebraic techniques", "function machine", "substitution", "diagram"]
  });
}

// ── Write an expression for a context ────────────────────

function wordedExpressionQuestion() {
  const v = "x";
  const a = randInt(2, 5);
  const b = randInt(2, 9);
  const scenarios = [
    { prompt: `Maya has ${v} dollars. Tom has ${b} dollars more than Maya. Write an expression for the amount Tom has.`, answer: `${v} + ${b}` },
    { prompt: `A box holds ${v} pencils. Write an expression for the number of pencils in ${a} boxes.`, answer: `${a}${v}` },
    { prompt: `Ravi is ${v} years old. Write an expression for his age in ${b} years' time.`, answer: `${v} + ${b}` },
    { prompt: `A taxi charges a $${b} flagfall plus $${a} per kilometre. Write an expression for the cost of a trip of ${v} km.`, answer: `${a}${v} + ${b}` },
    { prompt: `There are ${v} students. Each needs ${a} sheets of paper, and ${b} spare sheets are kept. Write an expression for the total sheets needed.`, answer: `${a}${v} + ${b}` }
  ];
  const made = choice(scenarios);
  return algebraQuestion({
    type: "worded-expression",
    marks: 1,
    prompt: made.prompt,
    answer: made.answer,
    working: [`Translate the words into algebra: ${made.answer}.`],
    space: SPACE_SIZES.SMALL
  });
}

// ── Spot the error (MC) ──────────────────────────────────

function errorSpotAlgebraQuestion() {
  const v = "x";
  const scenarios = [
    () => { const a = randInt(2, 5), b = randInt(2, 5); return { wrong: `${a}${v} + ${b}${v} = ${a + b}${v}²`, issue: `adding like terms keeps the same pronumeral (no extra power)`, correct: `${a + b}${v}` }; },
    () => { const a = randInt(2, 6), c = randInt(2, 6); return { wrong: `${a}(${v} + ${c}) = ${a}${v} + ${c}`, issue: `every term in the bracket must be multiplied`, correct: `${a}${v} + ${a * c}` }; },
    () => { const a = randInt(2, 5); return { wrong: `${a} + ${a}${v} = ${a + a}${v}`, issue: `a constant and an x-term are not like terms`, correct: `${a}${v} + ${a}` }; },
    () => { const a = randInt(2, 5), b = randInt(2, 5); return { wrong: `${a}${v} × ${b}${v} = ${a * b}${v}`, issue: `multiply the pronumerals too: x × x = x²`, correct: `${a * b}${v}²` }; }
  ];
  const s = choice(scenarios)();
  const distractors = shuffle([s.correct, s.wrong.split("= ")[1], `${v}`, `${randInt(2, 9)}${v}`])
    .filter((d, i, arr) => arr.indexOf(d) === i).slice(0, 4);
  if (!distractors.includes(s.correct)) distractors[0] = s.correct;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "error-spot-algebra",
    kind: QUESTION_KINDS.MULTIPLE_CHOICE,
    marks: 1,
    prompt: `A student wrote:  ${s.wrong}\nThis is incorrect. What is the correct answer?`,
    choices: shuffle(distractors),
    answer: s.correct,
    working: [`The error: ${s.issue}.`, `Correct answer: ${s.correct}.`],
    space: SPACE_SIZES.NONE,
    tags: ["algebraic techniques", "reasoning", "error analysis"]
  });
}

// ── Equivalent expressions: true or false ────────────────

function trueFalseEquivalentQuestion() {
  const v = "x";
  const a = randInt(2, 5), b = randInt(2, 6);
  const items = [
    { stmt: `${a}(${v} + ${b}) = ${a}${v} + ${a * b}`, val: true, reason: `Expanding: ${a}(${v} + ${b}) = ${a}${v} + ${a * b}.` },
    { stmt: `${a}${v} + ${v} = ${a + 1}${v}`, val: true, reason: `${a}${v} + ${v} = ${a + 1}${v}.` },
    { stmt: `${a}${v} + ${b} = ${a + b}${v}`, val: false, reason: `${a}${v} and ${b} are not like terms.` },
    { stmt: `${v} + ${v} = ${v}²`, val: false, reason: `${v} + ${v} = 2${v}, not ${v}².` },
    { stmt: `${a}(${v} − ${b}) = ${a}${v} − ${a * b}`, val: true, reason: `Expand each term: ${a}${v} − ${a * b}.` }
  ];
  const it = choice(items);
  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "true-false-equivalent",
    marks: 1,
    prompt: `True or false? ${it.stmt}  (Give a reason.)`,
    answer: it.val ? "True" : "False",
    working: [it.reason],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["algebraic techniques", "reasoning", "equivalent expressions"]
  });
}

// ── Multi-part algebra problem ───────────────────────────

function multiPartAlgebraQuestion() {
  const v = "x";
  const a = randInt(2, 5);
  const k = randInt(2, 8);
  const sub = randInt(2, 6);
  const perim = buildExpression(simplifyToTerms([{ coeff: 4, v }, { coeff: 2 * k, v: null }]));
  const perimVal = 4 * sub + 2 * k;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multi-part-algebra",
    marks: 3,
    prompt: `A rectangle has width ${v} cm and length (${v} + ${k}) cm.`,
    diagram: {
      engine: "algebra-engine",
      config: { diagramType: "perimeter-figure", shape: "rectangle", width: `${v}`, length: `${v} + ${k}` }
    },
    subparts: [
      { label: "(a)", prompt: `Write an expression for the perimeter and simplify.`, marks: 1, answer: `${perim} cm`, working: [`P = 2${v} + 2(${v} + ${k}) = ${perim} cm`] },
      { label: "(b)", prompt: `Write an expression for the area (no need to expand).`, marks: 1, answer: `${v}(${v} + ${k}) cm²`, working: [`A = length × width = ${v}(${v} + ${k}) cm².`] },
      { label: "(c)", prompt: `Find the perimeter when ${v} = ${sub} cm.`, marks: 1, answer: `${perimVal} cm`, working: [`P = 4(${sub}) + ${2 * k} = ${perimVal} cm.`] }
    ],
    answer: `(a) ${perim} cm; (b) ${v}(${v} + ${k}) cm²; (c) ${perimVal} cm`,
    working: [],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["algebraic techniques", "multi-part", "applying algebra", "diagram"]
  });
}

const GENERATORS = {
  "translate-rich": translateRichQuestion,
  "factorise": factoriseQuestion,
  "sub-two": substituteTwoQuestion,
  "sub-two-vars": substituteTwoVarsQuestion,
  "simplify-simple": simpleLikeTermsQuestion,
  "simplify-mixed": simplifyMixedQuestion,
  "multiply-terms": multiplyTermsQuestion,
  "expand-simplify": expandSimplifyQuestion,
  "algebraic-fractions": algebraicFractionQuestion,
  "pattern-table": patternTableQuestion,
  "use-expression-solve": useExpressionSolveQuestion,
  "expand-negative-bracket": expandNegativeBracketQuestion,
  "intro-notation": introNotationQuestion,
  "like-terms-tiles": likeTermsTilesQuestion,
  "expand-area-model": expandAreaModelQuestion,
  "perimeter-expression": perimeterExpressionQuestion,
  "function-machine": functionMachineQuestion,
  "worded-expression": wordedExpressionQuestion,
  "error-spot-algebra": errorSpotAlgebraQuestion,
  "true-false-equivalent": trueFalseEquivalentQuestion,
  "multi-part-algebra": multiPartAlgebraQuestion
};

export function getAlgebraicTechniquesQuestionTypes() {
  return TYPE_LIST;
}

export function generateAlgebraicTechniquesQuestions({
  count = 8,
  allowedTypes = null
} = {}) {
  const typeIds = allowedTypes?.length
    ? allowedTypes
    : TYPE_LIST.map(t => t.id);

  const plan = makeBalancedPlan(typeIds, count);
  const questions = [];

  let safety = 0;

  while (questions.length < count && safety < count * 30) {
    const type = plan[questions.length % plan.length];
    const generator = GENERATORS[type];

    if (generator) {
      questions.push(generator());
    }

    safety += 1;
  }

  return questions.map(attachQuestionTranslations);
}

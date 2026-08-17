import { randInt, pick, makeQuestion } from "../../../helpers.js";

/**
 * STAGE 4 · Indices — NATIVE skills (Phase 3E), covering EVERY NESA content
 * statement across the three statement groups (question styles matched to the
 * CHHS Exam-Builder indices bank):
 *
 *   Index notation & primes ...... indexTerminology, indexNotation,
 *                                  evaluateIndices (incl. powers of 10),
 *                                  orderOpsIndices, divisibilityTests,
 *                                  primeFactorisation (with factor trees)
 *   Square & cube roots .......... rootNotation, rootProperty (√(ab)=√a×√b),
 *                                  estimateRoots (incl. exact vs approximate),
 *                                  rootOrderOps
 *   Index laws & zero index ...... indexLawsMultiply, indexLawsDivide,
 *                                  indexLawsPower (incl. (ab)² = a²b²),
 *                                  zeroIndex
 *
 * NOTATION RULES (teacher requirement):
 *   - Student-facing text ALWAYS uses real notation: unicode superscripts
 *     (2⁴, 10⁶) and radical signs (√, ∛) — never ^, sqrt() or x^2.
 *   - Answers with structure (index form, k√m) use the MathLive editor with
 *     STRUCTURAL grading: "write 72 in index form" rejects "72" and any
 *     non-prime-base product; index-law answers reject the evaluated number,
 *     because the LAW is the skill.
 *   - Exact vs approximate is handled explicitly: exact answers keep the root
 *     (2√10), approximate ones are decimals with a ±0.05 (1 dp) tolerance.
 */
const SYL = "MA4-IND";

// ---- notation helpers -----------------------------------------------------------

const SUPS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const sup = (n) => String(n).split("").map((d) => SUPS[+d]).join("");
const pow = (b, e) => `${b}${sup(e)}`;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const expanded = (b, e) => Array(e).fill(b).join(" × ");

// Prime factor map of n, e.g. 72 → { 2: 3, 3: 2 }.
function primeMap(n) {
  const map = {};
  let x = n;
  for (let p = 2; p * p <= x; p++) {
    while (x % p === 0) { map[p] = (map[p] || 0) + 1; x /= p; }
  }
  if (x > 1) map[x] = (map[x] || 0) + 1;
  return map;
}
const isPrime = (n) => n >= 2 && Object.keys(primeMap(n)).length === 1 && primeMap(n)[n] === 1;

// Display 72 as "2³ × 3²".
function primeIndexText(n) {
  return Object.entries(primeMap(n))
    .map(([b, e]) => (e === 1 ? String(b) : pow(b, e)))
    .join(" × ");
}

/**
 * Parse a typed product of powers ("2^3*3^2", "2^{3} × 3²", "2*2*2*3*3") into
 * a factor map { base: totalExponent }. Returns null if anything unparseable.
 */
export function parsePowerProduct(input) {
  let s = String(input ?? "")
    .replace(/\s+/g, "")
    .replace(/[{}()]/g, "")
    .replace(/[×·]/g, "*")
    .replace(/\\cdot|\\times/g, "*");
  // Unicode superscripts → ^n.
  s = s.replace(new RegExp(`([0-9])([${SUPS}]+)`, "g"), (_, d, sups) =>
    `${d}^${sups.split("").map((c) => SUPS.indexOf(c)).join("")}`);
  if (s === "") return null;
  const map = {};
  for (const part of s.split("*")) {
    const m = part.match(/^(\d+)(?:\^(\d+))?$/);
    if (!m) return null;
    const b = Number(m[1]);
    const e = m[2] == null ? 1 : Number(m[2]);
    if (b < 1 || e < 0) return null;
    map[b] = (map[b] || 0) + e;
  }
  return map;
}

// Structural check: the typed answer is EXACTLY the power base^exp (not the
// evaluated value, not a different base).
function powerCheck(base, exp) {
  return (input) => {
    const map = parsePowerProduct(input);
    if (!map) return false;
    const keys = Object.keys(map);
    return keys.length === 1 && Number(keys[0]) === base && map[base] === exp;
  };
}

// Structural check: the typed answer is a product of PRIME factors of n
// (index form or expanded — both are correct products of primes).
function primeProductCheck(n) {
  return (input) => {
    const map = parsePowerProduct(input);
    if (!map) return false;
    let product = 1;
    for (const [b, e] of Object.entries(map)) {
      const base = Number(b);
      if (!isPrime(base) || e < 1) return false;
      product *= base ** e;
    }
    return product === n;
  };
}

// Check for a simplified surd k√m (accepts "3sqrt(5)", "3*sqrt(5)", "3√5";
// rejects the unsimplified √45 — simplifying IS the skill).
function surdCheck(k, m) {
  return (input) => {
    let s = String(input ?? "").toLowerCase().replace(/\s+/g, "")
      .replace(/[{}()]/g, "").replace(/[×·]/g, "*").replace(/\\sqrt/g, "sqrt").replace(/√/g, "sqrt");
    const match = s.match(/^(\d*)\*?sqrt(\d+)$/);
    if (!match) return false;
    const kk = match[1] === "" ? 1 : Number(match[1]);
    return kk === k && Number(match[2]) === m;
  };
}

// Tolerant 1-dp check for approximate roots.
function approxCheck(exact, tol = 0.05) {
  return (input) => {
    const v = Number(String(input ?? "").trim());
    return Number.isFinite(v) && Math.abs(v - exact) <= tol;
  };
}

// Build a math-input question then swap in a custom structural check.
function structQ(config, check) {
  const q = makeQuestion({ ...config, inputMode: "math" });
  if (check) q.check = check;
  return q;
}

const SQUARES = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];
const CUBES = [8, 27, 64, 125, 216, 343, 512, 729, 1000];

// ---- 1. Terminology: base, power, index, exponent ---------------------------------

export const indexTerminology = {
  id: "indexTerminology",
  name: "Base, Index & Power Words",
  syllabusArea: SYL,
  prerequisiteSkillIds: [],
  nextSkillIds: ["indexNotation"],

  generate(level) {
    const b = randInt(2, 9);
    let e;
    do { e = randInt(2, 7); } while (e === b);

    if (level <= 2) {
      const askBase = pick([true, false]);
      return makeQuestion({
        topic: "indexTerminology",
        text: `In ${pow(b, e)}, which number is the ${askBase ? "BASE" : "INDEX (exponent)"}?`,
        answer: askBase ? b : e,
        feedback: `In ${pow(b, e)}, the base is ${b} (the repeated number) and the index — also called the exponent or power — is ${e} (how many times it is repeated).`,
        inputMode: "simple",
      });
    }

    if (level <= 4) {
      const items = [
        [`Which expression has base ${b} and index ${e}?`, pow(b, e), [pow(e, b), `${b} × ${e}`, pow(b, b)]],
        [`How is ${pow(b, e)} read aloud?`, `${b} to the power of ${e}`, [`${b} multiplied by ${e}`, `${e} to the power of ${b}`, `${b} plus itself ${e} times`]],
        [`In ${pow(b, e)}, what does the index ${e} tell you?`, `How many times ${b} is multiplied by itself`, [`How many times ${b} is added to itself`, `The value of the expression`, `The number to divide by`]],
      ];
      const [q, correct, wrong] = pick(items);
      return makeQuestion({
        topic: "indexTerminology",
        text: q,
        answer: correct,
        feedback: `${pow(b, e)} means ${expanded(b, e)} — base ${b}, index (exponent) ${e}. The whole expression is called a power.`,
        answerMode: "multipleChoice",
        options: shuffle([correct, ...wrong]),
      });
    }

    const items = [
      [`"Index" and "exponent" mean the same thing`, "True", `both name the raised number in ${pow(b, e)}`],
      [`In ${pow(b, e)}, the base is ${e}`, "False", `the base is ${b} — the index is ${e}`],
      [`${pow(b, e)} and ${pow(e, b)} are always equal`, "False", `for example ${pow(2, 3)} = 8 but ${pow(3, 2)} = 9`],
      [`The whole expression ${pow(b, e)} is called a power of ${b}`, "True", `${pow(b, e)} is the ${e}th power of ${b}`],
    ];
    const [claim, answer, why] = pick(items);
    return makeQuestion({
      topic: "indexTerminology",
      text: `True or false:\n${claim}.`,
      answer,
      feedback: `${answer} — ${why}.`,
      answerMode: "trueFalse",
      options: ["True", "False"],
    });
  },
};

// ---- 2. Index notation (repeated multiplication ↔ index form) -----------------------

export const indexNotation = {
  id: "indexNotation",
  name: "Index Notation",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["indexTerminology"],
  nextSkillIds: ["evaluateIndices"],

  generate(level) {
    if (level <= 2) {
      // Repeated multiplication → index form (structural: 3⁴, not 81).
      const b = randInt(2, level <= 1 ? 6 : 9);
      const e = randInt(2, level <= 1 ? 4 : 5);
      return structQ({
        topic: "indexNotation",
        text: `Write ${expanded(b, e)} in index notation.`,
        answer: pow(b, e),
        feedback: `The base ${b} is repeated ${e} times: ${expanded(b, e)} = ${pow(b, e)}.`,
      }, powerCheck(b, e));
    }

    if (level === 3) {
      // Index form → expanded form (multiple choice — no clumsy typing).
      const b = randInt(2, 9);
      const e = randInt(3, 5);
      const correct = expanded(b, e);
      const wrong = [expanded(b, e - 1), `${b} × ${e}`, expanded(e, b > 5 ? 3 : b)];
      return makeQuestion({
        topic: "indexNotation",
        text: `Which is the EXPANDED form of ${pow(b, e)}?`,
        answer: correct,
        feedback: `${pow(b, e)} means ${b} multiplied by itself ${e} times: ${correct}.`,
        answerMode: "multipleChoice",
        options: shuffle([correct, ...wrong]),
      });
    }

    if (level === 4) {
      // Write a number as a power of 10.
      const e = randInt(3, 7);
      return structQ({
        topic: "indexNotation",
        text: `Write ${(10 ** e).toLocaleString("en-AU")} as a power of 10.`,
        answer: pow(10, e),
        feedback: `${(10 ** e).toLocaleString("en-AU")} has ${e} zeros: it is ${pow(10, e)}.`,
      }, powerCheck(10, e));
    }

    // Level 5: mixed product → index notation (two bases, structural).
    const b1 = pick([2, 3, 5]);
    let b2;
    do { b2 = pick([2, 3, 5, 7]); } while (b2 === b1);
    const e1 = randInt(2, 3);
    const e2 = randInt(2, 3);
    const parts = shuffle([...Array(e1).fill(b1), ...Array(e2).fill(b2)]);
    const target = (b1 ** e1) * (b2 ** e2);
    return structQ({
      topic: "indexNotation",
      text: `Write ${parts.join(" × ")} in index notation.`,
      answer: `${pow(Math.min(b1, b2), Math.min(b1, b2) === b1 ? e1 : e2)} × ${pow(Math.max(b1, b2), Math.max(b1, b2) === b1 ? e1 : e2)}`,
      feedback: `Group the equal factors: ${pow(b1, e1)} × ${pow(b2, e2)}.`,
    }, primeProductCheck(target));
  },
};

// ---- 3. Evaluate index notation (incl. powers of 10) --------------------------------

export const evaluateIndices = {
  id: "evaluateIndices",
  name: "Evaluating Powers",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["indexNotation"],
  nextSkillIds: ["orderOpsIndices"],

  generate(level) {
    if (level <= 1) {
      const b = randInt(2, 9);
      const e = pick([2, 3]);
      return makeQuestion({
        topic: "evaluateIndices",
        text: `Evaluate ${pow(b, e)}.`,
        answer: b ** e,
        feedback: `${pow(b, e)} = ${expanded(b, e)} = ${b ** e}.`,
        inputMode: "math",
      });
    }
    if (level === 2) {
      const powers10 = pick([true, false]);
      if (powers10) {
        const e = randInt(2, 5);
        return makeQuestion({
          topic: "evaluateIndices",
          text: `Evaluate ${pow(10, e)}.`,
          answer: 10 ** e,
          feedback: `${pow(10, e)} is a 1 followed by ${e} zeros: ${(10 ** e).toLocaleString("en-AU")}.`,
          inputMode: "math",
        });
      }
      const b = pick([2, 3, 4, 5]);
      const e = randInt(3, 4);
      return makeQuestion({
        topic: "evaluateIndices",
        text: `Evaluate ${pow(b, e)}.`,
        answer: b ** e,
        feedback: `${pow(b, e)} = ${expanded(b, e)} = ${b ** e}.`,
        inputMode: "math",
      });
    }
    if (level === 3) {
      const b = pick([2, 3, 5, 10]);
      const e = b === 2 ? randInt(4, 7) : b === 10 ? randInt(4, 6) : randInt(3, 4);
      return makeQuestion({
        topic: "evaluateIndices",
        text: `Evaluate ${pow(b, e)}.`,
        answer: b ** e,
        feedback: `${pow(b, e)} = ${expanded(b, e)} = ${(b ** e).toLocaleString("en-AU")}.`,
        inputMode: "math",
      });
    }
    if (level === 4) {
      const kind = pick(["zeros", "coeff"]);
      if (kind === "zeros") {
        const e = randInt(4, 9);
        return makeQuestion({
          topic: "evaluateIndices",
          text: `How many zeros does ${pow(10, e)} have when written as a whole number?`,
          answer: e,
          feedback: `${pow(10, e)} is a 1 followed by ${e} zeros.`,
          inputMode: "simple",
        });
      }
      const m = randInt(2, 9);
      const e = randInt(3, 5);
      return makeQuestion({
        topic: "evaluateIndices",
        text: `Write ${m} × ${pow(10, e)} as a whole number.`,
        answer: m * 10 ** e,
        feedback: `${m} × ${pow(10, e)} = ${m} followed by ${e} zeros: ${(m * 10 ** e).toLocaleString("en-AU")}.`,
        inputMode: "math",
      });
    }
    // Level 5: compare powers (a common misconception buster).
    const pairs = [
      [pow(2, 5), 32, pow(5, 2), 25, ">"],
      [pow(2, 6), 64, pow(6, 2), 36, ">"],
      [pow(3, 4), 81, pow(4, 3), 64, ">"],
      [pow(2, 4), 16, pow(4, 2), 16, "="],
      [pow(2, 3), 8, pow(3, 2), 9, "<"],
    ];
    const [ea, va, eb, vb, answer] = pick(pairs);
    return makeQuestion({
      topic: "evaluateIndices",
      text: `Compare the two powers:\n${ea} __ ${eb}`,
      answer,
      feedback: `${ea} = ${va} and ${eb} = ${vb}, so ${ea} ${answer} ${eb}. (Swapping base and index usually CHANGES the value.)`,
      answerMode: "comparison",
      comparisonOptions: ["<", ">", "="],
    });
  },
};

// ---- 4. Order of operations with indices ----------------------------------------------

export const orderOpsIndices = {
  id: "orderOpsIndices",
  name: "Order of Operations with Indices",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["evaluateIndices"],
  nextSkillIds: ["rootOrderOps"],

  generate(level) {
    if (level <= 2) {
      const b = randInt(2, 5);
      const e = pick([2, 3]);
      const add = randInt(2, 12);
      const plus = pick([true, false]);
      const v = b ** e;
      return makeQuestion({
        topic: "orderOpsIndices",
        text: `Evaluate ${plus ? `${pow(b, e)} + ${add}` : `${add} + ${pow(b, e)}`}.`,
        answer: v + add,
        feedback: `Indices first: ${pow(b, e)} = ${v}. Then ${plus ? `${v} + ${add}` : `${add} + ${v}`} = ${v + add}.`,
        inputMode: "math",
      });
    }

    if (level === 3) {
      // The classic contrast: a × b² vs (a × b)².
      const a = randInt(2, 5);
      const b = randInt(2, 4);
      const bracketed = pick([true, false]);
      const answer = bracketed ? (a * b) ** 2 : a * b ** 2;
      return makeQuestion({
        topic: "orderOpsIndices",
        text: `Evaluate ${bracketed ? `(${a} × ${b})${sup(2)}` : `${a} × ${b}${sup(2)}`}.`,
        answer,
        feedback: bracketed
          ? `Brackets first: ${a} × ${b} = ${a * b}, then ${pow(a * b, 2)} = ${answer}.`
          : `The index applies ONLY to ${b}: ${pow(b, 2)} = ${b * b}, then ${a} × ${b * b} = ${answer}. (Compare (${a} × ${b})${sup(2)} = ${(a * b) ** 2}.)`,
        inputMode: "math",
      });
    }

    if (level === 4) {
      const a = randInt(2, 4);
      const b = randInt(2, 4);
      const m = randInt(2, 5);
      const answer = a ** 2 * m - b ** 3;
      if (answer <= 0) return this.generate(level); // keep results positive
      return makeQuestion({
        topic: "orderOpsIndices",
        text: `Evaluate ${pow(a, 2)} × ${m} − ${pow(b, 3)}.`,
        answer,
        feedback: `Indices first: ${pow(a, 2)} = ${a * a} and ${pow(b, 3)} = ${b ** 3}. Then ${a * a} × ${m} − ${b ** 3} = ${answer}.`,
        inputMode: "math",
      });
    }

    const inner = randInt(2, 4);
    const sub = randInt(1, inner - 1);
    const e = pick([2, 3]);
    const add = randInt(2, 15);
    return makeQuestion({
      topic: "orderOpsIndices",
      text: `Evaluate (${inner + sub} − ${sub})${sup(e)} + ${add}.`,
      answer: inner ** e + add,
      feedback: `Brackets first: ${inner + sub} − ${sub} = ${inner}. Then ${pow(inner, e)} = ${inner ** e}, and ${inner ** e} + ${add} = ${inner ** e + add}.`,
      inputMode: "math",
    });
  },
};

// ---- 5. Divisibility tests (2, 3, 4, 5, 6, 10) -------------------------------------------

const DIV_RULES = {
  2: "its last digit is even",
  3: "its digit sum is divisible by 3",
  4: "its last TWO digits form a number divisible by 4",
  5: "it ends in 0 or 5",
  6: "it is divisible by BOTH 2 and 3",
  10: "it ends in 0",
};

function divisibilityReason(n, d, ok) {
  if (d === 3 || d === 6) {
    const sum = String(n).split("").reduce((t, c) => t + Number(c), 0);
    if (d === 3) return `digit sum ${sum} ${ok ? "is" : "is not"} divisible by 3`;
    return ok ? `it is even AND its digit sum ${sum} is divisible by 3` : `it fails the 2-test or the 3-test (digit sum ${sum})`;
  }
  if (d === 4) return `its last two digits form ${n % 100}, which ${ok ? "is" : "is not"} divisible by 4`;
  return `${DIV_RULES[d]} ${ok ? "✓" : "✗"}`;
}

export const divisibilityTests = {
  id: "divisibilityTests",
  name: "Divisibility Tests",
  syllabusArea: SYL,
  prerequisiteSkillIds: [],
  nextSkillIds: ["primeFactorisation"],

  generate(level) {
    if (level <= 2) {
      const d = pick(level <= 1 ? [2, 5, 10] : [2, 3, 4, 5, 10]);
      const yes = pick([true, false]);
      let n = d * randInt(15, 160);
      if (!yes) { n += d === 2 ? 1 : randInt(1, d - 1); if (n % d === 0) n += 1; }
      const ok = n % d === 0;
      return makeQuestion({
        topic: "divisibilityTests",
        text: `Is ${n} divisible by ${d}?`,
        answer: ok ? "Yes" : "No",
        feedback: `${ok ? "Yes" : "No"} — ${divisibilityReason(n, d, ok)}.`,
        answerMode: "trueFalse",
        options: ["Yes", "No"],
      });
    }

    if (level === 3) {
      const d = pick([3, 4, 6]);
      const good = d * randInt(20, 150);
      const bads = [];
      while (bads.length < 3) {
        const b = randInt(100, 900);
        if (b % d !== 0 && !bads.includes(b)) bads.push(b);
      }
      return makeQuestion({
        topic: "divisibilityTests",
        text: `Which of these numbers is divisible by ${d}?`,
        answer: String(good),
        feedback: `${good} works: ${divisibilityReason(good, d, true)}. The others fail the test.`,
        answerMode: "multipleChoice",
        options: shuffle([String(good), ...bads.map(String)]),
      });
    }

    if (level === 4) {
      const d = pick([2, 3, 4, 5, 6, 10]);
      const wrongRules = Object.entries(DIV_RULES).filter(([k]) => Number(k) !== d).map(([, v]) => v);
      return makeQuestion({
        topic: "divisibilityTests",
        text: `A whole number is divisible by ${d} when…`,
        answer: DIV_RULES[d],
        feedback: `The test for ${d}: ${DIV_RULES[d]}.`,
        answerMode: "multipleChoice",
        options: shuffle([DIV_RULES[d], ...shuffle(wrongRules).slice(0, 3)]),
      });
    }

    // Level 5: find ALL the divisors from {2, 3, 4, 5, 6, 10} (ordered list).
    const candidates = [2, 3, 4, 5, 6, 10];
    let n;
    do { n = randInt(3, 40) * 12; } while (candidates.filter((d) => n % d === 0).length < 3);
    const divs = candidates.filter((d) => n % d === 0).map(String);
    return makeQuestion({
      topic: "divisibilityTests",
      text: `Which of the numbers 2, 3, 4, 5, 6 and 10 divide exactly into ${n}?\nList them from smallest to largest, separated by commas.`,
      answer: divs.join(", "),
      feedback: `Apply each test to ${n}: the divisors are ${divs.join(", ")}.`,
      answerMode: "orderedList",
      orderedItems: divs,
    });
  },
};

// ---- 6. Prime factorisation (with factor trees) ----------------------------------------

const PF_NUMBERS = {
  easy: [12, 18, 20, 28, 45, 50],
  mid: [36, 48, 54, 60, 72, 84, 90, 96],
  hard: [108, 120, 126, 144, 180, 216, 240, 360],
};

export const primeFactorisation = {
  id: "primeFactorisation",
  name: "Prime Factorisation",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["divisibilityTests", "indexNotation"],
  nextSkillIds: [],

  generate(level) {
    if (level <= 1) {
      // Readiness: spot the prime.
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
      const p = pick(primes);
      const comps = [];
      while (comps.length < 3) {
        const c = randInt(4, 40);
        if (!isPrime(c) && !comps.includes(c)) comps.push(c);
      }
      return makeQuestion({
        topic: "primeFactorisation",
        text: `Which of these is a PRIME number?`,
        answer: String(p),
        feedback: `${p} has exactly two factors (1 and ${p}) — that's what makes it prime. The others have more factors.`,
        answerMode: "multipleChoice",
        options: shuffle([String(p), ...comps.map(String)]),
      });
    }

    // Levels 2–3: factor tree scaffold; write the product of primes.
    if (level <= 3) {
      const n = pick(level === 2 ? PF_NUMBERS.easy : PF_NUMBERS.mid);
      return structQ({
        topic: "primeFactorisation",
        text: `${level === 2 ? "Use the factor tree to write" : "Complete the factor tree, then write"} ${n} as a product of its prime factors, in index notation.`,
        answer: primeIndexText(n),
        feedback: `Splitting off prime factors gives ${n} = ${primeIndexText(n)}.`,
        diagramType: "factorTree",
        diagramData: { number: n, hideLeaves: level === 3 },
      }, primeProductCheck(n));
    }

    if (level === 4) {
      const n = pick(PF_NUMBERS.hard);
      return structQ({
        topic: "primeFactorisation",
        text: `Write ${n} as a product of its prime factors, in index notation.`,
        answer: primeIndexText(n),
        feedback: `Divide by primes until every factor is prime: ${n} = ${primeIndexText(n)}.`,
      }, primeProductCheck(n));
    }

    // Level 5: reverse — evaluate a prime-power product.
    const b1 = pick([2, 3]);
    const b2 = b1 === 2 ? pick([3, 5]) : 5;
    const e1 = randInt(2, 3);
    const e2 = randInt(1, 2);
    const n = b1 ** e1 * b2 ** e2;
    return makeQuestion({
      topic: "primeFactorisation",
      text: `A number is ${pow(b1, e1)} × ${e2 === 1 ? b2 : pow(b2, e2)}.\nWhat is the number?`,
      answer: n,
      feedback: `${pow(b1, e1)} = ${b1 ** e1} and ${e2 === 1 ? b2 : pow(b2, e2)} = ${b2 ** e2}: the number is ${b1 ** e1} × ${b2 ** e2} = ${n}.`,
      inputMode: "math",
    });
  },
};

// ---- 7. Square & cube roots (notation + relationship) --------------------------------------

export const rootNotation = {
  id: "rootNotation",
  name: "Square & Cube Roots",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["evaluateIndices"],
  nextSkillIds: ["rootProperty", "estimateRoots"],

  generate(level) {
    if (level <= 2) {
      const square = pick(SQUARES.slice(0, level <= 1 ? 8 : SQUARES.length));
      const r = Math.sqrt(square);
      return makeQuestion({
        topic: "rootNotation",
        text: `Evaluate √${square}.`,
        answer: r,
        feedback: `${pow(r, 2)} = ${square}, so √${square} = ${r} — squaring and square-rooting undo each other.`,
        inputMode: "math",
      });
    }
    if (level === 3) {
      const cube = pick(CUBES);
      const r = Math.round(Math.cbrt(cube));
      return makeQuestion({
        topic: "rootNotation",
        text: `Evaluate ∛${cube}.`,
        answer: r,
        feedback: `${pow(r, 3)} = ${cube}, so ∛${cube} = ${r} — cubing and cube-rooting undo each other.`,
        inputMode: "math",
      });
    }
    if (level === 4) {
      // The relationship, stated both ways.
      const r = randInt(2, 15);
      const useSquare = pick([true, false]);
      const claimTrue = pick([true, false]);
      const shown = claimTrue ? r : r + pick([-1, 1]);
      const claim = useSquare
        ? `Because ${pow(r, 2)} = ${r * r}, √${r * r} = ${shown}`
        : `Because ${pow(r, 3)} = ${r ** 3}, ∛${r ** 3} = ${shown}`;
      return makeQuestion({
        topic: "rootNotation",
        text: `True or false:\n${claim}.`,
        answer: claimTrue ? "True" : "False",
        feedback: claimTrue
          ? `True — the root undoes the ${useSquare ? "square" : "cube"}, giving back ${r}.`
          : `False — the root undoes the ${useSquare ? "square" : "cube"}, so the answer is ${r}, not ${shown}.`,
        answerMode: "trueFalse",
        options: ["True", "False"],
      });
    }
    // Level 5: both roots in one question (multiPart).
    const square = pick(SQUARES.slice(4));
    const cube = pick(CUBES);
    return makeQuestion({
      topic: "rootNotation",
      text: `Evaluate both roots.`,
      answer: `${Math.sqrt(square)}, ${Math.round(Math.cbrt(cube))}`,
      feedback: `√${square} = ${Math.sqrt(square)} (since ${pow(Math.sqrt(square), 2)} = ${square}) and ∛${cube} = ${Math.round(Math.cbrt(cube))} (since ${pow(Math.round(Math.cbrt(cube)), 3)} = ${cube}).`,
      answerMode: "multiPart",
      expectedParts: [
        { label: "(a)", prompt: `√${square}`, answer: String(Math.sqrt(square)) },
        { label: "(b)", prompt: `∛${cube}`, answer: String(Math.round(Math.cbrt(cube))) },
      ],
    });
  },
};

// ---- 8. The root product property: √(ab) = √a × √b ---------------------------------------------

export const rootProperty = {
  id: "rootProperty",
  name: "√(ab) = √a × √b",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["rootNotation"],
  nextSkillIds: [],

  generate(level) {
    const a = pick([4, 9, 16, 25]);
    const b = pick([4, 9, 16, 25, 36].filter((x) => x !== a));

    if (level <= 2) {
      // True/False on the property (teacher style): evaluate both sides to
      // decide. False variants use the classic + misconception.
      const variant = pick(["timesTrue", "timesTrue", "plusFalse", "mixedFalse"]);
      const ra = Math.sqrt(a), rb = Math.sqrt(b);
      let claim, answer, why;
      if (variant === "timesTrue") {
        claim = `√(${a} × ${b}) = √${a} × √${b}`;
        answer = "True";
        why = `both sides equal ${ra * rb}: √${a * b} = ${ra * rb}, and ${ra} × ${rb} = ${ra * rb}`;
      } else if (variant === "plusFalse") {
        claim = `√(${a} + ${b}) = √${a} + √${b}`;
        answer = "False";
        why = `√${a + b} ≈ ${Math.round(Math.sqrt(a + b) * 100) / 100}, but √${a} + √${b} = ${ra + rb} — roots only split over MULTIPLICATION`;
      } else {
        claim = `√(${a} × ${b}) = √${a} + √${b}`;
        answer = "False";
        why = `√${a * b} = ${ra * rb}, but √${a} + √${b} = ${ra + rb} — the property is √(ab) = √a × √b, with ×`;
      }
      return makeQuestion({
        topic: "rootProperty",
        text: `True or false:\n${claim}`,
        answer,
        feedback: `${answer} — ${why}.`,
        answerMode: "trueFalse",
        options: ["True", "False"],
      });
    }

    if (level === 3) {
      // Use the property to evaluate a big root.
      return makeQuestion({
        topic: "rootProperty",
        text: `Use √(ab) = √a × √b to evaluate √${a * b}.\n(Hint: ${a * b} = ${a} × ${b}.)`,
        answer: Math.sqrt(a) * Math.sqrt(b),
        feedback: `√${a * b} = √${a} × √${b} = ${Math.sqrt(a)} × ${Math.sqrt(b)} = ${Math.sqrt(a) * Math.sqrt(b)}.`,
        inputMode: "math",
      });
    }

    if (level === 4) {
      // Simplify a surd with it: √(k²·m) = k√m.
      const k = pick([2, 3, 4, 5]);
      const m = pick([2, 3, 5, 6, 7, 10]);
      return structQ({
        topic: "rootProperty",
        text: `Use √(ab) = √a × √b to write √${k * k * m} in the form k√m.`,
        answer: `${k}√${m}`,
        feedback: `√${k * k * m} = √(${k * k} × ${m}) = √${k * k} × √${m} = ${k}√${m}.`,
      }, surdCheck(k, m));
    }

    // Level 5: the misconception buster — the property does NOT work for +.
    const claimTrue = pick([true, false]);
    if (claimTrue) {
      return makeQuestion({
        topic: "rootProperty",
        text: `True or false:\n√(${a} × ${b}) = √${a} × √${b}.`,
        answer: "True",
        feedback: `True — roots split over MULTIPLICATION: both sides equal ${Math.sqrt(a * b)}.`,
        answerMode: "trueFalse",
        options: ["True", "False"],
      });
    }
    return makeQuestion({
      topic: "rootProperty",
      text: `True or false:\n√(${a} + ${b}) = √${a} + √${b}.`,
      answer: "False",
      feedback: `False — roots do NOT split over addition: √${a + b} ≈ ${Math.round(Math.sqrt(a + b) * 100) / 100}, but √${a} + √${b} = ${Math.sqrt(a) + Math.sqrt(b)}. The property only works for multiplication.`,
      answerMode: "trueFalse",
      options: ["True", "False"],
    });
  },
};

// ---- 9. Estimating roots + exact vs approximate ------------------------------------------------

export const estimateRoots = {
  id: "estimateRoots",
  name: "Estimating Roots",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["rootNotation"],
  nextSkillIds: [],

  generate(level) {
    if (level <= 2) {
      // Between which two whole numbers? (squares at L1, cubes join at L2)
      const cubeMode = level >= 2 && pick([true, false]);
      let n, lower;
      if (cubeMode) {
        do { n = randInt(10, 320); } while (Number.isInteger(Math.cbrt(n)));
        lower = Math.floor(Math.cbrt(n));
      } else {
        do { n = randInt(10, 180); } while (Number.isInteger(Math.sqrt(n)));
        lower = Math.floor(Math.sqrt(n));
      }
      const rootSym = cubeMode ? `∛${n}` : `√${n}`;
      const powWord = cubeMode ? 3 : 2;
      return makeQuestion({
        topic: "estimateRoots",
        text: `${rootSym} lies between two consecutive whole numbers.\nFind them.`,
        answer: `${lower}, ${lower + 1}`,
        feedback: `${pow(lower, powWord)} = ${lower ** powWord} and ${pow(lower + 1, powWord)} = ${(lower + 1) ** powWord}, so ${rootSym} is between ${lower} and ${lower + 1}.`,
        answerMode: "multiPart",
        expectedParts: [
          { label: "(a)", prompt: "Smaller whole number", answer: String(lower) },
          { label: "(b)", prompt: "Larger whole number", answer: String(lower + 1) },
        ],
      });
    }

    if (level <= 4) {
      // Decimal estimate to 1 dp (then "check with a calculator").
      const cubeMode = level >= 4 && pick([true, false]);
      let n, exact;
      if (cubeMode) {
        do { n = randInt(10, 400); } while (Number.isInteger(Math.cbrt(n)));
        exact = Math.cbrt(n);
      } else {
        do { n = randInt(10, 200); } while (Number.isInteger(Math.sqrt(n)));
        exact = Math.sqrt(n);
      }
      const q = makeQuestion({
        topic: "estimateRoots",
        text: `Estimate ${cubeMode ? `∛${n}` : `√${n}`} correct to 1 decimal place.\n(Check your estimate with a calculator.)`,
        answer: (Math.round(exact * 10) / 10).toFixed(1),
        feedback: `${cubeMode ? `∛${n}` : `√${n}`} ≈ ${(Math.round(exact * 10) / 10).toFixed(1)} — an APPROXIMATE value; the exact value is the root itself.`,
        inputMode: "math",
      });
      q.check = approxCheck(exact);
      return q;
    }

    // Level 5: exact vs approximate.
    const k = pick([2, 3, 5]);
    const m = pick([2, 3, 5, 7, 10]);
    const n = k * k * m;
    const dec = Math.sqrt(n);
    const kind = pick(["chooseExact", "classify"]);
    if (kind === "chooseExact") {
      return makeQuestion({
        topic: "estimateRoots",
        text: `Which of these is an EXACT value of √${n}?`,
        answer: `${k}√${m}`,
        feedback: `${k}√${m} keeps the root — that's exact. The decimals are rounded, so they're approximations of ${k}√${m} ≈ ${Math.round(dec * 1000) / 1000}….`,
        answerMode: "multipleChoice",
        options: shuffle([
          `${k}√${m}`,
          `${(Math.round(dec * 10) / 10).toFixed(1)}`,
          `${(Math.round(dec * 100) / 100).toFixed(2)}`,
          `${Math.round(dec)}`,
        ]),
      });
    }
    const exactCase = pick([true, false]);
    const sq = pick(SQUARES);
    return makeQuestion({
      topic: "estimateRoots",
      text: exactCase
        ? `Is the value of √${sq} exact or approximate when written as ${Math.sqrt(sq)}?`
        : `Is the value of √${n} exact or approximate when written as ${(Math.round(dec * 100) / 100).toFixed(2)}?`,
      answer: exactCase ? "Exact" : "Approximate",
      feedback: exactCase
        ? `Exact — ${sq} is a perfect square, so √${sq} is exactly ${Math.sqrt(sq)}.`
        : `Approximate — ${n} is not a perfect square, so any decimal is rounded. The exact value is ${k}√${m}.`,
      answerMode: "multipleChoice",
      options: ["Exact", "Approximate"],
    });
  },
};

// ---- 10. Order of operations with roots ------------------------------------------------------------

export const rootOrderOps = {
  id: "rootOrderOps",
  name: "Order of Operations with Roots",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["rootNotation", "orderOpsIndices"],
  nextSkillIds: [],

  generate(level) {
    const sq = pick(SQUARES.slice(0, 9));
    const rs = Math.sqrt(sq);

    if (level <= 2) {
      const add = randInt(2, 12);
      return makeQuestion({
        topic: "rootOrderOps",
        text: `Evaluate √${sq} + ${add}.`,
        answer: rs + add,
        feedback: `Roots first: √${sq} = ${rs}. Then ${rs} + ${add} = ${rs + add}.`,
        inputMode: "math",
      });
    }
    if (level === 3) {
      const cube = pick(CUBES.slice(0, 5));
      const rc = Math.round(Math.cbrt(cube));
      const m = randInt(2, 6);
      return makeQuestion({
        topic: "rootOrderOps",
        text: `Evaluate √${sq} + ∛${cube} × ${m}.`,
        answer: rs + rc * m,
        feedback: `Roots first: √${sq} = ${rs}, ∛${cube} = ${rc}. Multiplication before addition: ${rc} × ${m} = ${rc * m}, then ${rs} + ${rc * m} = ${rs + rc * m}.`,
        inputMode: "math",
      });
    }
    if (level === 4) {
      const b = randInt(2, 5);
      const answer = rs * b ** 2;
      return makeQuestion({
        topic: "rootOrderOps",
        text: `Evaluate √${sq} × ${pow(b, 2)}.`,
        answer,
        feedback: `√${sq} = ${rs} and ${pow(b, 2)} = ${b * b}: ${rs} × ${b * b} = ${answer}.`,
        inputMode: "math",
      });
    }
    // Level 5: root OF an expression (brackets under the radical first).
    const a = pick([9, 16, 25, 36]);
    const b = pick([16, 25, 36, 49, 64].filter((x) => x !== a));
    const sum = a + b;
    if (Number.isInteger(Math.sqrt(sum))) {
      return makeQuestion({
        topic: "rootOrderOps",
        text: `Evaluate √(${a} + ${b}).`,
        answer: Math.sqrt(sum),
        feedback: `Work UNDER the radical first: ${a} + ${b} = ${sum}, then √${sum} = ${Math.sqrt(sum)}. (Not √${a} + √${b} = ${Math.sqrt(a) + Math.sqrt(b)}!)`,
        inputMode: "math",
      });
    }
    const cube = pick(CUBES.slice(0, 5));
    const rc = Math.round(Math.cbrt(cube));
    return makeQuestion({
      topic: "rootOrderOps",
      text: `Evaluate ${pow(rs, 2)} − ∛${cube}.`,
      answer: sq - rc,
      feedback: `${pow(rs, 2)} = ${sq} and ∛${cube} = ${rc}: ${sq} − ${rc} = ${sq - rc}.`,
      inputMode: "math",
    });
  },
};

// ---- 11–13. The index laws (numerical bases) ------------------------------------------------------

export const indexLawsMultiply = {
  id: "indexLawsMultiply",
  name: "Index Law: Multiplying",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["indexNotation"],
  nextSkillIds: ["indexLawsDivide"],

  generate(level) {
    const base = pick(level <= 2 ? [2, 3, 5] : [2, 3, 4, 5, 6, 7, 10]);
    const a = randInt(2, level <= 2 ? 4 : 6);
    const b = randInt(2, level <= 2 ? 4 : 6);

    if (level <= 1) {
      // ESTABLISH the law from expanded form (multiple choice).
      return makeQuestion({
        topic: "indexLawsMultiply",
        text: `${pow(base, a)} × ${pow(base, b)} = (${expanded(base, a)}) × (${expanded(base, b)}).\nHow many ${base}s are multiplied together in total?`,
        answer: a + b,
        feedback: `${a} of them, then ${b} more: ${a} + ${b} = ${a + b}. That's the law — ADD the indices: ${pow(base, a)} × ${pow(base, b)} = ${pow(base, a + b)}.`,
        inputMode: "simple",
      });
    }

    if (level >= 4) {
      const c = randInt(2, 4);
      if (level >= 5 && pick([true, false])) {
        // Implicit power of 1.
        return structQ({
          topic: "indexLawsMultiply",
          text: `Simplify ${pow(base, a)} × ${base}, giving your answer in index form.`,
          answer: pow(base, a + 1),
          feedback: `${base} is ${pow(base, 1)}: add the indices, ${a} + 1 = ${a + 1}, so ${pow(base, a + 1)}.`,
        }, powerCheck(base, a + 1));
      }
      return structQ({
        topic: "indexLawsMultiply",
        text: `Simplify ${pow(base, a)} × ${pow(base, b)} × ${pow(base, c)}, giving your answer in index form.`,
        answer: pow(base, a + b + c),
        feedback: `Add ALL the indices: ${a} + ${b} + ${c} = ${a + b + c}, so ${pow(base, a + b + c)}.`,
      }, powerCheck(base, a + b + c));
    }

    return structQ({
      topic: "indexLawsMultiply",
      text: `Simplify ${pow(base, a)} × ${pow(base, b)}, giving your answer in index form.`,
      answer: pow(base, a + b),
      feedback: `Same base — ADD the indices: ${a} + ${b} = ${a + b}, so ${pow(base, a + b)}.`,
    }, powerCheck(base, a + b));
  },
};

export const indexLawsDivide = {
  id: "indexLawsDivide",
  name: "Index Law: Dividing",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["indexLawsMultiply"],
  nextSkillIds: ["zeroIndex"],

  generate(level) {
    const base = pick(level <= 2 ? [2, 3, 5] : [2, 3, 4, 5, 6, 7, 10]);
    const b = randInt(2, level <= 2 ? 4 : 5);
    const a = b + randInt(level <= 2 ? 2 : 1, 5);

    if (level <= 1) {
      return makeQuestion({
        topic: "indexLawsDivide",
        text: `${pow(base, a)} ÷ ${pow(base, b)} = (${expanded(base, a)}) ÷ (${expanded(base, b)}).\nAfter cancelling, how many ${base}s remain?`,
        answer: a - b,
        feedback: `${b} of the ${a} cancel, leaving ${a - b}. That's the law — SUBTRACT the indices: ${pow(base, a)} ÷ ${pow(base, b)} = ${pow(base, a - b)}.`,
        inputMode: "simple",
      });
    }

    if (level >= 4) {
      const c = randInt(1, 3);
      const total = a + c;
      if (level >= 5 && pick([true, false])) {
        // Mixed × and ÷.
        return structQ({
          topic: "indexLawsDivide",
          text: `Simplify ${pow(base, a)} × ${pow(base, c)} ÷ ${pow(base, b)}, giving your answer in index form.`,
          answer: pow(base, total - b),
          feedback: `Add when multiplying, subtract when dividing: ${a} + ${c} − ${b} = ${total - b}, so ${pow(base, total - b)}.`,
        }, powerCheck(base, total - b));
      }
      // Result with index 1.
      return structQ({
        topic: "indexLawsDivide",
        text: `Simplify ${pow(base, b + 1)} ÷ ${pow(base, b)}.`,
        answer: String(base),
        feedback: `Subtract the indices: ${b + 1} − ${b} = 1, so the answer is ${pow(base, 1)} = ${base}.`,
      }, (input) => {
        const map = parsePowerProduct(input);
        if (!map) return false;
        const keys = Object.keys(map);
        return keys.length === 1 && Number(keys[0]) === base && map[base] === 1;
      });
    }

    return structQ({
      topic: "indexLawsDivide",
      text: `Simplify ${pow(base, a)} ÷ ${pow(base, b)}, giving your answer in index form.`,
      answer: pow(base, a - b),
      feedback: `Same base — SUBTRACT the indices: ${a} − ${b} = ${a - b}, so ${pow(base, a - b)}.`,
    }, powerCheck(base, a - b));
  },
};

export const indexLawsPower = {
  id: "indexLawsPower",
  name: "Index Law: Power of a Power",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["indexLawsMultiply"],
  nextSkillIds: ["zeroIndex"],

  generate(level) {
    const base = pick(level <= 2 ? [2, 3, 5] : [2, 3, 4, 5, 6, 10]);
    const a = randInt(2, level <= 2 ? 3 : 4);
    const b = randInt(2, level <= 2 ? 3 : 4);

    if (level <= 1) {
      return makeQuestion({
        topic: "indexLawsPower",
        text: `(${pow(base, a)})${sup(b)} means ${pow(base, a)} used ${b} times: ${Array(b).fill(pow(base, a)).join(" × ")}.\nHow many ${base}s is that in total?`,
        answer: a * b,
        feedback: `${b} groups of ${a}: ${a} × ${b} = ${a * b}. That's the law — MULTIPLY the indices: (${pow(base, a)})${sup(b)} = ${pow(base, a * b)}.`,
        inputMode: "simple",
      });
    }

    if (level === 3) {
      // True/False on (ab)² = a²b² (its own content statement; teacher style).
      const x = randInt(2, 5);
      let y;
      do { y = randInt(2, 6); } while (y === x);
      const isTrue = pick([true, true, false]);
      const claim = isTrue
        ? `(${x} × ${y})${sup(2)} = ${pow(x, 2)} × ${pow(y, 2)}`
        : `(${x} × ${y})${sup(2)} = ${pow(x, 2)} × ${y}`;
      return makeQuestion({
        topic: "indexLawsPower",
        text: `True or false:\n${claim}`,
        answer: isTrue ? "True" : "False",
        feedback: isTrue
          ? `True — (${x} × ${y})${sup(2)} = ${pow(x * y, 2)} = ${(x * y) ** 2}, and ${pow(x, 2)} × ${pow(y, 2)} = ${x * x} × ${y * y} = ${x * x * y * y}. The square applies to BOTH factors.`
          : `False — the square applies to BOTH factors: (${x} × ${y})${sup(2)} = ${pow(x, 2)} × ${pow(y, 2)} = ${(x * y) ** 2}, but ${pow(x, 2)} × ${y} = ${x * x * y}.`,
        answerMode: "trueFalse",
        options: ["True", "False"],
      });
    }

    if (level >= 4) {
      if (level >= 5 && pick([true, false])) {
        const c = randInt(2, 3);
        return structQ({
          topic: "indexLawsPower",
          text: `Simplify (${pow(base, a)})${sup(b)} × ${pow(base, c)}, giving your answer in index form.`,
          answer: pow(base, a * b + c),
          feedback: `Power of a power first: (${pow(base, a)})${sup(b)} = ${pow(base, a * b)}. Then add: ${a * b} + ${c} = ${a * b + c}, so ${pow(base, a * b + c)}.`,
        }, powerCheck(base, a * b + c));
      }
      const x = randInt(2, 5);
      let y;
      do { y = randInt(2, 6); } while (y === x);
      return makeQuestion({
        topic: "indexLawsPower",
        text: `True or false:\n(${x} + ${y})${sup(2)} = ${pow(x, 2)} + ${pow(y, 2)}.`,
        answer: "False",
        feedback: `False — the square splits over MULTIPLICATION, not addition: (${x} + ${y})${sup(2)} = ${pow(x + y, 2)} = ${(x + y) ** 2}, but ${pow(x, 2)} + ${pow(y, 2)} = ${x * x + y * y}.`,
        answerMode: "trueFalse",
        options: ["True", "False"],
      });
    }

    return structQ({
      topic: "indexLawsPower",
      text: `Simplify (${pow(base, a)})${sup(b)}, giving your answer in index form.`,
      answer: pow(base, a * b),
      feedback: `Power of a power — MULTIPLY the indices: ${a} × ${b} = ${a * b}, so ${pow(base, a * b)}.`,
    }, powerCheck(base, a * b));
  },
};

// ---- 14. The zero index -----------------------------------------------------------------------------

export const zeroIndex = {
  id: "zeroIndex",
  name: "The Zero Index",
  syllabusArea: SYL,
  prerequisiteSkillIds: ["indexLawsDivide"],
  nextSkillIds: [],

  generate(level) {
    const base = randInt(2, 12);

    if (level <= 2) {
      return makeQuestion({
        topic: "zeroIndex",
        text: `Evaluate ${pow(base, 0)}.`,
        answer: 1,
        feedback: `Any non-zero number to the power of 0 equals 1: ${pow(base, 0)} = 1.`,
        inputMode: "math",
      });
    }

    if (level === 3) {
      // WHY a⁰ = 1: via the division law.
      const e = randInt(2, 5);
      return makeQuestion({
        topic: "zeroIndex",
        text: `${pow(base, e)} ÷ ${pow(base, e)} = ${pow(base, 0)} by the division law — but any number divided by itself is 1.\nWhat does this show ${pow(base, 0)} must equal?`,
        answer: 1,
        feedback: `Both results describe the same division, so ${pow(base, 0)} = 1. That's WHY the zero index gives 1.`,
        inputMode: "simple",
      });
    }

    if (level === 4) {
      const b2 = randInt(2, 5);
      const answer = 1 + b2 ** 2;
      return makeQuestion({
        topic: "zeroIndex",
        text: `Evaluate ${pow(base, 0)} + ${pow(b2, 2)}.`,
        answer,
        feedback: `${pow(base, 0)} = 1 and ${pow(b2, 2)} = ${b2 ** 2}: 1 + ${b2 ** 2} = ${answer}.`,
        inputMode: "math",
      });
    }

    // Level 5: the classic trap — (m × n)⁰ vs m × n⁰ (sides swap randomly so
    // the correct symbol isn't always the same one).
    const m = randInt(2, 6);
    const n = randInt(2, 9);
    const bracketFirst = pick([true, false]);
    const lhs = bracketFirst ? `(${m} × ${n})${sup(0)}` : `${m} × ${pow(n, 0)}`;
    const rhs = bracketFirst ? `${m} × ${pow(n, 0)}` : `(${m} × ${n})${sup(0)}`;
    return makeQuestion({
      topic: "zeroIndex",
      text: `Compare:\n${lhs} __ ${rhs}`,
      answer: bracketFirst ? "<" : ">",
      feedback: `(${m} × ${n})${sup(0)} = 1 (the WHOLE product is raised to 0), but ${m} × ${pow(n, 0)} = ${m} × 1 = ${m} (only ${n} is raised to 0). So ${lhs} ${bracketFirst ? "<" : ">"} ${rhs}.`,
      answerMode: "comparison",
      comparisonOptions: ["<", ">", "="],
    });
  },
};

// The full ordered skill list — the ORDER is the conceptual progression.
export const INDICES_SKILLS_LIST = [
  indexTerminology,
  indexNotation,
  evaluateIndices,
  orderOpsIndices,
  divisibilityTests,
  primeFactorisation,
  rootNotation,
  rootProperty,
  estimateRoots,
  rootOrderOps,
  indexLawsMultiply,
  indexLawsDivide,
  indexLawsPower,
  zeroIndex,
];

export default INDICES_SKILLS_LIST;

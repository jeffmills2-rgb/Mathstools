import { pick, makeQuestion } from "../../../helpers.js";

/**
 * STAGE 5 · Surds · Simplify Surds (sample skill).
 *
 * Surd answers are structured notation → MATH input. The numeric matcher
 * accepts equivalent forms (e.g. the simplified "2sqrt(2)" or the original
 * "sqrt(8)"), because both evaluate to the same number.
 */

// radicand -> { simplified display, factor m, remainder r } for √(m²·r).
const SURDS = {
  8: { m: 2, r: 2 },
  12: { m: 2, r: 3 },
  18: { m: 3, r: 2 },
  20: { m: 2, r: 5 },
  27: { m: 3, r: 3 },
  32: { m: 4, r: 2 },
  48: { m: 4, r: 3 },
  50: { m: 5, r: 2 },
  72: { m: 6, r: 2 },
};

export const simplifySurds = {
  id: "simplifySurds",
  name: "Simplify Surds",
  syllabusArea: "MA5-IND-02",
  prerequisiteSkillIds: ["indexLaws"],
  nextSkillIds: [],

  generate(level) {
    // Pick a larger radicand at higher levels.
    const radicands = Object.keys(SURDS).map(Number);
    const pool = level <= 2 ? radicands.slice(0, 4) : radicands;
    const k = pick(pool);
    const { m, r } = SURDS[k];
    const answer = `${m}sqrt(${r})`;

    return makeQuestion({
      topic: "simplifySurds",
      text: `Simplify √${k} (use the √ button; write as m√r).`,
      answer,
      acceptableAnswers: [answer, `sqrt(${k})`],
      feedback: `√${k} = √(${m * m}×${r}) = ${m}√${r}.`,
      inputMode: "math",
    });
  },
};

export default simplifySurds;

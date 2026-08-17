import { INTEGER_SKILLS } from "./integers/integerSkills.js";
import { FDP_SKILLS_LIST } from "./fractionsDecimalsPercentages/fdpSkills.js";
import { ALGEBRA_SKILLS_LIST } from "./algebra/algebraSkills.js";
import { rectangleArea } from "./area/rectangleArea.js";
import { triangleArea } from "./area/triangleArea.js";
import { compositeArea } from "./area/compositeArea.js";
import { PYTHAGORAS_SKILLS_LIST } from "./pythagoras/pythagorasSkills.js";
import { RATIO_SKILLS_LIST } from "./ratio/ratioSkills.js";
import { LENGTH_SKILLS_LIST } from "./length/lengthSkills.js";
import { EQUATIONS_SKILLS_LIST } from "./equations/equationsSkills.js";
import { INDICES_SKILLS_LIST } from "./indices/indicesSkills.js";
import { LINEAR_SKILLS_LIST } from "./linear/linearSkills.js";
import { PROBABILITY_SKILLS_LIST } from "./probability/probabilitySkills.js";
import { ANGLES_SKILLS_LIST } from "./angles/anglesSkills.js";
import { GEOMETRY_SKILLS_LIST } from "./geometry/geometrySkills.js";
import { DATA_SKILLS_LIST } from "./data/dataSkills.js";

/**
 * STAGE 4 curriculum tree (sample).
 *
 * The three world NPCs map to the first three topics here:
 *   Pip  → integers   Fern → fdp   Alby → algebra
 * (Folders for geometry/ and measurement/ are reserved for future content.)
 *
 * Phase 2E adds a small, diagram-based "Area" topic as a proof of concept. It
 * is NOT attached to any world NPC — the three NPCs above are unchanged — but
 * it can be selected in a teacher mission and tested from the DevPanel.
 */
export const STAGE4 = {
  id: "stage4",
  name: "Stage 4",
  topics: [
    {
      // Phase 2F: now powered by the REAL legacy Integers question bank via the
      // integers adapter (Pip uses these automatically — same topic id).
      id: "integers",
      name: "Integers",
      skills: INTEGER_SKILLS,
    },
    {
      // Phase 2F: now powered by the REAL legacy FDP question bank via the FDP
      // adapter (Fern uses these automatically — same topic id).
      id: "fdp",
      name: "Fractions, Decimals & Percentages",
      skills: FDP_SKILLS_LIST,
    },
    {
      // Phase 2F Slice 3: now powered by the REAL legacy Algebraic Techniques
      // bank via the algebra adapter (Alby uses these — same topic id).
      id: "algebra",
      name: "Algebraic Techniques",
      skills: ALGEBRA_SKILLS_LIST,
    },
    {
      id: "area",
      name: "Area",
      skills: [rectangleArea, triangleArea, compositeArea],
    },
    {
      // Phase 2N: real legacy Pythagoras bank via the pythagoras adapter. Not
      // attached to a world NPC — selectable in the Mission Builder / DevPanel.
      id: "pythagoras",
      name: "Pythagoras",
      skills: PYTHAGORAS_SKILLS_LIST,
    },
    {
      // Phase 3A: NATIVE Ratios & Rates topic (question-bank expansion). Not
      // attached to a world NPC — selectable in the Mission Builder / DevPanel
      // and teacher-assignable (mirrored in the website adventureManifest.js).
      id: "ratio",
      name: "Ratios & Rates",
      skills: RATIO_SKILLS_LIST,
    },
    {
      // Phase 3B: NATIVE, diagram-heavy Length topic (NESA Length statements).
      // Not attached to a world NPC — Mission Builder / DevPanel / teacher tasks.
      id: "length",
      name: "Length",
      skills: LENGTH_SKILLS_LIST,
    },
    {
      // Phase 3C: NATIVE Equations topic (full NESA statement coverage,
      // linear through quadratic). Mission Builder / DevPanel / teacher tasks.
      id: "equations",
      name: "Equations",
      skills: EQUATIONS_SKILLS_LIST,
    },
    {
      // Phase 3D: NATIVE Probability topic (theoretical + observed/simulation
      // + complementary events). Mission Builder / DevPanel / teacher tasks.
      id: "probability",
      name: "Probability",
      skills: PROBABILITY_SKILLS_LIST,
    },
    {
      // Phase 3E: NATIVE Indices topic (full NESA coverage — notation, primes,
      // roots, index laws). Mission Builder / DevPanel / teacher tasks.
      id: "indices",
      name: "Indices",
      skills: INDICES_SKILLS_LIST,
    },
    {
      // Phase 3F: NATIVE Linear Relationships topic (Cartesian plane, patterns,
      // five representations, graphical solving). Mission Builder / teacher tasks.
      id: "linear",
      name: "Linear Relationships",
      skills: LINEAR_SKILLS_LIST,
    },
    {
      // Phase 3G: NATIVE Angle Relationships topic (geometry language &
      // conventions, angles at a point, the transversal family with naming +
      // reasons + reverse justification, a true difference-of-readings
      // protractor, multi-step reasoning). Mission Builder / teacher tasks.
      id: "angles",
      name: "Angle Relationships",
      skills: ANGLES_SKILLS_LIST,
    },
    {
      // Phase 3H: NATIVE Properties of Geometrical Figures topic (triangles &
      // quadrilaterals — naming, classification, properties, convexity, the
      // classification hierarchy, angle sums, the three proofs, and unknown
      // side/angle problems). Mission Builder / DevPanel / teacher tasks.
      id: "geometry",
      name: "Properties of Geometrical Figures",
      skills: GEOMETRY_SKILLS_LIST,
    },
    {
      // Phase 3I: NATIVE Data Classification & Visualisation topic (classify
      // variables; read/construct/choose/interpret graphs across every syllabus
      // chart type; misleading graphs; infographics). Mission Builder / tasks.
      id: "data",
      name: "Data Classification & Visualisation",
      skills: DATA_SKILLS_LIST,
    },
  ],
};

export default STAGE4;

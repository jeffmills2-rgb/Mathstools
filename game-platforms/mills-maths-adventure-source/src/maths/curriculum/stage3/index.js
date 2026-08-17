import { wholeNumberOps } from "./number/wholeNumberOps.js";
import { addSubTo20 } from "./number/addSubTo20.js";
import { multFacts } from "./number/multFacts.js";
import { divFacts } from "./number/divFacts.js";

/**
 * STAGE 3 curriculum tree (sample).
 *
 * A stage is: { id, name, topics: [ { id, name, skills: [skill, ...] } ] }.
 * Only topics/skills with a working generator are listed here. The folder
 * layout (number/, fractionsDecimalsPercentages/, measurement/, geometry/)
 * shows where future content goes; add a skill file, import it, and list it.
 */
export const STAGE3 = {
  id: "stage3",
  name: "Stage 3",
  topics: [
    {
      id: "number",
      name: "Number",
      skills: [wholeNumberOps],
    },
    {
      // Number Facts — the foundational fact-fluency skills used as the ACCESSIBLE
      // DEFAULTS for characters with no teacher task (sandbox model, W1). A student
      // can always answer these, so free-play never gets stuck.
      id: "number-facts",
      name: "Number Facts",
      skills: [addSubTo20, multFacts, divFacts],
    },
  ],
};

export default STAGE3;

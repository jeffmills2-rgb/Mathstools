import { indexLaws } from "./indices/indexLaws.js";
import { simplifySurds } from "./surds/simplifySurds.js";

/**
 * STAGE 5 curriculum tree (sample).
 *
 * Folders for algebra/, linearRelationships/, pythagoras/ and trigonometry/
 * are reserved for future content.
 */
export const STAGE5 = {
  id: "stage5",
  name: "Stage 5",
  topics: [
    {
      id: "indices",
      name: "Indices",
      skills: [indexLaws],
    },
    {
      id: "surds",
      name: "Surds",
      skills: [simplifySurds],
    },
  ],
};

export default STAGE5;

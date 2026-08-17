import React from "react";

import { useSession } from "../game/sessionStore.js";
import { useUI } from "./effects/uiStore.js";
import { getInteractable } from "../data/interactables.js";
import { useFarmChallengeActive } from "../game/farmChallengeActive.js";

/**
 * The "Press E" prompt shown when the player is near an interactable and no
 * encounter is currently open. Hidden in touch mode, where the tap-to-approach
 * "Interact with X?" confirm (W4-C) replaces it.
 */
export default function InteractionPrompt() {
  const nearbyId = useSession((s) => s.nearbyId);
  const activeEncounterId = useSession((s) => s.activeEncounterId);
  const touchMode = useUI((s) => s.touchMode);
  // While a farm challenge runs, its panel owns the interface — no "Press E".
  const challengeActive = useFarmChallengeActive();

  if (touchMode || !nearbyId || activeEncounterId || challengeActive) return null;

  const interactable = getInteractable(nearbyId);
  if (!interactable) return null;

  return (
    <div className="interaction-prompt">
      <kbd>E</kbd>
      <span>{interactable.promptLabel}</span>
    </div>
  );
}

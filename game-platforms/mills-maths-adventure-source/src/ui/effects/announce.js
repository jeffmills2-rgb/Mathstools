import { useUI } from "./uiStore.js";

/**
 * Turn a completeEncounter() result into celebratory feedback (toasts + sounds).
 *
 * Every encounter type calls this after completing, so level-ups and quest
 * completions are announced consistently no matter which encounter triggered
 * them. Keeping this in one place means the encounter components don't each
 * re-implement the celebration logic.
 *
 * `result` is the object returned by progress.completeEncounter():
 *   { leveledUp, newLevel, newlyCompletedQuests }
 */
export function announceResult(result) {
  if (!result) return;
  const ui = useUI.getState();

  if (result.leveledUp) {
    ui.pushToast({
      type: "levelup",
      icon: "⭐",
      title: "Level Up!",
      message: `You reached Level ${result.newLevel}`,
    });
    ui.playSound("levelUp");
  }

  (result.newlyCompletedQuests || []).forEach((quest) => {
    ui.pushToast({
      type: "quest",
      icon: "📜",
      title: "Quest Complete!",
      message: quest.title,
    });
    ui.playSound("questComplete");
  });
}

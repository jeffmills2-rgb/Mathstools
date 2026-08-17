# W1-E — ship checklist (sandbox model, W1-A → W1-D)

> Ships everything from W1: arithmetic Number-Facts skills, arithmetic defaults +
> open world (repurposed story), sandbox dialogue, and teacher-task reward badges.
> Nothing from W1 is in production yet — it all goes out in this one pass.
> 252 headless checks pass. Rules unchanged since Phase 1–2 (no console step).

## 0. What's in this release
- **Game source** (local only): Stage 3 Number Facts skills; arithmetic warm-up
  defaults on every character (XP/coins, no badge); open world (all gates
  passable); campaign story preserved behind `campaignRequires`; sandbox Sage/NPC/
  onboarding text; system checks updated (252).
- **Functions**: `createAdventureTask` + `updateAdventureTask` now validate/persist
  a `rewardBadge` (the "get to the end" trophy).
- **Website portal**: reward-badge picker on the Set-task form + `adventureManifest`
  badge list + CLAUDE.md.

## 1. Deploy the functions (first — per the working agreement)
```
cd "/Users/jeffmills/Documents/Project/Mills Maths Adventure/Mills Maths Adventure/functions"
firebase deploy --only functions --project mills-maths-tools
```

## 2. Local playtest (npm run dev) — verify before shipping
Start: `cd "…/Mills Maths Adventure" && npm run dev` → open the printed Local URL.
- **New save:** onboarding overlay reads open-world; Sage welcomes you to the open
  island (no "locked paths").
- **Warm-ups:** walk to Pip / Fern / Alby → button says **Start warm-up** → easy
  arithmetic (add/sub ≤20, times tables, division facts). Pass ≥60% → XP/coins,
  **no badge**.
- **Open world:** roam freely to every zone — no locked gates, no blocked movement,
  no celebration spam on load.
- **Teacher task (needs a 7MAB student):** set a task in the portal → sign into the
  game with that student → the task appears on its character and plays the real
  content.
- **Reward badge ("get to the end"):** set a task with the 🏆 Quest Champion reward
  → complete it as the student → the badge shows in the **Trophy Room**.
- **Edit:** edit a task's reward/topic in the portal → the change sticks (this is
  why the function redeploy in step 1 matters).
- No console errors.

## 3. Build the game
```
cd "/Users/jeffmills/Documents/Project/Mills Maths Adventure/Mills Maths Adventure"
npm run build
```
(The "chunk > 500 kB" warning is normal — not an error.)

## 4. Copy the built game into the website repo
```
rm -rf "/Users/jeffmills/Documents/Project/mathstools-main 2/game-platforms/mills-maths-adventure/assets"
cp -R dist/. "/Users/jeffmills/Documents/Project/mathstools-main 2/game-platforms/mills-maths-adventure/"
```

## 5. Commit & push the website (Netlify auto-deploys ~1 min)
```
cd "/Users/jeffmills/Documents/Project/mathstools-main 2"
git add -A
git commit -m "Sandbox model (W1): arithmetic defaults + open world + teacher reward badges; rebuild Adventure"
git push
```
This commit carries: the rebuilt Adventure (`game-platforms/…`), the portal
reward-badge picker (`portal/teacher/index.html`, `portal/shared/adventureManifest.js`),
and `CLAUDE.md`.

## 6. Live smoke test (https://www.millsmathstools.au)
- Open the Adventure from the homepage → new save shows the open-world onboarding.
- Talk to a character → arithmetic warm-up; roam to all zones freely.
- Teacher portal → Set-task form shows the **Reward** dropdown; set/edit/remove work.
- Sign in as a 7MAB student → the task (and its reward on completion) works.

## Rollback
- Website: `git revert HEAD && git push` (or redeploy the previous commit in Netlify).
- Functions: redeploy the previous `functions/index.js` if needed.
- GitHub safety branch: `backup/pre-portal-…`.

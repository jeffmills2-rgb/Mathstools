/**
 * CHARACTER MODELS (W2-H) — the data-driven map from a character id to its glTF
 * model + tuning. This is the ONLY place you edit to swap in real 3D characters.
 *
 * Until a character has a `file`, it renders the original low-poly box-and-sphere
 * fallback (so the game always works and you can upgrade one character at a time).
 *
 * Per-character config:
 *   file       filename in public/models/characters/ (e.g. "teacher-a.glb"), or
 *              null to use the fallback shape
 *   modelScale normalises the pack's base size to the game (world units). Tuned
 *              per pack; the character's own `scale` (from the interactable) is
 *              applied on top for boss/size differences.
 *   yOffset    vertical nudge so the feet sit on the ground
 *   rotationY  face the model forward (+z) if the pack faces another way
 *   idle       idle animation clip name (falls back to the first clip)
 *   walk       walk clip name (player only; optional)
 */

import { PETE_CLIPS } from "../../data/snow/snowLayout.js";

// Resolves under vite's base — "/" in dev, "./" in the built subfolder.
const BASE = `${import.meta.env.BASE_URL}models/characters/`;

export function modelUrl(file) {
  return file ? BASE + file : null;
}

// `idle`/`greet` may be an exact clip name or null. When null (or not found) the
// loader picks a clip by keyword: idle → "idle/stand/breath", greet →
// "wave/greet/hello/talk/cheer". `greet` plays when the player enters the radius.
const DEFAULT = { file: null, modelScale: 1, yOffset: 0, rotationY: 0, idle: null, greet: null };

// Fill in `file` (and tune) after dropping a CC0 pack into
// public/models/characters/. Distinct staff = a distinct file per id.
export const CHARACTER_MODELS = {
  // Island NPCs (Meshy models — upload pip.glb / fern.glb / alby.glb). Same
  // ~1.65u base as the staff, so modelScale 1.54 keeps them consistent in size.
  pip: { ...DEFAULT, file: "pip.glb", modelScale: 1.54 },
  fern: { ...DEFAULT, file: "fern.glb", modelScale: 1.54 },
  alby: { ...DEFAULT, file: "alby.glb", modelScale: 1.54 },
  sage: { ...DEFAULT, file: "mills.glb", modelScale: 0.185 }, // "Mills" the guide — tiny, ~0.30u ≈ 30cm tall (full rig is ~2.5u at 1.54)
  // Schoolyard staff (nine). Meshy models (~1.65u tall). modelScale 1.54 makes
  // them ~2.5u (10% up from the first pass). Each has a resting clip + a "Talk"
  // clip; the loader plays rest when away, Talk when the player enters the radius.
  // rotationY may need flipping to Math.PI if they face away (they all face the
  // same way — set once from an in-game look).
  pearce: { ...DEFAULT, file: "pearce.glb", modelScale: 1.54 },
  mahoney: { ...DEFAULT, file: "mahoney.glb", modelScale: 1.54 },
  ewings: { ...DEFAULT, file: "ewings.glb", modelScale: 1.54 },
  dawson: { ...DEFAULT, file: "dawson.glb", modelScale: 1.54 },
  heywood: { ...DEFAULT, file: "heywood.glb", modelScale: 1.54 },
  morgan: { ...DEFAULT, file: "morgan.glb", modelScale: 1.54 },
  bacon: { ...DEFAULT, file: "bacon.glb", modelScale: 1.54 },
  brookes: { ...DEFAULT, file: "brookes.glb", modelScale: 1.54 },
  kellahan: { ...DEFAULT, file: "kellahan.glb", modelScale: 1.54 }, // boss; extra size via her interactable scale
  // Fraction Farm fence marker (F2) — a bird that perches on the fence and
  // slides with the player. Idle clip = "air squat" pose; movement clip =
  // "headstand flip". Falls back to a primitive bird until bird.glb lands in
  // public/models/characters/. Tune modelScale/rotationY once it's in.
  "fence-bird": { ...DEFAULT, file: "bird.glb", modelScale: 0.8, idle: null },
  // The Trading Post stall keepers (F10) — a rigged farmer that WALKS out from
  // behind the counter and idles otherwise. 3 render at once, so the Trading
  // Post clones the scene per stall. Clips: Idle_3 / Walking / Running.
  // The Trading Post stall keepers use the ORIGINAL farmer.glb at double size (2.7).
  // rotationY may need flipping to Math.PI after a live look.
  farmer: {
    ...DEFAULT, file: "farmer.glb", modelScale: 2.7, rotationY: 0, idle: "Idle_3",
    clips: { idle: "Idle_3", walk: "Walking", run: "Running" },
  },
  // The farm QUIZ HOSTS. The Milkman, Farm Shop and Trading Post hosts use the
  // farmer1.glb (Milkman, Trading Post host sign, Woody at Plank the Gap); Sunny
  // (Farm Shop) + the Trading Post stall keepers use farmer.glb; the Weigh
  // Master is Steve (steve.glb); the
  // Veggie Plot / Crate Packing hosts are trevor / robot. These are NPC rigs
  // (Walking / Running + Talk / Wave clips — no true idle), so the loader rests
  // on the wave/talk pose and plays the talk clip when the player is near.
  // They render together in the farm, so CharacterModel CLONES per instance.
  // rotationY may need Math.PI after a live look.
  "milk-host": { ...DEFAULT, file: "farmer1.glb", modelScale: 1.6, rotationY: 0, idle: "Idle_3" }, // The Milkman
  "trade-host": { ...DEFAULT, file: "farmer1.glb", modelScale: 1.6, rotationY: 0, idle: "Idle_3" }, // The Trading Post host
  "shop-host": { ...DEFAULT, file: "farmer.glb", modelScale: 1.6, rotationY: 0, idle: "Idle_3" }, // Farm Shop host (Sunny)
  "weigh-host": { ...DEFAULT, file: "farmer.glb", modelScale: 1.6, rotationY: 0, idle: "Idle_3" }, // (unused — Weigh Master is now Steve)
  "plank-host": { ...DEFAULT, file: "farmer1.glb", modelScale: 1.6, rotationY: 0, idle: "Idle_3" }, // Plank the Gap host (Woody)
  trevor: { ...DEFAULT, file: "trevor.glb", modelScale: 1.6, rotationY: 0 }, // Veggie Plot host
  steve: { ...DEFAULT, file: "steve.glb", modelScale: 1.6, rotationY: 0 }, // The Weigh Master (moved from Trading Post)
  robot: { ...DEFAULT, file: "robot.glb", modelScale: 1.6, rotationY: 0 }, // Crate Packing host
  // PETE — the snow world's wandering local (see game/WanderingPete.jsx). He
  // is NOT an interactable: he strolls the Snowball Sums world, stops for a
  // few seconds, throws a spin jump, and walks on. Ambient life only.
  // Clips shipped: 360_Power_Spin_Jump / Idle_6 / Running / Walking /
  // Wave_for_Help_3. He never runs (teacher's call) — `run` is deliberately
  // absent from the map so nothing can select it.
  // Source glb was 15.9 MB / 206k tris; re-exported through gltf-transform
  // (simplify → 1024px webp → meshopt) to 341 KB / 12.4k tris, in line with
  // the other characters. Keep it that way if Pete is ever re-exported.
  pete: {
    ...DEFAULT, file: "pete.glb", modelScale: 1.54, rotationY: 0,
    idle: PETE_CLIPS.idle,
    clips: PETE_CLIPS,
  },
  // The student — main1.glb (see PlayerCharacter.jsx for movement-driven
  // animation switching). NOTE the current export's clip NAMES are shifted
  // off their CONTENT by one, and only THREE clips shipped:
  //   "Idle_4"              actually plays the JUMP
  //   "Jump_Over_Obstacle_2" actually plays the RUN
  //   "Running"             actually plays the WALK
  //   (no true idle clip in the file)
  // So the map below is BY CONTENT; idle = the walk clip slow-played. When
  // main1.glb is re-exported with 4 correctly-named clips, set these back to
  // null and the name matching takes over.
  player: {
    ...DEFAULT, file: "main1.glb", modelScale: 1.54,
    // idle: false = NO true idle clip in this export (don't let the regex
    // grab "Idle_4" — that's the jump!); the walk clip slow-plays instead.
    clips: { idle: false, walk: "Running", run: "Jump_Over_Obstacle_2", jump: "Idle_4" },
  },
  // Cool Cat (main2.glb) + DJ Goat (main3.glb) — the two extra selectable
  // students (W7-B). Both were re-rigged with 4 CORRECTLY-named clips, so the
  // map is straightforward (unlike main1): Idle_3 / Walking / Running /
  // Jump_Over_Obstacle_2 → idle / walk / run / jump.
  "player-cat": {
    ...DEFAULT, file: "main2.glb", modelScale: 1.54,
    clips: { idle: "Idle_3", walk: "Walking", run: "Running", jump: "Jump_Over_Obstacle_2" },
  },
  "player-goat": {
    ...DEFAULT, file: "main3.glb", modelScale: 1.54,
    clips: { idle: "Idle_3", walk: "Walking", run: "Running", jump: "Jump_Over_Obstacle_2" },
  },
};

// The selectable STUDENT characters, shown on the welcome screen (W7-B). Each
// `id` is stored in profile.character; `model` keys into CHARACTER_MODELS.
export const PLAYER_CHARACTERS = [
  { id: "explorer", label: "Explorer", model: "player", blurb: "The original adventurer" },
  { id: "cat", label: "Cool Cat", model: "player-cat", blurb: "Too cool for maths? Never." },
  { id: "goat", label: "DJ Goat", model: "player-goat", blurb: "The Greatest Of All Time" },
];

/** The CHARACTER_MODELS key for a stored character id (defaults to Explorer). */
export function playerModelKey(characterId) {
  const found = PLAYER_CHARACTERS.find((c) => c.id === characterId);
  return (found || PLAYER_CHARACTERS[0]).model;
}

export function modelConfig(id) {
  return CHARACTER_MODELS[id] || DEFAULT;
}

// Preload every configured model file (no-op for ids still on the fallback).
export function configuredModelFiles() {
  return Object.values(CHARACTER_MODELS).map((c) => c.file).filter(Boolean);
}

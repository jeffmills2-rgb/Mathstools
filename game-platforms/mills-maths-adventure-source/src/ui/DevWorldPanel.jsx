import React, { useEffect, useState } from "react";

import { useProgress } from "../progress/store.js";
import { useUI } from "./effects/uiStore.js";
import { getAllChains } from "../data/npcQuestChains.js";
import { getUnlockStates, resolveChainStep } from "../systems/unlockEngine.js";
import { runWorldChecks } from "../dev/systemChecks.js";
import { requestTeleport, playerState, useSession } from "../game/sessionStore.js";
import { getAllRegions } from "../data/regions.js";
import { ZONE_TELEPORTS, HUB_POINT } from "../data/worldSpawnPoints.js";
import { getColliders, PLATEAU } from "../data/worldColliders.js";
import { WORLD_UNLOCKS } from "../data/worldUnlocks.js";

/**
 * WORLD PROGRESSION testing (DevPanel section, Phase 2G). Inspect unlock state,
 * preview locked/unlocked, see active quest-chain steps, reset world progression,
 * and run the world system checks.
 */
export function WorldTesting() {
  const completedMissions = useProgress((s) => s.completedMissions);
  const earnedBadges = useProgress((s) => s.earnedBadges);
  const completedEncounters = useProgress((s) => s.completedEncounters);
  const resetWorldProgression = useProgress((s) => s.resetWorldProgression);
  const activateMission = useProgress((s) => s.activateMission);
  const recordMissionAttempt = useProgress((s) => s.recordMissionAttempt);
  const collisionDebug = useUI((s) => s.collisionDebug);
  const toggleCollisionDebug = useUI((s) => s.toggleCollisionDebug);
  const cameraLock = useUI((s) => s.cameraLock);
  const toggleCameraLock = useUI((s) => s.toggleCameraLock);
  const currentRegionId = useSession((s) => s.currentRegionId);
  const setRegion = useSession((s) => s.setRegion);
  const [checks, setChecks] = useState(null);

  // Live player position/height + camera yaw (polled; playerState is non-reactive).
  const [pos, setPos] = useState({ x: 0, y: 0, z: 0, camYaw: 0 });
  useEffect(() => {
    const t = setInterval(
      () => setPos({ x: playerState.x, y: playerState.y, z: playerState.z, camYaw: playerState.camYaw || 0 }),
      200
    );
    return () => clearInterval(t);
  }, []);

  const snapshot = { completedMissions, earnedBadges, completedEncounters };
  const unlocks = getUnlockStates(snapshot);
  const chains = getAllChains();

  // Quick helper: complete a mission instantly with a PASSING score (for
  // previewing unlocks). Finalize with a full-correct score so it passes.
  function completeMission(missionId) {
    activateMission(missionId);
    const m = useProgress.getState().getActiveMission();
    const total = m ? m.requiredQuestions : 1;
    for (let i = 0; i < total; i++) recordMissionAttempt(true, 10);
    useProgress.getState().finalizeActiveMission({ correct: total, total });
  }

  return (
    <div className="dev-section">
      <div className="dev-subtitle">World progression</div>

      {/* Camera + collision tools. */}
      <div className="dev-row">
        <button onClick={toggleCameraLock}>Camera Lock: {cameraLock ? "ON" : "off"}</button>
        <button onClick={toggleCollisionDebug}>Collision debug: {collisionDebug ? "ON" : "off"}</button>
      </div>
      <div className="dev-line">
        camera: <code>{cameraLock ? "locked-follow" : "manual (Z/X)"}</code> · yaw <code>{((pos.camYaw * 180) / Math.PI).toFixed(0)}°</code> · dist <code>11</code>
      </div>

      {/* Region switch (W2) — preview each region (Teleport Gate comes in W2-C). */}
      <div className="dev-line">Region: <code>{currentRegionId}</code></div>
      <div className="dev-row">
        {getAllRegions().map((r) => (
          <button key={r.id} onClick={() => setRegion(r.id)} disabled={currentRegionId === r.id}>
            {r.name}
          </button>
        ))}
      </div>

      {(() => {
        const cols = getColliders(
          { completedMissions, earnedBadges, completedEncounters },
          currentRegionId
        );
        const near = cols
          .map((c) => ({ id: c.id, d: Math.hypot(pos.x - c.x, pos.z - c.z) }))
          .filter((c) => c.d < 5)
          .sort((a, b) => a.d - b.d)
          .slice(0, 4);
        return (
          <>
            <div className="dev-line">
              player: <code>x {pos.x.toFixed(1)} · y {pos.y.toFixed(2)} · z {pos.z.toFixed(1)}</code>
            </div>
            <div className="dev-line">
              colliders: <code>{cols.length}</code> · nearby: <code>{near.map((n) => `${n.id}(${n.d.toFixed(1)})`).join(", ") || "none"}</code>
            </div>
          </>
        );
      })()}

      {/* Teleports for testing the larger map. */}
      <div className="dev-line">Teleport:</div>
      <div className="dev-row">
        <button onClick={() => requestTeleport(HUB_POINT.x, HUB_POINT.z)}>↩ Hub</button>
        <button onClick={() => requestTeleport(PLATEAU.x, PLATEAU.z)}>Plateau top</button>
        {ZONE_TELEPORTS.filter((t) => t.id !== "zone-hub").map((t) => (
          <button key={t.id} onClick={() => requestTeleport(t.x, t.z)}>{t.name}</button>
        ))}
      </div>
      <div className="dev-line">Gate entrances:</div>
      <div className="dev-row">
        {WORLD_UNLOCKS.map((u) => {
          // Stand just on the hub side of the gate to test approaching it.
          const d = Math.hypot(u.position[0], u.position[1]) || 1;
          const hx = u.position[0] - (u.position[0] / d) * 3;
          const hz = u.position[1] - (u.position[1] / d) * 3;
          return <button key={u.id} onClick={() => requestTeleport(hx, hz)}>{u.name}</button>;
        })}
      </div>

      <div className="dev-line">Unlocks:</div>
      {unlocks.map((u) => (
        <div key={u.id} className="dev-line">
          {u.unlocked ? "🔓" : "🔒"} <code>{u.id}</code> — {u.name}
          {!u.unlocked && <span> · needs {JSON.stringify(u.requires)}</span>}
        </div>
      ))}

      <div className="dev-line" style={{ marginTop: 6 }}>Quest chains:</div>
      {chains.map((c) => {
        const { index, complete } = resolveChainStep(c, completedMissions);
        return (
          <div key={c.npcId} className="dev-line">
            <code>{c.npcId}</code>: {complete ? "complete ✓" : `step ${index + 1}/${c.steps.length} (${c.steps[index].missionId})`}
          </div>
        );
      })}

      <div className="dev-line" style={{ marginTop: 6 }}>Preview (instant-complete a chain mission):</div>
      <div className="dev-row">
        <button onClick={() => completeMission("npc-pip-1")}>Finish Pip 1</button>
        <button onClick={() => completeMission("npc-fern-1")}>Finish Fern 1</button>
        <button onClick={() => completeMission("npc-alby-1")}>Finish Alby 1</button>
      </div>

      <div className="dev-row">
        <button className="dev-danger" onClick={resetWorldProgression}>Reset world progression</button>
        <button onClick={() => setChecks(runWorldChecks(useProgress.getState()))}>Run world checks</button>
      </div>
      {checks && (
        <div className="dev-test-results">
          {checks.map((c) => (
            <div key={c.name} className={`dev-test-row ${c.pass ? "pass" : "fail"}`}>
              {c.pass ? "✓" : "✗"} {c.name} — {c.detail}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

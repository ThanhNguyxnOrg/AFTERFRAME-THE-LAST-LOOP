---
paths:
  - "src/game/renderer.ts"
  - "src/game/models.ts"
  - "src/game/assetLoader.ts"
  - "src/game/audio.ts"
  - "scripts/blender/**"
  - "src/core/**"
---

# Three.js Engine, Rendering & Audio Rules (AFTERFRAME: THE LAST LOOP)

- **Zero Allocations in Hot Render Loop**: Inside `renderer.ts` `renderFrame`, reuse pre-allocated `THREE.Vector3`, `THREE.Color`, `THREE.Quaternion`, and pooled mesh groups (`createPlayerRig`, `createEnemyRig`). Never instantiate new `THREE.BufferGeometry` or `THREE.Material` every frame unless pooled or explicitly disposed on expiry.
- **Strict Dependency Direction**: `renderer.ts`, `models.ts`, and `audio.ts` read from `WorldState` and `CombatEvent[]` emitted by `simulation.ts`. They must NEVER mutate gameplay state (`hp`, `integrity`, `flux`, `aiState`, `outcome`).
- **Complete Archetype & Boss Rig Coverage**:
  - Every `EnemyArchetype` (`scout`, `scrapper`, `sniper`, `bastion`, `siphon`, `eraser`, `enforcer`, `aegis_sentinel`, `null_weaver`, `helix`, `choir`, `curator`, `matron`, `warden_prime`) must have a distinct silhouette, telegraph indicator, and hit-flash material in `src/game/models.ts` and `src/game/renderer.ts`.
- **Visual Language Discipline**:
  - **Cyan**: Friendly Chrono Rig / Echo / Relay / Harmonic sync indicators.
  - **Amber**: Active recording state, thermal heat warnings, and guarded armor feedback.
  - **Red**: Hostile attack telegraphs, danger zones, and Chrono Sever hazards.
  - **White**: Exposed boss cores, parry confirmation, and weakpoint opportunities.
- **Deterministic Cleanup**: Dispose GPU geometries, materials, textures, and event listeners on unmount or renderer reset.
- Consult `docs/engine-reference/threejs/VERSION.md` before modifying Three.js rendering pipelines.

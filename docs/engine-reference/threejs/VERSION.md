# Three.js + React 19 + TypeScript Engine Reference (AFTERFRAME: THE LAST LOOP)

| Field | Value |
|---|---|
| **Engine** | `threejs` |
| **Engine Version** | 0.186.1 |
| **Installed at pin time** | 0.186.1 |
| **Stack** | React `19.2.5` + TypeScript `7.0.0-dev` (`^7.0.2`) + Vite `8.3.4` |

- **Engine / 3D Runtime**: Three.js `0.186.1` (`"three": "^0.186.1"` and `"@types/three": "^0.186.0"` in `package.json` & `bun.lock`)
- **UI & Shell Framework**: React `19.2.5` (`^19.0.1`) + TypeScript `7.0.0-dev` (`^7.0.2`, `"strict": true`) + Tailwind CSS `4.3.3` (`^4.3.3`)
- **Build & Dev Server**: Vite `8.3.4` (`^8.3.0`; `bun run dev` on port `3000`, `bun run build`)
- **Test Runner**: Node.js built-in test runner via `tsx` (`bun run test` -> `tsx --test src/game/simulation.test.ts src/game/campaign-release.test.ts src/game/reduced-motion.test.ts src/game/asset-lifecycle.test.ts`, `234` tests)
- **3D Asset Pipeline**: Procedural Three.js geometry rigs (`src/game/models.ts`) + Blender headless GLB generator (`scripts/blender/create_phase12_assets.py` -> `public/assets/blender/phase12/*.glb`) with runtime `GLTFLoader` hydration in `src/game/renderer.ts`.

## Core Architectural Boundaries

1. **Deterministic Simulation (`src/game/simulation.ts`, `src/game/config.ts`, `src/game/types.ts`)**:
   - All gameplay logic, enemy/boss AI state machines, Chrono Rig Echo recording/replay, Relay teleportation, Resonance/Convergence, weapon damage/heat/upgrades, and Save v2 persistence live in pure TypeScript modules with zero React or Three.js dependencies.
2. **Three.js Renderer (`src/game/renderer.ts`, `src/game/models.ts`)**:
   - Consumes `WorldState` snapshots inside a single `requestAnimationFrame` loop.
   - Pre-allocates geometries/materials and reuses scene graph nodes (`createPlayerRig`, `createEnemyRig`) to avoid per-frame GC allocations, automatically disposes stale `EnemyRig` meshes/geometries/materials when encounters transition, exposes `getDiagnostics()` for WebGL/memory telemetry, and performs deduplicated 9-slot texture/geometry/material cleanup via `disposeMeshResources()` on teardown.
3. **React HUD & Shell (`src/App.tsx`, `src/components/*.tsx`)**:
   - Subscribes to throttled `HudSnapshot` updates and dispatches pure simulation commands (`switchPlayerWeapon`, `purchaseWeaponUpgrade`, `startCampaignChapterSelect`, `engageWardenPrimeInLoom`, `selectChronicleLoomEnding`) without mutating simulation state at 60Hz.

# Three.js + React 19 + TypeScript Engine Reference (AFTERFRAME: THE LAST LOOP)

- **Engine / 3D Runtime**: Three.js `0.186.1` (`"three": "^0.186.1"` and `"@types/three": "^0.186.0"` in `package.json` & `bun.lock`)
- **UI & Shell Framework**: React `19` (`^19.0.1` / `19.3.1`) + TypeScript `7.0.2` (`^7.0.2`) + Tailwind CSS `4.3.3` (`^4.3.3`)
- **Build & Dev Server**: Vite `8.3.4` (`^8.3.0`; `npm run dev` on port `3000`, `npm run build` with manual chunks)
- **Test Runner**: Node.js built-in test runner via `tsx` (`npx --yes tsx --test src/game/simulation.test.ts` / `npm test`)
- **3D Asset Pipeline**: Procedural Three.js geometry rigs (`src/game/models.ts`) + Blender headless GLB generator (`scripts/blender/generate_afterframe_assets.py` -> `public/assets/models/*.glb`) with runtime `GLTFLoader` hydration (`src/game/assetLoader.ts`).

## Core Architectural Boundaries

1. **Deterministic Simulation (`src/game/simulation.ts`, `src/game/config.ts`, `src/game/types.ts`)**:
   - All gameplay logic, enemy/boss AI state machines, Chrono Rig Echo recording/replay, Relay teleportation, Resonance/Convergence, weapon damage/heat/upgrades, and Save v2 persistence live in pure TypeScript modules with zero React or Three.js dependencies.
2. **Three.js Renderer (`src/game/renderer.ts`, `src/game/models.ts`, `src/game/assetLoader.ts`)**:
   - Consumes `WorldState` snapshots inside a single `requestAnimationFrame` loop.
   - Pre-allocates geometries/materials and reuses scene graph nodes (`createPlayerRig`, `createEnemyRig`) to avoid per-frame GC allocations.
3. **React HUD & Shell (`src/App.tsx`, `src/components/*.tsx`)**:
   - Subscribes to throttled `HudSnapshot` updates and dispatches pure simulation commands (`switchPlayerWeapon`, `purchaseWeaponUpgrade`, `startCampaignChapterSelect`, `engageWardenPrimeInLoom`, `selectChronicleLoomEnding`) without mutating simulation state at 60Hz.

# AFTERFRAME: THE LAST LOOP — Phase 23.3 Implementation Plan

**Date:** 2026-04-19
**Spec:** `docs/superpowers/specs/2026-04-19-phase23-3-adversarial-verification-design.md`

---

## Step 1: Write Failing RED Regression Tests
1. **`src/game/simulation.test.ts`**:
   - Save V1 -> V2 migration idempotency and repeated load/save cycle stability.
   - Exact UTF-8 byte limit (`MAX_SAVE_JSON_BYTES = 262_144`) rejecting multi-byte UTF-8 strings whose byte length exceeds `262,144` even when `rawJson.length <= 262_144`.
   - Bounded array scanning in `mergeUniqueChapters` / `mergeUniqueStrings` when run arrays exceed `MAX_SAVE_ARRAY_SCAN`.
   - Weapon ownership consistency across `transitionCampaignToBoss`, `enterChronicleLoomChapter`, `engageWardenPrimeInLoom`, `retryBossFromCheckpoint`, and `startCampaignRun` when a locked weapon ID is present on a checkpoint or player state.
2. **`src/game/reduced-motion.test.ts`**:
   - Complete audio graph topology verification (`sfxGain -> masterGain -> destination`, `musicGain -> masterGain -> destination`, live volume scaling, idempotent `dispose()`, and post-`dispose()` no-op guarantee).
   - Independent `setCameraShake(false)` vs `setReducedMotion(true)` and `setScreenEffects(false)` behavior on `ArenaSceneRenderer`.
   - Keyboard `ArrowUp` / `ArrowDown` vertical pitch respecting `invertY: true`.
3. **`src/game/asset-lifecycle.test.ts`**:
   - `reconcileEnemyRigs` inside `updateAndRender` preserves `echoHistory` and active `impactRingTimer` / `relayVfxTimer`.
   - `disposeMeshResources` disposes material textures (`map`, `bumpMap`, `roughnessMap`, etc.).
   - WebGL fallback mode skips `GLTFLoader` requests, handles `resize()` and repeated `dispose()`, and cleans up fallback DOM elements.
   - `webglcontextlost` and `webglcontextrestored` events and `GLTFLoader` error callbacks are handled safely.

## Step 2: Implement Minimal Clean Fixes (GREEN)
1. **`src/game/simulation.ts`**:
   - Export `MAX_SAVE_JSON_BYTES = 262_144` and enforce UTF-8 byte length check via `TextEncoder`.
   - Bound `mergeUniqueChapters` and `mergeUniqueStrings` with `MAX_SAVE_ARRAY_SCAN`.
   - Add `sanitizeEquippedWeaponForWorld` and apply across all campaign transitions, checkpoints, and snapshot captures.
2. **`src/game/audio.ts`**:
   - Add `private disposed = false;` guard in `SoundEngine` so post-`dispose()` calls never recreate an `AudioContext`.
3. **`src/game/renderer.ts`**:
   - Split per-frame `reconcileEnemyRigs(world)` (reusing `this.activeEnemyIdsSet`) from full-reset `syncEnemyRigs(world)`.
   - Detect software WebGL (`SwiftShader`, `llvmpipe`, `Software Rasterizer`) via `isSoftwareGl`.
   - Dispose material textures in `disposeMeshResources`.
   - Add `setCameraShake(enabled: boolean)` and `setScreenEffects(enabled: boolean)`.
   - Guard `loadExternalChapterAssets` and `updateAndRender` when `!this.webglAvailable`, and remove canvas/fallback DOM nodes on `dispose()`.
4. **`src/game/input.ts`**:
   - Apply `invertSign` to `ArrowUp` / `ArrowDown` in `consumeFrameInput`.
5. **`src/App.tsx`, `src/components/TitleScreen.tsx`, `src/components/StatusModal.tsx`**:
   - Wire `setCameraShake` and `setScreenEffects` independently from `setReducedMotion`, update `[N] Map · [U] Bench · [M] Audio` legend, and ensure `aria-pressed` and `data-testid` attributes on all toggle buttons.

## Step 3: Verification & Release Readiness Audit
1. Run unit/integration tests (`bun run test`), TypeScript check (`bun run lint`), and production build (`bun run build`).
2. Profile simulation vs cold shader compilation vs warm software-WebGL rendering across all chapters and bosses in `playwright-cli`, plus verify desktop (`1440x900`) and mobile (`390x844`) UX.
3. Execute all 8 CCGS validation scripts.
4. Update `README.md` and write `docs/PHASE_23_3_AUDIT_AND_EXECUTION_REPORT.md`, commit locally on `main`, and run `compile_applet` + `lint_applet`.

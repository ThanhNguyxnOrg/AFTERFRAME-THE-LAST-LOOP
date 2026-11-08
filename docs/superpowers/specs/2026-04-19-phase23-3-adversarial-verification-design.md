# AFTERFRAME: THE LAST LOOP — Phase 23.3 Adversarial Verification, Performance Profiling & Release Readiness Design Spec

**Date:** 2026-04-19
**Repository:** `ThanhNguyxnOrg/AFTERFRAME-THE-LAST-LOOP` (`main`)
**Baseline Commit:** `772f1f1694f51059b94c42fc4dcbe63f1d66f8e9`

---

## 1. Executive Summary

Phase 23.3 performs an independent adversarial audit of **AFTERFRAME: THE LAST LOOP** following Phase 23.2, separating deterministic simulation performance from cold-start shader compilation and software WebGL rasterization, hardening Save V2 persistence and weapon ownership consistency across every transition and checkpoint path, auditing the complete Web Audio graph, hardening the Three.js renderer and asset lifecycle under failure/context-loss/fallback conditions, decoupling `cameraShake` from `reducedMotion`, and verifying CCGS and CI release integrity.

---

## 2. Adversarial Root Causes Discovered

### Priority A — Performance: Simulation vs Cold Shader Compile vs Steady-State Rendering

1. **Per-Frame `syncEnemyRigs` Resetting Transient VFX & Echo Afterimages Inside `updateAndRender` (`src/game/renderer.ts:1450-1497, 3826`)**
   - `updateAndRender` called `this.syncEnemyRigs(world)` on every frame (`line 3826`), which:
     - Allocated a new `Set<string>()` on every frame.
     - Called `this.clearEchoHistory()` on every frame, erasing the Echo afterimage ring buffer immediately after populating it.
     - Reset `this.relayVfxTimer = 0`, `this.impactRingTimer = 0`, `this.relayOriginPillarMesh.visible = false`, `this.relayArrivalPillarMesh.visible = false`, and `this.impactRingMesh.visible = false` on every frame right after `updateAndRender` triggered them.
   - **Fix**: Split `syncEnemyRigs(world)` (full encounter reset: clears Echo history, resets transient VFX timers, and reconciles enemy rigs) from `reconcileEnemyRigs(world)` (per-frame lightweight reconciliation reusing a preallocated `this.activeEnemyIdsSet = new Set<string>()` without resetting Echo history or active VFX timers). Also use `disposeMeshResources(rig.root)` when replacing an enemy rig whose archetype changed.

2. **Software WebGL (`SwiftShader` / `llvmpipe`) Detection Independent of `navigator.webdriver` (`src/game/renderer.ts:429-456`)**
   - Previously, `this.isHeadless` only inspected `navigator.webdriver` and `HeadlessChrome`. Software WebGL rasterizers (`SwiftShader`, `llvmpipe`, `Software Rasterizer`, `Microsoft Basic Render`) outside automated webdriver sessions still enabled shadow maps and `1.75` DPR.
   - **Fix**: Inspect `gl.getParameter(gl.RENDERER)` and `WEBGL_debug_renderer_info` (`UNMASKED_RENDERER_WEBGL`) for `/SwiftShader|llvmpipe|Software|Microsoft Basic Render/i` to set `this.isSoftwareGl`. Disable shadow maps and cap DPR to `1.0` whenever `this.isHeadless || this.isSoftwareGl`.

3. **Strict Separation of Performance Metrics**
   - Report four distinct timing categories:
     1. **Pure Simulation Step (`stepWorld`)**
     2. **Simulation + Scene Graph Pose Update (`stepWorld` + `updateAndRender(..., false)`)**
     3. **Cold-Start / First-Frame Shader & GLB Compilation (`updateAndRender(..., true)` first frame)**
     4. **Warm Steady-State Software WebGL Render (`updateAndRender(..., true)` across `requestAnimationFrame` ticks under CPU SwiftShader)**

---

### Priority B — Save V2 Adversarial Validation

1. **Exact UTF-8 Byte Ceiling (`MAX_SAVE_JSON_BYTES = 262_144`) (`src/game/simulation.ts:1574, 6511`)**
   - Previously, `MAX_SAVE_JSON_CHARS = 262_144` only checked `rawJson.length` (UTF-16 code units). Multi-byte UTF-8 payloads could have `rawJson.length <= 262_144` while exceeding `262,144` UTF-8 bytes.
   - **Fix**: Export `MAX_SAVE_JSON_BYTES = 262_144` (keeping `MAX_SAVE_JSON_CHARS = MAX_SAVE_JSON_BYTES` as a backward-compatible alias) and enforce both `rawJson.length > MAX_SAVE_JSON_BYTES` and `new TextEncoder().encode(rawJson).byteLength > MAX_SAVE_JSON_BYTES`.
   - **Accurate Framing**: Document client-side save validation as protecting local application state integrity against corrupted or malformed browser storage payloads, never as server-grade anti-tamper security.

2. **Bounded Array Merges in `mergeUniqueChapters` & `mergeUniqueStrings` (`src/game/simulation.ts:6124-6168`)**
   - Previously, `mergeUniqueChapters` and `mergeUniqueStrings` iterated over the full length of input arrays `a` and `b`.
   - **Fix**: Bound all loops in `mergeUniqueChapters` and `mergeUniqueStrings` to `MAX_SAVE_ARRAY_SCAN` (`256`).

3. **Weapon Ownership Consistency Across All Campaign Transitions & Checkpoints (`src/game/simulation.ts:5393, 5647, 5879, 5939, 6073`)**
   - Previously, `startCampaignRun`, `retryBossFromCheckpoint`, `transitionCampaignToBoss`, `enterChronicleLoomChapter`, `engageWardenPrimeInLoom`, and `captureSavedCampaignSnapshotIfNeeded` checked `isValidWeaponId(...)` without verifying that the weapon was unlocked in `getUnlockedWeaponIds(world)` during Campaign mode.
   - **Fix**: Introduce `sanitizeEquippedWeaponForWorld(world, candidateWeaponId)` which verifies `isValidWeaponId(candidateWeaponId) && getUnlockedWeaponIds(world).includes(candidateWeaponId)` in Campaign mode (falling back to `'chrono_edge'`), and enforce it across all campaign transitions, checkpoint restorations, and snapshot captures.

---

### Priority C — Complete Audio Graph Audit

1. **Post-`dispose()` AudioContext Recreation Guard (`src/game/audio.ts:116-196`)**
   - Previously, `SoundEngine.dispose()` closed `this.ctx` and nulled references, but a subsequent call to `playEvents()` or any synthesis method after `dispose()` could allocate a new `AudioContext` via `ensureContext()`.
   - **Fix**: Track `private disposed = false;` in `SoundEngine`. Once `dispose()` is called, `ensureContext()` returns `null` and no further `AudioContext` or `AudioNode` instances can be created. Expose read-only inspection helpers for testing the exact `sfxGain -> masterGain -> destination` and `musicGain -> masterGain -> destination` topology.

---

### Priority D — Renderer & Asset Lifecycle Adversarial Audit

1. **Material Texture Disposal in `disposeMeshResources` (`src/game/renderer.ts:29-43`)**
   - In Three.js, `material.dispose()` does not dispose attached `THREE.Texture` instances (`map`, `bumpMap`, `roughnessMap`, `emissiveMap`, `alphaMap`, `normalMap`, `metalnessMap`, `aoMap`, `lightMap`).
   - **Fix**: Enhance `disposeMeshResources` to inspect every material's texture slots and invoke `.dispose()` on every `THREE.Texture` instance, and dispose `this.scene.environment` on renderer disposal.

2. **WebGL Fallback & Repeated Mount/Unmount Cleanup (`src/game/renderer.ts:472, 1370, 4059, 4444`)**
   - When `WebGLRenderer` fails to initialize (`this.webglAvailable === false`), `loadExternalChapterAssets` must not start `GLTFLoader` network fetches, and `updateAndRender` must short-circuit cleanly.
   - `ArenaSceneRenderer.dispose()` must remove both `this.renderer?.domElement` and any `[data-testid="webgl-fallback"]` element from `this.mountEl`, and remain completely idempotent on repeated calls.

---

### Priority E — Accessibility, Settings & UX Consistency

1. **Decouple `cameraShake` from `reducedMotion` and Enforce `screenEffects` (`src/App.tsx:699, 1446`, `src/game/renderer.ts`)**
   - Previously, `App.tsx` set `effectiveReducedMotion = cameraSettings.reducedMotion || cameraSettings.cameraShake === false`, causing `cameraShake: false` to stop the title screen camera orbit and slow ambient rotors.
   - **Fix**: Add dedicated `setCameraShake(enabled: boolean)` and `setScreenEffects(enabled: boolean)` methods on `ArenaSceneRenderer`.
     - `cameraShake: false` zeroes camera trauma shake (`shakeMag = 0`) while preserving normal title orbit and ambient motion.
     - `reducedMotion: true` zeroes camera shake, stops title orbit, and scales ambient motion to `0.15`.
     - `screenEffects: false` suppresses the HUD low-integrity red vignette (`GameHud.tsx`) and suppresses transient screen-space impact rings and relay pillars in `ArenaSceneRenderer`.

2. **Keyboard `ArrowUp` / `ArrowDown` Camera Pitch Respecting `invertY` (`src/game/input.ts:561-572`)**
   - Multiply keyboard `ArrowUp` and `ArrowDown` pitch deltas by `invertSign = this.settings.invertY ? -1 : 1`.

3. **Control Legend & ARIA Toggle Semantics (`src/components/TitleScreen.tsx`, `src/components/StatusModal.tsx`)**
   - Update the title screen control legend to accurately list `[N] Map · [U] Bench · [M] Audio` and ensure all boolean setting buttons expose `aria-pressed` and consistent `data-testid` attributes.

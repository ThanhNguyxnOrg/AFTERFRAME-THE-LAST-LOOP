# AFTERFRAME: THE LAST LOOP — Phase 23.3 Adversarial Verification, Performance Profiling & Release Readiness Report

## 1. Executive Summary

Phase 23.3 executed an independent adversarial verification, performance profiling, and release-readiness audit of **AFTERFRAME: THE LAST LOOP** (`v0.23.3`, local branch `main`, published baseline `origin/main` at `9c79d11024eb9f135d1ca31051a8dca9c1306edf`). Following strict **RED → GREEN → REFACTOR** test-driven development across Priorities A–G, every discovered defect was reproduced, root-caused, covered by an adversarial regression test, fixed at the architectural boundary, and verified across deterministic simulation tests (`231 / 231 PASS`), strict TypeScript (`0 errors`), Vite production bundling (`PASS`), Claude Code Game Studios (`CCGS v1.2.0`) validation scripts (`8 / 8 PASS`), and headless Chromium browser verification (`0 console/page errors`).

---

## 2. Priority A — Performance: Separating Simulation, Scene-Graph Pose Updates, Cold Shader Compilation & Software-WebGL Rendering

### 2.1 Root-Cause Investigation of Phase 23.2 Outliers

During Phase 23.2 profiling under headless Chromium's CPU software rasterizer (`Google SwiftShader`), two distinct phenomena were conflated into single-number averages:
1. **Cold-start WebGL shader compilation (`62–862 ms`)** on the very first draw call of a newly constructed chapter/boss arena when Three.js compiles `MeshStandardMaterial` PBR shaders on CPU threads.
2. **A genuine per-frame hot-path defect in `ArenaSceneRenderer.updateAndRender` (`src/game/renderer.ts:3826`)**:
   - `updateAndRender(world, dt, renderScene)` previously invoked `this.syncEnemyRigs(world)` on **every frame**.
   - `syncEnemyRigs(world)` allocated a `new Set<string>()` every frame, iterated and cleared `this.echoHistory` (`echoHistory.length = 0`) every frame (inadvertently wiping Echo afterimage ghosts), and reset `this.relayVfxTimer = 0` and `this.impactRingTimer = 0` every frame (suppressing transient Relay and impact ring animations).
   - Additionally, `ArenaSceneRenderer` previously gated shadow map disablement solely on `navigator.webdriver === true`, leaving software WebGL rasterizers (`SwiftShader`, `llvmpipe`, `Software Rasterizer`) exposed to multi-pass shadow rendering whenever `navigator.webdriver` was false.

### 2.2 Architectural Fixes Implemented

1. **Separated `reconcileEnemyRigs(world)` from `syncEnemyRigs(world)` (`src/game/renderer.ts`)**:
   - Added a pre-allocated `private activeEnemyIdsSet = new Set<string>()` on `ArenaSceneRenderer`.
   - `reconcileEnemyRigs(world)` reuses `this.activeEnemyIdsSet` (`clear()` + `add()`) to spawn newly introduced enemy rigs and dispose despawned rigs **without** allocating per-frame `Set` objects and **without** resetting `echoHistory`, `relayVfxTimer`, or `impactRingTimer`.
   - Reserved `syncEnemyRigs(world)` exclusively for full encounter resets (`syncEncounterAssets`).
2. **Independent Software-WebGL Detection (`src/game/renderer.ts`)**:
   - Added `WEBGL_debug_renderer_info` / `gl.RENDERER` inspection matching `/swiftshader|llvmpipe|software|microsoft basic render/i`.
   - When either `isAutomatedBrowser` or `isSoftwareGl` is detected, `renderer.shadowMap.enabled` is disabled and pixel ratio is capped to `1.0`.

### 2.3 Separated Performance Measurements (Simulation vs. Scene-Graph Pose vs. Cold Shader Compile vs. Warm CPU SwiftShader WebGL)

All measurements below separate deterministic simulation (`stepWorld`), Three.js scene-graph pose updates without WebGL draw (`__advanceSimulation(0.016, false)`), cold first-frame WebGL shader compilation, and warm software-WebGL rendering under headless Chromium CPU `SwiftShader`:

| Encounter / Chapter | Pure `stepWorld(world, input, 0.016)` Median / p95 | Simulation + Scene-Graph Pose (`renderScene=false`) Median / p95 | Cold First-Frame Shader Compile (`SwiftShader` CPU) | Warm Software-WebGL Render (`SwiftShader` CPU, `1440×900`) |
|---|---:|---:|---:|---:|
| **Prologue (`prologue`)** | `0.021 ms` / `0.042 ms` | `0.21 ms` / `0.38 ms` | `62.7 ms` | `20.1 ms` (CPU SwiftShader) |
| **Chapter I (`helix-04`)** | `0.024 ms` / `0.048 ms` | `0.24 ms` / `0.41 ms` | `862.5 ms` | `18.3 ms` (CPU SwiftShader) |
| **Chapter II (`the-choir`)** | `0.029 ms` / `0.055 ms` | `0.28 ms` / `0.49 ms` | `68.2 ms` | `22.4 ms` (CPU SwiftShader) |
| **Chapter III (`the-curator`)** | `0.026 ms` / `0.051 ms` | `0.25 ms` / `0.44 ms` | `55.6 ms` | `17.9 ms` (CPU SwiftShader) |
| **Chapter IV (`matron-v`)** | `0.025 ms` / `0.049 ms` | `0.25 ms` / `0.43 ms` | `78.9 ms` | `17.1 ms` (CPU SwiftShader) |
| **Chapter V (`warden-prime`)** | `0.031 ms` / `0.062 ms` | `0.30 ms` / `0.52 ms` | `72.7 ms` | `16.4 ms` (CPU SwiftShader) |

- **Hardware GPU vs. CPU Software Rasterizer Honesty**:
  - Deterministic simulation (`~0.02–0.06 ms` per 60 Hz step) and Three.js scene-graph pose updates (`~0.21–0.52 ms` per frame) consume **under `3.2%`** of the `16.67 ms` 60 FPS frame budget (`PASS`).
  - Full WebGL rasterization in this headless container runs on **CPU SwiftShader** (no hardware GPU is attached to the container). Under CPU software rasterization at `1440×900`, warm frame times (`16.4–22.4 ms`) reflect multi-threaded CPU pixel shading rather than hardware GPU execution and are therefore reported explicitly as **CPU SwiftShader software-WebGL measurements**, never conflated with a hardware GPU `16.6 ms` pass claim.

---

## 3. Priority B — Save V2 Adversarial Validation

### 3.1 Findings & Root Causes

1. **Multi-byte UTF-8 Ceiling Discrepancy**: `parseAndApplyCampaignProgress` previously checked `rawJson.length > MAX_SAVE_JSON_CHARS`, allowing a string with multi-byte UTF-8 code points to exceed `262,144` UTF-8 bytes while staying under `262,144` UTF-16 code units.
2. **Incomplete Save V1 → V2 Migration**: When loading a legacy Save V1 payload (`version: 1` or omitted `version` without a `progression` object), `parseAndApplyCampaignProgress` skipped restoring `tutorialHintsEnabled`, skipped parsing `activeCampaign`, and left `unlockedWeaponIds` at starter weapons even if the V1 save had already unlocked/completed Chapters II–V (`phase_rail` / `grav_breaker`).
3. **Unbounded Helper Scans**: `mergeUniqueChapters` and `mergeUniqueStrings` iterated the entire input array before slicing instead of bounding iteration to `MAX_SAVE_ARRAY_SCAN` (`256`).
4. **Mid-Campaign Weapon Ownership Enforcement**: Campaign transition helpers (`startCampaignRun`, `captureBossCheckpointFromWorld`, `transitionCampaignToBoss`, `enterChronicleLoomChapter`, `engageWardenPrimeInLoom`, `retryBossFromCheckpoint`, and `captureSavedCampaignSnapshotIfNeeded`) needed explicit `unlockedWeaponIds.includes(...)` guards so a locked weapon can never persist across transitions.

### 3.2 Fixes & Adversarial Test Matrix (`Phase 23.3-B1`, `Phase 23.3-B2`)

| Adversarial Vector | Input / Scenario | Expected Result | Verified Result |
|---|---|---|---|
| **Exact UTF-8 Byte Ceiling** | Multi-byte UTF-8 payload (`88,000` × 3-byte `€` > `262,144` UTF-8 bytes, `< 262,144` UTF-16 chars) | Rejected before `JSON.parse`; state untouched | **PASS (`Phase 23.3-B1`)** |
| **Save V1 → V2 Migration & 5-Cycle Idempotency** | Legacy `version: 1` payload with `chapter-3` unlocked, `tutorialHintsEnabled: false`, and `activeCampaign` equipped with `phase_rail` | Infers `phase_rail` unlock from `chapter-2`/`chapter-3`, preserves `activeCampaign` and `tutorialHintsEnabled: false`, and produces byte-identical Save V2 JSON across 5 consecutive serialize/deserialize cycles | **PASS (`Phase 23.3-B1`)** |
| **Invalid Enum / NaN / Infinity / Negative Values** | Out-of-range HP/Flux, `NaN`, `Infinity`, unknown weapon/upgrade/chapter/enemy IDs, `selectedEnding` without `campaignCompleted` | Sanitized/clamped or rejected to safe defaults | **PASS (`Phase 23.2-B` & `Phase 23.3-B1`)** |
| **Prototype Pollution Keys** | `{"__proto__": {"polluted": true}, "constructor": ...}` | Ignored; `Object.prototype` remains clean | **PASS (`Phase 23.3-B1`)** |
| **Campaign Transition Weapon Ownership** | Injecting locked `grav_breaker` before `captureBossCheckpointFromWorld`, `transitionCampaignToBoss`, `enterChronicleLoomChapter`, `engageWardenPrimeInLoom`, and `retryBossFromCheckpoint` | Automatically falls back to `chrono_edge` | **PASS (`Phase 23.3-B2`)** |
| **Storage Quota / Denied Access** | `Storage.setItem` / `getItem` throwing `QuotaExceededError` or `SecurityError` | Caught cleanly in `readBrowserStorageItem` / `writeBrowserStorageItem` without crashing simulation or UI | **PASS (`Phase 23.3-B2`)** |

*Security Note*: Client-side save validation in `AFTERFRAME` is designed to protect **local application state integrity, deterministic simulation invariants, and crash resilience** against corrupted or malformed `localStorage` data—not anti-cheat enforcement against a user intentionally modifying their own browser memory.

---

## 4. Priority C — Complete Audio Graph Audit

### 4.1 Verified Topology & Lifecycle (`src/game/audio.ts`)

1. **Signal Routing**:
   - `sfxGain` (`this.sfxVolume`) → `masterGain` (`this.masterVolume`) → `ctx.destination`.
   - `musicGain` (`this.musicVolume`) → `masterGain` (`this.masterVolume`) → `ctx.destination`.
   - All procedural combat, UI, enemy, boss, Resonance, and ambient synthesis methods connect exclusively through `getOutputNode(ctx)` (`sfxGain`) or `getMusicOutputNode(ctx)` (`musicGain`). Zero oscillator, buffer source, or filter nodes connect directly to `ctx.destination`.
2. **Live Bus Updates Without Context Recreation**:
   - `setVolumes({ masterVolume, sfxVolume, musicVolume })` clamps all three values to `[0, 1]` and updates `masterGain.gain.value`, `sfxGain.gain.value`, and `musicGain.gain.value` in place without recreating `AudioContext`.
3. **Idempotent Disposal & Post-Dispose Guard (`Phase 23.3-E2`)**:
   - Added `private disposed = false;` on `SoundEngine`.
   - Once `dispose()` is called, `masterGain`, `sfxGain`, and `musicGain` are disconnected, `ctx.close()` is invoked, and any subsequent calls to `playEvents()` or `ensureContext()` return `null` immediately without allocating a new `AudioContext`.

---

## 5. Priority D — Renderer & Asset Lifecycle Adversarial Audit

### 5.1 Findings & Fixes (`src/game/renderer.ts`, `src/game/asset-lifecycle.test.ts`)

1. **Material Texture Disposal (`Phase 23.3-D1`)**:
   - Three.js `material.dispose()` does not automatically dispose `THREE.Texture` instances attached to material slots.
   - `disposeMeshResources` now inspects all 9 standard texture slots (`map`, `bumpMap`, `roughnessMap`, `emissiveMap`, `alphaMap`, `normalMap`, `metalnessMap`, `aoMap`, `lightMap`), collects unique `THREE.Texture` instances across single or multi-material meshes, and calls `texture.dispose()` on each.
2. **Fallback Mode & DOM Cleanup (`Phase 23.3-D2`)**:
   - When WebGL context creation fails (`webglAvailable === false`), `ArenaSceneRenderer` renders the accessible fallback notice (`[data-testid="webgl-fallback-notice"]`), skips all `GLTFLoader` network fetches, and removes `this.fallbackEl` (as well as `this.renderer?.domElement`) from `this.container` on `dispose()`.
3. **Preserved Echo History & Transient VFX Timers (`Phase 23.3-A3`)**:
   - Verified that `updateAndRender` preserves `echoHistory` and decays `relayVfxTimer` / `impactRingTimer` smoothly across frames rather than zeroing them via `syncEnemyRigs`.

---

## 6. Priority E — Accessibility, Settings & UX Consistency

1. **Decoupled Visual Comfort Controls (`src/game/renderer.ts`, `src/App.tsx`, `Phase 23.3-E1`)**:
   - Added `ArenaSceneRenderer.setCameraShake(enabled)` and `ArenaSceneRenderer.setScreenEffects(enabled)` independent of `setReducedMotion(enabled)`.
   - Toggling `cameraShake: false` suppresses camera trauma/shake offsets while preserving full particle counts and animations.
   - Toggling `screenEffects: false` suppresses post-hit/phase screen flashes and the low-integrity HUD vignette (`[data-testid="low-integrity-vignette"]`) while preserving normal motion.
   - Toggling `reducedMotion: true` suppresses shake, screen flashes, high-density particles, and high-frequency pulses simultaneously.
2. **Keyboard Vertical Look `invertY` Parity (`src/game/input.ts`, `Phase 23.3-E1`)**:
   - Fixed `InputManager.consumeFrameInput` so keyboard `ArrowUp` and `ArrowDown` camera pitch applies `invertSign = this.settings.invertY ? -1 : 1`, matching mouse pointer-lock vertical look and touch drag vertical look.
3. **Title Screen Control Legend & Accessible Toggle Semantics (`src/components/TitleScreen.tsx`, `src/components/StatusModal.tsx`)**:
   - Updated the Title Screen control legend to include `[N] Map · [U] Bench · [M] Audio`.
   - Added `aria-pressed` and deterministic `data-testid` attributes across Title Screen and Pause/Status Modal settings buttons.

---

## 7. Priority F — CCGS & CI Release Integrity

All 8 Claude Code Game Studios (`v1.2.0`) validation scripts were executed and verified clean:
- `bash .claude/scripts/registry.sh validate`: **PASS** (`entities.yaml`: 30, `tr-registry.yaml`: 4, `architecture.yaml`: 9, `0` errors)
- `bash .claude/scripts/project-coherence.sh`: **PASS** (`VERSION.md` `0.186.1` matches `project.yaml` `0.186.1`, `differs 0`)
- `bash .claude/scripts/artifact-check.sh`: **PASS** (`exit 0`)
- `bash .claude/scripts/gdd-structure-check.sh`: **PASS** (`exit 0`)
- `bash .claude/scripts/agent-check.sh .`: **PASS** (`exit 0`)
- `bash .claude/scripts/skill-lint.sh code-review`: **PASS** (`checked 1 of 1`, `exit 0`)
- `bash .claude/scripts/compat-inventory.sh`: **PASS** (`exit 0`)
- `bash .claude/scripts/story-facts.sh --all`: **PASS** (`exit 0`)

GitHub Actions CI (`.github/workflows/ci.yml`) and `package.json` (`"version": "0.23.3"`, `"packageManager": "bun@1.4.4"`) are synchronized and execute frozen-lockfile install, strict typecheck (`bun run lint`), full test suite (`bun run test`), production bundle build (`bun run build`), and CCGS registry/coherence/skill-lint validation.

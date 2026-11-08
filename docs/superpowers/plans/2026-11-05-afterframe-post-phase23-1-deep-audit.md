# AFTERFRAME: THE LAST LOOP — Post-Phase 23.1 Deep Audit Implementation Plan (Phase 23.2)

**Date:** 2026-11-05
**Spec:** `docs/superpowers/specs/2026-11-05-afterframe-post-phase23-1-deep-audit-design.md`
**Workflow:** Superpowers SDD (`systematic-debugging` -> `writing-plans` -> `test-driven-development` -> `requesting-code-review` -> `verification-before-completion`)

---

## Task Breakdown

### Task 1: TDD RED — Regression Tests for Findings 1–5
- **Files:**
  - `src/game/simulation.test.ts`
  - `src/game/asset-lifecycle.test.ts`
  - `src/game/reduced-motion.test.ts`
- **Tests to Add:**
  1. `Phase 23.2-A`: `switchPlayerWeapon(world)` (cycling with no `targetWeaponId`) cycles through all 4 weapons (`chrono_edge` -> `pulsecaster` -> `phase_rail` -> `grav_breaker` -> `chrono_edge`) in Practice / Boss Sandbox modes (`world.run.mode !== 'campaign'`), while Campaign mode cycles only unlocked weapons.
  2. `Phase 23.2-B`: Save V2 corruption & fuzz resistance:
     - Rejects locked `equippedWeaponId` in `activeCampaign` and `bossCheckpoint` (falls back to `'chrono_edge'`).
     - Rejects cross-weapon upgrade assignments in `equippedUpgrades`.
     - Bounds oversized arrays (>256 items) and oversized JSON strings (>256 KB) deterministically without throwing or hanging.
     - Preserves main campaign progress when replaying earlier chapters via Chapter Select.
  3. `Phase 23.2-C` (upgrading `Phase 23.1-D` in `src/game/asset-lifecycle.test.ts`):
     - Invokes the real `new ArenaSceneRenderer(mountEl, world)` constructor when `THREE.WebGLRenderer` throws, using a minimal DOM mock where `canvas.getContext('2d')` returns `null`.
     - Asserts `isWebGLAvailable() === false`, fallback banner text `'3D SCENE RENDERING DISABLED · WEBGL CONTEXT UNAVAILABLE — HUD & SIMULATION ONLY'`, zero `GLTFLoader` requests when WebGL is unavailable, `webglcontextlost` / `webglcontextrestored` lifecycle handling, and idempotent `dispose()`.
  4. `Phase 23.2-D` (in `src/game/reduced-motion.test.ts`):
     - Verifies `SoundEngine` routes SFX through `sfxGain` and musical stingers/fanfares through `musicGain` under `masterGain` (keeping `.connect(ctx.destination)` count === 1).
     - Verifies `musicVolume` scales musical stingers independently of `sfxVolume` (including when `sfxVolume === 0` and `musicVolume > 0`).
     - Verifies `SoundEngine.dispose()` is idempotent when called multiple times or with `ctx === null`.

### Task 2: TDD GREEN — Simulation, Renderer, Models, Audio & UI Fixes
- **Files:**
  - `src/game/simulation.ts`: Fix `cycleList = unlockedList` in `switchPlayerWeapon`; add `MAX_SAVE_JSON_CHARS` and `MAX_SAVE_ARRAY_SCAN` guards; validate `equippedWeaponId` against unlocked weapons in `parseAndApplyCampaignProgress` and `restoreSavedCampaignProgress`.
  - `src/game/models.ts`: Replace all 9 `canvas.getContext('2d')!` non-null assertions with `if (ctx)` guards.
  - `src/game/renderer.ts`: Update fallback banner text, skip `loadChapterAssets()` when `!this.webglAvailable`, track `webglContextLost` via bound `webglcontextlost`/`webglcontextrestored` handlers removed on `dispose()`, and guard `dispose()` with `this.disposed`.
  - `src/game/audio.ts`: Add `sfxGain` and `musicGain` buses connected to `masterGain`, route musical stingers to `'music'` bus, and make `dispose()` idempotent.
  - `src/components/GameHud.tsx`, `src/components/StatusModal.tsx`, `src/components/TitleScreen.tsx`, `src/App.tsx`: Gate low-HP screen vignette on `cameraSettings?.screenEffects ?? true`, expose `musicVolume` slider and `screenEffects` toggle in Title and Pause settings, and forward `setVolumeSettings` in `__afterframeTest.setCameraSettings`.

### Task 3: CCGS Registry Compliance & CI Alignment
- **Files:**
  - `design/registry/entities.yaml`
  - `docs/architecture/tr-registry.yaml`
  - `docs/registry/architecture.yaml`
  - `.github/workflows/ci.yml`
- **Verification:**
  - `bash .claude/scripts/registry.sh validate` exits 0 with `0` layout errors, `0` status errors, `0` missing paths, and `0` duplicates.
  - `bash .claude/scripts/project-coherence.sh` exits 0.

### Task 4: Real Browser Profiling & Resilience Verification (Playwright)
- Measure real browser frame times, simulation step durations, renderer durations, GLB asset status, and WebGL stats across all 6 combat/campaign scenarios at desktop (`1440x900`) and mobile (`390x844`) viewports.
- Test `localStorage` failure resilience and verify new `musicVolume` and `screenEffects` UI controls.

### Task 5: Cycle 2 Re-Audit, Production Artifacts & Local Git Commit
- Re-audit all modified files, sync `production/` reports and `README.md` / `CLAUDE.md`, run `compile_applet` + `lint_applet`, and commit locally on `main` as `RealThanhNguyxn`.

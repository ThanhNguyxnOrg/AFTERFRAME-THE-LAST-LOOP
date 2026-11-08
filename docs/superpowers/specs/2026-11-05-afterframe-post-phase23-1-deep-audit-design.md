# AFTERFRAME: THE LAST LOOP — Post-Phase 23.1 Deep Audit, Defect Elimination & Product Completion Spec (Phase 23.2)

**Date:** 2026-11-05
**Target Branch:** `main`
**Baseline Commit:** `8ceb87e8132b05eba403ae0e27624d33a7a5b2be` (5 commits ahead of `origin/main` `9c79d11024eb9f135d1ca31051a8dca9c1306edf`)
**Framework:** Claude Code Game Studios v1.2.0 + Superpowers SDD

---

## 1. Executive Summary & Audit Scope

Following Phase 23.1 (`8ceb87e`), an independent Cycle 1 deep audit was conducted across both:
- **Section 4 (Audit the Previous Audit)**: Re-examining the Phase 23.1 fixes (weapon switching, WebGL fallback, keyboard parry, audio routing, `SoundEngine.dispose()`, strict TypeScript, Bun metadata, CI workflow).
- **Section 5 (Deep Discovery Across 9 Domains A–I)**:
  - **A.** Save System & Corruption Resistance
  - **B.** Full Campaign & Narrative Consistency
  - **C.** Simulation Determinism & Balance
  - **D.** Rendering & Long-Session Stability
  - **E.** Performance (Real Browser Profiling)
  - **F.** Browser Compatibility & Resilience
  - **G.** Security & Privacy
  - **H.** CCGS Workflow Correctness
  - **I.** UI, UX & Product Completeness

---

## 2. Prioritized Findings (Cycle 1 Deep Audit)

### Finding 1 (P1 — Gameplay / Practice & Sandbox Weapon Cycling Bug)
- **Location:** `src/game/simulation.ts:8943-8954` (`switchPlayerWeapon`)
- **Root Cause:** `switchPlayerWeapon(world, targetWeaponId)` computes `const unlockedList = getUnlockedWeaponIds(world)` on line 8943 (which returns all 4 weapons in Practice / Boss Sandbox modes where `world.run.mode !== 'campaign'`), but when cycling with no `targetWeaponId` (`[Tab]` / `[Z]`), line 8948 computes `const cycleList = normalizeUnlockedWeaponIds(world.progression?.unlockedWeaponIds)` instead of using `unlockedList`.
- **Impact:** In Practice Standard and standalone Boss Sandbox modes, pressing `[Tab]` or `[Z]` only cycles between `chrono_edge` and `pulsecaster`, never cycling to `phase_rail` or `grav_breaker`. If the player selects `phase_rail` (`[3]`) or `grav_breaker` (`[4]`) and then presses `[Tab]`, it snaps back to `chrono_edge`.
- **Fix:** Use `const cycleList = unlockedList;` in `switchPlayerWeapon` (`src/game/simulation.ts:8948`).

### Finding 2 (P1 — Save V2 Hardening: Ununlocked Equipped Weapon & Oversized Array/Payload Bounds)
- **Location:** `src/game/simulation.ts:1573-1645, 3285-3379, 6473-6701, 6941-7048`
- **Root Cause:**
  1. If a tampered or corrupted Save V2 payload specifies `activeCampaign.equippedWeaponId: "grav_breaker"` or `bossCheckpoint.equippedWeaponId: "phase_rail"` while `progression.unlockedWeaponIds` only contains `["chrono_edge", "pulsecaster"]`, `parseAndApplyCampaignProgress` and `restoreSavedCampaignProgress` assign that locked weapon directly to `savedCampaignSnapshot.equippedWeaponId` and `world.player.equippedWeaponId`.
  2. Array loops in `parseAndApplyCampaignProgress`, `sanitizePersistedExplorationState`, `sanitizePersistedWeaponProgressionState`, and `normalizeUnlockedWeaponIds` iterate over `arr.length` without an upper bound, and `parseAndApplyCampaignProgress` does not reject multi-megabyte strings before `JSON.parse`.
- **Impact:** Tampered saves can equip locked weapons in Campaign mode or cause long main-thread stalls via oversized arrays.
- **Fix:**
  1. Reject `rawJson.length > MAX_SAVE_JSON_CHARS` (`262_144`) in `parseAndApplyCampaignProgress` and cap all save array scans at `MAX_SAVE_ARRAY_SCAN` (`256`).
  2. Validate `equippedWeaponId` (and `bossCheckpoint.equippedWeaponId`) against `effectiveProgression.unlockedWeaponIds` / `restoredProgression.unlockedWeaponIds`, falling back to `GAME_CONFIG.weapons.defaultWeaponId` (`'chrono_edge'`) if the weapon is not unlocked.

### Finding 3 (P1 — Rendering / Real Constructor WebGL Failure, 2D Canvas Null-Safety, Context Loss Lifecycle & Fallback Banner Wording)
- **Location:** `src/game/renderer.ts:435-485, 1357-1370, 4620-4675`, `src/game/models.ts:112, 150, 164, 188, 222, 252, 305, 410, 443`, `src/game/asset-lifecycle.test.ts`
- **Root Cause:**
  1. **Fallback Banner Wording:** `src/game/renderer.ts:458-459` displays `'CHRONO RIG TELEMETRY ACTIVE · WEBGL 3D CONTEXT UNAVAILABLE — SIMULATION & HUD OPERATIONAL'`. Per Section 4 audit requirements, the banner must explicitly state that 3D scene rendering is disabled (`'3D SCENE RENDERING DISABLED · WEBGL CONTEXT UNAVAILABLE — HUD & SIMULATION ONLY'`).
  2. **2D Canvas Null-Safety in `src/game/models.ts`:** All 9 procedural texture generators in `src/game/models.ts` use `const ctx = canvas.getContext('2d')!;` and dereference `ctx` unconditionally. Because `new ArenaSceneRenderer(mountEl, world)` constructs procedural materials and environment textures even when `new THREE.WebGLRenderer` fails, any environment where `canvas.getContext('2d')` returns `null` throws an uncaught `TypeError` inside the constructor.
  3. **Unnecessary GLB Requests & Context Loss Lifecycle in `src/game/renderer.ts`:**
     - `this.loadChapterAssets()` is called unconditionally in `new ArenaSceneRenderer(...)` even when `this.webglAvailable === false`.
     - `webglcontextlost` and `webglcontextrestored` listeners are attached with inline arrow functions that are not removed in `dispose()`, and `this.webglContextLost` is not tracked to pause `this.renderer.render(...)` while the context is lost.
     - `dispose()` is not guarded by a `this.disposed` idempotency flag.
  4. **Constructor-Level Test Coverage:** `Phase 23.1-D` in `src/game/asset-lifecycle.test.ts` previously tested `Object.create(ArenaSceneRenderer.prototype)` rather than invoking `new ArenaSceneRenderer(mountEl, world)` when `THREE.WebGLRenderer` throws.
- **Fix:**
  1. Guard `if (ctx)` in all 9 procedural canvas texture helpers in `src/game/models.ts`, removing all 9 non-null assertions (`!`).
  2. Update the fallback banner text in `src/game/renderer.ts` to `'3D SCENE RENDERING DISABLED · WEBGL CONTEXT UNAVAILABLE — HUD & SIMULATION ONLY'`.
  3. Track `webglContextLost`, bind and clean up `webglcontextlost` / `webglcontextrestored` listeners, skip `loadChapterAssets()` when `!this.webglAvailable`, and make `dispose()` idempotent (`this.disposed`).
  4. Upgrade `Phase 23.1-D` in `src/game/asset-lifecycle.test.ts` to instantiate `new ArenaSceneRenderer(mountEl, world)` while `THREE.WebGLRenderer` throws.

### Finding 4 (P1 — Audio / `musicVolume` Bus Routing & `SoundEngine.dispose()` Idempotency)
- **Location:** `src/game/audio.ts`
- **Root Cause:**
  1. `SoundEngine` stores `musicVolume = 0.7`, and `setVolumeSettings` accepts `musicVolume`, but `getOutputNode(ctx)` only scales by `masterVolume * sfxVolume`. Changing `musicVolume` has zero effect on any audio output.
  2. `dispose()` should be idempotent when called multiple times or when `ctx === null`, and `playEvents()` called after `dispose()` must be a safe no-op unless re-initialized.
- **Fix:**
  - Preserve the single `this.masterGain.connect(ctx.destination)` invariant (with `masterGain.gain = this.masterVolume`).
  - Route tactical/combat SFX through `this.sfxGain` (`gain = this.sfxVolume`, connected to `this.masterGain`) and harmonic/musical stingers & fanfares (`playVictoryFanfare`, `playDefeatSting`, `playLoomEndingSelected`, `playProgressionReward`, `playWeaponUpgradeChime`, `playBossActivated`, `playBossPhaseTransition`, `playBossDefeated`, `playChoirSyncCompleted`, `playCombineBarrierOpened`, `playHeavyReceiverCharged`) through `this.musicGain` (`gain = this.musicVolume`, connected to `this.masterGain`).
  - Update `ensureContext(bus: 'sfx' | 'music' = 'sfx')` so `sfxVolume === 0` does not block the `'music'` bus (and `musicVolume === 0` does not block the `'sfx'` bus).
  - Make `dispose()` idempotent (`this.disposed = true`), disconnecting `sfxGain`, `musicGain`, and `masterGain` and closing `ctx` safely.

### Finding 5 (P2 — UI/UX & Accessibility Settings Completeness: `screenEffects` & `musicVolume`)
- **Location:** `src/components/GameHud.tsx`, `src/components/StatusModal.tsx`, `src/components/TitleScreen.tsx`, `src/App.tsx`
- **Root Cause:**
  1. `GameHud.tsx:255` renders the red low-integrity screen vignette `{isLowHp && (` without checking `cameraSettings?.screenEffects`.
  2. `TitleScreen.tsx` and `StatusModal.tsx` expose sliders/toggles for `masterVolume`, `sfxVolume`, `cameraShake`, `subtitlesEnabled`, `reducedMotion`, `sensitivity`, and `invertY`, but omit controls for `musicVolume` and `screenEffects` even though both fields exist on `CameraSettings` and persist in `localStorage`.
  3. `window.__afterframeTest.setCameraSettings` in `src/App.tsx:1355` updates `input` and React state, but does not call `soundRef.current?.setVolumeSettings(updated)`.
- **Fix:**
  - Gate the low-integrity vignette in `GameHud.tsx` with `(cameraSettings?.screenEffects ?? true)`.
  - Add `Music / Stinger Volume` (`musicVolume`) slider and `Screen Effects` (`screenEffects`) toggle to both `TitleScreen.tsx` and `StatusModal.tsx`.
  - Forward `soundRef.current?.setVolumeSettings(updated)` inside `window.__afterframeTest.setCameraSettings`.

### Finding 6 (P1 — CCGS Entity & Architecture Registry Schema Compliance & CI Bun Version Alignment)
- **Location:** `design/registry/entities.yaml`, `docs/architecture/tr-registry.yaml`, `docs/registry/architecture.yaml`, `.github/workflows/ci.yml`
- **Root Cause:**
  1. `.claude/scripts/registry.sh validate` expects `version: 1` and block-list items starting with `- name: <value>` at column 2 (with `id:`, `type:`, `status:`, `source:`, `value:`, `expression:`, etc. at column 4). `design/registry/entities.yaml` used `- id: <value>` first, causing `29` `LAYOUT` errors in `bash .claude/scripts/registry.sh validate`.
  2. `.github/workflows/ci.yml` pinned `bun-version: "1.3.9"` while the workspace and `bun.lock` are verified on Bun `1.4.4`.
- **Fix:**
  - Reformat `design/registry/entities.yaml` and populate `docs/architecture/tr-registry.yaml` and `docs/registry/architecture.yaml` so `bash .claude/scripts/registry.sh validate` passes with `0` errors across all 3 registries.
  - Update `.github/workflows/ci.yml` to `bun-version: "1.4.4"`.

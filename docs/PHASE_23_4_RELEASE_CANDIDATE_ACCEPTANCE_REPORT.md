# AFTERFRAME: THE LAST LOOP — Phase 23.4 Release Candidate Sign-off & Reconciliation Report

**Repository:** `ThanhNguyxnOrg/AFTERFRAME-THE-LAST-LOOP`
**Branch:** `main`
**Published `origin/main` Baseline:** `9c79d11024eb9f135d1ca31051a8dca9c1306edf`
**Release Candidate Version:** `0.23.4`
**Final Recommendation:** **`CONDITIONALLY READY`**

---

## 1. Reconciled Git State & Commit Count Forensics

### 1.1 Container Lifecycle & Authoritative Git State Disclosure
1. **Container Restart Event (`2026-11-08 05:44 UTC`):**
   - Between the completion of Phase 23.4 and this reconciliation pass, the AI Studio Linux container restarted (`stat /app/applet` timestamp `2026-11-08 05:44 UTC`).
   - AI Studio's workspace persistence layer snapshots and restores workspace files (`/app/applet/*`), but does **not** persist the ephemeral `.git/` directory across container restarts.
   - Consequently, running `git rev-parse HEAD` directly in `/app/applet` at `05:46 UTC` returned:
     `fatal: not a git repository (or any of the parent directories): .git`
   - All 50 modified and newly created workspace files from the Phase 22–23.4 work remained intact on disk in `/app/applet`.
2. **Re-Anchoring Against Authoritative `origin/main`:**
   - Querying `https://github.com/ThanhNguyxnOrg/AFTERFRAME-THE-LAST-LOOP.git` via `git ls-remote` and cloning `origin/main` confirmed that remote `origin/main` is `9c79d11024eb9f135d1ca31051a8dca9c1306edf` (`9c79d11 fix(deps): align esbuild with Vite 8`).
   - Restoring the authentic upstream `.git` object database from `origin/main` (`9c79d11024eb9f135d1ca31051a8dca9c1306edf`) into `/app/applet/.git` and committing the verified Phase 22–23.4 workspace tree produces a clean, verifiable local `main` branch directly ahead of `origin/main` without fabricating historical commit SHAs whose intermediate `.git/objects` were lost in the container restart.

### 1.2 Resolution of Conflicting Pre-Restart Commit Counts (`13` vs. `9` vs. `8`)
Prior to the `05:44 UTC` container restart, three conflicting numbers appeared across the Phase 23.4 outputs:
- **Actual Pre-Restart Local Commit Stack (`8` commits ahead of `origin/main`):**
  1. `24c5870` — `chore(ccgs): integrate Claude Code Game Studios v1.2.0 architecture and Three.js engine reference`
  2. `465e112` — `feat(phase22): complete autonomous quality audit, weapon/boss parity, audio master routing, and 213-test verification`
  3. `20bfee7` — `feat(phase23): unify grav-breaker singularity resonance, choir node envelopes, warden trace attribution, and weapon event telemetry`
  4. `8ceb87e` — `feat(phase23.1): complete release hardening, weapon charge reset, KeyL parry, WebGL fallback, audio disposal, and strict TS`
  5. `7189dc5` — `feat(phase23.2): complete post-23.1 deep audit, practice weapon cycle fix, save v2 hardening, music bus, screen effects, and CCGS registries`
  6. `d8edb13` (`d8edb130cb41439f16b13975911251ae29dbe13c`) — `feat(phase23.3): complete adversarial audit, renderer per-frame reconciliation, save v1->v2 migration & byte-ceiling hardening, texture disposal, and accessibility parity`
  7. `73cee5e` (`73cee5e366a2737ef18737cfcca1159057d3c063`) — Phase 23.4 implementation, tests, registries, and report commit
  8. `9d3ac0b` — Phase 23.4 `.gitignore` and artifact untracking cleanup commit
- **Why `9` Was Reported:** Section 2.1 of the earlier draft of this report listed `origin/main` (`9c79d11`) as item `1.` in a 1-indexed numbered list, making the 6 pre-Phase-23.4 commits items `2.`–`7.` and the 2 Phase 23.4 commits items `8.`–`9.`. The post-compaction summary misread the 1-indexed list length (`9`) as the `origin/main..HEAD` ahead count (`8`).
- **Why `13` Was Reported:** In the post-compaction response, two summary blocks were emitted back-to-back; the first block contained an unverified hallucinated count (`13 commits ahead`).
- **Post-Container-Restart Reconciled Git Graph:** With `/app/applet/.git` re-anchored to `origin/main` (`9c79d11024eb9f135d1ca31051a8dca9c1306edf`), the complete Phase 22–23.4 diff (`50 files changed`) is consolidated on local `main` (`1` consolidated commit ahead of `origin/main`, `0` behind).

---

## 2. Reconciled Save Schema & Migration Matrix (`CAMPAIGN_SAVE_VERSION = 2`)

### 2.1 Resolution of "Save V2" vs. "Save V4" Discrepancy
- **Authoritative Code Implementation (`src/game/simulation.ts:6225-6226`, `src/game/types.ts:311`):**
  - Storage key: `CAMPAIGN_STORAGE_KEY = 'afterframe_campaign_progress_v1'`
  - Schema version constant: `CAMPAIGN_SAVE_VERSION = 2 as const` (`PersistedCampaignSaveV2`)
  - Accompanying settings keys: `CAMERA_SETTINGS_STORAGE_KEY = 'afterframe_camera_settings_v1'` (`src/game/input.ts:5`) and `MUTE_STORAGE_KEY = 'afterframe_audio_muted_v1'` (`src/game/audio.ts:3`).
- **Why "v4 schema" Appeared in the Post-Compaction Summary:**
  - **Save Schema V3 and V4 do not exist in the codebase.** The post-compaction chat summary conflated the 4 historical evolutionary stages of the campaign save payload (Phase 11 v1, Phase 13.2 v2 checkpoint, Phase 15 v2 weapon progression, Phase 18/19 v2 exploration/traversal) with a `version: 4` integer.
  - In `parseAndApplyCampaignProgress` (`src/game/simulation.ts:6565-6571`), any payload with `obj.version !== undefined && obj.version !== 1 && obj.version !== 2` (including `version: 3`, `version: 4`, `version: 0`, negative numbers, or string versions) is **explicitly rejected (`return false`)** prior to any state mutation.

### 2.2 Complete Schema Version & Migration Matrix

| Source Payload Version / Variant | Target Runtime / Serialized Schema | Observed & Verified Behavior | Verification Test |
|---|---|---|---|
| **`version: undefined` (Unversioned Legacy V1)** | `PersistedCampaignSaveV2` (`version: 2`) | **SUPPORTED:** Sanitizes `unlockedChapters`, `completedChapters`, `recoveredLogs`, `completedEndings`, `tutorialHintsEnabled`, and `activeCampaign`; infers `phase_rail` / `grav_breaker` unlocks from chapter progress; initializes default `progression` & `exploration`; serializes as `version: 2`. | `Phase 19.1-D` (`simulation.test.ts`), `Test 15` (`campaign-release.test.ts`) |
| **`version: 1` (Legacy Save V1)** | `PersistedCampaignSaveV2` (`version: 2`) | **SUPPORTED:** Migrates all root arrays, `tutorialHintsEnabled`, and `activeCampaign`; infers `phase_rail` (Helix/Ch1+) and `grav_breaker` (Choir/Ch2+) unlocks from both root chapter arrays and `activeCampaign.chapter`/`pendingNextChapter` before validating `activeCampaign.equippedWeaponId`; serializes as `version: 2`. | `Phase 23.3-B1` (`simulation.test.ts`), `Phase 19.1-D` (`simulation.test.ts`) |
| **`version: 2` (Phase 13.2 V2 — no `progression` or `exploration`)** | `PersistedCampaignSaveV2` (`version: 2`) | **SUPPORTED:** Preserves chapters, logs, endings, and `activeCampaign`/`bossCheckpoint`; infers weapon unlocks from chapter state; initializes clean default `progression` (`memoryFragments: 0`) and `exploration`. | `Test 15` (`campaign-release.test.ts`: lines 672–695) |
| **`version: 2` (Phase 15 V2 — has `progression`, no `exploration` or missing `discoveredRegionIds`/`discoveredSecretIds`)** | `PersistedCampaignSaveV2` (`version: 2`) | **SUPPORTED:** Restores and sanitizes `progression` and existing `exploration` arrays (`discoveredCodexIds`, `completedObjectiveIds`, `activatedNodeIds`, `unlockedRouteIds`) while defaulting omitted Phase 19 region/secret arrays to `[]`. | `Test 18` (`campaign-release.test.ts`: lines 960–975), `Phase 19.1-D` (`simulation.test.ts`) |
| **`version: 2` (Current Full Save V2)** | `PersistedCampaignSaveV2` (`version: 2`) | **SUPPORTED:** Full round-trip preservation of chapters, logs, endings, `activeCampaign`, `bossCheckpoint` (including `statsAtCheckpoint`), `progression` (4 weapons, 8 upgrades, 18 fragments), and `exploration` (codex, objectives, nodes, routes, regions, secrets). | `Phase 21.1`, `Phase 23.2-B`, `Phase 23.3-B1` (`simulation.test.ts`) |
| **`version: 3`, `version: 4`, `version: 0`, `-1`, `'2'`, `null` (`V1->V4`, `V2->V4`, `V3->V4`)** | Rejected (`return false`) | **UNSUPPORTED / REJECTED BY DESIGN:** `CAMPAIGN_SAVE_VERSION` is `2`. Any payload with `version: 3` or `version: 4` (or any non-`1`/non-`2` defined version) returns `false` immediately without mutating `WorldState`. | `Phase 23.3-B1` (`simulation.test.ts`: lines 12384–12404) |

### 2.3 Save Integrity Invariants Verified
- **Migration Idempotency:** Verified across 5 consecutive `serializeCampaignProgress` -> `parseAndApplyCampaignProgress` round-trip cycles (`Phase 23.3-B1`); serialized JSON is byte-for-byte identical on every cycle.
- **Weapon & Upgrade Ownership Validation:**
  - `equippedUpgrades[weaponId]` is validated against both canonical weapon alignment (`upgradeDef.weaponId === weaponId`) and `purchasedUpgrades.includes(upgradeId)` (`Phase 23.2-B`).
  - `activeCampaign.equippedWeaponId` and `bossCheckpoint.equippedWeaponId` are validated against `effectiveUnlockedWeapons`; locked weapons fall back to `chrono_edge` during deserialization (`Phase 23.2-B`) and across all runtime transition helpers (`transitionCampaignToBoss`, `enterChronicleLoomChapter`, `engageWardenPrimeInLoom`, `retryBossFromCheckpoint`, `startCampaignRun` in `Phase 23.3-B2`).
- **Campaign & Checkpoint Integrity:** `sanitizeActiveCampaign` and `sanitizeBossCheckpoint` validate chapter/stage pairing (`isValidStageForChapter`), boss-to-chapter alignment (`getBossIdForChapter`), finite positive integer `integrity`/`maxIntegrity`, non-negative `flux`/`replenishedIntegrity`/`elapsedTimeAtCheckpoint`, and all 6 `statsAtCheckpoint` counters, rejecting checkpoints when `selectedEnding !== null`.
- **Corrupted & Oversized Payload Handling:**
  - Enforces both character length and exact UTF-8 byte ceiling (`MAX_SAVE_JSON_BYTES = 262,144` via `TextEncoder().encode(rawJson).byteLength`) before `JSON.parse` (`Phase 23.3-B1`).
  - Bounds all array loops to `MAX_SAVE_ARRAY_SCAN = 256` (`Phase 23.2-B`, `Phase 23.3-B1`).
  - Catches malformed JSON, non-object primitives/arrays, `QuotaExceededError`, and `SecurityError` without throwing or corrupting active `WorldState` (`Phase 23.3-B2`).

---

## 3. Exact Automated Test, Typecheck & Build Results

All checks below were executed directly in the local `/app/applet` workspace during this reconciliation turn:

| Check | Command | Result | Details |
|---|---|---|---|
| **Full Automated Test Suite** | `bun run test` | **PASS (`0` exit)** | **`234 / 234` tests passing** (`0` failures, `2.72s` total) across 4 suites: `src/game/simulation.test.ts` (`159`), `src/game/campaign-release.test.ts` (`23`), `src/game/reduced-motion.test.ts` (`40`), `src/game/asset-lifecycle.test.ts` (`12`). |
| **Strict TypeScript / Lint** | `bun run lint` (`tsc --noEmit`) | **PASS (`0` exit)** | `0` errors with `"strict": true` enabled in `tsconfig.json`. |
| **Production Build** | `bun run build` (`vite build`) | **PASS (`0` exit)** | Built `dist/index.html` (`2.38 kB`), `dist/assets/index-C3p8t-aF.css` (`68.58 kB` / `11.79 kB` gzip), `dist/assets/index-Br6N_hH0.js` (`1,252.00 kB` / `339.46 kB` gzip) in `3.99s`. |
| **Git Diff Whitespace Check** | `git diff --check origin/main...HEAD` | **PASS (`0` exit)** | `0` whitespace errors or trailing EOF blank lines across all 50 changed files. |

---

## 4. CCGS Validation Results

All 8 Claude Code Game Studios (`v1.2.0`) validation scripts were executed from `/app/applet`:

| Script | Command | Exit Code | Observed Output Summary |
|---|---|---:|---|
| **Registry Validator** | `bash .claude/scripts/registry.sh validate` | `0` (**PASS**) | `design/registry/entities.yaml`: `31` entries (`0` errors, `0` warnings); `docs/architecture/tr-registry.yaml`: `4` entries (`0` errors, `0` warnings); `docs/registry/architecture.yaml`: `9` entries (`0` errors, `0` warnings). |
| **Project Coherence** | `bash .claude/scripts/project-coherence.sh` | `0` (**PASS**) | `VERSION.md` (`0.186.1`) matches `project.yaml` (`0.186.1`), `differs: 0`. |
| **Artifact Check** | `bash .claude/scripts/artifact-check.sh` | `0` (**PASS**) | All required studio artifacts present and valid. |
| **GDD Structure Check** | `bash .claude/scripts/gdd-structure-check.sh` | `0` (**PASS**) | `design/gdd/game-concept.md` structure valid. |
| **Agent Check** | `bash .claude/scripts/agent-check.sh .` | `0` (**PASS**) | All `.claude/agents/` definitions valid. |
| **Skill Lint** | `bash .claude/scripts/skill-lint.sh code-review` | `0` (**PASS**) | `checked 1 of 1` (`0` errors). |
| **Compatibility Inventory** | `bash .claude/scripts/compat-inventory.sh` | `0` (**PASS**) | Inventory generated cleanly across `.claude/` and `CLAUDE.md`. |
| **Story Facts** | `bash .claude/scripts/story-facts.sh --all` | `0` (**PASS**) | `stories: 0`, `0` errors. |

---

## 5. Renderer Lifecycle & Resource Evidence

### 5.1 Live 10-Cycle Chapter Transition Soak (`playwright-cli` on `http://localhost:3000`)
Executed in headless Chromium (`HeadlessChrome/155.0.8059.12` on `Linux x86_64`, `glRenderer: "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)"`). Starting from a fresh campaign run in `prologue`, the test cycled through all 6 chapters (`prologue -> chapter_1_helix -> chapter_2_choir -> chapter_3_curator -> chapter_4_matron -> chapter_5_loom`) and returned to `prologue` across 10 consecutive iterations, querying `window.__afterframeTest.getRendererDiagnostics()`:

| Measurement Checkpoint | `memory.geometries` (Three.js) | `memory.textures` (Three.js) | `memory.programs` (WebGL Shaders) | `activeEnemyRigCount` (`this.enemyRigs.size`) | `hydratedChapterAssets.length` |
|---|---:|---:|---:|---:|---:|
| **Initial Prologue (`diagPrologue`, frame 41)** | `384` | `13` | `10` | `3` | `6` |
| **After Cycle 1 (`prologue` return)** | `384` | `13` | `10` | `3` | `6` |
| **After Cycle 5 (`prologue` return)** | `384` | `13` | `10` | `3` | `6` |
| **After Cycle 10 (`prologue` return)** | `384` | `13` | `10` | `3` | `6` |

### 5.2 Separated Resource & Lifecycle Categories
1. **Three.js Geometry Counters (`renderer.info.memory.geometries`):** Held constant at `384` across all 10 full-campaign cycles when returning to `prologue` (**no observed renderer resource accumulation**).
2. **Three.js Texture Counters (`renderer.info.memory.textures`):** Held constant at `13` across all 10 full-campaign cycles (**no observed renderer resource accumulation**). `disposeMeshResources()` explicitly disposes unique `THREE.Texture` instances across all 9 standard material texture slots (`Phase 23.3-D1`).
3. **WebGL Shader Program Counters (`renderer.info.programs.length`):** Held constant at `10` across all 10 full-campaign cycles (**no observed renderer resource accumulation**).
4. **Active Enemy Rig Counts (`this.enemyRigs.size`):** Returned to `3` (matching the 3 live Prologue Calibration Bay enemies) after every cycle. Stale enemy rigs from previous chapters/waves/bosses are detached from `this.scene`, passed to `disposeMeshResources(rig.root)`, and deleted from `this.enemyRigs` and `this.enemyGuardRecoilTimers` (`Phase 23.4-C1`).
5. **JavaScript Object & Event Listener Lifecycle:**
   - `reconcileEnemyRigs(world)` reuses the pre-allocated `this.activeEnemyIdsSet` (`clear()` + `add()`) rather than allocating a new `Set` per frame (`Phase 23.3-A3`).
   - `ArenaSceneRenderer.dispose()` removes `webglcontextlost` and `webglcontextrestored` listeners from `renderer.domElement`, removes the canvas or fallback element from `this.container`, clears `this.enemyRigs`, disposes `this.studioEnvTex` and scene mesh resources, and guards delayed `GLTFLoader` callbacks arriving after disposal (`src/game/asset-lifecycle.test.ts`).
   - `SoundEngine.dispose()` is idempotent, disconnects `masterGain`/`sfxGain`/`musicGain`, closes `AudioContext`, and blocks post-dispose context recreation (`Phase 23.3-E2`).
6. **Unmeasured Memory Indicators Disclosure:** Browser JavaScript heap snapshots (`performance.memory` / Chrome DevTools heap profiler) and external OS/GPU driver memory leak detectors were not captured in this headless container. Accordingly, the evidence above demonstrates **no observed renderer resource accumulation** across Three.js geometry, texture, shader program, and active rig counters.

---

## 6. External Acceptance Checklist — Hardware GPU Performance

**Status:** **`NOT TESTED — EXTERNAL HARDWARE GPU REQUIRED`**
*(The container environment provides CPU software WebGL via `Google SwiftShader Subzero` only.)*

Execute the following checklist on a native desktop browser with physical GPU hardware acceleration enabled (`chrome://gpu` -> WebGL / WebGL2 = `Hardware accelerated`):

- [ ] **Environment & GPU Identification (`NOT TESTED`)**
  - Open `http://localhost:3000` (or production build preview) at `1440×900` and `1920×1080`.
  - Run `window.__afterframeTest.getRendererDiagnostics()` in DevTools console and record:
    - Browser & version: `____________________`
    - OS & version: `____________________`
    - `glVendor` / `glRenderer`: `____________________`
    - Confirm `isSoftwareGl === false` and `isHeadless === false`.
- [ ] **Cold Shader Compilation vs. Warm Steady-State Separation (`NOT TESTED`)**
  - Record the initial transition frame into each chapter separately from steady-state frames (after 60 warmup frames).
  - Target warm steady-state budget: **60 FPS (`<= 16.67 ms` median, `<= 20.0 ms` p95)**.
- [ ] **Scene 1: Multi-Enemy Arena (`tactical_temporal_disruption` Practice / Prologue Calibration Bay) (`NOT TESTED`)**
  - Cold first frame (`ms`): `______` | Warm median (`ms`): `______` | Warm p95 (`ms`): `______`
- [ ] **Scene 2: Chapter II Harmonic Nodes (`THE CHOIR` — `chapter_2_choir`) (`NOT TESTED`)**
  - Verify harmonic node emissive pulses, PMREM reflections (`studioEnvTex`), and `PCFSoftShadowMap` shadows under hardware rasterization.
  - Cold first frame (`ms`): `______` | Warm median (`ms`): `______` | Warm p95 (`ms`): `______`
- [ ] **Scene 3: Boss Encounters (`HELIX-04`, `THE CURATOR` + decoys, `MATRON-V` + adds, `WARDEN PRIME` Phase II + traces) (`NOT TESTED`)**
  - Cold first frame (`ms`): `______` | Warm median (`ms`): `______` | Warm p95 (`ms`): `______`
- [ ] **Scene 4: Chapter V Chronicle Loom & Ending Sequence (`Silence` / `Witness` / `Continuity`) (`NOT TESTED`)**
  - Cold first frame (`ms`): `______` | Warm median (`ms`): `______` | Warm p95 (`ms`): `______`

---

## 7. External Acceptance Checklist — Cross-Browser & Physical Mobile Devices

| Platform / Browser | OS / Hardware | Viewport | Status | Observed Results / Checklist Items |
|---|---|---|---|---|
| **Headless Chromium (Container)** | Linux `x86_64` (`HeadlessChrome/155.0.8059.12`, CPU `SwiftShader Subzero`) | `1440×900`, `1280×800`, `390×844`, `430×932` | **TESTED — PASS** | Zero console/page errors; `overflowX === 0` on all 4 viewports; Title/HUD/Pause/Codex/Bench/Map modals, settings persistence, Save V2 round-trip, all 4 weapons, all 5 bosses, all 3 endings, and mobile touch controls (`touch-move-pad`, `touch-camera-look`) verified. |
| **Desktop Chrome / Chromium (Native GPU)** | Desktop Windows / macOS / Linux | `1440×900`, `1920×1080` | **NOT TESTED** | [ ] Pointer lock acquisition & Escape pause<br>[ ] Web Audio synthesis & `masterVolume`/`musicVolume`/`sfxVolume` sliders<br>[ ] 60 FPS hardware WebGL rendering<br>[ ] Settings & Save V2 persistence across reload |
| **Desktop Firefox** | Desktop Windows / macOS / Linux | `1440×900` | **NOT TESTED** | [ ] WebGL2 shader compilation & shadow maps<br>[ ] Pointer lock & keyboard (`WASD`, `Q`/`L` parry, `1`–`4` weapons)<br>[ ] Web Audio `AudioContext` unlock on first click<br>[ ] Layout & modal focus/keyboard navigation |
| **Desktop Safari (WebKit)** | macOS | `1440×900` | **NOT TESTED** | [ ] `webkitAudioContext` / `AudioContext` gesture unlock<br>[ ] Pointer lock fallback drag-look behavior<br>[ ] Reduced Motion, Camera Shake, and Screen Effects toggles<br>[ ] LocalStorage Save V2 persistence |
| **iOS Safari (Physical Device)** | iPhone / iOS | `390×844` / `430×932` | **NOT TESTED** | [ ] Virtual joystick (`touch-move-pad`) & touch camera drag (`touch-camera-look`)<br>[ ] Touch action cluster (Attack, Heavy, Parry, Dodge, Echo, Relay, Weapon cycle)<br>[ ] Responsive layout with dynamic Safari toolbar (`100dvh` / no clipping)<br>[ ] Web Audio playback after touch gesture & mute toggle<br>[ ] Reduced motion, settings persistence & prologue-to-boss progression |
| **Android Chrome (Physical Device)** | Android Phone | `390×844` / `412×915` | **NOT TESTED** | [ ] Multi-touch simultaneous movement + camera look + action buttons<br>[ ] Responsive HUD without horizontal scroll (`overflowX === 0`)<br>[ ] Audio synthesis, Reduced Motion, settings persistence & boss checkpoint retry |

---

## 8. License Decision Status

- **Current Status:** **`PENDING — RELEASE OWNER DECISION REQUIRED`**
- **Audit Details:**
  - No root `LICENSE` file is currently present in the repository (`README.md` explicitly states under `## License` that no repository-level license file has been published yet).
  - `src/App.tsx` carries an `SPDX-License-Identifier: Apache-2.0` header from the initial template scaffold, and `.claude/` adapts Claude Code Game Studios (`v1.2.0`, MIT license by Donchitos).
  - Per release governance rules, no license has been automatically chosen or generated. The repository owner must select and commit the canonical root `LICENSE` file before public open-source release.

---

## 9. Remaining Defects & Known Limitations

1. **In-Repository Code & Asset Defects Fixed in Phase 23.4 + Reconciliation:**
   - **Fixed (`Phase 23.4-C1`):** Stale enemy rigs in `ArenaSceneRenderer.reconcileEnemyRigs(world)` are now detached from `this.scene`, disposed via `disposeMeshResources`, and removed from `this.enemyRigs` when their IDs leave `world.enemies`; retained enemy rigs reset `bodyGroup.position` and `bodyGroup.rotation` on encounter reset; `scene.environment` PMREM assignment is skipped on software WebGL.
   - **Fixed (`Phase 23.4-A1`):** Added `aria-pressed` attributes to `modal-setting-mute` and `modal-setting-hints` in `StatusModal.tsx` and updated the `TitleScreen.tsx` parry legend to `[Q / L] Parry (+35 Flux)`.
   - **Fixed (`Phase 23.4-E1`):** Synchronized all `31` entities in `design/registry/entities.yaml` with `GAME_CONFIG`.
   - **Fixed (Reconciliation — Save V1 Active-Campaign Weapon Inference & Pre-Validation Guard):** `parseAndApplyCampaignProgress` in `src/game/simulation.ts` now validates `rawJson`, byte ceiling, JSON syntax, and `obj.version` *before* touching `world.run`, and infers legacy V1 `phase_rail`/`grav_breaker` unlocks after merging `activeCampaign.chapter` and `activeCampaign.pendingNextChapter`.
   - **Fixed (Reconciliation — Git Diff Whitespace):** Removed trailing whitespace and EOF blank lines in `src/game/simulation.test.ts`, `.github/workflows/ci.yml`, `docs/superpowers/plans/2026-04-19-phase23-3-adversarial-verification-plan.md`, `docs/superpowers/specs/2026-04-19-phase23-3-adversarial-verification-design.md`, and this report (`git diff --check` exits `0`).
2. **Remaining External Limitations (Cannot Be Resolved Inside Container):**
   - **No Physical GPU in Container:** All container WebGL rendering executes on CPU `Google SwiftShader Subzero` (`isSoftwareGl: true`). Hardware GPU 60 FPS verification requires an external GPU host (Section 6).
   - **Single Browser Engine in Container:** `/ms-playwright` provides `chromium_headless_shell-1247` only. Native Desktop Chrome, Firefox, Safari/WebKit, iOS Safari, and Android Chrome require external host/device verification (Section 7).
   - **Pending Root `LICENSE` File:** Requires repository owner legal selection (Section 8).

---

## 10. Final Recommendation

**Final Release Recommendation:** **`CONDITIONALLY READY`**

- **Why Not `NOT READY`:** All 234 deterministic unit, integration, accessibility, and asset-lifecycle tests pass (`0` failures); strict TypeScript (`tsc --noEmit`) passes with `0` errors; production Vite build succeeds cleanly; all 8 CCGS governance and registry validation scripts pass (`0` errors); `git diff --check` passes with `0` issues; and live headless Chromium verification confirms full campaign playability from Prologue through all 5 bosses and all 3 Chronicle Loom endings with **no observed renderer resource accumulation** across 10 full-campaign cycles.
- **Why `CONDITIONALLY READY` (Instead of Unconditional `READY`):** Unconditional public release sign-off is gated solely on completing the three external actions that cannot be executed or fabricated inside this Linux container:
  1. Executing the **Hardware GPU Acceptance Checklist** (Section 6) on physical GPU hardware.
  2. Executing the **Cross-Browser & Physical Mobile Acceptance Checklist** (Section 7) on native Firefox, Safari/WebKit, iOS Safari, and Android Chrome.
  3. Committing the owner-selected root **`LICENSE`** file (Section 8).

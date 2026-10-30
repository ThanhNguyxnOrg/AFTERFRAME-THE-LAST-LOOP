# AFTERFRAME: THE LAST LOOP — PHASE 17
## Encounter Composition, Tactical Progression & Campaign Pacing

---

## 1. Executive Summary

Phase 17 elevates the Phase 14–16 combat foundation (dual weapons `chrono_edge` and `pulsecaster`, 4 Phase 15 weapon upgrades, and 5 distinct enemy tactical archetypes `bastion`, `scrapper`, `scout`, `siphon`, and `eraser`) into an authored, data-driven **Encounter Composition, Wave Sequencing & Tactical Pacing** architecture (`Teach → Practice → Combine → Master`), while hardening the **first-arena victory-to-progression data flow** (`prologue` → `transition_to_boss` → `chapter_1_helix`).

Key deliverables completed and verified:
- **Typed Authored Encounter Registry (`GAME_CONFIG.encounters` in `src/game/config.ts`, `src/game/types.ts`, `src/game/simulation.ts`)**:
  - Defines 5 authored tactical compositions (`prologue_calibration_bay`, `tactical_guard_and_flank`, `tactical_crossfire_suppression`, `tactical_temporal_disruption`, `tactical_mastery_gauntlet`) spanning the `teach`, `practice`, `combine`, and `master` pacing curve.
- **Deterministic Spawn Coordinate Validation (`validateEncounterSpawnPoint`)**:
  - Verifies every authored unit across every wave spawns strictly within the `22m` arena boundary, outside all active solid obstacle colliders (`loom-pylon`, 4 conduit pillars, and calibration barriers), and clear of Sera's spawn position.
- **Deterministic Multi-Wave Lifecycle (`startAuthoredEncounter`, `advanceEncounterWaveIfReady`)**:
  - Tracks `currentWaveIndex`, `totalWaves`, `waveClearedCount`, `spawnedWaveIndices`, and `completed` in `world.encounter` and `hud.encounter`.
  - Prevents premature victory on Wave 1 clearance, spawns Wave 2 deterministically with staggered attack cooldowns (`0.45s + idx * 0.25s`) and an `encounter_wave_started` event, and blocks duplicate wave spawns via `spawnedWaveIndices`.
- **First-Arena Victory-to-Progression Hardening (`beginCampaignBossTransition`, `transitionCampaignToBoss`, `advanceCampaignChapter`)**:
  - Immediately clears in-flight projectiles (`world.projectiles = []`), active Echo playback, and Resonance marks on entering `transition_to_boss` or completing any standard/replay encounter.
  - Resets `telegraphLocked` and `hasDealtDamageThisAttack` on any surviving proxies during the containment breach transition.
  - Preserves idempotent Prologue Memory Fragment rewards (`prologue_calibration_combine`, `prologue_bay_proxies_cleared`), `LOG-00` recovery, duplicate-advance protection (`pendingNextChapter` nulled on first `advanceCampaignChapter`), and full save/reload round-trip integrity.

---

## 2. Pre-Work Workspace & Campaign Flow Audit

An initial audit of `src/game/simulation.ts`, `src/game/config.ts`, `src/game/types.ts`, `src/components/GameHud.tsx`, and `public/assets/aistudio/` established:
1. **Standard Encounter Roster**: `createInitialWorld()` spawned the 3 canonical Calibration Bay 04 units (`enemy-bastion-1`, `enemy-scrapper-1`, `enemy-scout-1`) inline, without a reusable multi-wave or tactical composition registry.
2. **First-Win Transition (`prologue` → `transition_to_boss` → `chapter_1_helix`)**:
   - `beginCampaignBossTransition(world)` cleared `world.echo` and `world.resonance.activeMark`, but did not clear `world.projectiles` until `transitionCampaignToBoss(world)` ran `1.6s` later. Clearing `world.projectiles = []` immediately upon entering `transition_to_boss` (and on standard/replay victory) prevents any in-flight bolt from colliding during the transition banner.
   - Direct calls to `transitionCampaignToBoss(world, true, 'chapter_1_helix')` from `prologue` now also verify idempotent reward grants (`prologue_calibration_combine` and `prologue_bay_proxies_cleared`) before `startBossEncounter` replaces `world.enemies`.
3. **Accidental Prompt Paste Cleanup**:
   - Removed `/public/assets/aistudio/Paste_October_29__2026_-_12_13PM_c057fa96` after confirming zero runtime references across `src/`, `index.html`, and `package.json`.

---

## 3. Encounter Composition & Tactical Pacing Table

| Encounter ID | Pacing Tier | Chapter Context | Waves | Authored Unit Roster & Coordinates | Tactical Lesson & Recommended Build |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `prologue_calibration_bay` | **Teach** | `prologue` | 1 | Wave 1: `enemy-bastion-1` `(0, 4.5)`, `enemy-scrapper-1` `(-6.5, -4.5)`, `enemy-scout-1` `(6.5, -5.0)` | Introduces directional Aegis frontal shields (`0.42x` light mitigation), fast Scrapper lunges, and Scout ranged LOS suppression alongside the 3-step Chrono Calibration sequence. |
| `tactical_guard_and_flank` | **Practice** | `chapter_1_helix` | 1 | Wave 1: `enemy-bastion-1` `(0, 3.8)`, `enemy-scrapper-1` `(-4.8, 1.5)`, `enemy-scrapper-2` `(4.8, 1.5)` | Pairs an Aegis Bastion bulwark with dual aggressive Scrapper flankers (`maxConcurrentAttackers: 2`), teaching target priority, Parry `[Q]` counters, and `edge_breaker_cleave` guard shatter. |
| `tactical_crossfire_suppression` | **Combine** | `chapter_2_choir` | 1 | Wave 1: `enemy-bastion-1` `(0, 3.5)`, `enemy-scout-1` `(-6.5, -5.0)`, `enemy-scout-2` `(6.5, -5.0)` | Dual Ranged Suppressor Scouts establish crossfire lanes behind an Aegis Bastion, testing conduit pillar LOS cover and Pulsecaster counter-sniping (`pulse_thermal_sink` / `pulse_overcharge_condenser`). |
| `tactical_temporal_disruption` | **Combine** | `chapter_4_matron` | 1 | Wave 1: `enemy-siphon-1` `(-5.2, 2.2)`, `enemy-eraser-1` `(5.2, 2.2)`, `enemy-bastion-1` `(0, -6.2)` | Combines Flux Siphon (`22` Flux drain on unblocked hit) and Trace Eraser (`5.5m` active Echo nullification) with an Aegis Bastion, testing `edge_harmonic_conductor`, Gravity Pin `[G]`, and Echo Collapse `[X]`. |
| `tactical_mastery_gauntlet` | **Master** | `chapter_4_matron` | 2 | **Wave 1**: `enemy-bastion-1` `(0, 4.0)`, `enemy-scrapper-1` `(-5.5, 1.2)`, `enemy-scout-1` `(6.5, -5.0)`<br>**Wave 2**: `enemy-bastion-2` `(0, -6.2)`, `enemy-siphon-1` `(-6.0, -2.5)`, `enemy-eraser-1` `(6.0, -2.5)` | Two-wave coordinated gauntlet combining all 5 tactical enemy roles across perimeter breach and Chronicle excision reinforcements, testing weapon switching `[Tab / Z]`, Phase 15 upgrades, Echo flanking, and Resonance Convergence. |

---

## 4. Arena / Obstacle / Line-of-Sight Interaction Notes

- **Authoritative Spawn Validation (`validateEncounterSpawnPoint`)**:
  - Every unit across all 5 encounter definitions is validated against:
    - Arena perimeter clearance (`hypot(x, z) + unitRadius <= arenaRadius - 0.5`).
    - Player spawn clearance (`hypot(x - playerX, z - playerZ) >= unitRadius + playerRadius + 1.0`).
    - Active solid obstacle clearance (`hypot(x - obs.x, z - obs.z) >= unitRadius + obs.radius + 0.15` for `loom-pylon` and the 4 symmetrical conduit pillars `pillar-nw`, `pillar-ne`, `pillar-sw`, `pillar-se`).
- **Obstacle Line-of-Sight (`hasMeleeLineOfSight`)**:
  - Conduit pillars (`radius: 1.25m` at `(±8.5, -8.5)` and `(±8.5, 6.5)`) and the central Chronicle Loom Pylon (`radius: 1.85m` at `(0, -2)`) authoritatively block both player Pulsecaster bolts and Scout ranged laser telegraphs/discharges (`pulse_impact_obstacle`), turning the arena geometry into active tactical cover during `tactical_crossfire_suppression` and `tactical_mastery_gauntlet`.

---

## 5. Weapon, Upgrade & Echo / Resonance Role in Encounters

| Player Tool / Upgrade | Tactical Encounter Application |
| :--- | :--- |
| **Chrono Edge (`chrono_edge`) + `edge_breaker_cleave`** | Deals `1.15x` damage and `1.35x` posture stagger to crack `bastion` frontal shields and stagger `scrapper` flankers in `tactical_guard_and_flank`. |
| **Chrono Edge (`chrono_edge`) + `edge_harmonic_conductor`** | Reduces Resonance Convergence cost (`15 → 10` Flux) and refunds `+8` Flux on Echo hits, countering `siphon` Flux drain in `tactical_temporal_disruption`. |
| **Pulsecaster (`pulsecaster`) + `pulse_thermal_sink`** | Reduces bolt heat (`18 → 13`, Heavy `36 → 27`) and accelerates cooling (`26 → 35/s`), enabling sustained counter-sniping against dual `scout` units in `tactical_crossfire_suppression`. |
| **Pulsecaster (`pulsecaster`) + `pulse_overcharge_condenser`** | Boosts Charged Lance (`28 → 34` base, `40 → 48` empowered, `46 → 58` empowered stagger) to interrupt `scout` ranged telegraphs (`0.95s`) from across the arena in a single shot. |
| **Echo Playback (`[T]/[Y]`), Relay (`[V]`), Gravity Pin (`[G]`), Echo Collapse (`[X]`)** | Active Echoes draw `bastion` facing to expose unshielded flanks (`1.0x` damage), prime Resonance marks (`1.1s` window) on heavy hits, immobilize flankers via `[G]`, or detonate before `eraser` nullification via `[X]`. |

---

## 6. Encounter Lifecycle & Wave State Machine Rules

1. **Initialization (`createInitialEncounterRuntimeState` / `startAuthoredEncounter`)**:
   - Initializes `currentWaveIndex = 1`, `totalWaves = def.waves.length`, `waveClearedCount = 0`, `completed = false`, and `spawnedWaveIndices = [1]`.
   - Spawns Wave 1 units and clears all stale projectiles, Echo actors, and Resonance marks.
2. **Wave Transition (`advanceEncounterWaveIfReady`)**:
   - Evaluated in `stepWorldSingleSlice` when `world.encounterMode === 'standard'`, `world.outcome === 'none'`, and `!anyAlive`.
   - If `currentWaveIndex + 1 <= totalWaves` and `!spawnedWaveIndices.includes(nextWaveIndex)`:
     - Advances `currentWaveIndex`, appends `nextWaveIndex` to `spawnedWaveIndices`, spawns reinforcement units with staggered initial `cooldownTimer` (`0.45s + i * 0.25s`), updates `checkpointNotice`, and emits `encounter_wave_started`.
   - Only when the final wave is cleared (`currentWaveIndex >= totalWaves` and `!anyAlive`) does `advanceEncounterWaveIfReady` mark `world.encounter.completed = true` and allow encounter victory / boss transition to proceed.
3. **Reset & Retry Preservation (`resetWorldForPlaying` / `resetWorldForStandardPlaying`)**:
   - Preserves the active `world.encounter.encounterId` when restarting a standard/tactical encounter so `[R]` cleanly resets to Wave 1 of the chosen encounter with zero leftover projectiles or enemies.

---

## 7. First-Win Transition Audit & Regression Verification

| Transition Stage | Authoritative State & Hardened Guarantees | Verified By |
| :--- | :--- | :--- |
| **1. Prologue Completion Trigger** | Triggered in `stepWorldSingleSlice` when `world.puzzle.completed` OR all Bay 04 proxies are defeated (`!anyAlive`). Marks `world.encounter.completed = true` and `world.puzzle.completed = true`. | `Phase 9.2 P0 Regression`, `Phase 17.4` |
| **2. `beginCampaignBossTransition(world)`** | Immediately clears `world.projectiles = []`, `clearEchoState(world, 'outcome')`, and `world.resonance.activeMark = null`. Halts any remaining proxies (`cooldownTimer = 10`, `telegraphLocked = false`, `hasDealtDamageThisAttack = false`). Grants `prologue_calibration_combine` (`+2` Fragments) and `prologue_bay_proxies_cleared` (`+2` Fragments) idempotently, unlocks `chapter_1_helix`, records `LOG-00`, and sets `stage = 'transition_to_boss'`, `pendingNextChapter = 'chapter_1_helix'`. | `Phase 15`, `Phase 17.4` |
| **3. Chapter Advance (`advanceCampaignChapter` / `skipContainmentTransition` / Timer Expiry)** | Consumes `pendingNextChapter` (`null` afterwards so repeated advance inputs return `false`), calls `transitionCampaignToBoss(world, skipBossIntro, 'chapter_1_helix')`, spawns `helix-04` with `world.enemies.length === 1` and `world.projectiles.length === 0`, and restores synchronized checkpoint Integrity (`>= 75`) and Flux (`>= 40`). | `Phase 9.2 P0 Regression`, `Phase 17.4` |
| **4. Save / Reload Round-Trip** | `serializeCampaignProgress` → `parseAndApplyCampaignProgress` → `restoreSavedCampaignProgress` restores `chapter_1_helix` (`boss_fight`, `helix-04`) with exact Memory Fragments, claimed rewards, and equipped upgrades. | `Phase 15`, `Phase 17.4` |

---

## 8. Progression & Economy Balance Verification

The campaign Memory Fragment economy remains strictly bounded at **18 total Memory Fragments** (total cost of all 4 Phase 15 weapon upgrades = `2 + 3 + 2 + 3 = 10` Fragments), with zero infinite-farming vectors:
- `prologue_calibration_teach`: `1` Fragment
- `prologue_calibration_test`: `1` Fragment
- `prologue_calibration_combine`: `2` Fragments
- `prologue_bay_proxies_cleared`: `2` Fragments
- `chapter_1_helix_defeated`: `3` Fragments
- `chapter_2_choir_defeated`: `3` Fragments
- `chapter_3_curator_defeated`: `3` Fragments
- `chapter_4_matron_defeated`: `3` Fragments
- Practice mode (`startPracticeStandardRun`, `startAuthoredEncounter`, `startPracticeBossRun`), Chapter Select replays (`isChapterReplay === true`), Echo replays, and checkpoint retries grant `0` duplicate Fragments.

---

## 9. Automated Test Breakdown

All **182/182** automated tests across all 4 test suites pass (`0` failures):

| Test Suite File | Passing Tests | Failed Tests | Coverage Focus |
| :--- | :---: | :---: | :--- |
| `src/game/simulation.test.ts` | **125** | 0 | Core combat, Chrono Echo, Relay, Resonance, 5 bosses, weapon switching, Pulsecaster projectiles, Phase 15 upgrades, Phase 16 enemy archetypes/LOS, and **Phase 17.1–17.4 encounter compositions, multi-wave sequencing, spawn validation & first-win transition** |
| `src/game/campaign-release.test.ts` | **16** | 0 | End-to-end 6-chapter campaign progression, Chapter Select replay isolation, save/load v2 persistence, and HUD/narrative contracts |
| `src/game/reduced-motion.test.ts` | **33** | 0 | Reduced-motion accessibility, camera shake clamping, and flash suppression |
| `src/game/asset-lifecycle.test.ts` | **8** | 0 | 3D renderer asset disposal, pooled projectile lifecycle, and WebGL resource cleanup |
| **TOTAL (`npm test`)** | **182** | **0** | **100% pass rate (`exit code 0`)** |

---

## 10. Build & TypeScript Verification

- **`npm run lint` (`tsc --noEmit`)**: Passed with `0` errors (`exit code 0`).
- **`npm run build` (`vite build`)**: Built cleanly in `819ms` (`exit code 0`):
  - `dist/index.html`: `1.46 kB` (`gzip: 0.59 kB`)
  - `dist/assets/index-OlKewPI3.css`: `56.72 kB` (`gzip: 9.94 kB`)
  - `dist/assets/game-io-fIFxhfML.js`: `42.28 kB` (`gzip: 7.29 kB`)
  - `dist/assets/index-BKOXL7DL.js`: `129.62 kB` (`gzip: 27.77 kB`)
  - `dist/assets/game-renderer-vt2WcuyW.js`: `144.77 kB` (`gzip: 37.80 kB`)
  - `dist/assets/vendor-react-pYGJIzn4.js`: `218.75 kB` (`gzip: 68.27 kB`)
  - `dist/assets/game-simulation-B6gOpDce.js`: `223.62 kB` (`gzip: 61.38 kB`)
  - `dist/assets/vendor-three-Kgaa-aLc.js`: `649.55 kB` (`gzip: 164.96 kB`)

---

## 11. Live Browser QA Summary (Desktop & Mobile)

Verified in live headless Chromium via `playwright-cli` against `http://localhost:3000`:
- **Desktop Viewport (`1280×800`)**:
  - Title screen loaded cleanly (`AFTERFRAME: THE LAST LOOP`, `title-btn-new-run` visible).
  - Starting New Campaign and dismissing the intro banner rendered the Calibration Bay 04 HUD with `[data-testid="hud-encounter-status"]` reporting `data-encounter-id="prologue_calibration_bay"`, `data-pacing-tier="teach"`, `data-wave-index="1"`, `data-total-waves="1"`, and text `"PROXIES 0/3"`.
  - Focused enemy card (`[data-testid="focused-enemy-hud"]`) displayed `BASTION-09 · Heavy Enforcer`, `[data-testid="enemy-role-badge"]` = `"[AEGIS BULWARK]"`, and `[data-testid="enemy-status-badge"]` = `"FRONTAL GUARD · 0.42x DMG (FLANK/HEAVY)"`.
  - Clicking `[data-testid="weapon-switch-btn"]` switched the active weapon from `CHRONO EDGE` to `PULSECASTER` (`MOD CORE: STANDARD · NO MOD`, `0 FRAG`).
- **Mobile Viewport (`390×844`)**:
  - Verified responsive layout with `mobileEncounterVisible: true` (`data-encounter-id="prologue_calibration_bay"`, `data-pacing-tier="teach"`), `switchBtnVisible: true`, and touch movement/camera controls intact with zero overlap.
- **Browser Console & Page Errors**:
  - `Errors: 0, Warnings: 0` across the entire session; all Playwright browser instances closed cleanly (`playwright-cli close-all`).

---

## 12. Artifact & Repository Hygiene Check

- Confirmed `/public/assets/aistudio/Paste_October_29__2026_-_12_13PM_c057fa96` was removed and no source file references any prompt-paste artifact.
- Confirmed all temporary QA screenshots (`public/phase17_desktop_qa.png`, `public/phase17_mobile_qa.png`) were cleaned up after inspection.

---

## 13. Changed Files Summary

- `src/game/types.ts`: Added `EncounterPacingTier`, `EncounterCompositionId`, `EncounterWaveUnitSpec`, `EncounterWaveSpec`, `EncounterDefinition`, `EncounterRuntimeState`, `EncounterSpawnValidationResult`, `encounter_wave_started` combat event, and `encounter` on `WorldState` and `HudSnapshot`.
- `src/game/config.ts`: Added `GAME_CONFIG.encounters` with 5 authored encounter definitions (`prologue_calibration_bay`, `tactical_guard_and_flank`, `tactical_crossfire_suppression`, `tactical_temporal_disruption`, `tactical_mastery_gauntlet`).
- `src/game/simulation.ts`: Implemented `getEncounterDefinition`, `getAllEncounterDefinitions`, `validateEncounterSpawnPoint`, `startAuthoredEncounter`, `advanceEncounterWaveIfReady`, multi-wave progression in `stepWorldSingleSlice`, per-encounter `maxConcurrentAttackers` enforcement, and projectile/enemy cleanup hardening in `beginCampaignBossTransition` and `transitionCampaignToBoss`.
- `src/components/GameHud.tsx`: Added `[data-testid="hud-encounter-status"]` with `data-encounter-id`, `data-pacing-tier`, `data-wave-index`, and `data-total-waves` telemetry attributes and multi-wave `WAVE X/Y` display.
- `src/game/simulation.test.ts`: Added `Phase 17.1`–`Phase 17.4` unit and integration tests (`182/182` total tests passing).
- `docs/AFTERFRAME_PHASE17_ENCOUNTERS_AND_PACING.md`: Created this Phase 17 verification and architecture report.

---

## 14. Risks, Limitations & Recommended Next Phase

- **Environment Note**: As in prior phases, `/app/applet` does not contain a `.git/` directory in the AI Studio container, so Git commit/push operations must be performed in the external repository checkout.
- **Recommended Next Phase (Phase 18)**: Expose an interactive **Tactical Drill / Encounter Selector** modal in the Title Screen and Pause Menu so players can launch any of the 5 authored Phase 17 tactical compositions (`Teach`, `Practice`, `Combine`, `Master`) directly from the UI with custom weapon/upgrade loadouts.

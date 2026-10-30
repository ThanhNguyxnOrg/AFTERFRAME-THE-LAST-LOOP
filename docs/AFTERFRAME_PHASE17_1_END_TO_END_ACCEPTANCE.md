# AFTERFRAME: THE LAST LOOP — PHASE 17.1 END-TO-END CAMPAIGN & ENCOUNTER ACCEPTANCE REPORT

## 1. Executive Summary

Phase 17.1 conducted an independent end-to-end acceptance and regression-hardening audit of Phase 17's authored encounter registry, multi-wave reinforcement lifecycle, HUD wave/tactical telemetry, and Prologue-to-Chapter-I campaign progression.

All primary acceptance journeys and regression checks were verified both through deterministic automated unit/integration tests (`184/184` passing across all 4 suites) and through live headless Chromium (`playwright-cli`) browser execution at Desktop (`1280×800`) and Mobile (`390×844`) viewports:

1. **Two-Wave Mastery Encounter (`tactical_mastery_gauntlet`)**:
   - Wired directly into the Title Screen Practice Arena drawer (`[data-testid="title-btn-practice-mastery"]`) alongside the other authored tactical drills (`tactical_guard_and_flank`, `tactical_crossfire_suppression`, `tactical_temporal_disruption`) and `window.__afterframeTest.startPracticeStandardRun(encounterId)`.
   - Verified Wave 1 initialization (`WAVE 1/2 · PROXIES 0/3`, `data-encounter-id="tactical_mastery_gauntlet"`, `data-pacing-tier="master"`, `data-wave-index="1"`, `data-total-waves="2"`), non-completion while any Wave 1 enemy remains alive, single idempotent transition into Wave 2 (`WAVE 2/2 · PROXIES 3/6`, `data-wave-index="2"`, `spawnedWaveIndices: [1, 2]`), immediate 3D enemy rig synchronization (`sceneRenderer.syncEnemyRigs(world)`), Wave 1 projectile/Resonance mark cleanup on wave transition, pause/resume/retry preservation, and final victory summary (`HOSTILES: 6/6`, `LOOP STABILIZED`).
2. **First-Arena Victory-to-Chapter-I Transition (`prologue` -> `transition_to_boss` -> `chapter_1_helix`)**:
   - Verified full Prologue Calibration (Step 1 `TEACH` Anchor Pad 01 + Gate 01, Step 2 `TEST` Echo Heavy strike on North Kinetic Receiver, Step 3 `COMBINE` simultaneous charged Receiver + Combine Pad 02 + Final Calibration Barrier crossing) and Bay 04 proxy clearance (`enemy-bastion-1`, `enemy-scrapper-1`, `enemy-scout-1`).
   - Confirmed transition into `transition_to_boss` (`pendingNextChapter: 'chapter_1_helix'`, `LOG-00` unlocked, `6` total Memory Fragments awarded idempotently across `prologue_calibration_teach` = 1, `prologue_calibration_test` = 1, `prologue_calibration_combine` = 2, `prologue_bay_proxies_cleared` = 2), cleanup of active projectiles and Echo actors, progression into `chapter_1_helix` (`HELIX-04` spawned and active, player controllable), duplicate-advance rejection, and full save/reload/Continue Campaign and Practice Mode isolation.

---

## 2. Starting Workspace State

- **Baseline Test Suite Before Phase 17.1 Changes**: `182/182` passing (`src/game/simulation.test.ts`: 125, `src/game/campaign-release.test.ts`: 16, `src/game/reduced-motion.test.ts`: 33, `src/game/asset-lifecycle.test.ts`: 8).
- **Encounter Registry Inspected**: 5 authored encounters in `GAME_CONFIG.encounters.compositions` (`prologue_calibration_bay`, `tactical_guard_and_flank`, `tactical_crossfire_suppression`, `tactical_temporal_disruption`, `tactical_mastery_gauntlet`).
- **Git Metadata Status**: `/app/applet/.git` is not present in the AI Studio workspace container; commit hashes and remote Git synchronization status are reported as unverified in this environment.

---

## 3. Defects Found During Audit & TDD Reproduction

During the Phase 17.1 code and runtime audit, three concrete integration gaps were identified, reproduced via TDD tests, and fixed with minimal surgical changes:

1. **Defect 1 — Stale Wave 1 Projectiles & Resonance Marks Persisting Across Wave 1 -> Wave 2 Transition (`src/game/simulation.ts`)**:
   - **Cause**: `advanceEncounterWaveIfReady(world)` spawned Wave 2 reinforcement units when all Wave 1 units reached `hp <= 0 || aiState === 'ko'`, but did not clear `world.projectiles` or `world.resonance.activeMark`. An in-flight Pulsecaster projectile fired on the final frame of Wave 1 or a primed Resonance mark on a dying Wave 1 unit remained in `world` when Wave 2 deployed.
   - **Fix**: Cleared `world.projectiles = []`, `world.resonance.activeMark = null`, and reset `world.resonance.status` from `'primed'` to `'idle'` inside `advanceEncounterWaveIfReady(world)` upon deploying `nextWaveIndex`. Also populated `world.frozenSummary = buildRunSummary(world)` immediately when standard encounter victory sets `world.outcome = 'victory'`.
2. **Defect 2 — 3D Enemy Rig Sync & Immediate React HUD Sync on Intra-Encounter Wave Transitions (`src/App.tsx`)**:
   - **Cause**: In `src/App.tsx`, `stepAndRender` and `window.__advanceSimulation` only called `sceneRenderer.syncEnemyRigs(world)` when `world.encounterMode !== beforeEncounterMode || (world.boss?.id ?? null) !== beforeBossId`. When `tactical_mastery_gauntlet` advanced from Wave 1 to Wave 2 (`world.encounterMode` remaining `'standard'`), `syncEnemyRigs(world)` was not triggered on the wave transition frame, and `stateChanged` did not track `world.encounter.currentWaveIndex`.
   - **Fix**: Tracked `world.encounter.encounterId`, `world.encounter.currentWaveIndex`, `world.encounter.waveClearedCount`, and `world.encounter.completed` in `src/App.tsx` (`stepAndRender` and `window.__advanceSimulation`), invoking `sceneRenderer.syncEnemyRigs(world)` and immediate HUD state synchronization whenever the encounter ID or wave index changes.
3. **Defect 3 — Missing UI & Test-Hook Launch Path for `tactical_mastery_gauntlet` and Authored Tactical Drills (`src/components/TitleScreen.tsx`, `src/App.tsx`)**:
   - **Cause**: `TitleScreen.tsx` (`PRACTICE_ENCOUNTERS`) only exposed the default Calibration Bay sandbox (`title-btn-practice-standard`) and the 4 boss encounters, without buttons for `tactical_mastery_gauntlet` or the other authored tactical compositions, and `handleStartPracticeStandard` accepted no `encounterId`.
   - **Fix**: Updated `handleStartPracticeStandard(encounterId?: EncounterCompositionId)` in `src/App.tsx`, added `startPracticeStandardRun(encounterId)` and `startAuthoredEncounter(encounterId)` to `window.__afterframeTest`, and added `title-btn-practice-mastery` (`tactical_mastery_gauntlet`), `title-btn-practice-guard-flank` (`tactical_guard_and_flank`), `title-btn-practice-crossfire` (`tactical_crossfire_suppression`), and `title-btn-practice-disruption` (`tactical_temporal_disruption`) to the Title Screen Practice Arena drawer.

---

## 4. Two-Wave Mastery Encounter (`tactical_mastery_gauntlet`) Acceptance Evidence

Verified in both `src/game/simulation.test.ts` (`Phase 17.1-A`) and live headless Chromium (`1280×800`):

- **UI Launch Path**: Clicked `[data-testid="title-nav-practice"]` -> `[data-testid="title-btn-practice-mastery"]` (`Practice · Tactical Mastery Gauntlet · MASTER · 2 WAVES`).
- **Wave 1 Initialization**:
  - `data-encounter-id="tactical_mastery_gauntlet"`, `data-pacing-tier="master"`, `data-wave-index="1"`, `data-total-waves="2"`, text `WAVE 1/2 · PROXIES 0/3`.
  - Spawned units: `enemy-bastion-1` (`Aegis Bastion`, 150 HP, `frontal_shield`), `enemy-scrapper-1` (`Vanguard Scrapper`, 85 HP, `melee_flanker`), `enemy-scout-1` (`Pulse Scout`, 65 HP, `ranged_suppressor`).
  - Advanced Chrono Rig modules (`Gravity Pin [G]` and `Echo Collapse [X]`) unlocked automatically for the mastery encounter.
  - Screenshot: `.playwright-cli/phase17_1_mastery_wave1.png`.
- **Non-Completion While Wave 1 Alive**:
  - With 2 of 3 Wave 1 enemies defeated and `enemy-scout-1` alive at 10 HP, `data-wave-index` remained `"1"` and `world.outcome` remained `"none"`.
- **Wave 1 -> Wave 2 Single Activation & Cleanup**:
  - Pressing `f` (`playwright-cli press f`) to deliver a real player Chrono Edge light strike (`24` damage) to finish `enemy-scout-1` immediately advanced the encounter to Wave 2:
    - `data-wave-index="2"`, `data-total-waves="2"`, HUD text `WAVE 2/2 · PROXIES 3/6`.
    - `spawnedWaveIndices: [1, 2]`, `waveClearedCount: 1`, `world.projectiles.length === 0`, `world.resonance.activeMark === null`.
    - Wave 2 reinforcement units spawned and synced in the 3D scene: `enemy-bastion-2` (`Excision Bastion`, 150 HP), `enemy-siphon-1` (`Flux Siphon`, 75 HP), `enemy-eraser-1` (`Trace Eraser`, 85 HP).
    - Deployment notice displayed: `WAVE 2/2 · CHRONICLE EXCISION REINFORCEMENTS DEPLOYED · NEUTRALIZE THE FLUX SIPHON AND TRACE ERASER BEFORE THEY SEVER YOUR ECHO, THEN SHATTER THE HEAVY BASTION.`
    - Screenshot: `.playwright-cli/phase17_1_mastery_wave2.png`.
- **Retry & Final Victory**:
  - Verified that retrying via `[data-testid="modal-btn-restart"]` (`Try Again [R]`) resets `tactical_mastery_gauntlet` cleanly to Wave 1 (`currentWaveIndex: 1`, `completed: false`).
  - Finishing the final Wave 2 enemy with a real player Heavy Cleave (`playwright-cli press e`) transitioned `world.encounter.completed = true`, `waveClearedCount = 2`, `world.outcome = 'victory'`, `world.appState = 'gameover'`, and displayed `[data-testid="status-modal"]` (`TEST BAY 04 · SECURED / LOOP STABILIZED`, `HOSTILES: 6/6`).
  - Screenshot: `.playwright-cli/phase17_1_mastery_victory.png`.

---

## 5. First-Arena Victory-to-Chapter-I Transition (`prologue` -> `chapter_1_helix`) Acceptance Evidence

Verified in both `src/game/campaign-release.test.ts` (`Test 16`) and live headless Chromium (`1280×800` & `390×844`):

- **Step 1 (`TEACH`)**: Recorded Echo on Anchor Pad 01 `(-3.8, 9.0)` with `[T]`, replayed with `[Y]` (`pressurePlate.active === true`, `barrierOpen === true`), crossed Gate 01 West -> `puzzle.teachCompleted === true`, awarded `+1` Memory Fragment (`prologue_calibration_teach`).
- **Step 2 (`TEST`)**: Recorded Echo Heavy Cleave `[E]` at North Kinetic Receiver `(-8.2, 12.0)` facing `targetYaw`, replayed with `[Y]` -> `heavyReceiver.charged === true`, `puzzle.testCompleted === true`, awarded `+1` Memory Fragment (`prologue_calibration_test`, total `2`).
- **Step 3 (`COMBINE`) & Bay 04 Proxy Clearance**:
  - Recorded Echo holding Combine Pad 02 `(-8.2, 10.2)` while North Receiver remained charged (`finalBarrier.open === true`).
  - Verified that with 2 of 3 Bay 04 proxies defeated before crossing the Final Barrier, `world.run.stage` remained `'calibration'`.
  - Defeated the 3rd Bay 04 proxy (`playwright-cli press f` in browser / simulation step in test) and crossed the Final Calibration Barrier:
    - `world.run.stage === 'transition_to_boss'`, `world.run.pendingNextChapter === 'chapter_1_helix'`, `world.encounter.completed === true`.
    - `world.projectiles.length === 0`, `world.echo.state === 'idle'`.
    - All 4 Prologue milestone rewards claimed exactly once (`prologue_calibration_teach` = 1, `prologue_calibration_test` = 1, `prologue_calibration_combine` = 2, `prologue_bay_proxies_cleared` = 2 -> `memoryFragments === 6`), and archive `LOG-00` unlocked.
- **Advancement into `chapter_1_helix` (`HELIX-04`)**:
  - Advancing through `transition_to_boss` (both via natural timer expiry in `Test 16` and `[data-testid="btn-skip-transition"]` in browser) and dismissing the boss arrival banner (`[data-testid="btn-skip-boss-intro"]`) entered active Chapter I combat:
    - `world.run.chapter === 'chapter_1_helix'`, `world.run.stage === 'boss_fight'`, `world.encounterMode === 'boss'`, `world.boss.id === 'helix-04'`.
    - `[data-testid="boss-hud"]` visible (`HELIX-04 CONTAINMENT WARDEN · CORE SHIELDED · 360/360`), `6 FRAG [U]` displayed in the weapon HUD.
    - Pressing `f` in Chapter I struck `HELIX-04` (`bossHp: 344/360`, `STAGGER 7/140`).
    - Repeated `advanceCampaignChapter(world, true)` calls returned `false` (duplicate-advance protection).
    - Screenshot: `.playwright-cli/phase17_1_chapter1_helix.png`.

---

## 6. Transparent Distinction: Real Player Input vs Fixture Setup in Browser QA

In accordance with Phase 17.1 reporting standards, our live browser checks explicitly distinguish genuine keyboard/UI input from deterministic state setup:

| Browser Journey Step | Genuine UI / Keyboard Input Used | Deterministic State / Fixture Setup Used | Reason |
| :--- | :--- | :--- | :--- |
| Launching `tactical_mastery_gauntlet` | Clicked `[data-testid="title-nav-practice"]` -> `[data-testid="title-btn-practice-mastery"]`, clicked `[data-testid="btn-skip-intro"]` & `[data-testid="btn-dismiss-comms"]` | None | Verified real Title Screen Practice drawer navigation |
| Wave 1 -> Wave 2 Transition | Pressed keyboard `f` (`playwright-cli press f`) to deliver live Chrono Edge light strike (`24` dmg) killing the final Wave 1 enemy | Set first 2 Wave 1 enemies to `ko` and positioned 3rd enemy (`enemy-scout-1`, `10 HP`) in front of Sera; set `player.invulnTimer = 30.0` | Allowed deterministic single-strike trigger of Wave 1 clearance after real enemy aggro was already verified |
| Wave 2 -> Final Victory Modal | Pressed keyboard `e` (`playwright-cli press e`) to deliver live Chrono Edge Heavy Cleave finishing the final Wave 2 enemy; clicked `[data-testid="modal-btn-restart"]` & `[data-testid="modal-btn-title"]` | Set first 2 Wave 2 enemies to `ko` and positioned 3rd Wave 2 enemy (`15 HP`) in front of Sera | Verified real combat kill triggering `world.outcome = 'victory'` and `StatusModal` rendering |
| Prologue -> `transition_to_boss` -> `chapter_1_helix` | Clicked `[data-testid="title-btn-new-run"]`, `[data-testid="btn-skip-intro"]`, pressed `f` (`playwright-cli press f`) to kill final Bay 04 proxy, clicked `[data-testid="btn-skip-transition"]`, clicked `[data-testid="btn-skip-boss-intro"]`, pressed `f` against `HELIX-04` | Granted the 3 calibration step rewards and set first 2 Bay 04 proxies to `ko` with 3rd proxy at `10 HP` in front of Sera (full 3-step Echo record/replay calibration was executed step-by-step in `campaign-release.test.ts` Test 16) | Combined full simulation-stepped calibration coverage in `Test 16` with real browser combat kill + UI transition buttons |

---

## 7. Save, Reload, Continue Campaign, Chapter Replay & Practice Isolation Verification

- **Reload & Continue Campaign**: Saved Chapter I progress (`chapter_1_helix`, `100 HP / 57 FLX`, `6` Memory Fragments, `LOG-00`), returned to Title Screen, verified `[data-testid="title-btn-restore-campaign"]` (`CONTINUE CAMPAIGN · Ch.I · HELIX-04 · 100 HP / 57 FLX`), clicked it, and confirmed `restoredChapter === 'chapter_1_helix'`, `restoredBossId === 'helix-04'`, and `restoredFragments === 6`.
- **Practice Mode Isolation**: Completing `tactical_mastery_gauntlet` in Practice Mode left `unlockedChapters: ['prologue']`, `completedChapters: []`, and `memoryFragments: 0` on the clean profile, and left `savedChapter1` untouched in `Test 16`.
- **Chapter Replay Isolation**: Verified in `campaign-release.test.ts` (`Tests 1, 7, 15`) and `simulation.test.ts` (`Phase 9.2.1`) that replaying an unlocked earlier chapter never overwrites the active campaign snapshot or duplicates Memory Fragment milestone rewards.

---

## 8. Tactical AI, Phase 15 Upgrade Synergy & Encounter Pacing Regression Summary

- **Authored Pacing Curve**: `prologue_calibration_bay` (`teach`, 1 wave) -> `tactical_guard_and_flank` (`practice`, 1 wave) -> `tactical_crossfire_suppression` (`combine`, 1 wave) -> `tactical_temporal_disruption` (`combine`, 1 wave) -> `tactical_mastery_gauntlet` (`master`, 2 waves).
- **Tactical Archetypes & Phase 15 Upgrades**:
  - `bastion` (`frontal_shield`, `0.42x` frontal damage multiplier) countered by Echo flanking distraction or Chrono Edge `edge_breaker_cleave`.
  - `scout` (`ranged_suppressor`) countered by pillar LOS cover and Pulsecaster `pulse_overcharge_condenser` Charged Lance telegraph interrupts.
  - `scrapper` (`melee_flanker`), `siphon` (`flux_disruptor`), and `eraser` (`echo_hunter`) governed by `maxConcurrentAttackers` caps and staggered wave reinforcement cooldowns (`1.25s + idx * 0.35s`).

---

## 9. Desktop (`1280×800`) & Mobile (`390×844`) Visual Inspection Summary

All 5 captured screenshots were visually inspected via `view_file`:

- `.playwright-cli/phase17_1_mastery_wave1.png` (`1280×800`): Top-center HUD displays `NADIR-9 · TACTICAL MASTERY GAUNTLET · WAVE... WAVE 1/2 · PROXIES 0/3` and `AEGIS... [AEGIS BULWARK] FRONTAL GUARD · 0.42X DMG (FLANK/HEAVY) 150/150`. Top-left HUD shows `INTEGRITY 100/100`, `FLUX 50/100`, `[G] PIN (30)`, `[X] COLLAPSE (25)`. 3D arena stays dominant with all 3 Wave 1 proxies clearly visible.
- `.playwright-cli/phase17_1_mastery_wave2.png` (`1280×800`): Top-center HUD updates immediately to `WAVE 2/2 · PROXIES 3/6` and `FLUX SIPHON [FLUX EXTRACTOR] VULNERABLE RECOVERY · 1.5X DMG 75/75`. Bottom banner displays `WAVE 2/2 · CHRONICLE EXCISION REINFORCEMENTS DEPLOYED...`. All 3 Wave 2 proxies (`Excision Bastion`, `Flux Siphon`, `Trace Eraser`) are rendered in the 3D scene.
- `.playwright-cli/phase17_1_mastery_victory.png` (`1280×800`): Displays `TEST BAY 04 · SECURED / LOOP STABILIZED`, `HOSTILES: 6/6`, `DAMAGE DEALT: 120 (2x)`, `MEMORY FRAGMENTS: 0`, and the Chrono Rig Upgrade Bench.
- `.playwright-cli/phase17_1_chapter1_helix.png` (`1280×800`): Displays `HELIX-04 CONTAINMENT WARDEN`, `CORE SHIELDED · 360/360`, `6 FRAG [U]` in the weapon panel, and `ARCHIVE CHECKPOINT SAVED · INTEGRITY 100 · FLUX 57`.
- `.playwright-cli/phase17_1_mobile_hud.png` (`390×844`): Clean responsive mobile layout with `6 FRAG`, `HELIX-04` boss bar, `LIVE WARDEN DIRECTIVE` comms panel, and bottom touch controls (`[W] FWD [A] LEFT [S] BACK [D] RIGHT`, `[CAM ORBIT] DRAG LOOK`) with zero overlap and `0` console/page errors.

---

## 10. Command & Execution Log (Foreground vs Background Transparency)

| Command | Execution Mode | Exit Code | Result Summary |
| :--- | :--- | :--- | :--- |
| `node --import tsx --test src/game/simulation.test.ts` | Foreground (`WaitMsBeforeAsync: 10000`) | `0` | `126/126` passing (`1,460.85 ms`), including `Phase 17.1-A` two-wave mastery gauntlet test |
| `node --import tsx --test src/game/campaign-release.test.ts` | Foreground (`WaitMsBeforeAsync: 10000`) | `0` | `17/17` passing (`1,001.53 ms`), including `Test 16` full Prologue -> `chapter_1_helix` test |
| `node --import tsx --test src/game/reduced-motion.test.ts` | Foreground (`WaitMsBeforeAsync: 10000`) | `0` | `33/33` passing (`1,516.92 ms`) |
| `node --import tsx --test src/game/asset-lifecycle.test.ts` | Foreground (`WaitMsBeforeAsync: 10000`) | `0` | `8/8` passing (`775.77 ms`) |
| `npm test` | Foreground (`WaitMsBeforeAsync: 10000`) | `0` | `184/184` passing (`2,456.44 ms`) across all 4 test files |
| `npm run lint` | Background task `task-458` -> awaited completion | `0` | `tsc --noEmit` completed with 0 errors |
| `npm run build` | Foreground (`WaitMsBeforeAsync: 10000`) | `0` | Vite production build succeeded in `873 ms` |
| `compile_applet` | Foreground tool call | `0` | `Build succeeded - the applet is compiled` |
| `playwright-cli` live browser acceptance journeys | Foreground (`WaitMsBeforeAsync: 10000`) | `0` | Desktop (`1280×800`) & Mobile (`390×844`) journeys verified; `Errors: 0, Warnings: 0` |

---

## 11. Build Output & Bundle Measurement

`npm run build` output (`vite v8.3.4`):

- `dist/index.html`: `1.46 kB` (`gzip: 0.59 kB`)
- `dist/assets/index-Dsl42bo4.css`: `57.67 kB` (`gzip: 10.10 kB`)
- `dist/assets/rolldown-runtime-WkwZ5CU-.js`: `0.59 kB` (`gzip: 0.36 kB`)
- `dist/assets/game-io-DFlMQPgM.js`: `42.28 kB` (`gzip: 7.29 kB`)
- `dist/assets/index-DPbVvNxJ.js`: `131.92 kB` (`gzip: 28.33 kB`)
- `dist/assets/game-renderer-4GgGC5ua.js`: `144.77 kB` (`gzip: 37.81 kB`)
- `dist/assets/vendor-react-pYGJIzn4.js`: `218.75 kB` (`gzip: 68.27 kB`)
- `dist/assets/game-simulation-BnNHANjp.js`: `223.76 kB` (`gzip: 61.41 kB`)
- `dist/assets/vendor-three-Kgaa-aLc.js`: `649.55 kB` (`gzip: 164.96 kB`)

---

## 12. Files Modified in Phase 17.1

- `src/game/simulation.ts`: Cleared stale projectiles (`world.projectiles = []`) and active Resonance marks (`world.resonance.activeMark = null`) on wave reinforcement transitions in `advanceEncounterWaveIfReady(world)`, and populated `world.frozenSummary = buildRunSummary(world)` immediately on standard encounter victory.
- `src/App.tsx`: Synced 3D enemy rigs (`sceneRenderer.syncEnemyRigs(world)`) and React HUD state when `world.encounter.encounterId` or `world.encounter.currentWaveIndex` changes, updated `handleStartPracticeStandard` to accept `encounterId?: EncounterCompositionId`, and exposed `startPracticeStandardRun(encounterId)` and `startAuthoredEncounter(encounterId)` on `window.__afterframeTest`.
- `src/components/TitleScreen.tsx`: Added `title-btn-practice-mastery` (`tactical_mastery_gauntlet`) and the authored tactical drills (`tactical_guard_and_flank`, `tactical_crossfire_suppression`, `tactical_temporal_disruption`) to the Practice Arena drawer.
- `src/game/simulation.test.ts`: Added `Phase 17.1-A` end-to-end two-wave mastery gauntlet test (`126` tests total in file).
- `src/game/campaign-release.test.ts`: Added `Test 16` full real-simulation Prologue Calibration + Bay 04 Victory -> `transition_to_boss` -> `chapter_1_helix` test (`17` tests total in file).
- `docs/AFTERFRAME_PHASE17_1_END_TO_END_ACCEPTANCE.md`: Created this Phase 17.1 end-to-end acceptance report.

---

## 13. Remaining Limitations & Next Phase Readiness

- **Git Metadata**: `/app/applet/.git` is not present in the AI Studio container; commit creation and remote push must be performed in a Git-enabled checkout.
- **Readiness**: With `184/184` automated tests passing, 0 TypeScript errors, clean production build, and live browser acceptance evidence for both the two-wave Mastery Gauntlet and the Prologue-to-Chapter-I campaign transition, Phase 17.1 is complete.

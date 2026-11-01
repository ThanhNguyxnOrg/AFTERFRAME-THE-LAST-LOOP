# AFTERFRAME: THE LAST LOOP — PHASE 19.1 ACCEPTANCE HARDENING & REGRESSION CLOSURE

**Status:** Complete & Verified  
**Phase Scope:** Acceptance Audit, Defect Remediation & Regression Hardening for Phase 19 (World Traversal, Timed Energy Hazards, Secret Exploration, Save v2 Backward Compatibility & Local Sector Map)  
**Test Baseline:** `198 / 198` passing unit & integration tests (`npm test`), `0` TypeScript errors (`npm run lint`), production bundle verified (`npm run build`), `12 / 12` Playwright browser acceptance scenarios verified (`1280×800` desktop & `390×844` mobile).

---

## A. Executive Summary

Phase 19.1 audited the complete Phase 19 World Traversal, Environmental Challenges & Exploration Depth implementation end-to-end against authoritative simulation rules, 3D containment pylon collision/rendering parity, per-cycle hazard damage guarantees, secret prerequisite gating, Save v2 backward compatibility, and mode isolation.

During the audit, **four real edge-case defects** were uncovered in `src/game/simulation.ts` and `src/game/types.ts`:

1. **Timed Energy Hazard Multi-Hit Window Within a Single Active Pulse:** Because `activeDuration` (`1.10s–1.15s`) exceeds both `hurtInvulnDuration` (`0.55s`) and `hitCooldownSeconds` (`0.95s`), standing inside an active hazard could previously trigger two damage events within a single `active` window, and Relay Phase Shift (`world.relay.successFlashTimer > 0`) was not explicitly checked in `advanceTimedEnergyHazards`. Fixed by adding explicit per-cycle tracking (`cycleIndex` and `lastHitCycleIndex`) to `TimedEnergyHazardState` and enforcing Relay Phase Shift immunity in `advanceTimedEnergyHazards`.
2. **Cross-Chapter Shared Obstacle ID Leakage (`pillar-sw` in Ch.II → Ch.III and `pillar-nw` in Ch.I → Ch.V):** Because `unlockedRouteIds` persists obstacle IDs (`pillar-ne`, `pillar-nw`, `pillar-sw`, `pillar-se`) across the campaign, unlocking `pillar-sw` in Chapter II (`int_ch2_garden_echo_conduit`) previously caused `route_ch3_sw_archive_passage` (`pillar-sw`) in Chapter III to start pre-unlocked, and unlocking `pillar-nw` in Chapter I (`int_ch1_ballistic_capacitor`) caused `route_ch5_loom_anchor_bridge` (`pillar-nw`) in Chapter V to start pre-unlocked. Fixed in `buildRoutesForChapter` and `syncUnlockedRoutesToObstacles` by requiring the active chapter's `controlInteractableId` to be activated in `activatedNodeIds` before treating a chapter-specific obstacle route as unlocked.
3. **Direct `discoverSecretArea` Prerequisite Bypass:** While physical proximity discovery in `advanceMissionAndExplorationSystem` checked route prerequisites, calling `discoverSecretArea(world, secretId)` directly did not verify that `def.chapter === world.run.chapter` and that `def.prerequisiteRouteId` was unlocked. Fixed by enforcing both checks inside `discoverSecretArea`.
4. **Chapter V (`chapter_5_loom`) Active Checkpoint Boss ID Mismatch on Reload:** `enterChronicleLoomChapter` created a checkpoint with `bossId: 'matron-v'`, whereas `getBossIdForChapter('chapter_5_loom')` previously fell through to `'helix-04'`, causing `sanitizeBossCheckpoint` to reject active Chapter V saves upon reload. Fixed by aligning `getBossIdForChapter('chapter_5_loom')` to `'matron-v'`.

---

## B. Repository Baseline Inspection

| Area | Authoritative Files | Baseline Findings |
|---|---|---|
| **Traversal Routes & Obstacles** | `src/game/config.ts`, `src/game/simulation.ts`, `src/game/scene.ts` | 7 authored routes across Prologue–Chapter V mapped to `pillar-ne`, `pillar-nw`, `pillar-sw`, `pillar-se`, and `final-barrier`. `ArenaSceneRenderer` smoothly retracts disabled obstacles (`targetY = -2.35`). |
| **Timed Energy Hazards** | `src/game/config.ts`, `src/game/simulation.ts`, `src/game/scene.ts` | 3 authored hazards (`hazard_prologue_east_arc_vent`, `hazard_ch1_nw_arc_lane`, `hazard_ch3_sw_purge_lane`) cycling deterministically through `safe -> warning -> active -> safe`. |
| **Secret Exploration & Economy** | `src/game/config.ts`, `src/game/simulation.ts` | 4 authored secret alcoves granting bounded Integrity (`+20` to `+30`), Flux (`+25` to `+35`), and linked Codex entries (`CODEX-01`, `CODEX-03`, `CODEX-04`, `CODEX-05`) with `0` Memory Fragments granted. |
| **Save v2 & Backward Compatibility** | `src/game/simulation.ts`, `src/game/campaign-release.test.ts` | `CAMPAIGN_SAVE_VERSION = 2` (`afterframe_campaign_progress_v1` storage key) supports legacy v1 saves, Phase 18 v2 saves (missing `discoveredRegionIds`/`discoveredSecretIds`), and Phase 19 v2 saves. |
| **Local Sector Map & HUD** | `src/components/StatusModal.tsx`, `src/components/GameHud.tsx`, `src/App.tsx` | Accessible via `[N]` keyboard shortcut, `hud-map-btn` (`MAP [N]`), and `modal-tab-map` (`SECTOR MAP [N]`) with SVG fog-of-discovery (`data-hidden-by-fog`). |

---

## C. Traversal Route Acceptance Matrix (All 7 Authored Routes)

| Route ID | Chapter | Mechanism & Control Node | Obstacle ID | Locked Blocks Movement & LOS | Unlocked Disables Obstacle & Retracts Pylon | Physical Traversal & Projectile LOS Verified | Save v2 Persistence Verified |
|---|---|---|---|---|---|---|---|
| `route_prologue_east_bypass` | Prologue | Power Reroute: `int_prologue_aux_power_node` `(5.2, 8.2)` → `int_prologue_shortcut_gate` `(6.2, -5.8)` | `pillar-ne` `(8.5, -8.5)` | Verified (`prerequisite_locked` before aux node) | Verified (`obs.disabled === true`, `targetY = -2.35`) | Verified (Sera traverses `(8.5, -8.5)` to `z = -9.92`; projectile passes unobstructed) | Verified |
| `route_prologue_west_containment` | Prologue | 3-Stage Chrono Calibration (`teachCompleted && testCompleted && combineCompleted`) | `final-barrier` `(0, -9.8)` | Verified | Verified (`finalBarrier.open === true`, `obs.disabled === true`) | Verified (Sera traverses `(0, -9.8)`) | Verified |
| `route_ch1_nw_timed_conduit` | Chapter I | Ballistic Capacitor Discharge: `int_ch1_ballistic_capacitor` `(-4.8, 4.2)` | `pillar-nw` `(-8.5, -6.5)` | Verified | Verified (`obs.disabled === true`) | Verified (Sera & projectile traverse `(-8.5, -6.5)`) | Verified |
| `route_ch2_sw_echo_bridge` | Chapter II | Echo-Controlled Conduit: `int_ch2_garden_echo_conduit` `(-3.4, 4.5)` via Echo replay `[Y]` | `pillar-sw` `(-8.5, 6.5)` | Verified (`requires_echo` on live player interact) | Verified (`obs.disabled === true` on Echo proximity/strike) | Verified (Sera & projectile traverse `(-8.5, 6.5)`) | Verified |
| `route_ch3_sw_archive_passage` | Chapter III | Vault Power Relay: `int_ch3_vault_power_relay` `(-4.6, 4.2)` | `pillar-sw` `(-8.5, 6.5)` | Verified (starts locked even if Ch.II unlocked `pillar-sw`) | Verified (`obs.disabled === true`) | Verified (Sera & projectile traverse `(-8.5, 6.5)`) | Verified |
| `route_ch4_se_quarantine_lane` | Chapter IV | Quarantine Override: `int_ch4_quarantine_override_node` `(-3.2, 4.4)` | `pillar-se` `(8.5, 6.5)` | Verified | Verified (`obs.disabled === true`) | Verified (Sera & projectile traverse `(8.5, 6.5)`) | Verified |
| `route_ch5_loom_anchor_bridge` | Chapter V | Temporal Anchor Echo Conduit: `int_ch5_temporal_anchor_conduit` `(-3.2, 3.4)` via Echo replay `[Y]` | `pillar-nw` `(-8.5, -6.5)` | Verified (starts locked even if Ch.I unlocked `pillar-nw`) | Verified (`obs.disabled === true`) | Verified (Sera & projectile traverse `(-8.5, -6.5)`) | Verified |

---

## D. Timed Energy Hazard Acceptance Matrix (All 3 Authored Hazards)

| Hazard ID | Chapter | Coordinates & Radius | Cycle Timing (`safe / warning / active`) | Damage | Single-Hit Per Active Cycle (`cycleIndex` / `lastHitCycleIndex`) | Next Active Cycle Re-Hits | Dodge (`dodging`) & Relay Phase Shift Protection | Pause Freeze |
|---|---|---|---|---|---|---|---|---|
| `hazard_prologue_east_arc_vent` | Prologue | `(11.2, -6.4)`, `r = 1.8` | `1.80s / 0.90s / 1.10s` (`3.80s` total) | `14` | Verified (1 hit in Cycle 0 across 58 active substeps) | Verified (1 hit in Cycle 1) | Verified (`0` damage during Dodge & Relay flash) | Verified |
| `hazard_ch1_nw_arc_lane` | Chapter I | `(-11.0, -6.4)`, `r = 1.8` | `1.70s / 0.85s / 1.15s` (`3.70s` total) | `16` | Verified (1 hit in Cycle 0 across 58 active substeps) | Verified (1 hit in Cycle 1) | Verified (`0` damage during Dodge & Relay flash) | Verified |
| `hazard_ch3_sw_purge_lane` | Chapter III | `(-11.0, 6.4)`, `r = 1.8` | `1.60s / 0.85s / 1.15s` (`3.60s` total) | `18` | Verified (1 hit in Cycle 0 across 58 active substeps) | Verified (1 hit in Cycle 1) | Verified (`0` damage during Dodge & Relay flash) | Verified |

---

## E. Secret Area & Economy Acceptance Matrix (All 4 Authored Secrets)

| Secret ID | Chapter | Coordinates & Radius | Prerequisite Route | Rewards (`Integrity / Flux / Codex`) | Memory Fragments Granted | Blocked While Route Locked (Physical & Direct API) | Idempotent on Re-Entry & Reload |
|---|---|---|---|---|---|---|---|
| `secret_prologue_calibration_alcove` | Prologue | `(13.4, -6.4)`, `r = 2.6` | `route_prologue_east_bypass` | `+20 Integrity` (capped at `100`), `+25 Flux` (capped at `100`), `CODEX-01` | `0` | Verified (`discoverSecretArea` returns `false` while locked) | Verified (`dupAttempt === false`) |
| `secret_ch1_marshal_armory_cache` | Chapter I | `(-13.2, -6.2)`, `r = 2.6` | `route_ch1_nw_timed_conduit` | `+25 Integrity`, `+30 Flux`, `CODEX-03` | `0` | Verified | Verified |
| `secret_ch2_hydroponic_echo_sanctum` | Chapter II | `(-13.0, 6.4)`, `r = 2.6` | `route_ch2_sw_echo_bridge` | `+25 Integrity`, `+35 Flux`, `CODEX-04` | `0` | Verified | Verified |
| `secret_ch3_lysa_unedited_vault` | Chapter III | `(-13.2, 6.2)`, `r = 2.6` | `route_ch3_sw_archive_passage` | `+30 Integrity`, `+35 Flux`, `CODEX-05` | `0` | Verified | Verified |

*Campaign Economy Invariant:* Total obtainable Memory Fragments across the entire campaign remains strictly `18` (`GAME_CONFIG.weapons.progression.rewards`). Discovering all 4 secret areas contributes `0` Memory Fragments.

---

## F. Save v2 Backward-Compatibility Matrix

| Scenario | Payload Structure | Expected Behavior | Verification Status |
|---|---|---|---|
| **Scenario A: Legacy v1 Save** | Unversioned payload with `unlockedChapters`, `completedChapters`, `recoveredLogs`, `completedEndings` (no `version`, `progression`, or `exploration`) | Migrates cleanly to Save v2; initializes empty `exploration` arrays (`discoveredCodexIds`, `completedObjectiveIds`, `activatedNodeIds`, `unlockedRouteIds`, `discoveredRegionIds`, `discoveredSecretIds`) | Verified (`simulation.test.ts` Phase 19.1-D & `campaign-release.test.ts`) |
| **Scenario B: Phase 18 Save v2** | `version: 2` with `exploration` containing `discoveredCodexIds`, `completedObjectiveIds`, `activatedNodeIds`, `unlockedRouteIds`, but **omitting** `discoveredRegionIds` and `discoveredSecretIds` | Preserves all Phase 18 exploration fields and defaults `discoveredRegionIds` and `discoveredSecretIds` to `[]` without throwing or losing progress | Verified (`simulation.test.ts` Phase 19.1-D & Playwright Scenario 8) |
| **Scenario C: Current Phase 19 Save v2** | Full `version: 2` payload including `discoveredRegionIds`, `discoveredSecretIds`, `unlockedRouteIds`, and `activeCampaign.exploration` | Round-trips all 4 secret IDs, discovered region IDs, unlocked routes, and active chapter obstacles across full browser reload | Verified (`simulation.test.ts` Phase 19.1-A/D & Playwright Scenario 9) |
| **Scenario D: Malformed / Duplicate Save Fields** | Unknown IDs (`secret_fake_999`, `region_fake_999`, `pillar-fake`), non-string elements (`123`, `null`), duplicate entries, or non-array fields | Strips unknown/non-string entries, deduplicates valid IDs in order, and never crashes | Verified (`simulation.test.ts` Phase 19.1-D & `campaign-release.test.ts` test 17) |

---

## G. Local Sector Map & Mode Isolation Matrix

| Feature / Isolation Target | Verification Method | Result |
|---|---|---|
| **Open via Keyboard `[N]`, HUD `MAP [N]`, and Modal `SECTOR MAP [N]` Tab** | Playwright real key press `KeyN` and button click on `[data-testid="hud-map-btn"]` | Opens `StatusModal` directly on `[data-testid="local-sector-map"]` and pauses simulation cleanly |
| **Fog-of-Discovery (`data-hidden-by-fog`)** | Inspected `[data-testid="map-region-region_prologue_secret_alcove"]` before and after physical secret entry | Transitions from `data-hidden-by-fog="true"` (`[FOG] UNINDEXED SECTOR SPUR`) to `data-hidden-by-fog="false"` (`East Calibration Overlook`) |
| **Live Route & Hazard Telemetry** | Inspected `[data-testid="map-route-route_prologue_east_bypass"]` and `[data-testid="map-hazard-hazard_prologue_east_arc_vent"]` | Route transitions `locked -> powered -> open`; hazard badge reflects live `safe / warning / active` phase |
| **Practice Mode Isolation** | Entered `startPracticeStandardRun('prologue_calibration_bay')` after saving 4 campaign secrets | Practice world starts with `0` discovered secrets; `localStorage` campaign save remains byte-for-byte unchanged |
| **Chapter Replay Isolation** | Replayed earlier completed chapter (`isChapterReplay = true`) while holding active later-chapter campaign snapshot | Replay uses isolated exploration state (`preservedExploration = null`) and restores original campaign snapshot via `restoreSavedCampaignProgress` |

---

## H. Automated Regression Tests Added

Added four comprehensive regression tests in `src/game/simulation.test.ts` (`138 / 138` passing in `simulation.test.ts`; `198 / 198` total across all 4 test suites):

1. **`Phase 19.1-A All 7 Authored Traversal Routes End-to-End: Prerequisite Enforcement, Obstacle Retraction, Physical Traversal, Projectile LOS, Map Sync & Save Persistence`** — Verifies all 7 routes individually (`route_prologue_east_bypass`, `route_prologue_west_containment`, `route_ch1_nw_timed_conduit`, `route_ch2_sw_echo_bridge`, `route_ch3_sw_archive_passage`, `route_ch4_se_quarantine_lane`, `route_ch5_loom_anchor_bridge`), including blocked player movement and projectile collision when locked, obstacle retraction and unobstructed player/projectile traversal when unlocked, cross-chapter obstacle isolation (`pillar-sw` in Ch.II vs Ch.III, `pillar-nw` in Ch.I vs Ch.V), and Chapter V save/reload persistence.
2. **`Phase 19.1-B All 3 Timed Energy Hazards: Per-Cycle Single-Hit Cap, Next-Cycle Re-Hit, Dodge & Relay Phase Shift Protection`** — Verifies `hazard_prologue_east_arc_vent` (`14` dmg), `hazard_ch1_nw_arc_lane` (`16` dmg), and `hazard_ch3_sw_purge_lane` (`18` dmg) deal at most 1 hit per active cycle across 58 substeps, deal damage again on the subsequent active cycle, deal `0` damage while paused, deal `0` damage during Dodge (`actionState === 'dodging'`), and deal `0` damage during Relay Phase Shift (`relay.successFlashTimer > 0`).
3. **`Phase 19.1-C All 4 Secret Areas End-to-End: Prerequisite Gating, Exact Rewards, Codex Decryption, Idempotency & 18-Fragment Economy Invariant`** — Verifies all 4 secret areas reject discovery while their prerequisite route is locked (both physical proximity and `discoverSecretArea`), grant exact Integrity/Flux/Codex rewards upon route unlock + physical entry, reject duplicate discovery, grant `0` Memory Fragments, and preserve Practice Mode isolation.
4. **`Phase 19.1-D Save v2 Backward Compatibility: Scenario A (Legacy v1), Scenario B (Phase 18 v2 without region/secret arrays), Scenario C (Phase 19 v2), and Scenario D (Malformed/Duplicate Fields)`** — Verifies all 4 backward-compatibility and sanitization scenarios.

---

## I. Browser Acceptance Scenarios Executed

Executed via `playwright-cli` in headless Chromium across Desktop (`1280×800`) and Mobile (`390×844`) viewports:

| # | Browser Scenario | Flow Type | Key Evidence |
|---|---|---|---|
| **1** | Prologue East Bypass unlock & physical traversal | Real title click + Prologue simulation | `gateLockedStatus: "prerequisite_locked"`, `auxStatus: "ready"`, `gateOpenStatus: "ready"`, `obsAfter: true`, `traversedThroughPillar: true` (`z = -9.92`) |
| **2** | Prologue West Containment 3-stage calibration unlock & traversal | Prologue simulation | `lockedBefore: "locked"`, `routeAfter: "open"`, `playerAtWestLane: true` |
| **3** | Chapter II Echo Bridge unlock via Echo playback & traversal | Fixture chapter select (`chapter_2_choir`) | `liveAttemptStatus: "requires_echo"`, `obsBefore: false`, `obsAfter: true`, `routeStatus: "open"`, `traversedPillarSw: true` |
| **4** | Remaining chapter routes (`Ch.I`, `Ch.III`, `Ch.IV`, `Ch.V`) | Fixture chapter select (`chapter_1_helix`, `chapter_3_curator`, `chapter_4_matron`, `chapter_5_loom`) | `ch1.obsDisabled: true`, `ch3.obsInitiallyDisabled: false -> obsAfter: true`, `ch4.obsBefore: false -> obsAfter: true`, `ch5.obsBefore: false -> obsAfter: true` |
| **5** | Timed Energy Hazard cycle, single-hit cap & Dodge avoidance | Prologue simulation | `phaseSafe: "safe" (100 HP) -> phaseWarning: "warning" (100 HP) -> hpAfterFullActiveWindow: 86 (-14 HP exact, 1 hit) -> Dodge in next active cycle: 72 -> 72 HP` |
| **6** | All 4 secret areas discovery, idempotency & 0 Fragment delta | Prologue + fixture chapter select (`Ch.I–Ch.III`) | `totalDiscoveredSecrets: 4`, `secretFragmentDelta: 0`, `dupAttempt: false`, `bannerTitle: "East Calibration Overlook"` |
| **7** | Local Sector Map `[N]` & `MAP [N]` fog-of-discovery reveal | Real keyboard `KeyN` + HUD click `hud-map-btn` | `alcoveFog: "true" -> "false"`, `eastRouteStatus: "locked" -> "open"` |
| **8** | Save v2 backward compatibility with pre-Phase-19 save | `localStorage` injection + `page.reload()` | `unlockedRouteIds: ["pillar-ne"]`, `discoveredCodexIds: ["CODEX-01"]`, `discoveredSecretIds: []` |
| **9** | Save v2 persistence of Phase 19 state across reload | `saveCampaignProgress()` + `page.reload()` | All 4 `discoveredSecrets`, `14` `discoveredRegions`, `4` `unlockedRoutes`, and `7` `activatedNodes` restored after reload |
| **10** | Practice Mode isolation from saved campaign exploration | `startPracticeStandardRun('prologue_calibration_bay')` | `practiceSecrets: 0`, `savedStorageUnchanged: true` |
| **11** | Desktop (`1280×800`) & Mobile (`390×844`) viewport layout | Real viewport resize + mobile `MAP [N]` tap | `viewport: "390x844"`, `mapRenderedWithinViewport: true`, `interactButtonPresent: true` |
| **12** | Runtime console & asset network health | Playwright `console`, `pageerror`, `requestfailed` listeners | `consoleErrors: []`, `failedAssetRequests: []` |

---

## J. Defects Found & Fixed

1. **`src/game/types.ts` & `src/game/simulation.ts` (`buildHazardsForChapter`, `advanceTimedEnergyHazards`):** Added `cycleIndex: number` and `lastHitCycleIndex: number` to `TimedEnergyHazardState` and checked `lastHitCycle !== currentCycleIndex` and `!(world.relay?.successFlashTimer > 0)` before applying hazard damage.
2. **`src/game/simulation.ts` (`buildRoutesForChapter`, `syncUnlockedRoutesToObstacles`):** Scoped obstacle unlock checks to the current chapter's `controlInteractableId` so shared obstacle IDs (`pillar-sw` in Ch.II/Ch.III, `pillar-nw` in Ch.I/Ch.V) do not leak across chapters.
3. **`src/game/simulation.ts` (`discoverSecretArea`):** Added chapter matching (`def.chapter === chapter`) and prerequisite route unlock validation before allowing secret discovery.
4. **`src/game/simulation.ts` (`getBossIdForChapter`):** Mapped `'chapter_5_loom'` to `'matron-v'` so `sanitizeBossCheckpoint` accepts active Chapter V saves upon reload.
5. **`src/game/campaign-release.test.ts` (`test 17`):** Updated test 17 to unlock each chapter's prerequisite route before asserting `discoverSecretArea(...) === true` (and asserted `discoverSecretArea(...) === false` while locked).

---

## K. Known Remaining Limitations

- In browser acceptance testing, Prologue was started via the real Title Screen UI (`NEW CAMPAIGN [ENTER]`), whereas Chapters I–V were entered deterministically via `startCampaignChapterSelect` test hooks to verify each chapter's traversal route, timed hazard, and secret area without playing through four full multi-phase boss fights manually in headless Chromium.
- Headless Chromium uses software WebGL (`SwiftShader`), so frame timing in headless mode runs at reduced cadence compared to hardware-accelerated desktop GPUs; all simulation timing remains deterministic via fixed-substep `stepWorld` slicing (`<= 0.05s`).

---

## L. Final Release Verdict

**PASS — PHASE 19.1 ACCEPTANCE HARDENING COMPLETE.**  
All 7 traversal routes, 3 timed energy hazards, 4 secret exploration areas, Save v2 backward-compatibility paths, and Local Sector Map / mode isolation invariants are verified by `198/198` automated tests and `12/12` real-browser acceptance checks with zero console or network errors.

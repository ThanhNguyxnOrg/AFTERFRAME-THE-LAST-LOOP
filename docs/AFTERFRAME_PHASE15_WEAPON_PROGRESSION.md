# AFTERFRAME: THE LAST LOOP — PHASE 15 WEAPON PROGRESSION, UPGRADE BENCH & COMBAT BUILD CHOICES

## 1. Executive Summary

Phase 15 introduces a deterministic, non-grindy Action RPG weapon progression foundation for **AFTERFRAME: THE LAST LOOP** built around Sera Venn’s two canonical weapons: **Chrono Edge** (melee) and **Pulsecaster** (ranged).

Players earn **Memory Fragments** through deterministic, first-time campaign milestones (Prologue calibration stages, Test Bay 04 proxy clearance, and the four Warden boss core defeats), unlock and equip **four distinct weapon modifications** (two per weapon, max 1 active core per weapon) at the **Chrono Rig Upgrade Bench (`[U]`)**, and experience immediate mechanical and tactical build differentiation across live combat, Resonance/Convergence windows, and recorded Echo replays.

All automated tests (**174/174** across all four canonical test files), static TypeScript verification (`npm run lint`), production build packaging (`npm run build`), and live Chromium browser verification (`1280×800` desktop and `390×844` mobile viewports) passed with zero errors.

---

## 2. Weapon Modifications, Costs & Measured Combat Effects

Each weapon supports two mutually exclusive modifications (**1 active modification slot per weapon**). Every modification combines a measurable combat benefit with a deliberate tactical trade-off (`GAME_CONFIG.weapons.upgrades` in `src/game/config.ts`):

| Upgrade ID | Weapon | Name & HUD Badge | Cost | Measured Benefits | Measured Trade-offs |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `edge_breaker_cleave` | `chrono_edge` | **Seismic Breaker Core** (`BREAKER CORE`) | **2** Fragments | • **+30% Stagger Multiplier** (`1.30x`; un-guarded Light 1 stagger increases `12 → 16`)<br>• **+0.25 Frontal Guard Stagger Bonus** (`0.40 → 0.65` vs shielded Bastions/bosses; guarded Heavy Cleave stagger increases `84.44 → 100.0`, triggering a 1-hit posture break) | • **-12% Direct HP Damage** (`0.88x`; un-guarded Light 1 damage `16 → 14`)<br>• **+0.06s Heavy Cleave Recovery** (`0.34s → 0.40s`) |
| `edge_harmonic_conductor` | `chrono_edge` | **Harmonic Phase Edge** (`PHASE EDGE`) | **3** Fragments | • **+3 Bonus Flux on Clean Blade Hit** (`+10 → +13` Flux per un-empowered melee hit)<br>• **+1.1s Resonance Prime Window** (`3.4s → 4.5s`)<br>• **-5 Convergence Flux Cost** (`15 → 10` Flux)<br>• **+10 Convergence Posture Damage** (`22 → 32`) | • **+5 Empowered Heavy Cleave Flux Cost** (`25 → 30` Flux)<br>• **-15% Un-Empowered Solo Heavy Cleave Direct Damage** (`0.85x`; `46 → 39` HP damage when un-empowered) |
| `pulse_thermal_sink` | `pulsecaster` | **Cryo-Vent Capacitor** (`CRYO-VENT`) | **2** Fragments | • **-33% Light Bolt Heat Cost** (`18 → 12` Heat per shot, allowing **8** rapid shots before overheat vs **5** baseline)<br>• **+30% Passive Cooling Rate** (`26.0/s → 33.8/s`, overheat recovery `32.0/s → 41.6/s`) | • **-17% Light Bolt Direct Damage** (`12 → 10` HP damage)<br>• **-22% Light Bolt Stagger** (`9 → 7` stagger) |
| `pulse_overcharge_condenser` | `pulsecaster` | **Phase-Lance Condenser** (`PHASE-LANCE`) | **3** Fragments | • **+25% Charged Lance Direct Damage** (`28 → 35` base / `40 → 50` Flux-empowered)<br>• **+31% Charged Lance Stagger** (`32 → 42` base / `46 → 58` Flux-empowered) | • **+33% Charged Lance Heat Cost** (`36 → 48` Heat)<br>• **+0.12s Post-Shot Cooldown** (`0.36s → 0.48s`)<br>• **+0.08s Heavy Shot Recovery** (`0.24s → 0.32s`) |

- **Total Cost to Unlock All 4 Modifications**: **10 Memory Fragments** (`2 + 3 + 2 + 3`).
- **Mid-Attack Action Lock**: Purchasing or swapping weapon modifications is blocked via `canModifyWeaponUpgrades(world)` (`outcome: 'action_locked'`) whenever Sera is in a committed combat animation (`light_windup`, `light_active`, `heavy_windup`, `heavy_active`, `dodging`, `parry_active`), defeated (`outcome === 'defeat'` / `actionState === 'dead'`), or standing at the final Chronicle Loom ending choice (`chapter_5_loom` at stage `chronicle_loom`).

---

## 3. Campaign Reward Milestones & Anti-Farming Idempotency

Memory Fragments are awarded exclusively from **8 deterministic campaign milestones** (`GAME_CONFIG.weapons.progression.rewards` in `src/game/config.ts`), totaling **18 Memory Fragments** across a full campaign run:

| Reward ID | Campaign Milestone | Fragments | Trigger Condition in `src/game/simulation.ts` |
| :--- | :--- | :---: | :--- |
| `prologue_calibration_teach` | **Prologue · Anchor Plate Calibration** | **+1** | Live Sera crosses West through the Stage 1 Anchor Plate barrier while an Echo holds the plate open (`puzzle.teachCompleted`). |
| `prologue_calibration_test` | **Prologue · Heavy Receiver Calibration** | **+1** | An Echo’s Heavy Cleave or Charged Lance charges the Stage 2 Heavy Receiver (`puzzle.testCompleted`). |
| `prologue_calibration_combine` | **Prologue · Dual Resonance Calibration** | **+2** | Live Sera crosses West through the open Stage 3 Final Combine Barrier (`puzzle.combineCompleted`). |
| `prologue_bay_proxies_cleared` | **Prologue · Test Bay 04 Proxies Neutralized** | **+2** | All hostile security proxies in Test Bay 04 are defeated during the Prologue campaign run. |
| `chapter_1_helix_defeated` | **Chapter I · HELIX-04 Neutralized** | **+3** | Defeating Security Marshal **HELIX-04** (`helix-04`) in Campaign Mode. |
| `chapter_2_choir_defeated` | **Chapter II · THE CHOIR Silenced** | **+3** | Defeating **THE CHOIR** (`the-choir`) in Campaign Mode. |
| `chapter_3_curator_defeated` | **Chapter III · THE CURATOR Archived** | **+3** | Defeating **THE CURATOR** (`the-curator`) in Campaign Mode. |
| `chapter_4_matron_defeated` | **Chapter IV · MATRON-V Terminated** | **+3** | Defeating **MATRON-V** (`matron-v`) in Campaign Mode. |

### Reward Idempotency & Anti-Farming Guarantees

`grantProgressionReward(world, rewardId)` enforces strict idempotency and mode isolation:
1. **Claimed-Set Deduplication**: Once a `rewardId` is recorded in `world.progression.claimedRewardIds`, any subsequent attempt to grant the same reward returns `false` and awards `0` fragments.
2. **Echo Replay Immunity**: Echoes replaying recorded movement or heavy actions over calibration plates/receivers never duplicate milestone rewards.
3. **Checkpoint Retry & Defeat Immunity**: Retrying a boss checkpoint preserves the pre-boss `claimedRewardIds` and `memoryFragments` snapshot without re-granting earlier milestones.
4. **Practice Mode & Chapter Replay Isolation**: `grantProgressionReward` immediately returns `false` when `world.run.mode !== 'campaign'` (`practice_standard` or `practice_boss`) or when `world.run.isChapterReplay === true`.

---

## 4. Upgrade Bench Controls, Safe-State Access & Feedback

- **Accessing the Upgrade Bench**:
  - **Keyboard Shortcut**: Pressing **`[U]`** (`KeyU` in `src/game/input.ts`) during active gameplay toggles the Pause / Upgrade Bench modal (`StatusModal`).
  - **HUD Button**: Clicking **`BENCH [U]`** (`data-testid="hud-btn-upgrade-bench"`) inside the compact Weapon HUD module pauses the simulation and opens the Upgrade Bench.
  - **Chapter Intermission**: The Upgrade Bench also appears automatically inside `StatusModal` on **Campaign Chapter Victory / Intermission** screens so players can spend newly earned boss fragments before advancing to the next chapter.
  - **Restricted States**: The Upgrade Bench is hidden on **Defeat** screens (`outcome === 'defeat'`) and on the final **Chronicle Loom Epilogue** screen (`selectedEnding !== null`).
- **Player Readouts & Audio/Visual Feedback**:
  - **HUD Readouts**: `GameHud.tsx` displays current Memory Fragments (`data-testid="hud-memory-fragments"`, e.g. `1 FRAG`) and the currently equipped weapon’s active modification badge (`data-testid="weapon-active-upgrade"`, e.g. `BASE`, `BREAKER CORE`, `PHASE EDGE`, `CRYO-VENT`, `PHASE-LANCE`), and dynamically updates the Empowered Heavy Cleave Flux cost label (`25F` vs `30F` when Harmonic Phase Edge is active).
  - **Upgrade Bench Modal**: `StatusModal.tsx` renders `data-testid="upgrade-bench-panel"`, `data-testid="upgrade-fragments-balance"`, `data-testid="upgrade-status-message"`, and four cards (`data-testid="upgrade-card-<id>"`) with action buttons (`data-testid="upgrade-action-<id>"`) supporting one-click **Unlock & Equip**, **Equip Modification**, and **Equipped · Unequip**.
  - **Synthesized Web Audio Cues (`src/game/audio.ts`)**: Added dedicated procedural audio synthesis for `progression_reward_granted` (crystalline ascending chime), `weapon_upgrade_purchased` (power-core lock harmonic), `weapon_upgrade_equipped` (mechanical latch click), and `weapon_upgrade_rejected` (low dissonant buzz).

---

## 5. Echo Recording & Replay Upgrade Fidelity

- During Recording (`[R]`), both `EchoSample` (`equippedUpgradeId`) and `EchoRecordedActionEvent` (`equippedUpgradeId`) capture the exact modification equipped on the weapon at the timestamp of each sample and attack action.
- When an Echo is spawned (`[F]`), its replayed melee strikes (`resolveEchoRecordedAction` for `chrono_edge`) and replayed Pulsecaster projectiles (`spawnPulsecasterProjectile` with `owner: 'echo'` and the recorded `upgradeId`) apply the **recorded** modification’s damage, stagger, guard-break, and Resonance rules—even if live Sera subsequently unequips or switches her own modification mid-playback.

---

## 6. Save Persistence, Migration & Mode Isolation

- **Durable Campaign Save Schema (`v2`)**:
  - `PersistedCampaignSaveV2` (`afterframe.campaignSave.v2`) persists `progression: PersistedWeaponProgressionState` (`memoryFragments`, `claimedRewardIds`, `purchasedUpgrades`, `equippedUpgrades`) at both the root campaign level and inside `activeRun` and `bossCheckpoint`.
  - Purchasing or equipping an upgrade at the Upgrade Bench immediately persists the updated campaign state to `localStorage`.
- **Legacy Save Migration & Corruption Resilience**:
  - `sanitizePersistedWeaponProgressionState` safely migrates legacy `v1` and pre-Phase-15 `v2` saves (which lack a `progression` field) to a clean baseline (`0` fragments, empty arrays, `null` equipped slots).
  - Malformed JSON, negative/NaN fragment counts, duplicate upgrade/reward IDs, unknown strings, and cross-weapon slot mismatches (e.g. attempting to equip a Pulsecaster upgrade onto `chrono_edge` or equipping an unowned upgrade) are deterministically stripped and clamped (`0..99`).
- **Practice Mode & Chapter Replay Isolation**:
  - Launching Practice Arena (`practice_standard`), Boss Practice (`practice_boss`), or an earlier Chapter Replay snapshots the active campaign progression inside `savedCampaignSnapshot.progression` and restores it intact when returning to the active campaign.

---

## 7. Files Changed in Phase 15

- `src/game/types.ts` — Added `WeaponUpgradeId`, `WeaponProgressionRewardId`, `WeaponUpgradeDefinition`, `WeaponProgressionRewardDefinition`, `PersistedWeaponProgressionState`, `WeaponProgressionState`, `HudWeaponProgressionSnapshot`, and extended `EchoSample`, `EchoRecordedActionEvent`, `PlayerProjectile`, `CombatFeedbackEvent`, `HudSnapshot`, and campaign save types.
- `src/game/config.ts` — Added `GAME_CONFIG.weapons.upgrades` (4 weapon upgrades) and `GAME_CONFIG.weapons.progression` (Memory Fragments metadata and 8 campaign reward definitions).
- `src/game/simulation.ts` — Implemented weapon progression state lifecycle, `sanitizePersistedWeaponProgressionState`, `grantProgressionReward`, `purchaseWeaponUpgrade`, `equipWeaponUpgrade`, combat/Resonance upgrade modifiers, Echo upgrade replay fidelity, and campaign save/load/isolation integration.
- `src/game/input.ts` — Added `KeyU` (`[U]`) keyboard binding to toggle the Pause / Upgrade Bench modal.
- `src/game/audio.ts` — Added Web Audio synthesis handlers for `progression_reward_granted`, `weapon_upgrade_purchased`, `weapon_upgrade_equipped`, and `weapon_upgrade_rejected`.
- `src/components/GameHud.tsx` — Added `hud-btn-upgrade-bench`, `hud-memory-fragments`, `weapon-active-upgrade` badge, and dynamic Heavy Cleave Flux cost readout.
- `src/components/StatusModal.tsx` — Implemented the Chrono Rig Upgrade Bench UI (`upgrade-bench-panel`) on Pause and Chapter Victory intermission screens.
- `src/App.tsx` — Wired `handlePurchaseUpgrade` and `handleEquipUpgrade`, added progression state change detection in the HUD sync loop, persisted progression updates to `localStorage`, and exposed `getProgressionState`, `grantReward`, `purchaseUpgrade`, and `equipUpgrade` on `window.__afterframeTest`.
- `src/game/simulation.test.ts` — Added 4 Phase 15 unit test suites (Tests 171–174 in the combined TAP run; 117 total tests in `simulation.test.ts`).
- `src/game/campaign-release.test.ts` — Added Phase 15 campaign persistence, legacy migration, corruption sanitization, and Practice Mode isolation test suite (16 total tests in `campaign-release.test.ts`).
- `docs/AFTERFRAME_PHASE15_WEAPON_PROGRESSION.md` — Created this Phase 15 implementation and verification report.

---

## 8. Automated Test, TypeScript & Production Build Verification

All verification commands were executed sequentially in the foreground from `/app/applet`:

### 8.1 Canonical Automated Test Suite (`npm test`)
- **Command**: `npm test` (`tsx --test src/game/simulation.test.ts src/game/campaign-release.test.ts src/game/reduced-motion.test.ts src/game/asset-lifecycle.test.ts`)
- **Exit Code**: `0`
- **Total Passing Tests**: **174 / 174** (`0` failures, `0` skipped)
  - `src/game/simulation.test.ts`: **117 / 117** passing (includes 4 new Phase 15 suites covering upgrade definitions, purchase/equip validation, mid-combat action locks, milestone reward idempotency, Chrono Edge upgrades, Pulsecaster upgrades, and Echo upgrade replay fidelity)
  - `src/game/campaign-release.test.ts`: **16 / 16** passing (includes 1 new Phase 15 suite covering `v2` progression save/load, legacy migration, corrupted-save sanitization, and Practice Mode isolation)
  - `src/game/reduced-motion.test.ts`: **33 / 33** passing
  - `src/game/asset-lifecycle.test.ts`: **8 / 8** passing

### 8.2 TypeScript Check (`npm run lint`)
- **Command**: `npm run lint` (`tsc --noEmit`)
- **Exit Code**: `0` (`0` errors)

### 8.3 Production Build (`npm run build`) & Asset Audit
- **Command**: `npm run build` (`vite build`)
- **Exit Code**: `0` (built in `354ms`)
- **Production Chunk Breakdown**:
  - `dist/index.html`: `1.46 kB` (`0.59 kB` gzip)
  - `dist/assets/index-OlKewPI3.css`: `56.72 kB` (`9.94 kB` gzip)
  - `dist/assets/rolldown-runtime-WkwZ5CU-.js`: `0.59 kB` (`0.36 kB` gzip)
  - `dist/assets/game-io-GVHREOr-.js`: `42.28 kB` (`7.29 kB` gzip)
  - `dist/assets/index-BtdAql6A.js`: `128.57 kB` (`27.55 kB` gzip)
  - `dist/assets/game-renderer-B31Hpx5u.js`: `144.68 kB` (`37.79 kB` gzip)
  - `dist/assets/game-simulation-D9scl9tf.js`: `211.04 kB` (`57.81 kB` gzip)
  - `dist/assets/vendor-react-pYGJIzn4.js`: `218.75 kB` (`68.27 kB` gzip)
  - `dist/assets/vendor-three-Kgaa-aLc.js`: `649.55 kB` (`164.96 kB` gzip)
- **Production Asset & Artifact Audit**:
  - Confirmed all four Phase 12 Blender GLBs are present in both `public/assets/blender/phase12/` and `dist/assets/blender/phase12/` (`choir_acoustic_organ.glb`, `curator_archive_monolith.glb`, `helix_containment_gate.glb`, `matron_surgical_pod.glb`).
  - Confirmed the accidental Phase 14 implementation-prompt artifact (`Paste_October_28__2026_-_10_34AM_a9a08dde`) remains absent from both `public/assets/aistudio/` and `dist/assets/aistudio/`.
- **Git Metadata Note**: `/app/applet/.git` is not present in the AI Studio container (`NO_GIT_DIR`), so commit hashes and remote Git status are not asserted.

---

## 9. Live Browser Verification (`http://localhost:3000`)

Live Playwright Chromium verification was executed against `http://localhost:3000` across both desktop (`1280×800`) and mobile (`390×844`) viewports:

1. **Genuine Gameplay Milestone Reward vs. Test-Fixture Grants**:
   - **Genuine Gameplay Milestone Earned**: Started a fresh campaign (`ENTER NADIR-9`), positioned Sera on the Stage 1 Anchor Plate, recorded an Echo (`[R]`), spawned the Echo (`[F]`) to hold the plate barrier open, and moved live Sera West across the Stage 1 barrier. Verified `prologue_calibration_teach` triggered organically through `stepWorld`, incrementing `memoryFragments` from `0 → 1` and updating `hud-memory-fragments` to `1 FRAG`.
   - **Anti-Farming Duplicate Check**: Verified attempting to re-grant `prologue_calibration_teach` returned `{ granted: false, amount: 0, memoryFragments: 1 }`.
   - **Deterministic Test-Fixture Grants (Labeled Separately)**: Used `window.__afterframeTest.grantReward` to seed `prologue_calibration_test` (`+1`), `prologue_calibration_combine` (`+2`), and `prologue_bay_proxies_cleared` (`+2`) to test multi-upgrade purchasing in the live UI.
2. **Upgrade Bench Access & Card Rendering (`1280×800`)**:
   - Verified opening the Upgrade Bench via both the HUD button (`[data-testid="hud-btn-upgrade-bench"]`) and the `[U]` keyboard shortcut (`openViaHudBtn: true`, `closedViaKeyU: true`, `openViaKeyU: true`), and confirmed the bench is hidden on the Defeat screen (`outcome === 'defeat'`).
   - Verified all 4 upgrade cards (`edge_breaker_cleave`, `edge_harmonic_conductor`, `pulse_thermal_sink`, `pulse_overcharge_condenser`) rendered with accurate costs (`2 FRAG`, `3 FRAG`, `2 FRAG`, `3 FRAG`), benefits, and trade-offs.
3. **Purchasing, Currency Deduction, Rejection & Active HUD Readouts**:
   - Clicked `upgrade-action-edge_harmonic_conductor` (`3 FRAG`); verified `upgrade-fragments-balance` deducted once (`MEMORY FRAGMENTS: 4 → 1`), the card switched to `data-owned="true"` / `data-equipped="true"` (`EQUIPPED · UNEQUIP`), and `upgrade-status-message` displayed `"UNLOCKED & EQUIPPED HARMONIC PHASE EDGE ON CHRONO EDGE"`.
   - Clicked unaffordable `upgrade-action-edge_breaker_cleave` (`2 FRAG` cost with `1 FRAG` balance); verified purchase was rejected safely (`outcome: 'insufficient_fragments'`), balance remained `1`, and `upgrade-status-message` displayed `"INSUFFICIENT MEMORY FRAGMENTS (1/2 REQUIRED)"`.
   - Purchased `pulse_thermal_sink` (`2 FRAG`); resumed gameplay via `[U]` and verified `weapon-active-upgrade` displayed `PHASE EDGE` on Chrono Edge (`[1]`) and `CRYO-VENT` when switching to Pulsecaster (`[2]`), and firing a Pulsecaster Light Bolt added `12` Heat instead of `18`.
4. **Full Page Reload Persistence (`v2` Save) & Practice Isolation**:
   - Reloaded the browser (`playwright-cli reload`), clicked `CONTINUE CAMPAIGN` on the Title Screen, and verified `memoryFragments: 1`, `claimedRewardIds`, `purchasedUpgrades: ['edge_harmonic_conductor', 'pulse_thermal_sink']`, and `equippedUpgrades` were restored intact (`afterReloadHudFrag: "1 FRAG"`, `afterReloadActiveMod: "PHASE EDGE"`).
   - Entered Practice Mode (`startPracticeStandardRun()`), verified `grantReward('chapter_1_helix_defeated')` was rejected (`granted: false`), and confirmed `restoreSavedCampaignProgress()` restored the campaign progression untouched.
5. **Mobile Viewport (`390×844`) & Console Cleanliness**:
   - Verified at `390×844` that `weapon-hud-module`, `hud-btn-upgrade-bench`, and `hud-memory-fragments` stayed within viewport bounds (`x: 189..235, y: 117..136`) with zero overlap against `touch-move-pad` (`weaponHudVsMovePad: false`, `upgradeBtnVsMovePad: false`) or `hud-bottom-cluster` (`weaponHudVsBottomCluster: false`), and that `upgrade-bench-panel` (`w: 316px`) rendered cleanly inside the mobile modal.
   - Confirmed `0` console errors and `0` warnings (`Total messages: 3 (Errors: 0, Warnings: 0)`).

---

## 10. Final Verification Outcome

**PHASE 15 VERIFIED**

# AFTERFRAME: THE LAST LOOP — PHASE 18
## World Exploration, Environmental Interaction & Mission Systems

---

## 1. Phase 18 Overview & Architectural Scope

Phase 18 expands **AFTERFRAME: THE LAST LOOP** from a combat-and-puzzle gauntlet into a connected sci-fi action-adventure across Nadir-9 with:
1. **Data-Driven Mission & Objective State Machine (`Phase 18.1`)**: Structured chapter missions (`mission_prologue_calibration` through `mission_ch5_loom`) with `main` and `optional` objectives, prerequisite validation (`locked`, `available`, `active`, `completed`), duplicate completion guards, unknown ID rejection, and authoritative simulation triggers.
2. **Environmental Interaction & Route Unlock System (`Phase 18.2`)**: Interactive 3D world objects (`terminal`, `power_node`, `gate_control`, `echo_conduit`) evaluated deterministically for range, facing, obstacle line-of-sight (LOS), player action-state recovery, prerequisite nodes, Echo/Pulsecaster resonance, and one-shot idempotency. Activating route controls (`unlocksObstacleId`) authoritatively retracts arena bulkheads (`pillar-ne`, `pillar-nw`, `pillar-sw`, `pillar-se`) and opens flanking sightlines.
3. **Station Lore Codex & Mission Journal UI (`Phase 18.3`)**: 8 discoverable narrative records (`CODEX-01` through `CODEX-08`) with undiscovered entry masking (`ENCRYPTED RECORD`), surfaced in the live HUD objective tracker (`data-testid="hud-objective-banner"`, `data-testid="hud-optional-objective"`), contextual world interaction prompt (`data-testid="hud-interaction-prompt"`, `data-testid="hud-btn-interact"`), and the Pause / Archive modal (`data-testid="modal-exploration-panel"`, `data-testid="mission-journal-view"`, `data-testid="codex-entry-list"`, `data-testid="codex-entry-reader"`).
4. **Campaign Save Persistence & Production Test-Hook Gating**: `PersistedExplorationState` (`discoveredCodexIds`, `completedObjectiveIds`, `activatedNodeIds`, `unlockedRouteIds`) is persisted inside `CAMPAIGN_SAVE_VERSION = 2` while isolating Practice and Chapter Replay sessions. Mutable browser test hooks (`window.__afterframeTest`, `window.__advanceSimulation`) are gated behind `shouldExposeTestHooks(env)`.

---

## 2. Mission & Objective Registry (`Phase 18.1`)

All missions and objectives are defined in `GAME_CONFIG.exploration` (`src/game/config.ts`) and evaluated in `src/game/simulation.ts`:

| Chapter | Mission ID | Code | Primary (`main`) Objectives | Optional (`optional`) Objectives |
| :--- | :--- | :--- | :--- | :--- |
| `prologue` | `mission_prologue_calibration` | `MSN-00` | `obj_prologue_puzzle_calibration` -> `obj_prologue_clear_bay` | `obj_prologue_optional_terminal`, `obj_prologue_optional_power_node` |
| `chapter_1_helix` | `mission_ch1_helix` | `MSN-01` | `obj_ch1_break_helix_shield` -> `obj_ch1_defeat_helix` | `obj_ch1_optional_marshal_log`, `obj_ch1_optional_capacitor_route` |
| `chapter_2_choir` | `mission_ch2_choir` | `MSN-02` | `obj_ch2_sync_harmonic_cycle` -> `obj_ch2_defeat_choir` | `obj_ch2_optional_echo_conduit`, `obj_ch2_optional_chorus_log` |
| `chapter_3_curator` | `mission_ch3_curator` | `MSN-03` | `obj_ch3_purge_archive_decoy` -> `obj_ch3_defeat_curator` | `obj_ch3_optional_lysa_terminal`, `obj_ch3_optional_vault_power` |
| `chapter_4_matron` | `mission_ch4_matron` | `MSN-04` | `obj_ch4_survive_excision` -> `obj_ch4_defeat_matron` | `obj_ch4_optional_quarantine_node`, `obj_ch4_optional_surgical_log` |
| `chapter_5_loom` | `mission_ch5_loom` | `MSN-05` | `obj_ch5_decide_loom_fate` | `obj_ch5_optional_loom_manifest`, `obj_ch5_optional_anchor_conduit` |

### State Machine Rules
- **`locked`**: One or more `prerequisiteObjectiveIds` are not yet in `completedObjectiveIds`. Attempting to complete a locked objective via `completeMissionObjective` returns `false`.
- **`active`**: The first incomplete `main` objective whose prerequisites are satisfied.
- **`available`**: Any incomplete `optional` objective (or secondary `main` objective) whose prerequisites are satisfied.
- **`completed`**: Recorded in `completedObjectiveIds`. Duplicate completion attempts return `false` without emitting duplicate `mission_objective_completed` events.

---

## 3. Environmental Interactable Registry & Validation (`Phase 18.2`)

Each chapter arena hosts deterministic 3D world interactables rendered via a pre-allocated object pool in `ArenaRenderer` (`src/game/renderer.ts`):

| Interactable ID | Chapter | Kind | Coordinates `(x, z)` | Prerequisite / Requirement | Effect / Unlock |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `int_prologue_diagnostic_terminal` | `prologue` | `terminal` | `(-4.2, 10.6)` | None | Grants `CODEX-01`, `+15` Flux, completes `obj_prologue_optional_terminal` |
| `int_prologue_aux_power_node` | `prologue` | `power_node` | `(6.8, 3.2)` | None | Unlocks `int_prologue_shortcut_gate`, `+25` Flux |
| `int_prologue_shortcut_gate` | `prologue` | `gate_control` | `(6.8, -3.2)` | `int_prologue_aux_power_node` | Retracts `pillar-ne`, grants `CODEX-02`, completes `obj_prologue_optional_power_node` |
| `int_ch1_marshal_terminal` | `chapter_1_helix` | `terminal` | `(-7.5, 4.2)` | None | Grants `CODEX-03`, `+20` Flux, completes `obj_ch1_optional_marshal_log` |
| `int_ch1_ballistic_capacitor` | `chapter_1_helix` | `power_node` | `(7.5, -2.5)` | None | Retracts `pillar-nw`, `+30` Flux, `+15` Integrity, completes `obj_ch1_optional_capacitor_route` |
| `int_ch2_garden_echo_conduit` | `chapter_2_choir` | `echo_conduit` | `(-7.8, -3.2)` | Active Echo `[Y]` or Echo/Pulsecaster strike | Retracts `pillar-sw`, grants `CODEX-04`, `+35` Flux, completes `obj_ch2_optional_echo_conduit` |
| `int_ch2_chorus_log_terminal` | `chapter_2_choir` | `terminal` | `(7.8, 3.8)` | None | Grants `CODEX-05`, `+20` Flux, completes `obj_ch2_optional_chorus_log` |
| `int_ch3_lysa_archive_terminal` | `chapter_3_curator` | `terminal` | `(-7.6, 3.4)` | None | Grants `CODEX-06`, `+25` Flux, completes `obj_ch3_optional_lysa_terminal` |
| `int_ch3_vault_power_relay` | `chapter_3_curator` | `power_node` | `(7.6, -3.4)` | None | Retracts `pillar-se`, `+30` Flux, `+15` Integrity, completes `obj_ch3_optional_vault_power` |
| `int_ch4_quarantine_override_node` | `chapter_4_matron` | `gate_control` | `(-7.4, -2.8)` | None | Retracts `pillar-ne`, `+30` Flux, `+20` Integrity, completes `obj_ch4_optional_quarantine_node` |
| `int_ch4_surgical_log_terminal` | `chapter_4_matron` | `terminal` | `(7.4, 3.4)` | None | Grants `CODEX-07`, `+25` Flux, completes `obj_ch4_optional_surgical_log` |
| `int_ch5_loom_manifest_terminal` | `chapter_5_loom` | `terminal` | `(-5.8, 2.2)` | None | Grants `CODEX-08`, `+25` Flux, completes `obj_ch5_optional_loom_manifest` |
| `int_ch5_temporal_anchor_conduit` | `chapter_5_loom` | `echo_conduit` | `(5.8, 2.2)` | Active Echo `[Y]` or Echo/Pulsecaster strike | `+40` Flux, `+25` Integrity, completes `obj_ch5_optional_anchor_conduit` |

### Interaction Evaluation Order (`evaluateInteractionTarget`)
1. **`invalid_target`**: Unknown interactable ID or interactable belongs to another chapter.
2. **`already_activated`**: One-shot guard (`state.status === 'activated'`).
3. **`out_of_range`**: Player distance exceeds `interactRadius`.
4. **`prerequisite_locked`**: `prerequisiteInteractableId` has not been activated yet.
5. **`blocked_by_obstacle`**: Solid obstacle intersects the segment from Sera to the object (`hasClearLineOfSight`).
6. **`not_facing`**: Cosine of angle between Sera's facing vector and target direction is below `facingCosineThreshold`.
7. **`requires_echo`**: Object requires `world.echo.state === 'playback'` with an active Echo actor (or can be triggered remotely via Pulsecaster/Echo strike when `acceptsEchoOrPulseStrike` is set).
8. **`action_locked`**: Sera is mid-attack, dodging, parrying, staggered, or dead (`canPlayerExecuteInteraction`).
9. **`ready`**: `[I]` (`KeyI` or HUD `[I] INTERACT` button) executes the interaction.

---

## 4. Station Lore Codex (`Phase 18.3`)

| Codex ID | Chapter | Category | Title | Source / Unlock |
| :--- | :--- | :--- | :--- | :--- |
| `CODEX-01` | `prologue` | `system_diagnostic` | Chrono-Rig Mk.IV Field Calibration | `int_prologue_diagnostic_terminal` |
| `CODEX-02` | `prologue` | `incident_report` | Containment Bay 04 Bulkhead Lockdown | `int_prologue_shortcut_gate` |
| `CODEX-03` | `chapter_1_helix` | `personnel_log` | Marshal HELIX-04 Enforcement Directive | `int_ch1_marshal_terminal` |
| `CODEX-04` | `chapter_2_choir` | `research_note` | Acoustic Phase-Lock & Harmonic Pylons | `int_ch2_garden_echo_conduit` |
| `CODEX-05` | `chapter_2_choir` | `memory_trace` | Hydroponics Loop 412: The Repeating Garden | `int_ch2_chorus_log_terminal` |
| `CODEX-06` | `chapter_3_curator` | `personnel_log` | Lysa Venn: Behavioral Archive Audit | `int_ch3_lysa_archive_terminal` |
| `CODEX-07` | `chapter_4_matron` | `incident_report` | Surgical Wing Protocol: Temporal Excision | `int_ch4_surgical_log_terminal` |
| `CODEX-08` | `chapter_5_loom` | `memory_trace` | WARDEN Core Directive: The Last Loop | `int_ch5_loom_manifest_terminal` |

Undiscovered entries are masked in `getHudCodexEntries` (`discovered: false`, title masked as `ENCRYPTED RECORD // CODEX-XX`, body replaced with decryption instructions) so spoiler text is never leaked into the DOM before discovery.

---

## 5. Production Test-Hook Gating

`shouldExposeTestHooks(envConfig)` in `src/game/simulation.ts` controls whether `window.__afterframeTest` and `window.__advanceSimulation` are attached by `src/App.tsx`:
- Returns `false` when `PROD === true` or `MODE === 'production'` (unless `VITE_ENABLE_TEST_HOOKS === 'true'`).
- Returns `false` when `VITE_ENABLE_TEST_HOOKS === 'false'`.
- Returns `true` in local development/test environments (`DEV === true`, `PROD === false`).

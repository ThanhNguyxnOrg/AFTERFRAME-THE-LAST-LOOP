# AFTERFRAME: THE LAST LOOP — PHASE 19
## World Traversal, Environmental Challenges & Exploration Depth

---

## 1. Executive Summary

Phase 19 expands *AFTERFRAME: THE LAST LOOP* with a deterministic planar (`x, z`) world-traversal, environmental challenge, secret alcove discovery, and local sector map navigation layer across Nadir-9's six campaign sectors (`prologue` through `chapter_5_loom`).

All traversal, hazard timing, Echo conduit activation, secret discovery, and fog-of-discovery map snapshots are owned by the authoritative simulation (`src/game/simulation.ts`) and persisted in Campaign Save v2 (`afterframe_campaign_save_v1`, `version: 2`) while strictly isolating Practice and Chapter Replay sessions and preserving the exact **18-Memory-Fragment** campaign economy.

---

## 2. World Traversal Model & Obstacle Retraction

### 2.1 Planar Arena & Obstacle Integration
- Preserves the deterministic circular arena boundary (`radius = 22`) and `ObstacleCollider` circle colliders (`pillar-nw`, `pillar-ne`, `pillar-sw`, `pillar-se`, `central-core`, plus the Prologue West Containment Barrier).
- No jump mechanic or external physics engine is introduced.
- When a traversal route unlocks an arena containment pylon (`unlocksObstacleId`), `syncAllObstaclesWithExploration(world)` sets `obstacle.disabled = true` in the simulation and `ArenaSceneRenderer` smoothly retracts the 3D pylon into the deck (`targetY = -2.25`), opening physical movement, projectile line-of-sight, and Relay sightlines.

### 2.2 Authored Sector Regions (`SectorRegionId`)
Twelve named sector regions (`GAME_CONFIG.exploration.regions`) partition the six campaign chapters into primary arenas, bypass corridors, and hidden alcoves:

| Region ID | Chapter | Label | Center `(x, z)` | Radius | Secret Region |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `region_prologue_staging_deck` | `prologue` | South Calibration Staging Deck | `(0.0, 9.5)` | `7.5` | No |
| `region_prologue_west_lock` | `prologue` | West Anchor Calibration Lock | `(-4.0, 3.0)` | `5.2` | No |
| `region_prologue_east_bypass` | `prologue` | East Auxiliary Maintenance Bypass | `(7.8, -5.8)` | `5.0` | No |
| `region_prologue_secret_alcove` | `prologue` | East Calibration Overlook Alcove | `(13.4, -6.4)` | `3.2` | Yes (`secret_prologue_calibration_alcove`) |
| `region_ch1_nexus_core` | `chapter_1_helix` | Central Security Nexus Core | `(0.0, 2.0)` | `9.5` | No |
| `region_ch1_secret_armory` | `chapter_1_helix` | Containment Marshal Sub-Vault | `(-13.2, -6.2)` | `3.2` | Yes (`secret_ch1_marshal_armory_cache`) |
| `region_ch2_garden_rotunda` | `chapter_2_choir` | Hydroponic Acoustic Rotunda | `(0.0, 1.5)` | `9.5` | No |
| `region_ch2_secret_sanctum` | `chapter_2_choir` | Harmonic Resonator Sanctum | `(-13.0, 6.4)` | `3.2` | Yes (`secret_ch2_hydroponic_echo_sanctum`) |
| `region_ch3_archive_nave` | `chapter_3_curator` | Neural Archive Vault Nave | `(0.0, 1.5)` | `9.5` | No |
| `region_ch3_secret_vault` | `chapter_3_curator` | Lysa Venn Unindexed Memory Alcove | `(-13.2, 6.2)` | `3.2` | Yes (`secret_ch3_lysa_unedited_vault`) |
| `region_ch4_surgical_theater` | `chapter_4_matron` | Quarantine Surgical Theater | `(0.0, 1.5)` | `10.5` | No |
| `region_ch5_loom_sanctuary` | `chapter_5_loom` | Chronicle Loom Core Sanctuary | `(0.0, 0.0)` | `11.5` | No |

---

## 3. Three Environmental Traversal Challenge Types

### 3.1 Challenge Type 1 — Power-Rerouted Access Routes (`power_reroute`)
- **`route_prologue_east_bypass`** (`prologue`): Energize `int_prologue_aux_power_node` (`(8.8, 7.2)`) to route auxiliary power (`status: 'powered'`), then unseal `int_prologue_shortcut_gate` (`(6.6, -5.2)`) to retract `pillar-ne` (`status: 'open'`, `unlocked: true`).
- **`route_ch1_nw_timed_conduit`** (`chapter_1_helix`): Discharge `int_ch1_ballistic_capacitor` (`(-8.2, -5.4)`) to retract `pillar-nw` and open the NW Marshal Sub-Vault corridor.
- **`route_ch3_sw_archive_passage`** (`chapter_3_curator`): Energize `int_ch3_vault_power_relay` (`(-8.0, 5.6)`) to retract `pillar-sw` and open the SW Archive Passage.
- **`route_ch4_se_quarantine_lane`** (`chapter_4_matron`): Activate `int_ch4_quarantine_override_node` (`(8.0, 5.4)`) to retract `pillar-se` and open the SE Quarantine Bypass.

### 3.2 Challenge Type 2 — Timed Energy Passages (`TimedEnergyHazardState`)
Three deterministic, simulation-owned repeating industrial arc/purge hazards (`advanceTimedEnergyHazards(world, dt)`):

| Hazard ID | Chapter | Label | Position `(x, z)` | Radius | Safe / Warn / Active (`s`) | Damage | Linked Route |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `hazard_prologue_east_arc_vent` | `prologue` | East Bypass Arc Vent | `(11.2, -6.4)` | `2.1` | `1.8s` / `0.9s` / `1.1s` | `14` | `route_prologue_east_bypass` |
| `hazard_ch1_nw_arc_lane` | `chapter_1_helix` | NW Capacitor Discharge Vent | `(-11.0, -6.4)` | `2.2` | `1.9s` / `0.85s` / `1.15s` | `16` | `route_ch1_nw_timed_conduit` |
| `hazard_ch3_sw_purge_lane` | `chapter_3_curator` | SW Archive Thermal Purge Vent | `(-11.0, 6.4)` | `2.2` | `2.0s` / `0.9s` / `1.1s` | `16` | `route_ch3_sw_archive_passage` |

- **Fair Counterplay**:
  - Cycles deterministically through `safe` (cyan), `warning` (amber), and `active` (crimson).
  - Applies at most one hit per active cycle (`playerHitCooldown = 0.85s`).
  - Respects player Dodge invulnerability (`invulnerableTimer > 0` or `action === 'dodge'`) and Phase Shift.
  - Freezes cleanly while paused (`appState !== 'playing'`) and dampens visual pulse oscillation when `reducedMotion` is enabled.

### 3.3 Challenge Type 3 — Echo-Controlled Traversal Mechanisms (`echo_conduit`)
- **`route_ch2_sw_echo_bridge`** (`chapter_2_choir`): Linked to `int_ch2_garden_echo_conduit` (`(-8.2, 5.6)`, `requiresActiveEcho: true`, `unlocksObstacleId: 'pillar-sw'`). Activates when an Echo is replaying nearby while Sera interacts (`[I]`), or when a replaying Echo strikes or holds proximity on the conduit, retracting `pillar-sw`.
- **`route_ch5_loom_anchor_bridge`** (`chapter_5_loom`): Linked to `int_ch5_temporal_anchor_conduit` (`(-8.4, -5.6)`, `requiresActiveEcho: true`, `unlocksObstacleId: 'pillar-nw'`). Retracts `pillar-nw` when attuned via Echo playback.
- **`route_prologue_west_containment`** (`prologue`): Unlocks when the 3-stage Chrono Calibration sequence (`Anchor Pad 01 [Y]` -> `Heavy Receiver [E]` -> `Combine Plate`) opens the West Containment Barrier.

---

## 4. Secret Exploration Areas (`SecretAreaId`)

Four authored secret alcoves (`GAME_CONFIG.exploration.secrets`) reward observant exploration and route mastery without inflating the 18-Memory-Fragment campaign economy:

| Secret ID | Chapter | Title | Coordinates `(x, z)` | Prerequisite Route | Linked Codex | Restoration Bonus |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `secret_prologue_calibration_alcove` | `prologue` | East Calibration Overlook | `(13.4, -6.4)` | `route_prologue_east_bypass` | `CODEX-01` | `+20 Integrity`, `+25 Flux` |
| `secret_ch1_marshal_armory_cache` | `chapter_1_helix` | Containment Marshal Sub-Vault | `(-13.2, -6.2)` | `route_ch1_nw_timed_conduit` | `CODEX-03` | `+25 Integrity`, `+30 Flux` |
| `secret_ch2_hydroponic_echo_sanctum` | `chapter_2_choir` | Harmonic Resonator Sanctum | `(-13.0, 6.4)` | `route_ch2_sw_echo_bridge` | `CODEX-04` | `+25 Integrity`, `+35 Flux` |
| `secret_ch3_lysa_unedited_vault` | `chapter_3_curator` | Lysa Venn Unindexed Memory Alcove | `(-13.2, 6.2)` | `route_ch3_sw_archive_passage` | `CODEX-05` | `+30 Integrity`, `+35 Flux` |

- **Idempotency & Economy Protection**:
  - Entering an accessible alcove (`discoverSecretArea(world, secretId)`) triggers the reward and HUD discovery banner (`[data-testid="hud-secret-discovery-banner"]`) at most once per campaign save.
  - Grants `0` Memory Fragments (`progression.memoryFragments` remains strictly tied to the 6 campaign milestones totaling `18` fragments).

---

## 5. Local Sector Map & Fog-of-Discovery (`SECTOR MAP [N]`)

- **Access**: Press `[N]` (`KeyN`) during gameplay or click the HUD `MAP [N]` button (`[data-testid="hud-map-btn"]`), or switch to the `SECTOR MAP [N]` tab (`[data-testid="modal-tab-map"]`) in `StatusModal`.
- **Top-Down Schematic (`[data-testid="local-sector-map"]`)**:
  - Displays the circular sector boundary, Sera's live position and facing vector, primary/optional mission objectives, interactable nodes, traversal routes (`LOCKED` / `POWERED` / `OPEN`), timed energy passages (`SAFE` / `WARNING` / `ACTIVE`), and secret alcove markers.
- **Fog-of-Discovery**:
  - Undiscovered secret alcoves display a dashed fog overlay on the schematic and render as `UNINDEXED SECTOR SIGNAL // FOG OF DISCOVERY` (`hiddenByFog: true`) until the player physically enters and discovers the alcove.

---

## 6. Campaign Save v2 & Replay Isolation

- `CAMPAIGN_SAVE_VERSION` upgraded to `2` (`afterframe_campaign_save_v1`) with seamless migration from v1 saves.
- Persists `discoveredRegionIds` and `discoveredSecretIds` alongside `discoveredCodexIds`, `completedObjectiveIds`, `activatedNodeIds`, and `unlockedRouteIds`.
- Practice mode (`run.mode === 'practice'`) and Chapter Replay (`run.isChapterReplay === true`) remain strictly isolated and never mutate the persisted campaign exploration state.

---

## 7. Verification Evidence

1. **Automated Unit & Integration Tests (`npm test`)**:
   - **194 / 194 tests passing** across `simulation.test.ts` (including `Phase 19.1` through `19.5`), `campaign-release.test.ts` (including Test #17 verifying all 4 secret areas and the 18-Fragment cap), `reduced-motion.test.ts`, and `asset-lifecycle.test.ts`.
2. **TypeScript & Production Build**:
   - `npm run lint` (`tsc --noEmit`): 0 errors.
   - `npm run build` (`vite build`): Succeeded cleanly.
3. **Playwright Headless Chromium Verification (`http://localhost:3000`)**:
   - Verified on Desktop (`1280x800`) and Mobile (`390x844`, `overflowX: false`) with 0 console/page errors:
     - HUD `MAP [N]` button (`[data-testid="hud-map-btn"]`), timed hazard badge (`[data-testid="hud-hazard-telemetry"]`), and secret counter (`SECRETS 0/1 -> 1/1`).
     - `SECTOR MAP [N]` modal (`[data-testid="local-sector-map"]`) fog-of-discovery state (`UNINDEXED SECTOR SIGNAL // FOG OF DISCOVERY [SEALED]`) before discovery and full reveal (`East Calibration Overlook [DISCOVERED]`) after unlocking `route_prologue_east_bypass` and entering the alcove.
     - Chapter II Echo Conduit bridge (`int_ch2_garden_echo_conduit` -> `route_ch2_sw_echo_bridge` -> `pillar-sw` disabled -> `secret_ch2_hydroponic_echo_sanctum`) and Campaign Save v2 persistence (`version: 2`).

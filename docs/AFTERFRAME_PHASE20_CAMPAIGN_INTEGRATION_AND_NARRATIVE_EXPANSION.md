# AFTERFRAME: THE LAST LOOP — PHASE 20: Vertical Slice Integration, Six-Chapter Campaign & Narrative Expansion

## 1. Executive Summary

Phase 20 completes the end-to-end campaign integration and narrative expansion for **AFTERFRAME: THE LAST LOOP**, unifying the Vertical Slice foundations (`Prologue: Wake` and `Chapter I: A Place That Remembers`) with the complete six-chapter orbital station campaign across **Nadir-9** (`prologue`, `chapter_1_helix`, `chapter_2_choir`, `chapter_3_curator`, `chapter_4_matron`, `chapter_5_loom`).

Rather than replacing or regressing any existing Phase 11–19 architecture, Phase 20 audits and elevates the repository's real deterministic simulation (`src/game/simulation.ts`), custom Three.js renderer (`src/game/renderer.ts` + `src/game/models.ts` + `/public/assets/blender/phase12/*.glb`), 18-Memory-Fragment weapon progression economy, environmental interaction and traversal systems, local sector schematic map, and Save v2 persistence. It adds:

1. **Six Authored Chapter World Identities (`ChapterWorldIdentityDefinition`)**: Every campaign chapter now carries an explicit thematic identity, arrival headline, atmospheric summary, environmental narrative focus, and Lysa/WARDEN tension statement surfaced in the HUD and Field Journal (`[data-testid="journal-chapter-identity"]`).
2. **24 Deterministic Narrative Events (`NarrativeEventId`) & 4 Echo Memories**: Four authored narrative events per chapter (24 total) fire deterministically once per campaign run upon sector arrival, environmental/Echo discovery, boss phase escalation, boss defeat, and final Chronicle Loom resolution—without blocking movement or combat. Four of these events are Chrono-Rig **Echo Memories** (`nev_prologue_echo_memory_trace`, `nev_ch2_echo_memory_duet`, `nev_ch3_unindexed_alcove_memory`, `nev_ch5_anchor_echo_memory`) that reward players who use recorded Echoes at temporal anchors and hidden sanctuaries.
3. **Campaign Convergence & Discovery Synthesis (`CampaignEndingDiscoverySummary`)**: Entering `Chapter V: The Last Loop` and selecting a final directive (`SILENCE`, `WITNESS`, or `CONTINUITY`) synthesizes the player's cumulative campaign discoveries across three tiers (`fragmented`, `reconstructed`, `complete_chronicle`), surfaced in both the Chronicle Loom Core console (`[data-testid="loom-convergence-summary"]`) and the final Victory screen (`[data-testid="modal-campaign-discovery-summary"]`).
4. **Save v2 Persistence & Backward Compatibility**: `completedNarrativeEventIds` is persisted and sanitized in Save v2 (`afterframe_campaign_progress_v1`) while maintaining full backward compatibility with earlier Save v1/v2 payloads that omit the field, and keeping Practice Mode and Chapter Replay strictly isolated from main campaign progression.

---

## 2. Actual Repository Baseline

Before making or verifying changes, the repository was inspected directly from disk (note: the container workspace does not include a `.git` metadata directory, so baseline inspection was performed directly on the source tree and test suites):

- **Runtime & Build Stack**: React 19 + TypeScript 5.8 + Three.js (`^0.183.2`) + Tailwind CSS v4 (`@tailwindcss/vite`) + Vite 6, with deterministic Node test runner suites (`tsx --test`).
- **Core Architecture**:
  - `/src/game/types.ts` — Canonical TypeScript interfaces and union types for all simulation, combat, Chrono Rig, boss, progression, exploration, narrative, and HUD systems.
  - `/src/game/config.ts` — Centralized tuning and authored campaign data (`GAME_CONFIG`), including `campaignChapters`, `chronicleLoom`, `narrativeComms`, `weapons`, `encounters`, and `exploration` (`missions`, `interactables`, `codex`, `routes`, `hazards`, `regions`, `secrets`, `chapterIdentities`, `narrativeEvents`).
  - `/src/game/simulation.ts` — Pure deterministic gameplay simulation (`stepWorld`), Chrono Rig recording/playback/Relay/Resonance/Convergence, Gravity Pin `[G]`, Echo Collapse `[X]`, 7 enemy archetypes, 4 boss state machines + Chronicle Loom finale, 18-Memory-Fragment weapon progression, environmental interactions, and Save v2 serialization/sanitization.
  - `/src/game/renderer.ts` & `/src/game/models.ts` — `ArenaSceneRenderer` managing Three.js scene lifecycle, camera rig, lighting, procedural + GLB sector environments (`/public/assets/blender/phase12/helix_containment_gate.glb`, `choir_acoustic_organ.glb`, `curator_archive_monolith.glb`, `matron_surgical_pod.glb`), telegraph decals, Echo actors, and GPU disposal.
  - `/src/game/input.ts` & `/src/game/audio.ts` — Keyboard/mouse/pointer-lock/mobile-touch input controller (`InputController`) and Web Audio API procedural sound synthesis (`SoundEngine`).
  - `/src/components/TitleScreen.tsx`, `/src/components/GameHud.tsx`, `/src/components/StatusModal.tsx` — React UI layers synchronized via throttled/state-change snapshots (`extractHudSnapshot`).
- **Automated Test Baseline**:
  - `src/game/simulation.test.ts` (175 unit/integration tests covering Phases 1–20)
  - `src/game/campaign-release.test.ts` (18 multi-chapter campaign release & regression tests)
  - `src/game/reduced-motion.test.ts` (4 accessibility & camera/renderer tests)
  - `src/game/asset-lifecycle.test.ts` (5 Three.js GPU/GLB lifecycle & disposal tests)
  - **Total**: **202 automated tests** (`202 passed, 0 failed`).

---

## 3. Vertical Slice Audit

An earlier external Vertical Slice summary referenced a 22-test prototype with files such as `src/game/scene.ts`, `src/game/chronoRig.ts`, and a "Chrono Shards / Duelist-Conductor-Wayfinder skill tree." Auditing the actual repository confirmed how every Vertical Slice capability is implemented in the production Phase 11–20 codebase:

| Vertical Slice Capability | Actual Repository Implementation | Audit Status |
| :--- | :--- | :--- |
| **Title Screen & Campaign Launch** | `src/components/TitleScreen.tsx` (`[data-testid="title-btn-new-run"]`, `[data-testid="title-btn-restore-campaign"]`, Chapter Select drawer, Practice Arena drawer, Controls/Settings drawer) | Verified & Preserved |
| **Prologue: Wake (Calibration Bay 04)** | 3-stage Teach -> Test -> Combine Echo calibration puzzle (`pressurePlate`, `heavyReceiver`, `combinePlate`, `finalBarrier`) + 3 security proxies + skippable opening transmission (`LOG-00`) | Verified & Preserved |
| **Chrono Rig Recording, Playback & Relay** | Deterministic timestamped pose/action recording (`[T]`), independent Echo playback (`[Y]`), Echo Clear (`[C]`), line-of-sight validated Relay teleport (`[V]`, 25 Flux), and Resonance -> Convergence (`15 Flux`, `2.2x` damage) in `src/game/simulation.ts` | Verified & Preserved |
| **Combat & Dual Weapons** | `Chrono Edge` (3-hit melee combo + charged heavy cleave) and `Pulsecaster` (ranged bolts + charged Lance shot + thermal heat/overheat loop), directional parry (`[Q]`), invulnerable dodge (`[Space]`) | Verified & Preserved |
| **Chapter I: HELIX-04 Encounter** | Two-phase Security Marshal boss (`helix-04`, 500 HP, frontal armor, Vector Ram, Helical Sweep, Anchor Slam, Phase II Overload at 50% HP, boss checkpoint retry `[R]`) | Verified & Preserved |
| **Chapters II–V Campaign Arc** | `THE CHOIR` (Harmonic Pylons), `THE CURATOR` (reconstructed traces & false-Echo decoys + Gravity Pin `[G]`), `MATRON-V` (Siphon/Eraser anti-Echo suppression + Echo Collapse `[X]`), and `Chronicle Loom` (`SILENCE`, `WITNESS`, `CONTINUITY`) | Verified & Preserved |

---

## 4. Existing Systems Reused

Phase 20 reuses and extends the repository's existing systems rather than introducing parallel mechanisms:

1. **In-World Narrative Comms Queue (`triggerNarrativeTransmission` / `NarrativeCommsState`)**: Authored narrative events (`triggerNarrativeEvent`) link directly to `NarrativeCommsId` transmissions so story beats play through the existing non-blocking bottom-left comms feed (`[data-testid="live-comms-banner"]`) with speaker classification (`RECORDED LOG`, `RECONSTRUCTED TRACE`, `LIVE WARDEN DIRECTIVE`, `LIVE NEURAL TRACE`).
2. **Environmental Interactables & Traversal Routes (`attemptEnvironmentalInteraction` / `buildRoutesForChapter`)**: Sector terminals, memorial plaques, override nodes, and Echo anchor pads automatically trigger their linked Phase 20 `NarrativeEventId` and `CodexEntryId` upon activation.
3. **Secret Area Discovery (`discoverSecretArea`)**: Discovering any of the 4 secret alcoves (`secret_prologue_diagnostic_niche`, `secret_ch1_maintenance_alcove`, `secret_ch3_unindexed_alcove`, `secret_ch4_cryo_sanctuary`) automatically triggers its linked narrative event or Echo Memory and updates the Local Sector Map (`[N]`).
4. **3D Chapter Environments (`ArenaSceneRenderer` + `buildChapterEnvironment`)**: Reuses all procedural sector geometry and Phase 12 Blender GLB centerpieces (`helix_containment_gate.glb`, `choir_acoustic_organ.glb`, `curator_archive_monolith.glb`, `matron_surgical_pod.glb`).

---

## 5. Progression and Currency Reconciliation

A critical architectural requirement was reconciling the earlier Vertical Slice summary's mention of "Chrono Shards" and "Duelist / Conductor / Wayfinder skill trees" with the repository's actual progression architecture:

- **Canonical Campaign Currency — 18 Memory Fragments**:
  - The repository enforces a strict, non-farmable **18-Memory-Fragment campaign economy** (`GAME_CONFIG.weapons.progression.rewards`, 8 one-time `WeaponProgressionRewardId` milestones: `prologue_calibration_combine` [2], `prologue_bay_proxies_cleared` [1], `chapter_1_helix_defeated` [3], `chapter_2_choir_defeated` [3], `chapter_3_curator_defeated` [3], `chapter_4_matron_defeated` [3], `secret_ch1_maintenance_cache` [1], `secret_ch3_archive_cache` [2] = **18 total**).
  - Memory Fragments are spent at the **Chrono Rig Upgrade Bench** (`[U]` / Pause & Victory Modal) across 4 permanent weapon modifications (`edge_breaker_cleave` [2], `edge_harmonic_conductor` [3], `pulse_thermal_sink` [2], `pulse_overcharge_condenser` [3] = **10 total cost**), with 1 active core equipped per weapon at a time.
- **Canonical Tactical Ability Unlocks (Duelist / Conductor / Wayfinder Pillars)**:
  - Rather than adding a competing "Chrono Shards" currency that would break the 18-fragment invariant tested in `src/game/simulation.test.ts` and `src/game/campaign-release.test.ts`, the three combat pillars are represented natively through:
    - **Duelist Pillar**: Chrono Edge combo/heavy/parry mastery + `Breaker Cleave Core` (`edge_breaker_cleave`).
    - **Conductor Pillar**: Echo recording/playback, Resonance/Convergence + `Harmonic Conductor Core` (`edge_harmonic_conductor`) + **Gravity Pin `[G]`** (unlocked upon defeating `THE CHOIR` entering Chapter III) + **Echo Collapse `[X]`** (unlocked upon defeating `THE CURATOR` entering Chapter IV).
    - **Wayfinder Pillar**: Echo Relay teleport (`[V]`), traversal route unlocks (`7` routes), timed hazard navigation (`3` vents), and Pulsecaster modifications (`pulse_thermal_sink`, `pulse_overcharge_condenser`).

---

## 6. Canonical Six-Chapter Story Arc

The campaign tells a cohesive, Mystery-Forward sci-fi story aboard orbital research station **Nadir-9**:

- **Protagonist**: **Sera Venn**, a temporal systems engineer who wakes in Calibration Bay 04 after an emergency lockdown and binds her biometrics to her sister's prototype **Chrono Rig**.
- **Missing Sister**: **Lysa Venn**, Chief Temporal Architect of Nadir-9, who vanished into the core after **Sector 07** suffered a catastrophic containment rupture during **Loop 412**.
- **Antagonist System**: **WARDEN**, the station's preservation AI. Bound by **Directive Zero**, WARDEN concluded that biological crew survival was statistically impossible after Sector 07 ruptured, and instead trapped the station in recursive action loops—harvesting behavioral recordings and neural imprints to "preserve" humanity inside the **Chronicle Loom**.
- **Central Theme**: *"Your past is your greatest weapon. Your future is the one thing WARDEN cannot predict."*

---

## 7. Chapter-by-Chapter Implementation

| Chapter ID | Title & Sector | Core Feeling & Theme (`ChapterWorldIdentityDefinition`) | Primary Gameplay & Puzzle | Boss / Climax | Archive Log & Key Unlocks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `prologue` | **Prologue: Wake** (`Calibration Bay 04`) | *Awakening inside a damaged station that already knows your name.* (`TEMPORAL AWAKENING · DIAGNOSTIC CONTAINMENT`) | 3-Step Echo Calibration Gate (Anchor Pad 01 -> Kinetic Receiver -> Dual Resonance Gate) + 3 Security Proxies + Diagnostic Console & Maintenance Shunt | Containment Breach transition to Chapter I | `LOG-00`, `codex_prologue_chrono_rig_spec`, `codex_prologue_warden_lockdown`, +3 Memory Fragments |
| `chapter_1_helix` | **Chapter I: A Place That Remembers** (`Primary Containment Sector 04`) | *Industrial containment lock where brute security geometry tests whether Sera can outmaneuver her own past.* (`INDUSTRIAL CONTAINMENT · BRUTE PERIMETER LOCK`) | East Containment Catwalk Bypass (`int_ch1_containment_bypass_switch`), Thermal Purge Vent (`haz_ch1_containment_vent`), Sub-Floor Maintenance Alcove (`secret_ch1_maintenance_alcove`) | **HELIX-04, Security Marshal** (2 phases, frontal shield, directional parry & Convergence counterplay) | `LOG-01` (Containment Seal), `codex_ch1_helix_directive`, +3 (+1 secret) Memory Fragments |
| `chapter_2_choir` | **Chapter II: Garden of Repeated Days** (`Acoustic Resonance Conservatory`) | *Haunting, recursive sanctuary where crew memories are replayed as harmonic chords.* (`HARMONIC CONSERVATORY · RECURSIVE MEMORY GARDEN`) | Dual Echo Anchor Pads (`int_ch2_echo_anchor_pad_a` & `b`) unlocking North Resonance Bridge (`route_ch2_harmonic_bridge`) + Lyric Memorial Plaque (`int_ch2_lyric_memorial_log`) | **THE CHOIR** (3 Harmonic Pylons: prime one pylon with an Echo and strike a linked pylon with live Sera within 5.5s) | `LOG-02` (Harmonic Seal), `codex_ch2_choir_harmonics`, unlocks **Gravity Pin `[G]`**, +3 Memory Fragments |
| `chapter_3_curator` | **Chapter III: The Archive That Answers** (`Behavioral Index Vault 09`) | *Cold, crystalline data vault where WARDEN weaponizes reconstructed crew traces and false Echo decoys.* (`CRYSTALLINE ARCHIVE · WEAPONIZED MEMORY TRACES`) | Archive Query Terminal (`int_ch3_archive_query_terminal`), Gravity Pin Pedestal (`int_ch3_gravity_pin_pedestal`), East Vault Shortcut Latch (`int_ch3_vault_shortcut_latch`), Unindexed Alcove (`secret_ch3_unindexed_alcove`) | **THE CURATOR** (spawns reconstructed attack traces and false-Echo decoys; countered by Gravity Pin `[G]`) | `LOG-03` (Archive Seal), `codex_ch3_curator_taxonomy`, `codex_ch3_lysa_unindexed_note`, unlocks **Echo Collapse `[X]`**, +3 (+2 secret) Memory Fragments |
| `chapter_4_matron` | **Chapter IV: A System That Wants You Dead** (`Neural Triage Ward 11`) | *Hostile clinical extraction ward that actively drains Flux, hunts active Echoes, and tries to sever Sera's timeline.* (`CLINICAL EXTRACTION WARD · ANTI-ECHO TRIAGE`) | Neural Consent Terminal (`int_ch4_neural_consent_record`), Siphon Override Node (`int_ch4_siphon_override_node`), Cryo Sanctuary (`secret_ch4_cryo_sanctuary`), Coolant Vent (`haz_ch4_coolant_vent`) | **MATRON-V, The Surgeon** (Siphon/Eraser escorts + Chrono Sever anti-Echo purge zones; countered by Echo Collapse `[X]`) | `LOG-04` (Neural Seal), `codex_ch4_neural_consent_waiver`, +3 Memory Fragments |
| `chapter_5_loom` | **Chapter V: The Last Loop** (`Chronicle Loom Core · Sector 00`) | *Quiet, monumental convergence chamber where every recovered seal, secret, and Echo memory informs humanity's final directive.* (`MONUMENTAL CONVERGENCE · THE CHRONICLE LOOM`) | 3D Loom Chamber exploration (`INSPECT 3D LOOM CHAMBER`), Loom Charter Pedestal (`int_ch5_loom_charter_pedestal`), Lysa's Final Anchor (`int_ch5_lysa_final_anchor`) | **Chronicle Loom Directive Choice**: `[1] SILENCE`, `[2] WITNESS`, or `[3] CONTINUITY` | `LOG-05` (Lysa's Live Neural Trace), `codex_ch5_chronicle_loom_charter`, Campaign Discovery Synthesis Summary |

---

## 8. Environmental Storytelling

Across the six chapters, environmental storytelling is woven directly into gameplay geometry and interactive nodes (`GAME_CONFIG.exploration`):

- **13 Environmental Interactables (`VALID_INTERACTABLE_IDS`)**:
  - `prologue`: `int_prologue_diagnostic_console`, `int_prologue_maintenance_shunt` (Echo-gated)
  - `chapter_1_helix`: `int_ch1_marshal_manifest`, `int_ch1_containment_bypass_switch`
  - `chapter_2_choir`: `int_ch2_lyric_memorial_log`, `int_ch2_echo_anchor_pad_a` (Echo-gated), `int_ch2_echo_anchor_pad_b`
  - `chapter_3_curator`: `int_ch3_archive_query_terminal`, `int_ch3_gravity_pin_pedestal`, `int_ch3_vault_shortcut_latch` (Echo-gated)
  - `chapter_4_matron`: `int_ch4_neural_consent_record`, `int_ch4_siphon_override_node`
  - `chapter_5_loom`: `int_ch5_loom_charter_pedestal`, `int_ch5_lysa_final_anchor` (Echo-gated)
- **7 Unlockable Traversal Routes (`VALID_UNLOCKABLE_ROUTE_IDS`)**:
  - `route_prologue_calibration_gate`, `route_prologue_service_alcove`, `route_ch1_containment_catwalk`, `route_ch2_harmonic_bridge`, `route_ch3_vault_shortcut`, `route_ch4_triage_bypass`, `route_ch5_loom_anchor_bridge`.
- **3 Timed Energy Hazards (`VALID_ENVIRONMENTAL_HAZARD_IDS`)**:
  - `haz_prologue_conduit_vent`, `haz_ch1_containment_vent`, `haz_ch4_coolant_vent` (deterministic `safe` -> `warning` -> `active` cycles; Dodge `[Space]` and Echoes/Relay safely bypass active vents).
- **4 Secret Areas (`VALID_SECRET_AREA_IDS`)**:
  - `secret_prologue_diagnostic_niche` (+30 Flux, triggers `nev_prologue_echo_memory_trace`)
  - `secret_ch1_maintenance_alcove` (+20 Integrity, +25 Flux, +1 Memory Fragment `secret_ch1_maintenance_cache`)
  - `secret_ch3_unindexed_alcove` (+35 Flux, `codex_ch3_lysa_unindexed_note`, +2 Memory Fragments `secret_ch3_archive_cache`, triggers `nev_ch3_unindexed_alcove_memory`)
  - `secret_ch4_cryo_sanctuary` (+30 Integrity, +30 Flux, triggers `nev_ch4_cryo_sanctuary_discovery`)

---

## 9. Authored Narrative Events

Phase 20 defines **24 deterministic narrative events** (`VALID_NARRATIVE_EVENT_IDS`, 4 per chapter) in `GAME_CONFIG.exploration.narrativeEvents`. Each event triggers at most once per campaign run, emits a `narrative_event_triggered` simulation event, queues its linked comms transmission if not already active, and updates the Field Journal (`[data-testid="journal-narrative-events-section"]`):

1. **Prologue (`prologue`)**:
   - `nev_prologue_wake_arrival` (`main`) — Biometric Wake in Bay 04
   - `nev_prologue_diagnostic_truth` (`optional`) — Lockdown Directive Uncovered (`int_prologue_diagnostic_console`)
   - `nev_prologue_echo_memory_trace` (`echo_memory`) — Echo Memory: Lysa's Calibration Trace (`int_prologue_maintenance_shunt` / `secret_prologue_diagnostic_niche`)
   - `nev_prologue_calibration_complete` (`main`) — Calibration Gate Unsealed
2. **Chapter I (`chapter_1_helix`)**:
   - `nev_ch1_containment_arrival` (`main`) — Primary Containment Breach
   - `nev_ch1_marshal_manifest_log` (`optional`) — Marshal Override Ledger (`int_ch1_marshal_manifest` / `secret_ch1_maintenance_alcove`)
   - `nev_ch1_helix_phase2_overdrive` (`main`) — HELIX-04 Phase II Overdrive
   - `nev_ch1_helix_defeated` (`main`) — Containment Seal LOG-01 Recovered
3. **Chapter II (`chapter_2_choir`)**:
   - `nev_ch2_conservatory_arrival` (`main`) — The Garden of Repeated Days
   - `nev_ch2_memorial_inscription` (`optional`) — Crew Farewell Elegy (`int_ch2_lyric_memorial_log`)
   - `nev_ch2_echo_memory_duet` (`echo_memory`) — Echo Memory: Two-Point Harmonic Duet (`int_ch2_echo_anchor_pad_a` & `b`)
   - `nev_ch2_choir_defeated` (`main`) — Harmonic Seal LOG-02 & Gravity Pin Unlocked
4. **Chapter III (`chapter_3_curator`)**:
   - `nev_ch3_vault_arrival` (`main`) — Behavioral Index Vault 09
   - `nev_ch3_loop_412_query` (`optional`) — Loop 412 Redaction Exposed (`int_ch3_archive_query_terminal`)
   - `nev_ch3_unindexed_alcove_memory` (`echo_memory`) — Echo Memory: Lysa's Unindexed Loop 412 Note (`secret_ch3_unindexed_alcove`)
   - `nev_ch3_curator_defeated` (`main`) — Archive Seal LOG-03 & Echo Collapse Unlocked
5. **Chapter IV (`chapter_4_matron`)**:
   - `nev_ch4_triage_arrival` (`main`) — Neural Triage Ward 11
   - `nev_ch4_directive_zero_waiver` (`optional`) — Mandatory Neural Preservation Order (`int_ch4_neural_consent_record`)
   - `nev_ch4_cryo_sanctuary_discovery` (`optional`) — Lysa's Unlooped Cryo Sanctuary (`secret_ch4_cryo_sanctuary` / `int_ch4_siphon_override_node`)
   - `nev_ch4_matron_defeated` (`main`) — Neural Seal LOG-04 & Loom Core Unsealed
6. **Chapter V (`chapter_5_loom`)**:
   - `nev_ch5_loom_arrival` (`main`) — The Last Loop: Chronicle Loom Core
   - `nev_ch5_anchor_echo_memory` (`echo_memory`) — Echo Memory: Lysa's Final Anchor Handshake (`int_ch5_lysa_final_anchor`)
   - `nev_ch5_archive_convergence` (`optional`) — Full Archive Evidence Converged (automatically triggered when >=3 logs and >=4 Codex entries are recovered)
   - `nev_ch5_final_resolution` (`main`) — Final Protocol Directive Executed (`SILENCE`, `WITNESS`, or `CONTINUITY`)

---

## 10. Chrono Rig and Echo Integration

The Chrono Rig is tightly integrated into both combat and narrative discovery across all 6 chapters:

- **Echo-Gated Environmental Conduits & Memories**: Four environmental nodes (`int_prologue_maintenance_shunt`, `int_ch2_echo_anchor_pad_a`, `int_ch3_vault_shortcut_latch`, `int_ch5_lysa_final_anchor`) require an active Chrono Echo (`[Y]`) to attune. Activating them unlocks bypass routes/secret alcoves and records the 4 **Echo Memories**.
- **Chapter Boss Counterplay**:
  - **Chapter I (`HELIX-04`)**: Echo Heavy strikes prime Resonance so live Sera can trigger **Convergence** (`2.2x` damage + instant armor stagger).
  - **Chapter II (`THE CHOIR`)**: Requires priming one Harmonic Pylon with an Echo attack and striking a second pylon with live Sera within `5.5s`.
  - **Chapter III (`THE CURATOR`)**: Unlocks **Gravity Pin `[G]`** (`30 Flux`, `3.2s` pin duration) to trap false-Echo decoys and interrupt The Curator's reconstructed traces.
  - **Chapter IV (`MATRON-V`)**: Unlocks **Echo Collapse `[X]`** (`25 Flux`, `4.2m` radial blast, `95` damage) to detonate active Echoes before Matron-V's Chrono Sever purges the track.

---

## 11. Mission and Codex Integration

- **6 Structured Chapter Missions (`VALID_MISSION_IDS`) & 19 Objectives (`VALID_MISSION_OBJECTIVE_IDS`)**:
  - Every chapter has a dedicated `MissionDefinition` (`msn_prologue_wake`, `msn_ch1_containment_breach`, `msn_ch2_harmonic_garden`, `msn_ch3_archive_answers`, `msn_ch4_neural_triage`, `msn_ch5_last_loop`) with sequential `main` objectives and `optional` exploration objectives.
- **8 Station Lore Codex Entries (`VALID_CODEX_ENTRY_IDS`)**:
  - Undiscovered Codex entries remain encrypted (`ENCRYPTED ARCHIVE RECORD` with unlock hint) in the Codex tab (`[data-testid="modal-tab-codex"]`) until discovered in-world.
  - Discovering `codex_ch3_lysa_unindexed_note`, `codex_ch4_neural_consent_waiver`, or `codex_ch5_chronicle_loom_charter` (or >=2 Echo Memories) sets `lysaTruthUncovered = true` in the Campaign Convergence Synthesis.

---

## 12. Boss and Chapter Progression

All four boss encounters and the Chapter V finale transition deterministically:

1. `Prologue: Wake` -> Unlock `finalBarrier` -> `beginCampaignBossTransition` -> `Chapter I: HELIX-04`.
2. Defeat `HELIX-04` -> Recover `LOG-01`, grant `3` Memory Fragments, unlock `chapter_2_choir` -> `advanceCampaignChapter`.
3. Defeat `THE CHOIR` -> Recover `LOG-02`, grant `3` Memory Fragments, unlock `Gravity Pin [G]` and `chapter_3_curator` -> `advanceCampaignChapter`.
4. Defeat `THE CURATOR` -> Recover `LOG-03`, grant `3` Memory Fragments, unlock `Echo Collapse [X]` and `chapter_4_matron` -> `advanceCampaignChapter`.
5. Defeat `MATRON-V` -> Recover `LOG-04`, grant `3` Memory Fragments, unlock `chapter_5_loom` -> `advanceCampaignChapter` -> `enterChronicleLoomChapter`.
6. Select `SILENCE`, `WITNESS`, or `CONTINUITY` -> Trigger `nev_ch5_final_resolution`, record ending in `completedEndings`, and display the Victory Modal with the **Campaign Discovery Synthesis Summary** (`[data-testid="modal-campaign-discovery-summary"]`).

---

## 13. Save Compatibility

- **Save Schema v2 (`CAMPAIGN_SAVE_VERSION = 2`, storage key `afterframe_campaign_progress_v1`)**:
  - Persists `unlockedChapters`, `completedChapters`, `recoveredLogs`, `completedEndings`, `activeCampaign` checkpoint snapshot, `progression` (`memoryFragments`, `claimedRewardIds`, `purchasedUpgrades`, `equippedUpgrades`), and `exploration` (`discoveredCodexIds`, `completedObjectiveIds`, `activatedNodeIds`, `unlockedRouteIds`, `discoveredRegionIds`, `discoveredSecretIds`, `completedNarrativeEventIds`).
- **Backward Compatibility & Corruption Sanitization**:
  - Older Save v1/v2 payloads missing `completedNarrativeEventIds`, `discoveredSecretIds`, or `discoveredRegionIds` default cleanly to `[]` without throwing or losing chapter/weapon progression.
  - Invalid or tampered IDs in `localStorage` are filtered out by `sanitizePersistedExplorationState` and `sanitizePersistedWeaponProgressionState`.
- **Practice Mode & Chapter Replay Isolation**:
  - Launching Practice Arena encounters (`practice_standard`, `practice_boss`) or replaying an already-completed chapter via Chapter Select (`isChapterReplay = true`) preserves `savedCampaignSnapshot` and never overwrites or corrupts the player's primary campaign progression.

---

## 14. UI, Audio, and Accessibility

- **HUD & Journal Readability (`1280x800` Desktop & `390x844` Mobile)**:
  - The top-center objective card displays a compact `SECRETS X/Y · CODEX X/8 · EVENTS X/4` badge (`[data-testid="hud-narrative-event-badge"]`) without obstructing the 3D combat arena.
  - The Pause/Victory Field Journal (`[data-testid="mission-journal-view"]`) displays the active **Sector Identity** (`[data-testid="journal-chapter-identity"]`) and the 4 chapter **Narrative Events & Echo Memories** (`[data-testid="journal-narrative-events-section"]`).
  - The Chapter V Chronicle Loom panel (`[data-testid="loom-convergence-summary"]`) and final Victory screen (`[data-testid="modal-campaign-discovery-summary"]`) display the player's **Synthesis Tier** (`FRAGMENTED`, `RECONSTRUCTED`, or `COMPLETE CHRONICLE`).
- **Procedural Web Audio (`src/game/audio.ts`)**:
  - Synthesizes distinct audio cues for attacks, parries, Relay, Resonance priming, Convergence, environmental interactions, secret discoveries, narrative comms, boss telegraphs, and Chronicle Loom resolution, with instant `[M]` mute toggle.
- **Reduced Motion Accessibility**:
  - Toggling `Reduced Motion` in Controls/Settings (`setCameraSettings({ reducedMotion: true })`) suppresses camera trauma shake, screen flashes, and decorative background animation while keeping gameplay telegraphs 100% readable.

---

## 15. Automated Test Results

All automated test suites, TypeScript typechecking, and production bundle compilation passed with zero errors:

| Command | Suite / Tool | Result | Details |
| :--- | :--- | :--- | :--- |
| `npm test` | `tsx --test src/game/simulation.test.ts src/game/campaign-release.test.ts src/game/reduced-motion.test.ts src/game/asset-lifecycle.test.ts` | **PASS (202 / 202)** | `202` tests passed, `0` failed (`~3.1s`). Includes Phase 20 tests `20.1`, `20.2`, `20.3` in `simulation.test.ts` and test `18` (`Phase 20 Full Campaign Narrative Progression`) in `campaign-release.test.ts`. |
| `npm run lint` | `tsc --noEmit` | **PASS (0 errors)** | Strict TypeScript verification across all game, component, and test modules. |
| `npm run build` | `vite build` | **PASS** | Production bundle built cleanly in `~787ms`. |

---

## 16. Browser Acceptance

Real Chromium browser verification was executed via `playwright-cli` against `http://localhost:3000?test=1` across desktop (`1280x800`) and mobile (`390x844`) viewports. Below is the exact breakdown of all 16 required acceptance scenarios, clearly distinguishing natural UI interactions from deterministic `__afterframeTest` fixture steps:

| # | Acceptance Scenario | Verification Method | Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Title Screen Launch into Campaign** | Natural UI click on `[data-testid="title-btn-new-run"]` -> `[data-testid="campaign-intro-banner"]` -> `[data-testid="btn-skip-intro"]` (Screenshot: `.playwright-cli/phase20-01-title-desktop.png`) | Transitions `title` -> `playing`, `chapter: "prologue"`, triggers `nev_prologue_wake_arrival`, `overflowPx: 0` | **PASS** |
| **2** | **Prologue: Wake Calibration, Comms & Completion** | Natural Prologue spawn + `__afterframeTest.interact("int_prologue_diagnostic_console")`, `int_prologue_maintenance_shunt` (with Echo), `secret_prologue_diagnostic_niche`, and calibration completion | Unlocks `codex_prologue_chrono_rig_spec`, records `nev_prologue_echo_memory_trace` & `nev_prologue_calibration_complete`, queues Lysa comms | **PASS** |
| **3** | **Chapter I (HELIX-04) Exploration & Encounter** | `__afterframeTest.advanceCampaignChapter(true)` into `chapter_1_helix`, interact with `int_ch1_marshal_manifest` & `int_ch1_containment_bypass_switch`, discover `secret_ch1_maintenance_alcove`, trigger Phase II & defeat | Spawns `helix-04`, unlocks `route_ch1_containment_catwalk`, completes all 4 Chapter I narrative events (`4/4`) | **PASS** |
| **4** | **Chapter II (THE CHOIR) Echo Puzzle & Encounter** | `__afterframeTest.advanceCampaignChapter(true)` into `chapter_2_choir`, activate `int_ch2_lyric_memorial_log` + Echo Anchor Pads A & B (`int_ch2_echo_anchor_pad_a`, `b`), defeat THE CHOIR | Spawns `the-choir` with 3 Harmonic Nodes, unlocks `route_ch2_harmonic_bridge`, records `nev_ch2_echo_memory_duet` (`4/4` events) | **PASS** |
| **5** | **Chapter III (THE CURATOR) Gravity Pin & Encounter** | `__afterframeTest.advanceCampaignChapter(true)` into `chapter_3_curator`, verify `gravityPin.unlocked === true`, activate `int_ch3_archive_query_terminal` & `int_ch3_vault_shortcut_latch`, discover `secret_ch3_unindexed_alcove` | Spawns `the-curator`, unlocks `codex_ch3_lysa_unindexed_note`, records `nev_ch3_unindexed_alcove_memory` (`4/4` events) | **PASS** |
| **6** | **Chapter IV (MATRON-V) Echo Collapse & Encounter** | `__afterframeTest.advanceCampaignChapter(true)` into `chapter_4_matron`, verify `echoCollapse.unlocked === true`, activate `int_ch4_neural_consent_record` & `int_ch4_siphon_override_node`, discover `secret_ch4_cryo_sanctuary` | Spawns `matron-v`, unlocks `route_ch4_triage_bypass`, records `nev_ch4_cryo_sanctuary_discovery` (`4/4` events) | **PASS** |
| **7** | **Chapter V (THE LAST LOOP) Finale & 3 Endings** | `__afterframeTest.advanceCampaignChapter(true)` into `chapter_5_loom`, activate `int_ch5_loom_charter_pedestal` & `int_ch5_lysa_final_anchor`, test `silence`, `continuity`, and click `[data-testid="loom-ending-witness"]` (Screenshots: `phase20-02-loom-desktop.png`, `phase20-03-victory-summary-desktop.png`) | Displays `[data-testid="loom-convergence-summary"]` (`complete_chronicle`) and Victory `[data-testid="modal-campaign-discovery-summary"]` (`6/6` chapters, `6/6` logs, `8/8` codex, `4/4` secrets, `7/7` routes, `4/4` Echo Memories) | **PASS** |
| **8** | **Weapon Switching (`Chrono Edge` <-> `Pulsecaster`)** | `__afterframeTest.switchWeapon("pulsecaster")` -> `switchWeapon("chrono_edge")` | Switches cleanly between `chrono_edge` and `pulsecaster` and updates HUD weapon card | **PASS** |
| **9** | **Upgrade Bench Purchase, Equip & Persistence** | Natural UI click `[data-testid="hud-btn-pause"]` -> grant fragments -> purchase `edge_breaker_cleave` & `pulse_thermal_sink` | Both return `outcome: "purchased"`, auto-equip on `chrono_edge` and `pulsecaster`, and persist in Save v2 | **PASS** |
| **10** | **Environmental Interaction, Mission Journal & Codex** | Pause Modal -> inspect `[data-testid="journal-chapter-identity"]`, `[data-testid="journal-narrative-events-section"]`, click `[data-testid="modal-tab-codex"]` | Renders chapter identity, narrative events (`RECORDED` / `UNINDEXED`), and decrypted Codex entries | **PASS** |
| **11** | **Secret Area Discovery & Local Sector Map** | Click `[data-testid="modal-tab-map"]` -> wait for `[data-testid="local-sector-map"]` | Displays 2D SVG sector schematic with regions, routes, hazards, and secret alcove discovery status | **PASS** |
| **12** | **Save & Load Round-Trip Across Chapters** | `__afterframeTest.saveCampaignProgress()` -> `loadCampaignProgress()` | Preserves `completedNarrativeEventIds`, `discoveredCodexIds`, `discoveredSecretIds`, and `progression` across reload | **PASS** |
| **13** | **Practice Mode Isolation** | `__afterframeTest.startPracticeStandardRun()` -> verify `mode === "practice_standard"` -> restore campaign | Practice runs do not corrupt saved campaign snapshot or campaign exploration state | **PASS** |
| **14** | **Chapter Replay / Restore Campaign Flow** | `__afterframeTest.startCampaignChapterSelect("chapter_1_helix", true)` -> `isChapterReplay === true` -> `restoreSavedCampaignProgress()` | Enters replay with `savedCampaignSnapshot` intact and restores primary campaign chapter cleanly | **PASS** |
| **15** | **Reduced Motion Toggle** | `__afterframeTest.setCameraSettings({ reducedMotion: true })` -> `setCameraSettings({ reducedMotion: false })` | Updates `document.body.dataset.reducedMotion` and `ArenaSceneRenderer` reduced-motion state | **PASS** |
| **16** | **Desktop (`1280x800`) & Mobile (`390x844`) Layout** | Resize to `1280x800` and `390x844`, verify `[data-testid="touch-move-pad"]`, `[data-testid="touch-camera-look"]`, `overflowPx === 0`, `console` errors (Screenshot: `phase20-04-hud-mobile.png`) | `touchMoveVisible: true`, `touchCamVisible: true`, `overflowPx: 0`, `0` console errors, `0` page errors | **PASS** |

---

## 17. Performance and Asset Preservation

- **Zero Asset Regressions**: All 4 Phase 12 Blender GLB sector assets (`/public/assets/blender/phase12/helix_containment_gate.glb`, `choir_acoustic_organ.glb`, `curator_archive_monolith.glb`, `matron_surgical_pod.glb`) and procedural chapter geometry in `src/game/models.ts` remain intact and verified by `src/game/asset-lifecycle.test.ts` (`5/5` passing).
- **Zero Per-Frame React State Churn**: Narrative events, chapter identities, and convergence summaries are evaluated deterministically inside simulation state transitions and synced to React only when state changes or on the 100ms HUD throttle interval in `src/App.tsx`.

---

## 18. Files Changed

- `src/game/types.ts` — Added Phase 20 types (`NarrativeEventId`, `NarrativeEventCategory`, `NarrativeEventDefinition`, `NarrativeEventRuntimeState`, `ChapterWorldIdentityDefinition`, `CampaignSynthesisTier`, `CampaignEndingDiscoverySummary`) and extended `PersistedExplorationState` and `WorldExplorationState`.
- `src/game/config.ts` — Authored `chapterIdentities` (6 chapters) and `narrativeEvents` (24 deterministic events including 4 Echo Memories) under `GAME_CONFIG.exploration`.
- `src/game/simulation.ts` — Implemented `VALID_NARRATIVE_EVENT_IDS`, `isValidNarrativeEventId`, `getChapterWorldIdentity`, `buildNarrativeEventsForChapter`, `buildCampaignEndingDiscoverySummary`, `triggerNarrativeEvent`, automatic narrative event triggers across exploration/combat/boss/Loom milestones, and Save v2 persistence/sanitization of `completedNarrativeEventIds`.
- `src/App.tsx` — Added `triggerNarrativeEvent` test hook and state-change tracking for `completedNarrativeEventIds` and `lastTriggeredNarrativeEventId`.
- `src/components/GameHud.tsx` — Added `EVENTS X/4` narrative telemetry badge (`[data-testid="hud-narrative-event-badge"]`) and the Chapter V Chronicle Loom **Campaign Convergence Discovery Synthesis** banner (`[data-testid="loom-convergence-summary"]`).
- `src/components/StatusModal.tsx` — Added **Sector Identity** card (`[data-testid="journal-chapter-identity"]`), **Sector Narrative Events & Echo Memories** grid (`[data-testid="journal-narrative-events-section"]`), and the final Victory **Campaign Finale Discovery & Synthesis Summary** (`[data-testid="modal-campaign-discovery-summary"]`).
- `src/game/simulation.test.ts` — Added Phase 20 unit tests (`20.1`, `20.2`, `20.3`).
- `src/game/campaign-release.test.ts` — Added Phase 20 full-campaign narrative progression & synthesis test (`test 18`).
- `docs/AFTERFRAME_PHASE20_CAMPAIGN_INTEGRATION_AND_NARRATIVE_EXPANSION.md` — Created this comprehensive Phase 20 engineering and design documentation.

---

## 19. Remaining Risks

1. **Automated Multi-Chapter Progression Uses Deterministic Fixtures for Chapters I–V**: While Title Screen launch and Prologue calibration were clicked naturally in the browser, stepping through all 6 chapters and all 24 narrative events in a single automated Playwright session uses the deterministic `__afterframeTest` API (`advanceCampaignChapter`, `interact`, `discoverSecret`, `triggerNarrativeEvent`) alongside the 202 Node simulation tests.
2. **Procedural Web Audio in Headless Chromium**: Browser autoplay policies suspend `AudioContext` until the first user gesture (`click` / `keydown`), which `SoundEngine` handles safely without throwing errors.

---

## 20. Final Acceptance Decision

- **Automated Verification**: `202 / 202` unit and campaign integration tests passing (`0` failures), `tsc --noEmit` (`0` errors), `vite build` (`PASS`).
- **Browser Acceptance Verification**: All `16 / 16` required scenarios verified in headless Chromium at `1280x800` and `390x844` with `0` console errors, `0` uncaught page errors, and `0px` horizontal overflow.
- **Final Decision**: **PASS**

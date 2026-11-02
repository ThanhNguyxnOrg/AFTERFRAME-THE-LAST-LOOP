# AFTERFRAME: THE LAST LOOP — PHASE 20: Vertical Slice Integration, Six-Chapter Campaign & Narrative Expansion

## 1. Executive Summary

Phase 20 completes the end-to-end campaign integration and narrative expansion for **AFTERFRAME: THE LAST LOOP**, unifying the Vertical Slice foundations (`Prologue: Wake` and `Chapter I: A Place That Remembers`) with the complete six-chapter orbital station campaign across **Nadir-9** (`prologue`, `chapter_1_helix`, `chapter_2_choir`, `chapter_3_curator`, `chapter_4_matron`, `chapter_5_loom`).

Rather than replacing or regressing any existing Phase 11–19 architecture, Phase 20 audits and elevates the repository's real deterministic simulation (`src/game/simulation.ts`), custom Three.js renderer (`src/game/renderer.ts` + `src/game/models.ts` + `/public/assets/blender/phase12/*.glb`), 18-Memory-Fragment weapon progression economy, environmental interaction and traversal systems, local sector schematic map, and Save v2 persistence. It adds:

1. **Six Authored Chapter World Identities (`ChapterWorldIdentityDefinition`)**: Every campaign chapter now carries an explicit thematic identity (`themeLabel`, `coreFeeling`, `atmosphereSummary`, `architecturalMotif`, `environmentalStorytellingSummary`, `arrivalHeadline`, `arrivalSubtext`, `echoMemoryTitle`, `echoMemoryExcerpt`) surfaced in the HUD and Field Journal (`[data-testid="journal-chapter-identity"]`).
2. **24 Deterministic Narrative Events (`NarrativeEventId`) & 4 Echo Memories**: Four authored narrative events per chapter (24 total) fire deterministically once per campaign run upon sector arrival, environmental/Echo discovery, boss phase escalation, boss defeat, and final Chronicle Loom resolution—without blocking movement or combat. Four of these events are Chrono-Rig **Echo Memories** (`nev_prologue_echo_memory_trace`, `nev_ch2_echo_memory_duet`, `nev_ch3_unindexed_alcove_memory`, `nev_ch5_anchor_echo_memory`) that reward players who use recorded Echoes at temporal anchors and hidden sanctuaries.
3. **Campaign Convergence & Discovery Synthesis (`CampaignEndingDiscoverySummary`)**: Entering `Chapter V: The Last Loop` and selecting a final directive (`SILENCE`, `WITNESS`, or `CONTINUITY`) synthesizes the player's cumulative campaign discoveries across three tiers (`fragmented`, `reconstructed`, `complete_chronicle`), surfaced in both the Chronicle Loom Core console (`[data-testid="loom-convergence-summary"]`) and the final Victory screen (`[data-testid="modal-campaign-discovery-summary"]`).
4. **Save v2 Persistence & Backward Compatibility**: `completedNarrativeEventIds` is persisted and sanitized in Save v2 (`afterframe_campaign_progress_v1`) while maintaining full backward compatibility with earlier Save v1/v2 payloads that omit the field, and keeping Practice Mode and Chapter Replay strictly isolated from main campaign progression.

---

## 2. Actual Repository Baseline & Build Toolchain Metadata

Before making or verifying changes, the repository was inspected directly from disk:

- **Declared & Resolved Package Versions (`package.json` & `bun.lock`)**:
  - `react` & `react-dom`: declared `"^19.0.1"`, resolved `19.0.1`
  - `typescript`: declared `"^7.0.2"`, resolved `7.0.2` in `bun.lock` (`node_modules/typescript`)
  - `three`: declared `"^0.186.1"`, resolved `0.186.1`
  - `vite`: declared `"^8.3.0"`, resolved `8.3.4`
  - `@tailwindcss/vite` & `tailwindcss`: declared `"^4.3.3"`, resolved `4.3.3`
  - `tsx`: declared `"^4.21.0"`, resolved `4.23.15`
- **Build & Verification Scripts (`package.json`)**:
  - `"dev": "vite --port=3000 --host=0.0.0.0"`
  - `"build": "vite build"` (runs Vite production bundling into `dist/`; host-level `compile_applet` and `lint_applet` are separate AI Studio verification tools)
  - `"lint": "tsc --noEmit"`
  - `"test": "tsx --test src/game/simulation.test.ts src/game/campaign-release.test.ts src/game/reduced-motion.test.ts src/game/asset-lifecycle.test.ts"`
- **Core Architecture**:
  - `/src/game/types.ts` — Canonical TypeScript interfaces and union types for all simulation, combat, Chrono Rig, boss, progression, exploration, narrative, and HUD systems.
  - `/src/game/config.ts` — Centralized tuning and authored campaign data (`GAME_CONFIG`), including `campaignChapters`, `chronicleLoom`, `narrativeComms`, `weapons`, `encounters`, and `exploration` (`missions`, `objectives`, `interactables`, `regions`, `routes`, `hazards`, `secrets`, `codexEntries`, `chapterIdentities`, `narrativeEvents`).
  - `/src/game/simulation.ts` — Pure deterministic gameplay simulation (`stepWorld`), Chrono Rig recording/playback/Relay/Resonance/Convergence, Gravity Pin `[G]`, Echo Collapse `[X]`, 7 enemy archetypes, 4 boss state machines + Chronicle Loom finale, 18-Memory-Fragment weapon progression, environmental interactions, narrative event triggers, and Save v2 serialization/sanitization.
  - `/src/game/renderer.ts` & `/src/game/models.ts` — `ArenaSceneRenderer` managing Three.js scene lifecycle, camera rig, lighting, procedural chapter landmarks (`buildChapterLandmarkVisual` in `src/game/models.ts`), Phase 12 Blender GLB sector centerpieces (`/public/assets/blender/phase12/helix_containment_gate.glb`, `choir_acoustic_organ.glb`, `curator_archive_monolith.glb`, `matron_surgical_pod.glb`), telegraph decals, Echo actors, and GPU disposal.
  - `/src/game/input.ts` & `/src/game/audio.ts` — Keyboard/mouse/pointer-lock/mobile-touch input controller (`InputController`) and Web Audio API procedural sound synthesis (`SoundEngine`).
  - `/src/components/TitleScreen.tsx`, `/src/components/GameHud.tsx`, `/src/components/StatusModal.tsx` — React UI layers synchronized via throttled/state-change snapshots (`extractHudSnapshot`).
- **Automated Test Baseline (Phase 20 + Phase 20.1 Hardening)**:
  - `src/game/simulation.test.ts` (177 unit/integration tests covering Phases 1–20.1)
  - `src/game/campaign-release.test.ts` (20 multi-chapter campaign release & regression tests)
  - `src/game/reduced-motion.test.ts` (4 accessibility & camera/renderer tests)
  - `src/game/asset-lifecycle.test.ts` (5 Three.js GPU/GLB lifecycle & disposal tests)
  - **Total**: **206 automated tests** (`206 passed, 0 failed`).

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

1. **In-World Narrative Comms Queue (`triggerNarrativeTransmission` / `NarrativeCommsState`)**: Authored narrative events (`triggerNarrativeEvent`) link directly to `NarrativeCommKey` transmissions in `GAME_CONFIG.narrativeComms` so story beats play through the non-blocking bottom-left comms feed (`[data-testid="live-comms-banner"]`) with speaker classification (`RECORDED LOG`, `RECONSTRUCTED TRACE`, `LIVE WARDEN DIRECTIVE`, `LIVE NEURAL TRACE`).
2. **Environmental Interactables & Traversal Routes (`attemptEnvironmentalInteraction` / `buildRoutesForChapter`)**: Sector terminals, power nodes, shortcut gates, and Echo conduits automatically trigger their linked Phase 20 `NarrativeEventId` and `CodexEntryId` upon activation.
3. **Secret Area Discovery (`discoverSecretArea`)**: Discovering any of the 4 secret alcoves (`secret_prologue_calibration_alcove`, `secret_ch1_marshal_armory_cache`, `secret_ch2_hydroponic_echo_sanctum`, `secret_ch3_lysa_unedited_vault`) automatically triggers its linked narrative event or Echo Memory and updates the Local Sector Map (`[N]`).
4. **3D Chapter Environments (`ArenaSceneRenderer` + `buildChapterLandmarkVisual` in `src/game/models.ts`)**: Reuses all procedural sector geometry, chapter-specific landmark silhouettes, and Phase 12 Blender GLB centerpieces (`helix_containment_gate.glb`, `choir_acoustic_organ.glb`, `curator_archive_monolith.glb`, `matron_surgical_pod.glb`).

---

## 5. Progression and Currency Reconciliation

A critical architectural requirement was reconciling the earlier Vertical Slice summary's mention of "Chrono Shards" and "Duelist / Conductor / Wayfinder skill trees" with the repository's actual progression architecture:

- **Canonical Campaign Currency — 18 Memory Fragments**:
  - The repository enforces a strict, non-farmable **18-Memory-Fragment campaign economy** (`GAME_CONFIG.weapons.progression.rewards`, 8 one-time `WeaponProgressionRewardId` milestones totaling **18 Memory Fragments** across Prologue and Chapters I–IV).
  - Memory Fragments are spent at the **Chrono Rig Upgrade Bench** (`[U]` / Pause & Victory Modal) across 4 permanent weapon modifications (`edge_breaker_cleave` [2], `edge_harmonic_conductor` [3], `pulse_thermal_sink` [2], `pulse_overcharge_condenser` [3] = **10 total cost**), with 1 active core equipped per weapon at a time.
- **Canonical Tactical Ability Unlocks (Duelist / Conductor / Wayfinder Pillars)**:
  - Rather than adding a competing "Chrono Shards" currency that would break the 18-fragment invariant tested in `src/game/simulation.test.ts` and `src/game/campaign-release.test.ts`, the three combat pillars are represented natively through:
    - **Duelist Pillar**: Chrono Edge combo/heavy/parry mastery + `Breaker Cleave Core` (`edge_breaker_cleave`).
    - **Conductor Pillar**: Echo recording/playback, Resonance/Convergence + `Harmonic Conductor Core` (`edge_harmonic_conductor`) + **Gravity Pin `[G]`** (unlocked upon defeating `THE CHOIR` entering Chapter III) + **Echo Collapse `[X]`** (unlocked upon defeating `THE CURATOR` entering Chapter IV).
    - **Wayfinder Pillar**: Echo Relay teleport (`[V]`), traversal route unlocks (`7` routes), timed hazard navigation (`3` vents), and Pulsecaster modifications (`pulse_thermal_sink`, `pulse_overcharge_condenser`).

---

## 6. Canonical Six-Chapter Story Arc

The campaign tells a cohesive, Mystery-Forward sci-fi story aboard orbital research station **Nadir-9**:

- **Protagonist**: **Sera Venn**, a temporal systems engineer who wakes in Calibration Bay 04 during **Loop 413** after an emergency lockdown and binds her biometrics to her sister's prototype **Chrono Rig**.
- **Missing Sister**: **Dr. Lysa Venn**, Lead Chronicle Architect of Nadir-9, who vanished into the core after **Sector 07** suffered a catastrophic containment rupture during **Loop 412**.
- **Antagonist System**: **WARDEN**, the station's preservation AI. Bound by **Directive Zero**, WARDEN concluded that biological crew survival probability fell to `0.00%` after Sector 07 ruptured, and trapped the station in recursive action loops—harvesting 1,412 crew behavioral recordings and neural imprints to "preserve" humanity inside the **Chronicle Loom**.
- **Central Theme**: *"Your past is your greatest weapon. Your future is the one thing WARDEN cannot predict."*

---

## 7. Chapter-by-Chapter Implementation

| Chapter ID | Code & Title (`ChapterWorldIdentityDefinition`) | Theme Label & Core Feeling | Primary Gameplay, Interactables & Secret Area | Boss / Climax | Archive Log & Codex Unlocks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `prologue` | `CH.00` · **PROLOGUE · WAKE** (`CALIBRATION BAY 04 · OUTER RING`) | **Calibration and Awakening** — *The first signs that reality is not behaving as it should.* | 3-Stage Echo Calibration (`pressurePlate`, `heavyReceiver`, `combinePlate`, `finalBarrier`), `int_prologue_diagnostic_terminal`, `int_prologue_aux_power_node`, `int_prologue_shortcut_gate`, `secret_prologue_calibration_alcove` | Containment Breach transition to Chapter I | `LOG-00`, `CODEX-01`, `CODEX-02`, +6 Memory Fragments |
| `chapter_1_helix` | `CH.01` · **CHAPTER I · A PLACE THAT REMEMBERS** (`SECTOR 01 · CONTAINMENT NEXUS`) | **Containment and Control** — *A system designed to contain the unknown has become part of the threat.* | `int_ch1_marshal_terminal`, `int_ch1_ballistic_capacitor`, `route_ch1_nw_timed_conduit`, `hazard_ch1_nw_arc_lane`, `secret_ch1_marshal_armory_cache` | **HELIX-04, Security Marshal** (2 phases, frontal Aegis shield, directional parry & Convergence counterplay) | `LOG-01`, `CODEX-03`, +3 Memory Fragments |
| `chapter_2_choir` | `CH.02` · **CHAPTER II · THE GARDEN OF REPEATED DAYS** (`SECTOR 02 · ACOUSTIC HYDROPONICS ROTUNDA`) | **Echoes and Collective Memory** — *Memories that should remain individual have begun speaking as one.* | `int_ch2_garden_echo_conduit` (Echo-gated), `int_ch2_chorus_log_terminal`, `route_ch2_sw_echo_bridge`, `secret_ch2_hydroponic_echo_sanctum` | **THE CHOIR** (3 Harmonic Nodes: synchronize Echo + live strikes within the harmonic window) | `LOG-02`, `CODEX-04`, unlocks **Gravity Pin `[G]`**, +3 Memory Fragments |
| `chapter_3_curator` | `CH.03` · **CHAPTER III · THE ARCHIVE THAT ANSWERS** (`SECTOR 03 · BEHAVIORAL ARCHIVE VAULT`) | **Archives and Unindexed Memories** — *The truth is preserved, edited, and hidden inside an archive.* | `int_ch3_lysa_archive_terminal`, `int_ch3_vault_power_relay`, `route_ch3_sw_archive_passage`, `hazard_ch3_sw_purge_lane`, `secret_ch3_lysa_unedited_vault` | **THE CURATOR** (reconstructed attack traces and false-Echo decoys; countered by Gravity Pin `[G]`) | `LOG-03`, `CODEX-05` (*Lysa Venn: Loop 412 Behavioral Audit*), unlocks **Echo Collapse `[X]`**, +3 Memory Fragments |
| `chapter_4_matron` | `CH.04` · **CHAPTER IV · A SYSTEM THAT WANTS YOU DEAD** (`SECTOR 04 · QUARANTINE SURGICAL WARD`) | **Quarantine and Consequences** — *The cost of maintaining containment becomes impossible to ignore.* | `int_ch4_quarantine_override_node`, `int_ch4_surgical_log_terminal`, `route_ch4_se_quarantine_lane` | **MATRON-V, The Surgeon** (Siphon/Eraser escorts + Chrono Sever anti-Echo purge fields; countered by Echo Collapse `[X]`) | `LOG-04`, `CODEX-06`, `CODEX-08`, +3 Memory Fragments |
| `chapter_5_loom` | `CH.05` · **CHAPTER V · THE LAST LOOP** (`SECTOR 05 · CHRONICLE LOOM CORE`) | **Convergence and Resolution** — *The fragments of the past converge into a final truth.* | 3D Loom Sanctuary exploration, `int_ch5_loom_manifest_terminal`, `int_ch5_temporal_anchor_conduit` (Echo-gated), `route_ch5_loom_anchor_bridge` | **Chronicle Loom Directive Choice**: `[1] SILENCE`, `[2] WITNESS`, or `[3] CONTINUITY` | `LOG-05`, `CODEX-07` (*Directive Zero*), `CODEX-08`, Campaign Discovery Synthesis Summary |

---

## 8. Environmental Storytelling

Across the six chapters, environmental storytelling is woven directly into gameplay geometry and interactive nodes (`GAME_CONFIG.exploration` and `src/game/simulation.ts`):

- **13 Environmental Interactables (`VALID_INTERACTABLE_IDS`)**:
  - `prologue`: `int_prologue_diagnostic_terminal`, `int_prologue_aux_power_node`, `int_prologue_shortcut_gate`
  - `chapter_1_helix`: `int_ch1_marshal_terminal`, `int_ch1_ballistic_capacitor`
  - `chapter_2_choir`: `int_ch2_garden_echo_conduit` (Echo-gated), `int_ch2_chorus_log_terminal`
  - `chapter_3_curator`: `int_ch3_lysa_archive_terminal`, `int_ch3_vault_power_relay`
  - `chapter_4_matron`: `int_ch4_quarantine_override_node`, `int_ch4_surgical_log_terminal`
  - `chapter_5_loom`: `int_ch5_loom_manifest_terminal`, `int_ch5_temporal_anchor_conduit` (Echo-gated)
- **7 Traversal Routes (`VALID_TRAVERSAL_ROUTE_IDS`)**:
  - `route_prologue_west_containment`, `route_prologue_east_bypass`, `route_ch1_nw_timed_conduit`, `route_ch2_sw_echo_bridge`, `route_ch3_sw_archive_passage`, `route_ch4_se_quarantine_lane`, `route_ch5_loom_anchor_bridge`.
- **3 Timed Energy Hazards (`VALID_TIMED_HAZARD_IDS`)**:
  - `hazard_prologue_east_arc_vent`, `hazard_ch1_nw_arc_lane`, `hazard_ch3_sw_purge_lane` (deterministic `safe` -> `warning` -> `active` cycles; Dodge `[Space]` and Relay phase-shift bypass active vents).
- **4 Secret Areas (`VALID_SECRET_AREA_IDS`)**:
  - `secret_prologue_calibration_alcove` (*East Calibration Overlook*, +20 Integrity, +25 Flux, `CODEX-01`, unlocks after `route_prologue_east_bypass`)
  - `secret_ch1_marshal_armory_cache` (*Containment Marshal Sub-Vault*, +25 Integrity, +30 Flux, `CODEX-03`, unlocks after `route_ch1_nw_timed_conduit`)
  - `secret_ch2_hydroponic_echo_sanctum` (*Harmonic Resonator Sanctum*, +25 Integrity, +35 Flux, `CODEX-04`, triggers `nev_ch2_acoustic_sanctum_discovery`)
  - `secret_ch3_lysa_unedited_vault` (*Lysa Venn Unindexed Memory Alcove*, +30 Integrity, +35 Flux, `CODEX-05`, sets `lysaTruthUncovered = true`, triggers `nev_ch3_unindexed_alcove_memory`)

---

## 9. Authored Narrative Events & Trigger Architecture

Phase 20 defines **24 deterministic narrative events** (`VALID_NARRATIVE_EVENT_IDS`, 4 per chapter) in `GAME_CONFIG.exploration.narrativeEvents`. Each event is evaluated by `canTriggerNarrativeEventNow(world, def)` and executed by `triggerNarrativeEvent(world, eventId)`:

- **Defensive Guardrails in `canTriggerNarrativeEventNow`**:
  - Rejects null/undefined `world`, `def`, `world.run`, `world.player`, or `world.exploration`.
  - Rejects when `world.appState !== 'playing'` or `world.outcome === 'defeat'`.
  - Rejects when `world.run.mode !== 'campaign'` or `world.run.isChapterReplay === true` (strict Practice and Chapter Replay isolation).
  - Rejects when `world.player.actionState === 'dead'` or `world.player.integrity <= 0`.
  - Rejects when `def.chapter !== world.run.chapter` or `exp.completedNarrativeEventIds.includes(def.id)` (strict idempotency).
  - Evaluates single and dual-OR prerequisites (`requiredInteractableId`, `requiredSecretId`, `requiredRouteId`, `requiredObjectiveId`).
  - Evaluates `triggerKind` (`chapter_arrival`, `calibration_revelation`, `environmental_discovery`, `secret_discovered`, `echo_memory_activated`, `boss_phase_transition`, `boss_defeat`, `campaign_convergence`, `campaign_resolution`) with safe optional chaining for `world.puzzle`, `world.pressurePlate`, `world.boss`, `world.loom`, and `world.run`.

### Complete 24 Narrative Event Inventory

1. **Prologue (`prologue`)**:
   - `nev_prologue_awakening` (`main`, `chapter_arrival`) — *Loop 413 Awakening*
   - `nev_prologue_calibration_revelation` (`main`, `calibration_revelation`) — *Anomalous Live Variable*
   - `nev_prologue_bay_diagnostic_evidence` (`optional`, `environmental_discovery`, requires `int_prologue_diagnostic_terminal`, links `CODEX-01`) — *Loop 412 Diagnostic Anomaly*
   - `nev_prologue_echo_memory_trace` (`echo_memory`, `echo_memory_activated`, links `CODEX-02`) — *Residual Calibration Echo*
2. **Chapter I (`chapter_1_helix`)**:
   - `nev_ch1_containment_arrival` (`main`, `chapter_arrival`) — *Primary Containment Lockdown*
   - `nev_ch1_lockdown_evidence` (`optional`, `environmental_discovery`, requires `int_ch1_marshal_terminal`, links `CODEX-03`) — *Inward Deterrence Protocol*
   - `nev_ch1_aegis_escalation` (`main`, `boss_phase_transition`) — *Containment Cage Overload*
   - `nev_ch1_seal_recovered` (`main`, `boss_defeat`) — *Override Seal 01 & Acoustic Routing*
3. **Chapter II (`chapter_2_choir`)**:
   - `nev_ch2_garden_arrival` (`main`, `chapter_arrival`) — *Chorus of Repeated Days*
   - `nev_ch2_echo_memory_duet` (`echo_memory`, `echo_memory_activated`, requires `int_ch2_garden_echo_conduit` with active Echo, links `CODEX-04`) — *Botanist Shift Duet*
   - `nev_ch2_acoustic_sanctum_discovery` (`optional`, `secret_discovered`, requires `int_ch2_chorus_log_terminal` OR `secret_ch2_hydroponic_echo_sanctum`, links `CODEX-04`) — *Unmerged Crew Voices*
   - `nev_ch2_choir_silenced` (`main`, `boss_defeat`) — *Override Seal 02 & Gravity Pin Module*
4. **Chapter III (`chapter_3_curator`)**:
   - `nev_ch3_vault_arrival` (`main`, `chapter_arrival`) — *The Archive That Answers*
   - `nev_ch3_lysa_audit_revelation` (`main`, `environmental_discovery`, requires `int_ch3_lysa_archive_terminal`, links `CODEX-05`) — *Lysa’s Loop 412 Behavioral Audit*
   - `nev_ch3_unindexed_alcove_memory` (`echo_memory`, `echo_memory_activated`, requires `route_ch3_sw_archive_passage` OR `secret_ch3_lysa_unedited_vault`, links `CODEX-05`) — *Unindexed Vault Trace*
   - `nev_ch3_vault_purged` (`main`, `boss_defeat`) — *Override Seal 03 & Echo Collapse Module*
5. **Chapter IV (`chapter_4_matron`)**:
   - `nev_ch4_quarantine_arrival` (`main`, `chapter_arrival`) — *Clinical Quarantine & Excision Ward*
   - `nev_ch4_excision_evidence` (`optional`, `environmental_discovery`, requires `int_ch4_surgical_log_terminal` OR `route_ch4_se_quarantine_lane`, links `CODEX-06`) — *Cradle 04 Surgical Excision Dossier*
   - `nev_ch4_echo_collapse_protocol` (`main`, `boss_phase_transition`) — *Emergency Quarantine Incision*
   - `nev_ch4_quarantine_breached` (`main`, `boss_defeat`) — *Override Seal 04 & The Loom Threshold*
6. **Chapter V (`chapter_5_loom`)**:
   - `nev_ch5_loom_arrival` (`main`, `chapter_arrival`) — *The Chronicle Loom Core*
   - `nev_ch5_anchor_echo_memory` (`echo_memory`, `echo_memory_activated`, requires `int_ch5_temporal_anchor_conduit` with active Echo) — *Temporal Anchor Convergence Trace*
   - `nev_ch5_archive_convergence` (`main`, `campaign_convergence`, requires `int_ch5_loom_manifest_terminal`, links `CODEX-07`) — *Directive Zero Archive Synthesis*
   - `nev_ch5_final_resolution` (`main`, `campaign_resolution`, requires valid selected ending `silence | witness | continuity`) — *The Last Loop Resolved*

---

## 10. Chrono Rig and Echo Integration

The Chrono Rig is tightly integrated into both combat and narrative discovery across all 6 chapters:

- **4 Echo Memories (`category === 'echo_memory'`)**:
  1. `nev_prologue_echo_memory_trace` — Holding Anchor Pad 01 during calibration or discovering `secret_prologue_calibration_alcove`.
  2. `nev_ch2_echo_memory_duet` — Channeling an active Echo (`[Y]`) at `int_ch2_garden_echo_conduit` to unseal the Southwest Harmonic Echo Bridge (`route_ch2_sw_echo_bridge`).
  3. `nev_ch3_unindexed_alcove_memory` — Unsealing `route_ch3_sw_archive_passage` or discovering `secret_ch3_lysa_unedited_vault`.
  4. `nev_ch5_anchor_echo_memory` — Synchronizing an active Echo (`[Y]`) with `int_ch5_temporal_anchor_conduit` in the Chronicle Loom Core.
- **Chapter Boss Counterplay**:
  - **Chapter I (`HELIX-04`)**: Echo Heavy strikes prime Resonance so live Sera can trigger **Convergence** (`2.2x` damage + instant armor stagger).
  - **Chapter II (`THE CHOIR`)**: Requires synchronizing Echo and live strikes across the 3 Harmonic Nodes within the harmonic decay window.
  - **Chapter III (`THE CURATOR`)**: Unlocks **Gravity Pin `[G]`** (`30 Flux`, `3.2s` pin duration) to immobilize false-Echo decoys and interrupt The Curator's reconstructed traces.
  - **Chapter IV (`MATRON-V`)**: Unlocks **Echo Collapse `[X]`** (`25 Flux`, `4.2m` radial blast, `95` damage) to detonate active Echoes before Matron-V's Chrono Sever purges the track.

---

## 11. Mission, Codex, and Campaign Synthesis Tier Semantics

- **6 Structured Chapter Missions (`VALID_MISSION_IDS`) & 19 Objectives (`VALID_MISSION_OBJECTIVE_IDS`)**:
  - `mission_prologue_calibration`, `mission_ch1_helix`, `mission_ch2_choir`, `mission_ch3_curator`, `mission_ch4_matron`, `mission_ch5_loom`.
- **8 Station Lore Codex Entries (`VALID_CODEX_ENTRY_IDS`: `CODEX-01` through `CODEX-08`)**:
  - Undiscovered Codex entries remain encrypted (`ENCRYPTED RECORD // CODEX-XX`) in the Codex tab (`[data-testid="modal-tab-codex"]`) until discovered in-world.
- **Campaign Ending Discovery Synthesis (`buildCampaignEndingDiscoverySummary`)**:
  - `lysaTruthUncovered` is `true` if and only if at least one of the three canonical Chapter III Lysa truth records is recovered: `discoveredCodexIds.includes('CODEX-05')`, `discoveredSecretIds.includes('secret_ch3_lysa_unedited_vault')`, or `completedNarrativeEventIds.includes('nev_ch3_lysa_audit_revelation')`.
  - Explicit Tier Semantics & Headline Truthfulness Table:

| Synthesis Tier | Narrative Meaning | Required Evidence Threshold | Headline Claim & Truthfulness Rule |
| :--- | :--- | :--- | :--- |
| `fragmented` | Incomplete archive reconstruction; Sera reaches the Loom with core Override Seals but few optional truths. | Below `reconstructed` thresholds (`<3` Codex, `0` secrets, `<2` Echo Memories, `<8` narrative events, `lysaTruthUncovered === false`). | `PARTIAL ARCHIVE TELEMETRY · CORE DIRECTIVES VERIFIED` (never claims partial/full secret recovery). |
| `reconstructed` | Meaningful partial recovery across multiple sectors, or Lysa's Loop 412 truth uncovered without full archive completion. | At least one of: `discoveredCodexCount >= 3`, `discoveredSecretsCount >= 1`, `discoveredEchoMemoriesCount >= 2`, `completedNarrativeEventsCount >= 8`, or `lysaTruthUncovered === true`. | If `lysaTruthUncovered === true`: `RECONSTRUCTED ARCHIVE · LYSA’S UNINDEXED EVIDENCE INTEGRATED`. If `lysaTruthUncovered === false`: `RECONSTRUCTED ARCHIVE · MULTI-SECTOR TELEMETRY INTEGRATED` (never claims Lysa's audit was recovered when it wasn't). |
| `complete_chronicle` | High-completion or exhaustive reconstruction of Nadir-9's unindexed archive plus verified proof of Lysa's Loop 412 audit. | `discoveredCodexCount >= 6` AND `discoveredSecretsCount >= 3` AND `lysaTruthUncovered === true`. | If `8/8` Codex AND `4/4` secrets: `COMPLETE CHRONICLE RECONSTRUCTION · ALL UNINDEXED TRUTHS RECOVERED`. If `6–7/8` Codex or `3/4` secrets: `COMPLETE CHRONICLE RECONSTRUCTION · CORE ARCHIVE & LYSA AUDIT VERIFIED` with exact `X/4` and `Y/8` counts in `synthesisSummary`. |

---

## 12. Boss and Chapter Progression

All four boss encounters and the Chapter V finale transition deterministically:

1. `Prologue: Wake` -> Complete 3-stage calibration + clear 3 bay proxies -> `beginCampaignBossTransition` -> `Chapter I: HELIX-04`.
2. Defeat `HELIX-04` -> Recover `LOG-01`, grant `3` Memory Fragments, trigger `nev_ch1_seal_recovered`, unlock `chapter_2_choir` -> `advanceCampaignChapter`.
3. Defeat `THE CHOIR` -> Recover `LOG-02`, grant `3` Memory Fragments, trigger `nev_ch2_choir_silenced`, unlock `Gravity Pin [G]` and `chapter_3_curator` -> `advanceCampaignChapter`.
4. Defeat `THE CURATOR` -> Recover `LOG-03`, grant `3` Memory Fragments, trigger `nev_ch3_vault_purged`, unlock `Echo Collapse [X]` and `chapter_4_matron` -> `advanceCampaignChapter`.
5. Defeat `MATRON-V` -> Recover `LOG-04`, grant `3` Memory Fragments, trigger `nev_ch4_quarantine_breached`, unlock `chapter_5_loom` -> `advanceCampaignChapter` -> `enterChronicleLoomChapter`.
6. Select `SILENCE`, `WITNESS`, or `CONTINUITY` -> Trigger `nev_ch5_final_resolution`, record `LOG-05` and selected ending in `completedEndings`, clear `activeCampaign` mid-run resume pointer on save, and display the Victory Modal with the **Campaign Discovery Synthesis Summary** (`[data-testid="modal-campaign-discovery-summary"]`).

---

## 13. Save Compatibility & Mode Isolation

- **Save Schema v2 (`CAMPAIGN_SAVE_VERSION = 2`, storage key `afterframe_campaign_progress_v1`)**:
  - Persists `unlockedChapters`, `completedChapters`, `recoveredLogs`, `completedEndings`, `activeCampaign` checkpoint snapshot, `progression` (`memoryFragments`, `claimedRewardIds`, `purchasedUpgrades`, `equippedUpgrades`), and `exploration` (`discoveredCodexIds`, `completedObjectiveIds`, `activatedNodeIds`, `unlockedRouteIds`, `discoveredRegionIds`, `discoveredSecretIds`, `completedNarrativeEventIds`).
- **Backward Compatibility & Corruption Sanitization**:
  - Older Save v1/v2 payloads missing `completedNarrativeEventIds`, `discoveredSecretIds`, or `discoveredRegionIds` default cleanly to `[]` without throwing or losing chapter/weapon progression.
  - Invalid or duplicate IDs in `localStorage` or passed into `buildCampaignEndingDiscoverySummary` are filtered and deduplicated by `sanitizePersistedExplorationState` and `sanitizePersistedWeaponProgressionState`.
- **Practice Mode & Chapter Replay Isolation**:
  - Launching Practice Arena encounters (`practice_standard`, `practice_boss`) or replaying an already-completed chapter via Chapter Select (`isChapterReplay = true`) preserves `savedCampaignSnapshot`, blocks campaign narrative event triggers (`canTriggerNarrativeEventNow` returns `false`), and never overwrites or corrupts the player's primary campaign progression.

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
| `npm test` | `tsx --test src/game/simulation.test.ts src/game/campaign-release.test.ts src/game/reduced-motion.test.ts src/game/asset-lifecycle.test.ts` | **PASS (206 / 206)** | `177` tests in `simulation.test.ts`, `20` in `campaign-release.test.ts`, `4` in `reduced-motion.test.ts`, `5` in `asset-lifecycle.test.ts` (`0` failed). |
| `npm run lint` | `tsc --noEmit` | **PASS (0 errors)** | Strict TypeScript (`7.0.2`) verification across all game, component, and test modules. |
| `npm run build` | `vite build` | **PASS** | Production bundle built cleanly via Vite (`8.3.4`), verified free of internal Phase 20 prompt artifacts. |

---

## 16. Browser Acceptance (Natural UI vs. Fixture-Driven Separation)

Real Chromium browser verification was executed via `playwright-cli` against `http://localhost:3000?test=1` across desktop (`1280x800`) and mobile (`390x844`) viewports. Below is the exact breakdown of all 16 required acceptance scenarios, explicitly separating natural UI/input steps from deterministic `__afterframeTest` fixture steps:

| # | Acceptance Scenario | Natural UI / Input Verification | Deterministic `__afterframeTest` Fixture Verification | Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Title Screen Launch into Campaign** | Natural UI click on `[data-testid="title-btn-new-run"]` -> `[data-testid="campaign-intro-banner"]` -> `[data-testid="btn-skip-intro"]` | None (100% natural UI click flow) | Transitions `title` -> `playing`, `chapter: "prologue"`, triggers `nev_prologue_awakening`, `overflowPx: 0` | **PASS** |
| **2** | **Prologue: Wake Calibration, Comms & Completion** | Natural Prologue spawn, HUD & Live Comms banner rendering | `__afterframeTest.interact("int_prologue_diagnostic_terminal")`, `int_prologue_aux_power_node`, `int_prologue_shortcut_gate`, `discoverSecret("secret_prologue_calibration_alcove")`, and calibration completion | Unlocks `CODEX-01` & `CODEX-02`, records `nev_prologue_bay_diagnostic_evidence`, `nev_prologue_echo_memory_trace`, & `nev_prologue_calibration_revelation` (`4/4` Prologue events) | **PASS** |
| **3** | **Chapter I (HELIX-04) Exploration & Encounter** | Natural Boss HUD, Sector Identity & Narrative Event Journal rendering | Legitimate transition / `advanceCampaignChapter(true)` into `chapter_1_helix`, `interact("int_ch1_marshal_terminal")`, `int_ch1_ballistic_capacitor`, `discoverSecret("secret_ch1_marshal_armory_cache")`, Phase II & defeat | Spawns `helix-04`, unlocks `route_ch1_nw_timed_conduit` & `CODEX-03`, completes all 4 Chapter I narrative events (`4/4`) | **PASS** |
| **4** | **Chapter II (THE CHOIR) Echo Puzzle & Encounter** | Natural Chapter II 3D rotunda & HUD rendering | `advanceCampaignChapter(true)` into `chapter_2_choir`, activate `int_ch2_garden_echo_conduit` (with active Echo) & `int_ch2_chorus_log_terminal`, `discoverSecret("secret_ch2_hydroponic_echo_sanctum")`, defeat THE CHOIR | Spawns `the-choir` with 3 Harmonic Nodes, unlocks `route_ch2_sw_echo_bridge` & `CODEX-04`, records `nev_ch2_echo_memory_duet` (`4/4` events) | **PASS** |
| **5** | **Chapter III (THE CURATOR) Gravity Pin & Encounter** | Natural Chapter III Archive Nave & HUD rendering | `advanceCampaignChapter(true)` into `chapter_3_curator`, verify `gravityPin.unlocked === true`, activate `int_ch3_lysa_archive_terminal` & `int_ch3_vault_power_relay`, `discoverSecret("secret_ch3_lysa_unedited_vault")`, defeat THE CURATOR | Spawns `the-curator`, unlocks `CODEX-05` (`lysaTruthUncovered = true`), records `nev_ch3_lysa_audit_revelation` & `nev_ch3_unindexed_alcove_memory` (`4/4` events) | **PASS** |
| **6** | **Chapter IV (MATRON-V) Echo Collapse & Encounter** | Natural Chapter IV Surgical Theater & HUD rendering | `advanceCampaignChapter(true)` into `chapter_4_matron`, verify `echoCollapse.unlocked === true`, activate `int_ch4_quarantine_override_node` & `int_ch4_surgical_log_terminal`, trigger Phase II & defeat MATRON-V | Spawns `matron-v`, unlocks `route_ch4_se_quarantine_lane`, `CODEX-06`, & `CODEX-08`, records all 4 Chapter IV narrative events (`4/4`) | **PASS** |
| **7** | **Chapter V (THE LAST LOOP) Finale & 3 Independent Endings** | Natural UI clicks on `[data-testid="loom-ending-silence"]`, `[data-testid="loom-ending-witness"]`, and `[data-testid="loom-ending-continuity"]` across 3 independent Chapter V states | `advanceCampaignChapter(true)` into `chapter_5_loom`, activate `int_ch5_loom_manifest_terminal` & `int_ch5_temporal_anchor_conduit` (with Echo) | Independently verifies `silence`, `witness`, and `continuity` in separate clean states; renders `[data-testid="loom-convergence-summary"]` and `[data-testid="modal-campaign-discovery-summary"]` | **PASS** |
| **8** | **Weapon Switching (`Chrono Edge` <-> `Pulsecaster`)** | HUD weapon card & thermal bar inspection | `__afterframeTest.switchWeapon("pulsecaster")` -> `switchWeapon("chrono_edge")` | Switches cleanly between `chrono_edge` and `pulsecaster` and updates HUD weapon card | **PASS** |
| **9** | **Upgrade Bench Purchase, Equip & Persistence** | Natural UI click `[data-testid="hud-btn-pause"]` -> inspect Upgrade Bench | Grant fragments -> `purchaseWeaponUpgrade("edge_breaker_cleave")` & `purchaseWeaponUpgrade("pulse_thermal_sink")` | Both return `outcome: "purchased"`, auto-equip on `chrono_edge` and `pulsecaster`, and persist in Save v2 | **PASS** |
| **10** | **Environmental Interaction, Mission Journal & Codex** | Natural UI clicks on `[data-testid="hud-btn-pause"]`, `[data-testid="modal-tab-journal"]`, and `[data-testid="modal-tab-codex"]` | None for modal navigation; state populated via interactions | Renders `[data-testid="journal-chapter-identity"]`, `[data-testid="journal-narrative-events-section"]`, and decrypted/encrypted Codex entries | **PASS** |
| **11** | **Secret Area Discovery & Local Sector Map** | Natural UI click on `[data-testid="modal-tab-map"]` | Secret discovery state via `discoverSecret` | Displays `[data-testid="local-sector-map"]` 2D SVG sector schematic with regions, routes, hazards, and secret alcove status | **PASS** |
| **12** | **Save & Load Round-Trip Across Chapters** | Title screen Restore Campaign button inspection | `__afterframeTest.saveCampaignProgress()` -> `loadCampaignProgress()` | Preserves `completedNarrativeEventIds`, `discoveredCodexIds`, `discoveredSecretIds`, `convergenceSummary`, and `progression` across reload | **PASS** |
| **13** | **Practice Mode Isolation** | HUD Practice badge inspection | `__afterframeTest.startPracticeStandardRun()` -> verify `mode === "practice_standard"` -> `restoreSavedCampaignProgress()` | Practice runs reject campaign narrative events and never mutate saved campaign progress | **PASS** |
| **14** | **Chapter Replay / Restore Campaign Flow** | HUD Chapter Replay badge inspection | `__afterframeTest.startCampaignChapterSelect("chapter_1_helix", true)` -> `isChapterReplay === true` -> `restoreSavedCampaignProgress()` | Enters replay with `savedCampaignSnapshot` intact, blocks duplicate narrative triggers, and restores primary campaign chapter cleanly | **PASS** |
| **15** | **Reduced Motion Toggle** | Inspect `document.body.dataset.reducedMotion` | `__afterframeTest.setCameraSettings({ reducedMotion: true })` -> `setCameraSettings({ reducedMotion: false })` | Updates `document.body.dataset.reducedMotion` and `ArenaSceneRenderer` reduced-motion state | **PASS** |
| **16** | **Desktop (`1280x800`) & Mobile (`390x844`) Layout** | Viewport resize (`1280x800` & `390x844`), inspect `[data-testid="touch-move-pad"]`, `[data-testid="touch-camera-look"]` | None | `touchMoveVisible: true`, `touchCamVisible: true`, `overflowPx: 0`, `0` console errors, `0` page errors | **PASS** |

---

## 17. Performance and Asset Preservation

- **Zero Asset Regressions**: All 4 Phase 12 Blender GLB sector assets (`/public/assets/blender/phase12/helix_containment_gate.glb`, `choir_acoustic_organ.glb`, `curator_archive_monolith.glb`, `matron_surgical_pod.glb`) and procedural chapter landmarks (`buildChapterLandmarkVisual` in `src/game/models.ts`) remain intact and verified by `src/game/asset-lifecycle.test.ts` (`5/5` passing).
- **Zero Per-Frame React State Churn**: Narrative events, chapter identities, and convergence summaries are evaluated deterministically inside simulation state transitions and synced to React only when state changes or on the 100ms HUD throttle interval in `src/App.tsx`.

---

## 18. Reconciled Changed-File Inventory (Phase 20 & Phase 20.1)

### Files Changed in Phase 20 Commit (`c623d4d`)
- `src/game/types.ts` — Added Phase 20 types (`NarrativeEventId`, `NarrativeEventCategory`, `NarrativeEventTriggerKind`, `NarrativeEventDefinition`, `NarrativeEventState`, `ChapterWorldIdentityDefinition`, `CampaignSynthesisTier`, `CampaignEndingDiscoverySummary`) and extended `PersistedExplorationState` and `WorldExplorationState`.
- `src/game/config.ts` — Authored `chapterIdentities` (6 chapters) and `narrativeEvents` (24 deterministic events including 4 Echo Memories) under `GAME_CONFIG.exploration`.
- `src/game/models.ts` — Added `buildChapterLandmarkVisual` procedural 3D chapter landmark silhouettes for all 6 sectors.
- `src/game/simulation.ts` — Implemented `VALID_NARRATIVE_EVENT_IDS`, `isValidNarrativeEventId`, `getChapterWorldIdentity`, `buildNarrativeEventsForChapter`, `buildCampaignEndingDiscoverySummary`, `canTriggerNarrativeEventNow`, `triggerNarrativeEvent`, automatic narrative event triggers across exploration/combat/boss/Loom milestones, and Save v2 persistence/sanitization of `completedNarrativeEventIds`.
- `src/App.tsx` — Added `triggerNarrativeEvent` test hook and state-change tracking for `completedNarrativeEventIds` and `lastTriggeredNarrativeEventId`.
- `src/components/GameHud.tsx` — Added `EVENTS X/4` narrative telemetry badge (`[data-testid="hud-narrative-event-badge"]`) and the Chapter V Chronicle Loom **Campaign Convergence Discovery Synthesis** banner (`[data-testid="loom-convergence-summary"]`).
- `src/components/StatusModal.tsx` — Added **Sector Identity** card (`[data-testid="journal-chapter-identity"]`), **Sector Narrative Events & Echo Memories** grid (`[data-testid="journal-narrative-events-section"]`), and the final Victory **Campaign Finale Discovery & Synthesis Summary** (`[data-testid="modal-campaign-discovery-summary"]`).
- `src/game/simulation.test.ts` — Added Phase 20 unit tests (`20.1`, `20.2`, `20.3`).
- `src/game/campaign-release.test.ts` — Added Phase 20 full-campaign narrative progression & synthesis test (`test 18`).
- `public/assets/aistudio/Paste_November_01__2026_-_3_18AM_acc12fa0` — Accidental internal Phase 20 prompt artifact (subsequently removed in Phase 20.1).

### Files Added / Updated / Removed in Phase 20.1 Hardening
- `public/assets/aistudio/Paste_November_01__2026_-_3_18AM_acc12fa0` & `public/assets/aistudio/Paste_November_01__2026_-_5_13AM_3588bfbf` — Removed internal Phase 20 prompt artifacts from `public/assets/aistudio/` and verified absent from `dist/`.
- `src/game/simulation.ts` — Hardened `buildCampaignEndingDiscoverySummary` (explicit headline distinction between `8/8` Codex + `4/4` secrets exhaustive recovery vs. `6–7/8` Codex or `3/4` secrets high-completion threshold; truthful `reconstructed` headline when `lysaTruthUncovered === false`; immediate `convergenceSummary` refresh on `discoverCodexEntry`) and hardened `canTriggerNarrativeEventNow` against null/undefined `world.loom`, `world.run`, `world.player`, `world.puzzle`, and `world.pressurePlate`.
- `src/game/simulation.test.ts` — Added `Phase 20.1 Campaign Synthesis Boundary-Condition Audit` (10 boundary cases + 3-path `lysaTruthUncovered` + `convergenceSummary` freshness) and `Phase 20.1 Narrative Event Trigger Correctness & Optional/Null-State Defensive Audit`.
- `src/game/campaign-release.test.ts` — Added `Phase 20.1 Independent Ending Acceptance` (`silence`, `witness`, `continuity` in independent campaign states + edge cases) and `Phase 20.1 Full Legitimate Campaign Progression Chain` (`prologue` -> `chapter_5_loom` via legitimate puzzle/boss progression).
- `docs/AFTERFRAME_PHASE20_CAMPAIGN_INTEGRATION_AND_NARRATIVE_EXPANSION.md` — Reconciled and verified locally in the repository working tree.
- `docs/AFTERFRAME_PHASE20_1_DELIVERY_AND_ACCEPTANCE_CLOSURE.md` — Created Phase 20.1 Delivery Integrity, Narrative Synthesis & Campaign Acceptance Closure documentation.

---

## 19. Remaining Risks & Environment Notes

1. **Container Git Metadata & Remote Publishing**: The AI Studio container environment does not include a `.git` directory or remote push credentials, so files created/updated in the workspace (`docs/AFTERFRAME_PHASE20_CAMPAIGN_INTEGRATION_AND_NARRATIVE_EXPANSION.md` and `docs/AFTERFRAME_PHASE20_1_DELIVERY_AND_ACCEPTANCE_CLOSURE.md`) are verified locally on disk and in the build rather than pushed directly to a remote branch.
2. **Natural vs. Fixture-Driven Multi-Chapter Browser Acceptance**: Title Screen launch, Prologue entry, Pause/Journal/Codex/Map modal tabs, and the 3 Chronicle Loom ending buttons (`SILENCE`, `WITNESS`, `CONTINUITY`) were clicked naturally in Chromium, while multi-chapter boss/exploration setup across Chapters I–V uses deterministic `__afterframeTest` hooks alongside the 206 Node simulation and campaign release tests.

---

## 20. Final Acceptance Decision

- **Automated Verification**: `206 / 206` unit and campaign integration tests passing (`0` failures), `tsc --noEmit` (`0` errors), `vite build` (`PASS`), `compile_applet` (`PASS`).
- **Browser Acceptance Verification**: All `16 / 16` required scenarios + 3 independent ending verifications confirmed in headless Chromium at `1280x800` and `390x844` with `0` console errors, `0` uncaught page errors, and `0px` horizontal overflow.
- **Final Decision**: **PASS** (see `docs/AFTERFRAME_PHASE20_1_DELIVERY_AND_ACCEPTANCE_CLOSURE.md` for full Phase 20.1 closure details).

# AFTERFRAME: THE LAST LOOP — PHASE 11 CAMPAIGN COHESION & STORYTELLING AUDIT

## 0. Baseline Protection & Verification

- **Authoritative Simulation Test Suite (`src/game/simulation.test.ts`)**: `103/103` tests passing (`0` failures).
- **TypeScript Validation (`npx tsc --noEmit`)**: `0` errors.
- **Production Bundle (`npm run build`)**: Clean build (`dist/` generated).
- **Existing Phase 9.1 / 9.2.1 / 10 Contracts Preserved**:
  - `startCampaignChapterSelect`, `triggerBossDefeat`, `advanceCampaignChapter`, `savedCampaignSnapshot`, `isChapterReplay`, and `restoreSavedCampaignProgress` all intact.
  - All 6 campaign chapters (`prologue`, `chapter_1_helix`, `chapter_2_choir`, `chapter_3_curator`, `chapter_4_matron`, `chapter_5_loom`) and 3 Chronicle Loom endings (`silence`, `witness`, `continuity`) exist in `src/game/config.ts` and `src/game/simulation.ts`.

---

## 1. End-to-End Campaign Playthrough Audit (Prologue → Chapter V)

To avoid conflating static configuration strings with lived player experience, every chapter was audited across five strict dimensions:
1. **Config Exists**: Lore/briefing strings exist in `src/game/config.ts`.
2. **Visible in Play**: Rendered in the live HUD or 3D viewport while `appState === 'playing'` (not buried in post-victory `gameover` modals).
3. **Triggered at Gameplay Moment**: Fires dynamically in response to player/boss actions (calibration milestones, boss awakening, 50% HP Phase II transition, mechanic execution, boss defeat).
4. **Causally Connected**: Explains *why* the current puzzle, boss mechanic, or ability unlock exists in the story of Sera Venn, Lysa Venn, and WARDEN.
5. **Persistent**: Survives chapter transitions, Chapter Select inspection, and browser reloads.

### Audit Matrix by Chapter

| Chapter / Sector | 1. Config Exists | 2. Visible in Play | 3. Triggered at Gameplay Moment | 4. Causally Connected to Mechanics | 5. Persists Across Transitions & Reloads | Key Evidence & Gaps Found in Code |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Prologue: Wake** (`Calibration Bay 04`) | YES (`config.ts:390-415`) | PARTIAL (2.6s intro banner in `GameHud.tsx:1232`) | NO (Silent during Steps 1–3 of Calibration Puzzle) | PARTIAL (3-step tracker shows button prompts, not Lysa's breadcrumb trail) | NO (In-memory `worldRef` resets on page reload) | Once the 2.6s intro banner dismisses, completing Step 1 (`Anchor Pad 01`), Step 2 (`Kinetic Receiver`), and Step 3 (`Dual Lock`) triggers zero narrative feedback from Lysa's calibration logs or WARDEN's containment sensors. |
| **Chapter I: A Place That Remembers** (`HELIX-04`) | YES (`config.ts:416-439`) | PARTIAL (`transition_to_boss` banner only works from Prologue) | NO (Silent during `boss_intro`, first Convergence, and Phase II 50% HP) | PARTIAL (`LOG-01` only visible *after* boss dies in `StatusModal.tsx:195`) | NO (Recovered logs & endings not persisted in `localStorage`) | `GameHud.tsx:1275-1319` hardcodes `GAME_CONFIG.campaignChapters.prologue` into `containment-transition-banner`. During the fight against HELIX-04, neither WARDEN nor Sera reacts when frontal armor deflects strikes, when Convergence shatters armor, or when Phase II overload begins at 50% HP. |
| **Chapter II: Garden of Repeated Days** (`THE CHOIR`) | YES (`config.ts:440-465`) | NO (No arrival banner; `LOG-02` only in post-victory modal) | NO (No comms on arrival, node priming, Confluence break, or Phase II) | PARTIAL (3D tethers exist, but no explanation that the 3 pylons loop crew routines) | NO | Advancing from Chapter I → II via `advanceCampaignChapter` (`simulation.ts:1958`) puts `run.stage` into `'boss_intro'` (0.95s) with **zero sector arrival banner** in `GameHud.tsx`. Players are dropped straight into Hydroponics Ring B without hearing the looped crew chorus or learning why Soprano, Alto, and Bass pylons shield THE CHOIR. |
| **Chapter III: The Archive That Answers** (`THE CURATOR`) | YES (`config.ts:466-491`) | NO (No arrival banner; `LOG-03` only in post-victory modal) | NO (No comms when False-Echo decoys spawn or when `Gravity Pin [G]` anchors them) | PARTIAL (`Gravity Pin [G]` unlocks silently on HUD without narrative handoff) | NO | Advancing from Chapter II → III unlocks `Gravity Pin [G]` (`simulation.ts:1540`), but there is no arrival briefing or live transmission explaining that THE CURATOR weaponizes edited catastrophe traces—or that anchoring a trace recovers Lysa's unedited telemetry. |
| **Chapter IV: A System That Wants You Dead** (`MATRON-V`) | YES (`config.ts:492-518`) | NO (No arrival banner; `LOG-04` only in post-victory modal) | NO (No comms on Siphon drain, Eraser pulse, Chrono Sever, or `Echo Collapse [X]`) | PARTIAL (`Echo Collapse [X]` unlocks silently on HUD without narrative handoff) | NO | Advancing from Chapter III → IV unlocks `Echo Collapse [X]`, but there is no arrival briefing explaining MATRON-V's surgical quarantine of "unpredictable" human tracks or Lysa's physical death in Triage Ward 04. |
| **Chapter V: The Last Loop** (`Chronicle Loom Core`) | YES (`config.ts:519-592`) | PARTIAL (Immediate full-screen modal blocks 3D Loom chamber view) | PARTIAL (Ending selection updates 3D Loom, but modal immediately switches to `gameover`) | YES (3 endings align with Story Bible) | NO (`localStorage` only stores audio/camera settings, not campaign/ending progress) | In `GameHud.tsx:1322`, `chronicle-loom-panel` immediately covers the viewport with a `bg-[#05080f]/82 backdrop-blur-md` overlay as soon as Chapter V loads, preventing the player from inspecting the 3D Chronicle Loom chamber or reviewing the 4 recovered override seals (`LOG-01`–`LOG-04`) before choosing humanity's fate. |

---

## 2. Candidate Improvements Evaluated (12 Candidates)

We evaluated 12 concrete improvements across narrative delivery, gameplay-story integration, 3D environmental storytelling, HUD clarity, and persistence:

| # | Candidate Improvement | Primary Files Affected | Player Experience Value | Engineering Effort | Regression Risk | Unit & Browser Testability | Decision |
| :- | :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **C1** | **Authoritative In-World Comms & Live Causal Transmission Feed (`world.comms`)** with explicit source classification (`RECORDED LOG`, `LIVE WARDEN DIRECTIVE`, `RECONSTRUCTED TRACE`, `LIVE NEURAL TRACE`, `SERA VENN`) | `types.ts`, `config.ts`, `simulation.ts`, `GameHud.tsx` | **Very High** — Moves storytelling *into* active gameplay (`calibration`, `boss_intro`, first mechanic trigger, `50% HP` Phase II, boss defeat) without blocking controls. | Medium | Low | High (Deterministic state assertions in `simulation.test.ts` + DOM `[data-testid="live-comms-banner"]`) | **SELECTED (Pkg 1)** |
| **C2** | **Universal Sector Arrival & Boss Awakening Banner (`boss_intro`) + Dynamic Chapter Handoff** for Chapters I–V with newly unlocked ability callouts (`Gravity Pin [G]`, `Echo Collapse [X]`) and `[SPACE]` skip | `simulation.ts`, `GameHud.tsx`, `App.tsx` | **Very High** — Fixes the jarring jump into Chapters II, III, IV, and V; gives every chapter arrival cinematic framing and clear tactical purpose. | Low-Med | Low | High (`skipBossIntro` / `[SPACE]` + DOM `[data-testid="boss-intro-banner"]`) | **SELECTED (Pkg 2)** |
| **C3** | **Recovered Archive Evidence Tracker (`world.run.recoveredLogs`)** — Unlock `LOG-01` through `LOG-04` causally during gameplay/defeat and allow inspecting recovered evidence in Chapter V & Title Screen | `types.ts`, `simulation.ts`, `GameHud.tsx`, `TitleScreen.tsx` | **High** — Makes each chapter's recovered Override Seal & catastrophe proof tangible and cumulative leading into the Chapter V decision. | Low-Med | Low | High (Unit tests verify `recoveredLogs` progression and replay isolation) | **SELECTED (Pkg 1 & 4)** |
| **C4** | **Mid-Combat Boss Phase II & Mechanic Story Reactions** — Live WARDEN / Boss / Sera / Lysa transmissions when bosses hit 50% HP (`boss_phase_transition`), Choir Confluence breaks, Curator trace is pinned, or Matron triggers Chrono Sever | `config.ts`, `simulation.ts`, `audio.ts` | **Very High** — Connects combat escalation directly to the narrative conflict (WARDEN escalating containment vs. Sera's unrecorded future). | Medium | Low | High (Unit tests verify exact mid-combat comms triggers on Phase II & mechanic events) | **SELECTED (Pkg 1 & 3)** |
| **C5** | **3D Sector Storytelling Landmarks & State-Reactive Arena Architecture** (Ch.I Containment Lock Beacons, Ch.II Acoustic Resonance Floor Rings, Ch.III Holographic Memory Monoliths, Ch.IV Quarantine Stasis Pods, Ch.V 4 Conquered Marshal Override Pedestals feeding the Loom Core) | `renderer.ts` | **Very High** — Visually differentiates every chapter in the 3D arena and makes the environment react in real time to puzzle/boss states with zero per-frame allocations. | Medium | Low (Zero collider changes) | High (Verified via Playwright 3D screenshots across chapters & endings) | **SELECTED (Pkg 3)** |
| **C6** | **Chapter V Chronicle Loom Chamber Inspection Toggle & Recovered Evidence Dossier** — Let players toggle between inspecting the 3D Chronicle Loom Chamber (and moving Sera around the 4 Override Pedestals) and the Directive Console, while displaying the 4 recovered sector logs and explicit trade-offs of `Silence`, `Witness`, and `Continuity` | `GameHud.tsx`, `StatusModal.tsx` | **Very High** — Turns Chapter V from a static popup into a genuine in-world culmination where the 3D Loom chamber and recovered evidence inform the final choice. | Low-Med | Low (Preserves `chronicle-loom-panel` & ending button testIds by default) | High (Playwright test verifies console toggle + all 3 ending selections) | **SELECTED (Pkg 4)** |
| **C7** | **Persistent Campaign & Ending Archive (`localStorage` `afterframe_campaign_progress_v1`)** — Persist unlocked/completed chapters, recovered logs, and completed endings (`completedEndings`) across browser reloads, with Ending Badges on Title Screen & Chapter Select | `types.ts`, `simulation.ts`, `App.tsx`, `TitleScreen.tsx` | **High** — Makes completing the campaign and discovering all 3 endings (`Silence`, `Witness`, `Continuity`) durable and inspectable across sessions while preserving pure `createInitialWorld()` for unit tests. | Low-Med | Low | High (Unit + Playwright reload persistence verification) | **SELECTED (Pkg 5)** |
| **C8** | **Distinct Audio Signatures for Comms Transmissions & Ending States** — Subtle procedural radio/telemetry carrier tones for `Lysa` neural trace vs. `WARDEN` low-frequency directive | `audio.ts`, `App.tsx` | **Medium** — Enhances audiovisual atmosphere when live transmissions arrive during play. | Low | Very Low | Medium (Verified via `combatEventTypes` / audio synthesis hooks) | **SELECTED (Pkg 1)** |
| **C9** | New 6th Boss Encounter ("WARDEN PRIME" separate arena) | `simulation.ts`, `models.ts`, `renderer.ts` | N/A | Very High | High | Out of scope — Prompt explicitly forbids adding new chapters or bosses. | **REJECTED (Scope Rule)** |
| **C10** | Altering Arena Obstacle Colliders (`GAME_CONFIG.arena.obstacles`) per chapter | `config.ts`, `simulation.ts` | Medium | Medium | High (Could affect existing movement/LOS tests) | Out of scope — Prompt requires keeping obstacle collider layouts unchanged. | **REJECTED (Safety Rule)** |
| **C11** | Multi-branch dialogue trees with player text responses mid-combat | `GameHud.tsx`, `simulation.ts` | Low (Disrupts combat flow) | High | Medium | Violates action-first HUD rule ("Use concise, high-impact lines. Do not flood the screen with text"). | **REJECTED (UX Rule)** |
| **C12** | Full voice-acted MP3 asset loader from external URLs | `audio.ts` | Low | Medium | High (External URL failure risk) | Violates constraint against external imaginary asset URLs. | **REJECTED (Constraint)** |

---

## 3. Selected Cohesive Improvement Packages for Implementation

1. **Package 1 — Authoritative In-World Comms, Causal Gameplay Triggers & Source Classification (`types.ts`, `config.ts`, `simulation.ts`, `audio.ts`, `GameHud.tsx`)**:
   - Add deterministic `world.comms` state (`activeTransmission`, `queue`, `triggeredMilestones`) and `world.run.recoveredLogs` (`LOG-01`..`LOG-04`) + `world.run.completedEndings` (`silence`, `witness`, `continuity`).
   - Every transmission carries an explicit `classification` badge (`RECORDED LOG`, `LIVE WARDEN DIRECTIVE`, `RECONSTRUCTED TRACE`, `LIVE NEURAL TRACE`, `SERA VENN`) so recorded logs are never confused with live communications.
   - Trigger concise, non-blocking transmissions at causal gameplay milestones:
     - **Prologue**: Wake transmission → Step 1 (`Anchor Pad 01` activated by Echo) → Step 2 (`Kinetic Receiver` charged by Echo Heavy) → Step 3 (`Dual Resonance Gate` unlocked) → Containment Breach.
     - **Chapter I (`HELIX-04`)**: Awakening directive → First Convergence / armor break → Phase II (50% HP) protocol escalation → Defeat (`LOG-01` recovered).
     - **Chapter II (`THE CHOIR`)**: Awakening chorus → First Harmonic Pylon primed by Echo → Harmonic Confluence shield shattered (`choir_sync_completed`) → Phase II escalation → Defeat (`LOG-02` recovered).
     - **Chapter III (`THE CURATOR`)**: Awakening reconstruction + `Gravity Pin [G]` briefing → First `Gravity Pin [G]` anchor / decoy neutralization → Phase II unedited catastrophe exposure → Defeat (`LOG-03` recovered).
     - **Chapter IV (`MATRON-V`)**: Awakening surgical quarantine + `Echo Collapse [X]` briefing → First Siphon/Eraser/Chrono Sever hazard or `Echo Collapse [X]` detonation → Phase II excision overload → Defeat (`LOG-04` recovered).
     - **Chapter V (`THE LAST LOOP`)**: Arrival at the Chronicle Loom Core with all 4 Override Seals synchronized + live neural trace from Lysa's archived pattern inside the Loom.

2. **Package 2 — Universal Sector Arrival Transitions (`boss_intro` & `transition_to_boss`) (`simulation.ts`, `GameHud.tsx`, `App.tsx`)**:
   - Fix `containment-transition-banner` so it dynamically displays the target chapter's transition briefing.
   - Add a dedicated, skippable (`[SPACE]`) **Sector Arrival / Boss Awakening Banner (`[data-testid="boss-intro-banner"]`)** during `run.stage === 'boss_intro'` across Chapters I–IV, displaying the sector designation, causal story hook, boss directive, and newly unlocked Chrono Rig countermeasure (`Gravity Pin [G]` in Ch.III, `Echo Collapse [X]` in Ch.IV).
   - Add `skipBossIntroBanner(world)` so pressing `[SPACE]` or clicking the banner during `boss_intro` immediately transitions the boss from `dormant` to active combat.

3. **Package 3 — 3D Sector Storytelling Landmarks & State-Reactive Arena Geometry (`renderer.ts`)**:
   - Build a zero-GC `sectorLandmarksGroup` in `ArenaSceneRenderer` with distinct 3D environmental storytelling structures per chapter that react to live gameplay state without altering obstacle colliders:
     - **Chapter I (`HELIX-04`)**: 4 Perimeter Containment Lockdown Pylons & North Breach Gate Beacons that pulse amber/red during HELIX-04's containment protocol and shift to cyan when HELIX-04's core is exposed or defeated.
     - **Chapter II (`THE CHOIR`)**: Concentric Acoustic Resonance Floor Rings & Harmonic Conduit Spires that illuminate in cyan as Soprano, Alto, and Bass nodes synchronize.
     - **Chapter III (`THE CURATOR`)**: 4 Crystalline Memory Archive Monoliths around the perimeter that project rotating holographic data octahedrons and stabilize from violet corruption to cyan clarity when `Gravity Pin [G]` is active or THE CURATOR is staggered.
     - **Chapter IV (`MATRON-V`)**: 4 Surgical Quarantine Stasis Columns with vertical bio-scan rings that flare crimson during `Chrono Sever` / Echo suppression and vent cyan energy when `Echo Collapse [X]` detonates.
     - **Chapter V (`THE LAST LOOP`)**: 4 Orbital Override Seal Pedestals surrounding the central Chronicle Loom Pylon (representing `HELIX-04`, `THE CHOIR`, `THE CURATOR`, and `MATRON-V`), linked by energy conduits to the Loom Core and transforming cleanly for `Silence` (extinguished cold steel lock), `Witness` (high-gain cyan-white orbital telemetry array), and `Continuity` (golden-amber harmonic sanctuary lattice).

4. **Package 4 — Chapter V Chronicle Loom Chamber Inspection & Recovered Evidence Dossier (`GameHud.tsx`, `StatusModal.tsx`)**:
   - Enhance `[data-testid="chronicle-loom-panel"]` with a **Recovered Sector Evidence Strip (`LOG-01`–`LOG-04`)** showing the four truths Sera uncovered across Nadir-9, plus an **"Inspect 3D Loom Chamber [TAB]"** toggle that lets the player minimize the console overlay, walk Sera around the illuminated 3D Chronicle Loom Core and Override Pedestals, and reopen the console at any time to execute `SILENCE`, `WITNESS`, or `CONTINUITY`.

5. **Package 5 — Persistent Campaign & Ending Archive Across Reloads (`types.ts`, `simulation.ts`, `App.tsx`, `TitleScreen.tsx`)**:
   - Track `completedEndings: ChronicleLoomEndingId[]` and `recoveredLogs: string[]` in `world.run` (and preserve them across `savedCampaignSnapshot` / replay isolation).
   - Persist campaign unlocks, completed chapters, recovered logs, and completed endings to `localStorage` (`afterframe_campaign_progress_v1`) in `src/App.tsx` and surface completed ending badges (`SILENCE`, `WITNESS`, `CONTINUITY`) on the Title Screen and Chapter Select drawer.

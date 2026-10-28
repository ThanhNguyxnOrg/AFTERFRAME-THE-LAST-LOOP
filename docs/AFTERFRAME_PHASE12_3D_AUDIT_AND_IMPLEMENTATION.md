# AFTERFRAME: THE LAST LOOP — PHASE 12 3D AUDIT AND IMPLEMENTATION

## 1. Verified baseline

- Audit date: 2026-10-28.
- Commit: `283ef28 Use organization website logo in README` on `main`.
- `git status --short`: empty. `git diff` and `git diff --staged`: empty. There were no pre-existing working-tree modifications to preserve.
- Stack verified in `package.json`: React 19, TypeScript, Vite 8, Three.js 0.186, procedural Web Audio. `bun.lock` is the only lockfile; no npm lockfile was created.
- Dependencies were initially absent. The first `npm run lint` and `npm run build` failed because `tsc` and `vite` were unavailable, not because of source errors.
- Dependency setup findings: plain npm installation encountered the Vite 8.3.5 / esbuild peer range conflict; the npx Bun binary was incompatible with this Windows host. `npm install --no-package-lock --no-audit --no-fund --legacy-peer-deps` then installed the existing manifest without editing `package.json` or `bun.lock`.
- `npx --yes tsx --test src/game/simulation.test.ts`: **108/108 passing**, zero failures.
- `npm run build` after dependency installation: **passed**. Vite reported the existing `__dirname` config-loader warning and the existing large-chunk warning; neither is a Phase 12 rendering failure.
- `npm run lint` after dependency installation: **one pre-existing source error** at `src/App.tsx:902`: `skipBossIntroBanner` is present in the `__afterframeTest` object but missing from its declared type. `dismissActiveTransmission` is also implemented at line 908 and missing from that type. This is a real baseline TypeScript failure, not a Phase 12 regression.
- Current-output browser audit used real headless Chromium through Playwright at 1440×900 and 390×844, with the existing `__afterframeTest` API. Baseline images are in `screenshots/phase12/before/`. The run recorded zero console errors and zero uncaught page errors (`screenshots/phase12/before/audit.json`).

## 2. Actual runtime and state boundaries

1. `src/main.tsx` mounts `App`. `src/App.tsx:92-149` owns the mutable `WorldState` ref, input, audio, renderer, and React HUD snapshot. Campaign persistence uses `afterframe_campaign_progress_v1` (`App.tsx:68-89`).
2. `InputController.consumeFrameInput` (`src/game/input.ts:460-559`) converts keyboard, mouse and touch state into `PlayerInputFrame`. It does not decide combat outcomes.
3. The frame loop consumes input, calls `stepWorld`, routes emitted events to `SoundEngine.playEvents` and `ArenaSceneRenderer.handleCombatEvents`, then calls `updateAndRender` (`App.tsx:602-637`).
4. `stepWorld` (`src/game/simulation.ts:7462-7504`) clears per-frame events, caps large frame deltas and substeps above 50 ms. `stepWorldSingleSlice` (`simulation.ts:7235-7460`) owns player actions, Echo/Relay/Resonance, chapter mechanics, AI, collisions, transitions and victory/defeat state.
5. `extractHudSnapshot` (`simulation.ts:7506-7924`) derives a presentation snapshot from authoritative state. React HUD, title and status modal render that snapshot; they do not own combat rules.
6. `ArenaSceneRenderer` (`src/game/renderer.ts:145-3669`) constructs shared Three.js resources once, synchronizes rigs to enemy state, derives poses/VFX/camera and renders. `syncEnemyRigs` replaces rigs when the encounter roster changes. Simulation hitboxes and AI remain in `WorldState`, not in meshes.
7. `models.ts` procedurally constructs Sera/Echo, enemies, bosses and the shared industrial arena. There is no GLB/GLTF loader, imported character asset or Blender pipeline in the tracked source/assets. The extensionless files under `public/assets/aistudio/` are UTF-8 text, not model binaries.
8. Campaign/chapter functions (`simulation.ts:1475-1746`, `1805-2070`, `2294-2603`) implement boss entry, checkpoints, chapter selection, retry, replay restoration, Chapter V entry and ending selection. Save parsing/serialization (`simulation.ts:2137-2273`) sanitizes unlocks, recovered logs and endings. It is not a versioned RPG save migration system.

## 3. Current feature inventory

### Fully implemented and covered by the current test suite

- Movement/camera, three-hit light combo, charged Heavy, dodge, parry, hit-stop, guard/posture, enemy vulnerability, three standard enemy archetypes and four boss state machines.
- Echo recording/playback, Relay, Resonance/Convergence, Chapter II Harmonic Nodes, Chapter III reconstructed traces/decoys/Gravity Pin, Chapter IV Siphon/Eraser/Chrono Sever/Echo Collapse.
- Six chapter IDs: `prologue`, `chapter_1_helix`, `chapter_2_choir`, `chapter_3_curator`, `chapter_4_matron`, `chapter_5_loom`; four boss IDs; three endings.
- Campaign unlocks/completion, checkpoints, retries, chapter replay restoration, practice isolation, recovered logs, completed endings, comms, arrival/transition banners and the Chapter V inspection/console flow.
- Existing tests explicitly cover Phase 6 boss combat, Phase 7 campaign/checkpoints, Phase 8 chapters/endings, Phase 9 progression/replay, and Phase 10–11 narrative/persistence behavior.

### Implemented presentation systems that must be preserved

- HELIX has articulated hydraulic limbs, physical core shutters, Anchor Maul, cleaver and three spatial telegraphs (`models.ts:2511-3472`).
- Choir/Curator/Matron already have accessory kits: tri-spires/rings, orbiting shards/glaive, and surgical limbs/tools respectively (`models.ts:2736-3375`). Phase 12 must replace the shared body plan, not delete these useful identity motifs.
- Curator traces already include a floor lane and vertical curtain; Chrono Sever already includes a floor ring and cylindrical wall; Choir already has node-to-boss tethers (`renderer.ts:756-928`, `2598-2762`). These are not missing mechanics.
- Phase 11 landmark groups already react to live boss/node/pin/sever/ending state (`renderer.ts:414-602`, `1507-1633`). The Chronicle Loom already reacts to Silence, Witness and Continuity with ring speed, beam/dome, seal and lighting changes (`renderer.ts:1411-1505`). Rebuilding those systems would duplicate working code.
- Pooled instanced particles, preallocated VFX and a simplified headless path exist (`renderer.ts:930-977`, `1076-1397`). Shadows and reflection environment are disabled for detected headless browsers; one shadow-casting directional light is used otherwise.

### RPG systems gap analysis

- **Actual combat weapon:** the Chrono Edge has real light/combo/Heavy data and timing in `GAME_CONFIG.player` (`config.ts:156-219`). Sera also has a visible Pulsecaster gauntlet mesh (`models.ts:1524-1594`), but no independent ranged player attack, ammo, switching or Pulsecaster moveset was found.
- **Absent as gameplay systems:** weapon definitions/loadouts/switching; inventory and equipment slots; armor/accessories; item rarity/generation/drops; currency and upgrade costs; build modifiers; general mission/modifier/reward structures; versioned save migrations.
- **Existing but narrower than RPG missions:** the campaign has chapter progression, narrative rewards/unlocks and run telemetry, not data-driven mission objectives, optional objectives, stage modifiers or loot rewards.
- README correctly describes Edge and Pulsecaster as project concepts and leaves weapon variety, loot and progression as future work. A visible mesh or README name is not treated as a working RPG system.

## 4. Confirmed current 3D findings

### F1 — Four bosses still share one dominant body plan

`models.ts:2511-2735` builds the same hydraulic biped, pelvis, central rectangular chassis, chest core, paired shutters, and two weapon pivots for every boss. The accessory branches at `2736-3375` differ, but the baseline 1440×900 captures show that Choir, Curator and Matron still read as recolored HELIX-derived bipeds at combat distance. This is a current defect; the Phase 10 report was directionally right but the accessory pass did not fully solve it.

### F2 — Sector identity is carried mostly by color and small landmark groups

The shared deck, 16 bulkhead segments, conduit pillars and central Loom are constructed once in `models.ts:510-1110`. Current chapter updates change light/conduit colors and toggle the Phase 11 groups (`renderer.ts:1411-1633`). The existing landmarks are useful but too sparse to make six architectural identities. Current captures confirm similar floor, wall, pillar and framing language across sectors. Collision geometry must remain unchanged.

### F3 — Mechanic volume exists, but danger boundaries can be clearer

- Curator floor/curtain traces exist and show amber warning, red committed/executing and violet residue. The current capture shows the lane, but its edge ownership is less crisp than the boss/floor decoration (`renderer.ts:2681-2714`).
- Chrono Sever's translucent wall and ring are real 3D, but the continuous transparent cylinder reads as a broad filled volume; a segmented emitter boundary would communicate the safe/unsafe edge with less overdraw (`renderer.ts:2716-2743`).
- Choir tethers, Relay columns, impact/stagger effects and ending-specific Loom transformations are present and should be retained rather than reimplemented.

### F4 — Resource/performance constraints for the implementation

- Avoid adding per-frame geometry/material creation. New variants must be preallocated and toggled by chapter; shared geometries/materials should be reused within repeated assemblies.
- Keep transparent overlays bounded, especially for the Curator and Matron hazards. Do not add bloom or extra real-time shadow lights in Phase 12.
- `dispose()` currently traverses meshes and disposes geometry/materials (`renderer.ts:3654-3668`). New owned resources must remain inside that scene graph. Any additional texture disposal must avoid double-disposing shared resources.
- Current frame paths already use module-scope camera math and pooled particles. New boss motion must write existing pivots, not create vectors/groups in `updateAndRender`.

## 5. Historical claims that are outdated or incomplete

- “Chapter mechanics are only flat 2D planes/rings” is outdated: curtains, a 3D Sever wall and node tethers exist.
- “The Loom does not react to endings” is outdated: the three authoritative ending states already drive physical assemblies, seals, lights and ring behavior.
- “There are no chapter landmarks” is outdated: Phase 11 groups exist and are state-reactive. The remaining gap is architectural scale and diversity, not their existence.
- “Bosses differ only by color” is incomplete rather than exact: accessories and weapons differ, but the shared chassis still dominates their silhouettes. Phase 12 addresses the body plan itself.

## 6. Phase 12 implementation scope

### Package 1 — Bespoke boss identities

- Preserve `EnemyRig`, event flow, hitboxes, enemy/boss transforms and attack state machines.
- Keep HELIX-04 as the heavy hydraulic containment executor and retain its proven Anchor Maul/cleaver/telegraphs.
- Build genuinely different visible chassis for:
  - **THE CHOIR:** suspended tri-spire acoustic cathedral; open resonator core; broad harmonic rings and organ-pipe hierarchy; no shared biped silhouette.
  - **THE CURATOR:** narrow floating archive monolith; stacked crystalline memory architecture; orbital shard crown; no shared biped silhouette.
  - **MATRON-V:** low, wide porcelain/crimson surgical cradle; multi-limb articulated silhouette and clinical scanner; no shared biped silhouette.
- Reuse core shutters, weapon/secondary pivots and existing state-derived animation contracts. Add only small optional rig handles needed for bespoke articulated parts; animate them from existing boss state.

### Package 2 — Six sector identities without collider changes

- Preallocate a visual group per chapter. Add architecture outside combat lanes and existing collision circles:
  - Prologue: calibration/scan gantries and alignment markings.
  - Chapter I: containment blast-door ribs, lock bolts and hydraulic bracing.
  - Chapter II: acoustic amphitheatre tiers, organ towers and overhead resonators.
  - Chapter III: archive rack monoliths, suspended memory slabs and crystalline rails.
  - Chapter IV: porcelain stasis pods, surgical scan frames and clinical lane markings.
  - Chapter V: orbital Loom crown, seal-linked chamber structure and ending-reactive core already present.
- Add per-chapter background/fog/key/rim material direction, not just a hue swap. Preserve visibility of actors and telegraphs.
- Do not edit `GAME_CONFIG.arena.obstacles`, arena radius, player movement, puzzle coordinates, attack ranges or simulation timing.

### Package 3 — Mechanic clarity and renderer quality

- Add preallocated edge rails to Curator traces so warning/commit/execute/residue have a readable 3D boundary.
- Add segmented Chrono Sever emitter struts and reduce dependence on a broad transparent wall.
- Keep existing Choir, Relay, impact, phase, defeat and Loom responses.
- Keep resources preallocated; no new bloom, imported assets, runtime shader compilation per frame or collision dressing.

### Baseline type repair

- Add the two missing `__afterframeTest` method declarations in `App.tsx` so the pre-existing TypeScript failure can be distinguished from Phase 12 changes and the final baseline check can run cleanly.

## 7. Acceptance criteria and verification plan

1. The React/TypeScript/Vite/Three.js stack, campaign, simulation and UI remain intact.
2. Boss silhouettes differ structurally at combat distance, not only by material or accessory color.
3. All six chapter groups have distinct architectural silhouettes, vertical landmarks and material/light treatment while obstacle configuration remains byte-for-byte untouched.
4. Existing telegraphs remain legible; Curator and Matron boundaries become clearer without hiding actors.
5. Run `npm run lint`, `npm run build`, and `npx --yes tsx --test src/game/simulation.test.ts` after implementation. Report any remaining baseline environment issue separately.
6. Run the real browser again and inspect all four bosses, all six chapters, representative telegraphs, all three Loom endings, and desktop/mobile framing. Check console/page errors and horizontal overflow.
7. Exercise the existing simulation regression coverage for combat timing, chapter mechanics, transitions, saves, retries, endings and practice isolation. Visual state setup must use the existing test API; no gameplay result is inferred from a screenshot alone.
8. Store after-evidence in `screenshots/phase12/after/` and update this document with actual observations, test results and remaining limitations. A build or captured file alone is not a visual pass.

## 8. Later Action RPG milestones

### Phase 13 — Data-driven combat and weapons

Define weapon/loadout records and simulation boundaries around the real Edge combo/Heavy system. Decide whether the visible Pulsecaster becomes a real ranged weapon; add switching and new classes only when their timing, resource and defensive trade-offs are testable. Preserve deterministic input and Echo event replay.

### Phase 14 — Equipment, loot and build progression

Add inventory/equipment/slot/item definitions, deterministic seeded generation, rarity, stat modifiers, upgrade costs/resource sinks and explicit save-schema migration. Drops must create different builds (timing, Echo economy, defense, melee/ranged trade-offs), not uniform stat inflation.

### Phase 15 — Missions, expeditions and rewards

Build data-driven primary/optional objectives, encounter compositions, stage modifiers and completion rewards on top of the existing campaign/replay/save contracts. Keep story chapters coherent while adding replayable expeditions and meaningful rewards from Phases 13–14.

### Phase 16 — Combat content and release readiness

Expand enemy/boss/encounter variety, difficulty and accessibility; establish performance budgets and broader regression/browser playthrough coverage; finalize audiovisual feedback, setup documentation and end-to-end release checks.

Dependency order is intentional: weapon and combat state contracts precede item modifiers; items and reward rules precede mission/expedition rewards; content and release hardening build on those stable systems. Phase 12 deliberately does not introduce a partial inventory system.

## 9. Implemented Phase 12 changes

### Boss construction

- Added `buildBespokeBossChassis` in `src/game/models.ts:2147`. It supplies the existing core, shutter, weapon, secondary and ring contracts without changing `EnemyRig` consumers.
- `createEnemyRig` now routes Choir, Curator and Matron to those bespoke bodies at `models.ts:3210`; HELIX retains its established hydraulic body and weapon/telegraph implementation.
- **Choir** is now a suspended tri-spire resonator with organ banks, open core and acoustic baffles. **Curator** is now a floating narrow archive stack with a crystalline crown and six orbital memory shards. **Matron** is now a low, wide porcelain surgical cradle with four articulated dorsal limbs, support feet and a tri-lens scanner.
- Added optional `auxiliaryPivots` for those unique moving assemblies. Renderer motion at `renderer.ts:3188` derives spire/slab/limb movement from the existing boss AI state; no second gameplay state source was added.
- The procedural pass introduced no imported model or unverified asset license. A later, separately verified Blender-authored GLB pass is recorded in section 13.

### Chapter environments and lighting

- Added preallocated chapter architecture through `buildChapterEnvironment` at `models.ts:1120` and chapter registration at `renderer.ts:448`. Only the active chapter group is visible.
- Prologue has calibration gantries and alignment markings; Chapter I has blast-door ribs, lock bolts, braces and containment pylons; Chapter II has stepped amphitheatre tiers, organ towers and overhead halos; Chapter III has archive racks, floating slabs and crystalline rails; Chapter IV has porcelain stasis pods, scan frames and clinical lanes; Chapter V has orbital seal towers, a Loom crown and radial seal markings.
- `CHAPTER_LOOKS` (`renderer.ts:156`) now defines background, fog density, key/rim/practical colors and intensities per sector. The update at `renderer.ts:1554` toggles prebuilt groups, rotates existing parts and applies those profiles without creating resources per frame.
- Phase 11 reactive landmarks and the Silence/Witness/Continuity Loom state transformations remain in place.

### Mechanics, endings and responsive presentation

- Curator traces now have two preallocated raised edge rails per lane (`renderer.ts:2800-2870`). Their transforms use the authoritative trace origin/direction/width/length; warning, committed, executing and harmless residue retain separate color/opacity treatment.
- Chrono Sever now has twelve segmented vertical emitter struts around the authoritative radius, while the broad transparent wall was reduced (`renderer.ts:2880-2904`). This exposes the boundary without filling the whole play space with a solid-looking cylinder.
- The Witness uplink sheath was widened beyond the opaque Loom column and changed to low-opacity additive cyan (`renderer.ts:459`). Silence still powers down the scene and Continuity still forms the golden lattice.
- Narrow viewports now use 60° vertical FOV and a 1.4× presentation-only follow distance (`renderer.ts:376`, `3799`, `3845`). Desktop keeps the original 52° FOV and distance. This was iterated after the first mobile capture hid too much of the tall Choir/Curator crowns.
- The pre-existing test API type failure was repaired by declaring `skipBossIntroBanner` and `dismissActiveTransmission` at `App.tsx:763-764`.
- `src/game/config.ts`, `src/game/simulation.ts` and `src/game/types.ts` have no diff. Arena obstacles, combat timing, AI, collision and save logic were not changed.

## 10. Final verification results

- `npm run lint`: **passed**, zero TypeScript errors. `lint` remains `tsc --noEmit`, not a separate lint engine.
- `npm run build`: **passed**. The existing Vite `__dirname` config-loader warning and large-chunk warning remain; no new build warning was introduced.
- `npx --yes tsx --test src/game/simulation.test.ts`: **108/108 passed**, zero failures. This includes combat timing, Echo/Relay/Resonance, all four boss state machines, chapter mechanics, campaign boundaries, checkpoints/retries, endings, practice/replay isolation and persistence sanitization.
- `git diff --check`: **passed**, no whitespace errors.
- Browser smoke results are recorded in `screenshots/phase12/after/browser-smoke.json`:
  - Real `W` keyboard input moves Sera; real `F` starts a light attack.
  - Practice boss state does not mutate campaign save data.
  - Forcing the actual Curator attack creates live reconstructed traces.
  - An actual Anchor Slam defeats Sera; checkpoint retry restores full boss HP and checkpoint Integrity/Flux.
  - Selecting Witness persists `completedEndings` after reload at the normal campaign URL.
  - The 390 px layout has no horizontal document overflow and the canvas fills the viewport.
  - Zero console errors and zero uncaught page errors.

## 11. Visual evidence and observations

Final evidence is in `screenshots/phase12/after/`; the comparison set is in `screenshots/phase12/before/`. The capture script used real headless Chromium with D3D11 WebGL and the existing game/test API, not a replacement scene.

- `00-prologue-desktop.png`: calibration gantries and floor alignment marks are visible while preserving the Loom, puzzle pads and combat HUD.
- `01-helix04-desktop.png`: HELIX retains its proven silhouette; containment ribs/lock structures now distinguish the vault.
- `01-choir-desktop.png`: suspended tri-spire body, organ towers, amphitheatre tiers and overhead resonators are visible.
- `01-curator-desktop.png`: floating archive monolith, crown/shards, rack monoliths and violet memory rails are visible.
- `01-matron-desktop.png`: low multi-limb porcelain cradle, stasis pods and clinical overhead lights are visible.
- `05-loom-desktop.png`: the Loom crown, seal towers, four existing seal tethers and inspection UI remain readable.
- `02-*-telegraph-desktop.png`: Anchor Slam, Harmonic Convergence, Curator lane rails and segmented Chrono Sever were captured from live forced boss attacks. Dangerous lanes/radii remain legible around Sera and the bosses.
- `06-loom-silence-canvas-desktop.png`: the scene visibly powers down while Sera and the chamber remain discernible.
- `06-loom-witness-canvas-desktop.png`: the cyan uplink sheath is now visible around the Loom rather than hidden inside it.
- `06-loom-continuity-canvas-desktop.png`: the golden sanctuary lattice is visible around the central core and seals.
- `10-prologue-mobile.png`, `11-helix04-mobile.png`, `11-choir-mobile.png`, `11-curator-mobile.png`, `11-matron-mobile.png`, `15-loom-mobile.png`: all six sectors were inspected at 390×844. The HUD and touch controls fit; the final camera adjustment exposes the core and identity-bearing upper structures of the taller bosses substantially better than the first pass.
- `audit.json` for the final capture records the correct chapter/boss/ending states and zero console/page errors. Every listed image was opened and visually reviewed during this task; no visual pass is inferred from file creation alone.

## 12. Remaining limitations and next step

- The Qoder in-app browser had no visible surface, so browser verification used Playwright/Chromium directly. The game intentionally throttles detected headless browsers; therefore no honest real-time FPS, draw-call or GPU-time budget is claimed from these captures.
- Verification covers the captured default/telegraph views and targeted browser interactions, not every camera angle or a complete manual real-time campaign playthrough. Authoritative campaign boundaries are instead covered by the 108 simulation tests plus the targeted browser smoke checks above.
- Some decorative upper spire/ring tips can approach the top HUD at extreme mobile camera angles; only the documented default framing and forced attack views were inspected.
- No RPG inventory/loot/mission system was added. The next implementation milestone remains **Phase 13 — data-driven combat and weapons**, beginning with the real Edge timing/resource contract and an explicit decision on whether the visible Pulsecaster becomes a simulated ranged weapon.
- No commit or push was created.

## 13. Blender-authored asset addendum

After the procedural Phase 12 commit, a real Blender-to-Three.js handoff was added:

- Tool: **Blender 4.2.3 LTS**, portable Windows build at `C:\Users\Admin\Tools\blender-4.2.3\blender-4.2.3-windows-x64\blender.exe`. The downloaded ZIP was checked against the official SHA-256 `7f8be9b1...189b3a` before extraction; no unverified binary was used.
- Source: `scripts/blender/create_phase12_assets.py` builds named, beveled parts with PBR materials and exports GLB through Blender's glTF 2.0 exporter.
- Assets in `public/assets/blender/phase12/`:
  - `helix_containment_gate.glb` — 588,948 bytes
  - `choir_acoustic_organ.glb` — 685,380 bytes
  - `curator_archive_monolith.glb` — 487,608 bytes
  - `matron_surgical_pod.glb` — 467,660 bytes
- All four files carry valid `glTF` v2 headers and matching declared lengths.
- Runtime import: `BLENDER_CHAPTER_ASSETS` maps each asset to its chapter and `ArenaSceneRenderer.loadChapterAssets()` loads it with `GLTFLoader` into the chapter's preallocated group. The async callback is ignored after renderer disposal; loaded meshes are included in the existing scene-graph disposal path.
- The imports are static environmental hero props. Existing procedural boss rigs remain the animated combat actors, so no imported mesh changes hitboxes or attack ownership.
- Browser verification: every GLB returned HTTP 200 with the byte lengths above; zero console/page errors. Imported assets were visually inspected in Chapters I–IV.
- Evidence: `screenshots/phase12-blender/after/` plus `asset-load-report.json`.
- Final checks after import: `npm run lint` passed, `npm run build` passed, and the simulation suite passed **108/108**. The production build contains all four GLBs under `dist/assets/blender/phase12/`.
- These asset changes and the import code were not committed or pushed in this addendum.

# 📜 Changelog — AFTERFRAME: THE LAST LOOP

All notable milestones and release-hardening phases for **AFTERFRAME: THE LAST LOOP** are documented in this file.

---

## [`0.23.4`] — Phase 23.4, 23.4.1 & 23.4.2 Final Release Reconciliation & Closure (2026-11-08)

### 🛡️ Release Closure, Save V2 & Renderer Hardening
- **Non-Mutating Save V2 Version Validation (`src/game/simulation.ts`, `src/game/simulation.test.ts`)**: Validated that `parseAndApplyCampaignProgress` checks schema version (`undefined`, `1`, or `2`) before mutating `world.run`, rejecting `version: 3`, `4`, `0`, `-1`, `'2'`, and `null` with zero state mutation, and inferring V1 vault weapon unlocks across `activeCampaign.chapter` and `pendingNextChapter` (`Phase 23.3-B1`).
- **Stale Enemy Rig Disposal & 10-Cycle Soak (`src/game/renderer.ts`, `src/game/asset-lifecycle.test.ts`)**: `reconcileEnemyRigs(world)` disposes and deletes stale `EnemyRig` instances across wave, boss, and chapter transitions; verified flat resource plateau across a 10-cycle browser soak (`geometries: 384`, `textures: 13`, `programs: 10`, `activeEnemyRigCount: 3`) (`Phase 23.4-C1`).
- **Accessibility & HUD Parity (`src/components/StatusModal.tsx`, `src/components/TitleScreen.tsx`)**: Added `aria-pressed` to `modal-setting-mute` and `modal-setting-hints` toggles and aligned `[Q / L] Parry (+35 Flux)` in `TitleScreen` (`Phase 23.4-A1`).
- **CCGS Registry & Documentation Reconciliation (`design/registry/entities.yaml`, `README.md`, `design/gdd/game-concept.md`)**: Synchronized all `31` canonical entities (`sera_venn` `6.8m/s` move / `0.28s` parry, `chrono_edge` `46/64` heavy damage, `edge_harmonic_conductor` `3` fragments, `rail_phase_capacitor` `2` fragments, `bastion` `150` HP, `curator_decoy` `30` stagger, enemy designations, and chapter IDs) with `GAME_CONFIG` (`Phase 23.4-E1`, `Phase 23.4.2`).
- **Repository Hygiene & Documentation Consolidation**: Removed `109` temporary/debug/duplicate files (`683 -> 581` tracked files), archived `4` intermediate plans to `docs/archive/superpowers/`, and published `docs/PHASE_23_4_1_RELEASE_CLOSURE.md`, `docs/REPOSITORY_HYGIENE_REPORT.md`, `docs/MARKDOWN_STYLE_GUIDE.md`, `docs/README.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `CHANGELOG.md`.

---

## [`0.23.3`] — Phase 23.3 Adversarial Verification & Performance Profiling (2026-11-06)

- Replaced per-frame `syncEnemyRigs(world)` in `ArenaSceneRenderer.updateAndRender` with allocation-free `reconcileEnemyRigs(world)` and independent software WebGL (`SwiftShader`/`llvmpipe`) detection (`Phase 23.3-A3`).
- Enforced exact UTF-8 byte ceiling (`MAX_SAVE_JSON_BYTES = 262,144`) via `TextEncoder`, completed Save V1 -> V2 migration with 5-cycle idempotency (`Phase 23.3-B1`), and enforced weapon unlock ownership across all campaign transitions (`Phase 23.3-B2`).
- Added post-`dispose()` synthesis guard in `SoundEngine` (`Phase 23.3-E2`), full 9-slot `THREE.Texture` disposal in `disposeMeshResources` (`Phase 23.3-D1`), and `invertY` keyboard pitch (`Phase 23.3-E1`).

---

## [`0.23.1` / `0.23.2`] — Phase 23.1 & 23.2 Product Completion & Deep Audit (2026-11-05)

- Fixed `switchPlayerWeapon` residual `chargeTime`/`isEmpoweredHeavy` reset (`Phase 23.1-A`), Practice 4-weapon `[Tab]`/`[Z]` cycling (`Phase 23.2-A`), and `KeyL` parry shortcut (`Phase 23.1-B`).
- Added `sfxGain` and `musicGain` sub-buses feeding `masterGain` in `SoundEngine` (`Phase 23.1-C`, `Phase 23.2-D`) and graceful WebGL/2D canvas fallback in `ArenaSceneRenderer` (`Phase 23.1-D`).
- Enabled `"strict": true` in `tsconfig.json`, synchronized `bun.lock`, and added `.github/workflows/ci.yml`.

---

## [`0.23.0`] — Phase 21.1, 22 & 23 Arsenal, Warden Prime & Cross-System Combat (2026-11-04)

- Expanded arsenal to **4 weapons** (`chrono_edge`, `pulsecaster`, `phase_rail`, `grav_breaker`) and **8 upgrades** backed by a deterministic 18-Fragment economy.
- Added **AEGIS-12 · Phalanx Sentinel** (`aegis_sentinel`), **WEAVER-06 · Phase Suppressor** (`null_weaver`), and Chapter V optional Sovereign boss **WARDEN PRIME** (`warden-prime`, `440 HP`).
- Integrated **Claude Code Game Studios (`v1.2.0`)** under `.claude/`, `CLAUDE.md`, and `project.yaml`.

---

## [`0.20.1`] — Phases 1–20.1 Core Campaign, Echo Rig & Three Endings (2026-10-25 — 2026-11-03)

- Built the deterministic 60 Hz simulation (`src/game/simulation.ts`), Three.js `ArenaSceneRenderer` + Phase 12 Blender GLB landmarks, 6-chapter campaign (`prologue` through `chapter-5`), 4 initial bosses (`helix-04`, `the-choir`, `the-curator`, `matron-v`), and 3 Chronicle Loom endings (`silence`, `witness`, `continuity`).

# 📜 Changelog — AFTERFRAME: THE LAST LOOP

All notable milestones and releases for **AFTERFRAME: THE LAST LOOP** are documented in this file.

---

## [`1.0.0` / `0.23.4`] — Final Release & Documentation Consolidation (2026-11-10)

### 🧹 Final Repository Cleanup & Documentation Suite
- **Purged Internal Phase Audit & Unused Engine Files**: Removed `78` internal development audit logs (`docs/AFTERFRAME_PHASE11..23_*.md`, `docs/archive/`, `production/polish/`, `production/qa/`) and unused engine reference templates (`docs/engine-reference/godot/`, `unity/`, `unreal/`), keeping only the active Three.js reference (`docs/engine-reference/threejs/VERSION.md`) and canonical product documentation.
- **Unified Product Documentation Suite (`docs/`)**: Published clean, authoritative technical and gameplay references in [`docs/README.md`](docs/README.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/GAMEPLAY_GUIDE.md`](docs/GAMEPLAY_GUIDE.md), and [`docs/STORY_BIBLE.md`](docs/STORY_BIBLE.md), 100% synchronized with `src/game/config.ts` and `design/registry/entities.yaml`.

### 🛡️ Save V2, Renderer Lifecycle & Accessibility Hardening
- **Non-Mutating Save V2 Validation (`src/game/simulation.ts`, `src/game/simulation.test.ts`)**: Enforced `MAX_SAVE_JSON_BYTES = 262_144` (`256 KB`) UTF-8 byte ceiling via `TextEncoder`, validated schema versions (`undefined`, `1`, or `2`) before mutating `world.run`, ensured 5-cycle V1 -> V2 migration idempotency, and enforced weapon unlock ownership across all campaign states.
- **Stale Enemy Rig Disposal & 10-Cycle Soak (`src/game/renderer.ts`, `src/game/asset-lifecycle.test.ts`)**: `reconcileEnemyRigs(world)` disposes and deletes stale `EnemyRig` instances and all 9 texture slots (`disposeMeshResources`) across wave, boss, and chapter transitions; verified flat GPU resource counters across a 10-cycle browser soak (`geometries: 384`, `textures: 13`, `programs: 10`, `activeEnemyRigCount: 3`).
- **Accessibility & Audio Bus Hardening (`src/game/audio.ts`, `src/game/reduced-motion.test.ts`, `src/components/StatusModal.tsx`)**: Added `sfxGain` and `musicGain` sub-buses feeding `masterGain`, post-`dispose()` synthesis guards, OS `prefers-reduced-motion` inheritance, `KeyL` parry shortcut, `invertY` keyboard pitch, and `aria-pressed` semantics across all modal toggles.

---

## [`0.23.0`] — Arsenal Expansion, Enemy Roster & Warden Prime (2026-11-04)

- Expanded arsenal to **4 weapons** (`chrono_edge`, `pulsecaster`, `phase_rail`, `grav_breaker`) and **8 modular upgrades** backed by a deterministic `18`-Fragment campaign economy.
- Added **AEGIS-S4 · Phalanx Sentinel** (`aegis_sentinel`), **WEAVER-N8 · Phase Suppressor** (`null_weaver`), and Chapter V optional Sovereign boss **WARDEN PRIME** (`warden-prime`, `440 HP`).
- Integrated **Claude Code Game Studios (`v1.2.0`)** under `.claude/`, `CLAUDE.md`, and `project.yaml`.

---

## [`0.20.1`] — Core Campaign, Chrono Echo Rig & Three Endings (2026-11-03)

- Built the deterministic `60 Hz` simulation (`src/game/simulation.ts`), Three.js `ArenaSceneRenderer` + Phase 12 Blender GLB landmarks, 6-chapter campaign (`prologue` through `chapter_5_loom`), 4 sector bosses (`helix-04`, `the-choir`, `the-curator`, `matron-v`), and 3 Chronicle Loom endings (`silence`, `witness`, `continuity`).

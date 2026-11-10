# 🏗️ AFTERFRAME: THE LAST LOOP — Technical Architecture

**AFTERFRAME: THE LAST LOOP** is a deterministic, single-player 3D sci-fi action-puzzle RPG built with **React 19**, **TypeScript 7.0 (Strict)**, **Vite 8**, **Three.js 0.186.1**, and the **Web Audio API**.

The codebase enforces a strict separation between **pure deterministic simulation (`src/game/simulation.ts`)** and **read-only presentation consumers (`src/game/renderer.ts`, `src/game/audio.ts`, `src/App.tsx`, `src/components/*`)**.

---

## 1. Repository & Module Topology

```text
src/
├── main.tsx                     # Application bootstrap & React 19 root mount
├── App.tsx                      # Fixed-timestep game loop orchestration, settings & modal routing
├── index.css                    # Tailwind CSS v4 styling & industrial sci-fi HUD theme
├── components/
│   ├── TitleScreen.tsx          # Main Menu, Chapter Select, Boss Practice & Controls overview
│   ├── GameHud.tsx              # Real-time combat HUD, Boss telemetry, Minimap & Touch deck
│   └── StatusModal.tsx          # Armory Upgrades, Sector Map, Codex, Settings & Loom Endings
└── game/
    ├── types.ts                 # Authoritative TypeScript interfaces, IDs & Save Schema V2 types
    ├── config.ts                # Single source of truth (GAME_CONFIG) for all combat & campaign tuning
    ├── simulation.ts            # Pure deterministic 60 Hz simulation engine & Save V2 persistence
    ├── renderer.ts              # Three.js ArenaSceneRenderer, GLB loader & GPU lifecycle manager
    ├── models.ts                # Procedural 3D character, weapon, enemy & Sovereign Boss rigs
    ├── audio.ts                 # Zero-asset procedural Web Audio API synthesizer (SoundEngine)
    ├── input.ts                 # Unified Keyboard/Mouse, Touch & CameraSettings manager
    ├── simulation.test.ts       # 159 unit/integration tests for combat, Echoes, bosses & Save V2
    ├── campaign-release.test.ts # 23 end-to-end campaign & 3-ending verification tests
    ├── reduced-motion.test.ts   # 40 accessibility, reduced-motion, input & audio lifecycle tests
    └── asset-lifecycle.test.ts  # 12 Three.js GPU resource, GLB hydration & rig disposal tests
```

---

## 2. Deterministic 60 Hz Simulation (`src/game/simulation.ts`)

- **Fixed-Timestep Contract:** `stepWorld(world, input, dt)` advances `WorldState` in deterministic `dt = 1 / 60` s steps. Presentation layers never mutate `WorldState` directly.
- **Chrono Rig Recording & Replay (`[T]` / `[Y]`):**
  - Captures `0.35s – 8.0s` (up to `500` frames at `60 Hz`) of Sera's movement, dodges, parries, and weapon actions (`light`, `heavy`, `pulse_shot`, `pulse_charged_shot`, `rail_shot`, `rail_charged_shot`, `breaker_slam`, `breaker_charged_slam`).
  - Manifests an independent cyan **Echo** that replays the recorded trajectory with exact frame timing.
  - **Echo Non-Duplication Invariant:** Echo contacts prime **Resonance** (`1.1s` window, `2.2s` with `edge_harmonic_conductor`), depress puzzle plates, synchronize Choir harmonic pylons, and serve as **Temporal Relay (`[V]`)** and **Echo Collapse (`[X]`)** anchors, but never deal direct HP damage or duplicate Memory Fragments.

---

## 3. 3D Rendering & GPU Resource Management (`src/game/renderer.ts`, `src/game/models.ts`)

- **WebGL & Canvas2D Fallback (`ArenaSceneRenderer`):** Initializes a hardware-accelerated `THREE.WebGLRenderer` with automatic fallback to an accessible 2D tactical canvas and software-renderer (`SwiftShader`/`llvmpipe`) telemetry detection.
- **Hybrid Procedural + Blender GLB Pipeline:**
  - **Procedural Articulated Rigs (`src/game/models.ts`):** Sera Venn, Chrono Echoes, all 8 enemy archetypes, and all 5 Sovereign Bosses are constructed from articulated `THREE.Group` hierarchies with real-time telegraph shaders and phase animations.
  - **Phase 12 Blender GLB Landmarks (`public/assets/blender/phase12/*.glb`):** Asynchronous `GLTFLoader` hydrates 4 bespoke architectural centerpieces (`helix_containment_gate.glb`, `choir_acoustic_organ.glb`, `curator_archive_monolith.glb`, `matron_surgical_pod.glb`, totaling `2.23 MB`).
- **Allocation-Free Frame Loop & Disposal:**
  - `reconcileEnemyRigs(world)` reconciles active enemies each frame and immediately disposes stale `EnemyRig` geometries, materials, and 9 texture slots (`disposeMeshResources`) across wave and chapter transitions.
  - Verified across a 10-cycle browser chapter soak with flat renderer counters (`geometries: 384`, `textures: 13`, `programs: 10`, `activeEnemyRigCount: 3`).

---

## 4. Procedural Web Audio Architecture (`src/game/audio.ts`)

- **Sub-Bus Routing:** `SoundEngine` routes procedural combat/UI synthesis through `sfxGain -> masterGain` and harmonic/boss stingers through `musicGain -> masterGain`.
- **Idempotent Disposal:** `SoundEngine.dispose()` disconnects all gain nodes, closes the `AudioContext`, sets `disposed = true`, and blocks any subsequent synthesis calls.

---

## 5. Save Schema V2 & Security Boundaries (`src/game/simulation.ts`)

- **Authoritative Schema Version:** `CAMPAIGN_SAVE_VERSION = 2` (`afterframe_campaign_progress_v1`).
- **Byte Ceiling Guard:** Rejects payloads exceeding `MAX_SAVE_JSON_BYTES = 262_144` (`256 KB` UTF-8 bytes via `TextEncoder`) before invoking `JSON.parse`.
- **Non-Mutating Version & Ownership Validation:** Validates schema version (`undefined`, `1`, or `2`) before mutating `world.run`, migrates legacy V1 saves idempotently to V2, rejects unknown versions (`3`, `4`, `0`, `-1`), caps array scans at `MAX_SAVE_ARRAY_SCAN = 256`, and enforces weapon unlock ownership across all campaign states.

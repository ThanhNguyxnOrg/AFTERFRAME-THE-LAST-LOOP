# Polish, Performance & Accessibility Full Report — AFTERFRAME: THE LAST LOOP (Phase 23.1)

- **Date:** 2026-11-05
- **Version:** `0.23.1`
- **Specialists:** `performance-analyst`, `technical-artist`, `ui-programmer`, `accessibility-specialist` (CCGS `v1.2.0` `/perf-profile` + `/team-polish`)

---

## 1. Frame Budget & Hot-Path Allocation Audit (Measured in Headless Chromium via `playwright-cli`)

| Scenario / Subsystem | Target Budget | Measured (`1440x900`, `http://localhost:3000`) | Status |
|---|---:|---:|---|
| Fixed-Timestep Simulation — Prologue / Calibration Bay | `< 1.5 ms` | `0.268 ms/step` (`6.70 ms` / 25 steps) | **PASS** |
| Fixed-Timestep Simulation — Multi-Enemy Combat (`tactical_temporal_disruption`, 5 enemies) | `< 1.5 ms` | `0.552 ms/step` (`13.80 ms` / 25 steps) | **PASS** |
| Fixed-Timestep Simulation — Echo Recording & Playback | `< 1.5 ms` | `0.220 ms/step` (`5.50 ms` / 25 steps) | **PASS** |
| Fixed-Timestep Simulation — `helix-04` / `the-choir` / `the-curator` / `matron-v` / `warden-prime` | `< 1.5 ms` | `0.144 – 0.500 ms/step` | **PASS** |
| Fixed-Timestep Simulation — Chapter V Chronicle Loom & Ending Visuals (`witness`) | `< 1.5 ms` | `0.104 ms/step` (`2.60 ms` / 25 steps) | **PASS** |
| Steady-State Rendered Frame (`updateAndRender` across Prologue, Combat, Echo, `helix-04`, `warden-prime`, Loom) | `< 16.6 ms` | `4.50 – 7.90 ms` (`12.10 – 17.10 ms` on `the-curator`/`matron-v`; `76.80 ms` on `the-choir` CPU SwiftShader) | **PASS** |
| Per-Frame Heap Allocations in Hot Loop | `0` new `THREE.Vector3`/`Color`/`Matrix4`/`Object3D` | `0` (module-scoped scratch objects reused) | **PASS** |

### Key Memory & GPU Lifecycle Protections
1. **Single-Batch Chapter GLB Hydration (`src/game/renderer.ts`):** `loadChapterAssets()` runs once in `ArenaSceneRenderer` constructor when `webglAvailable === true`; chapter switches toggle group visibility without re-fetching or re-parsing GLBs (`verified in src/game/asset-lifecycle.test.ts`).
2. **Deduplicated GPU Resource Disposal (`src/game/renderer.ts`):** `disposeMeshResources()` collects unique `BufferGeometry` and `Material` instances into `Set`s and disposes each exactly once, including late-arriving `GLTFLoader` callbacks after unmount, and `ArenaSceneRenderer.dispose()` is idempotent and cleans up `webglcontextlost`/`webglcontextrestored` listeners.
3. **Graceful WebGL & 2D Canvas Context Fallback (`src/game/renderer.ts`, `src/game/models.ts`):** If `new THREE.WebGLRenderer(...)` or `canvas.getContext('2d')` fails, `ArenaSceneRenderer` sets `webglAvailable = false`, skips GLB network fetches, renders `[data-testid="webgl-fallback-banner"]` / `[data-testid="webgl-fallback-notice"]`, and keeps deterministic simulation and React UI operational.
4. **Web Audio Sub-Bus & Master Gain Routing (`src/game/audio.ts`):** All procedural synth nodes route through `sfxGain` (`sfxVolume`) or `musicGain` (`musicVolume`) into `masterGain` (`masterVolume`), with idempotent `SoundEngine.dispose()` closing `AudioContext` on unmount.

---

## 2. UX & Accessibility Verification

- **Reduced Motion (`prefers-reduced-motion: reduce` + Toggle):** Automatically inherits OS preference when no override is saved, zeroes camera trauma shake (`world.cameraTrauma`), freezes title camera orbit, and scales ambient rotor/pulse oscillation to `15%` without altering deterministic simulation (`verified by 36 tests in src/game/reduced-motion.test.ts`).
- **Keyboard & Touch Parity:** Full keyboard shortcuts (`WASD`, `LMB/F/J` Light, `RMB/E/K` Heavy, `Space/Shift` Dodge, `Q/L` Parry, `1–4`/`Tab/Z` Weapon Switch across all 4 weapons, `T/Y/V/C` Echo Rig, `G` Gravity Pin, `X` Echo Collapse, `I` Interact, `U` Upgrade Bench, `M` Sector Map) and responsive mobile touch controls (`390x844`, `430x932`).
- **Audio & Visual Settings:** Independent Master, Music/Stinger (`musicVolume`), and Combat SFX (`sfxVolume`) sliders (`0%–100%`), Camera Shake toggle, Screen Flash & Vignette (`screenEffects`) toggle (controlling both damage flashes and `[data-testid="low-integrity-vignette"]`), and Subtitles toggle in both Title and Pause modals.

# 📜 Changelog — AFTERFRAME: THE LAST LOOP

All notable changes and official releases for **AFTERFRAME: THE LAST LOOP** are documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [`1.0.0`] — Official Release

### 🌐 Public HTML5 Playtest
- **Live browser build**: The public HTML5 playtest is available at [thanhnguyxn.itch.io/afterframe-the-last-loop](https://thanhnguyxn.itch.io/afterframe-the-last-loop). The itch.io storefront remains marked **In development**; public playtest availability is not presented as a final-release status.
- **First verified Butler upload**: [GitHub Actions run #7](https://github.com/ThanhNguyxnOrg/AFTERFRAME-THE-LAST-LOOP/actions/runs/42835952704) passed both package/browser verification and publish jobs, then pushed the verified ZIP to the `html5` channel.
- **Storefront captures**: Six existing in-engine chapter screenshots cover the Prologue and Chapters I–V under `screenshots/`. They are documented for separate upload to the itch.io screenshot gallery; repository images do not automatically sync to the storefront.
- **Player onboarding**: The public README links directly to the playable build and the detailed keyboard/mouse gameplay guide.

### ⚔️ Complete Campaign, Arsenal & Sovereign Bosses
- **Six-Sector Story Campaign**: Full progression from **Prologue: Wake** (*Calibration Bay 04*) through **Chapter V: The Last Loop** (*The Chronicle Loom*) with three canonical endings (**Silence**, **Witness**, and **Continuity**).
- **Four-Weapon Temporal Arsenal**:
  - **Chrono Edge** (`chrono_edge`) — Balanced 3-hit melee blade with cleave and Resonance Convergence strike.
  - **Pulsecaster** (`pulsecaster`) — Rapid energy sidearm with active thermal dissipation.
  - **Null-Point Rail Lance** (`phase_rail`) — High-velocity piercing lance with `1.75x–2.00x` exposed boss core multiplier.
  - **Grav-Breaker Maul** (`grav_breaker`) — Heavy seismic maul with `85%–100%` frontal shield penetration.
- **Eight Modular Weapon Upgrades**: Deterministic `18`-Fragment campaign economy across sector bosses and hidden vaults.
- **Chrono Rig & Tactical Skills**: 60 Hz trajectory recording (`[T]`), autonomous **Echo** manifestation (`[Y]`), **Temporal Relay** warp (`[V]`), **Gravity Pin** singularity (`[G]`), and **Echo Collapse** detonation (`[X]`).
- **Eight Enemy Archetypes & Five Multi-Phase Sovereign Bosses**: **HELIX-04**, **THE CHOIR**, **THE CURATOR**, **MATRON-V**, and **WARDEN PRIME**.

### 🎨 Engine, Audio, Persistence & Accessibility
- **Deterministic 60 Hz Simulation (`src/game/simulation.ts`)**: Strict separation between pure gameplay simulation and read-only presentation layers (`Three.js`, `Web Audio API`, and `React 19`).
- **Hybrid 3D Rendering (`src/game/renderer.ts`, `src/game/models.ts`)**: Articulated procedural character/boss rigs paired with bespoke Blender GLB architectural landmarks, automatic GPU resource disposal, and graceful WebGL/Canvas2D fallback.
- **Procedural Web Audio Synthesizer (`src/game/audio.ts`)**: Zero-asset real-time sound synthesis with dedicated `masterGain`, `sfxGain`, and `musicGain` sub-buses.
- **Hardened Save Schema V2 (`localStorage`)**: Automatic V1 -> V2 migration, strict `256 KB` UTF-8 payload guard, weapon ownership validation, and chapter checkpoint persistence.
- **Accessibility & Multi-Input Support**: OS `prefers-reduced-motion` integration, independent camera shake and screen-flash toggles, full keyboard/mouse remapping support, and responsive mobile touch controls.

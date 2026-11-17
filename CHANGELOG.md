# 📜 Changelog — AFTERFRAME: THE LAST LOOP

All notable changes and official releases for **AFTERFRAME: THE LAST LOOP** are documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [`1.9.0`] — Chrono Rig Chassis, Dynamic Arena Synergies & Tactical Polish

### ⚙️ Chrono Rig Chassis Modules & Salvage Economy
- **3-Slot Rig Customization (`src/game/rig-progression.ts`)**: Added **6** trade-off-balanced **Chrono Rig Chassis Modules** across **Chrono Core** (*Chrono Spool Mk.II*, *Resonance Focus Prism*), **Chassis & Recovery** (*Reactive Aegis Plating*, *Kinetic Flux Dynamo*), and **Tactical Harness** (*Capacitor Salvage Harness*, *Surge Overclock Coil*), accessible from both the **Title Armory Drawer** and the **Pause Upgrade Bench**, and persisted in **Save Schema V2** with `125 HP` checkpoint integrity preservation.
- **Late-Game Override Salvage**: Optional override conduits in **Chapter IV** (*Quarantine Override*) and **Chapter V** (*Temporal Anchor*) now yield `+1` bonus **Memory Fragment** each (`+2` total) while keeping the core `18`-Fragment campaign progression intact.

### 🗺️ Dynamic Arena Hazards, Flux Pools & Interactive Sector Map
- **Charged Flux Pools**: Shattering a **Chrono-Capacitor** now leaves behind a `3.4m` **Charged Flux Pool** for `7.0s` (`+9 Flux/s`, plus `+3.5 Integrity/s` repair with *Kinetic Flux Dynamo*), rendered in 3D and on the tactical radar.
- **Temporal Thread Hazard Mastery**: Dodging or Phase-Relaying cleanly through an active/warning **Timed Energy Passage** triggers **Temporal Thread** (`+14 Flux`, `1.4s Mobility Surge`, `+0.35 Adrenaline`, plus `+8 Integrity` with *Field Salvager*).
- **Interactive Sector Schematic & 3D Waypoints**: Click regions, routes, hazards, boost pads, capacitors, or conduits in the **Sector Map `[N]`** to open the **Tactical Node Inspector** and project a live **3D Ground Beacon** & corner radar vector that auto-clears upon arrival (`< 2.3m`).

### 🎯 3D Target Readability, Adaptive Soundscape & UI Craft
- **Diegetic 3D Lock-On Ground Ring (`computeLockOnGroundVisuals`)**: Added a zero-allocation floor-space targeting ring + counter-rotating diamond reticle directly beneath the locked hostile, dynamically scaling to enemy/boss radius and shifting cyan (Locked) → cyan-bright (Resonance Marked) → crimson (Telegraphing) → gold (Staggered / Core Exposed).
- **Resonance Convergence Tether Surge (`computeEchoTetherVisuals`)**: Sera's active Echo tether now thickens (`2.25×`) and surges gold (`#fde047`) whenever a Resonance Mark is primed and convergence-ready.
- **Procedural Combat Pulse (`computeAmbientPulseVoice`, `SoundEngine.updateAmbientPulse`)**: Added chapter-tuned harmonic bass/pad/shimmer pulses routed cleanly through the independent `musicGain` bus, accelerating tempo during active boss battles, Phase II transitions, Core Exposed windows, and high Adrenaline Sync tiers while honoring Mute, Pause, Silence ending, and `dispose()`.
- **StatusModal Tactical Icons & Rank Breakdown**: Replaced unicode emojis in `StatusModal` section tabs with crisp custom inline `<svg>` instruments and added score + hitless telemetry to the Combat Rank card.

## [`1.8.0`] — Overdrive Aura, Boss Phase Lighting & Title Framing

### ⚡ Combat Readability & Reactive Arena Lighting
- **3D Adrenaline Overdrive Aura (`computeChronoAuraVisuals`)**: Sera's dorsal Chrono Rig rings, accent emitters, and a ground-level additive Chrono Sync Halo scale dynamically in color, intensity, and rotation velocity across Sync Levels `0–5`, Riposte, Chrono Slip, Recording, and Kinetic Boost surges.
- **Echo Hologram Shimmer**: Active Chrono Echoes modulate ground ripple and hologram phase opacity cleanly for unmistakable foreground separation in dense multi-target encounters.
- **Dynamic Boss Phase II & Core Exposed Lighting (`computeArenaMoodModulation`)**: Overhead volumetric floodlight cones, rim lighting, and Chronicle Loom emitters escalate smoothly during Warden Phase II transitions, Core Exposed windows, and Resonance Convergence detonations.
- **Title Framing & Control Clarity**: Compacted the desktop Operator Briefing card to keep Nadir-9 and Sera prominent in the upper viewport, and replaced ornamental footer text with live tactical Chrono keybind reminders.

## [`1.7.0`] — 3dviz-pro-max Map Overhaul & Streamlined Tactical HUD

### 🎨 3D Visual Architecture & HUD Consolidation
- **GLSL Orbital Sky Dome & Visual Palette (`visual-palette.ts`)**: Per-chapter sky gradients, nebula tints, ground-bounce hemisphere lighting, vertical Vertex AO on walls/pillars/plinths, N/S/E/W fiber raceways, overhead gantry booms, and beveled console pedestals with translucent hologram glass.
- **4-Corner Tactical HUD**: Consolidated peripheral threat cues, corner radar, compact Echo deck, and weapon deck to maximize unobstructed center combat space.

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

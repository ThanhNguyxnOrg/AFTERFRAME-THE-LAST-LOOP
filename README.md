<div align="center">

<img src="assets/branding/afterframe-mark.svg" alt="AFTERFRAME: THE LAST LOOP emblem" width="132" />

# AFTERFRAME: THE LAST LOOP

### The future is broken. The loop remembers.

**A third-person, sci-fi action RPG set inside the fractured research station Nadir-9.**

[![Status: In Development](https://img.shields.io/badge/status-in%20development-56cfe1?style=for-the-badge)](#project-status)
[![Genre: Sci-Fi Action RPG](https://img.shields.io/badge/genre-sci--fi%20action%20RPG-8b9dff?style=for-the-badge)](#the-game)
[![Engine: Three.js](https://img.shields.io/badge/3D-Three.js-black?style=for-the-badge&logo=threedotjs)](#technology)
[![Platform: Web](https://img.shields.io/badge/platform-web-4c9aff?style=for-the-badge&logo=googlechrome)](#getting-started)

[Gameplay](#gameplay-systems) · [Campaign](#campaign) · [Technology](#technology) · [Getting Started](#getting-started) · [Documentation](#project-documentation)

</div>

---

> [!IMPORTANT]
> **AFTERFRAME is an active work in progress.** The public repository is the source of truth for what is currently published. Features under development or present only in unreleased local work are not described as shipped functionality here.

## The game

Reality is breaking into repeating fragments around **Nadir-9**, an orbital research facility built to study and manipulate temporal phenomena. Every failed experiment leaves an afterimage. Every loop preserves a different piece of the truth.

You are **Sera Venn**. With the Chrono Rig and the traces left by previous iterations, fight through hostile facilities, solve temporal mechanisms, recover lost records, and uncover what the system is trying to preserve.

*The past is not gone. It is still running.*

## Gameplay systems

### Real-time combat and four-weapon arsenal

Combat is built around deliberate melee and ranged engagements, readable enemy telegraphs, defensive parry/dodge timing, stagger windows, and weapon feedback.

| Weapon | ID | Availability | Combat role |
|---|---|---|---|
| **Chrono Edge** | `chrono_edge` | Initial campaign loadout & Practice mode | Close-quarters melee blade with 3-hit cleave combos, charged heavy attacks, and Flux generation on contact |
| **Pulsecaster** | `pulsecaster` | Initial campaign loadout & Practice mode | Gauntlet-mounted ranged energy sidearm with rapid pulse bolts, charged lances, and thermal heat management |
| **Null-Point Rail Lance** | `phase_rail` | Unlocked via secret-vault progression in Campaign (available in Practice mode) | Long-range precision rail weapon with piercing charged lances and a `1.75x` weakpoint multiplier against exposed boss cores |
| **Grav-Breaker Maul** | `grav_breaker` | Unlocked via secret-vault progression in Campaign (available in Practice mode) | Heavy seismic melee maul that penetrates `85%` of frontal directional shields on guarded enemies |

A fresh campaign begins with **Chrono Edge** and **Pulsecaster**, while **Null-Point Rail Lance** (`phase_rail`) and **Grav-Breaker Maul** (`grav_breaker`) are unlocked through secret-vault discovery during campaign progression (or selectable immediately in Practice mode).

#### Weapon upgrades (8 modular modifications)

Each weapon supports two purchasable modifications at the Upgrade Bench (using recovered Memory Fragments), with one active modification equipped per weapon and persisted in Save v2:

| Weapon | Upgrade 1 | Upgrade 2 |
|---|---|---|
| **Chrono Edge** | `edge_breaker_cleave` (Breaker Cleave) | `edge_harmonic_conductor` (Harmonic Conductor) |
| **Pulsecaster** | `pulse_thermal_sink` (Thermal Sink) | `pulse_overcharge_condenser` (Overcharge Condenser) |
| **Null-Point Rail Lance** | `rail_null_aperture` (Null Aperture) | `rail_phase_capacitor` (Phase Capacitor) |
| **Grav-Breaker Maul** | `breaker_seismic_core` (Seismic Core) | `breaker_singularity_coil` (Singularity Coil) |

### Echo and temporal mechanics

The Chrono Rig records timestamped player movement and combat actions across all four weapons (`light`, `heavy`, `pulse_shot`, `pulse_charged_shot`, `rail_shot`, `rail_charged_shot`, `breaker_slam`, `breaker_charged_slam`) and spawns an independent Echo to replay them. Players can teleport to an active Echo via **Relay**, coordinate synchronized strikes to build **Resonance** and trigger **Convergence**, and solve multi-point temporal mechanisms.

### Enemies and boss encounters

The combat roster spans **7 standard mechanical enemy archetypes** (plus **1 Archive Decoy** in Chapter III) with distinct ranges, defensive profiles, attack telegraphs, and recovery windows:

- **BASTION-09 · Heavy Enforcer** (`bastion`) — Armored phalanx unit (`160` HP) with a directional frontal tower shield (`70%` frontal light mitigation) and overhead shock-maul slam.
- **SCRAPPER-X2 · Agile Striker** (`scrapper`) — Fast digitigrade melee striker (`85` HP) with lunging twin-blade scissor slashes.
- **SCOUT-07 · Ranged Recon Drone** (`scout`) — Hovering recon drone (`65` HP) firing telegraphed laser-sighted energy bolts.
- **SIPHON-03 · Temporal Extractor** (`siphon`) — Suppression unit (`75` HP) whose tether strike drains `22` Flux from the Chrono Rig.
- **ERASER-K9 · Track Purger** (`eraser`) — Anti-Echo unit (`85` HP) that emits a `5.5m` disruption field suppressing active Echo tracks for `2.2s`.
- **AEGIS-12 · Phalanx Sentinel** (`aegis_sentinel`) — Heavy phalanx shield-bearer (`135` HP) whose directional barrier mitigates standard frontal light attacks (`82%` mitigation), rewarding rear flanking or **Grav-Breaker Maul** shield penetration (`85%` base / `100%` with `breaker_seismic_core`).
- **WEAVER-06 · Phase Suppressor** (`null_weaver`) — Ranged phase-suppression caster (`80` HP) whose suppression bolts drain `18` Flux on hit and apply a `3.5s` Flux-regeneration dampening debuff (`0.5x` Flux gain).
- **FALSE ECHO — ARCHIVE DECOY** (`curator_decoy`) — Reconstructed holographic decoy (`45` HP) deployed during Chapter III (`THE CURATOR`).

Major boss encounters include five multi-phase bosses (`50%` HP Phase II transition threshold across the roster):

- **HELIX-04** (`helix-04`) — containment-focused heavy marshal encounter (Chapter I).
- **THE CHOIR** (`the-choir`) — harmonic / multi-node synchronization encounter (Chapter II).
- **THE CURATOR** (`the-curator`) — archive reconstructor and false-Echo decoy guardian (Chapter III).
- **MATRON-V** (`matron-v`) — clinical quarantine surgeon that threatens active Echo tracks (Chapter IV).
- **WARDEN PRIME** (`warden-prime`) — Sovereign Loom Architect featuring three telegraphed directives (`directive_lance`, `temporal_convergence_grid`, `sovereign_purge_wave`) and a Phase II overdrive transition at `50%` HP (`220 / 440` HP). Available as an optional confrontation in Chapter V and in Practice Boss mode.

Bosses use telegraphed attacks, phase progression, checkpoints, and dedicated encounter presentation.

### Exploration and discovery

The campaign combines environmental interactions, mission objectives, recoverable logs, Codex entries, secret areas, traversal routes, and chapter-specific landmarks. Exploration contributes to the player's understanding of Nadir-9 and the history of the loop.

## Campaign

The campaign is structured as a prologue followed by five chapters:

| Segment | Chapter identity | Focus |
|---|---|---|
| Prologue | **Wake** | Calibration, awakening, and the first signs of temporal instability |
| Chapter I | **A Place That Remembers** | Industrial containment and HELIX-04 |
| Chapter II | **The Garden of Repeated Days** | Harmonic systems and THE CHOIR |
| Chapter III | **The Archive That Answers** | Memory records and THE CURATOR |
| Chapter IV | **A System That Wants You Dead** | Clinical extraction and MATRON-V |
| Chapter V | **The Last Loop** | The Chronicle Loom, optional WARDEN PRIME confrontation, and final resolution |

In Chapter V (**The Last Loop**), reaching the Chronicle Loom supports two distinct paths:
- **Direct Resolution (Mandatory Path)**: Proceed directly to the Chronicle Loom terminal and select one of the three recorded ending directives without fighting an additional boss.
- **Optional Boss Confrontation**: Challenge **WARDEN PRIME** (`warden-prime`) inside the Loom chamber (with full boss checkpoint retry support on defeat), then return to the Chronicle Loom terminal upon victory to choose the final ending.

The Chronicle Loom supports three recorded ending choices:

- **Silence**
- **Witness**
- **Continuity**

Campaign progress, chapter unlocks, recovered records, weapon unlocks and upgrades, exploration discoveries, and ending state are persisted in the Save v2 storage schema.

## Project status

The public codebase contains the core game loop, browser-based 3D rendering, combat simulation, campaign progression, practice modes, four-weapon arsenal and eight upgrades, Echo interactions, exploration systems, and the documented multi-chapter narrative foundation.

Development remains active. Balance, presentation, content depth, accessibility, performance, and release readiness continue to evolve.

> [!NOTE]
> This README intentionally describes the functionality present in the public repository. Do not infer that a feature is released merely because it appears in a future roadmap, design document, local workspace, or unreleased development report.

## Technology

| Area | Technology |
|---|---|
| Application | React 19 (`^19.0.1`, resolved `19.2.5`) |
| Language | TypeScript (`^7.0.2` / `7.0.0-dev` via `@typescript/native-preview`, `"strict": true`) |
| Build and development server | Vite (`^8.3.0`, locked `8.3.4` in `bun.lock`) + esbuild (`^0.28.2`, locked `0.28.2` in `bun.lock`) |
| 3D rendering | Three.js (`^0.186.1`, locked `0.186.1` in `bun.lock`) + `@types/three` (`0.186.0`) |
| Styling | Tailwind CSS (`^4.3.3`, locked `4.3.3` in `bun.lock`) |
| UI motion | Motion (`^12.23.24`) |
| Icons | Lucide React (`^0.546.0`) |
| Tests | Node.js test runner via `tsx` (`^4.21.0`, locked `4.23.15` in `bun.lock`; `234` tests across 4 suites) |
| Package management | Bun lockfile (`bun.lock`) |

The game uses a custom simulation and rendering architecture. Gameplay state and deterministic simulation logic (`src/game/simulation.ts`, `src/game/config.ts`, `src/game/types.ts`) are kept separate from the Three.js presentation layer (`src/game/renderer.ts`, `src/game/models.ts`), procedural Web Audio synthesizer (`src/game/audio.ts` — routing tactical combat SFX through `sfxGain` and boss/chapter/ending harmonic stingers through `musicGain` under `masterGain`, without a continuous background music loop), and React HUD shell (`src/App.tsx`, `src/components/`).

### Development workflow tooling

The repository integrates an adapted configuration of [Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) (`v1.2.0`) under `.claude/`, `CLAUDE.md`, `project.yaml`, `design/`, and `production/`. This provides developer workflow automation, path-scoped engineering rules, and design/session documentation for contributors; it is development-time studio tooling rather than a runtime game engine or in-game feature.

## Getting started

### Prerequisites

- [Git](https://git-scm.com/)
- [Bun](https://bun.sh/) compatible with the repository's `bun.lock`
- A supported modern browser with WebGL enabled

### Install dependencies

```bash
git clone https://github.com/ThanhNguyxnOrg/AFTERFRAME-THE-LAST-LOOP.git
cd AFTERFRAME-THE-LAST-LOOP
bun install --frozen-lockfile
```

### Run the development server

```bash
bun run dev
```

Vite serves the application on port **3000** by default.

### Validate the project

```bash
# Run the automated test suites (234 tests across 4 files)
bun run test

# Run strict TypeScript validation
bun run lint

# Build the production bundle
bun run build
```

The corresponding package scripts are also available through npm when dependencies are installed with a compatible lockfile workflow.

## Project documentation

The `docs/` directory contains the project's design, narrative, engine reference, implementation, and verification history. Key entry points include:

- [Phase 23.4 Release Candidate Acceptance, Full Integration Verification & Final Product Hardening Report](docs/PHASE_23_4_RELEASE_CANDIDATE_ACCEPTANCE_REPORT.md)
- [Phase 23.3 Adversarial Verification, Performance Profiling & Release Readiness Report](docs/PHASE_23_3_AUDIT_AND_EXECUTION_REPORT.md)
- [Phase 23.1 Full Product Completion, Autonomous Audit & Release Hardening Report](docs/AFTERFRAME_PHASE23_1_RELEASE_COMPLETION_AND_AUDIT.md)
- [Phase 23 Autonomous Game Quality Audit & Evolution Report](docs/AFTERFRAME_PHASE23_AUTONOMOUS_GAME_QUALITY_AND_EVOLUTION.md)
- [Phase 22 Autonomous Game Quality Audit & Evolution Report](docs/AFTERFRAME_PHASE22_AUTONOMOUS_GAME_QUALITY_AND_EVOLUTION.md)
- [Phase 21.1 Acceptance and Release Synchronization Report](docs/AFTERFRAME_PHASE21_1_ACCEPTANCE_AND_RELEASE_SYNCHRONIZATION.md)
- [Claude Code Game Studios Integration Report](docs/AFTERFRAME_CLAUDE_CODE_GAME_STUDIOS_INTEGRATION.md)
- [Three.js Engine and Runtime Reference](docs/engine-reference/threejs/VERSION.md)
- [Brownfield Studio Adoption Plan](docs/adoption-plan-2026-11-04.md)
- [Story Bible](docs/AFTERFRAME_STORY_BIBLE.md)
- [Phase 20 Campaign Integration and Narrative Expansion](docs/AFTERFRAME_PHASE20_CAMPAIGN_INTEGRATION_AND_NARRATIVE_EXPANSION.md)
- [Phase 20.1 Delivery and Acceptance Closure](docs/AFTERFRAME_PHASE20_1_DELIVERY_AND_ACCEPTANCE_CLOSURE.md)
- [Phase 20.1.1 Release Synchronization Report](docs/AFTERFRAME_PHASE20_1_1_RELEASE_SYNCHRONIZATION_REPORT.md)
- [UX Audit](docs/AFTERFRAME_UX_AUDIT.md)

## Visual direction

AFTERFRAME's visual language combines deep-space blacks, fractured silver geometry, industrial architecture, and icy cyan light. The goal is to make temporal instability legible through environment design, lighting, motion, and combat feedback.

The project emblem is maintained at [assets/branding/afterframe-mark.svg](assets/branding/afterframe-mark.svg).

## Contributing and feedback

This is an actively developed independent project. Bug reports and constructive feedback are welcome.

When reporting a bug, include:

1. The expected behavior.
2. The actual behavior.
3. Reproduction steps.
4. Browser and operating-system details.
5. Relevant screenshots, console output, or logs.

Please do not include credentials, personal information, or private environment files in issues.

## License

No repository-level license has currently been published. Unless and until a license is added, assume that reuse, redistribution, and modification of the code and assets are not granted by default.

---

<div align="center">

**THE LOOP IS NOT OVER.**

<sub>AFTERFRAME: THE LAST LOOP · An independent game project in active development</sub>

</div>

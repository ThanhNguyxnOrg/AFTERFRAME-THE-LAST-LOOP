# Game Concept — AFTERFRAME: THE LAST LOOP

## Overview
**AFTERFRAME: THE LAST LOOP** is a third-person 3D sci-fi action-puzzle RPG where engineer **Sera Venn** fights through orbital station **Nadir-9** to find her missing sister **Lysa**, uncover the truth behind the **Chronicle Loom**, and confront the station AI **WARDEN**.

## Player Fantasy
Outsmarting an omniscient predictive AI by turning your own recorded past into a tactical squadmate—coordinating blade combos, piercing rail shots, seismic maul slams, parries, and spatial Relays with your own Echoes.

## Detailed Rules
- **Protagonist**: Sera Venn (`100` Integrity, `100` Flux, 1 active Echo track capacity).
- **Arsenal (4 Weapons, 8 Upgrades)**:
  - `chrono_edge`: 3-hit melee combo + charged heavy cleave (`edge_breaker_cleave`, `edge_harmonic_conductor`).
  - `pulsecaster`: Rapid energy bolts + piercing heavy lance (`pulse_thermal_sink`, `pulse_overcharge_condenser`).
  - `phase_rail`: Long-range precision dart + multi-target aperture lance with `1.75x` exposed-core multiplier (`rail_null_aperture`, `rail_phase_capacitor`).
  - `grav_breaker`: Heavy armor-shattering maul with `85%` frontal shield penetration (`breaker_seismic_core`, `breaker_singularity_coil`).
- **Campaign Structure (6 Chapters & 3 Endings)**:
  - Prologue: Wake (Calibration Bay 04)
  - Chapter I: A Place That Remembers (`helix-04`)
  - Chapter II: The Garden of Repeated Days (`the-choir`)
  - Chapter III: The Archive That Answers (`the-curator`)
  - Chapter IV: A System That Wants You Dead (`matron-v`)
  - Chapter V: The Last Loop — Chronicle Loom (`warden-prime` optional confrontation + `silence`, `witness`, `continuity` endings)

## Formulas
- **Aegis Sentinel Frontal Mitigation**: `finalDamage = round(baseDamage * 0.18)` (or `0.85` penetration when struck by `grav_breaker`).
- **Null Weaver Suppression Bolt**: Drains `18` Flux on hit and sets `fluxDampenedTimer = 3.5s` (`0.5x` passive and combat Flux gain).
- **Null-Point Rail Lance Weakpoint Multiplier**: `1.75x` base (`1.90x` with `rail_null_aperture`) against exposed Boss cores.
- **Boss Phase II Threshold Progression**: `phase2HpThreshold = 0.50 * maxHp` across all 5 bosses (`helix-04: 180/360`, `the-choir: 190/380`, `the-curator: 200/400`, `matron-v: 210/420`, `warden-prime: 220/440`), matching the `50%` segmented Phase II HUD divider in `src/components/GameHud.tsx`.

## Edge Cases
- Echo playback never duplicates Memory Fragments, Codex unlocks, or weapon unlocks.
- Practice Arena and Chapter Replay sessions snapshot and restore campaign state on exit.
- `fluxDampenedTimer` automatically recovers to `0` when expired without permanently disabling Flux regeneration.

## Dependencies
- `src/game/types.ts`, `src/game/config.ts`, `src/game/simulation.ts`, `src/game/renderer.ts`, `src/game/models.ts`

## Tuning Knobs
- Defined in `GAME_CONFIG` (`src/game/config.ts`).

## Acceptance Criteria
- All 209 deterministic unit/integration tests in `src/game/simulation.test.ts` pass (`npm test`).
- TypeScript validation (`npm run lint`) and production bundle (`npm run build`) succeed with zero errors.

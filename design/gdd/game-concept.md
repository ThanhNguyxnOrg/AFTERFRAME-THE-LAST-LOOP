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
  - `phase_rail`: Long-range precision dart + multi-target aperture lance with `1.75x` exposed-core multiplier (`rail_null_aperture`: `2.0x` exposed-core multiplier, `60/84` heavy damage, `0.42s` heavy recovery; `rail_phase_capacitor`: `-28%` heat (`20 vs 28`), `1.35x` cool rate, `+4` Flux per hit).
  - `grav_breaker`: Heavy 3-step armor-shattering maul with `85%` light / `95%` heavy base frontal shield penetration (`breaker_seismic_core`: `100%` frontal guard penetration, `+28%` stagger (`1.28x`), `+0.06s` recovery; `breaker_singularity_coil`: `360°` radial heavy slam, `+12%` heavy damage, `1.1s` micro-pin, `+0.6m` heavy range).
- **Campaign Structure (6 Chapters & 3 Endings)**:
  - Prologue: Wake (Calibration Bay 04)
  - Chapter I: A Place That Remembers (`helix-04`)
  - Chapter II: The Garden of Repeated Days (`the-choir`)
  - Chapter III: The Archive That Answers (`the-curator`)
  - Chapter IV: A System That Wants You Dead (`matron-v`)
  - Chapter V: The Last Loop — Chronicle Loom (`warden-prime` optional confrontation + `silence`, `witness`, `continuity` endings)

## Formulas
- **Aegis Sentinel Frontal Mitigation**: `finalDamage = round(baseDamage * 0.18)` (`82%` frontal light mitigation; `0.85` light / `0.95` heavy penetration when struck by `grav_breaker`, `1.00` with `breaker_seismic_core`).
- **Null Weaver Suppression Bolt**: Drains `18` Flux on hit and sets `fluxDampenedTimer = 3.5s` (`0.50x` passive and combat Flux gain).
- **Null-Point Rail Lance Weakpoint Multiplier**: `1.75x` base (`2.00x` with `rail_null_aperture`) against exposed Boss cores.
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
- All `234` deterministic unit/integration tests across the 4 test suites (`simulation.test.ts`, `campaign-release.test.ts`, `reduced-motion.test.ts`, `asset-lifecycle.test.ts`) pass (`bun run test`).
- TypeScript validation (`bun run lint`) and production bundle (`bun run build`) succeed with zero errors.

---
paths:
  - "src/game/simulation.ts"
  - "src/game/config.ts"
  - "src/game/types.ts"
  - "src/game/input.ts"
  - "src/gameplay/**"
---

# Gameplay & Deterministic Simulation Rules (AFTERFRAME: THE LAST LOOP)

- **Pure Deterministic Simulation**: `src/game/simulation.ts`, `src/game/config.ts`, and `src/game/types.ts` must NEVER import `three`, `react`, or DOM APIs (except `localStorage` inside guarded persistence helpers).
- **Config-Driven Balance**: ALL gameplay numbers (damage, stagger, cooldowns, telegraph durations, heat, Flux costs, weakpoint multipliers, frontal shield arcs, HP thresholds) MUST come from `GAME_CONFIG` in `src/game/config.ts` — NEVER hardcode magic numbers in `simulation.ts`.
- **Delta-Time Integration**: Use `dt` (in seconds) for all timers, movement vectors, projectiles, cooldowns, and regeneration rates (`fluxRegenPerSec * dt`).
- **4-Weapon Arsenal Invariants**:
  - `chrono_edge` and `pulsecaster` are unlocked by default in Campaign Prologue; `phase_rail` and `grav_breaker` unlock via Campaign secret vaults (or are pre-unlocked in Practice Arena).
  - `phase_rail` applies `exposedCoreDamageMultiplier` (`1.75x` base, `1.90x` with `rail_null_aperture`) against exposed Boss cores.
  - `grav_breaker` penetrates `85%` of frontal shields on `bastion` and `aegis_sentinel`.
- **Echo Recording & Replay**:
  - Every supported player attack (`light`, `heavy`, `pulse_shot`, `pulse_charged_shot`, `rail_shot`, `rail_charged_shot`, `breaker_slam`, `breaker_charged_slam`) must record its `weaponId` and `equippedUpgradeId` into `EchoClip` and replay deterministically without duplicating Fragment rewards or unlocks.
- **Enemy & Boss Telegraphs**:
  - Every enemy (`scout`, `scrapper`, `sniper`, `bastion`, `siphon`, `eraser`, `enforcer`, `aegis_sentinel`, `null_weaver`) and boss (`helix-04`, `the-choir`, `the-curator`, `matron-v`, `warden-prime`) attack must have an explicit `'telegraph'` -> `'attack'` -> `'recovery'` lifecycle.
  - Temporary debuffs (such as `null_weaver`'s `fluxDampenedTimer`) must tick down cleanly in `updatePlayer` and automatically recover when expired.

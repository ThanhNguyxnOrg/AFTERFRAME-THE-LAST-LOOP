# AFTERFRAME: THE LAST LOOP — PHASE 14
## Core Action RPG Weapon System: Chrono Edge + Pulsecaster

---

## 1. Executive Summary

Phase 14 upgrades **AFTERFRAME: THE LAST LOOP** from a single-weapon close-quarters prototype into a canonical two-weapon Action RPG combat system featuring **Chrono Edge** (`chrono_edge`) and **Pulsecaster** (`pulsecaster`), with zero regressions to the 5-chapter campaign, 4 WARDEN Marshals, 3 Chronicle Loom endings, Chrono Echo recording/replay, Temporal Resonance, Echo-Anchor Relay, or Phase 13.2 durable v2 campaign saves.

### Key Deliverables Completed
1. **Data-Driven Weapon System (`src/game/types.ts`, `src/game/config.ts`)**:
   - Canonical `WeaponId` (`'chrono_edge' | 'pulsecaster'`), `WeaponDefinition`, `ProjectileState`, and `WeaponShotOutcome`.
   - Authoritative tuning in `GAME_CONFIG.weapons` for both `chrono_edge` (3-hit melee cleave + Heavy Cleave) and `pulsecaster` (Pulse Bolt primary shot + Charged Lance heavy shot, heat/overheat economy, aim-assist cone, and pooled projectile limits).
2. **Real Simulation-Owned Ranged Combat (`src/game/simulation.ts`)**:
   - Pulsecaster spawns simulation-owned `ProjectileState` entities in `world.projectiles` with swept line-segment collision (`segmentCircleEarliestHitT`) against solid obstacles, closed containment barriers, the arena perimeter, Chapter II Choir Harmonic Pylons, and living enemies/bosses.
   - Respects Bastion Aegis frontal shields, HELIX-04 frontal armor vs. exposed Chrono Core (`1.45x`), Choir harmonic shielding & pylon synchronization, Curator false-Echo decoys, and Matron-V encounters.
3. **Distinct Weapon Heat & Chrono Flux Economy**:
   - Pulsecaster primary shots build weapon heat (`+18` heat per Pulse Bolt, `+36` heat per Charged Lance) and cool passively at `26/sec` (whether equipped or holstered) without draining Chrono Flux on primary fire.
   - Reaching `100` heat triggers a `1.6s` overheat lockout (`weaponOverheated = true`, emitting `pulse_overheated` and clearing with `pulse_overheat_cleared` at `25%` heat).
   - Clean non-empowered Pulsecaster hits generate small Chrono Flux (`+5` on unguarded light hit, `+2` on guarded hit, `+12` on non-empowered Charged Lance) so ranged play feeds into Echo Relay (`25 Flux`), Temporal Convergence (`15 Flux`), Gravity Pin (`30 Flux`), and Echo Collapse (`25 Flux`).
4. **Conflict-Free Weapon Switching & Input Safety (`src/game/input.ts`, `src/game/simulation.ts`)**:
   - Desktop switching via `[Tab]` and `[Z]`, plus direct weapon selection via `[1]` (`chrono_edge`) and `[2]` (`pulsecaster`) whenever Chapter V's Chronicle Loom console is not active.
   - Mobile / touch / HUD switching via `[data-testid="weapon-switch-btn"]`.
   - Switching while charging a heavy attack (`actionState === 'charging_heavy'`) cleanly cancels the charge without firing an unintended attack.
   - Switching is blocked during committed active/windup/dodge/parry frames and preserves active recovery timers (`light_recovery` / `heavy_recovery`) so weapon swapping cannot exploit animation recovery.
5. **Chrono Echo Weapon Recording & Replay (`src/game/simulation.ts`)**:
   - `EchoSample` and `EchoRecordedActionEvent` record `weaponId` alongside `'pulse_shot' | 'pulse_charged_shot'`.
   - Replaying an Echo preserves its recorded weapon stance and spawns visual Echo projectiles even if live Sera has switched back to `chrono_edge`.
   - Echo `pulse_charged_shot` primes Temporal Resonance on enemies/bosses and charges the North Kinetic Receiver in Calibration Bay 04 (when recorded inside the receiver pad facing North).
   - Echo `pulse_shot` / `pulse_charged_shot` can prime Chapter II Choir Harmonic Pylons at range with clear line of sight.
6. **Durable Campaign Save v2 Compatibility (`src/game/simulation.ts`)**:
   - `BossCheckpointState`, `SavedCampaignProgressSnapshot`, and `PersistedActiveCampaignState` persist `equippedWeaponId` across full page reloads, `Continue Campaign`, and `retryBossFromCheckpoint`.
   - Legacy v1/v2 saves without `equippedWeaponId` safely default to `'chrono_edge'`.
7. **HUD, 3D Rig, Pooled Projectile Renderer & Synth Audio (`src/components/GameHud.tsx`, `src/game/models.ts`, `src/game/renderer.ts`, `src/game/audio.ts`)**:
   - Compact HUD weapon deck (`data-testid="weapon-hud-module"`, `data-testid="weapon-switch-btn"`, `data-testid="pulsecaster-heat-bar"`).
   - Articulated Sera & Echo stances visually reflect the active weapon (blade-forward melee stance vs. left-forearm Pulsecaster projector stance with heat/charge emissive shifts) and render up to 14 pooled projectile bolts with zero runtime allocations.
   - Procedural Web Audio cues for `weapon_switched`, `player_pulse_shot`, `player_pulse_heavy_shot`, `pulse_overheated`, `pulse_overheat_cleared`, and `pulse_impact_obstacle`.

---

## 2. Weapon Comparison & Tuning Matrix

| Parameter | Chrono Edge (`chrono_edge`) | Pulsecaster (`pulsecaster`) |
|---|---|---|
| **Role** | Close-Quarters Melee Blade | Ranged Precision Phase Sidearm |
| **Primary Attack (`LMB / F / J`)** | 3-Hit Cleave (`16 / 20 / 28` HP, `12 / 15 / 26` Stagger, `2.8m` arc) | Pulse Bolt (`12` HP, `9` Stagger, `17.0m` range, `30m/s`, `+18` Heat) |
| **Heavy / Charged (`Hold LMB` or `E / K / RMB`)** | Heavy Cleave (`46` base / `64` empowered HP, `65 / 85` Stagger, `3.6m` arc) | Charged Lance (`28` base / `40` empowered HP, `32 / 46` Stagger, `20.0m` range, `38m/s`, `+36` Heat) |
| **Empower Cost** | `25` Chrono Flux | `20` Chrono Flux |
| **Flux Gain on Hit** | `+10` Light (`+4` guarded), `+22` Heavy | `+5` Light (`+2` guarded), `+12` Charged Lance |
| **Heat / Overheat** | N/A (`0` Heat) | `0..100` Heat, cools `26/sec`, `1.6s` lockout at `100` Heat |
| **Triggers Convergence** | Heavy Cleave or 3rd Light Finisher (`15` Flux) | Charged Lance (`pulse_heavy`, `15` Flux) |
| **Primes Echo Resonance** | Recorded `heavy_swing` | Recorded `pulse_charged_shot` |

---

## 3. Automated Test & Browser Verification Summary

### Unit & Release Test Suites (`136 / 136` Passing)
Command:
```bash
npx tsx --test src/game/simulation.test.ts src/game/campaign-release.test.ts src/game/accessibility.test.ts src/game/asset-lifecycle.test.ts
```
- **Phase 14.1 (`simulation.test.ts`)**: Verifies weapon definitions, neutral switching, switch cooldown guard, heavy-charge cancellation safety (`charging_heavy` -> `idle` with `0` projectiles fired), mid-windup rejection, and recovery timer preservation (`light_recovery` timer intact across weapon switch).
- **Phase 14.2 (`simulation.test.ts`)**: Verifies Pulsecaster primary bolt damage, zero Flux drain on primary fire, solid obstacle line-of-sight blocking (`pulse_impact_obstacle`), heat accumulation to `100`, overheat lockout rejection (`lastWeaponShotOutcome === 'overheated'`), and cooldown recovery.
- **Phase 14.3 (`simulation.test.ts`)**: Verifies HELIX-04 frontal armor mitigation vs. exposed Chrono Core amplification (`1.45x`), Echo recording of `pulse_charged_shot` with `weaponId: 'pulsecaster'`, independent Echo weapon playback after live Sera switches back to `chrono_edge`, Echo ranged Resonance priming, and live Pulsecaster Charged Lance Convergence.
- **Test 14 (`campaign-release.test.ts`)**: Verifies `equippedWeaponId` persistence across v2 campaign checkpoints, full page reload (`serializeCampaignProgress` -> `parseAndApplyCampaignProgress` -> `restoreSavedCampaignProgress`), `retryBossFromCheckpoint`, and legacy v2 fallback to `'chrono_edge'`.

### Real-Browser Playwright Verification (`1440×900` Desktop & `390×844` Mobile)
- **Desktop (`1440×900`)**:
  - Verified `[Tab]` and `[Z]` keyboard switching and `[data-testid="weapon-switch-btn"]` click switching between `CHRONO EDGE` and `PULSECASTER`.
  - Verified firing Pulsecaster `[F]` reduces enemy HP (`120 -> 115`), updates `weaponHeat` and `[data-testid="pulsecaster-heat-bar"]`, and emits zero console or page errors.
  - Verified recording a Pulsecaster Charged Lance (`[T]` -> `[E]` -> `[T]`), switching live Sera to `chrono_edge`, and replaying `[Y]` with `echo.activeActor.weaponId === 'pulsecaster'`.
  - Verified full page reload + `Continue Campaign` restores `equippedWeaponId === 'pulsecaster'`.
- **Mobile (`390×844`)**:
  - Verified `player-hud`, `weapon-hud-module`, `weapon-switch-btn`, `pulsecaster-heat-bar`, `touch-move-pad`, and `touch-camera-look` render within the viewport with zero overlap.

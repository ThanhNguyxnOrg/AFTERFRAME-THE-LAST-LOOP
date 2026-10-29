# AFTERFRAME: THE LAST LOOP — PHASE 16
## Enemy Archetypes, Tactical AI & Combat Encounter Design

---

### 1. Executive Summary

Phase 16 elevates ordinary enemy combat in **AFTERFRAME: THE LAST LOOP** from basic patrol-and-strike routines into a readable, deterministic tactical ecosystem where every unit role, weapon mode, Phase 15 upgrade, and Chrono Echo action has clear purpose and counterplay.

Key Phase 16 accomplishments:
1. **Four Distinct Tactical Enemy Roles**:
   - **Bulwark (`BASTION-09 · Heavy Enforcer`, role: `AEGIS BULWARK`)**: Directional frontal Aegis tower shield (`135°` arc, `0.42×` damage and `0.25×` stagger on frontal light melee and uncharged ranged shots) paired with a slow, telegraphed overhead maul slam (`0.68s` telegraph) and an extended open-shield recovery window (`1.70s` at `1.5×` vulnerable damage).
   - **Skirmisher / Flanker (`SCRAPPER-X2 · Assault Stalker`, role: `FLANKING SKIRMISHER`)**: High-mobility digitigrade flanker (`5.6 m/s`) that approaches along diagonal/lateral vectors, coils into a committed scissor-blade lunge (`0.42s` telegraph, `13.2 m/s` lunge), and punishes reckless light-attack spam via `counterCooldownRefundOnHit` (`0.28s`), balanced by lower posture stability (`maxStagger: 65`).
   - **Ranged Suppressor (`SCOUT-D4 · Pulse Recon Drone`, role: `RANGED SUPPRESSOR`)**: Hovering recon unit that maintains standoff firing distance (`5.8m` preferred range, evasive thruster dash when rushed within `2.7m`), projects a ground aiming laser sight during its `0.95s` telegraph, locks its firing line at `55%` telegraph progress, and fires an `8.8m` high-energy pulse beam.
   - **Temporal Disruptors (`SIPHON-07 · Flux Extractor` & `ERASER-11 · Echo Nullifier`, roles: `FLUX EXTRACTOR` / `ECHO NULLIFIER`)**: Specialized tactical pressure units that drain bounded `22` Flux on unparried/undodged hits (`siphon`) or hunt and sever active Echo replays within a `5.5m` suppression radius (`eraser`).
2. **Authoritative Line-of-Sight & Cover Counterplay**:
   - Fixed a concrete simulation gap where ordinary enemies (especially `SCOUT-D4`'s `8.8m` ranged line pulse) could initiate telegraphs or deal attack damage through solid arena pillars and containment barriers.
   - Both telegraph initiation and attack hit resolution now enforce `hasMeleeLineOfSight` against active arena obstacles. When a `SCOUT-D4` pulse discharge is intercepted by a solid pillar, the simulation blocks damage and emits `pulse_impact_obstacle` at the obstacle impact point for visual and audio feedback.
3. **Fair Dodge Commitment & Telegraph Interruption**:
   - Added `telegraphLocked` state tracking to `EnemyState`. Ordinary enemy telegraphs lock their aim rotation at `55%` telegraph progress **or immediately when Sera initiates a dodge (`actionState === 'dodging'`)**, eliminating unfair post-dodge tracking.
   - Hitting `SCOUT-D4` during its `telegraph` windup with a **Chrono Edge Heavy Cleave** or a **Pulsecaster Charged Lance** (`isHeavy === true`) immediately interrupts its ranged calibration into `recovery`, rewarding aggressive gap-closing or ranged counter-sniping.
4. **Active Echo Flanking Distraction**:
   - When an Echo is actively replaying (`echo.state === 'playback'`) within `6.5m` of an ordinary enemy, has clear line-of-sight, and is closer to the enemy than live Sera, the enemy tracks and faces the active Echo decoy during `pursue`. This allows Sera to record an Echo in front of `BASTION-09` and flank behind its Aegis shield (or Relay `[V]` into a backstab position) for unmitigated `1.0×` damage.
5. **HUD Tactical Telemetry**:
   - Exposed `getEnemyTacticalProfile` in `src/game/simulation.ts` and enriched `HudSnapshot.focusedEnemy` and `src/components/GameHud.tsx` with `roleLabel`, `statusLabel`, `isFrontShieldActive`, and `telegraphLocked` indicators without adding vertical clutter on desktop (`1280×800`) or mobile (`390×844`).

---

### 2. Audit of Pre-Phase-16 Enemy Types and Combat Encounters

An audit of `src/game/config.ts`, `src/game/simulation.ts`, `src/game/models.ts`, and `src/game/renderer.ts` identified the following pre-Phase-16 baseline and gaps:
- **Existing Strengths**:
  - Distinct procedural/hybrid 3D silhouettes and rig animations already existed for `bastion`, `scrapper`, `scout`, `siphon`, and `eraser`.
  - Token-limited concurrent attack initiation (`maxConcurrentAttackers: 2`) prevented simultaneous off-screen dogpiling.
  - `bastion` already enforced frontal directional mitigation (`frontGuardArc`, `frontGuardDamageMult`, `frontGuardStaggerMult`).
- **Identified & Resolved Gaps**:
  1. **Obstacle Line-of-Sight Bypass**: `updateEnemies` did not check `hasMeleeLineOfSight` before starting `telegraph` or when resolving `scout` and melee `attack` hits against Sera, allowing `scout` to shoot through solid pillars.
  2. **Post-Dodge Aim Tracking**: During the first `60%` of `telegraph`, enemies continued rotating toward Sera even after she committed to a dodge (`actionState === 'dodging'`).
  3. **Lack of Ranged Suppressor Telegraph Interruption**: Hitting `scout` during `telegraph` with a heavy melee or charged ranged shot only interrupted if stagger reached `100%`, rather than rewarding timely heavy counter-fire with an immediate telegraph interrupt.
  4. **Limited Echo Decoy Flanking**: Only `eraser` reacted to `world.echo.activeActor` position during `pursue`; `bastion` always faced live Sera even when an active Echo was replaying right in front of it.
  5. **HUD Role/Guard Readability**: `HudSnapshot.focusedEnemy` displayed generic `WARNING` / `EXPOSED · 1.5x` badges without communicating the enemy's tactical role (`AEGIS BULWARK`, `RANGED SUPPRESSOR`, `FLANKING SKIRMISHER`) or whether `BASTION-09`'s frontal shield was actively guarding against Sera's current angle.

---

### 3. Enemy Archetype Roster and Tactical Roles

| Archetype ID | Unit Designation | Tactical Role Badge | HP / Stagger | Move Speed | Attack Range | Telegraph / Active / Recovery | Defining Tactical Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `bastion` | `BASTION-09 · Heavy Enforcer` | `AEGIS BULWARK` | `150` / `100` | `2.65 m/s` | `2.35 m` | `0.68s` / `0.16s` / `1.70s` | `135°` frontal Aegis shield (`0.42×` dmg, `0.25×` stagger on frontal light hits); `1.5×` vulnerable damage during `1.70s` open-shield recovery; tracks closer active Echo decoy so live Sera can flank. |
| `scrapper` | `SCRAPPER-X2 · Assault Stalker` | `FLANKING SKIRMISHER` | `85` / `65` | `5.60 m/s` | `2.45 m` | `0.42s` / `0.15s` / `0.85s` | Diagonal/lateral flanking approach (`strafeDir`), `13.2 m/s` committed scissor lunge, `0.28s` cooldown refund when hit by light attacks during `pursue`, locks lunge direction immediately when player dodges. |
| `scout` | `SCOUT-D4 · Pulse Recon Drone` | `RANGED SUPPRESSOR` | `65` / `50` | `3.90 m/s` | `8.80 m` | `0.95s` / `0.16s` / `1.20s` | Standoff orbit (`5.8m` preferred range), evasive thruster dash (`8.4 m/s`) when rushed within `2.7m`, ground aiming laser sight, authoritative obstacle LOS check, interrupted into `recovery` by any Heavy hit during `telegraph`. |
| `siphon` | `SIPHON-07 · Flux Extractor` | `FLUX EXTRACTOR` | `70` / `55` | `5.20 m/s` | `2.35 m` | `0.46s` / `0.15s` / `1.05s` | Drains bounded `22` Flux on unparried/undodged hit (`siphon_flux_drained`); parrying or dodging prevents all Flux loss. |
| `eraser` | `ERASER-11 · Echo Nullifier` | `ECHO NULLIFIER` | `95` / `75` | `3.80 m/s` | `3.20 m` | `0.62s` / `0.16s` / `1.35s` | Prioritizes moving toward active playing Echo and emits a `5.5m` anti-Echo suppression pulse (`eraser_echo_disrupted`) unless interrupted or parried. |

---

### 4. AI State Machine and Decision Rules

All ordinary enemy units run a deterministic 5-state machine (`idle` -> `pursue` -> `telegraph` -> `attack` -> `recovery` / `staggered` -> `ko`) inside `updateEnemies` (`src/game/simulation.ts`):

1. **`idle` / `pursue`**:
   - Evaluates target selection: tracks live Sera by default, or tracks `world.echo.activeActor` when an Echo is actively replaying within `6.5m`, has clear obstacle line-of-sight (`hasMeleeLineOfSight`), and is closer than live Sera by at least `0.8m` (while live Sera is `> 2.1m` away), or always when `archetype === 'eraser'`.
   - Applies archetype-specific movement: direct advance (`bastion`), lateral/diagonal flank (`scrapper`, `siphon`, `eraser`), or standoff radial/tangential orbit with close-range evasive thruster dash (`scout`).
   - Transitions to `telegraph` only when `cooldownTimer <= 0`, `evadeTimer <= 0`, `activeAttackers < maxConcurrentAttackers (2)`, target is within `attackRange`, **and `hasMeleeLineOfSight` confirms no solid obstacle blocks the attack vector**.
2. **`telegraph`**:
   - Zeroes translational velocity (`vx = 0, vz = 0`) and increments `progress = 1 - stateTimer / stateDuration`.
   - Tracks target angle at `5.0 rad/s` only while `!enemy.telegraphLocked`.
   - Sets `enemy.telegraphLocked = true` as soon as `progress >= 0.55` **or immediately if `player.actionState === 'dodging'`**.
   - If `enemy.archetype === 'scout'` is struck by a Heavy attack (`isHeavy === true`, either Chrono Edge Heavy Cleave or Pulsecaster Charged Lance) during `telegraph`, it immediately aborts the attack into `recovery`.
3. **`attack`**:
   - Executes committed strike motion (`13.2 m/s` lunge for `scrapper`, `3.4 m/s` forward slam step for `bastion`, stationary discharge for `scout`).
   - Evaluates hit envelope once (`!enemy.hasDealtDamageThisAttack`) and verifies `hasMeleeLineOfSight(enemy.x, enemy.z, p.x, p.z, world.obstacles)`.
   - If blocked by an obstacle, marks `hasDealtDamageThisAttack = true` without damaging Sera and emits `pulse_impact_obstacle` for `scout`.
   - If clear, calls `applyDamageToPlayer` (which honors dodge invulnerability and parry timing).
4. **`recovery` / `staggered`**:
   - Holds open vulnerability posture (`1.5×` incoming damage multiplier; `bastion` Aegis shield swings open).
   - Upon timer completion, resets `telegraphLocked = false`, sets `cooldownTimer = cfg.attackCooldown`, reverses `strafeDir`, and returns to `pursue`.

---

### 5. Telegraph, Commitment, Hitbox, and Recovery Contracts

- **Telegraph Windows**:
  - `scrapper`: `0.42s` (coils low, spreads twin mantis blades, amber ground ring).
  - `siphon`: `0.46s` (amber siphon ring, drains `22` Flux only on unparried/undodged hit).
  - `eraser`: `0.62s` (violet/amber anti-Echo suppression windup).
  - `bastion`: `0.68s` (plants legs, raises shock-maul overhead, amber/red ground disc).
  - `scout`: `0.95s` (projects ground aiming laser sight + telegraph ring; shifts from amber `0xf59e0b` to locked red `0xef4444` at commitment).
- **Commitment Cutoff**:
  - Rotation tracking cuts off at `55%` of `telegraphDuration` or immediately upon player dodge (`telegraphLocked = true`).
- **Recovery Windows (`1.5×` Vulnerable Damage)**:
  - `scrapper`: `0.85s`
  - `siphon`: `1.05s`
  - `scout`: `1.20s`
  - `eraser`: `1.35s`
  - `bastion`: `1.70s`
  - `staggered` (all ordinary units): `1.75s` (`scrapper`) to `2.20s` (`bastion`).

---

### 6. Weapon Counterplay Matrix (`Chrono Edge` vs `Pulsecaster`)

| Enemy Archetype | Chrono Edge Light Combo `[LMB / J]` | Chrono Edge Heavy Cleave `[RMB / E]` | Pulsecaster Light Bolt `[LMB / J]` | Pulsecaster Charged Lance `[RMB / E]` | Parry `[Q / Shift]` & Dodge `[Space]` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`bastion` (`AEGIS BULWARK`)** | Mitigated from front (`0.42×` dmg, `0.25×` stagger); full `1.0×` dmg when flanking behind `135°` shield arc or `1.5×` during `recovery`. | Bypasses frontal light-hit penalty (`1.0×` dmg, heavy stagger); shatters posture in 1 hit with `edge_breaker_cleave`. | Mitigated from front (`0.42×` dmg, `0.25×` stagger); full `1.0×` on flank or `1.5×` during `recovery`. | Penetrates frontal light guard (`isGuarded = false`), dealing full heavy damage (`28`–`50`) and high posture damage (`32`–`58`). | Parrying maul slam grants `+35` Flux and **immediately staggers** `bastion`. |
| **`scrapper` (`FLANKING SKIRMISHER`)** | Fast interrupt when staggered, but spamming light attacks in `pursue` refunds `0.28s` of Scrapper's attack cooldown. | High stagger (`40` base) quickly breaks Scrapper's `65` max stagger in 1–2 hits. | Tracks and chips approaching flanker from `13.5m` before it enters `2.45m` lunge range. | Punishes Scrapper during `0.85s` post-lunge recovery from safe standoff range. | Dodging during telegraph immediately locks Scrapper's lunge angle (`telegraphLocked = true`), causing the lunge to whiff. |
| **`scout` (`RANGED SUPPRESSOR`)** | Requires closing distance (`3–4` hits to eliminate `65 HP`); triggers Scout's `2.7m` evasive dash if not cornered or staggered. | **Interrupts Scout's ranged `telegraph` immediately into `recovery`** and deals heavy HP/stagger damage. | Reliable ranged counter-fire from `13.5m` without chasing Scout across the arena. | **Interrupts Scout's ranged `telegraph` from `16.5m` into `recovery`** and deals massive stagger (`32`–`58` vs `50` maxStagger). | Solid arena pillars block Scout's `8.8m` pulse beam (`hasMeleeLineOfSight`); lateral dodge breaks aim lock. |
| **`siphon` / `eraser` (`DISRUPTORS`)** | Fast close-quarters pressure to eliminate `70–95 HP` before disruptor cycles repeat. | High stagger interrupts `eraser` before its `5.5m` anti-Echo pulse can sever active Echo playback. | Safe ranged elimination of `siphon` outside its `2.35m` Flux-drain strike reach. | Long-range burst/stagger to neutralize `eraser` while protecting an active Echo across the bay. | Parrying or dodging `siphon` prevents all `22` Flux drain; parrying `eraser` staggers it before Echo disruption. |

---

### 7. Phase 15 Upgrade Counterplay Matrix Across All Four Upgrades

| Phase 15 Upgrade | Primary Tactical Archetype Matchups | Concrete Simulation Advantage | Trade-Off in Encounter |
| :--- | :--- | :--- | :--- |
| **`edge_breaker_cleave` (Seismic Breaker Core)** | **`bastion` (`AEGIS BULWARK`)** & **`eraser`** | `1.30×` stagger multiplier + `+0.25` frontal guard stagger bonus shatters `BASTION-09`'s `100` posture in a single Empowered Heavy Cleave straight through its frontal Aegis shield. | `0.88×` direct HP damage (`-12%`) and `+0.06s` longer Heavy recovery require care when `scrapper` is flanking nearby. |
| **`edge_harmonic_conductor` (Harmonic Phase Edge)** | **Multi-enemy Sync (`bastion` + `scrapper`)** & **`siphon` recovery** | `+3` bonus Flux per clean melee hit rapidly rebuilds Flux (offsetting `siphon` pressure), extends Resonance mark window by `+1.1s` (`2.2s` total), lowers Convergence cost to `10` Flux, and adds `+32` Convergence posture damage. | `-15%` solo un-empowered Heavy damage and `30` Flux Empowered Heavy threshold (`+5` Flux). |
| **`pulse_thermal_sink` (Cryo-Vent Capacitor)** | **`scout` (`RANGED SUPPRESSOR`)** & **`scrapper`** | Reduces Light Bolt heat from `18` to `12` (`8` consecutive shots before overheat vs `6` baseline) and increases cooling by `1.30×`, allowing Sera to eliminate a `65 HP` `SCOUT-D4` in a single sustained volley (`0` overheats). | Light Bolt damage reduced from `12` to `10` and stagger from `9` to `7`. |
| **`pulse_overcharge_condenser` (Phase-Lance Condenser)** | **`scout` (`RANGED SUPPRESSOR`)** & **`bastion` (`AEGIS BULWARK`)** | Boosts Charged Lance damage to `35` base / `50` empowered and stagger to `42` / `58`, interrupting and staggering `SCOUT-D4` (`50` maxStagger) from `16.5m` or cracking `BASTION-09` from range. | Higher heat cost (`48` vs `36`), `0.48s` shot cooldown, and `0.32s` recovery require spacing against `scrapper`. |

---

### 8. Echo, Relay, and Resonance Interactions with Enemy Archetypes

1. **Active Echo Flanking Distraction (`updateEnemies`)**:
   - Recording an Echo in front of `BASTION-09` and replaying it `[Y]` while live Sera repositions (or Relays `[V]`) draws `BASTION-09`'s facing toward the closer active Echo decoy (`distEcho <= 6.5m` and closer than live Sera by `>= 0.8m`).
   - Live Sera can then strike `BASTION-09`'s unshielded rear/flank (`> 67.5°` off facing) for full `1.0×` damage and `1.0×` stagger.
2. **Echo Heavy Resonance Priming & Convergence**:
   - Replaying an Echo that performs a Chrono Edge `heavy_swing` or Pulsecaster `pulse_charged_shot` primes a **Temporal Resonance Mark** on any ordinary archetype (`bastion`, `scrapper`, `scout`, `siphon`, `eraser`) when `hasMeleeLineOfSight` is clear.
   - Striking the marked enemy with live Sera's Heavy attack triggers **Temporal Convergence**, bypassing `BASTION-09`'s frontal shield (`!triggeredConvergence`), injecting `+22` posture damage (`+32` with `edge_harmonic_conductor`), and staggering the target.
3. **Anti-Exploit & Deterministic Bounds**:
   - Echo contacts deal `0` direct HP damage (`echoLance.damage === 0`) and never duplicate progression rewards.
   - `ERASER-11` actively counters unguarded Echo replays by hunting `world.echo.activeActor` and emitting a `5.5m` suppression pulse if not intercepted.

---

### 9. Encounter Composition and Arena Spacing

- **Test Bay 04 Standard Encounter (`createInitialWorld`)**:
  - Preserves the canonical 3-unit tactical composition (`totalEnemies = 3`) required across the campaign and regression suite:
    - `enemy-bastion-1` (`BASTION-09 · Heavy Enforcer`) at `(0, 4.5)` — central lane frontline anchor.
    - `enemy-scrapper-1` (`SCRAPPER-X2 · Assault Stalker`) at `(-6.5, -4.5)` — NW sector flanker.
    - `enemy-scout-1` (`SCOUT-D4 · Pulse Recon Drone`) at `(6.5, -5.0)` — NE sector ranged suppressor with arena pillars (`pillar-nw`, `pillar-ne`, `pillar-sw`, `pillar-se`, `loom-pylon`) providing authoritative line-of-sight cover.
- **Chapter IV Surgical Ward Support Wave (`MATRON-V`)**:
  - Combines `SIPHON-07` (Flux drain pressure) and `ERASER-11` (active Echo hunter) to test target prioritization, Gravity Pin `[G]`, and Echo Collapse `[X]`.

---

### 10. Visual, HUD, Audio, and Accessibility Readability

- **3D Silhouette & Telegraph Cues (`src/game/models.ts`, `src/game/renderer.ts`)**:
  - `BASTION-09`: Heavy bipedal frame with Aegis tower shield braced forward during guard, overhead maul windup during `telegraph`, and wide-open shield stance with white core illumination during `recovery` / `staggered`.
  - `SCRAPPER-X2`: Low-slung reverse-jointed digitigrade stalker that coils downward and spreads twin mantis blades during `telegraph` before executing a scissor lunge.
  - `SCOUT-D4`: Hovering tri-thruster recon drone with a ground aiming laser sight (`laserSightMesh`) that shifts from amber (`0xf59e0b`) to locked crimson (`0xef4444`) the instant `telegraphLocked` activates.
- **HUD Focused Enemy Telemetry (`src/components/GameHud.tsx`)**:
  - Displays `data-enemy-role` (`[AEGIS BULWARK]`, `[FLANKING SKIRMISHER]`, `[RANGED SUPPRESSOR]`, `[FLUX EXTRACTOR]`, `[ECHO NULLIFIER]`) and live `data-enemy-status` (`FRONTAL GUARD · 0.42x DMG (FLANK/HEAVY)`, `FLANK OPEN · 1.0x UNGUARDED DMG`, `SHIELD OPEN · 1.5x VULNERABLE`, `PULSE AIM LOCKED · DODGE OR BREAK`, `LUNGE COMMITTED · DODGE LATERAL`).
- **Reduced Motion & Color-Independent Readability**:
  - Text status badges (`[AEGIS BULWARK]`, `PULSE AIM LOCKED`, `SHIELD OPEN · 1.5x`) and distinct 3D poses communicate enemy state without relying solely on color or camera shake.

---

### 11. Persistence and State-Reset Rules

- Enemy runtime AI states (`aiState`, `telegraphLocked`, `stagger`, `cooldownTimer`) are ephemeral encounter state and are cleanly reconstructed upon encounter start, retry (`resetWorldForStandardPlaying`), or checkpoint restore (`retryBossFromCheckpoint`).
- Campaign progression (`memoryFragments`, `purchasedUpgrades`, `equippedUpgrades`, `claimedRewardIds`) remains strictly milestone-driven and idempotent; defeating or resetting ordinary enemies never farms additional Memory Fragments.

---

### 12. Automated Test Coverage

All **178 automated tests** across 4 test files pass (`0` failures):
- `src/game/simulation.test.ts`: **121 passing tests**, including 4 new Phase 16 test suites:
  - `Phase 16.1: Enemy Archetype Tactical Profiles, HUD Role/Status Telemetry & Directional Shield State`
  - `Phase 16.2: Authoritative Obstacle Line-of-Sight Blocks Scout Ranged Pulse & Melee Attacks Through Pillars`
  - `Phase 16.3: Fair Dodge Tracking Cutoff & Scout Ranged Telegraph Interruption via Heavy Strike or Charged Lance`
  - `Phase 16.4: Echo Tactical Flanking Distracts Bastion Shield & Phase 15 Upgrades Counter Distinct Archetypes`
- `src/game/campaign-release.test.ts`: **16 passing tests**
- `src/game/reduced-motion.test.ts`: **33 passing tests**
- `src/game/asset-lifecycle.test.ts`: **8 passing tests**

---

### 13. Live Browser / Playwright Verification

Verified on the live running application at `http://localhost:3000` using `playwright-cli`:
- **Desktop (`1280×800`)**: Started campaign, skipped prologue intro, verified `[data-testid="focused-enemy-hud"]` displays `BASTION-09 · Heavy Enforcer` with `data-enemy-archetype="bastion"`, `data-enemy-role="AEGIS BULWARK"`, and `data-enemy-status="FRONTAL GUARD · 0.42x DMG (FLANK/HEAVY)"` alongside the active weapon panel (`chrono_edge`). Captured screenshot `.playwright-cli/phase16-desktop.png`.
- **Mobile (`390×844`)**: Resized viewport to `390×844`, verified zero HUD overlap and clean touch control layout. Captured screenshot `.playwright-cli/phase16-mobile.png`.
- **Console & Page Errors**: Verified `0` console errors and `0` uncaught page errors.

---

### 14. Known Limitations and Next-Phase Recommendations

- **Git Metadata in Container**: As in prior phases, `/app/applet` does not contain a `.git/` directory, so Git commit hashes cannot be inspected from inside this container environment.
- **Next-Phase Recommendations**:
  - Consider adding an optional "Tactical Simulacrum / Wave Arena" practice mode on the Title Screen where players can freely spawn custom combinations of `BASTION-09`, `SCRAPPER-X2`, `SCOUT-D4`, `SIPHON-07`, and `ERASER-11` to experiment with weapon builds and Echo setups outside the main campaign.

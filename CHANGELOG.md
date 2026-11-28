# 📜 Changelog — AFTERFRAME: THE LAST LOOP

All notable changes and official releases for **AFTERFRAME: THE LAST LOOP** are documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [`4.0.0`] — Sovereign Reforged Edition: 3D Astral Mastery Crown, HUD Gaze Orchestration (`[F8]` Focus Mode), Zero-GC Render/HUD Optimization & Modular Architecture Refactor (`Vương Miện Tinh Tú 3D`, `Chế Độ Tập Trung [F8]`, `Xung Tinh Tú` & `Tái Kiến Trúc Zero-GC`)

### 👑 3D Sovereign Astral Mastery Crown (`VƯƠNG MIỆN TINH TÚ 3D · SEAL I–IV`) & Active Astral Pulse
- **Composite Procedural 3D `SovereignAstralCrownRig` (`models.ts` + `renderer.ts`)**: Mounted a dorsal Titanium-Brass & Crystalline Chrono Crown onto Sera Venn's `chronoRigPivot` featuring counter-rotating astrolabe gimbal arcs, a bevelled Omega Keystone finial, and an **8-slot `THREE.InstancedMesh` of faceted extruded Chrono Blades** (`frustumCulled = false`, zero per-frame GC allocations). Scales dynamically across **Mastery Seal Tiers `1..4`** (`2, 4, 6, 8` orbiting blades with Bronze -> Silver-Cyan -> Sovereign Gold -> Iridescent Omega Violet-Cyan-Gold tints), expanding and flaring during **Temporal Slip-Time** & **Overdrive**.
- **Active Combat Payoff — `Sovereign Astral Pulse` (`XUNG TINH TÚ · 5.8m`)**: Triggering **Temporal Slip-Time** (`Perfect Dodge`) while holding **Mastery Seal `Tier >= 1`** automatically discharges a `5.8m` radial **Astral Pulse** dealing **`18 × Tier` Chrono Damage** (`18..72 DMG`) + **`8 × Tier` Stagger** (`8..32`) to nearby hostiles with crystalline harmonic WebAudio synthesis and 3D shock-ring VFX.

### 🎯 HUD Gaze Orchestration, `[F8]` Combat Focus Mode & Modular UI Refactor
- **`[F8]` Combat Focus Mode (`CHẾ ĐỘ TẬP TRUNG [F8]`) & Single-Focus Priority Gaze**: Added 1-key **`[F8]`** / top-right HUD toggle (`hud-btn-focus-mode`) collapsing peripheral radar, narrative banners, and live comms to preserve **`>92%` unobstructed 3D combat viewport** while retaining Vitality, Boss HP, Slip-Time, Live Rank, and active weapon/Echo controls. Automatically suppresses redundant tutorial guidance during Chapter Act Curtains or active tactical comms, and surfaces active **Mastery Seal Tier (`SEAL I..IV Ω` / `ẤN I..IV Ω`)** on the Title top bar.
- **Modular Shared Components (`MasteryLedgerPanel.tsx` + `HudNarrativeOverlays.tsx`)**: Consolidated ~310 lines of duplicated Mastery Ledger UI across `TitleScreen` and `StatusModal` into a shared `React.memo` **`MasteryLedgerPanel`** with interactive filter tabs (`ALL 12 | SECTORS 6 | WARDENS 6 | UNCLAIMED ◆`) and a compositor-only `scaleX` Next-Seal progress bar, plus extracted **`HudNarrativeOverlays`** (`React.memo`).

### ⚙️ Zero-GC `HudSyncTracker` & Non-Blocking WebGL2 Fence Pacing
- **Zero-Allocation `HudSyncTracker` (`src/game/hud-sync.ts`)**: Replaced 280 lines of inline 48-variable diffing in `App.tsx` with a typed `O(1)` tracker that reuses a static result object and tracks `combatMastery` clear/bounty persistence stamps.
- **WebGL2 Non-Blocking Fence Poll & Projection Guard**: Upgraded software-GL frame pacing from synchronous `gl.clientWaitSync` to non-blocking `gl.getSyncParameter(sync, gl.SYNC_STATUS)` polling and bypassed `computeProjectedPopups` when zero damage popups are active.

---

## [`3.9.0`] — Temporal Slip-Time, Sovereign Combat Mastery Ledger & 3D Phantom Dodge Afterimages (`Trượt Thời Không 0.38x`, `Sổ Thông Thạo S+ 12 Thử Thách` & `Dư Ảnh 3D Sera`)

### ⚡ Temporal Slip-Time (`TRƯỢT THỜI KHÔNG · 0.38x MICRO TIME DILATION`) & 3D Phantom Afterimages
- **Timed Perfect Dodge Time Dilation (`player_perfect_dodge` -> `temporal_slip_triggered`)**: Dodging (`[Space]`) through a hostile strike or projectile within the `0.15s` Perfect Dodge window now triggers **Temporal Slip-Time**, dilating all hostile actors, boss patterns, and enemy projectiles to **`0.38×` speed** for **`1.35s`** (`+0.15s..+0.60s` with Sovereign Mastery Seals, `2.4s` internal cooldown) while Sera acts at `100%+` speed.
- **Zero-GC 6-Slot 3D Pose-Matched Sera Holographic Afterimages & 3D Clockwork Slip-Ring**: Pre-allocated 6 pose-synchronized translucent cyan/violet 3D Sera rigs (`depthWrite: false`) left behind along Dodge, Perfect Dodge, Echo Relay `[V]`, and Flash Swap `[1–5]` trajectories, plus a counter-rotating 12-tick `InstancedMesh` **3D Chrono Clockwork Slip-Ring** beneath Sera during active Slip-Time and procedural WebAudio cues.

### 🏆 Sovereign Combat Mastery Ledger (`SỔ THÔNG THẠO S+ · SAVE V2`) & Permanent Mastery Seals
- **12 Canonical S+ & Hitless Trials + Claimable `+24◆` Bounties**: Persistent `Save V2` mastery ledger tracking `bestGrade` (`C` → `S+`), `bestTimeSec`, `hitless`, and `clears` across all `6` Campaign Sectors (`SEC-00`..`SEC-05`) and `6` Sovereign Wardens (`HELIX-04`..`ECHO-ZERO`), including isolated Practice Boss Arena runs (`REMATCH` / `ĐẤU NGAY`). Unlocking **S-Rank (`S`/`S+`)** and **Hitless** medals enables claimable **`+1◆` Memory Fragment Bounties** (up to `+24◆` total) in Title Practice (`SỔ THÔNG THẠO S+`), `[N]` Field Journal (`SỔ THÔNG THẠO S+`), and Victory Summary.
- **4-Tier Permanent Sovereign Mastery Seal (`ẤN THÔNG THẠO THỐNG LĨNH` · `O(1)`) & Live Rank Forecast**: Claiming Mastery Seals permanently awakens **Seal I–IV** (`+4%..+16%` All DMG, `+4..+24` Max Chrono Ward, `+8%..+28%` Overdrive/Confluence Gain, and `+0.15s..+0.60s` Slip-Time Duration), paired with a clean unboxed **Live Tactical Rank Forecast** (`RANK S+ · PTS · HITLESS`) on the combat HUD.

---

## [`3.8.0`] — Celestial Chronicle, 3D Lysa Holo-Memory Projections & Next-Gen Orbital Sky Shaders (`6` Ký Ức Holo 3D TS. Lysa Venn `[I]`, Nhà Hát Biên Niên Cốt Truyện & Shader Bầu Trời Cực Quang / Tinh Cầu Thời Không)

### 🌌 Interactive 3D Dr. Lysa Venn Holo-Memory Projections (`KÝ ỨC HOLO 3D [I]` · `HOLO-00`–`HOLO-05`)
- **6 In-World 3D Holographic Memory Scenes (`LYSA_HOLO_MEMORIES`)**: Mounted a recessed, flush-deck 10-part Titanium-Brass **Chrono Astrolabe Emitter Pad** (`height <= 0.048m`, zero footwork snag) across all 6 Campaign Sectors (`Prologue` through `Chapter V`). Approaching and pressing **`[I]`** projects a rotating 3D cyan-gold hologram of Dr. Lysa Venn for `9.5s`, awards **`+22` Chrono Flux, `+16` Integrity, and `+12` Chrono Ward** on first discovery, and opens a non-blocking **Bilingual (`VI / EN`) Cinema Card** with 3 voiced narrative beats.
- **Permanent Holo-Memory Resonance (`CỘNG HƯỞNG KÝ ỨC HOLO` · Save V2)**: Each reconstructed Lysa Holo-Memory permanently grants **`+1%` Outgoing Damage** and **`+2` Max Chrono Ward** across the campaign, culminating in **`+8%` All-Damage & `+16` Max Chrono Ward** at `6/6` full reconstruction.
- **Diegetic Chapter Act Title Curtain & Story Chronicle Theater**: Added a non-blocking upper-band **Chapter Act Title Curtain** on sector entry plus an interactive **Story Chronicle & Holo-Memory Theater** in both the Title Screen (`Chapters` -> `CHRONICLE & HOLO`) and in-game Field Journal (`[N]` -> `CHRONICLE & HOLO`) surfacing the live **Causal Stance Alignment Bar** (`Defiance` / `Empathy` / `Pragmatism` + Sovereign Doctrine) and full 6-act bilingual transcripts.

### 🪐 Next-Gen 3D Celestial Sky Shaders, Chrono Astrolabe Horizon Rings & Celestial Sky Grading
- **Volumetric Aurora Borealis, Scintillating Starfield & Solar-Eclipse Corona (`Zero-GC` GLSL)**: Upgraded the custom GLSL `skyDomeMat` with multi-octave volumetric nebula filaments, undulating **Temporal Rift Aurora Borealis** curtains (`uAurora`, `uAuroraIntensity`), starlight scintillation (`uStarTwinkle`), and a solar-eclipse horizon corona (`uEclipseRim`), paired with Rayleigh atmospheric scattering & night-side colony lights on the orbital planet, Cassini/Encke ice-ring shimmer, and **Twin Counter-Rotating 3D Chrono Astrolabe Horizon Rings**.
- **Brushed-Titanium Micro-Relief & Live Celestial Sky Grade (`NATURAL · AURORA · ECLIPSE`)**: Enhanced deck PBR bump/roughness maps with hex micro-etching and radial floor telemetry pulses, and added a live **Celestial Sky Grade** selector in both Title and Pause System Settings.

---

## [`3.7.0`] — Echo Doctrine Matrix, Relic Synergy Constellations & Endgame Controller/Touch Parity (`4` Học Thuyết Vọng Ảnh `[0]`, `3` Chòm Sao Cộng Hưởng Di Vật `O(1)` & Tổ Hợp Tay Cầm `LB+RB` / `LT+RT`)

### 🌀 4 Switchable Echo Behavioral Doctrines (`HỌC THUYẾT VỌNG ẢNH [0]: CHUẨN · TIÊN PHONG · PHÁO ĐÀI · TÂN TINH`)
- **Zero-Cost Live Echo Tactical Specialization (`[0]` / HUD Echo Dock / Armory `[U]` / Title Arsenal)**: Operatives can now specialize how Sera's Temporal Echo behaves in combat on the fly with Save V2 persistence, `ALPHA · BETA · GAMMA` Loadout Preset integration, WebAudio cues, and zero-GC 3D hologram ring tinting:
  - **`STANDARD` (`CHUẨN`, `#38bdf8`)**: Calibrated `1.0×` baseline replay telemetry with zero behavioral drift.
  - **`VANGUARD` (`TIÊN PHONG`, `#fb923c`)**: `+28%` Echo Strike, Convergence & Collapse `[X]` damage, `+20%` Echo Stagger, and `+25%` Twin-Sync charge gain.
  - **`BASTION` (`PHÁO ĐÀI`, `#34d399`)**: Active Echo within `9.5m` projects a **Temporal Tether** granting `-18%` incoming damage, `+4.5/s` Chrono Ward regeneration, `+2.0/s` Flux regeneration, and `-30%` Twin-Sync decay.
  - **`NOVA` (`TÂN TINH`, `#e879f9`)**: Deploying `[Y]` Replay or `[V]` Chrono Relay unleashes a `4.4m` **Temporal Rift Pulse** (`22` AoE DMG, `+18` Stagger, `1.2m` inward pull, `1.8s` ICD), plus `-25%` Echo Collapse `[X]` cooldown and `+0.8m` blast radius.

### ✦ Recursion Relic Synergy Constellations (`CHÒM SAO CỘNG HƯỞNG DI VẬT · O(1) BITMASK`)
- **3 Paired Chrono Relic Constellations**: Collecting `>= 1` stack of paired Chrono Relics in **Recursion Protocol** unlocks a pre-computed `O(1)` frozen bitmask Constellation surfaced directly on 3-card Relic Draft previews (`COMPLETES CONSTELLATION` / `CONSTELLATION ACTIVE`):
  - **`CHRONO VAMPIRISM`** (`Kinetic Overdrive + Temporal Siphon`): `+15%` All DMG, `+12%` Move Speed, and `+6` Chrono Ward & `+6` Flux on every hostile defeat.
  - **`PARADOX SINGULARITY`** (`Echo Resonance Core + Singularity Bus`): `+25%` Echo & Convergence DMG, `+20%` Stagger, and `-15%` `[9]` Confluence Burst & `[X]` Collapse cooldowns.
  - **`CRYO FORTRESS`** (`Aegis Phase Barrier + Cryo Thermal Vent`): `+25` Max Integrity, `-20%` Weapon Heat cost, and `+20%` Heavy/Ranged impact potency.

### 🎮 Endgame Controller Chord Parity & Expanded Dual-Rumble Haptics
- **Zero-GC Controller Chords**: Added simultaneous **`LB + RB`** → `[9]` Sovereign Confluence Burst and **`LT + RT`** → `` [`] `` Stasis Overdrive chord detection with constituent single-button edge suppression (`parry`/`light` and `echoRelay`/`heavy`) plus expanded 6-tier dual-rumble haptics for Confluence Burst, `OMEGA` Awakening, Stasis Overdrive, and Nova Rift Pulses.

---

## [`3.6.0`] — Sovereign Armament Attunement, Tactical Loadout Presets & Adaptive 60 FPS Governor (`5` Vũ Khí × `5` Lõi Boss Đồng Điệu Thần Binh, `3` Bộ Trang Bị Nhanh `ALPHA · BETA · GAMMA` & Tối Ưu Zero-GC `60 FPS`)

### ✦ Sovereign Armament Attunement (`ĐỒNG ĐIỆU THẦN BINH: 5 VŨ KHÍ [1–5] × 5 LÕI BOSS`)
- **Complete Combat-Progression Triangle (`Weapon ↔ Boss Core ↔ LYS-04`)**: Pairing each Chrono Rig weapon with its cognate Sovereign Boss Echo Core unlocks a signature **Armament Attunement** (amplified further when the core is transcended to `OMEGA Ω`, plus a **Universal Sovereign Override** when equipping **`WARDEN PRIME Ω`** that grants Base-tier Attunement to any `[1–4]` weapon and `Ω` Attunement to `[5] Chrono Scythe`):
  - **`[1] Chrono Edge × HELIX-04` (`Aegis Riposte`)**: `+14%` (`+20% Ω`) Edge DMG; Perfect Parry `[Q]` grants `+18` (`+26 Ω`) `[9]` Confluence Charge, resets Weapon Switch CD, and restores `+6` Flux on `Ω`.
  - **`[2] Pulsecaster × THE CHOIR` (`Harmonic Cadence`)**: `+14%` (`+20% Ω`) Pulse DMG, `-22%` (`-30% Ω`) Heat cost per shot, and Empowered Heavy Burst `[E]` restores `+8` (`+12 Ω`) Flux.
  - **`[3] Phase Rail × MATRON-V` (`Surgical Aperture`)**: `+16%` (`+24% Ω`) Rail DMG, `-20%` (`-28% Ω`) Heavy Charge time, and Empowered Rail `[E]` triggers Matron Siphon (`+6/+9` HP & Ward) even on un-staggered targets.
  - **`[4] Grav-Breaker × THE CURATOR` (`Singularity Maul`)**: `+16%` (`+24% Ω`) Maul DMG & Stagger; 3rd Light Slam and Heavy `[E]` pull enemies within `4.8m` (`5.8m Ω`) and grant `+16` (`+22 Ω`) `[9]` Charge.
  - **`[5] Chrono Scythe × WARDEN PRIME` (`Sovereign Reaper`)**: `+16%` (`+24% Ω`) Scythe DMG; Empowered Heavy Vortex `[E]` unleashes a `4.6m` (`5.4m Ω`) Sovereign Wave dealing `24` (`34 Ω`) bonus DMG and `+18` (`+24 Ω`) Stagger.
- **3D Sigil Resonance & HUD Readability**: Synchronized `×1.45` orbital spin and `+0.35` emissive intensity on Sera's 3D Dorsal Boss Core Sigil when attuned, `✦` Attuned badges on HUD `[1–5]` weapon slots and Boss Core chip, and localized `EN`/`VI` **Armament Attunement** banners in both Title Arsenal and `[U]` Armory.

### 🗂️ 3-Slot Tactical Loadout Presets (`BỘ TRANG BỊ NHANH: ALPHA · BETA · GAMMA`)
- **1-Click Full-Build Save & Swap (`Save V2` Persistent)**: Added 3 persistent **Tactical Loadout Preset** slots (`ALPHA`, `BETA`, `GAMMA`) in both Title Arsenal (`KHO ĐỒ & 3D`) and `[U]` Armory capturing `Weapon [1–5]`, `Weapon Upgrades`, `Mod Socket Chip`, `3 Rig Chassis Modules`, `LYS-04 Sentinel Mode`, and `Boss Echo Core` with ownership sanitization and instant `Chrono Ward` recalculation.

### ⚡ Zero-GC `60 Hz` Loop Optimization & Adaptive 60 FPS Governor
- **Pre-Computed `O(1)` Frozen Lookup Tables & Zero-GC Loop Counters**: Frozen all `BossCoreModifiers`, `SentinelCoreConfluenceSummary`, and `WeaponCoreAttunementSummary` permutations at module initialization (`0` heap allocations per hit/frame) and eliminated all per-frame `.filter(...)` / `Object.keys(...)` array allocations inside `extractHudSnapshot` and `App.tsx` `stepAndRender`.
- **Adaptive 60 FPS Governor (`TỰ ĐỘNG ỔN ĐỊNH 60 FPS`)**: Added a deterministic EMA frame-time governor (`adaptiveResolution` in Settings, `ON` by default on GPU, bypassed on software WebGL) that smoothly scales dynamic pixel ratio (`0.65×–1.00×`) during heavy particle bursts and surfaces live `SCALE %` in the `[F3]` Performance HUD.

---

## [`3.5.0`] — Paradox Confluence & Boss Core `OMEGA (Ω)` Transcendence (5 Awakened `OMEGA` Sovereign Cores, `LYS-04 × Boss Core` Harmonic Confluence Doctrines, Active `[9]` Sovereign Confluence Burst & 100% Vietnamese UI Polish)

### 👑 Boss Echo Core `OMEGA (Ω)` Transcendence (`THỨC TỈNH LÕI OMEGA · 2◆`)
- **Endgame Sovereign Awakening (`2` Memory Fragments)**: Unlocked Boss Echo Cores can now be transcended to **`OMEGA (Ω)`** in the Armory (`[U]` or Title Arsenal), persisting across Save V2 snapshots and mounting a pre-allocated **3D Dorsal `OMEGA` Crown Halo & Twin Radiant Wing-Fins** behind Sera Venn:
  - **`HELIX-04 Ω`**: `+28` Max Chrono Ward; Perfect Parry `[Q]` expands to `5.2m` (`40` DMG, `+32` Stagger) and restores `+16` Ward.
  - **`THE CHOIR Ω`**: `+22%` Echo Convergence DMG; Echo `[Y]` / Convergence emits a `6.4m` Acoustic Pulse (`32` DMG, `+24` Stagger, `+18` Twin-Sync).
  - **`THE CURATOR Ω`**: `+30%` Stagger/Weakpoint DMG; Empowered Heavy pulls within `5.6m` (`1.9m` pull) and extends Weakpoint Break by `+1.5s`.
  - **`MATRON-V Ω`**: `+32%` Nanite `[6]` healing (`55` HP); Finishers `[F]` & Weakpoint hits (`0.9s` ICD) siphon `+9` HP and `+10` Ward.
  - **`WARDEN PRIME Ω`**: `+20%` All-Weapon DMG, `+22` Max Chrono Ward, `+30%` Overdrive gain; Stasis Overdrive `` [`] `` unleashes an `8.0m` Judgment Nova (`62` DMG, `+48` Stagger).

### ⚡ `LYS-04 × Boss Core` Harmonic Confluence & Active `[9]` Sovereign Confluence Burst
- **Automatic Confluence Doctrines**: Pairing an active `LYS-04` Sentinel (`[8]`) with any equipped Boss Core activates a live **Harmonic Confluence Doctrine** tracked in real time on the Effective Build Telemetry bar:
  - **`AEGIS × Core` (`Bastion Confluence`)**: `+10` (`+15` `Ω`) Max Chrono Ward & `+20%` Ward regeneration speed (`108` Max Ward with Sovereign `3/3 MK.II` Rig + `HELIX-04 Ω`).
  - **`INTERCEPTOR × Core` (`Sovereign Barrage`)**: `+8%` (`+12%` `Ω`) All-Weapon DMG & `+18%` Sentinel autonomous fire cadence.
  - **`HARMONIC × Core` (`Paradox Resonance`)**: `+15%` (`+20%` `Ω`) Flux generation & `-10%` Relay/Pin/Collapse Flux cost.
- **`[9]` Sovereign Confluence Burst (`TUYỆT KỸ HỢP LƯU [9]`)**: Combat actions (`+7%` hit, `+18%` parry, `+20%` convergence, `+24%` finisher) charge a `0–100%` Confluence meter (`14.0s` cooldown) that unleashes a doctrine-matched ultimate shockwave/barrage with procedural Web Audio synths, 3D shockwave rings, and localized `EN`/`VI` callouts.
- **100% Vietnamese UI Polish**: Completed `VI` localization across `TitleScreen.tsx` and `StatusModal.tsx` (`SKIN KHUNG CHRONO 3D`, weapon roles & unlock hints, and all `12` Practice & Boss Training Arena encounters).

---

## [`3.4.0`] — Boss Echo Paradox & Multi-Department Studio Pipeline (5 Sovereign Boss Echo Cores, 3D Dorsal Boss Core Sigil Rig, Live Effective Build Telemetry & Complete VI/EN Combat Callout Localization)

### 💎 5 Sovereign Boss Echo Cores (`LÕI VỌNG ÂM THỐNG LĨNH`)
- **Boss Trophy Harvesting (`0◆`) & Early Bench Synthesis (`3◆ / 4◆`)**: Defeating each Chapter Warden in Nadir-9 automatically harvests its Sovereign Boss Echo Core for free (`0◆`), or operatives can synthesize any core early in the Armory (`[U]` / Title Screen) to forge specialized endgame combat builds:
  - **`HELIX-04` · Helical Bastion Core**: `+20` Max Chrono Ward; Perfect Parry `[Q]` unleashes a `4.0m` Helical Counter-Lance (`28` DMG, `+24` Stagger) and restores `+10` Ward.
  - **`THE CHOIR` · Harmonic Chime Core**: `+15%` Echo Convergence DMG; deploying Echo `[Y]` or landing Convergence emits a `5.2m` Acoustic Pulse (`22` DMG, `+18` Stagger, `+12` Twin-Sync).
  - **`THE CURATOR` · Archive Singularity Core**: `+22%` DMG vs Staggered/Weakpoint foes; Empowered Heavy hits pull enemies within `4.5m` inward (`1.4m` vortex pull) and extend Weakpoint Break by `+1.0s`.
  - **`MATRON-V` · Surgical Siphon Core**: `+20%` Nanite `[6]` healing (`50` HP); Execution Finishers `[F]` and Weakpoint hits (`1.2s` ICD) siphon `+6` Integrity and `+6` Chrono Ward.
  - **`WARDEN PRIME` · Sovereign Directive Core**: `+14%` All-Weapon DMG, `+15` Max Chrono Ward, `+20%` Overdrive charge gain; activating Stasis Overdrive `` [`] `` unleashes a `6.5m` Judgment Nova (`45` DMG, `+35` Stagger).

### 🛠️ Studio Pipeline Architecture, 3D Dorsal Sigil & 100% Vietnamese Combat Localization
- **Multi-Department Game Studio Architecture (`v1.3.0`)**: Integrated structured multi-department game studio governance (`project.yaml`, `design/game-brief.md`, `design/gdd/boss-echo-cores-and-synergy.md`, `production/session-state/active.md`, `production/polish/v3.4.0-team-polish-report.md`, and `.claude/` specialized department agents, skills, hooks, and path-scoped coding rules).
- **4-Part 3D Dorsal Boss Core Sigil & Live Build Synergy Telemetry**: Added a pre-allocated, zero-GC 4-part floating crystal & counter-rotating orbital ring sigil mounted behind Sera's Chrono Rig tinted per equipped Boss Core, paired with a `tabular-nums` **Live Effective Build Telemetry** strip (`Total DMG ×`, `Max Chrono Ward`, `Skill Flux Cost %`, `Overdrive Gain %`) and complete `VI` localization across all 3D combat callouts, enemy status/modifier badges, hazard vents, and Armory status headers.

---

## [`3.3.0`] — Chrono Aegis & Sovereign Rig (LYS-04 Chrono Sentinel Companion Drone, Regenerative Chrono Ward Shield, Rig Chassis `MK.II` Overclocking & 3-Slot Sovereign Rig Set Synergy)

### 🛸 LYS-04 Chrono Sentinel Companion (`DRONE ĐỒNG HÀNH LYS-04 [8]`) & Regenerative Chrono Ward
- **Switchable 4-Mode Orbital Companion (`[8]` / Armory)**: Dr. Lysa Venn's Bay 04 calibration drone now orbits Sera's right shoulder in 3D space with mode-tinted halo rings and zero-cost live tactical switching (`[8]` or HUD badge):
  - **`AEGIS` (`HỘ VỆ`)**: Grants **`+30` Regenerative Chrono Ward** (absorbs incoming damage before hull Integrity and recharges `6.5/s` after `3.4s`), projects a 3D emerald-cyan Honeycomb Shield Dome around Sera, and unleashes a **`4.2m` `+20 Stagger` shockwave** whenever Ward shatters from `>= 15`.
  - **`INTERCEPTOR` (`PHÁO`)**: Grants **`+10` Chrono Ward** and autonomously fires 3D cyan plasma bolts every `2.2s` (`1.4s` during Stasis Overdrive) at threats within `11.5m` for `14` DMG, `+9` Stagger, and `+3` Flux.
  - **`HARMONIC` (`ECHO+`)**: Grants **`+15` Chrono Ward**, `+20%` Echo Convergence damage, `+25%` Twin-Sync charge gain, `+4 Flux / 2.5s` while Echo is recording or replaying, and unlocks **Phantom Afterimage Strikes (`+32%` bonus echo-shear damage + `+10` Stagger)**.

### 🛡️ Chrono Rig Chassis `MK.II` Overclock & 3-Slot Full-Rig Set Synergy
- **Rig Module `MK.II` Overclock (`1` Memory Fragment)**: All `9` Chrono Rig Chassis Modules (`Temporal Core`, `Defensive Chassis`, `Tactical Harness`) can now be overclocked to **`MK.II`**, boosting primary perks by **`+35%`** while cutting tradeoff penalties by **`-50%`**.
- **Chrono Rig Set Synergy (`2/3` → `3/3` → `3/3 MK.II` Sovereign Rig Overdrive)**:
  - **Duo Chassis Link (`2/3`)**: `+6%` All DMG, `+10` Max Chrono Ward, `+8%` Flux gain.
  - **Triad Chassis Sync (`3/3`)**: `+12%` All DMG, `+20` Max Chrono Ward, `+15%` Flux gain, `-10%` Relay/Pin/Collapse Flux cost.
  - **Sovereign Rig Overdrive (`3/3 MK.II`)**: `+20%` All DMG, `+35` Max Chrono Ward (stacking up to `65` regenerative Ward with `AEGIS`), `+20%` Flux gain, `+25%` Sentinel fire & Ward regen speed, `-20%` Skill Flux cost, and permanent **Phantom Afterimage Strikes**.

---

## [`3.2.0`] — Chronicle Awakening (Canonical Loop #413 Storyline Unification, Full VI/EN Narrative & Equipment Localization, Chronicle Stance Doctrine Passives & Mythic MK.III Awakening Forge)

### 📖 Canonical Loop `#413` Storyline & Full Bilingual (`VI / EN`) Localization
- **Unified `Loop #413` (`412 Prior Calibration Loops`) Continuity**: Harmonized every chapter brief, timeline node, ending epilogue, and crew testimony across the entire codebase around Sera Venn's `413th` awakening.
- **Complete Vietnamese (`VI`) & English (`EN`) Localization**: Localized all 6 interactive Story Signal Arcs (`18` crew lines & `18` moral choices), all `26` live Comms Codec transmissions, Campaign Chapter Select drawer, HUD Objective guidance, Campaign Intro transmission, and all `10` Weapon Mods, `9` Rig Chassis Modules, and `4` Suit Neural Protocols.

### ⚔️ Chronicle Stance Doctrine & Mythic `MK.III` Awakening Forge
- **Chronicle Stance Doctrine (`HỌC THUYẾT TƯ TƯỞNG`)**: Every moral Story Signal choice (`Defiance / Empathy / Pragmatism`) now permanently empowers Sera's combat build (`Defiance`: `+3%` All DMG & `+6%` Stagger/pt + Sovereign `BREAKER’S WRATH`; `Empathy`: `+5` Max HP & `+3` Parry HP/pt + Sovereign `LYSA’S AEGIS`; `Pragmatism`: `-6%` Weapon Heat & `+10%` Flux gain/pt + Sovereign `ARCHITECT’S CALCULUS`) and unlocks a personalized Stance Coda in the Chronicle Loom ending epilogue.
- **Mythic `MK.III` Awakening Forge & In-Game Socket Chips**: Overclocked `MK.II` Weapon Mods can now be forged to **`MK.III MYTHIC AWAKENED`** (`2` Memory Fragments) for `+8%` bonus weapon damage, `+10%` stagger, `-2` heat cost, `+2` Flux per hit, harmonic audio chime, and emerald-gold aura sparks, alongside full mid-run Weapon Mod Chip socketing (`[U]`).

---

## [`3.1.0`] — Chrono Resonance Forge (Dual-Weapon Flash Swap Resonance Pairings, Global Arsenal Mastery Sync Passives & Dynamic Arena Resonance Surge VFX)

### ⚡ Dual-Weapon Flash Swap Resonance Pairings (`CỘNG HƯỞNG CẶP VŨ KHÍ [1–5]`)
- **4 Signature Mid-Combo Swap Synergies**: Performing a Flash Swap (`[1–5]` right after landing a hit) between distinct weapons now unleashes a tailored Dual-Weapon Resonance effect (`3.5s` cooldown) with color-coded 3D shockwave bursts, subtle FOV punch, and harmonic Web Audio cues:
  - **Blade Reaper (`Chrono Edge ↔ Chrono Scythe`)**: `+20% DMG`, `+22% Stagger`, and `+10 Flux` surge for `3.2s`.
  - **Plasma Overload (`Pulsecaster ↔ Phase Rail`)**: Instant `-35 Heat` thermal vent (breaking overheat lockout) + `+18%` Ranged DMG for `3.2s`.
  - **Seismic Vortex (`Grav-Breaker ↔ Edge / Scythe`)**: Unleashes an immediate `4.4m` gravity pull shockwave (`+22 Stagger`) + `+15% DMG` for `3.2s`.
  - **Temporal Shift (`Any Melee ↔ Any Ranged`)**: `+14% DMG`, `+16% Stagger`, `-15 Heat`, and `+8 Flux` for `3.0s`.
- **Global Arsenal Mastery Sync (`ĐỒNG BỘ TINH THÔNG KHO ĐỒ`)**: Every Weapon Mastery Rank earned across all 5 weapons now contributes to permanent account-wide damage, stagger, and Flux bonuses, displayed live inside the Upgrade Bench alongside the 4-card Dual-Weapon Resonance schematic.

---

## [`3.0.0`] — Chrono Nexus (Unified Cross-System Combat Link Engine, Permanent Chronicle Resonance Passives, 7-Node Causal Story Timeline & 3D Diegetic Constellation Mandala Aura)

### 🔗 Unified Chrono Nexus Synergy & Closed-Loop Combat Linking
- **4-System Chrono Nexus Escalation (`DUAL ×2 / TRI ×3 / APEX ×4`)**: Dynamically links Weapon Kinetic Overcharge, Echo Twin-Sync, Chrono Momentum/Weakpoint Break, and Flash Swap/Phantom Riposte into a single multiplicative combat ladder (`+10% / +20% / +32% DMG`, `+15% / +30% / +50% Weapon Mastery XP`), unleashing an automatic 4.0s radial stagger pulse (`+15 Stagger` within `4.8m`) at `TRI-NEXUS ×3+` and a `+12%` Stasis Overdrive burst upon reaching `APEX NEXUS ×4`.
- **Direct Cross-System Combat Bridges**:
  - **Perfect Parry `[Q]`** extends active Chrono Momentum streak (`+1.5s`) and boosts active Echo Twin-Sync (`+14%`).
  - **Flash Swap `[1–5]`** refreshes active Weakpoint Break windows (`+1.2s`) so mid-break weapon swaps chain directly into burst finishers.
  - **Chrono Execution Finisher** directly feeds Stasis Overdrive (`+18%` scaled by Chronicle passives) and awards `+15` Weapon Mastery XP scaled by Nexus tier.
- **Permanent Chronicle Resonance Passives**: Campaign Archive Logs (`2+ Logs`: `+2%` Integrity & `+3%` Overdrive Charge Rate per log) and Cleared Chapters (`+2%` All-Weapon Damage per chapter) now connect directly into live combat scaling and are displayed live inside the Upgrade Bench.

### 🎨 3D Diegetic Chrono Nexus Constellation Aura & Story Timeline
- **3D Rotating Constellation Mandala (`ShaderMaterial`)**: Projects an additive geometric resonance mandala beneath Sera Venn whenever 2+ combat systems link, scaling and shifting hue across Dual Nexus (cyan) → Tri-Nexus (violet) → Apex Nexus (radiant gold), accompanied by dual Web Audio harmonic chords and radial stagger shockwaves.
- **7-Node Interconnected Chronicle Link Chain (`00 THỨC TỈNH → 06 ECHO-ZERO`)**: Added a unified causal timeline and Combat Synergy Loop schematic inside the Pause/Telemetry console linking every chapter clue, Lysa Venn's trail, and combat progression step.

---

## [`2.9.0`] — Chrono Singularity Apex (Weakpoint Break & Chrono Momentum Streak Engine, 3D Volumetric Orbital Light Shafts, Animated Holographic Floor Scan Pulse & Diegetic Weakpoint Halo)

### ⚔️ Weakpoint Armor Break (`PHÁ GIÁP LÕI`) & Chrono Momentum (`×1.25 / ×1.5 / ×2.0`)
- **4.5s Weakpoint Break Window (`+20% DMG`)**: Breaking enemy or Boss posture (`Stagger` / `Core Exposed`) opens a golden Weakpoint Break window granting `+20%` follow-up damage, `+18%` Kinetic Overcharge, `+18%` Echo Twin-Sync, and `+26 Style`.
- **Dynamic Chrono Momentum Streak (`1.0× → 1.25× → 1.5× → 2.0×`)**: Chaining kills, executions, and posture breaks within `7.0s` ramps up Sera's Momentum tier (`+8% / +16% / +25%` damage, `+15% / +30% / +50%` Style gain) and awards bonus Memory Fragments when pushing into `APEX (×1.5)` and `SINGULARITY (×2.0)` streaks.

### 🎨 3D Volumetric Lighting & Diegetic Arena Shaders
- **4 Volumetric Overhead Orbital Light Shafts (`ShaderMaterial`)**: Added Fresnel-softened additive volumetric spotlight cones angled down onto the central combat ring, tinted dynamically by chapter atmosphere, Boss Phase II, and Weakpoint Break windows.
- **Animated 3D Holographic Arena Floor Scan Pulse**: Added a subtle radial GLSL scanner sweep gliding outward across Nadir-9's machined deck floor with zero per-frame allocations.
- **Diegetic 3D Weakpoint Execution Halo**: Projects a crisp rotating segmented gold-amber holographic crosshair ring directly beneath staggered enemies and exposed bosses so execution & burst opportunities read instantaneously in 3D space.

### 🖥️ Final Vietnamese (`VI`) Combat HUD & Armory Modal Polish
- **Complete Localization Sweep**: Localized remaining live combat buttons (`[G] GHIM`, `[X] KÍCH NỔ`, `ĐÃ HIỂU`), Weakpoint/Momentum floating pills (`PHÁ GIÁP +20%`, `XUNG KÍCH / ĐỈNH CAO / KỲ DỊ`), modal session kickers (`LIÊN ĐẤU BOSS · ẢI 1/5 · TẠM DỪNG`), weapon category labels (`CẬN CHIẾN`, `TẦM XA`, `TRƯỜNG THƯƠNG`), mastery rank prefix (`BẬC`), and empty Rig module slots (`TRỐNG`).

---

## [`2.8.0`] — Chrono Ascendancy (Echo Twin-Sync Synergy & Pincer Flanking, 3D Orbital Atmospheric Motes & GLSL Plasma Tether Beam, Full Vietnamese HUD & Upgrade Bench Parity)

### ⚡ Echo Twin-Sync Synergy (`ĐỒNG BỘ SONG ẢNH`) & Chrono Execution Flow
- **3-Tier Echo Twin-Sync Resonance (`0→100%`, Tiers `I / II / III`)**: Coordinated attacks between Sera Venn and her active Chrono Echo charge Twin-Sync live (`SYNC I`: `+15% dmg / +8% stagger`, `HARMONIC II`: `+25% dmg / +14% stagger`, `SINGULARITY III`: `+35% dmg / +22% stagger`), visually tracked inside the Echo Dock whenever the tether is active.
- **Pincer Flanking Bonus (`GỌNG KÌM`)**: Striking an enemy from opposite flank angles with Sera and her Echo within `1.25s` awards `+28%` Twin-Sync and `+20 Style`, punctuated by gold-cyan spark bursts and Web Audio synth chimes.
- **Chrono Execution Finisher Synergy**: Executing staggered enemies now awards `+35%` Weapon Kinetic Overcharge, `+30%` Twin-Sync, `+42 Style`, and unleashes a dual gold-cyan GLSL shockwave burst.

### 🎨 3D Volumetric Atmosphere & GLSL Twin-Sync Plasma Tether
- **160-Particle 3D Orbital Atmospheric Motes (`ShaderMaterial`)**: Added GPU-animated soft bokeh floating dust/data motes across the arena volume dynamically tinted by the active chapter palette (`cyan`, `emerald`, `violet`, `crimson`, `gold`) with zero per-frame allocations.
- **Live GLSL Twin-Sync Plasma Tether Beam**: Added an additive animated energy sheath connecting Sera's Chrono Rig and her active Echo's Chrono Rig, pulsing with traveling harmonic waves and shifting color from cyan (Tier I) → indigo (Tier II) → radiant gold (Tier III).

### 🖥️ Complete Vietnamese (`VI`) UI/UX & Combat HUD Declutter
- **Zero Tutorial Clutter in Gauntlet & Daily Trial**: Automatically hides the bottom-center tutorial brief bar during Boss Gauntlet and Daily Trial runs so combat framing remains razor-clean.
- **Complete `EN / VI` Parity**: Localized Boss Bar status badges (`GIÁP LÕI / LỘ LÕI`, `GIAI ĐOẠN I / II`), Echo Dock idle & Twin-Sync readout (`SONG ẢNH`), Bottom-Right weapon status (`ĐÒN MẠNH [E]`), Modal Top Telemetry bar (`THỜI GIAN`, `ĐỊCH`, `SÁT THƯƠNG`, `ĐỠ ĐÒN`, `MẢNH`), and all Upgrade Bench & Chrono Rig Chassis Module action buttons (`MỞ KHÓA`, `LẮP MOD`, `THÁO`, `ÉP XUNG`).

---

## [`2.7.0`] — Chronicle Singularity (Weapon Kinetic Overcharge, 2 Chrono Scythe Signature Mods, Cohesive 6-Act Interconnected Story & 4 Earned Endings, 3-Tier Challenge Difficulty, 4-Slot GLSL Plasma Shockwave Pool & Decluttered HUD)

### ⚔️ Weapon Kinetic Overcharge & Complete 5-Weapon Upgrade Bench
- **Per-Weapon Kinetic Overcharge (`0→100%`, `6.0s` Surge)**: Hits, Parries, and Flash Swaps charge each weapon's individual Kinetic Capacitor; reaching `100%` triggers a `6.0s` weapon-specific surge (`Chrono Edge` +24% speed/+18% dmg, `Pulsecaster` zero-heat/+22% dmg, `Phase Rail` instant charge/+28% dmg, `Grav-Breaker` -30% dmg taken/+35% stagger, `Chrono Scythe` +1.9m vortex pull/+24% dmg) with Web Audio synth pulse, live HUD gauge, accelerated 3D Chrono Rig rotation, and orbital plasma sparks.
- **2 Signature Upgrade Bench Mods for Weapon 5 (`CHRONO SCYTHE`)**: Added `RIFT REAPER` (`+22%` dmg, `+0.55m` reach, `+18` heavy stagger) and `ASTRAL SIPHON` (`+3 HP` & `+4 Flux` on hit, `-6F` Empowered Vortex cost), bringing the Upgrade Bench to `10/10` balanced mods across all 5 weapons.

### 📖 Cohesive 6-Act Interconnected Story, 4 Earned Endings & 3-Tier Difficulty
- **Chronicle Story Dossier (EN/VI)**: Interconnected narrative arc across all 6 chapters tying Sera Venn (Loop #408) → Dr. Lysa Venn's disappearance → HELIX-04 redacted manifest → THE CHOIR's neural Echo revelation → THE CURATOR's confession → MATRON-V's Origin Key → WARDEN PRIME & 4 earned bilingual Epilogue Chronicles (`SILENCE`, `WITNESS`, `CONTINUITY`, and True Ending `PARADOX BREAK` via `ECHO-ZERO`).
- **3-Tier Tactical Difficulty Selector (`STANDARD / VETERAN / SINGULARITY`)**: Accessible directly from Title Screen and Pause Upgrade Bench (`VETERAN`: +30% HP, +25% dmg, +1 Frag; `SINGULARITY`: +65% HP, +50% dmg, +2 bonus Frags & intensified boss pressure).

### 🎨 3D Procedural Animation, GLSL VFX & Decluttered HUD
- **4-Slot Pooled GLSL Plasma Shockwave Ring (`ShaderMaterial`)**: Replaced single flat shockwave ring with a 4-slot additive GLSL wave-ring pool featuring electric white-hot leading edges, angular plasma harmonics, and zero-GC pooling.
- **Chrono Scythe Polearm Stance & 360° Whirl-Cleave + Enemy Stagger Shudder**: Added dedicated two-handed diagonal polearm ready stance and 360° vortex cleave heavy animation for `CHRONO SCYTHE`, plus crisp torso/head stagger shudder and hit recoil across enemies and bosses.
- **Decluttered Combat HUD / GUI**: Collapsed Top-Right utility cluster from 7 noisy micro-buttons to 3 clean buttons (`ARMORY [U]`, `MAP [N]`, `MENU [P]`), streamlined the Souls-like Boss Bar, hid story signal clutter during active boss fights, removed the duplicate `TAB → PULSE` button, and integrated the sleek Kinetic Overcharge bar directly into the Bottom-Right Arsenal Card.

---

## [`2.6.0`] — Chrono Singularity (Flash Swap Combo-Cancel, Hit Combo Chain Milestones, Phantom Riposte, Custom GLSL Energy Slash Shaders, Full Sovereign Boss PBR & Zero-GC Runtime Optimization)

### ⚡ Chrono Singularity Combat Engine
- **Flash Swap Combo-Cancel (`[1–5]` / `[Tab]` within `0.95s` post-hit, `3.0s` CD)**: Switching weapons immediately after landing a strike cancels attack/parry recovery frames, awards `+12 Flux` and `+18 Style`, unleashes a cyan-gold 3D warp shockwave, and arms a `3.2s` empowered strike window (`+22%` damage, `+18%` stagger).
- **Live Hit Combo Chain & Milestones (`10× / 20× / 30× / 50× HITS`)**: Tracks unbroken offensive streaks (`3.8s` decay) with milestone Flux & Style bursts, 3D radial milestone aura pulses, Web Audio harmonic chimes, and floating HUD chain readouts.
- **Phantom Riposte**: Executing a Perfect Dodge (Chrono Slip) arms a `2.8s` **Phantom Riposte** counter window granting `+30%` damage and `+20` bonus stagger on Sera's next strike — stackable with Flash Swap for high-skill burst combos.

### 🎨 3D Shader & Sovereign Boss PBR Material Upgrade
- **Custom GLSL Energy Slash Ribbon Shader**: Replaced flat basic slash arcs with a procedural additive GLSL shader featuring white-hot outer cutting edges, angular crescent tapering, and internal energy streak harmonics.
- **Sovereign Boss & Heavy Armor PBR Upgrade**: Upgraded `HELIX-04`, `THE CHOIR`, `THE CURATOR`, `MATRON-V`, and `Aegis Bastion` armor materials with paired brushed-titanium bump + roughness maps and calibrated `envMapIntensity` (`1.15–1.32`).

### 🚀 Zero-GC Runtime Optimization & Bilingual Polish
- **Zero-Allocation Combat Loop**: Pre-allocated directional scratch vectors for Combat Drone fire tracers, shared a single unit `CircleGeometry` across enemy contact shadows with `sharedAsset` disposal protection, and shielded cached PBR textures from per-rig disposal.
- **Bilingual (`EN / VI`) HUD & Modal Parity**: Added live Singularity combat indicators (`×N HITS`, `FLASH SWAP +22%`, `PHANTOM RIPOSTE +30%`), localized Echo dock controls (`GHI / GỌI / DỊCH / XÓA`), and localized Pause/Victory/Defeat modal headers, tabs, and action buttons.

---

## [`2.5.0`] — Apex PBR, Map Material & UI/UX Overhaul (Studio HDR IBL, Brushed Titanium PBR Textures, Sleek 3-Tier Title & Borderless Combat HUD, Complete EN/VI Parity, Gameplay & Photo Mode Fixes)

### 🎨 3D PBR Material, Lighting & Arena Map Overhaul
- **Orbital Sci-Fi Studio IBL & Lighting Calibration**: Replaced flat bright ambient washout with a procedural `512×256` high-contrast Orbital Studio equirectangular PMREM reflection map, balanced `PCFSoftShadowMap`, warm directional key light, crisp cyan/amber rim light separation, and unified GPU/Software-WebGL environment intensity across all 6 chapters.
- **High-Res Brushed Titanium & Machined Deck PBR**: Upgraded arena floor deck textures to `1024×1024` machined titanium-slate plates with inner AO edge depth, corner fasteners, recessed ventilation grates, and paired high-contrast bump & roughness maps; added cached `512×512` directional brushed-armor bump and `256×256` roughness maps across Sera Venn and arena architecture to eliminate plastic/flat shading.
- **Refined 3D Combat VFX**: Re-sculpted the `Style SSS Crest` into sleek extruded metallic-gold & translucent cyan pinion blades and rebuilt the `Chrono Finisher Rift` with razor-thin dual orbital rings, hollow translucent ground shockwave, and diamond-tapered slash blades.

### 🖥️ Title Screen & In-Game HUD Layout Redesign + Full Bilingual (`EN / VI`) Parity
- **3-Tier Title Screen Hierarchy**: Reorganized the Title Screen left rail into a clean Hero Primary CTA (`CONTINUE / NEW CAMPAIGN`), symmetrical `2×2` Mode Grid (`Expedition + NG+`, `Daily Trial`, `Boss Gauntlet`, `Recursion + Overdrive`), and unified 4-tab bottom navigation bar (`Chapters`, `Practice`, `Armory & 3D`, `Settings`) while slimming the right-side briefing card so Sera's 3D showcase breathes cleanly.
- **Borderless Tactical HUD**: Streamlined the Boss Bar (`max-w-[404px]`), unified Top-Right utility cluster in cohesive dark obsidian styling, converted the Style Rank panel into sleek floating borderless typography beneath the Radar, and moved the Kill-Cam & Chrono Finisher banners to `top-[116px]` so they never block Sera in center frame.
- **Complete `EN / VI` Localization**: Achieved full English/Vietnamese parity across all Title Screen cards, mode descriptions, controls legend, and HUD controls.

### 🛠️ Bug Fixes & UX Polish
- **Separated Chrono Finisher & Boss Kill-Cam**: Fixed Chrono Finisher triggering the Boss Kill-Cam banner prematurely.
- **Photo Mode Pointer Isolation & State Cleanup**: Stopped slider/dock pointer & wheel events from orbiting the 3D camera in Photo Mode and ensured Photo Mode automatically exits when leaving active gameplay.

---

## [`2.4.0`] — Chrono Ascension (Style Rank `D–SSS` & Chrono Finisher `[7]`, Daily Chrono Trial, 5th Weapon `CHRONO SCYTHE` `[5]` + 3 Weapon Mod Socket Chips, Bilingual `EN / VI` & 3D Photo Drone Mode `[F9]`)

### ⚡ Style Rank System (`D → C → B → A → S → SSS`) & Cinematic Chrono Finisher (`[7]`)
- **Live Combat Style Grading**: Tracks hit-free streaks, attack variety bonuses, parries, Convergences, and weapon swaps from `D (DISSONANT)` up to `SSS (PARADOX ASCENDANT)` with up to `+25%` Style Damage Multiplier and dynamic music escalation.
- **3D Holographic Style SSS Crest & Chrono Finisher Rift**: Reaching `S`/`SSS` unfurls a twin-wing golden holographic `STYLE SSS CREST` behind Sera's Chrono Rig and arms **Chrono Finisher (`[7]` / HUD Button)**, unleashing a 3D golden-cyan temporal rift shockwave (`135` AoE damage, massive stagger & `+25` Flux).

### 📅 Daily Chrono Trial (Deterministic Date-Seeded Boss Challenge)
- **Daily Seeded Protocol (`TRIAL-YYYYMMDD`)**: Every calendar day deterministically rotates the target Sovereign Boss, 2 Chrono Mutators, and a starting Chrono Relic with local Personal Best score, rank, and time tracking.
- **3D Daily Trial Obelisk**: Sculpted directly into the Safe-Room Hub with obsidian fluted pedestal, floating brass astrolabe rings, and rotating holographic calendar prism.

### ⚔️ 5th Weapon: `CHRONO SCYTHE` (`[5]`) & 3 Equippable Weapon Mod Socket Chips
- **`CHRONO SCYTHE` Temporal Polearm (`[5]`)**: Sculpted titanium-obsidian staff with glowing cyan crescent arc blade and rotating gold halo ring; features a 3-hit wide sweeping cleave and a Heavy **Temporal Vortex Pull** (`5.4m` pull radius).
- **3 Live 3D Dorsal Weapon Mod Socket Chips**: Socket **Volt Arc Chip** (chain lightning `+12 dmg`), **Siphon Leech Chip** (on-hit Integrity leech), or **Chrono Nova Chip** (astral-gold AoE explosion on Heavy & Finisher) — rendered live on Sera's Chrono Rig dorsal core.

### 🌐 Bilingual Support (`EN / VI`) & 3D Free-Camera Photo Mode (`[F9]`)
- **Instant English / Vietnamese Switch (`EN / VI`)**: Persisted across sessions on Title Screen, HUD, Style Rank titles, Mod Chips, Daily Trial, and Photo Mode.
- **3D Free-Camera Photo Drone Mode (`[F9]`)**: Freezes combat while orbiting Sera in 360° with drag/WASD, Zoom & FOV sliders, 5 Color Grade presets (`Standard`, `Noir`, `Cyber Cyan`, `Paradox Violet`, `Golden Hour`), toggleable orbiting **3D Photo Drone Lens**, Hide UI mode, and instant synchronous `.png` capture.

### 🎨 Sheet 14 Sculpted 3D Models (112 Built-In 3D Assets Live In-Game)
- Added **Sheet 14 · Chrono Ascension (8)** to the Visual Archive Gallery and sculpted all 8 assets live in Three.js: **Chrono Scythe**, **Volt Arc Chip**, **Siphon Leech Chip**, **Chrono Nova Chip**, **Style SSS Crest**, **Daily Trial Obelisk**, **Chrono Finisher Rift**, and **Photo Drone Lens**.

---

## [`2.3.0`] — Paradox Break (Combat Juice, Tactical Drone & Fabricator, Secret 6th Boss `ECHO-ZERO`, 12 Achievements, 5 Live 3D Rig Skins, Mutators & Speedrun Splits)

### 💥 Combat Juice & Active Tactical Loadout
- **3D-Projected Floating Damage Numbers**: Every melee hit, critical/heavy strike, Resonance Convergence (`⚡`), Parry (`PARRY +N`), and Combat Drone bolt (`DRONE N`) projects in real time from the 3D world impact coordinates onto the viewport.
- **Boss Kill-Cam Slow-Mo (`0.24×` for `1.2s`)**: Delivering the killing blow to any Sovereign Warden or `ECHO-ZERO` dilates simulation time with a dramatic Kill-Cam banner and audio cue.
- **Med-Nanite Injector (`[6]` / `[B]` / HUD Button)**: Restores `+42` Integrity and `+18` Chrono Flux on demand (2 starting charges, 3 max; disabled under the Ironman Protocol mutator).
- **Field Fabricator Shop (Safe-Room Hub & Armory Modal)**: Spend Memory Fragments on **Med-Nanite Refill** (`1F`), **Aegis Shield Cell** (`+40` reactive 3D bubble shield, `2F`), **Overclock Core** (`+25%` damage for the next sector, `2F`), **Combat Drone Mk.I** (`3F`), and **Combat Drone Mk.II** (`4F`).
- **Autonomous 3D Combat Drone Wingman**: Orbits Sera with twin plasma blasters and rotating halo, auto-firing bolts (`11 dmg + 2 Flux` Mk.I; `17 dmg + 4 Flux` Mk.II) with laser beam tracers and triggering an emergency `+25 Aegis Shield` when Sera drops to `≤35%` HP (Mk.II).

### ⚡ Secret 6th Super-Boss `ECHO-ZERO` (Mirror-Sera) & 4th Hidden Ending (`PARADOX BREAK`)
- **Paradox Rift Gate (3D Safe-Room Portal & Practice Arena)**: Unlocks in Safe-Room Hub via NG+, opening ≥2 Secret Echo Vaults, or defeating `ECHO-ZERO` once — and is also directly accessible in the Practice & Boss Training Arena.
- **Mirror-Sera Sovereign Encounter (`920 HP`)**: Wields 3 signature attacks (`paradox_blink_slash`, `paradox_rail_lance`, `paradox_twin_pincer`) rendered in Void-Violet, Astral Gold, and Twin Paradox Halo Rings.
- **4th Hidden Ending (`PARADOX BREAK`)**: Defeating `ECHO-ZERO` permanently unlocks the `PARADOX BREAK` ending badge, awards `+5` Memory Fragments, unlocks the `PARADOX BREAKER` achievement, and unlocks the exclusive **PARADOX PRISM** 3D Rig Skin.

### 🏆 12 Chrono Achievements, 5 Live 3D Rig Skins, 4 Mutators & Live Speedrun Split Timer
- **5 Live 3D Rig Skins**: `NADIR STANDARD`, `SOVEREIGN PRIME` (Gold), `WARDEN CRIMSON`, `PHANTOM EMERALD` (2 achievements), and `PARADOX PRISM` (defeat `ECHO-ZERO` or 5 achievements) — repainting Sera's 3D armor, undersuit, visor, halo, and Chrono blade live on both the Title Screen and in combat.
- **12 Chrono Achievements with Live HUD Toast**: Tracked and persisted across sessions with instant amber-gold HUD notifications.
- **4 Custom Chrono Mutators + Live Speedrun Split Timer**: Toggle **Glass Cannon** (`2×` dmg both ways, `+25%` Frags), **Infinite Echo** (`0s` Echo CD, `+15%` Frags), **Hyper-Pace 1.3×** (`+25%` Frags), and **Ironman Protocol** (no heals, `+35%` Frags), plus a live **Speedrun Split Timer HUD** tracking sector splits and `+/-` Personal Best deltas.

### 🎨 Sheet 13 Sculpted 3D Models (104 Built-In 3D Assets Live In-Game)
- **ECHO-ZERO (Mirror-Sera Boss)**: Dedicated sleek humanoid obsidian-violet & brushed gold boss rig with glowing magenta V-visor, dual crossed pairs of rotating golden-violet Chrono Halo rings behind both shoulders, and right-hand violet-gold twin-fullered phase-blade.
- **Combat Drone Mk.II**: Upgraded wide swept manta-winged white ceramic & gold V-frame chassis, amber wingtip vent slits, pulsing twin orange-gold rocket exhaust cones, cyan oval eye-sensor, twin under-slung boxy cyan plasma micro-blasters, and elevated horizontal cyan holographic halo ring.
- **Field Fabricator Kiosk & Paradox Rift Gate**: Added the tall ceramic/slate **Field Fabricator Kiosk** in the Safe-Room Hub (gold side nozzle arms, 3 amber/orange/cyan canister slots, floating amber-gold weapon blueprint hologram) and upgraded the **Paradox Rift Gate** with a crescent gold-trimmed pedestal, circular filigree arch, swirling violet-magenta/astral-gold spiral vortex, and 8 orbiting faceted violet crystal shards.
- **Tactical Loadout & Skin 3D Geometry**: Added Sera's holstered **Med-Nanite Injector** canister (emerald liquid core, gold trigger wings, cyan medical cross cap), **Aegis Shield Hex Emitter Hub + Cyan Honeycomb Geodesic Dome**, **Sovereign Prime Radiant Golden Crown Halo (4 star-spurs)**, and **Paradox Prism Crystal Shoulder Shards + Helmet Ear-Fins**, plus registered **Sheet 13 · Paradox Break (8)** in the Visual Archive Gallery.

---

## [`2.2.0`] — Safe-Room Intermission Hub, Secret Echo Vault Puzzles, 6-Sector Station Map & New Game+

### 🛡️ Pressurized Transit Safe-Room Hub (`phase === 'safe_room'`)
- **Calm Intermission Between Sectors**: Stepping through an unlocked North Sector Transit Airlock now brings Sera into an enemy-free **Pressurized Transit Hub** before launching the upcoming Sector.
- **3 Interactive 3D Field Stations (`createSafeRoomHubRig`)**:
  - **Med-Supply Bay** `(-5.2, 2.2)` — `[I]` or HUD `MED BAY [I]` restores `100%` Integrity, `100` Flux, and `+35%` Chrono Overdrive charge.
  - **Lysa Venn Hologram Console** `(5.2, 2.2)` — `[I]` or HUD `LYSA INTEL [I]` delivers sector-specific tactical counterplay intel for the upcoming Sovereign Warden plus `+1` Bonus Memory Fragment.
  - **Field Refit Workbench** `(0, 1.4)` — `[U]` opens the Armory & Upgrade Bench to spend fragments and swap Rig Modules before departing through the North Departure Airlock.

### 🔐 Secret Echo Vault & Laser Switch Puzzles (`Sectors 01–05`)
- **Spatial Chrono-Echo Puzzle (`createSecretEchoVaultRig`)**: Every combat sector spawns a **West Echo Switch Pad** connected via an illuminated deck power conduit to a crimson laser-sealed **East Secret Relic Vault**.
- **Dual Solution Support**: Leave an active **Chrono Echo (`[T]/[Y]`)** on the Switch Pad to hold the laser bars down permanently while Sera loots, or step on the pad directly to trigger a `7.0s` timed override sprint. Claiming rewards `+2` Memory Fragments (NG+ scaled), `+25%` Overdrive, `+25` Integrity, and permanently increases Station Map `% Discovery`.

### 🗺️ Interconnected 6-Sector Station Map & New Game+ (`NG+`)
- **6-Sector Station Map (`[N]` Map Tab)**: Live schematic linking all 6 sectors (`01 BAY 04 → 02 VAULT → 03 GARDEN → 04 ARCHIVE → 05 SURGERY → 06 LOOM`) with per-sector **% Discovery** bars (Caches + Lore + Secret Echo Vault), Vault completion flags, and one-click travel to unlocked sectors.
- **New Game+ (`NG+`)**: Launch from the Title Screen (`NEW GAME+`) or Campaign Victory modal to keep all upgrades, overclocks, Rig Modules, Neural Protocols, Memory Fragments, and Mastery XP with all **4 Weapons** unlocked from Sector 01, while scaling enemy/boss HP `+35%` and bonus fragments `+25%` per cycle (`NG+1`, `NG+2`...).

---

## [`2.1.0`] — Expedition Journey (6-Sector Exploration-to-Clear Path) & 3D Airlock Architecture

### 🧭 6-Sector Expedition Journey Mode (`EXPLORE → BREACH → NORTH AIRLOCK TRANSIT`)
- **Tangible Start-to-Clear Progression (`src/game/expedition-path.ts`)**: Launch directly from the Title Screen via **EXPEDITION JOURNEY** (`6-SECTOR PATH · EXPLORE → CLEAR`). Each sector begins at the **South Entry Boarding Airlock** `(0, +12.2)` facing North while hostiles and bosses remain locked in **Stasis Standby** so Sera can safely explore, loot **Memory Fragment Caches**, scan **Lore Terminals `[I]`**, activate **Sector Tactical Beacons**, and upgrade gear `[U]`.
- **Central Breach Seal (`[I]` / HUD Trigger)**: Step into the rotating gilded-cyan **Breach Seal** at `(0, 0)` and press `[I]` (or click `BREACH SEAL [I]` / strike a hostile) to shatter stasis and engage the sector squad or Sovereign Boss.
- **Physical North Sector Transit Airlock**: Clearing a sector in Chapters 0–4 unlocks the monumental **North Sector Transit Airlock** `(0, -16.4)` in blazing emerald-cyan light instead of abruptly freezing in a modal. Walk Sera physically through the unlocked portal (or click `ENTER NORTH AIRLOCK →`) to transit seamlessly across all 6 sectors (`01 BAY 04 → 02 VAULT → 03 GARDEN → 04 ARCHIVE → 05 SURGERY → 06 CHRONICLE LOOM`) to beat the game.
- **3D Holographic Floor Chevron Guide Trail & Expedition HUD**: 8 animated 3D glowing floor chevrons lead Sera toward unclaimed Caches (Gold), Lore Archives (Cyan), Beacons (Emerald), Central Breach Seal (Amber), and the unlocked North Airlock (Emerald), paired with the top-center **6-Sector Expedition Strip** and synthesized Web Audio cues.

## [`2.0.0`] — Chrono Stasis Overdrive, Sovereign Boss Gauntlet & 88 Built-In 3D Assets (Sheets 1–11)

### ⏱️ Chrono Stasis Overdrive (`[5]` / `` [`] `` / HUD Trigger)
- **Temporal Dilation Ultimate (`src/game/chrono-overdrive.ts`)**: Combat hits, parries, perfect dodges, Echo Convergences, kills, and Temporal Rift seals charge Overdrive `0–100%`. Activating unleashes **4.5s** of tactical time dilation: slows hostiles, bosses, hazards, and projectiles to **0.32×**, accelerates Sera & Echo to **1.25×**, locks weapon heat to **0**, and boosts damage **+30%** & stagger **+35%**.
- **3D Geodesic Stasis Dome & Synthesized Audio**: Renders an expanding translucent geodesic wireframe dome, counter-rotating gold/cyan astrolabe rings with 12 chrono-chevrons, floating **Chrono Stasis Core**, and procedural bass time-warp + astrolabe chime cues.

### 🏆 Sovereign Boss Gauntlet (5-Boss Rush Mode)
- **Sequential 5-Sovereign Ladder**: Fight **HELIX-04 → THE CHOIR → THE CURATOR → MATRON-V → WARDEN PRIME** back-to-back with full Chrono Rig skills unlocked, automatic arena morphing, between-boss **Field Refit** (`+35 Integrity`, `+50 Flux`, `+40% Overdrive`, `+2 Memory Fragments`), live 5-node Roman numeral HUD tracker (`I–V`), live clock, and persisted Best Clear Time & Clear Count.

### 🧊 Sheets 10–11 Complete 3D Asset & Collision Expansion (88 Built-In 3D Models)
- **Sheet 11 Overdrive & Gauntlet Props (`src/game/models.ts`, `src/game/renderer.ts`)**: Built and animated **Chrono Stasis Core**, twin **Sovereign Obelisks** (live I–V rune progression + spinning cyan crown), **Field Refit Drone** (hovering repair companion), **Overdrive Conduit** (solid floor collider + crackling cyan plasma arcs), **Phase-Blade MK.II** (radiant cyan-gold katana upgrade during Overdrive/Gauntlet/Overclock), **Singularity Grenade** (Gravity Pin `[G]` micro black-hole core), **Orbital Watchtowers** (sweeping dual-optic scanner heads), and **Quantum Archive Vault** (rotating 6-spoke golden wheel bulkhead).
- **Zero Walk-Through Solid Prop Colliders (`src/game/prop-collision-layout.test.ts`)**: Verified solid colliders and unobstructed clearances across all 6 chapters and **333+** unit tests.

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

# AFTERFRAME: THE LAST LOOP — Phase 23.1 Full Product Completion, Autonomous Audit & Release Hardening Report

- **Date:** 2026-11-05
- **Repository:** `https://github.com/ThanhNguyxnOrg/AFTERFRAME-THE-LAST-LOOP`
- **Branch:** `main`
- **Remote Baseline (`origin/main`):** `9c79d11024eb9f135d1ca31051a8dca9c1306edf`
- **Release Version:** `0.23.1`
- **Engine & Stack:** Three.js `0.186.1` + React `19.2.5` + TypeScript `7.0.0-dev` (`"strict": true`) + Vite `8.3.4` (Bun `1.4.4` packageManager / lockfile)
- **Framework:** Claude Code Game Studios (`v1.2.0`) + Superpowers Spec-Driven / TDD Workflow

---

## 1. Executive Summary

Phase 23.1 and the Post-Phase 23.1 Deep Audit continuation (Phase 23.2) complete a comprehensive, evidence-driven audit and release-hardening pass across **Domains A–I** of `AFTERFRAME: THE LAST LOOP`, building directly on top of the verified `origin/main` baseline (`9c79d11024eb9f135d1ca31051a8dca9c1306edf`) and the local Phase 21.1 / Phase 22 / Phase 23 commit stack:

1. **Superpowers Spec-Driven & TDD Execution:** Authored design specifications (`docs/superpowers/specs/2026-11-05-afterframe-phase23-1-release-completion-design.md`, `docs/superpowers/specs/2026-11-05-afterframe-post-phase23-1-deep-audit-design.md`), implementation plans (`docs/superpowers/plans/2026-11-05-afterframe-phase23-1-release-completion.md`, `docs/superpowers/plans/2026-11-05-afterframe-post-phase23-1-deep-audit.md`), and resumable progress ledgers, verifying all runtime regression tests via RED -> GREEN -> REFACTOR (**`224 / 224`** total passing tests across 4 suites).
2. **Strict TypeScript Compilation (`"strict": true`):** Enabled `"strict": true` in `tsconfig.json` and resolved nullable capability checks so `bun run lint` (`tsc --noEmit`) passes with `0` errors.
3. **Runtime Gameplay, Input, Audio, Save V2 & WebGL Fallback Hardening:**
   - **Simulation (`src/game/simulation.ts`):** `switchPlayerWeapon` unconditionally clears residual `chargeTime` and `isEmpoweredHeavy` (`Phase 23.1-A`) and cycles across all 4 weapons when a vault weapon (`phase_rail` / `grav_breaker`) is equipped in Practice/Sandbox mode while preserving the 2-weapon `chrono_edge <-> pulsecaster` toggle when cycling from a starter weapon (`Phase 23.2-A`).
   - **Save V2 Deserialization & Weapon Lock Integrity (`src/game/simulation.ts`):** Added `MAX_SAVE_JSON_CHARS = 262_144` (256 KB) and `MAX_SAVE_ARRAY_SCAN = 256` payload guards, and validated `activeCampaign.equippedWeaponId` and `bossCheckpoint.equippedWeaponId` against unlocked weapons so tampered saves cannot equip locked weapons in Campaign mode (`Phase 23.2-B`).
   - **Input (`src/game/input.ts`):** Added `KeyL` keyboard parry support alongside `KeyQ` (`Phase 23.1-B`).
   - **Audio (`src/game/audio.ts`, `src/App.tsx`):** Routed all synth nodes through `sfxGain` and `musicGain` into `masterGain`, connected `musicVolume` to musical/harmonic stingers, and made `SoundEngine.dispose()` idempotent (`Phase 23.1-C`, `Phase 23.2-D`).
   - **Renderer & Procedural Textures (`src/game/renderer.ts`, `src/game/models.ts`):** Guarded `new THREE.WebGLRenderer(...)` and all 9 `canvas.getContext('2d')` procedural texture helpers so the real `new ArenaSceneRenderer(mountEl, world)` constructor succeeds when WebGL or 2D canvas contexts are unavailable, skips unnecessary GLB fetches in fallback mode, removes `webglcontextlost`/`webglcontextrestored` listeners on dispose, and makes `dispose()` idempotent (`Phase 23.1-D` real constructor test).
   - **Accessibility & Settings (`src/components/GameHud.tsx`, `src/components/TitleScreen.tsx`, `src/components/StatusModal.tsx`):** Gated `[data-testid="low-integrity-vignette"]` on `cameraSettings.screenEffects`, and exposed `Music / Stinger Bus` (`musicVolume`) and `Screen Effects` (`screenEffects`) controls in both Title and Pause settings (`Phase 23.2-D`).
4. **CCGS v1.2.0 Registry & Release Infrastructure:**
   - Populated `design/registry/entities.yaml` (`30` entries), `docs/architecture/tr-registry.yaml` (`4` entries), and `docs/registry/architecture.yaml` (`9` entries) to full schema compliance (`bash .claude/scripts/registry.sh validate` passes with `0` errors).
   - Replaced invalid specialist names in `project.yaml` and `.claude/docs/technical-preferences.md` with verified `.claude/agents/` specialists (`systems-designer`, `ai-programmer`, `narrative-director`, `engine-programmer`, `qa-tester`).
   - Aligned `.github/workflows/ci.yml` with `bun-version: "1.4.4"` matching `package.json` (`"packageManager": "bun@1.4.4"`).

---

## 2. Domain A–I Audit Ledger & Resolutions

| Finding ID | Domain | Severity | File(s) | Description & Resolution | Status |
|---|---|---|---|---|---|
| `P23.1-SIM-01` | Domain A (Combat) | `P1` (Important) | `src/game/simulation.ts:8988-8995` | `switchPlayerWeapon` unconditionally resets `p.chargeTime = 0` and `p.isEmpoweredHeavy = false`. Covered by `Phase 23.1-A`. | **FIXED & VERIFIED** |
| `P23.1-REN-01` | Domain C (Renderer) | `P1` (Important) | `src/game/renderer.ts`, `src/game/models.ts` | `ArenaSceneRenderer` handles WebGL context failure with `[data-testid="webgl-fallback-banner"]` and `[data-testid="webgl-fallback-notice"]`, guards 2D canvas contexts in `models.ts`, skips GLB network fetches when `webglAvailable === false`, and cleans up context loss listeners in idempotent `dispose()`. Covered by `Phase 23.1-D`. | **FIXED & VERIFIED** |
| `P23.1-AUD-01` | Domain D (Audio) | `P1` (Important) | `src/game/audio.ts`, `src/App.tsx` | Routed `playHitEnemy` vulnerable chime and `playResonanceConvergence` sub-bass through `getOutputNode(ctx)` and added idempotent `SoundEngine.dispose()`. Covered by `Phase 23.1-C`. | **FIXED & VERIFIED** |
| `P23.1-INP-01` | Domain D (Input) | `P2` (Minor) | `src/game/input.ts:619-620` | Added `KeyL` to `parryJustPressed`. Covered by `Phase 23.1-B`. | **FIXED & VERIFIED** |
| `P23.2-SIM-01` | Domain C (Practice Cycling) | `P1` (Important) | `src/game/simulation.ts:8986-8994` | Cycling weapons (`[Tab]` / `[Z]`) when `phase_rail` or `grav_breaker` is equipped in Practice/Sandbox mode now cycles across all 4 weapons instead of snapping back to `chrono_edge`, while preserving 2-weapon cycling from starter weapons. Covered by `Phase 23.2-A`. | **FIXED & VERIFIED** |
| `P23.2-SAV-01` | Domain A/G (Save V2) | `P1` (Important) | `src/game/simulation.ts:6480-6765` | Enforced unlocked-weapon ownership on `activeCampaign.equippedWeaponId` and `bossCheckpoint.equippedWeaponId` during deserialization/restore and added `MAX_SAVE_JSON_CHARS = 262_144` & `MAX_SAVE_ARRAY_SCAN = 256` bounds. Covered by `Phase 23.2-B`. | **FIXED & VERIFIED** |
| `P23.2-AUD-01` | Domain I (Audio & UI) | `P1` (Important) | `src/game/audio.ts`, `src/components/GameHud.tsx`, `src/components/TitleScreen.tsx`, `src/components/StatusModal.tsx`, `src/App.tsx` | Added `sfxGain` and `musicGain` sub-buses feeding `masterGain`, wired `musicVolume` to musical/harmonic stingers, gated `low-integrity-vignette` on `cameraSettings.screenEffects`, and exposed `musicVolume` and `screenEffects` controls in Title & Pause settings. Covered by `Phase 23.2-D`. | **FIXED & VERIFIED** |
| `P23.2-CCGS-01` | Domain H (CCGS Registries & CI) | `P1` (Important) | `design/registry/entities.yaml`, `docs/architecture/tr-registry.yaml`, `docs/registry/architecture.yaml`, `.github/workflows/ci.yml` | Populated all 3 CCGS registries so `bash .claude/scripts/registry.sh validate` passes with `0` errors and aligned `.github/workflows/ci.yml` to `bun-version: "1.4.4"`. | **FIXED & VERIFIED** |
| `P23.1-CCGS-01` | Domain G (CCGS) | `P1` (Important) | `project.yaml`, `.claude/docs/technical-preferences.md` | Replaced non-existent specialist names with verified `.claude/agents/` files (`systems-designer`, `ai-programmer`, `narrative-director`, `engine-programmer`, `qa-tester`). | **FIXED & VERIFIED** |
| `P23.1-CCGS-02` | Domain G (CCGS) | `P1` (Important) | `.claude/skills/code-review/SKILL.md` | Added `ThreeJS -> engine-programmer + technical-artist (docs/engine-reference/threejs/VERSION.md)` and `.ts`/`.tsx` routing to `/code-review`. | **FIXED & VERIFIED** |
| `P23.1-CFG-01` | Domain H (Config/TS) | `P1` (Important) | `tsconfig.json`, `package.json`, `project.yaml` | Enabled `"strict": true` in `tsconfig.json`; set `"name": "afterframe-the-last-loop"` and `"version": "0.23.1"` in `package.json`. | **FIXED & VERIFIED** |
| `P23.1-CFG-02` | Domain H (SEO/Meta) | `P2` (Minor) | `metadata.json`, `index.html` | Synchronized description, OpenGraph, Twitter Card, and Schema.org `VideoGame` JSON-LD. | **FIXED & VERIFIED** |

---

## 3. Real Browser Performance Benchmarks (`playwright-cli` on `http://localhost:3000`, `1440x900`)

Measured directly in headless Chromium (`playwright-cli` against `http://localhost:3000`, `1440x900`, CPU SwiftShader WebGL):

| Scenario | Simulation `stepWorld` Avg (`ms/step`) | 25-Step Batch (`ms`) | Steady-State Rendered Frame (`ms`) | Notes |
|---|---:|---:|---:|---|
| Prologue / Calibration Bay | `0.268 ms` | `6.70 ms` | `6.40 ms` | Well within `< 1.5 ms` simulation budget |
| Multi-Enemy Combat (`tactical_temporal_disruption`, 5 enemies incl. `aegis_sentinel` + `null_weaver`) | `0.552 ms` | `13.80 ms` | `7.90 ms` | Initial shader compile frame `68.70 ms` on SwiftShader |
| Echo Recording & Playback | `0.220 ms` | `5.50 ms` | `5.40 ms` | Independent Echo track + live player |
| `helix-04` Boss Encounter | `0.228 ms` | `5.70 ms` | `4.60 ms` | Chapter I boss arena |
| `the-choir` Boss Encounter | `0.208 ms` | `5.20 ms` | `76.80 ms` (SwiftShader CPU) | Deterministic simulation `0.208 ms/step`; shader-heavy harmonic nodes on CPU SwiftShader |
| `the-curator` Boss Encounter | `0.228 ms` | `5.70 ms` | `12.10 ms` | Chapter III boss arena + traces |
| `matron-v` Boss Encounter | `0.500 ms` | `12.50 ms` | `17.10 ms` | Chapter IV quarantine chamber + hazards |
| `warden-prime` Phase II (with 2 active Reconstructed Traces) | `0.144 ms` | `3.60 ms` | `4.50 ms` | Initial trace shader compile frame `55.00 ms` |
| Chapter V Chronicle Loom & Ending Visuals (`witness`) | `0.104 ms` | `2.60 ms` | `6.70 ms` | Full ending transition & overlay |

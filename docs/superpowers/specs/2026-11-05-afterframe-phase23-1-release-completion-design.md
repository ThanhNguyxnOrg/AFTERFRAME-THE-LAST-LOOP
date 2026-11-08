# AFTERFRAME: THE LAST LOOP — Phase 23.1 Full Product Completion, Autonomous Audit & Release Hardening Design Spec

- **Date:** 2026-11-05
- **Project:** `AFTERFRAME: THE LAST LOOP` (`0.23.1`)
- **Repository:** `https://github.com/ThanhNguyxnOrg/AFTERFRAME-THE-LAST-LOOP`
- **Target Branch:** `main` (local commits above `origin/main` `9c79d11024eb9f135d1ca31051a8dca9c1306edf`)
- **Engine & Stack:** Three.js `0.186.1` + React `19.2.5` + TypeScript `7.0.0-dev` (`@typescript/native-preview`) + Vite `8.3.4` (Bun `1.3.9` lockfile)
- **Framework:** Claude Code Game Studios (CCGS) `v1.2.0` + Superpowers Spec-Driven / TDD Workflow

---

## 1. Mission & Design Objectives

Phase 23.1 transitions `AFTERFRAME: THE LAST LOOP` from the Phase 22 / Phase 23 gameplay evolution milestones into a **fully audited, strict-mode verified, CI-backed, release-hardened product** packaged into a single cumulative Git bundle (`afterframe-phase23.1-release.bundle`) for manual Windows GitHub publishing.

All work in Phase 23.1 is governed by five non-negotiable engineering principles:
1. **Evidence-Driven Audit Across Domains A–H:** Every finding must be backed by file-and-line inspection, unit/integration tests, CCGS helper script output, or live Playwright verification.
2. **Test-Driven Runtime Hardening (RED -> GREEN -> REFACTOR):** Every runtime change in `src/game/` is preceded by a failing regression test that proves the defect or gap and passes once fixed.
3. **Strict TypeScript & Deterministic Simulation:** `tsconfig.json` enforces `"strict": true` with zero compiler errors, while `src/game/simulation.ts` remains 100% decoupled from DOM and Three.js rendering.
4. **CCGS v1.2.0 Structural Integrity:** Project configuration (`project.yaml`, `CLAUDE.md`, `.claude/docs/technical-preferences.md`, `.claude/skills/code-review/SKILL.md`, `production/session-state/active.md`) uses only verified specialist agent names, accurate directory counts, and Three.js-aware review routing.
5. **Safe Recovery & Bundle Hygiene:** Existing recovery bundles (`afterframe-phase22.bundle`, `afterframe-phase23-consolidated.bundle`) are preserved outside the Git repository, zero tracked binary bloat is added to the repository, and no push to GitHub is attempted.

---

## 2. Independent Audit Findings Across Domains A–H

### Domain A & B — Gameplay Simulation, Weapons, Encounters, Campaign & Save V2 (`src/game/simulation.ts`)
- **P23.1-SIM-01 (`P1` — Important):** `switchPlayerWeapon` (`src/game/simulation.ts:8983-8992`) resets `p.chargeTime = 0` only when `p.actionState === 'charging_heavy'` and does not reset `p.chargeTime = 0` or `p.isEmpoweredHeavy = false` unconditionally when switching weapons in other non-committed states (e.g., `idle`, `moving`, `light_recovery`, `heavy_recovery`, `parry_recovery`). Unconditionally clearing `p.chargeTime = 0` and `p.isEmpoweredHeavy = false` on weapon switch guarantees zero cross-weapon state leakage.

### Domain C — Rendering, Assets, WebGL Fallback & Lifecycle (`src/game/renderer.ts`, `src/App.tsx`)
- **P23.1-REN-01 (`P1` — Important):** `ArenaSceneRenderer` constructor (`src/game/renderer.ts:423`) instantiates `new THREE.WebGLRenderer(...)` without a `try/catch` fallback. In environments where WebGL context creation fails or hardware acceleration is disabled, this throws an uncaught exception during `App` mount instead of presenting a readable fallback UI while preserving deterministic simulation and menu accessibility.
- **P23.1-DOC-ASSET-01 (`P2` — Minor):** `CLAUDE.md` and `docs/AFTERFRAME_CLAUDE_CODE_GAME_STUDIOS_INTEGRATION.md` refer to `scripts/blender/generate_afterframe_assets.py` and `public/assets/models/*.glb`, whereas the repository's actual generator is `scripts/blender/create_phase12_assets.py` outputting `public/assets/blender/phase12/*.glb` (`helix_containment_gate.glb`, `choir_acoustic_organ.glb`, `curator_archive_monolith.glb`, `matron_surgical_pod.glb`).

### Domain D — Input, UI, UX, Audio & Accessibility (`src/game/input.ts`, `src/game/audio.ts`, `src/App.tsx`)
- **P23.1-AUD-01 (`P1` — Important):** Two procedural synth nodes in `src/game/audio.ts` bypass `this.getOutputNode(ctx)` (`masterGain` / `sfxVolume` scaling) and connect directly to `ctx.destination`:
  - `src/game/audio.ts:624`: `cGain.connect(ctx.destination)` inside `playHitEnemy` (vulnerable crystal chime overlay).
  - `src/game/audio.ts:1113`: `subGain.connect(ctx.destination)` inside `playResonanceConvergence` (low kinetic guard-shatter impact drop).
  Additionally, `SoundEngine` lacks a `dispose()` method for clean `AudioContext` teardown on component unmount.
- **P23.1-INP-01 (`P2` — Minor):** Keybind documentation in `.claude/docs/technical-preferences.md` specifies `Q/L` for Parry (`LMB/F/J` light, `RMB/E/K` heavy, `Q/L` parry), whereas `src/game/input.ts:619` only checks `KeyQ` alongside `justParried`. Adding `KeyL` to `InputController.consumeFrame()` aligns keyboard alternate combat bindings (`J` light, `K` heavy, `L` parry).

### Domain E & F — Security, Reliability, Performance & Memory
- **P23.1-SEC-01 (`P2` — Minor):** `project.yaml` omits `platform.multiplayer: false`, which `.claude/skills/security-audit/SKILL.md` inspects to determine whether single-player local save integrity or multiplayer trust-boundary rules apply.
- **P23.1-PERF-01 (`Verified Clean`):** Hot-path render loop (`src/game/renderer.ts`) and fixed-timestep simulation (`src/game/simulation.ts`) use pre-allocated scratch vectors (`_desiredCamPos`, `_lookAtTarget`, `_targetAnchor`, `_wingTargetPos`, `_dummyObj`, `_colorScratch`), instanced particle meshes (`particleInstancedMesh`), and deduplicated `disposeMeshResources()` verified by `src/game/asset-lifecycle.test.ts`.

### Domain G — CCGS v1.2.0 Integration Correctness (`project.yaml`, `.claude/`)
- **P23.1-CCGS-01 (`P1` — Important):** `project.yaml:29-31` and `.claude/docs/technical-preferences.md:75,85` reference non-existent agent names (`combat-designer`, `ai-Behavior-programmer`, `narrative-designer`). They must be updated to actual specialist files in `.claude/agents/` (`systems-designer`, `ai-programmer`, `narrative-director`, `engine-programmer`, `qa-tester`).
- **P23.1-CCGS-02 (`P1` — Important):** `.claude/skills/code-review/SKILL.md:59` maps only `Godot`, `Unity`, and `Unreal` in Phase 2 (`Resolve Specialist Set`), leaving `engine.name: "ThreeJS"` without an explicit primary specialist mapping. Adding `ThreeJS -> engine-programmer + technical-artist (docs/engine-reference/threejs/VERSION.md)` completes 6-parallel-reviewer orchestration for Three.js projects.
- **P23.1-CCGS-03 (`P2` — Minor):** Reconcile exact CCGS file counts across `CLAUDE.md`, `production/session-state/active.md`, and `docs/AFTERFRAME_CLAUDE_CODE_GAME_STUDIOS_INTEGRATION.md`:
  - `49` agents in `.claude/agents/`
  - `74` skills in `.claude/skills/`
  - `18` hooks in `.claude/hooks/`
  - `35` helper scripts in `.claude/scripts/`
  - `15` rule files in `.claude/rules/`
  - `130` reference docs in `.claude/docs/`

### Domain H — Configuration, Strict TypeScript, Metadata, SEO & GitHub Actions CI
- **P23.1-CFG-01 (`P1` — Important):**
  - Enable `"strict": true` in `tsconfig.json`.
  - Update `package.json` `"name"` to `"afterframe-the-last-loop"` and `"version"` to `"0.23.1"`.
  - Update `project.yaml` `project.version` to `"0.23.1"`, `commands` to `bun run build` / `bun run test` / `bun run dev` / `bun run lint`, and `testing.framework` to list all 4 test suites.
- **P23.1-CFG-02 (`P2` — Minor):** Align `metadata.json` and `index.html` (`<title>`, `<meta name="description">`, OpenGraph, Twitter Card, and JSON-LD `VideoGame` structured data) with the complete Phase 23.1 4-weapon, 5-boss, 6-chapter dark sci-fi action RPG identity.
- **P23.1-CI-01 (`P1` — Important):** Add `.github/workflows/ci.yml` with least-privilege `permissions: contents: read`, Bun `1.3.9`, `bun install --frozen-lockfile`, `bun run lint`, `bun run test`, and `bun run build`.

---

## 3. Architecture & Implementation Design

### 3.1 Simulation Weapon Switch Sanitization (`src/game/simulation.ts`)
In `switchPlayerWeapon(world, targetWeaponId)`:
- Always reset `p.chargeTime = 0` and `p.isEmpoweredHeavy = false` alongside `p.bufferedAction = 'none'`, `p.bufferTimer = 0`, `p.comboWindowTimer = 0`, and `p.comboIndex = 0`.

### 3.2 Audio Master Gain Routing & Lifecycle (`src/game/audio.ts`)
- Replace `cGain.connect(ctx.destination)` at line 624 and `subGain.connect(ctx.destination)` at line 1113 with `cGain.connect(this.getOutputNode(ctx))` and `subGain.connect(this.getOutputNode(ctx))`.
- Add `public getDirectDestinationConnectionCount(): number` or source/runtime verification and `public dispose(): void` on `SoundEngine` to safely stop ambient synthesis and close `this.ctx` when unmounted.

### 3.3 Keyboard `KeyL` Parry Parity (`src/game/input.ts`)
- In `InputController.consumeFrame()`, evaluate `const parry = this.justParried || this.justPressedKeys.has('KeyQ') || this.justPressedKeys.has('KeyL');` so keyboard-only combat layouts (`J` Light, `K` Heavy, `L` Parry) match documented technical preferences.

### 3.4 WebGL Context Failure Fallback (`src/game/renderer.ts`, `src/App.tsx`)
- In `ArenaSceneRenderer`:
  - Track `private webglAvailable = false;` and `private renderer: THREE.WebGLRenderer | null = null;`.
  - Wrap `new THREE.WebGLRenderer(...)` and context configuration in a `try / catch` block.
  - On failure, set `this.webglAvailable = false`, `this.renderer = null`, and inject a non-crashing DOM notice (`data-testid="webgl-fallback-banner"`) into `mountEl` while still initializing `this.scene`, `this.camera`, lighting, rigs, and chapter groups so simulation + HUD + menus remain functional and testable.
  - Guard `this.renderer?.compile(...)`, `this.renderer?.render(...)`, `this.renderer?.setSize(...)`, and `this.renderer?.dispose()`.

---

## 4. Verification & Acceptance Criteria
1. `bun install --frozen-lockfile` succeeds cleanly with zero lockfile drift.
2. `bun run lint` (`tsc --noEmit` with `"strict": true` in `tsconfig.json`) exits `0`.
3. `bun run test` passes 100% of unit and integration tests across all 4 test files (`simulation.test.ts`, `campaign-release.test.ts`, `reduced-motion.test.ts`, `asset-lifecycle.test.ts`), including new Phase 23.1 RED->GREEN regression tests.
4. `bun run build` succeeds cleanly.
5. CCGS helper scripts (`project-coherence.sh`, `artifact-check.sh`, `gdd-structure-check.sh`, `agent-check.sh`, `skill-lint.sh all`, `compat-inventory.sh`, `story-facts.sh --all`) pass with zero errors.
6. Playwright desktop (`1440x900`, `1280x800`) and mobile (`390x844`, `430x932`) verification confirms zero console/page errors and responsive layout across Title, Calibration, Combat, all 5 Bosses, Chronicle Loom, and Status/Settings modals.
7. Cumulative Git bundle `/tmp/afterframe-release-recovery/afterframe-phase23.1-release.bundle` (`main ^origin/main`) passes `git bundle verify` and clean clone import verification.

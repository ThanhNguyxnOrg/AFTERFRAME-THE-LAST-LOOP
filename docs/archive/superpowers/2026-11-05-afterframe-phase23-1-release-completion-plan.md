# AFTERFRAME: THE LAST LOOP — Phase 23.1 Implementation Plan

- **Date:** 2026-11-05
- **Design Spec:** `docs/superpowers/specs/2026-11-05-afterframe-phase23-1-release-completion-design.md`
- **Target Branch:** `main` (local commits above `origin/main` `9c79d11024eb9f135d1ca31051a8dca9c1306edf`)

---

## Task Breakdown & Verification Steps

### Task 1: Runtime Gameplay, Input, Audio & WebGL Fallback Fixes (TDD: RED -> GREEN -> REFACTOR)
- **Files:**
  - `src/game/simulation.test.ts`
  - `src/game/reduced-motion.test.ts`
  - `src/game/asset-lifecycle.test.ts`
  - `src/game/simulation.ts`
  - `src/game/input.ts`
  - `src/game/audio.ts`
  - `src/game/renderer.ts`
  - `src/App.tsx`
- **Steps:**
  1. **RED:** Add failing regression tests:
     - `src/game/simulation.test.ts`: Verify `switchPlayerWeapon` unconditionally clears stale `chargeTime` and `isEmpoweredHeavy` even if the player is not currently in `'charging_heavy'` state.
     - `src/game/reduced-motion.test.ts`: Verify `InputController` triggers `parry` on `KeyL` press just like `KeyQ`, and verify `SoundEngine` routes all oscillator/gain nodes through `getOutputNode(ctx)` (`masterGain`) with zero direct `ctx.destination` connections outside `getOutputNode(ctx)` and supports `dispose()`.
     - `src/game/asset-lifecycle.test.ts`: Verify `ArenaSceneRenderer` gracefully handles WebGL context creation failure (`isWebGLAvailable() === false`), renders `[data-testid="webgl-fallback-banner"]`, and safely runs `resize()`, `updateAndRender()`, and `dispose()` without throwing.
  2. Run `bun run test` to confirm the new tests fail as expected (RED).
  3. **GREEN:** Implement the minimal production fixes in `src/game/simulation.ts`, `src/game/input.ts`, `src/game/audio.ts`, `src/game/renderer.ts`, and `src/App.tsx`.
  4. Run `bun run test` and `bun run lint` to confirm all tests pass (GREEN).

### Task 2: CCGS v1.2.0 Alignment, Strict TypeScript, Metadata, SEO & GitHub Actions CI
- **Files:**
  - `tsconfig.json`
  - `package.json`
  - `project.yaml`
  - `.claude/docs/technical-preferences.md`
  - `.claude/skills/code-review/SKILL.md`
  - `CLAUDE.md`
  - `metadata.json`
  - `index.html`
  - `.github/workflows/ci.yml`
- **Steps:**
  1. Enable `"strict": true` in `tsconfig.json`.
  2. Set `"name": "afterframe-the-last-loop"` and `"version": "0.23.1"` in `package.json`.
  3. Update `project.yaml` with `version: "0.23.1"`, `platform.multiplayer: false`, valid `.claude/agents/` specialist names (`systems-designer`, `ai-programmer`, `narrative-director`, `engine-programmer`, `qa-tester`), `bun` commands, and all 4 test files.
  4. Update `.claude/docs/technical-preferences.md`, `.claude/skills/code-review/SKILL.md`, and `CLAUDE.md` with accurate Three.js specialist routing, Blender asset paths (`scripts/blender/create_phase12_assets.py` -> `public/assets/blender/phase12/*.glb`), and verified CCGS file counts (`49` agents, `74` skills, `18` hooks, `35` scripts, `15` rules, `130` docs).
  5. Update `metadata.json` and `index.html` with aligned title, description, OpenGraph, Twitter Card, and JSON-LD `VideoGame` structured data.
  6. Create `.github/workflows/ci.yml` running `bun install --frozen-lockfile`, `bun run lint`, `bun run test`, and `bun run build`.
  7. Verify with `bun run lint`, `bun run test`, `bun run build`, and CCGS helper scripts.

### Task 3: Production Audit Artifacts, Documentation & Session State Synchronization
- **Files:**
  - `production/security/security-audit-2026-11-05-full.md`
  - `production/polish/full-report-2026-11-05.md`
  - `production/qa/smoke-2026-11-05.md`
  - `docs/AFTERFRAME_PHASE23_1_RELEASE_COMPLETION_AND_AUDIT.md`
  - `docs/AFTERFRAME_CLAUDE_CODE_GAME_STUDIOS_INTEGRATION.md`
  - `production/session-state/active.md`
  - `README.md`
- **Steps:**
  1. Generate comprehensive CCGS security, polish/performance, and QA smoke reports for `2026-11-05`.
  2. Write `docs/AFTERFRAME_PHASE23_1_RELEASE_COMPLETION_AND_AUDIT.md` documenting all Domain A–H findings, fixes, test counts, and release verification results.
  3. Reconcile `README.md`, `docs/AFTERFRAME_CLAUDE_CODE_GAME_STUDIOS_INTEGRATION.md`, and `production/session-state/active.md` with exact test counts, version `0.23.1`, and CCGS inventory counts.

### Task 4: Live Browser Verification (Playwright Desktop + Mobile) & Final Cumulative Git Bundle
- **Steps:**
  1. Start/verify local server on `http://localhost:3000` and execute Playwright desktop (`1440x900`, `1280x800`) and mobile (`390x844`, `430x932`) verification across title, calibration, combat, Echo, all 5 bosses, Chronicle Loom, and settings/pause/retry flows.
  2. Run full repeatable validation gate (`bun install --frozen-lockfile`, `bun run test`, `bun run lint`, `bun run build`, `git diff --check`, and CCGS scripts).
  3. Commit logically grouped changes on `main` using `RealThanhNguyxn <274720769+RealThanhNguyxn@users.noreply.github.com>`.
  4. Create `/tmp/afterframe-release-recovery/afterframe-phase23.1-release.bundle` (`main ^origin/main`), `.sha256`, `AFTERFRAME_PHASE23_1_IMPORT_INSTRUCTIONS.txt`, and `afterframe-phase23.1-transfer.zip`, and verify import in a temporary clone.

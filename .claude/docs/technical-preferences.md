# Technical Preferences — AFTERFRAME: THE LAST LOOP

<!-- project.yaml at the repo root is the machine-readable source of truth for
     engine, specialists, naming, performance, platform, and testing.framework.
     This file is the human-readable LEGACY FALLBACK: agents and skills resolve
     each key from project.yaml first and fall back here only when the
     project.yaml key is absent. -->

## Engine & Language

- **Engine**: ThreeJS (`three@0.186.1` via `^0.186.1` in `package.json` & `bun.lock` + React `19` + Vite `8.3.4`)
- **Language**: TypeScript (`7.0.2`, strict mode)
- **Rendering**: WebGL2 (`THREE.WebGLRenderer` with procedural rigs in `src/game/models.ts` + optional GLB assets in `public/assets/models/*.glb`)
- **Physics**: Deterministic local arena simulation (`src/game/simulation.ts`)

## Input & Platform

- **Target Platforms**: Web (Desktop `1280x800+`, Mobile `390x844+`)
- **Input Methods**: Keyboard/Mouse, Touch (`src/components/TouchControls.tsx`)
- **Primary Input**: Keyboard/Mouse (`WASD` move, Mouse/Arrows aim, `LMB/F/J` light attack, `RMB/E/K` heavy attack, `Space/Shift` dodge, `Q/L` parry, `1–4` / `Tab/Z` weapon select, `T/Y/V/C` Chrono Rig Echo controls, `G` Gravity Pin, `X` Echo Collapse, `I` Interact, `U` Upgrade Bench)
- **Gamepad Support**: None
- **Touch Support**: Full (dedicated virtual D-pad, camera orbit drag, and combat/Echo buttons on mobile viewports)
- **Platform Notes**: Runs on port `3000` in an iframe-compatible browser environment; avoid `window.alert` and `window.open`.

## Naming Conventions

- **Classes**: `PascalCase`
- **Variables**: `camelCase`
- **Signals/Events**: `snake_case` (`CombatEvent['type']`, `EchoRecordedActionType`)
- **Files**: `camelCase` (`src/game/*.ts`) and `PascalCase` (`src/components/*.tsx`)
- **Scenes/Prefabs**: `snake_case` (`prologue`, `chapter_1_helix`, `chapter_2_choir`, `chapter_3_curator`, `chapter_4_matron`, `chapter_5_loom`)
- **Constants**: `SCREAMING_SNAKE` (`GAME_CONFIG`, `SAVE_STORAGE_KEY`)

## Performance Budgets

- **Target Framerate**: 60 FPS
- **Frame Budget**: 16.6 ms (`simulation.ts` step < 1.5 ms, `renderer.ts` draw < 8 ms)
- **Draw Calls**: <= 250 per frame
- **Memory Ceiling**: <= 512 MB

## Testing

- **Framework**: Node.js built-in test runner via `tsx` (`npm test` -> `tsx --test src/game/simulation.test.ts`) + `playwright-cli` browser verification
- **Minimum Coverage**: 100% of canonical weapons (`4`), weapon upgrades (`8`), enemy archetypes (`9`), bosses (`5`), campaign chapters (`6`), and Chronicle Loom endings (`3`)
- **Required Tests**: Deterministic simulation unit tests (`src/game/simulation.test.ts`), TypeScript typecheck (`npm run lint`), production bundle (`npm run build`), and headless Chromium inspection (`playwright-cli`)

## Forbidden Patterns

- Never call React `setState` at 60Hz inside `requestAnimationFrame` for basic movement or animation; push throttled `HudSnapshot` updates only.
- Never import `three` or React components inside `src/game/simulation.ts`, `src/game/config.ts`, or `src/game/types.ts`.
- Never hardcode gameplay tuning numbers in `simulation.ts` or `GameHud.tsx`; define all tuning parameters in `src/game/config.ts` (`GAME_CONFIG`).
- Never allow Practice Arena or Chapter Replay runs to mutate persistent campaign progression or duplicate one-time rewards.
- Never use `git reset --hard`, `git clean -fd`, or `git push --force`.

## Allowed Libraries / Addons

- `three` (`0.186.1`, `^0.186.1`) & `@types/three` (`0.186.0`, `^0.186.0`)
- `react` (`19.3.1`, `^19.0.1`) & `react-dom` (`19.3.1`, `^19.0.1`)
- `lucide-react` (`0.546.0`, `^0.546.0`)
- `tailwindcss` (`4.3.3`, `^4.3.3`) & `@tailwindcss/vite` (`4.3.3`, `^4.3.3`)
- `vite` (`8.3.4`, `^8.3.0`), `typescript` (`7.0.2`, `^7.0.2`), `tsx` (`4.23.15`, `^4.21.0`)

## Architecture Decisions Log

- See `docs/AFTERFRAME_PHASE20_CAMPAIGN_INTEGRATION_AND_NARRATIVE_EXPANSION.md`
- See `docs/AFTERFRAME_PHASE21_1_ACCEPTANCE_AND_RELEASE_SYNCHRONIZATION.md`
- See `docs/AFTERFRAME_CLAUDE_CODE_GAME_STUDIOS_INTEGRATION.md`

## Engine Specialists

- **Primary**: `gameplay-programmer`
- **Language/Code Specialist**: `gameplay-programmer`
- **Shader Specialist**: `technical-artist`
- **UI Specialist**: `ui-programmer`
- **Additional Specialists**: `combat-designer`, `systems-designer`, `ai-Behavior-programmer`, `qa-tester`, `narrative-designer`
- **Routing Notes**: Route `src/game/simulation.ts` and `src/game/config.ts` to `gameplay-programmer` + `combat-designer`; route `src/game/renderer.ts` and `src/game/models.ts` to `technical-artist`; route `src/components/*.tsx` to `ui-programmer`.

### File Extension Routing

| File Extension / Type | Specialist to Spawn |
|-----------------------|---------------------|
| Game code (`src/game/simulation.ts`, `src/game/config.ts`, `src/game/types.ts`) | `gameplay-programmer` |
| 3D Renderer & Rigs (`src/game/renderer.ts`, `src/game/models.ts`, `scripts/blender/*.py`) | `technical-artist` |
| UI / HUD files (`src/App.tsx`, `src/components/*.tsx`) | `ui-programmer` |
| Campaign / Boss / Combat balance (`src/game/config.ts`) | `combat-designer` |
| Automated & Browser QA (`src/game/simulation.test.ts`) | `qa-tester` |
| General architecture review | `lead-programmer` |

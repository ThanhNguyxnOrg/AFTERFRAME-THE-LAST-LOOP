---
paths:
  - "src/game/simulation.test.ts"
  - "**/*.test.ts"
  - ".playwright-cli/**"
  - "tests/**"
---

# Test & QA Standards (AFTERFRAME: THE LAST LOOP)

- **Deterministic Simulation Tests (`src/game/simulation.test.ts`)**:
  - Run via Node's built-in test runner (`npm test` / `npx --yes tsx --test src/game/simulation.test.ts`).
  - Every test must use `node:test` and `node:assert/strict` with a clear Arrange -> Act -> Assert structure.
  - Tests must be 100% deterministic, self-contained, and independent of network, timers, or browser state.
- **Mandatory Regression Coverage**:
  - Every bug fix or new gameplay feature (weapons, upgrades, Echo recording/replay, enemy archetypes, boss phases, checkpoints, Save v2 persistence) must include a regression test in `src/game/simulation.test.ts`.
  - **Watch the test fail against unfixed behavior** before trusting it as a regression gate.
- **Browser Acceptance (`playwright-cli`)**:
  - Verify rendered UI, WebGL canvas mounting, 4-weapon HUD strip, Armory/Upgrade Bench modals, Practice Boss encounters (`WARDEN PRIME`), and zero console/runtime errors at both `1280x800` (desktop) and `390x844` (mobile).

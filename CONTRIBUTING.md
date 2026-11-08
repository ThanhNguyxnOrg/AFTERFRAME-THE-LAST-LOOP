# 🛠️ Contributing to AFTERFRAME: THE LAST LOOP

Thank you for your interest in contributing to **AFTERFRAME: THE LAST LOOP**. This guide explains our architectural invariants, local development setup, strict Test-Driven Development (`RED -> GREEN -> REFACTOR`) workflow, and pre-submission verification gates.

---

## 🧭 Core Architectural Invariants

1. **Deterministic Simulation Separation (`src/game/simulation.ts`)**:
   - All gameplay logic, enemy/boss state machines, Echo recording/replay, Relay, Resonance/Convergence, and Save V2 persistence live in `src/game/simulation.ts` and are tuned via `GAME_CONFIG` in `src/game/config.ts`.
   - Presentation layers (`src/game/renderer.ts`, `src/game/audio.ts`, `src/App.tsx`, `src/components/*.tsx`) are **read-only consumers** of `WorldState` and `HudSnapshot`. Never mutate gameplay state inside React components or Three.js render hooks.
2. **Echo Non-Duplication Rule**:
   - Echo replay contacts prime Resonance, activate pressure plates/harmonic nodes, and serve as Relay/Collapse anchors, but never deal direct HP damage, grant Flux, or duplicate Memory Fragments/unlocks.
3. **Zero Runtime Network Dependencies**:
   - The game operates `100%` offline/client-side after initial bundle load (`platform.online: false`, `platform.multiplayer: false`). Never introduce external API keys or telemetry beacons.

---

## 🚀 Local Setup

```bash
git clone https://github.com/ThanhNguyxnOrg/AFTERFRAME-THE-LAST-LOOP.git
cd AFTERFRAME-THE-LAST-LOOP
bun install --frozen-lockfile
bun run dev
```

---

## 🧪 Mandatory Quality Gates

Every code, configuration, or documentation change must pass the following verification pipeline before opening a pull request or committing to `main`:

| Gate | Command | Requirement |
| :--- | :--- | :--- |
| **1. Unit & Integration Tests** | `bun run test` | All `234+` tests across `simulation.test.ts`, `campaign-release.test.ts`, `reduced-motion.test.ts`, and `asset-lifecycle.test.ts` must pass (`🟢 PASS`) |
| **2. Strict TypeScript Check** | `bun run lint` | `tsc --noEmit` with `"strict": true` must exit with `0` errors (`🟢 PASS`) |
| **3. Production Build** | `bun run build` | `vite build` must complete cleanly without unresolved imports (`🟢 PASS`) |
| **4. CCGS Registry Validation** | `bash .claude/scripts/registry.sh validate` | `entities.yaml`, `tr-registry.yaml`, and `architecture.yaml` must validate with `0` errors (`🟢 PASS`) |
| **5. Whitespace & Formatting** | `git diff --check` | Zero trailing whitespace, conflict markers, or EOF blank lines (`🟢 PASS`) |

---

## 📝 Documentation & Style Conventions

All Markdown files follow [`docs/MARKDOWN_STYLE_GUIDE.md`](docs/MARKDOWN_STYLE_GUIDE.md):
- Use the standardized status badges (`🟢 PASS`, `🟠 CONDITIONAL`, `🔴 FAIL`, `⚪ NOT TESTED`, `🧪 TESTED`, `🧾 EVIDENCE AVAILABLE`, `🚧 OWNER ACTION REQUIRED`).
- Verify that every relative Markdown link and image path resolves to an existing file in the repository.
- When modifying weapon, upgrade, enemy, or boss numbers in `src/game/config.ts`, synchronize `design/registry/entities.yaml`, `design/gdd/game-concept.md`, and `README.md` in the same commit.

# Brownfield Adoption Plan — AFTERFRAME: THE LAST LOOP (2026-11-04)

## 1. Executive Summary (`/project-stage-detect` & `/adopt` Audit)

- **Project**: `AFTERFRAME: THE LAST LOOP`
- **Detected Stage**: `Production` (`production/stage.txt`, `project.yaml`)
- **Framework Version**: Claude Code Game Studios `v1.2.0` (`05ad7c8`)
- **Workflow Tier**: `standard` (`modes.rigor: standard`, `modes.automation: collaborative`)
- **Engine Stack**: `ThreeJS` (`0.186.1`, `^0.186.1` in `package.json` & `bun.lock`) + `TypeScript` (`7.0.2`) + `React` (`19.3.1` / `^19.0.1`) + `Vite` (`8.3.4` / `^8.3.0`)

## 2. Artifact Existence & Format Compliance Matrix

| Artifact Category | Path | Existence (`/project-stage-detect`) | Format Compliance (`/adopt`) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Config** | `project.yaml` | `PRESENT` | `COMPLIANT` | Validated via `yaml-helper.sh validate_yaml_enum project.yaml` (`0` errors). |
| **Legacy Mirror** | `.claude/docs/technical-preferences.md` | `PRESENT` | `COMPLIANT` | Synchronized with `project.yaml` and AFTERFRAME forbidden/allowed libraries. |
| **Engine Reference** | `docs/engine-reference/threejs/VERSION.md` | `PRESENT` | `COMPLIANT` | Linked from `CLAUDE.md` via `@docs/engine-reference/threejs/VERSION.md`. |
| **Game Brief** | `design/game-brief.md` | `PRESENT` | `COMPLIANT` | Captures elevator pitch, 3 core pillars, and target platforms. |
| **Core GDD** | `design/gdd/game-concept.md` | `PRESENT` | `COMPLIANT` | Verified by `gdd-structure-check.sh`: all 8 canonical sections present (`Overview,Player Fantasy,Detailed Rules,Formulas,Edge Cases,Dependencies,Tuning Knobs,Acceptance Criteria`). |
| **Systems Index** | `design/gdd/systems-index.md` | `PRESENT` | `COMPLIANT` | Maps `SYS-01` through `SYS-08` to actual `src/game/*` and `src/components/*` files. |
| **Entity Registry** | `design/registry/entities.yaml` | `PRESENT` | `COMPLIANT` | Registers `sera_venn`, all 4 weapons, `aegis_sentinel`, `null_weaver`, and all 5 bosses. |
| **Architecture & Phase Docs** | `docs/AFTERFRAME_PHASE*.md` | `PRESENT` | `INFORMATIONAL` | Historical Phase 16–21.1 engineering specifications preserved intact in `docs/`. |
| **Session Checkpoint** | `production/session-state/active.md` | `PRESENT` | `COMPLIANT` | Uses `<!-- STATUS -->` and `<!-- CHECKPOINT -->` blocks per `.claude/docs/templates/session-state.md`. |

## 3. Prioritized Next Actions for Optional Full-Rigor Expansion

1. **Optional Per-System GDD Extraction (`/reverse-document`)**:
   - If the team upgrades `modes.rigor` from `standard` to `full`, extract dedicated per-system GDDs (`design/gdd/combat-arsenal.md`, `design/gdd/chrono-echo-system.md`, `design/gdd/boss-encounters.md`) from `docs/AFTERFRAME_PHASE20_CAMPAIGN_INTEGRATION_AND_NARRATIVE_EXPANSION.md` and `docs/AFTERFRAME_PHASE21_1_ACCEPTANCE_AND_RELEASE_SYNCHRONIZATION.md`.
2. **Optional ADR Backfill (`/architecture-decision`)**:
   - Optionally formalize the decoupled `simulation.ts` / `renderer.ts` / `GameHud.tsx` architecture and Save v2 persistence schema as numbered `docs/architecture/adr-001-*.md` records.

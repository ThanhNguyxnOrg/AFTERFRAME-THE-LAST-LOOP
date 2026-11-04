# AFTERFRAME: THE LAST LOOP — Claude Code Game Studios Architecture

**AFTERFRAME: THE LAST LOOP** is a single-player 3D dark industrial sci-fi action-puzzle RPG built with **React 19 + TypeScript + Vite + Three.js**, managed through **Claude Code Game Studios (`v1.2.0`)** with 49 specialized subagents, 74 workflow skills, 18 lifecycle hooks, and path-scoped engineering rules.

> **Central Design Principle**: *"Your past is your greatest weapon. Your future is the one thing WARDEN cannot predict."*

## Technology Stack

- **Engine / 3D Runtime**: Three.js `0.186.1` (`"three": "^0.186.1"` and `"@types/three": "^0.186.0"` in `package.json` & `bun.lock`; WebGLRenderer, procedural 3D rigs + GLB asset hydration)
- **Application & HUD Shell**: React `19` (`^19.0.1`) + Tailwind CSS `4.3.3` (`^4.3.3`)
- **Language**: TypeScript `7.0.2` (`^7.0.2`, strict mode, deterministic simulation decoupled from rendering/UI)
- **Version Control**: Git with trunk-based development (`main`)
- **Build & Test System**: Vite `8.3.4` (`^8.3.0`; `npm run build`, `npm run lint`, `npm test` via `tsx --test`)
- **Asset Pipeline**: Procedural Three.js rigs (`src/game/models.ts`) + Blender headless GLB pipeline (`scripts/blender/generate_afterframe_assets.py` -> `public/assets/models/*.glb`)

## Project Structure

@.claude/docs/directory-structure.md

### AFTERFRAME Source Layout
- `src/game/types.ts` — Canonical TypeScript interfaces (`WorldState`, `PlayerState`, `EnemyState`, `BossState`, `HudSnapshot`, `WeaponId`, `WeaponUpgradeId`, `EnemyArchetype`, `BossId`)
- `src/game/config.ts` — Single source of truth for all gameplay tuning (`GAME_CONFIG`: 4 weapons, 8 upgrades, 9 enemy archetypes, 5 bosses, 6 campaign chapters, 3 Chronicle Loom endings)
- `src/game/simulation.ts` — Pure deterministic gameplay simulation (`stepWorld`, Echo recording/replay, Relay, Resonance/Convergence, AI state machines, Save v2 persistence)
- `src/game/simulation.test.ts` — Deterministic unit & integration regression suite (`209` tests via `node:test`)
- `src/game/renderer.ts` & `src/game/models.ts` — Three.js 3D arena, lighting, camera, telegraphs, VFX, and character/enemy/boss rigs
- `src/game/audio.ts` — Web Audio API procedural sound synthesis
- `src/game/input.ts` — Keyboard, mouse, and touch input mapping
- `src/App.tsx` & `src/components/*.tsx` — React 19 Title Screen, HUD (`GameHud.tsx`), Modals (`StatusModal.tsx`), Tutorial, and Touch Controls

## Engine Version Reference

@docs/engine-reference/threejs/VERSION.md

## Technical Preferences

`project.yaml` at the repo root is the primary config store — engine, specialists, naming, platform, performance, commands, testing, and modes. Skills resolve it via `resolve_config` (see `.claude/docs/config-resolution.md`).

`.claude/docs/technical-preferences.md` is the synchronized human-readable mirror and fallback for forbidden patterns and allowed libraries.

## Coordination Rules

@.claude/docs/coordination-rules.md

## Collaboration Protocol

**User-driven collaboration, not autonomous execution.**

Every task follows: **Question -> Options -> Decision -> Draft -> Approval**

- Agents MUST ask "May I write this to [filepath]?" before using Write/Edit tools (exempt: `active.md` appends, agent memory, a subagent's new file at the path its orchestrating skill named; see `.claude/rules/agent-memory.md`)
- Agents MUST show drafts or summaries before requesting approval
- Multi-file changes require explicit approval for the full changeset
- No commits without user instruction
- A skipped or dismissed question is not an answer: act on nothing, re-ask in plain text and wait
- Started outside this file's folder? Warn first: hooks, deny rules and the ask-first mode load only when Claude Code starts here

See `docs/COLLABORATIVE-DESIGN-PRINCIPLE.md` for full protocol and examples.

## Coding Standards

@.claude/docs/coding-standards.md

## Context Management

Read `.claude/docs/context-management.md` on demand — it is a reference, not session context. Two of its conventions are load-bearing and cited by name elsewhere in the repo:

- **`production/session-state/active.md` is the session checkpoint.** The file is the memory, not the conversation. Read it first after any compaction, crash, or `/clear`.
- **Helpers in `.claude/scripts/` emit observations, never verdicts.** A script that scores or judges will eventually contradict a mode or override it cannot see. (Cited by `artifact-check.sh` and `adr-dep-graph.sh`.)

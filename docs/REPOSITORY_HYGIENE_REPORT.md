# 🧹 Repository Hygiene & Source-of-Truth Consolidation Report (Phase 23.4.1)

- **Date:** `2026-11-08`
- **Repository:** `https://github.com/ThanhNguyxnOrg/AFTERFRAME-THE-LAST-LOOP`
- **Branch:** `main`
- **Phase:** `Phase 23.4.1 — Final Release Closure, Repository Refactoring, Documentation Consolidation & External Acceptance`
- **Status:** `🟢 PASS` (`🧪 TESTED` `🧾 EVIDENCE AVAILABLE`)

---

## 🧭 Table of Contents

1. [📊 Before & After File Inventory](#1-before-and-after-file-inventory)
2. [🗑️ Removed Files Ledger (`109` Files Removed)](#2-removed-files-ledger-109-files-removed)
3. [📦 Archived Files Ledger (`4` Files Archived)](#3-archived-files-ledger-4-files-archived)
4. [✅ Retained Files & Source-of-Truth Classification](#4-retained-files-and-source-of-truth-classification)
5. [🤖 `.claude/` Skills (`74/74`) & Agents (`49/49`) Audit](#5-claude-skills-7474-and-agents-4949-audit)
6. [🖼️ Asset & Screenshot Hygiene (`~41 MB` Bloat Removed)](#6-asset-and-screenshot-hygiene-41-mb-bloat-removed)
7. [📦 Dependency & Configuration Audit](#7-dependency-and-configuration-audit)
8. [📚 Markdown Consolidation & Link Validation](#8-markdown-consolidation-and-link-validation)
9. [🗂️ Registry & Metadata Synchronization](#9-registry-and-metadata-synchronization)

---

## 1. 📊 Before and After File Inventory

A recursive repository scan (excluding `.git/` and `node_modules/`) was executed before and after the Phase 23.4.1 hygiene pass:

| Directory / Scope | Before Cleanup (`b7516ef` + untracked paste) | Removed | Archived (`git mv`) | Added (New Docs) | After Cleanup (Phase 23.4.1) | Status |
| :--- | ---: | ---: | ---: | ---: | ---: | :---: |
| **Root (`/`)** | `11` | `0` | `0` | `+3` (`CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`) | `14` | `🟢 PASS` |
| **`src/`** | `17` | `0` | `0` | `0` | `17` | `🟢 PASS` |
| **`public/`** | `25` | `-21` (`8` prompt pastes + `13` old audit PNGs) | `0` | `0` | `4` (4 canonical GLBs) | `🟢 PASS` |
| **`assets/`** | `1` | `0` | `0` | `0` | `1` (`afterframe-mark.svg`) | `🟢 PASS` |
| **`screenshots/`** | `86` | `-80` (debug dumps, `.trace.json.gz`, before/after duplicates) | `0` | `0` | `6` (6 canonical chapter PNGs) | `🟢 PASS` |
| **`scripts/`** | `5` | `-4` (obsolete Phase 13 one-off scripts) | `0` | `0` | `1` (`create_phase12_assets.py`) | `🟢 PASS` |
| **`docs/`** | `88` | `-2` (duplicate post-23.1 plan/spec) | `4` (moved to `docs/archive/superpowers/`) | `+4` (`README.md`, `MARKDOWN_STYLE_GUIDE.md`, `REPOSITORY_HYGIENE_REPORT.md`, `PHASE_23_4_1_RELEASE_CLOSURE.md`) | `90` | `🟢 PASS` |
| **`design/`** | `5` | `0` | `0` | `0` | `5` | `🟢 PASS` |
| **`production/`** | `7` | `0` | `0` | `0` | `7` | `🟢 PASS` |
| **`.claude/`** | `435` | `0` | `0` | `0` | `435` | `🟢 PASS` |
| **`.superpowers/`** | `2` | `-2` (ephemeral session scratchpads) | `0` | `0` | `0` (directory removed & gitignored) | `🟢 PASS` |
| **`.github/`** | `1` | `0` | `0` | `0` | `1` (`workflows/ci.yml`) | `🟢 PASS` |
| **Total Repository Files** | **`683`** (`682` tracked + `1` untracked) | **`-109`** | **`4` relocated** | **`+7`** | **`581`** (`100%` tracked) | `🟢 PASS` |

---

## 2. 🗑️ Removed Files Ledger (`109` Files Removed)

Every deleted file was verified to have zero runtime, test, build, or active documentation references before removal:

| Category | Path Pattern | Count | Disk Size Saved | Justification for Removal |
| :--- | :--- | ---: | ---: | :--- |
| **AI Studio Prompt Pastes** | `public/assets/aistudio/Paste_*` | `8` (`7` tracked + `1` untracked) | `~227 KB` | Ephemeral AI Studio conversation prompt attachments accidentally stored inside `public/` (which Vite copies into `dist/` on every production build). Added `public/assets/aistudio/` to `.gitignore`. |
| **Obsolete Phase 11.1 Audit Captures** | `public/phase11_1_audit/*.png` | `13` | `~5.82 MB` | Legacy intermediate audit screenshots placed inside `public/`, bloating `dist/` by `5.82 MB` without any runtime reference. |
| **Debug Screenshots & Chrome Traces** | `screenshots/debug-*.png`, `screenshots/phase11_1_verify/*`, `screenshots/phase12/before/*`, `screenshots/phase12-blender/before/*`, `screenshots/phase13/*`, `screenshots/phase13_1/*.trace.json.gz`, `screenshots/phase13_1/*.png`, `screenshots/phase13_2/*` | `80` | `~35.10 MB` | Redundant pre-fix ("before") captures, raw Chrome DevTools performance traces (`.trace.json.gz`), and one-off debug dumps superseded by the 6 canonical chapter screenshots and Phase 23.4.1 verification metrics. |
| **Obsolete One-Off Verification Scripts** | `scripts/phase13_1_accessibility.py`, `scripts/phase13_1_browser.py`, `scripts/phase13_1_performance.py`, `scripts/phase13_2_browser_verify.mjs` | `4` | `~38 KB` | Hardcoded Phase 13 one-off scripts referencing deleted `screenshots/phase13_1/*` paths; superseded by `src/game/*.test.ts` (`234` tests) and `window.__afterframeTest`. |
| **Ephemeral Superpowers Scratchpads** | `.superpowers/sdd/afterframe-phase23-1-release-completion/progress.md`, `.superpowers/sdd/afterframe-post-phase23-1-deep-audit/progress.md` | `2` | `~14 KB` | Temporary subagent task scratchpads; authoritative session state lives in `production/session-state/active.md`. Added `.superpowers/` to `.gitignore`. |
| **Duplicate Intermediate Plans** | `docs/superpowers/plans/2026-11-05-afterframe-post-phase23-1-deep-audit.md`, `docs/superpowers/specs/2026-11-05-afterframe-post-phase23-1-deep-audit-design.md` | `2` | `~26 KB` | Duplicate intermediate working drafts whose outcomes are fully recorded in `docs/AFTERFRAME_PHASE23_1_RELEASE_COMPLETION_AND_AUDIT.md`. |

---

## 3. 📦 Archived Files Ledger (`4` Files Archived)

Four historical Superpowers design specifications and implementation plans from Phases 23.1 and 23.3 were relocated via `git mv` into `docs/archive/superpowers/` to keep `docs/` clean while preserving historical traceability:

| Original Path | Archived Path | Status |
| :--- | :--- | :---: |
| `docs/superpowers/specs/2026-11-05-afterframe-phase23-1-release-completion-design.md` | `docs/archive/superpowers/2026-11-05-afterframe-phase23-1-release-completion-design.md` | `🟢 ARCHIVED` |
| `docs/superpowers/plans/2026-11-05-afterframe-phase23-1-release-completion.md` | `docs/archive/superpowers/2026-11-05-afterframe-phase23-1-release-completion-plan.md` | `🟢 ARCHIVED` |
| `docs/superpowers/specs/2026-04-19-phase23-3-adversarial-verification-design.md` | `docs/archive/superpowers/2026-04-19-phase23-3-adversarial-verification-design.md` | `🟢 ARCHIVED` |
| `docs/superpowers/plans/2026-04-19-phase23-3-adversarial-verification-plan.md` | `docs/archive/superpowers/2026-04-19-phase23-3-adversarial-verification-plan.md` | `🟢 ARCHIVED` |

---

## 4. ✅ Retained Files and Source-of-Truth Classification

| Directory | Retained File Count | Role & Source-of-Truth Classification |
| :--- | :---: | :--- |
| **`src/`** | `17` | **Authoritative Runtime & Test Code**: `types.ts`, `config.ts`, `simulation.ts`, `renderer.ts`, `models.ts`, `audio.ts`, `input.ts`, `App.tsx`, `components/{TitleScreen,GameHud,StatusModal,TutorialOverlay}.tsx`, and 4 test suites (`234` tests). |
| **`public/assets/blender/phase12/`** | `4` | **Runtime 3D GLB Landmarks**: `helix_containment_gate.glb`, `choir_acoustic_organ.glb`, `curator_archive_monolith.glb`, `matron_surgical_pod.glb` (loaded by `ArenaSceneRenderer.loadChapterAssets()`). |
| **`assets/branding/`** | `1` | **Project Emblem**: `afterframe-mark.svg` (embedded in root `README.md`). |
| **`screenshots/`** | `6` | **Canonical Chapter Captures**: `00-prologue-desktop.png`, `ch1-helix-gate-desktop.png`, `ch2-choir-organ-desktop.png`, `ch3-curator-archive-desktop.png`, `ch4-matron-pod-desktop.png`, `05-loom-desktop.png` (embedded in `README.md` Visual Gallery). |
| **`scripts/blender/`** | `1` | **Asset Pipeline Generator**: `create_phase12_assets.py` (reproducible Blender headless script that generates the 4 runtime GLBs). |
| **`design/` & `production/`** | `12` | **CCGS Design & Production Artifacts**: `game-brief.md`, `gdd/game-concept.md`, `gdd/systems-index.md`, `registry/entities.yaml` (`31` entities), `session-state/active.md`, `qa/smoke-2026-11-05.md`, `polish/full-report-2026-11-05.md`, `security/security-audit-2026-11-05-full.md`. |
| **`docs/`** | `90` | **Documentation Hub, Registries, Engine Reference & Phase History**: Indexed in [`docs/README.md`](README.md). |

---

## 5. 🤖 `.claude/` Skills (`74/74`) and Agents (`49/49`) Audit

All `435` files inside `.claude/` (Claude Code Game Studios `v1.2.0`) were audited for structural validity, frontmatter compliance, and project alignment:

- **Skills (`74 / 74`)**: Validated via `bash .claude/scripts/skill-lint.sh all` -> `checked 74 of 74 skill(s)` with **`0` errors** (`🟢 PASS`). Notably, `.claude/skills/code-review/SKILL.md` includes explicit `ThreeJS -> engine-programmer + technical-artist (docs/engine-reference/threejs/VERSION.md)` and `.ts`/`.tsx` routing.
- **Agents (`49 / 49`)**: Validated via `bash .claude/scripts/agent-check.sh .` -> `49` agents verified, **`0` malformed frontmatter, `0` structural notes** (`🟢 PASS`).
- **Technical Preferences Synchronization (`.claude/docs/technical-preferences.md`)**: Updated during Phase 23.4.1 to reference `src/components/GameHud.tsx` and `src/game/input.ts` (replacing a stale reference to a non-existent `src/components/TouchControls.tsx` file) and removed unused `lucide-react` from the active library list.

---

## 6. 🖼️ Asset and Screenshot Hygiene (`~41 MB` Bloat Removed)

- **Production Bundle (`dist/`) Impact**: Removing `public/phase11_1_audit/` (`5.82 MB`) and `public/assets/aistudio/` (`227 KB`) reduced the static assets copied into `dist/` by **`6.05 MB`**, leaving only the `4` required `.glb` files (`2,229,596` bytes / `2.23 MB` total) in `dist/assets/blender/phase12/`.
- **Repository Clone Footprint Impact**: Removing `80` redundant debug screenshots and `.trace.json.gz` archives reduced `screenshots/` from `86` files (`~38.2 MB`) to the `6` canonical chapter captures (`~3.1 MB`) showcased in root `README.md`.

---

## 7. 📦 Dependency and Configuration Audit

| File | Audit Finding & Action | Status |
| :--- | :--- | :---: |
| `package.json` & `bun.lock` | `name: "afterframe-the-last-loop"`, `version: "0.23.4"`, `packageManager: "bun@1.4.4"`. Frozen lockfile (`bun install --frozen-lockfile`) installs cleanly (`204` packages, `0` changes). Note: template dependencies `lucide-react` and `motion` remain in `package.json` to preserve frozen-lockfile compatibility without unnecessary lockfile churn, and are no longer falsely claimed as active runtime dependencies in `README.md` or `.claude/docs/technical-preferences.md`. | `🟢 PASS` |
| `tsconfig.json` | `"strict": true` enabled; `bun run lint` (`tsc --noEmit`) passes with `0` errors. | `🟢 PASS` |
| `.gitignore` | Updated to ignore `.superpowers/` and `public/assets/aistudio/` in addition to `node_modules/`, `dist/`, `.env*`, and `.playwright-cli/`. | `🟢 PASS` |
| `.github/workflows/ci.yml` | Uses `oven-sh/setup-bun@v2` with `bun-version: "1.4.4"`, `permissions: contents: read`, and runs `bun install --frozen-lockfile`, `bun run lint`, `bun run test`, `bun run build`, and `bash .claude/scripts/registry.sh validate`. | `🟢 PASS` |

---

## 8. 📚 Markdown Consolidation and Link Validation

All Markdown files across the repository (`root`, `docs/`, `design/`, `production/`, `.claude/`) were validated for internal relative links and image paths:
- **Broken Internal Markdown Links:** `0` (`🟢 PASS`)
- **Broken Image References:** `0` (`🟢 PASS`)
- **Trailing Whitespace / Conflict Markers (`git diff --check origin/main...HEAD`):** `0` (`🟢 PASS`)

---

## 9. 🗂️ Registry and Metadata Synchronization

| Registry / Config File | Validated State | Status |
| :--- | :--- | :---: |
| `design/registry/entities.yaml` | `31` canonical entities (`1` player, `4` weapons, `8` upgrades, `7` standard enemies + `1` Archive Decoy, `5` bosses, `5` skills/interactables) matching `src/game/config.ts` | `🟢 PASS` |
| `docs/architecture/tr-registry.yaml` | `4` active technical requirements (`TR-simulation-001` to `TR-audio-004`) | `🟢 PASS` |
| `docs/registry/architecture.yaml` | `9` architecture entries (`state_ownership`, `interfaces`, `performance_budgets`, `api_decisions`, `forbidden_patterns`) | `🟢 PASS` |
| `metadata.json` & `index.html` | Synchronized title, description, OpenGraph, Twitter Card, and Schema.org `VideoGame` JSON-LD | `🟢 PASS` |

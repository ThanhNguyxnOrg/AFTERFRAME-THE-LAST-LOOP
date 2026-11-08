# 🎨 Markdown Visual Design System & Style Guide

This guide defines the visual design system, emoji/sticker taxonomy, status badge vocabulary, and structural conventions for all Markdown documentation in **AFTERFRAME: THE LAST LOOP**.

---

## 1. 📐 Heading Hierarchy & Structure

- **Single `H1` (`#`) per file**: Every Markdown file must begin with exactly one top-level `#` heading (with an appropriate semantic emoji prefix in user-facing hubs and reports).
- **Logical Nesting (`H1 -> H2 -> H3 -> H4`)**: Never skip heading levels (e.g., do not jump from `#` directly to `###`).
- **Table of Contents (`🧭 Table of Contents`)**: Required in any Markdown document exceeding `150` lines. All TOC anchor links must resolve to existing headings in the same file.

---

## 2. 🏷️ Standardized Emoji / Sticker Taxonomy

Use emojis purposefully as scannable visual anchors—maximum **one leading emoji per heading** or table category cell. Never place decorative emoji chains inside technical identifiers, file paths, or code blocks.

| Emoji | Semantic Domain | Usage Context |
| :---: | :--- | :--- |
| `🎮` | **Game Overview & Identity** | High-level pitch, protagonist, and player fantasy |
| `🏗️` | **Architecture & Engineering** | System boundaries, state ownership, and Mermaid diagrams |
| `⚔️` | **Combat, Echoes & Relay** | Chrono Rig recording, Echo replay, Relay, Parry, and Resonance |
| `🔫` | **Weapons & Upgrades** | Four-weapon arsenal and eight Upgrade Bench modifications |
| `👑` | **Enemies & Bosses** | 7 standard enemy archetypes, 1 Archive Decoy, and 5 Sovereign bosses |
| `📖` | **Campaign, Lore & Endings** | 6 campaign chapters, Codex/Archive logs, and 3 Chronicle Loom endings |
| `🎧` | **Audio & Synthesis** | `SoundEngine` Web Audio API buses (`masterGain`, `sfxGain`, `musicGain`) |
| `🎨` | **3D Rendering & Visuals** | Three.js `ArenaSceneRenderer`, procedural rigs, GLB assets, and shaders |
| `⚡` | **Performance & Profiling** | Simulation step timing, frame budgets, and 10-cycle soak telemetry |
| `🛡️` | **Save Schema, Security & Resilience** | Save V2 validation, `MAX_SAVE_JSON_BYTES`, WebGL fallback, and XSS hardening |
| `🧪` | **Automated Tests & QA** | Unit/integration test suites (`234` tests) and headless browser checks |
| `📚` | **Documentation & Navigation** | Documentation hubs, style guides, and registries |
| `🛠️` | **Setup, Build & Contribution** | Local install, scripts, CI workflows, and contributor rules |
| `🚀` | **Release Closure & Checklists** | Release readiness verdicts and owner sign-off checklists |

---

## 3. 🚦 Status & Evidence Badge Vocabulary

All verification matrices, audit tables, and release checklists must use these exact status tokens so automated and human readers can immediately distinguish verified local results from external hardware/owner gates:

| Badge Token | Meaning | When to Use |
| :--- | :--- | :--- |
| `🟢 PASS` | **Verified Passing** | Executed in the current workspace with zero errors and reproducible evidence |
| `🟠 CONDITIONAL` | **Conditionally Ready** | All in-environment checks pass, but external hardware/browser/owner gates remain open |
| `🔴 FAIL` | **Verified Failing** | Reproducible defect or failing gate requiring remediation |
| `⚪ NOT TESTED` | **Not Tested in Environment** | Cannot be executed in the current container (e.g., physical discrete GPU, Safari/Firefox, iOS/Android hardware) |
| `🧪 TESTED` | **Automated / Live Test Executed** | Backed by an executed `bun run test` suite, CCGS script, or `playwright-cli` browser session |
| `🧾 EVIDENCE AVAILABLE` | **Quantitative Evidence Recorded** | Accompanied by exact command output, test counts, or timing/counter metrics |
| `🚧 OWNER ACTION REQUIRED` | **Repository Owner Gate** | Requires action by `ThanhNguyxnOrg` (e.g., root `LICENSE` selection, hardware GPU run, or authenticated `git push`) |

---

## 4. 📊 Tables, Code Blocks & Callouts

1. **Tables**: Prefer compact Markdown tables over long prose paragraphs for weapons, upgrades, enemies, bosses, test suites, and file inventories. Align numeric columns right (`---:`) or center (`:---:`).
2. **Fenced Code Blocks**: Every fenced code block (` ``` `) must declare a language tag (`bash`, `ts`, `tsx`, `json`, `yaml`, `mermaid`, `text`).
3. **GitHub Alert Callouts**: Use standard GitHub alert syntax (`> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`) sparingly—at most 1–2 callouts per major section.
4. **Links & Images**:
   - Use relative repository paths (`docs/README.md`, `src/game/simulation.ts`, `screenshots/phase12/after/00-prologue-desktop.png`).
   - Every linked file or image must exist in the repository tree (`0` broken links).

---

## 5. 🗂️ Active vs. Historical Documentation Rules

- **Authoritative Current Docs**: Root `README.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `docs/README.md`, `docs/PHASE_23_4_1_RELEASE_CLOSURE.md`, `docs/REPOSITORY_HYGIENE_REPORT.md`, `docs/MARKDOWN_STYLE_GUIDE.md`, `design/game-brief.md`, `design/gdd/game-concept.md`, `design/gdd/systems-index.md`, and `production/*`.
- **Historical Phase Reports (`docs/AFTERFRAME_PHASE*.md`, `docs/PHASE_23_*.md`, `docs/archive/superpowers/*`)**: Preserved as immutable historical audit records for their respective phases and explicitly labeled as historical in [`docs/README.md`](README.md).

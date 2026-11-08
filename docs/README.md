# 📚 AFTERFRAME: THE LAST LOOP — Documentation Hub

Welcome to the documentation index for **AFTERFRAME: THE LAST LOOP** (`v0.23.4` / Phase 23.4.1). This hub organizes every active specification, engineering reference, release report, and historical milestone by reader intent.

> [!TIP]
> **Looking for the current release readiness status?** Start with [`docs/PHASE_23_4_1_RELEASE_CLOSURE.md`](PHASE_23_4_1_RELEASE_CLOSURE.md) (`🟠 CONDITIONALLY READY`) and [`docs/REPOSITORY_HYGIENE_REPORT.md`](REPOSITORY_HYGIENE_REPORT.md).

---

## 🧭 Navigation by Reader Intent

### 🎮 1. Players & New Visitors
| Document | Status | Summary |
| :--- | :---: | :--- |
| [Root `README.md`](../README.md) | `🟢 CURRENT` | Game overview, sector screenshot gallery, controls, 4 weapons, 8 upgrades, 7+1 enemies, 5 bosses, and 6-chapter campaign |
| [`docs/AFTERFRAME_STORY_BIBLE.md`](AFTERFRAME_STORY_BIBLE.md) | `🟢 CURRENT` | Complete narrative bible: Sera & Lysa Venn, Nadir-9 sectors, Archive logs, Codex entries, and the 3 Chronicle Loom endings (`silence`, `witness`, `continuity`) |

### 🛠️ 2. Developers & Contributors
| Document | Status | Summary |
| :--- | :---: | :--- |
| [`CONTRIBUTING.md`](../CONTRIBUTING.md) | `🟢 CURRENT` | Local setup (`bun install --frozen-lockfile`), architectural invariants, strict TDD workflow, and quality gates |
| [`docs/MARKDOWN_STYLE_GUIDE.md`](MARKDOWN_STYLE_GUIDE.md) | `🟢 CURRENT` | Emoji/sticker vocabulary, status badges (`🟢 PASS`, `🟠 CONDITIONAL`, `⚪ NOT TESTED`), and Markdown formatting standards |
| [`CHANGELOG.md`](../CHANGELOG.md) | `🟢 CURRENT` | Release history from initial vertical slice through Phase 23.4.1 (`0.23.4`) |

### 🏗️ 3. Architecture & Engine Reference
| Document | Status | Summary |
| :--- | :---: | :--- |
| [`CLAUDE.md`](../CLAUDE.md) | `🟢 CURRENT` | Top-level architecture, source layout (`src/game/*`), and studio collaboration protocol |
| [`project.yaml`](../project.yaml) | `🟢 CURRENT` | Canonical machine-readable project config (`0.23.4`, Three.js `0.186.1`, strict TypeScript, budgets, commands) |
| [`docs/engine-reference/threejs/VERSION.md`](engine-reference/threejs/VERSION.md) | `🟢 CURRENT` | Pinned Three.js `0.186.1` API rules, procedural rig hierarchy, GLB hydration, and GPU disposal contracts |
| [`docs/registry/architecture.yaml`](registry/architecture.yaml) | `🟢 CURRENT` | State ownership (`WorldState`, `CameraSettings`), step contracts, frame budgets, and forbidden patterns |
| [`docs/architecture/tr-registry.yaml`](architecture/tr-registry.yaml) | `🟢 CURRENT` | Active technical requirements (`TR-simulation-001` through `TR-audio-004`) |

### ⚔️ 4. Gameplay Systems, Balance & GDD
| Document | Status | Summary |
| :--- | :---: | :--- |
| [`design/game-brief.md`](../design/game-brief.md) | `🟢 CURRENT` | Elevator pitch, 3 core pillars, and target platform/stack |
| [`design/gdd/game-concept.md`](../design/gdd/game-concept.md) | `🟢 CURRENT` | Detailed gameplay rules, damage/mitigation formulas, boss Phase II thresholds (`50%`), and acceptance criteria |
| [`design/gdd/systems-index.md`](../design/gdd/systems-index.md) | `🟢 CURRENT` | System index (`SYS-01` through `SYS-08`) mapped to source files |
| [`design/registry/entities.yaml`](../design/registry/entities.yaml) | `🟢 CURRENT` | Canonical 31-entity registry (1 player, 4 weapons, 8 upgrades, 8 enemy/decoy entries, 5 bosses, 5 skills/interactables) |

### 🧪 5. Testing, Performance & Quality Assurance
| Document | Status | Summary |
| :--- | :---: | :--- |
| [`docs/PHASE_23_4_1_RELEASE_CLOSURE.md`](PHASE_23_4_1_RELEASE_CLOSURE.md) | `🟢 CURRENT` | **Primary Release Closure Report**: Git recovery disclosure, Save V2 matrix, 10-cycle renderer soak, and Hardware GPU / Cross-Browser checklists |
| [`docs/REPOSITORY_HYGIENE_REPORT.md`](REPOSITORY_HYGIENE_REPORT.md) | `🟢 CURRENT` | Complete repository file inventory (`683 -> 581` files), removed/archived artifacts, `.claude/` audit, and link verification |
| [`production/qa/smoke-2026-11-05.md`](../production/qa/smoke-2026-11-05.md) | `🟢 CURRENT` | Automated test breakdown (`234 / 234` tests) and all 8 CCGS diagnostic script results |
| [`production/polish/full-report-2026-11-05.md`](../production/polish/full-report-2026-11-05.md) | `🟢 CURRENT` | Simulation vs. rendering frame budgets, 10-cycle chapter soak plateau, and accessibility verification |

### 🔒 6. Security & Compatibility
| Document | Status | Summary |
| :--- | :---: | :--- |
| [`SECURITY.md`](../SECURITY.md) | `🟢 CURRENT` | Security posture summary and vulnerability reporting guide |
| [`production/security/security-audit-2026-11-05-full.md`](../production/security/security-audit-2026-11-05-full.md) | `🟢 CURRENT` | Full security audit covering `MAX_SAVE_JSON_BYTES = 262,144`, Save V2 whitelisting, zero XSS surface, and CI permissions |

### 🤖 7. Claude Code Game Studios (`v1.2.0`) Integration
| Document | Status | Summary |
| :--- | :---: | :--- |
| [`.claude/docs/technical-preferences.md`](../.claude/docs/technical-preferences.md) | `🟢 CURRENT` | Human-readable mirror of `project.yaml`, active specialists, and forbidden patterns |
| [`production/session-state/active.md`](../production/session-state/active.md) | `🟢 CURRENT` | Resumable session checkpoint and milestone ledger |
| [`docs/COLLABORATIVE-DESIGN-PRINCIPLE.md`](COLLABORATIVE-DESIGN-PRINCIPLE.md) | `🟢 CURRENT` | Collaborative vs. authorized autonomous phase execution protocol |
| [`docs/AFTERFRAME_CLAUDE_CODE_GAME_STUDIOS_INTEGRATION.md`](AFTERFRAME_CLAUDE_CODE_GAME_STUDIOS_INTEGRATION.md) | `📜 HISTORICAL` | Initial CCGS `v1.2.0` integration report |
| [`docs/adoption-plan-2026-11-04.md`](adoption-plan-2026-11-04.md) | `📜 HISTORICAL` | Brownfield CCGS adoption plan |

### 🚀 8. Historical Phase Reports & Archived Plans
> [!NOTE]
> The documents below are preserved as historical engineering records of earlier milestones. Where historical counts (such as earlier test totals or entity counts) differ from the final release candidate, [`docs/PHASE_23_4_1_RELEASE_CLOSURE.md`](PHASE_23_4_1_RELEASE_CLOSURE.md) and [`README.md`](../README.md) are authoritative.

- **Phase 23.1–23.4 Reports**:
  - [`docs/PHASE_23_4_RELEASE_CANDIDATE_ACCEPTANCE_REPORT.md`](PHASE_23_4_RELEASE_CANDIDATE_ACCEPTANCE_REPORT.md)
  - [`docs/PHASE_23_3_AUDIT_AND_EXECUTION_REPORT.md`](PHASE_23_3_AUDIT_AND_EXECUTION_REPORT.md)
  - [`docs/AFTERFRAME_PHASE23_1_RELEASE_COMPLETION_AND_AUDIT.md`](AFTERFRAME_PHASE23_1_RELEASE_COMPLETION_AND_AUDIT.md)
  - [`docs/AFTERFRAME_PHASE23_AUTONOMOUS_GAME_QUALITY_AND_EVOLUTION.md`](AFTERFRAME_PHASE23_AUTONOMOUS_GAME_QUALITY_AND_EVOLUTION.md)
  - [`docs/AFTERFRAME_PHASE22_AUTONOMOUS_GAME_QUALITY_AND_EVOLUTION.md`](AFTERFRAME_PHASE22_AUTONOMOUS_GAME_QUALITY_AND_EVOLUTION.md)
  - [`docs/AFTERFRAME_PHASE21_1_ACCEPTANCE_AND_RELEASE_SYNCHRONIZATION.md`](AFTERFRAME_PHASE21_1_ACCEPTANCE_AND_RELEASE_SYNCHRONIZATION.md)
- **Archived Superpowers Plans (`docs/archive/superpowers/`)**:
  - [`docs/archive/superpowers/2026-11-05-afterframe-phase23-1-release-completion-design.md`](archive/superpowers/2026-11-05-afterframe-phase23-1-release-completion-design.md)
  - [`docs/archive/superpowers/2026-11-05-afterframe-phase23-1-release-completion-plan.md`](archive/superpowers/2026-11-05-afterframe-phase23-1-release-completion-plan.md)
  - [`docs/archive/superpowers/2026-04-19-phase23-3-adversarial-verification-design.md`](archive/superpowers/2026-04-19-phase23-3-adversarial-verification-design.md)
  - [`docs/archive/superpowers/2026-04-19-phase23-3-adversarial-verification-plan.md`](archive/superpowers/2026-04-19-phase23-3-adversarial-verification-plan.md)
- **Earlier Milestone Reports (Phases 1–20.1.1)**:
  - [`docs/AFTERFRAME_PHASE20_1_1_RELEASE_SYNCHRONIZATION_REPORT.md`](AFTERFRAME_PHASE20_1_1_RELEASE_SYNCHRONIZATION_REPORT.md)
  - [`docs/AFTERFRAME_PHASE20_1_DELIVERY_AND_ACCEPTANCE_CLOSURE.md`](AFTERFRAME_PHASE20_1_DELIVERY_AND_ACCEPTANCE_CLOSURE.md)
  - [`docs/AFTERFRAME_PHASE20_CAMPAIGN_INTEGRATION_AND_NARRATIVE_EXPANSION.md`](AFTERFRAME_PHASE20_CAMPAIGN_INTEGRATION_AND_NARRATIVE_EXPANSION.md)
  - [`docs/AFTERFRAME_PHASE13_GAMEPLAY_FEEL_UX_PERFORMANCE.md`](AFTERFRAME_PHASE13_GAMEPLAY_FEEL_UX_PERFORMANCE.md)
  - [`docs/AFTERFRAME_PHASE12_3D_AUDIT_AND_IMPLEMENTATION.md`](AFTERFRAME_PHASE12_3D_AUDIT_AND_IMPLEMENTATION.md)
  - [`docs/AFTERFRAME_UX_AUDIT.md`](AFTERFRAME_UX_AUDIT.md)

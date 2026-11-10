# 📚 AFTERFRAME: THE LAST LOOP — Documentation Hub

Welcome to the official technical, gameplay, design, and narrative documentation for **AFTERFRAME: THE LAST LOOP**.

---

## 🧭 Core Product Documentation

| Document | Purpose |
| :--- | :--- |
| [**`README.md`**](../README.md) | Master project overview, sector screenshots, controls, arsenal, bosses, architecture, and quick start. |
| [**`docs/ARCHITECTURE.md`**](./ARCHITECTURE.md) | Runtime architecture: deterministic `60 Hz` simulation (`src/game/simulation.ts`), Three.js `ArenaSceneRenderer` & GLB pipeline (`src/game/renderer.ts`), procedural Web Audio synthesis (`src/game/audio.ts`), unified input (`src/game/input.ts`), and Save Schema V2 persistence. |
| [**`docs/GAMEPLAY_GUIDE.md`**](./GAMEPLAY_GUIDE.md) | Complete combat & tactical reference: Chrono Rig recording/replay (`[T]`/`[Y]`), Relay (`[V]`), Resonance Convergence, 4-weapon arsenal, 8 upgrades (`18` Fragments), 8 enemy archetypes, and 5 Sovereign Bosses. |
| [**`docs/STORY_BIBLE.md`**](./STORY_BIBLE.md) | Canonical narrative bible: Orbital Station Nadir-9, Sera & Lysa Venn, chapter-by-chapter story map, archive logs, and the three Chronicle Loom directives (`Silence`, `Witness`, `Continuity`). |
| [**`CHANGELOG.md`**](../CHANGELOG.md) | Complete release history and milestone log. |
| [**`CONTRIBUTING.md`**](../CONTRIBUTING.md) | Contributor workflow, architectural invariants, and mandatory verification gates. |
| [**`SECURITY.md`**](../SECURITY.md) | Client-side security posture, Save V2 deserialization bounds (`256 KB`), and vulnerability reporting policy. |

---

## 🏛️ Game Design & Studio Registries

| Document | Purpose |
| :--- | :--- |
| [**`design/game-brief.md`**](../design/game-brief.md) | Executive creative brief, core pillars, and target player experience. |
| [**`design/gdd/game-concept.md`**](../design/gdd/game-concept.md) | Complete Game Design Document (GDD) synchronized with `src/game/config.ts`. |
| [**`design/gdd/systems-index.md`**](../design/gdd/systems-index.md) | Master index of all approved core gameplay systems. |
| [**`design/registry/entities.yaml`**](../design/registry/entities.yaml) | Machine-validated canonical entity registry (`31` entities across characters, weapons, upgrades, enemies, bosses, and chapters). |
| [**`docs/architecture/tr-registry.yaml`**](./architecture/tr-registry.yaml) | Technical requirement registry (`TR-001` through `TR-004`). |
| [**`docs/registry/architecture.yaml`**](./registry/architecture.yaml) | Module ownership and dependency boundary specification (`9` runtime & test modules). |
| [**`docs/engine-reference/threejs/VERSION.md`**](./engine-reference/threejs/VERSION.md) | Three.js `0.186.1` + TypeScript `7.0` runtime conventions and GPU disposal invariants. |
| [**`production/security/security-audit-2026-11-05-full.md`**](../production/security/security-audit-2026-11-05-full.md) | Line-by-line client-side security and Save V2 deserialization audit. |

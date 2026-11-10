# 📚 AFTERFRAME: THE LAST LOOP — Documentation Hub

Welcome to the official technical, gameplay, and narrative documentation for **AFTERFRAME: THE LAST LOOP**.

---

## 🧭 Core Product Documentation

| Document | Purpose |
| :--- | :--- |
| [**`README.md`**](../README.md) | Master project overview, sector screenshots, controls, arsenal, bosses, architecture, and quick start. |
| [**`docs/ARCHITECTURE.md`**](./ARCHITECTURE.md) | Runtime architecture: deterministic `60 Hz` simulation (`src/game/simulation.ts`), Three.js `ArenaSceneRenderer` & GLB pipeline (`src/game/renderer.ts`), procedural Web Audio synthesis (`src/game/audio.ts`), unified input (`src/game/input.ts`), and Save Schema V2 persistence. |
| [**`docs/GAMEPLAY_GUIDE.md`**](./GAMEPLAY_GUIDE.md) | Complete combat & tactical reference: Chrono Rig recording/replay (`[T]`/`[Y]`), Relay (`[V]`), Resonance Convergence, 4-weapon arsenal, 8 upgrades (`18` Fragments), 8 enemy archetypes, and 5 Sovereign Bosses. |
| [**`docs/ITCH_IO_RELEASE.md`**](./ITCH_IO_RELEASE.md) | Live itch.io HTML5 playtest, build/verify/publish pipeline, six existing gameplay captures, storefront tags, and trailer/screenshot checklist. |
| [**`docs/STORY_BIBLE.md`**](./STORY_BIBLE.md) | Canonical narrative bible: Orbital Station Nadir-9, Sera & Lysa Venn, chapter-by-chapter story map, archive logs, and the three Chronicle Loom directives (`Silence`, `Witness`, `Continuity`). |
| [**`CHANGELOG.md`**](../CHANGELOG.md) | Complete release history and milestone log. |
| [**`CONTRIBUTING.md`**](../CONTRIBUTING.md) | Contributor workflow, architectural invariants, and mandatory verification gates. |
| [**`SECURITY.md`**](../SECURITY.md) | Client-side security posture, Save V2 deserialization bounds (`256 KB`), and vulnerability reporting policy. |

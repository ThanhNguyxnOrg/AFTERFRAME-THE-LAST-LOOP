# AFTERFRAME: THE LAST LOOP — POST-PHASE 14.1 BUNDLE AUDIT & GITHUB HANDOFF

---

## 1. Executive Summary

This audit investigated the discrepancy between:
1. An earlier prose reference in `docs/AFTERFRAME_PHASE13_2_SAVE_AND_TOUCH_AUDIT.md` stating:
   > `three.module.js + GLTFLoader produce a ~656 kB minified bundle (~176 kB gzipped).`
2. The single-chunk Vite 8.3.4 build output observed at the end of Phase 14.1:
   > `dist/assets/index-Bw8adOtQ.js   1,613.16 kB │ gzip: 421.36 kB`

### Confirmed Root Causes of the Discrepancy
1. **Different Scope of Measurement (`~656 kB` Three.js Vendor Core vs. Full Monolithic App Bundle)**:
   - The `~656 kB minified / ~176 kB gzip` figure corresponds solely to the **Three.js + Addons vendor subsystem** (`three.core.js`, `three.module.js`, `GLTFLoader.js`, `RoundedBoxGeometry.js`, `BufferGeometryUtils.js`, `SkeletonUtils.js`), which measures **`649.55 kB` minified / `164.96 kB` gzip** in Vite 8.3.4 (Rolldown).
   - That figure did **not** include React 19 + ReactDOM (`218.75 kB` min / `68.27 kB` gzip) or the `977.92 KiB` of application TypeScript/TSX source code added across Phases 6–14 (`src/game/simulation.ts`, `src/game/renderer.ts`, `src/game/models.ts`, `src/game/config.ts`, `src/game/audio.ts`, `src/game/input.ts`, `src/App.tsx`, `src/components/GameHud.tsx`, `src/components/TitleScreen.tsx`, `src/components/StatusModal.tsx`), which together contribute **`501.40 kB` minified / `124.57 kB` gzip**.
2. **Container `NODE_ENV=development` Leak into `vite build` (`+243.46 kB` Minified / `+63.56 kB` Gzip Bloat)**:
   - In the AI Studio container environment, the shell environment sets `process.env.NODE_ENV = "development"`.
   - When `npm run build` (`vite build`) ran with `process.env.NODE_ENV === "development"` inherited from the container environment, React 19's CommonJS entry wrappers (`node_modules/react/index.js`, `node_modules/react-dom/client.js`, `node_modules/react/jsx-runtime.js`, `node_modules/scheduler/index.js`) did not have their `else` (`development`) branches dead-code-eliminated by Rolldown.
   - Consequently, `dist/assets/index-Bw8adOtQ.js` bundled **both** React's development and production CJS distributions (`react.development.js`, `react-dom.development.js`, `react-dom-client.development.js`, and `scheduler.development.js`), inflating the bundle by **`+243.46 kB` minified (`+63.56 kB` gzip)** (`1,613.16 kB` vs. `1,369.70 kB`).
3. **Zero Accidental Third-Party Package Imports**:
   - Inspection of the production module graph (`31` modules before dead-code elimination, `26` effective runtime modules) confirmed that **none** of the unused template packages in `package.json` (`@google/genai`, `lucide-react`, `motion`, `express`, `dotenv`) are imported anywhere in `src/` or present in the bundle (`0 B`).

---

## 2. Baseline vs. Final Bundle Measurements

### 2.1 Before Optimization (Baseline Phase 14.1 `npm run build`)

Command: `npm run build` (`vite v8.3.4`, container shell `NODE_ENV=development`, single monolithic JS chunk)

| Output File | Minified Size (Vite kB = 1,000 B) | Gzip Size (Vite kB = 1,000 B) | Notes |
|---|---:|---:|---|
| `dist/index.html` | `0.96 kB` | `0.48 kB` | HTML entry |
| `dist/assets/index-BkC_5wwG.css` | `54.52 kB` | `9.72 kB` | Tailwind CSS v4 styles |
| `dist/assets/index-Bw8adOtQ.js` | **`1,613.16 kB`** | **`421.36 kB`** | Single chunk containing `three`, `src/`, **and** duplicate `react*.development.js` + `react*.production.js` CJS modules |
| **Total JavaScript** | **`1,613.16 kB`** | **`421.36 kB`** | |

### 2.2 After Optimization (Final `npm run build` with `vite.config.ts` Fix)

Command: `npm run build` (`vite v8.3.4`, `process.env.NODE_ENV = 'production'` enforced on `command === 'build'` + deterministic `rolldownOptions.output.codeSplitting.groups`)

| Output File | Minified Size (Vite kB = 1,000 B) | Gzip Size (Vite kB = 1,000 B) | Contents |
|---|---:|---:|---|
| `dist/index.html` | `1.46 kB` | `0.59 kB` | HTML entry + modulepreload links |
| `dist/assets/index-BkC_5wwG.css` | `54.52 kB` | `9.72 kB` | Tailwind CSS v4 styles |
| `dist/assets/rolldown-runtime-WkwZ5CU-.js` | `0.59 kB` | `0.36 kB` | Rolldown ESM module helper runtime |
| `dist/assets/game-io-Dys-Fc7Q.js` | `41.24 kB` | `7.13 kB` | `src/game/audio.ts`, `src/game/input.ts` |
| `dist/assets/index-DwrlVYVK.js` | `121.32 kB` | `26.00 kB` | `src/main.tsx`, `src/App.tsx`, `src/components/TitleScreen.tsx`, `src/components/GameHud.tsx`, `src/components/StatusModal.tsx` |
| `dist/assets/game-renderer-USpR73yT.js` | `144.68 kB` | `37.79 kB` | `src/game/renderer.ts`, `src/game/models.ts` |
| `dist/assets/game-simulation-BqIzsB-U.js` | `193.57 kB` | `53.29 kB` | `src/game/simulation.ts`, `src/game/config.ts`, `src/game/types.ts` |
| `dist/assets/vendor-react-pYGJIzn4.js` | `218.75 kB` | `68.27 kB` | Production-only `react`, `react-dom`, `scheduler` (`0 B` of `*.development.js`) |
| `dist/assets/vendor-three-Kgaa-aLc.js` | `649.55 kB` | `164.96 kB` | `three.core.js`, `three.module.js`, `GLTFLoader.js`, `RoundedBoxGeometry.js`, `BufferGeometryUtils.js`, `SkeletonUtils.js` |
| **Total JavaScript** | **`1,369.70 kB`** | **`357.80 kB`** | **`-243.46 kB` min (`-15.09%`) / `-63.56 kB` gzip (`-15.08%`)** |

---

## 3. Module-by-Module Production Contributors

Below is the exact breakdown of all source and dependency modules in the production build (measured via both `esbuild --metafile` and Vite 8 Rolldown chunk analysis):

| Rank | Module / Package | Raw Source Size | Minified Contribution (`esbuild` KiB) | Vite Rolldown Chunk (`kB` / `gzip`) | Role in Application |
|---:|---|---:|---:|---:|---|
| 1 | `node_modules/three/build/three.module.js` + `three.core.js` | — | `595.54 KiB` (`347.71 + 247.83`) | `vendor-three`: `649.55 kB` / `164.96 kB` | Core WebGL renderer, scene graph, cameras, lights, materials, geometries, math |
| 2 | `node_modules/three/examples/jsm/**` (`GLTFLoader`, `RoundedBoxGeometry`, `BufferGeometryUtils`, `SkeletonUtils`) | — | `45.62 KiB` | (included in `vendor-three` above) | Phase 12 Blender GLB asset loading and procedural rounded-box meshes |
| 3 | `node_modules/react-dom` + `react` + `scheduler` (production) | — | `216.90 KiB` | `vendor-react`: `218.75 kB` / `68.27 kB` | React 19 UI runtime |
| 4 | `src/game/simulation.ts` + `src/game/config.ts` + `src/game/types.ts` | `385.81 KiB` (`317,885 + 48,525 + 28,658 B`) | `190.72 KiB` (`158.82 + 31.90`) | `game-simulation`: `193.57 kB` / `53.29 kB` | Authoritative 60 Hz deterministic simulation, 5 chapters, 4 bosses, Chrono Echo/Relay/Resonance, Chrono Edge + Pulsecaster, durable v2 save serializer/parser |
| 5 | `src/game/renderer.ts` + `src/game/models.ts` | `320.77 KiB` (`167,163 + 161,305 B`) | `143.50 KiB` (`83.73 + 59.77`) | `game-renderer`: `144.68 kB` / `37.79 kB` | Three.js `ArenaSceneRenderer`, 6 sector environments, bespoke boss/Sera/Echo rigs, pooled particles & projectiles |
| 6 | `src/components/GameHud.tsx` + `TitleScreen.tsx` + `StatusModal.tsx` + `src/App.tsx` + `src/main.tsx` | `203.49 KiB` (`95,891 + 40,969 + 26,836 + 44,520 + 159 B`) | `118.68 KiB` (`58.43 + 26.46 + 15.40 + 18.28 + 0.11`) | `index`: `121.32 kB` / `26.00 kB` | Title screen, low-occlusion combat HUD, weapon deck, touch controls, pause/victory/defeat modal, main loop orchestration |
| 7 | `src/game/audio.ts` + `src/game/input.ts` | `67.85 KiB` (`44,064 + 25,415 B`) | `40.39 KiB` (`26.18 + 14.21`) | `game-io`: `41.24 kB` / `7.13 kB` | Procedural Web Audio synthesizer (`SoundEngine`) and keyboard/mouse/touch `InputController` |

---

## 4. Evaluation of On-Demand / Lazy Loading vs. Deterministic Chunking

During the audit, we evaluated whether `ArenaSceneRenderer`, `GameHud`, or `StatusModal` should be converted to asynchronous dynamic `import()` / `React.lazy()`:

1. **Why `ArenaSceneRenderer` (`three` + `renderer.ts` + `models.ts`) Cannot Be Deferred Past the Title Screen**:
   - When the game boots into `appState === 'title'`, `App.tsx` immediately mounts `ArenaSceneRenderer` inside `<div data-testid="arena-canvas-container">` to render the live 3D Nadir-9 Calibration Bay / Chronicle Loom background scene behind the Title Screen overlay (including the autonomous title camera orbit and reduced-motion responsiveness).
   - Furthermore, `window.__afterframeTest` binds synchronously to `sceneRenderer` inside `App`'s mount `useEffect`; delaying `ArenaSceneRenderer` behind an async import would break synchronous `window.__afterframeTest` availability on page load.
2. **Why `GameHud` and `StatusModal` Were Kept Synchronously Imported**:
   - Existing automated browser verification runners (`scripts/phase13_1_browser.py`, `scripts/phase13_1_accessibility.py`, `scripts/phase13_2_browser_verify.mjs`) and `window.__afterframeTest` transitions (`startCampaignRun`, `startBossEncounter`, pause/defeat) assert HUD and modal DOM elements (`[data-testid="player-hud"]`, `[data-testid="weapon-hud-module"]`, `[data-testid="status-modal"]`) on the immediate frame following state transitions.
   - Wrapping `GameHud` or `StatusModal` in `React.lazy()` + `<Suspense>` would introduce an asynchronous chunk-fetch boundary on the first transition from `'title'` to `'playing'` or `'paused'`, risking race conditions in deterministic browser suites and a one-frame HUD flash.
3. **Why `vite.config.ts` Production `NODE_ENV` Enforcement + Static Chunk Splitting Was Chosen**:
   - Enforcing `process.env.NODE_ENV = 'production'` when `command === 'build'` in `vite.config.ts` removes **`243.46 kB` minified (`63.56 kB` gzip)** of dead `react*.development.js` code with zero runtime behavior change.
   - Configuring `build.rolldownOptions.output.codeSplitting.groups` separates `vendor-three` (`649.55 kB`), `vendor-react` (`218.75 kB`), `game-simulation` (`193.57 kB`), `game-renderer` (`144.68 kB`), `game-io` (`41.24 kB`), and `index` (`121.32 kB`) so all application and React chunks are well below Vite's `500 kB` threshold and `vendor-three` is independently cacheable while keeping all module evaluation synchronous and deterministic.

---

## 5. Verification Results

All required checks were executed sequentially in the foreground after updating `vite.config.ts`:

| Check | Command | Exit Code | Result |
|---|---|---:|---|
| **Unit & Release Test Suite** | `npm test` | `0` | **`169 / 169` passing** (`simulation.test.ts`: 113, `campaign-release.test.ts`: 15, `reduced-motion.test.ts`: 33, `asset-lifecycle.test.ts`: 8) |
| **TypeScript Type-Check** | `npm run lint` (`tsc --noEmit`) | `0` | **`0` errors** |
| **Production Build** | `npm run build` (`vite build`) | `0` | **`1,369.70 kB` min / `357.80 kB` gzip** across 6 deterministic JS chunks (`-243.46 kB` min / `-63.56 kB` gzip vs. baseline) |
| **Phase 12 Blender GLB Assets in `dist/`** | `ls -la dist/assets/blender/phase12` | `0` | All 4 GLBs present (`choir_acoustic_organ.glb` `685,380 B`, `curator_archive_monolith.glb` `487,608 B`, `helix_containment_gate.glb` `588,948 B`, `matron_surgical_pod.glb` `467,660 B`) |
| **Phase 14 Prompt Artifact Absent in `dist/`** | `ls -la dist/assets/aistudio` | `0` | Confirmed `Paste_October_28__2026_-_10_34AM_a9a08dde` is **absent** from both `public/assets/aistudio/` and `dist/assets/aistudio/` |

---

## 6. GitHub Handoff & Synchronization Checklist

### 6.1 Container Git Metadata Status
- Re-checked `/app/applet/.git`: **`false` (`HAS_DOT_GIT: false`)**.
- Because the AI Studio workspace container mounts the project directory without `.git` metadata, Git commands (`git status`, `git diff`, `git log`, `git commit`, `git push`) cannot be executed from inside this container, and no branch name, commit SHA, or clean-tree assertion is fabricated.

### 6.2 Live Workspace Verification of Phase 14.1 + Post-Phase 14.1 Changes
All Phase 14.1 changes remain intact in the live `/app/applet` workspace alongside the Post-Phase 14.1 bundle audit changes:

| Status | File Path | Summary of Change to Synchronize to GitHub |
|---|---|---|
| **Modified (Post-Phase 14.1)** | `vite.config.ts` | Enforces `process.env.NODE_ENV = 'production'` when `command === 'build'` (eliminating `243.46 kB` of `react*.development.js` bloat) and configures `build.rolldownOptions.output.codeSplitting.groups` (`vendor-three`, `vendor-react`, `game-simulation`, `game-renderer`, `game-io`). |
| **Added (Post-Phase 14.1)** | `docs/AFTERFRAME_BUNDLE_AUDIT.md` | This bundle discrepancy investigation, module breakdown, before/after measurement report, and GitHub handoff checklist. |
| **Modified (Phase 14.1)** | `docs/AFTERFRAME_PHASE14_1_VERIFICATION_AND_CLEANUP.md` | Phase 14.1 verification and cleanup report (updated with cross-reference to the bundle audit). |
| **Modified (Phase 14.1)** | `docs/AFTERFRAME_PHASE14_WEAPONS_AND_COMBAT.md` | Documented historical `136` vs `169` test-count discrepancy (`accessibility.test.ts` typo vs `reduced-motion.test.ts`) and updated test verification section. |
| **Modified (Phase 14.1)** | `package.json` | Added canonical `"test": "tsx --test src/game/simulation.test.ts src/game/campaign-release.test.ts src/game/reduced-motion.test.ts src/game/asset-lifecycle.test.ts"` script. |
| **Modified (Phase 14.1)** | `src/game/simulation.ts` | Hardened `switchPlayerWeapon` to reject invalid runtime `targetWeaponId` values and block weapon switching during Chapter V `chronicle_loom` stage. |
| **Modified (Phase 14.1)** | `src/game/input.ts` | Added form-element target guard (`input, select, textarea`) in `handleKeyDown` during `playing` state. |
| **Modified (Phase 14.1)** | `src/game/simulation.test.ts` | Expanded `Phase 14.1` unit test with assertions for invalid `targetWeaponId`, `paused`/`gameover` states, and Chapter V `chronicle_loom` stage isolation. |
| **Deleted (Phase 14.1)** | `public/assets/aistudio/Paste_October_28__2026_-_10_34AM_a9a08dde` | Removed accidental 470-line raw markdown copy of the Phase 14 implementation prompt. |

### 6.3 Recommended Steps When Synchronizing with GitHub
1. Export or sync the workspace changes above into a local clone of `https://github.com/ThanhNguyxnOrg/AFTERFRAME-THE-LAST-LOOP`.
2. Verify `git status --short` and `git diff` match the exact 9 paths listed in Section 6.2 (and ensure `.playwright-cli/` or `dist/` are not staged).
3. Run `npm test`, `npm run lint`, and `npm run build` locally before committing and pushing to `main`.

---

## 7. Final Recommendation

**ready to proceed to Phase 15**

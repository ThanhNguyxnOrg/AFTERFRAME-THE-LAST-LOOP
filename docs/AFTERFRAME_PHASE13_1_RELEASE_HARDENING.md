# AFTERFRAME Phase 13.1 — Release Hardening

## Starting state and baseline

- Starting HEAD: `f759dc631aadfbb180125b12a330b0251c9a856b`, branch `main`.
- `git status --short` was empty. After `git fetch origin`, `origin/main` and local HEAD matched. The requested eight-commit history was inspected; no reset, stash, force push, or user-work overwrite was used.
- Read the Phase 13 report and current input, campaign, renderer, settings, touch controls, and tests. Phase 13 had browser JSON evidence but **no repository-owned runnable browser suite**. The new runner recreates those checks rather than claiming an old runner was executed.
- Baseline: `npm run lint` passed; `npm run build` passed; `npx --yes tsx --test src/game/simulation.test.ts` passed **110/110**.
- Existing build warnings: Vite config uses `__dirname`; the main bundle exceeds 500 kB. Both remain.
- Four GLBs, the Blender generator, chapter geometry/bespoke rigs, and Phase 12 evidence were present. Final `git diff --exit-code HEAD -- public/assets/blender/phase12 scripts/blender src/game/models.ts src/game/config.ts screenshots/phase12 screenshots/phase12-blender` passed. No new asset pipeline, model, dependency, or combat/collision configuration was introduced.

## Campaign journey and evidence boundaries

Runner: `scripts/phase13_1_browser.py`. Evidence: `screenshots/phase13-1/campaign.json` and `screenshots/phase13-1/repeat/campaign.json`.

Both final runs completed with **19 `passed_real_input`, 8 `passed_test_fixture`, 0 `failed`, and 1 `not_tested`**. Each report includes viewport, browser, save isolation, fixture descriptions, step results, and errors. No undifferentiated overall pass flag is used.

### Uninterrupted real-input segment

At the normal URL, in a fresh isolated browser context, automation:

1. Started New Campaign and inspected the opening transmission, then used its skip button. Text visibility is verified; human comprehension is not asserted.
2. Moved with WASD and aimed with an actual middle-mouse drag; performed Light, instant Heavy, held/released mouse Heavy, Parry, and Dodge.
3. Recorded/stopped/replayed an Echo on Pad 01; crossed the first open gate with WASD.
4. Recorded Heavy at the receiver, moved onto Pad 02 while recording, replayed the clip, and crossed the final gate with WASD.
5. Reached the real containment transition and HELIX encounter, without resetting/mutating the world or accelerating simulation.
6. Paused/resumed; allowed HELIX to defeat the player naturally; used the actual checkpoint retry and Return to Title/Continue Campaign controls.

The test API is read for observations in this segment, not used to drive actions or alter progression. This route completes the calibration gates; it does **not** claim to defeat the three optional security proxies. A safe calibration position prevents attack lunges from inadvertently starting combat while demonstrating controls. Receiver navigation targets inside its radius, not exactly on the numerical boundary.

### Assisted progression and replay segment

The four boss encounters are HELIX, CHOIR, CURATOR, and MATRON; Chapter V is the Loom choice, not an additional conventional boss fight. For each boss, the existing `getWorld()` hook sets boss/enemy HP to zero. This is explicitly a **terminal-health fixture, not a player-earned victory**. The actual victory modal and Next Chapter button then drive normal progression. No campaign completion arrays are directly assigned by the runner.

All three Loom choices, epilogue text, Return to Title, reload, ending archive badges, and chapter replay are verified through UI. They remain classified `passed_test_fixture` because their campaign prerequisites were assisted. A fully player-driven fight-to-epilogue run is `not_tested`.

### Persistence findings

- Fixed: after reloading a completed campaign, chapter selection could treat a completed chapter as a fresh campaign because no in-memory snapshot existed. Replay detection now also checks validated `completedChapters`. The new regression verifies blocked replay advancement, unchanged saved progress, and additive ending persistence.
- Existing limitation: storage persists unlocks, completions, recovered logs, and endings, **not the active checkpoint snapshot**. Return to Title/Continue and checkpoint retry work within a session. Reload can recover unlocked chapters through Chapter Select, but not exact checkpoint resources/stats. This was confirmed from the baseline serializer and a failed exploratory reload/Continue check; the final journey names its in-session boundary explicitly. This phase does not silently introduce a new save schema.

Contexts have separate nonpersistent storage and are closed after execution. No regular browser profile or user campaign is opened or cleared. The runner deliberately denies pointer lock to test the supported unlocked-camera path; it does not claim native pointer-lock coverage.

## HELIX frame-spike investigation

Runner: `scripts/phase13_1_performance.py`.

### Environment and methodology

- Windows 11/10 build 26300 host; Chromium **153.0.8010.12**, Python **3.14.6**, Playwright **1.63.0**.
- ANGLE **Intel UHD Graphics (0x0000A7A8), Direct3D11**; viewport/render size 1440×900, device scale 1, applied renderer DPR 1, antialiasing enabled.
- Headless Chromium process, but a non-Headless UA and `navigator.webdriver=false` select the game's ordinary full-renderer path, not its automation throttle. Explicit `--use-angle=d3d11` was verified against the actual WebGL backend.
- All four GLBs finish loading before measurement. Initial HELIX Vector Ram warm-up: 6 seconds. Each of five runs restarts HELIX, renders another 1.5 seconds, forces Vector Ram through the existing fixture API, then samples approximately 6 seconds of real rAF intervals. No player input or camera movement occurs during capture; the boss continues into subsequent phases normally.
- Both sides use identical viewport, graphics options, scenario, timing, instrumentation and Chrome trace categories. Reduced motion stays off. No simultaneous browser benchmarks run.
- Per-frame records contain boss phase/attack, render-submission time, calls, uploaded geometry/program counts, heap, trauma, events, and app state. Per-run PerformanceObserver long tasks and compressed Chrome traces are retained.
- The old Phase 13 script was not available. Its 119-sample result cannot be reproduced byte-for-byte from JSON alone; these measurements establish a new consistent before/after protocol, not a claim of identical historical methodology.

### Repeated measurements (milliseconds)

| Run | Before samples / duration ms | Before mean / p50 / p95 / max | After samples / duration ms | After mean / p50 / p95 / max |
|---|---|---|---|---|
| 1 | 337 / 6006.7 | 17.85 / 16.70 / 16.80 / 166.70 | 347 / 6003.2 | 17.29 / 16.70 / 16.80 / 83.40 |
| 2 | 329 / 6001.0 | 18.24 / 16.70 / 33.30 / 66.70 | 343 / 6002.3 | 17.49 / 16.70 / 16.80 / 83.20 |
| 3 | 336 / 6006.9 | 17.91 / 16.70 / 16.80 / 100.10 | 338 / 6000.4 | 17.75 / 16.70 / 16.80 / 116.60 |
| 4 | 350 / 6003.4 | 17.14 / 16.70 / 16.80 / 83.40 | 326 / 6009.6 | 18.46 / 16.70 / 33.30 / 66.70 |
| 5 | 348 / 6011.8 | 17.29 / 16.70 / 16.80 / 100.00 | 328 / 6013.1 | 18.34 / 16.70 / 33.30 / 83.30 |

Totals: before **1,700 samples / 30,029.8 ms**; after **1,682 / 30,028.6 ms**. All ten sampling windows reported zero PerformanceObserver long tasks. Warm-up is additional and excluded from these totals.

Evidence directories: `performance-before-hardware/` and `performance-after-hardware/`, under `screenshots/phase13-1/`. Each includes `performance.json` and five `.trace.json.gz` files; decompress a trace to inspect in Chrome Performance/Perfetto.

### What the traces and source establish

- The historical **230.4 ms spike was not reproduced** in these ten hardware runs. Lesser long frames still occur across Vector Ram attack, Helical Sweep telegraph/attack, and recovery, rather than exclusively on one telegraph edge.
- Using trace `thread_name` metadata, the largest renderer-main `RunTask` per before run was 46.00/36.66/34.92/33.08/32.44 ms; after: 33.14/39.30/39.73/32.37/41.99 ms. Main-thread GC maxima were 2.44–9.28 ms before and 2.68–6.45 ms after. These do not explain a repeatable 230 ms main-thread pause.
- GPU-process `GPUTask` maxima were 85.72–145.28 ms before and 82.58–114.82 ms after. This supports investigating graphics submission/driver scheduling next, but trace task duration alone does **not** identify a shader, effect, or GPU execution bottleneck. It is not proof of the historical spike's cause.
- Shader program count stayed at 25 during sampled frames. Uploaded geometry counts settled from 507–510 on the first run to 511 on subsequent runs. No continuing geometry growth was observed in the repeated scenario. Initial GPU upload visibility is not equivalent to new JavaScript geometry construction.
- Source inspection finds particle geometry/instancing preallocated; ordinary renderer updates transform/reuse existing scene objects. GLBs load once per renderer and are toggled with chapter groups, not reloaded every frame. The asset tests independently cover lifecycle problems rather than assuming GLBs caused the hitch.
- No timing-model rewrite, VFX deletion, reduced quality setting, boss-timing/difficulty change, or speculative per-frame optimization was made. Cleanup/replay fixes are not presented as performance fixes.

**Conclusion: unresolved/intermittent.** The maxima differ, but some after-run means/p95 values are worse; these results do not demonstrate a stable performance improvement or a root cause.

### Why the first attempt appeared hung

Default headless Chromium selected **SwiftShader (software rendering)**. With the full game renderer enabled, that diagnostic produced approximately 0.6–2.2 second frame intervals and very few samples. Those traces are isolated in `software-renderer-diagnostic/` and excluded from hardware comparison. The server remained responsive. Explicit D3D11 selection resolved the test-environment mismatch; trace-completion waiting is bounded to 15 seconds, and command invocations also have outer timeouts.

## Reduced motion

The existing CameraSettings path was the narrowest consistent integration point: it already owns persisted camera preferences and shared title/pause controls. Added `reducedMotion` to the existing versioned key, without a second settings store or dependency.

- Initial preference comes from `prefers-reduced-motion`; an explicit valid boolean overrides it, including false. Missing/malformed/null/array/nonboolean storage and unavailable storage/media APIs are safe. Reading the OS default does not write an override.
- Identical accessible toggles in Title Controls and Pause Settings update the same React state, renderer preference, and body dataset. Keyboard Space/Enter on a focused title control no longer accidentally launches the campaign.
- Reduced mode removes trauma camera displacement, stops autonomous title orbit at its current angle, and scales nonessential rings/fans/rotors/ambient pulses and Loom seal crystals/tethers to 15% speed/amplitude. Ending colors, visibility, and transformations remain distinct.
- UI animation/transitions are disabled under the effective setting. This is not an unconditional OS CSS override, so explicit user opt-out works.
- Manual aim/orbit, camera follow/collision, essential boss telegraphs, damage/state information, and gameplay timing remain intact. Hit-stop, simulation steps, AI, damage, collisions, Echo, Relay, and Resonance are unchanged.

Tests: **33** focused preference/presentation tests, including deterministic world equality with both settings. The reviewer caught initially unscaled decorative Loom crystals/tethers; four extended tests failed before that correction and passed afterward.

Browser evidence: `settings-1440.json`. OS default, keyboard opt-out, reload persistence, title/pause synchronization, and CSS were exercised. A declared paused-trauma fixture measured camera X range **0.6267** normally versus **0** reduced, with byte-identical serialized world before/after. Screenshot: `reduced-motion-settings.png`.

## Desktop, touch, and physical-device status

- Desktop full-renderer automation: 1440×900. Phase 13 reconstructed regressions pass for hover, deliberate charge-cancelling drag, non-button pointer-interactive UI filtering, and zero redundant campaign writes over an unchanged 2-second interval.
- Mobile emulation: **390×844 and 430×932**, DPR 1, desktop Chromium/Intel GPU. `touchscreen.tap` and trusted CDP `Input.dispatchTouchEvent` drive movement hold/release/cancel, Light/Heavy/Dodge/Parry, Echo record/stop/replay, pause/resume, natural defeat and touch retry.
- Movement release settles with no stuck velocity; cancellation releases movement; tested gestures do not scroll the document. Overlay taps do not alter paused simulation or start a hidden mouse attack.
- Boss HUD/control bounding boxes are in-viewport, without overlaps among the tested controls or horizontal overflow. Both screenshots were inspected. Small labels and ellipsized tutorial headings remain; this is not a blanket accessibility certification.
- Touch camera orbit is **not implemented by the current input contract** and is explicitly `not_tested`, not fabricated as working. Touch Heavy is the existing instant-Heavy button, not a claimed hold-charge gesture.
- **No physical Android/iOS phone or tablet was tested.** Emulation cannot establish thermal behavior, actual GPU performance, browser chrome/safe-area behavior, OS gestures, or multi-touch ergonomics.

### Physical-device manual QA checklist

1. Record device/model, OS/browser version, orientation, viewport, DPR, battery/power mode. Use a separate browser profile/private session so normal saves are untouched.
2. Start New Campaign; read/dismiss transmission; hold each movement direction, release, drag off the pad, interrupt with app background/foreground. Confirm no stuck movement or page scroll.
3. Tap Light, Heavy, Dodge, Parry; record/stop/replay Echo. Try movement plus action with two fingers; check ghost clicks and unintended camera/attack input. Note the missing touch-camera control explicitly.
4. Pause/resume with an active hold; tap modal text and edges; retry after defeat. Confirm no input reaches gameplay through overlays.
5. Inspect both portrait and landscape, browser bars shown/hidden, safe areas, HUD, control separation, clipped text, and scrollable settings/result screens.
6. Toggle OS reduced motion, test in-game overrides/reload, inspect camera shake and Loom presentation; confirm telegraphs remain readable.
7. Play all four fights and all three endings; verify checkpoint retry, chapter select/replay, and ending archive persistence. Separately record the known absence of reload checkpoint persistence.
8. Play at least 15 minutes; record thermal/long-frame issues and renderer/backend where accessible. Do not equate desktop frame times with phone performance.

## Asset/resource lifecycle

- Eight focused tests exercise the production renderer methods with real Three.js groups/resources and controlled asynchronous loader completions. GLB URLs/transforms, out-of-order callbacks, chapter visibility/reuse, no stale attachments, disposal, and shared geometry/material identity are covered.
- Two initially failing tests reproduced duplicate shared-resource disposal counts `[3,4,1]` and missing cleanup of delayed results. A small geometry/material disposal helper deduplicates by identity; late GLTF callbacks release their unowned resources instead of attaching them after disposal.
- No resources are disposed during chapter visibility switches. Scene textures retain their existing explicit lifetime. These procedural GLBs have no newly introduced external textures/shared global asset cache; the helper is not advertised as a generic textured-asset ownership system.
- Browser `assets-1440.json`: all four GLBs returned HTTP 200 with nonempty bodies; two rounds through their intended chapters retained identical scene UUIDs and exactly four resource requests. This is actual load/visibility evidence, separate from mocked-latency lifecycle tests.
- Original Blender generator/assets/evidence are unchanged. Existing generator/addendum indicate procedural provenance; no external asset was imported or new licensing assertion introduced. Blender was not rerun because the pipeline was not changed.

## Final verification and reproduction

All of these ran successfully against the final source/build:

```sh
npm run lint
npm run build
npx --yes tsx --test src/game/simulation.test.ts src/game/reduced-motion.test.ts src/game/campaign-release.test.ts src/game/asset-lifecycle.test.ts
npm run preview -- --host 127.0.0.1 --port 4173
python scripts/phase13_1_browser.py --suite regression --url http://127.0.0.1:4173
python scripts/phase13_1_browser.py --suite campaign --url http://127.0.0.1:4173
python scripts/phase13_1_accessibility.py --suite settings
python scripts/phase13_1_accessibility.py --suite mobile
python scripts/phase13_1_accessibility.py --suite assets
python scripts/phase13_1_performance.py --out screenshots/phase13-1/performance-after-hardware
python scripts/phase13_1_browser.py --suite campaign --url http://127.0.0.1:4173 --out screenshots/phase13-1/repeat
```

Keep the preview server in a separate terminal; do not run GPU suites concurrently. Python Playwright and its Chromium executable were already installed outside npm; no project dependencies changed. The D3D11 launch setting targets this Windows host. Other platforms require selecting and reporting their actual graphics backend rather than silently comparing a different one. `npm run dev` was also started and inspected; final repeatable runs use the production preview to avoid hot-reload changes mid-journey.

Result: **152/152 unit tests**, typecheck/build successful, reconstructed Phase 13 browser regressions successful, two complete classified campaign audits successful, settings/two-viewport touch/asset suites successful, zero browser page/console errors in those final reports. Source diff and focused screenshots were inspected; an independent reviewer reviewed code/tests and their two identified issues were corrected (Loom motion coverage and explicit asset-suite dispatch).

### Changed files

- Product: `src/App.tsx`, `src/components/TitleScreen.tsx`, `src/components/StatusModal.tsx`, `src/game/input.ts`, `src/game/types.ts`, `src/game/renderer.ts`, `src/game/simulation.ts`, `src/index.css`.
- Tests: `src/game/reduced-motion.test.ts`, `src/game/asset-lifecycle.test.ts`, `src/game/campaign-release.test.ts`.
- Runners: `scripts/phase13_1_browser.py`, `scripts/phase13_1_accessibility.py`, `scripts/phase13_1_performance.py`.
- This report and focused JSON/PNG/compressed trace evidence under `screenshots/phase13-1/`. Repeat screenshots and temporary worker files were removed; build artifacts are not included.

## Remaining issues and exit assessment

| Priority | Issue | Status / next verification |
|---|---|---|
| P0 | No critical regression reproduced in the tested paths | Not a proof against every possible game state |
| P1 | HELIX long frames / historical 230 ms spike | Unresolved/intermittent; investigate graphics/driver submission with device-level profiling, without guessing a source fix |
| P1 | Exact campaign checkpoint does not survive full reload | Preexisting persistence scope; unlocks/endings survive, in-session retry/Continue verified; design a validated resumable-save format separately |
| P2 | Fully unassisted boss-to-epilogue automation | Not tested; real-input Calibration/first encounter plus explicit assisted progression is delivered as permitted |
| P2 | Physical mobile/tablet QA and touch camera control | Device test outstanding; touch orbit absent; use checklist before claiming mobile release readiness |
| P2 | Small mobile labels and existing build warnings | Emulated controls usable in tested paths; assess readable touch sizing on actual hardware |

The phase's automated hardening scope is delivered with explicit exceptions allowed by the brief (assisted progression, unresolved spike, no physical device). It is **not** a claim of hitch-free performance, a fully player-earned campaign ending, or physical-mobile release certification. Before the next Action RPG feature milestone, prioritize durable checkpoint persistence and phone/tablet input validation; then consider a small data-driven weapon archetype only after those release risks are addressed. No inventory, loot, weapon, or equipment system was started here.

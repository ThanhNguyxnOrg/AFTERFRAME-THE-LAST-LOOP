# AFTERFRAME: THE LAST LOOP — PHASE 13
## Gameplay Feel, Combat Responsiveness, UX and Performance

### 1. Starting point and baseline

- Starting commit: `5878495` (`Add Blender-authored chapter assets and GLB import`).
- `origin/main` was fetched and matched local `HEAD`: divergence `0 0`. Blender source, four GLBs, loader integration and Phase 12 evidence remained present.
- Dependencies were already installed. `bun.lock` and `package.json` were not changed.
- Baseline `npm run lint` (`tsc --noEmit`): passed.
- Baseline `npm run build`: passed, with the pre-existing Vite `__dirname` and large-chunk warnings.
- Baseline simulation suite: **108/108 passed**.
- Current input path, world loop, campaign persistence, renderer, HUD, tutorial triggers and GLB lifecycle were inspected from source rather than prior reports.

### 2. Ranked findings and root causes

#### P0 — Critical

No softlock, save-loss or progression blocker was reproduced during this phase.

#### P1 — High

1. **Unlocked-camera hover rotated the view without dragging.**
   - Evidence: real Chromium test changed yaw from `3.141592653589793` to `2.3415926535897933` after pointer movement with no button down.
   - Root cause: in the unlocked path, `handleMouseMove` read mouse delta and called `rotateCameraByDelta` whenever `dx/dy` was nonzero. The drag threshold only controlled attack cancellation, not camera ownership.
   - Fix: unlocked camera now rotates only while the deliberate left-drag flag or middle mouse button is active.

2. **Starting a camera drag during Heavy charge created an unintended attack.**
   - Evidence: real Chromium test entered `charging_heavy`, began a left-drag, and observed `light_active` before returning to idle.
   - Root cause: drag start cleared `leftMouseDown`, so `heavyHoldActive` became false. The simulation interpreted that as a normal charge release and converted the sub-threshold charge into a Light attack.
   - Fix: drag start emits a one-frame `cameraDragJustStarted` input. `updatePlayer` consumes it to cancel a pending charge to `idle` and clear the action buffer without producing Light/Heavy damage.

3. **Non-button UI surfaces could leak clicks into gameplay.**
   - Evidence: the mouse filter only excluded `button, input, a, [role="dialog"]`, while combat-overlay panels use `.pointer-events-auto` containers with text, not only buttons.
   - Fix: pointer-auto UI is now excluded from gameplay mouse input. Regression coverage verifies this filter.

4. **Campaign progress was stringified and written to localStorage repeatedly when unchanged.**
   - Evidence: HUD synchronization runs at least every 100 ms and called `savePersistedCampaignProgress`. Baseline scenario deltas were 11–15 campaign writes per ~2 seconds.
   - Root cause: every call recomputed the serialized snapshot and wrote storage even when the resulting JSON was identical.
   - Fix: the serialized value is cached; storage is written only after a real change. Post-fix browser run recorded zero redundant writes when progress stayed unchanged.

#### P2 — Polish

5. **Desktop control wording did not fully distinguish tap from hold.**
   - The same mouse input intentionally supports a quick Light tap and a held Heavy charge. The control drawer and HUD now explicitly say `Tap LMB / F / J`, `Hold LMB / J`, and `E / K / RMB` for instant Heavy.

6. **Boss-scene p95/max frame intervals still show occasional spikes.**
   - These remain a performance investigation target rather than being claimed fixed.

### 3. Implemented behavior changes

- `src/game/input.ts`
  - Unlocked hover no longer rotates camera.
  - Deliberate drag/middle drag owns unlocked camera rotation.
  - Drag start produces `cameraDragJustStarted`.
  - Pointer-auto overlay UI is excluded from gameplay attack input.
  - All one-frame flags are reset through `clearAllInputs`.
- `src/game/types.ts`
  - Adds optional `cameraDragJustStarted` to `PlayerInputFrame`.
- `src/game/simulation.ts`
  - Cancels a pending Heavy charge and action buffer when camera drag begins.
- `src/App.tsx`
  - Avoids repeated campaign serialization/storage writes when progress is unchanged.
- `src/components/TitleScreen.tsx`, `src/components/GameHud.tsx`
  - Tap/hold control language and button titles now agree with actual input semantics.
- No campaign, boss, enemy, Echo, Relay, Resonance, puzzle, checkpoint, saving, ending or imported-GLB behavior was removed or replaced.

### 4. Regression coverage

Added two focused tests in `src/game/simulation.test.ts`:

1. Unlocked hover does not rotate; deliberate drag rotates and emits a single cancel edge; clicking a pointer-auto UI target does not set `leftMouseDown`.
2. Dragging during an active Heavy charge cancels to idle, clears charge/buffer, and does not create Light or Heavy attacks on later frames.

Final simulation result: **110/110 passed**. Existing Echo determinism, Combat, Relay, Resonance, all boss mechanics, chapter progression, checkpoint/retry, ending persistence and practice isolation tests remain passing.

### 5. Browser verification

Method: Playwright Chromium with normal desktop rendering. For performance runs, `navigator.webdriver` was overridden so the game used its non-headless rendering path; no app source branch was changed for measurement.

Real-input checks (world reset between isolated action checks using the existing test hook):

- New Campaign and intro skip: entered `campaign`, then `calibration`.
- `W` moved the player.
- `F` produced `light_active` / `light_recovery`.
- `E` produced `heavy_windup` / `heavy_active` / `heavy_recovery`.
- `Space` produced `dodging`.
- `Q` produced `parry_active` / `parry_recovery`.
- Held LMB produced `charging_heavy`; release produced the Heavy sequence.
- Echo reached `ready`, then `playback`.
- Pause reached `paused`; Resume returned to `playing`.
- Mobile touch pad moved Sera; touch Light attack and Echo recording worked.
- Mobile 390×844 had no horizontal overflow.
- Zero browser console/page errors in the final journey run.

Evidence: `screenshots/phase13/journey-verification.json`, `screenshots/phase13/browser-regression.json`, and two targeted captures under `screenshots/phase13/targeted/`.

These checks are not a complete manual campaign playthrough. Boss/chapter transitions and endings are covered by the 110 simulation tests and earlier Phase 12 real-browser captures, not by a fresh uninterrupted player-driven run in Phase 13.

### 6. Performance measurements

Environment: Windows desktop Chromium, ANGLE D3D11, Intel UHD Graphics, 1440×900 except the mobile-viewport row. Values are real `requestAnimationFrame` intervals from this machine, not a phone or GPU benchmark.

| Scene | Baseline mean / p95 | After mean / p95 |
| --- | ---: | ---: |
| Standard combat | 9.62 / 18.20 ms | 9.52 / 18.30 ms |
| HELIX telegraph | 11.00 / 18.20 ms | 11.77 / 18.30 ms |
| Echo recording | 10.03 / 18.20 ms | 11.56 / 24.10 ms |
| Boss intro | 8.35 / 12.30 ms | 9.42 / 18.20 ms |
| Loom Witness | 8.30 / 12.20 ms | 8.50 / 12.40 ms |
| Mobile viewport, MATRON Sever | 6.98 / 12.10 ms | 7.58 / 12.30 ms |

Observed limitations:

- Runs vary with startup shader compilation and background browser load; the table is evidence of conditions, not proof of a universal FPS gain.
- HELIX telegraph still produced a ~230 ms long frame after warm-up. Further profiling should isolate shader/material or GC ownership before changing timing architecture.
- No real phone was available. Mobile numbers come from a 390×844 viewport on desktop Intel graphics.
- The game's headless throttle was explicitly disabled for these measurements via browser automation conditions; headless screenshots were not used as FPS evidence.

### 7. Remaining issues

- **P1:** No automated, uninterrupted real-input campaign playthrough from title to epilogue. Existing tests cover transitions and persistence, but a long-running browser journey would catch integration timing issues between chapters.
- **P1:** Boss-effect long frames remain unresolved; measure allocation and render submission around phase/escalation transitions before altering the substep architecture.
- **P2:** Reduced-motion support is not yet implemented for camera trauma and ambient presentation.
- **P2:** Real hardware mobile/tablet testing is still missing.
- **P2:** Weapon variety, inventory, loot and mission systems remain intentionally out of scope until core usability and stability work is complete.

### 8. Recommended next phase

Run a **release-hardening phase** rather than adding the weapon system immediately:

1. Automate a real-input campaign smoke run, using test hooks only for fixtures that would otherwise take minutes.
2. Profile and reduce the remaining boss-scene long frames with allocation/render evidence.
3. Add reduced-motion behavior to camera shake, UI transitions and nonessential ambient motion.
4. Validate the full control contract on a real touch device.
5. Only after those pass, resume Phase 13's deferred data-driven weapon milestone.

# AFTERFRAME: THE LAST LOOP — PHASE 9.1 FINAL VISUAL UX ACCEPTANCE AUDIT

## 1. Executive Summary & Acceptance Gate Status

- **Status**: **PASSED (Phase 9.1 Final Visual UX Acceptance + Phase 9.2 / 9.2.1 Progression & Replay Isolation Verified)**
- **Simulation Unit Test Suite**: `102/102` passing (`npx --yes tsx --test src/game/simulation.test.ts`, `0` failures)
- **TypeScript Static Check**: `0` errors (`tsc --noEmit`)
- **Production Bundle Build**: Succeeded (`npm run build`)
- **Real Browser & Screenshot Inspection**: `17` screenshots captured and visually inspected across Desktop (`1280×800`) and Mobile (`390×844`) viewports in headless Chromium with `0` console errors and `0` uncaught page errors.

---

## 2. Visual States Captured & Inspected (`1280×800` Desktop & `390×844` Mobile)

All required UI states were rendered in Chromium, captured to `/.playwright-cli/`, and inspected directly:

| # | UI State | Viewport | Artifact Path | Visual Verdict |
|---|---|---|---|---|
| 1 | Fresh Title Screen (No Saved Run) | `1280×800` | `.playwright-cli/p91-01-title-desktop.png` | **PASS** — `NEW CAMPAIGN [ENTER]` is the unmistakable primary cyan CTA; balanced 2-column layout with `FIRST-TIME OPERATOR BRIEFING` on the right and 3D arena visible behind. |
| 1b | Title Screen with Resumable Campaign | `1280×800` | `.playwright-cli/p91-01b-title-continue-desktop.png` | **PASS** — `CONTINUE CAMPAIGN (CH.III · THE CURATOR)` appears as primary cyan CTA above `NEW CAMPAIGN [ENTER]`. |
| 2 | Chapter Select Drawer | `1280×800` | `.playwright-cli/p91-02-chapters-desktop.png` | **PASS** — Dedicated right-hand drawer shows unlocked `Prologue · Wake` (`ACTIVE`) and locked Chapters I–V with explicit unlock requirements. |
| 3 | Practice Arena Drawer | `1280×800` | `.playwright-cli/p91-03-practice-desktop.png` | **PASS** — Dedicated drawer clearly labeled `ISOLATED SIMULATION · NO CAMPAIGN MUTATION` with `Practice · Calibration Bay` and all 4 bosses. |
| 4 | Controls & System Settings Drawer | `1280×800` | `.playwright-cli/p91-04-controls-desktop.png` | **PASS** — Clean 2-column keybinding table (`[WASD]`, `Mouse / [Arrows]`, `[LMB / F]`, `[E]`, `[Space]`, `[Q]`, `[T]`, `[Y]`, `[V]`, `[G]`, `[X]`) + Audio, Hints, Sensitivity, and Invert-Y controls. |
| 5 | Opening Transmission Overlay | `1280×800` | `.playwright-cli/p91-05-intro-transmission-desktop.png` | **PASS** — Concise mission briefing with high-contrast amber `BEGIN CALIBRATION [SPACE]` CTA; bottom tutorial banner is suppressed while intro is open so nothing overlaps. |
| 6 | Calibration Step 1 & Combat HUD | `1280×800` | `.playwright-cli/p91-06-calibration-step1-desktop.png` | **PASS** — Top-left survival/Echo deck, top-center single active calibration objective (`STEP 1 OF 3 · HOLD ANCHOR PAD 01 WITH AN ECHO`), top-right utility bar, and wide unobstructed center arena. |
| 7 | Echo Recording State (`[T]`) | `1280×800` | `.playwright-cli/p91-07-echo-recording-desktop.png` | **PASS** — Amber recording badge (`REC 0.4s/8.0s`) and amber `[T] REC` highlight clearly distinguish recording from live idle state. |
| 8 | Echo Replay Holding Pad 01 (`[Y]`) | `1280×800` | `.playwright-cli/p91-08-calibration-step2-desktop.png` | **PASS (Polished in 9.1)** — Cyan Echo actor holds Anchor Pad 01 (`1. PAD 01: ACTIVE`) while headline updates to `STEP 1 OF 3 · PAD 01 HELD — CROSS WEST THROUGH GATE 01` with actionable gate-crossing instruction. |
| 10 | Consolidated Boss HUD (`HELIX-04`) | `1280×800` | `.playwright-cli/p91-10-boss-hud-desktop.png` | **PASS (Polished in 9.1)** — Single top-center Boss HUD card (`HELIX-04`, `CORE SHIELDED · 360/360`, 2-phase HP bar with 50% marker, stagger bar, deduplicated phase/state row, and counterplay cue). |
| 11 | Pause & System Settings Modal | `1280×800` | `.playwright-cli/p91-11-pause-modal-desktop.png` | **PASS (Polished in 9.1)** — Interactive `AUDIO [M]`, `HINTS [H]`, `CAMERA SENSITIVITY`, and `INVERT Y-AXIS` controls; `RESUME GAMEPLAY [P / ESC]` primary CTA and unclipped 2-column secondary actions. |
| 12 | Campaign Boss Victory Modal | `1280×800` | `.playwright-cli/p91-12-victory-modal-desktop.png` | **PASS (Polished in 9.1)** — Prominent `UNLOCKED: CHAPTER II · THE CHOIR` badge and full-width `ADVANCE TO CHAPTER II · THE CHOIR [ENTER]` primary CTA above `REPLAY BOSS [R]` and `NEW CAMPAIGN · FULL RUN`. |
| 12b | Isolated Chapter Replay Victory Modal | `1280×800` | `.playwright-cli/p91-12b-replay-victory-modal-desktop.png` | **PASS (Polished in 9.1)** — `RESTORE SAVED CAMPAIGN` is the full-width primary cyan CTA, preventing accidental campaign resets after replaying an earlier chapter. |
| 13 | Campaign Boss Defeat Modal | `1280×800` | `.playwright-cli/p91-13-defeat-modal-desktop.png` | **PASS (Polished in 9.1)** — Explains saved checkpoint values (`75 Integrity · 62 Flux`) with `RETRY BOSS CHECKPOINT [R]` as primary cyan CTA alongside `RESTART FULL CAMPAIGN`. |
| 14a | Chronicle Loom Ending Selection | `1280×800` | `.playwright-cli/p91-14a-chronicle-loom-choice-desktop.png` | **PASS (Polished in 9.1)** — Full-viewport backdrop dims background HUD to `20%` opacity so the 3 distinct ending cards (`SILENCE [1]`, `WITNESS [2]`, `CONTINUITY [3]`) have zero overlap with side HUD panels. |
| 14b | Chronicle Loom Final Epilogue Modal | `1280×800` | `.playwright-cli/p91-14b-chronicle-loom-epilogue-desktop.png` | **PASS** — Displays `OUTCOME II — WITNESS: THE SIGNAL BEYOND NADIR-9`, full narrative epilogue, run telemetry, and `PLAY AGAIN [R]` / `RETURN TO TITLE`. |
| M1 | Mobile Title Screen | `390×844` | `.playwright-cli/p91-m01-title-mobile.png` | **PASS** — Zero horizontal overflow (`scrollWidth = 390 === innerWidth = 390`); primary `NEW CAMPAIGN [ENTER]` CTA and 3 drawer tabs fit cleanly above the 3D arena. |
| M6 | Mobile Calibration & Combat HUD | `390×844` | `.playwright-cli/p91-m06-calibration-hud-mobile.png` | **PASS (Polished in 9.1)** — `537px` vertical playfield clearance (`topHudBottomY = 252`, `touchPadTopY = 789`), compact 2-column Integrity/Flux bars, touch `[W][A][S][D]` pad, and deduplicated tutorial banner title. |
| M10 | Mobile Boss Encounter HUD | `390×844` | `.playwright-cli/p91-m10-boss-hud-mobile.png` | **PASS (Polished in 9.1)** — Consolidated Boss HUD fits within `390px` width without overlapping the center combat arena or bottom touch controls. |

---

## 3. Direct Verification of Original Usability Complaints

1. **"The UI feels chaotic"**:
   - **Resolved**: Title screen secondary modes (`CHAPTER SELECT`, `PRACTICE ARENA`, `CONTROLS`) are tucked into mutually exclusive contextual drawers rather than rendered simultaneously. During gameplay, only one top-center card is ever visible (either the 3-step Calibration tracker OR the consolidated Boss HUD, never both), and the bottom tutorial prompt is automatically hidden during opening/transition modals and Chronicle Loom selection.
2. **"Some areas have awkward empty space"**:
   - **Resolved**: On `1280×800` desktop, the title screen balances the left brand/CTA column (`520px`) with the right `FIRST-TIME OPERATOR BRIEFING` card (or active drawer) while keeping Sera Venn and the Nadir-9 arena framed in the center. On `390×844` mobile, the briefing card collapses so the 3D arena remains visible.
3. **"It is unclear how to begin playing"**:
   - **Resolved**: On a fresh launch, `NEW CAMPAIGN [ENTER]` is the single high-contrast cyan primary button. When a resumable campaign exists, `CONTINUE CAMPAIGN` appears directly above it with the saved chapter badge (`CH.III · THE CURATOR`).
4. **"It is unclear what to do next in Calibration Bay"**:
   - **Resolved**: The opening transmission features an explicit `BEGIN CALIBRATION [SPACE]` CTA. Once in Calibration Bay, `getCurrentCalibrationObjective()` displays one step at a time (`STEP 1 OF 3`, `STEP 2 OF 3`, `STEP 3 OF 3`) with coordinates and keybinds, updating immediately when Anchor Pad 01 is held (`STEP 1 OF 3 · PAD 01 HELD — CROSS WEST THROUGH GATE 01`).

---

## 4. Real Browser Usability Tasks (Tasks A–E) Verification

All five end-to-end player tasks were executed in Chromium (`playwright-cli`):

- **Task A — First-Time Player Launch & Calibration Entry**:
  - Verified fresh title screen shows `NEW CAMPAIGN [ENTER]` as primary CTA (`continueVisibleOnFresh = false`).
  - Clicked `NEW CAMPAIGN [ENTER]` -> opening transmission appeared -> clicked `BEGIN CALIBRATION [SPACE]` -> entered active gameplay with `STEP 1 OF 3 · HOLD ANCHOR PAD 01 WITH AN ECHO`.
- **Task B — Chrono Echo Record (`[T]`), Replay (`[Y]`), & Step Progression**:
  - Moved Sera to Anchor Pad 01 `(-3.8, 9.0)`, recorded with `[T]`, replayed with `[Y]` -> verified `pressure-plate-status` switched to `1. PAD 01: ACTIVE` (`data-plate-activated="true"`, `data-barrier-open="true"`) and the active objective instructed Sera to cross West through Gate 01.
  - Crossed Gate 01 -> verified objective advanced to `STEP 2 OF 3 · CHARGE THE NORTH RESONANCE RECEIVER`.
- **Task C — Campaign Boss Victory & Progression to Next Chapter**:
  - Completed Calibration Bay -> clicked `ENGAGE NOW [SPACE]` -> entered `Chapter I · HELIX-04` with consolidated `[data-testid="boss-hud"]`.
  - Defeated `HELIX-04` -> verified Victory Modal displayed `UNLOCKED: CHAPTER II · THE CHOIR` and `ADVANCE TO CHAPTER II · THE CHOIR [ENTER]`.
  - Clicked `ADVANCE TO CHAPTER II · THE CHOIR [ENTER]` -> transitioned directly into `Chapter II · THE CHOIR` (`bossId = 'the-choir'`, `choir-hud-telemetry` active).
- **Task D — Pause Settings, Defeat Recovery, Return to Title, & Isolated Chapter Replay**:
  - Opened Pause Modal (`[P]`) -> toggled `AUDIO [M]` and `HINTS [H]` -> verified both updated live and persisted on resume.
  - Triggered Defeat Modal -> verified `RETRY BOSS CHECKPOINT [R]` restored arena-entry checkpoint (`75 Integrity · 62 Flux`).
  - Returned to Title -> verified `CONTINUE CAMPAIGN` was visible (`continueVisibleAfterProgress = true`).
  - Opened `CHAPTER SELECT` -> replayed `Chapter I · HELIX-04` while saved at Chapter II -> defeated `HELIX-04` -> verified replay Victory Modal did **not** overwrite or advance Chapter II and presented `RESTORE SAVED CAMPAIGN` as the primary CTA.
- **Task E — Chapter V Chronicle Loom 3-Ending Choice & Epilogue**:
  - Entered `Chapter V · THE LAST LOOP` -> verified 3 distinct ending cards (`SILENCE [1]`, `WITNESS [2]`, `CONTINUITY [3]`) with consequence tags and descriptions -> selected `WITNESS` -> verified final epilogue modal (`OUTCOME II — WITNESS: THE SIGNAL BEYOND NADIR-9`) and verified that a completed campaign no longer displays `CONTINUE CAMPAIGN` on the title screen.

---

## 5. Concrete Visual Defects Found & Corrected in Phase 9.1

1. **Defect 1 — StatusModal Secondary Button Right-Edge Text Clipping (`StatusModal.tsx`)**:
   - *Observation*: In initial `p91-11-pause-modal-desktop.png`, `p91-12-victory-modal-desktop.png`, and `p91-13-defeat-modal-desktop.png`, placing `RETRY BOSS CHECKPOINT [R]`, `RESTART FULL CAMPAIGN`, and `RETURN TO TITLE` in a single wrapping flex row squeezed `RETRY BOSS CHECKPOINT [R]` and `NEW CAMPAIGN · FULL RUN` against their right borders.
   - *Correction*: Widened the modal container to `max-w-[560px]`, arranged secondary recovery buttons in a dedicated 2-column grid (`grid-cols-1 sm:grid-cols-2 gap-2.5`) so each button receives ~`250px` of width, and placed `RETURN TO TITLE` on its own full-width footer row. Re-verified in `p91-11`, `p91-12`, and `p91-13` with zero text clipping.

2. **Defect 2 — Isolated Chapter Replay Victory Modal Primary Action Hierarchy (`StatusModal.tsx`)**:
   - *Observation*: In initial `p91-12b-replay-victory-modal-desktop.png`, after finishing an isolated replay of an earlier chapter while holding saved campaign progress at a later chapter, `NEW CAMPAIGN · FULL RUN` was styled as the bright cyan primary button while `RESTORE SAVED CAMPAIGN` was styled as a secondary outline button.
   - *Correction*: Promoted `RESTORE SAVED CAMPAIGN` to the full-width bright cyan primary CTA in the Primary Action Row whenever `!isPaused && isVictory && !canAdvanceChapter && hasSavedCampaignSnapshot`, and styled `NEW CAMPAIGN · FULL RUN` as a secondary rose-outline button. Re-verified in `p91-12b-replay-victory-modal-desktop.png`.

3. **Defect 3 — Chronicle Loom Ending Overlay Collision with Top-Left HUD (`GameHud.tsx`)**:
   - *Observation*: In initial `p91-14a-chronicle-loom-choice-desktop.png`, the centered `chronicle-loom-panel` overlapped the right edge of the active top-left combat HUD (`[X] COLLAPSE`, `ECHO RIG`).
   - *Correction*: Wrapped `chronicle-loom-panel` in a full-viewport backdrop (`fixed inset-0 z-20 flex items-center justify-center p-4 bg-[#05080e]/78`) and dimmed the background top HUD row (`opacity-20 pointer-events-none`) while `hud.loom.active && hud.run.stage === 'chronicle_loom'` is active. Re-verified in `p91-14a-chronicle-loom-choice-desktop.png`.

4. **Defect 4 — Redundant Phase Prefix in Boss HUD & Step Prefix in Tutorial Banner (`GameHud.tsx`)**:
   - *Observation*: In initial `p91-10-boss-hud-desktop.png` and `p91-m10-boss-hud-mobile.png`, `[data-testid="boss-hud"]` repeated `PHASE I · CONTAINMENT`, `PHASE I · CONTAINMENT PROTOCOL`, and `PHASE I PROTOCOL · ...` across two adjacent rows. Similarly, the bottom tutorial banner repeated `STEP 1 OF 6 · ORIENTATION · STEP 01 · LOCOMOTION...`.
   - *Correction*: Stripped redundant leading `PHASE I/II · ` prefixes from the center status label and subtext line inside `boss-hud`, and stripped duplicate `STEP 0X · ` / `CALIBRATION X/3 · ` / `CHAPTER X · ` prefixes from `tutorial-step-title`. Re-verified in `p91-10`, `p91-m06`, and `p91-m10`.

5. **Defect 5 — Calibration Step 1 Active Pad Instruction Clarity (`simulation.ts`, `GameHud.tsx`)**:
   - *Observation*: In initial `p91-08-calibration-step2-desktop.png`, while an Echo was actively holding Anchor Pad 01 (`1. PAD 01: ACTIVE`), `calibration-active-objective` replaced the step instruction with `echo.statusMessage` (`CHRONO ANCHOR SYNCED · CONTAINMENT BARRIER OPEN`) and kept the headline as `HOLD ANCHOR PAD 01 WITH AN ECHO`.
   - *Correction*: Updated `getCurrentCalibrationObjective()` in `src/game/simulation.ts` so when `puzzle.teachPlateActive` is true, the headline reads `STEP 1 OF 3 · PAD 01 HELD — CROSS WEST THROUGH GATE 01` with explicit gate-crossing instructions, and kept `calGuidance.instruction` visible in `calibration-active-objective` during normal Echo playback. Re-verified in `p91-08-calibration-step2-desktop.png`.

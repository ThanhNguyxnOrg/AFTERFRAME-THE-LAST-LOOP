# itch.io HTML5 Release

AFTERFRAME is a static Vite browser game. The package workflow type-checks the project, runs the test suite, builds the game, validates the four required GLB assets, creates a ZIP with `index.html` at the archive root, and runs Chromium against that exact ZIP over HTTP.

## Build and verification

Pushes to `main` that change game source, public assets, build configuration, dependencies, packaging scripts, or this workflow automatically run the full package pipeline and publish the verified ZIP to the itch.io `html5` channel. Pull requests never publish. Documentation-only edits do not trigger this workflow.

A manual **Run workflow** with `publish_to_itch` left unchecked runs package and verification only. Enable the checkbox to deliberately publish a verified build from `main`.

The package job verifies:
- TypeScript type-check and the full test suite.
- A production Vite build using relative asset URLs.
- The four required Chapter GLB files, including their glTF 2.0 binary structure.
- ZIP integrity and `index.html` at the archive root.
- The actual packaged ZIP in Chromium over HTTP: React title screen, WebGL2 canvas, all four GLB responses, and the New Campaign transition into `playing`.
- No failed same-origin asset requests, HTTP 4xx/5xx responses, uncaught page errors, or fatal game/WebGL console errors.

The exact tested game ZIP is uploaded as the `AFTERFRAME-THE-LAST-LOOP-itch-html5` Actions artifact for 30 days. The publish job downloads that same artifact from the same workflow run and re-validates it before uploading; it does not rebuild a second, potentially different ZIP.

## One-time itch.io setup

1. The existing itch.io project is [AFTERFRAME: THE LAST LOOP](https://thanhnguyxn.itch.io/afterframe-the-last-loop). Its Butler target is `thanhnguyxn/afterframe-the-last-loop`.
2. Confirm **Kind of project** is **HTML** on the itch.io edit page.
3. Keep the game destination as a **repository variable** (each game has its own itch.io slug):
   - In `ThanhNguyxnOrg/AFTERFRAME-THE-LAST-LOOP`, open **Settings → Secrets and variables → Actions → Variables → New repository variable**.
   - Name it `ITCHIO_GAME`.
   - Set its value to `thanhnguyxn/afterframe-the-last-loop`.
   - For another game, set that repository's own `ITCHIO_GAME` value to its own lowercase `account/project-slug`.

The project-specific destination remains local to this repository.
After the first upload creates the `html5` channel, open the itch.io project's Edit page and tag that channel **HTML5 / Playable in browser**. Confirm the project kind remains **HTML**. Butler uploads the channel build; it does not change this itch.io page setting.

## Publish a verified build

## Automatic deployment

Every qualifying push to `main` follows this sequence:

1. Install the locked dependencies and run the TypeScript check and full test suite.
2. Build the Vite site, validate the required GLB files and ZIP structure, and run the Chromium smoke test against the exact packaged ZIP.
3. Upload the verified ZIP as a workflow artifact.
4. Only after the package job succeeds, download and re-validate that same artifact, then publish it with the official Butler CLI to `thanhnguyxn/afterframe-the-last-loop:html5`.

The workflow has no `pull_request` trigger, so PRs cannot publish. Its push trigger is restricted to `main` and game/build-related paths; documentation-only edits do not deploy. An active run is allowed to finish, and itch.io uploads are serialized so two Butler pushes cannot race each other.

For a manual run, leave `publish_to_itch` unchecked to build and test without changing the public game. Enable it to publish the verified build, and run it from `main`.

The Butler upload uses `GITHUB_RUN_NUMBER.GITHUB_RUN_ATTEMPT` as its build version. Butler orders channel builds by upload order, so the GitHub run and commit are the audit trail for each deployment. A failed type-check, test, build, browser smoke test, artifact validation, or Butler upload is visible as a failed Actions run. The previous successful itch.io channel build remains the public build unless a new upload completes.

Artifacts are retained for 30 days. To roll back, download a previously verified ZIP from its successful Actions run and push that ZIP again to the same `html5` channel with Butler; this creates a new channel build containing the older game files.

The Butler upload uses `GITHUB_RUN_NUMBER.GITHUB_RUN_ATTEMPT` as its build version. A failed build, failed smoke test, unavailable publishing credential, or missing/invalid project variable prevents publication.

## Latest verified itch.io upload

On **2026-11-16**, [GitHub Actions run #18](https://github.com/ThanhNguyxnOrg/AFTERFRAME-THE-LAST-LOOP/actions/runs/43817229463) completed successfully after the automatic-deployment change:
- Package job: type-check, test suite, production build, GLB/ZIP validation, Chromium smoke test, and artifact upload all passed.
- Publish job: validated the configured target, downloaded the exact artifact from this run, re-validated the ZIP, installed the official Butler CLI, and pushed to `thanhnguyxn/afterframe-the-last-loop:html5`.
- Butler accepted the upload and reported that the new channel build was processing. The run confirms a successful Butler push; the hosted iframe still needs a post-processing visual/playability check before claiming the public page has been independently re-tested.
- The ZIP artifact is retained in GitHub Actions until **2026-12-16**.

The previous confirmed public-page check was on **2026-11-10**. Keep the storefront status **In development** while the public playtest is being validated.

## Public playtest and storefront media

**Live project:** [AFTERFRAME: THE LAST LOOP on itch.io](https://thanhnguyxn.itch.io/afterframe-the-last-loop)

The public page was checked on 2026-11-10:
- The game page is publicly reachable and exposes **Run game**.
- Platform: **HTML5**.
- Storefront status: **In development** (this is a public development playtest, not a claim that the project is a final/released product).
- The page description currently links the browser game and describes the Chrono Rig, Echoes, six campaign chapters, weapons, bosses, and endings.
- The page currently shows its cover artwork but no gameplay screenshot gallery or trailer. Repository images do not automatically appear on the itch.io page; upload them separately in **Edit game → Screenshots**.

### Existing gameplay captures to upload

All six captures already exist in the repository and are referenced by the root README gallery:

| Order | Capture | Repository file |
| ---: | --- | --- |
| 1 | Prologue — Calibration Bay 04 | [`screenshots/phase12/after/00-prologue-desktop.png`](../screenshots/phase12/after/00-prologue-desktop.png) |
| 2 | Chapter I — HELIX-04 Containment Gate | [`screenshots/phase12-blender/after/ch1-helix-gate-desktop.png`](../screenshots/phase12-blender/after/ch1-helix-gate-desktop.png) |
| 3 | Chapter II — The Choir / Hydroponic Basilica | [`screenshots/phase12-blender/after/ch2-choir-organ-desktop.png`](../screenshots/phase12-blender/after/ch2-choir-organ-desktop.png) |
| 4 | Chapter III — The Curator / Memory Archive | [`screenshots/phase12-blender/after/ch3-curator-archive-desktop.png`](../screenshots/phase12-blender/after/ch3-curator-archive-desktop.png) |
| 5 | Chapter IV — Matron-V / Quarantine Ward | [`screenshots/phase12-blender/after/ch4-matron-pod-desktop.png`](../screenshots/phase12-blender/after/ch4-matron-pod-desktop.png) |
| 6 | Chapter V — Chronicle Loom | [`screenshots/phase12/after/05-loom-desktop.png`](../screenshots/phase12/after/05-loom-desktop.png) |

Upload the original PNGs as itch.io screenshots in the order above. The root README already renders them as a six-sector gallery. Keep the existing cover as the cover; use the in-engine PNGs as separate screenshots. Do not label the repository captures as a video or as live gameplay footage.

### Storefront metadata recommendations

The page currently lists **Action** as its genre. Consider adding the closest available genres for the actual game loop: **Adventure**, **Role Playing**, and **Puzzle**. Suggested tags to prioritize:

`Sci-Fi` · `Time Loop` · `Third Person` · `Action RPG` · `Puzzle` · `Singleplayer` · `Story Rich` · `Atmospheric` · `3D` · `Boss Battles`

The description should keep the public-playtest status visible and point players to the [controls and combat guide](GAMEPLAY_GUIDE.md). Keep keyboard/mouse as the verified primary input; mention touch controls as supported only while testing the embedded build on actual mobile browsers.

### Trailer recommendation (not yet present)

There is no trailer/video asset in the repository at this time. A concise 30–45 second capture would be enough:
1. Title screen and the Nadir-9 premise.
2. Chrono Rig recording and Echo replay.
3. Temporal Relay into a flank, followed by a weapon/combat beat.
4. One recognizable boss or chapter environment.
5. End card with the itch.io play link.

Record this from the actual running browser build. Do not add a placeholder trailer link or claim that a video is available until the file has been captured and uploaded.

## Local testing

Do not double-click `index.html` from File Explorer. The production build uses ES modules and relative asset URLs and must be served over HTTP. To test the ZIP on Windows PowerShell:

```powershell
$zip = "$env:USERPROFILE\Downloads\AFTERFRAME-THE-LAST-LOOP-itch-html5-verified.zip"
$site = Join-Path $env:TEMP "afterframe-itch-html5"
Remove-Item $site -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -LiteralPath $zip -DestinationPath $site -Force
py -m http.server 4174 --directory $site
```

Then open `http://127.0.0.1:4174/`. Stop the server with `Ctrl+C`.

## Final itch.io verification

The project page is currently public and marked **In development**. Keep that development status while the public playtest is being validated. Test the actual hosted iframe (not only the local ZIP) for controls, audio initialization, WebGL rendering, all required GLB models, page scaling, and browser-console errors. After changing the upload, refresh the public project page and repeat the embedded test before announcing the new build. Only change the project to **Released** when the game is genuinely ready for a final release; public availability alone does not imply that status.

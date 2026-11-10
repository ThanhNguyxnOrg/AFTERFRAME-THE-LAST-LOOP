# itch.io HTML5 Release

AFTERFRAME is a static Vite browser game. The package workflow type-checks the project, runs the test suite, builds the game, validates the four required GLB assets, creates a ZIP with `index.html` at the archive root, and runs Chromium against that exact ZIP over HTTP.

## Build and verification

Normal pushes to `main` that touch game source, public assets, build configuration, dependencies, packaging scripts, or this workflow run the package pipeline only. A manual **Run workflow** with `publish_to_itch` left unchecked also runs package and verification only.

The package job verifies:
- TypeScript type-check and the full test suite.
- A production Vite build using relative asset URLs.
- The four required Chapter GLB files, including their glTF 2.0 binary structure.
- ZIP integrity and `index.html` at the archive root.
- The actual packaged ZIP in Chromium over HTTP: React title screen, WebGL2 canvas, all four GLB responses, and the New Campaign transition into `playing`.
- No failed same-origin asset requests, HTTP 4xx/5xx responses, uncaught page errors, or fatal game/WebGL console errors.

The tested game ZIP is uploaded as the `AFTERFRAME-THE-LAST-LOOP-itch-html5` Actions artifact for 14 days. Ordinary pushes never publish.

## One-time itch.io setup

1. The existing itch.io project is [AFTERFRAME: THE LAST LOOP](https://thanhnguyxn.itch.io/afterframe-the-last-loop). Its Butler target is `thanhnguyxn/afterframe-the-last-loop`.
2. Confirm **Kind of project** is **HTML** on the itch.io edit page.
3. Add the shared itch.io publisher credential at the **organization** level:
   - Open `ThanhNguyxnOrg → Settings → Secrets and variables → Actions → Secrets → New organization secret`.
   - Name it `BUTLER_API_KEY`.
   - Use the itch.io API key whose source is `wharf`.
   - Choose **All repositories** only if every repository in the organization is trusted to access this publishing credential. Otherwise choose **Selected repositories** and grant access to the repositories that actually publish to itch.io. You can add more repositories to this same organization secret later; you do not need to recreate or copy the key into each repository.
4. Keep each project destination as a **repository variable**, because each game/repository can have a different itch.io slug:
   - In `ThanhNguyxnOrg/AFTERFRAME-THE-LAST-LOOP`, open **Settings → Secrets and variables → Actions → Variables → New repository variable**.
   - Name it `ITCHIO_GAME`.
   - Set its value to `thanhnguyxn/afterframe-the-last-loop`.
   - For another game, set that repository's own `ITCHIO_GAME` value to its own lowercase `account/project-slug`.

The workflow reads `secrets.BUTLER_API_KEY` and `vars.ITCHIO_GAME`. Organization-level secret access must explicitly include the repository. The project-specific variable remains local to this repository.

Never commit, print, or paste `BUTLER_API_KEY` into chat.

After the first upload creates the `html5` channel, open the itch.io project's Edit page and tag that channel **HTML5 / Playable in browser**. Confirm the project kind remains **HTML**. Butler uploads the channel build; it does not change this itch.io page setting.

## Publish a verified build

Publication can be deliberately triggered in either of two ways, always from `main`:

1. **Manual:** Open **Actions → Package and publish itch.io HTML5 build**, select **Run workflow**, and enable `publish_to_itch`.
2. **Explicit release commit:** Include the exact marker `[publish-itch]` in a commit message on `main`. This is reserved for intentional releases; a normal commit never publishes.

For either trigger, GitHub first runs the full package and browser verification job. Only if it succeeds does the publish job download the artifact from that same workflow run, validate the ZIP again, install the current stable Butler CLI from itch.io's official Broth distribution, and push the ZIP to `thanhnguyxn/afterframe-the-last-loop:html5`.

The Butler upload uses `GITHUB_RUN_NUMBER.GITHUB_RUN_ATTEMPT` as its build version. A failed build, failed smoke test, missing secret, unavailable organization-secret permission, or missing/invalid project variable prevents publication.

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

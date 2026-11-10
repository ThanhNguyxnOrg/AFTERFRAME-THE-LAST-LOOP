# itch.io HTML5 Release

AFTERFRAME is a static Vite browser game. The package workflow builds the game, runs checks, validates the four required GLB assets, creates a ZIP with `index.html` at the archive root, opens the exact ZIP in Chromium through HTTP, and retains the tested ZIP as a GitHub Actions artifact for 14 days.

## Current workflow

1. Open **Actions → Package itch.io HTML5 build**.
2. Select **Run workflow** on `main`, or let the workflow start when game source, public assets, build configuration, dependencies, packaging scripts, or the workflow itself change on `main`.
3. Wait for install, type-check, tests, build, GLB validation, ZIP integrity validation, and the Chromium browser smoke test to finish successfully.
4. Download the `AFTERFRAME-THE-LAST-LOOP-itch-html5` artifact from that run.
5. Extract the artifact archive; upload the game ZIP inside it to the itch.io project.

The browser smoke test unpacks the game ZIP into a temporary folder and serves those exact files over HTTP. It verifies:
- React mounts the actual title screen and the New Campaign control is visible.
- Three.js creates a WebGL2 canvas with non-zero dimensions.
- All four Chapter GLB assets return HTTP 200.
- Clicking New Campaign transitions the app into `playing`.
- No same-origin asset request fails, no HTTP 4xx/5xx is returned, and no uncaught browser runtime exception occurs.

The workflow creates and tests ZIP artifacts; it does not publish to itch.io. Ordinary pushes to `main` never upload to an itch.io project.

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

## itch.io project settings

- **Classification:** Games
- **Kind of project:** HTML
- **Release status:** In development during playtesting
- **Pricing:** No payments for a free playtest
- **Visibility:** Draft until the embedded build has been verified
- **Upload:** ZIP containing `index.html` at its root
- Mark the uploaded file as playable in the browser.

Keep the project in Draft while testing the embed, controls, audio, WebGL rendering, and all required GLB model loads. The automated Chromium smoke test is not a substitute for a final check in the actual itch.io iframe. Only make the page Public after that iframe check.

## Butler automation — not enabled yet

Butler can update an existing itch.io project through its `html5` channel. It does not create the project or configure its page, visibility, screenshots, genres, tags, or embed settings.

Do not configure a Butler secret or run a publishing workflow until the itch.io project has been created and its final account/project slug is known. The planned GitHub configuration is:

| Type | Name | Value |
| --- | --- | --- |
| Actions secret | `BUTLER_API_KEY` | itch.io API key with source `wharf` |
| Actions variable | `ITCHIO_GAME` | `account/project-slug`, without the URL scheme or domain |

Never commit or expose the API key. The publishing workflow and tag-based release automation will be added and tested separately after the first package and Draft project exist.

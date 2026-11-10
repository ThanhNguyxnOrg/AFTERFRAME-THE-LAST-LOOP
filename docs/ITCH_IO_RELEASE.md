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

Keep the project in Draft while testing the actual itch.io iframe, controls, audio, WebGL rendering, and required GLB model loads. The automated Chromium smoke test and local HTTP test are not substitutes for checking the embedded build on itch.io. Only make the page Public after the iframe check succeeds.

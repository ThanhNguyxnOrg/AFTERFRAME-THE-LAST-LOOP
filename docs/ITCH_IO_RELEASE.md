# itch.io HTML5 Release

AFTERFRAME is a static Vite browser game. The package workflow builds the game, runs checks, validates the four required GLB assets, creates a ZIP with \`index.html\` at the archive root, and retains it as a GitHub Actions artifact for 14 days.

## Current workflow

1. Open **Actions → Package itch.io HTML5 build**.
2. Select **Run workflow** on \`main\`.
3. Wait for install, type-check, tests, build, GLB validation, ZIP integrity validation, and artifact upload to finish successfully.
4. Download the \`AFTERFRAME-THE-LAST-LOOP-itch-html5\` artifact from that run.
5. Extract the artifact archive; upload the game ZIP inside it to the itch.io project.

The workflow can be run manually, and also creates a fresh ZIP artifact when game source, public assets, build configuration, dependencies, or the workflow itself change on \`main\`. It does not publish to itch.io.

## itch.io project settings

- **Classification:** Games
- **Kind of project:** HTML
- **Release status:** In development during playtesting
- **Pricing:** No payments for a free playtest
- **Visibility:** Draft until the embedded build has been verified
- **Upload:** ZIP containing \`index.html\` at its root
- Mark the uploaded file as playable in the browser.

Keep the project in Draft while testing the embed, controls, audio, WebGL rendering, and all required GLB model loads. Only make the page Public after the browser build has passed that check.

## Butler automation — not enabled yet

Butler can update an existing itch.io project through its \`html5\` channel. It does not create the project or configure its page, visibility, screenshots, genres, tags, or embed settings.

Do not configure a Butler secret or run a publishing workflow until the itch.io project has been created and its final account/project slug is known. The planned GitHub configuration is:

| Type | Name | Value |
| --- | --- | --- |
| Actions secret | \`BUTLER_API_KEY\` | itch.io API key with source \`wharf\` |
| Actions variable | \`ITCHIO_GAME\` | \`account/project-slug\`, without the URL scheme or domain |

Never commit or expose the API key. The publishing workflow and tag-based release automation will be added and tested separately after the first package and Draft project exist.

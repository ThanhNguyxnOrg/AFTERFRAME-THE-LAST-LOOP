# itch.io HTML5 Release

AFTERFRAME is built as a static Vite site. This workflow validates the browser build, uploads a ZIP artifact for manual recovery, and can publish the \`dist/\` directory to itch.io through the official Butler CLI.

## One-time itch.io setup

1. Create the itch.io project and set **Kind of project** to **HTML** (not Downloadable).
2. Keep the page in Draft or Restricted while testing.
3. Note the account name and project URL slug. The Butler target is \`account/project-slug\`, not the full URL.

## One-time GitHub setup

Open **Settings → Secrets and variables → Actions** in this repository.

Create this repository secret:

| Name | Value |
| --- | --- |
| \`BUTLER_API_KEY\` | The itch.io API key whose source is \`wharf\` |

Create this repository variable:

| Name | Value |
| --- | --- |
| \`ITCHIO_GAME\` | \`account/project-slug\` (lowercase, without \`https://\` or \`.itch.io\`) |

Never commit the API key, put it in a workflow input, or paste it into an issue or chat. If it is exposed in a log or commit, revoke it in itch.io and create a replacement.

## First upload

1. Open **Actions → Package itch.io HTML5 build**.
2. Select **Run workflow** on \`main\`.
3. Leave **Publish to itch.io** disabled to create and inspect only the ZIP artifact.
4. Once the project exists and both the secret and variable are configured, run it again with **Publish to itch.io** enabled.
5. The workflow runs install, type-check, tests, build, relative-asset/GLB/package validation, then uploads \`dist/\` to the \`html5\` channel with Butler.

After the first Butler push, edit the game on itch.io and mark the \`html5\` channel as **HTML5 / Playable in browser**. The project itself must remain kind **HTML**. Then use the itch.io preview to test the embedded game before making the page Public.

## Future updates

Ordinary pushes to \`main\` do not publish to itch.io. This avoids sending every development commit to players.

To publish a versioned update, create and push a tag after the code is ready:

\`\`\`powershell
git tag itch-v0.1.0
git push origin itch-v0.1.0
\`\`\`

Use the next version for each subsequent release (for example, \`itch-v0.1.1\`). Tags matching \`itch-v*\` automatically run the full validation pipeline and publish to the same \`html5\` channel. Butler uses the version suffix as the displayed user version and transfers only changed data where possible.

You can also manually dispatch the workflow with **Publish to itch.io** enabled for a playtest update without creating a tag.

## What Butler automates

Butler uploads build files to a channel. It does not create the itch.io project or manage its title, description, screenshots, tags, visibility, embed settings, or community settings. Configure those in the itch.io project editor.

The workflow downloads the stable Butler build from itch.io's official Broth distribution endpoint at runtime. The ZIP artifact is retained for 14 days as a manual fallback.

# GitHub Actions configuration

## Shared Organization secrets

Publishing credentials shared by repositories in `ThanhNguyxnOrg` belong in **Organization Actions secrets**, not duplicated repository secrets.

| Name | Scope | Purpose |
| --- | --- | --- |
| `BUTLER_API_KEY` | Organization Actions secret | itch.io Butler authentication; use the API key created by Butler login (source: `wharf`) |

Grant access only to repositories that are trusted to publish through the organization account. Prefer **Selected repositories** over **All repositories** unless every repository should receive access to this credential.

Workflows consume the organization secret through the normal GitHub Actions expression:

```yaml
env:
  BUTLER_API_KEY: ${{ secrets.BUTLER_API_KEY }}
```

Do not put secret values in workflow files, repository variables, documentation, commit messages, or logs. A workflow must never print the credential.

## Repository-specific deployment variables

Project destinations differ by repository and therefore remain repository-level Actions variables.

| Repository | Variable | Value |
| --- | --- | --- |
| `ThanhNguyxnOrg/AFTERFRAME-THE-LAST-LOOP` | `ITCHIO_GAME` | `thanhnguyxn/afterframe-the-last-loop` |

For another itch.io game, configure that repository's own `ITCHIO_GAME` as lowercase `account/project-slug`. Reuse the organization secret only after explicitly granting that repository access.

## AFTERFRAME itch.io release

Workflow: [Package and publish itch.io HTML5 build](workflows/itch-html5.yml)

The workflow runs build, tests, ZIP validation, and Chromium smoke verification before the publish job can run. Publication is opt-in, on `main` only, through either:
- Manual **Run workflow** with `publish_to_itch=true`.
- A deliberate `main` commit whose commit message contains the exact marker `[publish-itch]`.

Ordinary commits never publish. The publish job downloads the exact artifact created by the same run and uploads it to the `html5` channel with Butler.

Configuration checklist:
- [ ] Organization Actions secret `BUTLER_API_KEY` exists and grants access to `AFTERFRAME-THE-LAST-LOOP`.
- [ ] Repository Actions variable `ITCHIO_GAME` is set to `thanhnguyxn/afterframe-the-last-loop`.
- [ ] itch.io project kind is **HTML**.
- [ ] After the first upload, the `html5` upload is marked **HTML5 / Playable in browser** in the itch.io project settings.

Keep the itch.io project in Draft until the hosted iframe has been tested. Do not expose or commit API keys.

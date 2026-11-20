# Terran Resources Website

Static HTML/CSS/JS site for `terranresources.com` (17 pages: `/`, `/about-us/`, `/services/`, `/products/`, `/blog/`, `/welcome/` and 11 `/project/<slug>/` pages). No PHP, no frameworks, no npm dependencies.

## Content and build

- Content source: `tools/data/site.json`; layout and templates: `tools/generate.mjs`.
- `node tools/generate.mjs` regenerates the committed output (every `index.html`) from `tools/data/site.json`. Do not hand-edit generated pages.
- `node tools/check-site.mjs` validates head tags, root-relative assets, internal links and required paths. It must pass before deploy.

## Deploy

Manual only: `.github/workflows/deploy.yml` (SSH + rsync to GreenGeeks). Secrets: `SSH_PRIVATE_KEY`, `SSH_HOST`, `SSH_USER`, optional `SSH_PORT`. See the Deployment section of `CLAUDE.md` for details.

Cutover is a separate, owner-confirmed server step and has not been done yet; until then the live site is still the old WordPress install. See `handoff.md` for the cutover checklist.

## Repository

https://github.com/brandonr2630/terran-resources-website

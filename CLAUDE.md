# CLAUDE.md — Terran Resources Website

Live URL: `terranresources.com` · Repo: `brandonr2630/terran-resources-website`

## Architecture

Static HTML/CSS/JS site. No build system or bundler — files deployed as-is.

- **`index.html`** — main page (early scaffold; contact form not yet wired)

## Deployment

Push to `master` auto-deploys via GitHub Actions → cPanel Fileman API (GreenGeeks). Deploy dir: `/home/terranre/public_html/terranresources.com`. Manual redeploy: Actions → Deploy to cPanel → Run workflow.

Required secrets: `CPANEL_API_TOKEN`, `CPANEL_HOST`, `CPANEL_USER`.

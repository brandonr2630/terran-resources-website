# CLAUDE.md — Terran Resources Website

Live URL: `terranresources.com` · Repo: `brandonr2630/terran-resources-website`

## Architecture

Static HTML/CSS/JS marketing site. No build system or bundler — files deployed as-is.

- **`index.html`** — main page (early scaffold; contact form not yet wired)

## Deployment

No automated workflow yet. When ready, follow the same cPanel Fileman API pattern used by the other projects. Required secrets: `CPANEL_API_TOKEN`, `CPANEL_HOST`, `CPANEL_USER`. Deploy dir: `/home/terranre/public_html/terranresources.com`.

## Session context

See `handoff.md` for the running log of completed work and known issues.

# Terran Resources Website — Handoff

*Last updated: 2026-08-31 · Session 2*

---

## Quick Reference

| Item | Value |
|------|-------|
| Live URL | `https://www.terranresources.com` |
| GitHub repo | `brandonr2630/terran-resources-website` |
| Deploy | No automated workflow yet — see CLAUDE.md |

---

## Status

`index.html` is fully built out — hero, company cards, contact section with JSON-LD schema, sticky nav, scroll animations, footer. Not yet deployed; no automated deploy workflow exists.

---

## Known Issues / Blockers

- No GitHub Actions deploy workflow yet
- Contact form is UI-only: `handleSubmit()` just calls `preventDefault()` and flips the button text — no request is sent anywhere, so submissions are lost

## Next Up

- Add deploy workflow (same cPanel Fileman API pattern as other projects)
- Wire contact form backend (form + `handleSubmit()` are at the bottom of `index.html`)

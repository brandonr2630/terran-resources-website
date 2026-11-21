# Terran Resources Website — Handoff

*Last updated: 2026-11-21 · Static rebuild, live and auto-deploying*

---

## Quick Reference

| Item | Value |
|------|-------|
| Live URL | `https://www.terranresources.com` |
| GitHub repo | `brandonr2630/terran-resources-website` |
| Generate | `node tools/generate.mjs` (from `tools/data/site.json`; output committed) |
| Check | `node tools/check-site.mjs` |
| Deploy | `.github/workflows/deploy.yml` (SSH + rsync): auto on push to master touching site files, or manual; secrets `SSH_PRIVATE_KEY`, `SSH_HOST`, `SSH_USER`, optional `SSH_PORT` |

---

## Status

The site is rebuilt as static HTML/CSS/JS (17 pages: home, about-us, services, products, blog, welcome, 11 projects). The old WordPress site is retired: it broke on 2026-10-31 (Contact Form 7 needed PHP 8.3+; WPBakery and Slider Revolution are PHP-7-only). Content came from the Wayback snapshot of 2026-08-13. Deploy is automatic on push to master.

Footer contact (commit `8d3f024`): address is two lines (71 Warren Road, Bejucal / Cunupia, Trinidad W.I.) and phone is (868) 230 9702. In `tools/data/site.json`, `contact.address` accepts a list of lines and `contact.phone_tel` holds the `tel:` number (the old digits-only derivation assumed a leading country code). Edit those fields, then run `node tools/generate.mjs`.

Logo (2026): `assets/img/terran-logo.svg` (source: `Z:-Terran-Resources-Ltd-TT\CORPORATE INFO\ARTWORK6 LOGO\Terran New Logo.svg`) is the header logo and favicon. The mark is roughly square, so the header image is sized by height: 140px desktop, 100px under 768px (`.logo img` in `assets/css/style.css`; `width`/`height` attrs in `tools/generate.mjs`, 152x140). The old `Web-Logo2-01.png` was removed.

---

## Known Issues / Blockers

- Header logo size (140px / 100px mobile) was set without seeing it rendered; check desktop and mobile and tweak the CSS if needed.
- Favicon is SVG only (older Safari will not show it); add a PNG fallback if that matters.
- No contact form (the old one depended on Contact Form 7); the site shows address, phone and email only.
- Old WordPress feeds, `/wp-content/uploads/` image links and `/?p=` links 404.
- Deploy uses a dedicated key (`~/.ssh/github-deploy-terran` locally; also in the `SSH_PRIVATE_KEY` secret). `CPANEL_API_TOKEN` secret is unused and can be removed.
- The monorepo-level `C:\dev\Projects\CLAUDE.md` still says this site has no deploy workflow (separate repo; update it separately).

## Cutover (done 2026-11-20)

WordPress files and the original `.htaccess` were moved to `/home/terranre/wp-retired-2026-11-20/`. Deploy workflow ran green and the 6 top-level pages return 200. Other sites in `public_html` (`erp.terranresources.com`, `q2m.io`, `lab.*`, `staging-erp.*`, `toddsroadcoctt`) must stay untouched.

## Deploy workflow

Push to `master` touching `index.html`, page folders, `assets/` or `deploy.yml` runs check, then rsync (no `--delete`) to `/home/terranre/public_html`. Runs are serialised (`concurrency: deploy`). Docs-only or `tools/`-only pushes do not deploy; regenerate pages and commit them so the change is a site-file change. First auto-deploy verified 2026-11-21.

## Next Up

- Add a contact form (needs a non-WordPress backend).
- Remove unused `CPANEL_API_TOKEN` secret.

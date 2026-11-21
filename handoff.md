# Terran Resources Website — Handoff

*Last updated: 2026-11-20 · Static rebuild*

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

---

## Known Issues / Blockers

- No contact form (the old one depended on Contact Form 7); the site shows address, phone and email only.
- Old WordPress feeds, `/wp-content/uploads/` image links and `/?p=` links 404.
- Deploy uses a dedicated key (`~/.ssh/github-deploy-terran` locally; also in the `SSH_PRIVATE_KEY` secret). `CPANEL_API_TOKEN` secret is unused and can be removed.
- The monorepo-level `C:\dev\Projects\CLAUDE.md` still says this site has no deploy workflow (separate repo; update it separately).

## Cutover (done 2026-11-20)

WordPress files and the original `.htaccess` were moved to `/home/terranre/wp-retired-2026-11-20/`. Deploy workflow ran green and the 6 top-level pages return 200. Other sites in `public_html` (`erp.terranresources.com`, `q2m.io`, `lab.*`, `staging-erp.*`, `toddsroadcoctt`) must stay untouched.

## Next Up

- Add a contact form (needs a non-WordPress backend).
- Remove unused `CPANEL_API_TOKEN` secret.

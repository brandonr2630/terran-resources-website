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
| Deploy | Manual workflow `.github/workflows/deploy.yml` (SSH + rsync); secrets `SSH_PRIVATE_KEY`, `SSH_HOST`, `SSH_USER`, optional `SSH_PORT` |

---

## Status

The site is rebuilt as static HTML/CSS/JS (17 pages: home, about-us, services, products, blog, welcome, 11 projects). The old WordPress site is retired: it broke on 2026-10-31 (Contact Form 7 needed PHP 8.3+; WPBakery and Slider Revolution are PHP-7-only). Content came from the Wayback snapshot of 2026-08-13. The deploy workflow exists but has not been run.

---

## Known Issues / Blockers

- Server cutover not done: WordPress files in `/home/terranre/public_html` must be moved aside (not deleted) in a separate, owner-confirmed step. Other sites in that docroot (`erp.terranresources.com`, `q2m.io`, `lab.*`, `staging-erp.*`, `toddsroadcoctt`) must stay untouched.
- Deploy trigger is `workflow_dispatch` only; add push-to-master after cutover.
- No contact form (the old one depended on Contact Form 7); the site shows address, phone and email only.

## Cutover checklist (owner-confirmed, not yet done)

1. In cPanel -> Domains, confirm which folder terranresources.com is served from (the workflow assumes `/home/terranre/public_html`).
2. Back up `public_html` (including its `.htaccess`).
3. Back up `.htaccess`, then remove ONLY the WordPress rewrite block. Do not delete or move the whole file: it may hold https/www redirects and PHP handler lines, and addon-site folders inside `public_html` may inherit it.
4. Move aside (do not delete) the WordPress files (`wp-*`, `index.php`, `xmlrpc.php`, `license.txt`, `readme.html`, `wp-config.php`, etc.) and any same-named `blog/`, `project/`, `welcome/`, `assets/` folders.
5. Run the deploy workflow manually: Actions -> Deploy -> Run workflow.
6. `curl -I` all 17 URLs, including the no-trailing-slash forms.
7. Then add the push-to-master trigger to `deploy.yml`.

Notes: old WordPress feeds, `/wp-content/uploads/` image links and `/?p=` links will 404 after cutover. The monorepo-level `C:\dev\Projects\CLAUDE.md` still says this site has no deploy workflow (separate repo; update it separately).

## Next Up

- Owner approves cutover, then back up `public_html`, move WordPress files into a dated folder, run the deploy workflow, `curl -I` the 6 top-level pages.

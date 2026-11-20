#!/usr/bin/env node
/*
 * Static page generator. Usage: node tools/generate.mjs
 * Reads tools/data/site.json and writes every page as <dir>/index.html
 * (home = index.html at the repo root). Output is deterministic (idempotent).
 *
 * pages.<key> schema
 *   { path: "/about-us/",        root-relative URL, trailing slash ("/" = home)
 *     title: "...",              <title>
 *     description: "...",        meta description
 *     h1: "...",                 optional; page heading (omit on home)
 *     sections: [ ...section ]   rendered in order; empty sections are omitted }
 *
 * Section types (all text is plain text and is HTML-escaped on output, no raw HTML):
 *   { type: "text",  heading?, level?: 2|3|4, paragraphs: [string] }
 *   { type: "list",  heading?, level?, items: [string | {text, href?}] }
 *   { type: "cards", heading?, level?, cards: [{ title, text?, image?, href? }] }
 *       image = root-relative path like "/assets/img/x.png"; href = root-relative or https URL.
 *   Any section may carry an optional "id" (letters, digits, dashes) used as the element id.
 * hrefs in site.json must be root-relative (/...) or https (no javascript: URLs).
 * Other site.json keys (nav, contact, footer, projects, clients, services,
 * core_values) are shared data that later tasks render by adding builders below.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(root, 'tools/data/site.json'), 'utf8'));

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const FONTS = 'https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;700&family=Oxygen:wght@400;700&display=swap';

function heading(sec, def = 2) {
  if (!sec.heading) return '';
  const l = [2, 3, 4].includes(sec.level) ? sec.level : def;
  return `<h${l}>${esc(sec.heading)}</h${l}>\n`;
}

function link(text, href) {
  return href ? `<a href="${esc(href)}">${esc(text)}</a>` : esc(text);
}

const builders = {
  text: (s) => (s.paragraphs || []).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('\n'),
  list: (s) => {
    const items = (s.items || []).filter(Boolean).map((i) => (typeof i === 'string' ? link(i) : link(i.text, i.href)));
    return items.length ? `<ul>\n${items.map((i) => `<li>${i}</li>`).join('\n')}\n</ul>` : '';
  },
  cards: (s) => {
    const cards = (s.cards || []).filter((c) => c && c.title).map((c) => {
      const img = c.image ? `<img src="${esc(c.image)}" alt="" loading="lazy">` : '';
      const title = `<h3>${link(c.title, c.href)}</h3>`;
      const text = c.text ? `<p>${esc(c.text)}</p>` : '';
      return `<div class="card">${img}${title}${text}</div>`;
    });
    return cards.length ? `<div class="cards">\n${cards.join('\n')}\n</div>` : '';
  },
};

function renderSection(sec) {
  const build = builders[sec.type];
  if (!build) throw new Error(`Unknown section type: ${sec.type}`);
  const body = build(sec);
  if (!body) return ''; // no invented copy: empty sections are omitted
  const id = sec.id && /^[A-Za-z0-9-]+$/.test(sec.id) ? ` id="${sec.id}"` : '';
  return `<section class="section"${id}>\n${heading(sec)}${body}\n</section>`;
}

export function render(page) {
  const { contact } = site;
  const nav = site.nav.map((n) => {
    const cur = n.href === page.path ? ' aria-current="page"' : '';
    return `<li><a href="${esc(n.href)}"${cur}>${esc(n.label)}</a></li>`;
  }).join('\n');
  const sections = (page.sections || []).map(renderSection).filter(Boolean).join('\n');
  const h1 = page.h1 ? `<h1>${esc(page.h1)}</h1>\n` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="icon" href="/assets/img/Web-Logo2-01.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
<header class="site-header">
<div class="container header-inner">
<a class="logo" href="/"><img src="/assets/img/Web-Logo2-01.png" width="280" height="140" alt="Terran Resources"></a>
<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Menu"><span></span><span></span><span></span></button>
<nav class="site-nav" id="site-nav" aria-label="Main">
<ul>
${nav}
</ul>
</nav>
</div>
</header>
<main class="container">
${h1}${sections}
</main>
<footer class="site-footer">
<div class="container">
<address>${esc(contact.address)}<br>Tel <a href="tel:${esc(contact.phone.replace(/\s+/g, ''))}">${esc(contact.phone)}</a><br><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></address>
<p class="copyright">${esc(site.footer)}</p>
</div>
</footer>
<script src="/assets/js/site.js"></script>
</body>
</html>
`;
}

export function writePage(path, html) {
  const file = join(root, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

export function outPath(urlPath) {
  return urlPath === '/' ? 'index.html' : `${urlPath.replace(/^\/|\/$/g, '')}/index.html`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === join(process.argv[1])) {
  for (const page of Object.values(site.pages)) {
    writePage(outPath(page.path), render(page));
    console.log(`wrote ${outPath(page.path)}`);
  }
}

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
 *   { type: "core_values" | "services" | "video" | "projects" | "blog_teaser" | "clients", id?, heading? }
 *       render the shared site.json keys of the same name (home, services and blog pages).
 *   page.h1_hidden: true makes the h1 visually hidden (still read by screen readers).
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
  // Home page sections: render shared site.json data (no copy of their own).
  core_values: () => {
    const cv = site.core_values || [];
    if (!cv.length) return '';
    const n = cv.length;
    const slides = cv.map((c, i) => {
      const defn = String(c.definition || '').split('\n').filter(Boolean).map((l) => `<span>${esc(l)}</span>`).join('<br>');
      return `<figure class="slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${n}">
<img src="${esc(c.image)}" alt="" width="1920" height="500"${i ? ' loading="lazy"' : ''}>
<figcaption><strong class="cv-word">${esc(c.word)}</strong><span class="cv-phonetic">${esc(c.phonetic)}</span><span class="cv-def">${defn}</span></figcaption>
</figure>`;
    });
    return `<div class="slides">
${slides.join('\n')}
</div>`;
  },
  services: () => {
    const items = (site.services || []).map((v) => `<div class="card service"><h2>${esc(v.title)}</h2><p>${esc(v.blurb)}</p></div>`);
    return items.length ? `<div class="cards">
${items.join('\n')}
</div>` : '';
  },
  video: (s) => {
    const v = site.video;
    if (!v) return '';
    return `<div class="video-frame"><iframe src="${esc(v.embed)}" title="${esc(v.title)}" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"></iframe></div>
<p class="video-link"><a href="${esc(v.watch)}">${esc(v.watch)}</a></p>`;
  },
  projects: () => {
    const cards = (site.projects || []).map((p) => `<div class="card">${p.image ? `<img src="${esc(p.image)}" alt="" width="200" height="200" loading="lazy">` : ''}<h3>${link(p.title, `/project/${p.slug}/`)}</h3></div>`);
    return cards.length ? `<div class="cards projects">
${cards.join('\n')}
</div>` : '';
  },
  blog_teaser: () => {
    const b = site.blog_teaser;
    if (!b) return '';
    return `<h3>${link(b.title, b.href)}</h3>
<p>${esc(b.text)} ${link(b.more, b.href)}</p>`;
  },
  clients: () => {
    const items = (site.clients || []).map((c) => `<li>${esc(c)}</li>`);
    return items.length ? `<ul class="clients">
${items.join('\n')}
</ul>` : '';
  },
};

// Extra attributes on the <section> wrapper, per section type.
const sectionAttrs = {
  core_values: ' aria-roledescription="carousel" aria-label="Our core values"',
};

function renderSection(sec) {
  const build = builders[sec.type];
  if (!build) throw new Error(`Unknown section type: ${sec.type}`);
  const body = build(sec);
  if (!body) return ''; // no invented copy: empty sections are omitted
  const id = sec.id && /^[A-Za-z0-9-]+$/.test(sec.id) ? ` id="${sec.id}"` : '';
  const cls = sec.type === 'core_values' ? 'section core-values' : 'section';
  return `<section class="${cls}"${id}${sectionAttrs[sec.type] || ''}>\n${heading(sec)}${body}\n</section>`;
}

export function render(page) {
  const { contact } = site;
  const nav = site.nav.map((n) => {
    const cur = n.href === page.path ? ' aria-current="page"' : '';
    return `<li><a href="${esc(n.href)}"${cur}>${esc(n.label)}</a></li>`;
  }).join('\n');
  const sections = (page.sections || []).map(renderSection).filter(Boolean).join('\n');
  const h1 = page.h1 ? `<h1${page.h1_hidden ? ' class="visually-hidden"' : ''}>${esc(page.h1)}</h1>\n` : '';
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

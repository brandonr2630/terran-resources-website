#!/usr/bin/env node
// Static-site checker. Usage: node tools/check-site.mjs [--partial]
// --partial: unresolved internal links and missing required pages are WARN only.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const partial = process.argv.includes('--partial');
const SKIP = new Set(['docs', 'tools', '.git', '.claude', '.superpowers', 'node_modules']);
const REQUIRED = ['/', '/about-us/', '/services/', '/products/', '/blog/', '/welcome/'];
const ICON = '/assets/img/terran-logo.svg';

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.toLowerCase().endsWith('.html')) out.push(full);
  }
  return out;
}

function resolves(urlPath) {
  const p = urlPath.split('#')[0].split('?')[0];
  if (p === '') return true;
  let dec;
  try { dec = decodeURIComponent(p); } catch { return false; }
  const rel = dec.replace(/^\/+/, '');
  const abs = join(root, rel);
  if (existsSync(abs) && statSync(abs).isFile()) return true;
  if (existsSync(join(abs, 'index.html'))) return true;
  return false;
}

const failures = [];
const warnings = [];
const fail = (m) => failures.push(m);
const unresolved = (m) => (partial ? warnings : failures).push(m);

const pages = walk(root);
for (const file of pages) {
  const rel = relative(root, file).split(sep).join('/');
  const html = readFileSync(file, 'utf8');

  if (!/<title[^>]*>\s*\S[\s\S]*?<\/title>/i.test(html)) fail(`${rel}: missing <title>`);
  if (!/<meta\s[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i.test(html)
    && !/<meta\s[^>]*content=["'][^"']+["'][^>]*name=["']description["']/i.test(html)) {
    fail(`${rel}: missing meta description`);
  }
  if (!/<meta\s[^>]*name=["']viewport["']/i.test(html)) fail(`${rel}: missing viewport meta`);
  if (!/<link\s[^>]*rel=["']icon["'][^>]*href=["']\/assets\/img\/terran-logo.svg["']/i.test(html)
    && !/<link\s[^>]*href=["']\/assets\/img\/terran-logo.svg["'][^>]*rel=["']icon["']/i.test(html)) {
    fail(`${rel}: missing icon link (${ICON})`);
  }

  const attrRe = /\b(href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  let m;
  while ((m = attrRe.exec(html))) {
    const attr = m[1].toLowerCase();
    const val = (m[2] ?? m[3]).trim();
    if (/^(\.\.?\/)*assets\//.test(val)) fail(`${rel}: relative ${attr} to assets (use /assets/...): ${val}`);
    else if (val.startsWith('/') && !val.startsWith('//')) {
      if (!resolves(val)) unresolved(`${rel}: unresolved internal ${attr}: ${val}`);
    }
  }
}

for (const req of REQUIRED) {
  const target = join(root, req.replace(/^\/+/, ''), 'index.html');
  if (!existsSync(target)) unresolved(`missing required page: ${req} (expected ${relative(root, target).split(sep).join('/')})`);
}

for (const w of warnings) console.log(yellow(`WARN ${w}`));
for (const f of failures) console.log(red(`FAIL ${f}`));
if (failures.length) {
  console.log(red(`\n${failures.length} failure(s), ${warnings.length} warning(s) across ${pages.length} page(s)`));
  process.exit(1);
}
console.log(green(`OK: ${pages.length} page(s) checked, ${warnings.length} warning(s)`));

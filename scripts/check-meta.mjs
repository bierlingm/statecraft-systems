#!/usr/bin/env node
/**
 * Post-build social/meta audit for statecraft.systems.
 *
 * Walks every HTML file under dist/ and fails if public pages are missing
 * required tags or if og:image / twitter:image point at files that don't exist.
 *
 * Indexable pages need the full social set. Pages with robots noindex only
 * need a non-empty title (admin tools, gated MVPs, etc.).
 *
 * Usage:
 *   node scripts/check-meta.mjs          # after astro build
 *   npm run check:meta
 *   npm run build                        # runs this automatically
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SITE_ORIGIN = 'https://statecraft.systems';

/** Tags every indexable page must carry. */
const REQUIRED_META = [
  { kind: 'name', key: 'description' },
  { kind: 'property', key: 'og:type' },
  { kind: 'property', key: 'og:title' },
  { kind: 'property', key: 'og:description' },
  { kind: 'property', key: 'og:url' },
  { kind: 'property', key: 'og:image' },
  { kind: 'name', key: 'twitter:card' },
  { kind: 'name', key: 'twitter:title' },
  { kind: 'name', key: 'twitter:description' },
  { kind: 'name', key: 'twitter:image' },
];

const IMAGE_META_KEYS = new Set(['og:image', 'twitter:image']);

function walkHtml(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtml(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function stripComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

function headOnly(html) {
  const m = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  return m ? m[1] : html.slice(0, 8000);
}

function titleContent(head) {
  const m = head.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

function metaContent(head, kind, key) {
  // Match either attribute order: name/property first or content first.
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `<meta\\b[^>]*\\b${kind}\\s*=\\s*["']${escaped}["'][^>]*>|<meta\\b[^>]*\\bcontent\\s*=\\s*["'][^"']*["'][^>]*\\b${kind}\\s*=\\s*["']${escaped}["'][^>]*>`,
    'i',
  );
  const tag = head.match(re)?.[0];
  if (!tag) return null;
  const content = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i);
  return content ? content[1].trim() : '';
}

function isNoIndex(head) {
  const robots = metaContent(head, 'name', 'robots');
  if (!robots) return false;
  return /\bnoindex\b/i.test(robots);
}

function imageToDistPath(imageUrl) {
  let pathname;
  try {
    if (imageUrl.startsWith('//')) {
      pathname = new URL(`https:${imageUrl}`).pathname;
    } else if (imageUrl.startsWith('/')) {
      pathname = imageUrl;
    } else {
      const u = new URL(imageUrl);
      if (u.origin !== SITE_ORIGIN) {
        // External absolute image — we can't verify local presence.
        return { external: true, pathname: u.pathname };
      }
      pathname = u.pathname;
    }
  } catch {
    return { error: `invalid image URL: ${imageUrl}` };
  }
  // Drop query/hash; map to dist file.
  const clean = pathname.split('?')[0].split('#')[0];
  return { external: false, pathname: clean, distPath: path.join(DIST, clean.replace(/^\//, '')) };
}

function relFromDist(file) {
  return '/' + path.relative(DIST, file).split(path.sep).join('/');
}

function checkFile(file) {
  const rel = relFromDist(file);
  const raw = fs.readFileSync(file, 'utf8');
  const head = stripComments(headOnly(raw));
  const errors = [];
  const warnings = [];

  const title = titleContent(head);
  if (!title) errors.push('missing or empty <title>');

  if (isNoIndex(head)) {
    return { rel, indexable: false, errors, warnings };
  }

  for (const { kind, key } of REQUIRED_META) {
    const value = metaContent(head, kind, key);
    if (value === null) {
      errors.push(`missing <meta ${kind}="${key}">`);
      continue;
    }
    if (!value) {
      errors.push(`empty content for ${kind}="${key}"`);
      continue;
    }

    if (IMAGE_META_KEYS.has(key)) {
      const resolved = imageToDistPath(value);
      if (resolved.error) {
        errors.push(`${key}: ${resolved.error}`);
      } else if (resolved.external) {
        warnings.push(`${key} points off-site (${value}) — not verified`);
      } else if (!fs.existsSync(resolved.distPath)) {
        errors.push(
          `${key} → ${value} but file missing at dist${resolved.pathname}`,
        );
      }
    }
  }

  // Canonical is strongly recommended for share URLs.
  if (!/<link\b[^>]*\brel\s*=\s*["']canonical["']/i.test(head)) {
    warnings.push('missing <link rel="canonical">');
  }

  // Favicon keeps browser tabs / some scrapers happy.
  if (!/<link\b[^>]*\brel\s*=\s*["'](?:icon|shortcut icon)["']/i.test(head)) {
    warnings.push('missing favicon <link rel="icon">');
  }

  return { rel, indexable: true, errors, warnings };
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error('dist/ not found. Run `npm run build` first (or let build invoke this).');
    process.exit(1);
  }

  const files = walkHtml(DIST).sort();
  if (files.length === 0) {
    console.error('No HTML files found under dist/.');
    process.exit(1);
  }

  let failCount = 0;
  let warnCount = 0;
  let skipped = 0;

  console.log(`Checking meta / social tags in ${files.length} HTML file(s) under dist/\n`);

  for (const file of files) {
    const result = checkFile(file);
    if (!result.indexable) {
      skipped += 1;
      console.log(`  skip  ${result.rel}  (noindex)`);
      if (result.errors.length) {
        // Still fail on missing title for noindex pages.
        failCount += 1;
        for (const e of result.errors) console.log(`         ✗ ${e}`);
      }
      continue;
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log(`  ok    ${result.rel}`);
      continue;
    }

    if (result.errors.length) {
      failCount += 1;
      console.log(`  FAIL  ${result.rel}`);
      for (const e of result.errors) console.log(`         ✗ ${e}`);
    } else {
      console.log(`  ok*   ${result.rel}`);
    }
    for (const w of result.warnings) {
      warnCount += 1;
      console.log(`         ⚠ ${w}`);
    }
  }

  console.log('');
  console.log(
    `Done. ${files.length} pages · ${skipped} noindex · ${warnCount} warning(s) · ${failCount} failure(s)`,
  );

  if (failCount > 0) {
    console.error(`
Meta check failed.

Every public page needs:
  • <title>
  • meta description
  • og:type, og:title, og:description, og:url, og:image
  • twitter:card, twitter:title, twitter:description, twitter:image
  • og:image / twitter:image files that exist under dist/

Astro pages: use BaseLayout with title (and optional description/image).
Static HTML under public/: copy the meta block from an existing page
(e.g. public/cashclinic/index.html) and point og:image at a real asset
(/og-default.png is the site-wide fallback).

Pages with <meta name="robots" content="noindex"> only need a title.
`);
    process.exit(1);
  }
}

main();

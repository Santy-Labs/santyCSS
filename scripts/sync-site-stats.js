#!/usr/bin/env node
/**
 * Stamps version, file-size and class-count figures from the build output into
 * the site, so the pages can't drift from what npm actually ships.
 *
 *   node scripts/sync-site-stats.js          rewrite in place
 *   node scripts/sync-site-stats.js --check  exit 1 if any page is out of date
 *
 * Pages mark a figure with <span data-stat="KEY">…</span>; only the text inside
 * is replaced. Keys:
 *   version                  package.json version (2.9.5)
 *   classes                  every class name incl. variants (22,600+)
 *   base-classes             class names without a variant prefix (5,100+)
 *   animations               animate-* classes (150+)
 *   size:<file>              raw size of dist/<file> (or root) (430 KB)
 *   gz:<file>                gzipped size of dist/<file>    (54 KB)
 *   purged / purged-gz       santy.css purged against template-portfolio.html
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { purge } = require('../lib/purge-core');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const check = process.argv.includes('--check');

const { version } = require(path.join(ROOT, 'package.json'));
const classmap = require(path.join(DIST, 'santy-classmap.json'));

const fmt = (bytes) => bytes >= 1024 * 1024
  ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
  : `${Math.round(bytes / 1024)} KB`;
// Round down so "5,100+" stays true as the count grows.
const floorPlus = (n, step) => `${(Math.floor(n / step) * step).toLocaleString('en-US')}+`;

const sizes = {};
const fileSize = (name, gz) => {
  if (!sizes[name]) {
    // dist/ first; santy-jit.js only ships at the package root.
    const file = fs.existsSync(path.join(DIST, name)) ? path.join(DIST, name) : path.join(ROOT, name);
    const buf = fs.readFileSync(file);
    sizes[name] = { raw: buf.length, gz: zlib.gzipSync(buf, { level: 9 }).length };
  }
  return fmt(gz ? sizes[name].gz : sizes[name].raw);
};

let purged;
const purgedSize = (gz) => {
  if (!purged) {
    const { css } = purge({
      css: fs.readFileSync(path.join(DIST, 'santy.css'), 'utf8'),
      content: [path.join(ROOT, 'template-portfolio.html')],
    });
    purged = { raw: Buffer.byteLength(css), gz: zlib.gzipSync(css, { level: 9 }).length };
  }
  return fmt(gz ? purged.gz : purged.raw);
};

const animationCss = fs.readFileSync(path.join(DIST, 'santy-animations.css'), 'utf8');
const STATS = {
  version: () => version,
  classes: () => floorPlus(classmap.count, 100),
  'base-classes': () => floorPlus(classmap.classes.filter((c) => !c.includes(':')).length, 100),
  animations: () => floorPlus(new Set(animationCss.match(/^\.animate-[a-z0-9-]+/gm)).size, 10),
  purged: () => purgedSize(false),
  'purged-gz': () => purgedSize(true),
};

function stat(key) {
  if (STATS[key]) return STATS[key]();
  const m = key.match(/^(size|gz):(.+)$/);
  if (m) return fileSize(m[2], m[1] === 'gz');
  throw new Error(`Unknown data-stat key "${key}"`);
}

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith('.') || e.name === 'node_modules') return [];
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return htmlFiles(p);
    return e.name.endsWith('.html') ? [p] : [];
  });
}

const stale = [];
for (const file of htmlFiles(ROOT)) {
  const src = fs.readFileSync(file, 'utf8');
  let out = src.replace(
    /(<span data-stat="([^"]+)"[^>]*>)[^<]*(<\/span>)/g,
    (m, open, key, close) => `${open}${stat(key)}${close}`
  );
  // Inside <script> blocks a stat can't be a span; mark it /*stat:KEY*/'value'.
  out = out.replace(/\/\*stat:([^*]+)\*\/'[^']*'/g, (m, key) => `/*stat:${key}*/'${stat(key)}'`);
  if (out === src) continue;
  stale.push(path.relative(ROOT, file));
  if (!check) fs.writeFileSync(file, out);
}

if (check) {
  if (stale.length) {
    console.error(`Site figures out of date in: ${stale.join(', ')}\nRun: node scripts/sync-site-stats.js`);
    process.exit(1);
  }
  console.log('Site figures match the build.');
} else {
  console.log(stale.length ? `Updated figures in: ${stale.join(', ')}` : 'Site figures already up to date.');
}

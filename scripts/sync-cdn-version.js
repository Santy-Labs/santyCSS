#!/usr/bin/env node
/**
 * Points the site's own pages at the npm package on jsDelivr, pinned to the
 * version in package.json, instead of loading the framework from the site host.
 *
 *   node scripts/sync-cdn-version.js          rewrite in place
 *   node scripts/sync-cdn-version.js --check  exit 1 if any page is out of sync
 *
 * Runs automatically on `npm version` (see the "version" script), so bumping
 * the package also bumps every page to the matching CDN build.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const { version } = require(path.join(ROOT, 'package.json'));
const CDN = `https://cdn.jsdelivr.net/npm/santycss@${version}`;
const check = process.argv.includes('--check');

// Files that ship in the package, keyed by the name pages use locally.
// Anything under dist/ is resolved there; santy-jit.js ships at the root.
const ROOT_FILES = new Set(['santy-jit.js']);
const cdnUrl = (name) => `${CDN}/${ROOT_FILES.has(name) ? '' : 'dist/'}${name}`;

// Local references (santy.css, ../santy-variants.css) and previously pinned
// CDN references (…/santycss@x.y.z/dist/santy.css) are both rewritten.
const PATTERN = new RegExp(
  '((?:href|src)=")' +
  '(?:(?:\\.\\./)*|https://cdn\\.jsdelivr\\.net/npm/santycss@\\d+\\.\\d+\\.\\d+/(?:dist/)?)' +
  '(santy(?:-[a-z]+)*\\.(?:css|js))"',
  'g'
);

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
  const out = src.replace(PATTERN, (m, attr, name) => {
    const inPkg = ROOT_FILES.has(name) || fs.existsSync(path.join(ROOT, 'dist', name));
    return inPkg ? `${attr}${cdnUrl(name)}"` : m;
  }).replace(
    // Script constants that build CDN URLs at runtime (index.html downloads).
    /(var SANTY_CDN\s*=\s*')https:\/\/cdn\.jsdelivr\.net\/npm\/santycss@\d+\.\d+\.\d+\//g,
    `$1${CDN}/`
  );
  if (out === src) continue;
  stale.push(path.relative(ROOT, file));
  if (!check) fs.writeFileSync(file, out);
}

if (check) {
  if (stale.length) {
    console.error(`Not pointing at santycss@${version} on jsDelivr:\n  ${stale.join('\n  ')}`);
    console.error('Run: node scripts/sync-cdn-version.js');
    process.exit(1);
  }
  console.log(`All pages load santycss@${version} from jsDelivr.`);
} else {
  console.log(`Updated ${stale.length} page(s) to ${CDN}`);
}

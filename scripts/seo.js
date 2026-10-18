#!/usr/bin/env node
/**
 * Keeps every page of santycss.santy.in ready for search engines and link
 * previews, and keeps sitemap.xml listing all of them.
 *
 *   node scripts/seo.js          add missing tags in place, rewrite sitemap.xml
 *   node scripts/seo.js --check  exit 1 if a page or the sitemap is out of date
 *
 * The pages are the source of truth. Each one writes its own <title> and
 * <meta name="description">; from those this script adds whatever is missing
 * of: canonical link, robots, Open Graph and Twitter Card tags. Tags a page
 * already has are left alone, so a page can word its social preview its own way.
 *
 * Deployed pages are the root *.html files plus the folders amplify.yml copies
 * to the site. A page with <meta name="robots" content="noindex…"> is kept out
 * of sitemap.xml; every other page goes in.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://santycss.santy.in';
const OG_IMAGE = `${SITE}/assest/santy_css.png`;
const check = process.argv.includes('--check');

// Core pages rank above the demo templates; anything unlisted gets the default.
const PRIORITY = {
  '': ['1.0', 'weekly'],
  'classes.html': ['0.9', 'weekly'],
  'docs.html': ['0.9', 'weekly'],
  'components.html': ['0.9', 'weekly'],
  'icons.html': ['0.9', 'weekly'],
  'animations.html': ['0.9', 'weekly'],
  'playground.html': ['0.8', 'monthly'],
  'snippets.html': ['0.8', 'monthly'],
  'templates.html': ['0.8', 'monthly'],
  'webflow.html': ['0.8', 'monthly'],
  'changelog.html': ['0.7', 'weekly'],
  'demo.html': ['0.6', 'monthly'],
  'jit-demo.html': ['0.6', 'monthly'],
};
const DEFAULT_PRIORITY = ['0.5', 'monthly'];

function deployedPages() {
  const amplify = fs.readFileSync(path.join(ROOT, 'amplify.yml'), 'utf8');
  const dirs = [...amplify.matchAll(/cp -r ([\w-]+) site\/\1\b/g)]
    .map((m) => m[1])
    .filter((d) => d !== 'dist');
  const root = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
  const nested = dirs.flatMap((d) => fs.readdirSync(path.join(ROOT, d))
    .filter((f) => f.endsWith('.html'))
    .map((f) => `${d}/${f}`));
  return [...root, ...nested].sort();
}

// index.html is served at its folder's URL.
const urlPath = (page) => page.replace(/(^|\/)index\.html$/, '$1');

const attr = (html, re) => (html.match(re) || [])[1];
const hasMeta = (head, key, name) => new RegExp(`<meta\\s+${key}=["']${name}["']`, 'i').test(head);

function visibleH1Count(html) {
  const body = html.replace(/<(script|style|textarea|template)\b[\s\S]*?<\/\1>|<!--[\s\S]*?-->/gi, '');
  return (body.match(/<h1[\s>]/gi) || []).length;
}

const problems = [];
const stalePages = [];
const sitemapEntries = [];

for (const page of deployedPages()) {
  const file = path.join(ROOT, page);
  const src = fs.readFileSync(file, 'utf8');
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const headEnd = src.search(/<\/head>/i);
  const head = src.slice(0, headEnd);
  const url = `${SITE}/${urlPath(page)}`;
  const report = (msg) => problems.push(`${page}: ${msg}`);

  const title = attr(head, /<title>([^<]*)<\/title>/i);
  const description = attr(head, /<meta\s+name=["']description["']\s+content="([^"]*)"/i);
  const robots = attr(head, /<meta\s+name=["']robots["']\s+content=["']([^"']*)/i);
  const canonical = attr(head, /<link\s+rel=["']canonical["']\s+href=["']([^"']*)/i);

  if (!title) report('missing <title>');
  if (!description) report('missing <meta name="description">');
  else if (description.length < 50 || description.length > 170) report(`description is ${description.length} chars (keep it 50–170)`);
  if (!/<html[^>]*\slang=/i.test(src)) report('missing <html lang>');
  if (!hasMeta(head, 'name', 'viewport')) report('missing viewport meta');
  const h1s = visibleH1Count(src);
  if (h1s !== 1) report(`has ${h1s} <h1> elements (want exactly 1)`);
  if (canonical && canonical !== url) report(`canonical is ${canonical}, expected ${url}`);
  if (!title || !description) continue;

  const tags = [];
  if (!canonical) tags.push(`<link rel="canonical" href="${url}" />`);
  if (!robots) tags.push('<meta name="robots" content="index, follow" />');
  const og = {
    'og:type': 'website',
    'og:site_name': 'SantyCSS',
    'og:title': title,
    'og:description': description,
    'og:url': url,
    'og:image': OG_IMAGE,
  };
  for (const [prop, value] of Object.entries(og)) {
    if (!hasMeta(head, 'property', prop)) tags.push(`<meta property="${prop}" content="${value}" />`);
  }
  const twitter = {
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': OG_IMAGE,
  };
  for (const [name, value] of Object.entries(twitter)) {
    if (!hasMeta(head, 'name', name)) tags.push(`<meta name="${name}" content="${value}" />`);
  }

  if (tags.length) {
    stalePages.push(page);
    if (!check) {
      // Insert right after the description, matching its indentation.
      const m = head.match(/^([ \t]*)<meta\s+name=["']description["'][^>]*>[^\S\r\n]*(?=\r?$)/im);
      const indent = m[1];
      const at = m.index + m[0].length;
      const block = tags.map((t) => `${eol}${indent}${t}`).join('');
      fs.writeFileSync(file, src.slice(0, at) + block + src.slice(at));
    }
  }

  if (!/noindex/i.test(robots || '')) sitemapEntries.push({ page, url });
}

// ── sitemap.xml ──────────────────────────────────────────────────────────────
function lastModified(page) {
  const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
  try {
    if (!git('status', '--porcelain', '--', page)) {
      const date = git('log', '-1', '--format=%cs', '--', page);
      if (date) return date;
    }
  } catch { /* not a git checkout */ }
  return new Date().toISOString().slice(0, 10);
}

const sitemapFiles = ['sitemap.xml', 'dist/sitemap.xml'];
const listed = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort().join('\n');
const wanted = sitemapEntries.map((e) => e.url).sort().join('\n');
const staleSitemaps = sitemapFiles.filter((f) => {
  const p = path.join(ROOT, f);
  return !fs.existsSync(p) || listed(fs.readFileSync(p, 'utf8')) !== wanted;
});

if (!check) {
  const order = (e) => -Number((PRIORITY[urlPath(e.page)] || DEFAULT_PRIORITY)[0]);
  const urls = [...sitemapEntries]
    .sort((a, b) => order(a) - order(b) || a.page.localeCompare(b.page))
    .map((e) => {
      const [priority, changefreq] = PRIORITY[urlPath(e.page)] || DEFAULT_PRIORITY;
      return `  <url>
    <loc>${e.url}</loc>
    <lastmod>${lastModified(e.page)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
  for (const f of sitemapFiles) fs.writeFileSync(path.join(ROOT, f), xml);
}

// ── Report ───────────────────────────────────────────────────────────────────
if (problems.length) {
  console.error(`SEO problems that need a hand edit:\n  ${problems.join('\n  ')}`);
}
if (check) {
  const stale = [...stalePages, ...staleSitemaps];
  if (stale.length) {
    console.error(`Out of date, run \`node scripts/seo.js\`:\n  ${stale.join('\n  ')}`);
  }
  if (problems.length || stale.length) process.exit(1);
  console.log(`SEO tags and sitemap are up to date (${sitemapEntries.length} pages in sitemap.xml).`);
} else {
  if (stalePages.length) console.log(`Added missing SEO tags to:\n  ${stalePages.join('\n  ')}`);
  console.log(`Wrote sitemap.xml with ${sitemapEntries.length} pages.`);
  if (problems.length) process.exit(1);
}

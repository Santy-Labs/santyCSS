'use strict';
/**
 * postcss-santycss
 *
 * PostCSS plugin that purges unused SantyCSS utilities.
 *
 * Usage in postcss.config.js:
 *
 *   const santycss = require('santycss/postcss');
 *
 *   module.exports = {
 *     plugins: [
 *       santycss({
 *         content: ['./src/**\/*.{html,js,jsx,ts,tsx,vue,svelte}'],
 *         safelist: ['animate-spin', 'make-hidden'],
 *       }),
 *     ],
 *   };
 */

const path = require('path');
const fs   = require('fs');
const { purge, extractClasses, EXTS } = require('../lib/purge-core');
const { buildIndex, expandApply } = require('../lib/apply');

function expandGlobs(patterns) {
  const files = [];
  for (const pat of patterns) {
    if (!pat.includes('*')) {
      if (fs.existsSync(pat)) files.push(pat);
      continue;
    }
    const parts  = pat.split(/[/\\]/);
    const base   = parts.slice(0, parts.findIndex(p => p.includes('*'))).join('/') || '.';
    const extMatch = pat.match(/\.([\w,{}]+)$/);
    const exts   = extMatch ? extMatch[1].replace(/[{}]/g,'').split(',') : EXTS;
    function walk(dir) {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = dir + '/' + entry.name;
        if (entry.isDirectory()) walk(full);
        else if (exts.some(e => entry.name.endsWith('.' + e))) files.push(full);
      }
    }
    walk(base);
  }
  return [...new Set(files)];
}

/** Lazily read and cache the framework CSS an @apply / purge run resolves against. */
let applyIndexCache = null;
function utilityIndex(sourceCSS) {
  if (!applyIndexCache) applyIndexCache = buildIndex(sourceCSS);
  return applyIndexCache;
}

module.exports = (opts = {}) => {
  const { content = [], safelist = [], sourceFile = null, apply = true } = opts;

  return {
    postcssPlugin: 'postcss-santycss',
    async Once(root, { result }) {
      const sourceCSS = sourceFile
        ? fs.readFileSync(sourceFile, 'utf8')
        : fs.readFileSync(path.join(__dirname, '../dist/santy.css'), 'utf8');

      /* ── @apply: inline utility declarations into the author's own rules ──
         Runs before purging, so classes only referenced via @apply are
         expanded rather than stripped as unused. */
      if (apply && root.toString().includes('@apply')) {
        const postcss = require('postcss');
        const expanded = expandApply(root.toString(), utilityIndex(sourceCSS));
        for (const warning of expanded.warnings) {
          result.warn(warning, { plugin: 'postcss-santycss' });
        }
        root.removeAll();
        postcss.parse(expanded.css).each(node => root.append(node.clone()));
      }

      const files = expandGlobs(content);
      if (!files.length && !sourceFile) return;

      const html = files.map(f => fs.readFileSync(f, 'utf8')).join('\n');
      const purged = purge(sourceCSS, html, { safelist });

      // Keep the author's own rules and re-append them *after* the framework,
      // so their declarations still win. Before v2.9.0 this step dropped them
      // outright, which made @apply (and any hand-written CSS) disappear.
      const authored = root.nodes.map(n => n.clone());

      root.removeAll();
      const postcss = require('postcss');
      postcss.parse(purged).each(node => root.append(node.clone()));
      authored.forEach(node => root.append(node));

      result.messages.push({
        type: 'santycss',
        plugin: 'postcss-santycss',
        text: `Purged to ${(purged.length / 1024).toFixed(1)}KB from ${files.length} files`,
      });
    },
  };
};

module.exports.postcss = true;

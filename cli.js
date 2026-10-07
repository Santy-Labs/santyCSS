#!/usr/bin/env node
/**
 * SantyCSS CLI  —  npx santycss <command>
 *
 *   init [dir]      Scaffold a starter index.html wired to the SantyCSS CDN
 *   build           Build custom CSS from santy.config.json (colors, prefix, breakpoints…)
 *   purge [...]     Strip unused classes (same flags as before — see purge.js)
 *   migrate [...]   Convert Tailwind or Bootstrap classes (see migrate.js)
 *   classes         Print class count + classmap location
 *   --help          Show this help
 *
 * Backward compatible: `npx santycss --input=src` still runs the purger.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const args = process.argv.slice(2);
const cmd = args[0];

const CDN = 'https://cdn.jsdelivr.net/npm/santycss@2/dist';

const STARTER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My SantyCSS App</title>
  <!-- SantyCSS — no build step, just classes -->
  <link rel="stylesheet" href="${CDN}/santy.css">
  <!-- Optional: prebuilt themes (set data-theme="ocean|sunset|forest|midnight|mono" on <html>) -->
  <link rel="stylesheet" href="${CDN}/santy-themes.css">
</head>
<body class="background-surface color-text" style="margin:0;font-family:var(--santy-font-sans);">

  <section class="make-flex flex-column align-center justify-center text-center add-padding-y-96 add-padding-x-24">
    <span class="badge badge-primary add-margin-bottom-16">SantyCSS starter</span>
    <h1 class="set-text-48 text-bold add-margin-bottom-16 on-mobile:set-text-32">
      Plain-English CSS.<br>No build step.
    </h1>
    <p class="set-text-18 color-text-muted line-height-relaxed add-margin-bottom-32 set-max-width-readable">
      Edit this file and refresh — class names read like sentences, so you already know them.
    </p>
    <div class="make-flex gap-12 flex-wrap justify-center">
      <button class="btn btn-primary btn-lg on-hover:scale-105 transition-all">Get started</button>
      <a href="https://santycss.santy.in/classes.html" class="btn btn-outline btn-lg">Class reference</a>
    </div>
  </section>

  <section class="make-grid grid-cols-3 gap-24 add-padding-48 on-mobile:grid-cols-1 md:grid-cols-2 set-max-width-1024 add-margin-x-auto">
    <div class="card background-surface-raised add-padding-24 round-corners-16 add-shadow-sm on-hover:add-shadow-lg transition-all">
      <h3 class="set-text-18 text-semibold add-margin-bottom-8">Utilities</h3>
      <p class="set-text-14 color-text-muted line-height-relaxed">add-padding-24, make-flex, set-text-18 — 21,000+ classes.</p>
    </div>
    <div class="card background-surface-raised add-padding-24 round-corners-16 add-shadow-sm on-hover:add-shadow-lg transition-all">
      <h3 class="set-text-18 text-semibold add-margin-bottom-8">Components</h3>
      <p class="set-text-14 color-text-muted line-height-relaxed">Buttons, cards, modals, toasts, carousels — ready to use.</p>
    </div>
    <div class="card background-surface-raised add-padding-24 round-corners-16 add-shadow-sm on-hover:add-shadow-lg transition-all">
      <h3 class="set-text-18 text-semibold add-margin-bottom-8">Themes</h3>
      <p class="set-text-14 color-text-muted line-height-relaxed">Try &lt;html data-theme="ocean"&gt; — semantic colors flip instantly.</p>
    </div>
  </section>

</body>
</html>
`;

function help() {
  console.log(`
SantyCSS CLI

  npx santycss init [dir]     Scaffold a starter index.html (default: current dir)
  npx santycss build          Build custom CSS from santy.config.json in the current dir
                              (keys: colors, spacing, fontSizes, breakpoints, prefix, output)
  npx santycss purge [flags]  Remove unused classes  (--input=, --out=, --css=, --keep=, …)
  npx santycss migrate [flags]
                              Convert Tailwind (default) or Bootstrap classes in place
                              (--input=, --file=, --from=bootstrap, --dry-run, --report)
  npx santycss classes        Show class count from the bundled classmap
  npx santycss --help         This help

Docs: https://santycss.santy.in
`);
}

if (cmd === 'init') {
  const dir = args[1] ? path.resolve(args[1]) : process.cwd();
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, 'index.html');
  if (fs.existsSync(target)) {
    console.error(`❌  ${target} already exists — not overwriting.`);
    process.exit(1);
  }
  fs.writeFileSync(target, STARTER_HTML);
  console.log(`✅  Created ${target}`);
  console.log('   Open it in a browser — no build step needed.');
} else if (cmd === 'build') {
  // Build from ./santy.config.json (or SANTY_CONFIG). Defaults output to ./santy-dist
  // so a custom build never overwrites the files inside node_modules.
  const cfgPath = process.env.SANTY_CONFIG || path.join(process.cwd(), 'santy.config.json');
  let cfg = {};
  if (fs.existsSync(cfgPath)) cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  if (!cfg.output) {
    cfg.output = './santy-dist';
    const tmpCfg = path.join(os.tmpdir(), `santy-config-${process.pid}.json`);
    fs.writeFileSync(tmpCfg, JSON.stringify(cfg));
    process.env.SANTY_CONFIG = tmpCfg;
  } else {
    process.env.SANTY_CONFIG = cfgPath;
  }
  require('./build.js');
} else if (cmd === 'classes') {
  const mapPath = path.join(__dirname, 'dist', 'santy-classmap.json');
  if (!fs.existsSync(mapPath)) {
    console.error('❌  classmap not found. Reinstall santycss or run node build.js.');
    process.exit(1);
  }
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  console.log(`SantyCSS v${map.version} — ${map.count.toLocaleString()} classes`);
  console.log(`Classmap: ${mapPath}`);
} else if (cmd === 'migrate') {
  // `npx santycss migrate …` — the documented form. `santycss-migrate` still works
  // when the package is installed locally.
  process.argv.splice(2, 1);
  require('./migrate.js');
} else if (cmd === 'purge' || (cmd && cmd.startsWith('--') && cmd !== '--help') || (!cmd && false)) {
  // `santycss purge --input=src` or legacy `santycss --input=src`
  if (cmd === 'purge') process.argv.splice(2, 1);
  require('./purge.js');
} else if (!cmd || cmd === '--help' || cmd === '-h' || cmd === 'help') {
  help();
} else {
  console.error(`Unknown command: ${cmd}`);
  help();
  process.exit(1);
}

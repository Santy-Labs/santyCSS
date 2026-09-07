#!/usr/bin/env node
/**
 * SantyCSS test suite  —  node test/run-tests.js
 * Sanity + regression checks on the generated dist/ output.
 * Run `node build.js` first (or `npm test`, which does both).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

let passed = 0;
let failed = 0;
const fails = [];

function test(name, fn) {
  try {
    fn();
    passed++;
  } catch (e) {
    failed++;
    fails.push(`✗ ${name}\n    ${e.message}`);
  }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

const read = f => fs.readFileSync(path.join(DIST, f), 'utf8');

// ── 1. Files exist and are non-trivial ──────────────────────────────────────
const REQUIRED = {
  'santy.css': 500000, 'santy.min.css': 400000, 'santy-core.css': 100000,
  'santy-variants.css': 100000, 'santy-start.css': 200000, 'santy-components.css': 100000,
  'santy-animations.css': 20000, 'santy-email.css': 5000, 'santy-scroll.js': 500,
  'santy-themes.css': 1000, 'santy-classmap.json': 100000,
  'santy-reset.css': 500, 'santy-layout.css': 10000, 'santy-flex.css': 1000,
  'santy-grid.css': 1000, 'santy-spacing.css': 10000, 'santy-sizing.css': 3000,
  'santy-typography.css': 3000, 'santy-colors.css': 30000, 'santy-borders.css': 5000,
  'santy-effects.css': 5000,
};
for (const [file, minSize] of Object.entries(REQUIRED)) {
  test(`dist/${file} exists and ≥ ${minSize}B`, () => {
    const p = path.join(DIST, file);
    assert(fs.existsSync(p), `${file} missing`);
    const size = fs.statSync(p).size;
    assert(size >= minSize, `${file} is ${size}B, expected ≥ ${minSize}B`);
  });
}

// ── 2. Core utilities present ────────────────────────────────────────────────
const css = read('santy.css');
[
  '.make-flex', '.make-grid', '.add-padding-24', '.add-margin-16',
  '.set-text-16', '.set-width-320', '.round-corners-12', '.add-shadow-md',
  '.background-blue-500', '.color-gray-900', '.border-color-red-500',
  '.grid-cols-12', '.gap-16', '.align-center', '.justify-between',
  '.position-sticky', '.pin-top-0', '.opacity-50', '.transition-all',
].forEach(sel => test(`utility ${sel}`, () => assert(css.includes(sel + ' '), `${sel} not found`)));

// ── 3. Variants ──────────────────────────────────────────────────────────────
[
  'on-hover\\:', 'on-focus\\:', 'dark\\:', 'md\\:', 'lg\\:',
  'on-mobile\\:', 'group-hover\\:', 'peer-checked\\:',
  'has-checked\\:', 'has-focus\\:', 'has-invalid\\:', 'group-has-checked\\:',
  'motion-safe\\:', 'motion-reduce\\:', 'print\\:',
].forEach(v => test(`variant ${v.replace('\\\\', '')}`, () => assert(css.includes('.' + v), `${v} not found`)));

// ── 4. :has() selectors actually valid ───────────────────────────────────────
test(':has() rules use real :has() selectors', () => {
  assert(/\.has-checked\\:[a-z0-9-]+:has\(:checked\)/.test(css), 'has-checked rule malformed');
  assert(/\.group:has\(:focus\)/.test(css), 'group-has rule malformed');
});

// ── 5. New v2.7.0 components ─────────────────────────────────────────────────
const comp = read('santy-components.css');
[
  '.toast', '.toast-container', '.toast-success',
  '.switch', '.switch-slider', '.checkbox', '.radio', '.range',
  '.carousel', '.carousel-item', '.carousel-dot',
  '.dialog', '.dialog::backdrop', '.popover', '.file-drop',
].forEach(sel => test(`component ${sel}`, () => assert(comp.includes(sel), `${sel} not found in components`)));

// ── 6. Semantic theming ──────────────────────────────────────────────────────
test('semantic tokens in :root', () => {
  ['--santy-surface:', '--santy-text:', '--santy-text-muted:', '--santy-border-color:']
    .forEach(t => assert(css.includes(t), `${t} missing from santy.css`));
});
test('semantic utilities', () => {
  ['.background-surface', '.color-text', '.color-text-muted', '.border-color-default']
    .forEach(c => assert(css.includes(c + ' '), `${c} missing`));
});
const themes = read('santy-themes.css');
['ocean', 'sunset', 'forest', 'midnight', 'mono'].forEach(t =>
  test(`theme "${t}"`, () => assert(themes.includes(`[data-theme="${t}"]`), `${t} theme missing`)));

// ── 7. Classmap ──────────────────────────────────────────────────────────────
test('classmap is valid JSON with >15k classes', () => {
  const map = JSON.parse(read('santy-classmap.json'));
  assert(Array.isArray(map.classes), 'classes not an array');
  assert(map.count === map.classes.length, `count ${map.count} !== length ${map.classes.length}`);
  assert(map.count > 15000, `only ${map.count} classes`);
  ['make-flex', 'add-padding-24', 'on-hover:scale-105', 'has-checked:background-blue-500', 'toast', 'switch']
    .forEach(c => assert(map.classes.includes(c), `classmap missing "${c}"`));
});

// ── 8. Minified output is structurally sound ─────────────────────────────────
test('santy.min.css braces balanced, no comments', () => {
  const min = read('santy.min.css');
  const open = (min.match(/\{/g) || []).length;
  const close = (min.match(/\}/g) || []).length;
  assert(open === close, `braces unbalanced: ${open} open vs ${close} close`);
  assert(!min.includes('/*'), 'comments not stripped');
});
test('santy.css braces balanced', () => {
  const open = (css.match(/\{/g) || []).length;
  const close = (css.match(/\}/g) || []).length;
  assert(open === close, `braces unbalanced: ${open} vs ${close}`);
});

// ── 9. package.json exports resolve to real files ────────────────────────────
test('package.json exports resolve', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  for (const [key, val] of Object.entries(pkg.exports)) {
    const rels = typeof val === 'string' ? [val] : Object.values(val);
    for (const rel of rels) {
      assert(fs.existsSync(path.join(ROOT, rel)), `export "${key}" → ${rel} missing`);
    }
  }
  for (const [name, rel] of Object.entries(pkg.bin || {})) {
    assert(fs.existsSync(path.join(ROOT, rel)), `bin "${name}" → ${rel} missing`);
  }
});

// ── 10. CLI init scaffolds ───────────────────────────────────────────────────
test('cli.js init scaffolds a starter', () => {
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'santy-test-'));
  const { execFileSync } = require('child_process');
  execFileSync('node', [path.join(ROOT, 'cli.js'), 'init', tmp]);
  const out = path.join(tmp, 'index.html');
  assert(fs.existsSync(out), 'index.html not created');
  const html = fs.readFileSync(out, 'utf8');
  assert(html.includes('cdn.jsdelivr.net/npm/santycss'), 'CDN link missing');
  fs.rmSync(tmp, { recursive: true, force: true });
});

// ── 11. v2.8.0 variants: ARIA, RTL/LTR, max-width breakpoints ──────────────
[
  'aria-expanded\\:', 'aria-selected\\:', 'aria-checked\\:', 'aria-pressed\\:',
  'aria-disabled\\:', 'aria-current\\:', 'aria-invalid\\:', 'group-aria-expanded\\:',
  'rtl\\:', 'ltr\\:', 'max-sm\\:', 'max-md\\:', 'max-lg\\:', 'max-xl\\:',
].forEach(v => test(`v2.8 variant ${v.replace('\\', '')}`, () => assert(css.includes('.' + v), `${v} not found`)));

test('ARIA variant rules use attribute selectors', () => {
  assert(/\.aria-expanded\\:rotate-180\[aria-expanded="true"\]/.test(css), 'aria-expanded rule malformed');
});
test('rtl: rules keyed off [dir="rtl"]', () => {
  assert(/\[dir="rtl"\] \.rtl\\:[a-z]/.test(css), 'rtl rule malformed');
});
test('max-md: wrapped in max-width media query', () => {
  const i = css.indexOf('.max-md\\:');
  assert(i > -1 && css.lastIndexOf('@media (max-width: 767px)', i) > -1, 'max-md media query malformed');
});

// ── 12. santy.config.json customization (colors, breakpoints, prefix) ───────
test('config: custom colors, spacing, breakpoints, prefix, output', () => {
  const os = require('os');
  const { execFileSync } = require('child_process');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'santy-cfg-'));
  fs.writeFileSync(path.join(tmp, 'santy.config.json'), JSON.stringify({
    colors: { brand: { 500: '#0a5cff' }, solidcolor: '#123456' },
    spacing: [13],
    breakpoints: { 'tablet-up': '(min-width: 900px)' },
    prefix: 'sty-',
    output: './out',
  }));
  execFileSync('node', [path.join(ROOT, 'build.js')], { cwd: tmp, stdio: 'ignore' });
  const out = fs.readFileSync(path.join(tmp, 'out', 'santy.css'), 'utf8');
  assert(out.includes('.sty-make-flex'), 'prefix not applied');
  assert(out.includes('.sty-background-brand-500'), 'custom color shade missing');
  assert(out.includes('.sty-background-solidcolor-500'), 'single-hex color missing');
  assert(out.includes('.sty-add-padding-13'), 'custom spacing missing');
  assert(out.includes('.sty-tablet-up\\:'), 'custom breakpoint missing');
  assert(!fs.existsSync(path.join(tmp, 'dist')), 'custom output should not write ./dist');
  fs.rmSync(tmp, { recursive: true, force: true });
});

// ── Behavior layer (santy.js — v2.9.0) ──────────────────────────────────────
test('santy.js is emitted to dist and mirrors the source file', () => {
  const distJs = read('santy.js');
  const srcJs = fs.readFileSync(path.join(ROOT, 'santy.js'), 'utf8');
  assert(distJs.length > 20000, `dist/santy.js too small (${distJs.length})`);
  assert(distJs === srcJs, 'dist/santy.js does not match source santy.js');
});

test('santy.js loads without a DOM (SSR-safe)', () => {
  // Next.js / Nuxt import this during server render — it must not touch document.
  const modPath = path.join(ROOT, 'santy.js');
  delete require.cache[modPath];
  assert(typeof document === 'undefined', 'test env unexpectedly has a document');
  const Santy = require(modPath);
  assert(Santy && typeof Santy === 'object', 'module did not export an object');
});

test('santy.js exposes the documented public API', () => {
  const modPath = path.join(ROOT, 'santy.js');
  delete require.cache[modPath];
  const Santy = require(modPath);
  const expected = [
    'version', 'init', 'modal', 'drawer', 'offcanvas', 'sheet', 'bottomSheet',
    'dropdown', 'collapse', 'tabs', 'tooltip', 'popover', 'carousel',
    'toast', 'theme', 'scrollspy', 'utils',
  ];
  for (const key of expected) {
    assert(key in Santy, `Santy.${key} missing from public API`);
  }
  for (const m of ['modal', 'drawer', 'sheet']) {
    for (const fn of ['open', 'close', 'toggle', 'isOpen']) {
      assert(typeof Santy[m][fn] === 'function', `Santy.${m}.${fn} is not a function`);
    }
  }
  for (const v of ['success', 'error', 'warning', 'info']) {
    assert(typeof Santy.toast[v] === 'function', `Santy.toast.${v} missing`);
  }
  for (const fn of ['get', 'set', 'toggle', 'system', 'init']) {
    assert(typeof Santy.theme[fn] === 'function', `Santy.theme.${fn} missing`);
  }
  assert(typeof Santy.utils.position === 'function', 'utils.position missing');
  assert(typeof Santy.utils.focusTrap.activate === 'function', 'utils.focusTrap missing');
});

test('santy.js version matches package.json', () => {
  const modPath = path.join(ROOT, 'santy.js');
  delete require.cache[modPath];
  const Santy = require(modPath);
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert(Santy.version === pkg.version,
    `santy.js version ${Santy.version} !== package.json ${pkg.version}`);
});

test('behavior-layer CSS ships in every bundle that carries components', () => {
  // The JS toggles these classes; if the CSS is missing the components stay invisible.
  const required = [
    '.modal-overlay.open', '.drawer-overlay.open', '.santy-tip', '.santy-ripple',
    '.toast-action', '.toast-container-bottom-right',
  ];
  for (const file of ['santy.css', 'santy-components.css', 'santy-start.css']) {
    const css = read(file);
    for (const sel of required) {
      assert(css.includes(sel), `${sel} missing from ${file}`);
    }
  }
});

test('ripple animation is disabled under prefers-reduced-motion', () => {
  const css = read('santy-components.css');
  const idx = css.indexOf('@media (prefers-reduced-motion: reduce)', css.indexOf('.santy-ripple'));
  assert(idx > -1, 'no reduced-motion guard after .santy-ripple');
  assert(css.slice(idx, idx + 200).includes('.santy-ripple'),
    'reduced-motion block does not neutralise .santy-ripple');
});

test('package.json exposes the behavior layer', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert(pkg.exports['./js'] === './dist/santy.js', 'exports["./js"] missing');
  assert(pkg.files.includes('santy.js'), 'santy.js not in files[]');
});

// ── Extended components (v2.9.0) ────────────────────────────────────────────
const EXTENDED = [
  '.data-table', '.data-table-wrap', '.data-table-pin-first', '.data-table-detail',
  '.combobox', '.combobox-list', '.combobox-option', '.combobox-chip',
  '.field', '.field-outlined', '.field-filled', '.field-standard', '.field-label',
  '.stepper', '.stepper-dot', '.stepper-vertical',
  '.tree', '.tree-node', '.tree-caret',
  '.context-menu', '.context-menu-item', '.menu-sub-list',
  '.segmented', '.segmented-label', '.toggle-group',
  '.pin-input', '.pin-digit',
  '.number-input', '.number-input-btn',
  '.color-picker', '.color-swatch', '.color-input',
  '.time-picker', '.time-option',
  '.calendar', '.calendar-grid', '.calendar-event',
  '.uploader', '.upload-item', '.upload-progress-bar',
  '.skeleton-text', '.skeleton-circle', '.skeleton-rect', '.skeleton-wave',
  '.snackbar', '.snackbar-action',
  '.banner', '.banner-actions',
  '.speed-dial', '.speed-dial-action',
  '.bottom-nav', '.bottom-nav-item', '.nav-rail', '.nav-rail-wide',
  '.virtual-scroll', '.infinite-sentinel',
  '.loading-overlay', '.backdrop',
  '.prose', '.prose-lg', '.prose-full',
];
EXTENDED.forEach(sel => test(`extended component ${sel}`, () => {
  assert(read('santy-components.css').includes(sel + ' ') ||
         read('santy-components.css').includes(sel + ','), `${sel} not found in components`);
}));

test('extended components ship in every bundle that carries components', () => {
  for (const file of ['santy.css', 'santy-components.css', 'santy-start.css']) {
    const c = read(file);
    for (const sel of ['.data-table', '.combobox', '.prose', '.stepper', '.field-outlined']) {
      assert(c.includes(sel), `${sel} missing from ${file}`);
    }
  }
});

test('floating label works without JS (rides on :placeholder-shown)', () => {
  const c = read('santy-components.css');
  assert(c.includes(':not(:placeholder-shown) ~ .field-label'),
    'floating label does not use :placeholder-shown');
});

test('validation styling uses :user-invalid, not :invalid', () => {
  const c = read('santy-components.css');
  assert(c.includes('.field-input:user-invalid'), ':user-invalid not used');
  // :invalid would flag empty required fields before the user typed anything.
  assert(!/\.field-input:invalid[^-]/.test(c), 'bare :invalid would fire too early');
});

test('extended components respect prefers-reduced-motion', () => {
  const c = read('santy-components.css');
  const i = c.indexOf('.skeleton-wave::after { animation: none');
  assert(i > -1, 'skeleton wave not disabled under reduced motion');
});

test('santy.js exposes table and combobox modules', () => {
  const modPath = path.join(ROOT, 'santy.js');
  delete require.cache[modPath];
  const Santy = require(modPath);
  assert(typeof Santy.table.sort === 'function', 'Santy.table.sort missing');
  assert(typeof Santy.table.selectAll === 'function', 'Santy.table.selectAll missing');
  for (const fn of ['open', 'close', 'filter', 'value']) {
    assert(typeof Santy.combobox[fn] === 'function', `Santy.combobox.${fn} missing`);
  }
});

// ── Framework adapters (v2.9.0) ─────────────────────────────────────────────
test('cn() resolves conflicting utilities so the last argument wins', () => {
  const cn = require(path.join(ROOT, 'packages', 'merge', 'santy-merge.js'));
  const cases = [
    [['add-padding-24', 'add-padding-8'], 'add-padding-8'],
    [['background-blue-500', 'background-red-500'], 'background-red-500'],
    [['make-flex', 'make-grid'], 'make-grid'],
    [['text-bold', 'text-light'], 'text-light'],
    [['round-corners-8', 'make-pill'], 'make-pill'],
    [['set-width-320', 'set-width-full'], 'set-width-full'],
    [['add-shadow-sm', 'add-shadow-lg'], 'add-shadow-lg'],
  ];
  for (const [input, expected] of cases) {
    const got = cn(...input);
    assert(got === expected, `cn(${input.join(', ')}) → "${got}", expected "${expected}"`);
  }
});

test('cn() keeps classes that target different properties', () => {
  const cn = require(path.join(ROOT, 'packages', 'merge', 'santy-merge.js'));
  // padding-x and padding are different axes; both must survive.
  assert(cn('add-padding-24', 'add-padding-x-8') === 'add-padding-24 add-padding-x-8',
    'axis-specific padding wrongly dropped');
  assert(cn('color-gray-900', 'background-white') === 'color-gray-900 background-white',
    'text and background colour wrongly collided');
  // Transforms compose rather than conflict.
  assert(cn('scale-105', 'rotate-45') === 'scale-105 rotate-45', 'transforms wrongly collided');
});

test('cn() scopes conflicts to matching variants', () => {
  const cn = require(path.join(ROOT, 'packages', 'merge', 'santy-merge.js'));
  assert(cn('md:add-padding-24', 'add-padding-8') === 'md:add-padding-24 add-padding-8',
    'a breakpoint class must not conflict with the base class');
  assert(cn('md:add-padding-24', 'md:add-padding-8') === 'md:add-padding-8',
    'same-variant classes should still collide');
  assert(cn('on-hover:scale-110', 'scale-100') === 'on-hover:scale-110 scale-100',
    'state variant must not conflict with the base class');
});

test('cn() accepts clsx-style arrays and condition objects', () => {
  const cn = require(path.join(ROOT, 'packages', 'merge', 'santy-merge.js'));
  const out = cn('btn', { 'btn-lg': true, 'btn-sm': false }, ['add-padding-8'], null, undefined, false);
  assert(out === 'btn btn-lg add-padding-8', `got "${out}"`);
});

test('adapters load without React, Vue or a DOM (SSR-safe)', () => {
  assert(typeof document === 'undefined', 'test env unexpectedly has a document');
  const el = require(path.join(ROOT, 'packages', 'elements', 'santy-elements.js'));
  assert(el.defined === false, 'custom elements tried to register without a DOM');
  const r = require(path.join(ROOT, 'packages', 'react', 'index.js'));
  assert(typeof r.useModal === 'function', 'React adapter missing useModal');
  const v = require(path.join(ROOT, 'packages', 'vue', 'index.js'));
  assert(typeof v.useModal === 'function', 'Vue adapter missing useModal');
});

test('React adapter exposes the documented surface', () => {
  const r = require(path.join(ROOT, 'packages', 'react', 'index.js'));
  ['cn', 'useSanty', 'useModal', 'useDrawer', 'useBottomSheet', 'useTheme',
   'useToast', 'useDisclosure', 'Button', 'Card', 'Modal', 'Prose']
    .forEach(k => assert(k in r, `React adapter missing ${k}`));
});

test('Vue adapter exposes composables and an installable plugin', () => {
  const v = require(path.join(ROOT, 'packages', 'vue', 'index.js'));
  ['cn', 'useSanty', 'useModal', 'useTheme', 'useToast', 'SantyButton', 'SantyModal']
    .forEach(k => assert(k in v, `Vue adapter missing ${k}`));
  assert(typeof v.plugin.install === 'function', 'Vue plugin is not installable');
});

test('adapters are mirrored into dist for CDN use', () => {
  for (const f of ['santy-elements.js', 'santy-merge.js']) {
    const p = path.join(DIST, f);
    assert(fs.existsSync(p), `dist/${f} missing`);
    assert(fs.statSync(p).size > 2000, `dist/${f} suspiciously small`);
  }
  const src = fs.readFileSync(path.join(ROOT, 'packages', 'merge', 'santy-merge.js'), 'utf8');
  assert(read('santy-merge.js') === src, 'dist/santy-merge.js drifted from source');
});

test('react and vue are declared as OPTIONAL peer dependencies', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  for (const dep of ['react', 'vue']) {
    assert(pkg.peerDependencies[dep], `${dep} not declared as a peer dependency`);
    assert(pkg.peerDependenciesMeta[dep] && pkg.peerDependenciesMeta[dep].optional,
      `${dep} must be optional — installing santycss should not pull it in`);
  }
});

// ── Grid system (v2.9.0) ────────────────────────────────────────────────────
test('Bootstrap-compatible grid ships in every component bundle', () => {
  for (const file of ['santy.css', 'santy-components.css', 'santy-start.css']) {
    const c = read(file);
    for (const sel of ['.row', '.col-md-6', '.col-lg-4', '.offset-md-3',
                       '.row-cols-md-3', '.order-lg-2', '.g-24', '.container-xxl']) {
      assert(c.includes(sel + ' ') || c.includes(sel + ','), `${sel} missing from ${file}`);
    }
  }
});

test('grid columns use Bootstrap 5 breakpoints and widths', () => {
  const c = read('santy-components.css');
  assert(/\.col-md-6 \{ flex: 0 0 auto; width: 50%; \}/.test(c), 'col-md-6 width wrong');
  assert(/\.col-lg-4 \{ flex: 0 0 auto; width: 33\.3333333%; \}/.test(c), 'col-lg-4 width wrong');
  for (const [infix, px] of [['sm', 576], ['md', 768], ['lg', 992], ['xl', 1200], ['xxl', 1400]]) {
    const i = c.indexOf(`.col-${infix}-1 `);
    assert(i > -1, `col-${infix}-1 missing`);
    assert(c.lastIndexOf(`@media (min-width: ${px}px)`, i) > -1,
      `col-${infix}-* not inside its ${px}px media query`);
  }
});

test('grid does NOT redefine the existing .container', () => {
  // SantyCSS shipped .container long before this grid, with different caps
  // (640/768/1024, 16px padding). Overriding it would reflow existing sites.
  const c = read('santy.css');
  const matches = c.match(/^\.container \{/gm) || [];
  assert(matches.length === 1, `.container defined ${matches.length} times — the grid must not redefine it`);
  assert(c.includes('.container-fluid'), '.container-fluid should still be added');
});

test('grid CSS is brace-balanced', () => {
  const g = require(path.join(ROOT, 'lib', 'grid-system.js')).build();
  const open = (g.match(/\{/g) || []).length;
  const close = (g.match(/\}/g) || []).length;
  assert(open === close, `grid braces unbalanced: ${open} vs ${close}`);
});

// ── Plugin API (v2.9.0) ─────────────────────────────────────────────────────
const { runPlugins } = require(path.join(ROOT, 'lib', 'plugin-api.js'));

test('plugins can add utilities, components and base styles', () => {
  const res = runPlugins([
    ({ addUtilities, addComponents, addBase, theme }) => {
      addBase({ 'body': { margin: '0' } });
      addUtilities({ '.text-brand': { color: theme('colors.blue.500', '#000') } });
      addComponents({ '.btn-brand': { background: 'red', '&:hover': { background: 'darkred' } } });
    },
  ], { theme: { colors: { blue: { 500: '#3b82f6' } } }, require: () => {} });

  assert(res.base.includes('body {'), 'addBase output missing');
  assert(res.utilities.includes('.text-brand'), 'addUtilities output missing');
  assert(res.utilities.includes('#3b82f6'), 'theme() did not resolve');
  assert(res.components.includes('.btn-brand:hover'), 'nested & selector not expanded');
  assert(res.names.includes('text-brand') && res.names.includes('btn-brand'),
    'registered class names not reported for the classmap');
});

test('plugin camelCase properties become kebab-case', () => {
  const res = runPlugins([
    ({ addUtilities }) => addUtilities({ '.g': { gridTemplateColumns: '1fr', backgroundColor: 'red' } }),
  ], { require: () => {} });
  assert(res.utilities.includes('grid-template-columns: 1fr'), 'camelCase not converted');
  assert(res.utilities.includes('background-color: red'), 'camelCase not converted');
});

test('addVariant handles at-rule, ancestor and pseudo templates', () => {
  const res = runPlugins([
    ({ addUtilities, addVariant }) => {
      addUtilities({ '.gd': { display: 'grid' } });
      addVariant('sup', '@supports (display: grid) { & }', ['gd']);
      addVariant('ocean', '[data-theme="ocean"] &', ['gd']);
      addVariant('hov', '&:hover', ['gd']);
    },
  ], { require: () => {} });

  const v = res.variants;
  assert(/@supports \(display: grid\) \{ \.sup\\:gd \{/.test(v), 'at-rule variant malformed');
  assert(v.includes('[data-theme="ocean"] .ocean\\:gd {'), 'ancestor variant malformed');
  assert(v.includes('.hov\\:gd:hover {'), 'pseudo variant malformed');
  const open = (v.match(/\{/g) || []).length;
  const close = (v.match(/\}/g) || []).length;
  assert(open === close, `variant braces unbalanced: ${open} vs ${close}`);
});

test('addVariant rejects a template without &', () => {
  let threw = false;
  try {
    runPlugins([({ addUtilities, addVariant }) => {
      addUtilities({ '.x': { color: 'red' } });
      addVariant('bad', '@media print', ['x']);
    }], { require: () => {} });
  } catch (e) { threw = /must contain/.test(e.message); }
  assert(threw, 'addVariant should reject a template with no &');
});

test('a plugin that exports the wrong shape fails loudly', () => {
  let threw = false;
  try { runPlugins([{ notAFunction: true }], { require: () => {} }); }
  catch (e) { threw = /did not export a function/.test(e.message); }
  assert(threw, 'bad plugin shape should throw');
});

// ── @apply (v2.9.0) ─────────────────────────────────────────────────────────
const { buildIndex, expandApply } = require(path.join(ROOT, 'lib', 'apply.js'));

test('@apply inlines utility declarations', () => {
  const index = buildIndex(read('santy.css'));
  assert(Object.keys(index).length > 1000, `only ${Object.keys(index).length} utilities indexed`);
  const out = expandApply('.promo { @apply add-padding-24 make-flex; border-top: 1px solid red; }', index);
  assert(out.css.includes('padding: 24px'), 'add-padding-24 not inlined');
  assert(out.css.includes('display: flex'), 'make-flex not inlined');
  assert(out.css.includes('border-top: 1px solid red'), 'author declaration lost');
  assert(out.warnings.length === 0, `unexpected warnings: ${out.warnings.join('; ')}`);
});

test('@apply warns instead of silently dropping unknown or variant classes', () => {
  const index = buildIndex(read('santy.css'));
  const out = expandApply('.x { @apply nope-not-real; }', index);
  assert(out.warnings.some(w => /unknown class/.test(w)), 'no warning for unknown class');

  const v = expandApply('.y { @apply on-hover:scale-110; }', index);
  assert(v.warnings.some(w => /cannot be inlined/.test(w)),
    'variant utilities must warn — they need a pseudo-class or media query');
});

test('@apply supports the ! important suffix', () => {
  const index = buildIndex(read('santy.css'));
  const out = expandApply('.x { @apply add-padding-24!; }', index);
  assert(out.css.includes('!important'), '! suffix did not produce !important');
});

test('@apply index only holds unconditional top-level rules', () => {
  // Anything inside @media/@supports is conditional and must not be inlinable.
  const index = buildIndex(`
    .a { color: red; }
    @media (min-width: 700px) { .b { color: blue; } }
    .c:hover { color: green; }
  `);
  assert(index.a === 'color: red', 'plain rule not indexed');
  assert(!('b' in index), 'media-query rule must not be indexed');
  assert(!('c' in index), 'pseudo-class rule must not be indexed');
});

// ── Accessibility & progressive enhancement (v2.9.0) ────────────────────────
test('every bundle that ships animation also ships the reduced-motion guard', () => {
  // Regression: the guard used to live inside the variants block, so
  // stripVariantBlocks removed it from core and start — the CDN drop-in served
  // 41 keyframes a reader had no way to switch off.
  for (const file of ['santy.css', 'santy-core.css', 'santy-start.css',
                      'santy-components.css', 'santy-animations.css', 'santy-variants.css']) {
    const c = read(file);
    const keyframes = (c.match(/@keyframes/g) || []).length;
    const guarded = /animation-duration:\s*\.01ms\s*!important/.test(c);
    assert(guarded, `${file} has ${keyframes} keyframes but no reduced-motion guard`);
  }
  // The minifier collapses whitespace around `:` but keeps it before !important.
  const min = read('santy.min.css');
  assert(/animation-duration:\.01ms\s*!important/.test(min), 'minified bundle lost the guard');
});

test('reduced-motion guard covers pseudo-elements', () => {
  // A bare `*` never matches ::before/::after, so decorative animations on
  // them kept running for readers who asked for reduced motion.
  const c = read('santy.css');
  const i = c.indexOf('@media (prefers-reduced-motion: reduce)', c.indexOf('animation-duration: .01ms') - 400);
  const block = c.slice(c.lastIndexOf('@media (prefers-reduced-motion: reduce)', c.indexOf('animation-duration: .01ms')), c.indexOf('animation-duration: .01ms'));
  assert(block.includes('*::before') && block.includes('*::after'),
    'guard must target *, *::before and *::after');
});

test('dynamic viewport units carry a vh/vw fallback', () => {
  // Without it an unsupporting browser drops the declaration and the element
  // gets no height at all — a layout break, not a cosmetic downgrade.
  const c = read('santy.css');
  const rules = [
    ['.set-height-dvh', 'height: 100vh; height: 100dvh;'],
    ['.set-min-height-svh', 'min-height: 100vh; min-height: 100svh;'],
    ['.set-width-dvw', 'width: 100vw; width: 100dvw;'],
    ['.h-50dvh', 'height: 50vh; height: 50dvh;'],
  ];
  for (const [sel, expected] of rules) {
    const line = c.split('\n').find(l => l.trim().startsWith(sel + ' ') || l.trim().startsWith(sel + '{'));
    assert(line && line.includes(expected), `${sel} missing fallback — expected "${expected}"`);
  }
});

test('color-mix utilities carry a precomputed hex fallback', () => {
  const c = read('santy.css');
  const line = c.split('\n').find(l => l.startsWith('.background-blue-tint-30 '));
  assert(line, '.background-blue-tint-30 not found');
  // Plain hex must come first so color-mix overrides it where supported.
  assert(/background-color:\s*#[0-9a-f]{6};\s*background-color:\s*color-mix/.test(line),
    `no hex fallback before color-mix: ${line}`);
});

test('no color-mix percentage is zero or negative', () => {
  // `100 - pct * 10` produced 0%, -100% and -200%: shade-100 rendered pure
  // black and shade-200/-300 were invalid CSS browsers discarded outright.
  const c = read('santy.css');
  const bad = c.match(/color-mix\([^)]*?\s(-\d+|0)%/g) || [];
  assert(bad.length === 0, `invalid color-mix percentages: ${[...new Set(bad)].slice(0, 5).join(', ')}`);
});

test('shade utilities darken progressively', () => {
  const c = read('santy.css');
  const pct = n => {
    const line = c.split('\n').find(l => l.startsWith(`.background-blue-shade-${n} `));
    assert(line, `shade-${n} missing`);
    return parseInt(/color-mix\(in srgb, \S+ (\d+)%/.exec(line)[1], 10);
  };
  const [a, b, d] = [pct(100), pct(200), pct(300)];
  assert(a === 90 && b === 80 && d === 70,
    `expected 90/80/70 base retention, got ${a}/${b}/${d}`);
});

// ── Class sorting (v2.9.0) ──────────────────────────────────────────────────
const { sortClasses, isSorted } = require(path.join(ROOT, 'packages', 'sort', 'santy-sort.js'));

test('sortClasses puts component classes first, then utilities, then variants', () => {
  const out = sortClasses('add-padding-8 make-flex md:grid-cols-3 btn on-hover:scale-105');
  assert(out === 'btn make-flex add-padding-8 md:grid-cols-3 on-hover:scale-105',
    `got "${out}"`);
});

test('sortClasses orders breakpoints ascending', () => {
  const out = sortClasses('lg:set-text-56 sm:set-text-32 md:set-text-40 set-text-24');
  assert(out === 'set-text-24 sm:set-text-32 md:set-text-40 lg:set-text-56', `got "${out}"`);
});

test('sortClasses is idempotent', () => {
  const samples = [
    'dark:background-gray-800 background-white add-shadow-md round-corners-12 card',
    'on-hover:scale-105 transition-all cursor-pointer make-flex align-center gap-16',
    'set-text-20 text-bold color-gray-900 add-margin-bottom-8',
  ];
  for (const s of samples) {
    const once = sortClasses(s);
    assert(sortClasses(once) === once, `not idempotent: "${s}" → "${once}"`);
    assert(isSorted(once), `isSorted() disagrees with sortClasses() for "${once}"`);
  }
});

test('sortClasses never reorders around a dynamic expression', () => {
  // Reordering across an interpolation can change what the strings concatenate to.
  const input = 'add-padding-8 ${cls} make-flex';
  assert(sortClasses(input) === input, `dynamic class list was reordered: ${sortClasses(input)}`);
});

test('sortClasses preserves every class it is given', () => {
  const input = 'btn card add-padding-8 make-flex md:grid-cols-3 dark:color-white unknown-thing';
  const before = input.split(/\s+/).sort();
  const after = sortClasses(input).split(/\s+/).sort();
  assert(JSON.stringify(before) === JSON.stringify(after),
    `class list changed: ${JSON.stringify(after)}`);
});

test('sorter is mirrored into dist and the prettier plugin loads', () => {
  assert(fs.existsSync(path.join(DIST, 'santy-sort.js')), 'dist/santy-sort.js missing');
  const plugin = require(path.join(ROOT, 'packages', 'prettier', 'index.js'));
  assert(typeof plugin.sortClasses === 'function', 'prettier plugin does not export sortClasses');
  assert(plugin.parsers && typeof plugin.parsers === 'object', 'prettier plugin exposes no parsers map');
});

// ── Bootstrap migration (v2.9.0) ────────────────────────────────────────────
const bs = require(path.join(ROOT, 'lib', 'bootstrap-map.js'));

test('Bootstrap utilities map to SantyCSS equivalents', () => {
  const cases = [
    ['mt-3', 'add-margin-top-16'], ['px-lg-4', 'lg:add-padding-x-24'],
    ['my-auto', 'add-margin-y-auto'], ['d-flex', 'make-flex'],
    ['d-md-none', 'md:make-hidden'], ['gap-3', 'gap-16'],
    ['fs-2', 'set-text-32'], ['text-primary', 'color-blue-600'],
    ['rounded-pill', 'make-pill'], ['shadow-lg', 'add-shadow-lg'],
    ['justify-content-between', 'justify-between'], ['align-items-center', 'align-center'],
    ['fw-bold', 'text-bold'], ['visually-hidden', 'screen-reader-only'],
    ['d-print-none', 'print:make-hidden'], ['w-50', 'set-width-half'],
  ];
  for (const [from, to] of cases) {
    const got = bs.convert(from);
    assert(got === to, `${from} → "${got}", expected "${to}"`);
  }
});

test('Bootstrap grid and shared component classes pass through untouched', () => {
  // SantyCSS ships a compatible grid, so rewriting these would churn markup
  // for no behavioural gain.
  for (const cls of ['row', 'container', 'col-md-6', 'col-12', 'offset-lg-3',
                     'g-3', 'order-md-2', 'row-cols-3', 'container-xxl',
                     'btn', 'btn-primary', 'card', 'card-body', 'navbar', 'modal']) {
    assert(bs.convert(cls) === cls, `${cls} should pass through, got "${bs.convert(cls)}"`);
  }
});

test('Bootstrap negative margins are reported, not mistranslated', () => {
  // SantyCSS has no negative-margin utility; emitting add-margin--16 would be
  // a class that does not exist.
  assert(bs.convert('m-n3') === null, 'm-n3 should be unmapped');
  assert(bs.convert('mt-n5') === null, 'mt-n5 should be unmapped');
});

test('Bootstrap spacer scale matches Bootstrap 5', () => {
  assert(JSON.stringify(bs.SPACER) === JSON.stringify({ 0: 0, 1: 4, 2: 8, 3: 16, 4: 24, 5: 48 }),
    'spacer scale drifted from Bootstrap 5 ($spacer = 16px)');
});

test('migrate --from=bootstrap converts a real file', () => {
  const os = require('os');
  const { execFileSync } = require('child_process');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'santy-bs-'));
  const file = path.join(tmp, 'page.html');
  fs.writeFileSync(file,
    '<div class="container"><div class="row g-3"><div class="col-md-6 d-flex p-4 fw-bold">x</div></div></div>');
  execFileSync('node', [path.join(ROOT, 'migrate.js'), `--file=${file}`, '--from=bootstrap'], { stdio: 'ignore' });
  const out = fs.readFileSync(file, 'utf8');
  assert(out.includes('make-flex'), 'd-flex not converted');
  assert(out.includes('add-padding-24'), 'p-4 not converted');
  assert(out.includes('text-bold'), 'fw-bold not converted');
  assert(out.includes('col-md-6') && out.includes('row') && out.includes('container'),
    'grid classes should survive untouched');
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('migrate rejects an unknown --from dialect', () => {
  const { execFileSync } = require('child_process');
  let failed = false;
  try {
    execFileSync('node', [path.join(ROOT, 'migrate.js'), '--from=foundation', '--dry-run'],
      { stdio: 'ignore' });
  } catch (e) { failed = true; }
  assert(failed, 'unknown --from should exit non-zero');
});

// ── Report ───────────────────────────────────────────────────────────────────
console.log(`\n${passed} passed, ${failed} failed`);
if (failed) {
  console.log('\n' + fails.join('\n'));
  process.exit(1);
}
console.log('✅ All tests passed');

/**
 * SantyCSS Framework Builder
 * Generates santy.css — a plain-English utility-first CSS framework.
 */

const fs   = require('fs');
const path = require('path');
const { ANIMATION_CSS } = require('./lib/animations');
const { runPlugins } = require('./lib/plugin-api');
const { buildIndex } = require('./lib/apply');
const gridSystem = require('./lib/grid-system');

// ─── VALUE RANGES ───────────────────────────────────────────────────────────
// T-shirt spacing scale — 32 values covering all real-world design needs.
// Migration: add-padding-7 → add-padding-8, add-padding-9 → add-padding-10, etc.
const spacing = [0,1,2,3,4,5,6,8,10,12,14,16,18,20,24,28,32,40,48,56,64,80,96,128,160,192,256,320,384,512,640,768,1024];

const fontSizes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96, 120, 144];
const radii = [...new Set([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 128])];
const borderWidths = [...new Set([0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 48])];
const zIndexes = [0, 1, 2, 3, 5, 10, 20, 30, 40, 50, 100, 200, 500, 999, 1000, 9999];
const opacities = [];
for (let i = 0; i <= 100; i += 5) opacities.push(i);
const gridCols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const lineHeights = [1, 1.25, 1.375, 1.5, 1.625, 1.75, 2, 2.5, 3];

// ─── COLOR PALETTE ──────────────────────────────────────────────────────────
const palette = {
  red:     { 50:'#fef2f2',100:'#fee2e2',200:'#fecaca',300:'#fca5a5',400:'#f87171',500:'#ef4444',600:'#dc2626',700:'#b91c1c',800:'#991b1b',900:'#7f1d1d' },
  orange:  { 50:'#fff7ed',100:'#ffedd5',200:'#fed7aa',300:'#fdba74',400:'#fb923c',500:'#f97316',600:'#ea580c',700:'#c2410c',800:'#9a3412',900:'#7c2d12' },
  amber:   { 50:'#fffbeb',100:'#fef3c7',200:'#fde68a',300:'#fcd34d',400:'#fbbf24',500:'#f59e0b',600:'#d97706',700:'#b45309',800:'#92400e',900:'#78350f' },
  yellow:  { 50:'#fefce8',100:'#fef9c3',200:'#fef08a',300:'#fde047',400:'#facc15',500:'#eab308',600:'#ca8a04',700:'#a16207',800:'#854d0e',900:'#713f12' },
  lime:    { 50:'#f7fee7',100:'#ecfccb',200:'#d9f99d',300:'#bef264',400:'#a3e635',500:'#84cc16',600:'#65a30d',700:'#4d7c0f',800:'#3f6212',900:'#365314' },
  green:   { 50:'#f0fdf4',100:'#dcfce7',200:'#bbf7d0',300:'#86efac',400:'#4ade80',500:'#22c55e',600:'#16a34a',700:'#15803d',800:'#166534',900:'#14532d' },
  teal:    { 50:'#f0fdfa',100:'#ccfbf1',200:'#99f6e4',300:'#5eead4',400:'#2dd4bf',500:'#14b8a6',600:'#0d9488',700:'#0f766e',800:'#115e59',900:'#134e4a' },
  cyan:    { 50:'#ecfeff',100:'#cffafe',200:'#a5f3fc',300:'#67e8f9',400:'#22d3ee',500:'#06b6d4',600:'#0891b2',700:'#0e7490',800:'#155e75',900:'#164e63' },
  blue:    { 50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af',900:'#1e3a8a' },
  indigo:  { 50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',500:'#6366f1',600:'#4f46e5',700:'#4338ca',800:'#3730a3',900:'#312e81' },
  violet:  { 50:'#f5f3ff',100:'#ede9fe',200:'#ddd6fe',300:'#c4b5fd',400:'#a78bfa',500:'#8b5cf6',600:'#7c3aed',700:'#6d28d9',800:'#5b21b6',900:'#4c1d95' },
  purple:  { 50:'#faf5ff',100:'#f3e8ff',200:'#e9d5ff',300:'#d8b4fe',400:'#c084fc',500:'#a855f7',600:'#9333ea',700:'#7e22ce',800:'#6b21a8',900:'#581c87' },
  pink:    { 50:'#fdf2f8',100:'#fce7f3',200:'#fbcfe8',300:'#f9a8d4',400:'#f472b6',500:'#ec4899',600:'#db2777',700:'#be185d',800:'#9d174d',900:'#831843' },
  rose:    { 50:'#fff1f2',100:'#ffe4e6',200:'#fecdd3',300:'#fda4af',400:'#fb7185',500:'#f43f5e',600:'#e11d48',700:'#be123c',800:'#9f1239',900:'#881337' },
  slate:   { 50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#334155',800:'#1e293b',900:'#0f172a' },
  gray:    { 50:'#f9fafb',100:'#f3f4f6',200:'#e5e7eb',300:'#d1d5db',400:'#9ca3af',500:'#6b7280',600:'#4b5563',700:'#374151',800:'#1f2937',900:'#111827' },
  zinc:    { 50:'#fafafa',100:'#f4f4f5',200:'#e4e4e7',300:'#d4d4d8',400:'#a1a1aa',500:'#71717a',600:'#52525b',700:'#3f3f46',800:'#27272a',900:'#18181b' },
  stone:   { 50:'#fafaf9',100:'#f5f5f4',200:'#e7e5e4',300:'#d6d3d1',400:'#a8a29e',500:'#78716c',600:'#57534e',700:'#44403c',800:'#292524',900:'#1c1917' },
};
const namedColors = { white: '#ffffff', black: '#000000', transparent: 'transparent', current: 'currentColor' };

// ─── USER CONFIGURATION (santy.config.json) ─────────────────────────────────
// Optional. Looked up in the working directory (or via SANTY_CONFIG env path).
// Supported keys:
//   colors      { name: '#hex' | { 50..900: '#hex' } }  — extend/override palette
//   spacing     [numbers]                                — extra px values
//   fontSizes   [numbers]                                — extra font-size px values
//   breakpoints { prefix: '(min-width: 900px)' }         — extend/override breakpoints
//   prefix      'sty-'                                   — prefix every class name
//   output      './my-css'                               — write files to this dir only
const configPath = process.env.SANTY_CONFIG
  ? path.resolve(process.env.SANTY_CONFIG)
  : path.join(process.cwd(), 'santy.config.json');
let userConfig = {};
if (fs.existsSync(configPath)) {
  try {
    userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log(`🔧 Config loaded: ${configPath}`);
  } catch (e) {
    console.error(`❌ Invalid JSON in ${configPath}: ${e.message}`);
    process.exit(1);
  }
}

if (userConfig.colors) {
  const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  for (const [name, val] of Object.entries(userConfig.colors)) {
    if (typeof val === 'string') {
      palette[name] = Object.fromEntries(SHADES.map(s => [s, val]));
    } else {
      palette[name] = { ...(palette[name] || {}), ...val };
    }
  }
}
if (Array.isArray(userConfig.spacing)) {
  userConfig.spacing.forEach(v => { if (!spacing.includes(v)) spacing.push(v); });
  spacing.sort((a, b) => a - b);
}
if (Array.isArray(userConfig.fontSizes)) {
  userConfig.fontSizes.forEach(v => { if (!fontSizes.includes(v)) fontSizes.push(v); });
  fontSizes.sort((a, b) => a - b);
}

// Optional class prefix — applied to every generated class selector at output time.
// url(...) bodies are shielded so data URIs are never touched.
function applyPrefix(css) {
  const prefix = userConfig.prefix;
  if (!prefix) return css;
  const urls = [];
  css = css.replace(/url\([^)]*\)/g, m => { urls.push(m); return `\x00URL${urls.length - 1}\x00`; });
  css = css.replace(/\.([A-Za-z_](?:[\w-]|\\.)*)/g, (m, cls) => `.${prefix}${cls}`);
  return css.replace(/\x00URL(\d+)\x00/g, (m, i) => urls[+i]);
}

// ─── CSS OUTPUT BUILDER ─────────────────────────────────────────────────────
const lines = [];
const add = (...css) => lines.push(...css);
const mod = (name) => lines.push(`\n/* @SANTYMOD:${name} */`);

// ─── CSS RESET + BASE ────────────────────────────────────────────────────────
mod('reset');
add(
`/* ============================================================
   SantyCSS v2.7.0  —  Plain-English Utility CSS Framework
   https://github.com/santybad/santy_css
   ============================================================ */

/* ── Box Sizing Reset ── */
*, *::before, *::after { box-sizing: border-box; }

/* ── Responsive Media Reset ── */
img, video, picture, svg { max-width: 100%; height: auto; }

/* ── CSS Custom Properties (Theme) ── */
:root {
  /* ── Design Tokens (override to customise) ── */
  --santy-primary:        #3b82f6;
  --santy-primary-dark:   #2563eb;
  --santy-primary-light:  #dbeafe;
  --santy-secondary:      #6b7280;
  --santy-success:        #22c55e;
  --santy-warning:        #f59e0b;
  --santy-danger:         #ef4444;
  --santy-info:           #06b6d4;
  /* ── Semantic Surface Tokens (v2.7.0 — flip with [data-theme] / .dark) ── */
  --santy-surface:        #ffffff;
  --santy-surface-alt:    #f9fafb;
  --santy-surface-raised: #ffffff;
  --santy-text:           #111827;
  --santy-text-muted:     #6b7280;
  --santy-border-color:   #e5e7eb;
  --santy-radius-sm:      4px;
  --santy-radius:         8px;
  --santy-radius-md:      12px;
  --santy-radius-lg:      16px;
  --santy-radius-xl:      24px;
  --santy-radius-full:    9999px;
  --santy-font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --santy-font-serif: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  --santy-font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --santy-transition-fast: all 0.15s ease;
  --santy-transition-normal: all 0.3s ease;
  --santy-transition-slow: all 0.5s ease;
  --santy-shadow-sm: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
  --santy-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  --santy-shadow-md: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  --santy-shadow-lg: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
  --santy-shadow-xl: 0 25px 50px -12px rgba(0,0,0,0.25);
  --santy-shadow-inner: inset 0 2px 4px 0 rgba(0,0,0,0.06);
}
`);

// ─── DISPLAY ────────────────────────────────────────────────────────────────
mod('layout');
add(
`/* ── Display ── */
.make-block        { display: block; }
.make-inline       { display: inline; }
.make-inline-block { display: inline-block; }
.make-flex         { display: flex; }
.make-inline-flex  { display: inline-flex; }
.make-grid         { display: grid; }
.make-inline-grid  { display: inline-grid; }
.make-table        { display: table; }
.make-hidden       { display: none; }
.make-contents     { display: contents; }
`);

// ─── VISIBILITY ─────────────────────────────────────────────────────────────
add(
`/* ── Visibility ── */
.make-visible   { visibility: visible; }
.make-invisible { visibility: hidden; }
.make-collapse  { visibility: collapse; }
`);

// ─── FLEX ────────────────────────────────────────────────────────────────────
mod('flex');
add(
`/* ── Flex Direction ── */
.flex-row            { flex-direction: row; }
.flex-row-reverse    { flex-direction: row-reverse; }
.flex-column         { flex-direction: column; }
.flex-column-reverse { flex-direction: column-reverse; }

/* ── Flex Wrap ── */
.flex-wrap        { flex-wrap: wrap; }
.flex-wrap-reverse{ flex-wrap: wrap-reverse; }
.flex-nowrap      { flex-wrap: nowrap; }

/* ── Flex Grow / Shrink / None ── */
.flex-grow        { flex-grow: 1; }
.flex-grow-none   { flex-grow: 0; }
.flex-shrink      { flex-shrink: 1; }
.flex-shrink-none { flex-shrink: 0; }
.flex-auto        { flex: 1 1 auto; }
.flex-initial     { flex: 0 1 auto; }
.flex-none        { flex: none; }
.flex-equal       { flex: 1; }

/* ── Align Items ── */
.align-start    { align-items: flex-start; }
.align-end      { align-items: flex-end; }
.align-center   { align-items: center; }
.align-stretch  { align-items: stretch; }
.align-baseline { align-items: baseline; }

/* ── Align Self ── */
.self-start    { align-self: flex-start; }
.self-end      { align-self: flex-end; }
.self-center   { align-self: center; }
.self-stretch  { align-self: stretch; }
.self-baseline { align-self: baseline; }
.self-auto     { align-self: auto; }

/* ── Align Content ── */
.content-start   { align-content: flex-start; }
.content-end     { align-content: flex-end; }
.content-center  { align-content: center; }
.content-stretch { align-content: stretch; }
.content-between { align-content: space-between; }
.content-around  { align-content: space-around; }
.content-evenly  { align-content: space-evenly; }

/* ── Justify Content ── */
.justify-start   { justify-content: flex-start; }
.justify-end     { justify-content: flex-end; }
.justify-center  { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-around  { justify-content: space-around; }
.justify-evenly  { justify-content: space-evenly; }

/* ── Justify Items ── */
.justify-items-start   { justify-items: start; }
.justify-items-end     { justify-items: end; }
.justify-items-center  { justify-items: center; }
.justify-items-stretch { justify-items: stretch; }

/* ── Justify Self ── */
.justify-self-start   { justify-self: start; }
.justify-self-end     { justify-self: end; }
.justify-self-center  { justify-self: center; }
.justify-self-stretch { justify-self: stretch; }
.justify-self-auto    { justify-self: auto; }

/* ── Place Content / Items / Self ── */
.place-center  { place-items: center; place-content: center; }
.place-stretch { place-items: stretch; }

/* ── Order ── */
.order-first { order: -9999; }
.order-last  { order: 9999; }
.order-none  { order: 0; }
`);

for (let i = 1; i <= 12; i++) add(`.order-${i} { order: ${i}; }`);

// ─── GRID ────────────────────────────────────────────────────────────────────
mod('grid');
add(`\n/* ── Grid Template Columns ── */`);
gridCols.forEach(n => add(`.grid-cols-${n} { grid-template-columns: repeat(${n}, minmax(0, 1fr)); }`));
add(`.grid-cols-none { grid-template-columns: none; }`);

add(`\n/* ── Grid Template Rows ── */`);
[1,2,3,4,5,6].forEach(n => add(`.grid-rows-${n} { grid-template-rows: repeat(${n}, minmax(0, 1fr)); }`));

add(`\n/* ── Grid Column / Row Span ── */`);
gridCols.forEach(n => {
  add(`.span-col-${n} { grid-column: span ${n} / span ${n}; }`);
});
[1,2,3,4,5,6].forEach(n => {
  add(`.span-row-${n} { grid-row: span ${n} / span ${n}; }`);
});
add(`.span-col-full { grid-column: 1 / -1; }`);
add(`.span-row-full { grid-row: 1 / -1; }`);

add(`\n/* ── Grid Auto Flow ── */
.grid-flow-row    { grid-auto-flow: row; }
.grid-flow-col    { grid-auto-flow: column; }
.grid-flow-dense  { grid-auto-flow: dense; }
.grid-auto-cols-min  { grid-auto-columns: min-content; }
.grid-auto-cols-max  { grid-auto-columns: max-content; }
.grid-auto-cols-fr   { grid-auto-columns: minmax(0, 1fr); }
`);

// ─── SPACING ─────────────────────────────────────────────────────────────────
mod('spacing');
const spDir = {
  '':       'all',
  'top':    'top',
  'bottom': 'bottom',
  'left':   'left',
  'right':  'right',
};

// Padding
add(`\n/* ── Padding ── */`);
spacing.forEach(v => {
  add(`.add-padding-${v}        { padding: ${v}px; }`);
  add(`.add-padding-top-${v}    { padding-top: ${v}px; }`);
  add(`.add-padding-bottom-${v} { padding-bottom: ${v}px; }`);
  add(`.add-padding-left-${v}   { padding-left: ${v}px; }`);
  add(`.add-padding-right-${v}  { padding-right: ${v}px; }`);
  add(`.add-padding-x-${v}      { padding-left: ${v}px; padding-right: ${v}px; }`);
  add(`.add-padding-y-${v}      { padding-top: ${v}px; padding-bottom: ${v}px; }`);
});

// Margin
add(`\n/* ── Margin ── */`);
spacing.forEach(v => {
  add(`.add-margin-${v}        { margin: ${v}px; }`);
  add(`.add-margin-top-${v}    { margin-top: ${v}px; }`);
  add(`.add-margin-bottom-${v} { margin-bottom: ${v}px; }`);
  add(`.add-margin-left-${v}   { margin-left: ${v}px; }`);
  add(`.add-margin-right-${v}  { margin-right: ${v}px; }`);
  add(`.add-margin-x-${v}      { margin-left: ${v}px; margin-right: ${v}px; }`);
  add(`.add-margin-y-${v}      { margin-top: ${v}px; margin-bottom: ${v}px; }`);
});
add(`.center-margin            { margin-left: auto; margin-right: auto; }`);
add(`.add-margin-auto          { margin: auto; }`);
add(`.add-margin-top-auto      { margin-top: auto; }`);
add(`.add-margin-bottom-auto   { margin-bottom: auto; }`);
add(`.add-margin-left-auto     { margin-left: auto; }`);
add(`.add-margin-right-auto    { margin-right: auto; }`);
add(`.add-margin-x-auto        { margin-left: auto; margin-right: auto; }`);
add(`.add-margin-y-auto        { margin-top: auto; margin-bottom: auto; }`);

// Negative margins
add(`\n/* ── Negative Margin ── */`);
[1,2,4,8,12,16,20,24,32,40,48,64].forEach(v => {
  add(`.subtract-margin-${v}        { margin: -${v}px; }`);
  add(`.subtract-margin-top-${v}    { margin-top: -${v}px; }`);
  add(`.subtract-margin-bottom-${v} { margin-bottom: -${v}px; }`);
  add(`.subtract-margin-left-${v}   { margin-left: -${v}px; }`);
  add(`.subtract-margin-right-${v}  { margin-right: -${v}px; }`);
});

// Gap
add(`\n/* ── Gap ── */`);
spacing.forEach(v => {
  add(`.gap-${v}   { gap: ${v}px; }`);
  add(`.gap-x-${v} { column-gap: ${v}px; }`);
  add(`.gap-y-${v} { row-gap: ${v}px; }`);
});

// ─── SIZING ──────────────────────────────────────────────────────────────────
mod('sizing');
add(`\n/* ── Width ── */`);
spacing.forEach(v => add(`.set-width-${v} { width: ${v}px; }`));
[1,2,3,4,5,6,7,8,9,10,11,12].forEach(n => {
  [2,3,4,5,6,12].forEach(d => {
    if (n < d) {
      const pct = ((n/d)*100).toFixed(6).replace(/\.?0+$/, '');
      const cls = `set-width-${n}-of-${d}`;
      add(`.${cls} { width: ${pct}%; }`);
    }
  });
});
add(`.set-width-full   { width: 100%; }`);
add(`.set-width-screen { width: 100vw; }`);
add(`.set-width-auto   { width: auto; }`);
add(`.set-width-min    { width: min-content; }`);
add(`.set-width-max    { width: max-content; }`);
add(`.set-width-fit    { width: fit-content; }`);

add(`\n/* ── Height ── */`);
spacing.forEach(v => add(`.set-height-${v} { height: ${v}px; }`));
add(`.set-height-full   { height: 100%; }`);
add(`.set-height-screen { height: 100vh; }`);
add(`.set-height-auto   { height: auto; }`);
add(`.set-height-min    { height: min-content; }`);
add(`.set-height-max    { height: max-content; }`);
add(`.set-height-fit    { height: fit-content; }`);

add(`\n/* ── Min/Max Width/Height ── */`);
spacing.filter(v => v <= 512).forEach(v => {
  add(`.min-width-${v}  { min-width: ${v}px; }`);
  add(`.max-width-${v}  { max-width: ${v}px; }`);
  add(`.min-height-${v} { min-height: ${v}px; }`);
  add(`.max-height-${v} { max-height: ${v}px; }`);
});
add(`.min-width-full   { min-width: 100%; }`);
add(`.max-width-full   { max-width: 100%; }`);
add(`.min-width-screen { min-width: 100vw; }`);
add(`.max-width-screen { max-width: 100vw; }`);
add(`.min-height-full   { min-height: 100%; }`);
add(`.max-height-full   { max-height: 100%; }`);
add(`.min-height-screen { min-height: 100vh; }`);
add(`.max-height-screen { max-height: 100vh; }`);
add(`.min-width-none    { min-width: none; }`);
add(`.max-width-none    { max-width: none; }`);

// ─── BORDER ──────────────────────────────────────────────────────────────────
mod('borders');
add(`\n/* ── Border Width ── */`);
borderWidths.forEach(v => {
  add(`.add-border-${v}        { border: ${v}px solid; }`);
  add(`.add-border-top-${v}    { border-top: ${v}px solid; }`);
  add(`.add-border-bottom-${v} { border-bottom: ${v}px solid; }`);
  add(`.add-border-left-${v}   { border-left: ${v}px solid; }`);
  add(`.add-border-right-${v}  { border-right: ${v}px solid; }`);
  add(`.add-border-x-${v}      { border-left: ${v}px solid; border-right: ${v}px solid; }`);
  add(`.add-border-y-${v}      { border-top: ${v}px solid; border-bottom: ${v}px solid; }`);
});

add(`\n/* ── Border Style ── */
.border-solid  { border-style: solid; }
.border-dashed { border-style: dashed; }
.border-dotted { border-style: dotted; }
.border-double { border-style: double; }
.border-hidden { border-style: hidden; }
.border-none   { border-style: none; }

/* ── Border Radius ── */`);
radii.forEach(v => add(`.round-corners-${v} { border-radius: ${v}px; }`));
add(`.make-circle          { border-radius: 50%; }`);
add(`.make-pill            { border-radius: 9999px; }`);
add(`.round-top-${0}       { border-top-left-radius: 0; border-top-right-radius: 0; }`);
radii.filter(v=>v>0).forEach(v => {
  add(`.round-top-${v}    { border-top-left-radius: ${v}px; border-top-right-radius: ${v}px; }`);
  add(`.round-bottom-${v} { border-bottom-left-radius: ${v}px; border-bottom-right-radius: ${v}px; }`);
  add(`.round-left-${v}   { border-top-left-radius: ${v}px; border-bottom-left-radius: ${v}px; }`);
  add(`.round-right-${v}  { border-top-right-radius: ${v}px; border-bottom-right-radius: ${v}px; }`);
});

// ─── TYPOGRAPHY ──────────────────────────────────────────────────────────────
mod('typography');
add(`\n/* ── Font Size ── */`);
fontSizes.forEach(v => add(`.set-text-${v} { font-size: ${v}px; }`));

add(`\n/* ── Font Weight ── */
.text-thin        { font-weight: 100; }
.text-extra-light { font-weight: 200; }
.text-light       { font-weight: 300; }
.text-normal      { font-weight: 400; }
.text-medium      { font-weight: 500; }
.text-semibold    { font-weight: 600; }
.text-bold        { font-weight: 700; }
.text-extra-bold  { font-weight: 800; }
.text-black-weight{ font-weight: 900; }

/* ── Font Style ── */
.text-italic     { font-style: italic; }
.text-not-italic { font-style: normal; }

/* ── Font Family ── */
.font-sans  { font-family: var(--santy-font-sans); }
.font-serif { font-family: var(--santy-font-serif); }
.font-mono  { font-family: var(--santy-font-mono); }

/* ── Text Align ── */
.text-left    { text-align: left; }
.text-center  { text-align: center; }
.text-right   { text-align: right; }
.text-justify { text-align: justify; }
.text-start   { text-align: start; }
.text-end     { text-align: end; }

/* ── Text Decoration ── */
.text-underline      { text-decoration: underline; }
.text-overline       { text-decoration: overline; }
.text-strikethrough  { text-decoration: line-through; }
.text-no-decoration  { text-decoration: none; }

/* ── Text Transform ── */
.text-uppercase  { text-transform: uppercase; }
.text-lowercase  { text-transform: lowercase; }
.text-capitalize { text-transform: capitalize; }
.text-no-transform { text-transform: none; }

/* ── Text Overflow ── */
.text-truncate   { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.text-clip       { text-overflow: clip; }
.text-ellipsis   { text-overflow: ellipsis; }
.text-wrap       { white-space: normal; }
.text-nowrap     { white-space: nowrap; }
.text-pre        { white-space: pre; }
.text-pre-wrap   { white-space: pre-wrap; }
.text-pre-line   { white-space: pre-line; }
.text-break-word { word-break: break-word; overflow-wrap: break-word; }
.text-break-all  { word-break: break-all; }

/* ── Line Height ── */
.line-height-none  { line-height: 1; }
.line-height-tight { line-height: 1.25; }
.line-height-snug  { line-height: 1.375; }
.line-height-normal { line-height: 1.5; }
.line-height-relaxed { line-height: 1.625; }
.line-height-loose { line-height: 2; }
`);
lineHeights.forEach(v => {
  const name = String(v).replace('.', '-');
  add(`.line-height-${name} { line-height: ${v}; }`);
});

add(`\n/* ── Letter Spacing ── */`);
[-2,-1,0,1,2,4,6,8,10,12,16].forEach(v => {
  const cls = v < 0 ? `subtract-letter-space-${Math.abs(v)}` : `add-letter-space-${v}`;
  add(`.${cls} { letter-spacing: ${v}px; }`);
});
add(`.letter-space-tight  { letter-spacing: -0.05em; }`);
add(`.letter-space-snug   { letter-spacing: -0.025em; }`);
add(`.letter-space-normal { letter-spacing: 0em; }`);
add(`.letter-space-wide   { letter-spacing: 0.025em; }`);
add(`.letter-space-wider  { letter-spacing: 0.05em; }`);
add(`.letter-space-widest { letter-spacing: 0.1em; }`);

// ─── COLORS ──────────────────────────────────────────────────────────────────
mod('colors');
add(`\n/* ── Text Colors ── */`);
Object.entries(palette).forEach(([name, shades]) => {
  Object.entries(shades).forEach(([shade, hex]) => {
    add(`.color-${name}-${shade} { color: ${hex}; }`);
  });
});
Object.entries(namedColors).forEach(([name, val]) => add(`.color-${name} { color: ${val}; }`));

add(`\n/* ── Background Colors ── */`);
Object.entries(palette).forEach(([name, shades]) => {
  Object.entries(shades).forEach(([shade, hex]) => {
    add(`.background-${name}-${shade} { background-color: ${hex}; }`);
  });
});
Object.entries(namedColors).forEach(([name, val]) => add(`.background-${name} { background-color: ${val}; }`));

add(`\n/* ── Border Colors ── */`);
Object.entries(palette).forEach(([name, shades]) => {
  Object.entries(shades).forEach(([shade, hex]) => {
    add(`.border-color-${name}-${shade} { border-color: ${hex}; }`);
  });
});
Object.entries(namedColors).forEach(([name, val]) => add(`.border-color-${name} { border-color: ${val}; }`));

// ─── SEMANTIC COLOR UTILITIES (v2.7.0) ───
// Consume theme tokens — flip automatically with [data-theme="…"] or .dark
add(`
/* ── Semantic Colors (v2.7.0) — respond to [data-theme] / .dark ── */
.background-surface        { background-color: var(--santy-surface); }
.background-surface-alt    { background-color: var(--santy-surface-alt); }
.background-surface-raised { background-color: var(--santy-surface-raised); }
.background-primary        { background-color: var(--santy-primary); }
.background-secondary      { background-color: var(--santy-secondary); }
.background-accent         { background-color: var(--santy-accent, var(--santy-success)); }
.color-text                { color: var(--santy-text); }
.color-text-muted          { color: var(--santy-text-muted); }
.color-primary             { color: var(--santy-primary); }
.color-secondary           { color: var(--santy-secondary); }
.border-color-default      { border-color: var(--santy-border-color); }
.border-color-primary      { border-color: var(--santy-primary); }
/* Dark defaults for semantic tokens */
.dark, [data-theme="dark"] {
  --santy-surface:        #0f172a;
  --santy-surface-alt:    #1e293b;
  --santy-surface-raised: #1e293b;
  --santy-text:           #f1f5f9;
  --santy-text-muted:     #94a3b8;
  --santy-border-color:   #334155;
}
`);

add(`\n/* ── Fill (SVG) ── */`);
Object.entries(palette).forEach(([name, shades]) => {
  Object.entries(shades).forEach(([shade, hex]) => {
    add(`.fill-${name}-${shade} { fill: ${hex}; }`);
  });
});

add(`\n/* ── Stroke (SVG) ── */`);
Object.entries(palette).forEach(([name, shades]) => {
  Object.entries(shades).forEach(([shade, hex]) => {
    add(`.stroke-${name}-${shade} { stroke: ${hex}; }`);
  });
});

// ─── BACKGROUND ──────────────────────────────────────────────────────────────
add(`\n/* ── Background Position ── */
.bg-top         { background-position: top; }
.bg-bottom      { background-position: bottom; }
.bg-left        { background-position: left; }
.bg-right       { background-position: right; }
.bg-center      { background-position: center; }
.bg-top-left    { background-position: top left; }
.bg-top-right   { background-position: top right; }
.bg-bottom-left { background-position: bottom left; }
.bg-bottom-right{ background-position: bottom right; }

/* ── Background Repeat ── */
.bg-repeat       { background-repeat: repeat; }
.bg-no-repeat    { background-repeat: no-repeat; }
.bg-repeat-x     { background-repeat: repeat-x; }
.bg-repeat-y     { background-repeat: repeat-y; }
.bg-repeat-round { background-repeat: round; }
.bg-repeat-space { background-repeat: space; }

/* ── Background Size ── */
.bg-cover   { background-size: cover; }
.bg-contain { background-size: contain; }
.bg-auto    { background-size: auto; }

/* ── Background Attachment ── */
.bg-fixed   { background-attachment: fixed; }
.bg-local   { background-attachment: local; }
.bg-scroll-bg { background-attachment: scroll; }

/* ── Background Clip ── */
.bg-clip-border  { background-clip: border-box; }
.bg-clip-padding { background-clip: padding-box; }
.bg-clip-content { background-clip: content-box; }
.bg-clip-text    { background-clip: text; -webkit-background-clip: text; }

/* ── Gradients ── */
.gradient-to-right  { background-image: linear-gradient(to right, var(--grad-from, transparent), var(--grad-to, transparent)); }
.gradient-to-left   { background-image: linear-gradient(to left, var(--grad-from, transparent), var(--grad-to, transparent)); }
.gradient-to-top    { background-image: linear-gradient(to top, var(--grad-from, transparent), var(--grad-to, transparent)); }
.gradient-to-bottom { background-image: linear-gradient(to bottom, var(--grad-from, transparent), var(--grad-to, transparent)); }
.gradient-to-top-right    { background-image: linear-gradient(to top right, var(--grad-from, transparent), var(--grad-to, transparent)); }
.gradient-to-bottom-right { background-image: linear-gradient(to bottom right, var(--grad-from, transparent), var(--grad-to, transparent)); }
`);

// ─── POSITION ────────────────────────────────────────────────────────────────
mod('layout');
add(`\n/* ── Position ── */
.position-static   { position: static; }
.position-relative { position: relative; }
.position-absolute { position: absolute; }
.position-fixed    { position: fixed; }
.position-sticky   { position: sticky; }
`);
add(`\n/* ── Pin (top/bottom/left/right/inset) ── */`);
spacing.filter(v => v <= 200).forEach(v => {
  add(`.pin-top-${v}    { top: ${v}px; }`);
  add(`.pin-bottom-${v} { bottom: ${v}px; }`);
  add(`.pin-left-${v}   { left: ${v}px; }`);
  add(`.pin-right-${v}  { right: ${v}px; }`);
  add(`.pin-all-${v}    { top: ${v}px; right: ${v}px; bottom: ${v}px; left: ${v}px; }`);
});
add(`.pin-top-auto    { top: auto; }`);
add(`.pin-bottom-auto { bottom: auto; }`);
add(`.pin-left-auto   { left: auto; }`);
add(`.pin-right-auto  { right: auto; }`);
add(`.pin-center      { top: 50%; left: 50%; transform: translate(-50%, -50%); }`);
add(`.pin-center-x    { left: 50%; transform: translateX(-50%); }`);
add(`.pin-center-y    { top: 50%; transform: translateY(-50%); }`);
add(`.pin-top-full    { top: 100%; }`);
add(`.pin-bottom-full { bottom: 100%; }`);
add(`.pin-left-full   { left: 100%; }`);
add(`.pin-right-full  { right: 100%; }`);

// ─── Z-INDEX ─────────────────────────────────────────────────────────────────
add(`\n/* ── Layer (z-index) ── */`);
zIndexes.forEach(v => add(`.layer-${v} { z-index: ${v}; }`));
add(`.layer-auto { z-index: auto; }`);
// Standard z-* aliases
add(`\n/* ── Z-index (standard aliases) ── */
.z-0    { z-index: 0; }
.z-10   { z-index: 10; }
.z-20   { z-index: 20; }
.z-30   { z-index: 30; }
.z-40   { z-index: 40; }
.z-50   { z-index: 50; }
.z-100  { z-index: 100; }
.z-auto { z-index: auto; }`);

// ─── OVERFLOW ────────────────────────────────────────────────────────────────
add(`\n/* ── Overflow ── */
.overflow-auto    { overflow: auto; }
.overflow-hidden  { overflow: hidden; }
.overflow-scroll  { overflow: scroll; }
.overflow-visible { overflow: visible; }
.overflow-clip    { overflow: clip; }
.overflow-x-auto    { overflow-x: auto; }
.overflow-x-hidden  { overflow-x: hidden; }
.overflow-x-scroll  { overflow-x: scroll; }
.overflow-x-visible { overflow-x: visible; }
.overflow-y-auto    { overflow-y: auto; }
.overflow-y-hidden  { overflow-y: hidden; }
.overflow-y-scroll  { overflow-y: scroll; }
.overflow-y-visible { overflow-y: visible; }
`);

// ─── OPACITY ─────────────────────────────────────────────────────────────────
mod('effects');
add(`\n/* ── Opacity ── */`);
opacities.forEach(v => add(`.opacity-${v} { opacity: ${v / 100}; }`));

// ─── SHADOWS ─────────────────────────────────────────────────────────────────
add(`\n/* ── Box Shadow ── */
.add-shadow-sm  { box-shadow: var(--santy-shadow-sm); }
.add-shadow     { box-shadow: var(--santy-shadow); }
.add-shadow-md  { box-shadow: var(--santy-shadow-md); }
.add-shadow-lg  { box-shadow: var(--santy-shadow-lg); }
.add-shadow-xl  { box-shadow: var(--santy-shadow-xl); }
.add-shadow-inner { box-shadow: var(--santy-shadow-inner); }
.add-shadow-none  { box-shadow: none; }
.no-shadow        { box-shadow: none; }

/* ── Drop Shadow (filter) ── */
.drop-shadow-sm  { filter: drop-shadow(0 1px 1px rgba(0,0,0,0.05)); }
.drop-shadow     { filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1)); }
.drop-shadow-md  { filter: drop-shadow(0 4px 3px rgba(0,0,0,0.07)); }
.drop-shadow-lg  { filter: drop-shadow(0 10px 8px rgba(0,0,0,0.04)); }
.drop-shadow-xl  { filter: drop-shadow(0 20px 13px rgba(0,0,0,0.03)); }
.drop-shadow-none { filter: drop-shadow(0 0 #0000); }

/* ── Text Shadow ── */
.text-shadow-sm  { text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
.text-shadow     { text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
.text-shadow-lg  { text-shadow: 0 4px 8px rgba(0,0,0,0.4); }
.text-shadow-none{ text-shadow: none; }
`);

// ─── TRANSITION & ANIMATION ───────────────────────────────────────────────────
add(`\n/* ── Transition ── */
.transition-fast   { transition: var(--santy-transition-fast); }
.transition-normal { transition: var(--santy-transition-normal); }
.transition-slow   { transition: var(--santy-transition-slow); }
.transition-none   { transition: none; }
.transition-all    { transition: all 0.3s ease; } /* fixed v2.7.0 — was documented but missing */
.transition-shadow { transition: box-shadow 0.3s ease; }
.transition-colors { transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease; }
.transition-opacity{ transition: opacity 0.3s ease; }
.transition-transform{ transition: transform 0.3s ease; }

/* ── Transform ── */
.flip-horizontal  { transform: scaleX(-1); }
.flip-vertical    { transform: scaleY(-1); }
.rotate-45        { transform: rotate(45deg); }
.rotate-90        { transform: rotate(90deg); }
.rotate-135       { transform: rotate(135deg); }
.rotate-180       { transform: rotate(180deg); }
.rotate-270       { transform: rotate(270deg); }
.rotate-minus-45  { transform: rotate(-45deg); }
.rotate-minus-90  { transform: rotate(-90deg); }
.scale-75         { transform: scale(0.75); }
.scale-90         { transform: scale(0.90); }
.scale-95         { transform: scale(0.95); }
.scale-100        { transform: scale(1); }
.scale-105        { transform: scale(1.05); }
.scale-110        { transform: scale(1.10); }
.scale-125        { transform: scale(1.25); }
.scale-150        { transform: scale(1.50); }
.skew-x-3        { transform: skewX(3deg); }
.skew-x-6        { transform: skewX(6deg); }
.skew-x-12       { transform: skewX(12deg); }
.skew-y-3        { transform: skewY(3deg); }
.skew-y-6        { transform: skewY(6deg); }
.skew-y-12       { transform: skewY(12deg); }
.transform-origin-center      { transform-origin: center; }
.transform-origin-top         { transform-origin: top; }
.transform-origin-top-right   { transform-origin: top right; }
.transform-origin-right       { transform-origin: right; }
.transform-origin-bottom-right{ transform-origin: bottom right; }
.transform-origin-bottom      { transform-origin: bottom; }
.transform-origin-bottom-left { transform-origin: bottom left; }
.transform-origin-left        { transform-origin: left; }
.transform-origin-top-left    { transform-origin: top left; }

/* ── Animation ── */
.animate-spin     { animation: santy-spin 1s linear infinite; }
.animate-ping     { animation: santy-ping 1s cubic-bezier(0,0,0.2,1) infinite; }
.animate-pulse    { animation: santy-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
.animate-bounce   { animation: santy-bounce 1s infinite; }
.animate-fade-in  { animation: santy-fade-in 0.5s ease; }
.animate-fade-out { animation: santy-fade-out 0.5s ease; }
.animate-slide-up { animation: santy-slide-up 0.4s ease; }
.animate-slide-down { animation: santy-slide-down 0.4s ease; }
.animate-zoom-in  { animation: santy-zoom-in 0.3s ease; }
.animation-paused { animation-play-state: paused; }
.animation-none   { animation: none; }

@keyframes santy-spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes santy-ping    { 75%, 100% { transform: scale(2); opacity: 0; } }
@keyframes santy-pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes santy-bounce  { 0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); } 50% { transform: translateY(0); animation-timing-function: cubic-bezier(0,0,0.2,1); } }
@keyframes santy-fade-in  { from { opacity: 0; } to { opacity: 1; } }
@keyframes santy-fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes santy-slide-up   { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes santy-slide-down { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes santy-zoom-in    { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
`);

// ─── CURSOR ───────────────────────────────────────────────────────────────────
add(`\n/* ── Cursor ── */
.cursor-auto        { cursor: auto; }
.cursor-default     { cursor: default; }
.cursor-pointer     { cursor: pointer; }
.cursor-wait        { cursor: wait; }
.cursor-text        { cursor: text; }
.cursor-move        { cursor: move; }
.cursor-not-allowed { cursor: not-allowed; }
.cursor-crosshair   { cursor: crosshair; }
.cursor-grab        { cursor: grab; }
.cursor-grabbing    { cursor: grabbing; }
.cursor-zoom-in     { cursor: zoom-in; }
.cursor-zoom-out    { cursor: zoom-out; }
.cursor-help        { cursor: help; }
.cursor-none        { cursor: none; }
`);

// ─── OBJECT FIT / POSITION ────────────────────────────────────────────────────
mod('layout');
add(`\n/* ── Object Fit ── */
.fit-cover   { object-fit: cover; }
.fit-contain { object-fit: contain; }
.fit-fill    { object-fit: fill; }
.fit-none    { object-fit: none; }
.fit-scale   { object-fit: scale-down; }
/* Standard object-fit-* aliases */
.object-fit-cover   { object-fit: cover; }
.object-fit-contain { object-fit: contain; }
.object-fit-fill    { object-fit: fill; }
.object-fit-none    { object-fit: none; }
.object-fit-scale   { object-fit: scale-down; }

/* ── Object Position ── */
.object-top              { object-position: top; }
.object-bottom           { object-position: bottom; }
.object-left             { object-position: left; }
.object-right            { object-position: right; }
.object-center           { object-position: center; }
.object-position-top     { object-position: top; }
.object-position-bottom  { object-position: bottom; }
.object-position-center  { object-position: center; }
.object-position-left    { object-position: left; }
.object-position-right   { object-position: right; }
`);

// ─── ASPECT RATIO ─────────────────────────────────────────────────────────────
add(`\n/* ── Aspect Ratio ── */
.ratio-square      { aspect-ratio: 1 / 1; }
.ratio-video       { aspect-ratio: 16 / 9; }
.ratio-portrait    { aspect-ratio: 9 / 16; }
.ratio-4-3         { aspect-ratio: 4 / 3; }
.ratio-3-2         { aspect-ratio: 3 / 2; }
.ratio-21-9        { aspect-ratio: 21 / 9; }
.ratio-auto        { aspect-ratio: auto; }
/* Standard aspect-ratio-* aliases */
.aspect-ratio-1-1  { aspect-ratio: 1 / 1; }
.aspect-ratio-16-9 { aspect-ratio: 16 / 9; }
.aspect-ratio-4-3  { aspect-ratio: 4 / 3; }
.aspect-ratio-3-2  { aspect-ratio: 3 / 2; }
.aspect-ratio-9-16 { aspect-ratio: 9 / 16; }
.aspect-square     { aspect-ratio: 1 / 1; }
.aspect-video      { aspect-ratio: 16 / 9; }
`);

// ─── FILTER ───────────────────────────────────────────────────────────────────
mod('effects');
add(`\n/* ── Filter ── */
.blur-sm  { filter: blur(4px); }
.blur     { filter: blur(8px); }
.blur-md  { filter: blur(12px); }
.blur-lg  { filter: blur(16px); }
.blur-xl  { filter: blur(24px); }
.blur-none{ filter: blur(0); }
.brightness-50  { filter: brightness(0.5); }
.brightness-75  { filter: brightness(0.75); }
.brightness-90  { filter: brightness(0.9); }
.brightness-100 { filter: brightness(1); }
.brightness-110 { filter: brightness(1.1); }
.brightness-125 { filter: brightness(1.25); }
.brightness-150 { filter: brightness(1.5); }
.brightness-200 { filter: brightness(2); }
.contrast-50    { filter: contrast(0.5); }
.contrast-75    { filter: contrast(0.75); }
.contrast-100   { filter: contrast(1); }
.contrast-125   { filter: contrast(1.25); }
.contrast-150   { filter: contrast(1.5); }
.contrast-200   { filter: contrast(2); }
.grayscale      { filter: grayscale(100%); }
.grayscale-0    { filter: grayscale(0); }
.sepia          { filter: sepia(100%); }
.sepia-0        { filter: sepia(0); }
.invert         { filter: invert(100%); }
.invert-0       { filter: invert(0); }
.saturate-0     { filter: saturate(0); }
.saturate-50    { filter: saturate(0.5); }
.saturate-100   { filter: saturate(1); }
.saturate-150   { filter: saturate(1.5); }
.saturate-200   { filter: saturate(2); }
.hue-rotate-30  { filter: hue-rotate(30deg); }
.hue-rotate-60  { filter: hue-rotate(60deg); }
.hue-rotate-90  { filter: hue-rotate(90deg); }
.hue-rotate-180 { filter: hue-rotate(180deg); }
`);

// ─── POINTER / USER-SELECT ────────────────────────────────────────────────────
add(`\n/* ── Pointer Events ── */
.pointer-none         { pointer-events: none; }
.pointer-auto         { pointer-events: auto; }
.pointer-all          { pointer-events: all; }
/* Standard pointer-events-* aliases */
.pointer-events-none  { pointer-events: none; }
.pointer-events-auto  { pointer-events: auto; }

/* ── User Select ── */
.select-none  { user-select: none; }
.select-text  { user-select: text; }
.select-all   { user-select: all; }
.select-auto  { user-select: auto; }

/* ── Resize ── */
.resize-none { resize: none; }
.resize      { resize: both; }
.resize-x    { resize: horizontal; }
.resize-y    { resize: vertical; }

/* ── Appearance ── */
.appearance-none { appearance: none; -webkit-appearance: none; }
.appearance-auto { appearance: auto; }

/* ── Outline ── */
.outline-none     { outline: none; }
.outline          { outline: 2px solid currentColor; }
.outline-dashed   { outline: 2px dashed currentColor; }
.outline-offset-2 { outline-offset: 2px; }
.outline-offset-4 { outline-offset: 4px; }

/* ── List Style ── */
.list-none   { list-style-type: none; padding-left: 0; }
.list-disc   { list-style-type: disc; }
.list-decimal{ list-style-type: decimal; }
.list-inside { list-style-position: inside; }
.list-outside{ list-style-position: outside; }

/* ── Table ── */
.table-auto    { table-layout: auto; }
.table-fixed   { table-layout: fixed; }
.border-collapse{ border-collapse: collapse; }
.border-separate{ border-collapse: separate; }

/* ── Columns ── */
.columns-auto { columns: auto; }
`);
[1,2,3,4,5,6].forEach(n => add(`.columns-${n} { columns: ${n}; }`));

add(`\n/* ── Screen Reader Only ── */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border-width: 0;
}
.not-sr-only {
  position: static;
  width: auto;
  height: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* ── Break ── */
.break-before-auto   { break-before: auto; }
.break-before-always { break-before: always; }
.break-before-avoid  { break-before: avoid; }
.break-after-auto    { break-after: auto; }
.break-after-always  { break-after: always; }
.break-after-avoid   { break-after: avoid; }
.break-inside-auto   { break-inside: auto; }
.break-inside-avoid  { break-inside: avoid; }

/* ── Isolation ── */
.isolate          { isolation: isolate; }
.isolation-auto   { isolation: auto; }

/* ── Mix Blend Mode ── */
.blend-normal      { mix-blend-mode: normal; }
.blend-multiply    { mix-blend-mode: multiply; }
.blend-screen      { mix-blend-mode: screen; }
.blend-overlay     { mix-blend-mode: overlay; }
.blend-darken      { mix-blend-mode: darken; }
.blend-lighten     { mix-blend-mode: lighten; }
.blend-difference  { mix-blend-mode: difference; }
.blend-exclusion   { mix-blend-mode: exclusion; }
.blend-hue         { mix-blend-mode: hue; }
.blend-saturation  { mix-blend-mode: saturation; }
.blend-color       { mix-blend-mode: color; }
.blend-luminosity  { mix-blend-mode: luminosity; }

/* ── Will Change ── */
.will-change-auto      { will-change: auto; }
.will-change-scroll    { will-change: scroll-position; }
.will-change-contents  { will-change: contents; }
.will-change-transform { will-change: transform; }
`);

// ─── RESPONSIVE BREAKPOINTS ───────────────────────────────────────────────────
mod('variants');
const breakpoints = {
  'on-mobile':  '(max-width: 639px)',
  'on-tablet':  '(min-width: 640px) and (max-width: 1023px)',
  'on-desktop': '(min-width: 1024px)',
  'on-wide':    '(min-width: 1280px)',
  'on-ultra':   '(min-width: 1536px)',
  'sm':  '(min-width: 640px)',
  'md':  '(min-width: 768px)',
  'lg':  '(min-width: 1024px)',
  'xl':  '(min-width: 1280px)',
  'xxl': '(min-width: 1536px)',
};
Object.assign(breakpoints, userConfig.breakpoints || {});

// Responsive variants for the most commonly needed classes
const responsiveClasses = [
  // Display
  ['make-block','display:block'],['make-inline','display:inline'],['make-inline-block','display:inline-block'],
  ['make-flex','display:flex'],['make-grid','display:grid'],['make-hidden','display:none'],
  // Flex
  ['flex-row','flex-direction:row'],['flex-column','flex-direction:column'],
  ['flex-wrap','flex-wrap:wrap'],['flex-nowrap','flex-wrap:nowrap'],
  ['align-center','align-items:center'],['align-start','align-items:flex-start'],['align-end','align-items:flex-end'],
  ['justify-center','justify-content:center'],['justify-between','justify-content:space-between'],
  ['justify-start','justify-content:flex-start'],['justify-end','justify-content:flex-end'],
  // Text align
  ['text-left','text-align:left'],['text-center','text-align:center'],['text-right','text-align:right'],
];
// Responsive spacing for common values
const respSpacing = [0,4,8,12,16,20,24,32,40,48,64];
respSpacing.forEach(v => {
  responsiveClasses.push([`add-padding-${v}`,`padding:${v}px`]);
  responsiveClasses.push([`add-padding-x-${v}`,`padding-left:${v}px;padding-right:${v}px`]);
  responsiveClasses.push([`add-padding-y-${v}`,`padding-top:${v}px;padding-bottom:${v}px`]);
  responsiveClasses.push([`add-margin-${v}`,`margin:${v}px`]);
  responsiveClasses.push([`add-margin-x-${v}`,`margin-left:${v}px;margin-right:${v}px`]);
  responsiveClasses.push([`add-margin-y-${v}`,`margin-top:${v}px;margin-bottom:${v}px`]);
  responsiveClasses.push([`gap-${v}`,`gap:${v}px`]);
});
// Responsive grid cols
gridCols.forEach(n => {
  responsiveClasses.push([`grid-cols-${n}`,`grid-template-columns:repeat(${n},minmax(0,1fr))`]);
});
// Responsive font sizes
[12,14,16,18,20,24,28,32,36,40,48,56,64].forEach(v => {
  responsiveClasses.push([`set-text-${v}`,`font-size:${v}px`]);
});
// Responsive widths
['full','auto','screen'].forEach(v => {
  const val = v === 'full' ? '100%' : v === 'screen' ? '100vw' : 'auto';
  responsiveClasses.push([`set-width-${v}`,`width:${val}`]);
});
respSpacing.forEach(v => {
  responsiveClasses.push([`set-width-${v}`,`width:${v}px`]);
  responsiveClasses.push([`set-height-${v}`,`height:${v}px`]);
});

add(`\n/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE VARIANTS
   Usage: class="on-mobile:make-hidden md:make-flex lg:grid-cols-3"
   ═══════════════════════════════════════════════════════════════ */`);

// All responsive breakpoints live in santy-variants.css only.
// santy-core.css and santy-start.css ship zero breakpoint variants by design.
const startBreakpoints = new Set([]);
Object.entries(breakpoints).forEach(([prefix, mq]) => {
  const isStart = startBreakpoints.has(prefix);
  if (!isStart) add(`\n/* ═══ VARIANTS_BLOCK_START ═══ */`);
  add(`\n@media ${mq} {`);
  responsiveClasses.forEach(([cls, props]) => {
    add(`  .${prefix}\\:${cls} { ${props.split(';').map(p=>p.trim()+';').join(' ')} }`);
  });
  add(`}`);
  if (!isStart) add(`/* ═══ VARIANTS_BLOCK_END ═══ */`);
});

// ─── DARK MODE ────────────────────────────────────────────────────────────────
add(`\n/* ═══════════════════════════════════════════════════════════════
   DARK MODE VARIANTS
   Usage: class="dark:background-gray-900 dark:color-white"
   ═══════════════════════════════════════════════════════════════ */`);
add(`@media (prefers-color-scheme: dark) {`);
const darkClasses = [
  ['background-white','background-color:#ffffff'],
  ['background-black','background-color:#000000'],
  ['color-white','color:#ffffff'],
  ['color-black','color:#000000'],
];
Object.entries(palette).forEach(([name, shades]) => {
  Object.entries(shades).forEach(([shade, hex]) => {
    darkClasses.push([`background-${name}-${shade}`, `background-color:${hex}`]);
    darkClasses.push([`color-${name}-${shade}`, `color:${hex}`]);
    darkClasses.push([`border-color-${name}-${shade}`, `border-color:${hex}`]);
  });
});
darkClasses.forEach(([cls, prop]) => {
  add(`  .dark\\:${cls} { ${prop}; }`);
});
add(`}`);

// ─── HOVER / FOCUS / ACTIVE VARIANTS ─────────────────────────────────────────
add(`\n/* ═══════════════════════════════════════════════════════════════
   STATE VARIANTS (hover, focus, active, disabled, group-hover)
   Usage: class="on-hover:background-blue-500 on-focus:outline-none"
   ═══════════════════════════════════════════════════════════════ */`);

const stateVariants = [
  ['on-hover', ':hover'],
  ['on-focus', ':focus'],
  ['on-active', ':active'],
  ['on-disabled', ':disabled'],
  ['on-checked', ':checked'],
  ['on-first', ':first-child'],
  ['on-last', ':last-child'],
  ['on-odd', ':nth-child(odd)'],
  ['on-even', ':nth-child(even)'],
  ['on-placeholder', '::placeholder'],
  ['on-focus-within', ':focus-within'],
  ['on-focus-visible', ':focus-visible'],
];

// Common classes for state variants
const stateClasses = [];
// Colors
Object.entries(palette).forEach(([name, shades]) => {
  [300,400,500,600,700].forEach(shade => {
    if (shades[shade]) {
      stateClasses.push([`background-${name}-${shade}`, `background-color:${shades[shade]}`]);
      stateClasses.push([`color-${name}-${shade}`, `color:${shades[shade]}`]);
      stateClasses.push([`border-color-${name}-${shade}`, `border-color:${shades[shade]}`]);
    }
  });
});
// Shadows
stateClasses.push(['add-shadow-sm','box-shadow:var(--santy-shadow-sm)']);
stateClasses.push(['add-shadow','box-shadow:var(--santy-shadow)']);
stateClasses.push(['add-shadow-md','box-shadow:var(--santy-shadow-md)']);
stateClasses.push(['add-shadow-lg','box-shadow:var(--santy-shadow-lg)']);
stateClasses.push(['no-shadow','box-shadow:none']);
// Opacity
[0,25,50,75,100].forEach(v => stateClasses.push([`opacity-${v}`,`opacity:${v/100}`]));
// Transforms
['scale-90','scale-95','scale-100','scale-105','scale-110'].forEach(cls => {
  const v = parseFloat(cls.split('-')[1])/100;
  stateClasses.push([cls, `transform:scale(${v})`]);
});
// Display
stateClasses.push(['make-hidden','display:none']);
stateClasses.push(['make-block','display:block']);
stateClasses.push(['make-flex','display:flex']);
// Cursor
stateClasses.push(['cursor-pointer','cursor:pointer']);
stateClasses.push(['cursor-not-allowed','cursor:not-allowed']);
// Misc
stateClasses.push(['outline-none','outline:none']);
stateClasses.push(['text-underline','text-decoration:underline']);
stateClasses.push(['text-no-decoration','text-decoration:none']);
stateClasses.push(['text-bold','font-weight:700']);
stateClasses.push(['transition-fast','transition:var(--santy-transition-fast)']);
stateClasses.push(['transition-normal','transition:var(--santy-transition-normal)']);
// Border
[1,2,4].forEach(v => {
  stateClasses.push([`add-border-${v}`, `border:${v}px solid`]);
});

const startStateVariants = new Set(['on-hover', 'on-focus']);
stateVariants.forEach(([prefix, pseudo]) => {
  const isStart = startStateVariants.has(prefix);
  if (!isStart) add(`\n/* ═══ VARIANTS_BLOCK_START ═══ */`);
  add(`\n/* ${prefix} */`);
  stateClasses.forEach(([cls, prop]) => {
    add(`.${prefix}\\:${cls}${pseudo} { ${prop}; }`);
  });
  if (!isStart) add(`/* ═══ VARIANTS_BLOCK_END ═══ */`);
});

// Group hover
add(`\n/* ═══ VARIANTS_BLOCK_START ═══ */`);
add(`\n/* ── Group Hover ── */\n/* Add class="group" to parent, then use group-hover: on children */`);
stateClasses.forEach(([cls, prop]) => {
  add(`.group:hover .group-hover\\:${cls} { ${prop}; }`);
});
add(`/* ═══ VARIANTS_BLOCK_END ═══ */`);

// ─── PRINT ────────────────────────────────────────────────────────────────────
add(`\n/* ═══ VARIANTS_BLOCK_START ═══ */`);
add(`\n/* ── Print Utilities ── */\n@media print {\n  .print\\:hidden { display: none; }\n  .print\\:block  { display: block; }\n  .print\\:no-shadow { box-shadow: none !important; }\n}\n`);
add(`/* ═══ VARIANTS_BLOCK_END ═══ */`);

// ─── MISSING UTILITIES ────────────────────────────────────────────────────────
add(`
/* ── Backdrop Filter ── */
.backdrop-blur-none { backdrop-filter: blur(0); -webkit-backdrop-filter: blur(0); }
.backdrop-blur-sm   { backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
.backdrop-blur      { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.backdrop-blur-md   { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
.backdrop-blur-lg   { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
.backdrop-blur-xl   { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
.backdrop-blur-2xl  { backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); }
.backdrop-blur-3xl  { backdrop-filter: blur(64px); -webkit-backdrop-filter: blur(64px); }
.backdrop-brightness-50  { backdrop-filter: brightness(0.5); -webkit-backdrop-filter: brightness(0.5); }
.backdrop-brightness-75  { backdrop-filter: brightness(0.75); -webkit-backdrop-filter: brightness(0.75); }
.backdrop-brightness-110 { backdrop-filter: brightness(1.1); -webkit-backdrop-filter: brightness(1.1); }

/* ── Ring (Focus Rings) ── */
.ring-0 { box-shadow: 0 0 0 0px var(--santy-primary); }
.ring-1 { box-shadow: 0 0 0 1px var(--santy-primary); }
.ring-2 { box-shadow: 0 0 0 2px var(--santy-primary); }
.ring-4 { box-shadow: 0 0 0 4px var(--santy-primary); }
.ring-8 { box-shadow: 0 0 0 8px var(--santy-primary); }
.ring-inset { --ring-inset: inset; }
.ring-blue   { box-shadow: 0 0 0 3px rgba(59,130,246,.4); }
.ring-green  { box-shadow: 0 0 0 3px rgba(34,197,94,.4); }
.ring-red    { box-shadow: 0 0 0 3px rgba(239,68,68,.4); }
.ring-yellow { box-shadow: 0 0 0 3px rgba(234,179,8,.4); }
.ring-purple { box-shadow: 0 0 0 3px rgba(139,92,246,.4); }
/* Ring offset */
.ring-offset-1 { box-shadow: 0 0 0 1px #fff, 0 0 0 3px var(--santy-primary); }
.ring-offset-2 { box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--santy-primary); }
.ring-offset-4 { box-shadow: 0 0 0 4px #fff, 0 0 0 6px var(--santy-primary); }

/* ── Gradient Color Stops ── */
.from-transparent { --grad-from: transparent; }
.from-white       { --grad-from: #ffffff; }
.from-black       { --grad-from: #000000; }
.from-gray-100    { --grad-from: #f3f4f6; }
.from-gray-900    { --grad-from: #111827; }
.from-blue-400    { --grad-from: #60a5fa; }
.from-blue-500    { --grad-from: #3b82f6; }
.from-blue-600    { --grad-from: #2563eb; }
.from-indigo-500  { --grad-from: #6366f1; }
.from-purple-500  { --grad-from: #a855f7; }
.from-purple-600  { --grad-from: #9333ea; }
.from-pink-500    { --grad-from: #ec4899; }
.from-rose-500    { --grad-from: #f43f5e; }
.from-red-500     { --grad-from: #ef4444; }
.from-orange-500  { --grad-from: #f97316; }
.from-amber-400   { --grad-from: #fbbf24; }
.from-yellow-400  { --grad-from: #facc15; }
.from-green-400   { --grad-from: #4ade80; }
.from-green-500   { --grad-from: #22c55e; }
.from-teal-500    { --grad-from: #14b8a6; }
.from-cyan-400    { --grad-from: #22d3ee; }
.from-sky-400     { --grad-from: #38bdf8; }
.from-sky-500     { --grad-from: #0ea5e9; }
.to-transparent   { --grad-to: transparent; }
.to-white         { --grad-to: #ffffff; }
.to-black         { --grad-to: #000000; }
.to-gray-100      { --grad-to: #f3f4f6; }
.to-gray-900      { --grad-to: #111827; }
.to-blue-400      { --grad-to: #60a5fa; }
.to-blue-500      { --grad-to: #3b82f6; }
.to-blue-600      { --grad-to: #2563eb; }
.to-indigo-500    { --grad-to: #6366f1; }
.to-purple-500    { --grad-to: #a855f7; }
.to-purple-600    { --grad-to: #9333ea; }
.to-pink-500      { --grad-to: #ec4899; }
.to-rose-500      { --grad-to: #f43f5e; }
.to-red-500       { --grad-to: #ef4444; }
.to-orange-500    { --grad-to: #f97316; }
.to-amber-400     { --grad-to: #fbbf24; }
.to-yellow-400    { --grad-to: #facc15; }
.to-green-400     { --grad-to: #4ade80; }
.to-green-500     { --grad-to: #22c55e; }
.to-teal-500      { --grad-to: #14b8a6; }
.to-cyan-400      { --grad-to: #22d3ee; }
.to-sky-400       { --grad-to: #38bdf8; }
.to-sky-500       { --grad-to: #0ea5e9; }

/* ── Text Wrap ── */
.text-wrap    { text-wrap: wrap; white-space: normal; }
.text-nowrap  { text-wrap: nowrap; white-space: nowrap; }
.text-balance { text-wrap: balance; }
.text-pretty  { text-wrap: pretty; }

/* ── Word Break / Overflow Wrap ── */
.word-break-normal { word-break: normal; overflow-wrap: normal; }
.word-break-all    { word-break: break-all; }
.word-break-words  { overflow-wrap: break-word; word-break: break-word; }
.word-break-keep   { word-break: keep-all; }
.truncate          { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.text-ellipsis     { text-overflow: ellipsis; }
.text-clip         { text-overflow: clip; }

/* ── Space Between (auto margin between siblings) ── */
.space-x-0  > * + * { margin-left: 0; }
.space-x-1  > * + * { margin-left: 4px; }
.space-x-2  > * + * { margin-left: 8px; }
.space-x-3  > * + * { margin-left: 12px; }
.space-x-4  > * + * { margin-left: 16px; }
.space-x-5  > * + * { margin-left: 20px; }
.space-x-6  > * + * { margin-left: 24px; }
.space-x-8  > * + * { margin-left: 32px; }
.space-x-10 > * + * { margin-left: 40px; }
.space-x-12 > * + * { margin-left: 48px; }
.space-x-16 > * + * { margin-left: 64px; }
.space-y-0  > * + * { margin-top: 0; }
.space-y-1  > * + * { margin-top: 4px; }
.space-y-2  > * + * { margin-top: 8px; }
.space-y-3  > * + * { margin-top: 12px; }
.space-y-4  > * + * { margin-top: 16px; }
.space-y-5  > * + * { margin-top: 20px; }
.space-y-6  > * + * { margin-top: 24px; }
.space-y-8  > * + * { margin-top: 32px; }
.space-y-10 > * + * { margin-top: 40px; }
.space-y-12 > * + * { margin-top: 48px; }
.space-y-16 > * + * { margin-top: 64px; }

/* ── Divide (borders between children) ── */
.divide-x > * + * { border-left: 1px solid #e5e7eb; }
.divide-x-2 > * + * { border-left: 2px solid #e5e7eb; }
.divide-y > * + * { border-top: 1px solid #e5e7eb; }
.divide-y-2 > * + * { border-top: 2px solid #e5e7eb; }
.divide-white > * + * { border-color: #fff; }
.divide-gray > * + * { border-color: #d1d5db; }
.divide-gray-dark > * + * { border-color: #374151; }

/* ── Content (::before / ::after) ── */
.content-none    { content: none; }
.content-empty   { content: ''; }
.content-open    { content: open-quote; }
.content-close   { content: close-quote; }

/* ── Will Change ── */
.will-change-opacity { will-change: opacity; }

/* ── Text Gradient ── */
.text-gradient-blue-purple {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.text-gradient-green-teal {
  background: linear-gradient(135deg, #22c55e, #14b8a6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.text-gradient-orange-red {
  background: linear-gradient(135deg, #f97316, #ef4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.text-gradient-pink-rose {
  background: linear-gradient(135deg, #ec4899, #f43f5e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.text-gradient-sky-blue {
  background: linear-gradient(135deg, #38bdf8, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

`);

add(`\n/* ═══ VARIANTS_BLOCK_START ═══ */`);
add(`
/* ── RTL / Logical Properties ── */
.ps-0  { padding-inline-start: 0; }
.ps-4  { padding-inline-start: 4px; }
.ps-8  { padding-inline-start: 8px; }
.ps-12 { padding-inline-start: 12px; }
.ps-16 { padding-inline-start: 16px; }
.ps-20 { padding-inline-start: 20px; }
.ps-24 { padding-inline-start: 24px; }
.ps-32 { padding-inline-start: 32px; }
.pe-0  { padding-inline-end: 0; }
.pe-4  { padding-inline-end: 4px; }
.pe-8  { padding-inline-end: 8px; }
.pe-12 { padding-inline-end: 12px; }
.pe-16 { padding-inline-end: 16px; }
.pe-20 { padding-inline-end: 20px; }
.pe-24 { padding-inline-end: 24px; }
.pe-32 { padding-inline-end: 32px; }
.ms-auto { margin-inline-start: auto; }
.me-auto { margin-inline-end: auto; }
.border-start-1 { border-inline-start: 1px solid; }
.border-start-2 { border-inline-start: 2px solid; }
.border-start-4 { border-inline-start: 4px solid; }
.border-end-1   { border-inline-end: 1px solid; }
.border-end-2   { border-inline-end: 2px solid; }
.border-end-4   { border-inline-end: 4px solid; }
.start-0  { inset-inline-start: 0; }
.end-0    { inset-inline-end: 0; }
.start-auto { inset-inline-start: auto; }
.end-auto   { inset-inline-end: auto; }
`);
add(`/* ═══ VARIANTS_BLOCK_END ═══ */`);

// ─── PEER VARIANTS ───────────────────────────────────────────────────────────
add(`\n/* ═══ VARIANTS_BLOCK_START ═══ */`);
// peer: mark an input as peer, then target siblings with peer-*:
add(`\n/* ── Peer Variants ── */
/* Usage: add class="peer" to input, then class="peer-checked:make-block" to sibling */`);
const peerClasses = [
  ['make-block','display:block'],['make-hidden','display:none'],['make-flex','display:flex'],
  ['opacity-100','opacity:1'],['opacity-0','opacity:0'],
  ['color-blue-600','color:#2563eb'],['color-gray-500','color:#6b7280'],
  ['border-blue-500','border-color:#3b82f6'],
  ['background-blue-50','background-color:#eff6ff'],
  ['background-green-50','background-color:#f0fdf4'],
  ['translate-x-full','transform:translateX(100%)'],
  ['translate-x-0','transform:translateX(0)'],
];
peerClasses.forEach(([cls, prop]) => {
  add(`.peer:hover ~ .peer-hover\\:${cls} { ${prop}; }`);
  add(`.peer:focus ~ .peer-focus\\:${cls} { ${prop}; }`);
  add(`.peer:checked ~ .peer-checked\\:${cls} { ${prop}; }`);
  add(`.peer:disabled ~ .peer-disabled\\:${cls} { ${prop}; }`);
});

// ─── MOTION VARIANTS ─────────────────────────────────────────────────────────
add(`\n/* ── Motion Variants ── */
@media (prefers-reduced-motion: no-preference) {
  .motion-safe\\:animate-spin    { animation: santy-spin 1s linear infinite; }
  .motion-safe\\:animate-bounce  { animation: santy-bounce 1s infinite; }
  .motion-safe\\:animate-pulse   { animation: santy-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
  .motion-safe\\:transition-fast { transition: var(--santy-transition-fast); }
  .motion-safe\\:transition-normal{ transition: var(--santy-transition-normal); }
}
@media (prefers-reduced-motion: reduce) {
  .motion-reduce\\:animate-none  { animation: none !important; }
  .motion-reduce\\:transition-none{ transition: none !important; }
}
`);
add(`/* ═══ VARIANTS_BLOCK_END ═══ */`);

// ─── :has() PARENT VARIANTS (v2.7.0) ─────────────────────────────────────────
// Style a PARENT based on its children — no JS needed.
add(`\n/* ── :has() Parent Variants (v2.7.0) ──
   Style a parent element based on the state of its children.
   Usage: class="has-checked:background-blue-50 has-focus:add-shadow-md" */`);
const hasVariants = [
  ['has-checked',  ':has(:checked)'],
  ['has-focus',    ':has(:focus)'],
  ['has-focus-within', ':has(:focus-within)'],
  ['has-hover',    ':has(:hover)'],
  ['has-invalid',  ':has(:invalid)'],
  ['has-valid',    ':has(:valid)'],
  ['has-disabled', ':has(:disabled)'],
  ['has-required', ':has(:required)'],
  ['has-open',     ':has([open])'],
  ['has-placeholder-shown', ':has(:placeholder-shown)'],
];
hasVariants.forEach(([prefix, pseudo]) => {
  add(`\n/* ${prefix} */`);
  stateClasses.forEach(([cls, prop]) => {
    add(`.${prefix}\\:${cls}${pseudo} { ${prop}; }`);
  });
});
// group-has: — style a child when the marked ancestor .group contains a match
['checked','focus','hover','invalid'].forEach(state => {
  add(`\n/* group-has-${state} */`);
  [
    ['make-block','display:block'],['make-hidden','display:none'],
    ['opacity-100','opacity:1'],['opacity-0','opacity:0'],
    ['color-blue-600','color:#2563eb'],
    ['background-blue-50','background-color:#eff6ff'],
    ['border-color-blue-500','border-color:#3b82f6'],
  ].forEach(([cls, prop]) => {
    add(`.group:has(:${state}) .group-has-${state}\\:${cls} { ${prop}; }`);
  });
});

// ─── EXTRA STATE VARIANTS ────────────────────────────────────────────────────
add(`\n/* ═══ VARIANTS_BLOCK_START ═══ */`);
add(`\n/* ── Extra State Variants ── */`);
const extraStateVariants = [
  ['on-visited',  ':visited'],
  ['on-required', ':required'],
  ['on-optional', ':optional'],
  ['on-invalid',  ':invalid'],
  ['on-valid',    ':valid'],
  ['on-empty',    ':empty'],
  ['on-open',     '[open]'],
  ['on-checked',  ':checked'],
  ['on-indeterminate', ':indeterminate'],
  ['on-placeholder-shown', ':placeholder-shown'],
  ['on-autofill', ':-webkit-autofill'],
  ['on-read-only', ':read-only'],
  ['on-read-write', ':read-write'],
];
const extraStateClasses = [
  ['color-blue-600','color:#2563eb'],['color-red-600','color:#dc2626'],
  ['color-green-600','color:#16a34a'],['color-gray-500','color:#6b7280'],
  ['border-blue-500','border-color:#3b82f6'],['border-red-500','border-color:#ef4444'],
  ['border-green-500','border-color:#22c55e'],
  ['background-blue-50','background-color:#eff6ff'],
  ['background-red-50','background-color:#fef2f2'],
  ['background-green-50','background-color:#f0fdf4'],
  ['opacity-100','opacity:1'],['opacity-75','opacity:0.75'],['opacity-50','opacity:0.5'],
  ['ring-blue','box-shadow:0 0 0 3px rgba(59,130,246,.4)'],
  ['ring-red','box-shadow:0 0 0 3px rgba(239,68,68,.4)'],
  ['ring-green','box-shadow:0 0 0 3px rgba(34,197,94,.4)'],
  ['make-block','display:block'],['make-hidden','display:none'],
];
extraStateVariants.forEach(([prefix, pseudo]) => {
  add(`\n/* ${prefix} */`);
  extraStateClasses.forEach(([cls, prop]) => {
    add(`.${prefix}\\:${cls}${pseudo} { ${prop}; }`);
  });
});
add(`/* ═══ VARIANTS_BLOCK_END ═══ */`);

// ─── ARIA VARIANTS ───────────────────────────────────────────────────────────
// Style elements based on ARIA state — great for accessible tabs, accordions,
// menus. Usage: class="aria-expanded:rotate-180 aria-selected:background-blue-50"
add(`\n/* ═══ VARIANTS_BLOCK_START ═══ */`);
add(`\n/* ── ARIA Variants ──
   Usage: class="aria-expanded:rotate-180 aria-selected:background-blue-50" */`);
const ariaVariants = [
  ['aria-expanded', '[aria-expanded="true"]'],
  ['aria-selected', '[aria-selected="true"]'],
  ['aria-checked',  '[aria-checked="true"]'],
  ['aria-pressed',  '[aria-pressed="true"]'],
  ['aria-disabled', '[aria-disabled="true"]'],
  ['aria-current',  '[aria-current="page"]'],
  ['aria-hidden',   '[aria-hidden="true"]'],
  ['aria-busy',     '[aria-busy="true"]'],
  ['aria-invalid',  '[aria-invalid="true"]'],
];
const ariaClasses = [
  ...extraStateClasses,
  ['rotate-180','transform:rotate(180deg)'],
  ['rotate-0','transform:rotate(0deg)'],
  ['text-bold','font-weight:700'],
  ['text-underline','text-decoration:underline'],
  ['cursor-not-allowed','cursor:not-allowed'],
];
ariaVariants.forEach(([prefix, attr]) => {
  add(`\n/* ${prefix} */`);
  ariaClasses.forEach(([cls, prop]) => {
    add(`.${prefix}\\:${cls}${attr} { ${prop}; }`);
  });
});
// group-aria: — style children when a marked .group ancestor carries the ARIA state
['expanded','selected','checked','current'].forEach(state => {
  const attr = state === 'current' ? '[aria-current="page"]' : `[aria-${state}="true"]`;
  add(`\n/* group-aria-${state} */`);
  [
    ['make-block','display:block'],['make-hidden','display:none'],
    ['opacity-100','opacity:1'],['opacity-0','opacity:0'],
    ['rotate-180','transform:rotate(180deg)'],
    ['color-blue-600','color:#2563eb'],
    ['background-blue-50','background-color:#eff6ff'],
  ].forEach(([cls, prop]) => {
    add(`.group${attr} .group-aria-${state}\\:${cls} { ${prop}; }`);
  });
});
add(`/* ═══ VARIANTS_BLOCK_END ═══ */`);

// ─── RTL / LTR VARIANTS ──────────────────────────────────────────────────────
// Direction-aware overrides for internationalised layouts.
// Usage: <html dir="rtl"> + class="text-left rtl:text-right"
add(`\n/* ═══ VARIANTS_BLOCK_START ═══ */`);
add(`\n/* ── RTL / LTR Variants ──
   Usage: <html dir="rtl"> + class="text-left rtl:text-right" */`);
const dirClasses = [
  ['text-left','text-align:left'],['text-right','text-align:right'],
  ['flex-row','flex-direction:row'],['flex-row-reverse','flex-direction:row-reverse'],
  ['make-hidden','display:none'],['make-block','display:block'],
];
[0,4,8,12,16,24,32,48].forEach(v => {
  dirClasses.push([`add-margin-left-${v}`,`margin-left:${v}px`]);
  dirClasses.push([`add-margin-right-${v}`,`margin-right:${v}px`]);
  dirClasses.push([`add-padding-left-${v}`,`padding-left:${v}px`]);
  dirClasses.push([`add-padding-right-${v}`,`padding-right:${v}px`]);
});
dirClasses.push(['add-margin-left-auto','margin-left:auto']);
dirClasses.push(['add-margin-right-auto','margin-right:auto']);
[['rtl','[dir="rtl"]'],['ltr','[dir="ltr"]']].forEach(([prefix, dirSel]) => {
  add(`\n/* ${prefix}: */`);
  dirClasses.forEach(([cls, prop]) => {
    add(`${dirSel} .${prefix}\\:${cls} { ${prop}; }`);
  });
});
add(`/* ═══ VARIANTS_BLOCK_END ═══ */`);

// ─── MAX-WIDTH BREAKPOINT VARIANTS ───────────────────────────────────────────
// Tailwind-style max-* breakpoints: apply *below* a viewport width.
// Usage: class="grid-cols-3 max-md:grid-cols-1"
add(`\n/* ═══ VARIANTS_BLOCK_START ═══ */`);
add(`\n/* ── Max-Width Breakpoints ──
   Usage: class="grid-cols-3 max-md:grid-cols-1" (applies BELOW the breakpoint) */`);
const maxBreakpoints = {
  'max-sm':  '(max-width: 639px)',
  'max-md':  '(max-width: 767px)',
  'max-lg':  '(max-width: 1023px)',
  'max-xl':  '(max-width: 1279px)',
  'max-xxl': '(max-width: 1535px)',
};
Object.entries(maxBreakpoints).forEach(([prefix, mq]) => {
  add(`\n@media ${mq} {`);
  responsiveClasses.forEach(([cls, props]) => {
    const val = props.split(';').map(p => p.trim()).filter(Boolean).map(p => p + ';').join(' ');
    add(`  .${prefix}\\:${cls} { ${val} }`);
  });
  add(`}`);
});
add(`/* ═══ VARIANTS_BLOCK_END ═══ */`);

// ─── CONTAINER QUERIES ───────────────────────────────────────────────────────
add(`\n/* ═══════════════════════════════════════════════════════════════
   CONTAINER QUERIES
   Part 1: make-container* — define a container
   Part 2: on-container-{size}: — anonymous queries
   Part 3: on-{name}-{size}:   — named container queries
   Part 4: on-container-{n}:   — pixel-exact queries
   Part 5: on-container-below-{size}: — max-width queries
   ═══════════════════════════════════════════════════════════════ */

/* ── Part 1 — Container definitions (make- prefix, no queries needed) ── */
.make-container       { container-type: inline-size; }
.make-container-size  { container-type: size; }
.make-container-block { container-type: block-size; }
`);

// Named container definitions — make-container-named-{name}
const namedContainers = ['card','sidebar','panel','header','main','footer','nav','hero','section','widget'];
namedContainers.forEach(name => {
  add(`.make-container-named-${name} { container: ${name} / inline-size; }`);
});

// ── Parts 2–5 live in VARIANTS_BLOCK (→ santy-variants.css) ──────────────────
add(`\n/* ═══ VARIANTS_BLOCK_START ═══ */`);

// Classes to generate inside each @container rule
const cqClasses = [
  // Display
  ['make-block','display:block'],['make-inline-block','display:inline-block'],
  ['make-flex','display:flex'],['make-grid','display:grid'],['make-hidden','display:none'],
  // Flex
  ['flex-row','flex-direction:row'],['flex-column','flex-direction:column'],
  ['flex-wrap','flex-wrap:wrap'],['flex-nowrap','flex-wrap:nowrap'],
  ['align-center','align-items:center'],['align-start','align-items:flex-start'],
  ['align-end','align-items:flex-end'],['align-stretch','align-items:stretch'],
  ['justify-center','justify-content:center'],['justify-between','justify-content:space-between'],
  ['justify-start','justify-content:flex-start'],['justify-end','justify-content:flex-end'],
  // Text align
  ['text-left','text-align:left'],['text-center','text-align:center'],['text-right','text-align:right'],
  // Width
  ['set-width-full','width:100%'],['set-width-auto','width:auto'],
];
// Grid cols
gridCols.forEach(n => cqClasses.push([`grid-cols-${n}`,`grid-template-columns:repeat(${n},minmax(0,1fr))`]));
// Font sizes
[12,14,16,18,20,24,28,32,36,40,48].forEach(v => cqClasses.push([`set-text-${v}`,`font-size:${v}px`]));
// Spacing (padding, margin, gap — selective values)
[0,4,8,12,16,20,24,32,40,48,64].forEach(v => {
  cqClasses.push([`add-padding-${v}`,`padding:${v}px`]);
  cqClasses.push([`add-padding-x-${v}`,`padding-left:${v}px;padding-right:${v}px`]);
  cqClasses.push([`add-padding-y-${v}`,`padding-top:${v}px;padding-bottom:${v}px`]);
  cqClasses.push([`add-margin-${v}`,`margin:${v}px`]);
  cqClasses.push([`gap-${v}`,`gap:${v}px`]);
});

function writeCQ(prefix, containerSelector, minWidth) {
  const rule = containerSelector
    ? `@container ${containerSelector} (min-width: ${minWidth}px)`
    : `@container (min-width: ${minWidth}px)`;
  add(`\n${rule} {`);
  cqClasses.forEach(([cls, props]) => {
    const val = props.split(';').map(p => p.trim()).filter(Boolean).map(p => p + ';').join(' ');
    add(`  .${prefix}\\:${cls} { ${val} }`);
  });
  add(`}`);
}

// ── Part 2 — Anonymous container queries: on-container-{size}: ───────────────
add('\n/* ── on-container-{size}: — anonymous container queries ── */');
const cqBreakpoints = { 'xs':200, 'sm':320, 'md':480, 'lg':640, 'xl':800, '2xl':1024 };
Object.entries(cqBreakpoints).forEach(([size, px]) => {
  writeCQ(`on-container-${size}`, '', px);
});

// ── Part 3 — Named container queries: on-{name}-{size}: ──────────────────────
add('\n/* ── on-{name}-{size}: — named container queries ── */');
namedContainers.forEach(name => {
  Object.entries(cqBreakpoints).forEach(([size, px]) => {
    writeCQ(`on-${name}-${size}`, name, px);
  });
});

// ── Part 4 — Pixel-exact: on-container-{n}: ──────────────────────────────────
add('\n/* ── on-container-{n}: — pixel-exact container queries ── */');
const cqPixelWidths = [200, 280, 320, 400, 480, 560, 640, 720, 800];
// Only generate the most structural classes for pixel-exact (keep size down)
const cqPixelClasses = [
  ['make-flex','display:flex'],['make-grid','display:grid'],['make-hidden','display:none'],['make-block','display:block'],
  ['flex-row','flex-direction:row'],['flex-column','flex-direction:column'],
  ['flex-wrap','flex-wrap:wrap'],
  ['align-center','align-items:center'],['justify-between','justify-content:space-between'],['justify-center','justify-content:center'],
  ['text-left','text-align:left'],['text-center','text-align:center'],
];
gridCols.forEach(n => cqPixelClasses.push([`grid-cols-${n}`,`grid-template-columns:repeat(${n},minmax(0,1fr))`]));
cqPixelWidths.forEach(px => {
  add(`\n@container (min-width: ${px}px) {`);
  cqPixelClasses.forEach(([cls, props]) => {
    add(`  .on-container-${px}\\:${cls} { ${props}; }`);
  });
  add(`}`);
});

// ── Part 5 — Max-width (below) variants ──────────────────────────────────────
add('\n/* ── on-container-below-{size}: — max-width container queries ── */');
[['sm',319],['md',479],['lg',639],['xl',799]].forEach(([size, px]) => {
  add(`\n@container (max-width: ${px}px) {`);
  cqClasses.forEach(([cls, props]) => {
    const val = props.split(';').map(p => p.trim()).filter(Boolean).map(p => p + ';').join(' ');
    add(`  .on-container-below-${size}\\:${cls} { ${val} }`);
  });
  add(`}`);
});

add(`/* ═══ VARIANTS_BLOCK_END ═══ */`);

// ─── EXTENDED ANIMATIONS (animate.css compatible) ────────────────────────────
mod('animations');
add(ANIMATION_CSS);

// ─── SCROLL ANIMATIONS ───────────────────────────────────────────────────────
add(`
/* ═════════════════════════════════════════════════════════════════════════
   SCROLL ANIMATIONS
   Family 1: when-visible:  — one-shot viewport-entry (+ santy-scroll.js)
   Family 2: on-scroll:     — scroll-progress (animation-timeline: scroll())
   Family 3: scroll-{prop}  — scroll-linked property utilities
   Stagger:  stagger-children / stagger-{n}
   ═════════════════════════════════════════════════════════════════════════ */

/* ── Keyframes for when-visible: ── */
@keyframes wv-fade-in { from{opacity:0} to{opacity:1} }
@keyframes wv-slide-up { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes wv-slide-in-left { from{transform:translateX(-32px);opacity:0} to{transform:translateX(0);opacity:1} }
@keyframes wv-slide-in-right { from{transform:translateX(32px);opacity:0} to{transform:translateX(0);opacity:1} }
@keyframes wv-slide-in-bottom { from{transform:translateY(32px);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes wv-zoom-in { from{transform:scale(0.85);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes wv-zoom-in-up { from{transform:scale(0.8) translateY(20px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }
@keyframes wv-zoom-bounce { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes wv-bounce-in-bottom {
  0%  {transform:translateY(40px);opacity:0}
  60% {transform:translateY(-8px);opacity:1}
  80% {transform:translateY(4px)}
  100%{transform:translateY(0)}
}
@keyframes wv-flip-in {
  from{transform:perspective(600px) rotateX(-80deg);opacity:0}
  to  {transform:perspective(600px) rotateX(0);opacity:1}
}
`);

// ── when-visible: — fire once when element enters viewport ──────────────────
add('\n/* ── when-visible: — viewport-entry animations ── */');
add('/* Requires santy-scroll.js observer. Classes activate via .is-visible. */');
const whenVisibleClasses = [
  ['animate-fade-in',              'wv-fade-in',          '0.6s', 'ease-out'],
  ['animate-slide-up',             'wv-slide-up',         '0.5s', 'ease-out'],
  ['animate-slide-in-from-left',   'wv-slide-in-left',    '0.5s', 'ease-out'],
  ['animate-slide-in-from-right',  'wv-slide-in-right',   '0.5s', 'ease-out'],
  ['animate-slide-in-from-bottom', 'wv-slide-in-bottom',  '0.5s', 'ease-out'],
  ['animate-zoom-in',              'wv-zoom-in',          '0.5s', 'ease-out'],
  ['animate-zoom-in-up',           'wv-zoom-in-up',       '0.5s', 'ease-out'],
  ['animate-zoom-bounce',          'wv-zoom-bounce',      '0.5s', 'cubic-bezier(0.34,1.56,0.64,1)'],
  ['animate-bounce-in-from-bottom','wv-bounce-in-bottom', '0.7s', 'ease-out'],
  ['animate-flip-in',              'wv-flip-in',          '0.6s', 'ease-out'],
  ['animate-bounce',               'santy-bounce',        '1s',   'ease'],
  ['animate-pulse',                'santy-pulse',         '2s',   'cubic-bezier(0.4,0,0.6,1)'],
];
whenVisibleClasses.forEach(([cls, keyframe, dur, ease]) => {
  add(`.when-visible\\:${cls} { animation:none; animation-fill-mode:both; }`);
  add(`.when-visible\\:${cls}.is-visible { animation-name:${keyframe}; animation-duration:${dur}; animation-timing-function:${ease}; }`);
});

// ── enter-at-{n} — observer threshold modifiers ─────────────────────────────
add('\n/* ── enter-at-{n} — how much of element must be visible before triggering ── */');
[[15,0.15],[25,0.25],[50,0.50],[75,0.75]].forEach(([n,v]) => {
  add(`.enter-at-${n} { --santy-enter-threshold:${v}; }`);
});
add('.enter-repeat { --santy-enter-repeat:1; }');

// ── on-scroll: — scroll-progress via animation-timeline: scroll() ────────────
add(`
/* ── on-scroll: — animations linked to scroll position ── */
@keyframes os-width-full        { from{width:0%}       to{width:100%} }
@keyframes os-rotate-180        { from{transform:rotate(0)}       to{transform:rotate(180deg)} }
@keyframes os-rotate-360        { from{transform:rotate(0)}       to{transform:rotate(360deg)} }
@keyframes os-fade-in           { from{opacity:0}      to{opacity:1} }
@keyframes os-fade-out          { from{opacity:1}      to{opacity:0} }
@keyframes os-scale-up          { from{transform:scale(0.8)}      to{transform:scale(1)} }
@keyframes os-slide-down        { from{transform:translateY(-20px);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes os-translate-y-half  { from{transform:translateY(0)}   to{transform:translateY(-50%)} }
`);
[
  ['animate-width-full', 'os-width-full'],
  ['rotate-180',         'os-rotate-180'],
  ['rotate-360',         'os-rotate-360'],
  ['fade-in',            'os-fade-in'],
  ['fade-out',           'os-fade-out'],
  ['scale-up',           'os-scale-up'],
  ['slide-down',         'os-slide-down'],
  ['translate-y-half',   'os-translate-y-half'],
].forEach(([cls, kf]) => {
  add(`.on-scroll\\:${cls} { animation:${kf} linear; animation-timeline:scroll(); animation-fill-mode:both; }`);
});

// ── scroll-{prop} — property utilities tied to page scroll ──────────────────
add(`
/* ── scroll-{prop} — scroll-linked CSS property utilities ── */
@keyframes scroll-grow-width    { from{width:0}            to{width:100%} }
@keyframes scroll-opacity-out   { from{opacity:1}          to{opacity:0} }
@keyframes scroll-scale-down    { from{transform:scale(1)} to{transform:scale(0.8)} }
@keyframes scroll-parallax-slow { from{transform:translateY(0)} to{transform:translateY(-30%)} }
@keyframes scroll-parallax-fast { from{transform:translateY(0)} to{transform:translateY(-60%)} }

.scroll-width         { animation:scroll-grow-width    linear both; animation-timeline:scroll(root); }
.scroll-opacity-out   { animation:scroll-opacity-out   linear both; animation-timeline:scroll(root); }
.scroll-scale-down    { animation:scroll-scale-down    linear both; animation-timeline:scroll(root); }
.scroll-parallax-slow { animation:scroll-parallax-slow linear both; animation-timeline:scroll(nearest); }
.scroll-parallax-fast { animation:scroll-parallax-fast linear both; animation-timeline:scroll(nearest); }
`);

// ── stagger-children ─────────────────────────────────────────────────────────
add('\n/* ── stagger-children — auto-delay nth-child for list animations ── */');
const STAGGER_MAX = 12;
for (let i = 1; i <= STAGGER_MAX; i++) {
  add(`.stagger-children > *:nth-child(${i}) { animation-delay:${(i-1)*100}ms; }`);
}
[50, 150, 200, 300].forEach(ms => {
  add(`\n/* stagger-${ms} */`);
  for (let i = 1; i <= STAGGER_MAX; i++) {
    add(`.stagger-${ms} > *:nth-child(${i}) { animation-delay:${(i-1)*ms}ms; }`);
  }
});

// ── Accessibility ─────────────────────────────────────────────────────────────
add(`
/* ── Scroll animations — prefers-reduced-motion ── */
@media (prefers-reduced-motion: reduce) {
  [class*="when-visible:"],
  [class*="on-scroll:"],
  .scroll-width, .scroll-opacity-out, .scroll-scale-down,
  .scroll-parallax-slow, .scroll-parallax-fast {
    animation: none !important;
    transition: none !important;
  }
}
`);

// ─── COMPONENT SHORTCUTS ───────────────────────────────────────────────────────
mod('components');
add(`\n/* ═══ SANTY COMPONENTS ═══ */

/* ═══════════════════════════════════════════════════════════════
   COMPONENT SHORTCUTS — Higher-level ready-to-use patterns
   ═══════════════════════════════════════════════════════════════ */

/* ── Container ── */
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 16px;
  padding-right: 16px;
}
@media (min-width: 640px)  { .container { max-width: 640px; } }
@media (min-width: 768px)  { .container { max-width: 768px; } }
@media (min-width: 1024px) { .container { max-width: 1024px; } }
@media (min-width: 1280px) { .container { max-width: 1280px; } }
@media (min-width: 1536px) { .container { max-width: 1536px; } }

/* ── Card ── */
.card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: var(--santy-shadow);
  overflow: hidden;
}
.card-body { padding: 24px; }
.card-header { padding: 16px 24px; border-bottom: 1px solid #e5e7eb; }
.card-footer { padding: 16px 24px; border-top: 1px solid #e5e7eb; }

/* ── Badge ── */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 9999px;
  line-height: 1.5;
}

/* ── Button Base ── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: var(--santy-transition-fast);
  text-decoration: none;
  line-height: 1.5;
  white-space: nowrap;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-sm { padding: 4px 12px; font-size: 12px; border-radius: 6px; }
.btn-lg { padding: 12px 28px; font-size: 16px; border-radius: 10px; }
.btn-xl { padding: 16px 36px; font-size: 18px; border-radius: 12px; }
.btn-primary { background-color: #3b82f6; color: #ffffff; }
.btn-primary:hover { background-color: #2563eb; }
.btn-secondary { background-color: #6b7280; color: #ffffff; }
.btn-secondary:hover { background-color: #4b5563; }
.btn-success { background-color: #22c55e; color: #ffffff; }
.btn-success:hover { background-color: #16a34a; }
.btn-danger { background-color: #ef4444; color: #ffffff; }
.btn-danger:hover { background-color: #dc2626; }
.btn-warning { background-color: #f59e0b; color: #ffffff; }
.btn-warning:hover { background-color: #d97706; }
.btn-outline { background-color: transparent; border: 2px solid currentColor; }
.btn-ghost { background-color: transparent; }
.btn-ghost:hover { background-color: rgba(0,0,0,0.05); }
.btn-full { width: 100%; }

/* ── Alert ── */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid currentColor;
  margin-bottom: 16px;
}
.alert-info    { background-color: #eff6ff; color: #1d4ed8; }
.alert-success { background-color: #f0fdf4; color: #15803d; }
.alert-warning { background-color: #fffbeb; color: #b45309; }
.alert-danger  { background-color: #fef2f2; color: #b91c1c; }

/* ── Input ── */
.input {
  display: block;
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #ffffff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  outline: none;
}
.input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.2); }
.input-error  { border-color: #ef4444; }
.input-error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.2); }
.input-lg { padding: 12px 16px; font-size: 16px; border-radius: 8px; }
.input-sm { padding: 4px 8px; font-size: 12px; }

/* ── Divider ── */
.divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 16px 0;
}
.divider-vertical {
  border: none;
  border-left: 1px solid #e5e7eb;
  align-self: stretch;
  margin: 0 16px;
}

/* ── Overlay ── */
.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.5);
  z-index: 40;
}

/* ── Avatar ── */
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}
.avatar-sm  { width: 32px;  height: 32px; }
.avatar-md  { width: 40px;  height: 40px; }
.avatar-lg  { width: 56px;  height: 56px; }
.avatar-xl  { width: 80px;  height: 80px; }

/* ── Spinner ── */
.spinner {
  border: 3px solid rgba(0,0,0,0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: santy-spin 0.7s linear infinite;
}
.spinner-sm  { width: 16px; height: 16px; }
.spinner-md  { width: 24px; height: 24px; }
.spinner-lg  { width: 40px; height: 40px; }
.spinner-xl  { width: 56px; height: 56px; }

/* ── Skeleton (loading placeholder) ── */
.skeleton {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: santy-skeleton 1.5s ease-in-out infinite;
  border-radius: 4px;
}
@keyframes santy-skeleton {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Progress Bar ── */
.progress {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  background-color: #3b82f6;
  border-radius: 9999px;
  transition: width 0.3s ease;
}
`);

// ─── EXTENDED COMPONENTS (Bootstrap, Material, Bulma parity) ─────────────────
add(`
/* ── Table ── */
.table { width: 100%; border-collapse: collapse; font-size: 14px; }
.table th, .table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
.table thead tr { background-color: #f9fafb; }
.table thead th { font-weight: 600; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
.table-striped tbody tr:nth-child(even) { background-color: #f9fafb; }
.table-bordered { border: 1px solid #e5e7eb; }
.table-bordered th, .table-bordered td { border: 1px solid #e5e7eb; }
.table-hover tbody tr:hover { background-color: #f3f4f6; cursor: pointer; }
.table-compact th, .table-compact td { padding: 6px 10px; font-size: 13px; }
.table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }

/* ── Breadcrumb ── */
.breadcrumb { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; list-style: none; margin: 0; padding: 0; font-size: 14px; }
.breadcrumb-item { color: #6b7280; }
.breadcrumb-item a { color: #3b82f6; text-decoration: none; }
.breadcrumb-item a:hover { text-decoration: underline; }
.breadcrumb-item + .breadcrumb-item::before { content: '/'; margin-right: 4px; color: #d1d5db; }
.breadcrumb-item.active { color: #111827; font-weight: 500; }
.breadcrumb-dot .breadcrumb-item + .breadcrumb-item::before { content: '·'; }
.breadcrumb-arrow .breadcrumb-item + .breadcrumb-item::before { content: '›'; font-size: 16px; color: #9ca3af; }

/* ── Pagination ── */
.pagination { display: flex; align-items: center; gap: 4px; list-style: none; margin: 0; padding: 0; flex-wrap: wrap; }
.page-link { display: inline-flex; align-items: center; justify-content: center; min-width: 36px; height: 36px; padding: 0 10px; font-size: 14px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #fff; color: #374151; text-decoration: none; cursor: pointer; transition: all 0.15s ease; user-select: none; }
.page-link:hover { background-color: #f3f4f6; border-color: #d1d5db; }
.page-item.active .page-link { background-color: #3b82f6; border-color: #3b82f6; color: #fff; }
.page-item.disabled .page-link { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
.pagination-sm .page-link { min-width: 28px; height: 28px; font-size: 12px; border-radius: 6px; }
.pagination-lg .page-link { min-width: 44px; height: 44px; font-size: 16px; border-radius: 10px; }

/* ── Chip / Tag ── */
.chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; font-size: 13px; font-weight: 500; border-radius: 9999px; background-color: #e5e7eb; color: #374151; cursor: default; transition: background-color 0.15s; }
.chip:hover { background-color: #d1d5db; }
.chip-sm { padding: 2px 8px; font-size: 11px; }
.chip-lg { padding: 6px 16px; font-size: 14px; }
.chip-blue   { background-color: #dbeafe; color: #1d4ed8; }
.chip-green  { background-color: #dcfce7; color: #15803d; }
.chip-red    { background-color: #fee2e2; color: #b91c1c; }
.chip-yellow { background-color: #fef9c3; color: #854d0e; }
.chip-purple { background-color: #ede9fe; color: #6d28d9; }
.chip-orange { background-color: #ffedd5; color: #c2410c; }
.chip-outline { background-color: transparent; border: 1px solid currentColor; }

/* ── List Group ── */
.list-group { display: flex; flex-direction: column; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; }
.list-group-item { display: flex; align-items: center; padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #e5e7eb; background-color: #fff; color: #374151; text-decoration: none; transition: background-color 0.15s; }
.list-group-item:last-child { border-bottom: none; }
.list-group-item:hover { background-color: #f9fafb; }
.list-group-item.active { background-color: #3b82f6; color: #fff; border-color: #3b82f6; }
.list-group-item.disabled { opacity: 0.5; pointer-events: none; }
.list-group-flush { border: none; border-radius: 0; }
.list-group-flush .list-group-item { border-left: none; border-right: none; }
.list-group-numbered .list-group-item { counter-increment: list-group; }
.list-group-numbered .list-group-item::before { content: counter(list-group) '. '; font-weight: 600; color: #9ca3af; margin-right: 8px; }

/* ── Form ── */
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.form-label { font-size: 14px; font-weight: 500; color: #374151; }
.form-label-required::after { content: ' *'; color: #ef4444; }
.form-hint { font-size: 12px; color: #6b7280; line-height: 1.4; }
.form-error-text { font-size: 12px; color: #ef4444; }
.form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.form-row-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

/* ── Select ── */
.select { display: block; width: 100%; padding: 8px 36px 8px 12px; font-size: 14px; border: 1px solid #d1d5db; border-radius: 6px; background-color: #fff; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 10px center; background-size: 16px; outline: none; cursor: pointer; appearance: none; -webkit-appearance: none; transition: border-color 0.15s ease; }
.select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.2); }
.select-error { border-color: #ef4444; }
.select-sm { padding: 4px 28px 4px 8px; font-size: 12px; border-radius: 4px; }
.select-lg { padding: 12px 40px 12px 16px; font-size: 16px; border-radius: 8px; }

/* ── Textarea ── */
.textarea { display: block; width: 100%; padding: 8px 12px; font-size: 14px; border: 1px solid #d1d5db; border-radius: 6px; background-color: #fff; transition: border-color 0.15s ease, box-shadow 0.15s ease; outline: none; resize: vertical; min-height: 80px; font-family: inherit; line-height: 1.5; }
.textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.2); }
.textarea-error { border-color: #ef4444; }
.textarea-no-resize { resize: none; }

/* ── Checkbox & Radio ── */
.checkbox, .radio-label { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #374151; user-select: none; }
.checkbox input[type="checkbox"], .radio-label input[type="radio"] { width: 16px; height: 16px; accent-color: #3b82f6; cursor: pointer; flex-shrink: 0; }

/* ── Toggle / Switch ── */
.toggle { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
.toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
.toggle-slider { position: absolute; cursor: pointer; inset: 0; background-color: #d1d5db; border-radius: 9999px; transition: background-color 0.2s; }
.toggle-slider::before { content: ''; position: absolute; width: 20px; height: 20px; left: 2px; top: 2px; background-color: #fff; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle input:checked + .toggle-slider { background-color: #3b82f6; }
.toggle input:checked + .toggle-slider::before { transform: translateX(20px); }
.toggle input:disabled + .toggle-slider { opacity: 0.5; cursor: not-allowed; }
.toggle-sm { width: 34px; height: 18px; }
.toggle-sm .toggle-slider::before { width: 14px; height: 14px; }
.toggle-sm input:checked + .toggle-slider::before { transform: translateX(16px); }
.toggle-green input:checked + .toggle-slider { background-color: #22c55e; }
.toggle-purple input:checked + .toggle-slider { background-color: #8b5cf6; }

/* ── Range ── */
.range { -webkit-appearance: none; width: 100%; height: 4px; border-radius: 9999px; background: #e5e7eb; outline: none; cursor: pointer; }
.range::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #3b82f6; cursor: pointer; box-shadow: 0 0 0 3px rgba(59,130,246,0.2); }
.range::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #3b82f6; cursor: pointer; border: none; }

/* ── Navbar ── */
.navbar { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; background-color: #fff; border-bottom: 1px solid #e5e7eb; gap: 16px; }
.navbar-brand { font-size: 18px; font-weight: 700; color: #111827; text-decoration: none; flex-shrink: 0; }
.navbar-menu { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.navbar-item { padding: 6px 12px; font-size: 14px; color: #6b7280; text-decoration: none; border-radius: 6px; transition: background-color 0.15s, color 0.15s; white-space: nowrap; }
.navbar-item:hover { background-color: #f3f4f6; color: #111827; }
.navbar-item.active { color: #3b82f6; background-color: #eff6ff; font-weight: 500; }
.navbar-dark { background-color: #1e293b; border-bottom-color: #334155; }
.navbar-dark .navbar-brand { color: #f1f5f9; }
.navbar-dark .navbar-item { color: #94a3b8; }
.navbar-dark .navbar-item:hover { background-color: #334155; color: #f1f5f9; }
.navbar-sticky { position: sticky; top: 0; z-index: 50; }
.navbar-glass { background-color: rgba(255,255,255,0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
.navbar-dark.navbar-glass { background-color: rgba(15,23,42,0.85); }

/* ── Accordion ── */
.accordion { border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
.accordion-flush { border: none; border-radius: 0; }
.accordion-item { border-bottom: 1px solid #e5e7eb; }
.accordion-item:last-child { border-bottom: none; }
.accordion-header { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 14px 18px; font-size: 15px; font-weight: 500; color: #111827; background-color: #fff; cursor: pointer; border: none; text-align: left; transition: background-color 0.15s; }
.accordion-header:hover { background-color: #f9fafb; }
.accordion-header[aria-expanded="true"] { background-color: #f9fafb; color: #3b82f6; }
.accordion-icon { width: 18px; height: 18px; flex-shrink: 0; transition: transform 0.25s ease; }
.accordion-header[aria-expanded="true"] .accordion-icon { transform: rotate(180deg); }
.accordion-body { padding: 0 18px; font-size: 14px; color: #6b7280; line-height: 1.6; background-color: #fff; max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.2s ease; }
.accordion-body.open { max-height: 2000px; padding: 14px 18px; border-top: 1px solid #f3f4f6; }

/* ── Tabs ── */
.tabs { display: flex; border-bottom: 2px solid #e5e7eb; list-style: none; margin: 0; padding: 0; overflow-x: auto; }
.tabs-item { padding: 10px 20px; font-size: 14px; font-weight: 500; color: #6b7280; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; text-decoration: none; transition: color 0.15s, border-color 0.15s; white-space: nowrap; border: none; background: transparent; }
.tabs-item:hover { color: #374151; }
.tabs-item.active { color: #3b82f6; border-bottom: 2px solid #3b82f6; }
.tabs-pill { border-bottom: none; background-color: #f3f4f6; padding: 4px; border-radius: 10px; gap: 4px; }
.tabs-pill .tabs-item { border-bottom: none; border-radius: 6px; }
.tabs-pill .tabs-item.active { background-color: #fff; color: #111827; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.tabs-underline .tabs-item.active { color: #111827; border-bottom-color: #111827; }
.tab-panel { display: none; padding: 20px 0; }
.tab-panel.active { display: block; }

/* ── Tooltip (CSS-only) ── */
.tooltip { position: relative; display: inline-block; }
.tooltip-content { visibility: hidden; opacity: 0; position: absolute; z-index: 100; background-color: #1f2937; color: #f9fafb; font-size: 12px; padding: 5px 10px; border-radius: 6px; white-space: nowrap; pointer-events: none; transition: opacity 0.15s; line-height: 1.4; }
.tooltip:hover .tooltip-content { visibility: visible; opacity: 1; }
.tooltip-top    .tooltip-content { bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); }
.tooltip-bottom .tooltip-content { top: calc(100% + 8px); left: 50%; transform: translateX(-50%); }
.tooltip-left   .tooltip-content { right: calc(100% + 8px); top: 50%; transform: translateY(-50%); }
.tooltip-right  .tooltip-content { left: calc(100% + 8px); top: 50%; transform: translateY(-50%); }

/* ── Notification / Toast ── */
.notification { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border-radius: 10px; font-size: 14px; border: 1px solid transparent; line-height: 1.4; }
.notification-info    { background-color: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
.notification-success { background-color: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
.notification-warning { background-color: #fffbeb; border-color: #fde68a; color: #b45309; }
.notification-error   { background-color: #fef2f2; border-color: #fecaca; color: #b91c1c; }
.notification-icon { flex-shrink: 0; width: 18px; height: 18px; margin-top: 1px; }
.notification-title { font-weight: 600; margin-bottom: 2px; }
.notification-desc { opacity: 0.85; font-size: 13px; }

/* ── Steps / Stepper ── */
.steps { display: flex; align-items: flex-start; list-style: none; margin: 0; padding: 0; }
.step { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; }
.step:not(:last-child)::after { content: ''; position: absolute; top: 15px; left: calc(50% + 16px); right: calc(-50% + 16px); height: 2px; background-color: #e5e7eb; }
.step.done:not(:last-child)::after { background-color: #22c55e; }
.step-dot { width: 32px; height: 32px; border-radius: 50%; background-color: #e5e7eb; color: #9ca3af; font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 2px solid #e5e7eb; transition: all 0.2s; z-index: 1; }
.step-label { font-size: 12px; color: #9ca3af; margin-top: 6px; text-align: center; }
.step.active .step-dot { background-color: #3b82f6; color: #fff; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,0.15); }
.step.active .step-label { color: #1d4ed8; font-weight: 500; }
.step.done .step-dot { background-color: #22c55e; color: #fff; border-color: #22c55e; }
.step.done .step-label { color: #15803d; }

/* ── Modal (CSS-only via :target) ── */
.modal-overlay { position: fixed; inset: 0; background-color: rgba(0,0,0,0.5); z-index: 200; display: none; align-items: center; justify-content: center; padding: 16px; }
.modal-overlay:target { display: flex; }
.modal-box { background-color: #fff; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); max-width: 560px; width: 100%; max-height: 90vh; overflow-y: auto; animation: santy-zoom-in 0.25s ease; }
.modal-header { padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; }
.modal-title { font-size: 18px; font-weight: 600; color: #111827; margin: 0; }
.modal-body { padding: 24px; font-size: 14px; color: #6b7280; line-height: 1.6; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 10px; }
.modal-sm .modal-box { max-width: 400px; }
.modal-lg .modal-box { max-width: 768px; }
.modal-xl .modal-box { max-width: 1024px; }
.modal-full .modal-box { max-width: 100%; height: 100vh; border-radius: 0; max-height: 100vh; }
.modal-close { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 6px; border: none; background-color: transparent; cursor: pointer; color: #9ca3af; transition: background-color 0.15s; font-size: 20px; line-height: 1; padding: 0; text-decoration: none; }
.modal-close:hover { background-color: #f3f4f6; color: #374151; }
.modal-close::before { content: '×'; }

/* ── Drawer / Off-canvas (CSS-only via :target) ── */
.drawer-overlay { position: fixed; inset: 0; background-color: rgba(0,0,0,0.5); z-index: 200; display: none; }
.drawer-overlay:target { display: block; }
.drawer-panel { position: fixed; top: 0; bottom: 0; left: 0; width: 300px; background-color: #fff; z-index: 201; overflow-y: auto; box-shadow: 4px 0 24px rgba(0,0,0,0.12); transform: translateX(-100%); transition: transform 0.3s ease; }
.drawer-overlay:target .drawer-panel { transform: translateX(0); }
.drawer-panel-right { left: auto; right: 0; transform: translateX(100%); box-shadow: -4px 0 24px rgba(0,0,0,0.12); }
.drawer-overlay:target .drawer-panel-right { transform: translateX(0); }
.drawer-header { padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; }
.drawer-body { padding: 20px 24px; }

/* ── Media Object ── */
.media { display: flex; gap: 16px; align-items: flex-start; }
.media-body { flex: 1; min-width: 0; }
.media-right { order: 2; }
.media-sm { gap: 10px; }
.media-lg { gap: 24px; }

/* ── Stat Card ── */
.stat-card { background-color: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px 24px; }
.stat-label { font-size: 13px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
.stat-value { font-size: 32px; font-weight: 700; color: #111827; line-height: 1; margin-bottom: 8px; }
.stat-delta { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 500; }
.stat-delta-up   { color: #15803d; }
.stat-delta-down { color: #b91c1c; }

/* ── Kbd ── */
.kbd { display: inline-block; padding: 2px 7px; font-family: ui-monospace, monospace; font-size: 12px; color: #374151; background-color: #f3f4f6; border: 1px solid #d1d5db; border-bottom-width: 2px; border-radius: 4px; box-shadow: inset 0 -1px 0 #d1d5db; white-space: nowrap; }

/* ── Close Button ── */
.btn-close { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; border-radius: 6px; background-color: transparent; cursor: pointer; color: #9ca3af; transition: background-color 0.15s, color 0.15s; font-size: 20px; line-height: 1; padding: 0; }
.btn-close:hover { background-color: #f3f4f6; color: #374151; }
.btn-close::before { content: '×'; }
.btn-close-white { color: rgba(255,255,255,0.7); }
.btn-close-white:hover { background-color: rgba(255,255,255,0.1); color: #fff; }

/* ── Empty State ── */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; }
.empty-state-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; line-height: 1; }
.empty-state-title { font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 8px; }
.empty-state-desc { font-size: 14px; color: #6b7280; max-width: 320px; margin: 0 auto 20px; line-height: 1.5; }

/* ── Elevation (Material Design levels) ── */
.elevation-0 { box-shadow: none; }
.elevation-1 { box-shadow: 0 1px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.24); }
.elevation-2 { box-shadow: 0 3px 6px rgba(0,0,0,.16), 0 3px 6px rgba(0,0,0,.23); }
.elevation-3 { box-shadow: 0 10px 20px rgba(0,0,0,.19), 0 6px 6px rgba(0,0,0,.23); }
.elevation-4 { box-shadow: 0 14px 28px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.22); }
.elevation-5 { box-shadow: 0 19px 38px rgba(0,0,0,.30), 0 15px 12px rgba(0,0,0,.22); }

/* ── Screen Reader / Accessibility ── */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0; }
.not-sr-only { position: static; width: auto; height: auto; overflow: visible; clip: auto; white-space: normal; }
.sr-only-focusable:focus { position: static; width: auto; height: auto; overflow: visible; clip: auto; white-space: normal; }
.focus-ring:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }
.focus-ring-inset:focus-visible { outline: 2px solid #3b82f6; outline-offset: -2px; }
.focus-none:focus { outline: none; box-shadow: none; }

/* ── Pointer Events ── */
.pointer-events-none { pointer-events: none; }
.pointer-events-auto { pointer-events: auto; }

/* ── User Select ── */
.select-none { user-select: none; -webkit-user-select: none; }
.select-text { user-select: text; }
.select-all  { user-select: all; }
.select-auto { user-select: auto; }

/* ── Will-change ── */
.will-change-auto      { will-change: auto; }
.will-change-scroll    { will-change: scroll-position; }
.will-change-contents  { will-change: contents; }
.will-change-transform { will-change: transform; }
.will-change-opacity   { will-change: opacity; }

/* ── Appearance ── */
.appearance-none { -webkit-appearance: none; appearance: none; }
.appearance-auto { -webkit-appearance: auto; appearance: auto; }

/* ── Caret color ── */
.caret-blue   { caret-color: #3b82f6; }
.caret-green  { caret-color: #22c55e; }
.caret-red    { caret-color: #ef4444; }
.caret-auto   { caret-color: auto; }
.caret-transparent { caret-color: transparent; }

/* ── Touch action ── */
.touch-none        { touch-action: none; }
.touch-pan-x       { touch-action: pan-x; }
.touch-pan-y       { touch-action: pan-y; }
.touch-manipulation{ touch-action: manipulation; }
.touch-auto        { touch-action: auto; }

/* ── Print utilities ── */
@media print {
  .print-hidden  { display: none !important; }
  .print-visible { display: block !important; }
  .print-break-before { page-break-before: always; }
  .print-break-after  { page-break-after: always; }
  .print-no-background { background: white !important; color: black !important; }
  .print-border-none { border: none !important; box-shadow: none !important; }
}

/* ── Message / Hero (Bulma-style) ── */
.message { border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; font-size: 14px; }
.message-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; font-weight: 600; }
.message-body { padding: 14px 16px; color: #374151; line-height: 1.5; }
.message-info    .message-header { background-color: #3b82f6; color: #fff; }
.message-info    .message-body   { background-color: #eff6ff; }
.message-success .message-header { background-color: #22c55e; color: #fff; }
.message-success .message-body   { background-color: #f0fdf4; }
.message-warning .message-header { background-color: #f59e0b; color: #fff; }
.message-warning .message-body   { background-color: #fffbeb; }
.message-danger  .message-header { background-color: #ef4444; color: #fff; }
.message-danger  .message-body   { background-color: #fef2f2; }

/* ── Hero section ── */
.hero-section { display: flex; align-items: center; justify-content: center; min-height: 400px; padding: 64px 24px; text-align: center; }
.hero-section-sm { min-height: 200px; padding: 40px 24px; }
.hero-section-lg { min-height: 600px; }
.hero-section-full { min-height: 100vh; }
.hero-content { max-width: 800px; margin: 0 auto; }

/* ── Level (Bulma-style horizontal layout) ── */
.level { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.level-left  { display: flex; align-items: center; gap: 12px; }
.level-right { display: flex; align-items: center; gap: 12px; }
.level-item  { flex: 1; text-align: center; }

/* ── FAB (Material floating action button) ── */
.fab { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 50%; background-color: #3b82f6; color: #fff; border: none; cursor: pointer; box-shadow: 0 6px 10px rgba(0,0,0,.2), 0 2px 4px rgba(0,0,0,.15); transition: box-shadow 0.2s, transform 0.2s; }
.fab:hover { box-shadow: 0 8px 16px rgba(0,0,0,.25), 0 4px 6px rgba(0,0,0,.15); transform: translateY(-1px); }
.fab:active { box-shadow: 0 4px 8px rgba(0,0,0,.2); transform: translateY(0); }
.fab-sm { width: 40px; height: 40px; }
.fab-lg { width: 72px; height: 72px; }
.fab-extended { width: auto; border-radius: 9999px; padding: 0 20px; gap: 8px; font-size: 14px; font-weight: 600; }
.fab-bottom-right { position: fixed; bottom: 24px; right: 24px; z-index: 50; }
.fab-bottom-left  { position: fixed; bottom: 24px; left: 24px; z-index: 50; }

/* ── App Bar (Material-style) ── */
.app-bar { display: flex; align-items: center; gap: 16px; padding: 0 16px; height: 56px; background-color: #fff; border-bottom: 1px solid #e5e7eb; position: relative; z-index: 10; }
.app-bar-title { font-size: 18px; font-weight: 600; color: #111827; flex: 1; }
.app-bar-dark { background-color: #1e293b; border-bottom-color: #334155; }
.app-bar-dark .app-bar-title { color: #f1f5f9; }
.app-bar-primary { background-color: #3b82f6; border-bottom-color: #2563eb; }
.app-bar-primary .app-bar-title { color: #fff; }
.app-bar-sticky { position: sticky; top: 0; z-index: 50; }

/* ── Card variants (Bootstrap-style) ── */
.card-flat    { box-shadow: none; border: 1px solid #e5e7eb; }
.card-raised  { box-shadow: 0 10px 25px -5px rgba(0,0,0,.15), 0 4px 10px -4px rgba(0,0,0,.1); }
.card-outline { box-shadow: none; border: 2px solid #e5e7eb; background-color: transparent; }
.card-horizontal { display: flex; flex-direction: row; }
.card-horizontal .card-img { width: 200px; flex-shrink: 0; object-fit: cover; }
.card-img-top    { width: 100%; object-fit: cover; }
.card-img-bottom { width: 100%; object-fit: cover; }

/* ── Button groups ── */
.btn-group { display: inline-flex; }
.btn-group .btn { border-radius: 0; border-right-width: 0; }
.btn-group .btn:first-child { border-radius: 8px 0 0 8px; }
.btn-group .btn:last-child  { border-radius: 0 8px 8px 0; border-right-width: 1px; }
.btn-group-vertical { display: inline-flex; flex-direction: column; }
.btn-group-vertical .btn { border-radius: 0; border-bottom-width: 0; }
.btn-group-vertical .btn:first-child { border-radius: 8px 8px 0 0; }
.btn-group-vertical .btn:last-child  { border-radius: 0 0 8px 8px; border-bottom-width: 1px; }

/* ── Input group (Bootstrap-style) ── */
.input-group { display: flex; }
.input-group .input { border-radius: 0; border-right-width: 0; flex: 1; }
.input-group .input:first-child { border-radius: 6px 0 0 6px; }
.input-group .input:last-child  { border-radius: 0 6px 6px 0; border-right-width: 1px; }
.input-addon { display: flex; align-items: center; padding: 0 12px; background-color: #f3f4f6; border: 1px solid #d1d5db; border-right: none; font-size: 14px; color: #6b7280; white-space: nowrap; }
.input-addon:first-child { border-radius: 6px 0 0 6px; }
.input-addon:last-child  { border-radius: 0 6px 6px 0; border-left: none; border-right-width: 1px; }

/* ── Command Palette ── */
.cmd-palette-backdrop { position: fixed; inset: 0; background-color: rgba(0,0,0,0.5); z-index: 500; display: flex; align-items: flex-start; justify-content: center; padding-top: 10vh; }
.cmd-palette { width: 100%; max-width: 560px; background-color: #fff; border-radius: 14px; box-shadow: 0 25px 60px rgba(0,0,0,.3); overflow: hidden; animation: santy-zoom-in 0.15s ease; }
.cmd-palette-input-wrap { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid #e5e7eb; }
.cmd-palette-icon { width: 18px; height: 18px; color: #9ca3af; flex-shrink: 0; }
.cmd-palette-input { flex: 1; border: none; outline: none; font-size: 16px; color: #111827; background: transparent; }
.cmd-palette-input::placeholder { color: #9ca3af; }
.cmd-palette-kbd { font-size: 11px; color: #9ca3af; background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 4px; padding: 2px 6px; white-space: nowrap; }
.cmd-palette-list { max-height: 360px; overflow-y: auto; padding: 6px; }
.cmd-palette-group { padding: 6px 10px 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #9ca3af; }
.cmd-palette-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; font-size: 14px; color: #374151; cursor: pointer; transition: background-color 0.1s; }
.cmd-palette-item:hover, .cmd-palette-item.active { background-color: #eff6ff; color: #2563eb; }
.cmd-palette-item-icon { width: 20px; height: 20px; flex-shrink: 0; opacity: 0.6; }
.cmd-palette-item-label { flex: 1; }
.cmd-palette-item-hint { font-size: 12px; color: #9ca3af; }
.cmd-palette-empty { padding: 32px 16px; text-align: center; font-size: 14px; color: #9ca3af; }
.cmd-palette-footer { display: flex; align-items: center; gap: 12px; padding: 8px 14px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; background-color: #f9fafb; }

/* ── Kanban Board ── */
.kanban { display: flex; gap: 16px; overflow-x: auto; align-items: flex-start; padding-bottom: 8px; }
.kanban-col { flex-shrink: 0; width: 280px; background-color: #f3f4f6; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.kanban-col-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.kanban-col-title { font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; }
.kanban-col-count { font-size: 12px; font-weight: 600; background-color: #e5e7eb; color: #6b7280; border-radius: 9999px; padding: 1px 8px; }
.kanban-card { background-color: #fff; border-radius: 10px; padding: 12px 14px; box-shadow: 0 1px 4px rgba(0,0,0,.07); cursor: grab; transition: box-shadow 0.15s, transform 0.15s; font-size: 14px; color: #111827; }
.kanban-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.12); transform: translateY(-1px); }
.kanban-card:active { cursor: grabbing; }
.kanban-card-label { display: inline-block; font-size: 11px; font-weight: 600; border-radius: 4px; padding: 2px 7px; margin-bottom: 8px; }
.kanban-card-title { font-weight: 500; margin-bottom: 6px; line-height: 1.4; }
.kanban-card-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; font-size: 12px; color: #9ca3af; }
.kanban-add-btn { display: flex; align-items: center; gap: 6px; width: 100%; padding: 8px 10px; border: 2px dashed #d1d5db; border-radius: 8px; background: transparent; color: #9ca3af; font-size: 13px; cursor: pointer; transition: border-color 0.15s, color 0.15s; }
.kanban-add-btn:hover { border-color: #3b82f6; color: #3b82f6; }

/* ── Timeline / Activity Feed ── */
.timeline { display: flex; flex-direction: column; }
.timeline-item { display: flex; gap: 16px; position: relative; padding-bottom: 24px; }
.timeline-item:last-child { padding-bottom: 0; }
.timeline-item:not(:last-child) .timeline-dot::after { content: ''; position: absolute; top: 32px; left: 15px; bottom: 0; width: 2px; background-color: #e5e7eb; }
.timeline-dot { flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; background-color: #e5e7eb; border: 2px solid #fff; box-shadow: 0 0 0 2px #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 14px; position: relative; z-index: 1; }
.timeline-dot-blue   { background-color: #3b82f6; box-shadow: 0 0 0 2px #bfdbfe; color: #fff; }
.timeline-dot-green  { background-color: #22c55e; box-shadow: 0 0 0 2px #bbf7d0; color: #fff; }
.timeline-dot-red    { background-color: #ef4444; box-shadow: 0 0 0 2px #fecaca; color: #fff; }
.timeline-dot-yellow { background-color: #f59e0b; box-shadow: 0 0 0 2px #fde68a; color: #fff; }
.timeline-body { flex: 1; min-width: 0; padding-top: 4px; }
.timeline-time { font-size: 12px; color: #9ca3af; margin-bottom: 4px; }
.timeline-title { font-size: 14px; font-weight: 500; color: #111827; margin-bottom: 4px; }
.timeline-desc { font-size: 13px; color: #6b7280; line-height: 1.5; }
.timeline-card { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; margin-top: 8px; font-size: 13px; color: #374151; }
.timeline-compact .timeline-item { padding-bottom: 12px; }
.timeline-compact .timeline-dot { width: 22px; height: 22px; font-size: 11px; }
.timeline-compact .timeline-item:not(:last-child) .timeline-dot::after { left: 10px; top: 22px; }

/* ── File Upload Dropzone ── */
.dropzone { border: 2px dashed #d1d5db; border-radius: 12px; padding: 40px 24px; text-align: center; background-color: #f9fafb; transition: border-color 0.2s, background-color 0.2s; cursor: pointer; }
.dropzone:hover, .dropzone.drag-over { border-color: #3b82f6; background-color: #eff6ff; }
.dropzone-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.5; line-height: 1; }
.dropzone-title { font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 6px; }
.dropzone-desc { font-size: 13px; color: #9ca3af; margin-bottom: 16px; }
.dropzone-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 18px; font-size: 13px; font-weight: 600; border-radius: 8px; background-color: #3b82f6; color: #fff; border: none; cursor: pointer; transition: background-color 0.15s; }
.dropzone-btn:hover { background-color: #2563eb; }
.dropzone-types { font-size: 12px; color: #9ca3af; margin-top: 10px; }
.dropzone-sm { padding: 20px 16px; }
.dropzone-sm .dropzone-icon { font-size: 28px; }
.file-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.file-list-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #fff; font-size: 13px; }
.file-list-name { flex: 1; font-weight: 500; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-list-size { color: #9ca3af; white-space: nowrap; }
.file-list-remove { color: #9ca3af; cursor: pointer; font-size: 18px; line-height: 1; padding: 0 2px; border: none; background: none; transition: color 0.1s; }
.file-list-remove:hover { color: #ef4444; }

/* ── Mega Menu ── */
.mega-menu-wrap { position: relative; }
.mega-menu { position: absolute; top: 100%; left: 0; min-width: 640px; background-color: #fff; border: 1px solid #e5e7eb; border-radius: 14px; box-shadow: 0 20px 40px rgba(0,0,0,.12); z-index: 300; padding: 20px; display: none; animation: santy-zoom-in 0.15s ease; }
.mega-menu.open, .mega-menu-wrap:hover .mega-menu { display: flex; }
.mega-menu-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; width: 100%; }
.mega-menu-col-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #9ca3af; margin-bottom: 10px; }
.mega-menu-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px; border-radius: 8px; text-decoration: none; transition: background-color 0.12s; cursor: pointer; }
.mega-menu-item:hover { background-color: #f3f4f6; }
.mega-menu-item-icon { width: 36px; height: 36px; border-radius: 8px; background-color: #eff6ff; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.mega-menu-item-title { font-size: 14px; font-weight: 500; color: #111827; }
.mega-menu-item-desc { font-size: 12px; color: #6b7280; margin-top: 2px; line-height: 1.4; }
.mega-menu-footer { margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: #6b7280; }

/* ── Split Pane ── */
.split-pane { display: flex; height: 100%; overflow: hidden; }
.split-pane-vertical { flex-direction: column; }
.split-pane-panel { overflow: auto; flex: 1; min-width: 0; min-height: 0; }
.split-pane-divider { flex-shrink: 0; background-color: #e5e7eb; transition: background-color 0.15s; position: relative; z-index: 1; }
.split-pane:not(.split-pane-vertical) .split-pane-divider { width: 5px; cursor: col-resize; }
.split-pane.split-pane-vertical .split-pane-divider { height: 5px; cursor: row-resize; }
.split-pane-divider:hover, .split-pane-divider.dragging { background-color: #3b82f6; }
.split-pane-divider::after { content: ''; position: absolute; inset: -4px; }

/* ── Rating / Stars ── */
.rating { display: inline-flex; gap: 2px; align-items: center; }
.rating-star { font-size: 20px; color: #d1d5db; cursor: pointer; transition: color 0.1s, transform 0.1s; line-height: 1; user-select: none; }
.rating-star:hover, .rating-star.filled { color: #f59e0b; }
.rating-star:hover { transform: scale(1.15); }
.rating-sm .rating-star { font-size: 14px; }
.rating-lg .rating-star { font-size: 28px; }
.rating-readonly .rating-star { cursor: default; pointer-events: none; }
.rating-readonly .rating-star:hover { transform: none; }
.rating-value { font-size: 14px; font-weight: 600; color: #374151; margin-left: 6px; }
.rating-count { font-size: 13px; color: #9ca3af; margin-left: 4px; }

/* ── Code Block ── */
.code-block { position: relative; border-radius: 10px; background-color: #1e293b; color: #e2e8f0; font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace; font-size: 13px; line-height: 1.7; overflow: hidden; }
.code-block-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background-color: #0f172a; border-bottom: 1px solid rgba(255,255,255,0.07); }
.code-block-lang { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.07em; }
.code-block-dots { display: flex; gap: 6px; }
.code-block-dot { width: 12px; height: 12px; border-radius: 50%; }
.code-block-dot-red    { background-color: #ef4444; }
.code-block-dot-yellow { background-color: #f59e0b; }
.code-block-dot-green  { background-color: #22c55e; }
.code-block-copy { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; font-size: 12px; font-weight: 500; border-radius: 6px; border: 1px solid rgba(255,255,255,0.12); background-color: rgba(255,255,255,0.06); color: #94a3b8; cursor: pointer; transition: background-color 0.15s, color 0.15s; }
.code-block-copy:hover { background-color: rgba(255,255,255,0.12); color: #e2e8f0; }
.code-block-copy.copied { color: #22c55e; border-color: rgba(34,197,94,0.3); }
.code-block pre { margin: 0; padding: 16px 20px; overflow-x: auto; }
.code-block code { background: none; padding: 0; border-radius: 0; font-size: inherit; color: inherit; }
.code-block-line-numbers pre { padding-left: 0; }
.code-block-gutter { display: inline-flex; flex-direction: column; padding: 16px 12px 16px 16px; text-align: right; user-select: none; border-right: 1px solid rgba(255,255,255,0.07); color: #475569; font-size: 13px; line-height: 1.7; }
.code-block-inner { display: flex; }
.token-keyword { color: #c084fc; }
.token-string  { color: #86efac; }
.token-comment { color: #475569; font-style: italic; }
.token-number  { color: #fb923c; }
.token-fn      { color: #60a5fa; }
.token-tag     { color: #f87171; }
.token-attr    { color: #fbbf24; }
`);


// ─── DROPDOWN + DARK MODE VARIANTS ───────────────────────────────────────────
add(`
/* ── Dropdown ── */
.dropdown { position: relative; display: inline-block; }
.dropdown-toggle { cursor: pointer; }
.dropdown-menu {
  display: none;
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 180px;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: var(--santy-shadow-md);
  z-index: 200;
  padding: 4px;
  animation: santy-zoom-in 0.15s ease;
}
.dropdown-menu-right { left: auto; right: 0; }
.dropdown-menu-top   { top: auto; bottom: calc(100% + 4px); }
.dropdown.open .dropdown-menu,
.dropdown-toggle:focus + .dropdown-menu,
.dropdown-menu:target { display: block; }
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: #374151;
  text-decoration: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.1s;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
}
.dropdown-item:hover { background-color: #f3f4f6; color: #111827; }
.dropdown-item.active { background-color: #eff6ff; color: #2563eb; }
.dropdown-item.danger { color: #dc2626; }
.dropdown-item.danger:hover { background-color: #fef2f2; }
.dropdown-item:disabled, .dropdown-item.disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
.dropdown-divider { height: 1px; background-color: #e5e7eb; margin: 4px 0; }
.dropdown-header { padding: 6px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; }

/* ── Component Variant System ──────────────────────────────────────────── */
/* Usage: make-button style-success size-large shape-pill */

/* make-button */
.make-button {
  display:inline-flex; align-items:center; justify-content:center;
  gap:8px; padding:9px 20px; font-size:14px; font-weight:600;
  border-radius:8px; border:2px solid transparent; cursor:pointer;
  text-decoration:none; transition:all 0.2s; line-height:1.25; white-space:nowrap;
}
.make-button:disabled { opacity:.5; cursor:not-allowed; }
.make-button.style-primary   { background:#3b82f6; color:#fff; border-color:#3b82f6; }
.make-button.style-primary:hover { background:#2563eb; border-color:#2563eb; }
.make-button.style-secondary { background:#6b7280; color:#fff; border-color:#6b7280; }
.make-button.style-secondary:hover { background:#4b5563; border-color:#4b5563; }
.make-button.style-success   { background:#22c55e; color:#fff; border-color:#22c55e; }
.make-button.style-success:hover { background:#16a34a; border-color:#16a34a; }
.make-button.style-danger    { background:#ef4444; color:#fff; border-color:#ef4444; }
.make-button.style-danger:hover  { background:#dc2626; border-color:#dc2626; }
.make-button.style-warning   { background:#f59e0b; color:#fff; border-color:#f59e0b; }
.make-button.style-warning:hover { background:#d97706; border-color:#d97706; }
.make-button.style-info      { background:#06b6d4; color:#fff; border-color:#06b6d4; }
.make-button.style-info:hover { background:#0891b2; border-color:#0891b2; }
.make-button.style-outline   { background:transparent; border-color:currentColor; }
.make-button.style-outline:hover { background:rgba(0,0,0,.05); }
.make-button.style-ghost     { background:transparent; border-color:transparent; }
.make-button.style-ghost:hover { background:rgba(0,0,0,.05); }
.make-button.style-dark      { background:#1e293b; color:#f1f5f9; border-color:#1e293b; }
.make-button.style-dark:hover { background:#0f172a; border-color:#0f172a; }
.make-button.style-light     { background:#f3f4f6; color:#374151; border-color:#e5e7eb; }
.make-button.style-light:hover { background:#e5e7eb; }
.make-button.size-tiny   { padding:2px 8px;   font-size:11px; border-radius:4px; }
.make-button.size-small  { padding:5px 14px;  font-size:12px; border-radius:6px; }
.make-button.size-large  { padding:12px 28px; font-size:16px; border-radius:10px; }
.make-button.size-xl     { padding:16px 36px; font-size:18px; border-radius:12px; }
.make-button.size-full   { width:100%; justify-content:center; }
.make-button.shape-pill   { border-radius:9999px; }
.make-button.shape-square { border-radius:0; }
.make-button.shape-rounded { border-radius:14px; }

/* make-card */
.make-card { background:#fff; border-radius:12px; box-shadow:var(--santy-shadow); overflow:hidden; }
.make-card.style-bordered  { border:1px solid #e5e7eb; box-shadow:none; }
.make-card.style-elevated  { box-shadow:0 10px 40px -8px rgba(0,0,0,.15); }
.make-card.style-flat      { box-shadow:none; }
.make-card.style-dark      { background:#1e293b; color:#f1f5f9; }
.make-card.shape-pill      { border-radius:9999px; }
.make-card.shape-square    { border-radius:0; }
.make-card.shape-rounded   { border-radius:20px; }
.make-card.size-small      { border-radius:8px; }
.make-card.size-large      { border-radius:20px; }

/* make-badge */
.make-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; font-size:12px; font-weight:600; border-radius:9999px; line-height:1.4; }
.make-badge.style-primary   { background:#dbeafe; color:#1d4ed8; }
.make-badge.style-secondary { background:#f3f4f6; color:#374151; }
.make-badge.style-success   { background:#dcfce7; color:#15803d; }
.make-badge.style-danger    { background:#fee2e2; color:#b91c1c; }
.make-badge.style-warning   { background:#fef3c7; color:#b45309; }
.make-badge.style-info      { background:#cffafe; color:#0e7490; }
.make-badge.style-dark      { background:#1e293b; color:#f1f5f9; }
.make-badge.style-outline   { background:transparent; border:1.5px solid currentColor; }
.make-badge.size-small      { padding:1px 7px; font-size:10px; }
.make-badge.size-large      { padding:5px 14px; font-size:14px; }
.make-badge.shape-square    { border-radius:4px; }
.make-badge.shape-rounded   { border-radius:6px; }

/* make-alert */
.make-alert { display:flex; align-items:flex-start; gap:12px; padding:14px 16px; border-radius:10px; font-size:14px; border:1px solid transparent; line-height:1.5; }
.make-alert.style-info    { background:#eff6ff; border-color:#bfdbfe; color:#1d4ed8; }
.make-alert.style-success { background:#f0fdf4; border-color:#bbf7d0; color:#15803d; }
.make-alert.style-warning { background:#fffbeb; border-color:#fde68a; color:#b45309; }
.make-alert.style-danger  { background:#fef2f2; border-color:#fecaca; color:#b91c1c; }
.make-alert.style-dark    { background:#1e293b; border-color:#334155; color:#f1f5f9; }
.make-alert.size-small    { padding:10px 12px; font-size:13px; border-radius:8px; }
.make-alert.size-large    { padding:20px; font-size:16px; border-radius:12px; }
.make-alert.shape-square  { border-radius:0; }
.make-alert.shape-pill    { border-radius:9999px; padding-left:24px; }

/* make-input */
.make-input { display:block; width:100%; padding:9px 12px; font-size:14px; font-family:inherit; color:#111827; background:#fff; border:1.5px solid #d1d5db; border-radius:8px; transition:border-color .15s,box-shadow .15s; outline:none; line-height:1.5; }
.make-input:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.2); }
.make-input.style-error   { border-color:#ef4444; }
.make-input.style-error:focus { box-shadow:0 0 0 3px rgba(239,68,68,.2); }
.make-input.style-success { border-color:#22c55e; }
.make-input.size-small    { padding:4px 8px;   font-size:12px; border-radius:6px; }
.make-input.size-large    { padding:12px 16px; font-size:16px; border-radius:10px; }
.make-input.shape-pill    { border-radius:9999px; padding-left:20px; }
.make-input.shape-square  { border-radius:0; }

/* make-avatar */
.make-avatar { display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:50%; background:#e5e7eb; color:#374151; font-weight:600; font-size:14px; overflow:hidden; flex-shrink:0; }
.make-avatar img { width:100%; height:100%; object-fit:cover; }
.make-avatar.size-tiny   { width:24px;  height:24px;  font-size:10px; }
.make-avatar.size-small  { width:32px;  height:32px;  font-size:12px; }
.make-avatar.size-large  { width:56px;  height:56px;  font-size:18px; }
.make-avatar.size-xl     { width:80px;  height:80px;  font-size:24px; }
.make-avatar.shape-square  { border-radius:8px; }
.make-avatar.shape-rounded { border-radius:12px; }
.make-avatar.style-primary { background:#dbeafe; color:#1d4ed8; }
.make-avatar.style-success { background:#dcfce7; color:#15803d; }
.make-avatar.style-danger  { background:#fee2e2; color:#b91c1c; }
.make-avatar.style-warning { background:#fef3c7; color:#b45309; }
.make-avatar.style-dark    { background:#1e293b; color:#f1f5f9; }

/* make-spinner */
.make-spinner { display:inline-block; width:24px; height:24px; border:3px solid #e5e7eb; border-top-color:#3b82f6; border-radius:50%; animation:santy-spin .75s linear infinite; }
.make-spinner.size-tiny   { width:14px; height:14px; border-width:2px; }
.make-spinner.size-small  { width:18px; height:18px; border-width:2px; }
.make-spinner.size-large  { width:40px; height:40px; border-width:4px; }
.make-spinner.size-xl     { width:56px; height:56px; border-width:5px; }
.make-spinner.style-success { border-top-color:#22c55e; }
.make-spinner.style-danger  { border-top-color:#ef4444; }
.make-spinner.style-warning { border-top-color:#f59e0b; }
.make-spinner.style-dark    { border-color:#334155; border-top-color:#f1f5f9; }

/* make-skeleton */
.make-skeleton { background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation:santy-shimmer 1.5s infinite; border-radius:6px; }
.make-skeleton.shape-circle  { border-radius:50%; }
.make-skeleton.shape-pill    { border-radius:9999px; }
.make-skeleton.shape-square  { border-radius:0; }
.make-skeleton.size-small { height:12px; }
.make-skeleton.size-large { height:24px; }

/* make-progress */
.make-progress { width:100%; background:#e5e7eb; border-radius:9999px; overflow:hidden; }
.make-progress > .bar { height:8px; background:#3b82f6; border-radius:9999px; transition:width .4s ease; }
.make-progress.style-success > .bar { background:#22c55e; }
.make-progress.style-danger  > .bar { background:#ef4444; }
.make-progress.style-warning > .bar { background:#f59e0b; }
.make-progress.style-dark    > .bar { background:#1e293b; }
.make-progress.size-small > .bar    { height:4px; }
.make-progress.size-large > .bar    { height:14px; }
.make-progress.shape-square { border-radius:0; }
.make-progress.shape-square > .bar  { border-radius:0; }

/* make-table */
.make-table { width:100%; border-collapse:collapse; font-size:14px; }
.make-table th,.make-table td { padding:10px 12px; text-align:left; border-bottom:1px solid #e5e7eb; }
.make-table thead tr { background:#f9fafb; }
.make-table thead th { font-weight:600; color:#374151; font-size:12px; text-transform:uppercase; letter-spacing:.05em; }
.make-table.style-striped tbody tr:nth-child(even) { background:#f9fafb; }
.make-table.style-bordered { border:1px solid #e5e7eb; }
.make-table.style-bordered th,.make-table.style-bordered td { border:1px solid #e5e7eb; }
.make-table.style-hover tbody tr:hover { background:#f3f4f6; cursor:pointer; }
.make-table.style-dark { background:#1e293b; color:#f1f5f9; }
.make-table.style-dark th,.make-table.style-dark td { border-color:#334155; }
.make-table.style-dark thead tr { background:#0f172a; }
.make-table.size-small th,.make-table.size-small td { padding:6px 10px; font-size:13px; }
.make-table.size-large th,.make-table.size-large td { padding:14px 16px; font-size:15px; }

/* make-navbar */
.make-navbar { display:flex; align-items:center; justify-content:space-between; padding:12px 24px; background:#fff; border-bottom:1px solid #e5e7eb; gap:16px; }
.make-navbar.style-dark        { background:#1e293b; border-color:#334155; color:#f1f5f9; }
.make-navbar.style-glass       { background:rgba(255,255,255,.8); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); }
.make-navbar.style-transparent { background:transparent; border-color:transparent; }
.make-navbar.style-dark.style-glass { background:rgba(15,23,42,.85); }
.make-navbar.size-small        { padding:8px 16px; }
.make-navbar.size-large        { padding:20px 32px; }
.make-navbar.shape-sticky      { position:sticky; top:0; z-index:50; }

/* make-tooltip */
.make-tooltip { position:relative; display:inline-block; }
.make-tooltip .tip { visibility:hidden; opacity:0; position:absolute; z-index:100; background:#1f2937; color:#f9fafb; font-size:12px; padding:5px 10px; border-radius:6px; white-space:nowrap; pointer-events:none; transition:opacity .15s; line-height:1.4; }
.make-tooltip:hover .tip { visibility:visible; opacity:1; }
.make-tooltip.style-top    .tip { bottom:calc(100% + 8px); left:50%; transform:translateX(-50%); }
.make-tooltip.style-bottom .tip { top:calc(100% + 8px);    left:50%; transform:translateX(-50%); }
.make-tooltip.style-left   .tip { right:calc(100% + 8px);  top:50%;  transform:translateY(-50%); }
.make-tooltip.style-right  .tip { left:calc(100% + 8px);   top:50%;  transform:translateY(-50%); }
.make-tooltip.style-light  .tip { background:#fff; color:#111827; box-shadow:0 4px 12px rgba(0,0,0,.15); }

/* make-notification */
.make-notification { display:flex; align-items:flex-start; gap:12px; padding:14px 16px; border-radius:10px; font-size:14px; border:1px solid transparent; line-height:1.4; }
.make-notification.style-info    { background:#eff6ff; border-color:#bfdbfe; color:#1d4ed8; }
.make-notification.style-success { background:#f0fdf4; border-color:#bbf7d0; color:#15803d; }
.make-notification.style-warning { background:#fffbeb; border-color:#fde68a; color:#b45309; }
.make-notification.style-danger  { background:#fef2f2; border-color:#fecaca; color:#b91c1c; }
.make-notification.style-dark    { background:#1e293b; border-color:#334155; color:#f1f5f9; }
.make-notification.size-small    { padding:10px 12px; font-size:13px; }
.make-notification.size-large    { padding:20px; font-size:15px; }

/* make-modal */
.make-modal { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:200; display:none; align-items:center; justify-content:center; padding:16px; }
.make-modal:target { display:flex; }
.make-modal > .box { background:#fff; border-radius:16px; box-shadow:0 25px 50px -12px rgba(0,0,0,.25); max-width:560px; width:100%; max-height:90vh; overflow-y:auto; animation:santy-zoom-in .25s ease; }
.make-modal.size-small > .box { max-width:400px; }
.make-modal.size-large > .box { max-width:768px; }
.make-modal.size-xl    > .box { max-width:1024px; }
.make-modal.size-full  > .box { max-width:100%; height:100vh; border-radius:0; max-height:100vh; }
.make-modal.shape-square > .box { border-radius:0; }
.make-modal.style-dark > .box { background:#1e293b; color:#f1f5f9; }

/* make-drawer */
.make-drawer { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:200; display:none; }
.make-drawer:target { display:block; }
.make-drawer > .panel { position:fixed; top:0; bottom:0; left:0; width:300px; background:#fff; z-index:201; overflow-y:auto; box-shadow:4px 0 24px rgba(0,0,0,.12); transform:translateX(-100%); transition:transform .3s ease; }
.make-drawer:target > .panel { transform:translateX(0); }
.make-drawer.style-right > .panel { left:auto; right:0; transform:translateX(100%); box-shadow:-4px 0 24px rgba(0,0,0,.12); }
.make-drawer:target.style-right > .panel { transform:translateX(0); }
.make-drawer.style-dark > .panel { background:#1e293b; color:#f1f5f9; }
.make-drawer.size-small > .panel { width:220px; }
.make-drawer.size-large > .panel { width:420px; }

/* make-accordion */
.make-accordion { border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; }
.make-accordion.style-flush  { border:none; border-radius:0; }
.make-accordion.style-dark   { background:#1e293b; border-color:#334155; color:#f1f5f9; }
.make-accordion.shape-square { border-radius:0; }
.make-accordion.shape-rounded { border-radius:16px; }

/* make-dropdown */
.make-dropdown { position:relative; display:inline-block; }
.make-dropdown > .menu { display:none; position:absolute; top:calc(100% + 4px); left:0; min-width:180px; background:#fff; border:1px solid #e5e7eb; border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,.1); z-index:100; overflow:hidden; padding:4px; }
.make-dropdown.open > .menu { display:block; }
.make-dropdown.style-right > .menu { left:auto; right:0; }
.make-dropdown.style-top   > .menu { top:auto; bottom:calc(100% + 4px); }
.make-dropdown.style-dark  > .menu { background:#1e293b; border-color:#334155; }
.make-dropdown.size-small  > .menu { min-width:140px; font-size:13px; }
.make-dropdown.size-large  > .menu { min-width:240px; font-size:15px; }

/* ── Dark Mode Component Variants ── */
@media (prefers-color-scheme: dark) {
  .dark-auto .card         { background-color: #1e293b; }
  .dark-auto .card-header  { border-color: #334155; }
  .dark-auto .card-footer  { border-color: #334155; }
  .dark-auto .btn-outline  { border-color: #475569; color: #e2e8f0; }
  .dark-auto .input        { background-color: #1e293b; border-color: #334155; color: #f1f5f9; }
  .dark-auto .input::placeholder { color: #64748b; }
  .dark-auto .select       { background-color: #1e293b; border-color: #334155; color: #f1f5f9; }
}
/* Manual dark mode via .dark class on html/body */
.dark .card         { background-color: #1e293b; color: #f1f5f9; }
.dark .card-header  { border-color: #334155; }
.dark .card-footer  { border-color: #334155; }
.dark .card-body    { color: #cbd5e1; }
.dark .input        { background-color: #1e293b; border-color: #334155; color: #f1f5f9; }
.dark .input:focus  { border-color: #3b82f6; }
.dark .select       { background-color: #1e293b; border-color: #334155; color: #f1f5f9; }
.dark .textarea     { background-color: #1e293b; border-color: #334155; color: #f1f5f9; }
.dark .dropdown-menu { background-color: #1e293b; border-color: #334155; }
.dark .dropdown-item { color: #e2e8f0; }
.dark .dropdown-item:hover { background-color: #334155; color: #f1f5f9; }
.dark .list-group-item { background-color: #1e293b; border-color: #334155; color: #e2e8f0; }
.dark .list-group-item:hover { background-color: #334155; }
.dark .table th, .dark .table td { border-color: #334155; }
.dark .table thead tr { background-color: #0f172a; }
.dark .table thead th { color: #94a3b8; }
.dark .modal-box { background-color: #1e293b; color: #f1f5f9; }
.dark .modal-header { border-color: #334155; }
.dark .modal-footer { border-color: #334155; }
.dark .accordion { border-color: #334155; }
.dark .accordion-item { border-color: #334155; }
.dark .accordion-header { background-color: #1e293b; color: #f1f5f9; }
.dark .accordion-header:hover { background-color: #334155; }
.dark .accordion-body { background-color: #1e293b; color: #94a3b8; }
.dark .tabs { border-color: #334155; }
.dark .tabs-item { color: #94a3b8; }
.dark .tabs-item:hover { color: #e2e8f0; }
.dark .tabs-pill { background-color: #0f172a; }
.dark .tabs-pill .tabs-item.active { background-color: #1e293b; color: #f1f5f9; }
/* Dark buttons */
.dark .btn-outline { border-color: #475569; color: #e2e8f0; }
.dark .btn-outline:hover { background-color: #334155; }
.dark .btn-ghost { color: #cbd5e1; }
.dark .btn-ghost:hover { background-color: #334155; }
.dark .btn-secondary { background-color: #334155; color: #f1f5f9; border-color: #475569; }
.dark .btn-secondary:hover { background-color: #475569; }
/* Dark alerts */
.dark .alert { background-color: #1e293b; border-color: #334155; color: #e2e8f0; }
.dark .alert-info    { background-color: #0c1a2e; border-color: #1e3a5f; color: #93c5fd; }
.dark .alert-success { background-color: #052e16; border-color: #166534; color: #86efac; }
.dark .alert-warning { background-color: #2d1b00; border-color: #92400e; color: #fcd34d; }
.dark .alert-danger  { background-color: #2d0a0a; border-color: #991b1b; color: #fca5a5; }
/* Dark badges */
.dark .badge { background-color: #334155; color: #e2e8f0; }
/* Dark notifications */
.dark .notification { background-color: #1e293b; border-color: #334155; color: #e2e8f0; }
.dark .notification-success { background-color: #052e16; border-color: #166534; }
.dark .notification-error   { background-color: #2d0a0a; border-color: #991b1b; }
.dark .notification-warning { background-color: #2d1b00; border-color: #92400e; }
/* Dark breadcrumb + pagination */
.dark .breadcrumb-item { color: #94a3b8; }
.dark .breadcrumb-item.active { color: #e2e8f0; }
.dark .page-link { background-color: #1e293b; border-color: #334155; color: #e2e8f0; }
.dark .page-item.active .page-link { background-color: #3b82f6; border-color: #3b82f6; color: #fff; }
.dark .page-item.disabled .page-link { opacity: 0.4; }
/* Dark navbar */
.dark .navbar { background-color: #0f172a; border-color: #1e293b; }
.dark .navbar-brand { color: #f1f5f9; }
.dark .navbar-item { color: #94a3b8; }
.dark .navbar-item:hover { background-color: #1e293b; color: #f1f5f9; }
/* Dark drawer */
.dark .drawer-panel { background-color: #1e293b; }
.dark .drawer-header { border-color: #334155; color: #f1f5f9; }
.dark .drawer-body { color: #cbd5e1; }
/* Dark steps */
.dark .step-dot { background-color: #334155; color: #94a3b8; }
.dark .step.active .step-dot { background-color: #3b82f6; color: #fff; }
.dark .step.done .step-dot { background-color: #22c55e; color: #fff; }
.dark .step-label { color: #94a3b8; }
.dark .step.active .step-label { color: #f1f5f9; }

/* ── Container Queries (modern CSS) ── */
@container (min-width: 400px) { .cq-sm\\:make-flex { display: flex; } .cq-sm\\:grid-cols-2 { grid-template-columns: repeat(2,1fr); } }
@container (min-width: 600px) { .cq-md\\:grid-cols-3 { grid-template-columns: repeat(3,1fr); } .cq-md\\:make-flex { display: flex; } }
@container (min-width: 800px) { .cq-lg\\:grid-cols-4 { grid-template-columns: repeat(4,1fr); } }
.container-query { container-type: inline-size; }
.container-query-size { container-type: size; }
`);

// ─── DARK THEME TOKENS + UI COMPONENTS (v1.4) ─────────────────────────────────
add(`
/* ── Dark Theme CSS Tokens ── */
:root {
  --color-surface:      #0f172a;
  --color-card:         #1e293b;
  --color-accent:       #38bdf8;
  --color-accent-light: rgba(56,189,248,.13);
  --color-text:         #f1f5f9;
  --color-muted:        #64748b;
  --color-warning:      #facc15;
}

/* ── Semantic Color Utilities ── */
.bg-surface      { background-color: var(--color-surface); }
.bg-accent-light { background-color: var(--color-accent-light); }
.text-accent     { color: var(--color-accent); }
.text-primary    { color: var(--color-text); }
.text-muted      { color: var(--color-muted); }

/* ── Badge Color Variants ── */
.badge-green  { background-color: rgba(22,163,74,.13);  color: #4ade80; }
.badge-blue   { background-color: rgba(37,99,235,.13);  color: #60a5fa; }
.badge-yellow { background-color: rgba(202,138,4,.13);  color: #facc15; }
.badge-red    { background-color: rgba(220,38,38,.13);  color: #f87171; }

/* ── Named Height Utilities ── */
.h-xs { height: 24px; }
.h-sm { height: 48px; }
.h-md { height: 96px; }
.h-lg { height: 160px; }

/* ── Progress Bar Color Variants ── */
.progress-bar-green  { background-color: #22c55e; }
.progress-bar-red    { background-color: #ef4444; }
.progress-bar-yellow { background-color: #eab308; }
.progress-bar-purple { background-color: #8b5cf6; }
.progress-bar-orange { background-color: #f97316; }

/* ── Slider (Range — dark-themed) ── */
.slider { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; border-radius: 2px; background: var(--color-card, #1e293b); outline: none; cursor: pointer; }
.slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--color-accent, #38bdf8); cursor: pointer; box-shadow: 0 0 0 3px rgba(56,189,248,.2); }
.slider::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: var(--color-accent, #38bdf8); cursor: pointer; border: none; }

/* ── Stat Card ── */
.stat-card {
  background: var(--color-card, #1e293b);
  border-radius: 8px;
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

/* ── Button Icon ── */
.btn-icon {
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent-light, rgba(56,189,248,.13));
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-icon:hover { opacity: 0.8; }

/* ── Input Text (dark-theme) ── */
.input-text {
  flex: 1;
  width: 100%;
  background: var(--color-surface, #0f172a);
  border-radius: 8px;
  padding: 10px 14px;
  color: var(--color-text, #f1f5f9);
  font-size: 15px;
  min-height: 44px;
  border: 1px solid #334155;
  outline: none;
}
.input-text:focus { border-color: var(--color-accent, #38bdf8); }

/* ── Chat Bubbles ── */
.chat-bubble-user {
  align-self: flex-end;
  background: var(--color-accent-light, rgba(56,189,248,.13));
  border-radius: 16px 16px 4px 16px;
  padding: 10px 14px;
  max-width: 78%;
  color: var(--color-text, #f1f5f9);
}
.chat-bubble-ai {
  align-self: flex-start;
  background: var(--color-card, #1e293b);
  border-radius: 16px 16px 16px 4px;
  padding: 10px 14px;
  max-width: 78%;
  color: var(--color-text, #f1f5f9);
}

/* ── Typing Indicator ── */
.typing-indicator { display: flex; gap: 4px; padding: 10px; align-self: flex-start; }
.typing-indicator span { width: 8px; height: 8px; border-radius: 50%; background: var(--color-muted, #64748b); animation: santy-blink 1.2s ease-in-out infinite; }
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
@keyframes santy-blink { 0%, 80%, 100% { opacity: 0; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }

/* ── Calorie Ring (SVG ring chart wrapper) ── */
.calorie-ring { position: relative; display: inline-flex; align-items: center; justify-content: center; }

/* ── Scan Overlay ── */
.scan-overlay { position: absolute; border: 2px solid var(--color-accent, #38bdf8); border-radius: 12px; overflow: hidden; }

/* ── Scan Line Animated ── */
.scan-line-animated { position: absolute; left: 0; right: 0; height: 2px; background: var(--color-accent, #38bdf8); animation: santy-scan-sweep 1.8s ease-in-out infinite alternate; }
@keyframes santy-scan-sweep { from { top: 0%; } to { top: 100%; } }

/* ── Bar Chart Wrapper ── */
.bar-chart-wrapper { background: var(--color-card, #1e293b); border-radius: 12px; padding: 16px; overflow: hidden; }
`);

// (fullCSS is computed after ALL add() calls — see bottom of file)

// ─── EMAIL CSS MODULE ────────────────────────────────────────────────────────
const EMAIL_CSS = `
/* ═══════════════════════════════════════════════════════════════════════════
   SANTY EMAIL — Email-safe CSS for HTML email templates
   Compatible with: Gmail, Outlook, Apple Mail, Yahoo Mail, Thunderbird
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Reset & Base ── */
.email-html, .email-body { margin: 0; padding: 0; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
.email-wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f5; }
.email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }

/* ── Preheader (hidden preview text) ── */
.email-preheader { display: none; max-height: 0; max-width: 0; overflow: hidden; opacity: 0; visibility: hidden; mso-hide: all; font-size: 1px; color: transparent; }

/* ── Table Layout (email-safe) ── */
.email-table  { border-spacing: 0; border-collapse: collapse; width: 100%; }
.email-cell   { padding: 0; vertical-align: top; word-break: break-word; }
.email-cell-middle { vertical-align: middle; }
.email-cell-bottom { vertical-align: bottom; }
.email-row    { width: 100%; }
.email-col-half  { width: 50%; vertical-align: top; }
.email-col-third { width: 33.33%; vertical-align: top; }
.email-col-two-thirds { width: 66.66%; vertical-align: top; }

/* ── Header ── */
.email-header       { background-color: #1e293b; padding: 24px 32px; text-align: center; }
.email-header-light { background-color: #ffffff; padding: 20px 32px; border-bottom: 1px solid #e5e7eb; }
.email-logo         { max-width: 160px; height: auto; display: block; margin: 0 auto; }
.email-logo-left    { margin: 0; }

/* ── Body Wrapper ── */
.email-body-wrap        { background-color: #ffffff; padding: 40px 32px; }
.email-body-wrap-gray   { background-color: #f9fafb; padding: 32px; }
.email-section          { padding: 24px 0; }
.email-section-bordered { border-bottom: 1px solid #e5e7eb; padding: 24px 0; }

/* ── Footer ── */
.email-footer      { background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb; }
.email-footer-dark { background-color: #0f172a; border-top-color: #1e293b; }

/* ── Typography ── */
.email-h1 { font-size: 28px; font-weight: 700; color: #111827; margin: 0 0 16px 0; line-height: 1.2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
.email-h2 { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 12px 0; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
.email-h3 { font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 10px 0; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
.email-p  { font-size: 15px; line-height: 1.7; color: #374151; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
.email-p-lead { font-size: 18px; line-height: 1.6; color: #374151; margin: 0 0 20px 0; }
.email-small { font-size: 12px; color: #6b7280; line-height: 1.5; }
.email-muted { color: #9ca3af; font-size: 13px; }
.email-link  { color: #3b82f6; text-decoration: underline; }
.email-link:hover { color: #2563eb; }
.email-text-center { text-align: center; }
.email-text-left   { text-align: left; }
.email-text-right  { text-align: right; }
.email-bold   { font-weight: 700; }
.email-semibold { font-weight: 600; }

/* ── Buttons ── */
.email-btn         { display: inline-block; padding: 13px 28px; background-color: #3b82f6; color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; mso-padding-alt: 0; }
.email-btn-sm      { padding: 9px 20px; font-size: 13px; }
.email-btn-lg      { padding: 16px 36px; font-size: 17px; }
.email-btn-outline { display: inline-block; padding: 11px 26px; background-color: transparent; color: #3b82f6 !important; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; border: 2px solid #3b82f6; }
.email-btn-dark    { background-color: #1e293b; color: #ffffff !important; }
.email-btn-success { background-color: #22c55e; color: #ffffff !important; }
.email-btn-danger  { background-color: #ef4444; color: #ffffff !important; }
.email-btn-warning { background-color: #f59e0b; color: #ffffff !important; }
.email-btn-center  { text-align: center; padding: 24px 0; }
.email-btn-full    { display: block; text-align: center; }

/* ── Dividers ── */
.email-divider      { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
.email-divider-dark { border-top-color: #334155; }
.email-divider-thick { border-top: 3px solid #3b82f6; }

/* ── Cards & Callouts ── */
.email-card         { background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 24px; }
.email-card-gray    { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 24px; }
.email-callout         { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 0 0 16px 0; }
.email-callout-success { background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px 20px; margin: 0 0 16px 0; }
.email-callout-warning { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px 20px; margin: 0 0 16px 0; }
.email-callout-danger  { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 20px; margin: 0 0 16px 0; }
.email-highlight    { background-color: #fef9c3; padding: 2px 6px; border-radius: 3px; }

/* ── Hero Section ── */
.email-hero         { padding: 48px 32px; text-align: center; background-color: #1e40af; }
.email-hero-light   { padding: 48px 32px; text-align: center; background-color: #eff6ff; }
.email-hero-gradient { padding: 48px 32px; text-align: center; background: linear-gradient(135deg, #1e40af, #7c3aed); }

/* ── Images ── */
.email-img         { max-width: 100%; height: auto; display: block; }
.email-img-rounded { border-radius: 8px; max-width: 100%; height: auto; display: block; }
.email-img-circle  { border-radius: 50%; }
.email-img-center  { margin: 0 auto; display: block; }
.email-img-full    { width: 100%; height: auto; display: block; }

/* ── Avatar ── */
.email-avatar-sm { width: 32px; height: 32px; border-radius: 50%; }
.email-avatar-md { width: 48px; height: 48px; border-radius: 50%; }
.email-avatar-lg { width: 64px; height: 64px; border-radius: 50%; }

/* ── List / Items ── */
.email-list       { padding: 0 0 0 20px; margin: 0 0 16px 0; }
.email-list li    { font-size: 15px; line-height: 1.7; color: #374151; margin-bottom: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
.email-check-list { list-style: none; padding: 0; margin: 0 0 16px 0; }
.email-check-list li { font-size: 15px; line-height: 1.7; color: #374151; margin-bottom: 8px; padding-left: 24px; position: relative; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
.email-check-list li::before { content: '✓'; position: absolute; left: 0; color: #22c55e; font-weight: 700; }

/* ── Product / Feature Rows ── */
.email-product-img  { width: 80px; height: 80px; border-radius: 8px; }
.email-product-name { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 4px 0; }
.email-product-desc { font-size: 13px; color: #6b7280; margin: 0; }
.email-product-price { font-size: 16px; font-weight: 700; color: #111827; }

/* ── Badges ── */
.email-badge         { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.email-badge-blue    { background-color: #dbeafe; color: #1d4ed8; }
.email-badge-green   { background-color: #dcfce7; color: #15803d; }
.email-badge-red     { background-color: #fee2e2; color: #dc2626; }
.email-badge-yellow  { background-color: #fef9c3; color: #a16207; }
.email-badge-purple  { background-color: #f3e8ff; color: #7e22ce; }
.email-badge-gray    { background-color: #f3f4f6; color: #374151; }
.email-badge-new     { background-color: #3b82f6; color: #ffffff; }

/* ── Stat Blocks ── */
.email-stat-value { font-size: 32px; font-weight: 700; color: #111827; line-height: 1; margin: 0 0 4px 0; }
.email-stat-label { font-size: 13px; color: #6b7280; margin: 0; }

/* ── Code Block ── */
.email-code { display: block; background-color: #1e293b; color: #e2e8f0; padding: 16px 20px; border-radius: 8px; font-family: 'Courier New', Courier, monospace; font-size: 13px; line-height: 1.6; }
.email-code-inline { background-color: #f1f5f9; color: #e11d48; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', Courier, monospace; font-size: 13px; }

/* ── Spacers ── */
.email-spacer-4  { height: 4px;  line-height: 4px;  font-size: 4px;  display: block; }
.email-spacer-8  { height: 8px;  line-height: 8px;  font-size: 8px;  display: block; }
.email-spacer-16 { height: 16px; line-height: 16px; font-size: 16px; display: block; }
.email-spacer-24 { height: 24px; line-height: 24px; font-size: 24px; display: block; }
.email-spacer-32 { height: 32px; line-height: 32px; font-size: 32px; display: block; }
.email-spacer-48 { height: 48px; line-height: 48px; font-size: 48px; display: block; }
.email-spacer-64 { height: 64px; line-height: 64px; font-size: 64px; display: block; }

/* ── Social Links ── */
.email-social-wrap { text-align: center; padding: 16px 0; }
.email-social-link { display: inline-block; margin: 0 6px; width: 36px; height: 36px; border-radius: 50%; background-color: #e5e7eb; text-align: center; line-height: 36px; text-decoration: none; font-size: 14px; color: #374151; }
.email-social-link-blue   { background-color: #dbeafe; color: #1d4ed8; }
.email-social-link-dark   { background-color: #334155; color: #e2e8f0; }
.email-social-text-link   { display: inline-block; margin: 0 8px; font-size: 13px; color: #6b7280; text-decoration: underline; }

/* ── Unsubscribe / Legal ── */
.email-legal    { font-size: 11px; color: #9ca3af; line-height: 1.6; text-align: center; }
.email-address  { font-size: 11px; color: #9ca3af; line-height: 1.6; }
.email-unsubscribe { font-size: 12px; color: #9ca3af; text-decoration: underline; }

/* ── Responsive (Mobile) ── */
@media screen and (max-width: 600px) {
  .email-container       { width: 100% !important; max-width: 100% !important; }
  .email-body-wrap       { padding: 24px 20px !important; }
  .email-header          { padding: 20px !important; }
  .email-footer          { padding: 20px !important; }
  .email-hero            { padding: 32px 20px !important; }
  .email-h1              { font-size: 22px !important; }
  .email-h2              { font-size: 18px !important; }
  .email-h3              { font-size: 16px !important; }
  .email-p-lead          { font-size: 16px !important; }
  .email-btn, .email-btn-outline { display: block !important; text-align: center !important; }
  .email-col-half, .email-col-third, .email-col-two-thirds { width: 100% !important; display: block !important; }
  .email-mobile-hidden   { display: none !important; max-height: 0 !important; overflow: hidden !important; }
  .email-mobile-visible  { display: block !important; }
  .email-mobile-full     { width: 100% !important; }
  .email-mobile-center   { text-align: center !important; }
  .email-mobile-padding  { padding: 16px !important; }
  .email-stat-value      { font-size: 24px !important; }
}

/* ── Dark Mode (Apple Mail, Outlook 2019+, Hey) ── */
@media (prefers-color-scheme: dark) {
  .email-wrapper, .email-body  { background-color: #0f172a !important; }
  .email-container             { background-color: #1e293b !important; }
  .email-body-wrap             { background-color: #1e293b !important; }
  .email-body-wrap-gray        { background-color: #0f172a !important; }
  .email-header-light          { background-color: #1e293b !important; border-bottom-color: #334155 !important; }
  .email-footer                { background-color: #0f172a !important; border-top-color: #1e293b !important; }
  .email-h1, .email-h2, .email-h3 { color: #f1f5f9 !important; }
  .email-p, .email-list li, .email-check-list li { color: #cbd5e1 !important; }
  .email-p-lead                { color: #e2e8f0 !important; }
  .email-card                  { background-color: #1e293b !important; border-color: #334155 !important; }
  .email-card-gray             { background-color: #0f172a !important; border-color: #334155 !important; }
  .email-divider               { border-top-color: #334155 !important; }
  .email-code                  { background-color: #0f172a !important; }
  .email-code-inline           { background-color: #334155 !important; color: #f472b6 !important; }
  .email-stat-value            { color: #f1f5f9 !important; }
  .email-product-name          { color: #f1f5f9 !important; }
  .email-product-price         { color: #f1f5f9 !important; }
  .email-social-link           { background-color: #334155 !important; color: #e2e8f0 !important; }
}
`;

// ── 20 new utility groups ──────────────────────────────────────────────────
add(`
/* ═══════════════════════════════════════════════════════════════════════════
   1. CONTAINER QUERIES
═══════════════════════════════════════════════════════════════════════════ */
.container-type-inline { container-type: inline-size; }
.container-type-size   { container-type: size; }
.container-type-normal { container-type: normal; }
.container-name-card   { container-name: card; }
.container-name-layout { container-name: layout; }
@container (min-width: 320px) { .on-container-xs\\:make-flex { display: flex; } .on-container-xs\\:make-block { display: block; } .on-container-xs\\:grid-cols-1 { grid-template-columns: repeat(1,1fr); } }
@container (min-width: 480px) { .on-container-sm\\:make-flex { display: flex; } .on-container-sm\\:make-grid { display: grid; } .on-container-sm\\:grid-cols-2 { grid-template-columns: repeat(2,1fr); } .on-container-sm\\:grid-cols-3 { grid-template-columns: repeat(3,1fr); } .on-container-sm\\:set-text-16 { font-size: 16px; } .on-container-sm\\:set-text-18 { font-size: 18px; } }
@container (min-width: 640px) { .on-container-md\\:make-flex { display: flex; } .on-container-md\\:make-grid { display: grid; } .on-container-md\\:grid-cols-2 { grid-template-columns: repeat(2,1fr); } .on-container-md\\:grid-cols-3 { grid-template-columns: repeat(3,1fr); } .on-container-md\\:grid-cols-4 { grid-template-columns: repeat(4,1fr); } .on-container-md\\:set-text-18 { font-size: 18px; } .on-container-md\\:set-text-20 { font-size: 20px; } }
@container (min-width: 768px) { .on-container-lg\\:make-flex { display: flex; } .on-container-lg\\:make-grid { display: grid; } .on-container-lg\\:grid-cols-3 { grid-template-columns: repeat(3,1fr); } .on-container-lg\\:grid-cols-4 { grid-template-columns: repeat(4,1fr); } .on-container-lg\\:set-text-20 { font-size: 20px; } .on-container-lg\\:set-text-24 { font-size: 24px; } .on-container-lg\\:make-hidden { display: none; } }
@container (min-width: 1024px) { .on-container-xl\\:grid-cols-4 { grid-template-columns: repeat(4,1fr); } .on-container-xl\\:grid-cols-6 { grid-template-columns: repeat(6,1fr); } .on-container-xl\\:set-text-24 { font-size: 24px; } }

/* ═══════════════════════════════════════════════════════════════════════════
   2. SCROLL UTILITIES
═══════════════════════════════════════════════════════════════════════════ */
.scroll-smooth   { scroll-behavior: smooth; }
.scroll-auto     { scroll-behavior: auto; }
.scroll-snap-x   { scroll-snap-type: x mandatory; overflow-x: scroll; }
.scroll-snap-y   { scroll-snap-type: y mandatory; overflow-y: scroll; }
.scroll-snap-x-proximity { scroll-snap-type: x proximity; overflow-x: scroll; }
.scroll-snap-y-proximity { scroll-snap-type: y proximity; overflow-y: scroll; }
.scroll-snap-start  { scroll-snap-align: start; }
.scroll-snap-center { scroll-snap-align: center; }
.scroll-snap-end    { scroll-snap-align: end; }
.scroll-snap-none   { scroll-snap-align: none; }
.scroll-snap-stop   { scroll-snap-stop: always; }
.overscroll-auto    { overscroll-behavior: auto; }
.overscroll-contain { overscroll-behavior: contain; }
.overscroll-none    { overscroll-behavior: none; }
.overscroll-x-contain { overscroll-behavior-x: contain; }
.overscroll-y-contain { overscroll-behavior-y: contain; }
.scroll-padding-top-0  { scroll-padding-top: 0; }
.scroll-padding-top-16 { scroll-padding-top: 16px; }
.scroll-padding-top-48 { scroll-padding-top: 48px; }
.scroll-padding-top-64 { scroll-padding-top: 64px; }
.scroll-padding-top-80 { scroll-padding-top: 80px; }
.scroll-padding-top-96 { scroll-padding-top: 96px; }
.scroll-margin-top-16  { scroll-margin-top: 16px; }
.scroll-margin-top-64  { scroll-margin-top: 64px; }
.scroll-margin-top-80  { scroll-margin-top: 80px; }

/* ═══════════════════════════════════════════════════════════════════════════
   3. ASPECT RATIO (expanded)
═══════════════════════════════════════════════════════════════════════════ */
.aspect-square    { aspect-ratio: 1 / 1; }
.aspect-video     { aspect-ratio: 16 / 9; }
.aspect-portrait  { aspect-ratio: 3 / 4; }
.aspect-cinema    { aspect-ratio: 21 / 9; }
.aspect-4-3       { aspect-ratio: 4 / 3; }
.aspect-3-2       { aspect-ratio: 3 / 2; }
.aspect-2-1       { aspect-ratio: 2 / 1; }
.aspect-1-2       { aspect-ratio: 1 / 2; }
.aspect-golden    { aspect-ratio: 1.618 / 1; }
.aspect-auto      { aspect-ratio: auto; }

/* ═══════════════════════════════════════════════════════════════════════════
   4. LOGICAL PROPERTIES (RTL/LTR)
═══════════════════════════════════════════════════════════════════════════ */
.text-start { text-align: start; }
.text-end   { text-align: end; }
.add-margin-inline-auto   { margin-inline: auto; }
.add-margin-inline-0      { margin-inline: 0; }
.add-margin-block-auto    { margin-block: auto; }
.add-padding-inline-8     { padding-inline: 8px; }
.add-padding-inline-16    { padding-inline: 16px; }
.add-padding-inline-24    { padding-inline: 24px; }
.add-padding-inline-32    { padding-inline: 32px; }
.add-padding-inline-48    { padding-inline: 48px; }
.add-padding-block-8      { padding-block: 8px; }
.add-padding-block-16     { padding-block: 16px; }
.add-padding-block-24     { padding-block: 24px; }
.add-padding-block-32     { padding-block: 32px; }
.add-padding-block-48     { padding-block: 48px; }
.add-border-inline-1      { border-inline: 1px solid; }
.add-border-inline-2      { border-inline: 2px solid; }
.add-border-block-1       { border-block: 1px solid; }
.add-border-block-2       { border-block: 2px solid; }
.border-start-1           { border-inline-start: 1px solid; }
.border-start-2           { border-inline-start: 2px solid; }
.border-start-4           { border-inline-start: 4px solid; }
.border-end-1             { border-inline-end: 1px solid; }
.border-end-2             { border-inline-end: 2px solid; }
.inset-inline-0           { inset-inline: 0; }
.inset-block-0            { inset-block: 0; }
.ps-0 { padding-inline-start: 0; }
.ps-8 { padding-inline-start: 8px; }
.ps-16 { padding-inline-start: 16px; }
.ps-24 { padding-inline-start: 24px; }
.pe-0 { padding-inline-end: 0; }
.pe-8 { padding-inline-end: 8px; }
.pe-16 { padding-inline-end: 16px; }
.pe-24 { padding-inline-end: 24px; }
.ms-auto { margin-inline-start: auto; }
.me-auto { margin-inline-end: auto; }

/* ═══════════════════════════════════════════════════════════════════════════
   5. GRADIENT UTILITIES (expanded)
═══════════════════════════════════════════════════════════════════════════ */
.gradient-radial-from-center { background: radial-gradient(circle at center, var(--grad-from, #3b82f6), var(--grad-to, #1e1b4b)); }
.gradient-radial-from-top    { background: radial-gradient(circle at top, var(--grad-from, #3b82f6), var(--grad-to, #1e1b4b)); }
.gradient-conic              { background: conic-gradient(from 0deg, var(--grad-from, #3b82f6), var(--grad-via, #8b5cf6), var(--grad-to, #ec4899), var(--grad-from, #3b82f6)); }
.gradient-conic-from-top     { background: conic-gradient(from 180deg at 50% 0%, var(--grad-from, #3b82f6), var(--grad-to, #8b5cf6)); }
.text-gradient { -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.text-gradient-blue-to-purple  { background-image: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.text-gradient-purple-to-pink  { background-image: linear-gradient(135deg, #8b5cf6, #ec4899); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.text-gradient-orange-to-red   { background-image: linear-gradient(135deg, #f97316, #ef4444); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.text-gradient-green-to-cyan   { background-image: linear-gradient(135deg, #22c55e, #06b6d4); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.text-gradient-blue-to-green   { background-image: linear-gradient(135deg, #3b82f6, #22c55e); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.text-gradient-yellow-to-orange { background-image: linear-gradient(135deg, #eab308, #f97316); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.border-gradient-blue-to-purple { border: 2px solid transparent; background-clip: padding-box; position: relative; }
.border-gradient-blue-to-purple::before { content: ''; position: absolute; inset: -2px; border-radius: inherit; background: linear-gradient(135deg, #3b82f6, #8b5cf6); z-index: -1; }
.border-gradient-orange-to-pink { border: 2px solid transparent; background-clip: padding-box; position: relative; }
.border-gradient-orange-to-pink::before { content: ''; position: absolute; inset: -2px; border-radius: inherit; background: linear-gradient(135deg, #f97316, #ec4899); z-index: -1; }
.gradient-via-purple-400 { --grad-via: #a78bfa; }
.gradient-via-pink-400   { --grad-via: #f472b6; }
.gradient-via-cyan-400   { --grad-via: #22d3ee; }
.gradient-via-yellow-400 { --grad-via: #facc15; }

/* ═══════════════════════════════════════════════════════════════════════════
   6. CLIP PATH UTILITIES
═══════════════════════════════════════════════════════════════════════════ */
.clip-circle       { clip-path: circle(50%); }
.clip-ellipse      { clip-path: ellipse(60% 40% at 50% 50%); }
.clip-triangle-up  { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
.clip-triangle-down { clip-path: polygon(0% 0%, 100% 0%, 50% 100%); }
.clip-diamond      { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
.clip-hexagon      { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }
.clip-pentagon     { clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%); }
.clip-star         { clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
.clip-chevron-right { clip-path: polygon(0% 0%, 80% 0%, 100% 50%, 80% 100%, 0% 100%, 20% 50%); }
.clip-arrow-right  { clip-path: polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%); }
.clip-none         { clip-path: none; }

/* ═══════════════════════════════════════════════════════════════════════════
   7. CSS GRID ADVANCED
═══════════════════════════════════════════════════════════════════════════ */
.grid-auto-fit-min-120 { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); }
.grid-auto-fit-min-150 { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
.grid-auto-fit-min-200 { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
.grid-auto-fit-min-240 { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
.grid-auto-fit-min-280 { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.grid-auto-fit-min-320 { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
.grid-auto-fill-min-120 { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
.grid-auto-fill-min-150 { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
.grid-auto-fill-min-200 { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
.grid-auto-fill-min-240 { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
.grid-auto-fill-min-280 { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
.grid-auto-fill-min-320 { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
.grid-area-header  { grid-area: header; }
.grid-area-nav     { grid-area: nav; }
.grid-area-sidebar { grid-area: sidebar; }
.grid-area-main    { grid-area: main; }
.grid-area-footer  { grid-area: footer; }
.grid-area-aside   { grid-area: aside; }
.grid-template-layout-holy-grail {
  display: grid;
  grid-template-areas: "header header header" "nav main aside" "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
.grid-template-layout-sidebar-left {
  display: grid;
  grid-template-areas: "sidebar main";
  grid-template-columns: 260px 1fr;
  gap: 0;
}
.grid-template-layout-sidebar-right {
  display: grid;
  grid-template-areas: "main sidebar";
  grid-template-columns: 1fr 260px;
  gap: 0;
}
.masonry-cols-2 { columns: 2; column-gap: 16px; }
.masonry-cols-3 { columns: 3; column-gap: 16px; }
.masonry-cols-4 { columns: 4; column-gap: 16px; }
.masonry-item   { break-inside: avoid; margin-bottom: 16px; }
.grid-dense     { grid-auto-flow: dense; }
.grid-row-dense { grid-auto-flow: row dense; }
.grid-col-dense { grid-auto-flow: column dense; }

/* ═══════════════════════════════════════════════════════════════════════════
   8. ADVANCED TYPOGRAPHY
═══════════════════════════════════════════════════════════════════════════ */
.text-balance  { text-wrap: balance; }
.text-pretty   { text-wrap: pretty; }
.text-nowrap   { white-space: nowrap; }
.text-wrap     { white-space: normal; }
.text-clamp-1  { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.text-clamp-2  { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.text-clamp-3  { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.text-clamp-4  { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.text-clamp-5  { display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; }
.text-indent-8  { text-indent: 8px; }
.text-indent-16 { text-indent: 16px; }
.text-indent-32 { text-indent: 32px; }
.hanging-punctuation { hanging-punctuation: first last; }
.drop-cap::first-letter { float: left; font-size: 3.5em; line-height: 0.85; font-weight: 700; margin-right: 8px; margin-top: 4px; }
.first-letter-large::first-letter { font-size: 2em; font-weight: 700; }
.first-letter-color-blue::first-letter { color: #3b82f6; }
.text-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.text-break-all  { word-break: break-all; }
.text-break-word { overflow-wrap: break-word; word-break: break-word; }
.text-hyphen     { hyphens: auto; }
.font-tabular-nums { font-variant-numeric: tabular-nums; }
.font-ordinal      { font-variant-numeric: ordinal; }
.font-slashed-zero { font-variant-numeric: slashed-zero; }
.font-feature-liga { font-feature-settings: "liga" 1; }
.font-smoothing    { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

/* ═══════════════════════════════════════════════════════════════════════════
   9. FLUID TYPOGRAPHY
═══════════════════════════════════════════════════════════════════════════ */
.text-fluid-xs   { font-size: clamp(11px, 1.5vw, 13px); }
.text-fluid-sm   { font-size: clamp(13px, 2vw, 16px); }
.text-fluid-md   { font-size: clamp(16px, 2.5vw, 20px); }
.text-fluid-lg   { font-size: clamp(20px, 3.5vw, 28px); }
.text-fluid-xl   { font-size: clamp(28px, 5vw, 40px); }
.text-fluid-2xl  { font-size: clamp(36px, 6vw, 56px); }
.text-fluid-hero { font-size: clamp(36px, 8vw, 80px); }
.text-fluid-display { font-size: clamp(48px, 10vw, 120px); }

/* ═══════════════════════════════════════════════════════════════════════════
   10. CURSOR UTILITIES (expanded)
═══════════════════════════════════════════════════════════════════════════ */
.cursor-default     { cursor: default; }
.cursor-pointer     { cursor: pointer; }
.cursor-text        { cursor: text; }
.cursor-grab        { cursor: grab; }
.cursor-grabbing    { cursor: grabbing; }
.cursor-crosshair   { cursor: crosshair; }
.cursor-zoom-in     { cursor: zoom-in; }
.cursor-zoom-out    { cursor: zoom-out; }
.cursor-not-allowed { cursor: not-allowed; }
.cursor-wait        { cursor: wait; }
.cursor-progress    { cursor: progress; }
.cursor-cell        { cursor: cell; }
.cursor-copy        { cursor: copy; }
.cursor-move        { cursor: move; }
.cursor-none        { cursor: none; }
.cursor-help        { cursor: help; }
.cursor-context-menu { cursor: context-menu; }
.cursor-alias       { cursor: alias; }
.cursor-resize-ns   { cursor: ns-resize; }
.cursor-resize-ew   { cursor: ew-resize; }
.cursor-resize-n    { cursor: n-resize; }
.cursor-resize-s    { cursor: s-resize; }
.cursor-resize-e    { cursor: e-resize; }
.cursor-resize-w    { cursor: w-resize; }
.cursor-resize-ne   { cursor: ne-resize; }
.cursor-resize-nw   { cursor: nw-resize; }
.cursor-resize-se   { cursor: se-resize; }
.cursor-resize-sw   { cursor: sw-resize; }
.cursor-col-resize  { cursor: col-resize; }
.cursor-row-resize  { cursor: row-resize; }

/* ═══════════════════════════════════════════════════════════════════════════
   11. POINTER & TOUCH UTILITIES (expanded)
═══════════════════════════════════════════════════════════════════════════ */
.touch-none          { touch-action: none; }
.touch-auto          { touch-action: auto; }
.touch-pan-x         { touch-action: pan-x; }
.touch-pan-y         { touch-action: pan-y; }
.touch-pan-left      { touch-action: pan-left; }
.touch-pan-right     { touch-action: pan-right; }
.touch-pan-up        { touch-action: pan-up; }
.touch-pan-down      { touch-action: pan-down; }
.touch-manipulation  { touch-action: manipulation; }
.touch-pinch-zoom    { touch-action: pinch-zoom; }
.pointer-events-none { pointer-events: none; }
.pointer-events-auto { pointer-events: auto; }
.pointer-events-all  { pointer-events: all; }
.user-select-none    { user-select: none; -webkit-user-select: none; }
.user-select-all     { user-select: all; -webkit-user-select: all; }
.user-select-text    { user-select: text; -webkit-user-select: text; }
.user-select-auto    { user-select: auto; -webkit-user-select: auto; }
.will-change-transform  { will-change: transform; }
.will-change-opacity    { will-change: opacity; }
.will-change-scroll     { will-change: scroll-position; }
.will-change-auto       { will-change: auto; }

/* ═══════════════════════════════════════════════════════════════════════════
   12. CSS SUBGRID
═══════════════════════════════════════════════════════════════════════════ */
.grid-cols-subgrid   { grid-template-columns: subgrid; }
.grid-rows-subgrid   { grid-template-rows: subgrid; }
.span-col-subgrid-2  { grid-column: span 2; grid-template-columns: subgrid; }
.span-col-subgrid-3  { grid-column: span 3; grid-template-columns: subgrid; }
.span-col-subgrid-4  { grid-column: span 4; grid-template-columns: subgrid; }
.span-row-subgrid-2  { grid-row: span 2; grid-template-rows: subgrid; }
.span-row-subgrid-3  { grid-row: span 3; grid-template-rows: subgrid; }

/* ═══════════════════════════════════════════════════════════════════════════
   13. VIEW TRANSITIONS
═══════════════════════════════════════════════════════════════════════════ */
.view-transition-none   { view-transition-name: none; }
.view-transition-hero   { view-transition-name: hero; }
.view-transition-header { view-transition-name: header; }
.view-transition-image  { view-transition-name: image; }
.view-transition-card   { view-transition-name: card; }
@keyframes santy-vt-fade-in  { from { opacity: 0; } to { opacity: 1; } }
@keyframes santy-vt-fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes santy-vt-slide-in  { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes santy-vt-slide-out { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-24px); opacity: 0; } }
@keyframes santy-vt-scale-in  { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes santy-vt-scale-out { from { transform: scale(1); opacity: 1; } to { transform: scale(1.08); opacity: 0; } }
::view-transition-old(root) { animation: santy-vt-fade-out 0.25s ease; }
::view-transition-new(root) { animation: santy-vt-fade-in  0.25s ease; }
.view-transition-fade  ::view-transition-old(root) { animation: santy-vt-fade-out 0.3s ease; }
.view-transition-fade  ::view-transition-new(root) { animation: santy-vt-fade-in  0.3s ease; }
.view-transition-slide ::view-transition-old(root) { animation: santy-vt-slide-out 0.35s ease; }
.view-transition-slide ::view-transition-new(root) { animation: santy-vt-slide-in  0.35s ease; }
.view-transition-scale ::view-transition-old(root) { animation: santy-vt-scale-out 0.3s ease; }
.view-transition-scale ::view-transition-new(root) { animation: santy-vt-scale-in  0.3s ease; }

/* ═══════════════════════════════════════════════════════════════════════════
   14. @LAYER UTILITIES
═══════════════════════════════════════════════════════════════════════════ */
@layer santy-base, santy-utilities, santy-components, santy-overrides;
@layer santy-base      { .layer-base      { all: revert; } }
@layer santy-utilities { .layer-utilities { } }
@layer santy-components { .layer-components { } }
@layer santy-overrides  { .layer-overrides  { } }

/* ═══════════════════════════════════════════════════════════════════════════
   15. SIZE UTILITIES (width + height combined)
═══════════════════════════════════════════════════════════════════════════ */
.set-size-4   { width: 4px;   height: 4px; }
.set-size-8   { width: 8px;   height: 8px; }
.set-size-12  { width: 12px;  height: 12px; }
.set-size-16  { width: 16px;  height: 16px; }
.set-size-20  { width: 20px;  height: 20px; }
.set-size-24  { width: 24px;  height: 24px; }
.set-size-28  { width: 28px;  height: 28px; }
.set-size-32  { width: 32px;  height: 32px; }
.set-size-36  { width: 36px;  height: 36px; }
.set-size-40  { width: 40px;  height: 40px; }
.set-size-44  { width: 44px;  height: 44px; }
.set-size-48  { width: 48px;  height: 48px; }
.set-size-56  { width: 56px;  height: 56px; }
.set-size-64  { width: 64px;  height: 64px; }
.set-size-72  { width: 72px;  height: 72px; }
.set-size-80  { width: 80px;  height: 80px; }
.set-size-96  { width: 96px;  height: 96px; }
.set-size-120 { width: 120px; height: 120px; }
.set-size-160 { width: 160px; height: 160px; }
.set-size-200 { width: 200px; height: 200px; }
.set-size-full   { width: 100%;  height: 100%; }
.set-size-screen { width: 100vw; height: 100vh; }
.set-size-fit    { width: fit-content; height: fit-content; }
.set-size-min    { width: min-content; height: min-content; }
.set-size-max    { width: max-content; height: max-content; }

/* ═══════════════════════════════════════════════════════════════════════════
   16. DYNAMIC VIEWPORT UNITS
═══════════════════════════════════════════════════════════════════════════ */
/* Each rule states the classic unit first, then the dynamic one. A browser
   that does not understand dvh/svh/lvh drops the second declaration and keeps
   the first — without the fallback the element would end up with no height
   at all, which is a layout break rather than a cosmetic downgrade. */
.set-height-dvh      { height: 100vh; height: 100dvh; }
.set-height-svh      { height: 100vh; height: 100svh; }
.set-height-lvh      { height: 100vh; height: 100lvh; }
.set-min-height-dvh  { min-height: 100vh; min-height: 100dvh; }
.set-min-height-svh  { min-height: 100vh; min-height: 100svh; }
.set-min-height-lvh  { min-height: 100vh; min-height: 100lvh; }
.set-max-height-dvh  { max-height: 100vh; max-height: 100dvh; }
.set-width-dvw       { width: 100vw; width: 100dvw; }
.set-width-svw       { width: 100vw; width: 100svw; }
.set-width-lvw       { width: 100vw; width: 100lvw; }
.h-dvh { height: 100vh; height: 100dvh; }
.h-svh { height: 100vh; height: 100svh; }
.h-50dvh { height: 50vh; height: 50dvh; }
.h-75dvh { height: 75vh; height: 75dvh; }

/* ═══════════════════════════════════════════════════════════════════════════
   17. COLOR MIX & OPACITY MODIFIERS
═══════════════════════════════════════════════════════════════════════════ */
.background-blue-500\\/10  { background-color: rgba(59,130,246,.10); }
.background-blue-500\\/20  { background-color: rgba(59,130,246,.20); }
.background-blue-500\\/30  { background-color: rgba(59,130,246,.30); }
.background-blue-500\\/50  { background-color: rgba(59,130,246,.50); }
.background-blue-500\\/75  { background-color: rgba(59,130,246,.75); }
.background-red-500\\/10   { background-color: rgba(239,68,68,.10); }
.background-red-500\\/20   { background-color: rgba(239,68,68,.20); }
.background-red-500\\/30   { background-color: rgba(239,68,68,.30); }
.background-red-500\\/50   { background-color: rgba(239,68,68,.50); }
.background-green-500\\/10 { background-color: rgba(34,197,94,.10); }
.background-green-500\\/20 { background-color: rgba(34,197,94,.20); }
.background-green-500\\/30 { background-color: rgba(34,197,94,.30); }
.background-green-500\\/50 { background-color: rgba(34,197,94,.50); }
.background-purple-500\\/10 { background-color: rgba(168,85,247,.10); }
.background-purple-500\\/20 { background-color: rgba(168,85,247,.20); }
.background-purple-500\\/30 { background-color: rgba(168,85,247,.30); }
.background-purple-500\\/50 { background-color: rgba(168,85,247,.50); }
.background-yellow-500\\/10 { background-color: rgba(234,179,8,.10); }
.background-yellow-500\\/20 { background-color: rgba(234,179,8,.20); }
.background-yellow-500\\/50 { background-color: rgba(234,179,8,.50); }
.background-white\\/10  { background-color: rgba(255,255,255,.10); }
.background-white\\/20  { background-color: rgba(255,255,255,.20); }
.background-white\\/30  { background-color: rgba(255,255,255,.30); }
.background-white\\/50  { background-color: rgba(255,255,255,.50); }
.background-white\\/75  { background-color: rgba(255,255,255,.75); }
.background-black\\/10  { background-color: rgba(0,0,0,.10); }
.background-black\\/20  { background-color: rgba(0,0,0,.20); }
.background-black\\/30  { background-color: rgba(0,0,0,.30); }
.background-black\\/50  { background-color: rgba(0,0,0,.50); }
.background-black\\/75  { background-color: rgba(0,0,0,.75); }
.color-blue-500\\/75   { color: rgba(59,130,246,.75); }
.color-red-600\\/75    { color: rgba(220,38,38,.75); }
.color-gray-900\\/75   { color: rgba(17,24,39,.75); }
.background-mix-blue-red-50    { background-color: color-mix(in srgb, #3b82f6 50%, #ef4444); }
.background-mix-blue-green-50  { background-color: color-mix(in srgb, #3b82f6 50%, #22c55e); }
.background-mix-purple-pink-50 { background-color: color-mix(in srgb, #8b5cf6 50%, #ec4899); }

/* ═══════════════════════════════════════════════════════════════════════════
   18. ISOLATION & SEMANTIC Z-INDEX
═══════════════════════════════════════════════════════════════════════════ */
.isolate       { isolation: isolate; }
.isolation-auto { isolation: auto; }
.z-base        { z-index: 0; }
.z-raised      { z-index: 10; }
.z-dropdown    { z-index: 100; }
.z-sticky      { z-index: 200; }
.z-overlay     { z-index: 300; }
.z-modal       { z-index: 400; }
.z-popover     { z-index: 500; }
.z-tooltip     { z-index: 600; }
.z-toast       { z-index: 700; }
.z-top         { z-index: 9999; }
.z-negative    { z-index: -1; }

/* ═══════════════════════════════════════════════════════════════════════════
   19. PRINT UTILITIES (expanded)
═══════════════════════════════════════════════════════════════════════════ */
@media print {
  .print-hidden              { display: none !important; }
  .print-only                { display: block !important; }
  .print-only-flex           { display: flex !important; }
  .print-full-width          { width: 100% !important; max-width: 100% !important; }
  .print-no-shadow           { box-shadow: none !important; }
  .print-no-border           { border: none !important; }
  .print-black-white         { filter: grayscale(100%); }
  .print-break-before        { break-before: page; }
  .print-break-after         { break-after: page; }
  .print-break-inside-avoid  { break-inside: avoid; }
  .print-break-inside-auto   { break-inside: auto; }
  .print-text-black          { color: #000 !important; }
  .print-background-white    { background: #fff !important; }
  .print-show-links a::after { content: " (" attr(href) ")"; font-size: 11px; color: #666; }
}
.print-hidden { }
.print-only   { }

/* ═══════════════════════════════════════════════════════════════════════════
   20. MATH & CALCULATION UTILITIES
═══════════════════════════════════════════════════════════════════════════ */
.set-width-calc-100-minus-16  { width: calc(100% - 16px); }
.set-width-calc-100-minus-24  { width: calc(100% - 24px); }
.set-width-calc-100-minus-32  { width: calc(100% - 32px); }
.set-width-calc-100-minus-48  { width: calc(100% - 48px); }
.set-width-calc-100-minus-64  { width: calc(100% - 64px); }
.set-width-calc-100-minus-80  { width: calc(100% - 80px); }
.set-width-calc-100-minus-256 { width: calc(100% - 256px); }
.set-width-calc-100-minus-320 { width: calc(100% - 320px); }
.set-width-half               { width: calc(50% - 8px); }
.set-width-third              { width: calc(33.333% - 11px); }
.set-width-quarter            { width: calc(25% - 12px); }
.set-height-calc-screen-minus-48  { height: calc(100vh - 48px); }
.set-height-calc-screen-minus-64  { height: calc(100vh - 64px); }
.set-height-calc-screen-minus-80  { height: calc(100vh - 80px); }
.set-height-calc-screen-minus-96  { height: calc(100vh - 96px); }
.set-height-calc-dvh-minus-64  { height: calc(100dvh - 64px); }
.set-height-calc-dvh-minus-80  { height: calc(100dvh - 80px); }
.set-min-height-calc-screen-minus-80 { min-height: calc(100vh - 80px); }
.set-max-width-readable   { max-width: 65ch; }
.set-max-width-prose      { max-width: 72ch; }
.set-max-width-narrow     { max-width: 45ch; }
`);

// ─── NEW COMPONENTS v2.7.0 ────────────────────────────────────────────────────
add(`
/* ═══════════════════════════════════════════════════════════════
   NEW COMPONENTS (v2.7.0)
   Toast · Switch · Checkbox · Radio · Range · Carousel ·
   Dialog (native) · Popover (native) · File Drop
   ═══════════════════════════════════════════════════════════════ */

/* ── Toast (stacked, top-right by default) ──
   <div class="toast-container">
     <div class="toast toast-success show">Saved!</div>
   </div>  */
.toast-container { position: fixed; top: 16px; right: 16px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; max-width: min(360px, calc(100vw - 32px)); }
.toast-container.pin-bottom { top: auto; bottom: 16px; }
.toast-container.pin-left   { right: auto; left: 16px; }
.toast-container.pin-center { right: auto; left: 50%; transform: translateX(-50%); }
.toast { pointer-events: auto; display: flex; align-items: center; gap: 10px; background: #1f2937; color: #f9fafb; padding: 12px 16px; border-radius: 10px; font-size: 14px; line-height: 1.4; box-shadow: var(--santy-shadow-lg); opacity: 0; transform: translateY(-8px); transition: opacity .25s ease, transform .25s ease; }
.toast.show { opacity: 1; transform: translateY(0); }
.toast-success { background: #052e16; color: #86efac; border: 1px solid #166534; }
.toast-error   { background: #2d0a0a; color: #fca5a5; border: 1px solid #991b1b; }
.toast-warning { background: #2d1b00; color: #fcd34d; border: 1px solid #92400e; }
.toast-info    { background: #0c1a2e; color: #93c5fd; border: 1px solid #1e3a5f; }
.toast-light   { background: #ffffff; color: #111827; border: 1px solid #e5e7eb; }
.toast-close { margin-left: auto; background: none; border: none; color: inherit; opacity: .6; cursor: pointer; font-size: 16px; line-height: 1; padding: 0 0 0 8px; }
.toast-close:hover { opacity: 1; }

/* ── Switch (plain-English alias of toggle) ──
   <label class="switch"><input type="checkbox"><span class="switch-slider"></span></label> */
.switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; position: absolute; }
.switch-slider { position: absolute; cursor: pointer; inset: 0; background-color: #d1d5db; border-radius: 9999px; transition: background-color 0.2s; }
.switch-slider::before { content: ''; position: absolute; width: 20px; height: 20px; left: 2px; top: 2px; background-color: #fff; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.switch input:checked + .switch-slider { background-color: var(--santy-primary, #3b82f6); }
.switch input:checked + .switch-slider::before { transform: translateX(20px); }
.switch input:disabled + .switch-slider { opacity: 0.5; cursor: not-allowed; }
.switch input:focus-visible + .switch-slider { box-shadow: 0 0 0 3px rgba(59,130,246,.4); }
.switch-sm { width: 34px; height: 18px; }
.switch-sm .switch-slider::before { width: 14px; height: 14px; }
.switch-sm input:checked + .switch-slider::before { transform: translateX(16px); }
.switch-lg { width: 56px; height: 30px; }
.switch-lg .switch-slider::before { width: 26px; height: 26px; }
.switch-lg input:checked + .switch-slider::before { transform: translateX(26px); }
.switch-success input:checked + .switch-slider { background-color: var(--santy-success, #22c55e); }
.switch-danger  input:checked + .switch-slider { background-color: var(--santy-danger, #ef4444); }

/* ── Checkbox & Radio (custom styled) ──
   <input type="checkbox" class="checkbox">  <input type="radio" class="radio"> */
.checkbox, .radio { appearance: none; -webkit-appearance: none; width: 18px; height: 18px; border: 2px solid #d1d5db; background: #fff; cursor: pointer; display: inline-block; vertical-align: middle; position: relative; transition: border-color .15s, background-color .15s; flex-shrink: 0; }
.checkbox { border-radius: 5px; }
.radio    { border-radius: 50%; }
.checkbox:checked, .radio:checked { border-color: var(--santy-primary, #3b82f6); background-color: var(--santy-primary, #3b82f6); }
.checkbox:checked::after { content: ''; position: absolute; left: 4px; top: 1px; width: 6px; height: 10px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); }
.radio:checked::after { content: ''; position: absolute; inset: 3px; border-radius: 50%; background: #fff; }
.checkbox:focus-visible, .radio:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(59,130,246,.4); }
.checkbox:disabled, .radio:disabled { opacity: .5; cursor: not-allowed; }
.checkbox-lg, .radio-lg { width: 22px; height: 22px; }
.checkbox-lg:checked::after { left: 5px; top: 2px; width: 7px; height: 12px; }

/* ── Range Slider ──  <input type="range" class="range"> */
.range { appearance: none; -webkit-appearance: none; width: 100%; height: 6px; border-radius: 9999px; background: #e5e7eb; outline: none; cursor: pointer; }
.range::-webkit-slider-thumb { appearance: none; -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--santy-primary, #3b82f6); border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,.3); cursor: grab; }
.range::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: var(--santy-primary, #3b82f6); border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,.3); cursor: grab; }
.range::-webkit-slider-thumb:active { cursor: grabbing; }
.range:disabled { opacity: .5; cursor: not-allowed; }
.range-sm { height: 4px; }
.range-sm::-webkit-slider-thumb { width: 14px; height: 14px; }
.range-sm::-moz-range-thumb { width: 14px; height: 14px; }
.range-lg { height: 8px; }
.range-lg::-webkit-slider-thumb { width: 24px; height: 24px; }
.range-lg::-moz-range-thumb { width: 24px; height: 24px; }

/* ── Carousel (pure CSS, scroll-snap) ──
   <div class="carousel"><div class="carousel-item">…</div>…</div> */
.carousel { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; gap: 16px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
.carousel::-webkit-scrollbar { display: none; }
.carousel-item { flex: 0 0 100%; scroll-snap-align: center; }
.carousel-item-half  { flex-basis: calc(50% - 8px); }
.carousel-item-third { flex-basis: calc(33.333% - 11px); }
.carousel-peek .carousel-item { flex-basis: 85%; }
.carousel-dots { display: flex; justify-content: center; gap: 8px; margin-top: 12px; }
.carousel-dot { width: 8px; height: 8px; border-radius: 50%; background: #d1d5db; border: none; cursor: pointer; padding: 0; transition: background-color .15s, transform .15s; }
.carousel-dot.active { background: var(--santy-primary, #3b82f6); transform: scale(1.25); }

/* ── Dialog (native <dialog>) ──
   <dialog class="dialog" id="d"><div class="dialog-header">…</div></dialog>
   Open with: document.getElementById('d').showModal() */
.dialog { border: none; border-radius: var(--santy-radius-lg, 16px); padding: 0; max-width: min(480px, calc(100vw - 32px)); width: 100%; box-shadow: var(--santy-shadow-xl); }
.dialog::backdrop { background: rgba(15, 23, 42, 0.55); backdrop-filter: blur(2px); }
.dialog[open] { animation: santy-dialog-in .2s ease-out; }
@keyframes santy-dialog-in { from { opacity: 0; transform: translateY(12px) scale(.97); } to { opacity: 1; transform: none; } }
.dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; font-weight: 600; font-size: 16px; }
.dialog-body   { padding: 20px; font-size: 14px; color: #4b5563; line-height: 1.6; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px; border-top: 1px solid #e5e7eb; }
.dialog-lg { max-width: min(720px, calc(100vw - 32px)); }
.dialog-fullscreen { max-width: 100vw; width: 100vw; height: 100vh; max-height: 100vh; border-radius: 0; }
.dark .dialog { background: #1e293b; color: #f1f5f9; }
.dark .dialog-header, .dark .dialog-footer { border-color: #334155; }
.dark .dialog-body { color: #cbd5e1; }

/* ── Popover (native Popover API, zero JS) ──
   <button popovertarget="p" class="btn">Open</button>
   <div popover id="p" class="popover">…</div> */
.popover { border: 1px solid #e5e7eb; border-radius: var(--santy-radius-md, 12px); padding: 16px; box-shadow: var(--santy-shadow-lg); font-size: 14px; max-width: 320px; margin: auto; }
.popover:popover-open { animation: santy-dialog-in .15s ease-out; }
.dark .popover { background: #1e293b; color: #e2e8f0; border-color: #334155; }

/* ── File Drop Zone ──
   <label class="file-drop"><input type="file"><span>Drop files or click to browse</span></label> */
.file-drop { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 32px 24px; border: 2px dashed #d1d5db; border-radius: var(--santy-radius-md, 12px); background: #f9fafb; color: #6b7280; font-size: 14px; cursor: pointer; text-align: center; transition: border-color .15s, background-color .15s; }
.file-drop:hover, .file-drop.dragover { border-color: var(--santy-primary, #3b82f6); background: #eff6ff; color: #2563eb; }
.file-drop input[type="file"] { display: none; }
.dark .file-drop { background: #0f172a; border-color: #334155; color: #94a3b8; }
.dark .file-drop:hover { border-color: #3b82f6; background: #172554; }

/* Dark mode for new components */
.dark .toast-light { background: #1e293b; color: #f1f5f9; border-color: #334155; }
.dark .checkbox, .dark .radio { background: #1e293b; border-color: #475569; }
.dark .checkbox:checked, .dark .radio:checked { background: var(--santy-primary, #3b82f6); border-color: var(--santy-primary, #3b82f6); }
.dark .range { background: #334155; }
.dark .carousel-dot { background: #475569; }
`);


// ─── UTILITY GAPS v1.6 ───────────────────────────────────────────────────────
mod('typography');
add(`
/* ── Variable Font Weights ── */
.font-variable          { font-variation-settings: normal; }
.font-condensed         { font-stretch: condensed;  font-variation-settings: 'wdth' 75; }
.font-expanded          { font-stretch: expanded;   font-variation-settings: 'wdth' 125; }
.font-italic-variable   { font-style: italic; font-variation-settings: 'ital' 1; }
.set-font-weight-100 { font-weight: 100; font-variation-settings: 'wght' 100; }
.set-font-weight-200 { font-weight: 200; font-variation-settings: 'wght' 200; }
.set-font-weight-300 { font-weight: 300; font-variation-settings: 'wght' 300; }
.set-font-weight-400 { font-weight: 400; font-variation-settings: 'wght' 400; }
.set-font-weight-450 { font-weight: 450; font-variation-settings: 'wght' 450; }
.set-font-weight-500 { font-weight: 500; font-variation-settings: 'wght' 500; }
.set-font-weight-550 { font-weight: 550; font-variation-settings: 'wght' 550; }
.set-font-weight-600 { font-weight: 600; font-variation-settings: 'wght' 600; }
.set-font-weight-700 { font-weight: 700; font-variation-settings: 'wght' 700; }
.set-font-weight-800 { font-weight: 800; font-variation-settings: 'wght' 800; }
.set-font-weight-900 { font-weight: 900; font-variation-settings: 'wght' 900; }

/* ── Negative Z-index (layer behind parent) ── */
.z-minus-1  { z-index: -1; }
.z-minus-2  { z-index: -2; }
.z-minus-3  { z-index: -3; }
.z-minus-5  { z-index: -5; }
.z-minus-10 { z-index: -10; }

/* ── Fractional Widths — fifths & sixths ── */
.set-width-1-of-5 { width: 20%; }
.set-width-2-of-5 { width: 40%; }
.set-width-3-of-5 { width: 60%; }
.set-width-4-of-5 { width: 80%; }
.set-width-1-of-6 { width: 16.6667%; }
.set-width-2-of-6 { width: 33.3333%; }
.set-width-3-of-6 { width: 50%; }
.set-width-4-of-6 { width: 66.6667%; }
.set-width-5-of-6 { width: 83.3333%; }
`);

// Caret colors — full shade scale
mod('colors');
add(`\n/* ── Caret Colors (full shade scale) ── */`);
Object.entries(palette).forEach(([name, shades]) => {
  Object.entries(shades).forEach(([shade, hex]) => {
    add(`.caret-${name}-${shade} { caret-color: ${hex}; }`);
  });
});

// Color-mix tints & shades — advanced feature, lives in santy-variants.css
add(`\n/* ═══ VARIANTS_BLOCK_START ═══ */`);
add(`\n/* ── Color-Mix Tints & Shades — background, text, border ── */`);
const tintLevels  = [10, 20, 30, 40, 50, 60, 70];
const shadeLevels = [10, 20, 30];

/**
 * Precompute what color-mix() would produce, so each rule can state a plain
 * hex first. Without the fallback, a browser that does not support color-mix
 * drops the declaration entirely and the element inherits or goes transparent
 * — text can end up invisible rather than merely off-shade.
 */
function mixHex(base, pct, towards) {
  const hex = h => {
    const s = h.replace('#', '');
    const n = s.length === 3 ? s.split('').map(c => c + c).join('') : s;
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = hex(base);
  const [r2, g2, b2] = hex(towards);
  const w = Math.max(0, Math.min(100, pct)) / 100;
  const mix = (a, b) => Math.round(a * w + b * (1 - w));
  const to2 = v => v.toString(16).padStart(2, '0');
  return `#${to2(mix(r1, r2))}${to2(mix(g1, g2))}${to2(mix(b1, b2))}`;
}

Object.entries(palette).forEach(([name, shades]) => {
  const base = shades[500];
  const WHITE = '#ffffff', BLACK = '#000000';
  tintLevels.forEach(pct => {
    const fb = mixHex(base, pct, WHITE);
    add(`.background-${name}-tint-${pct} { background-color: ${fb}; background-color: color-mix(in srgb, ${base} ${pct}%, ${WHITE}); }`);
    add(`.color-${name}-tint-${pct}      { color: ${fb}; color: color-mix(in srgb, ${base} ${pct}%, ${WHITE}); }`);
  });
  shadeLevels.forEach(pct => {
    // `100 - pct * 10` produced 0%, -100% and -200%: shade-100 came out pure
    // black and shade-200/-300 were invalid CSS the browser threw away. The
    // sibling .border-*-shade-10 rule below has always used 90% for pct 10,
    // which confirms the intended formula is `100 - pct`.
    const keep = 100 - pct;
    const fb = mixHex(base, keep, BLACK);
    add(`.background-${name}-shade-${pct}0 { background-color: ${fb}; background-color: color-mix(in srgb, ${base} ${keep}%, ${BLACK}); }`);
    add(`.color-${name}-shade-${pct}0      { color: ${fb}; color: color-mix(in srgb, ${base} ${keep}%, ${BLACK}); }`);
  });
  add(`.border-${name}-tint-20 { border-color: ${mixHex(base, 20, WHITE)}; border-color: color-mix(in srgb, ${base} 20%, ${WHITE}); }`);
  add(`.border-${name}-tint-40 { border-color: ${mixHex(base, 40, WHITE)}; border-color: color-mix(in srgb, ${base} 40%, ${WHITE}); }`);
  add(`.border-${name}-shade-10 { border-color: ${mixHex(base, 90, BLACK)}; border-color: color-mix(in srgb, ${base} 90%, ${BLACK}); }`);
});
add(`/* ═══ VARIANTS_BLOCK_END ═══ */`);

// ─── NEW FEATURES v1.7 ───────────────────────────────────────────────────────
mod('layout');
add(`
/* ═══════════════════════════════════════════════════════════════════════════
   v1.7 — ACCESSIBILITY UTILITIES
═══════════════════════════════════════════════════════════════════════════ */

/* ── Skip to content (keyboard / screen-reader nav) ── */
.skip-to-content {
  position: absolute;
  top: -100%;
  left: 8px;
  z-index: 9999;
  padding: 8px 16px;
  background-color: #1e40af;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border-radius: 0 0 6px 6px;
  text-decoration: none;
  transition: top 0.15s;
}
.skip-to-content:focus { top: 0; outline: 3px solid #fbbf24; outline-offset: 2px; }

/* ── Focus ring utilities ── */
.focus-ring          { outline: 2px solid #3b82f6; outline-offset: 2px; }
.focus-ring-white    { outline: 2px solid #fff;    outline-offset: 2px; }
.focus-ring-red      { outline: 2px solid #ef4444; outline-offset: 2px; }
.focus-ring-none     { outline: none; }
.focus-visible-ring:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }
.focus-visible-ring:focus:not(:focus-visible) { outline: none; }

/* ── Focus trap container ── */
.focus-trap        { position: relative; }
.focus-trap-active { overflow: hidden; }

/* ── ARIA live regions (read by screen readers) ── */
.aria-live-polite,
.aria-live-assertive {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
}

/* ── Screen-reader only ── */
.screen-reader-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
.screen-reader-only:focus { position: static; width: auto; height: auto; clip: auto; white-space: normal; }

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .motion-safe-animate { animation: none !important; transition: none !important; }
}

/* ── High contrast support ── */
@media (forced-colors: active) {
  .high-contrast-border  { border: 2px solid ButtonText !important; }
  .high-contrast-outline { outline: 2px solid Highlight !important; }
  .high-contrast-bg      { background-color: ButtonFace !important; color: ButtonText !important; }
}

/* ═══════════════════════════════════════════════════════════════════════════
   v1.7 — INTERNATIONALISATION (I18N) UTILITIES
═══════════════════════════════════════════════════════════════════════════ */

/* ── Logical properties (direction-aware layout) ── */
.add-padding-block-4   { padding-block: 4px; }
.add-padding-block-8   { padding-block: 8px; }
.add-padding-block-12  { padding-block: 12px; }
.add-padding-block-16  { padding-block: 16px; }
.add-padding-block-20  { padding-block: 20px; }
.add-padding-block-24  { padding-block: 24px; }
.add-padding-block-32  { padding-block: 32px; }
.add-padding-inline-4  { padding-inline: 4px; }
.add-padding-inline-8  { padding-inline: 8px; }
.add-padding-inline-12 { padding-inline: 12px; }
.add-padding-inline-16 { padding-inline: 16px; }
.add-padding-inline-20 { padding-inline: 20px; }
.add-padding-inline-24 { padding-inline: 24px; }
.add-padding-inline-32 { padding-inline: 32px; }
.add-margin-block-4    { margin-block: 4px; }
.add-margin-block-8    { margin-block: 8px; }
.add-margin-block-16   { margin-block: 16px; }
.add-margin-block-24   { margin-block: 24px; }
.add-margin-inline-4   { margin-inline: 4px; }
.add-margin-inline-8   { margin-inline: 8px; }
.add-margin-inline-16  { margin-inline: 16px; }
.add-margin-inline-24  { margin-inline: 24px; }
.pin-block-start-0     { inset-block-start: 0; }
.pin-block-end-0       { inset-block-end: 0; }
.pin-inline-start-0    { inset-inline-start: 0; }
.pin-inline-end-0      { inset-inline-end: 0; }
.set-width-logical     { inline-size: 100%; }
.set-height-logical    { block-size: 100%; }
.border-block-start    { border-block-start: 1px solid #e5e7eb; }
.border-block-end      { border-block-end: 1px solid #e5e7eb; }
.border-inline-start   { border-inline-start: 1px solid #e5e7eb; }
.border-inline-end     { border-inline-end: 1px solid #e5e7eb; }

/* ── Writing modes (CJK / vertical text) ── */
.make-text-vertical      { writing-mode: vertical-rl; text-orientation: mixed; }
.make-text-vertical-up   { writing-mode: vertical-lr; text-orientation: mixed; }
.make-text-horizontal    { writing-mode: horizontal-tb; }
.text-orientation-mixed    { text-orientation: mixed; }
.text-orientation-upright  { text-orientation: upright; }
.text-orientation-sideways { text-orientation: sideways; }

/* ── Text direction ── */
.text-direction-ltr { direction: ltr; }
.text-direction-rtl { direction: rtl; }

/* ═══════════════════════════════════════════════════════════════════════════
   v1.7 — MOBILE-FIRST COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

/* ── Safe area insets (notch / home bar) ── */
.padding-safe-top    { padding-top:    env(safe-area-inset-top, 0px); }
.padding-safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
.padding-safe-left   { padding-left:   env(safe-area-inset-left, 0px); }
.padding-safe-right  { padding-right:  env(safe-area-inset-right, 0px); }
.padding-safe-all    { padding: env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px); }
.margin-safe-bottom  { margin-bottom:  env(safe-area-inset-bottom, 0px); }
.pin-bottom-safe     { bottom:         env(safe-area-inset-bottom, 0px); }

/* ── Bottom sheet ── */
.bottom-sheet {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background-color: #fff;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 24px rgba(0,0,0,.12);
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
  z-index: 500;
  padding-bottom: env(safe-area-inset-bottom, 16px);
}
.bottom-sheet.open          { transform: translateY(0); }
.bottom-sheet-handle {
  width: 36px; height: 4px;
  background-color: #d1d5db;
  border-radius: 9999px;
  margin: 12px auto 8px;
}
.bottom-sheet-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 20px 12px;
  border-bottom: 1px solid #f3f4f6;
}
.bottom-sheet-title  { font-size: 16px; font-weight: 600; color: #111827; }
.bottom-sheet-body   { padding: 16px 20px; overflow-y: auto; max-height: 70vh; }
.bottom-sheet-footer { padding: 12px 20px; border-top: 1px solid #f3f4f6; }
.bottom-sheet-overlay {
  position: fixed; inset: 0;
  background-color: rgba(0,0,0,0);
  z-index: 499;
  pointer-events: none;
  transition: background-color 0.3s;
}
.bottom-sheet-overlay.visible {
  background-color: rgba(0,0,0,0.45);
  pointer-events: auto;
}

/* ── Swipeable carousel ── */
.swipe-carousel {
  display: flex;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  gap: 12px;
  padding-bottom: 4px;
}
.swipe-carousel::-webkit-scrollbar { display: none; }
.swipe-carousel-item {
  flex-shrink: 0;
  scroll-snap-align: start;
  border-radius: 12px;
  overflow: hidden;
}
.swipe-carousel-full  .swipe-carousel-item { width: 100%; }
.swipe-carousel-peek  .swipe-carousel-item { width: calc(100% - 32px); }
.swipe-carousel-multi .swipe-carousel-item { width: calc(50% - 6px); }
.swipe-carousel-dots  { display: flex; gap: 6px; justify-content: center; padding-top: 10px; }
.swipe-carousel-dot   { width: 6px; height: 6px; border-radius: 50%; background-color: #d1d5db; transition: background-color 0.2s, width 0.2s; }
.swipe-carousel-dot.active { background-color: #3b82f6; width: 18px; border-radius: 3px; }

/* ── Pull-to-refresh indicator ── */
.pull-to-refresh {
  display: flex; align-items: center; justify-content: center;
  height: 0; overflow: hidden;
  transition: height 0.2s;
  font-size: 13px; color: #6b7280; gap: 8px;
}
.pull-to-refresh.pulling,
.pull-to-refresh.refreshing { height: 48px; }
.pull-to-refresh-spinner {
  width: 18px; height: 18px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
}
.pull-to-refresh.refreshing .pull-to-refresh-spinner { animation: santy-spin 0.7s linear infinite; }

/* ═══════════════════════════════════════════════════════════════════════════
   v1.7 — COMMAND PALETTE
═══════════════════════════════════════════════════════════════════════════ */
.command-palette-wrap {
  position: fixed; inset: 0;
  background-color: rgba(0,0,0,0.5);
  display: none;
  align-items: flex-start; justify-content: center;
  padding-top: 80px;
  z-index: 900;
}
.command-palette-wrap.open { display: flex; }
.command-palette {
  width: 100%; max-width: 560px;
  background-color: #fff;
  border-radius: 14px;
  box-shadow: 0 24px 48px rgba(0,0,0,.22);
  overflow: hidden;
}
.command-palette-input-row {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
}
.command-palette-icon  { color: #9ca3af; flex-shrink: 0; }
.command-palette-input {
  flex: 1; border: none; outline: none;
  font-size: 16px; color: #111827; background: transparent;
}
.command-palette-input::placeholder { color: #9ca3af; }
.command-palette-kbd {
  font-size: 11px; color: #6b7280;
  background-color: #f3f4f6; border: 1px solid #d1d5db;
  border-radius: 4px; padding: 2px 6px; font-family: inherit;
}
.command-palette-list  { max-height: 360px; overflow-y: auto; padding: 8px; }
.command-palette-group-label {
  font-size: 11px; font-weight: 600; color: #6b7280;
  text-transform: uppercase; letter-spacing: 0.06em;
  padding: 8px 10px 4px;
}
.command-palette-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px; border-radius: 8px;
  cursor: pointer; font-size: 14px; color: #111827;
  transition: background-color 0.1s;
}
.command-palette-item:hover,
.command-palette-item.selected { background-color: #eff6ff; color: #1d4ed8; }
.command-palette-item-icon {
  width: 28px; height: 28px; border-radius: 6px;
  background-color: #f3f4f6;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
}
.command-palette-item-label    { flex: 1; }
.command-palette-item-shortcut { font-size: 12px; color: #9ca3af; }
.command-palette-empty { text-align: center; padding: 32px 16px; color: #9ca3af; font-size: 14px; }
.command-palette-footer {
  display: flex; gap: 12px; align-items: center;
  padding: 10px 16px; border-top: 1px solid #f3f4f6;
  font-size: 12px; color: #9ca3af;
}

/* ═══════════════════════════════════════════════════════════════════════════
   v1.7 — DATE PICKER / CALENDAR
═══════════════════════════════════════════════════════════════════════════ */
.date-picker {
  display: inline-block;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,.1);
  padding: 16px;
  user-select: none;
  width: 280px;
}
.date-picker-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.date-picker-month-year { font-size: 15px; font-weight: 600; color: #111827; }
.date-picker-nav {
  width: 28px; height: 28px;
  border: none; background: transparent;
  border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #6b7280; font-size: 14px;
  transition: background-color 0.15s;
}
.date-picker-nav:hover      { background-color: #f3f4f6; }
.date-picker-weekdays {
  display: grid; grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 11px; font-weight: 600; color: #6b7280;
  text-transform: uppercase; letter-spacing: 0.04em;
  margin-bottom: 6px;
}
.date-picker-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.date-picker-day {
  aspect-ratio: 1;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: #374151;
  border-radius: 6px; cursor: pointer;
  transition: background-color 0.12s, color 0.12s;
}
.date-picker-day:hover       { background-color: #eff6ff; color: #1d4ed8; }
.date-picker-day.today       { font-weight: 700; color: #2563eb; }
.date-picker-day.selected    { background-color: #2563eb; color: #fff; }
.date-picker-day.selected:hover { background-color: #1d4ed8; }
.date-picker-day.in-range    { background-color: #dbeafe; color: #1d4ed8; border-radius: 0; }
.date-picker-day.range-start { border-radius: 6px 0 0 6px; background-color: #2563eb; color: #fff; }
.date-picker-day.range-end   { border-radius: 0 6px 6px 0; background-color: #2563eb; color: #fff; }
.date-picker-day.other-month { color: #d1d5db; }
.date-picker-day.disabled    { color: #e5e7eb; cursor: not-allowed; pointer-events: none; }
.date-picker-footer {
  display: flex; gap: 8px; justify-content: flex-end;
  margin-top: 12px; padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

/* ═══════════════════════════════════════════════════════════════════════════
   v1.7 — CUSTOM PROPERTY SHORTHAND TOKENS
═══════════════════════════════════════════════════════════════════════════ */
.use-custom-spacing { gap: var(--sc-gap, 16px); padding: var(--sc-padding, 16px); }
.use-custom-radius  { border-radius: var(--sc-radius, 8px); }
.use-custom-color   { color: var(--sc-color, inherit); background-color: var(--sc-bg, transparent); }
.use-custom-size    { width: var(--sc-width, auto); height: var(--sc-height, auto); }
.use-custom-font    { font-size: var(--sc-font-size, 1rem); font-weight: var(--sc-font-weight, 400); }
[data-story]         { display: block; padding: 24px; }
[data-story-bg="white"] { background-color: #fff; }
[data-story-bg="gray"]  { background-color: #f9fafb; }
[data-story-bg="dark"]  { background-color: #111827; }

/* ═══════════════════════════════════════════════════════════════════════════
   v1.9 — SCROLL, SCROLLBAR, GLASS & NEW ANIMATIONS
═══════════════════════════════════════════════════════════════════════════ */
.scroll-smooth { scroll-behavior: smooth; }
.scroll-auto   { scroll-behavior: auto; }
.scrollbar-thin::-webkit-scrollbar { width:4px; height:4px; }
.scrollbar-thin::-webkit-scrollbar-track { background:transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:4px; }
.scrollbar-thin { scrollbar-width:thin; scrollbar-color:#d1d5db transparent; }
.scrollbar-dark::-webkit-scrollbar { width:4px; height:4px; }
.scrollbar-dark::-webkit-scrollbar-track { background:#09090b; }
.scrollbar-dark::-webkit-scrollbar-thumb { background:#3f3f46; border-radius:4px; }
.scrollbar-dark { scrollbar-width:thin; scrollbar-color:#3f3f46 #09090b; }
.scrollbar-hidden { -ms-overflow-style:none; scrollbar-width:none; }
.scrollbar-hidden::-webkit-scrollbar { display:none; }
.glass       { background:rgba(255,255,255,0.1); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,0.15); }
.glass-dark  { background:rgba(9,9,11,0.85); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,0.08); }
.glass-light { background:rgba(255,255,255,0.7); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,0.5); }
.gradient-radial        { background:radial-gradient(circle, var(--grad-from,#6366f1) 0%, var(--grad-to,transparent) 70%); }
.gradient-radial-top    { background:radial-gradient(ellipse at top, var(--grad-from,#6366f1) 0%, var(--grad-to,transparent) 70%); }
.gradient-radial-bottom { background:radial-gradient(ellipse at bottom, var(--grad-from,#6366f1) 0%, var(--grad-to,transparent) 70%); }
.gradient-radial-tl     { background:radial-gradient(ellipse at top left, var(--grad-from,#6366f1) 0%, var(--grad-to,transparent) 70%); }
.gradient-radial-tr     { background:radial-gradient(ellipse at top right, var(--grad-from,#6366f1) 0%, var(--grad-to,transparent) 70%); }
.gradient-radial-bl     { background:radial-gradient(ellipse at bottom left, var(--grad-from,#6366f1) 0%, var(--grad-to,transparent) 70%); }
.gradient-radial-br     { background:radial-gradient(ellipse at bottom right, var(--grad-from,#6366f1) 0%, var(--grad-to,transparent) 70%); }
@keyframes santy-spin-ccw  { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
.animate-spin-slow      { animation:santy-spin     3s   linear infinite; }
.animate-spin-fast      { animation:santy-spin     0.4s linear infinite; }
.animate-spin-cw        { animation:santy-spin     1s   linear infinite; }
.animate-spin-ccw       { animation:santy-spin-ccw 1s   linear infinite; }
.animate-spin-slow-cw   { animation:santy-spin     3s   linear infinite; }
.animate-spin-slow-ccw  { animation:santy-spin-ccw 3s   linear infinite; }
.animate-spin-xslow-cw  { animation:santy-spin     8s   linear infinite; }
.animate-spin-xslow-ccw { animation:santy-spin-ccw 8s   linear infinite; }
@keyframes santy-pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.45;transform:scale(.75)} }
.animate-pulse-dot { animation:santy-pulse-dot 2s ease-in-out infinite; }
.skill-bar-animated { transition:width 1.2s cubic-bezier(.4,0,.2,1); }

/* ─────────────────────────────────────────────────────────────────────────────
   🦇 CREATURE ANIMATIONS v2.0 — Premium Free
   10 hand-crafted creature animations: bat, butterfly, firefly, spider, fish,
   jellyfish, bird-flock, bee, snake, dragon.
   ───────────────────────────────────────────────────────────────────────────── */

/* 1 ── Bat flying ──────────────────────────────────────────────────────────── */
@keyframes santy-bat-fly {
  0%   { transform: translate(-28px,  0px)  rotate(-6deg); }
  15%  { transform: translate(-14px, -16px) rotate(4deg);  }
  30%  { transform: translate(0px,    4px)  rotate(-8deg); }
  45%  { transform: translate(14px,  -14px) rotate(5deg);  }
  60%  { transform: translate(26px,   2px)  rotate(-6deg); }
  75%  { transform: translate(14px,  -10px) rotate(4deg);  }
  90%  { transform: translate(0px,    6px)  rotate(-5deg); }
  100% { transform: translate(-28px,  0px)  rotate(-6deg); }
}
@keyframes santy-bat-wing-l {
  0%, 100% { transform: rotate(-15deg) scaleY(1);    }
  50%       { transform: rotate(50deg)  scaleY(0.35); }
}
@keyframes santy-bat-wing-r {
  0%, 100% { transform: rotate(15deg)  scaleY(1);    }
  50%       { transform: rotate(-50deg) scaleY(0.35); }
}
/* Legacy single-class wing shorthand */
@keyframes santy-bat-wings {
  0%, 100% { transform: scaleY(1); }
  50%       { transform: scaleY(0.2) rotate(6deg); }
}
.animate-bat-fly   { animation: santy-bat-fly   1.6s ease-in-out infinite; }
.animate-bat-wings { animation: santy-bat-wings 0.22s ease-in-out infinite; }

/* CSS bat component — use with <div class="bat-creature animate-bat-fly"> */
.bat-creature {
  position: relative; display: inline-block;
  width: 64px; height: 28px; color: #6d28d9;
  perspective: 120px;
}
.bat-creature .bat-wing-l,
.bat-creature .bat-wing-r {
  position: absolute; top: 0;
  width: 28px; height: 100%;
  background: currentColor;
}
.bat-creature .bat-wing-l {
  left: 0;
  border-radius: 80% 0 40% 40%;
  transform-origin: right center;
  animation: santy-bat-wing-l 0.28s ease-in-out infinite;
}
.bat-creature .bat-wing-r {
  right: 0;
  border-radius: 0 80% 40% 40%;
  transform-origin: left center;
  animation: santy-bat-wing-r 0.28s ease-in-out infinite;
}
.bat-creature .bat-body {
  position: absolute; z-index: 2;
  width: 16px; height: 14px;
  background: currentColor;
  border-radius: 50%;
  top: 50%; left: 50%;
  transform: translate(-50%, -40%);
}
.bat-creature .bat-ear-l,
.bat-creature .bat-ear-r {
  position: absolute; top: 2px; z-index: 3;
  width: 0; height: 0; border-style: solid;
}
.bat-creature .bat-ear-l {
  left: 22px;
  border-width: 0 5px 8px 0;
  border-color: transparent currentColor transparent transparent;
}
.bat-creature .bat-ear-r {
  right: 22px;
  border-width: 0 0 8px 5px;
  border-color: transparent transparent transparent currentColor;
}

/* 1b ── Bat pixel art ──────────────────────────────────────────────────────── */
/* Colors: #54556b = outline, #202020 = body, #fff = eyes */
@keyframes bat-pixel-anim {
  0% {
    box-shadow:
      33px 6px #54556b,34px 6px #54556b,35px 6px #54556b,36px 6px #54556b,
      20px 7px #54556b,21px 7px #54556b,22px 7px #54556b,23px 7px #54556b,33px 7px #54556b,34px 7px #54556b,35px 7px #202020,36px 7px #202020,37px 7px #54556b,38px 7px #54556b,39px 7px #54556b,43px 7px #54556b,
      20px 8px #54556b,21px 8px #54556b,22px 8px #54556b,23px 8px #54556b,33px 8px #54556b,34px 8px #54556b,35px 8px #202020,36px 8px #202020,37px 8px #54556b,38px 8px #54556b,39px 8px #54556b,43px 8px #54556b,
      17px 9px #54556b,18px 9px #54556b,19px 9px #54556b,20px 9px #54556b,35px 9px #54556b,36px 9px #202020,37px 9px #202020,38px 9px #202020,39px 9px #202020,40px 9px #54556b,41px 9px #54556b,42px 9px #54556b,43px 9px #202020,44px 9px #54556b,45px 9px #54556b,
      16px 10px #54556b,17px 10px #202020,18px 10px #202020,19px 10px #202020,20px 10px #54556b,36px 10px #54556b,37px 10px #202020,38px 10px #202020,39px 10px #202020,40px 10px #202020,41px 10px #202020,42px 10px #202020,43px 10px #202020,44px 10px #54556b,45px 10px #54556b,
      16px 11px #54556b,17px 11px #202020,18px 11px #202020,19px 11px #202020,20px 11px #54556b,36px 11px #54556b,37px 11px #202020,38px 11px #202020,39px 11px #202020,40px 11px #202020,41px 11px #202020,42px 11px #202020,43px 11px #202020,44px 11px #54556b,45px 11px #54556b,
      13px 12px #54556b,14px 12px #54556b,15px 12px #54556b,16px 12px #202020,17px 12px #202020,18px 12px #54556b,19px 12px #54556b,20px 12px #54556b,36px 12px #54556b,37px 12px #54556b,38px 12px #54556b,39px 12px #202020,40px 12px #202020,41px 12px #202020,42px 12px #202020,43px 12px #202020,44px 12px #54556b,45px 12px #54556b,
      12px 13px #54556b,13px 13px #202020,14px 13px #202020,15px 13px #202020,16px 13px #202020,17px 13px #202020,18px 13px #54556b,19px 13px #54556b,37px 13px #54556b,38px 13px #54556b,39px 13px #202020,40px 13px #202020,41px 13px #202020,42px 13px #202020,43px 13px #202020,44px 13px #202020,45px 13px #202020,46px 13px #54556b,
      10px 14px #54556b,11px 14px #54556b,12px 14px #202020,13px 14px #202020,14px 14px #202020,15px 14px #202020,16px 14px #202020,17px 14px #54556b,36px 14px #54556b,37px 14px #54556b,38px 14px #54556b,39px 14px #202020,40px 14px #202020,41px 14px #202020,42px 14px #202020,43px 14px #202020,44px 14px #202020,45px 14px #202020,46px 14px #202020,47px 14px #54556b,
      10px 15px #54556b,11px 15px #54556b,12px 15px #202020,13px 15px #202020,14px 15px #202020,15px 15px #202020,16px 15px #202020,17px 15px #54556b,36px 15px #54556b,37px 15px #54556b,38px 15px #54556b,39px 15px #202020,40px 15px #202020,41px 15px #202020,42px 15px #202020,43px 15px #202020,44px 15px #202020,45px 15px #202020,46px 15px #202020,47px 15px #54556b,
      10px 16px #54556b,11px 16px #54556b,12px 16px #202020,13px 16px #202020,14px 16px #202020,15px 16px #202020,16px 16px #202020,17px 16px #54556b,35px 16px #54556b,36px 16px #54556b,37px 16px #202020,38px 16px #202020,39px 16px #202020,40px 16px #202020,41px 16px #202020,42px 16px #202020,43px 16px #202020,44px 16px #202020,45px 16px #202020,46px 16px #202020,47px 16px #54556b,
      9px 17px #54556b,10px 17px #202020,11px 17px #202020,12px 17px #202020,13px 17px #202020,14px 17px #202020,15px 17px #202020,16px 17px #202020,17px 17px #54556b,37px 17px #54556b,38px 17px #54556b,39px 17px #202020,40px 17px #202020,41px 17px #202020,42px 17px #202020,43px 17px #202020,44px 17px #202020,45px 17px #202020,46px 17px #202020,47px 17px #202020,48px 17px #54556b,49px 17px #54556b,51px 17px #54556b,
      7px 18px #54556b,8px 18px #54556b,9px 18px #54556b,10px 18px #202020,11px 18px #202020,12px 18px #202020,13px 18px #202020,14px 18px #202020,15px 18px #202020,16px 18px #202020,17px 18px #54556b,20px 18px #54556b,37px 18px #54556b,38px 18px #54556b,39px 18px #202020,40px 18px #202020,41px 18px #202020,42px 18px #202020,43px 18px #202020,44px 18px #202020,45px 18px #202020,46px 18px #202020,47px 18px #202020,48px 18px #54556b,49px 18px #54556b,51px 18px #202020,
      7px 19px #54556b,8px 19px #54556b,9px 19px #54556b,10px 19px #202020,11px 19px #202020,12px 19px #202020,13px 19px #202020,14px 19px #202020,15px 19px #202020,16px 19px #202020,17px 19px #54556b,20px 19px #54556b,37px 19px #54556b,38px 19px #54556b,39px 19px #202020,40px 19px #202020,41px 19px #202020,42px 19px #202020,43px 19px #202020,44px 19px #202020,45px 19px #202020,46px 19px #202020,47px 19px #202020,48px 19px #54556b,49px 19px #54556b,51px 19px #202020,
      7px 20px #54556b,8px 20px #54556b,9px 20px #202020,10px 20px #202020,11px 20px #202020,12px 20px #202020,13px 20px #202020,14px 20px #202020,15px 20px #202020,16px 20px #202020,17px 20px #202020,18px 20px #54556b,19px 20px #54556b,20px 20px #202020,21px 20px #54556b,36px 20px #54556b,37px 20px #202020,38px 20px #202020,39px 20px #202020,40px 20px #202020,41px 20px #202020,42px 20px #202020,43px 20px #202020,44px 20px #202020,45px 20px #202020,46px 20px #202020,47px 20px #202020,48px 20px #54556b,49px 20px #54556b,54px 20px #54556b,55px 20px #54556b,
      9px 21px #54556b,10px 21px #202020,11px 21px #202020,12px 21px #202020,13px 21px #202020,14px 21px #202020,15px 21px #202020,16px 21px #202020,17px 21px #202020,18px 21px #202020,19px 21px #202020,20px 21px #202020,21px 21px #54556b,35px 21px #54556b,36px 21px #54556b,37px 21px #202020,38px 21px #202020,39px 21px #202020,40px 21px #202020,41px 21px #202020,42px 21px #202020,43px 21px #202020,44px 21px #202020,45px 21px #202020,46px 21px #202020,47px 21px #202020,48px 21px #54556b,49px 21px #54556b,52px 21px #54556b,53px 21px #54556b,54px 21px #202020,55px 21px #202020,56px 21px #54556b,57px 21px #54556b,
      9px 22px #54556b,10px 22px #202020,11px 22px #202020,12px 22px #202020,13px 22px #202020,14px 22px #202020,15px 22px #202020,16px 22px #202020,17px 22px #202020,18px 22px #202020,19px 22px #202020,20px 22px #54556b,32px 22px #54556b,33px 22px #54556b,34px 22px #54556b,35px 22px #202020,36px 22px #202020,37px 22px #202020,38px 22px #202020,39px 22px #202020,40px 22px #202020,41px 22px #202020,42px 22px #202020,43px 22px #202020,44px 22px #202020,45px 22px #202020,46px 22px #202020,47px 22px #54556b,48px 22px #54556b,49px 22px #54556b,50px 22px #54556b,52px 22px #54556b,53px 22px #54556b,54px 22px #202020,55px 22px #202020,56px 22px #54556b,57px 22px #54556b,
      9px 23px #54556b,10px 23px #202020,11px 23px #202020,12px 23px #202020,13px 23px #202020,14px 23px #202020,15px 23px #202020,16px 23px #202020,17px 23px #202020,18px 23px #202020,19px 23px #202020,20px 23px #54556b,32px 23px #54556b,33px 23px #54556b,34px 23px #54556b,35px 23px #202020,36px 23px #202020,37px 23px #202020,38px 23px #202020,39px 23px #202020,40px 23px #202020,41px 23px #202020,42px 23px #202020,43px 23px #202020,44px 23px #202020,45px 23px #202020,46px 23px #202020,47px 23px #54556b,48px 23px #54556b,49px 23px #54556b,50px 23px #54556b,52px 23px #54556b,53px 23px #54556b,54px 23px #202020,55px 23px #202020,56px 23px #54556b,57px 23px #54556b,
      9px 24px #54556b,10px 24px #202020,11px 24px #202020,12px 24px #202020,13px 24px #202020,14px 24px #202020,15px 24px #202020,16px 24px #202020,17px 24px #202020,18px 24px #54556b,19px 24px #54556b,32px 24px #54556b,33px 24px #202020,34px 24px #202020,35px 24px #202020,36px 24px #202020,37px 24px #202020,38px 24px #202020,39px 24px #202020,40px 24px #202020,41px 24px #202020,42px 24px #202020,43px 24px #202020,44px 24px #202020,45px 24px #202020,46px 24px #202020,47px 24px #54556b,48px 24px #202020,49px 24px #202020,50px 24px #54556b,54px 24px #54556b,55px 24px #54556b,
      7px 25px #54556b,8px 25px #54556b,9px 25px #202020,10px 25px #202020,11px 25px #202020,12px 25px #202020,13px 25px #202020,14px 25px #202020,15px 25px #202020,16px 25px #202020,17px 25px #202020,18px 25px #54556b,19px 25px #54556b,21px 25px #54556b,28px 25px #54556b,33px 25px #54556b,34px 25px #54556b,35px 25px #202020,36px 25px #202020,37px 25px #202020,38px 25px #202020,39px 25px #202020,40px 25px #202020,41px 25px #202020,42px 25px #202020,43px 25px #202020,44px 25px #202020,45px 25px #202020,46px 25px #202020,47px 25px #202020,48px 25px #202020,49px 25px #202020,50px 25px #54556b,54px 25px #202020,
      7px 26px #54556b,8px 26px #54556b,9px 26px #202020,10px 26px #202020,11px 26px #202020,12px 26px #202020,13px 26px #202020,14px 26px #202020,15px 26px #202020,16px 26px #202020,17px 26px #202020,18px 26px #54556b,19px 26px #54556b,21px 26px #54556b,28px 26px #54556b,33px 26px #54556b,34px 26px #54556b,35px 26px #202020,36px 26px #202020,37px 26px #202020,38px 26px #202020,39px 26px #202020,40px 26px #202020,41px 26px #202020,42px 26px #202020,43px 26px #202020,44px 26px #202020,45px 26px #202020,46px 26px #202020,47px 26px #202020,48px 26px #202020,49px 26px #202020,50px 26px #54556b,54px 26px #202020,
      3px 27px #54556b,4px 27px #54556b,5px 27px #54556b,9px 27px #54556b,10px 27px #202020,11px 27px #202020,12px 27px #202020,13px 27px #202020,14px 27px #202020,15px 27px #202020,16px 27px #202020,17px 27px #54556b,20px 27px #54556b,21px 27px #202020,22px 27px #54556b,23px 27px #54556b,27px 27px #54556b,28px 27px #202020,35px 27px #54556b,36px 27px #202020,37px 27px #202020,38px 27px #202020,39px 27px #202020,40px 27px #202020,41px 27px #202020,42px 27px #202020,43px 27px #202020,44px 27px #202020,45px 27px #202020,46px 27px #202020,47px 27px #202020,48px 27px #54556b,49px 27px #54556b,
      1px 28px #54556b,2px 28px #54556b,3px 28px #202020,4px 28px #202020,5px 28px #202020,6px 28px #54556b,9px 28px #54556b,10px 28px #54556b,11px 28px #54556b,12px 28px #202020,13px 28px #202020,14px 28px #202020,15px 28px #202020,16px 28px #202020,17px 28px #54556b,20px 28px #54556b,21px 28px #202020,22px 28px #54556b,23px 28px #54556b,25px 28px #54556b,26px 28px #54556b,27px 28px #202020,28px 28px #202020,29px 28px #54556b,30px 28px #54556b,33px 28px #54556b,34px 28px #54556b,35px 28px #54556b,36px 28px #202020,37px 28px #202020,38px 28px #202020,39px 28px #202020,40px 28px #202020,41px 28px #202020,42px 28px #202020,43px 28px #202020,44px 28px #202020,45px 28px #202020,46px 28px #202020,47px 28px #202020,48px 28px #54556b,49px 28px #54556b,
      1px 29px #54556b,2px 29px #54556b,3px 29px #202020,4px 29px #202020,5px 29px #202020,6px 29px #54556b,10px 29px #54556b,11px 29px #54556b,12px 29px #202020,13px 29px #202020,14px 29px #202020,15px 29px #202020,16px 29px #202020,17px 29px #54556b,18px 29px #54556b,19px 29px #54556b,20px 29px #202020,21px 29px #202020,22px 29px #202020,23px 29px #202020,24px 29px #54556b,25px 29px #54556b,26px 29px #54556b,27px 29px #202020,28px 29px #202020,29px 29px #202020,30px 29px #202020,31px 29px #54556b,32px 29px #54556b,33px 29px #54556b,34px 29px #54556b,35px 29px #202020,36px 29px #202020,37px 29px #202020,38px 29px #202020,39px 29px #202020,40px 29px #202020,41px 29px #202020,42px 29px #202020,43px 29px #202020,44px 29px #202020,45px 29px #202020,46px 29px #202020,47px 29px #54556b,52px 29px #54556b,53px 29px #54556b,54px 29px #54556b,
      1px 30px #54556b,2px 30px #54556b,3px 30px #202020,4px 30px #202020,5px 30px #202020,6px 30px #54556b,10px 30px #54556b,11px 30px #54556b,12px 30px #202020,13px 30px #202020,14px 30px #202020,15px 30px #202020,16px 30px #202020,17px 30px #54556b,18px 30px #54556b,19px 30px #54556b,20px 30px #202020,21px 30px #202020,22px 30px #202020,23px 30px #202020,24px 30px #54556b,25px 30px #54556b,26px 30px #54556b,27px 30px #202020,28px 30px #202020,29px 30px #202020,30px 30px #202020,31px 30px #54556b,32px 30px #54556b,33px 30px #54556b,34px 30px #54556b,35px 30px #202020,36px 30px #202020,37px 30px #202020,38px 30px #202020,39px 30px #202020,40px 30px #202020,41px 30px #202020,42px 30px #202020,43px 30px #202020,44px 30px #202020,45px 30px #202020,46px 30px #202020,47px 30px #54556b,52px 30px #54556b,53px 30px #54556b,54px 30px #54556b,
      3px 31px #54556b,4px 31px #54556b,5px 31px #54556b,7px 31px #202020,8px 31px #202020,9px 31px #202020,10px 31px #54556b,11px 31px #54556b,12px 31px #202020,13px 31px #202020,14px 31px #202020,15px 31px #202020,16px 31px #202020,17px 31px #54556b,18px 31px #202020,19px 31px #202020,20px 31px #202020,21px 31px #202020,22px 31px #202020,23px 31px #202020,24px 31px #54556b,25px 31px #202020,26px 31px #202020,27px 31px #202020,28px 31px #202020,29px 31px #202020,30px 31px #202020,31px 31px #202020,32px 31px #54556b,33px 31px #54556b,34px 31px #54556b,35px 31px #202020,36px 31px #202020,37px 31px #202020,38px 31px #202020,39px 31px #202020,40px 31px #202020,41px 31px #202020,42px 31px #202020,43px 31px #202020,44px 31px #202020,45px 31px #202020,46px 31px #202020,47px 31px #54556b,52px 31px #202020,53px 31px #202020,54px 31px #202020,
      7px 32px #202020,8px 32px #202020,9px 32px #54556b,12px 32px #54556b,13px 32px #202020,14px 32px #202020,15px 32px #202020,16px 32px #202020,17px 32px #202020,18px 32px #202020,19px 32px #202020,20px 32px #202020,21px 32px #202020,22px 32px #202020,23px 32px #202020,24px 32px #202020,25px 32px #202020,26px 32px #202020,27px 32px #202020,28px 32px #202020,29px 32px #202020,30px 32px #202020,31px 32px #202020,32px 32px #202020,33px 32px #202020,34px 32px #202020,35px 32px #202020,36px 32px #202020,37px 32px #202020,38px 32px #202020,39px 32px #202020,40px 32px #202020,41px 32px #202020,42px 32px #202020,43px 32px #202020,44px 32px #202020,45px 32px #202020,46px 32px #54556b,51px 32px #54556b,52px 32px #202020,53px 32px #202020,54px 32px #54556b,
      13px 33px #54556b,14px 33px #202020,15px 33px #202020,16px 33px #202020,17px 33px #202020,18px 33px #202020,19px 33px #202020,20px 33px #202020,21px 33px #202020,22px 33px #202020,23px 33px #202020,24px 33px #202020,25px 33px #202020,26px 33px #202020,27px 33px #202020,28px 33px #202020,29px 33px #202020,30px 33px #202020,31px 33px #202020,32px 33px #202020,33px 33px #202020,34px 33px #202020,35px 33px #202020,36px 33px #202020,37px 33px #202020,38px 33px #202020,39px 33px #202020,40px 33px #202020,41px 33px #202020,42px 33px #202020,43px 33px #54556b,44px 33px #54556b,45px 33px #54556b,
      13px 34px #54556b,14px 34px #202020,15px 34px #202020,16px 34px #202020,17px 34px #202020,18px 34px #202020,19px 34px #202020,20px 34px #202020,21px 34px #202020,22px 34px #202020,23px 34px #202020,24px 34px #202020,25px 34px #202020,26px 34px #202020,27px 34px #202020,28px 34px #202020,29px 34px #202020,30px 34px #202020,31px 34px #202020,32px 34px #202020,33px 34px #202020,34px 34px #202020,35px 34px #202020,36px 34px #202020,37px 34px #202020,38px 34px #202020,39px 34px #202020,40px 34px #202020,41px 34px #202020,42px 34px #202020,43px 34px #54556b,44px 34px #54556b,45px 34px #54556b,
      13px 35px #54556b,14px 35px #54556b,15px 35px #54556b,16px 35px #54556b,17px 35px #202020,18px 35px #202020,19px 35px #202020,20px 35px #202020,21px 35px #202020,22px 35px #202020,23px 35px #202020,24px 35px #202020,25px 35px #202020,26px 35px #202020,27px 35px #202020,28px 35px #202020,29px 35px #202020,30px 35px #202020,31px 35px #202020,32px 35px #202020,33px 35px #202020,34px 35px #202020,35px 35px #202020,36px 35px #202020,37px 35px #202020,38px 35px #202020,39px 35px #54556b,40px 35px #54556b,41px 35px #54556b,42px 35px #54556b,
      7px 36px #54556b,8px 36px #54556b,9px 36px #54556b,12px 36px #202020,14px 36px #54556b,15px 36px #54556b,16px 36px #54556b,17px 36px #202020,18px 36px #202020,19px 36px #202020,20px 36px #202020,21px 36px #202020,22px 36px #202020,23px 36px #202020,24px 36px #202020,25px 36px #202020,26px 36px #202020,27px 36px #202020,28px 36px #202020,29px 36px #202020,30px 36px #202020,31px 36px #202020,32px 36px #202020,33px 36px #202020,34px 36px #202020,35px 36px #202020,36px 36px #202020,37px 36px #54556b,38px 36px #54556b,39px 36px #54556b,
      6px 37px #54556b,7px 37px #202020,8px 37px #202020,9px 37px #202020,10px 37px #202020,11px 37px #202020,16px 37px #54556b,17px 37px #202020,18px 37px #202020,19px 37px #202020,20px 37px #fff,21px 37px #202020,22px 37px #202020,23px 37px #202020,24px 37px #202020,25px 37px #fff,26px 37px #fff,27px 37px #fff,28px 37px #202020,29px 37px #202020,30px 37px #202020,31px 37px #202020,32px 37px #202020,33px 37px #202020,34px 37px #202020,35px 37px #202020,36px 37px #54556b,37px 37px #202020,38px 37px #202020,39px 37px #54556b,40px 37px #54556b,41px 37px #54556b,42px 37px #54556b,43px 37px #54556b,44px 37px #202020,45px 37px #202020,46px 37px #54556b,
      6px 38px #54556b,7px 38px #202020,8px 38px #202020,9px 38px #202020,10px 38px #202020,11px 38px #202020,16px 38px #54556b,17px 38px #202020,18px 38px #202020,19px 38px #202020,20px 38px #fff,21px 38px #202020,22px 38px #202020,23px 38px #202020,24px 38px #202020,25px 38px #fff,26px 38px #fff,27px 38px #fff,28px 38px #202020,29px 38px #202020,30px 38px #202020,31px 38px #202020,32px 38px #202020,33px 38px #202020,34px 38px #202020,35px 38px #202020,36px 38px #54556b,37px 38px #202020,38px 38px #202020,39px 38px #54556b,40px 38px #54556b,41px 38px #54556b,42px 38px #54556b,43px 38px #54556b,44px 38px #202020,45px 38px #202020,46px 38px #54556b,
      7px 39px #202020,8px 39px #202020,9px 39px #202020,10px 39px #54556b,11px 39px #54556b,13px 39px #202020,17px 39px #54556b,18px 39px #202020,19px 39px #202020,20px 39px #fff,21px 39px #202020,22px 39px #202020,23px 39px #202020,24px 39px #202020,25px 39px #fff,26px 39px #fff,27px 39px #fff,28px 39px #202020,29px 39px #202020,30px 39px #202020,31px 39px #202020,32px 39px #202020,33px 39px #202020,34px 39px #202020,35px 39px #202020,36px 39px #202020,37px 39px #202020,38px 39px #202020,39px 39px #202020,40px 39px #202020,41px 39px #202020,42px 39px #202020,43px 39px #202020,44px 39px #54556b,45px 39px #54556b,
      17px 40px #54556b,18px 40px #202020,19px 40px #202020,20px 40px #202020,21px 40px #202020,22px 40px #202020,23px 40px #202020,24px 40px #202020,25px 40px #202020,26px 40px #202020,27px 40px #202020,28px 40px #202020,29px 40px #202020,30px 40px #202020,31px 40px #202020,32px 40px #202020,33px 40px #202020,34px 40px #202020,35px 40px #202020,36px 40px #202020,37px 40px #202020,38px 40px #202020,39px 40px #202020,40px 40px #202020,41px 40px #54556b,42px 40px #54556b,43px 40px #54556b,
      18px 41px #54556b,19px 41px #54556b,20px 41px #202020,21px 41px #202020,22px 41px #202020,23px 41px #202020,24px 41px #202020,25px 41px #202020,26px 41px #202020,27px 41px #202020,28px 41px #202020,29px 41px #202020,30px 41px #202020,31px 41px #202020,32px 41px #202020,33px 41px #202020,34px 41px #202020,35px 41px #202020,36px 41px #54556b,37px 41px #54556b,38px 41px #54556b,39px 41px #54556b,40px 41px #54556b,
      18px 42px #54556b,19px 42px #54556b,20px 42px #202020,21px 42px #202020,22px 42px #202020,23px 42px #202020,24px 42px #202020,25px 42px #202020,26px 42px #202020,27px 42px #202020,28px 42px #202020,29px 42px #202020,30px 42px #202020,31px 42px #202020,32px 42px #202020,33px 42px #202020,34px 42px #202020,35px 42px #202020,36px 42px #54556b,37px 42px #54556b,38px 42px #54556b,39px 42px #54556b,40px 42px #54556b,
      20px 43px #54556b,21px 43px #54556b,22px 43px #202020,23px 43px #202020,24px 43px #202020,25px 43px #202020,26px 43px #202020,27px 43px #202020,28px 43px #202020,29px 43px #202020,30px 43px #202020,31px 43px #202020,32px 43px #54556b,33px 43px #54556b,34px 43px #54556b,35px 43px #54556b,36px 43px #54556b,
      22px 44px #54556b,23px 44px #54556b,24px 44px #54556b,25px 44px #54556b,26px 44px #54556b,27px 44px #54556b,28px 44px #54556b,29px 44px #54556b,30px 44px #54556b,31px 44px #54556b,32px 44px #54556b,
      22px 45px #54556b,23px 45px #54556b,24px 45px #54556b,25px 45px #54556b,26px 45px #54556b,27px 45px #54556b,28px 45px #54556b,29px 45px #54556b,30px 45px #54556b,31px 45px #54556b,32px 45px #54556b,
      52px 46px #202020,53px 46px #202020,51px 47px #202020,52px 47px #202020,53px 47px #202020,21px 50px #202020,21px 51px #202020;
  }
  33% {
    box-shadow:
      17px 7px #54556b,37px 7px #54556b,38px 7px #54556b,
      17px 8px #54556b,37px 8px #54556b,38px 8px #54556b,
      16px 9px #54556b,17px 9px #202020,18px 9px #54556b,19px 9px #54556b,36px 9px #54556b,37px 9px #202020,38px 9px #202020,39px 9px #54556b,43px 9px #54556b,44px 9px #54556b,45px 9px #54556b,
      14px 10px #54556b,15px 10px #54556b,16px 10px #202020,17px 10px #54556b,37px 10px #54556b,38px 10px #54556b,39px 10px #202020,40px 10px #54556b,43px 10px #54556b,44px 10px #202020,45px 10px #202020,46px 10px #54556b,
      14px 11px #54556b,15px 11px #54556b,16px 11px #202020,17px 11px #54556b,37px 11px #54556b,38px 11px #54556b,39px 11px #202020,40px 11px #54556b,43px 11px #54556b,44px 11px #202020,45px 11px #202020,46px 11px #54556b,
      10px 12px #54556b,11px 12px #54556b,13px 12px #54556b,14px 12px #202020,15px 12px #202020,16px 12px #202020,17px 12px #54556b,37px 12px #54556b,38px 12px #54556b,39px 12px #202020,40px 12px #202020,41px 12px #54556b,42px 12px #54556b,43px 12px #54556b,44px 12px #202020,45px 12px #202020,46px 12px #202020,47px 12px #54556b,
      10px 13px #54556b,11px 13px #54556b,12px 13px #54556b,13px 13px #202020,14px 13px #202020,15px 13px #202020,16px 13px #54556b,39px 13px #54556b,40px 13px #202020,41px 13px #202020,42px 13px #202020,43px 13px #202020,44px 13px #54556b,45px 13px #54556b,46px 13px #202020,47px 13px #202020,48px 13px #54556b,49px 13px #54556b,
      9px 14px #54556b,10px 14px #202020,11px 14px #202020,12px 14px #202020,13px 14px #202020,14px 14px #202020,15px 14px #202020,16px 14px #54556b,39px 14px #54556b,40px 14px #202020,41px 14px #202020,42px 14px #202020,43px 14px #202020,44px 14px #54556b,45px 14px #54556b,46px 14px #202020,47px 14px #202020,48px 14px #54556b,49px 14px #54556b,
      9px 15px #54556b,10px 15px #202020,11px 15px #202020,12px 15px #202020,13px 15px #202020,14px 15px #202020,15px 15px #202020,16px 15px #54556b,39px 15px #54556b,40px 15px #202020,41px 15px #202020,42px 15px #202020,43px 15px #202020,44px 15px #54556b,45px 15px #54556b,46px 15px #202020,47px 15px #202020,48px 15px #54556b,49px 15px #54556b,
      9px 16px #54556b,10px 16px #202020,11px 16px #202020,12px 16px #202020,13px 16px #202020,14px 16px #54556b,15px 16px #54556b,39px 16px #54556b,40px 16px #202020,41px 16px #202020,42px 16px #202020,43px 16px #202020,44px 16px #54556b,45px 16px #54556b,46px 16px #202020,47px 16px #202020,48px 16px #54556b,49px 16px #54556b,50px 16px #54556b,
      7px 17px #54556b,8px 17px #54556b,9px 17px #202020,10px 17px #202020,11px 17px #202020,12px 17px #202020,13px 17px #202020,14px 17px #54556b,15px 17px #54556b,37px 17px #54556b,38px 17px #54556b,39px 17px #54556b,40px 17px #202020,41px 17px #202020,42px 17px #202020,43px 17px #202020,44px 17px #202020,45px 17px #202020,46px 17px #202020,47px 17px #202020,48px 17px #202020,49px 17px #202020,50px 17px #54556b,
      7px 18px #54556b,8px 18px #54556b,9px 18px #202020,10px 18px #202020,11px 18px #202020,12px 18px #202020,13px 18px #202020,14px 18px #54556b,15px 18px #54556b,37px 18px #54556b,38px 18px #54556b,39px 18px #202020,41px 18px #202020,42px 18px #202020,43px 18px #202020,44px 18px #202020,45px 18px #202020,46px 18px #202020,47px 18px #202020,48px 18px #202020,49px 18px #202020,50px 18px #54556b,56px 18px #202020,57px 18px #202020,58px 18px #202020,59px 18px #202020,
      7px 19px #54556b,8px 19px #54556b,9px 19px #202020,10px 19px #202020,11px 19px #202020,12px 19px #202020,13px 19px #202020,14px 19px #54556b,15px 19px #54556b,37px 19px #54556b,38px 19px #54556b,39px 19px #202020,41px 19px #202020,42px 19px #202020,43px 19px #202020,44px 19px #202020,45px 19px #202020,46px 19px #202020,47px 19px #202020,48px 19px #202020,49px 19px #202020,50px 19px #54556b,56px 19px #202020,57px 19px #202020,58px 19px #202020,59px 19px #202020,
      6px 20px #54556b,7px 20px #54556b,8px 20px #54556b,9px 20px #202020,10px 20px #202020,11px 20px #202020,12px 20px #202020,13px 20px #202020,14px 20px #54556b,15px 20px #54556b,17px 20px #54556b,18px 20px #54556b,19px 20px #54556b,37px 20px #54556b,38px 20px #54556b,39px 20px #202020,40px 20px #202020,41px 20px #202020,42px 20px #202020,43px 20px #202020,44px 20px #202020,45px 20px #202020,46px 20px #202020,47px 20px #202020,48px 20px #202020,49px 20px #202020,50px 20px #202020,51px 20px #54556b,56px 20px #202020,57px 20px #202020,
      6px 21px #54556b,7px 21px #54556b,8px 21px #54556b,9px 21px #202020,10px 21px #202020,11px 21px #202020,12px 21px #202020,13px 21px #202020,14px 21px #202020,15px 21px #202020,16px 21px #54556b,17px 21px #202020,18px 21px #54556b,19px 21px #54556b,39px 21px #54556b,40px 21px #202020,41px 21px #202020,42px 21px #202020,43px 21px #202020,44px 21px #202020,45px 21px #202020,46px 21px #202020,47px 21px #202020,48px 21px #202020,49px 21px #202020,50px 21px #202020,51px 21px #54556b,58px 21px #202020,59px 21px #202020,
      6px 22px #54556b,7px 22px #54556b,8px 22px #54556b,9px 22px #202020,10px 22px #202020,11px 22px #202020,12px 22px #202020,13px 22px #202020,14px 22px #202020,15px 22px #202020,16px 22px #202020,17px 22px #54556b,35px 22px #54556b,36px 22px #54556b,39px 22px #54556b,40px 22px #202020,41px 22px #202020,42px 22px #202020,43px 22px #202020,44px 22px #202020,45px 22px #202020,46px 22px #202020,47px 22px #202020,48px 22px #202020,49px 22px #202020,50px 22px #202020,51px 22px #54556b,
      6px 23px #54556b,7px 23px #54556b,8px 23px #54556b,9px 23px #202020,10px 23px #202020,11px 23px #202020,12px 23px #202020,13px 23px #202020,14px 23px #202020,15px 23px #202020,16px 23px #202020,17px 23px #54556b,35px 23px #54556b,36px 23px #54556b,39px 23px #54556b,40px 23px #202020,41px 23px #202020,42px 23px #202020,43px 23px #202020,44px 23px #202020,45px 23px #202020,46px 23px #202020,47px 23px #202020,48px 23px #202020,49px 23px #202020,50px 23px #202020,51px 23px #54556b,
      6px 24px #54556b,7px 24px #202020,8px 24px #202020,9px 24px #202020,10px 24px #202020,11px 24px #202020,12px 24px #202020,13px 24px #202020,14px 24px #202020,15px 24px #202020,16px 24px #202020,17px 24px #54556b,35px 24px #54556b,36px 24px #202020,37px 24px #54556b,38px 24px #54556b,39px 24px #202020,40px 24px #202020,41px 24px #202020,42px 24px #202020,43px 24px #202020,44px 24px #202020,45px 24px #202020,46px 24px #202020,47px 24px #202020,48px 24px #202020,49px 24px #202020,50px 24px #202020,51px 24px #54556b,
      1px 25px #202020,2px 25px #202020,3px 25px #202020,4px 25px #202020,6px 25px #54556b,7px 25px #202020,8px 25px #202020,9px 25px #202020,10px 25px #202020,11px 25px #202020,12px 25px #202020,13px 25px #202020,14px 25px #202020,15px 25px #202020,16px 25px #54556b,20px 25px #54556b,21px 25px #54556b,28px 25px #54556b,29px 25px #54556b,30px 25px #54556b,36px 25px #202020,37px 25px #202020,38px 25px #202020,39px 25px #202020,40px 25px #202020,41px 25px #202020,42px 25px #202020,43px 25px #202020,44px 25px #202020,45px 25px #202020,46px 25px #202020,47px 25px #202020,48px 25px #202020,49px 25px #202020,50px 25px #54556b,51px 25px #54556b,
      1px 26px #202020,2px 26px #202020,3px 26px #202020,4px 26px #202020,6px 26px #54556b,7px 26px #202020,8px 26px #202020,9px 26px #202020,10px 26px #202020,11px 26px #202020,12px 26px #202020,13px 26px #202020,14px 26px #202020,15px 26px #202020,16px 26px #54556b,20px 26px #54556b,21px 26px #54556b,28px 26px #54556b,29px 26px #54556b,30px 26px #54556b,36px 26px #202020,37px 26px #202020,38px 26px #202020,39px 26px #202020,40px 26px #202020,41px 26px #202020,42px 26px #202020,43px 26px #202020,44px 26px #202020,45px 26px #202020,46px 26px #202020,47px 26px #202020,48px 26px #202020,49px 26px #202020,50px 26px #54556b,51px 26px #54556b,
      3px 27px #202020,4px 27px #202020,6px 27px #54556b,7px 27px #202020,8px 27px #202020,9px 27px #202020,10px 27px #202020,11px 27px #202020,12px 27px #202020,13px 27px #202020,14px 27px #202020,15px 27px #202020,16px 27px #54556b,20px 27px #54556b,21px 27px #202020,22px 27px #54556b,23px 27px #54556b,27px 27px #54556b,28px 27px #202020,29px 27px #54556b,30px 27px #54556b,36px 27px #54556b,37px 27px #54556b,38px 27px #54556b,39px 27px #202020,40px 27px #202020,41px 27px #202020,42px 27px #202020,43px 27px #202020,44px 27px #202020,45px 27px #202020,46px 27px #202020,47px 27px #202020,48px 27px #202020,49px 27px #202020,50px 27px #202020,51px 27px #54556b,
      6px 28px #54556b,7px 28px #54556b,8px 28px #54556b,9px 28px #202020,10px 28px #202020,11px 28px #202020,12px 28px #202020,13px 28px #202020,14px 28px #202020,15px 28px #202020,16px 28px #54556b,18px 28px #54556b,19px 28px #54556b,20px 28px #54556b,21px 28px #202020,22px 28px #54556b,23px 28px #54556b,24px 28px #54556b,25px 28px #54556b,26px 28px #54556b,27px 28px #202020,28px 28px #202020,29px 28px #202020,30px 28px #202020,31px 28px #54556b,32px 28px #54556b,37px 28px #54556b,38px 28px #54556b,39px 28px #54556b,40px 28px #202020,41px 28px #202020,42px 28px #202020,43px 28px #202020,44px 28px #202020,45px 28px #202020,46px 28px #202020,47px 28px #202020,48px 28px #202020,49px 28px #202020,50px 28px #202020,51px 28px #54556b,54px 28px #202020,
      7px 29px #54556b,8px 29px #54556b,9px 29px #202020,10px 29px #202020,11px 29px #202020,12px 29px #202020,13px 29px #202020,14px 29px #54556b,15px 29px #54556b,17px 29px #54556b,18px 29px #202020,19px 29px #202020,20px 29px #202020,21px 29px #202020,22px 29px #202020,23px 29px #202020,24px 29px #54556b,25px 29px #202020,26px 29px #202020,27px 29px #202020,28px 29px #202020,29px 29px #202020,30px 29px #202020,31px 29px #202020,32px 29px #54556b,33px 29px #54556b,34px 29px #54556b,37px 29px #54556b,38px 29px #54556b,39px 29px #202020,41px 29px #202020,42px 29px #202020,43px 29px #202020,44px 29px #202020,45px 29px #202020,46px 29px #202020,47px 29px #202020,48px 29px #202020,49px 29px #202020,50px 29px #54556b,54px 29px #202020,55px 29px #202020,
      7px 30px #54556b,8px 30px #54556b,9px 30px #202020,10px 30px #202020,11px 30px #202020,12px 30px #202020,13px 30px #202020,14px 30px #54556b,15px 30px #54556b,17px 30px #54556b,18px 30px #202020,19px 30px #202020,20px 30px #202020,21px 30px #202020,22px 30px #202020,23px 30px #202020,24px 30px #54556b,25px 30px #202020,26px 30px #202020,27px 30px #202020,28px 30px #202020,29px 30px #202020,30px 30px #202020,31px 30px #202020,32px 30px #54556b,33px 30px #54556b,34px 30px #54556b,37px 30px #54556b,38px 30px #54556b,39px 30px #202020,41px 30px #202020,42px 30px #202020,43px 30px #202020,44px 30px #202020,45px 30px #202020,46px 30px #202020,47px 30px #202020,48px 30px #202020,49px 30px #202020,50px 30px #54556b,54px 30px #202020,55px 30px #202020,
      7px 31px #54556b,8px 31px #54556b,9px 31px #202020,10px 31px #202020,11px 31px #202020,12px 31px #202020,13px 31px #202020,14px 31px #54556b,15px 31px #54556b,16px 31px #54556b,17px 31px #202020,18px 31px #202020,19px 31px #202020,20px 31px #202020,21px 31px #202020,22px 31px #202020,23px 31px #202020,24px 31px #54556b,25px 31px #202020,26px 31px #202020,27px 31px #202020,28px 31px #202020,29px 31px #202020,30px 31px #202020,31px 31px #202020,32px 31px #202020,33px 31px #202020,34px 31px #202020,35px 31px #54556b,36px 31px #54556b,37px 31px #54556b,38px 31px #54556b,39px 31px #202020,40px 31px #202020,41px 31px #202020,42px 31px #202020,43px 31px #202020,44px 31px #202020,45px 31px #202020,46px 31px #202020,47px 31px #202020,48px 31px #54556b,49px 31px #54556b,50px 31px #54556b,
      7px 32px #54556b,8px 32px #54556b,9px 32px #202020,10px 32px #202020,11px 32px #202020,12px 32px #202020,13px 32px #202020,14px 32px #202020,15px 32px #202020,16px 32px #54556b,17px 32px #202020,18px 32px #202020,19px 32px #202020,20px 32px #202020,21px 32px #202020,22px 32px #202020,23px 32px #202020,24px 32px #202020,25px 32px #202020,26px 32px #202020,27px 32px #202020,28px 32px #202020,29px 32px #202020,30px 32px #202020,31px 32px #202020,32px 32px #202020,33px 32px #202020,34px 32px #202020,35px 32px #54556b,36px 32px #202020,37px 32px #202020,38px 32px #202020,39px 32px #202020,40px 32px #202020,41px 32px #202020,42px 32px #202020,43px 32px #202020,44px 32px #202020,45px 32px #202020,46px 32px #202020,47px 32px #202020,48px 32px #54556b,49px 32px #54556b,
      9px 33px #54556b,10px 33px #202020,11px 33px #202020,12px 33px #202020,13px 33px #202020,14px 33px #202020,15px 33px #202020,16px 33px #202020,17px 33px #202020,18px 33px #202020,19px 33px #202020,20px 33px #202020,21px 33px #202020,22px 33px #202020,23px 33px #202020,24px 33px #202020,25px 33px #202020,26px 33px #202020,27px 33px #202020,28px 33px #202020,29px 33px #202020,30px 33px #202020,31px 33px #202020,32px 33px #202020,33px 33px #202020,34px 33px #202020,35px 33px #202020,36px 33px #202020,37px 33px #202020,38px 33px #202020,39px 33px #202020,40px 33px #202020,41px 33px #202020,42px 33px #202020,43px 33px #202020,44px 33px #202020,45px 33px #202020,46px 33px #202020,47px 33px #54556b,
      9px 34px #54556b,10px 34px #202020,11px 34px #202020,12px 34px #202020,13px 34px #202020,14px 34px #202020,15px 34px #202020,16px 34px #202020,17px 34px #202020,18px 34px #202020,19px 34px #202020,20px 34px #202020,21px 34px #202020,22px 34px #202020,23px 34px #202020,24px 34px #202020,25px 34px #202020,26px 34px #202020,27px 34px #202020,28px 34px #202020,29px 34px #202020,30px 34px #202020,31px 34px #202020,32px 34px #202020,33px 34px #202020,34px 34px #202020,35px 34px #202020,36px 34px #202020,37px 34px #202020,38px 34px #202020,39px 34px #202020,40px 34px #202020,41px 34px #202020,42px 34px #202020,43px 34px #202020,44px 34px #202020,45px 34px #202020,46px 34px #202020,47px 34px #54556b,
      9px 35px #54556b,10px 35px #202020,11px 35px #202020,12px 35px #202020,13px 35px #202020,14px 35px #202020,15px 35px #202020,16px 35px #202020,17px 35px #202020,18px 35px #202020,19px 35px #202020,20px 35px #202020,21px 35px #202020,22px 35px #202020,23px 35px #202020,24px 35px #202020,25px 35px #202020,26px 35px #202020,27px 35px #202020,28px 35px #202020,29px 35px #202020,30px 35px #202020,31px 35px #202020,32px 35px #202020,33px 35px #202020,34px 35px #202020,35px 35px #202020,36px 35px #202020,37px 35px #202020,38px 35px #202020,39px 35px #202020,40px 35px #202020,41px 35px #202020,42px 35px #202020,43px 35px #202020,44px 35px #202020,45px 35px #202020,46px 35px #54556b,
      10px 36px #54556b,11px 36px #54556b,12px 36px #54556b,13px 36px #202020,14px 36px #202020,15px 36px #202020,16px 36px #54556b,17px 36px #202020,18px 36px #202020,19px 36px #202020,20px 36px #202020,21px 36px #202020,22px 36px #202020,23px 36px #202020,24px 36px #202020,25px 36px #202020,26px 36px #202020,27px 36px #202020,28px 36px #202020,29px 36px #202020,30px 36px #202020,31px 36px #202020,32px 36px #202020,33px 36px #202020,34px 36px #202020,35px 36px #202020,36px 36px #202020,37px 36px #202020,38px 36px #202020,39px 36px #202020,40px 36px #202020,41px 36px #202020,42px 36px #202020,43px 36px #54556b,44px 36px #54556b,45px 36px #54556b,
      9px 37px #202020,10px 37px #202020,11px 37px #202020,12px 37px #54556b,13px 37px #54556b,14px 37px #54556b,15px 37px #54556b,16px 37px #54556b,17px 37px #202020,18px 37px #202020,19px 37px #202020,20px 37px #fff,21px 37px #202020,22px 37px #202020,23px 37px #202020,24px 37px #202020,25px 37px #fff,26px 37px #fff,27px 37px #fff,28px 37px #202020,29px 37px #202020,30px 37px #202020,31px 37px #202020,32px 37px #202020,33px 37px #202020,34px 37px #202020,35px 37px #54556b,36px 37px #54556b,37px 37px #202020,38px 37px #202020,39px 37px #202020,40px 37px #54556b,41px 37px #54556b,42px 37px #54556b,43px 37px #54556b,44px 37px #54556b,45px 37px #54556b,46px 37px #54556b,
      9px 38px #202020,10px 38px #202020,11px 38px #202020,12px 38px #54556b,13px 38px #54556b,14px 38px #54556b,15px 38px #54556b,16px 38px #54556b,17px 38px #202020,18px 38px #202020,19px 38px #202020,20px 38px #fff,21px 38px #202020,22px 38px #202020,23px 38px #202020,24px 38px #202020,25px 38px #fff,26px 38px #fff,27px 38px #fff,28px 38px #202020,29px 38px #202020,30px 38px #202020,31px 38px #202020,32px 38px #202020,33px 38px #202020,34px 38px #202020,35px 38px #54556b,36px 38px #54556b,37px 38px #202020,38px 38px #202020,39px 38px #202020,40px 38px #54556b,41px 38px #54556b,42px 38px #54556b,43px 38px #54556b,44px 38px #54556b,45px 38px #54556b,46px 38px #54556b,
      10px 39px #202020,11px 39px #202020,14px 39px #54556b,15px 39px #54556b,16px 39px #54556b,17px 39px #54556b,18px 39px #202020,19px 39px #202020,20px 39px #fff,21px 39px #202020,22px 39px #202020,23px 39px #202020,24px 39px #202020,25px 39px #fff,26px 39px #fff,27px 39px #fff,28px 39px #202020,29px 39px #202020,30px 39px #202020,31px 39px #202020,32px 39px #202020,33px 39px #202020,34px 39px #202020,35px 39px #202020,36px 39px #202020,37px 39px #54556b,38px 39px #54556b,39px 39px #54556b,40px 39px #202020,41px 39px #202020,42px 39px #202020,43px 39px #54556b,
      17px 40px #54556b,18px 40px #202020,19px 40px #202020,20px 40px #202020,21px 40px #202020,22px 40px #202020,23px 40px #202020,24px 40px #202020,25px 40px #202020,26px 40px #202020,27px 40px #202020,28px 40px #202020,29px 40px #202020,30px 40px #202020,31px 40px #202020,32px 40px #202020,33px 40px #202020,34px 40px #202020,35px 40px #202020,36px 40px #202020,37px 40px #54556b,38px 40px #54556b,39px 40px #54556b,40px 40px #54556b,41px 40px #54556b,42px 40px #54556b,
      18px 41px #54556b,19px 41px #54556b,20px 41px #54556b,21px 41px #54556b,22px 41px #202020,23px 41px #202020,24px 41px #202020,25px 41px #202020,26px 41px #202020,27px 41px #202020,28px 41px #202020,29px 41px #202020,30px 41px #202020,31px 41px #202020,32px 41px #54556b,33px 41px #54556b,34px 41px #54556b,35px 41px #54556b,36px 41px #54556b,
      18px 42px #54556b,19px 42px #54556b,20px 42px #54556b,21px 42px #54556b,22px 42px #202020,23px 42px #202020,24px 42px #202020,25px 42px #202020,26px 42px #202020,27px 42px #202020,28px 42px #202020,29px 42px #202020,30px 42px #202020,31px 42px #202020,32px 42px #54556b,33px 42px #54556b,34px 42px #54556b,35px 42px #54556b,36px 42px #54556b,
      22px 43px #54556b,23px 43px #54556b,24px 43px #54556b,25px 43px #54556b,26px 43px #54556b,27px 43px #54556b,28px 43px #54556b,29px 43px #54556b,30px 43px #54556b,31px 43px #54556b,32px 43px #54556b,
      55px 46px #202020,55px 47px #202020;
  }
  66% {
    box-shadow:
      16px 12px #202020,17px 12px #202020,16px 13px #202020,17px 13px #202020,
      16px 14px #202020,17px 14px #202020,43px 14px #202020,44px 14px #202020,45px 14px #202020,
      16px 15px #202020,17px 15px #202020,43px 15px #202020,44px 15px #202020,45px 15px #202020,
      12px 16px #202020,13px 16px #202020,43px 16px #202020,44px 16px #202020,45px 16px #202020,
      12px 17px #202020,13px 17px #202020,
      40px 18px #202020,44px 18px #202020,45px 18px #202020,47px 18px #202020,60px 18px #202020,61px 18px #202020,62px 18px #202020,
      40px 19px #202020,44px 19px #202020,45px 19px #202020,47px 19px #202020,60px 19px #202020,61px 19px #202020,62px 19px #202020,
      12px 20px #202020,40px 20px #202020,47px 20px #202020,48px 20px #202020,49px 20px #202020,
      10px 21px #202020,11px 21px #202020,12px 21px #202020,41px 21px #202020,42px 21px #202020,48px 21px #202020,49px 21px #202020,
      9px 22px #202020,10px 22px #202020,11px 22px #202020,41px 22px #202020,42px 22px #202020,43px 22px #202020,48px 22px #202020,49px 22px #202020,50px 22px #202020,
      9px 23px #202020,10px 23px #202020,11px 23px #202020,41px 23px #202020,42px 23px #202020,43px 23px #202020,48px 23px #202020,49px 23px #202020,50px 23px #202020,
      3px 24px #202020,4px 24px #202020,7px 24px #202020,8px 24px #202020,10px 24px #202020,11px 24px #202020,41px 24px #202020,42px 24px #202020,43px 24px #202020,48px 24px #202020,49px 24px #202020,50px 24px #202020,
      7px 25px #202020,8px 25px #202020,9px 25px #202020,10px 25px #202020,11px 25px #202020,41px 25px #202020,42px 25px #202020,44px 25px #202020,45px 25px #202020,48px 25px #202020,49px 25px #202020,50px 25px #202020,
      7px 26px #202020,8px 26px #202020,9px 26px #202020,10px 26px #202020,11px 26px #202020,41px 26px #202020,42px 26px #202020,44px 26px #202020,45px 26px #202020,48px 26px #202020,49px 26px #202020,50px 26px #202020,
      6px 27px #202020,7px 27px #202020,8px 27px #202020,9px 27px #202020,10px 27px #202020,11px 27px #202020,21px 27px #202020,37px 27px #202020,38px 27px #202020,41px 27px #202020,42px 27px #202020,43px 27px #202020,44px 27px #202020,45px 27px #202020,46px 27px #202020,50px 27px #202020,
      6px 28px #202020,7px 28px #202020,8px 28px #202020,9px 28px #202020,10px 28px #202020,11px 28px #202020,25px 28px #202020,26px 28px #202020,32px 28px #202020,37px 28px #202020,38px 28px #202020,39px 28px #202020,41px 28px #202020,42px 28px #202020,43px 28px #202020,44px 28px #202020,45px 28px #202020,46px 28px #202020,50px 28px #202020,51px 28px #202020,56px 28px #202020,57px 28px #202020,
      5px 29px #202020,7px 29px #202020,8px 29px #202020,9px 29px #202020,10px 29px #202020,11px 29px #202020,21px 29px #202020,25px 29px #202020,26px 29px #202020,27px 29px #202020,35px 29px #202020,37px 29px #202020,38px 29px #202020,39px 29px #202020,40px 29px #202020,43px 29px #202020,44px 29px #202020,45px 29px #202020,46px 29px #202020,47px 29px #202020,50px 29px #202020,51px 29px #202020,
      5px 30px #202020,7px 30px #202020,8px 30px #202020,9px 30px #202020,10px 30px #202020,11px 30px #202020,21px 30px #202020,25px 30px #202020,26px 30px #202020,27px 30px #202020,35px 30px #202020,37px 30px #202020,38px 30px #202020,39px 30px #202020,40px 30px #202020,43px 30px #202020,44px 30px #202020,45px 30px #202020,46px 30px #202020,47px 30px #202020,50px 30px #202020,51px 30px #202020,
      5px 31px #202020,7px 31px #202020,8px 31px #202020,9px 31px #202020,10px 31px #202020,11px 31px #202020,17px 31px #202020,20px 31px #202020,21px 31px #202020,25px 31px #202020,26px 31px #202020,27px 31px #202020,32px 31px #202020,39px 31px #202020,40px 31px #202020,43px 31px #202020,44px 31px #202020,45px 31px #202020,46px 31px #202020,47px 31px #202020,50px 31px #202020,51px 31px #202020,
      5px 32px #202020,6px 32px #202020,7px 32px #202020,8px 32px #202020,9px 32px #202020,10px 32px #202020,11px 32px #202020,14px 32px #202020,15px 32px #202020,20px 32px #202020,21px 32px #202020,25px 32px #202020,26px 32px #202020,27px 32px #202020,28px 32px #202020,31px 32px #202020,32px 32px #202020,39px 32px #202020,40px 32px #202020,43px 32px #202020,44px 32px #202020,45px 32px #202020,46px 32px #202020,47px 32px #202020,50px 32px #202020,51px 32px #202020,
      5px 33px #202020,7px 33px #202020,8px 33px #202020,9px 33px #202020,10px 33px #202020,11px 33px #202020,14px 33px #202020,15px 33px #202020,18px 33px #202020,19px 33px #202020,20px 33px #202020,21px 33px #202020,24px 33px #202020,25px 33px #202020,26px 33px #202020,27px 33px #202020,28px 33px #202020,31px 33px #202020,32px 33px #202020,35px 33px #202020,36px 33px #202020,39px 33px #202020,40px 33px #202020,41px 33px #202020,42px 33px #202020,43px 33px #202020,44px 33px #202020,45px 33px #202020,46px 33px #202020,47px 33px #202020,50px 33px #202020,51px 33px #202020,
      5px 34px #202020,7px 34px #202020,8px 34px #202020,9px 34px #202020,10px 34px #202020,11px 34px #202020,14px 34px #202020,15px 34px #202020,18px 34px #202020,19px 34px #202020,20px 34px #202020,21px 34px #202020,24px 34px #202020,25px 34px #202020,26px 34px #202020,27px 34px #202020,28px 34px #202020,31px 34px #202020,32px 34px #202020,35px 34px #202020,36px 34px #202020,39px 34px #202020,40px 34px #202020,41px 34px #202020,42px 34px #202020,43px 34px #202020,44px 34px #202020,45px 34px #202020,46px 34px #202020,47px 34px #202020,50px 34px #202020,51px 34px #202020,
      5px 35px #202020,6px 35px #202020,7px 35px #202020,8px 35px #202020,9px 35px #202020,10px 35px #202020,11px 35px #202020,14px 35px #202020,15px 35px #202020,16px 35px #202020,17px 35px #202020,18px 35px #202020,19px 35px #202020,20px 35px #202020,21px 35px #202020,24px 35px #202020,25px 35px #202020,26px 35px #202020,27px 35px #202020,28px 35px #202020,29px 35px #202020,30px 35px #202020,31px 35px #202020,32px 35px #202020,33px 35px #202020,34px 35px #202020,35px 35px #202020,36px 35px #202020,37px 35px #202020,38px 35px #202020,39px 35px #202020,40px 35px #202020,41px 35px #202020,42px 35px #202020,43px 35px #202020,44px 35px #202020,45px 35px #202020,46px 35px #202020,47px 35px #202020,50px 35px #202020,
      5px 36px #202020,6px 36px #202020,7px 36px #202020,8px 36px #202020,9px 36px #202020,10px 36px #202020,11px 36px #202020,13px 36px #202020,14px 36px #202020,15px 36px #202020,16px 36px #202020,17px 36px #202020,18px 36px #202020,19px 36px #202020,20px 36px #202020,21px 36px #202020,24px 36px #202020,25px 36px #202020,26px 36px #202020,27px 36px #202020,28px 36px #202020,29px 36px #202020,30px 36px #202020,31px 36px #202020,32px 36px #202020,33px 36px #202020,34px 36px #202020,35px 36px #202020,36px 36px #202020,37px 36px #202020,38px 36px #202020,39px 36px #202020,40px 36px #202020,41px 36px #202020,42px 36px #202020,43px 36px #202020,44px 36px #202020,45px 36px #202020,46px 36px #202020,47px 36px #202020,
      5px 37px #202020,6px 37px #202020,7px 37px #202020,8px 37px #202020,9px 37px #202020,10px 37px #202020,11px 37px #202020,13px 37px #202020,14px 37px #202020,15px 37px #202020,17px 37px #202020,20px 37px #202020,21px 37px #202020,22px 37px #202020,23px 37px #202020,24px 37px #202020,25px 37px #202020,26px 37px #202020,27px 37px #202020,28px 37px #202020,29px 37px #202020,30px 37px #202020,31px 37px #202020,32px 37px #202020,33px 37px #202020,34px 37px #202020,35px 37px #202020,37px 37px #202020,38px 37px #202020,39px 37px #202020,40px 37px #202020,41px 37px #202020,42px 37px #202020,43px 37px #202020,44px 37px #202020,45px 37px #202020,46px 37px #202020,47px 37px #202020,
      5px 38px #202020,6px 38px #202020,7px 38px #202020,8px 38px #202020,9px 38px #202020,10px 38px #202020,11px 38px #202020,13px 38px #202020,14px 38px #202020,15px 38px #202020,17px 38px #202020,20px 38px #202020,21px 38px #202020,22px 38px #202020,23px 38px #202020,24px 38px #202020,25px 38px #202020,26px 38px #202020,27px 38px #202020,28px 38px #202020,29px 38px #202020,30px 38px #202020,31px 38px #202020,32px 38px #202020,33px 38px #202020,34px 38px #202020,35px 38px #202020,37px 38px #202020,38px 38px #202020,39px 38px #202020,40px 38px #202020,41px 38px #202020,42px 38px #202020,43px 38px #202020,44px 38px #202020,45px 38px #202020,46px 38px #202020,47px 38px #202020,
      5px 39px #202020,6px 39px #202020,7px 39px #202020,8px 39px #202020,9px 39px #202020,10px 39px #202020,11px 39px #202020,13px 39px #202020,17px 39px #202020,20px 39px #202020,21px 39px #202020,22px 39px #202020,23px 39px #202020,24px 39px #202020,27px 39px #202020,28px 39px #202020,29px 39px #202020,30px 39px #202020,31px 39px #202020,32px 39px #202020,33px 39px #202020,34px 39px #202020,37px 39px #202020,38px 39px #202020,39px 39px #202020,40px 39px #202020,41px 39px #202020,42px 39px #202020,43px 39px #202020,44px 39px #202020,45px 39px #202020,46px 39px #202020,47px 39px #202020,
      5px 40px #202020,6px 40px #202020,7px 40px #202020,8px 40px #202020,9px 40px #202020,10px 40px #202020,11px 40px #202020,12px 40px #202020,13px 40px #202020,20px 40px #202020,21px 40px #202020,22px 40px #202020,23px 40px #202020,24px 40px #202020,27px 40px #202020,29px 40px #202020,30px 40px #202020,31px 40px #202020,33px 40px #202020,34px 40px #202020,37px 40px #202020,38px 40px #202020,39px 40px #202020,40px 40px #202020,41px 40px #202020,42px 40px #202020,43px 40px #202020,44px 40px #202020,45px 40px #202020,46px 40px #202020,47px 40px #202020,
      5px 41px #202020,6px 41px #202020,7px 41px #202020,8px 41px #202020,9px 41px #202020,10px 41px #202020,11px 41px #202020,12px 41px #202020,13px 41px #202020,16px 41px #202020,17px 41px #202020,20px 41px #202020,21px 41px #202020,22px 41px #202020,23px 41px #202020,31px 41px #202020,37px 41px #202020,38px 41px #202020,39px 41px #202020,40px 41px #202020,41px 41px #202020,42px 41px #202020,43px 41px #202020,44px 41px #202020,45px 41px #202020,46px 41px #202020,47px 41px #202020,
      5px 42px #202020,6px 42px #202020,7px 42px #202020,8px 42px #202020,9px 42px #202020,10px 42px #202020,11px 42px #202020,12px 42px #202020,13px 42px #202020,16px 42px #202020,17px 42px #202020,20px 42px #202020,21px 42px #202020,22px 42px #202020,23px 42px #202020,31px 42px #202020,37px 42px #202020,38px 42px #202020,39px 42px #202020,40px 42px #202020,41px 42px #202020,42px 42px #202020,43px 42px #202020,44px 42px #202020,45px 42px #202020,46px 42px #202020,47px 42px #202020,
      6px 43px #202020,7px 43px #202020,8px 43px #202020,9px 43px #202020,10px 43px #202020,11px 43px #202020,12px 43px #202020,16px 43px #202020,17px 43px #202020,21px 43px #202020,22px 43px #202020,23px 43px #202020,31px 43px #202020,37px 43px #202020,38px 43px #202020,39px 43px #202020,40px 43px #202020,41px 43px #202020,42px 43px #202020,43px 43px #202020,44px 43px #202020,45px 43px #202020,46px 43px #202020,47px 43px #202020,
      6px 44px #202020,7px 44px #202020,8px 44px #202020,9px 44px #202020,10px 44px #202020,11px 44px #202020,12px 44px #202020,13px 44px #202020,21px 44px #202020,33px 44px #202020,34px 44px #202020,36px 44px #202020,37px 44px #202020,38px 44px #202020,39px 44px #202020,41px 44px #202020,42px 44px #202020,43px 44px #202020,44px 44px #202020,45px 44px #202020,46px 44px #202020,
      6px 45px #202020,7px 45px #202020,8px 45px #202020,9px 45px #202020,10px 45px #202020,11px 45px #202020,12px 45px #202020,13px 45px #202020,21px 45px #202020,33px 45px #202020,34px 45px #202020,36px 45px #202020,37px 45px #202020,38px 45px #202020,39px 45px #202020,41px 45px #202020,42px 45px #202020,43px 45px #202020,44px 45px #202020,45px 45px #202020,46px 45px #202020,
      7px 46px #202020,8px 46px #202020,9px 46px #202020,10px 46px #202020,11px 46px #202020,12px 46px #202020,13px 46px #202020,21px 46px #202020,36px 46px #202020,37px 46px #202020,38px 46px #202020,39px 46px #202020,41px 46px #202020,42px 46px #202020,43px 46px #202020,44px 46px #202020,45px 46px #202020,46px 46px #202020,
      9px 47px #202020,10px 47px #202020,11px 47px #202020,12px 47px #202020,13px 47px #202020,14px 47px #202020,15px 47px #202020,41px 47px #202020,42px 47px #202020,43px 47px #202020,44px 47px #202020,45px 47px #202020,46px 47px #202020,
      10px 48px #202020,11px 48px #202020,12px 48px #202020,13px 48px #202020,16px 48px #202020,41px 48px #202020,42px 48px #202020,43px 48px #202020,44px 48px #202020,45px 48px #202020,
      10px 49px #202020,11px 49px #202020,12px 49px #202020,13px 49px #202020,16px 49px #202020,41px 49px #202020,42px 49px #202020,43px 49px #202020,44px 49px #202020,45px 49px #202020,
      12px 50px #202020,13px 50px #202020,14px 50px #202020,15px 50px #202020,17px 50px #202020,40px 50px #202020,41px 50px #202020,42px 50px #202020,43px 50px #202020,44px 50px #202020,45px 50px #202020,
      13px 51px #202020,14px 51px #202020,15px 51px #202020,16px 51px #202020,17px 51px #202020,40px 51px #202020,41px 51px #202020,42px 51px #202020,43px 51px #202020,44px 51px #202020,45px 51px #202020,
      14px 52px #202020,15px 52px #202020,16px 52px #202020,40px 52px #202020,43px 52px #202020,
      14px 53px #202020,15px 53px #202020,16px 53px #202020,40px 53px #202020,43px 53px #202020;
  }
}
.bat-animation {
  width: 1px;
  height: 1px;
  transform: scale(4);
  position: relative;
  left: -128px;
  top: -128px;
  animation: .4s bat-pixel-anim steps(1) infinite;
  display: inline-block;
}

/* 2 ── Butterfly wing flap ──────────────────────────────────────────────────── */
@keyframes santy-butterfly-wings {
  0%, 100% { transform: scaleX(1)    translateY(0); }
  30%       { transform: scaleX(0.15) translateY(-6px); }
  60%       { transform: scaleX(1)    translateY(-12px); }
  80%       { transform: scaleX(0.15) translateY(-6px); }
}
@keyframes santy-butterfly-drift {
  0%, 100% { transform: translate(0, 0) rotate(-3deg); }
  25%       { transform: translate(8px, -16px) rotate(3deg); }
  50%       { transform: translate(16px, -8px) rotate(-2deg); }
  75%       { transform: translate(8px, -20px) rotate(4deg); }
}
.animate-butterfly       { animation: santy-butterfly-wings 0.5s ease-in-out infinite; }
.animate-butterfly-drift { animation: santy-butterfly-drift 3s ease-in-out infinite; }

/* 3 ── Firefly glow + float ─────────────────────────────────────────────────── */
@keyframes santy-firefly-float {
  0%   { transform: translate(0, 0);        opacity: 0.2; }
  15%  { transform: translate(12px, -18px); opacity: 1; }
  35%  { transform: translate(-8px, -30px); opacity: 0.5; }
  55%  { transform: translate(18px, -22px); opacity: 1; }
  75%  { transform: translate(-4px, -40px); opacity: 0.3; }
  100% { transform: translate(6px,  -8px);  opacity: 0.2; }
}
@keyframes santy-firefly-glow {
  0%, 100% { box-shadow: 0 0 3px 2px #fef08a, 0 0 6px 3px #fde047; opacity: 0.4; }
  50%       { box-shadow: 0 0 10px 5px #fef08a, 0 0 20px 8px #fde047; opacity: 1; }
}
.animate-firefly       { animation: santy-firefly-float 3.5s ease-in-out infinite; }
.animate-firefly-glow  { animation: santy-firefly-glow  1.4s ease-in-out infinite; border-radius: 50%; }

/* 4 ── Spider descending on thread ──────────────────────────────────────────── */
@keyframes santy-spider-drop {
  0%   { transform: translateY(-36px); opacity: 0; }
  15%  { opacity: 1; }
  45%  { transform: translateY(6px);   opacity: 1; }
  60%  { transform: translateY(-4px);  }
  70%  { transform: translateY(2px);   }
  80%  { transform: translateY(-36px); opacity: 1; }
  100% { transform: translateY(-36px); opacity: 0; }
}
@keyframes santy-spider-swing {
  0%, 100% { transform: translateY(0) rotate(-8deg); }
  50%       { transform: translateY(0) rotate(8deg); }
}
.animate-spider-drop  { animation: santy-spider-drop 3.2s ease-in-out infinite; }
.animate-spider-swing { animation: santy-spider-swing 1.2s ease-in-out infinite; }

/* 5 ── Fish swimming (tail wave) ────────────────────────────────────────────── */
@keyframes santy-fish-swim {
  0%   { transform: translateX(-24px) skewX(0deg)  scaleX(1); }
  18%  { transform: translateX(-10px) skewX(10deg) scaleX(1); }
  36%  { transform: translateX(4px)   skewX(-10deg) scaleX(1); }
  54%  { transform: translateX(16px)  skewX(10deg) scaleX(1); }
  72%  { transform: translateX(26px)  skewX(-10deg) scaleX(1); }
  90%  { transform: translateX(26px)  skewX(0deg)  scaleX(-1); }
  100% { transform: translateX(-24px) skewX(0deg)  scaleX(-1); }
}
.animate-fish-swim { animation: santy-fish-swim 2.4s ease-in-out infinite; }

/* 6 ── Jellyfish pulsing ────────────────────────────────────────────────────── */
@keyframes santy-jellyfish-pulse {
  0%, 100% { transform: scaleY(1)    scaleX(1)    translateY(0);    opacity: 0.9; }
  25%       { transform: scaleY(0.72) scaleX(1.15) translateY(10px); opacity: 1;   }
  50%       { transform: scaleY(1.1)  scaleX(0.92) translateY(-14px); opacity: 0.7; }
  75%       { transform: scaleY(0.85) scaleX(1.08) translateY(6px);  opacity: 0.95; }
}
@keyframes santy-jellyfish-tendrils {
  0%, 100% { transform: skewX(0deg)  scaleY(1);   }
  33%       { transform: skewX(8deg)  scaleY(1.1); }
  66%       { transform: skewX(-8deg) scaleY(0.9); }
}
.animate-jellyfish          { animation: santy-jellyfish-pulse    2.2s ease-in-out infinite; }
.animate-jellyfish-tendrils { animation: santy-jellyfish-tendrils 1.1s ease-in-out infinite; }

/* 7 ── Bird flock formation ─────────────────────────────────────────────────── */
@keyframes santy-bird-flock {
  0%   { transform: translate(-28px, 0)    rotate(-8deg); }
  25%  { transform: translate(-8px,  -20px) rotate(4deg); }
  50%  { transform: translate(12px,  0)    rotate(-5deg); }
  75%  { transform: translate(28px,  -16px) rotate(6deg); }
  100% { transform: translate(-28px, 0)    rotate(-8deg); }
}
.animate-bird-flock   { animation: santy-bird-flock 3s   ease-in-out          infinite; }
.animate-bird-flock-2 { animation: santy-bird-flock 3s   ease-in-out 0.35s    infinite; }
.animate-bird-flock-3 { animation: santy-bird-flock 3s   ease-in-out 0.7s     infinite; }

/* 8 ── Bee hovering + buzzing ───────────────────────────────────────────────── */
@keyframes santy-bee-hover {
  0%, 100% { transform: translateY(0)    rotate(-4deg); }
  20%       { transform: translateY(-9px) rotate(3deg);  }
  40%       { transform: translateY(-3px) rotate(-3deg); }
  60%       { transform: translateY(-11px) rotate(4deg); }
  80%       { transform: translateY(-5px) rotate(-2deg); }
}
@keyframes santy-bee-buzz {
  0%, 100% { transform: translateX(0)    rotate(-3deg); }
  25%       { transform: translateX(-2px) rotate(2deg);  }
  75%       { transform: translateX(2px)  rotate(-2deg); }
}
.animate-bee-hover { animation: santy-bee-hover 1s   ease-in-out infinite; }
.animate-bee-buzz  { animation: santy-bee-buzz  0.08s linear      infinite; }

/* 9 ── Snake slithering path ────────────────────────────────────────────────── */
@keyframes santy-snake-slither {
  0%   { transform: translateX(-20px) rotate(0deg)   skewX(0deg);  }
  12%  { transform: translateX(-10px) rotate(12deg)  skewX(8deg);  }
  25%  { transform: translateX(0px)   rotate(-12deg) skewX(-8deg); }
  37%  { transform: translateX(10px)  rotate(12deg)  skewX(8deg);  }
  50%  { transform: translateX(20px)  rotate(-12deg) skewX(-8deg); }
  62%  { transform: translateX(10px)  rotate(12deg)  skewX(8deg);  }
  75%  { transform: translateX(0px)   rotate(-12deg) skewX(-8deg); }
  87%  { transform: translateX(-10px) rotate(12deg)  skewX(8deg);  }
  100% { transform: translateX(-20px) rotate(0deg)   skewX(0deg);  }
}
.animate-snake-slither { animation: santy-snake-slither 2s linear infinite; }

/* 10 ── Dragon breathing fire ───────────────────────────────────────────────── */
@keyframes santy-dragon-fire {
  0%   { transform: scaleX(0)   scaleY(0.4); opacity: 0;   filter: hue-rotate(0deg); }
  15%  { transform: scaleX(0.6) scaleY(1.3); opacity: 1;   filter: hue-rotate(20deg); }
  40%  { transform: scaleX(1)   scaleY(0.9); opacity: 0.9; filter: hue-rotate(-10deg); }
  70%  { transform: scaleX(1.4) scaleY(1.1); opacity: 0.7; filter: hue-rotate(30deg); }
  100% { transform: scaleX(2)   scaleY(0.3); opacity: 0;   filter: hue-rotate(0deg); }
}
@keyframes santy-fire-flicker {
  0%, 100% { transform: scaleY(1)    skewX(0deg);  opacity: 1;   }
  20%       { transform: scaleY(1.25) skewX(-6deg); opacity: 0.9; }
  40%       { transform: scaleY(0.8)  skewX(6deg);  opacity: 0.8; }
  60%       { transform: scaleY(1.15) skewX(-4deg); opacity: 0.95; }
  80%       { transform: scaleY(0.9)  skewX(5deg);  opacity: 0.85; }
}
.animate-dragon-fire  { animation: santy-dragon-fire  1.6s ease-out     infinite; transform-origin: left center; }
.animate-fire-flicker { animation: santy-fire-flicker 0.14s ease-in-out infinite; }
`);

// ─── WRITE FILES (full + split) ───────────────────────────────────────────────
// ─── MOTION GUARD (v2.9.0) ───────────────────────────────────────────────────
// This used to live inside the VARIANTS block, which meant `stripVariantBlocks`
// removed it from santy-core.css and santy-start.css — so the CDN drop-in
// shipped 41 keyframes with no way for a reader to turn them off, and
// santy-animations.css shipped 155. Animation that ignores this preference can
// trigger vestibular symptoms, so the guard now travels with every bundle that
// carries animations rather than only with the variants.
//
// `*::before, *::after` are included: the bare `*` selector never matched
// pseudo-elements, so decorative animations on them ran regardless.
const MOTION_GUARD_CSS = `
/* ── Reduced motion (WCAG 2.3.3) — ships with every bundle that has animation ── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
`;

const fullCSS = lines.join('\n');

// ─── GRANULAR MODULE EXTRACTION ──────────────────────────────────────────────
function extractModuleCSS(css, name) {
  const marker = `\n/* @SANTYMOD:${name} */`;
  const anyMarker = /\n\/\* @SANTYMOD:[a-z]+ \*\//g;
  const segments = css.split(anyMarker);
  const markers = [...css.matchAll(/\n\/\* @SANTYMOD:([a-z]+) \*\//g)].map(m => m[1]);
  const parts = [];
  for (let i = 0; i < markers.length; i++) {
    if (markers[i] === name) parts.push(segments[i + 1].trim());
  }
  return parts.join('\n\n');
}

const MODULE_NAMES = ['reset', 'layout', 'flex', 'grid', 'spacing', 'sizing', 'typography', 'colors', 'borders', 'effects'];
const moduleCSS = {};
for (const name of MODULE_NAMES) {
  moduleCSS[name] = `/* SantyCSS — ${name} module\n   Import individually to reduce bundle size.\n   https://santycss.santy.in */\n\n` + extractModuleCSS(fullCSS, name);
}

// Split at component marker for santy-core.css (utilities only, no components)
const COMP_MARKER = '/* ═══ SANTY COMPONENTS ═══ */';
const compSplit = fullCSS.indexOf(COMP_MARKER);
const coreCSS = compSplit > -1 ? fullCSS.slice(0, compSplit).trim() : fullCSS;

// Split animations out for santy-animations.css
const ANIM_MARKER = '/* ═══════════════════════════════════════════════════════════════════════\n   SANTY ANIMATIONS';
const animSplit = coreCSS.indexOf(ANIM_MARKER);
const utilCSS = animSplit > -1 ? coreCSS.slice(0, animSplit).trim() : coreCSS;

// animations live in coreCSS (before the component marker)
const animCSS  = animSplit > -1 ? coreCSS.slice(animSplit) : '';
const PORTFOLIO_CSS = `
/* ═══════════════════════════════════════════════════════════════════════
   PORTFOLIO TEMPLATE COMPONENTS  (Added v2.4.9)
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Icon base class for essential UI icons (uses --icon-url variable) ── */
.icon {
  display: inline-block;
  background-color: currentColor;
  -webkit-mask: var(--icon-url, none) no-repeat center / contain;
          mask: var(--icon-url, none) no-repeat center / contain;
  vertical-align: -0.125em;
  flex-shrink: 0;
  width: 1em;
  height: 1em;
}
.icon-16 { width: 16px; height: 16px; }
.icon-20 { width: 20px; height: 20px; }
.icon-24 { width: 24px; height: 24px; }
.icon-28 { width: 28px; height: 28px; }
.icon-32 { width: 32px; height: 32px; }
.icon-40 { width: 40px; height: 40px; }
.icon-48 { width: 48px; height: 48px; }

/* ── Near-black background utility ── */
.background-zinc-950 { background-color: #09090b; }

/* ── Full-page scroll-snap container ── */
.portfolio-snap {
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  overscroll-behavior: none;
}
.portfolio-snap::-webkit-scrollbar { display: none; }
.portfolio-snap { -ms-overflow-style: none; scrollbar-width: none; }

/* ── Snap section (full-vh, overflow hidden) ── */
.snap-section {
  height: 100vh;
  min-height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  overflow: hidden;
  position: relative;
}

/* ── Snap section with internal scroll ── */
.snap-section-scrollable {
  height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  overflow-y: auto;
  overscroll-behavior: contain;
  position: relative;
}
.snap-section-scrollable::-webkit-scrollbar { width: 3px; }
.snap-section-scrollable::-webkit-scrollbar-track { background: transparent; }
.snap-section-scrollable::-webkit-scrollbar-thumb { background: rgba(247,191,4,0.3); border-radius: 9999px; }

/* ── Right-side dot navigation ── */
.portfolio-right-nav {
  position: fixed;
  right: 28px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  z-index: 100;
}
@media (max-width: 767px) { .portfolio-right-nav { display: none; } }

.nav-dot {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: rgba(255,255,255,0.2);
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.25s ease;
  position: relative;
}
.nav-dot::after {
  content: attr(data-label);
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: #f7bf04;
  color: #111;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  font-family: ui-sans-serif, system-ui, sans-serif;
}
.nav-dot:hover::after { opacity: 1; }
.nav-dot:hover { background: rgba(255,255,255,0.5); transform: scale(1.3); }
.nav-dot.nav-dot-active {
  background: #f7bf04;
  transform: scale(1.4);
  box-shadow: 0 0 0 3px rgba(247,191,4,0.25);
}

/* ── Glass card ── */
.glass-card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
}
.glass-card-light {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 16px;
}

/* ── Large avatar with animated gradient ring ── */
.avatar-ring-lg {
  position: relative;
  width: 130px;
  height: 130px;
  flex-shrink: 0;
}
.avatar-ring-lg::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: conic-gradient(#f7bf04, #fcd34d, rgba(255,255,255,0.04), #f7bf04);
  animation: santy-spin 4s linear infinite;
  z-index: 0;
}
.avatar-ring-lg > img,
.avatar-ring-lg > .avatar-photo {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 4px solid #09090b;
}

/* ── Skill bar track + fill ── */
.skill-bar-track {
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 9999px;
  overflow: hidden;
}
.skill-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #f7bf04, #fcd34d);
  border-radius: 9999px;
  width: 0;
  transition: width 1.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.skill-bar-fill-blue   { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.skill-bar-fill-purple { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
.skill-bar-fill-green  { background: linear-gradient(90deg, #22c55e, #4ade80); }
.skill-bar-fill-pink   { background: linear-gradient(90deg, #ec4899, #f472b6); }
.skill-bar-fill-cyan   { background: linear-gradient(90deg, #06b6d4, #22d3ee); }

/* ── Amber gradient text ── */
.text-gradient-amber-to-yellow {
  background-image: linear-gradient(135deg, #f7bf04, #fcd34d);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

/* ── Progress bar amber variant ── */
.progress-bar-amber { background: linear-gradient(90deg, #f7bf04, #fcd34d); }

/* ── Section badge ── */
.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: 9999px;
  border: 1px solid rgba(247,191,4,0.35);
  background: rgba(247,191,4,0.08);
  font-size: 11px;
  font-weight: 700;
  color: #f7bf04;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* ── Mobile nav overlay ── */
.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(8, 8, 14, 0.97);
  z-index: 200;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.mobile-menu-overlay.open {
  display: flex;
  animation: santy-fade-in 0.2s ease both;
}
.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 24px;
  font-weight: 700;
  color: rgba(255,255,255,0.55);
  text-decoration: none;
  padding: 12px 40px;
  border-radius: 14px;
  transition: color 0.2s ease, background 0.2s ease;
  width: 100%;
  max-width: 320px;
}
.mobile-nav-link:hover,
.mobile-nav-link.nav-dot-active { color: #f7bf04; background: rgba(247,191,4,0.08); }

/* ── Portfolio hamburger button ── */
.portfolio-hamburger {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 300;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.12);
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: background 0.2s, border-color 0.2s;
}
.portfolio-hamburger:hover { background: rgba(247,191,4,0.15); border-color: rgba(247,191,4,0.4); }
@media (max-width: 767px) { .portfolio-hamburger { display: flex; } }
`;
const PORTFOLIO_CV_CSS = `
/* ═══════════════════════════════════════════════════════════════════════
   PORTFOLIO CV SIDEBAR TEMPLATE COMPONENTS  (Added v2.4.9)
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Brand cyan accent ── */
.color-brand-cyan           { color: #0099e5; }
.background-brand-cyan      { background-color: #0099e5; }
.border-color-brand-cyan    { border-color: #0099e5; }
.background-brand-cyan-soft { background-color: rgba(0,153,229,0.08); }
.background-brand-cyan-10   { background-color: rgba(0,153,229,0.10); }

/* ── CV sidebar fixed-left layout ── */
.cv-sidebar {
  position: fixed; top: 0; left: 0; width: 220px; height: 100vh;
  overflow-y: auto; display: flex; flex-direction: column;
  z-index: 100; background: #1c1c1e; border-right: 1px solid #252525;
  scrollbar-width: none;
}
.cv-sidebar::-webkit-scrollbar { display: none; }
.cv-main { margin-left: 220px; background: #0f0f0f; min-height: 100vh; }
@media (max-width: 900px) {
  .cv-sidebar { transform: translateX(-100%); transition: transform 0.3s ease; }
  .cv-sidebar.cv-sidebar-open { transform: translateX(0); box-shadow: 4px 0 32px rgba(0,0,0,0.7); }
  .cv-main { margin-left: 0; }
}

/* ── Sidebar nav links ── */
.cv-nav-link {
  display: flex; align-items: center; gap: 10px; padding: 11px 22px;
  font-size: 13px; font-weight: 600; color: #777; text-decoration: none;
  border-left: 3px solid transparent; transition: all 0.2s; letter-spacing: 0.02em;
}
.cv-nav-link:hover, .cv-nav-link.cv-nav-active {
  color: #0099e5; border-left-color: #0099e5; background: rgba(0,153,229,0.07);
}

/* ── Section wrapper ── */
.cv-section     { padding: 64px 56px; }
.cv-section-alt { background: #161616; }
@media (max-width: 700px) { .cv-section { padding: 40px 22px; } }
.cv-section-label   { font-size: 11px; font-weight: 700; color: #0099e5; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 6px; }
.cv-section-title   { font-size: 30px; font-weight: 800; color: #f0f0f0; margin: 0 0 8px; }
.cv-section-divider { width: 36px; height: 3px; background: #0099e5; border-radius: 2px; margin-bottom: 36px; }

/* ── Dark timeline variant ── */
.timeline-dark .timeline-item:not(:last-child) .timeline-dot::after { background-color: #252525; }
.timeline-dot-cyan   { background-color: #0099e5; box-shadow: 0 0 0 2px rgba(0,153,229,0.25); color: #fff; }
.timeline-dot-zinc   { background-color: #3f3f46; box-shadow: 0 0 0 2px #27272a; color: #a1a1aa; }

/* ── Skill bar (dark) ── */
.skill-bar-dark      { width: 100%; height: 4px; background: #252525; border-radius: 9999px; overflow: hidden; }
.skill-bar-dark-fill { height: 100%; background: #0099e5; border-radius: 9999px; width: 0; transition: width 1.4s cubic-bezier(0.25,0.8,0.25,1); }

/* ── Fun fact card ── */
.fun-fact-card  { background: #1c1c1e; border: 1px solid #252525; border-radius: 14px; padding: 28px 16px; text-align: center; transition: border-color 0.2s, transform 0.2s; }
.fun-fact-card:hover { border-color: #0099e5; transform: translateY(-4px); }
.fun-fact-number { font-size: 44px; font-weight: 900; color: #0099e5; line-height: 1; }
.fun-fact-suffix { font-size: 28px; font-weight: 900; color: #0099e5; }
.fun-fact-label  { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 8px; font-weight: 600; }

/* ── Portfolio filter ── */
.pf-filter-btn { padding: 7px 20px; border-radius: 9999px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid #252525; background: #1c1c1e; color: #666; transition: all 0.2s; font-family: inherit; letter-spacing: 0.02em; }
.pf-filter-btn:hover, .pf-filter-btn.pf-active { background: #0099e5; color: #fff; border-color: #0099e5; }

/* ── Project card (dark) ── */
.project-card-dark { background: #1c1c1e; border: 1px solid #252525; border-radius: 14px; overflow: hidden; transition: border-color 0.25s, transform 0.25s; display: flex; flex-direction: column; }
.project-card-dark:hover { border-color: #0099e5; transform: translateY(-5px); }
.project-thumb-dark { height: 155px; display: flex; align-items: center; justify-content: center; background: #141414; }
.project-card-body { padding: 18px 20px 20px; display: flex; flex-direction: column; flex: 1; }

/* ── Blog card (dark) ── */
.blog-card-dark { background: #1c1c1e; border: 1px solid #252525; border-radius: 14px; overflow: hidden; transition: border-color 0.25s, transform 0.25s; display: flex; flex-direction: column; cursor: pointer; }
.blog-card-dark:hover { border-color: #0099e5; transform: translateY(-5px); }
.blog-thumb-dark { height: 175px; display: flex; align-items: center; justify-content: center; }

/* ── Service card (dark) ── */
.service-card-dark { background: #1c1c1e; border: 1px solid #252525; border-radius: 12px; padding: 26px 22px; transition: border-color 0.2s, transform 0.2s; }
.service-card-dark:hover { border-color: #0099e5; transform: translateY(-3px); }

/* ── Dark inputs ── */
.input-dark    { width: 100%; background: #1c1c1e; border: 1px solid #252525; border-radius: 8px; padding: 12px 16px; color: #e2e8f0; font-size: 14px; transition: border-color 0.2s; outline: none; font-family: inherit; box-sizing: border-box; }
.input-dark:focus { border-color: #0099e5; }
.textarea-dark { width: 100%; background: #1c1c1e; border: 1px solid #252525; border-radius: 8px; padding: 12px 16px; color: #e2e8f0; font-size: 14px; transition: border-color 0.2s; outline: none; font-family: inherit; box-sizing: border-box; resize: vertical; min-height: 130px; }
.textarea-dark:focus { border-color: #0099e5; }

/* ── Cyan CTA buttons ── */
.btn-cyan { background: #0099e5; color: #fff; border: none; padding: 12px 28px; border-radius: 9999px; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.2s, transform 0.15s; font-family: inherit; display: inline-flex; align-items: center; gap: 8px; }
.btn-cyan:hover { background: #0087cc; transform: translateY(-2px); }
.btn-cyan-outline { background: transparent; color: #0099e5; border: 1.5px solid #0099e5; padding: 11px 26px; border-radius: 9999px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; }
.btn-cyan-outline:hover { background: rgba(0,153,229,0.1); transform: translateY(-2px); }

/* ── Tag pill (dark) ── */
.tag-dark { display: inline-flex; padding: 5px 14px; background: #1c1c1e; border: 1px solid #252525; border-radius: 9999px; font-size: 12px; font-weight: 500; color: #888; transition: all 0.2s; }
.tag-dark:hover { border-color: #0099e5; color: #0099e5; }

/* ── Mobile hamburger & sidebar overlay ── */
.cv-hamburger { display: none; position: fixed; top: 14px; left: 14px; z-index: 300; width: 42px; height: 42px; background: #1c1c1e; border: 1px solid #252525; border-radius: 8px; cursor: pointer; align-items: center; justify-content: center; color: #ccc; transition: border-color 0.2s, color 0.2s; }
.cv-hamburger:hover { border-color: #0099e5; color: #0099e5; }
@media (max-width: 900px) { .cv-hamburger { display: flex; } }
.cv-sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 99; }
.cv-sidebar-overlay.cv-overlay-open { display: block; animation: santy-fade-in 0.2s ease; }

/* ── Testimonial card dark ── */
.testimonial-card-dark { background: #1c1c1e; border: 1px solid #252525; border-radius: 14px; padding: 26px 24px; }

/* ── What I do card ── */
.what-i-do-card { background: #1c1c1e; border: 1px solid #252525; border-radius: 12px; padding: 22px; transition: border-color 0.2s, transform 0.2s; }
.what-i-do-card:hover { border-color: #0099e5; transform: translateY(-3px); }
`;
const ITSME_CSS = `
/* ═══════════════════════════════════════════════════════════════════════
   "IT'S ME" PORTFOLIO TEMPLATE COMPONENTS  (Added v2.5.0)
   Light, orange-accent, multi-section single-page portfolio
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Sticky nav ── */
.itsme-nav {
  position: sticky; top: 0; z-index: 200; background: #fff;
  border-bottom: 1px solid #efefef; box-shadow: 0 2px 16px rgba(0,0,0,.06);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px; height: 68px;
}
.itsme-brand { font-size: 22px; font-weight: 800; color: #222; letter-spacing: -0.02em; }
.itsme-brand span { color: #f97316; }
.itsme-nav-links { display: flex; align-items: center; gap: 32px; list-style: none; margin: 0; padding: 0; }
.itsme-nav-link {
  font-size: 12px; font-weight: 700; color: #555; text-decoration: none;
  letter-spacing: 0.06em; text-transform: uppercase; transition: color .2s; cursor: pointer; background: none; border: none; font-family: inherit; padding: 0;
}
.itsme-nav-link:hover, .itsme-nav-link.itsme-nav-active { color: #f97316; }
.itsme-nav-getcv {
  font-size: 11px; font-weight: 800; color: #fff; background: #f97316;
  border: none; border-radius: 5px; padding: 9px 22px; cursor: pointer;
  text-decoration: none; letter-spacing: 0.06em; text-transform: uppercase;
  transition: background .2s, transform .15s; font-family: inherit;
}
.itsme-nav-getcv:hover { background: #ea6c10; transform: translateY(-1px); }
.itsme-hamburger { display: none; background: none; border: 1px solid #e8e8e8; border-radius: 6px; padding: 7px 9px; cursor: pointer; color: #444; line-height: 1; }
@media (max-width: 768px) {
  .itsme-nav { padding: 0 20px; }
  .itsme-hamburger { display: flex; align-items: center; }
  .itsme-nav-links { display: none; position: absolute; top: 68px; left: 0; right: 0; background: #fff; flex-direction: column; align-items: stretch; padding: 8px 0; border-bottom: 1px solid #efefef; gap: 0; box-shadow: 0 8px 24px rgba(0,0,0,.08); z-index: 199; }
  .itsme-nav-links.open { display: flex; }
  .itsme-nav-link { padding: 13px 24px; border-bottom: 1px solid #f5f5f5; }
  .itsme-nav-getcv { display: none; }
}

/* ── Hero ── */
.itsme-hero {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
  background: #fff; padding: 80px 24px; overflow: hidden;
}
.itsme-profile-ring {
  width: 180px; height: 180px; border-radius: 50%; border: 4px solid #f97316;
  padding: 5px; display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 32px; flex-shrink: 0;
}
.itsme-profile-img {
  width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
  background: linear-gradient(135deg, #fde68a 0%, #f97316 100%);
  display: flex; align-items: center; justify-content: center;
  font-size: 52px; font-weight: 900; color: #fff; overflow: hidden;
}
.itsme-hero-name { font-size: 52px; font-weight: 900; color: #1a1a2e; line-height: 1.1; margin: 0 0 14px; }
.itsme-hero-tagline { font-size: 16px; color: #777; max-width: 480px; line-height: 1.7; margin: 0 0 32px; }
.itsme-social-row { display: flex; gap: 10px; justify-content: center; margin-top: 32px; }
.itsme-social-btn {
  width: 40px; height: 40px; border-radius: 50%; border: 1.5px solid #e8e8e8;
  display: flex; align-items: center; justify-content: center; color: #888;
  text-decoration: none; transition: all .2s; background: #fff;
}
.itsme-social-btn:hover { border-color: #f97316; color: #f97316; background: rgba(249,115,22,.06); }
@media (max-width: 640px) {
  .itsme-hero-name { font-size: 34px; }
  .itsme-profile-ring { width: 140px; height: 140px; }
  .itsme-profile-img { font-size: 40px; }
}

/* ── Section scaffold ── */
.itsme-section { padding: 80px 40px; }
.itsme-section-alt { background: #f8f9fa; }
.itsme-section-inner { max-width: 1100px; margin: 0 auto; }
.itsme-eyebrow { font-size: 12px; font-weight: 800; color: #f97316; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 6px; }
.itsme-title { font-size: 34px; font-weight: 900; color: #1a1a2e; margin: 0 0 10px; line-height: 1.15; }
.itsme-divider { width: 48px; height: 3px; background: #f97316; border-radius: 2px; margin-bottom: 40px; }
@media (max-width: 768px) {
  .itsme-section { padding: 56px 20px; }
  .itsme-title { font-size: 26px; }
}

/* ── Bio info grid ── */
.itsme-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 40px; margin-bottom: 28px; }
.itsme-info-label { font-size: 11px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
.itsme-info-value { font-size: 14px; font-weight: 600; color: #333; }
@media (max-width: 480px) { .itsme-info-grid { grid-template-columns: 1fr; } }

/* ── Service card ── */
.itsme-service-card {
  background: #fff; border: 1px solid #efefef; border-radius: 14px;
  padding: 28px 22px; transition: box-shadow .25s, transform .25s;
}
.itsme-service-card:hover { box-shadow: 0 10px 36px rgba(249,115,22,.12); transform: translateY(-5px); }
.itsme-service-icon {
  width: 52px; height: 52px; border-radius: 12px;
  background: rgba(249,115,22,.08); border: 1px solid rgba(249,115,22,.18);
  display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
}

/* ── Light skill bars ── */
.itsme-skill-row { margin-bottom: 18px; }
.itsme-skill-meta { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: #444; }
.itsme-skill-pct { color: #f97316; }
.itsme-skill-track { height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; }
.itsme-skill-fill { height: 100%; border-radius: 3px; background: #f97316; width: 0; transition: width 1.2s cubic-bezier(.4,0,.2,1); }
.itsme-skill-fill-blue { background: #3b82f6; }
.itsme-skill-fill-purple { background: #8b5cf6; }
.itsme-skill-fill-green { background: #22c55e; }

/* ── Light timeline ── */
.itsme-timeline { position: relative; padding-left: 30px; }
.itsme-timeline::before { content: ''; position: absolute; left: 5px; top: 8px; width: 2px; height: calc(100% - 16px); background: #efefef; }
.itsme-timeline-item { position: relative; margin-bottom: 32px; }
.itsme-timeline-dot {
  position: absolute; left: -30px; top: 5px; width: 12px; height: 12px;
  border-radius: 50%; background: #f97316; border: 2px solid #fff; box-shadow: 0 0 0 2px #f97316;
}
.itsme-timeline-badge {
  display: inline-block; font-size: 10px; font-weight: 800; color: #f97316;
  background: rgba(249,115,22,.08); border-radius: 4px; padding: 2px 10px;
  letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px;
}
.itsme-timeline-role { font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 3px; }
.itsme-timeline-org { font-size: 12px; color: #f97316; font-weight: 700; margin-bottom: 8px; }
.itsme-timeline-desc { font-size: 13px; color: #777; line-height: 1.7; margin: 0; }

/* ── Testimonial card ── */
.itsme-testimonial {
  background: #fff; border: 1px solid #efefef; border-radius: 14px;
  padding: 28px 24px; transition: box-shadow .2s;
}
.itsme-testimonial:hover { box-shadow: 0 8px 28px rgba(0,0,0,.08); }
.itsme-testimonial-quote { font-size: 36px; color: #f97316; line-height: 1; margin-bottom: 12px; font-weight: 900; }

/* ── Work/portfolio card ── */
.itsme-work-card {
  border-radius: 14px; overflow: hidden; background: #fff;
  border: 1px solid #efefef; transition: box-shadow .25s, transform .25s; position: relative;
}
.itsme-work-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,.12); transform: translateY(-5px); }
.itsme-work-thumb { aspect-ratio: 4/3; overflow: hidden; position: relative; }
.itsme-work-thumb-bg { width: 100%; height: 100%; transition: transform .3s; display: flex; align-items: center; justify-content: center; }
.itsme-work-card:hover .itsme-work-thumb-bg { transform: scale(1.06); }
.itsme-work-overlay {
  position: absolute; inset: 0; background: rgba(249,115,22,.88);
  display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px;
  opacity: 0; transition: opacity .25s;
}
.itsme-work-card:hover .itsme-work-overlay { opacity: 1; }
.itsme-work-cat {
  display: inline-block; font-size: 10px; font-weight: 800; letter-spacing: 0.06em;
  text-transform: uppercase; color: #f97316; background: rgba(249,115,22,.08);
  border-radius: 4px; padding: 2px 10px; margin-bottom: 6px;
}

/* ── Portfolio filter buttons ── */
.itsme-filter { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 32px; }
.itsme-filter-btn {
  padding: 7px 20px; border-radius: 4px; border: 1.5px solid #e2e8f0;
  background: transparent; cursor: pointer; font-size: 11px; font-weight: 800;
  color: #777; font-family: inherit; transition: all .18s;
  text-transform: uppercase; letter-spacing: 0.06em;
}
.itsme-filter-btn:hover, .itsme-filter-btn.itsme-filter-active { background: #f97316; color: #fff; border-color: #f97316; }

/* ── Blog card ── */
.itsme-blog-card {
  background: #fff; border: 1px solid #efefef; border-radius: 14px;
  overflow: hidden; transition: box-shadow .25s, transform .25s;
}
.itsme-blog-card:hover { box-shadow: 0 10px 32px rgba(0,0,0,.1); transform: translateY(-4px); }
.itsme-blog-thumb { aspect-ratio: 16/9; overflow: hidden; }
.itsme-blog-thumb-inner { width: 100%; height: 100%; transition: transform .3s; display: flex; align-items: center; justify-content: center; }
.itsme-blog-card:hover .itsme-blog-thumb-inner { transform: scale(1.05); }
.itsme-blog-tag {
  display: inline-block; font-size: 10px; font-weight: 800; padding: 3px 10px;
  border-radius: 4px; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px;
}
.itsme-tag-web     { background: rgba(59,130,246,.08);  color: #3b82f6; }
.itsme-tag-graphic { background: rgba(249,115,22,.08);  color: #f97316; }
.itsme-tag-motion  { background: rgba(139,92,246,.08);  color: #8b5cf6; }

/* ── Contact form ── */
.itsme-input {
  width: 100%; padding: 12px 16px; border: 1.5px solid #e8e8e8;
  border-radius: 8px; font-size: 14px; color: #333; background: #fff;
  outline: none; transition: border-color .2s; font-family: inherit;
  display: block;
}
.itsme-input:focus { border-color: #f97316; }
.itsme-textarea { resize: vertical; min-height: 130px; }

/* ── Primary button ── */
.itsme-btn {
  display: inline-flex; align-items: center; gap: 8px; padding: 13px 30px;
  background: #f97316; color: #fff; border: 2px solid #f97316;
  border-radius: 6px; font-size: 12px; font-weight: 800; letter-spacing: 0.06em;
  text-transform: uppercase; cursor: pointer; text-decoration: none;
  transition: background .2s, transform .15s; font-family: inherit;
}
.itsme-btn:hover { background: #ea6c10; border-color: #ea6c10; transform: translateY(-1px); }
.itsme-btn-ghost { background: transparent; color: #f97316; }
.itsme-btn-ghost:hover { background: #f97316; color: #fff; }

/* ── Floating dots background deco ── */
.itsme-dot-deco {
  position: absolute; border-radius: 50%; pointer-events: none;
  background: #f97316; opacity: .04;
}

/* ── Contact info card ── */
.itsme-contact-card {
  display: flex; align-items: flex-start; gap: 16px; padding: 20px;
  background: #fff; border: 1px solid #efefef; border-radius: 12px; margin-bottom: 16px;
  transition: box-shadow .2s;
}
.itsme-contact-card:hover { box-shadow: 0 6px 24px rgba(249,115,22,.1); }
.itsme-contact-icon {
  width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
  background: rgba(249,115,22,.08); border: 1px solid rgba(249,115,22,.18);
  display: flex; align-items: center; justify-content: center;
}
`;
// ─── EXTENDED COMPONENTS (v2.9.0) ────────────────────────────────────────────
// Data table, combobox, stepper, tree, context menu, field variants, prose and
// the rest of the MUI/Quasar-parity set. Authored as a real stylesheet so it
// stays readable and diffable rather than buried in a template literal.
const EXTENDED_COMPONENTS_CSS = fs.readFileSync(path.join(__dirname, 'lib', 'components-extended.css'), 'utf8');

// ─── BEHAVIOR LAYER SUPPORT (v2.9.0) ─────────────────────────────────────────
// States santy.js drives. The CSS-only :target paths still work untouched —
// these rules simply add a JS-controllable .open contract alongside them.
const BEHAVIOR_CSS = `
/* ═══════════════════════════════════════════════════════════════════════
   SANTY BEHAVIOR LAYER  (santy.js — v2.9.0)
   Loaded automatically by santy.css; santy.js toggles these classes.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Overlays opened by JS rather than :target ── */
.modal-overlay.open  { display: flex; }
.drawer-overlay.open { display: block; }
.drawer-overlay.open .drawer-panel       { transform: translateX(0); }
.drawer-overlay.open .drawer-panel-right { transform: translateX(0); }

/* ── Popover: native [popover] keeps UA behaviour, JS-driven ones need a box ── */
.popover:not([popover]) {
  display: none;
  position: fixed;
  z-index: 1000;
  background: var(--santy-surface, #fff);
  color: var(--santy-text, #111827);
}
.popover:not([popover]).open { display: block; }

/* ── Tooltip built by Santy.tooltip (distinct from the CSS-only .tooltip) ── */
.santy-tip {
  position: fixed;
  z-index: 10000;
  max-width: 280px;
  padding: 6px 10px;
  border-radius: 6px;
  background: #1f2937;
  color: #f9fafb;
  font-size: 12px;
  line-height: 1.4;
  pointer-events: none;
  opacity: 0;
  transition: opacity .15s ease;
}
.santy-tip.show { opacity: 1; }
.dark .santy-tip, [data-theme="midnight"] .santy-tip { background: #f9fafb; color: #111827; }

/* ── Toast: structural parts Santy.toast() builds ── */
.toast-body    { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1 1 auto; }
.toast-title   { font-weight: 600; }
.toast-message { opacity: .92; word-break: break-word; }
.toast-action {
  flex-shrink: 0;
  padding: 0 4px;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}
.toast-action:hover { opacity: .8; }
.toast-container-top-right     { top: 16px; right: 16px; bottom: auto; left: auto; }
.toast-container-top-left      { top: 16px; left: 16px; bottom: auto; right: auto; }
.toast-container-bottom-right  { bottom: 16px; right: 16px; top: auto; left: auto; }
.toast-container-bottom-left   { bottom: 16px; left: 16px; top: auto; right: auto; }
.toast-container-top-center    { top: 16px; left: 50%; right: auto; bottom: auto; transform: translateX(-50%); }
.toast-container-bottom-center { bottom: 16px; left: 50%; right: auto; top: auto; transform: translateX(-50%); }

/* ── Ripple press feedback (Material parity) ── */
[data-santy-ripple] { position: relative; overflow: hidden; }
.santy-ripple {
  position: absolute;
  border-radius: 50%;
  background: currentColor;
  opacity: .28;
  transform: scale(0);
  pointer-events: none;
  animation: santy-ripple .5s ease-out;
}
@keyframes santy-ripple { to { transform: scale(2.2); opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .santy-ripple { animation: none; display: none; }
  .santy-tip { transition: none; }
}
`;

// ─── GRID SYSTEM (v2.9.0) ────────────────────────────────────────────────────
// Bootstrap-compatible .row / .col-md-6 layout — the landing pad Bootstrap
// migrants had nothing to use before. Generated rather than hand-written:
// 6 breakpoints × 12 columns × (col/offset/order/row-cols) is ~400 rules.
const GRID_CSS = gridSystem.build();

// ─── USER PLUGINS (v2.9.0) ───────────────────────────────────────────────────
// santy.config.json: { "plugins": ["./plugins/brand.js"] }
let PLUGIN_CSS = '';
if (Array.isArray(userConfig.plugins) && userConfig.plugins.length) {
  // addVariant re-emits an existing utility's declarations, so it needs an index.
  const utilIndex = buildIndex(fullCSS);
  try {
    const res = runPlugins(userConfig.plugins, {
      require: (id) => require(require.resolve(id, { paths: [process.cwd(), __dirname] })),
      theme: { colors: palette, spacing, fontSizes, breakpoints, radii, borderWidths, zIndexes },
      config: userConfig,
      lookup: (cls) => utilIndex[cls] || null,
    });
    PLUGIN_CSS = [res.base, res.components, res.utilities, res.variants].filter(Boolean).join('\n\n');
    if (PLUGIN_CSS) PLUGIN_CSS = '\n/* ═══ SANTY PLUGINS ═══ */\n' + PLUGIN_CSS + '\n';
    console.log(`🔌 Plugins: ${res.loaded.join(', ')} — ${res.names.length} classes added`);
  } catch (e) {
    console.error(`❌ Plugin error: ${e.message}`);
    process.exit(1);
  }
}

const compCSS  = compSplit > -1
  ? fullCSS.slice(compSplit) + PORTFOLIO_CSS + PORTFOLIO_CV_CSS + ITSME_CSS +
    EXTENDED_COMPONENTS_CSS + GRID_CSS + PLUGIN_CSS + BEHAVIOR_CSS
  : '';

// ─── Extract variant blocks to build slimmed core and start CSS ───
const VSTART = '/* ═══ VARIANTS_BLOCK_START ═══ */';
const VEND   = '/* ═══ VARIANTS_BLOCK_END ═══ */';

function stripVariantBlocks(css) {
  let out = '';
  let pos = 0;
  while (true) {
    const vs = css.indexOf(VSTART, pos);
    if (vs === -1) { out += css.slice(pos); break; }
    out += css.slice(pos, vs);
    const ve = css.indexOf(VEND, vs);
    if (ve === -1) break;
    pos = ve + VEND.length;
  }
  return out;
}

function extractVariantBlocks(css) {
  const blocks = [];
  let pos = 0;
  while (true) {
    const vs = css.indexOf(VSTART, pos);
    if (vs === -1) break;
    const ve = css.indexOf(VEND, vs);
    if (ve === -1) break;
    blocks.push(css.slice(vs + VSTART.length, ve).trim());
    pos = ve + VEND.length;
  }
  return blocks.join('\n\n');
}

// santy-core.css (slimmed — no xl/xxl/on-wide/peer/group/print/motion/RTL)
const slimmedCoreCSS = stripVariantBlocks(utilCSS);

// santy-variants.css — all the stripped variant blocks
const variantsCSS = `/* SantyCSS Extended Variants — xl, xxl, on-wide, peer, group, print, motion, RTL
   Import this in addition to santy-core.css for advanced responsive/variant coverage.
   https://santycss.santy.in */\n\n` + extractVariantBlocks(utilCSS);

// santy-start.css — slimmed utilities + components (no animations, no extended variants)
// This is the recommended CDN drop-in for beginners (~60-100KB)
const startCSS = `/* SantyCSS Start — Drop-in CDN build
   Includes: base utilities, on-mobile/on-tablet/on-desktop/md responsive,
   on-hover/on-focus states, dark mode, and all components. No animations.
   For full responsive coverage: santy-core.css + santy-variants.css
   https://santycss.santy.in */\n\n` + slimmedCoreCSS + '\n\n' + compCSS;

// ─── santy-scroll.js ──────────────────────────────────────────────────────────
// Behaviour layer is authored as a real source file (santy.js) rather than a
// template string, so it can be linted, unit-tested and diffed like normal code.
const BEHAVIOR_JS = fs.readFileSync(path.join(__dirname, 'santy.js'), 'utf8');

// Framework adapters. The universal ones (custom elements, class merge) are
// mirrored into dist/ for CDN use; the React/Vue packages ship as source.
const ELEMENTS_JS = fs.readFileSync(path.join(__dirname, 'packages', 'elements', 'santy-elements.js'), 'utf8');
const MERGE_JS    = fs.readFileSync(path.join(__dirname, 'packages', 'merge', 'santy-merge.js'), 'utf8');
// Class sorter mirrored to dist so editors and CDN consumers can load it.
const SORT_JS = fs.readFileSync(path.join(__dirname, 'packages', 'sort', 'santy-sort.js'), 'utf8');

const SCROLL_JS = `/*! santy-scroll.js — SantyCSS Scroll Observer v2.1
 * Activates when-visible: viewport-entry animations via IntersectionObserver.
 *
 * CDN: <script src="https://cdn.jsdelivr.net/npm/santycss@2/dist/santy-scroll.js"></script>
 *
 * Modifiers read from element classes:
 *   enter-at-{15|25|50|75}  — threshold (default: 0.15)
 *   enter-repeat            — re-trigger on every viewport entry
 */
(function () {
  'use strict';

  function getThreshold(el) {
    if (el.classList.contains('enter-at-75')) return 0.75;
    if (el.classList.contains('enter-at-50')) return 0.50;
    if (el.classList.contains('enter-at-25')) return 0.25;
    return 0.15;
  }

  function makeObserver(threshold, repeat) {
    return new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (!repeat) this.unobserve(entry.target);
        } else if (repeat) {
          entry.target.classList.remove('is-visible');
        }
      }.bind(this));
    }, { threshold: threshold });
  }

  function init() {
    document.querySelectorAll('[class*="when-visible:"]').forEach(function (el) {
      var obs = makeObserver(getThreshold(el), el.classList.contains('enter-repeat'));
      obs.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
`;

// ─── PREBUILT THEMES (v2.7.0) ─────────────────────────────────────────────────
const THEMES_CSS = `/* SantyCSS Themes — prebuilt design-token presets (v2.7.0)
   Usage: <html data-theme="ocean">  +  <link …/santy-themes.css>
   Semantic utilities (.background-surface, .color-text, .border-color-default,
   .background-primary, …) automatically follow the active theme.
   https://santycss.santy.in */

[data-theme] { color-scheme: light; }
[data-theme="dark"] { color-scheme: dark; }

/* ── Ocean — deep blue, calm ── */
[data-theme="ocean"] {
  --santy-primary: #0284c7; --santy-primary-dark: #0369a1; --santy-primary-light: #e0f2fe;
  --santy-secondary: #475569; --santy-accent: #06b6d4;
  --santy-surface: #f8fafc; --santy-surface-alt: #f1f5f9; --santy-surface-raised: #ffffff;
  --santy-text: #0f172a; --santy-text-muted: #64748b; --santy-border-color: #e2e8f0;
}
/* ── Sunset — warm orange/rose ── */
[data-theme="sunset"] {
  --santy-primary: #ea580c; --santy-primary-dark: #c2410c; --santy-primary-light: #ffedd5;
  --santy-secondary: #78716c; --santy-accent: #f43f5e;
  --santy-surface: #fffbf7; --santy-surface-alt: #fef3e7; --santy-surface-raised: #ffffff;
  --santy-text: #1c1917; --santy-text-muted: #78716c; --santy-border-color: #f0e4d7;
}
/* ── Forest — green, natural ── */
[data-theme="forest"] {
  --santy-primary: #16a34a; --santy-primary-dark: #15803d; --santy-primary-light: #dcfce7;
  --santy-secondary: #57534e; --santy-accent: #84cc16;
  --santy-surface: #f7fdf9; --santy-surface-alt: #ecfdf3; --santy-surface-raised: #ffffff;
  --santy-text: #14532d; --santy-text-muted: #4d7c0f; --santy-border-color: #d9f0e0;
}
/* ── Midnight — dark violet ── */
[data-theme="midnight"] {
  color-scheme: dark;
  --santy-primary: #8b5cf6; --santy-primary-dark: #7c3aed; --santy-primary-light: #2e1065;
  --santy-secondary: #94a3b8; --santy-accent: #22d3ee;
  --santy-surface: #0b0716; --santy-surface-alt: #1e1b31; --santy-surface-raised: #241f3d;
  --santy-text: #ede9fe; --santy-text-muted: #a5b4fc; --santy-border-color: #312e5e;
}
/* ── Mono — neutral grayscale ── */
[data-theme="mono"] {
  --santy-primary: #171717; --santy-primary-dark: #000000; --santy-primary-light: #e5e5e5;
  --santy-secondary: #737373; --santy-accent: #404040;
  --santy-surface: #fafafa; --santy-surface-alt: #f5f5f5; --santy-surface-raised: #ffffff;
  --santy-text: #171717; --santy-text-muted: #737373; --santy-border-color: #e5e5e5;
}
`;

// ─── APPLY OPTIONAL CLASS PREFIX (santy.config.json → "prefix") ──────────────
const OUT_CSS = {
  // Extended components, grid and plugin CSS sit past the component marker, so
  // they reach santy-components.css via compCSS but would otherwise miss the
  // full bundle.
  //
  // The motion guard is then appended to every bundle that can ship a keyframe,
  // so no entry point serves animation a reader is unable to switch off.
  // It is intentionally NOT prefixed: it targets `*`, never a class.
  'santy.css': applyPrefix(fullCSS + EXTENDED_COMPONENTS_CSS + GRID_CSS + PLUGIN_CSS + BEHAVIOR_CSS) + MOTION_GUARD_CSS,
  'santy-core.css': applyPrefix(slimmedCoreCSS) + MOTION_GUARD_CSS,
  'santy-variants.css': applyPrefix(variantsCSS) + MOTION_GUARD_CSS,
  'santy-start.css': applyPrefix(startCSS) + MOTION_GUARD_CSS,
  'santy-components.css': applyPrefix(compCSS) + MOTION_GUARD_CSS,
  'santy-animations.css': applyPrefix(animCSS) + MOTION_GUARD_CSS,
  'santy-email.css': applyPrefix(EMAIL_CSS.trim()),
  'santy-themes.css': applyPrefix(THEMES_CSS),
};
for (const name of MODULE_NAMES) {
  OUT_CSS[`santy-${name}.css`] = applyPrefix(moduleCSS[name]);
}

// ─── CLASSMAP / INTELLISENSE DATA (v2.7.0) ───────────────────────────────────
// Every generated class name — powers editor IntelliSense, AI tooling, linters.
const pkgVersion = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version;
const classSet = new Set();
const allGeneratedCSS = OUT_CSS['santy.css'] + '\n' + OUT_CSS['santy-themes.css'];
for (const m of allGeneratedCSS.matchAll(/\.((?:[a-zA-Z0-9_-]+|\\:)+)/g)) {
  const cls = m[1].replace(/\\:/g, ':').replace(/\\/g, '');
  if (/^[0-9]/.test(cls)) continue;
  classSet.add(cls);
}
const CLASSMAP_JSON = JSON.stringify({
  name: 'santycss',
  version: pkgVersion,
  generated: new Date().toISOString().slice(0, 10),
  count: classSet.size,
  classes: [...classSet].sort(),
});

// Generate minified version
const minCSS = OUT_CSS['santy.css']
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s*\{\s*/g, '{')
  .replace(/\s*\}\s*/g, '}')
  .replace(/\s*:\s*/g, ':')
  .replace(/\s*;\s*/g, ';')
  .replace(/\s*,\s*/g, ',')
  .replace(/\n+/g, '')
  .replace(/\s{2,}/g, ' ')
  .trim();
OUT_CSS['santy.min.css'] = minCSS;

const OUT_FILES = {
  ...OUT_CSS,
  'santy-scroll.js': SCROLL_JS,
  // Behaviour layer lives in its own source file so it stays lintable/testable.
  'santy.js': BEHAVIOR_JS,
  'santy-elements.js': ELEMENTS_JS,
  'santy-merge.js': MERGE_JS,
  'santy-sort.js': SORT_JS,
  'santy-classmap.json': CLASSMAP_JSON,
};

// ─── WRITE OUTPUT FILES ──────────────────────────────────────────────────────
// Default: repo root + dist/ mirror (NPM package layout).
// With "output" in santy.config.json: write everything to that directory only —
// used by `npx santycss build` so custom builds never touch node_modules.
const outDir = userConfig.output ? path.resolve(process.cwd(), userConfig.output) : null;
const distDir = path.join(__dirname, 'dist');
if (outDir) {
  fs.mkdirSync(outDir, { recursive: true });
} else if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}
for (const [name, content] of Object.entries(OUT_FILES)) {
  if (outDir) {
    fs.writeFileSync(path.join(outDir, name), content);
  } else {
    fs.writeFileSync(name, content);
    fs.writeFileSync(path.join(distDir, name), content);
  }
}
if (outDir) console.log(`📁 Output written to ${outDir}`);

const kb = n => (n / 1024).toFixed(1) + 'KB';
console.log(`✅ santy-start.css    — ${kb(startCSS.length)} (CDN drop-in: base + components, no extended variants/animations)`);
console.log(`✅ santy-core.css     — ${kb(slimmedCoreCSS.length)} (utilities only, no extended variants)`);
console.log(`✅ santy-variants.css — ${kb(variantsCSS.length)} (xl, xxl, on-wide, peer, group, print, motion, RTL)`);
// Report what is actually written, not fullCSS — the bundle also carries the
// extended-component and behavior blocks appended past the component marker.
console.log(`✅ santy.css          — ${kb(OUT_CSS['santy.css'].length)} (${OUT_CSS['santy.css'].split('\n').length.toLocaleString()} lines)`);
console.log(`✅ santy.min.css      — ${kb(minCSS.length)} (minified)`);
console.log(`✅ santy-components.css — ${kb(compCSS.length)} (components only)`);
console.log(`✅ santy-animations.css — ${kb(animCSS.length)} (animations only)`);
console.log(`✅ santy-email.css    — ${kb(EMAIL_CSS.length)} (email templates)`);
console.log(`✅ santy-scroll.js    — ${kb(SCROLL_JS.length)} (IntersectionObserver for when-visible:)`);
console.log(`✅ santy.js           — ${kb(BEHAVIOR_JS.length)} (behavior layer: modal, drawer, dropdown, tabs, toast, theme)`);
console.log(`✅ santy-elements.js  — ${kb(ELEMENTS_JS.length)} (custom elements: React/Vue/Svelte/Angular/HTML)`);
console.log(`✅ santy-merge.js     — ${kb(MERGE_JS.length)} (cn() conflict-aware class merge)`);
console.log(`✅ grid system        — ${kb(GRID_CSS.length)} (Bootstrap-compatible .row / .col-md-6)`);
console.log(`✅ santy-themes.css   — ${kb(THEMES_CSS.length)} (5 prebuilt data-theme presets)`);
console.log(`✅ santy-classmap.json — ${kb(CLASSMAP_JSON.length)} (${classSet.size.toLocaleString()} class names for IntelliSense/AI)`);
console.log(`✅ dist/              — mirrored for NPM package`);
console.log('');
console.log('📦 Granular modules:');
for (const name of MODULE_NAMES) {
  console.log(`   santy-${name}.css — ${kb(moduleCSS[name].length)}`);
}

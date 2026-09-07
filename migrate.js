#!/usr/bin/env node
/**
 * SantyCSS Migration Tool  —  npx santycss migrate
 *
 * Converts Tailwind CSS class names to SantyCSS equivalents.
 *
 * Usage:
 *   npx santycss migrate --input=src/          # convert all HTML/JSX/TSX/Vue in src/
 *   npx santycss migrate --file=index.html     # single file
 *   npx santycss migrate --dry-run             # preview only, no writes
 *   npx santycss migrate --report              # print unmapped classes
 *   npx santycss migrate --from=bootstrap      # migrate Bootstrap 5 instead
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── Tailwind → SantyCSS static mappings ─────────────────────────────────────
const STATIC_MAP = {
  // Display
  'flex':               'make-flex',
  'inline-flex':        'make-inline-flex',
  'grid':               'make-grid',
  'block':              'make-block',
  'inline-block':       'make-inline-block',
  'inline':             'make-inline',
  'hidden':             'make-hidden',
  'contents':           'make-contents',

  // Flex / Grid alignment
  'items-start':        'align-start',
  'items-center':       'align-center',
  'items-end':          'align-end',
  'items-stretch':      'align-stretch',
  'items-baseline':     'align-baseline',
  'justify-start':      'justify-start',
  'justify-center':     'justify-center',
  'justify-end':        'justify-end',
  'justify-between':    'justify-between',
  'justify-around':     'justify-around',
  'justify-evenly':     'justify-evenly',
  'self-auto':          'self-auto',
  'self-start':         'self-start',
  'self-center':        'self-center',
  'self-end':           'self-end',
  'self-stretch':       'self-stretch',
  'flex-col':           'flex-col',
  'flex-row':           'flex-row',
  'flex-wrap':          'flex-wrap',
  'flex-nowrap':        'flex-nowrap',
  'flex-wrap-reverse':  'flex-wrap-reverse',
  'flex-1':             'flex-1',
  'flex-auto':          'flex-auto',
  'flex-none':          'flex-none',
  'flex-grow':          'flex-grow',
  'flex-shrink':        'flex-shrink',
  'flex-shrink-0':      'flex-shrink-0',
  'flex-grow-0':        'flex-grow-0',

  // Typography
  'font-thin':          'text-thin',
  'font-light':         'text-light',
  'font-normal':        'text-normal',
  'font-medium':        'text-medium',
  'font-semibold':      'text-semibold',
  'font-bold':          'text-bold',
  'font-extrabold':     'text-extrabold',
  'font-black':         'text-black',
  'text-xs':            'set-text-12',
  'text-sm':            'set-text-14',
  'text-base':          'set-text-16',
  'text-lg':            'set-text-18',
  'text-xl':            'set-text-20',
  'text-2xl':           'set-text-24',
  'text-3xl':           'set-text-30',
  'text-4xl':           'set-text-36',
  'text-5xl':           'set-text-48',
  'text-6xl':           'set-text-60',
  'text-7xl':           'set-text-72',
  'text-left':          'text-left',
  'text-center':        'text-center',
  'text-right':         'text-right',
  'text-justify':       'text-justify',
  'uppercase':          'text-uppercase',
  'lowercase':          'text-lowercase',
  'capitalize':         'text-capitalize',
  'normal-case':        'text-normal-case',
  'italic':             'text-italic',
  'not-italic':         'text-not-italic',
  'underline':          'text-underline',
  'line-through':       'text-line-through',
  'no-underline':       'text-no-decoration',
  'truncate':           'text-truncate',
  'break-words':        'text-break-words',
  'break-all':          'text-break-all',
  'whitespace-nowrap':  'text-nowrap',
  'whitespace-normal':  'text-wrap',
  'leading-none':       'line-height-none',
  'leading-tight':      'line-height-tight',
  'leading-snug':       'line-height-snug',
  'leading-normal':     'line-height-normal',
  'leading-relaxed':    'line-height-relaxed',
  'leading-loose':      'line-height-loose',
  'tracking-tighter':   'letter-spacing-tighter',
  'tracking-tight':     'letter-spacing-tight',
  'tracking-normal':    'letter-spacing-normal',
  'tracking-wide':      'letter-spacing-wide',
  'tracking-wider':     'letter-spacing-wider',
  'tracking-widest':    'letter-spacing-widest',

  // Borders / Radius
  'rounded-none':   'make-rounded-none',
  'rounded-sm':     'make-rounded-sm',
  'rounded':        'make-rounded',
  'rounded-md':     'make-rounded-md',
  'rounded-lg':     'make-rounded-lg',
  'rounded-xl':     'make-rounded-xl',
  'rounded-2xl':    'make-rounded-2xl',
  'rounded-3xl':    'make-rounded-3xl',
  'rounded-full':   'make-rounded-full',
  'border':         'add-border',
  'border-0':       'add-border-0',
  'border-2':       'add-border-2',
  'border-4':       'add-border-4',
  'border-8':       'add-border-8',
  'border-t':       'add-border-top',
  'border-b':       'add-border-bottom',
  'border-l':       'add-border-left',
  'border-r':       'add-border-right',
  'border-solid':   'border-solid',
  'border-dashed':  'border-dashed',
  'border-dotted':  'border-dotted',
  'border-none':    'border-none',

  // Shadows
  'shadow-none': 'add-shadow-none',
  'shadow-sm':   'add-shadow-sm',
  'shadow':      'add-shadow',
  'shadow-md':   'add-shadow-md',
  'shadow-lg':   'add-shadow-lg',
  'shadow-xl':   'add-shadow-xl',
  'shadow-2xl':  'add-shadow-2xl',
  'shadow-inner':'add-shadow-inner',

  // Sizing
  'w-full':    'width-full',
  'w-screen':  'width-screen',
  'w-auto':    'width-auto',
  'w-min':     'width-min',
  'w-max':     'width-max',
  'w-fit':     'width-fit',
  'h-full':    'height-full',
  'h-screen':  'height-screen',
  'h-auto':    'height-auto',
  'h-min':     'height-min',
  'h-max':     'height-max',
  'h-fit':     'height-fit',
  'min-w-0':   'min-width-0',
  'min-w-full':'min-width-full',
  'max-w-full':'max-width-full',
  'max-w-none':'max-width-none',
  'max-h-full':'max-height-full',
  'max-h-screen':'max-height-screen',

  // Position
  'static':   'position-static',
  'relative': 'position-relative',
  'absolute': 'position-absolute',
  'fixed':    'position-fixed',
  'sticky':   'position-sticky',
  'inset-0':  'inset-0',
  'top-0':    'top-0',
  'bottom-0': 'bottom-0',
  'left-0':   'left-0',
  'right-0':  'right-0',

  // Overflow
  'overflow-auto':    'overflow-auto',
  'overflow-hidden':  'overflow-hidden',
  'overflow-scroll':  'overflow-scroll',
  'overflow-visible': 'overflow-visible',
  'overflow-x-auto':  'overflow-x-auto',
  'overflow-x-hidden':'overflow-x-hidden',
  'overflow-y-auto':  'overflow-y-auto',
  'overflow-y-hidden':'overflow-y-hidden',

  // Misc
  'container':         'container',
  'mx-auto':           'margin-auto',
  'cursor-pointer':    'cursor-pointer',
  'cursor-default':    'cursor-default',
  'cursor-not-allowed':'cursor-not-allowed',
  'cursor-wait':       'cursor-wait',
  'cursor-text':       'cursor-text',
  'cursor-move':       'cursor-move',
  'pointer-events-none':'pointer-events-none',
  'pointer-events-auto':'pointer-events-auto',
  'select-none':       'user-select-none',
  'select-text':       'user-select-text',
  'select-all':        'user-select-all',
  'select-auto':       'user-select-auto',
  'visible':           'make-visible',
  'invisible':         'make-invisible',
  'opacity-0':         'opacity-0',
  'opacity-25':        'opacity-25',
  'opacity-50':        'opacity-50',
  'opacity-75':        'opacity-75',
  'opacity-100':       'opacity-100',
  'transition':        'transition-all',
  'transition-all':    'transition-all',
  'transition-colors': 'transition-colors',
  'transition-opacity':'transition-opacity',
  'transition-transform':'transition-transform',
  'duration-75':       'duration-75',
  'duration-100':      'duration-100',
  'duration-150':      'duration-150',
  'duration-200':      'duration-200',
  'duration-300':      'duration-300',
  'duration-500':      'duration-500',
  'duration-700':      'duration-700',
  'duration-1000':     'duration-1000',
  'ease-linear':       'ease-linear',
  'ease-in':           'ease-in',
  'ease-out':          'ease-out',
  'ease-in-out':       'ease-in-out',
  'sr-only':           'visually-hidden',
  'not-sr-only':       'visually-visible',
  'list-none':         'list-none',
  'list-disc':         'list-disc',
  'list-decimal':      'list-decimal',
  'appearance-none':   'appearance-none',
  'resize-none':       'resize-none',
  'resize':            'resize-both',
  'resize-y':          'resize-vertical',
  'resize-x':          'resize-horizontal',
  'object-cover':      'object-cover',
  'object-contain':    'object-contain',
  'object-fill':       'object-fill',
  'object-none':       'object-none',
  'object-scale-down': 'object-scale-down',
  'isolate':           'isolate',
  'isolation-auto':    'isolation-auto',
  'z-0':   'z-0',
  'z-10':  'z-10',
  'z-20':  'z-20',
  'z-30':  'z-30',
  'z-40':  'z-40',
  'z-50':  'z-50',
  'z-auto':'z-auto',
  'float-left':   'float-left',
  'float-right':  'float-right',
  'float-none':   'float-none',
  'clear-left':   'clear-left',
  'clear-right':  'clear-right',
  'clear-both':   'clear-both',
  'clear-none':   'clear-none',
  'table':          'make-table',
  'table-auto':     'table-auto',
  'table-fixed':    'table-fixed',
  'table-row':      'make-table-row',
  'table-cell':     'make-table-cell',
  'border-collapse':'border-collapse',
  'border-separate':'border-separate',
  'aspect-auto':     'aspect-auto',
  'aspect-square':   'aspect-square',
  'aspect-video':    'aspect-video',
};

// ─── Dynamic pattern converters ──────────────────────────────────────────────
// Each returns { from, to } or null if no match
const DYNAMIC_PATTERNS = [
  // gap-{n} → gap-{n*4}
  { re: /^gap-(\d+)$/,     fn: m => `gap-${+m[1]*4}` },
  { re: /^gap-x-(\d+)$/,   fn: m => `gap-x-${+m[1]*4}` },
  { re: /^gap-y-(\d+)$/,   fn: m => `gap-y-${+m[1]*4}` },

  // padding
  { re: /^p-(\d+)$/,       fn: m => `add-padding-${+m[1]*4}` },
  { re: /^px-(\d+)$/,      fn: m => `add-padding-x-${+m[1]*4}` },
  { re: /^py-(\d+)$/,      fn: m => `add-padding-y-${+m[1]*4}` },
  { re: /^pt-(\d+)$/,      fn: m => `add-padding-top-${+m[1]*4}` },
  { re: /^pb-(\d+)$/,      fn: m => `add-padding-bottom-${+m[1]*4}` },
  { re: /^pl-(\d+)$/,      fn: m => `add-padding-left-${+m[1]*4}` },
  { re: /^pr-(\d+)$/,      fn: m => `add-padding-right-${+m[1]*4}` },

  // margin
  { re: /^m-(\d+)$/,       fn: m => `add-margin-${+m[1]*4}` },
  { re: /^mx-(\d+)$/,      fn: m => `add-margin-x-${+m[1]*4}` },
  { re: /^my-(\d+)$/,      fn: m => `add-margin-y-${+m[1]*4}` },
  { re: /^mt-(\d+)$/,      fn: m => `add-margin-top-${+m[1]*4}` },
  { re: /^mb-(\d+)$/,      fn: m => `add-margin-bottom-${+m[1]*4}` },
  { re: /^ml-(\d+)$/,      fn: m => `add-margin-left-${+m[1]*4}` },
  { re: /^mr-(\d+)$/,      fn: m => `add-margin-right-${+m[1]*4}` },
  { re: /^-mt-(\d+)$/,     fn: m => `add-margin-top--${+m[1]*4}` },
  { re: /^-mb-(\d+)$/,     fn: m => `add-margin-bottom--${+m[1]*4}` },
  { re: /^-ml-(\d+)$/,     fn: m => `add-margin-left--${+m[1]*4}` },
  { re: /^-mr-(\d+)$/,     fn: m => `add-margin-right--${+m[1]*4}` },

  // width / height fixed values
  { re: /^w-(\d+)$/, fn: m => `set-width-${+m[1]*4}` },
  { re: /^h-(\d+)$/, fn: m => `set-height-${+m[1]*4}` },
  { re: /^min-w-\[(\d+)px\]$/, fn: m => `min-width-${m[1]}` },
  { re: /^max-w-\[(\d+)px\]$/, fn: m => `max-width-${m[1]}` },

  // max-w-{size}
  { re: /^max-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)$/, fn: m => `max-width-${m[1]}` },

  // grid-cols-{n}
  { re: /^grid-cols-(\d+)$/,  fn: m => `grid-cols-${m[1]}` },
  { re: /^grid-rows-(\d+)$/,  fn: m => `grid-rows-${m[1]}` },
  { re: /^col-span-(\d+)$/,   fn: m => `col-span-${m[1]}` },
  { re: /^col-start-(\d+)$/,  fn: m => `col-start-${m[1]}` },
  { re: /^col-end-(\d+)$/,    fn: m => `col-end-${m[1]}` },
  { re: /^row-span-(\d+)$/,   fn: m => `row-span-${m[1]}` },

  // text color — text-{color}-{shade}
  { re: /^text-([a-z]+)-(\d+)$/, fn: m => `color-${m[1]}-${m[2]}` },

  // bg color — bg-{color}-{shade}
  { re: /^bg-([a-z]+)-(\d+)$/,   fn: m => `background-${m[1]}-${m[2]}` },

  // border color — border-{color}-{shade}
  { re: /^border-([a-z]+)-(\d+)$/, fn: m => `border-color-${m[1]}-${m[2]}` },

  // opacity-{n}
  { re: /^opacity-(\d+)$/, fn: m => `opacity-${m[1]}` },

  // z-index
  { re: /^z-(\d+)$/, fn: m => `z-${m[1]}` },

  // space-x / space-y (approximate with gap)
  { re: /^space-x-(\d+)$/, fn: m => `gap-${+m[1]*4}` },
  { re: /^space-y-(\d+)$/, fn: m => `gap-y-${+m[1]*4}` },

  // rounded-t / rounded-b etc (partial border radius)
  { re: /^rounded-t(-\w+)?$/, fn: m => `make-rounded-top${m[1]||''}` },
  { re: /^rounded-b(-\w+)?$/, fn: m => `make-rounded-bottom${m[1]||''}` },
  { re: /^rounded-l(-\w+)?$/, fn: m => `make-rounded-left${m[1]||''}` },
  { re: /^rounded-r(-\w+)?$/, fn: m => `make-rounded-right${m[1]||''}` },

  // basis
  { re: /^basis-(\d+)$/, fn: m => `flex-basis-${+m[1]*4}` },
  { re: /^basis-full$/, fn: () => 'flex-basis-full' },
  { re: /^basis-auto$/, fn: () => 'flex-basis-auto' },
];

// ─── Source framework selection (v2.9.0) ─────────────────────────────────────
// Tailwind has been supported since v2.4.0; Bootstrap is new. `--from=` picks
// the dialect, so the two maps never have to be merged (they disagree on
// several class names — `text-primary` and `d-flex` mean different things).
const bootstrap = require('./lib/bootstrap-map');

let SOURCE = 'tailwind';

// ─── Convert a single class name ─────────────────────────────────────────────
function convertClass(tw) {
  if (SOURCE === 'bootstrap') {
    const out = bootstrap.convert(tw);
    // A passthrough (class already valid in SantyCSS) is not a conversion.
    return out === null || out === tw ? null : out;
  }
  if (STATIC_MAP[tw]) return STATIC_MAP[tw];
  for (const p of DYNAMIC_PATTERNS) {
    const m = tw.match(p.re);
    if (m) return p.fn(m);
  }
  return null; // unmapped
}

/** True when a class needs no change because SantyCSS already supports it. */
function isPassthrough(cls) {
  return SOURCE === 'bootstrap' && bootstrap.convert(cls) === cls;
}

// ─── Convert all class= attributes in a string ───────────────────────────────
function convertContent(source) {
  const unmapped = new Set();
  let convCount = 0;

  // Match class="..." or className="..."
  const result = source.replace(/(\bclass(?:Name)?=["'])([^"']+)(["'])/g, (full, open, classes, close) => {
    const converted = classes.split(/\s+/).map(cls => {
      if (!cls) return cls;
      const mapped = convertClass(cls);
      if (mapped) { convCount++; return mapped; }
      // Classes SantyCSS already understands are correct as-is; only flag
      // the ones a human still has to deal with.
      if (!isPassthrough(cls)) unmapped.add(cls);
      return cls; // keep original if unmapped
    }).join(' ');
    return open + converted + close;
  });

  return { result, unmapped: [...unmapped], convCount };
}

// ─── File walker ─────────────────────────────────────────────────────────────
const EXTS = new Set(['.html', '.jsx', '.tsx', '.vue', '.svelte', '.php', '.erb', '.astro']);

function walkDir(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkDir(full));
    else if (EXTS.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

// ─── Main ────────────────────────────────────────────────────────────────────
const args      = process.argv.slice(2);
const getArg    = (k, def) => { const m = args.find(a => a.startsWith(`--${k}=`)); return m ? m.slice(k.length+3) : def; };
const hasFlag   = k => args.includes(`--${k}`);
const isDryRun  = hasFlag('dry-run');
const isReport  = hasFlag('report');
SOURCE = (getArg('from', 'tailwind') || 'tailwind').toLowerCase();
if (SOURCE !== 'tailwind' && SOURCE !== 'bootstrap') {
  console.error('Unknown --from=' + SOURCE + '. Use tailwind or bootstrap.');
  process.exit(1);
}

const inputDir  = getArg('input', null);
const singleFile= getArg('file', null);

let files = [];
if (singleFile) {
  files = [path.resolve(singleFile)];
} else if (inputDir) {
  files = walkDir(path.resolve(inputDir));
} else {
  // default: scan current dir
  files = walkDir(process.cwd());
}

if (files.length === 0) {
  console.log('No HTML/JSX/TSX/Vue files found.');
  process.exit(0);
}

let totalConverted = 0;
let totalFiles = 0;
const allUnmapped = new Set();

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const { result, unmapped, convCount } = convertContent(source);

  unmapped.forEach(c => allUnmapped.add(c));

  if (convCount === 0) continue;
  totalConverted += convCount;
  totalFiles++;

  if (isDryRun) {
    console.log(`  [dry-run] ${file}  (${convCount} replacements)`);
  } else {
    fs.writeFileSync(file, result, 'utf8');
    console.log(`  ✔  ${file}  (${convCount} replacements)`);
  }
}

console.log(`\n  SantyCSS migrate — done`);
console.log(`  Files changed : ${totalFiles}`);
console.log(`  Classes mapped: ${totalConverted}`);

if (isReport && allUnmapped.size) {
  console.log(`\n  Unmapped ${SOURCE} classes (${allUnmapped.size}):`);
  [...allUnmapped].sort().forEach(c => console.log(`    - ${c}`));
}

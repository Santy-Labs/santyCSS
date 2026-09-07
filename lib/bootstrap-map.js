'use strict';
/**
 * Bootstrap 5 → SantyCSS class map (v2.9.0)
 *
 * The Tailwind migrator has existed since v2.4.0; Bootstrap had none, which
 * made "replaces Bootstrap" a claim with no on-ramp behind it.
 *
 * Two deliberate non-goals:
 *
 *  - Bootstrap's grid (`.row`, `.col-md-6`, `.container`, `.g-*`, `.offset-*`)
 *    is NOT rewritten. SantyCSS ships a compatible grid, so those classes work
 *    as-is; translating them would churn markup for no behavioural gain.
 *  - Component classes that exist in both (`.btn`, `.card`, `.badge`, `.alert`,
 *    `.modal`, `.navbar`, …) are left alone for the same reason.
 *
 * What does get rewritten: Bootstrap's utility API, which has no SantyCSS
 * equivalent under the same name.
 */

/* Bootstrap's spacer scale: $spacer = 1rem = 16px, and 0-5 maps to
   0, .25, .5, 1, 1.5, 3 spacers. */
const SPACER = { 0: 0, 1: 4, 2: 8, 3: 16, 4: 24, 5: 48 };

const SIDE = {
  t: 'top', b: 'bottom', s: 'left', e: 'right', l: 'left', r: 'right',
};

const STATIC_MAP = {
  /* ── display ── */
  'd-none': 'make-hidden',
  'd-block': 'make-block',
  'd-inline': 'make-inline',
  'd-inline-block': 'make-inline-block',
  'd-flex': 'make-flex',
  'd-inline-flex': 'make-inline-flex',
  'd-grid': 'make-grid',
  'd-table': 'make-table',
  'd-contents': 'make-contents',

  /* ── flex ── */
  'flex-row': 'flex-row',
  'flex-column': 'flex-column',
  'flex-row-reverse': 'flex-row-reverse',
  'flex-column-reverse': 'flex-column-reverse',
  'flex-wrap': 'flex-wrap',
  'flex-nowrap': 'flex-nowrap',
  'flex-fill': 'flex-1',
  'flex-grow-0': 'flex-grow-0',
  'flex-grow-1': 'flex-grow-1',
  'flex-shrink-0': 'flex-shrink-0',
  'flex-shrink-1': 'flex-shrink-1',

  'justify-content-start': 'justify-start',
  'justify-content-end': 'justify-end',
  'justify-content-center': 'justify-center',
  'justify-content-between': 'justify-between',
  'justify-content-around': 'justify-around',
  'justify-content-evenly': 'justify-evenly',

  'align-items-start': 'align-start',
  'align-items-end': 'align-end',
  'align-items-center': 'align-center',
  'align-items-baseline': 'align-baseline',
  'align-items-stretch': 'align-stretch',

  'align-self-start': 'self-start',
  'align-self-end': 'self-end',
  'align-self-center': 'self-center',
  'align-self-stretch': 'self-stretch',

  /* ── position ── */
  'position-static': 'position-static',
  'position-relative': 'position-relative',
  'position-absolute': 'position-absolute',
  'position-fixed': 'position-fixed',
  'position-sticky': 'position-sticky',
  'fixed-top': 'position-fixed pin-top-0 pin-left-0 pin-right-0 z-50',
  'fixed-bottom': 'position-fixed pin-bottom-0 pin-left-0 pin-right-0 z-50',
  'sticky-top': 'position-sticky pin-top-0 z-50',

  /* ── typography ── */
  'text-start': 'text-left',
  'text-end': 'text-right',
  'text-center': 'text-center',
  'text-lowercase': 'text-lowercase',
  'text-uppercase': 'text-uppercase',
  'text-capitalize': 'text-capitalize',
  'text-nowrap': 'text-nowrap',
  'text-wrap': 'text-wrap',
  'text-break': 'text-break-word',
  'text-truncate': 'text-truncate',
  'text-decoration-none': 'text-no-decoration',
  'text-decoration-underline': 'text-underline',
  'text-decoration-line-through': 'text-strikethrough',
  'fw-bold': 'text-bold',
  'fw-bolder': 'set-font-weight-800',
  'fw-semibold': 'text-semibold',
  'fw-medium': 'text-medium',
  'fw-normal': 'text-normal',
  'fw-light': 'text-light',
  'fw-lighter': 'text-thin',
  'fst-italic': 'text-italic',
  'fst-normal': 'text-not-italic',
  'font-monospace': 'font-mono',
  'lh-1': 'line-height-none',
  'lh-sm': 'line-height-tight',
  'lh-base': 'line-height-normal',
  'lh-lg': 'line-height-relaxed',

  /* ── colour (Bootstrap theme colours → SantyCSS palette) ── */
  'text-primary': 'color-blue-600',
  'text-secondary': 'color-gray-600',
  'text-success': 'color-green-600',
  'text-danger': 'color-red-600',
  'text-warning': 'color-yellow-600',
  'text-info': 'color-cyan-600',
  'text-light': 'color-gray-100',
  'text-dark': 'color-gray-900',
  'text-body': 'color-text',
  'text-muted': 'color-text-muted',
  'text-white': 'color-white',
  'text-black': 'color-black',

  'bg-primary': 'background-blue-600',
  'bg-secondary': 'background-gray-600',
  'bg-success': 'background-green-600',
  'bg-danger': 'background-red-600',
  'bg-warning': 'background-yellow-500',
  'bg-info': 'background-cyan-500',
  'bg-light': 'background-gray-100',
  'bg-dark': 'background-gray-900',
  'bg-white': 'background-white',
  'bg-black': 'background-black',
  'bg-body': 'background-surface',
  'bg-transparent': 'background-transparent',

  /* ── border ── */
  'border': 'add-border-1',
  'border-0': 'add-border-0',
  'border-top': 'add-border-top-1',
  'border-bottom': 'add-border-bottom-1',
  'border-start': 'add-border-left-1',
  'border-end': 'add-border-right-1',
  'border-top-0': 'add-border-top-0',
  'border-bottom-0': 'add-border-bottom-0',
  'border-primary': 'border-color-blue-600',
  'border-secondary': 'border-color-gray-600',
  'border-success': 'border-color-green-600',
  'border-danger': 'border-color-red-600',
  'border-warning': 'border-color-yellow-500',
  'border-info': 'border-color-cyan-500',
  'border-light': 'border-color-gray-200',
  'border-dark': 'border-color-gray-900',
  'border-white': 'border-color-white',

  'rounded': 'round-corners-6',
  'rounded-0': 'round-corners-0',
  'rounded-1': 'round-corners-4',
  'rounded-2': 'round-corners-6',
  'rounded-3': 'round-corners-12',
  'rounded-4': 'round-corners-16',
  'rounded-5': 'round-corners-24',
  'rounded-circle': 'make-circle',
  'rounded-pill': 'make-pill',

  /* ── shadow ── */
  'shadow-none': 'add-shadow-none',
  'shadow-sm': 'add-shadow-sm',
  'shadow': 'add-shadow-md',
  'shadow-lg': 'add-shadow-lg',

  /* ── sizing ── */
  'w-25': 'set-width-quarter',
  'w-50': 'set-width-half',
  'w-75': 'set-width-three-quarters',
  'w-100': 'set-width-full',
  'w-auto': 'set-width-auto',
  'mw-100': 'set-max-width-full',
  'vw-100': 'set-width-screen',
  'h-25': 'set-height-quarter',
  'h-50': 'set-height-half',
  'h-75': 'set-height-three-quarters',
  'h-100': 'set-height-full',
  'h-auto': 'set-height-auto',
  'mh-100': 'set-max-height-full',
  'vh-100': 'set-height-screen',
  'min-vh-100': 'set-min-height-screen',

  /* ── overflow / misc ── */
  'overflow-auto': 'overflow-auto',
  'overflow-hidden': 'overflow-hidden',
  'overflow-visible': 'overflow-visible',
  'overflow-scroll': 'overflow-scroll',
  'user-select-all': 'user-select-all',
  'user-select-auto': 'user-select-auto',
  'user-select-none': 'user-select-none',
  'pe-none': 'pointer-events-none',
  'pe-auto': 'pointer-events-auto',
  'visually-hidden': 'screen-reader-only',
  'visually-hidden-focusable': 'sr-only-focusable',
  'float-start': 'float-left',
  'float-end': 'float-right',
  'float-none': 'float-none',
  'clearfix': 'clear-both',
  'invisible': 'invisible',
  'visible': 'visible',
  'opacity-0': 'opacity-0',
  'opacity-25': 'opacity-25',
  'opacity-50': 'opacity-50',
  'opacity-75': 'opacity-75',
  'opacity-100': 'opacity-100',
  'img-fluid': 'set-max-width-full set-height-auto',
  'd-print-none': 'print:make-hidden',
};

/**
 * Bootstrap spacing utilities: m/p + optional side + optional breakpoint + size.
 *   mt-3      → add-margin-top-16
 *   px-lg-4   → lg:add-padding-x-24
 *   my-auto   → add-margin-y-auto
 *   m-n3      → add-margin--16   (negative margins)
 */
const SPACING_RE = /^([mp])([tbsexy]?)-(?:(sm|md|lg|xl|xxl)-)?(n?)([0-5]|auto)$/;
// Note: `n` captures Bootstrap's negative margins (m-n3). SantyCSS has no
// negative-margin utility, so those are reported rather than mistranslated.

function convertSpacing(cls) {
  const m = SPACING_RE.exec(cls);
  if (!m) return null;
  const [, prop, side, bp, neg, size] = m;
  const base = prop === 'm' ? 'add-margin' : 'add-padding';

  let axis = '';
  if (side === 'x') axis = '-x';
  else if (side === 'y') axis = '-y';
  else if (side) axis = '-' + SIDE[side];

  if (size === 'auto') {
    // Only margin can be auto; padding-auto is not a thing.
    if (prop !== 'm') return null;
    return (bp ? bp + ':' : '') + base + axis + '-auto';
  }

  // SantyCSS has no negative-margin utilities, so there is nothing honest to
  // emit here. Returning null lets the migrator report it as unmapped rather
  // than writing `add-margin--16`, a class that does not exist.
  if (neg) return null;

  return (bp ? bp + ':' : '') + base + axis + '-' + SPACER[size];
}

/** Bootstrap gap utilities: gap-3 → gap-16, gap-md-2 → md:gap-8 */
const GAP_RE = /^gap-(?:(sm|md|lg|xl|xxl)-)?([0-5])$/;
function convertGap(cls) {
  const m = GAP_RE.exec(cls);
  if (!m) return null;
  return (m[1] ? m[1] + ':' : '') + 'gap-' + SPACER[m[2]];
}

/** Responsive display: d-md-none → md:make-hidden */
const DISPLAY_RE = /^d-(sm|md|lg|xl|xxl)-(none|block|inline|inline-block|flex|inline-flex|grid|table)$/;
function convertDisplay(cls) {
  const m = DISPLAY_RE.exec(cls);
  if (!m) return null;
  const target = STATIC_MAP['d-' + m[2]];
  return target ? m[1] + ':' + target : null;
}

/** Font size: fs-1 … fs-6 follow Bootstrap's heading scale. */
const FS_MAP = { 1: 40, 2: 32, 3: 28, 4: 24, 5: 20, 6: 16 };
function convertFontSize(cls) {
  const m = /^fs-([1-6])$/.exec(cls);
  return m ? 'set-text-' + FS_MAP[m[1]] : null;
}

/** Text/background opacity variables have no direct equivalent; report them. */
const DYNAMIC = [convertSpacing, convertGap, convertDisplay, convertFontSize];

/**
 * Classes that already work in SantyCSS and must be left untouched — mostly
 * the grid, plus components sharing a name. Returning `null` from convert()
 * would mark them "unmapped" and mislead the report, so they are explicit.
 */
const PASSTHROUGH = new RegExp([
  '^(row|col|container|container-fluid)$',
  '^col(-(sm|md|lg|xl|xxl))?-(auto|1[0-2]|[1-9])$',
  '^offset(-(sm|md|lg|xl|xxl))?-(1[01]|[0-9])$',
  '^order(-(sm|md|lg|xl|xxl))?-(1[0-2]|[0-9]|first|last)$',
  '^row-cols(-(sm|md|lg|xl|xxl))?-(auto|[1-6])$',
  '^g[xy]?-[0-5]$',
  '^container-(sm|md|lg|xl|xxl)$',
  // Components that exist under the same name in SantyCSS.
  '^(btn|card|badge|alert|modal|navbar|dropdown|accordion|table|tooltip|popover|toast|progress|spinner|pagination|breadcrumb|carousel|nav|tabs|form-label|form-group|input-group)',
].join('|'));

/**
 * Convert one Bootstrap class.
 * Returns the SantyCSS equivalent, `cls` itself when it already works,
 * or null when there is no mapping.
 */
function convert(cls) {
  if (PASSTHROUGH.test(cls)) return cls;
  if (STATIC_MAP[cls]) return STATIC_MAP[cls];
  for (const fn of DYNAMIC) {
    const out = fn(cls);
    if (out) return out;
  }
  return null;
}

module.exports = { convert, STATIC_MAP, SPACER, PASSTHROUGH, convertSpacing, convertGap, convertDisplay };

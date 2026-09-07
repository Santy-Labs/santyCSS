/*! @santycss/sort — canonical class ordering | MIT
 *
 * Tailwind's real moat is tooling, not CSS, and automatic class sorting is the
 * piece developers notice daily: without it, class attributes drift into
 * whatever order each person typed, and diffs churn on reordering alone.
 *
 *   sortClasses('add-padding-8 make-flex md:grid-cols-3 btn on-hover:scale-105')
 *   → 'btn make-flex add-padding-8 on-hover:scale-105 md:grid-cols-3'
 *
 * Ordering rules, in priority order:
 *   1. Unrecognised classes first (component and app classes: `btn`, `card`,
 *      `my-widget`) in their original relative order — they are usually the
 *      element's identity, and moving them around hurts readability.
 *   2. Base utilities, grouped by what they affect: layout → box → spacing →
 *      sizing → typography → colour → border → effects → motion → interaction.
 *   3. Variants last, so the unconditional styles read first — responsive
 *      ascending (sm → xl), then state, then dark, then print.
 *
 * Pure and dependency-free: usable from the Prettier plugin, an ESLint rule,
 * an editor command, or a codemod.
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.santySort = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Property groups in cascade-ish reading order. First match wins, so more
   * specific patterns must come before broader ones.
   */
  const GROUPS = [
    /* ── layout / display ── */
    [/^(make-hidden|make-block|make-inline-block|make-inline-flex|make-inline|make-flex|make-grid|make-contents|make-table)$/, 10],
    [/^(container|screen-reader-only|sr-only|not-sr-only)$/, 11],
    [/^(float-|clear-|isolate|isolation-)/, 12],

    /* ── position ── */
    [/^position-/, 20],
    [/^pin-/, 21],
    [/^(inset-|top-|right-|bottom-|left-)/, 22],
    [/^z-/, 23],

    /* ── flex & grid containers ── */
    [/^(flex-row|flex-column|flex-wrap|flex-nowrap)/, 30],
    [/^(grid-cols-|grid-rows-|grid-flow-|auto-cols-|auto-rows-)/, 31],
    [/^(align-|justify-|place-|content-)/, 32],
    [/^gap-/, 33],

    /* ── flex & grid children ── */
    [/^(order-|col-span-|col-start-|col-end-|row-span-|row-start-|row-end-|flex-grow|flex-shrink|flex-1|flex-auto|flex-initial|flex-none|self-)/, 40],

    /* ── spacing ── */
    [/^add-margin-/, 50],
    [/^(space-x-|space-y-|me-|ms-|mx-auto)/, 51],
    [/^add-padding-/, 52],
    [/^(pe-|ps-)/, 53],

    /* ── sizing ── */
    [/^set-(min-|max-)?width-/, 60],
    [/^set-(min-|max-)?height-/, 61],
    [/^(set-size-|w-|h-|aspect-)/, 62],

    /* ── typography ── */
    [/^set-text-/, 70],
    [/^(set-font-weight-|text-bold|text-semibold|text-medium|text-light|text-thin|text-normal|text-extrabold|text-black)/, 71],
    [/^(font-|text-fluid-)/, 72],
    [/^(text-left|text-center|text-right|text-justify|text-start|text-end)$/, 73],
    [/^(line-height-|letter-space-|text-clamp-|text-truncate|text-nowrap|text-wrap|text-balance|text-pretty)/, 74],
    [/^(text-uppercase|text-lowercase|text-capitalize|text-italic|text-underline|text-strikethrough|text-no-decoration)/, 75],

    /* ── colour ── */
    [/^(color-|text-gradient)/, 80],
    [/^(background-|gradient-|from-|via-|to-)/, 81],

    /* ── border ── */
    [/^add-border-/, 90],
    [/^border-(color-|[a-z]+-(tint|shade))/, 91],
    [/^(border-|divide-)/, 92],
    [/^(round-corners-|make-circle|make-pill)/, 93],

    /* ── effects ── */
    [/^add-shadow-/, 100],
    [/^(opacity-|mix-blend-|blur-|brightness-|contrast-|grayscale|saturate-|backdrop-|glass)/, 101],
    [/^(ring-|focus-ring)/, 102],

    /* ── motion ── */
    [/^transition-/, 110],
    [/^(duration-|delay-|ease-)/, 111],
    [/^(scale-|rotate-|translate-|skew-|transform)/, 112],
    [/^animate-/, 113],

    /* ── interaction ── */
    [/^cursor-/, 120],
    [/^(pointer-events-|user-select-|touch-|overscroll-|resize-|appearance-)/, 121],
    [/^(overflow-|scroll-|snap-)/, 122],
    [/^(object-fit-|object-position-)/, 123],
  ];

  /** Variant priority — lower sorts earlier. Unknown variants sort last. */
  const VARIANT_ORDER = {
    'on-mobile': 10, 'on-tablet': 11, 'on-desktop': 12,
    'max-sm': 20, 'max-md': 21, 'max-lg': 22, 'max-xl': 23, 'max-xxl': 24,
    sm: 30, md: 31, lg: 32, xl: 33, xxl: 34, 'on-wide': 35,
    'on-hover': 40, 'on-focus': 41, 'on-focus-visible': 42, 'on-focus-within': 43,
    'on-active': 44, 'on-visited': 45, 'on-disabled': 46, 'on-checked': 47,
    'group-hover': 50, 'group-focus': 51, 'peer-hover': 52, 'peer-checked': 53,
    'has-checked': 60, 'has-focus': 61, 'has-hover': 62, 'has-invalid': 63,
    rtl: 70, ltr: 71,
    'motion-safe': 80, 'motion-reduce': 81,
    dark: 90,
    print: 100,
  };

  const groupCache = Object.create(null);

  function groupOf(base) {
    if (base in groupCache) return groupCache[base];
    let rank = null;
    for (const [pattern, weight] of GROUPS) {
      if (pattern.test(base)) { rank = weight; break; }
    }
    groupCache[base] = rank;
    return rank;
  }

  /** Split `md:on-hover:scale-110`, tracking bracket depth for arbitrary values. */
  function splitVariants(cls) {
    let depth = 0;
    const parts = [];
    let start = 0;
    for (let i = 0; i < cls.length; i++) {
      const c = cls[i];
      if (c === '[') depth++;
      else if (c === ']') depth--;
      else if (c === ':' && depth === 0) { parts.push(cls.slice(start, i)); start = i + 1; }
    }
    return { variants: parts, base: cls.slice(start) };
  }

  function variantRank(variants) {
    if (!variants.length) return -1;
    // Rank by the least-specific variant, so `md:on-hover:x` sits with `md:`.
    let best = Infinity;
    for (const v of variants) {
      const r = VARIANT_ORDER[v];
      best = Math.min(best, r === undefined ? 999 : r);
    }
    return best;
  }

  /**
   * Sort a class string into canonical order.
   * Whitespace is normalised to single spaces; template placeholders such as
   * `${…}` and `{{…}}` are left in place, in their original relative position.
   */
  function sortClasses(input) {
    if (typeof input !== 'string' || !input.trim()) return input;

    const classes = input.split(/\s+/).filter(Boolean);
    const decorated = classes.map((cls, i) => {
      // Never reorder around a dynamic expression — it may concatenate.
      const dynamic = /[${}(]/.test(cls);
      const { variants, base } = splitVariants(cls);
      const group = dynamic ? null : groupOf(base);
      return {
        cls, i, dynamic,
        vRank: variants.length ? variantRank(variants) : -1,
        vCount: variants.length,
        group,
      };
    });

    if (decorated.some(d => d.dynamic)) return classes.join(' ');

    decorated.sort((a, b) => {
      // 1. Unrecognised classes first, original order preserved.
      const aUnknown = a.group === null, bUnknown = b.group === null;
      if (aUnknown !== bUnknown) return aUnknown ? -1 : 1;
      if (aUnknown && bUnknown) return a.i - b.i;

      // 2. Base utilities before any variant.
      if (a.vRank !== b.vRank) return a.vRank - b.vRank;

      // 3. Fewer variants first (md: before md:on-hover:).
      if (a.vCount !== b.vCount) return a.vCount - b.vCount;

      // 4. Property group.
      if (a.group !== b.group) return a.group - b.group;

      // 5. Stable: keep the author's order within a group.
      return a.i - b.i;
    });

    return decorated.map(d => d.cls).join(' ');
  }

  /** True when sorting would change the string — useful for lint rules. */
  function isSorted(input) {
    return sortClasses(input) === String(input).trim().replace(/\s+/g, ' ');
  }

  return { sortClasses, isSorted, splitVariants, groupOf, GROUPS, VARIANT_ORDER };
}));

'use strict';
/**
 * `@apply` support for SantyCSS (v2.9.0)
 *
 * Compose utilities into a semantic class, the way Tailwind's @apply does:
 *
 *   .card-promo {
 *     @apply add-padding-24 round-corners-12 add-shadow-md background-white;
 *     border-top: 3px solid var(--santy-primary);
 *   }
 *
 * becomes
 *
 *   .card-promo {
 *     padding: 24px;
 *     border-radius: 12px;
 *     box-shadow: …;
 *     background-color: #fff;
 *     border-top: 3px solid var(--santy-primary);
 *   }
 *
 * Implemented by indexing the generated stylesheet and inlining each utility's
 * declarations. Utilities that only exist inside a media query or with a
 * pseudo-class cannot be flattened into a plain rule, so those are reported
 * rather than silently dropped.
 */

/** Strip CSS comments so they cannot confuse the brace scanner. */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Index every top-level `.class { … }` rule into { className: declarations }.
 *
 * Only rules at nesting depth 0 are indexed: anything inside `@media`,
 * `@supports` or `@container` is conditional and cannot be inlined safely.
 * Selectors carrying a combinator or pseudo-class are skipped for the same reason.
 */
function buildIndex(css) {
  const src = stripComments(css);
  const index = Object.create(null);
  let depth = 0;
  let i = 0;
  let ruleStart = 0;

  while (i < src.length) {
    const ch = src[i];

    if (ch === '{') {
      if (depth === 0) {
        const prelude = src.slice(ruleStart, i).trim();
        const bodyStart = i + 1;
        // Find the matching close brace.
        let d = 1;
        let j = bodyStart;
        while (j < src.length && d > 0) {
          if (src[j] === '{') d++;
          else if (src[j] === '}') d--;
          j++;
        }
        const body = src.slice(bodyStart, j - 1);

        if (!prelude.startsWith('@')) {
          for (let sel of prelude.split(',')) {
            sel = sel.trim();
            // A lone class selector, nothing else: `.add-padding-24`
            const m = /^\.((?:[\w-]|\\.)+)$/.exec(sel);
            if (!m) continue;
            const name = m[1].replace(/\\/g, '');
            const decls = body.trim().replace(/;\s*$/, '');
            if (!decls) continue;
            // Later definitions win, matching cascade order.
            index[name] = decls;
          }
          i = j;
          ruleStart = i;
          continue;
        }
        // At-rule: skip its whole block, we do not index conditional utilities.
        i = j;
        ruleStart = i;
        continue;
      }
      depth++;
    } else if (ch === '}') {
      if (depth > 0) depth--;
      ruleStart = i + 1;
    }
    i++;
  }

  return index;
}

/**
 * Expand every `@apply …;` in `css` using `index`.
 * Returns { css, warnings } — unknown or non-inlinable classes are reported.
 */
function expandApply(css, index) {
  const warnings = [];

  const out = css.replace(/@apply\s+([^;{}]+);?/g, (match, list) => {
    const classes = list.trim().split(/\s+/).filter(Boolean);
    const decls = [];

    for (const raw of classes) {
      // `!important` suffix, Tailwind style.
      const important = raw.endsWith('!');
      const name = important ? raw.slice(0, -1) : raw;

      const found = index[name];
      if (!found) {
        warnings.push(
          name.includes(':')
            ? `@apply ${name}: variant utilities cannot be inlined — they need a media query or pseudo-class. Write the variant on the element instead.`
            : `@apply ${name}: unknown class.`
        );
        continue;
      }
      decls.push(
        important
          ? found.split(';').filter(Boolean).map(d => d.trim() + ' !important').join('; ')
          : found
      );
    }

    return decls.length ? decls.join('; ') + ';' : '';
  });

  return { css: out, warnings };
}

module.exports = { buildIndex, expandApply, stripComments };

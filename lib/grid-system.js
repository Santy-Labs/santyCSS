'use strict';
/**
 * Bootstrap-compatible 12-column grid (v2.9.0)
 *
 * The audit found SantyCSS had `grid-cols-*` but no `.row` / `.col-md-6`
 * system, which meant Bootstrap migrants had nothing to land on — the single
 * most familiar layout API in the ecosystem was simply missing.
 *
 * Generated rather than hand-written: 6 breakpoints × 12 columns ×
 * (col / offset / order / row-cols) is ~400 rules nobody should maintain by hand.
 *
 * Gutters use the same CSS-variable indirection Bootstrap 5 uses, so
 * `.row.g-0` or `.row.gx-24` adjusts spacing without touching column widths.
 */

const BREAKPOINTS = [
  ['',    null],            // no infix — applies at every width
  ['sm',  576],
  ['md',  768],
  ['lg',  992],
  ['xl',  1200],
  ['xxl', 1400],
];

const GUTTERS = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64];

function pct(n) {
  // Match Bootstrap's precision so column edges line up with existing designs.
  return (n / 12 * 100).toFixed(7).replace(/\.?0+$/, '') + '%';
}

function build() {
  const out = [];
  const add = (...lines) => out.push(...lines);

  add(`/* ═══════════════════════════════════════════════════════════════════════
   SANTY GRID SYSTEM  —  Bootstrap-compatible 12 columns  (v2.9.0)

   <div class="container">
     <div class="row g-24">
       <div class="col-12 col-md-6 col-lg-4">…</div>
     </div>
   </div>

   Breakpoints match Bootstrap 5: sm 576, md 768, lg 992, xl 1200, xxl 1400.
   Note these are the *grid* breakpoints — SantyCSS utility variants
   (md:, lg:) keep their own scale and are unaffected.
   ═══════════════════════════════════════════════════════════════════════ */`);

  /* ── row + gutter variables ── */
  add(`
.row {
  --santy-gutter-x: 24px;
  --santy-gutter-y: 0px;
  display: flex;
  flex-wrap: wrap;
  /* Negative margins cancel the padding each column adds, so the grid sits
     flush with its container while columns keep their internal gutter. */
  margin-top: calc(-1 * var(--santy-gutter-y));
  margin-right: calc(-.5 * var(--santy-gutter-x));
  margin-left: calc(-.5 * var(--santy-gutter-x));
}
.row > * {
  flex-shrink: 0;
  width: 100%;
  max-width: 100%;
  padding-right: calc(var(--santy-gutter-x) * .5);
  padding-left: calc(var(--santy-gutter-x) * .5);
  margin-top: var(--santy-gutter-y);
}
.row-nogutter { --santy-gutter-x: 0px; --santy-gutter-y: 0px; }`);

  /* ── gutter utilities ── */
  const gutterLines = [];
  for (const g of GUTTERS) {
    gutterLines.push(`.g-${g}  { --santy-gutter-x: ${g}px; --santy-gutter-y: ${g}px; }`);
    gutterLines.push(`.gx-${g} { --santy-gutter-x: ${g}px; }`);
    gutterLines.push(`.gy-${g} { --santy-gutter-y: ${g}px; }`);
  }
  add('\n/* ── Gutters ── */\n' + gutterLines.join('\n'));

  /* ── columns, offsets, order, row-cols per breakpoint ── */
  for (const [infix, minWidth] of BREAKPOINTS) {
    const sfx = infix ? `-${infix}` : '';
    const lines = [];

    // Auto-width column: share the leftover space equally.
    lines.push(`.col${sfx} { flex: 1 0 0%; }`);
    lines.push(`.col${sfx}-auto { flex: 0 0 auto; width: auto; }`);

    for (let i = 1; i <= 12; i++) {
      lines.push(`.col${sfx}-${i} { flex: 0 0 auto; width: ${pct(i)}; }`);
    }
    // offset-*-0 is needed to reset an offset at a larger breakpoint.
    for (let i = 0; i <= 11; i++) {
      lines.push(`.offset${sfx}-${i} { margin-left: ${i === 0 ? '0' : pct(i)}; }`);
    }
    // row-cols-N: N equal columns per row, without sizing each child.
    for (let i = 1; i <= 6; i++) {
      lines.push(`.row-cols${sfx}-${i} > * { flex: 0 0 auto; width: ${(100 / i).toFixed(7).replace(/\.?0+$/, '')}%; }`);
    }
    lines.push(`.row-cols${sfx}-auto > * { flex: 0 0 auto; width: auto; }`);

    for (let i = 0; i <= 12; i++) {
      lines.push(`.order${sfx}-${i} { order: ${i}; }`);
    }
    lines.push(`.order${sfx}-first { order: -1; }`);
    lines.push(`.order${sfx}-last { order: 13; }`);

    const block = lines.join('\n');
    if (minWidth === null) {
      add(`\n/* ── Columns (all widths) ── */\n${block}`);
    } else {
      add(`\n/* ── Columns (${infix}: ≥${minWidth}px) ── */\n@media (min-width: ${minWidth}px) {\n${
        block.split('\n').map(l => '  ' + l).join('\n')
      }\n}`);
    }
  }

  /* ── containers ──
     Deliberately NOT redefining `.container`: SantyCSS has shipped its own
     since long before this grid (640/768/1024 caps, 16px padding), and
     overriding it would silently reflow every existing site. Bootstrap's
     breakpoint-specific containers are additive, so those are safe to add. */
  add(`
/* ── Containers ──
   .container is SantyCSS's existing one and is left untouched.
   These are the breakpoint-specific variants Bootstrap ships. */
.container-fluid,
.container-sm, .container-md, .container-lg, .container-xl, .container-xxl {
  width: 100%;
  padding-right: var(--santy-gutter-x, 24px);
  padding-left: var(--santy-gutter-x, 24px);
  margin-right: auto;
  margin-left: auto;
}`);

  // Each container caps at its own breakpoint and every larger one.
  const CONTAINER_MAX = [['sm', 576, 540], ['md', 768, 720], ['lg', 992, 960], ['xl', 1200, 1140], ['xxl', 1400, 1320]];
  for (const [, min, max] of CONTAINER_MAX) {
    const selectors = [];
    for (const [n2, min2] of CONTAINER_MAX.map(c => [c[0], c[1]])) {
      if (min2 <= min) selectors.push(`.container-${n2}`);
    }
    add(`@media (min-width: ${min}px) {\n  ${selectors.join(',\n  ')} { max-width: ${max}px; }\n}`);
  }

  return out.join('\n');
}

module.exports = { build, BREAKPOINTS, GUTTERS };

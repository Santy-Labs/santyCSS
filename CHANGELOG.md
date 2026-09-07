# Changelog

All notable changes to SantyCSS are documented here.
The full illustrated changelog lives at [santycss.santy.in/changelog.html](https://santycss.santy.in/changelog.html).

## [2.9.3] — 2026-09-06

### Added
- **Class sorting** (`santycss/sort`) — a pure, dependency-free `sortClasses()`
  plus `isSorted()`. Order: unrecognised/component classes first (in their
  original relative order), then utilities grouped by what they affect, then
  variants, breakpoints ascending. Idempotent, and class lists containing
  `${…}` are left untouched because reordering could change what the strings
  concatenate to.
- **Prettier plugin** (`santycss/prettier`) — sorts `class` / `className` /
  `:class` / `ngClass` on format, including `cn()` / `clsx()` argument lists,
  ternaries, template literals and `{ 'class': cond }` keys. Wraps Prettier's
  own parsers rather than replacing them; supports Prettier 2 and 3, and only
  binds the parsers actually installed.
- **Bootstrap 5 migrator** — `npx santycss-migrate --from=bootstrap`. Covers
  Bootstrap's utility API: spacing (with the `$spacer` scale and responsive
  infixes), display, flex, position, typography, theme colours, borders, radius,
  shadows, sizing, overflow and print utilities.
  - The grid (`.row`, `.col-md-6`, `.container`, `.g-*`, `.offset-*`) and
    components sharing a name (`.btn`, `.card`, `.navbar`, …) pass through
    untouched — SantyCSS supports them as-is — and are excluded from the
    unmapped report rather than flagged as outstanding work.
  - Negative margins (`m-n3`) are reported rather than translated: SantyCSS has
    no negative-margin utility, so emitting one would produce a class that does
    not exist.
- New exports: `santycss/sort`, `santycss/prettier`, `santycss/bootstrap-map`,
  and `dist/santy-sort.js` for CDN use.

### Notes
- The VSCode extension already provided classmap-backed completion and CSS-on-hover;
  no changes were needed there.

## [2.9.2] — 2026-09-06


### Fixed — accessibility
- **`prefers-reduced-motion` was missing from most bundles.** The global guard
  lived inside the variants block, so `stripVariantBlocks` removed it from
  `santy-core.css` and `santy-start.css`. In practice that meant the CDN
  drop-in shipped 41 keyframes with no way for a reader to switch them off, and
  `santy-animations.css` shipped 155. Animation that ignores this preference
  can trigger vestibular symptoms (WCAG 2.3.3). The guard now travels with
  every bundle that carries animation.
- **The guard never matched pseudo-elements.** It targeted `*`, which does not
  select `::before` / `::after`, so decorative animations on them kept running.
  Now `*, *::before, *::after`.

### Fixed — progressive enhancement
- **Dynamic viewport units had no fallback.** `.set-height-dvh` emitted only
  `height: 100dvh`, so a browser without `dvh` support dropped the declaration
  and the element ended up with no height — a layout break, not a cosmetic
  downgrade. Every `dvh`/`svh`/`lvh`/`dvw`/`svw`/`lvw` utility now states the
  classic unit first.
- **`color-mix()` had no fallback.** 417 tint/shade utilities resolved to
  nothing on browsers without support, so text could render invisible rather
  than merely off-shade. Each rule now states a precomputed hex first and lets
  `color-mix` override it where available.

### Fixed — correctness
- **Shade utilities generated invalid CSS.** The retention percentage was
  computed as `100 - pct * 10`, producing `0%`, `-100%` and `-200%`:
  `.background-*-shade-100` rendered pure black, and `-200` / `-300` were
  invalid declarations browsers discarded outright. The sibling
  `.border-*-shade-10` rule has always used `90%`, confirming the intended
  formula is `100 - pct`. Shades now darken progressively (90% / 80% / 70%).

## [2.9.1] — 2026-09-06

### Added
- **Plugin API** (`santy.config.json` → `plugins: []`) — `addUtilities`,
  `addComponents`, `addBase`, `addVariant`, `theme()`, `e()`. Nested `&`
  selectors and at-rule keys are supported, camelCase property names are
  converted to kebab-case, and plugin classes are added to
  `santy-classmap.json` so editor IntelliSense picks them up.
  `addVariant` accepts three template shapes: an at-rule wrapper
  (`'@media print { & }'`), an ancestor selector (`'[data-theme="ocean"] &'`)
  and a pseudo-class (`'&:hover'`).
- **`@apply`** — compose utilities into a semantic class via the PostCSS
  plugin. Only unconditional top-level utilities can be inlined, so
  `@apply on-hover:scale-110` emits a warning explaining why rather than
  silently producing nothing. Supports the `!` important suffix.
- **Bootstrap-compatible 12-column grid** — `.row`, `.col-{1-12}`,
  `.col-{sm,md,lg,xl,xxl}-{1-12}`, `.col-auto`, `.offset-*`, `.order-*`
  (incl. `-first` / `-last`), `.row-cols-*`, gutters (`.g-*` / `.gx-*` / `.gy-*`
  via CSS variables, Bootstrap 5 style) and `.container-{fluid,sm,md,lg,xl,xxl}`.
  Breakpoints match Bootstrap 5 (576/768/992/1200/1400).

### Fixed
- The PostCSS plugin discarded the author's own rules: it called
  `root.removeAll()` and replaced the file with purged framework CSS. Authored
  CSS is now re-appended *after* the framework, so it still wins the cascade —
  without this, `@apply` output would have been thrown away.

### Notes
- The grid deliberately does **not** redefine `.container`. SantyCSS has shipped
  its own since well before this release (640/768/1024 caps, 16px padding), and
  overriding it would silently reflow existing sites. Only the additive
  breakpoint-specific containers are introduced.
- The grid's breakpoints are Bootstrap's. SantyCSS utility variants (`md:`,
  `lg:`) keep their own scale and are unchanged.

## [2.9.0] — 2026-09-06

### Added — framework adapters
- **Custom elements** (`santycss/elements`, `dist/santy-elements.js`) —
  `<santy-modal>`, `<santy-drawer>`, `<santy-bottom-sheet>`, `<santy-tabs>`,
  `<santy-dropdown>`, `<santy-theme-toggle>`, `<santy-tooltip>`. One build
  covers React 19+, Vue, Svelte, Angular, Astro and plain HTML. They render
  into the light DOM deliberately: a shadow root would cut SantyCSS utility
  classes off from the content inside.
- **React adapter** (`santycss/react`) — `useModal`, `useDrawer`,
  `useBottomSheet`, `useTheme`, `useToast`, `useDisclosure`, `useSanty`, plus
  `Button`, `Card`, `Modal`, `Alert`, `Badge`, `Prose` and friends. Authored
  with `createElement`, so the package ships as plain JS with no build step.
- **Vue 3 adapter** (`santycss/vue`) — the same composables, `h()`-based
  components, `v-model` support on `<SantyModal>`, and an installable plugin.
- **`cn()`** (`santycss/merge`) — conflict-aware class merging. Composed class
  strings are otherwise resolved by CSS source order rather than argument
  order, so a caller's override silently loses. `cn()` drops the earlier class
  whenever a later one targets the same property, scopes conflicts per variant
  (`md:add-padding-4` never collides with `add-padding-8`), lets transform
  utilities compose, accepts clsx-style arguments, and is extensible via
  `cn.extend()`. Ships with TypeScript declarations.
- React and Vue are declared as **optional** peer dependencies — installing
  `santycss` does not pull either into the tree.

### Added — extended components (MUI / Quasar parity)
- **Data table** — `.data-table` with sticky header, sortable columns
  (`data-sort-type="number|date|text"`, stable sort, blanks always sink),
  pinned first column, row selection with an indeterminate header checkbox,
  expandable detail rows that travel with their parent when sorted, three
  density modes, toolbar/footer, empty and loading states.
- **Combobox / autocomplete / multiselect** — `.combobox` with substring
  filtering and `<mark>` highlighting, removable chips, option groups that hide
  when empty, full keyboard support (Arrow/Enter/Esc, Backspace removes the last
  chip), `aria-activedescendant` roving, and a hidden input so plain form posts work.
- **Text field variants** — `.field-outlined` / `.field-filled` / `.field-standard`
  (MUI TextField parity) with floating labels that ride on `:placeholder-shown`
  (no JS), prefix/suffix adornments, helper text, character counter, and
  validation keyed off `:user-invalid` so fields do not turn red before anyone types.
- **Stepper** — horizontal and vertical, with active/complete/error/disabled
  states and connectors that stop at the dots.
- **Tree view** — built on `<details>`/`<summary>`, so expansion needs no JS.
- **Context menu + cascading submenus** — submenus open on hover *or*
  `:focus-within`, so they are keyboard reachable.
- **Segmented control / toggle button group** — real radio inputs, so keyboard
  and form semantics come free.
- **Pin/OTP input** — auto-advance, Backspace retreat, arrow keys, and a pasted
  code spreads across the boxes; emits `santy:complete`.
- **Number input** with stepper buttons that respect `min`/`max`/`step` and
  re-round to the step's precision.
- **Also**: color picker, time picker, calendar/scheduler, uploader with
  progress and drag-and-drop, skeleton variants (text/circle/rect + wave
  shimmer), snackbar, banner, speed dial, bottom navigation, nav rail,
  virtual-scroll and infinite-scroll scaffolding, loading overlay, backdrop.
- **`.prose`** — long-form typography for CMS/Markdown HTML (the Tailwind
  Typography gap), with `-sm`/`-lg`/`-xl`/`-full` sizes.
- All of the above are token-driven (`--santy-*`), dark-mode aware, and honour
  `prefers-reduced-motion`.
- **`Santy.table`** and **`Santy.combobox`** modules, plus init-time wiring for
  pin inputs, number inputs, uploaders, speed dials and infinite-scroll sentinels.

### Added
- **`santy.js` — the behavior layer.** Zero-dependency, ~50KB, no build step.
  Drives the state classes the CSS already shipped (`.open` / `.active` / `.show`),
  so no existing markup or stylesheet needs to change.
  - Components: modal, drawer/offcanvas, bottom sheet, dropdown, collapse,
    accordion, tabs, tooltip, popover, carousel, toast, theme, scrollspy, ripple.
  - Declarative API via `data-santy-toggle` / `data-santy-target` /
    `data-santy-dismiss`, plus a programmatic `Santy.*` façade.
  - Overlay machinery: focus trap with a nesting stack, focus restore,
    background `inert`, scroll lock with scrollbar-width compensation,
    Esc handling, and backdrop dismissal (`data-santy-backdrop="static"` to opt out).
  - Flip-and-shift positioning engine for dropdowns, popovers and tooltips —
    keeps them on screen and outside `overflow: hidden` ancestors.
  - WAI-ARIA patterns: tabs with roving tabindex + arrow keys, dropdown
    Arrow/Home/End, accordion `aria-expanded`/`aria-controls`, toasts as
    `status` (`alert` for errors), dialog labelling.
  - Cancelable lifecycle events: `santy:show` → `santy:shown` → `santy:hide` → `santy:hidden`.
  - `Santy.theme` persists to localStorage and follows `prefers-color-scheme`
    until the user chooses explicitly.
  - Honours `prefers-reduced-motion` throughout.
  - SSR-safe: importing it without a DOM is a no-op.
- **Behavior-layer CSS** — `.modal-overlay.open`, `.drawer-overlay.open`,
  `.santy-tip`, `.santy-ripple`, toast structure (`.toast-body`, `.toast-title`,
  `.toast-message`, `.toast-action`) and six `.toast-container-*` positions.
  The CSS-only `:target` paths still work untouched.
- **TypeScript declarations** for the runtime (`santy.SantyRuntime`), and
  `require('santycss').js` → path to `dist/santy.js`.
- **New exports** — `santycss/js` and `santycss/behavior`.

### Fixed
- `santy.css` did not include the behavior-layer block, because CSS appended past
  the component marker reached `santy-components.css` but never the full bundle.

### Changed
- CI TypeScript check now runs with `--lib es2015,dom`; the runtime types
  reference `Element`, `HTMLElement` and `IntersectionObserver`.

### Known issues
- `santy.css` is still missing the portfolio/CV/itsme template blocks that
  `santy-components.css` and `santy-start.css` carry — same root cause as the
  fix above, tracked separately to avoid changing the flagship bundle's
  contents in a behavior-layer release.
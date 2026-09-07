# Changelog

All notable changes to SantyCSS are documented here.
The full illustrated changelog lives at [santycss.santy.in/changelog.html](https://santycss.santy.in/changelog.html).

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

## [2.8.0] — 2026-08-17

### Added
- **Configuration system** — optional `santy.config.json` (consumed by `node build.js`
  and the new `npx santycss build` command) with support for:
  - `colors` — extend/override the palette with brand colors (single hex or full shade map)
  - `spacing` / `fontSizes` — extra scale values
  - `breakpoints` — custom responsive prefixes
  - `prefix` — class prefix (e.g. `sty-`) to avoid collisions in legacy codebases
  - `output` — output directory for custom builds
- **`npx santycss build`** — build a customized framework from `santy.config.json`
  without cloning the repo (writes to `./santy-dist` by default).
- **ARIA variants** — `aria-expanded:` `aria-selected:` `aria-checked:` `aria-pressed:`
  `aria-disabled:` `aria-current:` `aria-hidden:` `aria-busy:` `aria-invalid:` plus
  `group-aria-*:` for styling children from an ancestor's ARIA state.
- **RTL/LTR variants** — `rtl:` and `ltr:` prefixes keyed off `<html dir="rtl|ltr">`.
- **Max-width breakpoints** — `max-sm:` `max-md:` `max-lg:` `max-xl:` `max-xxl:`
  (apply *below* the breakpoint, Tailwind-style).
- **TypeScript declarations** — `index.d.ts` for the main entry point and the
  `santy.config.json` shape.
- `LICENSE` (MIT), `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`.
- **CI workflow** — every push/PR now builds, runs the test suite, type-checks the
  declarations, and verifies the committed CSS matches `build.js` output.

### Changed
- npm publish workflow now runs the test suite before publishing.
- CLI starter page and docs pin the CDN to the current major (`santycss@2`).
- `prepublish` script replaced with `prepublishOnly` (build + test).

## [2.7.0] — 2026-07

### Added
- `:has()` parent variants — `has-checked:` `has-focus:` `has-hover:` `has-invalid:`
  and 6 more, plus `group-has-*:`.
- 9 new components: `.toast`, `.switch`, `.checkbox`, `.radio`, `.range`, `.carousel`,
  `.dialog`, `.popover`, `.file-drop` — all with dark-mode styles.
- Semantic theming: 5 prebuilt themes (`ocean`, `sunset`, `forest`, `midnight`, `mono`)
  via `data-theme`, with semantic utilities (`background-surface`, `color-text`, …).
- `npx santycss init` starter scaffold; `santy-classmap.json` (21,000+ classes);
  83-check regression test suite.

### Fixed
- `transition-all` was documented but never generated; templates page Copy Code now
  rewrites local CSS paths to CDN URLs.

## [2.6.1] — 2026-06
- 4 new industry templates (school, salon, eye clinic, brewery).

## [2.6.0] — 2026-06
- Granular module imports (`santycss/css/flex`, `santycss/css/spacing`, …) —
  10 module files with package export subpaths.

## [2.5.1] — 2026-05
- Interactive snippets library (`snippets.html`) with 40+ ready-to-use snippets.

## [2.5.0] — 2026-05
- Three portfolio templates and supporting component classes.

## [2.4.x and earlier]
See [santycss.santy.in/changelog.html](https://santycss.santy.in/changelog.html).

# SantyCSS — LLM System Prompt Reference
> Paste this into Claude / ChatGPT / Cursor to make AI generate SantyCSS instead of Tailwind.

---

## What is SantyCSS?
SantyCSS is a plain-English utility-first CSS framework. Classes read like English sentences.
No build step required (optional build for customization) — just link `santy.css` and use the classes directly.

Install: `npm install santycss`
CDN: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/santycss@2/dist/santy.css">`

---

## Core Naming Conventions

| Pattern | Example | Meaning |
|---|---|---|
| `add-{prop}-{n}` | `add-padding-24` | Additive: border, padding, margin, shadow |
| `make-{val}` | `make-flex`, `make-circle` | Display / behaviour |
| `set-{prop}-{val}` | `set-text-24`, `set-width-320` | Dimension / size setter |
| `pin-{side}-{n}` | `pin-top-0`, `pin-center` | Absolute / fixed positioning |
| `{state}:{class}` | `on-hover:scale-110`, `md:grid-cols-3` | State / responsive prefix |

---

## Layout

```
make-flex          flex-row          flex-column        flex-wrap
make-grid          make-block        make-inline         make-hidden
align-center       align-start       align-end           align-stretch
justify-center     justify-between   justify-around      justify-end
grid-cols-1 … grid-cols-12
gap-{n}            gap-x-{n}         gap-y-{n}           (n = 0–200)
```

## Spacing (n = 0–200px)

```
add-padding-{n}           add-padding-x-{n}      add-padding-y-{n}
add-padding-top-{n}       add-padding-bottom-{n}
add-padding-left-{n}      add-padding-right-{n}
add-margin-{n}            add-margin-x-{n}       add-margin-y-{n}
add-margin-top-{n}        add-margin-bottom-{n}
add-margin-left-{n}       add-margin-right-{n}
```

## Sizing

```
set-width-{n}     set-height-{n}     set-min-width-{n}   set-max-width-{n}
set-width-full    set-width-screen   set-height-screen    set-height-full
set-text-{n}      (8–144px)
```

## Colors — 20 families × 10 shades (50–950)

Families: `blue red green yellow purple pink orange gray indigo cyan teal rose violet emerald amber lime sky slate zinc neutral stone`

```
color-{name}-{shade}            /* text color   */
background-{name}-{shade}       /* bg color     */
border-color-{name}-{shade}     /* border color */
color-white   color-black   background-white   background-transparent
```

## Borders

```
add-border-{n}               /* all sides, n = 1–8 */
add-border-top-{n}           add-border-bottom-{n}
add-border-left-{n}          add-border-right-{n}
border-color-{name}-{shade}
round-corners-{n}            /* border-radius, n = 0–48 */
make-circle                  make-pill
```

## Shadows

```
add-shadow-sm    add-shadow-md    add-shadow-lg    add-shadow-xl    add-shadow-none
ring-offset-1    ring-offset-2    ring-offset-4
```

## Typography

```
text-bold   text-semibold   text-medium   text-light   text-thin   text-normal
text-italic   text-underline   text-strikethrough   text-no-decoration
text-center   text-left   text-right   text-justify
text-uppercase   text-lowercase   text-capitalize
line-height-tight   line-height-normal   line-height-relaxed   line-height-loose
letter-space-tight   letter-space-normal   letter-space-wide
```

## Positioning

```
position-relative   position-absolute   position-fixed   position-sticky
pin-top-{n}   pin-bottom-{n}   pin-left-{n}   pin-right-{n}   pin-center
z-0   z-10   z-20   z-30   z-40   z-50   z-100   z-auto
```

## Object / Aspect Ratio

```
object-fit-cover     object-fit-contain    object-fit-fill     object-fit-none
object-position-center   object-position-top   object-position-bottom
aspect-ratio-16-9    aspect-ratio-1-1    aspect-ratio-4-3
aspect-square        aspect-video
```

## Overflow / Display

```
overflow-hidden    overflow-auto    overflow-x-auto    overflow-y-auto    overflow-scroll
cursor-pointer    cursor-default    cursor-not-allowed    cursor-wait    cursor-grab
pointer-events-none    pointer-events-auto
user-select-none    user-select-text
```

## Transitions & Transforms

```
transition-all    transition-colors    transition-opacity    transition-transform
scale-90   scale-95   scale-100   scale-105   scale-110   scale-125   scale-150
rotate-45   rotate-90   rotate-180   rotate-270
translate-x-{n}   translate-y-{n}
opacity-0   opacity-25   opacity-50   opacity-75   opacity-100
```

## State Variants

```
on-hover:{class}       on-focus:{class}       on-active:{class}
dark:{class}           group-hover:{class}    peer-hover:{class}
peer-checked:{class}   on-visited:{class}
has-checked:{class}    has-focus:{class}      has-invalid:{class}   (parent :has() — v2.7.0)
has-hover:{class}      has-disabled:{class}   group-has-checked:{class}
```

## Responsive Breakpoints

```
sm:{class}   (640px+)
md:{class}   (768px+)
lg:{class}   (1024px+)
xl:{class}   (1280px+)
on-mobile:{class}    (max 767px)
on-tablet:{class}    (768–1023px)
on-desktop:{class}   (1024px+)
```

## Animations

```
animate-fade-in          animate-fade-out
animate-slide-up         animate-slide-down     animate-slide-left    animate-slide-right
animate-zoom-in          animate-zoom-out
animate-bounce           animate-spin           animate-pulse
animate-flip-in-x        animate-flip-in-y
animate-bounce-in-down   animate-bounce-in-up
animate-rotate-in        animate-swing
animate-heartbeat        animate-shake          animate-wobble         animate-jello
```

## Gradients & Color Stops

```
gradient-to-right   gradient-to-left   gradient-to-bottom   gradient-to-top
gradient-to-br      gradient-to-bl      gradient-to-tr       gradient-to-tl
from-{color}-{shade}    /* sets --grad-from */
to-{color}-{shade}      /* sets --grad-to   */
```

## CSS Design Tokens (override to brand the whole UI)

```css
:root {
  --santy-primary:    #3b82f6;
  --santy-secondary:  #8b5cf6;
  --santy-accent:     #10b981;
  --santy-radius:     0.5rem;
  --santy-font:       'Inter', system-ui, sans-serif;
}
```

## Components

```
.btn   .btn-primary   .btn-secondary   .btn-outline   .btn-ghost   .btn-danger
.btn-sm   .btn-lg
.card   .card-header   .card-body   .card-footer
.badge   .badge-primary   .badge-success   .badge-warning   .badge-danger
.alert   .alert-success   .alert-warning   .alert-danger   .alert-info
.input   .input-error
.avatar   .avatar-sm   .avatar-lg   .avatar-xl
.spinner   .spinner-sm   .spinner-lg
.skeleton
.progress   .progress-bar
.navbar   .navbar-brand   .navbar-link
.dropdown   .dropdown-menu   .dropdown-item
.modal   .modal-header   .modal-body   .modal-footer
.accordion   .accordion-item   .accordion-header   .accordion-body
.table   .table-striped   .table-bordered
.tooltip   .tooltip-top   .tooltip-bottom   .tooltip-left   .tooltip-right
.drawer   .drawer-panel
.steps   .step   .step-dot   .step-label
.pagination   .page-link   .page-item
.notification   .notification-success   .notification-warning   .notification-danger
.toast   .toast-container   .toast-success/error/warning/info   .toast-close
.switch  .switch-slider   .switch-sm   .switch-lg
.checkbox   .radio          (custom-styled inputs)
.range   .range-sm   .range-lg
.carousel   .carousel-item   .carousel-dots   .carousel-dot
.dialog   .dialog-header   .dialog-body   .dialog-footer     (native <dialog>)
.popover                                                      (native Popover API)
.file-drop
```

## Behavior Layer — santy.js (v2.9.0)

Components are styled by CSS but driven by `santy.js`. Load it once:

```html
<script src="https://cdn.jsdelivr.net/npm/santycss@2/dist/santy.js" defer></script>
```

Then use data attributes — never hand-write toggle JavaScript:

```
data-santy-toggle="modal|drawer|offcanvas|bottom-sheet|dropdown|collapse|accordion|tab|popover"
data-santy-target="#id"          /* what the toggle controls        */
data-santy-dismiss               /* closes nearest overlay (or ="#id") */
data-santy-theme-toggle          /* light/dark toggle, persisted     */
data-santy-tooltip="text"        /* collision-aware tooltip          */
data-santy-placement="top|bottom|left|right|bottom-start|bottom-end|…"
data-santy-ripple                /* Material press feedback          */
data-santy-scrollspy             /* on a <nav> of #anchor links      */
data-santy-carousel              /* + data-santy-interval="5000"     */
data-santy-carousel-prev="#sel"  data-santy-carousel-next="#sel"
data-santy-backdrop="static"     /* backdrop click will not close    */
data-santy-keyboard="false"      /* Esc will not close               */
data-santy-multi="true"          /* on .accordion: allow many open   */
data-santy-autofocus             /* element to focus when opened     */
```

Programmatic API:

```js
Santy.modal.open('#confirm');    Santy.modal.close('#confirm');
Santy.drawer.toggle('#nav');     Santy.dropdown.closeAll();
Santy.tabs.show('#tab-2');       Santy.collapse.toggle('#panel');
Santy.carousel.next('#slides');  Santy.scrollspy('#toc');
Santy.toast('Saved');
Santy.toast.success('Done', { title: 'Upload', duration: 6000,
                              action: { label: 'Undo', onClick: undo } });
Santy.theme.get() / .set('dark') / .toggle() / .system();
Santy.init(container);           // re-scan after injecting markup
```

Lifecycle events (cancelable — `preventDefault()` vetoes the transition):
`santy:show` → `santy:shown` → `santy:hide` → `santy:hidden`

### Example: modal wired with zero custom JS

```html
<button class="btn btn-danger" data-santy-toggle="modal" data-santy-target="#confirm">
  Delete
</button>

<div class="modal-overlay" id="confirm">
  <div class="modal-box add-padding-24">
    <h3 class="modal-title set-text-20 text-bold">Delete this project?</h3>
    <p class="set-text-14 color-text-muted line-height-relaxed">This cannot be undone.</p>
    <div class="modal-footer make-flex gap-12 justify-end">
      <button class="btn btn-ghost" data-santy-dismiss>Cancel</button>
      <button class="btn btn-danger" data-santy-autofocus>Delete</button>
    </div>
  </div>
</div>
```

Focus trap, focus restore, `inert` background, scroll lock, Esc and backdrop
click are all handled. Do not add your own `classList.toggle('open')` handlers.

## Extended Components (v2.9.0 — MUI / Quasar parity)

```
.data-table   .data-table-wrap   .data-table-toolbar   .data-table-footer
.data-table-compact/-relaxed/-striped/-bordered/-pin-first
.data-table-select   .data-table-detail   .data-table-row-toggle   .data-table-empty
   → sortable: <th data-sort-type="number|date|text">; cells may carry data-sort-value

.combobox   .combobox-control   .combobox-input   .combobox-toggle
.combobox-list   .combobox-option   .combobox-option-label   .combobox-option-desc
.combobox-chip   .combobox-chip-remove   .combobox-group-label   .combobox-empty
   → data-santy-multiple="true" for chips/multiselect

.field   .field-box   .field-input   .field-label   .field-help   .field-counter
.field-outlined   .field-filled   .field-standard   .field-sm/-lg
.field-prefix   .field-suffix   .field-has-prefix   .field-has-suffix   .field-error
   → floating label needs placeholder=" " on the input (rides :placeholder-shown)

.stepper   .stepper-item   .stepper-dot   .stepper-label   .stepper-desc
.stepper-vertical   .stepper-mobile-stack     states: .active .complete .error .disabled

.tree   .tree-item   .tree-node   .tree-caret   .tree-icon   .tree-label   .tree-leaf
   → wrap children in <details><summary class="tree-node">; no JS needed

.context-menu   .context-menu-item   .context-menu-icon   .context-menu-shortcut
.context-menu-divider   .context-menu-label   .context-menu-item-danger
.menu-sub   .menu-sub-list   .menu-sub-left

.segmented   .segmented-item   .segmented-label   .segmented-sm/-lg/-full
.toggle-group   .toggle-group-vertical        (radio inputs inside .segmented-item)

.pin-input   .pin-digit   .pin-separator   .pin-input-sm/-lg/-error
.number-input   .number-input-field   .number-input-btn   (data-santy-step="down")
.color-picker  .color-swatch-grid  .color-swatch  .color-input  .color-picker-chip
.time-picker   .time-column   .time-option   .time-picker-footer
.calendar  .calendar-header  .calendar-weekdays  .calendar-grid  .calendar-cell
.calendar-date  .calendar-event(-success/-danger/-warning)  .calendar-compact
.uploader  .uploader-icon  .upload-list  .upload-item  .upload-progress-bar  .upload-remove
.skeleton-text  .skeleton-title  .skeleton-circle  .skeleton-rect  .skeleton-wave
.snackbar  .snackbar-message  .snackbar-action  .snackbar-left/-right
.banner  .banner-icon  .banner-body  .banner-actions  .banner-info/-success/-warning/-danger
.speed-dial  .speed-dial-actions  .speed-dial-action  .speed-dial-action-label
.bottom-nav  .bottom-nav-item  .bottom-nav-icon  .nav-rail  .nav-rail-item  .nav-rail-wide
.virtual-scroll  .infinite-sentinel  .infinite-loader
.loading-overlay  .backdrop  .backdrop-blur
.prose  .prose-sm  .prose-lg  .prose-xl  .prose-full   /* long-form CMS/Markdown HTML */
```

New JS modules: `Santy.table.sort(th)`, `Santy.table.selectAll(cb)`,
`Santy.combobox.open/close/filter/value`.
Events: `santy:sort`/`santy:sorted`, `santy:select`, `santy:change`,
`santy:complete` (pin), `santy:files` (uploader), `santy:loadmore` (infinite scroll).

## Semantic Theme Utilities (v2.7.0 — flip with data-theme / .dark)

```
background-surface   background-surface-alt   background-surface-raised
background-primary   background-secondary     background-accent
color-text           color-text-muted         color-primary   color-secondary
border-color-default border-color-primary
```
Prebuilt themes (santy-themes.css): <html data-theme="ocean|sunset|forest|midnight|mono">

## Email Module (santycss/css/email)

```
.email-wrapper       .email-container      .email-body-wrap
.email-header        .email-header-light   .email-footer
.email-hero          .email-hero-light     .email-hero-gradient
.email-h1/h2/h3      .email-p              .email-p-lead        .email-link
.email-btn           .email-btn-sm/lg/outline/dark/success/danger/warning
.email-card          .email-callout-success/warning/danger
.email-list          .email-check-list
.email-badge-blue/green/red/yellow/purple/gray/new
.email-stat-value    .email-stat-label
.email-spacer-4/8/16/24/32/48/64
.email-preheader     .email-unsubscribe    .email-legal
```

---

## Example: Card with blue left border and hover scale

```html
<div class="card add-padding-28 background-white round-corners-12 add-shadow-md add-border-left-4 border-color-blue-500 on-hover:scale-105 transition-all cursor-pointer">
  <h3 class="set-text-20 text-bold color-gray-900 add-margin-bottom-8">Card Title</h3>
  <p class="set-text-14 color-gray-500 line-height-relaxed">Card description goes here.</p>
</div>
```

## Example: Responsive flex hero

```html
<section class="make-flex flex-column align-center justify-center text-center add-padding-y-80 background-gray-50">
  <h1 class="set-text-56 text-bold color-gray-900 add-margin-bottom-16 md:set-text-40 on-mobile:set-text-32">
    Build faster
  </h1>
  <p class="set-text-20 color-gray-500 line-height-relaxed add-margin-bottom-32">
    Plain-English CSS that reads like you wrote it.
  </p>
  <a href="#" class="btn btn-primary btn-lg on-hover:scale-105 transition-all">Get started →</a>
</section>
```

## Example: Dark-mode card grid

```html
<div class="make-grid grid-cols-3 gap-24 on-mobile:grid-cols-1 md:grid-cols-2">
  <div class="card background-white dark:background-gray-800 add-shadow-sm on-hover:add-shadow-lg transition-all round-corners-16 add-padding-24">
    <span class="badge badge-primary add-margin-bottom-12">New</span>
    <h4 class="set-text-18 text-semibold color-gray-900 dark:color-white">Feature</h4>
    <p class="set-text-14 color-gray-500 dark:color-gray-400 line-height-relaxed">Description.</p>
  </div>
</div>
```

---

*Generated from SantyCSS v2.7.0 · https://santycss.santy.in · https://github.com/ChintuSanty/santyCSS*

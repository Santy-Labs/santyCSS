'use strict';
/**
 * SantyCSS class data — generates all ~5,100+ class names with their
 * CSS descriptions for autocomplete and hover documentation.
 */

const COLORS = ['blue','red','green','yellow','purple','pink','orange','gray','indigo','cyan',
  'teal','rose','violet','emerald','amber','lime','sky','slate','zinc','neutral'];
const SHADES = [50,100,200,300,400,500,600,700,800,900,950];

const SPACING = [
  0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,
  31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,
  52,56,60,64,68,72,76,80,84,88,92,96,100,104,108,112,116,120,124,128,132,136,140,144,
  148,152,156,160,164,168,172,176,180,184,188,192,196,200,
  256,320,384,448,512,640,768,1024
];

const TEXT_SIZES = [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,
  32,34,36,38,40,42,44,46,48,52,56,60,64,72,80,96,112,128,144];

// ─── Static class definitions ──────────────────────────────────────────────
const STATIC = [
  // Display & layout
  { name:'make-flex',              css:'display: flex',                                   doc:'Flex container' },
  { name:'make-inline-flex',       css:'display: inline-flex',                            doc:'Inline flex container' },
  { name:'make-grid',              css:'display: grid',                                   doc:'Grid container' },
  { name:'make-block',             css:'display: block',                                  doc:'Block element' },
  { name:'make-inline',            css:'display: inline',                                 doc:'Inline element' },
  { name:'make-inline-block',      css:'display: inline-block',                           doc:'Inline-block element' },
  { name:'make-hidden',            css:'display: none',                                   doc:'Hide element' },
  { name:'make-contents',          css:'display: contents',                               doc:'Display contents' },
  { name:'make-relative',          css:'position: relative',                              doc:'Relative positioning' },
  { name:'make-absolute',          css:'position: absolute',                              doc:'Absolute positioning' },
  { name:'make-fixed',             css:'position: fixed',                                 doc:'Fixed positioning' },
  { name:'make-sticky',            css:'position: sticky; top: 0',                        doc:'Sticky positioning (sticks to top)' },
  { name:'make-circle',            css:'border-radius: 9999px',                           doc:'Circular shape (combine with equal width/height)' },
  { name:'make-pill',              css:'border-radius: 9999px',                           doc:'Pill/rounded shape' },
  { name:'make-container',         css:'width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 16px', doc:'Centered container with max-width' },
  { name:'make-full-width',        css:'width: 100%',                                     doc:'Full width element' },
  { name:'make-truncate',          css:'overflow: hidden; text-overflow: ellipsis; white-space: nowrap', doc:'Truncate text with ellipsis' },
  { name:'container',              css:'width: 100%; max-width: 1200px; margin: 0 auto',  doc:'Centered responsive container' },

  // Flex direction & wrap
  { name:'flex-row',               css:'flex-direction: row',                             doc:'Flex items in a row (default)' },
  { name:'flex-column',            css:'flex-direction: column',                          doc:'Flex items in a column' },
  { name:'flex-row-reverse',       css:'flex-direction: row-reverse',                     doc:'Reverse row direction' },
  { name:'flex-column-reverse',    css:'flex-direction: column-reverse',                  doc:'Reverse column direction' },
  { name:'flex-wrap',              css:'flex-wrap: wrap',                                 doc:'Allow flex items to wrap' },
  { name:'flex-nowrap',            css:'flex-wrap: nowrap',                               doc:'Prevent flex wrapping' },
  { name:'flex-1',                 css:'flex: 1 1 0%',                                   doc:'Flex grow and shrink equally' },
  { name:'flex-auto',              css:'flex: 1 1 auto',                                  doc:'Flex auto sizing' },
  { name:'flex-none',              css:'flex: none',                                      doc:'Prevent flex sizing' },

  // Alignment
  { name:'align-center',           css:'align-items: center',                             doc:'Align cross-axis: center' },
  { name:'align-start',            css:'align-items: flex-start',                         doc:'Align cross-axis: start' },
  { name:'align-end',              css:'align-items: flex-end',                           doc:'Align cross-axis: end' },
  { name:'align-stretch',          css:'align-items: stretch',                            doc:'Align cross-axis: stretch (default)' },
  { name:'align-baseline',         css:'align-items: baseline',                           doc:'Align cross-axis: baseline' },
  { name:'justify-center',         css:'justify-content: center',                         doc:'Justify main-axis: center' },
  { name:'justify-between',        css:'justify-content: space-between',                  doc:'Justify main-axis: space-between' },
  { name:'justify-around',         css:'justify-content: space-around',                   doc:'Justify main-axis: space-around' },
  { name:'justify-evenly',         css:'justify-content: space-evenly',                   doc:'Justify main-axis: space-evenly' },
  { name:'justify-start',          css:'justify-content: flex-start',                     doc:'Justify main-axis: start' },
  { name:'justify-end',            css:'justify-content: flex-end',                       doc:'Justify main-axis: end' },
  { name:'self-center',            css:'align-self: center',                              doc:'Align this item: center' },
  { name:'self-start',             css:'align-self: flex-start',                          doc:'Align this item: start' },
  { name:'self-end',               css:'align-self: flex-end',                            doc:'Align this item: end' },
  { name:'self-stretch',           css:'align-self: stretch',                             doc:'Align this item: stretch' },

  // Grid columns
  ...Array.from({length:12},(_,i)=>({ name:`grid-cols-${i+1}`, css:`grid-template-columns: repeat(${i+1}, minmax(0, 1fr))`, doc:`${i+1}-column grid` })),
  ...Array.from({length:12},(_,i)=>({ name:`col-span-${i+1}`,  css:`grid-column: span ${i+1} / span ${i+1}`,               doc:`Span ${i+1} grid columns` })),
  ...Array.from({length:6}, (_,i)=>({ name:`grid-rows-${i+1}`, css:`grid-template-rows: repeat(${i+1}, minmax(0, 1fr))`,    doc:`${i+1}-row grid` })),
  { name:'grid-cols-auto',     css:'grid-template-columns: auto',              doc:'Auto columns' },
  { name:'grid-auto-fit-min-200', css:'grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))', doc:'Auto-fit grid, min 200px per column' },
  { name:'grid-auto-fit-min-280', css:'grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))', doc:'Auto-fit grid, min 280px per column' },
  { name:'grid-cols-subgrid',  css:'grid-template-columns: subgrid',           doc:'Inherit parent grid columns (subgrid)' },

  // Typography
  { name:'text-bold',          css:'font-weight: 700',         doc:'Bold text' },
  { name:'text-semibold',      css:'font-weight: 600',         doc:'Semibold text' },
  { name:'text-medium',        css:'font-weight: 500',         doc:'Medium weight text' },
  { name:'text-regular',       css:'font-weight: 400',         doc:'Regular weight text' },
  { name:'text-light',         css:'font-weight: 300',         doc:'Light weight text' },
  { name:'text-thin',          css:'font-weight: 100',         doc:'Thin weight text' },
  { name:'text-center',        css:'text-align: center',       doc:'Center-align text' },
  { name:'text-left',          css:'text-align: left',         doc:'Left-align text' },
  { name:'text-right',         css:'text-align: right',        doc:'Right-align text' },
  { name:'text-justify',       css:'text-align: justify',      doc:'Justify text' },
  { name:'text-uppercase',     css:'text-transform: uppercase',doc:'Uppercase text' },
  { name:'text-lowercase',     css:'text-transform: lowercase',doc:'Lowercase text' },
  { name:'text-capitalize',    css:'text-transform: capitalize',doc:'Capitalize text' },
  { name:'text-italic',        css:'font-style: italic',       doc:'Italic text' },
  { name:'text-no-decoration', css:'text-decoration: none',    doc:'Remove text decoration' },
  { name:'text-underline',     css:'text-decoration: underline',doc:'Underline text' },
  { name:'text-strikethrough', css:'text-decoration: line-through', doc:'Strikethrough text' },
  { name:'text-nowrap',        css:'white-space: nowrap',      doc:'Prevent text wrapping' },
  { name:'text-balance',       css:'text-wrap: balance',       doc:'Balance text wrapping (CSS text-wrap: balance)' },
  { name:'text-pretty',        css:'text-wrap: pretty',        doc:'Prettier text wrapping (CSS text-wrap: pretty)' },
  { name:'text-clamp-1',       css:'-webkit-line-clamp: 1; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical', doc:'Truncate to 1 line' },
  { name:'text-clamp-2',       css:'-webkit-line-clamp: 2; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical', doc:'Truncate to 2 lines' },
  { name:'text-clamp-3',       css:'-webkit-line-clamp: 3; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical', doc:'Truncate to 3 lines' },
  { name:'text-fluid-sm',      css:'font-size: clamp(0.875rem, 1.5vw, 1rem)',    doc:'Fluid small text (clamp)' },
  { name:'text-fluid-md',      css:'font-size: clamp(1rem, 2vw, 1.25rem)',       doc:'Fluid medium text (clamp)' },
  { name:'text-fluid-lg',      css:'font-size: clamp(1.25rem, 3vw, 1.75rem)',    doc:'Fluid large text (clamp)' },
  { name:'text-fluid-xl',      css:'font-size: clamp(1.5rem, 4vw, 2.25rem)',     doc:'Fluid XL text (clamp)' },
  { name:'text-fluid-hero',    css:'font-size: clamp(2rem, 6vw, 4rem)',           doc:'Fluid hero heading (clamp)' },
  { name:'line-height-tight',  css:'line-height: 1.25',        doc:'Tight line height' },
  { name:'line-height-snug',   css:'line-height: 1.375',       doc:'Snug line height' },
  { name:'line-height-normal', css:'line-height: 1.5',         doc:'Normal line height' },
  { name:'line-height-relaxed',css:'line-height: 1.625',       doc:'Relaxed line height' },
  { name:'line-height-loose',  css:'line-height: 2',           doc:'Loose line height' },
  { name:'letter-space-tight', css:'letter-spacing: -0.05em',  doc:'Tight letter spacing' },
  { name:'letter-space-normal',css:'letter-spacing: 0',        doc:'Normal letter spacing' },
  { name:'letter-space-wide',  css:'letter-spacing: 0.05em',   doc:'Wide letter spacing' },
  { name:'letter-space-wider', css:'letter-spacing: 0.1em',    doc:'Wider letter spacing' },
  { name:'drop-cap',           css:'::first-letter { font-size: 3em; float: left; line-height: 1; margin-right: 0.1em; }', doc:'Drop cap first letter' },
  { name:'font-tabular-nums',  css:'font-variant-numeric: tabular-nums', doc:'Monospace/tabular numbers' },

  // Borders
  { name:'add-border-0',       css:'border: none',             doc:'Remove all borders' },
  { name:'make-border-dashed', css:'border-style: dashed',     doc:'Dashed border style' },
  { name:'make-border-dotted', css:'border-style: dotted',     doc:'Dotted border style' },
  { name:'make-border-solid',  css:'border-style: solid',      doc:'Solid border style (default)' },

  // Overflow
  { name:'overflow-hidden',    css:'overflow: hidden',         doc:'Hide overflow content' },
  { name:'overflow-auto',      css:'overflow: auto',           doc:'Auto scrollbar for overflow' },
  { name:'overflow-scroll',    css:'overflow: scroll',         doc:'Always show scrollbar' },
  { name:'overflow-visible',   css:'overflow: visible',        doc:'Show overflow content (default)' },
  { name:'overflow-x-auto',    css:'overflow-x: auto',         doc:'Horizontal scroll' },
  { name:'overflow-y-auto',    css:'overflow-y: auto',         doc:'Vertical scroll' },
  { name:'overflow-x-hidden',  css:'overflow-x: hidden',       doc:'Hide horizontal overflow' },
  { name:'overflow-y-hidden',  css:'overflow-y: hidden',       doc:'Hide vertical overflow' },
  { name:'overscroll-contain', css:'overscroll-behavior: contain', doc:'Contain scroll chaining' },

  // Scroll snap
  { name:'scroll-smooth',      css:'scroll-behavior: smooth',  doc:'Smooth scrolling' },
  { name:'scroll-snap-x',      css:'scroll-snap-type: x mandatory; overflow-x: scroll', doc:'Horizontal scroll snap' },
  { name:'scroll-snap-y',      css:'scroll-snap-type: y mandatory; overflow-y: scroll', doc:'Vertical scroll snap' },
  { name:'scroll-snap-center', css:'scroll-snap-align: center', doc:'Snap align: center' },
  { name:'scroll-snap-start',  css:'scroll-snap-align: start',  doc:'Snap align: start' },

  // Sizing
  { name:'set-width-full',     css:'width: 100%',              doc:'Full width' },
  { name:'set-width-screen',   css:'width: 100vw',             doc:'Viewport width' },
  { name:'set-width-fit',      css:'width: fit-content',       doc:'Fit content width' },
  { name:'set-width-min',      css:'width: min-content',       doc:'Min content width' },
  { name:'set-width-max',      css:'width: max-content',       doc:'Max content width' },
  { name:'set-height-full',    css:'height: 100%',             doc:'Full height' },
  { name:'set-height-screen',  css:'height: 100vh',            doc:'Viewport height' },
  { name:'set-height-dvh',     css:'height: 100dvh',           doc:'Dynamic viewport height (mobile-friendly)' },
  { name:'set-height-svh',     css:'height: 100svh',           doc:'Small viewport height' },
  { name:'set-height-lvh',     css:'height: 100lvh',           doc:'Large viewport height' },
  { name:'set-height-fit',     css:'height: fit-content',      doc:'Fit content height' },
  { name:'set-min-height-screen', css:'min-height: 100vh',     doc:'Minimum 100vh height' },
  { name:'set-min-height-dvh',    css:'min-height: 100dvh',    doc:'Minimum dynamic viewport height' },

  // Shadows
  { name:'add-shadow-none',    css:'box-shadow: none',                                      doc:'Remove shadow' },
  { name:'add-shadow-sm',      css:'box-shadow: 0 1px 3px rgba(0,0,0,.1)',                  doc:'Small shadow' },
  { name:'add-shadow-md',      css:'box-shadow: 0 4px 12px rgba(0,0,0,.1)',                  doc:'Medium shadow' },
  { name:'add-shadow-lg',      css:'box-shadow: 0 8px 24px rgba(0,0,0,.12)',                 doc:'Large shadow' },
  { name:'add-shadow-xl',      css:'box-shadow: 0 16px 48px rgba(0,0,0,.15)',                doc:'Extra large shadow' },
  { name:'add-shadow-2xl',     css:'box-shadow: 0 24px 64px rgba(0,0,0,.18)',                doc:'2XL shadow' },
  { name:'add-shadow-inner',   css:'box-shadow: inset 0 2px 6px rgba(0,0,0,.1)',             doc:'Inner/inset shadow' },
  { name:'add-text-shadow-sm', css:'text-shadow: 0 1px 3px rgba(0,0,0,.3)',                  doc:'Small text shadow' },
  { name:'add-text-shadow-md', css:'text-shadow: 0 2px 8px rgba(0,0,0,.4)',                  doc:'Medium text shadow' },
  { name:'add-text-shadow-lg', css:'text-shadow: 0 4px 16px rgba(0,0,0,.5)',                 doc:'Large text shadow' },

  // Opacity
  ...Array.from({length:11}, (_,i) => ({
    name: `opacity-${i*10}`,
    css:  `opacity: ${(i*10)/100}`,
    doc:  `${i*10}% opacity`
  })),

  // Transitions
  { name:'transition-all',       css:'transition: all 0.2s ease',           doc:'Transition all properties (0.2s)' },
  { name:'transition-colors',    css:'transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease', doc:'Transition colors (0.2s)' },
  { name:'transition-transform', css:'transition: transform 0.2s ease',     doc:'Transition transform (0.2s)' },
  { name:'transition-opacity',   css:'transition: opacity 0.2s ease',       doc:'Transition opacity (0.2s)' },
  { name:'transition-normal',    css:'transition: all 0.3s ease',           doc:'Normal transition (0.3s)' },
  { name:'transition-slow',      css:'transition: all 0.5s ease',           doc:'Slow transition (0.5s)' },
  { name:'transition-none',      css:'transition: none',                    doc:'Disable transitions' },
  { name:'will-change-transform',css:'will-change: transform',              doc:'Hint browser to optimise transforms' },
  { name:'will-change-auto',     css:'will-change: auto',                   doc:'Reset will-change' },

  // Transforms
  { name:'scale-90',   css:'transform: scale(0.9)',   doc:'Scale to 90%' },
  { name:'scale-95',   css:'transform: scale(0.95)',  doc:'Scale to 95%' },
  { name:'scale-100',  css:'transform: scale(1)',     doc:'Scale to 100% (normal)' },
  { name:'scale-105',  css:'transform: scale(1.05)',  doc:'Scale to 105%' },
  { name:'scale-110',  css:'transform: scale(1.10)',  doc:'Scale to 110%' },
  { name:'scale-125',  css:'transform: scale(1.25)',  doc:'Scale to 125%' },
  { name:'rotate-45',  css:'transform: rotate(45deg)', doc:'Rotate 45°' },
  { name:'rotate-90',  css:'transform: rotate(90deg)', doc:'Rotate 90°' },
  { name:'rotate-180', css:'transform: rotate(180deg)',doc:'Rotate 180°' },
  { name:'-rotate-45', css:'transform: rotate(-45deg)',doc:'Rotate -45°' },
  { name:'-rotate-90', css:'transform: rotate(-90deg)',doc:'Rotate -90°' },

  // Cursor
  { name:'cursor-pointer',     css:'cursor: pointer',       doc:'Pointer cursor (hand)' },
  { name:'cursor-default',     css:'cursor: default',       doc:'Default cursor (arrow)' },
  { name:'cursor-not-allowed', css:'cursor: not-allowed',   doc:'Not-allowed cursor' },
  { name:'cursor-grab',        css:'cursor: grab',          doc:'Grab cursor' },
  { name:'cursor-grabbing',    css:'cursor: grabbing',      doc:'Grabbing cursor' },
  { name:'cursor-crosshair',   css:'cursor: crosshair',     doc:'Crosshair cursor' },
  { name:'cursor-text',        css:'cursor: text',          doc:'Text cursor' },
  { name:'cursor-cell',        css:'cursor: cell',          doc:'Cell cursor' },
  { name:'cursor-copy',        css:'cursor: copy',          doc:'Copy cursor' },
  { name:'cursor-move',        css:'cursor: move',          doc:'Move cursor' },
  { name:'cursor-zoom-in',     css:'cursor: zoom-in',       doc:'Zoom-in cursor' },
  { name:'cursor-zoom-out',    css:'cursor: zoom-out',      doc:'Zoom-out cursor' },
  { name:'cursor-help',        css:'cursor: help',          doc:'Help cursor (?)' },
  { name:'cursor-wait',        css:'cursor: wait',          doc:'Wait cursor (spinner)' },
  { name:'cursor-resize-ns',   css:'cursor: ns-resize',     doc:'North-south resize cursor' },
  { name:'cursor-resize-ew',   css:'cursor: ew-resize',     doc:'East-west resize cursor' },

  // Select & pointer
  { name:'select-none',        css:'user-select: none',       doc:'Disable text selection' },
  { name:'select-text',        css:'user-select: text',       doc:'Allow text selection' },
  { name:'select-all',         css:'user-select: all',        doc:'Select all on click' },
  { name:'pointer-events-none',css:'pointer-events: none',    doc:'Disable mouse events' },
  { name:'pointer-events-auto',css:'pointer-events: auto',    doc:'Enable mouse events (default)' },
  { name:'touch-none',         css:'touch-action: none',      doc:'Disable touch gestures' },
  { name:'touch-pan-x',        css:'touch-action: pan-x',     doc:'Horizontal touch pan only' },
  { name:'touch-pan-y',        css:'touch-action: pan-y',     doc:'Vertical touch pan only' },
  { name:'touch-manipulation', css:'touch-action: manipulation',doc:'Touch manipulation (no double-tap zoom)' },

  // Z-index
  { name:'z-0',         css:'z-index: 0',     doc:'z-index: 0' },
  { name:'z-10',        css:'z-index: 10',    doc:'z-index: 10' },
  { name:'z-20',        css:'z-index: 20',    doc:'z-index: 20' },
  { name:'z-30',        css:'z-index: 30',    doc:'z-index: 30' },
  { name:'z-50',        css:'z-index: 50',    doc:'z-index: 50' },
  { name:'z-modal',     css:'z-index: 400',   doc:'z-index for modals (400)' },
  { name:'z-dropdown',  css:'z-index: 500',   doc:'z-index for dropdowns (500)' },
  { name:'z-tooltip',   css:'z-index: 600',   doc:'z-index for tooltips (600)' },
  { name:'z-toast',     css:'z-index: 700',   doc:'z-index for toasts/notifications (700)' },
  { name:'z-auto',      css:'z-index: auto',  doc:'z-index: auto' },
  { name:'isolate',     css:'isolation: isolate', doc:'Create new stacking context' },

  // Aspect ratio
  { name:'aspect-square', css:'aspect-ratio: 1 / 1',   doc:'Square aspect ratio (1:1)' },
  { name:'aspect-video',  css:'aspect-ratio: 16 / 9',  doc:'Video aspect ratio (16:9)' },
  { name:'aspect-4-3',    css:'aspect-ratio: 4 / 3',   doc:'4:3 aspect ratio' },

  // Visibility
  { name:'visible',         css:'visibility: visible', doc:'Show element (visibility)' },
  { name:'invisible',       css:'visibility: hidden',  doc:'Hide element (keeps space)' },
  { name:'sr-only',         css:'position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap', doc:'Screen-reader only (visually hidden)' },
  { name:'not-sr-only',     css:'position: static; width: auto; height: auto; overflow: visible; clip: auto; white-space: normal', doc:'Undo sr-only' },

  // Print
  { name:'print-hidden',       css:'@media print { display: none }',              doc:'Hide when printing' },
  { name:'print-only',         css:'@media screen { display: none }',             doc:'Show only when printing' },
  { name:'print-break-before', css:'page-break-before: always; break-before: page', doc:'Page break before this element' },
  { name:'print-show-links',   css:'@media print { a::after { content: " (" attr(href) ")" } }', doc:'Show link URLs when printing' },

  // Backgrounds
  { name:'bg-transparent',   css:'background-color: transparent',    doc:'Transparent background' },
  { name:'background-black', css:'background-color: #000',           doc:'Black background' },
  { name:'background-white', css:'background-color: #fff',           doc:'White background' },
  { name:'background-transparent', css:'background-color: transparent', doc:'Transparent background' },

  // Text color
  { name:'color-white',      css:'color: #fff',     doc:'White text' },
  { name:'color-black',      css:'color: #000',     doc:'Black text' },
  { name:'color-inherit',    css:'color: inherit',  doc:'Inherit parent color' },
  { name:'color-transparent',css:'color: transparent', doc:'Transparent text' },

  // Components
  { name:'btn',              css:'inline-flex; align-items: center; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer', doc:'Base button component' },
  { name:'btn-primary',      css:'background: var(--santy-primary, #3b82f6); color: #fff', doc:'Primary button style' },
  { name:'btn-secondary',    css:'background: #6b7280; color: #fff',     doc:'Secondary button style' },
  { name:'btn-success',      css:'background: #22c55e; color: #fff',     doc:'Success/green button' },
  { name:'btn-danger',       css:'background: #ef4444; color: #fff',     doc:'Danger/red button' },
  { name:'btn-warning',      css:'background: #f59e0b; color: #fff',     doc:'Warning/amber button' },
  { name:'btn-outline',      css:'border: 2px solid currentColor',       doc:'Outline button style' },
  { name:'btn-ghost',        css:'background: transparent',              doc:'Ghost button (transparent bg)' },
  { name:'btn-sm',           css:'padding: 4px 10px; font-size: 12px',   doc:'Small button' },
  { name:'btn-lg',           css:'padding: 12px 24px; font-size: 16px',  doc:'Large button' },
  { name:'make-button',      css:'Base component class for buttons',     doc:'Component variant system — combine with style-*, size-*, shape-*' },
  { name:'style-primary',    css:'background: var(--santy-primary, #3b82f6); color: #fff', doc:'Primary style modifier (use with make-button, make-badge, etc.)' },
  { name:'style-secondary',  css:'background: #6b7280; color: #fff',    doc:'Secondary style modifier' },
  { name:'style-success',    css:'background: #22c55e; color: #fff',     doc:'Success style modifier' },
  { name:'style-danger',     css:'background: #ef4444; color: #fff',     doc:'Danger style modifier' },
  { name:'style-warning',    css:'background: #f59e0b; color: #fff',     doc:'Warning style modifier' },
  { name:'style-outline',    css:'border: 2px solid currentColor; background: transparent', doc:'Outline style modifier' },
  { name:'style-ghost',      css:'background: transparent',             doc:'Ghost style modifier' },
  { name:'style-dark',       css:'background: #1e293b; color: #f1f5f9', doc:'Dark style modifier' },
  { name:'size-small',       css:'padding: 4px 10px; font-size: 12px',  doc:'Small size modifier' },
  { name:'size-large',       css:'padding: 12px 24px; font-size: 16px', doc:'Large size modifier' },
  { name:'size-xl',          css:'padding: 16px 32px; font-size: 18px', doc:'XL size modifier' },
  { name:'size-full',        css:'width: 100%',                         doc:'Full-width size modifier' },
  { name:'shape-pill',       css:'border-radius: 9999px',               doc:'Pill shape modifier' },
  { name:'shape-rounded',    css:'border-radius: 8px',                  doc:'Rounded shape modifier' },
  { name:'shape-square',     css:'border-radius: 0',                    doc:'Square/no-radius shape modifier' },
  { name:'card',             css:'background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,.1)', doc:'Card component' },
  { name:'card-body',        css:'padding: 24px',                       doc:'Card body padding' },
  { name:'card-hover',       css:'transition: transform .2s, box-shadow .2s; cursor: pointer',  doc:'Card hover effect' },
  { name:'make-card',        css:'Base class for card component',       doc:'Card component — combine with style-*' },
  { name:'badge',            css:'display: inline-flex; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700', doc:'Badge/pill component' },
  { name:'badge-primary',    css:'background: #dbeafe; color: #1d4ed8', doc:'Primary badge' },
  { name:'badge-success',    css:'background: #dcfce7; color: #15803d', doc:'Success badge' },
  { name:'badge-danger',     css:'background: #fee2e2; color: #dc2626', doc:'Danger badge' },
  { name:'badge-warning',    css:'background: #fef3c7; color: #b45309', doc:'Warning badge' },
  { name:'alert',            css:'padding: 12px 16px; border-radius: 8px; border-left: 4px solid', doc:'Alert/notification component' },
  { name:'alert-success',    css:'background: #f0fdf4; border-color: #22c55e; color: #15803d', doc:'Success alert' },
  { name:'alert-warning',    css:'background: #fffbeb; border-color: #f59e0b; color: #92400e', doc:'Warning alert' },
  { name:'alert-danger',     css:'background: #fef2f2; border-color: #ef4444; color: #dc2626', doc:'Danger alert' },
  { name:'input',            css:'padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; width: 100%', doc:'Input field component' },
  { name:'input-sm',         css:'padding: 4px 8px; font-size: 12px',  doc:'Small input' },
  { name:'input-lg',         css:'padding: 12px 16px; font-size: 16px', doc:'Large input' },
  { name:'spinner',          css:'animation: spin 1s linear infinite; border-radius: 9999px; border: 2px solid; border-top-color: transparent', doc:'Loading spinner' },
  { name:'skeleton',         css:'background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: skeleton 1.5s infinite', doc:'Skeleton loading placeholder' },
  { name:'progress',         css:'height: 8px; border-radius: 9999px; background: #e2e8f0; overflow: hidden', doc:'Progress bar container' },
  { name:'table',            css:'width: 100%; border-collapse: collapse',  doc:'Table base component' },
  { name:'table-bordered',   css:'border: 1px solid #e2e8f0; th, td: border',  doc:'Table with borders' },
  { name:'table-striped',    css:'tr:nth-child(even): background: #f8fafc', doc:'Striped table rows' },
  { name:'avatar',           css:'width: 40px; height: 40px; border-radius: 9999px; object-fit: cover', doc:'Avatar image' },
  { name:'avatar-sm',        css:'width: 28px; height: 28px',   doc:'Small avatar' },
  { name:'avatar-lg',        css:'width: 56px; height: 56px',   doc:'Large avatar' },

  // Positioning helpers
  { name:'pin-top-0',        css:'position: absolute; top: 0',      doc:'Pin to top (absolute, top: 0)' },
  { name:'pin-bottom-0',     css:'position: absolute; bottom: 0',   doc:'Pin to bottom (absolute, bottom: 0)' },
  { name:'pin-left-0',       css:'position: absolute; left: 0',     doc:'Pin to left (absolute, left: 0)' },
  { name:'pin-right-0',      css:'position: absolute; right: 0',    doc:'Pin to right (absolute, right: 0)' },
  { name:'pin-center',       css:'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)', doc:'Absolutely centered' },
  { name:'pin-inset-0',      css:'position: absolute; inset: 0',    doc:'Fill parent (absolute, inset: 0)' },

  // Logical properties
  { name:'ms-auto',          css:'margin-inline-start: auto',  doc:'Margin inline start: auto (RTL-safe)' },
  { name:'me-auto',          css:'margin-inline-end: auto',    doc:'Margin inline end: auto (RTL-safe)' },
  { name:'text-start',       css:'text-align: start',          doc:'Text align: start (RTL-safe)' },
  { name:'text-end',         css:'text-align: end',            doc:'Text align: end (RTL-safe)' },

  // View transitions
  { name:'view-transition-fade',  css:'view-transition-name: fade',   doc:'View Transition API: fade' },
  { name:'view-transition-slide', css:'view-transition-name: slide',  doc:'View Transition API: slide' },

  // Misc
  { name:'list-none',        css:'list-style: none; padding: 0; margin: 0',  doc:'Remove list styles' },
  { name:'list-disc',        css:'list-style: disc',           doc:'Disc list style' },
  { name:'list-decimal',     css:'list-style: decimal',        doc:'Numbered list' },
  { name:'pin-top-0',        css:'top: 0',                     doc:'Top: 0' },
  { name:'object-cover',     css:'object-fit: cover',          doc:'Image covers container' },
  { name:'object-contain',   css:'object-fit: contain',        doc:'Image contained in container' },
  { name:'object-center',    css:'object-position: center',    doc:'Image centered' },
  { name:'rounded-full',     css:'border-radius: 9999px',      doc:'Full/circular radius' },
  { name:'backdrop-blur-sm', css:'backdrop-filter: blur(4px)', doc:'Backdrop blur: small' },
  { name:'backdrop-blur-md', css:'backdrop-filter: blur(8px)', doc:'Backdrop blur: medium' },
  { name:'backdrop-blur-lg', css:'backdrop-filter: blur(16px)',doc:'Backdrop blur: large' },

  // Key animation classes
  { name:'animate-spin',               css:'animation: spin 1s linear infinite',       doc:'Continuous spin animation' },
  { name:'animate-pulse',              css:'animation: pulse 2s ease-in-out infinite', doc:'Pulsing/fading animation' },
  { name:'animate-bounce',             css:'animation: bounce 1s ease-in-out infinite',doc:'Bouncing animation' },
  { name:'animate-fade-in',            css:'animation: fadeIn 0.4s ease forwards',     doc:'Fade in' },
  { name:'animate-fade-out',           css:'animation: fadeOut 0.4s ease forwards',    doc:'Fade out' },
  { name:'animate-slide-up',           css:'animation: slideUp 0.4s ease forwards',    doc:'Slide up' },
  { name:'animate-slide-down',         css:'animation: slideDown 0.4s ease forwards',  doc:'Slide down' },
  { name:'animate-slide-left',         css:'animation: slideLeft 0.4s ease forwards',  doc:'Slide left' },
  { name:'animate-slide-right',        css:'animation: slideRight 0.4s ease forwards', doc:'Slide right' },
  { name:'animate-zoom-in',            css:'animation: zoomIn 0.3s ease forwards',     doc:'Zoom in' },
  { name:'animate-zoom-out',           css:'animation: zoomOut 0.3s ease forwards',    doc:'Zoom out' },
  { name:'animate-bounce-in',          css:'animation: bounceIn 0.6s cubic-bezier(.3,.07,.1,1.3) forwards', doc:'Bounce in' },
  { name:'animate-bounce-in-from-left',css:'animation: bounceInLeft 0.6s cubic-bezier(.3,.07,.1,1.3) forwards', doc:'Bounce in from left' },
  { name:'animate-flip-in-x',          css:'animation: flipInX 0.5s ease forwards',   doc:'Flip in on X axis' },
  { name:'animate-flip-in-y',          css:'animation: flipInY 0.5s ease forwards',   doc:'Flip in on Y axis' },
  { name:'animate-rubber-band',        css:'animation: rubberBand 0.6s ease',          doc:'Rubber band effect' },
  { name:'animate-shake',              css:'animation: shake 0.5s ease',              doc:'Shake animation' },
  { name:'animate-wobble',             css:'animation: wobble 0.8s ease',             doc:'Wobble animation' },
  { name:'animate-tada',               css:'animation: tada 0.8s ease',              doc:'Tada! party animation' },
  { name:'animate-jello',              css:'animation: jello 0.8s ease',             doc:'Jello effect' },
  { name:'animate-heartbeat',          css:'animation: heartbeat 1.5s ease-in-out infinite', doc:'Heartbeat pulse' },
  { name:'animate-flash',              css:'animation: flash 0.8s ease',             doc:'Flash animation' },
  { name:'animate-swing',              css:'animation: swing 0.6s ease',             doc:'Swing animation' },
  { name:'animate-text-gradient-flow', css:'animation: gradientFlow 3s linear infinite; background-size: 200%', doc:'Animated gradient text' },
  { name:'animate-text-glitch',        css:'animation: glitch 0.5s steps(2, end) infinite', doc:'Glitch text effect' },
  { name:'animate-text-neon-pulse',    css:'animation: neonPulse 1.5s ease-in-out infinite', doc:'Neon glow pulse' },
  { name:'animate-border-spin',        css:'animation: borderSpin 2s linear infinite', doc:'Spinning border effect' },
  { name:'animate-morph-blob',         css:'animation: morphBlob 6s ease-in-out infinite', doc:'Morphing blob shape' },
  { name:'animate-error-shake',        css:'animation: errorShake 0.3s ease',        doc:'Error shake for form validation' },
  { name:'animate-toast-in',           css:'animation: toastIn 0.3s cubic-bezier(.3,.07,.1,1.3)', doc:'Toast notification entrance' },
  { name:'animate-modal-in',           css:'animation: modalIn 0.3s cubic-bezier(.3,.07,.1,1.3)', doc:'Modal entrance animation' },
  { name:'animate-on-scroll-slide-up', css:'opacity: 0; transform: translateY(24px) [adds .is-visible class on scroll]', doc:'Animate on scroll: slide up (add is-visible class via IntersectionObserver)' },
  { name:'animate-on-scroll-fade-in',  css:'opacity: 0 [adds .is-visible class on scroll]', doc:'Animate on scroll: fade in (add is-visible class via IntersectionObserver)' },
  { name:'animate-stagger-slide-up',   css:'> * { animation: slideUp 0.4s ease both }', doc:'Stagger children: slide up' },
  { name:'animate-stagger-children-100', css:'nth-child animation delays: 100ms apart', doc:'Stagger delay: 100ms between children' },
  { name:'animate-stagger-children-200', css:'nth-child animation delays: 200ms apart', doc:'Stagger delay: 200ms between children' },
  { name:'animation-pause-on-hover',   css:':hover { animation-play-state: paused }', doc:'Pause animation on hover' },
  { name:'animation-ease-bounce',      css:'animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1)', doc:'Bounce easing function' },
  { name:'animation-ease-elastic',     css:'animation-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55)', doc:'Elastic easing function' },
  { name:'animation-delay-100',        css:'animation-delay: 100ms',    doc:'Animation delay: 100ms' },
  { name:'animation-delay-200',        css:'animation-delay: 200ms',    doc:'Animation delay: 200ms' },
  { name:'animation-delay-300',        css:'animation-delay: 300ms',    doc:'Animation delay: 300ms' },
  { name:'animation-delay-500',        css:'animation-delay: 500ms',    doc:'Animation delay: 500ms' },
  { name:'animation-delay-750',        css:'animation-delay: 750ms',    doc:'Animation delay: 750ms' },
  { name:'animation-delay-1000',       css:'animation-delay: 1s',       doc:'Animation delay: 1 second' },
  { name:'animation-delay-1500',       css:'animation-delay: 1.5s',     doc:'Animation delay: 1.5 seconds' },
  { name:'animation-delay-2000',       css:'animation-delay: 2s',       doc:'Animation delay: 2 seconds' },

  // Responsive helpers (just the prefix patterns — full values in generated)
  { name:'on-hover:scale-105',    css:'&:hover { transform: scale(1.05) }', doc:'Hover: scale to 105%' },
  { name:'on-hover:scale-110',    css:'&:hover { transform: scale(1.10) }', doc:'Hover: scale to 110%' },
  { name:'on-hover:add-shadow-lg',css:'&:hover { box-shadow: 0 8px 24px rgba(0,0,0,.12) }', doc:'Hover: add large shadow' },
  { name:'on-hover:add-shadow-xl',css:'&:hover { box-shadow: 0 16px 48px rgba(0,0,0,.15) }', doc:'Hover: add XL shadow' },
  { name:'on-hover:opacity-75',   css:'&:hover { opacity: 0.75 }', doc:'Hover: 75% opacity' },
  { name:'on-hover:animate-bounce', css:'&:hover { animation: bounce 1s }', doc:'Hover: bounce animation' },
  { name:'on-hover:animate-rubber-band', css:'&:hover { animation: rubberBand 0.6s }', doc:'Hover: rubber band animation' },
  { name:'on-hover:animate-tada', css:'&:hover { animation: tada 0.8s }', doc:'Hover: tada animation' },
  { name:'on-hover:animate-shake', css:'&:hover { animation: shake 0.5s }', doc:'Hover: shake animation' },
  { name:'dark:background-gray-800', css:'@media (prefers-color-scheme: dark) { background: #1e293b }', doc:'Dark mode: dark background' },
  { name:'dark:background-gray-900', css:'@media (prefers-color-scheme: dark) { background: #0f172a }', doc:'Dark mode: darker background' },
  { name:'dark:color-white',         css:'@media (prefers-color-scheme: dark) { color: #fff }',         doc:'Dark mode: white text' },
];

// ─── Dynamic generators ────────────────────────────────────────────────────
function generateAll() {
  const items = [...STATIC];

  // Padding
  for (const n of SPACING) {
    items.push({ name:`add-padding-${n}`,         css:`padding: ${n}px`,            doc:`padding: ${n}px` });
    items.push({ name:`add-padding-x-${n}`,       css:`padding-left: ${n}px; padding-right: ${n}px`, doc:`Horizontal padding: ${n}px` });
    items.push({ name:`add-padding-y-${n}`,       css:`padding-top: ${n}px; padding-bottom: ${n}px`, doc:`Vertical padding: ${n}px` });
    items.push({ name:`add-padding-top-${n}`,     css:`padding-top: ${n}px`,         doc:`padding-top: ${n}px` });
    items.push({ name:`add-padding-bottom-${n}`,  css:`padding-bottom: ${n}px`,      doc:`padding-bottom: ${n}px` });
    items.push({ name:`add-padding-left-${n}`,    css:`padding-left: ${n}px`,        doc:`padding-left: ${n}px` });
    items.push({ name:`add-padding-right-${n}`,   css:`padding-right: ${n}px`,       doc:`padding-right: ${n}px` });
    // Logical
    if (n <= 64) {
      items.push({ name:`ps-${n}`, css:`padding-inline-start: ${n}px`, doc:`padding-inline-start: ${n}px (RTL-safe)` });
      items.push({ name:`pe-${n}`, css:`padding-inline-end: ${n}px`,   doc:`padding-inline-end: ${n}px (RTL-safe)` });
      items.push({ name:`add-padding-inline-${n}`, css:`padding-inline: ${n}px`,  doc:`Inline (horizontal) padding: ${n}px` });
    }
  }

  // Margin
  for (const n of SPACING) {
    items.push({ name:`add-margin-${n}`,           css:`margin: ${n}px`,              doc:`margin: ${n}px` });
    items.push({ name:`add-margin-x-${n}`,         css:`margin-left: ${n}px; margin-right: ${n}px`, doc:`Horizontal margin: ${n}px` });
    items.push({ name:`add-margin-y-${n}`,         css:`margin-top: ${n}px; margin-bottom: ${n}px`, doc:`Vertical margin: ${n}px` });
    items.push({ name:`add-margin-top-${n}`,       css:`margin-top: ${n}px`,           doc:`margin-top: ${n}px` });
    items.push({ name:`add-margin-bottom-${n}`,    css:`margin-bottom: ${n}px`,        doc:`margin-bottom: ${n}px` });
    items.push({ name:`add-margin-left-${n}`,      css:`margin-left: ${n}px`,          doc:`margin-left: ${n}px` });
    items.push({ name:`add-margin-right-${n}`,     css:`margin-right: ${n}px`,         doc:`margin-right: ${n}px` });
  }
  items.push({ name:'add-margin-x-auto', css:'margin-left: auto; margin-right: auto', doc:'Center horizontally (auto margins)' });
  items.push({ name:'add-margin-left-auto',  css:'margin-left: auto',   doc:'Push right (margin-left: auto)' });
  items.push({ name:'add-margin-right-auto', css:'margin-right: auto',  doc:'Push left (margin-right: auto)' });
  items.push({ name:'add-margin-y-auto',     css:'margin-top: auto; margin-bottom: auto', doc:'Vertical auto margin' });

  // Gap
  for (const n of SPACING) {
    items.push({ name:`gap-${n}`,   css:`gap: ${n}px`,          doc:`Gap: ${n}px` });
    items.push({ name:`gap-x-${n}`, css:`column-gap: ${n}px`,   doc:`Column gap: ${n}px` });
    items.push({ name:`gap-y-${n}`, css:`row-gap: ${n}px`,      doc:`Row gap: ${n}px` });
  }

  // Width / Height / Size
  for (const n of SPACING) {
    items.push({ name:`set-width-${n}`,    css:`width: ${n}px`,     doc:`width: ${n}px` });
    items.push({ name:`set-max-width-${n}`,css:`max-width: ${n}px`, doc:`max-width: ${n}px` });
    items.push({ name:`set-min-width-${n}`,css:`min-width: ${n}px`, doc:`min-width: ${n}px` });
    items.push({ name:`set-height-${n}`,   css:`height: ${n}px`,    doc:`height: ${n}px` });
    items.push({ name:`set-min-height-${n}`,css:`min-height: ${n}px`,doc:`min-height: ${n}px` });
    if (n <= 200) {
      items.push({ name:`set-size-${n}`,   css:`width: ${n}px; height: ${n}px`, doc:`Square: ${n}×${n}px` });
    }
  }
  items.push({ name:'set-max-width-readable', css:'max-width: 65ch', doc:'Readable line length (65 characters)' });
  items.push({ name:'set-max-width-prose',    css:'max-width: 72ch', doc:'Prose line length (72 characters)' });

  // Border width
  for (const n of [0,1,2,3,4,5,6,7,8]) {
    items.push({ name:`add-border-${n}`,         css:`border: ${n}px solid`,          doc:`All borders: ${n}px solid` });
    items.push({ name:`add-border-top-${n}`,     css:`border-top: ${n}px solid`,      doc:`Top border: ${n}px solid` });
    items.push({ name:`add-border-bottom-${n}`,  css:`border-bottom: ${n}px solid`,   doc:`Bottom border: ${n}px solid` });
    items.push({ name:`add-border-left-${n}`,    css:`border-left: ${n}px solid`,     doc:`Left border: ${n}px solid` });
    items.push({ name:`add-border-right-${n}`,   css:`border-right: ${n}px solid`,    doc:`Right border: ${n}px solid` });
  }

  // Border radius
  for (const n of [0,2,4,6,8,10,12,14,16,18,20,24,28,32,36,40,48]) {
    items.push({ name:`round-corners-${n}`, css:`border-radius: ${n}px`, doc:`border-radius: ${n}px` });
  }

  // Text size
  for (const n of TEXT_SIZES) {
    items.push({ name:`set-text-${n}`, css:`font-size: ${n}px`, doc:`font-size: ${n}px` });
  }

  // Opacity (extra values)
  for (const n of [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95]) {
    items.push({ name:`opacity-${n}`, css:`opacity: ${n/100}`, doc:`opacity: ${n/100}` });
  }

  // Colors
  for (const color of COLORS) {
    for (const shade of SHADES) {
      items.push({ name:`color-${color}-${shade}`,            css:`color: var(--${color}-${shade})`,             doc:`${color}-${shade} text color` });
      items.push({ name:`background-${color}-${shade}`,       css:`background-color: var(--${color}-${shade})`,  doc:`${color}-${shade} background` });
      items.push({ name:`border-color-${color}-${shade}`,     css:`border-color: var(--${color}-${shade})`,      doc:`${color}-${shade} border color` });
      items.push({ name:`on-hover:color-${color}-${shade}`,   css:`&:hover { color: var(--${color}-${shade}) }`, doc:`Hover: ${color}-${shade} text color` });
      items.push({ name:`on-hover:background-${color}-${shade}`, css:`&:hover { background-color: var(--${color}-${shade}) }`, doc:`Hover: ${color}-${shade} background` });
      items.push({ name:`dark:color-${color}-${shade}`,       css:`@media(dark) { color: var(--${color}-${shade}) }`,        doc:`Dark mode: ${color}-${shade} text` });
      items.push({ name:`dark:background-${color}-${shade}`,  css:`@media(dark) { background-color: var(--${color}-${shade}) }`, doc:`Dark mode: ${color}-${shade} bg` });
    }
  }

  // Positioning (pin-{side}-{n})
  for (const side of ['top','bottom','left','right']) {
    for (const n of [0,4,8,12,16,20,24,32,48,64]) {
      items.push({ name:`pin-${side}-${n}`, css:`${side}: ${n}px`, doc:`${side}: ${n}px` });
    }
  }

  // Z-index
  for (const n of [0,10,20,30,40,50,100,200,300,400,500]) {
    items.push({ name:`z-${n}`, css:`z-index: ${n}`, doc:`z-index: ${n}` });
  }

  // Responsive prefixes (sm:, md:, lg:, xl:, on-mobile:, on-tablet:, on-desktop:)
  for (const prefix of ['sm','md','lg','xl','on-mobile','on-tablet','on-desktop']) {
    items.push({ name:`${prefix}:make-flex`,     css:`@media { display: flex }`,  doc:`${prefix}: display flex` });
    items.push({ name:`${prefix}:make-hidden`,   css:`@media { display: none }`,  doc:`${prefix}: hide element` });
    items.push({ name:`${prefix}:make-block`,    css:`@media { display: block }`, doc:`${prefix}: display block` });
    items.push({ name:`${prefix}:grid-cols-1`,   css:`@media { grid-template-columns: repeat(1, 1fr) }`, doc:`${prefix}: 1-col grid` });
    items.push({ name:`${prefix}:grid-cols-2`,   css:`@media { grid-template-columns: repeat(2, 1fr) }`, doc:`${prefix}: 2-col grid` });
    items.push({ name:`${prefix}:grid-cols-3`,   css:`@media { grid-template-columns: repeat(3, 1fr) }`, doc:`${prefix}: 3-col grid` });
    for (const sz of [12,14,16,18,20,24,32]) {
      items.push({ name:`${prefix}:set-text-${sz}`, css:`@media { font-size: ${sz}px }`, doc:`${prefix}: font-size: ${sz}px` });
    }
    for (const n of [8,16,24,32,48,64]) {
      items.push({ name:`${prefix}:add-padding-${n}`, css:`@media { padding: ${n}px }`, doc:`${prefix}: padding: ${n}px` });
    }
  }

  // Clip-path utilities
  for (const [name, value, doc] of [
    ['circle',        'circle(50%)',                    'Circular clip-path'],
    ['hexagon',       'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', 'Hexagonal clip-path'],
    ['diamond',       'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', 'Diamond clip-path'],
    ['star',          'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)', 'Star clip-path'],
    ['triangle',      'polygon(50% 0%, 0% 100%, 100% 100%)', 'Triangle clip-path'],
    ['arrow-right',   'polygon(0% 20%,65% 20%,65% 0%,100% 50%,65% 100%,65% 80%,0% 80%)', 'Right arrow clip-path'],
  ]) {
    items.push({ name:`clip-${name}`, css:`clip-path: ${value}`, doc });
  }

  return items;
}

module.exports = { generateAll, COLORS, SHADES };

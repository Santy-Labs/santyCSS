/**
 * SantyCSS — type declarations for the main entry point.
 *
 *   const santy = require('santycss');
 *   santy.css  →  absolute path to dist/santy.css
 */

/** Absolute filesystem paths to the bundled CSS/JS/JSON assets. */
declare const santy: {
  /** dist/santy.css — the full framework bundle */
  css: string;
  /** dist/santy.min.css — minified full bundle */
  min: string;
  /** dist/santy-start.css — CDN drop-in: base + components */
  start: string;
  /** dist/santy-core.css — utilities only, no extended variants */
  core: string;
  /** dist/santy-variants.css — extended responsive/state variants */
  variants: string;
  /** dist/santy-components.css — pre-built UI components */
  components: string;
  /** dist/santy-animations.css — keyframe animations */
  animations: string;
  /** dist/santy-email.css — email-safe styles */
  email: string;
  /** dist/santy-themes.css — prebuilt data-theme presets */
  themes: string;
  /** dist/santy-reset.css — CSS reset + design tokens */
  reset: string;
  /** dist/santy-layout.css */
  layout: string;
  /** dist/santy-flex.css */
  flex: string;
  /** dist/santy-grid.css */
  grid: string;
  /** dist/santy-spacing.css */
  spacing: string;
  /** dist/santy-sizing.css */
  sizing: string;
  /** dist/santy-typography.css */
  typography: string;
  /** dist/santy-colors.css */
  colors: string;
  /** dist/santy-borders.css */
  borders: string;
  /** dist/santy-effects.css */
  effects: string;
  /** dist/santy-classmap.json — every generated class name */
  classmap: string;
  /** dist/santy.js — the behavior layer (modal, drawer, dropdown, tabs, toast, theme) */
  js: string;

  /** Remove unused classes from a CSS string. `content` is file paths or raw markup. */
  purge: (options: {
    css: string;
    content?: string[];
    safelist?: string[];
    minifyOutput?: boolean;
  }) => santy.PurgeResult;
  /** Purge a CSS file based on the classes found under the given directories. */
  purgeFiles: (options?: {
    cssFile?: string;
    inputDirs?: string[];
    safelist?: string[];
    minifyOutput?: boolean;
  }) => santy.PurgeResult;
  /** Extract class names from HTML/JS/JSX source text. */
  extractClasses: (source: string) => Set<string>;
  /** Minify a CSS string. */
  minify: (css: string) => string;
  /** File extensions scanned by the purger. */
  EXTS: string[];
};

declare namespace santy {
  interface PurgeResult {
    css: string;
    stats: {
      classesFound: number;
      rulesKept: number;
      rulesDropped: number;
      originalSize: number;
      outputSize: number;
    };
  }

  /* ── Behavior layer (santy.js, v2.9.0) ─────────────────────────────────
   * These describe the global `Santy` object created by dist/santy.js.
   * They are not returned by `require('santycss')` — that export only hands
   * back the file path. Reference them via `santy.SantyRuntime`.
   */

  type ElementRef = string | Element;

  /** open / close / toggle façade shared by modal, drawer and bottom sheet. */
  interface OverlayAPI {
    open(target: ElementRef): void;
    close(target: ElementRef): void;
    toggle(target: ElementRef): void;
    isOpen(target: ElementRef): boolean;
  }

  interface ToastOptions {
    /** Visual variant; also decides whether the toast announces as alert or status. */
    variant?: 'success' | 'error' | 'warning' | 'info' | 'light';
    /** Bold line above the message. */
    title?: string;
    /** Auto-dismiss delay in ms. `0` keeps it until dismissed. Default 4000. */
    duration?: number;
    /** Corner to render in. Default top-right. */
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
             | 'top-center' | 'bottom-center';
    /** Optional inline action button. */
    action?: { label: string; onClick?: () => void };
    /** Show the × button. Default true. */
    dismissible?: boolean;
    /** Accessible label for the × button. Default "Dismiss notification". */
    closeLabel?: string;
    /** Extra classes on the toast element. */
    className?: string;
    onDismiss?: () => void;
  }

  interface ToastHandle {
    el: HTMLElement;
    dismiss(): void;
  }

  interface ToastAPI {
    (message: string, options?: ToastOptions): ToastHandle;
    success(message: string, options?: ToastOptions): ToastHandle;
    error(message: string, options?: ToastOptions): ToastHandle;
    warning(message: string, options?: ToastOptions): ToastHandle;
    info(message: string, options?: ToastOptions): ToastHandle;
  }

  interface ThemeAPI {
    /** Current theme name, e.g. "light" | "dark" | "ocean". */
    get(): string;
    /** Apply a theme. Pass `persist: false` to skip writing localStorage. */
    set(name: string, persist?: boolean): string;
    /** Flip between light and dark. */
    toggle(): string;
    /** Forget the saved choice and follow `prefers-color-scheme` again. */
    system(): string;
    init(): void;
  }

  interface PositionOptions {
    placement?: 'top' | 'bottom' | 'left' | 'right'
              | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
              | 'left-start' | 'left-end' | 'right-start' | 'right-end';
    /** Gap between anchor and floating element, px. Default 8. */
    offset?: number;
    /** Minimum distance from the viewport edge, px. Default 8. */
    padding?: number;
  }

  /** The global `Santy` object exposed by dist/santy.js. */
  interface SantyRuntime {
    version: string;
    /** Wire up ARIA and instances inside `root`. Safe to re-run after DOM injection. */
    init(root?: ParentNode): void;

    modal: OverlayAPI;
    drawer: OverlayAPI;
    offcanvas: OverlayAPI;
    sheet: OverlayAPI;
    bottomSheet: OverlayAPI;

    dropdown: {
      open(target: ElementRef): void;
      close(target: ElementRef): void;
      toggle(target: ElementRef): void;
      closeAll(): void;
    };
    collapse: {
      show(target: ElementRef): void;
      hide(target: ElementRef): void;
      toggle(target: ElementRef): void;
    };
    tabs: { show(target: ElementRef): void };
    tooltip: { show(target: ElementRef): void; hide(): void };
    popover: {
      open(trigger: ElementRef): void;
      close(target: ElementRef): void;
      closeAll(): void;
    };
    carousel: {
      next(target: ElementRef): void;
      prev(target: ElementRef): void;
      go(target: ElementRef, index: number): void;
      play(target: ElementRef): void;
      pause(target: ElementRef): void;
    };

    /** Data table sorting and row selection. */
    table: {
      /**
       * Sort by a header cell. Direction toggles when omitted.
       * Reads `data-sort-value` per cell (falling back to text) and
       * `data-sort-type="number|date|text"` on the header.
       */
      sort(th: ElementRef, direction?: 'ascending' | 'descending'): void;
      /** Apply the header checkbox's state to every row checkbox. */
      selectAll(master: ElementRef): void;
    };
    combobox: {
      open(target: ElementRef): void;
      close(target: ElementRef): void;
      /** Filter options by substring; returns how many remain visible. */
      filter(target: ElementRef, query: string): number;
      /** Current value — an array when `data-santy-multiple="true"`. */
      value(target: ElementRef): string | string[] | null;
    };

    toast: ToastAPI;
    theme: ThemeAPI;
    scrollspy(nav: ElementRef, options?: { rootMargin?: string; threshold?: number[] }): IntersectionObserver | undefined;

    /** Primitives for building your own components on the same machinery. */
    utils: {
      $(selector: ElementRef, ctx?: ParentNode): Element | null;
      $$(selector: string, ctx?: ParentNode): Element[];
      on(el: EventTarget, type: string, fn: EventListener, opts?: boolean | AddEventListenerOptions): void;
      off(el: EventTarget, type: string, fn: EventListener, opts?: boolean | EventListenerOptions): void;
      /** Fire a cancelable event; returns false if a listener called preventDefault(). */
      emit(el: Element, name: string, detail?: unknown): boolean;
      /** Place `floating` against `anchor`, flipping and shifting to stay on screen. */
      position(anchor: Element, floating: HTMLElement, options?: PositionOptions): string;
      focusTrap: {
        activate(el: Element, opts?: { restore?: boolean }): void;
        deactivate(el: Element): void;
      };
      lockScroll(): void;
      unlockScroll(): void;
      tabbables(container: Element): HTMLElement[];
      afterTransition(el: Element, fn: () => void): void;
      prefersReducedMotion(): boolean;
    };
  }

  /**
   * Shape of an optional `santy.config.json` consumed by `npx santycss build`
   * (and `node build.js` in a repo checkout).
   */
  interface SantyConfig {
    /** Extend/override the color palette. A string applies the hex to every shade. */
    colors?: Record<string, string | Partial<Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>>>;
    /** Extra spacing values (px) added to the scale. */
    spacing?: number[];
    /** Extra font-size values (px). */
    fontSizes?: number[];
    /** Extend/override breakpoints, e.g. { "tablet-up": "(min-width: 900px)" }. */
    breakpoints?: Record<string, string>;
    /** Prefix applied to every generated class name, e.g. "sty-". */
    prefix?: string;
    /** Directory the build writes to (relative to the working directory). */
    output?: string;
    /**
     * Plugins to run, as module paths resolved from the working directory.
     * Each must export a `SantyPlugin` (or `{ handler }`).
     */
    plugins?: (string | SantyPlugin | [string | SantyPlugin, unknown])[];
  }

  /** A declaration block. Nested keys are selectors (`&:hover`) or at-rules. */
  interface CSSRules {
    [selectorOrProperty: string]: string | number | string[] | CSSRules;
  }

  /** The API handed to every plugin. */
  interface PluginAPI {
    /** Element/base styles, emitted before components. */
    addBase(rules: CSSRules): void;
    /** Component classes, emitted before utilities. */
    addComponents(rules: CSSRules): void;
    /** Utility classes, emitted last so they win. */
    addUtilities(rules: CSSRules): void;
    /**
     * Register a variant. `template` must contain `&`:
     *   '@supports (display: grid) { & }'   — wraps the rule
     *   '[data-theme="ocean"] &'            — ancestor selector
     *   '&:hover'                           — pseudo-class
     * `classes` defaults to everything this plugin registered; pass an explicit
     * list to vary the framework's own utilities.
     */
    addVariant(name: string, template: string, classes?: string[]): void;
    /** Read the resolved theme, e.g. theme('colors.blue.500'). */
    theme<T = unknown>(path: string, fallback?: T): T;
    /** The parsed santy.config.json. */
    config: SantyConfig;
    /** Escape a class name for use in a selector. */
    e(className: string): string;
    /** Class names registered so far by this plugin. */
    registered: string[];
  }

  type SantyPlugin =
    | ((api: PluginAPI, options?: unknown) => void)
    | { handler: (api: PluginAPI, options?: unknown) => void };
}

export = santy;

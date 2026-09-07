'use strict';
/**
 * SantyCSS plugin API (v2.9.0)
 *
 * The extension point the framework was missing. Tailwind's ecosystem exists
 * because third parties can add utilities, components and variants without
 * forking the generator — this is the equivalent.
 *
 * Register plugins in santy.config.json:
 *
 *   { "plugins": ["./plugins/brand.js", "santycss-plugin-forms"] }
 *
 * A plugin is a function (or a { handler } object):
 *
 *   module.exports = function ({ addUtilities, addComponents, addVariant, theme, e }) {
 *     addUtilities({
 *       '.text-brand': { color: theme('colors.brand.500') },
 *       '.grid-dashboard': { display: 'grid', 'grid-template-columns': '240px 1fr' },
 *     });
 *
 *     addComponents({
 *       '.btn-brand': {
 *         background: theme('colors.brand.500'),
 *         color: '#fff',
 *         '&:hover': { background: theme('colors.brand.600') },
 *       },
 *     });
 *
 *     // Generates .supports-grid\:grid-dashboard for the classes listed.
 *     addVariant('supports-grid', '@supports (display: grid) { & }', ['grid-dashboard']);
 *   };
 */

/** Escape a class name for use in a selector (`md:foo` → `md\:foo`). */
function escapeClass(str) {
  return String(str).replace(/([:.\/[\]!#$%&'()*+,;<=>?@^`{|}~])/g, '\\$1');
}

/** camelCase → kebab-case, so JS-style property names work too. */
function kebab(prop) {
  return /[A-Z]/.test(prop) ? prop.replace(/[A-Z]/g, m => '-' + m.toLowerCase()) : prop;
}

/**
 * Serialise a declaration object into CSS rules.
 * Nested selectors are supported via `&`, and at-rules via an `@…` key.
 */
function renderRule(selector, decls, indent) {
  indent = indent || '';
  const body = [];
  const nested = [];

  for (const [key, value] of Object.entries(decls)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'object' && !Array.isArray(value)) {
      if (key.startsWith('@')) {
        // At-rule wrapping this selector, e.g. '@media (min-width: 768px)'.
        nested.push(`${indent}${key} {\n${renderRule(selector, value, indent + '  ')}\n${indent}}`);
      } else {
        // Nested selector; `&` is the parent.
        const child = key.includes('&') ? key.replace(/&/g, selector) : `${selector} ${key}`;
        nested.push(renderRule(child, value, indent));
      }
      continue;
    }
    const val = Array.isArray(value) ? value.join(' ') : value;
    body.push(`${indent}  ${kebab(key)}: ${val};`);
  }

  const own = body.length ? `${indent}${selector} {\n${body.join('\n')}\n${indent}}` : '';
  return [own, ...nested].filter(Boolean).join('\n');
}

/**
 * Read a dotted path out of the resolved theme, e.g. theme('colors.blue.500').
 * Returns `fallback` when the path is missing, so plugins degrade rather than throw.
 */
function makeThemeFn(themeData) {
  return function theme(pathStr, fallback) {
    const parts = String(pathStr).split('.');
    let cur = themeData;
    for (const p of parts) {
      if (cur == null || !(p in cur)) return fallback;
      cur = cur[p];
    }
    return cur === undefined ? fallback : cur;
  };
}

/**
 * Run the configured plugins and collect the CSS they produce.
 *
 * Returns { base, components, utilities, variants, names } — four CSS strings
 * kept separate so each can be injected at the right cascade position, plus
 * the list of class names for the classmap.
 */
function runPlugins(plugins, context) {
  const out = { base: [], components: [], utilities: [], variants: [] };
  const names = new Set();
  const loaded = [];

  // Every utility/component a plugin registers, so addVariant can default to them.
  const registered = [];
  // Flat declarations per registered class, so addVariant can re-emit classes
  // the plugin itself just added — those are not in the framework's index yet.
  const ownDecls = Object.create(null);

  function flatDecls(decls) {
    const body = [];
    for (const [key, value] of Object.entries(decls)) {
      if (value === null || value === undefined) continue;
      // Nested selectors and at-rules cannot be flattened into a variant body.
      if (typeof value === 'object' && !Array.isArray(value)) continue;
      body.push(`${kebab(key)}: ${Array.isArray(value) ? value.join(' ') : value};`);
    }
    return body.join(' ');
  }

  function collect(target, rules) {
    for (const [selector, decls] of Object.entries(rules)) {
      if (!decls || typeof decls !== 'object') continue;
      // Escape the class part so plugins can register `sm:thing` directly.
      const sel = selector.replace(/^\.([^\s:>+~[]+)/, (m, cls) => '.' + escapeClass(cls));
      target.push(renderRule(sel, decls));
      const match = /^\.([A-Za-z_][\w\\:.\/-]*)$/.exec(selector.trim());
      if (match) {
        const clean = match[1].replace(/\\/g, '');
        names.add(clean);
        registered.push(clean);
        const flat = flatDecls(decls);
        if (flat) ownDecls[clean] = flat;
      }
    }
  }

  const api = {
    addBase:       rules => collect(out.base, rules),
    addComponents: rules => collect(out.components, rules),
    addUtilities:  rules => collect(out.utilities, rules),

    /**
     * addVariant(name, template, classes)
     *
     * `template` must contain `&`, standing for the generated selector.
     * `classes` defaults to everything this plugin registered — an explicit
     * list is required to vary the framework's built-in utilities, because
     * regenerating all 21k of them per variant is not something a plugin
     * should be able to do by accident.
     */
    addVariant(name, template, classes) {
      const list = classes && classes.length ? classes : registered.slice();
      if (!template.includes('&')) {
        throw new Error(`addVariant("${name}"): template must contain "&"`);
      }
      for (const cls of list) {
        const variantClass = `${name}:${cls}`;
        const selector = `.${escapeClass(variantClass)}`;
        // Prefer the plugin's own rules; fall back to the framework's index.
        const source = ownDecls[cls] || (context.lookup ? context.lookup(cls) : null);
        if (!source) continue; // nothing to re-emit for this class
        // Two template shapes, distinguished by whether the template opens a block:
        //   '@media print { & }'  → wrapper: the rule nests inside it
        //   '.dark &' / '&:hover' → selector: & is substituted in place
        let rendered;
        if (template.includes('{')) {
          const at = template.indexOf('&');
          rendered = template.slice(0, at) + selector +
                     ` {\n    ${source}\n  }` + template.slice(at + 1);
        } else {
          rendered = `${template.replace(/&/g, selector)} {\n  ${source}\n}`;
        }
        out.variants.push(rendered);
        names.add(variantClass);
      }
    },

    theme: makeThemeFn(context.theme || {}),
    config: context.config || {},
    e: escapeClass,
    /** Everything the plugin has registered so far — handy for addVariant. */
    registered,
  };

  for (const entry of plugins) {
    let fn = entry;
    let options;
    if (typeof entry === 'string') {
      fn = context.require(entry);
    } else if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      if (typeof entry.plugin === 'string') { fn = context.require(entry.plugin); options = entry.options; }
      else fn = entry;
    } else if (Array.isArray(entry)) {
      fn = typeof entry[0] === 'string' ? context.require(entry[0]) : entry[0];
      options = entry[1];
    }

    // Support both `module.exports = fn` and `module.exports = { handler }`.
    if (fn && typeof fn === 'object' && typeof fn.handler === 'function') fn = fn.handler;
    if (typeof fn !== 'function') {
      throw new Error(`Plugin ${JSON.stringify(entry)} did not export a function.`);
    }
    fn(api, options);
    loaded.push(typeof entry === 'string' ? entry : (fn.name || 'anonymous'));
  }

  const join = arr => arr.filter(Boolean).join('\n\n');
  return {
    base: join(out.base),
    components: join(out.components),
    utilities: join(out.utilities),
    variants: join(out.variants),
    names: [...names],
    loaded,
  };
}

module.exports = { runPlugins, escapeClass, renderRule, kebab, makeThemeFn };

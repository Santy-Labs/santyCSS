/*! prettier-plugin-santycss — sort SantyCSS classes on format | MIT
 *
 *   npm i -D prettier prettier-plugin-santycss
 *
 *   // .prettierrc
 *   { "plugins": ["santycss/prettier"] }
 *
 * Every `class` / `className` attribute is rewritten into canonical order on
 * save, so class lists stop drifting into per-developer orderings and diffs
 * stop churning on reordering alone.
 *
 * Works by wrapping Prettier's own parsers rather than replacing them: the
 * upstream parser produces the AST, this walks it and rewrites class strings,
 * and Prettier's printer does the rest. Supports Prettier 2 and 3.
 */
'use strict';

const { sortClasses } = require('../sort/santy-sort.js');

/** Attributes whose value is a class list. */
const CLASS_ATTRIBUTES = new Set([
  'class', 'className', 'classList', 'ngClass', ':class', 'v-bind:class',
]);

/** Callee names whose string arguments are class lists (cn('a', 'b')). */
const CLASS_FUNCTIONS = new Set(['cn', 'clsx', 'classnames', 'classNames', 'santyMerge']);

function sortIfString(value) {
  return typeof value === 'string' && value.trim() ? sortClasses(value) : value;
}

/**
 * Walk any AST shape and rewrite class strings.
 * Deliberately structural rather than parser-specific: the html, babel,
 * typescript, vue and angular ASTs all differ, and duck-typing the handful of
 * node shapes that carry classes is far less brittle than five visitors.
 */
function transform(node, seen) {
  if (!node || typeof node !== 'object') return;
  seen = seen || new Set();
  if (seen.has(node)) return;
  seen.add(node);

  if (Array.isArray(node)) {
    for (const child of node) transform(child, seen);
    return;
  }

  /* ── HTML / Vue / Angular: { type: 'attribute', name, value } ── */
  if (node.type === 'attribute' && CLASS_ATTRIBUTES.has(node.name)) {
    node.value = sortIfString(node.value);
  }

  /* ── JSX: JSXAttribute > name.name + value.value ── */
  if (node.type === 'JSXAttribute' && node.name && CLASS_ATTRIBUTES.has(node.name.name)) {
    const v = node.value;
    if (v && v.type === 'Literal' && typeof v.value === 'string') {
      v.value = sortClasses(v.value);
      if (v.raw) v.raw = v.raw[0] + v.value + v.raw[v.raw.length - 1];
    } else if (v && v.type === 'StringLiteral') {
      v.value = sortClasses(v.value);
      if (v.extra) { v.extra.raw = v.extra.raw[0] + v.value + v.extra.raw.slice(-1); v.extra.rawValue = v.value; }
    } else if (v && v.type === 'JSXExpressionContainer') {
      transformExpression(v.expression, seen);
    }
  }

  /* ── cn('…', '…') / clsx(…) argument lists ── */
  if ((node.type === 'CallExpression' || node.type === 'OptionalCallExpression') &&
      node.callee && CLASS_FUNCTIONS.has(node.callee.name)) {
    for (const arg of node.arguments || []) transformExpression(arg, seen);
  }

  for (const key of Object.keys(node)) {
    // `parent`/`loc` back-references would send the walk into a cycle; `seen`
    // guards correctness, skipping them keeps it cheap.
    if (key === 'parent' || key === 'loc' || key === 'range') continue;
    transform(node[key], seen);
  }
}

/** Rewrite class strings inside an expression: literals, ternaries, template heads. */
function transformExpression(expr, seen) {
  if (!expr || typeof expr !== 'object') return;

  if (expr.type === 'StringLiteral' || (expr.type === 'Literal' && typeof expr.value === 'string')) {
    const sorted = sortClasses(expr.value);
    expr.value = sorted;
    if (expr.extra) { expr.extra.raw = expr.extra.raw[0] + sorted + expr.extra.raw.slice(-1); expr.extra.rawValue = sorted; }
    if (expr.raw) expr.raw = expr.raw[0] + sorted + expr.raw[expr.raw.length - 1];
    return;
  }
  if (expr.type === 'ConditionalExpression') {
    transformExpression(expr.consequent, seen);
    transformExpression(expr.alternate, seen);
    return;
  }
  if (expr.type === 'LogicalExpression') {
    transformExpression(expr.left, seen);
    transformExpression(expr.right, seen);
    return;
  }
  if (expr.type === 'TemplateLiteral') {
    // Only the static chunks are safe to sort; interpolations may concatenate
    // with the text either side of them.
    for (const q of expr.quasis || []) {
      if (q.value && typeof q.value.raw === 'string' && !/[{}$]/.test(q.value.raw)) {
        const sorted = sortClasses(q.value.raw);
        q.value.raw = sorted;
        q.value.cooked = sorted;
      }
    }
    return;
  }
  if (expr.type === 'ArrayExpression') {
    for (const el of expr.elements || []) transformExpression(el, seen);
    return;
  }
  if (expr.type === 'ObjectExpression') {
    // { 'btn-lg': isLarge } — the KEY is the class list.
    for (const prop of expr.properties || []) {
      if (prop.key) transformExpression(prop.key, seen);
    }
    return;
  }
  transform(expr, seen);
}

/** Wrap one of Prettier's parsers so the AST is sorted before printing. */
function wrap(parser) {
  return Object.assign({}, parser, {
    parse(text, optionsOrParsers, maybeOptions) {
      // Prettier 3: parse(text, options). Prettier 2: parse(text, parsers, options).
      const result = parser.parse(text, optionsOrParsers, maybeOptions);
      if (result && typeof result.then === 'function') {
        return result.then(ast => { transform(ast); return ast; });
      }
      transform(result);
      return result;
    },
  });
}

/**
 * Prettier resolves parsers lazily, so requiring every language up front would
 * make the plugin depend on parsers the user may not have installed.
 */
function loadParsers() {
  const out = {};
  const SOURCES = [
    ['prettier/parser-html', ['html', 'vue', 'angular', 'lwc']],
    ['prettier/parser-babel', ['babel', 'babel-flow', '__babel_expression']],
    ['prettier/parser-typescript', ['typescript']],
    ['prettier/plugins/html', ['html', 'vue', 'angular', 'lwc']],
    ['prettier/plugins/babel', ['babel', 'babel-flow']],
    ['prettier/plugins/typescript', ['typescript']],
  ];
  for (const [id, names] of SOURCES) {
    let mod;
    try { mod = require(id); } catch (e) { continue; }
    const parsers = mod.parsers || (mod.default && mod.default.parsers);
    if (!parsers) continue;
    for (const name of names) {
      if (parsers[name] && !out[name]) out[name] = wrap(parsers[name]);
    }
  }
  return out;
}

module.exports = {
  parsers: loadParsers(),
  // Exposed so an ESLint rule or codemod can reuse the same ordering.
  sortClasses,
  transform,
};

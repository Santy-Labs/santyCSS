# Contributing to SantyCSS

Thanks for helping make SantyCSS better!

## How the framework is built

All CSS is **generated** by `build.js` — never edit the `.css` files in the repo root
or `dist/` by hand. Change the generator, rebuild, and commit both together.

```bash
git clone https://github.com/Santy-Labs/santyCSS.git
cd santyCSS
node build.js          # regenerate every bundle into ./ and ./dist/
node test/run-tests.js # run the regression suite
# or simply:
npm test               # build + test in one step
```

There are no runtime dependencies; Node 18+ is all you need.

## Repository layout

| Path | What it is |
| --- | --- |
| `build.js` | The generator — design tokens, utilities, variants, components |
| `santy-jit.js` | Runtime JIT engine (generates classes on the fly in the browser) |
| `cli.js` | `npx santycss` CLI (`init`, `build`, `purge`, `classes`) |
| `postcss/`, `vite-plugin-santycss.js` | Build-tool integrations |
| `lib/purge-core.js`, `purge.js` | Tree-shaking / purge tooling |
| `migrate.js` | Tailwind → SantyCSS migration tool |
| `test/run-tests.js` | Regression suite (runs in CI) |
| `dist/` | Files published to npm — generated, do not hand-edit |
| `*.html` | Documentation site pages |

## Making a change

1. Fork and create a branch.
2. Edit `build.js` (or the relevant tool file).
3. Run `npm test` — the suite must stay green.
4. Commit the regenerated CSS along with your source change. CI fails if the
   committed CSS doesn't match what `build.js` produces.
5. If you add user-facing classes or features, update `README.md`, the relevant
   docs page, and `CHANGELOG.md`.
6. Open a pull request describing *what* changed and *why*.

## Naming conventions

Class names are **plain English, verb-first** where natural:
`make-flex`, `add-padding-16`, `round-corners-8`, `set-text-20`, `on-mobile:make-hidden`.
New utilities should read like an instruction, not an abbreviation.

## Reporting bugs

Open a GitHub issue with the class names involved, the expected CSS, and the
generated CSS (grep the bundle or check `santy-classmap.json`).

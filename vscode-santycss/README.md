# SantyCSS IntelliSense

Autocomplete, hover docs, and CSS preview for [SantyCSS](https://santycss.santy.in) — the plain-English utility CSS framework.

## Features

### Autocomplete
Start typing any SantyCSS class inside `class=""` or `className=""` and get instant completions with CSS previews.

![Autocomplete demo](https://santycss.santy.in/assets/vscode-autocomplete.gif)

Works in: HTML, JSX, TSX, Vue, Svelte, PHP, ERB.

### Hover docs
Hover over any SantyCSS class to see the CSS it generates.

```html
<div class="make-flex align-center gap-16 add-padding-24">
  <!-- Hover any class to see its CSS -->
</div>
```

### Plain-English class names
SantyCSS classes read like English — no memorizing cryptic abbreviations:

| SantyCSS | What it does |
|---|---|
| `make-flex` | `display: flex` |
| `add-padding-16` | `padding: 16px` |
| `set-text-24` | `font-size: 24px` |
| `background-blue-500` | `background-color: #3b82f6` |
| `on-hover:scale-110` | Scale up on hover |
| `md:grid-cols-3` | 3 columns on medium+ screens |

## Installation

Search **"SantyCSS IntelliSense"** in the VS Code Extensions panel, or install from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=SantyCSS.santycss-intellisense).

## Settings

| Setting | Default | Description |
|---|---|---|
| `santycss.enabled` | `true` | Enable/disable IntelliSense |
| `santycss.showCSSOnHover` | `true` | Show CSS output on hover |
| `santycss.completionTrigger` | `"both"` | `"classAttr"` (inside class only), `"anywhere"`, or `"both"` |

## Commands

- **SantyCSS: Toggle IntelliSense** — quickly enable/disable via Command Palette (`Ctrl+Shift+P`)

## About SantyCSS

SantyCSS is a utility-first CSS framework with 5,100+ classes and no build step required.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/santycss@2/dist/santy.css">
```

→ [santycss.santy.in](https://santycss.santy.in)

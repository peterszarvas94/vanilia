# Vanilia

A drop-in, framework-agnostic `<vanilia-editor>` Web Component powered by a pinned, bundled [Fastmail Squire](https://github.com/fastmail/Squire) 2.4.11 core (MIT) and modern Web & CSS Platform APIs — paired with a lightweight **Go + Datastar SSE** demo backend.

**Live demo:** https://vanilia.peterszarvas.hu

## Features

- **No Build Step for Users**: One readable ES module with types and modern CSS (`@layer`, native CSS Nesting, `@container`, `light-dark()`, `oklch()`, `@starting-style`, `::highlight()`).
- **Drop-In Form-Associated Custom Element (`ElementInternals`)**: `<vanilia-editor name="content" upload-url="/api/upload">` works natively with `<form>` / `FormData` as well as hypermedia frameworks like **Datastar** (`data-on:editorupdate`, `data-effect`, `data-ignore` on internal surface mutations).
- **Custom TipTap-style Image Resize & Upload Plugin** ([`src/extensions/image-resize.ts`](./src/extensions/image-resize.ts)):
  - 6 aspect-ratio drag handles (desktop & touch-scroll-locked mobile) + live pixel/percent dimension badge.
  - Floating native `popover="manual"` toolbar with `25%` / `50%` / `75%` / `100%` presets, Left / Center / Right alignment, inline Alt-text editor, and Delete.
  - Full Undo/Redo integration, drag-and-drop image upload, clipboard image paste, and file picker (`POST /api/upload`).
- **Configurable Toolbar & Custom Buttons**: `toolbar` / `bubble-menu` layouts, `addButton()` / `defineButton()` with icons, shortcuts and active state.
- **Labels, Icons & Themes**: translate every label (`setLabels`, `<template data-ve-labels>`), replace any icon, and theme with `--ve-*` tokens, `theme="dark"` or typed `setTheme()`.
- **Floating Selection Bubble Toolbar** ([`src/extensions/bubble-menu.ts`](./src/extensions/bubble-menu.ts)): Native Popover API + CSS Anchor Positioning.
- **Non-Destructive Find & Replace** ([`src/extensions/find-replace.ts`](./src/extensions/find-replace.ts)): Native CSS Custom Highlight API (`CSS.highlights`).
- **Defense-in-Depth Sanitization**: Client-side allowlist `<template>` sanitizer ([`src/sanitizer.ts`](./src/sanitizer.ts)) + server-side `bluemonday` allowlist sanitizer ([`cmd/server/utils.go`](./cmd/server/utils.go)).
- **Go Demo Server** ([`cmd/server/`](./cmd/server/)): Hosts the docs, generic examples and interactive stack demos (script tag, Datastar SSE, htmx, Alpine.js, React 19), plus server-side HTML sanitization and bounded in-memory image uploads (`POST /api/upload`, `GET /uploads/:id`).

## Install from npm

```sh
npm install vanilia-editor
```

```js
import "vanilia-editor"; // registers <vanilia-editor>
import "vanilia-editor/vanilia-editor.css";
```

## Script tag

No import map, no module, no build step: one stylesheet and one classic script, [`dist/vanilia-editor.iife.js`](./dist/vanilia-editor.iife.js) (~53 kB gzipped, readable, Squire built in). It registers `<vanilia-editor>` and puts the API on `window.Vanilia`. Link the hosted deployment (CORS-enabled), a CDN (jsDelivr or unpkg, from 0.2.0), or copy the files into your project:

```html
<link rel="stylesheet" href="https://vanilia.peterszarvas.hu/dist/vanilia-editor.css" />
<script src="https://vanilia.peterszarvas.hu/dist/vanilia-editor.iife.js" defer></script>

<form method="POST" action="/save">
  <vanilia-editor name="content" placeholder="Start writing..."></vanilia-editor>
  <button type="submit">Save</button>
</form>

<script>
  document.addEventListener("DOMContentLoaded", () => {
    Vanilia.setLabels({ placeholder: "Write a reply..." });
  });
</script>
```

## ES module with an import map

The same editor as one ES module: [`dist/vanilia-editor.js`](./dist/vanilia-editor.js) (~52 kB gzipped, no imports of its own) with optional types in [`dist/vanilia-editor.d.ts`](./dist/vanilia-editor.d.ts), next to [`dist/vanilia-editor.css`](./dist/vanilia-editor.css) (~4 kB gzipped). Map the module once in your base layout:

```html
<script type="importmap">
  {
    "imports": {
      "vanilia-editor": "https://vanilia.peterszarvas.hu/dist/vanilia-editor.js"
    }
  }
</script>
<link rel="stylesheet" href="https://vanilia.peterszarvas.hu/dist/vanilia-editor.css" />
<script type="module">
  import "vanilia-editor";
</script>
```

With a bundler (Vite, esbuild, ...) no import map is needed: import the copied `vanilia-editor.js` and `vanilia-editor.css` directly.

## Using the editor

- **Forms:** `<vanilia-editor>` is form-associated (`ElementInternals`), so `name`, `required`, `disabled`, `FormData`, and `form.reset()` work natively.
- **Events & API:** emits `input`, `change`, `editorupdate` and `ve:update`; `.value`, `.getHTML()`, `.setHTML(html)`, `.getText()`, `.insertHTML(html)`, `.insertText(text)`, `.exec(cmd)`, `.addButton(button)`, `.setLabels(map)`, `.setTheme(tokens)` and more ([full API](https://vanilia.peterszarvas.hu/docs/api)).
- **Images:** works out of the box with no backend (falls back to inline `data:` URLs). For server uploads, set `upload-url="/api/upload"` (raw binary `POST` returning `{ "url": "..." }`) or assign `editor.onImageUpload = async (file) => url`.
- **Rendered output:** add `class="ve-prose"` to any container rendering saved HTML to match the editor's typography and image alignment.

## Configuration

### Toolbar

Pick and order the buttons with `toolbar` (`|` separates groups), configure the selection menu with `bubble-menu`, or turn either off with `"none"`. Both are also properties that take a string or an array.

```html
<vanilia-editor
  toolbar="bold italic link | h2 h3 | bulletList orderedList | undo redo"
  bubble-menu="bold italic | link"
></vanilia-editor>
```

Add your own buttons to one editor with `editor.addButton()` or to every editor with `defineButton()`. They can be used in layouts, run with `editor.exec(name)`, and bind a keyboard shortcut:

```js
import { defineButton } from "vanilia-editor";

defineButton({
  name: "signature",
  label: "Insert signature",
  icon: "<svg>…</svg>", // or the name of an icon
  shortcut: "Mod+Shift+S", // ⌘ on macOS, Ctrl elsewhere
  run: (editor) => editor.insertHTML("<p>— Peter</p>"),
  isActive: (editor) => false, // optional pressed state
});
```

With `toolbar="none"` you can build your own toolbar from plain buttons that call `editor.exec("bold")` and read the active state from `ve:update` / `editorupdate` (`evt.detail.active.bold`, `canUndo`, …).

### Styling and themes

All editor styles live inside `@layer ve-tokens, ve-base, ve-chrome, ve-surface, ve-popovers`, so any unlayered CSS in your project overrides them. Set `--ve-*` tokens globally on `:root` or per editor:

```css
vanilia-editor {
  --ve-accent: #e11d48; /* derives soft/ring/hover states automatically */
  --ve-radius: 8px;
  --ve-max-height: 520px; /* scroll inside the editor beyond this */
}
```

Colors use `light-dark()` and follow the page's `color-scheme`; `theme="dark"` / `"light"` pins one editor. From JavaScript, `setTheme()` (every editor) and `editor.setTheme()` (one editor) write the same tokens with typed camelCase names:

```js
import { setTheme } from "vanilia-editor";
setTheme({ accent: "#e11d48", fontSans: "Inter, sans-serif" });
editor.setTheme({ accent: user.brandColor });
```

Tokens: `--ve-accent`, `--ve-accent-contrast`, `--ve-accent-soft`, `--ve-accent-ring`, `--ve-accent-border`, `--ve-accent-hover`, `--ve-danger`, `--ve-danger-soft`, `--ve-bg`, `--ve-surface-bg`, `--ve-chrome-bg`, `--ve-popover-bg`, `--ve-border`, `--ve-border-strong`, `--ve-text`, `--ve-text-muted`, `--ve-hover-bg`, `--ve-code-bg`, `--ve-shadow`, `--ve-radius`, `--ve-radius-sm`, `--ve-min-height`, `--ve-max-height`, `--ve-padding-x`, `--ve-padding-y`, `--ve-font-size`, `--ve-line-height`, `--ve-font-sans`, `--ve-font-mono`, `--ve-highlight-bg`, `--ve-highlight-active-bg`, `--ve-highlight-active-text`, `--ve-icon-size`, `--ve-icon-size-sm`, `--ve-icon-stroke`. The stable classes for direct styling (`.ve-toolbar`, `.ve-btn`, `.ve-surface`, …) are listed in the [styling docs](https://vanilia.peterszarvas.hu/docs/styling#classes).

### Icons

The built-in icons are inlined Lucide-compatible SVGs. Resize them with `--ve-icon-size` / `--ve-icon-size-sm` / `--ve-icon-stroke`, or replace any of them with your own markup:

```html
<vanilia-editor>
  <template data-ve-icon="bold"><svg viewBox="0 0 256 256">…</svg></template>
</vanilia-editor>
```

```js
import { setIcons } from "vanilia-editor";
setIcons({ undo: "<svg>…</svg>", redo: null }); // every editor; null restores a default
editor.setIcons({ italic: '<i class="ph ph-text-italic"></i>' }); // one editor
```

### Labels and translation

Every text the editor shows (tooltips, popovers, find & replace, word count, status and validation messages) is a named label. Override them per editor in HTML or JavaScript, or for the whole page:

```html
<vanilia-editor>
  <template data-ve-labels
    >{ "bold": "Fett", "placeholder": "Schreib los...", "wordCount": "{count} Wörter" }</template
  >
</vanilia-editor>
```

```js
import { setLabels } from "vanilia-editor";
setLabels({ bold: "Fett", italic: "Kursiv" });
editor.setLabels({ wordCount: ({ count }) => `${count} ${count === 1 ? "Wort" : "Wörter"}` });
```

### Keyboard shortcuts

Every shortcut maps keys to a command or custom button, and all of them can be changed, added or removed: per editor with `<template data-ve-shortcuts>` or `editor.setShortcuts()`, for the whole page with `setShortcuts()`, or all at once with `shortcuts="none"`. Tooltips follow along.

```js
import { setShortcuts, deleteShortcuts, restoreDefaultShortcuts } from "vanilia-editor";
setShortcuts({ strike: "Mod+Shift+S", h2: "Mod+Alt+2" });
deleteShortcuts("find");
restoreDefaultShortcuts("find");

editor.deleteShortcuts("underline");
editor.restoreDefaultShortcuts("underline");
editor.restoreDefaultShortcuts(); // restore all local overrides
editor.getShortcuts(); // { bold: ["Mod+B"], ... }
```

Defaults and syntax: [keyboard shortcuts docs](https://vanilia.peterszarvas.hu/docs/shortcuts).

The full JavaScript API (properties, methods, static members and module exports) is documented at [vanilia.peterszarvas.hu/docs/api](https://vanilia.peterszarvas.hu/docs/api).

## Credits

The logo and favicon use the [Vanilla outline icon](https://www.svgrepo.com/svg/447094/vanilla) from SVG Repo, listed under [CC0](https://creativecommons.org/publicdomain/zero/1.0/), with rounded strokes and a blue rounded-square background. The header and standalone demo reuse the favicon SVG. Squire is MIT-licensed by Neil Jenkins and Fastmail.

## Credits

The logo and favicon use the [vanilla flower](https://game-icons.net/1x1/lorc/vanilla-flower.html) icon by [Lorc](https://lorcblog.blogspot.com) from [game-icons.net](https://game-icons.net), licensed [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) (placed on a rounded square). Squire is MIT-licensed by Neil Jenkins and Fastmail.

## Local Development

The Go server also hosts the project website: home (`/`), docs (`/docs`), generic code-only examples (`/examples`) and interactive stack demos (`/demos`: script tag, Datastar, htmx, Alpine.js and React 19 — each live alongside its code and Go server handler). Pages live in `templates/` with shared layout in `templates/_layout.html` and site styles in `static/site.css`. Snippets live in `templates/examples/` and are registered in `cmd/server/pages.go` (`exampleIndex` for generic examples, `demoIndex` for interactive demos). Optional extras: `<slug>.notes.html` is shown under the code, and a `// region <slug>` block in `cmd/server/integrations.go` is shown as the server code.

Start the Go + Datastar server:

```bash
go run ./cmd/server
# or persistently on :4173:
./scripts/dev-server.sh start
```

The editor is TypeScript in `src/`, built with [Vite+](https://viteplus.dev) (`vp`): `vp pack` bundles it into `dist/`, `vp check` formats (Oxfmt), lints and type-checks (Oxlint), `vp test` runs Vitest. Squire comes from npm at a pinned version (`squire-rte` in `package.json`).

```bash
npm install
npm run build   # vp pack: dist/vanilia-editor.{js,iife.js,d.ts,css}
npm run check   # vp check
npm test        # vp test
go test ./...
```

React demo assets are pinned in `package.json` and committed in `static/vendor/`. After updating React, run `npm run build:react-demo` to rebuild the shared runtime and renderer.

See [`DOCKER.md`](./DOCKER.md) for container deployment and [`PLAN.md`](./PLAN.md) for the prior-art architecture research.

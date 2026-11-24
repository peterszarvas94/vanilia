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
- **Floating Selection Bubble Toolbar** ([`src/extensions/bubble-menu.ts`](./src/extensions/bubble-menu.ts)): Native Popover API + CSS Anchor Positioning.
- **Non-Destructive Find & Replace** ([`src/extensions/find-replace.ts`](./src/extensions/find-replace.ts)): Native CSS Custom Highlight API (`CSS.highlights`).
- **Defense-in-Depth Sanitization**: Client-side allowlist `<template>` sanitizer ([`src/sanitizer.ts`](./src/sanitizer.ts)) + server-side `bluemonday` allowlist sanitizer ([`cmd/server/utils.go`](./cmd/server/utils.go)).
- **Go + Datastar SSE Backend** ([`cmd/server/`](./cmd/server/)): Per-session persistence (`GET /content`, `PATCH /content`, `POST /reset`), live Datastar signals & SSE-rendered preview, and bounded in-memory image uploads (`POST /api/upload`, `GET /uploads/:id`).

## Install from npm

```sh
npm install vanilia-editor
```

```js
import "vanilia-editor"; // registers <vanilia-editor>
import "vanilia-editor/vanilia-editor.css";
```

## Drop-In Integration (ESM + import map)

One ES module and one stylesheet, no build step: [`dist/vanilia-editor.js`](./dist/vanilia-editor.js) (~44 kB gzipped, readable, Squire built in, no imports), [`dist/vanilia-editor.css`](./dist/vanilia-editor.css) (~4 kB gzipped) and optional types in [`dist/vanilia-editor.d.ts`](./dist/vanilia-editor.d.ts). Copy them into your project or link the hosted deployment (CORS-enabled). Map the module once in your base layout:

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

<form method="POST" action="/save">
  <vanilia-editor name="content" placeholder="Start writing..."></vanilia-editor>
  <button type="submit">Save</button>
</form>
```

With a bundler (Vite, esbuild, ...) no import map is needed: import the copied `vanilia-editor.js` and `vanilia-editor.css` directly.

- **Forms:** `<vanilia-editor>` is form-associated (`ElementInternals`), so `name`, `required`, `disabled`, `FormData`, and `form.reset()` work natively.
- **Events & API:** listens/emits `input`, `change`, `editorupdate`, and `ve:update`; supports `.value`, `.getHTML()`, `.setHTML(html)`, `.getText()`, `.exec(cmd)`.
- **Images:** works out of the box with no backend (falls back to inline `data:` URLs). For server uploads, set `upload-url="/api/upload"` (raw binary `POST` returning `{ "url": "..." }`) or assign `editor.onImageUpload = async (file) => url`.
- **Rendered output:** add `class="ve-prose"` to any container rendering saved HTML to match the editor's typography and image alignment.
- **Regenerate `dist/` after editing `src/`:** `npm run build` and commit `dist/` (the Docker image has no Node).

### Styling with CSS Variables

All editor styles live inside `@layer ve-tokens, ve-base, ve-chrome, ve-surface, ve-popovers`, so any unlayered CSS in your project overrides them cleanly. Override tokens globally on `:root` or per-instance on `vanilia-editor`:

```css
:root {
  --ve-accent: #e11d48; /* derives soft/ring/hover states automatically */
  --ve-radius: 8px;
  --ve-min-height: 220px;
  --ve-max-height: 520px; /* enables internal scrolling when set */
  --ve-font-size: 16px;
}
```

Available tokens: `--ve-accent`, `--ve-accent-contrast`, `--ve-accent-soft`, `--ve-accent-ring`, `--ve-accent-border`, `--ve-accent-hover`, `--ve-danger`, `--ve-danger-soft`, `--ve-bg`, `--ve-surface-bg`, `--ve-chrome-bg`, `--ve-popover-bg`, `--ve-border`, `--ve-border-strong`, `--ve-text`, `--ve-text-muted`, `--ve-hover-bg`, `--ve-code-bg`, `--ve-shadow`, `--ve-radius`, `--ve-radius-sm`, `--ve-min-height`, `--ve-max-height`, `--ve-padding-x`, `--ve-padding-y`, `--ve-font-size`, `--ve-line-height`, `--ve-font-sans`, `--ve-font-mono`, `--ve-highlight-bg`, `--ve-highlight-active-bg`, `--ve-highlight-active-text`, `--ve-icon-size`, `--ve-icon-size-sm`, `--ve-icon-stroke`.

### Icons

The built-in icons are inlined Lucide-compatible SVGs (no icon library needed). Three ways to adapt them:

1. **Size and stroke** via CSS: `--ve-icon-size` (16px), `--ve-icon-size-sm` (14px, bubble menu and popovers), `--ve-icon-stroke` (2).
2. **Replace icons** with any markup (inline SVG, icon-font `<i>`, `<img>`, Templ/Templucid output). Icons you don't override keep the default.

   ```html
   <!-- one editor -->
   <vanilia-editor>
     <template data-ve-icon="bold"><svg viewBox="0 0 256 256">…</svg></template>
   </vanilia-editor>
   ```

   ```js
   import { VaniliaEditorElement } from "vanilia-editor";
   // every editor on the page (re-renders already mounted editors); pass null to restore a default
   VaniliaEditorElement.setIcons({ undo: "<svg>…</svg>", redo: null });
   // one editor from JS
   document
     .querySelector("vanilia-editor")
     .setIcons({ italic: '<i class="ph ph-text-italic"></i>' });
   ```

   Icon names: `VaniliaEditorElement.iconNames` (`bold`, `italic`, `underline`, `strike`, `code`, `paragraph`, `h1`–`h3`, `bulletList`, `orderedList`, `quote`, `hr`, `alignLeft`, `alignCenter`, `alignRight`, `link`, `image`, `clear`, `undo`, `redo`, `search`, `upload`, `trash`, `check`, `x`, …).

3. **Bring your own toolbar** with `toolbar="none"`: the built-in toolbar is hidden and your own buttons call `editor.exec("bold")`. Active state comes from `ve:update` / `editorupdate` (`evt.detail.active.bold`, `.h2`, `.alignCenter`, …, plus `canUndo` / `canRedo`). The bubble menu, image handles, link/image popovers (anchored to the selection) and Find & Replace keep working.

   ```html
   <button
     data-on:mousedown="evt.preventDefault()"
     data-on:click="document.getElementById('post').exec('bold')"
     data-class:is-active="$bold"
   >
     …
   </button>
   <vanilia-editor
     id="post"
     toolbar="none"
     data-on:editorupdate="$bold = evt.detail.active.bold"
   ></vanilia-editor>
   ```

## Credits

The logo and favicon use the [vanilla flower](https://game-icons.net/1x1/lorc/vanilla-flower.html) icon by [Lorc](https://lorcblog.blogspot.com) from [game-icons.net](https://game-icons.net), licensed [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) (placed on a rounded square). Squire is MIT-licensed by Neil Jenkins and Fastmail.

## Local Development

The Go server also hosts the project website: home (`/`), docs (`/docs`), examples (`/examples`, including Datastar, htmx and Alpine.js integrations) and the Go + Datastar demo (`/demo`). Pages live in `templates/` with shared layout in `templates/_layout.html` and site styles in `static/site.css`. Each example in `templates/examples/` is rendered live and shown as source from the same file; register new ones in `cmd/server/pages.go`. Optional extras: `<slug>.notes.html` is shown under the code, and a `// region <slug>` block in `cmd/server/integrations.go` is shown as the server code.

Start the Go + Datastar server:

```bash
go run ./cmd/server
# or persistently on :4173:
./scripts/dev-server.sh start
```

The editor is TypeScript in `src/`, built with [Vite+](https://viteplus.dev) (`vp`): `vp pack` bundles it into `dist/`, `vp check` formats (Oxfmt), lints and type-checks (Oxlint), `vp test` runs Vitest. Squire comes from npm at a pinned version (`squire-rte` in `package.json`).

```bash
npm install
npm run build   # vp pack: dist/vanilia-editor.{js,d.ts,css}
npm run check   # vp check
npm test        # vp test
go test ./...
```

See [`DOCKER.md`](./DOCKER.md) for container deployment and [`PLAN.md`](./PLAN.md) for the prior-art architecture research.

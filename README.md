# Vanilia

A drop-in, zero-build-step, framework-agnostic `<vanilia-editor>` Web Component powered by a vendored [Fastmail Squire](https://github.com/fastmail/Squire) v2.4.11 core (~16 kB gzipped, MIT) and modern Web & CSS Platform APIs — paired with a lightweight **Go + Datastar SSE** demo backend.

**Live demo:** https://wysiwyg.peterszarvas.hu

## Features

- **Zero JS/CSS Build Step**: Pure ES modules and modern CSS (`@layer`, native CSS Nesting, `@container`, `light-dark()`, `oklch()`, `@starting-style`, `::highlight()`).
- **Drop-In Form-Associated Custom Element (`ElementInternals`)**: `<vanilia-editor name="content" upload-url="/api/upload">` works natively with `<form>` / `FormData` as well as hypermedia frameworks like **Datastar** (`data-on:editorupdate`, `data-effect`, `data-ignore` on internal surface mutations).
- **Custom TipTap-style Image Resize & Upload Plugin** ([`src/extensions/image-resize.js`](./src/extensions/image-resize.js)):
  - 6 aspect-ratio drag handles (desktop & touch-scroll-locked mobile) + live pixel/percent dimension badge.
  - Floating native `popover="manual"` toolbar with `25%` / `50%` / `75%` / `100%` presets, Left / Center / Right alignment, inline Alt-text editor, and Delete.
  - Full Undo/Redo integration, drag-and-drop image upload, clipboard image paste, and file picker (`POST /api/upload`).
- **Floating Selection Bubble Toolbar** ([`src/extensions/bubble-menu.js`](./src/extensions/bubble-menu.js)): Native Popover API + CSS Anchor Positioning.
- **Non-Destructive Find & Replace** ([`src/extensions/find-replace.js`](./src/extensions/find-replace.js)): Native CSS Custom Highlight API (`CSS.highlights`).
- **Defense-in-Depth Sanitization**: Client-side allowlist `<template>` sanitizer ([`src/sanitizer.js`](./src/sanitizer.js)) + server-side `bluemonday` allowlist sanitizer ([`cmd/server/utils.go`](./cmd/server/utils.go)).
- **Go + Datastar SSE Backend** ([`cmd/server/`](./cmd/server/)): Per-session persistence (`GET /content`, `PATCH /content`, `POST /reset`), live Datastar signals & SSE-rendered preview, and bounded in-memory image uploads (`POST /api/upload`, `GET /uploads/:id`).

## Drop-In Integration (1 JS + 1 CSS)

Copy [`dist/vanilia-editor.js`](./dist/vanilia-editor.js) (~36 kB gzipped, includes Squire) and [`dist/vanilia-editor.css`](./dist/vanilia-editor.css) (~4 kB gzipped) into any project — or link directly from the hosted deployment (CORS-enabled) or jsDelivr:

```html
<link rel="stylesheet" href="https://wysiwyg.peterszarvas.hu/dist/vanilia-editor.css" />
<script type="module" src="https://wysiwyg.peterszarvas.hu/dist/vanilia-editor.js"></script>

<form method="POST" action="/save">
  <vanilia-editor name="content" placeholder="Start writing..."></vanilia-editor>
  <button type="submit">Save</button>
</form>
```

- **Forms:** `<vanilia-editor>` is form-associated (`ElementInternals`), so `name`, `required`, `disabled`, `FormData`, and `form.reset()` work natively.
- **Events & API:** listens/emits `input`, `change`, `editorupdate`, and `ve:update`; supports `.value`, `.getHTML()`, `.setHTML(html)`, `.getText()`, `.exec(cmd)`.
- **Images:** works out of the box with no backend (falls back to inline `data:` URLs). For server uploads, set `upload-url="/api/upload"` (raw binary `POST` returning `{ "url": "..." }`) or assign `editor.onImageUpload = async (file) => url`.
- **Rendered output:** add `class="ve-prose"` to any container rendering saved HTML to match the editor's typography and image alignment.
- **Regenerate `dist/` after editing `src/`:** `node scripts/pack.mjs` (verify sync with `node scripts/pack.mjs --check`).

### Styling with CSS Variables

All editor styles live inside `@layer ve-tokens, ve-base, ve-chrome, ve-surface, ve-popovers`, so any unlayered CSS in your project overrides them cleanly. Override tokens globally on `:root` or per-instance on `vanilia-editor`:

```css
:root {
  --ve-accent: #e11d48;       /* derives soft/ring/hover states automatically */
  --ve-radius: 8px;
  --ve-min-height: 220px;
  --ve-max-height: 520px;     /* enables internal scrolling when set */
  --ve-font-size: 16px;
}
```

Available tokens: `--ve-accent`, `--ve-accent-contrast`, `--ve-accent-soft`, `--ve-accent-ring`, `--ve-accent-border`, `--ve-accent-hover`, `--ve-danger`, `--ve-danger-soft`, `--ve-bg`, `--ve-surface-bg`, `--ve-chrome-bg`, `--ve-popover-bg`, `--ve-border`, `--ve-border-strong`, `--ve-text`, `--ve-text-muted`, `--ve-hover-bg`, `--ve-code-bg`, `--ve-shadow`, `--ve-radius`, `--ve-radius-sm`, `--ve-min-height`, `--ve-max-height`, `--ve-padding-x`, `--ve-padding-y`, `--ve-font-size`, `--ve-line-height`, `--ve-font-sans`, `--ve-font-mono`, `--ve-highlight-bg`, `--ve-highlight-active-bg`, `--ve-highlight-active-text`.

## Local Development

Start the Go + Datastar server:

```bash
go run ./cmd/server
# or persistently on :4173:
./scripts/dev-server.sh start
```

Pack drop-in bundle & run tests:

```bash
node scripts/pack.mjs
go test ./...
node --test
```

See [`DOCKER.md`](./DOCKER.md) for container deployment and [`PLAN.md`](./PLAN.md) for the prior-art architecture research.

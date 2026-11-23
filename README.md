# Vanilla WYSIWYG + Datastar

A drop-in, zero-build-step, framework-agnostic `<vanilla-editor>` Web Component powered by a vendored [Fastmail Squire](https://github.com/fastmail/Squire) v2.4.11 core (~16 kB gzipped, MIT) and modern Web & CSS Platform APIs — paired with a lightweight **Go + Datastar SSE** demo backend.

**Live demo:** https://wysiwyg.peterszarvas.hu

## Features

- **Zero JS/CSS Build Step**: Pure ES modules and modern CSS (`@layer`, native CSS Nesting, `@container`, `light-dark()`, `oklch()`, `@starting-style`, `::highlight()`).
- **Drop-In Form-Associated Custom Element (`ElementInternals`)**: `<vanilla-editor name="content" upload-url="/api/upload">` works natively with `<form>` / `FormData` as well as hypermedia frameworks like **Datastar** (`data-on:editorupdate`, `data-effect`, `data-ignore` on internal surface mutations).
- **Custom TipTap-style Image Resize & Upload Plugin** ([`src/extensions/image-resize.js`](./src/extensions/image-resize.js)):
  - 6 aspect-ratio drag handles (desktop & touch-scroll-locked mobile) + live pixel/percent dimension badge.
  - Floating native `popover="manual"` toolbar with `25%` / `50%` / `75%` / `100%` presets, Left / Center / Right alignment, inline Alt-text editor, and Delete.
  - Full Undo/Redo integration, drag-and-drop image upload, clipboard image paste, and file picker (`POST /api/upload`).
- **Floating Selection Bubble Toolbar** ([`src/extensions/bubble-menu.js`](./src/extensions/bubble-menu.js)): Native Popover API + CSS Anchor Positioning.
- **Non-Destructive Find & Replace** ([`src/extensions/find-replace.js`](./src/extensions/find-replace.js)): Native CSS Custom Highlight API (`CSS.highlights`).
- **Defense-in-Depth Sanitization**: Client-side allowlist `<template>` sanitizer ([`src/sanitizer.js`](./src/sanitizer.js)) + server-side `bluemonday` allowlist sanitizer ([`cmd/server/utils.go`](./cmd/server/utils.go)).
- **Go + Datastar SSE Backend** ([`cmd/server/`](./cmd/server/)): Per-session persistence (`GET /content`, `PATCH /content`, `POST /reset`), live Datastar signals & SSE-rendered preview, and bounded in-memory image uploads (`POST /api/upload`, `GET /uploads/:id`).

## Local Development

Start the Go + Datastar server:

```bash
go run ./cmd/server
# or persistently on :4173:
./scripts/dev-server.sh start
```

Run tests:

```bash
go test ./...
node --test
```

See [`DOCKER.md`](./DOCKER.md) for container deployment and [`PLAN.md`](./PLAN.md) for the prior-art architecture research.

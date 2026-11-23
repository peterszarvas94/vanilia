# Vanilla WYSIWYG

A drop-in, zero-build-step, framework-agnostic `<vanilla-editor>` Web Component powered by a vendored [Fastmail Squire](https://github.com/fastmail/Squire) v2.4.11 core (~16 kB gzipped, MIT) and modern Web & CSS Platform APIs.

Designed to drop cleanly into **any stack** (Go + Datastar, Rails, HTMX, or plain HTML `<form>`s) with zero npm dependencies at runtime.

## Features

- **Form-Associated Custom Element (`ElementInternals`)**: Drop `<vanilla-editor name="content" required>` into any `<form>` — works natively with `FormData`, `required` validation, `form.reset()`, and `disabled`.
- **Custom TipTap-style Image Resize & Upload Plugin** ([`src/extensions/image-resize.js`](./src/extensions/image-resize.js)):
  - Click any image for 6 aspect-ratio drag handles (4 corners + left/right edges) + live pixel/percent dimension badge.
  - Floating image popover (`popover="manual"`) with `25%` / `50%` / `75%` / `100%` presets, Left / Center / Right alignment, inline Alt-text editor, and Delete button.
  - Full Undo/Redo integration (`Ctrl/Cmd+Z`), keyboard support (`Backspace`/`Delete`/`Esc`/`ArrowLeft`/`ArrowRight`), drag-and-drop image upload, clipboard image paste, and file picker.
  - Stack-agnostic upload hook: set `upload-url="/api/upload"` or assign `editor.onImageUpload = async (file) => url` (falls back to Data URL when unset).
- **Floating Selection Bubble Toolbar** ([`src/extensions/bubble-menu.js`](./src/extensions/bubble-menu.js)): Native Popover API + CSS Anchor Positioning (`position-area: top center`, `position-try-fallbacks: flip-block`).
- **Non-Destructive Find & Replace** ([`src/extensions/find-replace.js`](./src/extensions/find-replace.js)): Powered by the native CSS Custom Highlight API (`CSS.highlights` + `::highlight()`).
- **Zero-Dependency Allowlist HTML Sanitizer** ([`src/sanitizer.js`](./src/sanitizer.js)): Strict `<template>` DOM walker plugged into Squire (no DOMPurify required).
- **Modern CSS** ([`src/styles/editor.css`](./src/styles/editor.css)): `@layer`, native CSS Nesting, `@container`, `light-dark()`, `oklch()` relative accent color derivation, `@starting-style`, and `::highlight()`.

## Local Development

```bash
node server.mjs
```

Then open **http://127.0.0.1:4173** in your browser.

Run unit tests (uses Node's built-in test runner, zero dependencies):

```bash
node --test
```

## Architecture & Prior-Art Plan

See [`PLAN.md`](./PLAN.md) for the research comparison of existing open-source WYSIWYG editors and modern browser APIs.

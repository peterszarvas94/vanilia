# Vanilla WYSIWYG

A zero-dependency, vanilla JavaScript WYSIWYG rich-text editor built exclusively on modern Web Platform & CSS APIs — no frameworks, no build step required, and **no deprecated `document.execCommand()`**.

## Goals

- **Zero dependencies**: Pure ES modules and native CSS. Runs directly in modern browsers without npm packages or a bundler.
- **No `document.execCommand()`**: Uses `contenteditable` strictly as an input/output surface with Input Events Level 2 (`beforeinput`), Selection/Range APIs, and a lightweight internal document model.
- **Modern Web & CSS Platform APIs**: Form-Associated Custom Elements (`ElementInternals`), Popover API, CSS Anchor Positioning, Invoker Commands (`commandfor`/`command`), CSS Custom Highlight API, native `<dialog>`, Cascade Layers (`@layer`), Container Queries (`@container`), `light-dark()`, and native CSS Nesting.
- **Canonical, sanitized semantic HTML5**: Clean output (`<p>`, `<h1>`–`<h3>`, `<ul>`/`<ol>`, `<blockquote>`, `<pre><code>`, `<strong>`, `<em>`, `<a href>`, etc.) with strict allowlist paste sanitization.

## Status

- **Step 1 (Current):** Research of existing open-source WYSIWYG architectures & complete design plan — see [`PLAN.md`](./PLAN.md).
- **Step 2 (Next):** Core document model, serializer, sanitizer, and editing engine implementation.

# Vanilla WYSIWYG — Architecture & Implementation Plan

> **Zero dependencies. Vanilla ES Modules. Modern JavaScript & CSS Web Platform APIs. Zero `document.execCommand()`.**

This document is **Step 1**: a research-backed architecture and phased implementation plan grounded in prior open-source WYSIWYG repositories and modern browser APIs.

---

## 1. Prior Art Research & Lessons Learned

Open-source browser rich-text editors fall into **three architectural generations**. Studying what worked and what broke in existing repositories directly shapes our design.

### Comparison of Reference Repositories

| Repository                                                                  | Generation              | Core Architecture                                                                        | Source of Truth          | Uses `execCommand`? | UI                            | Footprint (min+gzip) | Key Takeaway                                                                                                                                                                                               |
| :-------------------------------------------------------------------------- | :---------------------- | :--------------------------------------------------------------------------------------- | :----------------------- | :------------------ | :---------------------------- | :------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`jaredreich/pell`**                                                       | Gen 1                   | Thin `contenteditable` wrapper                                                           | Raw DOM                  | **Yes**             | Built-in minimal toolbar      | ~1.4 kB              | Proves minimal API ergonomics, but produces browser-divergent HTML and relies on deprecated APIs.                                                                                                          |
| **`yabwe/medium-editor`**                                                   | Gen 1                   | Extension-driven `contenteditable` wrapper                                               | Raw DOM                  | **Yes**             | Built-in floating toolbar     | ~27 kB               | Great inline bubble-toolbar UX, but unmaintained and hamstrung by `execCommand()` quirks.                                                                                                                  |
| **`KaTXi/zero-wysiwyg`** / **`neikiri/neiki-editor`** / **`mdbassit/Wysi`** | Gen 1 (Modern drop-ins) | Single-file zero-dep `<textarea>` enhancers                                              | Raw DOM                  | **Yes**             | Built-in                      | ~12–100 kB           | Show strong developer demand for drop-in zero-dep form editors, yet still inherit `execCommand` fragility.                                                                                                 |
| **`fastmail/Squire`**                                                       | Gen 2                   | Direct DOM + W3C Range/Selection normalizer                                              | Arbitrary HTML DOM       | **No**              | Headless                      | ~16 kB               | Actively maintained in production (Fastmail, ProtonMail, Superhuman). Proves `execCommand` is completely avoidable in small vanilla code, though normalizing arbitrary nested DOM trees is tricky.         |
| **`inokawa/editate`**                                                       | Gen 2                   | Lightweight `beforeinput` normalizer                                                     | Controlled DOM/State     | **No**              | Headless                      | ~5 kB                | Demonstrates modern cross-browser `beforeinput` + IME handling on desktop & mobile without heavy frameworks.                                                                                               |
| **`basecamp/trix`**                                                         | Gen 3                   | Closed Document Model + Web Component (`<trix-editor>`)                                  | Flat internal model      | **No**              | Built-in Custom Element       | ~50 kB               | Treating `contenteditable` strictly as an I/O device yields clean, uniform HTML. However, its rigid _flat_ block model made tables/nested blocks hard, prompting 37signals to build Lexxy (on Lexical).    |
| **`microsoft/roosterjs`**                                                   | Gen 3                   | Plugin engine + on-demand Content Model (`BlockGroup → Block → Segment`)                 | Hybrid (DOM ↔ Model)     | **No** (v9+)        | Headless                      | ~37 kB+              | Shows how to keep arbitrary HTML via fallback segments, but carries enterprise/Outlook complexity we don't need.                                                                                           |
| **`ProseMirror`**                                                           | Gen 3                   | Immutable block tree + flat inline **Marks**, integer offsets, `Step`/`StepMap`          | Canonical Document Model | **No**              | Headless                      | Modular              | **Gold-standard inline model**: flat text runs with mark sets eliminate `<b><i>x</i></b>` vs `<i><b>x</b></i>` ambiguity permanently.                                                                      |
| **`meta/lexical`**                                                          | Gen 3                   | Keyed `NodeMap` tree, bitmask text formats, microtask double-buffering, snapshot history | Canonical Document Model | **No**              | Headless                      | Modular              | **Gold-standard reconciliation**: stable runtime node keys allow O(1) lookup and targeted DOM patching; microtask batching prevents double renders; bounded snapshot history is simple & reliable locally. |
| **`Slate`**                                                                 | Gen 3                   | Plain JSON AST (`Element` + leaf `Text` with mark flags), `normalizeNode` passes         | Canonical Document Model | **No**              | Headless (React-coupled view) | Modular              | **Cleanest mental model**: plain JSON AST with explicit normalization invariants is trivial to inspect, serialize, and unit-test in pure JS.                                                               |
| **`Quill`**                                                                 | Gen 3                   | Flat operational **Delta** + **Parchment** Blots                                         | Delta + Blots            | **No**              | Built-in                      | ~43 kB               | Linear ops are great for OT/diffs, but flat line-newline attributes struggle with nested blocks (quotes, lists, callouts, tables).                                                                         |

### What We Adopt vs. Reject

- **Adopt:**
  1. **Model-driven architecture** (Trix / ProseMirror / Lexical / Slate): `contenteditable` is an I/O surface, never the source of truth.
  2. **Block tree + flat inline runs with mark sets** (ProseMirror / Slate): deterministic, canonical semantic HTML5 without tangled nested tags.
  3. **Stable block IDs + keyed DOM reconciliation** (Lexical): only dirty blocks re-render on each microtask flush, preserving DOM stability and caret smoothness.
  4. **Bounded immutable snapshot history** (Lexical): immune to inverse-operation drift bugs, trivial to test, fast with `structuredClone` and time-window coalescing (~400ms, `maxDepth: 100`).
  5. **`beforeinput` + `getTargetRanges()` interception with `composition` / `input` fallback** (`editate` / Squire / Lexical): zero `document.execCommand()`.
  6. **Form-Associated Web Component packaging** (Trix's `<trix-editor>` DX upgraded with modern `ElementInternals`): drop `<vanilla-editor name="content">` into any HTML `<form>` with zero glue code.
- **Reject:**
  1. `document.execCommand()` and `queryCommandState()` — deprecated and cross-browser inconsistent.
  2. Flat-only document models (Trix/Quill) — blocks should support nesting (e.g. nested lists, blockquotes).
  3. External positioning/UI libraries (Popper/Floating UI), sanitizers (DOMPurify), or CSS frameworks — replaced by native browser APIs.
  4. Premature CRDT/OT multiplayer complexity — keep the core single-user, clean, and synchronous; design state transitions cleanly so collab adapters could be layered later if ever needed.

---

## 2. Modern Web Platform API Strategy (Zero Dependencies)

### JavaScript & HTML APIs

| Platform API                                                                             | Role in Vanilla WYSIWYG                                                                                                                                                                                               | Browser Status (2026)                                   | Implementation / Fallback Strategy                                                                                                                                                                                                                                                 |
| :--------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`contenteditable="true"`**                                                             | Native caret navigation, keyboard focus, spellcheck, screen-reader semantics, mobile virtual keyboard.                                                                                                                | Baseline (Universal)                                    | Always paired with `beforeinput` interception; never trust raw browser mutations.                                                                                                                                                                                                  |
| **Input Events Level 2 (`beforeinput`, `inputType`, `getTargetRanges()`)**               | Intercepts `insertText`, `insertParagraph`, `insertLineBreak`, `deleteContentBackward`, `deleteWordBackward`, `formatBold`, `formatItalic`, `historyUndo`, `historyRedo`, `insertFromPaste`, `insertReplacementText`. | Baseline (Chrome 60+, Safari 10.1+, Firefox 87+)        | Cancel (`preventDefault()`) when `e.cancelable` is true and apply to model; reconcile via `input` event for non-cancelable cases.                                                                                                                                                  |
| **Composition Events (`compositionstart/update/end`)**                                   | Safe CJK IME, dead keys, and mobile swipe/autocorrect typing.                                                                                                                                                         | Baseline                                                | Pause model override while `isComposing === true` (since `insertCompositionText` is non-cancelable); reconcile affected block cleanly on `compositionend`.                                                                                                                         |
| **`Selection`, `Range`, `StaticRange`**                                                  | Bidirectional mapping between DOM selection and logical model coordinates (`{ blockId, offset }`); bounding rects for floating UI.                                                                                    | Baseline                                                | Helper module converts live `Range`/`StaticRange` ↔ model `Selection`; uses `getComposedRanges({ shadowRoots })` if inside Shadow DOM (with Safari 17–18.1 variadic call guard).                                                                                                   |
| **Clipboard API (`paste`, `copy`, `cut`)**                                               | Intercept rich HTML / plain text paste, clean Word/Google Docs markup, copy clean semantic HTML + plain text.                                                                                                         | Baseline                                                | Parse `clipboardData.getData('text/html')` through our sanitizer + HTML-to-model importer; fall back to `text/plain`.                                                                                                                                                              |
| **HTML Sanitizer API (`Element.setHTML()` / `Document.parseHTML()`)**                    | XSS-safe HTML parsing & sanitization on paste/import.                                                                                                                                                                 | Limited (Chrome/Edge 146+, Firefox 148+; **no Safari**) | **Progressive enhancement**: use native `Sanitizer` / `Document.parseHTML()` where available, and ship a compact, strict zero-dep `<template>` allowlist DOM walker (tags, attributes, safe URL protocols `http:`, `https:`, `mailto:`, relative paths) as the universal baseline. |
| **Popover API (`popover="auto"`, `popover="manual"`)**                                   | Top-layer floating selection toolbar, link editor, slash-command (`/`) menu, color/heading pickers.                                                                                                                   | Baseline (Chrome 114+, Safari 17+, Firefox 125+)        | `popover="manual"` for non-focus-stealing selection bubble toolbar; `popover="auto"` for light-dismiss menus/pickers.                                                                                                                                                              |
| **Invoker Commands (`commandfor`, `command`)**                                           | Declarative toolbar buttons toggling popovers, dialogs, and custom `--format-*` commands.                                                                                                                             | Baseline 2025 (Chrome 135+, Firefox 144+, Safari 26.2+) | Feature-detect `'command' in HTMLButtonElement.prototype`; attach lightweight click fallback if unsupported.                                                                                                                                                                       |
| **Native `<dialog>`**                                                                    | Modal link/image/HTML-source inspector with built-in Esc dismiss, focus trapping, and `::backdrop`.                                                                                                                   | Baseline                                                | Opened via `showModal()` / `command="show-modal"`; save and restore editor selection around modal open/close.                                                                                                                                                                      |
| **CSS Custom Highlight API (`CSS.highlights`, `Highlight`)**                             | Non-destructive Find & Replace match highlighting (and future comments/linting) without injecting `<mark>`/`<span>` into `contenteditable`.                                                                           | Baseline (Chrome 105+, Safari 17.2+, Firefox 140+)      | Feature-detect `CSS?.highlights`; skip gracefully if absent.                                                                                                                                                                                                                       |
| **Form-Associated Custom Elements (`static formAssociated = true`, `ElementInternals`)** | Native `<form>` participation (`FormData`, `required` validation, `reset()`, `disabled`, `fieldset[disabled]`, ARIA defaults).                                                                                        | Baseline                                                | Publish initial `setFormValue()` on connect; pass internal focusable anchor to `setValidity()`; preserve state across DOM reparenting.                                                                                                                                             |
| **`queueMicrotask` & `structuredClone`**                                                 | Batch synchronous state updates into a single DOM reconciliation; deep-clone immutable history snapshots cleanly.                                                                                                     | Baseline                                                | Core engine primitives.                                                                                                                                                                                                                                                            |
| **`EditContext` API**                                                                    | DOM-free OS text/IME input surface.                                                                                                                                                                                   | **Chromium-only** (no Firefox/Safari)                   | **Deferred** — keep input interception behind an adapter interface so `EditContext` can be added as an optional Chromium enhancement later without architectural rewrite.                                                                                                          |

### Modern CSS Platform APIs

| CSS Feature                                                                                                                      | Usage in Vanilla WYSIWYG                                                                                                                    | Notes                                                                                                                                                            |
| :------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CSS Anchor Positioning** (`anchor-name`, `position-anchor`, `position-area`, `position-try-fallbacks: flip-block flip-inline`) | Declarative positioning and automatic viewport edge-flipping for the floating selection toolbar and `/` slash-command menu.                 | Anchored to a zero-size virtual caret/selection `<div>` updated from `Range.getBoundingClientRect()`, with a tiny JS viewport-clamp fallback for older browsers. |
| **Cascade Layers (`@layer`)**                                                                                                    | Clean style hierarchy: `@layer tokens, base, surface, chrome, popovers, utilities`.                                                         | Lets host apps override tokens cleanly without specificity wars.                                                                                                 |
| **Native CSS Nesting**                                                                                                           | Readable, modular component stylesheets with zero Sass/PostCSS.                                                                             | Baseline across all modern browsers.                                                                                                                             |
| **Container Queries (`@container`)**                                                                                             | Toolbar adapts to the _editor's own width_ (hiding labels, collapsing secondary tools into an overflow popover) rather than viewport width. | Define `container-type: inline-size` on the editor root so `cqi` units always resolve predictably.                                                               |
| **`color-scheme` + `light-dark()` + `oklch()` Relative Colors**                                                                  | Automatic light/dark theming and single-token accent color derivation (`--ve-accent`).                                                      | Declare `color-scheme: light dark` on host; evaluate tokens at component root to avoid per-node recalculation overhead.                                          |
| **`:has()` & `:focus-within`**                                                                                                   | Pure-CSS focus rings, active button-group styling, empty-document placeholder display, and open-popover indicators.                         | Eliminates JS class-toggling boilerplate.                                                                                                                        |
| **`@starting-style` + `transition-behavior: allow-discrete`**                                                                    | Smooth entry/exit fade+scale animations on native popovers and `<dialog>` elements.                                                         | Zero JS animation timers.                                                                                                                                        |
| **CSS Logical Properties** (`padding-inline`, `margin-block`, `border-inline-start`)                                             | Native RTL language support out of the box.                                                                                                 | Used consistently across chrome and editable typography.                                                                                                         |

---

## 3. Encapsulation Decision: Shadow DOM vs. Light DOM Editable Surface

Placing `contenteditable` inside Shadow DOM has historically caused selection retargeting headaches (`document.getSelection()` retargets to the shadow host). While `Selection.getComposedRanges({ shadowRoots })` is now Baseline in Chrome 137+, Firefox 142+, and Safari 17+, subtle rough edges remain (e.g., Safari 17–18.1 variadic argument mismatch, `StaticRange` lacking `getBoundingClientRect()`, and host-page typography/CSS frameworks being blocked from styling rendered rich text).

### Two Viable Patterns

1. **Recommended — Hybrid Shadow Chrome + Slotted Light-DOM Editable Surface (or Scoped Light DOM):**
   - **Editor UI Chrome** (toolbar, popovers, dialogs, status bar, resize handles) lives in an **Open Shadow Root** (`attachShadow({ mode: 'open' })`), completely insulated from host page CSS resets.
   - **Editable Surface** (`<div contenteditable="true" slot="surface">`) lives in **Light DOM** (projected into a `<slot>` inside the component), styled via `@layer` + `@scope` (or a constructed stylesheet on `document.adoptedStyleSheets`).
   - **Why this wins:**
     - `window.getSelection()`, `Range.getBoundingClientRect()`, `caretPositionFromPoint()`, spellcheck, accessibility tools, and browser extensions work 100% natively without Shadow DOM selection workarounds.
     - Host apps can optionally let their own prose typography flow into the document while keeping toolbar UI completely isolated.
     - `ElementInternals` still provides full native `<form>` integration.
2. **Alternative — Full Open Shadow DOM (`{ mode: 'open', delegatesFocus: true }`):**
   - Total CSS isolation for both chrome and content; exposes `::part(surface)`, `::part(toolbar)` for theming.
   - Requires wrapping all selection reads with a `getComposedRanges` adapter + Safari signature fallback.

_We will confirm your preference between Option 1 (Hybrid — recommended) and Option 2 (Full Open Shadow DOM) before writing Phase 4's Web Component wrapper; the headless core engine works identically with either._

---

## 4. Core Document Model & Editing Pipeline

### 4.1 Canonical Document AST

Inspired by **ProseMirror** (flat inline marks) + **Slate** (plain JSON AST) + **Lexical** (stable runtime keys):

```js
// Document root
{
  version: 1,
  blocks: [
    {
      id: "b_1",
      type: "heading",       // "paragraph" | "heading" | "blockquote" | "code-block" | "list-item" | "hr"
      attrs: { level: 2 },   // type-specific attributes (e.g., level, listType, indent, lang)
      children: [
        { text: "Hello ", marks: [] },
        { text: "world", marks: [{ type: "bold" }, { type: "italic" }] },
        { text: " — ", marks: [] },
        { text: "docs", marks: [{ type: "link", attrs: { href: "https://example.com" } }] }
      ]
    }
  ]
}
```

**Why this structure?**

- **Flat `children` runs inside each block**: Adjacent runs with identical marks are automatically merged during normalization; empty runs are pruned (except a single empty `{ text: "", marks: [] }` in empty blocks).
- **Deterministic HTML**: Marks always serialize in a canonical nesting order (`link` → `bold` → `italic` → `underline` → `strike` → `code` → `highlight`), preventing tag soup forever.
- **Block `id`s**: Enable O(1) keyed DOM patching — typing in paragraph 42 only reconciles `<p data-block-id="b_42">`.
- **Lists modeled cleanly**: List items carry `{ listType: "bullet" | "ordered" | "task", indent: 0..3, checked?: boolean }` and are grouped into semantic `<ul>`/`<ol>` trees during DOM rendering & HTML serialization (like Quill/BlockNote/modern flat-indent models, avoiding deeply tangled nested list-splitting bugs while still outputting valid nested `<ul>`/`<ol>` HTML!).

### 4.2 Selection Model

```js
{
  anchor: { blockId: "b_1", offset: 6 }, // character offset within block's concatenated text
  focus:  { blockId: "b_1", offset: 11 },
  storedMarks: null // pending inline marks when caret is collapsed (e.g., toggled Bold before typing)
}
```

- Representing inline offsets as a **single character index within a block** (rather than `(runIndex, charOffset)`) makes caret math, word deletion, cross-mark formatting, and DOM↔Model mapping dramatically simpler and eliminates edge cases at inline tag boundaries (`<strong>foo|</strong>bar`).

### 4.3 Unidirectional Editing Pipeline

```
User Action (beforeinput / keydown / paste / toolbar command)
       │
       ▼
┌─────────────────────────────────────────┐
│ 1. Input Adapter                        │
│    • Intercept cancelable beforeinput   │
│    • Defer during IME composition       │
│    • Map DOM Range → Model Selection    │
└──────────────────┬──────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│ 2. Command / Transaction Engine         │
│    • Pure state transform:              │
│      (state, op) → nextState            │
│    • Handles typing, Enter split,       │
│      Backspace merge, mark toggle,      │
│      block conversion, paste insert     │
└──────────────────┬──────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│ 3. Normalizer                           │
│    • Guarantee ≥ 1 block                │
│    • Merge adjacent equal-mark runs     │
│    • Strip empty runs & illegal attrs   │
│    • Clamp selection to valid bounds    │
└──────────────────┬──────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│ 4. History Manager                      │
│    • Push immutable snapshot (bounded   │
│      maxDepth: 100)                     │
│    • Coalesce sequential typing within  │
│      400ms window                       │
└──────────────────┬──────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│ 5. Microtask Keyed DOM Reconciler       │
│    • Diff changed block IDs only        │
│    • Render semantic HTML + <br>        │
│      sentinel for empty blocks          │
│    • Restore DOM Selection / Caret      │
│    • Sync ElementInternals + events     │
└─────────────────────────────────────────┘
```

### 4.4 Critical Edge Cases Built Into the Design From Day 1

1. **Toolbar clicks stealing focus / dropping selection**: Every toolbar button calls `e.preventDefault()` on `mousedown` (or `pointerdown`), keeping focus inside `contenteditable`. For modal dialogs (e.g. Link/Image), save model `Selection` before opening and restore before applying.
2. **Empty block collapse**: Empty `<p></p>` elements collapse to 0px height and become unclickable in browsers. Every empty block renders a sentinel `<br data-ve-sentinel>` (stripped during HTML export).
3. **Collapsed caret mark toggling (`storedMarks`)**: Pressing `Ctrl+B` with no text selected sets `storedMarks` so the next typed character becomes bold, without inserting hacky zero-width spaces (`\u200B`) into the document!
4. **IME & Mobile Soft Keyboards**: During `compositionstart`..`compositionend`, never mutate or re-render the composing block; on `compositionend`, read the updated block text back into the model and normalize. For non-cancelable `beforeinput` events (Android Gboard autocorrect, browser spellcheck replacement), let the browser apply to DOM and reconcile the affected block on `input`.
5. **Paste Security & Word/Google Docs Cleanup**: Parse pasted HTML into an inert `<template>` (or `Document.parseHTML`), strip `<script>`, `<style>`, `<meta>`, `on*`, `javascript:` URLs, Word `mso-*` styles, and Google Docs wrapper `<b>` tags, then map semantic elements (`h1`–`h6`, `p`, `ul`/`ol`/`li`, `blockquote`, `pre`, `strong`/`b`, `em`/`i`, `a`, `code`) directly into clean model nodes.
6. **Undo/Redo Boundary Integrity**: Intercept `beforeinput` `historyUndo` / `historyRedo` AND `Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z` / `Ctrl+Y` so browser native undo never corrupts the reconciled DOM.

---

## 5. Proposed Project Structure

Pure ES modules — zero `node_modules` required to run or serve.

````
vanilla-wysiwyg/
├── index.html                    # Interactive demo & playground (open via any static server)
├── PLAN.md                       # This architecture & implementation plan
├── README.md                     # Project overview & usage guide
├── src/
│   ├── index.js                  # Public barrel export (Editor, VanillaEditorElement, serializers)
│   ├── core/
│   │   ├── model.js              # Document/Block/TextRun factories, canonical mark order, IDs
│   │   ├── selection.js          # Logical Selection helpers (normalize, collapse, expand, range ops)
│   │   ├── normalizer.js         # Document invariants (merge runs, non-empty doc, indent bounds)
│   │   ├── commands.js           # Pure editing transforms (insertText, splitBlock, delete, toggleMark, setBlockType, lists, links)
│   │   ├── history.js            # Bounded snapshot undo/redo stack with typing coalescing
│   │   ├── schema.js             # Allowed block types, marks, attributes, URL protocol rules
│   │   ├── markdown-rules.js     # Inline/block live shortcuts (# , > , - , 1. , ``` , **bold**, `code`)
│   │   └── editor.js             # Headless Editor controller (state, plugins/hooks, microtask batching, EventTarget)
│   ├── dom/
│   │   ├── reconciler.js         # Keyed block DOM renderer & minimal diff patcher
│   │   ├── dom-selection.js      # Bidirectional DOM Range ↔ Model Selection mapper (+ Shadow DOM helper)
│   │   ├── input-handler.js      # beforeinput + composition + input fallback + keydown shortcuts
│   │   ├── clipboard.js          # copy / cut / paste handling
│   │   └── highlighter.js        # CSS Custom Highlight API controller (Find & Replace matches)
│   ├── io/
│   │   ├── sanitizer.js          # Strict allowlist HTML sanitizer (+ native Sanitizer API enhancement)
│   │   ├── html-serializer.js    # Model → canonical semantic HTML5
│   │   ├── html-parser.js        # Sanitized HTML → Model AST
│   │   └── markdown.js           # Optional Model ↔ Markdown export/import
│   ├── ui/
│   │   ├── vanilla-editor.js     # <vanilla-editor> Form-Associated Custom Element (ElementInternals)
│   │   ├── toolbar.js            # Top toolbar + active-state sync + responsive overflow
│   │   ├── bubble-menu.js        # Floating selection toolbar (Popover API + CSS Anchor Positioning)
│   │   ├── slash-menu.js         # "/" block insertion menu (Popover API + keyboard nav + anchor)
│   │   ├── link-popover.js       # Inline link creation/edit/remove popover
│   │   ├── find-bar.js           # Find & Replace bar powered by CSS Custom Highlight API
│   │   └── icons.js              # Crisp inline SVG icon templates (zero icon-font deps)
│   └── styles/
│       ├── tokens.css            # @layer tokens — light-dark(), oklch(), spacing, typography
│       ├── surface.css           # @layer surface — semantic prose typography & empty placeholders
│       ├── chrome.css            # @layer chrome — @container responsive toolbar, focus rings, :has()
│       └── popovers.css          # @layer popovers — CSS Anchor Positioning, @starting-style transitions
└── tests/
    ├── unit/                     # Pure JS tests runnable via built-in `node --test` (zero deps!)
    │   ├── model.test.js
    │   ├── commands.test.js
    │   ├── normalizer.test.js
    │   ├── history.test.js
    │   ├── sanitizer.test.js
    │   └── html-io.test.js
    └── browser/
        └── harness.html          # Zero-dep browser integration tests for Selection, beforeinput, Popover, FACE
````

---

## 6. Phased Implementation Roadmap

### Phase 1 — Pure Core Model, Serialization & Sanitization (Headless, 100% Unit-Tested)

- Implement `schema.js`, `model.js`, `selection.js`, `normalizer.js`, `commands.js`, `history.js`.
- Implement `sanitizer.js`, `html-serializer.js`, `html-parser.js`.
- Verify every transform (insert, delete across blocks, split/merge blocks, inline mark toggle/nesting, list indent/outdent, undo/redo coalescing, XSS sanitization) using Node's built-in `node --test` runner (zero npm packages).

### Phase 2 — Editing Surface, `beforeinput` Engine & Keyed Reconciler

- Implement `dom/reconciler.js`, `dom/dom-selection.js`, `dom/input-handler.js`, `dom/clipboard.js`, and `core/editor.js`.
- Support full typing, `Enter`, `Shift+Enter` (`<br>`), `Backspace`, `Delete`, word/line deletion, copy/cut/paste (plain & rich HTML), keyboard shortcuts (`Mod+B/I/U/K/Z/Shift+Z`), and IME composition reconciliation.
- Build a minimal `index.html` testbench to verify caret fidelity and zero-jitter rendering.

### Phase 3 — Rich Formatting, Lists, Links & Live Markdown Shortcuts

- Complete block types: paragraphs, headings (`H1`–`H3`), bullet/ordered/task lists with `Tab`/`Shift+Tab` indentation, blockquotes, fenced code blocks, horizontal rules.
- Complete inline marks: **bold**, _italic_, underline, ~~strikethrough~~, `inline code`, highlight, and links.
- Add live Markdown input rules (`# `, `## `, `> `, `- `, `1. `, `[] `, ` ``` `, `---`, `**text**`, `*text*`, `` `code` ``).

### Phase 4 — Modern Web Component UI & CSS Platform APIs

- Build `<vanilla-editor>` Form-Associated Custom Element (`ElementInternals`) with native `<form>` value sync, `required` validation, `reset()`, `disabled`, and `change`/`input` events.
- Style with `@layer`, native CSS Nesting, `@container`, `light-dark()`, `oklch()`, `:has()`, and `@starting-style`.
- Build:
  - Responsive top toolbar (with Invoker Commands `commandfor`/`command` + overflow popover).
  - Floating selection bubble toolbar (`popover="manual"` + CSS Anchor Positioning + `flip-block`).
  - `/` Slash-command insertion menu (`popover="auto"` + CSS Anchor Positioning + keyboard navigation).
  - Link edit/preview popover and HTML source `<dialog>`.
  - Find & Replace bar using the **CSS Custom Highlight API** (`::highlight()`).

### Phase 5 — Polish, Accessibility & Hardening

- Full ARIA toolbar roving tabindex (`role="toolbar"`, `aria-pressed`, `aria-expanded`, `role="textbox"`, `aria-multiline="true"`).
- Cross-browser verification (Chromium, Firefox, WebKit/Safari edge cases: IME, paste from Docs/Word/VS Code, drag-and-drop text, mobile soft keyboards).
- Clean demo playground (`index.html`) showcasing: light/dark toggle, live HTML/JSON/Markdown output tabs, `<form>` submission demo, and theme token customization.

---

## 7. Open Decisions to Confirm Before Phase 1

Before we start implementing **Phase 1**, please let me know if you have preferences on any of these (or I'll proceed with the defaults marked **Default**):

1. **Encapsulation Model:**
   - **Default (Recommended):** Hybrid — Open Shadow DOM for UI chrome (toolbar/popovers) + slotted Light DOM `contenteditable` surface (avoids Shadow DOM selection quirks & lets page typography apply cleanly if desired).
   - _Alternative:_ Full Open Shadow DOM (`getComposedRanges` adapter) for 100% style encapsulation.
2. **Feature Scope for v1:**
   - **Default:** Core rich-text blocks (Paragraph, H1–H3, Bullet/Ordered/Task Lists, Blockquote, Code Block, HR), inline marks (Bold, Italic, Underline, Strike, Code, Highlight, Link), Markdown shortcuts, floating bubble menu, `/` slash menu, Find & Replace (`CSS.highlights`), HTML/JSON/Markdown I/O, `<form>` integration.
   - _Optional additions:_ Images (upload/URL/drag-drop/resize) and/or Tables in v1, or keep them for v1.1?
3. **Custom Element Tag & Package Name:**
   - **Default:** `<vanilla-editor>` (and JS class `VanillaEditor` / headless `Editor`).
   - Feel free to pick a custom brand name if you have one in mind!

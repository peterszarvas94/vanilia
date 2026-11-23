/**
 * Vanilia (<vanilia-editor>) — single-file drop-in ES module.
 * Generated from src/ via `node scripts/pack.mjs`.
 *
 * Squire is an external dependency imported via the bare specifier "squire-rte":
 *   - no-build pages: map it in an import map, e.g. { "imports": { "squire-rte": "/dist/squire.mjs" } }
 *   - bundlers (Vite, esbuild, ...): resolved from the squire-rte npm package
 */
import Squire from "squire-rte";

// --- src/icons.js ---
const { icon, setIcons, onIconsChange, ICON_NAMES } = (() => {
const SVG_PATHS = {
  bold: `<path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/>`,
  italic: `<line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/>`,
  underline: `<path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/>`,
  strike: `<path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/>`,
  paragraph: `<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>`,
  h1: `<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="m17 12 3-2v8"/>`,
  h2: `<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/>`,
  h3: `<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/>`,
  bulletList: `<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>`,
  orderedList: `<path d="M11 5h10"/><path d="M11 12h10"/><path d="M11 19h10"/><path d="M4 4h1v5"/><path d="M4 9h2"/><path d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02"/>`,
  quote: `<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>`,
  code: `<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>`,
  hr: `<line x1="3" x2="21" y1="12" y2="12"/>`,
  link: `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`,
  unlink: `<path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"/><path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"/><line x1="8" x2="8" y1="2" y2="5"/><line x1="2" x2="5" y1="8" y2="8"/><line x1="16" x2="16" y1="19" y2="22"/><line x1="19" x2="22" y1="16" y2="16"/>`,
  image: `<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>`,
  alignLeft: `<line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/>`,
  alignCenter: `<line x1="21" x2="3" y1="6" y2="6"/><line x1="17" x2="7" y1="12" y2="12"/><line x1="19" x2="5" y1="18" y2="18"/>`,
  alignRight: `<line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/>`,
  undo: `<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>`,
  redo: `<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>`,
  clear: `<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>`,
  search: `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`,
  trash: `<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>`,
  check: `<path d="M20 6 9 17l-5-5"/>`,
  x: `<path d="M18 6 6 18"/><path d="m6 6 12 12"/>`,
  upload: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>`,
  moon: `<path d="M12 3a6.5 6.5 0 1 0 9 9 9 9 0 1 1-9-9"/>`,
  sun: `<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>`,
  copy: `<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>`,
  text: `<path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/>`,
};

/** Names of all built-in icons (each can be overridden). */
const ICON_NAMES = Object.freeze(Object.keys(SVG_PATHS));

const globalIcons = new Map();
const iconListeners = new Set();

/**
 * Override built-in icons for every <vanilia-editor> on the page.
 * Values are trusted markup strings (inline SVG, icon-font <i>, <img>, ...).
 * Pass `null` / `undefined` for a name to restore its built-in icon.
 *
 *   setIcons({ bold: '<svg viewBox="0 0 256 256">...</svg>' });
 */
function setIcons(map = {}) {
  for (const [name, markup] of Object.entries(map)) {
    if (markup == null || markup === "") globalIcons.delete(name);
    else globalIcons.set(name, String(markup));
  }
  for (const listener of iconListeners) listener();
}

/** Subscribe to global icon changes; returns an unsubscribe function. */
function onIconsChange(listener) {
  iconListeners.add(listener);
  return () => iconListeners.delete(listener);
}

/**
 * Render an icon as markup. Lookup order: per-editor `overrides` (Map),
 * global `setIcons()` registry, built-in Lucide-compatible SVG.
 * Every icon carries `data-icon` / `data-size` so editors can re-render it in place.
 */
function icon(name, size = 16, overrides) {
  const custom = overrides?.get(name) ?? globalIcons.get(name);
  if (custom != null) {
    return `<span class="ve-icon ve-icon--custom" data-icon="${name}" data-size="${size}" aria-hidden="true">${custom}</span>`;
  }
  const path = SVG_PATHS[name] || "";
  return `<svg class="ve-icon" data-icon="${name}" data-size="${size}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}
  return { icon, setIcons, onIconsChange, ICON_NAMES };
})();

// --- src/sanitizer.js ---
const { isSafeUrl, sanitizeToDOMFragment, normalizeExportHTML, formatHTML } = (() => {
/**
 * Zero-dependency allowlist HTML sanitizer for Squire (`sanitizeToDOMFragment`)
 * and semantic HTML cleanup / pretty printing.
 */

const ALLOWED_TAGS = new Set([
  "P",
  "DIV",
  "BR",
  "HR",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "BLOCKQUOTE",
  "PRE",
  "CODE",
  "UL",
  "OL",
  "LI",
  "B",
  "STRONG",
  "I",
  "EM",
  "U",
  "S",
  "DEL",
  "SUB",
  "SUP",
  "MARK",
  "SPAN",
  "A",
  "IMG",
  "FIGURE",
  "FIGCAPTION",
  "TABLE",
  "THEAD",
  "TBODY",
  "TFOOT",
  "TR",
  "TH",
  "TD",
]);

const DROP_CONTENT_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "IFRAME",
  "OBJECT",
  "EMBED",
  "TEMPLATE",
  "SVG",
  "MATH",
  "META",
  "LINK",
  "TITLE",
  "HEAD",
]);

const ALLOWED_ATTRS = {
  "*": new Set(["dir", "class", "style"]),
  A: new Set(["href", "title", "target", "rel"]),
  IMG: new Set(["src", "alt", "title", "width", "height", "data-align", "data-width"]),
  TD: new Set(["colspan", "rowspan"]),
  TH: new Set(["colspan", "rowspan", "scope"]),
  OL: new Set(["start"]),
};

const ALLOWED_STYLE_PROPS = new Set([
  "width",
  "max-width",
  "height",
  "text-align",
  "color",
  "background-color",
  "font-family",
  "font-size",
  "display",
  "margin-inline",
  "margin-left",
  "margin-right",
]);

const SAFE_LINK_PROTOCOLS = /^(https?:|mailto:|tel:|#|\/(?!\/))/i;
const SAFE_IMG_PROTOCOLS = /^(https?:|\/(?!\/)|blob:|data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,)/i;

function isSafeUrl(url, kind = "link") {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().replace(/[\u0000-\u001F\u007F]+/g, "");
  return kind === "image" ? SAFE_IMG_PROTOCOLS.test(trimmed) : SAFE_LINK_PROTOCOLS.test(trimmed);
}

function sanitizeStyle(rawStyle) {
  if (!rawStyle) return "";
  const kept = [];
  for (const decl of rawStyle.split(";")) {
    const colon = decl.indexOf(":");
    if (colon === -1) continue;
    const prop = decl.slice(0, colon).trim().toLowerCase();
    const val = decl.slice(colon + 1).trim();
    if (!ALLOWED_STYLE_PROPS.has(prop)) continue;
    if (!val || /url\s*\(|expression\s*\(|javascript:/i.test(val)) continue;
    kept.push(`${prop}: ${val}`);
  }
  return kept.join("; ");
}

function sanitizeNode(node, doc) {
  if (node.nodeType === Node.TEXT_NODE) {
    return doc.createTextNode(node.nodeValue || "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const tag = node.nodeName.toUpperCase();
  if (DROP_CONTENT_TAGS.has(tag)) {
    return null;
  }

  // Unwrap disallowed container elements while keeping safe text/children
  if (!ALLOWED_TAGS.has(tag)) {
    const frag = doc.createDocumentFragment();
    for (const child of Array.from(node.childNodes)) {
      const cleanChild = sanitizeNode(child, doc);
      if (cleanChild) frag.appendChild(cleanChild);
    }
    return frag;
  }

  const el = doc.createElement(tag.toLowerCase());
  const globalAllowed = ALLOWED_ATTRS["*"];
  const tagAllowed = ALLOWED_ATTRS[tag];

  for (const attr of Array.from(node.attributes)) {
    const name = attr.name.toLowerCase();
    if (name.startsWith("on")) continue;
    if (!globalAllowed.has(name) && !(tagAllowed && tagAllowed.has(name))) continue;

    const val = attr.value;
    if (name === "href") {
      if (!isSafeUrl(val, "link")) continue;
      el.setAttribute("href", val.trim());
      continue;
    }
    if (name === "src") {
      if (!isSafeUrl(val, "image")) continue;
      el.setAttribute("src", val.trim());
      continue;
    }
    if (name === "target") {
      if (val === "_blank") {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }
      continue;
    }
    if (name === "style") {
      const safe = sanitizeStyle(val);
      if (safe) el.setAttribute("style", safe);
      continue;
    }
    if (name === "class") {
      // Only allow our own alignment/editor classes, strip Word/Docs junk classes
      const safeClasses = val
        .split(/\s+/)
        .filter((c) => /^align-(left|center|right|justify)$/.test(c));
      if (safeClasses.length) el.setAttribute("class", safeClasses.join(" "));
      continue;
    }
    if (name === "data-align") {
      if (/^(left|center|right)$/.test(val)) el.setAttribute("data-align", val);
      continue;
    }
    if (name === "width" || name === "height") {
      if (/^\d+(\.\d+)?(%|px)?$/.test(val.trim())) {
        el.setAttribute(name, val.trim());
      }
      continue;
    }
    el.setAttribute(name, val);
  }

  for (const child of Array.from(node.childNodes)) {
    const cleanChild = sanitizeNode(child, doc);
    if (cleanChild) el.appendChild(cleanChild);
  }

  return el;
}

/**
 * Squire-compatible `sanitizeToDOMFragment(html, editor)` callback.
 * Uses an inert <template> (never executes scripts or loads remote images while parsing).
 */
function sanitizeToDOMFragment(html, editor) {
  const doc = editor?._doc || document;
  const tpl = doc.createElement("template");
  tpl.innerHTML = html || "";

  const out = doc.createDocumentFragment();
  for (const child of Array.from(tpl.content.childNodes)) {
    const clean = sanitizeNode(child, doc);
    if (clean) out.appendChild(clean);
  }
  return out;
}

/**
 * Clean exported HTML (normalizes Squire's <b>/<i> -> <strong>/<em> and strips empty artifacts).
 */
function normalizeExportHTML(rawHtml) {
  const tpl = document.createElement("template");
  tpl.innerHTML = rawHtml || "";

  const renameTag = (el, newTag) => {
    const replacement = document.createElement(newTag);
    for (const attr of Array.from(el.attributes)) {
      replacement.setAttribute(attr.name, attr.value);
    }
    while (el.firstChild) replacement.appendChild(el.firstChild);
    el.replaceWith(replacement);
  };

  for (const b of Array.from(tpl.content.querySelectorAll("b"))) {
    renameTag(b, "strong");
  }
  for (const i of Array.from(tpl.content.querySelectorAll("i"))) {
    renameTag(i, "em");
  }
  for (const img of Array.from(tpl.content.querySelectorAll("img"))) {
    img.removeAttribute("tabindex");
  }

  return tpl.innerHTML.trim();
}

/**
 * Lightweight zero-dependency HTML pretty printer for live preview inspection.
 */
function formatHTML(html) {
  if (!html) return "";
  const containerTags = /^(ul|ol|blockquote|table|thead|tbody|tfoot|tr|figure)$/i;
  const leafBlockTags = /^(p|h[1-6]|li|pre|hr|div|th|td|figcaption)$/i;
  const tokens = html
    .replace(/>\s+</g, "><")
    .match(/<!--[\s\S]*?-->|<\/?[^>]+>|[^<]+/g);
  if (!tokens) return html;

  let indent = 0;
  const lines = [];
  let inPre = false;

  for (const token of tokens) {
    if (token.startsWith("</")) {
      const name = token.slice(2, -1).trim();
      if (/^pre$/i.test(name)) inPre = false;
      if (containerTags.test(name)) {
        indent = Math.max(0, indent - 1);
        lines.push(`${"  ".repeat(indent)}${token}`);
      } else if (lines.length) {
        lines[lines.length - 1] += token;
      } else {
        lines.push(token);
      }
    } else if (token.startsWith("<")) {
      const match = token.match(/^<([a-z0-9-]+)/i);
      const name = match ? match[1] : "";
      const selfClosing = token.endsWith("/>") || /^(br|hr|img|input)$/i.test(name);
      if (/^pre$/i.test(name)) inPre = true;

      if (containerTags.test(name)) {
        lines.push(`${"  ".repeat(indent)}${token}`);
        if (!selfClosing) indent += 1;
      } else if (leafBlockTags.test(name)) {
        lines.push(`${"  ".repeat(indent)}${token}`);
      } else if (lines.length && !inPre) {
        lines[lines.length - 1] += token;
      } else {
        lines.push(token);
      }
    } else {
      const text = inPre ? token : token.replace(/\s+/g, " ");
      if (!inPre && !text.trim()) continue;
      if (lines.length) {
        lines[lines.length - 1] += text;
      } else {
        lines.push(text);
      }
    }
  }

  return lines.join("\n");
}
  return { isSafeUrl, sanitizeToDOMFragment, normalizeExportHTML, formatHTML };
})();

// --- src/extensions/headings.js ---
const { isHeadingActive, setParagraph, toggleHeading } = (() => {
/**
 * Headings extension for Squire (`toggleHeading(1|2|3)` and `setParagraph()`).
 */

const BLOCK_SELECTOR = "p, div, h1, h2, h3, h4, h5, h6";

function convertFragmentBlocks(squire, frag, targetTag) {
  const doc = squire._doc || document;
  const upperTarget = targetTag.toUpperCase();
  const blocks = Array.from(frag.children);

  if (blocks.length === 0) {
    const el = doc.createElement(targetTag);
    while (frag.firstChild) el.appendChild(frag.firstChild);
    frag.appendChild(el);
    return frag;
  }

  for (const child of blocks) {
    if (child.nodeName === "UL" || child.nodeName === "OL" || child.nodeName === "BLOCKQUOTE") {
      // Unwrap nested list/quote items if toggling heading directly on them
      continue;
    }
    if (child.matches && child.matches(BLOCK_SELECTOR)) {
      if (child.nodeName === upperTarget) continue;
      const next = doc.createElement(targetTag);
      if (child.dir) next.dir = child.dir;
      if (child.style.textAlign) next.style.textAlign = child.style.textAlign;
      while (child.firstChild) next.appendChild(child.firstChild);
      child.replaceWith(next);
    }
  }
  return frag;
}

function isHeadingActive(squire, level) {
  if (level) return squire.hasFormat(`H${level}`);
  return squire.hasFormat("H1") || squire.hasFormat("H2") || squire.hasFormat("H3");
}

function setParagraph(squire) {
  if (squire.hasFormat("UL") || squire.hasFormat("OL")) {
    squire.removeList();
  }
  if (squire.hasFormat("BLOCKQUOTE")) {
    squire.removeQuote();
  }
  if (squire.hasFormat("PRE")) {
    squire.removeCode();
  }
  squire.modifyBlocks((frag) => convertFragmentBlocks(squire, frag, "p"));
  squire.focus();
}

function toggleHeading(squire, level = 2) {
  const tag = `h${level}`;
  if (squire.hasFormat(tag.toUpperCase())) {
    setParagraph(squire);
    return;
  }
  if (squire.hasFormat("UL") || squire.hasFormat("OL")) {
    squire.removeList();
  }
  if (squire.hasFormat("PRE")) {
    squire.removeCode();
  }
  squire.modifyBlocks((frag) => convertFragmentBlocks(squire, frag, tag));
  squire.focus();
}
  return { isHeadingActive, setParagraph, toggleHeading };
})();

// --- src/extensions/formatting.js ---
const { isActive, getActiveState, execCommand } = (() => {
/**
 * TipTap-inspired command & active-state adapter on top of Squire.
 */

function isActive(squire, name, attrs = {}) {
  if (!squire) return false;
  switch (name) {
    case "bold":
      return squire.hasFormat("B") || squire.hasFormat("STRONG");
    case "italic":
      return squire.hasFormat("I") || squire.hasFormat("EM");
    case "underline":
      return squire.hasFormat("U");
    case "strike":
      return squire.hasFormat("S") || squire.hasFormat("DEL");
    case "code":
      return squire.hasFormat("CODE") || squire.hasFormat("PRE");
    case "link":
      return squire.hasFormat("A");
    case "bulletList":
      return squire.hasFormat("UL");
    case "orderedList":
      return squire.hasFormat("OL");
    case "blockquote":
      return squire.hasFormat("BLOCKQUOTE");
    case "heading":
      return isHeadingActive(squire, attrs.level);
    case "paragraph":
      return (
        !isHeadingActive(squire) &&
        !squire.hasFormat("UL") &&
        !squire.hasFormat("OL") &&
        !squire.hasFormat("BLOCKQUOTE") &&
        !squire.hasFormat("PRE")
      );
    default:
      return false;
  }
}

function getActiveState(squire) {
  return {
    bold: isActive(squire, "bold"),
    italic: isActive(squire, "italic"),
    underline: isActive(squire, "underline"),
    strike: isActive(squire, "strike"),
    code: isActive(squire, "code"),
    link: isActive(squire, "link"),
    bulletList: isActive(squire, "bulletList"),
    orderedList: isActive(squire, "orderedList"),
    blockquote: isActive(squire, "blockquote"),
    paragraph: isActive(squire, "paragraph"),
    h1: isActive(squire, "heading", { level: 1 }),
    h2: isActive(squire, "heading", { level: 2 }),
    h3: isActive(squire, "heading", { level: 3 }),
  };
}

function execCommand(squire, command, arg) {
  if (!squire) return;
  switch (command) {
    case "bold":
      isActive(squire, "bold") ? squire.removeBold() : squire.bold();
      break;
    case "italic":
      isActive(squire, "italic") ? squire.removeItalic() : squire.italic();
      break;
    case "underline":
      isActive(squire, "underline") ? squire.removeUnderline() : squire.underline();
      break;
    case "strike":
      isActive(squire, "strike")
        ? squire.changeFormat(null, { tag: "S" })
        : squire.changeFormat({ tag: "S" }, null);
      break;
    case "code":
      squire.toggleCode();
      break;
    case "paragraph":
      setParagraph(squire);
      break;
    case "h1":
      toggleHeading(squire, 1);
      break;
    case "h2":
      toggleHeading(squire, 2);
      break;
    case "h3":
      toggleHeading(squire, 3);
      break;
    case "bulletList":
      squire.hasFormat("UL") ? squire.removeList() : squire.makeUnorderedList();
      break;
    case "orderedList":
      squire.hasFormat("OL") ? squire.removeList() : squire.makeOrderedList();
      break;
    case "blockquote":
      squire.hasFormat("BLOCKQUOTE") ? squire.decreaseQuoteLevel() : squire.increaseQuoteLevel();
      break;
    case "hr":
      squire.insertHTML("<hr><p><br></p>");
      break;
    case "alignLeft":
      squire.setTextAlignment("left");
      break;
    case "alignCenter":
      squire.setTextAlignment("center");
      break;
    case "alignRight":
      squire.setTextAlignment("right");
      break;
    case "clearFormatting":
      squire.removeAllFormatting();
      break;
    case "undo":
      squire.undo();
      break;
    case "redo":
      squire.redo();
      break;
    case "makeLink":
      if (arg) squire.makeLink(arg, { target: "_blank", rel: "noopener noreferrer" });
      break;
    case "removeLink":
      squire.removeLink();
      break;
    default:
      break;
  }
}
  return { isActive, getActiveState, execCommand };
})();

// --- src/extensions/image-resize.js ---
const { createImageResizeExtension } = (() => {
/**
 * Custom TipTap-style Image Resize, Alignment, Alt-Text & Upload extension for Squire.
 *
 * Keeps all selection handles, live dimension badge, and floating toolbar OUTSIDE
 * the `contenteditable` root so `getHTML()` stays 100% clean.
 */

const MIN_WIDTH = 48;
const HANDLES = [
  { pos: "nw", cursor: "nwse-resize" },
  { pos: "ne", cursor: "nesw-resize" },
  { pos: "se", cursor: "nwse-resize" },
  { pos: "sw", cursor: "nesw-resize" },
  { pos: "w", cursor: "ew-resize" },
  { pos: "e", cursor: "ew-resize" },
];

const WIDTH_PRESETS = ["25%", "50%", "75%", "100%"];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function createImageResizeExtension({
  squire,
  surface,
  overlayHost,
  editorToolbar,
  onChange,
  onSelectChange,
  getUploadHandler,
  onStatus,
  renderIcon = icon,
}) {
  // Disable Squire's built-in DOM-polluting image resizer cleanly
  if (squire._imageResizer && typeof squire._imageResizer.destroy === "function") {
    squire._imageResizer.destroy();
  }

  let selectedImg = null;
  let dragState = null;
  let altEditing = false;

  // Selection box & handles (inside overlayHost, outside contenteditable)
  const box = document.createElement("div");
  box.className = "ve-img-selection";
  box.hidden = true;

  const dimBadge = document.createElement("div");
  dimBadge.className = "ve-img-badge";
  dimBadge.hidden = true;
  box.appendChild(dimBadge);

  const handleEls = new Map();
  for (const { pos, cursor } of HANDLES) {
    const h = document.createElement("button");
    h.type = "button";
    h.tabIndex = -1;
    h.className = `ve-img-handle ve-img-handle--${pos}`;
    h.dataset.handle = pos;
    h.style.cursor = cursor;
    h.setAttribute("aria-label", `Resize image (${pos})`);
    h.addEventListener("pointerdown", onHandlePointerDown);
    h.addEventListener("touchstart", preventTouchScroll, { passive: false });
    box.appendChild(h);
    handleEls.set(pos, h);
  }
  overlayHost.appendChild(box);

  // Floating image toolbar (native Popover API, top-layer)
  const toolbar = document.createElement("div");
  toolbar.className = "ve-popover ve-img-toolbar";
  toolbar.setAttribute("popover", "manual");
  toolbar.setAttribute("role", "toolbar");
  toolbar.setAttribute("aria-label", "Image options");
  overlayHost.appendChild(toolbar);

  function renderToolbar() {
    if (!selectedImg) return;

    if (altEditing) {
      toolbar.innerHTML = `
        <form class="ve-img-alt-form">
          <input type="text" class="ve-input ve-input--sm" name="alt" placeholder="Describe this image..." value="${escapeAttr(selectedImg.getAttribute("alt") || "")}" />
          <button type="submit" class="ve-btn ve-btn--sm ve-btn--primary" title="Save alt text">${renderIcon("check", 14)}</button>
          <button type="button" class="ve-btn ve-btn--sm" data-action="cancel-alt" title="Cancel">${renderIcon("x", 14)}</button>
        </form>
      `;
      const form = toolbar.querySelector("form");
      const input = form.querySelector("input");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!selectedImg) return;
        squire.saveUndoState();
        const val = input.value.trim();
        if (val) selectedImg.setAttribute("alt", val);
        else selectedImg.removeAttribute("alt");
        altEditing = false;
        renderToolbar();
        positionOverlay();
        onChange?.();
      });
      toolbar.querySelector('[data-action="cancel-alt"]').addEventListener("click", () => {
        altEditing = false;
        renderToolbar();
        positionOverlay();
      });
      requestAnimationFrame(() => input.focus());
      return;
    }

    const currentAlign = selectedImg.getAttribute("data-align") || inferAlign(selectedImg);
    const currentStyleWidth = selectedImg.style.width || "";

    toolbar.innerHTML = `
      <div class="ve-btn-group" role="group" aria-label="Image width">
        ${WIDTH_PRESETS.map(
          (w) => `
          <button type="button" class="ve-btn ve-btn--sm ve-btn--text ${currentStyleWidth === w ? "is-active" : ""}" data-width="${w}" title="Width ${w}">${w}</button>
        `,
        ).join("")}
      </div>
      <span class="ve-sep"></span>
      <div class="ve-btn-group" role="group" aria-label="Image alignment">
        <button type="button" class="ve-btn ve-btn--sm ${currentAlign === "left" ? "is-active" : ""}" data-align="left" title="Align left">${renderIcon("alignLeft", 14)}</button>
        <button type="button" class="ve-btn ve-btn--sm ${currentAlign === "center" ? "is-active" : ""}" data-align="center" title="Align center">${renderIcon("alignCenter", 14)}</button>
        <button type="button" class="ve-btn ve-btn--sm ${currentAlign === "right" ? "is-active" : ""}" data-align="right" title="Align right">${renderIcon("alignRight", 14)}</button>
      </div>
      <span class="ve-sep"></span>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--text ${selectedImg.getAttribute("alt") ? "is-active" : ""}" data-action="edit-alt" title="Edit alt text">Alt</button>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--danger" data-action="delete" title="Delete image">${renderIcon("trash", 14)}</button>
    `;
  }

  toolbar.addEventListener("mousedown", (e) => {
    // Allow focusing the alt input, prevent stealing focus on buttons
    if (e.target.closest("input")) return;
    e.preventDefault();
  });

  toolbar.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || !selectedImg) return;

    if (btn.dataset.width) {
      applyWidth(btn.dataset.width);
    } else if (btn.dataset.align) {
      applyAlignment(btn.dataset.align);
    } else if (btn.dataset.action === "edit-alt") {
      altEditing = true;
      renderToolbar();
      positionOverlay();
    } else if (btn.dataset.action === "delete") {
      deleteSelectedImage();
    }
  });

  function inferAlign(img) {
    if (img.style.marginLeft === "auto" && img.style.marginRight === "auto") return "center";
    if (img.style.marginLeft === "auto") return "right";
    return "left";
  }

  function applyWidth(widthValue) {
    if (!selectedImg) return;
    squire.saveUndoState();
    selectedImg.style.width = widthValue;
    selectedImg.style.height = "auto";
    selectedImg.removeAttribute("width");
    selectedImg.removeAttribute("height");
    renderToolbar();
    positionOverlay();
    onChange?.();
  }

  function applyAlignment(align) {
    if (!selectedImg) return;
    squire.saveUndoState();
    selectedImg.setAttribute("data-align", align);
    selectedImg.style.display = "block";
    if (align === "center") {
      selectedImg.style.marginLeft = "auto";
      selectedImg.style.marginRight = "auto";
    } else if (align === "right") {
      selectedImg.style.marginLeft = "auto";
      selectedImg.style.marginRight = "0";
    } else {
      selectedImg.style.marginLeft = "0";
      selectedImg.style.marginRight = "auto";
    }
    renderToolbar();
    positionOverlay();
    onChange?.();
  }

  function deleteSelectedImage() {
    if (!selectedImg) return;
    const img = selectedImg;
    squire.saveUndoState();
    const parent = img.parentNode;
    deselect();
    img.remove();
    // Ensure empty paragraph still has a <br> sentinel
    if (parent && parent !== surface && !parent.textContent && !parent.querySelector("img, br")) {
      parent.appendChild(document.createElement("br"));
    }
    squire.focus();
    onChange?.();
  }

  function selectImage(img) {
    if (!img || !surface.contains(img)) return;
    selectedImg = img;
    altEditing = false;
    box.hidden = false;
    renderToolbar();
    try {
      if (!toolbar.matches(":popover-open")) toolbar.showPopover();
    } catch {
      toolbar.hidden = false;
    }
    positionOverlay();
    requestAnimationFrame(() => {
      if (selectedImg) positionOverlay();
    });
    onSelectChange?.(selectedImg);
  }

  function deselect() {
    if (!selectedImg) return;
    endDrag({ commit: false });
    selectedImg = null;
    altEditing = false;
    box.hidden = true;
    dimBadge.hidden = true;
    try {
      if (toolbar.matches(":popover-open")) toolbar.hidePopover();
    } catch {
      toolbar.hidden = true;
    }
    onSelectChange?.(null);
  }

  function positionOverlay() {
    if (!selectedImg || !surface.contains(selectedImg)) {
      deselect();
      return;
    }
    const hostRect = overlayHost.getBoundingClientRect();
    const imgRect = selectedImg.getBoundingClientRect();

    box.style.top = `${imgRect.top - hostRect.top}px`;
    box.style.left = `${imgRect.left - hostRect.left}px`;
    box.style.width = `${imgRect.width}px`;
    box.style.height = `${imgRect.height}px`;

    // Position top-layer popover cleanly above image, below if near top edge, or clamped inside viewport
    const tbRect = toolbar.getBoundingClientRect();
    const gap = 8;
    const maxTop = Math.max(8, window.innerHeight - tbRect.height - 8);
    let top = imgRect.top - tbRect.height - gap;
    if (top < 8) {
      const below = imgRect.bottom + gap;
      top = below <= maxTop ? below : Math.max(8, Math.min(maxTop, imgRect.top + 8));
    } else if (top > maxTop) {
      top = maxTop;
    }
    let left = imgRect.left + imgRect.width / 2 - tbRect.width / 2;
    left = Math.max(8, Math.min(left, Math.max(8, window.innerWidth - tbRect.width - 8)));

    toolbar.style.top = `${Math.round(top)}px`;
    toolbar.style.left = `${Math.round(left)}px`;
  }

  function onHandlePointerDown(e) {
    if (!selectedImg) return;
    e.preventDefault();
    e.stopPropagation();

    const handle = e.currentTarget;
    const pos = handle.dataset.handle;
    const imgRect = selectedImg.getBoundingClientRect();
    const surfaceStyle = getComputedStyle(surface);
    const maxWidth = Math.max(
      MIN_WIDTH,
      surface.clientWidth - parseFloat(surfaceStyle.paddingLeft) - parseFloat(surfaceStyle.paddingRight),
    );
    const ratio =
      selectedImg.naturalWidth && selectedImg.naturalHeight
        ? selectedImg.naturalWidth / selectedImg.naturalHeight
        : imgRect.width / (imgRect.height || 1);

    // Record pre-resize state in Squire's undo stack so Ctrl+Z reverts the resize
    squire.saveUndoState();

    dragState = {
      handle,
      pos,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: imgRect.width,
      startHeight: imgRect.height,
      maxWidth,
      ratio,
    };

    overlayHost.classList.add("is-resizing");
    toolbar.style.visibility = "hidden";
    window.addEventListener("touchmove", preventTouchScroll, { passive: false });
    handle.setPointerCapture(e.pointerId);
    handle.addEventListener("pointermove", onHandlePointerMove);
    handle.addEventListener("pointerup", onHandlePointerUp);
    handle.addEventListener("pointercancel", onHandlePointerUp);

    dimBadge.hidden = false;
    updateBadge(imgRect.width, imgRect.height, maxWidth);
  }

  function onHandlePointerMove(e) {
    if (!dragState || !selectedImg) return;
    e.preventDefault();
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const { pos, startWidth, startHeight, maxWidth, ratio } = dragState;

    let nextWidth = startWidth;
    if (pos.includes("e")) nextWidth = startWidth + dx;
    else if (pos.includes("w")) nextWidth = startWidth - dx;
    else if (pos === "s") nextWidth = (startHeight + dy) * ratio;
    else if (pos === "n") nextWidth = (startHeight - dy) * ratio;

    // Corner handles: respect whichever axis moved more noticeably
    if (pos === "se" || pos === "ne" || pos === "sw" || pos === "nw") {
      const xDelta = pos.includes("e") ? dx : -dx;
      const yDelta = pos.includes("s") ? dy : -dy;
      const wFromX = startWidth + xDelta;
      const wFromY = (startHeight + yDelta) * ratio;
      nextWidth = Math.abs(xDelta) >= Math.abs(yDelta * ratio) ? wFromX : wFromY;
    }

    nextWidth = Math.round(Math.max(MIN_WIDTH, Math.min(nextWidth, maxWidth)));
    const nextHeight = Math.round(nextWidth / ratio);

    selectedImg.style.width = `${nextWidth}px`;
    selectedImg.style.height = "auto";
    selectedImg.removeAttribute("width");
    selectedImg.removeAttribute("height");

    updateBadge(nextWidth, nextHeight, maxWidth);
    positionOverlay();
  }

  function preventTouchScroll(e) {
    e.preventDefault();
  }

  function endDrag({ commit = true } = {}) {
    if (!dragState) return;
    const { handle, pointerId } = dragState;
    try {
      handle.releasePointerCapture(pointerId);
    } catch {
      // ignore if already released
    }
    handle.removeEventListener("pointermove", onHandlePointerMove);
    handle.removeEventListener("pointerup", onHandlePointerUp);
    handle.removeEventListener("pointercancel", onHandlePointerUp);
    window.removeEventListener("touchmove", preventTouchScroll);
    overlayHost.classList.remove("is-resizing");
    toolbar.style.visibility = "";
    dragState = null;
    dimBadge.hidden = true;
    if (commit) {
      renderToolbar();
      positionOverlay();
      onChange?.();
    }
  }

  function onHandlePointerUp() {
    endDrag({ commit: true });
  }

  function updateBadge(w, h, maxWidth) {
    const pct = Math.min(100, Math.round((w / maxWidth) * 100));
    dimBadge.textContent = `${Math.round(w)} × ${Math.round(h)} px · ${pct}%`;
  }

  // Click selection & outside dismissal
  function onSurfaceClick(e) {
    const img = e.target.closest("img");
    if (img && surface.contains(img)) {
      e.preventDefault();
      selectImage(img);
    } else if (selectedImg) {
      deselect();
    }
  }

  function onDocPointerDown(e) {
    if (!selectedImg) return;
    const path = e.composedPath ? e.composedPath() : [e.target];
    if (path.includes(selectedImg) || path.includes(box) || path.includes(toolbar)) return;
    // Keep image selected when clicking alignment controls in the main editor toolbar
    if (editorToolbar && path.includes(editorToolbar)) {
      const alignBtn = e.target?.closest?.("button[data-cmd^=align]");
      if (alignBtn) return;
    }
    deselect();
  }

  function onDocKeyDown(e) {
    if (!selectedImg || altEditing) return;
    if (e.key === "Escape") {
      e.preventDefault();
      deselect();
      squire.focus();
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      deleteSelectedImage();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const img = selectedImg;
      const range = document.createRange();
      if (e.key === "ArrowLeft") range.setStartBefore(img);
      else range.setStartAfter(img);
      range.collapse(true);
      deselect();
      squire.setSelection(range).focus();
    }
  }

  // Image upload / paste / drag-and-drop
  async function insertImageFile(file) {
    if (!file || !file.type.startsWith("image/")) return null;
    onStatus?.(`Uploading ${file.name || "image"}...`);
    try {
      const uploader = getUploadHandler?.();
      const src = uploader ? await uploader(file) : await fileToDataUrl(file);
      if (!src || !isSafeUrl(src, "image")) {
        throw new Error("Image URL rejected by sanitizer");
      }
      const alt = (file.name || "").replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      const img = squire.insertImage(src, { alt, style: "width: 75%; height: auto;" });
      onStatus?.("");
      onChange?.();
      if (img) {
        const selectNow = () => selectImage(img);
        if (img.complete) requestAnimationFrame(selectNow);
        else img.addEventListener("load", selectNow, { once: true });
      }
      return img;
    } catch (err) {
      onStatus?.(err?.message || "Image upload failed");
      setTimeout(() => onStatus?.(""), 3000);
      return null;
    }
  }

  function insertImageUrl(url, alt = "") {
    if (!isSafeUrl(url, "image")) return null;
    const img = squire.insertImage(url.trim(), { alt: alt.trim(), style: "width: 75%; height: auto;" });
    onChange?.();
    if (img) {
      const selectNow = () => selectImage(img);
      if (img.complete) requestAnimationFrame(selectNow);
      else img.addEventListener("load", selectNow, { once: true });
    }
    return img;
  }

  function onPasteImage(e) {
    const items = e.detail?.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          insertImageFile(file);
          return;
        }
      }
    }
  }

  function onDragOver(e) {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    e.preventDefault();
    surface.classList.add("ve-drag-over");
  }

  function onDragLeave(e) {
    if (!surface.contains(e.relatedTarget)) {
      surface.classList.remove("ve-drag-over");
    }
  }

  function onDrop(e) {
    surface.classList.remove("ve-drag-over");
    const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    e.preventDefault();
    e.stopPropagation();
    deselect();
    for (const file of files) {
      insertImageFile(file);
    }
  }

  const onViewportChange = () => {
    if (selectedImg) positionOverlay();
  };

  const ro = new ResizeObserver(() => {
    if (selectedImg) positionOverlay();
  });
  ro.observe(surface);

  surface.addEventListener("click", onSurfaceClick);
  surface.addEventListener("dragover", onDragOver);
  surface.addEventListener("dragleave", onDragLeave);
  surface.addEventListener("drop", onDrop);
  squire.addEventListener("pasteImage", onPasteImage);
  document.addEventListener("pointerdown", onDocPointerDown, true);
  document.addEventListener("keydown", onDocKeyDown, true);
  window.addEventListener("scroll", onViewportChange, true);
  window.addEventListener("resize", onViewportChange);

  return {
    name: "imageResize",
    selectImage,
    deselect,
    applyAlignment,
    applyWidth,
    getAlignment: () => (selectedImg ? selectedImg.getAttribute("data-align") || inferAlign(selectedImg) : null),
    insertImageFile,
    insertImageUrl,
    getSelectedImage: () => selectedImg,
    destroy() {
      deselect();
      ro.disconnect();
      surface.removeEventListener("click", onSurfaceClick);
      surface.removeEventListener("dragover", onDragOver);
      surface.removeEventListener("dragleave", onDragLeave);
      surface.removeEventListener("drop", onDrop);
      squire.removeEventListener("pasteImage", onPasteImage);
      document.removeEventListener("pointerdown", onDocPointerDown, true);
      document.removeEventListener("keydown", onDocKeyDown, true);
      window.removeEventListener("scroll", onViewportChange, true);
      window.removeEventListener("resize", onViewportChange);
      box.remove();
      toolbar.remove();
    },
  };
}

function escapeAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
  return { createImageResizeExtension };
})();

// --- src/extensions/bubble-menu.js ---
const { createBubbleMenuExtension } = (() => {
/**
 * Floating selection toolbar powered by native Popover API (`popover="manual"`)
 * and CSS Anchor Positioning (with automatic rect fallback).
 */

const SUPPORTS_ANCHOR = typeof CSS !== "undefined" && CSS.supports("anchor-name: --a");
let anchorCounter = 0;

function createBubbleMenuExtension({
  squire,
  surface,
  overlayHost,
  onCommand,
  onOpenLink,
  isImageSelected,
  renderIcon = icon,
}) {
  const anchorName = `--ve-sel-anchor-${++anchorCounter}`;

  const anchor = document.createElement("div");
  anchor.className = "ve-virtual-anchor";
  if (SUPPORTS_ANCHOR) {
    anchor.style.setProperty("anchor-name", anchorName);
  }
  overlayHost.appendChild(anchor);

  const menu = document.createElement("div");
  menu.className = "ve-popover ve-bubble-menu";
  menu.setAttribute("popover", "manual");
  menu.setAttribute("role", "toolbar");
  menu.setAttribute("aria-label", "Text formatting");
  if (SUPPORTS_ANCHOR) {
    menu.style.setProperty("position-anchor", anchorName);
  }

  menu.innerHTML = `
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="bold" title="Bold (Ctrl+B)">${renderIcon("bold", 14)}</button>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="italic" title="Italic (Ctrl+I)">${renderIcon("italic", 14)}</button>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="underline" title="Underline (Ctrl+U)">${renderIcon("underline", 14)}</button>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="strike" title="Strikethrough">${renderIcon("strike", 14)}</button>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="code" title="Code">${renderIcon("code", 14)}</button>
    <span class="ve-sep"></span>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="link" title="Link (Ctrl+K)">${renderIcon("link", 14)}</button>
  `;
  overlayHost.appendChild(menu);

  let visible = false;
  let rafId = 0;

  menu.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });

  menu.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-cmd]");
    if (!btn) return;
    const cmd = btn.dataset.cmd;
    if (cmd === "link") {
      hide();
      onOpenLink?.();
      return;
    }
    execCommand(squire, cmd);
    syncActive();
    onCommand?.();
    scheduleUpdate();
  });

  function syncActive() {
    const active = getActiveState(squire);
    for (const btn of menu.querySelectorAll("button[data-cmd]")) {
      const isOn = Boolean(active[btn.dataset.cmd]);
      btn.classList.toggle("is-active", isOn);
      btn.setAttribute("aria-pressed", String(isOn));
    }
  }

  function show() {
    if (!visible) {
      visible = true;
      try {
        if (!menu.matches(":popover-open")) menu.showPopover();
      } catch {
        menu.hidden = false;
      }
    }
  }

  function hide() {
    if (visible) {
      visible = false;
      try {
        if (menu.matches(":popover-open")) menu.hidePopover();
      } catch {
        menu.hidden = true;
      }
    }
  }

  function update() {
    if (isImageSelected?.()) {
      hide();
      return;
    }

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      hide();
      return;
    }

    const range = sel.getRangeAt(0);
    if (!surface.contains(range.commonAncestorContainer)) {
      hide();
      return;
    }

    const text = sel.toString();
    if (!text || !text.trim()) {
      hide();
      return;
    }

    const rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      hide();
      return;
    }

    syncActive();

    if (SUPPORTS_ANCHOR) {
      anchor.style.top = `${rect.top}px`;
      anchor.style.left = `${rect.left}px`;
      anchor.style.width = `${Math.max(1, rect.width)}px`;
      anchor.style.height = `${Math.max(1, rect.height)}px`;
      show();
    } else {
      show();
      const menuRect = menu.getBoundingClientRect();
      let top = rect.top - menuRect.height - 8;
      if (top < 8) top = rect.bottom + 8;
      let left = rect.left + rect.width / 2 - menuRect.width / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - menuRect.width - 8));
      menu.style.top = `${Math.round(top)}px`;
      menu.style.left = `${Math.round(left)}px`;
    }
  }

  function scheduleUpdate() {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(update);
  }

  const onBlur = () => hide();

  document.addEventListener("selectionchange", scheduleUpdate);
  window.addEventListener("scroll", scheduleUpdate, true);
  window.addEventListener("resize", scheduleUpdate);
  squire.addEventListener("blur", onBlur);

  return {
    name: "bubbleMenu",
    hide,
    update: scheduleUpdate,
    destroy() {
      cancelAnimationFrame(rafId);
      hide();
      document.removeEventListener("selectionchange", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
      window.removeEventListener("resize", scheduleUpdate);
      squire.removeEventListener("blur", onBlur);
      anchor.remove();
      menu.remove();
    },
  };
}
  return { createBubbleMenuExtension };
})();

// --- src/extensions/find-replace.js ---
const { createFindReplaceExtension } = (() => {
/**
 * Non-destructive Find & Replace extension powered by the native
 * CSS Custom Highlight API (`CSS.highlights` + `::highlight(...)`).
 * Highlights matches directly in the browser paint layer without mutating `contenteditable`.
 */

const SUPPORTS_HIGHLIGHTS =
  typeof CSS !== "undefined" && "highlights" in CSS && typeof Highlight !== "undefined";

function createFindReplaceExtension({ surface, barSlot, squire, onChange, renderIcon = icon }) {
  const bar = document.createElement("div");
  bar.className = "ve-find-bar";
  bar.hidden = true;
  bar.innerHTML = `
    <div class="ve-find-row">
      <input type="search" class="ve-input ve-input--sm" data-find-input placeholder="Find in document..." aria-label="Find text" />
      <span class="ve-find-count" data-find-count>0 / 0</span>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-action="prev" title="Previous match">↑</button>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-action="next" title="Next match">↓</button>
      <input type="text" class="ve-input ve-input--sm" data-replace-input placeholder="Replace with..." aria-label="Replace text" />
      <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-action="replace">Replace</button>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-action="replace-all">All</button>
      <button type="button" class="ve-btn ve-btn--sm" data-action="close" title="Close (Esc)">${renderIcon("x", 14)}</button>
    </div>
  `;
  barSlot.appendChild(bar);

  const findInput = bar.querySelector("[data-find-input]");
  const replaceInput = bar.querySelector("[data-replace-input]");
  const countEl = bar.querySelector("[data-find-count]");

  let matches = [];
  let activeIndex = -1;

  function clearHighlights() {
    if (!SUPPORTS_HIGHLIGHTS) return;
    CSS.highlights.delete("ve-find");
    CSS.highlights.delete("ve-find-active");
  }

  function computeMatches() {
    clearHighlights();
    matches = [];
    const query = findInput.value;
    if (!query) {
      activeIndex = -1;
      countEl.textContent = "0 / 0";
      return;
    }

    const needle = query.toLowerCase();
    const walker = document.createTreeWalker(surface, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const haystack = (node.nodeValue || "").toLowerCase();
      let idx = 0;
      while ((idx = haystack.indexOf(needle, idx)) !== -1) {
        const range = new Range();
        range.setStart(node, idx);
        range.setEnd(node, idx + needle.length);
        matches.push(range);
        idx += needle.length;
      }
    }

    if (matches.length === 0) {
      activeIndex = -1;
    } else if (activeIndex < 0 || activeIndex >= matches.length) {
      activeIndex = 0;
    }

    paintHighlights();
  }

  function paintHighlights() {
    countEl.textContent = matches.length ? `${activeIndex + 1} / ${matches.length}` : "0 / 0";
    if (!SUPPORTS_HIGHLIGHTS || matches.length === 0) return;

    const all = new Highlight(...matches);
    CSS.highlights.set("ve-find", all);
    if (activeIndex >= 0 && matches[activeIndex]) {
      CSS.highlights.set("ve-find-active", new Highlight(matches[activeIndex]));
      const rect = matches[activeIndex].getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        matches[activeIndex].startContainer.parentElement?.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }

  function step(delta) {
    if (!matches.length) return;
    activeIndex = (activeIndex + delta + matches.length) % matches.length;
    paintHighlights();
  }

  function replaceCurrent() {
    if (activeIndex < 0 || !matches[activeIndex]) return;
    const replacement = replaceInput.value;
    squire.saveUndoState();
    const range = matches[activeIndex];
    range.deleteContents();
    if (replacement) {
      range.insertNode(document.createTextNode(replacement));
    }
    surface.normalize();
    onChange?.();
    computeMatches();
  }

  function replaceAll() {
    if (!matches.length) return;
    const replacement = replaceInput.value;
    squire.saveUndoState();
    // Replace from end to start so earlier offsets remain valid
    for (let i = matches.length - 1; i >= 0; i -= 1) {
      const range = matches[i];
      range.deleteContents();
      if (replacement) {
        range.insertNode(document.createTextNode(replacement));
      }
    }
    surface.normalize();
    onChange?.();
    computeMatches();
  }

  function open() {
    bar.hidden = false;
    const selected = window.getSelection()?.toString().trim();
    if (selected && !selected.includes("\n")) {
      findInput.value = selected;
    }
    computeMatches();
    findInput.focus();
    findInput.select();
  }

  function close() {
    bar.hidden = true;
    clearHighlights();
    matches = [];
    activeIndex = -1;
    squire.focus();
  }

  function toggle() {
    bar.hidden ? open() : close();
  }

  findInput.addEventListener("input", () => computeMatches());
  findInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      step(e.shiftKey ? -1 : 1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  });
  replaceInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      replaceCurrent();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  });

  bar.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    switch (btn.dataset.action) {
      case "prev":
        step(-1);
        break;
      case "next":
        step(1);
        break;
      case "replace":
        replaceCurrent();
        break;
      case "replace-all":
        replaceAll();
        break;
      case "close":
        close();
        break;
    }
  });

  const onEditorInput = () => {
    if (!bar.hidden && findInput.value) computeMatches();
  };
  squire.addEventListener("input", onEditorInput);

  return {
    name: "findReplace",
    open,
    close,
    toggle,
    destroy() {
      clearHighlights();
      squire.removeEventListener("input", onEditorInput);
      bar.remove();
    },
  };
}
  return { createFindReplaceExtension };
})();

// --- src/vanilia-editor.js ---
const { VaniliaEditorElement } = (() => {
/**
 * <vanilia-editor> — Form-Associated Custom Element (ElementInternals)
 * powered by vendored Fastmail Squire + modular modern Web/CSS API extensions.
 */
const BaseHTMLElement = typeof HTMLElement !== "undefined" ? HTMLElement : class {};

class VaniliaEditorElement extends BaseHTMLElement {
  static formAssociated = true;
  static observedAttributes = ["placeholder", "disabled", "required", "upload-url", "toolbar"];

  /** Override icons for every editor on the page (see `setIcons` in icons.js). */
  static setIcons(map) {
    setIcons(map);
  }

  /** Names of all overridable icons. */
  static get iconNames() {
    return ICON_NAMES;
  }

  #iconOverrides = new Map();
  #unsubscribeIcons = null;
  #icon = (name, size) => icon(name, size, this.#iconOverrides);

  #internals;
  #squire = null;
  #extensions = [];
  #imageResize = null;
  #bubbleMenu = null;
  #findReplace = null;

  #root = null;
  #toolbar = null;
  #surface = null;
  #overlayHost = null;
  #statusEl = null;
  #linkPopover = null;
  #imagePopover = null;
  #fileInput = null;

  #initialHTML = "";
  #pendingValue = null;
  #savedRange = null;
  #canUndo = false;
  #canRedo = false;
  #mounted = false;
  #uploadHandler = null;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#internals.role = "group";
  }

  /** Optional JS hook: `(file: File) => Promise<string>` returning an image URL */
  get onImageUpload() {
    return this.#uploadHandler;
  }

  set onImageUpload(fn) {
    this.#uploadHandler = typeof fn === "function" ? fn : null;
  }

  get value() {
    if (!this.#squire) {
      return this.#pendingValue ?? this.getAttribute("value") ?? "";
    }
    return this.getHTML();
  }

  set value(html) {
    const str = html == null ? "" : String(html);
    if (!this.#squire) {
      this.#pendingValue = str;
      return;
    }
    this.setHTML(str);
  }

  get form() {
    return this.#internals.form;
  }

  get validity() {
    return this.#internals.validity;
  }

  get validationMessage() {
    return this.#internals.validationMessage;
  }

  checkValidity() {
    return this.#internals.checkValidity();
  }

  reportValidity() {
    return this.#internals.reportValidity();
  }

  connectedCallback() {
    if (this.#mounted) {
      this.#syncFormState();
      return;
    }

    // Declarative per-editor icon overrides: <template data-ve-icon="bold">...</template>
    for (const tpl of this.querySelectorAll(":scope > template[data-ve-icon]")) {
      const name = tpl.dataset.veIcon;
      if (name) this.#iconOverrides.set(name, tpl.innerHTML.trim());
      tpl.remove();
    }

    // Capture any declarative initial content before building the UI
    if (this.#pendingValue !== null) {
      this.#initialHTML = this.#pendingValue;
      this.#pendingValue = null;
    } else if (this.hasAttribute("value")) {
      this.#initialHTML = this.getAttribute("value") || "";
    } else {
      const tpl = this.querySelector(":scope > template");
      this.#initialHTML = tpl ? tpl.innerHTML.trim() : this.innerHTML.trim();
    }

    this.#buildDOM();
    this.#initEditor();
    this.#mounted = true;
    this.#unsubscribeIcons = onIconsChange(() => this.#refreshIcons());

    if (this.#initialHTML) {
      this.setHTML(this.#initialHTML, { silent: true });
    }
    this.#applyDisabled(this.hasAttribute("disabled"));
    this.#syncFormState();
    this.#syncToolbar();
  }

  disconnectedCallback() {
    // Preserve current content if element is moved/reparented in the DOM
    if (this.#squire) {
      this.#pendingValue = this.getHTML();
    }
    this.#teardown();
  }

  attributeChangedCallback(name, _oldVal, newVal) {
    if (!this.#mounted) return;
    if (name === "placeholder" && this.#surface) {
      this.#surface.dataset.placeholder = newVal || "Start writing...";
    } else if (name === "disabled") {
      this.#applyDisabled(newVal !== null);
    } else if (name === "required") {
      this.#syncFormState();
    } else if (name === "toolbar" && this.#toolbar) {
      this.#toolbar.hidden = newVal === "none";
    }
  }

  formDisabledCallback(disabled) {
    this.#applyDisabled(disabled);
  }

  formResetCallback() {
    this.setHTML(this.#initialHTML || "");
  }

  formStateRestoreCallback(state) {
    if (typeof state === "string") {
      this.setHTML(state);
    }
  }

  // ---- Public API ----

  getHTML() {
    if (!this.#squire) return this.#pendingValue || "";
    const normalized = normalizeExportHTML(this.#squire.getHTML());
    // Treat empty placeholder paragraph as empty string
    if (normalized === "<p><br></p>" || normalized === "<p></p>" || normalized === "<div><br></div>") {
      return "";
    }
    return normalized;
  }

  getFormattedHTML() {
    return formatHTML(this.getHTML());
  }

  getText() {
    return (this.#surface?.textContent || "").trim();
  }

  setHTML(html, { silent = false } = {}) {
    if (!this.#squire) {
      this.#pendingValue = html || "";
      return;
    }
    this.#imageResize?.deselect();
    this.#squire.setHTML(html || "");
    this.#syncFormState();
    this.#syncToolbar();
    if (silent) this.#emitStateEvent();
    else this.#emitUpdate();
  }

  exec(command, arg) {
    if (!this.#squire || this.hasAttribute("disabled")) return;
    if (command === "link") {
      this.#openLinkPopover();
      return;
    }
    if (command === "image") {
      this.#openImagePopover();
      return;
    }
    if (command === "find") {
      this.#findReplace?.toggle();
      return;
    }
    if (command === "alignLeft" || command === "alignCenter" || command === "alignRight") {
      const align = command === "alignCenter" ? "center" : command === "alignRight" ? "right" : "left";
      const targetImg = this.#imageResize?.getSelectedImage() || this.#findImageOnlyBlock();
      if (targetImg) {
        if (!this.#imageResize?.getSelectedImage()) {
          this.#imageResize?.selectImage(targetImg);
        }
        this.#imageResize?.applyAlignment(align);
        this.#syncToolbar();
        return;
      }
    }
    execCommand(this.#squire, command, arg);
    this.#syncFormState();
    this.#syncToolbar();
    this.#emitUpdate();
  }

  isActive(name, attrs) {
    return isActive(this.#squire, name, attrs);
  }

  /**
   * Override icons for this editor only. Pass `null` for a name to fall back
   * to the global `setIcons()` registry / built-in icon.
   */
  setIcons(map = {}) {
    for (const [name, markup] of Object.entries(map)) {
      if (markup == null || markup === "") this.#iconOverrides.delete(name);
      else this.#iconOverrides.set(name, String(markup));
    }
    this.#refreshIcons();
  }

  insertImage(url, alt = "") {
    return this.#imageResize?.insertImageUrl(url, alt);
  }

  focus() {
    this.#squire?.focus();
  }

  // ---- Internal Setup ----

  #buildDOM() {
    this.innerHTML = "";

    const root = document.createElement("div");
    root.className = "ve-root";
    // Keep hypermedia frameworks (e.g. Datastar) from scanning internal contenteditable mutations
    root.setAttribute("data-ignore", "");
    root.innerHTML = `
      <div class="ve-toolbar" role="toolbar" aria-label="Formatting toolbar">
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="bold" title="Bold (Ctrl+B)">${this.#icon("bold")}</button>
          <button type="button" class="ve-btn" data-cmd="italic" title="Italic (Ctrl+I)">${this.#icon("italic")}</button>
          <button type="button" class="ve-btn" data-cmd="underline" title="Underline (Ctrl+U)">${this.#icon("underline")}</button>
          <button type="button" class="ve-btn" data-cmd="strike" title="Strikethrough (Ctrl+Shift+X)">${this.#icon("strike")}</button>
          <button type="button" class="ve-btn" data-cmd="code" title="Code / Code Block">${this.#icon("code")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="paragraph" title="Paragraph">${this.#icon("paragraph")}</button>
          <button type="button" class="ve-btn" data-cmd="h1" title="Heading 1">${this.#icon("h1")}</button>
          <button type="button" class="ve-btn" data-cmd="h2" title="Heading 2">${this.#icon("h2")}</button>
          <button type="button" class="ve-btn" data-cmd="h3" title="Heading 3">${this.#icon("h3")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="bulletList" title="Bullet list">${this.#icon("bulletList")}</button>
          <button type="button" class="ve-btn" data-cmd="orderedList" title="Numbered list">${this.#icon("orderedList")}</button>
          <button type="button" class="ve-btn" data-cmd="blockquote" title="Blockquote">${this.#icon("quote")}</button>
          <button type="button" class="ve-btn" data-cmd="hr" title="Horizontal rule">${this.#icon("hr")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="alignLeft" title="Align left">${this.#icon("alignLeft")}</button>
          <button type="button" class="ve-btn" data-cmd="alignCenter" title="Align center">${this.#icon("alignCenter")}</button>
          <button type="button" class="ve-btn" data-cmd="alignRight" title="Align right">${this.#icon("alignRight")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="link" title="Insert or edit link (Ctrl+K)">${this.#icon("link")}</button>
          <button type="button" class="ve-btn" data-cmd="image" title="Insert or upload image">${this.#icon("image")}</button>
          <button type="button" class="ve-btn" data-cmd="clearFormatting" title="Clear formatting">${this.#icon("clear")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="undo" title="Undo (Ctrl+Z)">${this.#icon("undo")}</button>
          <button type="button" class="ve-btn" data-cmd="redo" title="Redo (Ctrl+Shift+Z)">${this.#icon("redo")}</button>
          <button type="button" class="ve-btn" data-cmd="find" title="Find & Replace (Ctrl+F)">${this.#icon("search")}</button>
        </div>
      </div>

      <div class="ve-find-slot"></div>

      <div class="ve-stage">
        <div
          class="ve-surface"
          role="textbox"
          aria-multiline="true"
          aria-label="Rich text editor"
          data-placeholder="${escapeAttr(this.getAttribute("placeholder") || "Start writing, paste an image, or drop a photo here...")}"
        ></div>
      </div>

      <div class="ve-footer">
        <span class="ve-status" data-status></span>
        <span class="ve-metrics" data-metrics>0 words</span>
      </div>

      <input type="file" accept="image/*" hidden data-file-input />

      <div class="ve-popover ve-form-popover" popover="auto" data-link-popover>
        <form class="ve-popover-form" data-link-form>
          <label class="ve-field">
            <span>Link URL</span>
            <input type="url" class="ve-input" name="href" placeholder="https://example.com" required />
          </label>
          <div class="ve-popover-actions">
            <button type="button" class="ve-btn ve-btn--sm ve-btn--danger ve-btn--text" data-remove-link hidden>Remove</button>
            <span class="ve-spacer"></span>
            <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-close-popover>Cancel</button>
            <button type="submit" class="ve-btn ve-btn--sm ve-btn--primary ve-btn--text">Apply</button>
          </div>
        </form>
      </div>

      <div class="ve-popover ve-form-popover" popover="auto" data-image-popover>
        <form class="ve-popover-form" data-image-form>
          <div class="ve-upload-row">
            <button type="button" class="ve-btn ve-btn--text ve-btn--upload" data-pick-file>
              ${this.#icon("upload", 15)}
              <span>Choose image file...</span>
            </button>
          </div>
          <div class="ve-divider-label"><span>or paste URL</span></div>
          <label class="ve-field">
            <span>Image URL</span>
            <input type="url" class="ve-input" name="src" placeholder="https://..." required />
          </label>
          <label class="ve-field">
            <span>Alt text (optional)</span>
            <input type="text" class="ve-input" name="alt" placeholder="Describe the image" />
          </label>
          <div class="ve-popover-actions">
            <span class="ve-spacer"></span>
            <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-close-popover>Cancel</button>
            <button type="submit" class="ve-btn ve-btn--sm ve-btn--primary ve-btn--text">Insert</button>
          </div>
        </form>
      </div>
    `;

    this.appendChild(root);

    this.#root = root;
    this.#toolbar = root.querySelector(".ve-toolbar");
    this.#toolbar.hidden = this.getAttribute("toolbar") === "none";
    this.#surface = root.querySelector(".ve-surface");
    this.#overlayHost = root.querySelector(".ve-stage");
    this.#statusEl = root.querySelector("[data-status]");
    this.#linkPopover = root.querySelector("[data-link-popover]");
    this.#imagePopover = root.querySelector("[data-image-popover]");
    this.#fileInput = root.querySelector("[data-file-input]");

    this.#bindUIEvents();
  }

  #initEditor() {
    this.#squire = new Squire(this.#surface, {
      blockTag: "P",
      sanitizeToDOMFragment,
    });

    const onEditorMutate = () => {
      this.#syncFormState();
      this.#syncToolbar();
      this.#emitUpdate();
    };

    // Custom TipTap-style Image Resize & Upload extension
    this.#imageResize = createImageResizeExtension({
      squire: this.#squire,
      surface: this.#surface,
      overlayHost: this.#overlayHost,
      editorToolbar: this.#toolbar,
      onChange: onEditorMutate,
      onSelectChange: () => {
        this.#syncToolbar();
        this.#emitStateEvent();
      },
      getUploadHandler: () => this.#resolveUploadHandler(),
      renderIcon: this.#icon,
      onStatus: (msg) => {
        if (this.#statusEl) this.#statusEl.textContent = msg || "";
      },
    });

    // Floating selection bubble toolbar (Popover + CSS Anchor Positioning)
    this.#bubbleMenu = createBubbleMenuExtension({
      squire: this.#squire,
      surface: this.#surface,
      overlayHost: this.#overlayHost,
      onCommand: onEditorMutate,
      onOpenLink: () => this.#openLinkPopover(),
      isImageSelected: () => Boolean(this.#imageResize?.getSelectedImage()),
      renderIcon: this.#icon,
    });

    // Non-destructive Find & Replace (CSS Custom Highlight API)
    this.#findReplace = createFindReplaceExtension({
      surface: this.#surface,
      barSlot: this.#root.querySelector(".ve-find-slot"),
      squire: this.#squire,
      onChange: onEditorMutate,
      renderIcon: this.#icon,
    });

    this.#extensions = [this.#imageResize, this.#bubbleMenu, this.#findReplace];

    // Extra keyboard shortcuts
    const mod = navigator.platform?.toLowerCase().includes("mac") ? "Meta" : "Ctrl";
    this.#squire.setKeyHandler(`${mod}-k`, (_ed, event) => {
      event.preventDefault();
      this.#openLinkPopover();
    });
    this.#squire.setKeyHandler(`${mod}-f`, (_ed, event) => {
      event.preventDefault();
      this.#findReplace?.open();
    });
    this.#squire.setKeyHandler(`${mod}-Shift-x`, (_ed, event) => {
      event.preventDefault();
      this.exec("strike");
    });

    const onSelectionState = () => {
      this.#syncToolbar();
      this.#emitStateEvent();
    };

    // Squire lifecycle events
    this.#squire.addEventListener("input", onEditorMutate);
    this.#squire.addEventListener("pathChange", onSelectionState);
    this.#squire.addEventListener("select", onSelectionState);
    this.#squire.addEventListener("cursor", onSelectionState);
    this.#squire.addEventListener("undoStateChange", (e) => {
      this.#canUndo = Boolean(e.detail?.canUndo);
      this.#canRedo = Boolean(e.detail?.canRedo);
      onSelectionState();
    });
    this.#squire.addEventListener("blur", () => {
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }

  #bindUIEvents() {
    // Prevent toolbar button mousedown from stealing focus/selection from Squire
    this.#toolbar.addEventListener("mousedown", (e) => {
      if (e.target.closest("button")) e.preventDefault();
    });

    this.#toolbar.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-cmd]");
      if (!btn || btn.disabled) return;
      this.exec(btn.dataset.cmd);
    });

    // Link popover handlers
    const linkForm = this.#linkPopover.querySelector("[data-link-form]");
    const removeLinkBtn = this.#linkPopover.querySelector("[data-remove-link]");

    linkForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const href = linkForm.elements.href.value.trim();
      if (!isSafeUrl(href, "link")) return;
      this.#hidePopover(this.#linkPopover);
      this.#restoreSavedRange();
      this.exec("makeLink", href);
    });

    removeLinkBtn.addEventListener("click", () => {
      this.#hidePopover(this.#linkPopover);
      this.#restoreSavedRange();
      this.exec("removeLink");
    });

    this.#linkPopover.querySelector("[data-close-popover]").addEventListener("click", () => {
      this.#hidePopover(this.#linkPopover);
      this.#restoreSavedRange();
    });

    // Image popover handlers
    const imageForm = this.#imagePopover.querySelector("[data-image-form]");
    imageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const src = imageForm.elements.src.value.trim();
      const alt = imageForm.elements.alt.value.trim();
      if (!isSafeUrl(src, "image")) return;
      this.#hidePopover(this.#imagePopover);
      this.#restoreSavedRange();
      this.#imageResize?.insertImageUrl(src, alt);
      imageForm.reset();
    });

    this.#imagePopover.querySelector("[data-pick-file]").addEventListener("click", () => {
      this.#hidePopover(this.#imagePopover);
      this.#fileInput.value = "";
      this.#fileInput.click();
    });

    this.#imagePopover.querySelector("[data-close-popover]").addEventListener("click", () => {
      this.#hidePopover(this.#imagePopover);
      this.#restoreSavedRange();
    });

    this.#fileInput.addEventListener("change", () => {
      const file = this.#fileInput.files?.[0];
      if (!file) return;
      this.#restoreSavedRange();
      this.#imageResize?.insertImageFile(file);
    });
  }

  #resolveUploadHandler() {
    if (this.#uploadHandler) return this.#uploadHandler;
    const uploadUrl = this.getAttribute("upload-url");
    if (!uploadUrl) return null;

    return async (file) => {
      const resp = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`Upload failed (${resp.status})${text ? `: ${text}` : ""}`);
      }
      const data = await resp.json();
      if (!data?.url) throw new Error("Upload endpoint did not return { url }");
      return data.url;
    };
  }

  #openLinkPopover() {
    if (!this.#squire) return;
    this.#savedRange = this.#squire.getSelection()?.cloneRange() || null;

    const existingHref = this.#findSelectedLinkHref();
    const form = this.#linkPopover.querySelector("[data-link-form]");
    const removeBtn = this.#linkPopover.querySelector("[data-remove-link]");
    form.elements.href.value = existingHref || "";
    removeBtn.hidden = !existingHref;

    this.#showPopoverNearButton(this.#linkPopover, this.#toolbar.querySelector('[data-cmd="link"]'));
    requestAnimationFrame(() => {
      form.elements.href.focus();
      form.elements.href.select();
    });
  }

  #openImagePopover() {
    if (!this.#squire) return;
    this.#savedRange = this.#squire.getSelection()?.cloneRange() || null;
    const form = this.#imagePopover.querySelector("[data-image-form]");
    form.reset();
    this.#showPopoverNearButton(this.#imagePopover, this.#toolbar.querySelector('[data-cmd="image"]'));
    requestAnimationFrame(() => form.elements.src.focus());
  }

  #findSelectedLinkHref() {
    const sel = this.#squire?.getSelection();
    if (!sel) return "";
    let node = sel.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    const anchor = node?.closest?.("a");
    return anchor && this.#surface.contains(anchor) ? anchor.getAttribute("href") || "" : "";
  }

  #restoreSavedRange() {
    if (this.#savedRange && this.#squire) {
      try {
        this.#squire.setSelection(this.#savedRange).focus();
      } catch {
        this.#squire.focus();
      }
    }
    this.#savedRange = null;
  }

  #showPopoverNearButton(popoverEl, btnEl) {
    try {
      if (!popoverEl.matches(":popover-open")) popoverEl.showPopover();
    } catch {
      popoverEl.hidden = false;
    }
    // With toolbar="none" the trigger button is hidden: anchor to the caret / selection instead
    const bRect = btnEl?.getClientRects().length ? btnEl.getBoundingClientRect() : this.#selectionRect();
    if (!bRect) return;
    const pRect = popoverEl.getBoundingClientRect();
    let top = bRect.bottom + 8;
    if (top + pRect.height > window.innerHeight - 8) {
      top = Math.max(8, bRect.top - pRect.height - 8);
    }
    let left = bRect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - pRect.width - 8));
    popoverEl.style.top = `${Math.round(top)}px`;
    popoverEl.style.left = `${Math.round(left)}px`;
  }

  #selectionRect() {
    const range = this.#savedRange || this.#squire?.getSelection();
    const rects = range?.getClientRects?.();
    const rect = rects?.length ? rects[rects.length - 1] : range?.getBoundingClientRect?.();
    if (rect && (rect.width || rect.height)) return rect;
    return this.#surface?.getBoundingClientRect() || null;
  }

  #refreshIcons() {
    if (!this.#root) return;
    for (const el of this.#root.querySelectorAll("[data-icon]")) {
      el.outerHTML = this.#icon(el.dataset.icon, Number(el.dataset.size) || 16);
    }
  }

  #hidePopover(popoverEl) {
    try {
      if (popoverEl.matches(":popover-open")) popoverEl.hidePopover();
    } catch {
      popoverEl.hidden = true;
    }
  }

  #findImageOnlyBlock() {
    const sel = this.#squire?.getSelection();
    if (!sel || !this.#surface) return null;
    let node = sel.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    const block = node?.closest?.("p, div, figure");
    if (!block || block === this.#surface || !this.#surface.contains(block)) return null;
    const imgs = block.querySelectorAll("img");
    if (imgs.length === 1 && !(block.textContent || "").trim()) {
      return imgs[0];
    }
    return null;
  }

  #getActiveAlignment() {
    const imgAlign = this.#imageResize?.getAlignment?.();
    if (imgAlign) return imgAlign;
    const sel = this.#squire?.getSelection();
    if (!sel || !this.#surface) return null;
    let node = sel.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    const block = node?.closest?.("p, div, h1, h2, h3, h4, h5, h6, li, blockquote");
    if (!block || !this.#surface.contains(block)) return null;
    if (block.style.textAlign) return block.style.textAlign;
    if (block.classList.contains("align-center")) return "center";
    if (block.classList.contains("align-right")) return "right";
    if (block.classList.contains("align-left")) return "left";
    return null;
  }

  #getActiveState() {
    const active = getActiveState(this.#squire);
    const activeAlign = this.#getActiveAlignment();
    active.alignLeft = activeAlign === "left";
    active.alignCenter = activeAlign === "center";
    active.alignRight = activeAlign === "right";
    return active;
  }

  #syncToolbar() {
    if (!this.#toolbar || !this.#squire) return;
    const active = this.#getActiveState();
    for (const btn of this.#toolbar.querySelectorAll("button[data-cmd]")) {
      const cmd = btn.dataset.cmd;
      if (cmd in active) {
        btn.classList.toggle("is-active", active[cmd]);
        btn.setAttribute("aria-pressed", String(active[cmd]));
      }
      if (cmd === "undo") btn.disabled = !this.#canUndo || this.hasAttribute("disabled");
      if (cmd === "redo") btn.disabled = !this.#canRedo || this.hasAttribute("disabled");
    }

    // Update empty-state & word count
    const html = this.getHTML();
    const text = this.getText();
    const hasImg = Boolean(this.#surface?.querySelector("img"));
    const isEmpty = !text && !hasImg;
    this.#surface?.toggleAttribute("data-empty", isEmpty);

    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const metricsEl = this.#root?.querySelector("[data-metrics]");
    if (metricsEl) {
      const imgCount = this.#surface?.querySelectorAll("img").length || 0;
      const parts = [`${words} ${words === 1 ? "word" : "words"}`];
      if (imgCount) parts.push(`${imgCount} ${imgCount === 1 ? "image" : "images"}`);
      metricsEl.textContent = parts.join(" · ");
    }
    return html;
  }

  #syncFormState() {
    const html = this.getHTML();
    this.#internals.setFormValue(html, html);

    const isRequired = this.hasAttribute("required");
    const hasContent = Boolean(this.getText() || this.#surface?.querySelector("img"));
    if (isRequired && !hasContent) {
      this.#internals.setValidity(
        { valueMissing: true },
        "Please fill out this field.",
        this.#surface || undefined,
      );
    } else {
      this.#internals.setValidity({});
    }
  }

  #applyDisabled(disabled) {
    if (!this.#surface || !this.#toolbar) return;
    this.#surface.setAttribute("contenteditable", disabled ? "false" : "true");
    this.#root.classList.toggle("is-disabled", disabled);
    for (const btn of this.#toolbar.querySelectorAll("button")) {
      btn.disabled = disabled;
    }
    if (disabled) this.#imageResize?.deselect();
  }

  #buildDetail() {
    const text = this.getText();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const images = this.#surface?.querySelectorAll("img").length || 0;
    return {
      html: this.getHTML(),
      text,
      words,
      images,
      active: this.#getActiveState(),
      canUndo: this.#canUndo,
      canRedo: this.#canRedo,
    };
  }

  #emitStateEvent() {
    const detail = this.#buildDetail();
    this.dispatchEvent(new CustomEvent("ve:update", { detail, bubbles: true, composed: true }));
    this.dispatchEvent(new CustomEvent("editorupdate", { detail, bubbles: true, composed: true }));
  }

  #emitUpdate() {
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.#emitStateEvent();
  }

  #teardown() {
    for (const ext of this.#extensions) {
      ext?.destroy?.();
    }
    this.#extensions = [];
    this.#imageResize = null;
    this.#bubbleMenu = null;
    this.#findReplace = null;
    this.#squire?.destroy();
    this.#squire = null;
    this.#unsubscribeIcons?.();
    this.#unsubscribeIcons = null;
    this.#mounted = false;
  }
}

if (typeof customElements !== "undefined" && !customElements.get("vanilia-editor")) {
  customElements.define("vanilia-editor", VaniliaEditorElement);
}

function escapeAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
  return { VaniliaEditorElement };
})();

export {
  VaniliaEditorElement,
  icon,
  setIcons,
  ICON_NAMES,
  sanitizeToDOMFragment,
  normalizeExportHTML,
  formatHTML,
  isSafeUrl,
  createImageResizeExtension,
  createBubbleMenuExtension,
  createFindReplaceExtension,
};

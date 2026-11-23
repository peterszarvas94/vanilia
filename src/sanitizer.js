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

export function isSafeUrl(url, kind = "link") {
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
export function sanitizeToDOMFragment(html, editor) {
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
export function normalizeExportHTML(rawHtml) {
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
export function formatHTML(html) {
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

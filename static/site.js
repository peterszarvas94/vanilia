// Vanilia website behaviour, as Datastar plugins. Markup wires them up:
//   @theme(name)          apply and remember the color theme
//   @copy(el)             copy the code block next to a button
//   data-highlight        syntax-highlight a <code> element
//   data-hash-redirect    send an old one-page #anchor link to its own page

// No editor import here: pages load it themselves, as a module or a classic script
import { action, attribute } from "datastar";

action({
  name: "theme",
  apply(_ctx, theme) {
    const root = document.documentElement;
    if (theme === "light" || theme === "dark") root.dataset.theme = theme;
    else delete root.dataset.theme;
    try {
      if (root.dataset.theme) localStorage.setItem("vanilia-theme", theme);
      else localStorage.removeItem("vanilia-theme");
    } catch {}
  },
});

action({
  name: "copy",
  async apply(_ctx, btn) {
    const code = btn.parentElement.querySelector("code");
    try {
      await navigator.clipboard.writeText(code.textContent);
      btn.textContent = "Copied";
    } catch {
      btn.textContent = "Press Ctrl+C";
      getSelection().selectAllChildren(code);
    }
    setTimeout(() => (btn.textContent = "Copy"), 1500);
  },
});

attribute({
  name: "highlight",
  requirement: { key: "denied", value: "denied" },
  apply({ el }) {
    const src = el.textContent;
    el.innerHTML = /^\s*</.test(src) ? highlightHTML(src) : highlightCode(src);
  },
});

attribute({
  name: "hash-redirect",
  requirement: { key: "denied", value: "denied" },
  apply({ el }) {
    // Old single-page links like /docs#sanitize land on the first page with
    // the fragment kept; forward them to the page that is now /docs/sanitize.
    const slug = decodeURIComponent(location.hash.slice(1));
    if (!slug || document.getElementById(slug)) return;
    const link = [...el.querySelectorAll("a")].find((a) => a.pathname.endsWith("/" + slug));
    if (link && !link.ariaCurrent) location.replace(link.href);
  },
});

// Minimal syntax highlighting for code blocks. HTML gets its own tokenizer;
// everything else (JS, CSS, Go, JSON, shell) shares one generic C-like one.
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const span = (cls, s) => `<span class="tk-${cls}">${esc(s)}</span>`;

const CODE_RULES = [
  ["c", /\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/],
  ["s", /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`[^`]*`/],
  [
    "k",
    /\b(?:import|from|export|default|const|let|var|function|return|if|else|for|of|in|new|await|async|class|true|false|null|undefined|this|func|package|type|struct|range|nil)\b/,
  ],
  ["p", /--[\w-]+|[\w-]+(?=\s*:(?!=))/],
  ["f", /[A-Za-z_$][\w$]*(?=\()/],
  ["n", /#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|ms|s|%)?/],
];
const CODE_RE = new RegExp(CODE_RULES.map(([, re]) => `(${re.source})`).join("|"), "g");

function highlightCode(src) {
  let out = "";
  let last = 0;
  for (const m of src.matchAll(CODE_RE)) {
    const i = m.slice(1).findIndex((g) => g !== undefined);
    out += esc(src.slice(last, m.index)) + span(CODE_RULES[i][0], m[0]);
    last = m.index + m[0].length;
  }
  return out + esc(src.slice(last));
}

function highlightTag(tag) {
  return tag.replace(
    /^(<\/?)([\w-]+)|([\w:.@-]+)(=)("[^"]*"|'[^']*')|(\/?>)$|([^\s=]+|\s+|=)/g,
    (m, open, name, attr, eq, val, close) =>
      open
        ? esc(open) + span("t", name)
        : attr
          ? span("a", attr) + eq + span("s", val)
          : close
            ? esc(close)
            : m.trim()
              ? span("a", m)
              : m,
  );
}

function highlightHTML(src) {
  let out = "";
  let last = 0;
  const re = /<!--[\s\S]*?-->|<\/?[\w-]+(?:\s+[^\s=>]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/?>/g;
  for (const m of src.matchAll(re)) {
    const text = src.slice(last, m.index);
    // Text right before </script> or </style> is code, not markup
    out += /^<\/(script|style)/.test(m[0]) ? highlightCode(text) : esc(text);
    out += m[0].startsWith("<!--") ? span("c", m[0]) : highlightTag(m[0]);
    last = m.index + m[0].length;
  }
  return out + esc(src.slice(last));
}

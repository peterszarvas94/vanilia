// Vanilia website behaviour, as Datastar plugins. Markup wires them up:
//   @theme(name)          apply and remember the color theme
//   @formatHTML(html)     pretty-print editor HTML
//   @copy(el)             copy the code block next to a button
//   data-highlight        syntax-highlight a <code> element
//   data-scroll-spy       mark the sidebar link of the section in view and
//                         expose its title as $_section

// The editor first: Datastar must see <vanilia-editor> already defined
import { formatHTML } from "vanilia-editor";
import { action, attribute, mergePatch } from "datastar";

action({ name: "formatHTML", apply: (_ctx, html) => formatHTML(html) });

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
  name: "scroll-spy",
  requirement: { key: "denied", value: "denied" },
  apply({ el }) {
    const links = [...el.querySelectorAll("a[href^='#']")];
    const targets = links.map((a) => document.getElementById(a.getAttribute("href").slice(1)));
    let frame = 0;
    const update = () => {
      frame = 0;
      // The current section is the last one whose top has scrolled under the header
      const offset =
        parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + 8 || 80;
      const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
      let current = 0;
      targets.forEach((t, i) => {
        if (t && t.getBoundingClientRect().top <= offset) current = i;
      });
      if (atBottom) current = targets.length - 1;
      links.forEach((a, i) => a.classList.toggle("is-current", i === current));
      mergePatch({ _section: links[current].textContent });
    };
    const onScroll = () => (frame ||= requestAnimationFrame(update));
    addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => removeEventListener("scroll", onScroll);
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

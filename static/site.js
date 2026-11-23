// Vanilia website behaviour: theme toggle, copy buttons, sidebar scroll-spy.

const root = document.documentElement;
const THEMES = ["system", "light", "dark"];

function applyTheme(theme) {
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  try {
    if (theme === "system") localStorage.removeItem("vanilia-theme");
    else localStorage.setItem("vanilia-theme", theme);
  } catch {}
  for (const btn of document.querySelectorAll("[data-theme-toggle]")) btn.title = `Theme: ${theme}`;
}

for (const btn of document.querySelectorAll("[data-theme-toggle]")) {
  btn.addEventListener("click", () => {
    const current = root.dataset.theme || "system";
    applyTheme(THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]);
  });
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-copy]");
  if (!btn) return;
  const code = btn.parentElement.querySelector("code");
  try {
    await navigator.clipboard.writeText(code.textContent);
    btn.textContent = "Copied";
  } catch {
    btn.textContent = "Press Ctrl+C";
    getSelection().selectAllChildren(code);
  }
  setTimeout(() => (btn.textContent = "Copy"), 1500);
});

// Highlight the sidebar link of the section currently in view
const links = new Map(
  [...document.querySelectorAll(".sidebar a[href^='#']")].map((a) => [a.getAttribute("href").slice(1), a]),
);
if (links.size) {
  const visible = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      }
      const current = [...links.keys()].find((id) => visible.has(id));
      if (!current) return;
      for (const [id, a] of links) a.classList.toggle("is-current", id === current);
    },
    { rootMargin: "-70px 0px -55% 0px" },
  );
  for (const id of links.keys()) {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  }
}

// Minimal syntax highlighting for code blocks. HTML gets its own tokenizer;
// everything else (JS, CSS, Go, JSON, shell) shares one generic C-like one.
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const span = (cls, s) => `<span class="tk-${cls}">${esc(s)}</span>`;

const CODE_RULES = [
  ["c", /\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/],
  ["s", /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`[^`]*`/],
  ["k", /\b(?:import|from|export|default|const|let|var|function|return|if|else|for|of|in|new|await|async|class|true|false|null|undefined|this|func|package|type|struct|range|nil)\b/],
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
      open ? esc(open) + span("t", name)
      : attr ? span("a", attr) + eq + span("s", val)
      : close ? esc(close)
      : m.trim() ? span("a", m) : m,
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

for (const code of document.querySelectorAll(".code-block code")) {
  const src = code.textContent;
  code.innerHTML = /^\s*</.test(src) ? highlightHTML(src) : highlightCode(src);
}

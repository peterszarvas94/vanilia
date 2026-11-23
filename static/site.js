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

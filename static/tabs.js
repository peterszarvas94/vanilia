// Reusable, markup-driven tabs. Each button names a panel with data-panel;
// each panel names its button with aria-labelledby. Keep IDs unique per document.
// Activation is manual (Enter/Space): panels may fetch content or differ in height.
// No demo/editor dependency.
class SiteTabs extends HTMLElement {
  #abort;
  #tabs = [];
  #panels = [];

  connectedCallback() {
    this.#abort?.abort();
    this.#abort = new AbortController();
    const { signal } = this.#abort;
    this.#tabs = [...this.querySelectorAll('[role="tab"]')].filter(
      (tab) => tab.closest("site-tabs") === this,
    );
    this.#panels = this.#tabs.map((tab) => document.getElementById(tab.dataset.panel));
    if (this.#panels.some((panel) => !panel || panel.closest("site-tabs") !== this)) return;

    this.#tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => this.select(index), { signal });
      tab.addEventListener(
        "keydown",
        (event) => {
          const rtl = getComputedStyle(tab).direction === "rtl";
          let next;
          if (event.key === "Home") next = 0;
          else if (event.key === "End") next = this.#tabs.length - 1;
          else if (event.key === "ArrowRight") next = index + (rtl ? -1 : 1);
          else if (event.key === "ArrowLeft") next = index + (rtl ? 1 : -1);
          else return;
          event.preventDefault();
          this.#tabs[(next + this.#tabs.length) % this.#tabs.length].focus();
        },
        { signal },
      );
      this.#panels[index].addEventListener("beforematch", () => this.select(index), { signal });
    });
    const followHash = () => {
      let id;
      try {
        id = decodeURIComponent(location.hash.slice(1));
      } catch {
        return;
      }
      const target = document.getElementById(id);
      const index = this.#panels.findIndex((panel) => target && panel.contains(target));
      if (index >= 0) this.select(index);
    };
    window.addEventListener("hashchange", followHash, { signal });
    this.select(
      Math.max(
        0,
        this.#tabs.findIndex((tab) => tab.ariaSelected === "true"),
      ),
    );
    followHash();
  }

  disconnectedCallback() {
    this.#abort?.abort();
  }

  select(index) {
    const selected = this.#tabs[index];
    if (!selected) return;
    this.#tabs.forEach((tab, i) => {
      const active = i === index;
      tab.ariaSelected = String(active);
      tab.tabIndex = active ? 0 : -1;
      const panel = this.#panels[i];
      panel.hidden = active ? false : "until-found";
      if (
        active &&
        !panel.querySelector('button, a[href], input, textarea, select, [tabindex="0"]')
      )
        panel.tabIndex = 0;
      else panel.removeAttribute("tabindex");
    });
    // Scroll only the tab row, including in browsers without container:nearest.
    const list = selected.parentElement;
    const bounds = list.getBoundingClientRect();
    const tabBounds = selected.getBoundingClientRect();
    if (tabBounds.left < bounds.left) list.scrollBy({ left: tabBounds.left - bounds.left });
    else if (tabBounds.right > bounds.right)
      list.scrollBy({ left: tabBounds.right - bounds.right });
    this.dispatchEvent(
      new CustomEvent("tabchange", { bubbles: true, detail: { panel: this.#panels[index] } }),
    );
  }
}

if (!customElements.get("site-tabs")) customElements.define("site-tabs", SiteTabs);

import { icon } from "../icons.js";

/**
 * Non-destructive Find & Replace extension powered by the native
 * CSS Custom Highlight API (`CSS.highlights` + `::highlight(...)`).
 * Highlights matches directly in the browser paint layer without mutating `contenteditable`.
 */

const SUPPORTS_HIGHLIGHTS =
  typeof CSS !== "undefined" && "highlights" in CSS && typeof Highlight !== "undefined";

export function createFindReplaceExtension({ surface, barSlot, squire, onChange, renderIcon = icon }) {
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

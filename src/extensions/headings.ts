/**
 * Headings extension for Squire (`toggleHeading(1|2|3)` and `setParagraph()`).
 */
import type Squire from "squire-rte";

export type HeadingLevel = 1 | 2 | 3;

const BLOCK_SELECTOR = "p, div, h1, h2, h3, h4, h5, h6";

function convertFragmentBlocks(
  squire: Squire,
  frag: DocumentFragment,
  targetTag: string,
): DocumentFragment {
  const doc = squire.getRoot().ownerDocument;
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
    if (child instanceof HTMLElement && child.matches(BLOCK_SELECTOR)) {
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

export function isHeadingActive(squire: Squire, level?: HeadingLevel): boolean {
  if (level) return squire.hasFormat(`H${level}`);
  return squire.hasFormat("H1") || squire.hasFormat("H2") || squire.hasFormat("H3");
}

export function setParagraph(squire: Squire): void {
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

export function toggleHeading(squire: Squire, level: HeadingLevel = 2): void {
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

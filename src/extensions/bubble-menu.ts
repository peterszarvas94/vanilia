import type Squire from "squire-rte";
import { icon, type IconRenderer } from "../icons.js";
import { execCommand, getActiveState, type ActiveState } from "./formatting.js";

/**
 * Floating selection toolbar powered by native Popover API (`popover="manual"`)
 * and CSS Anchor Positioning (with automatic rect fallback).
 */

const SUPPORTS_ANCHOR = typeof CSS !== "undefined" && CSS.supports("anchor-name: --a");
let anchorCounter = 0;

export interface BubbleMenuOptions {
  squire: Squire;
  /** The editable element the selection must be inside. */
  surface: HTMLElement;
  /** Where the menu and its anchor are mounted. */
  overlayHost: HTMLElement;
  onCommand?: () => void;
  onOpenLink?: () => void;
  isImageSelected?: () => boolean;
  renderIcon?: IconRenderer;
  /** Accessible name of the menu. */
  label?: string;
  /**
   * The menu's buttons as markup (`<button data-cmd="...">`). An empty string disables
   * the menu. Defaults to bold, italic, underline, strike, code and link.
   */
  renderButtons?: () => string;
  /** Run a button's command. Defaults to the built-in formatting commands. */
  runCommand?: (name: string) => void;
  /** Update the buttons' pressed / disabled state. Defaults to the built-in formats. */
  syncButtons?: (menu: HTMLElement) => void;
}

export interface BubbleMenuExtension {
  name: "bubbleMenu";
  hide(): void;
  update(): void;
  /** Re-render the buttons (after a layout, label or icon change). */
  refresh(): void;
  destroy(): void;
}

/** Commands that open a popover or panel: the menu closes instead of following the selection. */
const OPENS_UI = new Set(["link", "image", "find"]);

export function createBubbleMenuExtension({
  squire,
  surface,
  overlayHost,
  onCommand,
  onOpenLink,
  isImageSelected,
  renderIcon = icon,
  label = "Text formatting",
  renderButtons,
  runCommand,
  syncButtons,
}: BubbleMenuOptions): BubbleMenuExtension {
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
  menu.setAttribute("aria-label", label);
  if (SUPPORTS_ANCHOR) {
    menu.style.setProperty("position-anchor", anchorName);
  }

  const defaultButtons = () => `
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="bold" title="Bold (Ctrl+B)">${renderIcon("bold", 14)}</button>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="italic" title="Italic (Ctrl+I)">${renderIcon("italic", 14)}</button>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="underline" title="Underline (Ctrl+U)">${renderIcon("underline", 14)}</button>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="strike" title="Strikethrough">${renderIcon("strike", 14)}</button>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="code" title="Code">${renderIcon("code", 14)}</button>
    <span class="ve-sep"></span>
    <button type="button" class="ve-btn ve-btn--sm" data-cmd="link" title="Link (Ctrl+K)">${renderIcon("link", 14)}</button>
  `;
  let empty = false;
  function refresh() {
    const html = (renderButtons ?? defaultButtons)().trim();
    empty = !html;
    menu.innerHTML = html;
    if (empty) hide();
  }
  refresh();
  overlayHost.appendChild(menu);

  let visible = false;
  let rafId = 0;

  menu.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });

  menu.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>("button[data-cmd]");
    const cmd = btn?.dataset.cmd;
    if (!cmd || btn?.disabled) return;
    if (OPENS_UI.has(cmd)) hide();
    if (runCommand) {
      runCommand(cmd);
    } else if (cmd === "link") {
      onOpenLink?.();
    } else {
      execCommand(squire, cmd);
      onCommand?.();
    }
    if (OPENS_UI.has(cmd)) return;
    syncActive();
    scheduleUpdate();
  });

  function syncActive() {
    if (syncButtons) {
      syncButtons(menu);
      return;
    }
    const active = getActiveState(squire);
    for (const btn of menu.querySelectorAll<HTMLButtonElement>("button[data-cmd]")) {
      const isOn = Boolean(active[btn.dataset.cmd as keyof ActiveState]);
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
    if (empty || isImageSelected?.()) {
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
    refresh() {
      refresh();
      if (visible) syncActive();
    },
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

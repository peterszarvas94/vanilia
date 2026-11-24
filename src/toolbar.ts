/**
 * Toolbar layout and buttons: the built-in buttons, custom buttons registered
 * with `defineButton()` / `editor.addButton()`, and the `toolbar` /
 * `bubble-menu` layout syntax (`"bold italic | h2 h3 | link"`).
 */
import type { IconName } from "./icons.js";
import type { LabelName } from "./labels.js";
import type { VaniliaEditorElement } from "./vanilia-editor.js";

/** Names of the built-in toolbar buttons. Each runs the command of the same name. */
export type BuiltinButtonName =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "hr"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "link"
  | "image"
  | "clearFormatting"
  | "undo"
  | "redo"
  | "find";

/** One toolbar entry: a button name, or `"|"` for a separator between groups. */
// `string & {}` keeps editor autocompletion for the built-in names while allowing custom ones
// oxlint-disable-next-line typescript/ban-types
export type ToolbarItem = BuiltinButtonName | "|" | (string & {});

/** A custom toolbar button. */
export interface ToolbarButton {
  /** Unique name. Use it in `toolbar` / `bubble-menu` layouts and with `editor.exec(name)`. */
  name: string;
  /** Tooltip and accessible name. */
  label: string;
  /**
   * Icon: the name of a built-in icon or one registered with `setIcons()`,
   * or trusted markup (anything containing `<`, e.g. an inline `<svg>`).
   */
  icon?: string;
  /** Visible text, shown after the icon (or alone when there is no icon). */
  text?: string;
  /** Keyboard shortcut shown in the tooltip only, e.g. `"Mod+Shift+S"` (`Mod` = ⌘ on macOS, Ctrl elsewhere). */
  shortcut?: string;
  /** Runs on click and on `editor.exec(name)`. */
  run(editor: VaniliaEditorElement): void;
  /** Pressed state, re-checked whenever the selection or content changes. */
  isActive?(editor: VaniliaEditorElement): boolean;
  /** Return `false` to disable the button (re-checked like `isActive`). */
  isEnabled?(editor: VaniliaEditorElement): boolean;
}

interface BuiltinButton {
  icon: IconName;
  label: LabelName;
  shortcut?: string;
}

export const BUILTIN_BUTTONS: Readonly<Record<BuiltinButtonName, BuiltinButton>> = Object.freeze({
  bold: { icon: "bold", label: "bold", shortcut: "Mod+B" },
  italic: { icon: "italic", label: "italic", shortcut: "Mod+I" },
  underline: { icon: "underline", label: "underline", shortcut: "Mod+U" },
  strike: { icon: "strike", label: "strike", shortcut: "Mod+Shift+X" },
  code: { icon: "code", label: "code" },
  paragraph: { icon: "paragraph", label: "paragraph" },
  h1: { icon: "h1", label: "h1" },
  h2: { icon: "h2", label: "h2" },
  h3: { icon: "h3", label: "h3" },
  bulletList: { icon: "bulletList", label: "bulletList" },
  orderedList: { icon: "orderedList", label: "orderedList" },
  blockquote: { icon: "quote", label: "blockquote" },
  hr: { icon: "hr", label: "hr" },
  alignLeft: { icon: "alignLeft", label: "alignLeft" },
  alignCenter: { icon: "alignCenter", label: "alignCenter" },
  alignRight: { icon: "alignRight", label: "alignRight" },
  link: { icon: "link", label: "link", shortcut: "Mod+K" },
  image: { icon: "image", label: "image" },
  clearFormatting: { icon: "clear", label: "clearFormatting" },
  undo: { icon: "undo", label: "undo", shortcut: "Mod+Z" },
  redo: { icon: "redo", label: "redo", shortcut: "Mod+Shift+Z" },
  find: { icon: "search", label: "find", shortcut: "Mod+F" },
});

/** Names of all built-in toolbar buttons. */
export const BUTTON_NAMES: readonly BuiltinButtonName[] = Object.freeze(
  Object.keys(BUILTIN_BUTTONS) as BuiltinButtonName[],
);

/** The default toolbar layout. */
export const DEFAULT_TOOLBAR: readonly ToolbarItem[] = Object.freeze(
  parseItems(
    "bold italic underline strike code | paragraph h1 h2 h3 | bulletList orderedList blockquote hr | alignLeft alignCenter alignRight | link image clearFormatting | undo redo find",
  ),
);

/** The default selection (bubble) menu layout. */
export const DEFAULT_BUBBLE_MENU: readonly ToolbarItem[] = Object.freeze(
  parseItems("bold italic underline strike code | link"),
);

/** Split a layout string (`"bold italic | link"`, commas allowed) into items. */
export function parseItems(layout: string): ToolbarItem[] {
  return layout
    .replace(/\|/g, " | ")
    .split(/[\s,]+/)
    .filter(Boolean);
}

/** Normalize a layout given as a string or an array. `null` means the default layout. */
export function toItems(
  layout: string | readonly ToolbarItem[] | null | undefined,
): ToolbarItem[] | null {
  if (layout == null) return null;
  if (typeof layout === "string") {
    const trimmed = layout.trim();
    if (trimmed === "" || trimmed === "default") return null;
    if (trimmed === "none") return [];
    return parseItems(trimmed);
  }
  return layout.flatMap((item) => parseItems(String(item)));
}

const globalButtons = new Map<string, ToolbarButton>();
const buttonListeners = new Set<() => void>();

/**
 * Register a custom button for every <vanilia-editor> on the page. Editors with
 * the default layout show it in a group at the end of the toolbar; editors with a
 * custom `toolbar` layout show it where its name appears.
 */
export function defineButton(button: ToolbarButton): void {
  globalButtons.set(validateButton(button).name, button);
  for (const listener of buttonListeners) listener();
}

/** Remove a button registered with `defineButton()`. */
export function undefineButton(name: string): void {
  if (globalButtons.delete(name)) {
    for (const listener of buttonListeners) listener();
  }
}

/** Buttons registered with `defineButton()`. */
export function getDefinedButtons(): ReadonlyMap<string, ToolbarButton> {
  return globalButtons;
}

/** Subscribe to `defineButton()` / `undefineButton()`; returns an unsubscribe function. */
export function onButtonsChange(listener: () => void): () => void {
  buttonListeners.add(listener);
  return () => {
    buttonListeners.delete(listener);
  };
}

export function validateButton(button: ToolbarButton): ToolbarButton {
  if (!button || typeof button.name !== "string" || !/^[\w-]+$/.test(button.name)) {
    throw new TypeError("Toolbar button needs a name made of letters, digits, _ or -");
  }
  if (button.name in BUILTIN_BUTTONS) {
    throw new TypeError(`"${button.name}" is a built-in button`);
  }
  if (typeof button.run !== "function") {
    throw new TypeError(`Toolbar button "${button.name}" needs a run() function`);
  }
  return button;
}

const IS_MAC =
  typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.platform || "");

/** Format `"Mod+Shift+X"` for the current platform: `⇧⌘X` on macOS, `Ctrl+Shift+X` elsewhere. */
export function formatShortcut(shortcut: string): string {
  const parts = shortcut.split("+");
  if (!IS_MAC) return parts.map((p) => (p === "Mod" ? "Ctrl" : p)).join("+");
  const symbols: Record<string, string> = { Mod: "⌘", Shift: "⇧", Alt: "⌥", Ctrl: "⌃" };
  const mods = parts.slice(0, -1).sort((a, b) => (a === "Shift" ? -1 : b === "Shift" ? 1 : 0));
  return mods.map((p) => symbols[p] ?? p).join("") + parts[parts.length - 1];
}

/** `aria-keyshortcuts` value for `"Mod+B"`. */
export function ariaShortcut(shortcut: string): string {
  return shortcut.replace("Mod", IS_MAC ? "Meta" : "Control");
}

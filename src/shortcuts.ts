/**
 * Keyboard shortcuts: command name to key combinations. Override or remove any of
 * them globally with `setShortcuts()` or per editor with `editor.setShortcuts()`.
 * Use `shortcuts="none"` to turn them all off.
 *
 * Syntax: modifiers and a key joined with `+`, e.g. `"Mod+Shift+X"`. `Mod` is ⌘ on
 * macOS and Ctrl elsewhere; `Ctrl`, `Meta`, `Alt` and `Shift` are also accepted. The
 * key is a letter, a digit, or a `KeyboardEvent.key` name such as `[`, `Enter` or `F2`.
 */

/** A key combination like `"Mod+Shift+X"`. */
export type Shortcut = string;

/**
 * Shortcut overrides by command or custom button name: one combination or several.
 * Use deleteShortcuts() and restoreDefaultShortcuts() to remove or reset commands.
 */
export type ShortcutMap = Record<string, Shortcut | readonly Shortcut[]>;

/** The built-in shortcuts. */
export const DEFAULT_SHORTCUTS: Readonly<Record<string, readonly Shortcut[]>> = Object.freeze({
  bold: ["Mod+B"],
  italic: ["Mod+I"],
  underline: ["Mod+U"],
  strike: ["Mod+Shift+X", "Mod+Shift+7"],
  code: ["Mod+D"],
  subscript: ["Mod+Shift+5"],
  superscript: ["Mod+Shift+6"],
  bulletList: ["Mod+Shift+8"],
  orderedList: ["Mod+Shift+9"],
  outdent: ["Mod+["],
  indent: ["Mod+]"],
  link: ["Mod+K"],
  find: ["Mod+F"],
  undo: ["Mod+Z"],
  redo: ["Mod+Shift+Z", "Mod+Y"],
});

const globalShortcuts = new Map<string, Shortcut[]>();
const shortcutListeners = new Set<() => void>();

/** Write shortcut combinations into `target`. */
export function mergeShortcuts(target: Map<string, Shortcut[]>, map: ShortcutMap): void {
  const entries: [string, Shortcut[]][] = [];
  for (const [name, value] of Object.entries(map)) {
    if (
      typeof value !== "string" &&
      (!Array.isArray(value) || !value.every((key) => typeof key === "string"))
    ) {
      throw new TypeError(
        "Use deleteShortcuts() or restoreDefaultShortcuts() to remove or reset shortcuts.",
      );
    }
    entries.push([name, (typeof value === "string" ? [value] : [...value]).filter(Boolean)]);
  }
  for (const [name, keys] of entries) target.set(name, keys);
}

/**
 * Override shortcuts for every <vanilia-editor> on the page (mounted editors update).
 *
 *   setShortcuts({ bold: "Mod+Shift+B", h2: "Mod+Alt+2" });
 */
export function setShortcuts(map: ShortcutMap = {}): void {
  mergeShortcuts(globalShortcuts, map);
  for (const listener of shortcutListeners) listener();
}

/** Remove named shortcuts for every editor on the page. */
export function deleteShortcuts(...commands: string[]): void {
  for (const name of commands) globalShortcuts.set(name, []);
  for (const listener of shortcutListeners) listener();
}

/** Restore named global overrides, or all overrides when called without names. */
export function restoreDefaultShortcuts(...commands: string[]): void {
  if (commands.length) {
    for (const name of commands) globalShortcuts.delete(name);
  } else globalShortcuts.clear();
  for (const listener of shortcutListeners) listener();
}

/** Global overrides set with `setShortcuts()`. */
export function getGlobalShortcuts(): ReadonlyMap<string, readonly Shortcut[]> {
  return globalShortcuts;
}

/** Subscribe to `setShortcuts()`; returns an unsubscribe function. */
export function onShortcutsChange(listener: () => void): () => void {
  shortcutListeners.add(listener);
  return () => {
    shortcutListeners.delete(listener);
  };
}

const IS_MAC =
  typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.platform || "");

const MODIFIER_ORDER = ["Alt", "Ctrl", "Meta", "Shift"];

/** Split `"Mod+Shift+X"` into platform modifiers and the key. `+` alone is a valid key. */
function parse(shortcut: Shortcut): { mods: Set<string>; key: string } {
  const parts = shortcut.trim().split(/\+(?!$)/);
  const key = parts.pop() ?? "";
  const mods = new Set(
    parts.map((p) => {
      const m = p.trim();
      if (m === "Mod") return IS_MAC ? "Meta" : "Ctrl";
      if (m === "Cmd" || m === "Command") return "Meta";
      if (m === "Control") return "Ctrl";
      if (m === "Option") return "Alt";
      return m;
    }),
  );
  return { mods, key };
}

/**
 * Squire key-handler names for a shortcut, e.g. `["Ctrl-Shift-x", "Ctrl-Shift-X"]`:
 * modifiers in Squire's order, and both letter cases (Shift may or may not upper-case it).
 */
export function squireKeys(shortcut: Shortcut): string[] {
  const { mods, key } = parse(shortcut);
  const prefix = MODIFIER_ORDER.filter((m) => mods.has(m))
    .map((m) => `${m}-`)
    .join("");
  const variants = key.length === 1 ? [key.toLowerCase(), key.toUpperCase()] : [key];
  return [...new Set(variants)].map((k) => prefix + k);
}

/** Format a shortcut for the current platform: `⇧⌘X` on macOS, `Ctrl+Shift+X` elsewhere. */
export function formatShortcut(shortcut: Shortcut): string {
  const { mods, key } = parse(shortcut);
  const label = key.length === 1 ? key.toUpperCase() : key;
  if (IS_MAC) {
    const symbols: Record<string, string> = { Ctrl: "⌃", Alt: "⌥", Shift: "⇧", Meta: "⌘" };
    return ["Ctrl", "Alt", "Shift", "Meta"]
      .filter((m) => mods.has(m))
      .map((m) => symbols[m])
      .join("")
      .concat(label);
  }
  // Conventional display order on Windows and Linux: Ctrl+Alt+Shift+key
  return [...["Ctrl", "Meta", "Alt", "Shift"].filter((m) => mods.has(m)), label].join("+");
}

/** `aria-keyshortcuts` value for a shortcut, e.g. `"Control+Shift+X"`. */
export function ariaShortcut(shortcut: Shortcut): string {
  const { mods, key } = parse(shortcut);
  const names: Record<string, string> = {
    Ctrl: "Control",
    Meta: "Meta",
    Alt: "Alt",
    Shift: "Shift",
  };
  const label = key.length === 1 ? key.toUpperCase() : key;
  return [...MODIFIER_ORDER.filter((m) => mods.has(m)).map((m) => names[m]), label].join("+");
}

/**
 * Squire's own default key handlers that a removed or remapped shortcut must not fall back
 * to. Keys the browser would also format natively (bold, italic, underline, undo, redo) are
 * blocked; the others fall through to the browser (e.g. Ctrl+F opens the browser's find).
 */
export const SQUIRE_DEFAULT_KEYS: readonly Shortcut[] = Object.freeze(
  Object.values(DEFAULT_SHORTCUTS).flat(),
);

/** Keys whose browser default would edit the content itself. */
export const NATIVE_EDITING_KEYS: ReadonlySet<string> = new Set(
  ["Mod+B", "Mod+I", "Mod+U", "Mod+Z", "Mod+Y", "Mod+Shift+Z"].flatMap(squireKeys),
);

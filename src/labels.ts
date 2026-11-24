/**
 * User-facing text: button labels, popovers, find & replace, status messages.
 * Override any of them globally with `setLabels()` or per editor with
 * `editor.setLabels()`.
 */

/** Values interpolated into a label (`{count}`, `{name}`, ...). */
export type LabelVars = Record<string, string | number>;

/** A label: a string with `{placeholders}`, or a function for plurals and grammar. */
export type Label = string | ((vars: LabelVars) => string);

const plural = (one: string, other: string) => (vars: LabelVars) =>
  Number(vars.count) === 1 ? `${vars.count} ${one}` : `${vars.count} ${other}`;

/** Built-in English labels. */
export const DEFAULT_LABELS = Object.freeze({
  // Toolbar and selection-menu buttons (same names as the commands)
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strike: "Strikethrough",
  code: "Code",
  paragraph: "Paragraph",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  bulletList: "Bullet list",
  orderedList: "Numbered list",
  blockquote: "Quote",
  hr: "Horizontal rule",
  alignLeft: "Align left",
  alignCenter: "Align center",
  alignRight: "Align right",
  link: "Link",
  image: "Image",
  clearFormatting: "Clear formatting",
  undo: "Undo",
  redo: "Redo",
  find: "Find and replace",

  // Regions and the editing surface
  toolbar: "Formatting toolbar",
  bubbleMenu: "Text formatting",
  editor: "Rich text editor",
  placeholder: "Start writing, paste an image, or drop a photo here...",

  // Link popover
  linkUrl: "Link URL",
  linkUrlPlaceholder: "https://example.com",
  removeLink: "Remove",
  cancel: "Cancel",
  apply: "Apply",

  // Image popover
  chooseImageFile: "Choose image file...",
  orPasteUrl: "or paste URL",
  imageUrl: "Image URL",
  imageUrlPlaceholder: "https://...",
  altText: "Alt text (optional)",
  altTextPlaceholder: "Describe the image",
  insert: "Insert",

  // Selected image
  imageOptions: "Image options",
  imageWidth: "Image width",
  imageAlignment: "Image alignment",
  widthPreset: "Width {width}",
  resizeImage: "Resize image ({handle})",
  imageSize: "{width} × {height} px · {percent}%",
  editAlt: "Edit alt text",
  altButton: "Alt",
  altInputPlaceholder: "Describe this image...",
  saveAlt: "Save alt text",
  deleteImage: "Delete image",

  // Find & replace
  findPlaceholder: "Find in document...",
  findLabel: "Find text",
  previousMatch: "Previous match",
  nextMatch: "Next match",
  replacePlaceholder: "Replace with...",
  replaceLabel: "Replace text",
  replace: "Replace",
  replaceAll: "All",
  close: "Close",
  matchCount: "{current} / {total}",

  // Footer, status and validation
  wordCount: plural("word", "words") as Label,
  imageCount: plural("image", "images") as Label,
  uploading: "Uploading {name}...",
  uploadFailed: "Image upload failed",
  valueMissing: "Please fill out this field.",
} satisfies Record<string, Label>);

/** Name of a built-in label. */
export type LabelName = keyof typeof DEFAULT_LABELS;

/** Label overrides. `null` or `""` restores the built-in text. */
export type LabelMap = Partial<Record<LabelName, Label | null | undefined>>;

/** Names of all built-in labels. */
export const LABEL_NAMES: readonly LabelName[] = Object.freeze(
  Object.keys(DEFAULT_LABELS) as LabelName[],
);

/** Looks up a label by name and fills in its `{placeholders}`. */
export type Translate = (name: LabelName, vars?: LabelVars) => string;

const globalLabels = new Map<string, Label>();
const labelListeners = new Set<() => void>();

/** Write label overrides into `target`; `null` / `""` deletes an entry. */
export function mergeLabels(target: Map<string, Label>, map: LabelMap): void {
  for (const [name, value] of Object.entries(map)) {
    if (value == null || value === "") target.delete(name);
    else target.set(name, typeof value === "function" ? value : String(value));
  }
}

/**
 * Override labels for every <vanilia-editor> on the page (mounted editors update).
 *
 *   setLabels({ bold: "Félkövér", wordCount: "{count} szó" });
 */
export function setLabels(map: LabelMap = {}): void {
  mergeLabels(globalLabels, map);
  for (const listener of labelListeners) listener();
}

/** Subscribe to global label changes; returns an unsubscribe function. */
export function onLabelsChange(listener: () => void): () => void {
  labelListeners.add(listener);
  return () => {
    labelListeners.delete(listener);
  };
}

/**
 * Create a translator. Lookup order: `overrides`, global `setLabels()`, built-in English.
 * Unknown names come back unchanged.
 */
export function createTranslator(overrides?: ReadonlyMap<string, Label>): Translate {
  return (name, vars = {}) => {
    const label: Label | undefined =
      overrides?.get(name) ?? globalLabels.get(name) ?? DEFAULT_LABELS[name];
    if (label === undefined) return name;
    if (typeof label === "function") return label(vars);
    return label.replace(/\{(\w+)\}/g, (match, key: string) =>
      key in vars ? String(vars[key]) : match,
    );
  };
}

/** English translator used when an extension is created without one. */
export const defaultTranslate: Translate = createTranslator();

const LABEL_ATTRS = [
  ["data-ve-text", null],
  ["data-ve-title", "title"],
  ["data-ve-placeholder", "placeholder"],
  ["data-ve-aria-label", "aria-label"],
] as const;

/**
 * Fill in text marked with label hooks under `root`:
 * `data-ve-text="cancel"` sets the text, `data-ve-title`, `data-ve-placeholder` and
 * `data-ve-aria-label` set those attributes. Re-run it after a label change.
 */
export function applyLabels(root: ParentNode, t: Translate): void {
  for (const [hook, attr] of LABEL_ATTRS) {
    for (const el of root.querySelectorAll<HTMLElement>(`[${hook}]`)) {
      const text = t(el.getAttribute(hook) as LabelName);
      if (attr) el.setAttribute(attr, text);
      else el.textContent = text;
    }
  }
}

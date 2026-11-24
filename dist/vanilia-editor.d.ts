/*! Vanilia | includes Squire, MIT License, Copyright (c) 2011-2023 Neil Jenkins */
declare class ImageResizer {
  private _editor;
  private _root;
  private _currentImage;
  private _resizeContainer;
  private _handles;
  private _currentHandle;
  private _startX;
  private _startY;
  private _startWidth;
  private _startHeight;
  private _maxWidth;
  private _originalRatio;
  constructor(root: HTMLElement, editor: Squire);
  destroy(): void;
  handleEvent(event: Event): void;
  private _onClick;
  private _deselectImage;
  private _selectImage;
  private _positionResizeContainer;
  private _onPointerDown;
  private _onPointerMove;
  private _onPointerUp;
  private _onKeyDown;
}
type EventHandler = {
  handleEvent: (e: Event) => void;
} | ((e: Event) => void);
type KeyHandlerFunction = (x: Squire, y: KeyboardEvent, z: Range) => void;
type TagAttributes = {
  [key: string]: {
    [key: string]: string;
  };
};
interface SquireConfig {
  blockTag: string;
  blockAttributes: null | Record<string, string>;
  tagAttributes: TagAttributes;
  classNames: {
    color: string;
    fontFamily: string;
    fontSize: string;
    highlight: string;
  };
  undo: {
    documentSizeThreshold: number;
    undoLimit: number;
  };
  addLinks: boolean;
  willCutCopy: null | ((html: string) => string);
  toPlainText: null | ((html: string) => string);
  sanitizeToDOMFragment: (html: string, editor: Squire) => DocumentFragment;
  didError: (x: any) => void;
}
declare class Squire {
  _root: HTMLElement;
  _config: SquireConfig;
  _isFocused: boolean;
  _lastSelection: Range;
  _willRestoreSelection: boolean;
  _mayHaveZWS: boolean;
  _lastAnchorNode: Node | null;
  _lastFocusNode: Node | null;
  _lastPathRange: Range | null;
  _path: string;
  _events: Map<string, Array<EventHandler>>;
  _undoIndex: number;
  _undoStack: Array<string>;
  _undoStackLength: number;
  _isInUndoState: boolean;
  _ignoreChange: boolean;
  _ignoreAllChanges: boolean;
  _isShiftDown: boolean;
  _keyHandlers: Record<string, KeyHandlerFunction | null>;
  _dragRange: Range | null;
  _mutation: MutationObserver;
  _imageResizer: ImageResizer;
  constructor(root: HTMLElement, config?: Partial<SquireConfig>);
  destroy(): void;
  _makeConfig(userConfig?: object): SquireConfig;
  setKeyHandler(key: string, fn: KeyHandlerFunction | null): this;
  _beforeInput(event: InputEvent): void;
  handleEvent(event: Event): void;
  fireEvent(type: string, detail?: Event | object): Squire;
  /**
   * Subscribing to these events won't automatically add a listener to the
   * document node, since these events are fired in a custom manner by the
   * editor code.
   */
  customEvents: Set<string>;
  addEventListener(type: string, fn: EventHandler): Squire;
  removeEventListener(type: string, fn?: EventHandler): Squire;
  focus(): Squire;
  blur(): Squire;
  _enableRestoreSelection(): void;
  _disableRestoreSelection(): void;
  _restoreSelection(): void;
  _removeZWS(): void;
  startSelectionId: string;
  endSelectionId: string;
  _saveRangeToBookmark(range: Range): void;
  _getRangeAndRemoveBookmark(range?: Range): Range | null;
  getSelection(): Range;
  setSelection(range: Range): Squire;
  _moveCursorTo(toStart: boolean): Squire;
  moveCursorToStart(): Squire;
  moveCursorToEnd(): Squire;
  getCursorPosition(): DOMRect;
  getPath(): string;
  _updatePathOnEvent(): void;
  _updatePath(range: Range, force?: boolean): void;
  _getPath(node: Node): string;
  modifyDocument(modificationFn: () => void): Squire;
  _docWasChanged(): void;
  /**
   * Leaves bookmark.
   */
  _recordUndoState(range: Range, replace?: boolean): Squire;
  saveUndoState(range?: Range): Squire;
  undo(): Squire;
  redo(): Squire;
  getRoot(): HTMLElement;
  _getRawHTML(): string;
  _setRawHTML(html: string): Squire;
  getHTML(withBookmark?: boolean): string;
  setHTML(html: string): Squire;
  /**
   * Insert HTML at the cursor location. If the selection is not collapsed
   * insertTreeFragmentIntoRange will delete the selection so that it is
   * replaced by the html being inserted.
   */
  insertHTML(html: string, isPaste?: boolean): Squire;
  insertElement(el: Element, range?: Range): Squire;
  insertImage(src: string, attributes: Record<string, string>): HTMLImageElement;
  insertPlainText(plainText: string, isPaste: boolean): Squire;
  getSelectedText(range?: Range): string;
  /**
   * Extracts the font-family and font-size (if any) of the element
   * holding the cursor. If there's a selection, returns an empty object.
   */
  getFontInfo(range?: Range): Record<string, string | undefined>;
  /**
   * Looks for matching tag and attributes, so won't work if <strong>
   * instead of <b> etc.
   */
  hasFormat(tag: string, attributes?: Record<string, string> | null, range?: Range): boolean;
  changeFormat(add: {
    tag: string;
    attributes?: Record<string, string>;
  } | null, remove?: {
    tag: string;
    attributes?: Record<string, string>;
  } | null, range?: Range, partial?: boolean): Squire;
  _addFormat(tag: string, attributes: Record<string, string> | null, range: Range): Range;
  _removeFormat(tag: string, attributes: Record<string, string>, range: Range, partial?: boolean): Range;
  bold(): Squire;
  removeBold(): Squire;
  italic(): Squire;
  removeItalic(): Squire;
  underline(): Squire;
  removeUnderline(): Squire;
  strikethrough(): Squire;
  removeStrikethrough(): Squire;
  subscript(): Squire;
  removeSubscript(): Squire;
  superscript(): Squire;
  removeSuperscript(): Squire;
  makeLink(url: string, attributes?: Record<string, string>): Squire;
  removeLink(): Squire;
  linkRegExp: RegExp;
  addDetectedLinks(searchInNode: DocumentFragment | Node, root?: DocumentFragment | HTMLElement): Squire;
  setFontFace(name: string | null): Squire;
  setFontSize(size: string | null): Squire;
  setTextColor(color: string | null): Squire;
  setHighlightColor(color: string | null): Squire;
  _ensureBottomLine(): void;
  createDefaultBlock(children?: Node[]): HTMLElement;
  tagAfterSplit: Record<string, string>;
  splitBlock(lineBreakOnly: boolean, range?: Range): Squire;
  forEachBlock(fn: (el: HTMLElement) => any, mutates: boolean, range?: Range): Squire;
  modifyBlocks(modify: (x: DocumentFragment) => Node, range?: Range): Squire;
  setTextAlignment(alignment: string): Squire;
  setTextDirection(direction: string | null): Squire;
  _getListSelection(range: Range, root: Element): [Node, Node | null, Node | null] | null;
  increaseListLevel(range?: Range): Squire;
  decreaseListLevel(range?: Range): Squire;
  _makeList(frag: DocumentFragment, type: string): DocumentFragment;
  makeUnorderedList(): Squire;
  makeOrderedList(): Squire;
  removeList(): Squire;
  increaseQuoteLevel(range?: Range): Squire;
  decreaseQuoteLevel(range?: Range): Squire;
  removeQuote(range?: Range): Squire;
  replaceWithBlankLine(range?: Range): Squire;
  code(): Squire;
  removeCode(): Squire;
  toggleCode(): Squire;
  _removeFormatting(root: DocumentFragment | Element, clean: DocumentFragment | Element): DocumentFragment | Element;
  removeAllFormatting(range?: Range): Squire;
}
/** Name of a built-in icon. */
type IconName = "bold" | "italic" | "underline" | "strike" | "paragraph" | "h1" | "h2" | "h3" | "bulletList" | "orderedList" | "quote" | "code" | "hr" | "link" | "unlink" | "image" | "alignLeft" | "alignCenter" | "alignRight" | "undo" | "redo" | "clear" | "search" | "trash" | "check" | "x" | "upload" | "moon" | "sun" | "copy" | "text";
/**
 * Icon overrides: icon name to trusted markup. `null` or `""` restores the built-in icon.
 * Names other than the built-in ones register new icons for custom toolbar buttons.
 */
type IconMap = Partial<Record<IconName, string | null | undefined>> & Record<string, string | null | undefined>;
/** Names of all built-in icons (each can be overridden). */
export declare const ICON_NAMES: readonly IconName[];
/**
 * Override built-in icons for every <vanilia-editor> on the page.
 * Values are trusted markup strings (inline SVG, icon-font <i>, <img>, ...).
 * Pass `null` / `undefined` for a name to restore its built-in icon.
 *
 *   setIcons({ bold: '<svg viewBox="0 0 256 256">...</svg>' });
 */
export declare function setIcons(map?: IconMap): void;
/** Renders an icon by name and pixel size as trusted markup. */
type IconRenderer = (name: string, size?: number) => string;
/**
 * Render an icon as markup. Lookup order: per-editor `overrides` (Map),
 * global `setIcons()` registry, built-in Lucide-compatible SVG.
 * Every icon carries `data-icon` / `data-size` so editors can re-render it in place.
 */
export declare function icon(name: string, size?: number, overrides?: ReadonlyMap<string, string>): string;
type HeadingLevel = 1 | 2 | 3;
/**
 * TipTap-inspired command & active-state adapter on top of Squire.
 */
/** Names accepted by `isActive()`. */
type FormatName = "bold" | "italic" | "underline" | "strike" | "code" | "link" | "bulletList" | "orderedList" | "blockquote" | "heading" | "paragraph";
/** Commands accepted by `editor.exec()`. */
type Command = "bold" | "italic" | "underline" | "strike" | "code" | "paragraph" | "h1" | "h2" | "h3" | "bulletList" | "orderedList" | "blockquote" | "hr" | "alignLeft" | "alignCenter" | "alignRight" | "clearFormatting" | "undo" | "redo" | "makeLink" | "removeLink";
/** Which formats are active at the selection. */
interface ActiveState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  code: boolean;
  link: boolean;
  bulletList: boolean;
  orderedList: boolean;
  blockquote: boolean;
  paragraph: boolean;
  h1: boolean;
  h2: boolean;
  h3: boolean;
}
/**
 * User-facing text: button labels, popovers, find & replace, status messages.
 * Override any of them globally with `setLabels()` or per editor with
 * `editor.setLabels()` / `<template data-ve-labels>{...}</template>`.
 */
/** Values interpolated into a label (`{count}`, `{name}`, ...). */
type LabelVars = Record<string, string | number>;
/** A label: a string with `{placeholders}`, or a function for plurals and grammar. */
type Label = string | ((vars: LabelVars) => string);
/** Built-in English labels. */
export declare const DEFAULT_LABELS: Readonly<{
  bold: string;
  italic: string;
  underline: string;
  strike: string;
  code: string;
  paragraph: string;
  h1: string;
  h2: string;
  h3: string;
  bulletList: string;
  orderedList: string;
  blockquote: string;
  hr: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  link: string;
  image: string;
  clearFormatting: string;
  undo: string;
  redo: string;
  find: string;
  toolbar: string;
  bubbleMenu: string;
  editor: string;
  placeholder: string;
  linkUrl: string;
  linkUrlPlaceholder: string;
  removeLink: string;
  cancel: string;
  apply: string;
  chooseImageFile: string;
  orPasteUrl: string;
  imageUrl: string;
  imageUrlPlaceholder: string;
  altText: string;
  altTextPlaceholder: string;
  insert: string;
  imageOptions: string;
  imageWidth: string;
  imageAlignment: string;
  widthPreset: string;
  resizeImage: string;
  imageSize: string;
  editAlt: string;
  altButton: string;
  altInputPlaceholder: string;
  saveAlt: string;
  deleteImage: string;
  findPlaceholder: string;
  findLabel: string;
  previousMatch: string;
  nextMatch: string;
  replacePlaceholder: string;
  replaceLabel: string;
  replace: string;
  replaceAll: string;
  close: string;
  matchCount: string;
  wordCount: Label;
  imageCount: Label;
  uploading: string;
  uploadFailed: string;
  valueMissing: string;
}>;
/** Name of a built-in label. */
type LabelName = keyof typeof DEFAULT_LABELS;
/** Label overrides. `null` or `""` restores the built-in text. */
type LabelMap = Partial<Record<LabelName, Label | null | undefined>>;
/** Names of all built-in labels. */
export declare const LABEL_NAMES: readonly LabelName[];
/** Looks up a label by name and fills in its `{placeholders}`. */
type Translate = (name: LabelName, vars?: LabelVars) => string;
/**
 * Override labels for every <vanilia-editor> on the page (mounted editors update).
 *
 *   setLabels({ bold: "Félkövér", wordCount: "{count} szó" });
 */
export declare function setLabels(map?: LabelMap): void;
/**
 * Create a translator. Lookup order: `overrides`, global `setLabels()`, built-in English.
 * Unknown names come back unchanged.
 */
export declare function createTranslator(overrides?: ReadonlyMap<string, Label>): Translate;
type ImageAlign = "left" | "center" | "right";
/** Uploads an image file and resolves to its public URL. */
type UploadHandler = (file: File) => Promise<string>;
interface ImageResizeOptions {
  squire: Squire;
  /** The editable element containing the images. */
  surface: HTMLElement;
  /** Where the selection box is mounted. */
  overlayHost: HTMLElement;
  /** The editor's main toolbar; its align buttons keep the image selected. */
  editorToolbar?: HTMLElement | null;
  onChange?: () => void;
  onSelectChange?: (img: HTMLImageElement | null) => void;
  getUploadHandler?: () => UploadHandler | null | undefined;
  onStatus?: (message: string) => void;
  renderIcon?: IconRenderer;
  /** Label lookup (defaults to English). */
  t?: Translate;
}
interface ImageResizeExtension {
  name: "imageResize";
  selectImage(img: HTMLImageElement): void;
  deselect(): void;
  applyAlignment(align: ImageAlign): void;
  applyWidth(width: string): void;
  getAlignment(): ImageAlign | null;
  insertImageFile(file: File): Promise<HTMLImageElement | null>;
  insertImageUrl(url: string, alt?: string): HTMLImageElement | null;
  getSelectedImage(): HTMLImageElement | null;
  destroy(): void;
}
export declare function createImageResizeExtension({ squire, surface, overlayHost, editorToolbar, onChange, onSelectChange, getUploadHandler, onStatus, renderIcon, t }: ImageResizeOptions): ImageResizeExtension;
/** Names of the built-in toolbar buttons. Each runs the command of the same name. */
type BuiltinButtonName = "bold" | "italic" | "underline" | "strike" | "code" | "paragraph" | "h1" | "h2" | "h3" | "bulletList" | "orderedList" | "blockquote" | "hr" | "alignLeft" | "alignCenter" | "alignRight" | "link" | "image" | "clearFormatting" | "undo" | "redo" | "find";
/** One toolbar entry: a button name, or `"|"` for a separator between groups. */
type ToolbarItem = BuiltinButtonName | "|" | (string & {});
/** A custom toolbar button. */
interface ToolbarButton {
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
/** Names of all built-in toolbar buttons. */
export declare const BUTTON_NAMES: readonly BuiltinButtonName[];
/** The default toolbar layout. */
export declare const DEFAULT_TOOLBAR: readonly ToolbarItem[];
/** The default selection (bubble) menu layout. */
export declare const DEFAULT_BUBBLE_MENU: readonly ToolbarItem[];
/**
 * Register a custom button for every <vanilia-editor> on the page. Editors with
 * the default layout show it in a group at the end of the toolbar; editors with a
 * custom `toolbar` layout show it where its name appears.
 */
export declare function defineButton(button: ToolbarButton): void;
/** Remove a button registered with `defineButton()`. */
export declare function undefineButton(name: string): void;
/**
 * Typed access to the `--ve-*` CSS custom properties. CSS stays the source of
 * truth: `setTheme()` and `editor.setTheme()` only write those properties.
 */
/** Theme tokens, camelCased: `accentContrast` is `--ve-accent-contrast`. */
export declare const THEME_TOKENS: readonly ["accent", "accentContrast", "accentSoft", "accentRing", "accentBorder", "accentHover", "danger", "dangerSoft", "bg", "surfaceBg", "chromeBg", "popoverBg", "hoverBg", "codeBg", "shadow", "border", "borderStrong", "text", "textMuted", "radius", "radiusSm", "minHeight", "maxHeight", "paddingX", "paddingY", "fontSize", "lineHeight", "fontSans", "fontMono", "highlightBg", "highlightActiveBg", "highlightActiveText", "iconSize", "iconSizeSm", "iconStroke"];
/** Name of a theme token. */
type ThemeToken = (typeof THEME_TOKENS)[number];
/** Token values (any CSS value). `null` or `""` removes an override. */
type ThemeTokens = Partial<Record<ThemeToken, string | number | null | undefined>>;
/** Color scheme for the `theme` attribute. */
type ColorScheme = "light" | "dark" | "auto";
/** The CSS custom property of a token: `tokenVar("accentSoft")` is `"--ve-accent-soft"`. */
export declare function tokenVar(token: ThemeToken): string;
/**
 * Set tokens for every editor on the page. Writes one unlayered `:root` rule, so it
 * beats the built-in defaults but loses to per-editor CSS and `editor.setTheme()`.
 *
 *   setTheme({ accent: "#e11d48", radius: "8px" });
 */
export declare function setTheme(tokens?: ThemeTokens): void;
/** Commands accepted by `editor.exec()`: formatting commands plus the link, image and find UIs. */
type EditorCommand = Command | "link" | "image" | "find";
/** A toolbar layout: a string like `"bold italic | link"`, or an array of items. */
type ToolbarLayout = string | readonly ToolbarItem[];
/** Active formats at the selection, including alignment. */
interface EditorActiveState extends ActiveState {
  alignLeft: boolean;
  alignCenter: boolean;
  alignRight: boolean;
}
/** `detail` of the `ve:update` / `editorupdate` events. */
interface VaniliaEditorDetail {
  html: string;
  text: string;
  words: number;
  images: number;
  active: EditorActiveState;
  canUndo: boolean;
  canRedo: boolean;
}
/**
 * <vanilia-editor> — Form-Associated Custom Element (ElementInternals)
 * powered by vendored Fastmail Squire + modular modern Web/CSS API extensions.
 */
declare const BaseHTMLElement: typeof HTMLElement;
export declare class VaniliaEditorElement extends BaseHTMLElement {
  #private;
  static formAssociated: boolean;
  static observedAttributes: string[];
  /** Override icons for every editor on the page (same as the `setIcons` export). */
  static setIcons(map: IconMap): void;
  /** Names of all overridable icons. */
  static get iconNames(): readonly IconName[];
  /** Override labels for every editor on the page (same as the `setLabels` export). */
  static setLabels(map: LabelMap): void;
  /** Names of all labels. */
  static get labelNames(): readonly LabelName[];
  /** Register a custom button for every editor on the page (same as the `defineButton` export). */
  static defineButton(button: ToolbarButton): void;
  /** Remove a button registered with `defineButton()`. */
  static undefineButton(name: string): void;
  /** Names of the built-in toolbar buttons. */
  static get buttonNames(): readonly BuiltinButtonName[];
  /** Set theme tokens for every editor on the page (same as the `setTheme` export). */
  static setTheme(tokens: ThemeTokens): void;
  /** Names of all theme tokens. */
  static get themeTokens(): readonly ThemeToken[];
  constructor();
  /** Optional JS hook: `(file: File) => Promise<string>` returning an image URL */
  get onImageUpload(): UploadHandler | null;
  set onImageUpload(fn: UploadHandler | null);
  get value(): string;
  set value(html: string | null | undefined);
  /**
   * Toolbar layout, reflected to the `toolbar` attribute. Reads back the layout in use;
   * set a string (`"bold italic | link"`), an array, `"none"`, or `null` for the default.
   */
  get toolbar(): ToolbarItem[];
  set toolbar(layout: ToolbarLayout | null | undefined);
  /** Selection (bubble) menu layout, reflected to the `bubble-menu` attribute. Same values as `toolbar`. */
  get bubbleMenu(): ToolbarItem[];
  set bubbleMenu(layout: ToolbarLayout | null | undefined);
  /** Color scheme, reflected to the `theme` attribute: `"light"`, `"dark"` or `"auto"` (follow the page). */
  get theme(): ColorScheme;
  set theme(scheme: ColorScheme | null | undefined);
  /** The underlying Squire instance (advanced; `null` until the editor is connected). */
  get squire(): Squire | null;
  get form(): HTMLFormElement | null;
  get validity(): ValidityState;
  get validationMessage(): string;
  checkValidity(): boolean;
  reportValidity(): boolean;
  connectedCallback(): void;
  disconnectedCallback(): void;
  attributeChangedCallback(name: string, _oldVal: string | null, newVal: string | null): void;
  formDisabledCallback(disabled: boolean): void;
  formResetCallback(): void;
  formStateRestoreCallback(state: unknown): void;
  getHTML(): string;
  getFormattedHTML(): string;
  getText(): string;
  setHTML(html: string, { silent }?: {
    silent?: boolean;
  }): void;
  /**
   * Run a command, or the custom button of that name. `arg` is the URL for `makeLink`.
   */
  exec(command: EditorCommand | (string & {}), arg?: string): void;
  isActive(name: FormatName, attrs?: {
    level?: HeadingLevel;
  }): boolean;
  /**
   * Override icons for this editor only. Pass `null` for a name to fall back
   * to the global `setIcons()` registry / built-in icon.
   */
  setIcons(map?: IconMap): void;
  /**
   * Override labels for this editor only. Pass `null` for a name to fall back to the
   * global `setLabels()` registry / built-in English text.
   */
  setLabels(map?: LabelMap): void;
  /** Set theme tokens on this editor (inline `--ve-*` properties). `null` removes one. */
  setTheme(tokens?: ThemeTokens): void;
  /**
   * Add a custom button to this editor. With the default layout it appears in a group
   * at the end of the toolbar; with a custom `toolbar` layout, where its name appears.
   * Adding a button with an existing name replaces it.
   */
  addButton(button: ToolbarButton): void;
  /** Remove a button added with `addButton()`. */
  removeButton(name: string): void;
  insertImage(url: string, alt?: string): HTMLImageElement | null;
  /** Insert HTML at the cursor (sanitized like pasted content), replacing the selection. */
  insertHTML(html: string): void;
  /** Insert plain text at the cursor, replacing the selection. */
  insertText(text: string): void;
  /** The selected text (`""` when the selection is collapsed). */
  getSelectedText(): string;
  focus(): void;
}
declare global {
  interface HTMLElementTagNameMap {
    "vanilia-editor": VaniliaEditorElement;
  }
  interface HTMLElementEventMap {
    editorupdate: CustomEvent<VaniliaEditorDetail>;
    "ve:update": CustomEvent<VaniliaEditorDetail>;
  }
}
/** Whether a URL is safe to keep in an `href` (`"link"`) or `src` (`"image"`). */
export declare function isSafeUrl(url: unknown, kind?: "link" | "image"): boolean;
/**
 * Squire-compatible `sanitizeToDOMFragment(html, editor)` callback.
 * Uses an inert <template> (never executes scripts or loads remote images while parsing).
 */
export declare function sanitizeToDOMFragment(html: string, editor?: Squire): DocumentFragment;
/**
 * Clean exported HTML (normalizes Squire's <b>/<i> -> <strong>/<em> and strips empty artifacts).
 */
export declare function normalizeExportHTML(rawHtml: string): string;
/**
 * Lightweight zero-dependency HTML pretty printer for live preview inspection.
 */
export declare function formatHTML(html: string): string;
interface BubbleMenuOptions {
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
interface BubbleMenuExtension {
  name: "bubbleMenu";
  hide(): void;
  update(): void;
  /** Re-render the buttons (after a layout, label or icon change). */
  refresh(): void;
  destroy(): void;
}
export declare function createBubbleMenuExtension({ squire, surface, overlayHost, onCommand, onOpenLink, isImageSelected, renderIcon, label, renderButtons, runCommand, syncButtons }: BubbleMenuOptions): BubbleMenuExtension;
interface FindReplaceOptions {
  /** The editable element to search in. */
  surface: HTMLElement;
  /** Where the find bar is mounted. */
  barSlot: HTMLElement;
  squire: Squire;
  onChange?: () => void;
  renderIcon?: IconRenderer;
  /** Label lookup (defaults to English). */
  t?: Translate;
}
interface FindReplaceExtension {
  name: "findReplace";
  open(): void;
  close(): void;
  toggle(): void;
  destroy(): void;
}
export declare function createFindReplaceExtension({ surface, barSlot, squire, onChange, renderIcon, t }: FindReplaceOptions): FindReplaceExtension;
export type { BuiltinButtonName, ColorScheme, EditorActiveState, EditorCommand, FormatName, HeadingLevel, IconMap, IconName, IconRenderer, ImageAlign, Label, LabelMap, LabelName, LabelVars, ThemeToken, ThemeTokens, ToolbarButton, ToolbarItem, ToolbarLayout, Translate, UploadHandler, VaniliaEditorDetail };
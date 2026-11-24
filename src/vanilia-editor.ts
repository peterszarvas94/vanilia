import Squire from "squire-rte";
import { icon, onIconsChange, setIcons, ICON_NAMES, type IconMap, type IconName } from "./icons.js";
import { formatHTML, isSafeUrl, normalizeExportHTML, sanitizeToDOMFragment } from "./sanitizer.js";
import {
  execCommand,
  getActiveState,
  isActive,
  type ActiveState,
  type Command,
  type FormatName,
} from "./extensions/formatting.js";
import type { HeadingLevel } from "./extensions/headings.js";
import {
  createImageResizeExtension,
  type ImageResizeExtension,
  type UploadHandler,
} from "./extensions/image-resize.js";
import { createBubbleMenuExtension, type BubbleMenuExtension } from "./extensions/bubble-menu.js";
import {
  createFindReplaceExtension,
  type FindReplaceExtension,
} from "./extensions/find-replace.js";
import {
  applyLabels,
  createTranslator,
  LABEL_NAMES,
  mergeLabels,
  onLabelsChange,
  setLabels,
  type Label,
  type LabelMap,
  type LabelName,
} from "./labels.js";
import {
  BUILTIN_BUTTONS,
  BUTTON_NAMES,
  BUTTONLESS_COMMANDS,
  DEFAULT_BUBBLE_MENU,
  DEFAULT_TOOLBAR,
  defineButton,
  getDefinedButtons,
  onButtonsChange,
  toItems,
  undefineButton,
  validateButton,
  type BuiltinButtonName,
  type ToolbarButton,
  type ToolbarItem,
} from "./toolbar.js";
import {
  ariaShortcut,
  DEFAULT_SHORTCUTS,
  formatShortcut,
  getGlobalShortcuts,
  mergeShortcuts,
  NATIVE_EDITING_KEYS,
  onShortcutsChange,
  setShortcuts,
  SQUIRE_DEFAULT_KEYS,
  squireKeys,
  type Shortcut,
  type ShortcutMap,
} from "./shortcuts.js";
import {
  applyTokens,
  setTheme,
  THEME_TOKENS,
  type ColorScheme,
  type ThemeToken,
  type ThemeTokens,
} from "./theme.js";

/** Commands accepted by `editor.exec()`: formatting commands plus the link, image and find UIs. */
export type EditorCommand = Command | "link" | "image" | "find";

type KeyHandler = (squire: Squire, event: KeyboardEvent, range: Range) => void;

/** Built-in commands that a shortcut can run. */
const COMMANDS = new Set<string>([...BUTTON_NAMES, ...BUTTONLESS_COMMANDS]);

/** A toolbar layout: a string like `"bold italic | link"`, or an array of items. */
export type ToolbarLayout = string | readonly ToolbarItem[];

/** Active formats at the selection, including alignment. */
export interface EditorActiveState extends ActiveState {
  alignLeft: boolean;
  alignCenter: boolean;
  alignRight: boolean;
}

/** `detail` of the `ve:update` / `editorupdate` events. */
export interface VaniliaEditorDetail {
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
// Lets the module load where HTMLElement is missing (e.g. server-side imports)
const BaseHTMLElement = (
  typeof HTMLElement !== "undefined" ? HTMLElement : class {}
) as typeof HTMLElement;

export class VaniliaEditorElement extends BaseHTMLElement {
  static formAssociated = true;
  static observedAttributes = [
    "placeholder",
    "disabled",
    "required",
    "upload-url",
    "toolbar",
    "bubble-menu",
    "shortcuts",
  ];

  /** Override icons for every editor on the page (same as the `setIcons` export). */
  static setIcons(map: IconMap): void {
    setIcons(map);
  }

  /** Names of all overridable icons. */
  static get iconNames(): readonly IconName[] {
    return ICON_NAMES;
  }

  /** Override labels for every editor on the page (same as the `setLabels` export). */
  static setLabels(map: LabelMap): void {
    setLabels(map);
  }

  /** Names of all labels. */
  static get labelNames(): readonly LabelName[] {
    return LABEL_NAMES;
  }

  /** Register a custom button for every editor on the page (same as the `defineButton` export). */
  static defineButton(button: ToolbarButton): void {
    defineButton(button);
  }

  /** Remove a button registered with `defineButton()`. */
  static undefineButton(name: string): void {
    undefineButton(name);
  }

  /** Names of the built-in toolbar buttons. */
  static get buttonNames(): readonly BuiltinButtonName[] {
    return BUTTON_NAMES;
  }

  /** Override keyboard shortcuts for every editor on the page (same as the `setShortcuts` export). */
  static setShortcuts(map: ShortcutMap): void {
    setShortcuts(map);
  }

  /** Set theme tokens for every editor on the page (same as the `setTheme` export). */
  static setTheme(tokens: ThemeTokens): void {
    setTheme(tokens);
  }

  /** Names of all theme tokens. */
  static get themeTokens(): readonly ThemeToken[] {
    return THEME_TOKENS;
  }

  #iconOverrides = new Map<string, string>();
  #icon = (name: string, size?: number) => icon(name, size, this.#iconOverrides);
  #labelOverrides = new Map<string, Label>();
  #t = createTranslator(this.#labelOverrides);
  #buttons = new Map<string, ToolbarButton>();
  #shortcutOverrides = new Map<string, Shortcut[]>();
  #unsubscribers: (() => void)[] = [];

  #internals: ElementInternals;
  #squire: Squire | null = null;
  #extensions: { destroy(): void }[] = [];
  #imageResize: ImageResizeExtension | null = null;
  #bubbleMenu: BubbleMenuExtension | null = null;
  #findReplace: FindReplaceExtension | null = null;

  #root: HTMLElement | null = null;
  #toolbar: HTMLElement | null = null;
  #surface: HTMLElement | null = null;
  #overlayHost: HTMLElement | null = null;
  #statusEl: HTMLElement | null = null;
  #linkPopover: HTMLElement | null = null;
  #imagePopover: HTMLElement | null = null;
  #fileInput: HTMLInputElement | null = null;

  #initialHTML = "";
  #pendingValue: string | null = null;
  #savedRange: Range | null = null;
  #canUndo = false;
  #canRedo = false;
  #mounted = false;
  #uploadHandler: UploadHandler | null = null;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#internals.role = "group";
  }

  /** Optional JS hook: `(file: File) => Promise<string>` returning an image URL */
  get onImageUpload(): UploadHandler | null {
    return this.#uploadHandler;
  }

  set onImageUpload(fn: UploadHandler | null) {
    this.#uploadHandler = typeof fn === "function" ? fn : null;
  }

  get value(): string {
    if (!this.#squire) {
      return this.#pendingValue ?? this.getAttribute("value") ?? "";
    }
    return this.getHTML();
  }

  set value(html: string | null | undefined) {
    const str = html == null ? "" : String(html);
    if (!this.#squire) {
      this.#pendingValue = str;
      return;
    }
    // Like a native input: writing back the current value is a no-op and keeps the caret.
    // Two-way bindings (Datastar data-bind, Alpine x-model) do this on every keystroke.
    if (str === this.getHTML()) return;
    this.setHTML(str);
  }

  /**
   * Toolbar layout, reflected to the `toolbar` attribute. Reads back the layout in use;
   * set a string (`"bold italic | link"`), an array, `"none"`, or `null` for the default.
   */
  get toolbar(): ToolbarItem[] {
    return this.#toolbarItems();
  }

  set toolbar(layout: ToolbarLayout | null | undefined) {
    this.#reflectLayout("toolbar", layout);
  }

  /** Selection (bubble) menu layout, reflected to the `bubble-menu` attribute. Same values as `toolbar`. */
  get bubbleMenu(): ToolbarItem[] {
    return this.#bubbleItems();
  }

  set bubbleMenu(layout: ToolbarLayout | null | undefined) {
    this.#reflectLayout("bubble-menu", layout);
  }

  /** Color scheme, reflected to the `theme` attribute: `"light"`, `"dark"` or `"auto"` (follow the page). */
  get theme(): ColorScheme {
    const value = this.getAttribute("theme");
    return value === "light" || value === "dark" ? value : "auto";
  }

  set theme(scheme: ColorScheme | null | undefined) {
    if (scheme === "light" || scheme === "dark") this.setAttribute("theme", scheme);
    else this.removeAttribute("theme");
  }

  /** The underlying Squire instance (advanced; `null` until the editor is connected). */
  get squire(): Squire | null {
    return this.#squire;
  }

  get form(): HTMLFormElement | null {
    return this.#internals.form;
  }

  get validity(): ValidityState {
    return this.#internals.validity;
  }

  get validationMessage(): string {
    return this.#internals.validationMessage;
  }

  checkValidity(): boolean {
    return this.#internals.checkValidity();
  }

  reportValidity(): boolean {
    return this.#internals.reportValidity();
  }

  connectedCallback() {
    if (this.#mounted) {
      this.#syncFormState();
      return;
    }

    // Declarative per-editor icon overrides: <template data-ve-icon="bold">...</template>
    for (const tpl of this.querySelectorAll<HTMLTemplateElement>(
      ":scope > template[data-ve-icon]",
    )) {
      const name = tpl.dataset.veIcon;
      if (name) this.#iconOverrides.set(name, tpl.innerHTML.trim());
      tpl.remove();
    }

    // Declarative per-editor labels: <template data-ve-labels>{"bold": "Gras"}</template>
    for (const tpl of this.querySelectorAll<HTMLTemplateElement>(
      ":scope > template[data-ve-labels]",
    )) {
      try {
        mergeLabels(this.#labelOverrides, JSON.parse(tpl.content.textContent || "{}") as LabelMap);
      } catch (err) {
        console.error("[vanilia-editor] invalid JSON in <template data-ve-labels>", err);
      }
      tpl.remove();
    }

    // Declarative per-editor shortcuts: <template data-ve-shortcuts>{"bold": "Mod+Shift+B"}</template>
    for (const tpl of this.querySelectorAll<HTMLTemplateElement>(
      ":scope > template[data-ve-shortcuts]",
    )) {
      try {
        mergeShortcuts(
          this.#shortcutOverrides,
          JSON.parse(tpl.content.textContent || "{}") as ShortcutMap,
        );
      } catch (err) {
        console.error("[vanilia-editor] invalid JSON in <template data-ve-shortcuts>", err);
      }
      tpl.remove();
    }

    // Capture any declarative initial content before building the UI
    if (this.#pendingValue !== null) {
      this.#initialHTML = this.#pendingValue;
      this.#pendingValue = null;
    } else if (this.hasAttribute("value")) {
      this.#initialHTML = this.getAttribute("value") || "";
    } else {
      const tpl = this.querySelector(":scope > template");
      this.#initialHTML = tpl ? tpl.innerHTML.trim() : this.innerHTML.trim();
    }

    this.#buildDOM();
    this.#initEditor();
    this.#mounted = true;
    this.#unsubscribers = [
      onIconsChange(() => this.#refreshIcons()),
      onLabelsChange(() => this.#refreshLabels()),
      onButtonsChange(() => this.#renderButtons()),
      onShortcutsChange(() => this.#renderButtons()),
    ];
    this.#bindShortcuts();

    if (this.#initialHTML) {
      this.setHTML(this.#initialHTML, { silent: true });
    }
    this.#applyDisabled(this.hasAttribute("disabled"));
    this.#syncFormState();
    this.#syncToolbar();
  }

  disconnectedCallback() {
    // Preserve current content if element is moved/reparented in the DOM
    if (this.#squire) {
      this.#pendingValue = this.getHTML();
    }
    this.#teardown();
  }

  attributeChangedCallback(name: string, _oldVal: string | null, newVal: string | null) {
    if (!this.#mounted) return;
    if (name === "placeholder") {
      this.#syncPlaceholder();
    } else if (name === "disabled") {
      this.#applyDisabled(newVal !== null);
    } else if (name === "required") {
      this.#syncFormState();
    } else if (name === "toolbar" || name === "bubble-menu" || name === "shortcuts") {
      this.#renderButtons();
    }
  }

  formDisabledCallback(disabled: boolean) {
    this.#applyDisabled(disabled);
  }

  formResetCallback() {
    this.setHTML(this.#initialHTML || "");
  }

  formStateRestoreCallback(state: unknown) {
    if (typeof state === "string") {
      this.setHTML(state);
    }
  }

  // ---- Public API ----

  getHTML(): string {
    if (!this.#squire) return this.#pendingValue || "";
    const normalized = normalizeExportHTML(this.#squire.getHTML());
    // Treat empty placeholder paragraph as empty string
    if (
      normalized === "<p><br></p>" ||
      normalized === "<p></p>" ||
      normalized === "<div><br></div>"
    ) {
      return "";
    }
    return normalized;
  }

  getFormattedHTML(): string {
    return formatHTML(this.getHTML());
  }

  getText(): string {
    return (this.#surface?.textContent || "").trim();
  }

  setHTML(html: string, { silent = false }: { silent?: boolean } = {}): void {
    if (!this.#squire) {
      this.#pendingValue = html || "";
      return;
    }
    this.#imageResize?.deselect();
    this.#squire.setHTML(html || "");
    this.#syncFormState();
    this.#syncToolbar();
    if (silent) this.#emitStateEvent();
    else this.#emitUpdate();
  }

  /**
   * Run a command, or the custom button of that name. `arg` is the URL for `makeLink`.
   */
  // oxlint-disable-next-line typescript/ban-types
  exec(command: EditorCommand | (string & {}), arg?: string): void {
    if (!this.#squire || this.hasAttribute("disabled")) return;
    const custom = this.#customButton(command);
    if (custom) {
      if (this.#safeCall(custom, "isEnabled") === false) return;
      custom.run(this);
      this.#syncToolbar();
      this.#emitStateEvent();
      return;
    }
    if (command === "link") {
      this.#openLinkPopover();
      return;
    }
    if (command === "image") {
      this.#openImagePopover();
      return;
    }
    if (command === "find") {
      this.#findReplace?.toggle();
      return;
    }
    if (command === "alignLeft" || command === "alignCenter" || command === "alignRight") {
      const align =
        command === "alignCenter" ? "center" : command === "alignRight" ? "right" : "left";
      const targetImg = this.#imageResize?.getSelectedImage() || this.#findImageOnlyBlock();
      if (targetImg) {
        if (!this.#imageResize?.getSelectedImage()) {
          this.#imageResize?.selectImage(targetImg);
        }
        this.#imageResize?.applyAlignment(align);
        this.#syncToolbar();
        return;
      }
    }
    execCommand(this.#squire, command, arg);
    this.#syncFormState();
    this.#syncToolbar();
    this.#emitUpdate();
  }

  isActive(name: FormatName, attrs?: { level?: HeadingLevel }): boolean {
    return isActive(this.#squire, name, attrs);
  }

  /**
   * Override icons for this editor only. Pass `null` for a name to fall back
   * to the global `setIcons()` registry / built-in icon.
   */
  setIcons(map: IconMap = {}): void {
    for (const [name, markup] of Object.entries(map)) {
      if (markup == null || markup === "") this.#iconOverrides.delete(name);
      else this.#iconOverrides.set(name, String(markup));
    }
    this.#refreshIcons();
  }

  /**
   * Override labels for this editor only. Pass `null` for a name to fall back to the
   * global `setLabels()` registry / built-in English text.
   */
  setLabels(map: LabelMap = {}): void {
    mergeLabels(this.#labelOverrides, map);
    this.#refreshLabels();
  }

  /**
   * Override keyboard shortcuts for this editor, by command or button name: a combination
   * like `"Mod+Shift+B"`, several, `false` to remove them, or `null` to restore the default.
   */
  setShortcuts(map: ShortcutMap = {}): void {
    mergeShortcuts(this.#shortcutOverrides, map);
    this.#renderButtons();
  }

  /** The shortcuts in effect, by command or button name (`{ bold: ["Mod+B"], ... }`). */
  getShortcuts(): Record<string, Shortcut[]> {
    return Object.fromEntries(this.#effectiveShortcuts());
  }

  /** Set theme tokens on this editor (inline `--ve-*` properties). `null` removes one. */
  setTheme(tokens: ThemeTokens = {}): void {
    applyTokens(this.style, tokens);
  }

  /**
   * Add a custom button to this editor. With the default layout it appears in a group
   * at the end of the toolbar; with a custom `toolbar` layout, where its name appears.
   * Adding a button with an existing name replaces it.
   */
  addButton(button: ToolbarButton): void {
    this.#buttons.set(validateButton(button).name, button);
    this.#renderButtons();
  }

  /** Remove a button added with `addButton()`. */
  removeButton(name: string): void {
    if (this.#buttons.delete(name)) this.#renderButtons();
  }

  insertImage(url: string, alt = ""): HTMLImageElement | null {
    return this.#imageResize?.insertImageUrl(url, alt) ?? null;
  }

  /** Insert HTML at the cursor (sanitized like pasted content), replacing the selection. */
  insertHTML(html: string): void {
    if (!this.#squire) return;
    this.#squire.insertHTML(html);
    this.#afterChange();
  }

  /** Insert plain text at the cursor, replacing the selection. */
  insertText(text: string): void {
    if (!this.#squire) return;
    this.#squire.insertPlainText(text, false);
    this.#afterChange();
  }

  /** The selected text (`""` when the selection is collapsed). */
  getSelectedText(): string {
    return this.#squire?.getSelectedText() ?? "";
  }

  override focus(): void {
    this.#squire?.focus();
  }

  // ---- Internal Setup ----

  #buildDOM() {
    this.innerHTML = "";

    const root = document.createElement("div");
    root.className = "ve-root";
    // Keep hypermedia frameworks (e.g. Datastar) from scanning internal contenteditable mutations
    root.setAttribute("data-ignore", "");
    root.innerHTML = `
      <div class="ve-toolbar" role="toolbar" data-ve-aria-label="toolbar"></div>

      <div class="ve-find-slot"></div>

      <div class="ve-stage">
        <div
          class="ve-surface"
          role="textbox"
          aria-multiline="true"
          data-ve-aria-label="editor"
        ></div>
      </div>

      <div class="ve-footer">
        <span class="ve-status" data-status></span>
        <span class="ve-metrics" data-metrics></span>
      </div>

      <input type="file" accept="image/*" hidden data-file-input />

      <div class="ve-popover ve-form-popover" popover="auto" data-link-popover>
        <form class="ve-popover-form" data-link-form>
          <label class="ve-field">
            <span data-ve-text="linkUrl"></span>
            <input type="url" class="ve-input" name="href" data-ve-placeholder="linkUrlPlaceholder" required />
          </label>
          <div class="ve-popover-actions">
            <button type="button" class="ve-btn ve-btn--sm ve-btn--danger ve-btn--text" data-remove-link data-ve-text="removeLink" hidden></button>
            <span class="ve-spacer"></span>
            <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-close-popover data-ve-text="cancel"></button>
            <button type="submit" class="ve-btn ve-btn--sm ve-btn--primary ve-btn--text" data-ve-text="apply"></button>
          </div>
        </form>
      </div>

      <div class="ve-popover ve-form-popover" popover="auto" data-image-popover>
        <form class="ve-popover-form" data-image-form>
          <div class="ve-upload-row">
            <button type="button" class="ve-btn ve-btn--text ve-btn--upload" data-pick-file>
              ${this.#icon("upload", 15)}
              <span data-ve-text="chooseImageFile"></span>
            </button>
          </div>
          <div class="ve-divider-label"><span data-ve-text="orPasteUrl"></span></div>
          <label class="ve-field">
            <span data-ve-text="imageUrl"></span>
            <input type="url" class="ve-input" name="src" data-ve-placeholder="imageUrlPlaceholder" required />
          </label>
          <label class="ve-field">
            <span data-ve-text="altText"></span>
            <input type="text" class="ve-input" name="alt" data-ve-placeholder="altTextPlaceholder" />
          </label>
          <div class="ve-popover-actions">
            <span class="ve-spacer"></span>
            <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-close-popover data-ve-text="cancel"></button>
            <button type="submit" class="ve-btn ve-btn--sm ve-btn--primary ve-btn--text" data-ve-text="insert"></button>
          </div>
        </form>
      </div>
    `;

    this.appendChild(root);

    this.#root = root;
    this.#toolbar = root.querySelector<HTMLElement>(".ve-toolbar");
    this.#surface = root.querySelector<HTMLElement>(".ve-surface");
    this.#overlayHost = root.querySelector<HTMLElement>(".ve-stage");
    this.#statusEl = root.querySelector<HTMLElement>("[data-status]");
    this.#linkPopover = root.querySelector<HTMLElement>("[data-link-popover]");
    this.#imagePopover = root.querySelector<HTMLElement>("[data-image-popover]");
    this.#fileInput = root.querySelector<HTMLInputElement>("[data-file-input]");

    applyLabels(root, this.#t);
    this.#syncPlaceholder();
    this.#renderToolbar();
    this.#bindUIEvents();
  }

  #initEditor() {
    const surface = this.#surface!;
    const overlayHost = this.#overlayHost!;
    const squire = new Squire(surface, {
      blockTag: "P",
      sanitizeToDOMFragment,
    });
    this.#squire = squire;

    const onEditorMutate = () => {
      this.#syncFormState();
      this.#syncToolbar();
      this.#emitUpdate();
    };

    // Custom TipTap-style Image Resize & Upload extension
    this.#imageResize = createImageResizeExtension({
      squire,
      surface,
      overlayHost,
      editorToolbar: this.#toolbar,
      onChange: onEditorMutate,
      onSelectChange: () => {
        this.#syncToolbar();
        this.#emitStateEvent();
      },
      getUploadHandler: () => this.#resolveUploadHandler(),
      renderIcon: this.#icon,
      t: this.#t,
      onStatus: (msg) => {
        if (this.#statusEl) this.#statusEl.textContent = msg || "";
      },
    });

    // Floating selection bubble toolbar (Popover + CSS Anchor Positioning)
    this.#bubbleMenu = createBubbleMenuExtension({
      squire,
      surface,
      overlayHost,
      onCommand: onEditorMutate,
      onOpenLink: () => this.#openLinkPopover(),
      isImageSelected: () => Boolean(this.#imageResize?.getSelectedImage()),
      renderIcon: this.#icon,
      label: this.#t("bubbleMenu"),
      renderButtons: () => this.#renderItems(this.#bubbleItems(), 14),
      runCommand: (name) => this.exec(name),
      syncButtons: (menu) => this.#syncButtons(menu),
    });

    // Non-destructive Find & Replace (CSS Custom Highlight API)
    this.#findReplace = createFindReplaceExtension({
      surface,
      barSlot: this.#root!.querySelector<HTMLElement>(".ve-find-slot")!,
      squire,
      onChange: onEditorMutate,
      renderIcon: this.#icon,
      t: this.#t,
    });

    this.#extensions = [this.#imageResize, this.#bubbleMenu, this.#findReplace];

    // Keyboard shortcuts all come from the shortcut map (see #bindShortcuts)
    this.#bindShortcuts();

    const onSelectionState = () => {
      this.#syncToolbar();
      this.#emitStateEvent();
    };

    // Squire lifecycle events
    squire.addEventListener("input", onEditorMutate);
    squire.addEventListener("pathChange", onSelectionState);
    squire.addEventListener("select", onSelectionState);
    squire.addEventListener("cursor", onSelectionState);
    squire.addEventListener("undoStateChange", (e) => {
      const detail = (e as CustomEvent<{ canUndo?: boolean; canRedo?: boolean }>).detail;
      this.#canUndo = Boolean(detail?.canUndo);
      this.#canRedo = Boolean(detail?.canRedo);
      onSelectionState();
    });
    squire.addEventListener("blur", () => {
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }

  #bindUIEvents() {
    const toolbar = this.#toolbar!;
    const linkPopover = this.#linkPopover!;
    const imagePopover = this.#imagePopover!;
    const fileInput = this.#fileInput!;

    // Prevent toolbar button mousedown from stealing focus/selection from Squire
    toolbar.addEventListener("mousedown", (e) => {
      if ((e.target as Element).closest("button")) e.preventDefault();
    });

    toolbar.addEventListener("click", (e) => {
      const btn = (e.target as Element).closest<HTMLButtonElement>("button[data-cmd]");
      if (!btn || btn.disabled) return;
      this.exec(btn.dataset.cmd as EditorCommand);
    });

    // Link popover handlers
    const linkForm = linkPopover.querySelector<HTMLFormElement>("[data-link-form]")!;
    const hrefInput = linkForm.querySelector<HTMLInputElement>('input[name="href"]')!;
    const removeLinkBtn = linkPopover.querySelector<HTMLButtonElement>("[data-remove-link]")!;

    linkForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const href = hrefInput.value.trim();
      if (!isSafeUrl(href, "link")) return;
      this.#hidePopover(linkPopover);
      this.#restoreSavedRange();
      this.exec("makeLink", href);
    });

    removeLinkBtn.addEventListener("click", () => {
      this.#hidePopover(linkPopover);
      this.#restoreSavedRange();
      this.exec("removeLink");
    });

    linkPopover.querySelector("[data-close-popover]")!.addEventListener("click", () => {
      this.#hidePopover(linkPopover);
      this.#restoreSavedRange();
    });

    // Image popover handlers
    const imageForm = imagePopover.querySelector<HTMLFormElement>("[data-image-form]")!;
    const srcInput = imageForm.querySelector<HTMLInputElement>('input[name="src"]')!;
    const altInput = imageForm.querySelector<HTMLInputElement>('input[name="alt"]')!;
    imageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const src = srcInput.value.trim();
      const alt = altInput.value.trim();
      if (!isSafeUrl(src, "image")) return;
      this.#hidePopover(imagePopover);
      this.#restoreSavedRange();
      this.#imageResize?.insertImageUrl(src, alt);
      imageForm.reset();
    });

    imagePopover.querySelector("[data-pick-file]")!.addEventListener("click", () => {
      this.#hidePopover(imagePopover);
      fileInput.value = "";
      fileInput.click();
    });

    imagePopover.querySelector("[data-close-popover]")!.addEventListener("click", () => {
      this.#hidePopover(imagePopover);
      this.#restoreSavedRange();
    });

    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      this.#restoreSavedRange();
      void this.#imageResize?.insertImageFile(file);
    });
  }

  #resolveUploadHandler(): UploadHandler | null {
    if (this.#uploadHandler) return this.#uploadHandler;
    const uploadUrl = this.getAttribute("upload-url");
    if (!uploadUrl) return null;

    return async (file: File) => {
      const resp = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`Upload failed (${resp.status})${text ? `: ${text}` : ""}`);
      }
      const data = (await resp.json()) as { url?: unknown } | null;
      if (typeof data?.url !== "string" || !data.url)
        throw new Error("Upload endpoint did not return { url }");
      return data.url;
    };
  }

  #openLinkPopover() {
    const popover = this.#linkPopover;
    if (!this.#squire || !popover) return;
    this.#savedRange = this.#squire.getSelection()?.cloneRange() || null;

    const existingHref = this.#findSelectedLinkHref();
    const hrefInput = popover.querySelector<HTMLInputElement>('input[name="href"]')!;
    const removeBtn = popover.querySelector<HTMLButtonElement>("[data-remove-link]")!;
    hrefInput.value = existingHref || "";
    removeBtn.hidden = !existingHref;

    this.#showPopoverNearButton(popover, this.#toolbar?.querySelector('[data-cmd="link"]') ?? null);
    requestAnimationFrame(() => {
      hrefInput.focus();
      hrefInput.select();
    });
  }

  #openImagePopover() {
    const popover = this.#imagePopover;
    if (!this.#squire || !popover) return;
    this.#savedRange = this.#squire.getSelection()?.cloneRange() || null;
    const form = popover.querySelector<HTMLFormElement>("[data-image-form]")!;
    form.reset();
    this.#showPopoverNearButton(
      popover,
      this.#toolbar?.querySelector('[data-cmd="image"]') ?? null,
    );
    requestAnimationFrame(() => form.querySelector<HTMLInputElement>('input[name="src"]')?.focus());
  }

  #findSelectedLinkHref(): string {
    const anchor = this.#selectionElement()?.closest("a");
    return anchor && this.#surface?.contains(anchor) ? anchor.getAttribute("href") || "" : "";
  }

  /** The element containing the selection (the parent element for a text node). */
  #selectionElement(): Element | null {
    const node = this.#squire?.getSelection()?.commonAncestorContainer;
    if (!node) return null;
    return node instanceof Element ? node : node.parentElement;
  }

  #restoreSavedRange() {
    if (this.#savedRange && this.#squire) {
      try {
        this.#squire.setSelection(this.#savedRange).focus();
      } catch {
        this.#squire.focus();
      }
    }
    this.#savedRange = null;
  }

  #showPopoverNearButton(popoverEl: HTMLElement, btnEl: Element | null) {
    try {
      if (!popoverEl.matches(":popover-open")) popoverEl.showPopover();
    } catch {
      popoverEl.hidden = false;
    }
    // With toolbar="none" the trigger button is hidden: anchor to the caret / selection instead
    const bRect = btnEl?.getClientRects().length
      ? btnEl.getBoundingClientRect()
      : this.#selectionRect();
    if (!bRect) return;
    const pRect = popoverEl.getBoundingClientRect();
    let top = bRect.bottom + 8;
    if (top + pRect.height > window.innerHeight - 8) {
      top = Math.max(8, bRect.top - pRect.height - 8);
    }
    let left = bRect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - pRect.width - 8));
    popoverEl.style.top = `${Math.round(top)}px`;
    popoverEl.style.left = `${Math.round(left)}px`;
  }

  #selectionRect(): DOMRect | null {
    const range = this.#savedRange || this.#squire?.getSelection();
    const rects = range?.getClientRects();
    const rect = rects?.length ? rects[rects.length - 1] : range?.getBoundingClientRect();
    if (rect && (rect.width || rect.height)) return rect;
    return this.#surface?.getBoundingClientRect() || null;
  }

  #refreshIcons() {
    if (!this.#root) return;
    for (const el of this.#root.querySelectorAll<HTMLElement>("[data-icon]")) {
      el.outerHTML = this.#icon(el.dataset.icon ?? "", Number(el.dataset.size) || 16);
    }
  }

  #hidePopover(popoverEl: HTMLElement) {
    try {
      if (popoverEl.matches(":popover-open")) popoverEl.hidePopover();
    } catch {
      popoverEl.hidden = true;
    }
  }

  #findImageOnlyBlock(): HTMLImageElement | null {
    if (!this.#surface) return null;
    const block = this.#selectionElement()?.closest("p, div, figure");
    if (!block || block === this.#surface || !this.#surface.contains(block)) return null;
    const imgs = block.querySelectorAll("img");
    if (imgs.length === 1 && !(block.textContent || "").trim()) {
      return imgs[0];
    }
    return null;
  }

  #getActiveAlignment(): string | null {
    const imgAlign = this.#imageResize?.getAlignment();
    if (imgAlign) return imgAlign;
    if (!this.#surface) return null;
    const block = this.#selectionElement()?.closest<HTMLElement>(
      "p, div, h1, h2, h3, h4, h5, h6, li, blockquote",
    );
    if (!block || !this.#surface.contains(block)) return null;
    if (block.style.textAlign) return block.style.textAlign;
    if (block.classList.contains("align-center")) return "center";
    if (block.classList.contains("align-right")) return "right";
    if (block.classList.contains("align-left")) return "left";
    return null;
  }

  #getActiveState(): EditorActiveState {
    const activeAlign = this.#getActiveAlignment();
    return {
      ...getActiveState(this.#squire),
      alignLeft: activeAlign === "left",
      alignCenter: activeAlign === "center",
      alignRight: activeAlign === "right",
    };
  }

  // ---- Toolbar layout & buttons ----

  #reflectLayout(attr: "toolbar" | "bubble-menu", layout: ToolbarLayout | null | undefined) {
    if (layout == null) {
      this.removeAttribute(attr);
      return;
    }
    const value = typeof layout === "string" ? layout : layout.join(" ");
    this.setAttribute(attr, value.trim() === "" ? "none" : value);
  }

  /** The toolbar layout in use: the `toolbar` attribute, or the default plus custom buttons. */
  #toolbarItems(): ToolbarItem[] {
    const explicit = toItems(this.getAttribute("toolbar"));
    if (explicit) return explicit;
    const custom = [...new Set([...getDefinedButtons().keys(), ...this.#buttons.keys()])];
    return custom.length ? [...DEFAULT_TOOLBAR, "|", ...custom] : [...DEFAULT_TOOLBAR];
  }

  #bubbleItems(): ToolbarItem[] {
    return toItems(this.getAttribute("bubble-menu")) ?? [...DEFAULT_BUBBLE_MENU];
  }

  #customButton(name: string): ToolbarButton | undefined {
    return this.#buttons.get(name) ?? getDefinedButtons().get(name);
  }

  /** Call a custom button's optional hook; errors are logged instead of breaking the editor. */
  #safeCall(button: ToolbarButton, hook: "isActive" | "isEnabled"): boolean | undefined {
    try {
      return button[hook]?.(this);
    } catch (err) {
      console.error(`[vanilia-editor] ${hook}() of button "${button.name}" failed`, err);
      return undefined;
    }
  }

  /** Markup for a layout: groups of buttons split by `|`, unknown names skipped. */
  #renderItems(items: readonly ToolbarItem[], size: number): string {
    const groups: string[][] = [[]];
    for (const item of items) {
      if (item === "|") groups.push([]);
      else {
        // Unknown names render nothing until a button with that name is added
        const html = this.#renderButton(item, size);
        if (html) groups[groups.length - 1].push(html);
      }
    }
    return groups
      .filter((group) => group.length)
      .map((group) => `<div class="ve-btn-group">${group.join("")}</div>`)
      .join(`<span class="ve-sep"></span>`);
  }

  #renderButton(name: string, size: number): string {
    const small = size < 16 ? " ve-btn--sm" : "";
    const builtin = BUILTIN_BUTTONS[name as BuiltinButtonName];
    if (builtin) {
      return this.#buttonMarkup({
        name,
        label: this.#t(builtin.label),
        shortcut: this.#shortcutFor(name),
        iconHTML: this.#icon(builtin.icon, size),
        className: `ve-btn${small}`,
      });
    }
    const custom = this.#customButton(name);
    if (!custom) return "";
    const iconHTML = !custom.icon
      ? ""
      : custom.icon.includes("<")
        ? `<span class="ve-icon ve-icon--custom" aria-hidden="true">${custom.icon}</span>`
        : this.#icon(custom.icon, size);
    const text = custom.text ? `<span class="ve-btn-text">${escapeAttr(custom.text)}</span>` : "";
    return this.#buttonMarkup({
      name,
      label: custom.label,
      shortcut: this.#shortcutFor(name),
      iconHTML: iconHTML + text,
      className: `ve-btn${small}${custom.text ? " ve-btn--text" : ""} ve-btn--custom`,
    });
  }

  #buttonMarkup(b: {
    name: string;
    label: string;
    shortcut?: string;
    iconHTML: string;
    className: string;
  }): string {
    const title = b.shortcut ? `${b.label} (${formatShortcut(b.shortcut)})` : b.label;
    const keys = b.shortcut ? ` aria-keyshortcuts="${escapeAttr(ariaShortcut(b.shortcut))}"` : "";
    return `<button type="button" class="${b.className}" data-cmd="${escapeAttr(b.name)}" title="${escapeAttr(title)}" aria-label="${escapeAttr(b.label)}"${keys}>${b.iconHTML}</button>`;
  }

  #renderToolbar() {
    const toolbar = this.#toolbar;
    if (!toolbar) return;
    toolbar.innerHTML = this.#renderItems(this.#toolbarItems(), 16);
    toolbar.hidden = !toolbar.querySelector("button");
    this.#syncButtons(toolbar);
  }

  /** Re-render the toolbar and the selection menu (layout, label or button changes). */
  #renderButtons() {
    if (!this.#mounted) return;
    this.#renderToolbar();
    this.#bubbleMenu?.refresh();
    this.#bindShortcuts();
  }

  #boundKeys: string[] = [];

  /**
   * The shortcuts in effect, by command or button name. Lookup order: this editor's
   * overrides, `setShortcuts()`, a custom button's own `shortcut`, the built-in defaults.
   * Empty when the `shortcuts` attribute is `"none"`.
   */
  #effectiveShortcuts(): Map<string, Shortcut[]> {
    const result = new Map<string, Shortcut[]>();
    if (this.getAttribute("shortcuts") === "none") return result;
    for (const [name, keys] of Object.entries(DEFAULT_SHORTCUTS)) result.set(name, [...keys]);
    const custom = new Map([...getDefinedButtons(), ...this.#buttons]);
    for (const [name, button] of custom) {
      if (button.shortcut) {
        result.set(
          name,
          typeof button.shortcut === "string" ? [button.shortcut] : [...button.shortcut],
        );
      }
    }
    for (const [name, keys] of getGlobalShortcuts()) result.set(name, [...keys]);
    for (const [name, keys] of this.#shortcutOverrides) result.set(name, [...keys]);
    for (const [name, keys] of result) if (!keys.length) result.delete(name);
    return result;
  }

  /** First shortcut of a command or button, for its tooltip. */
  #shortcutFor(name: string): Shortcut | undefined {
    return this.#effectiveShortcuts().get(name)?.[0];
  }

  /**
   * Bind the shortcut map. Squire's own defaults are replaced first: keys the browser
   * would edit with (bold, undo, ...) are blocked, the rest fall through to the browser.
   */
  #bindShortcuts() {
    const squire = this.#squire;
    if (!squire) return;
    const block: KeyHandler = (_ed, event) => event.preventDefault();
    const reset = (key: string) =>
      squire.setKeyHandler(key, NATIVE_EDITING_KEYS.has(key) ? block : null);
    for (const key of this.#boundKeys) reset(key);
    for (const key of SQUIRE_DEFAULT_KEYS.flatMap(squireKeys)) reset(key);
    this.#boundKeys = [];

    for (const [name, shortcuts] of this.#effectiveShortcuts()) {
      const custom = this.#customButton(name);
      if (!custom && !(name in DEFAULT_SHORTCUTS) && !COMMANDS.has(name)) continue;
      for (const key of shortcuts.flatMap(squireKeys)) {
        squire.setKeyHandler(key, (_ed, event) => {
          event.preventDefault();
          // The find shortcut opens (rather than toggles) the find bar
          if (name === "find") this.#findReplace?.open();
          else this.exec(name);
        });
        this.#boundKeys.push(key);
      }
    }
  }

  /** Pressed and disabled state of the buttons in `container`. */
  #syncButtons(container: HTMLElement) {
    const editorDisabled = this.hasAttribute("disabled") || this.matches(":disabled");
    const active = this.#squire ? this.#getActiveState() : null;
    for (const btn of container.querySelectorAll<HTMLButtonElement>("button[data-cmd]")) {
      const cmd = btn.dataset.cmd ?? "";
      let isOn: boolean | undefined;
      let enabled = true;
      const custom = cmd in BUILTIN_BUTTONS ? undefined : this.#customButton(cmd);
      if (custom) {
        isOn = custom.isActive ? Boolean(this.#safeCall(custom, "isActive")) : undefined;
        enabled = this.#safeCall(custom, "isEnabled") !== false;
      } else if (active && cmd in active) {
        isOn = active[cmd as keyof EditorActiveState];
      }
      if (cmd === "undo") enabled = this.#canUndo;
      if (cmd === "redo") enabled = this.#canRedo;
      btn.disabled = editorDisabled || !enabled;
      if (isOn !== undefined) {
        btn.classList.toggle("is-active", isOn);
        btn.setAttribute("aria-pressed", String(isOn));
      }
    }
  }

  // ---- Labels ----

  #syncPlaceholder() {
    if (this.#surface) {
      this.#surface.dataset.placeholder =
        this.getAttribute("placeholder") || this.#t("placeholder");
    }
  }

  #refreshLabels() {
    if (!this.#root) return;
    applyLabels(this.#root, this.#t);
    this.#syncPlaceholder();
    this.#renderButtons();
    this.#root.querySelector(".ve-bubble-menu")?.setAttribute("aria-label", this.#t("bubbleMenu"));
    this.#syncToolbar();
    this.#syncFormState();
  }

  #afterChange() {
    this.#syncFormState();
    this.#syncToolbar();
    this.#emitUpdate();
  }

  #syncToolbar() {
    if (!this.#toolbar || !this.#squire) return;
    this.#syncButtons(this.#toolbar);

    // Update empty-state & word count
    const text = this.getText();
    const hasImg = Boolean(this.#surface?.querySelector("img"));
    const isEmpty = !text && !hasImg;
    this.#surface?.toggleAttribute("data-empty", isEmpty);

    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const metricsEl = this.#root?.querySelector("[data-metrics]");
    if (metricsEl) {
      const imgCount = this.#surface?.querySelectorAll("img").length || 0;
      const parts = [this.#t("wordCount", { count: words })];
      if (imgCount) parts.push(this.#t("imageCount", { count: imgCount }));
      metricsEl.textContent = parts.join(" · ");
    }
  }

  #syncFormState() {
    const html = this.getHTML();
    this.#internals.setFormValue(html, html);

    const isRequired = this.hasAttribute("required");
    const hasContent = Boolean(this.getText() || this.#surface?.querySelector("img"));
    if (isRequired && !hasContent) {
      this.#internals.setValidity(
        { valueMissing: true },
        this.#t("valueMissing"),
        this.#surface || undefined,
      );
    } else {
      this.#internals.setValidity({});
    }
  }

  #applyDisabled(disabled: boolean) {
    if (!this.#surface || !this.#toolbar) return;
    this.#surface.setAttribute("contenteditable", disabled ? "false" : "true");
    this.#root?.classList.toggle("is-disabled", disabled);
    for (const btn of this.#toolbar.querySelectorAll("button")) {
      btn.disabled = disabled;
    }
    if (!disabled) this.#syncButtons(this.#toolbar);
    if (disabled) this.#imageResize?.deselect();
  }

  #buildDetail(): VaniliaEditorDetail {
    const text = this.getText();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const images = this.#surface?.querySelectorAll("img").length || 0;
    return {
      html: this.getHTML(),
      text,
      words,
      images,
      active: this.#getActiveState(),
      canUndo: this.#canUndo,
      canRedo: this.#canRedo,
    };
  }

  #emitStateEvent() {
    const detail = this.#buildDetail();
    this.dispatchEvent(new CustomEvent("ve:update", { detail, bubbles: true, composed: true }));
    this.dispatchEvent(new CustomEvent("editorupdate", { detail, bubbles: true, composed: true }));
  }

  #emitUpdate() {
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.#emitStateEvent();
  }

  #teardown() {
    for (const ext of this.#extensions) {
      ext.destroy();
    }
    this.#extensions = [];
    this.#imageResize = null;
    this.#bubbleMenu = null;
    this.#findReplace = null;
    this.#squire?.destroy();
    this.#squire = null;
    for (const unsubscribe of this.#unsubscribers) unsubscribe();
    this.#unsubscribers = [];
    this.#mounted = false;
  }
}

if (typeof customElements !== "undefined" && !customElements.get("vanilia-editor")) {
  customElements.define("vanilia-editor", VaniliaEditorElement);
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

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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

/** Commands accepted by `editor.exec()`: formatting commands plus the link, image and find UIs. */
export type EditorCommand = Command | "link" | "image" | "find";

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
  static observedAttributes = ["placeholder", "disabled", "required", "upload-url", "toolbar"];

  /** Override icons for every editor on the page (see `setIcons` in icons.js). */
  static setIcons(map: IconMap): void {
    setIcons(map);
  }

  /** Names of all overridable icons. */
  static get iconNames(): readonly IconName[] {
    return ICON_NAMES;
  }

  #iconOverrides = new Map<string, string>();
  #unsubscribeIcons: (() => void) | null = null;
  #icon = (name: string, size?: number) => icon(name, size, this.#iconOverrides);

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
    this.setHTML(str);
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
    this.#unsubscribeIcons = onIconsChange(() => this.#refreshIcons());

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
    if (name === "placeholder" && this.#surface) {
      this.#surface.dataset.placeholder = newVal || "Start writing...";
    } else if (name === "disabled") {
      this.#applyDisabled(newVal !== null);
    } else if (name === "required") {
      this.#syncFormState();
    } else if (name === "toolbar" && this.#toolbar) {
      this.#toolbar.hidden = newVal === "none";
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

  exec(command: EditorCommand, arg?: string): void {
    if (!this.#squire || this.hasAttribute("disabled")) return;
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

  insertImage(url: string, alt = ""): HTMLImageElement | null {
    return this.#imageResize?.insertImageUrl(url, alt) ?? null;
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
      <div class="ve-toolbar" role="toolbar" aria-label="Formatting toolbar">
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="bold" title="Bold (Ctrl+B)">${this.#icon("bold")}</button>
          <button type="button" class="ve-btn" data-cmd="italic" title="Italic (Ctrl+I)">${this.#icon("italic")}</button>
          <button type="button" class="ve-btn" data-cmd="underline" title="Underline (Ctrl+U)">${this.#icon("underline")}</button>
          <button type="button" class="ve-btn" data-cmd="strike" title="Strikethrough (Ctrl+Shift+X)">${this.#icon("strike")}</button>
          <button type="button" class="ve-btn" data-cmd="code" title="Code / Code Block">${this.#icon("code")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="paragraph" title="Paragraph">${this.#icon("paragraph")}</button>
          <button type="button" class="ve-btn" data-cmd="h1" title="Heading 1">${this.#icon("h1")}</button>
          <button type="button" class="ve-btn" data-cmd="h2" title="Heading 2">${this.#icon("h2")}</button>
          <button type="button" class="ve-btn" data-cmd="h3" title="Heading 3">${this.#icon("h3")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="bulletList" title="Bullet list">${this.#icon("bulletList")}</button>
          <button type="button" class="ve-btn" data-cmd="orderedList" title="Numbered list">${this.#icon("orderedList")}</button>
          <button type="button" class="ve-btn" data-cmd="blockquote" title="Blockquote">${this.#icon("quote")}</button>
          <button type="button" class="ve-btn" data-cmd="hr" title="Horizontal rule">${this.#icon("hr")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="alignLeft" title="Align left">${this.#icon("alignLeft")}</button>
          <button type="button" class="ve-btn" data-cmd="alignCenter" title="Align center">${this.#icon("alignCenter")}</button>
          <button type="button" class="ve-btn" data-cmd="alignRight" title="Align right">${this.#icon("alignRight")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="link" title="Insert or edit link (Ctrl+K)">${this.#icon("link")}</button>
          <button type="button" class="ve-btn" data-cmd="image" title="Insert or upload image">${this.#icon("image")}</button>
          <button type="button" class="ve-btn" data-cmd="clearFormatting" title="Clear formatting">${this.#icon("clear")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="undo" title="Undo (Ctrl+Z)">${this.#icon("undo")}</button>
          <button type="button" class="ve-btn" data-cmd="redo" title="Redo (Ctrl+Shift+Z)">${this.#icon("redo")}</button>
          <button type="button" class="ve-btn" data-cmd="find" title="Find & Replace (Ctrl+F)">${this.#icon("search")}</button>
        </div>
      </div>

      <div class="ve-find-slot"></div>

      <div class="ve-stage">
        <div
          class="ve-surface"
          role="textbox"
          aria-multiline="true"
          aria-label="Rich text editor"
          data-placeholder="${escapeAttr(this.getAttribute("placeholder") || "Start writing, paste an image, or drop a photo here...")}"
        ></div>
      </div>

      <div class="ve-footer">
        <span class="ve-status" data-status></span>
        <span class="ve-metrics" data-metrics>0 words</span>
      </div>

      <input type="file" accept="image/*" hidden data-file-input />

      <div class="ve-popover ve-form-popover" popover="auto" data-link-popover>
        <form class="ve-popover-form" data-link-form>
          <label class="ve-field">
            <span>Link URL</span>
            <input type="url" class="ve-input" name="href" placeholder="https://example.com" required />
          </label>
          <div class="ve-popover-actions">
            <button type="button" class="ve-btn ve-btn--sm ve-btn--danger ve-btn--text" data-remove-link hidden>Remove</button>
            <span class="ve-spacer"></span>
            <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-close-popover>Cancel</button>
            <button type="submit" class="ve-btn ve-btn--sm ve-btn--primary ve-btn--text">Apply</button>
          </div>
        </form>
      </div>

      <div class="ve-popover ve-form-popover" popover="auto" data-image-popover>
        <form class="ve-popover-form" data-image-form>
          <div class="ve-upload-row">
            <button type="button" class="ve-btn ve-btn--text ve-btn--upload" data-pick-file>
              ${this.#icon("upload", 15)}
              <span>Choose image file...</span>
            </button>
          </div>
          <div class="ve-divider-label"><span>or paste URL</span></div>
          <label class="ve-field">
            <span>Image URL</span>
            <input type="url" class="ve-input" name="src" placeholder="https://..." required />
          </label>
          <label class="ve-field">
            <span>Alt text (optional)</span>
            <input type="text" class="ve-input" name="alt" placeholder="Describe the image" />
          </label>
          <div class="ve-popover-actions">
            <span class="ve-spacer"></span>
            <button type="button" class="ve-btn ve-btn--sm ve-btn--text" data-close-popover>Cancel</button>
            <button type="submit" class="ve-btn ve-btn--sm ve-btn--primary ve-btn--text">Insert</button>
          </div>
        </form>
      </div>
    `;

    this.appendChild(root);

    const toolbar = root.querySelector<HTMLElement>(".ve-toolbar")!;
    toolbar.hidden = this.getAttribute("toolbar") === "none";

    this.#root = root;
    this.#toolbar = toolbar;
    this.#surface = root.querySelector<HTMLElement>(".ve-surface");
    this.#overlayHost = root.querySelector<HTMLElement>(".ve-stage");
    this.#statusEl = root.querySelector<HTMLElement>("[data-status]");
    this.#linkPopover = root.querySelector<HTMLElement>("[data-link-popover]");
    this.#imagePopover = root.querySelector<HTMLElement>("[data-image-popover]");
    this.#fileInput = root.querySelector<HTMLInputElement>("[data-file-input]");

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
    });

    // Non-destructive Find & Replace (CSS Custom Highlight API)
    this.#findReplace = createFindReplaceExtension({
      surface,
      barSlot: this.#root!.querySelector<HTMLElement>(".ve-find-slot")!,
      squire,
      onChange: onEditorMutate,
      renderIcon: this.#icon,
    });

    this.#extensions = [this.#imageResize, this.#bubbleMenu, this.#findReplace];

    // Extra keyboard shortcuts
    const mod = navigator.platform?.toLowerCase().includes("mac") ? "Meta" : "Ctrl";
    squire.setKeyHandler(`${mod}-k`, (_ed, event) => {
      event.preventDefault();
      this.#openLinkPopover();
    });
    squire.setKeyHandler(`${mod}-f`, (_ed, event) => {
      event.preventDefault();
      this.#findReplace?.open();
    });
    squire.setKeyHandler(`${mod}-Shift-x`, (_ed, event) => {
      event.preventDefault();
      this.exec("strike");
    });

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

  #syncToolbar() {
    if (!this.#toolbar || !this.#squire) return;
    const active = this.#getActiveState();
    for (const btn of this.#toolbar.querySelectorAll<HTMLButtonElement>("button[data-cmd]")) {
      const cmd = btn.dataset.cmd ?? "";
      if (cmd in active) {
        const isOn = active[cmd as keyof EditorActiveState];
        btn.classList.toggle("is-active", isOn);
        btn.setAttribute("aria-pressed", String(isOn));
      }
      if (cmd === "undo") btn.disabled = !this.#canUndo || this.hasAttribute("disabled");
      if (cmd === "redo") btn.disabled = !this.#canRedo || this.hasAttribute("disabled");
    }

    // Update empty-state & word count
    const html = this.getHTML();
    const text = this.getText();
    const hasImg = Boolean(this.#surface?.querySelector("img"));
    const isEmpty = !text && !hasImg;
    this.#surface?.toggleAttribute("data-empty", isEmpty);

    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const metricsEl = this.#root?.querySelector("[data-metrics]");
    if (metricsEl) {
      const imgCount = this.#surface?.querySelectorAll("img").length || 0;
      const parts = [`${words} ${words === 1 ? "word" : "words"}`];
      if (imgCount) parts.push(`${imgCount} ${imgCount === 1 ? "image" : "images"}`);
      metricsEl.textContent = parts.join(" · ");
    }
    return html;
  }

  #syncFormState() {
    const html = this.getHTML();
    this.#internals.setFormValue(html, html);

    const isRequired = this.hasAttribute("required");
    const hasContent = Boolean(this.getText() || this.#surface?.querySelector("img"));
    if (isRequired && !hasContent) {
      this.#internals.setValidity(
        { valueMissing: true },
        "Please fill out this field.",
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
    this.#unsubscribeIcons?.();
    this.#unsubscribeIcons = null;
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

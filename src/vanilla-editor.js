import Squire from "../static/vendor/squire.mjs";
import { icon } from "./icons.js";
import {
  formatHTML,
  isSafeUrl,
  normalizeExportHTML,
  sanitizeToDOMFragment,
} from "./sanitizer.js";
import { execCommand, getActiveState, isActive } from "./extensions/formatting.js";
import { createImageResizeExtension } from "./extensions/image-resize.js";
import { createBubbleMenuExtension } from "./extensions/bubble-menu.js";
import { createFindReplaceExtension } from "./extensions/find-replace.js";

/**
 * <vanilla-editor> — Form-Associated Custom Element (ElementInternals)
 * powered by vendored Fastmail Squire + modular modern Web/CSS API extensions.
 */
export class VanillaEditorElement extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ["placeholder", "disabled", "required", "upload-url"];

  #internals;
  #squire = null;
  #extensions = [];
  #imageResize = null;
  #bubbleMenu = null;
  #findReplace = null;

  #root = null;
  #toolbar = null;
  #surface = null;
  #overlayHost = null;
  #statusEl = null;
  #linkPopover = null;
  #imagePopover = null;
  #fileInput = null;

  #initialHTML = "";
  #pendingValue = null;
  #savedRange = null;
  #canUndo = false;
  #canRedo = false;
  #mounted = false;
  #uploadHandler = null;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#internals.role = "group";
  }

  /** Optional JS hook: `(file: File) => Promise<string>` returning an image URL */
  get onImageUpload() {
    return this.#uploadHandler;
  }

  set onImageUpload(fn) {
    this.#uploadHandler = typeof fn === "function" ? fn : null;
  }

  get value() {
    if (!this.#squire) {
      return this.#pendingValue ?? this.getAttribute("value") ?? "";
    }
    return this.getHTML();
  }

  set value(html) {
    const str = html == null ? "" : String(html);
    if (!this.#squire) {
      this.#pendingValue = str;
      return;
    }
    this.setHTML(str);
  }

  get form() {
    return this.#internals.form;
  }

  get validity() {
    return this.#internals.validity;
  }

  get validationMessage() {
    return this.#internals.validationMessage;
  }

  checkValidity() {
    return this.#internals.checkValidity();
  }

  reportValidity() {
    return this.#internals.reportValidity();
  }

  connectedCallback() {
    if (this.#mounted) {
      this.#syncFormState();
      return;
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

  attributeChangedCallback(name, _oldVal, newVal) {
    if (!this.#mounted) return;
    if (name === "placeholder" && this.#surface) {
      this.#surface.dataset.placeholder = newVal || "Start writing...";
    } else if (name === "disabled") {
      this.#applyDisabled(newVal !== null);
    } else if (name === "required") {
      this.#syncFormState();
    }
  }

  formDisabledCallback(disabled) {
    this.#applyDisabled(disabled);
  }

  formResetCallback() {
    this.setHTML(this.#initialHTML || "");
  }

  formStateRestoreCallback(state) {
    if (typeof state === "string") {
      this.setHTML(state);
    }
  }

  // ---- Public API ----

  getHTML() {
    if (!this.#squire) return this.#pendingValue || "";
    const normalized = normalizeExportHTML(this.#squire.getHTML());
    // Treat empty placeholder paragraph as empty string
    if (normalized === "<p><br></p>" || normalized === "<p></p>" || normalized === "<div><br></div>") {
      return "";
    }
    return normalized;
  }

  getFormattedHTML() {
    return formatHTML(this.getHTML());
  }

  getText() {
    return (this.#surface?.textContent || "").trim();
  }

  setHTML(html, { silent = false } = {}) {
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

  exec(command, arg) {
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
    execCommand(this.#squire, command, arg);
    this.#syncFormState();
    this.#syncToolbar();
    this.#emitUpdate();
  }

  isActive(name, attrs) {
    return isActive(this.#squire, name, attrs);
  }

  insertImage(url, alt = "") {
    return this.#imageResize?.insertImageUrl(url, alt);
  }

  focus() {
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
          <button type="button" class="ve-btn" data-cmd="bold" title="Bold (Ctrl+B)">${icon("bold")}</button>
          <button type="button" class="ve-btn" data-cmd="italic" title="Italic (Ctrl+I)">${icon("italic")}</button>
          <button type="button" class="ve-btn" data-cmd="underline" title="Underline (Ctrl+U)">${icon("underline")}</button>
          <button type="button" class="ve-btn" data-cmd="strike" title="Strikethrough (Ctrl+Shift+X)">${icon("strike")}</button>
          <button type="button" class="ve-btn" data-cmd="code" title="Code / Code Block">${icon("code")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="paragraph" title="Paragraph">${icon("paragraph")}</button>
          <button type="button" class="ve-btn" data-cmd="h1" title="Heading 1">${icon("h1")}</button>
          <button type="button" class="ve-btn" data-cmd="h2" title="Heading 2">${icon("h2")}</button>
          <button type="button" class="ve-btn" data-cmd="h3" title="Heading 3">${icon("h3")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="bulletList" title="Bullet list">${icon("bulletList")}</button>
          <button type="button" class="ve-btn" data-cmd="orderedList" title="Numbered list">${icon("orderedList")}</button>
          <button type="button" class="ve-btn" data-cmd="blockquote" title="Blockquote">${icon("quote")}</button>
          <button type="button" class="ve-btn" data-cmd="hr" title="Horizontal rule">${icon("hr")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="alignLeft" title="Align left">${icon("alignLeft")}</button>
          <button type="button" class="ve-btn" data-cmd="alignCenter" title="Align center">${icon("alignCenter")}</button>
          <button type="button" class="ve-btn" data-cmd="alignRight" title="Align right">${icon("alignRight")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="link" title="Insert or edit link (Ctrl+K)">${icon("link")}</button>
          <button type="button" class="ve-btn" data-cmd="image" title="Insert or upload image">${icon("image")}</button>
          <button type="button" class="ve-btn" data-cmd="clearFormatting" title="Clear formatting">${icon("clear")}</button>
        </div>
        <span class="ve-sep"></span>
        <div class="ve-btn-group">
          <button type="button" class="ve-btn" data-cmd="undo" title="Undo (Ctrl+Z)">${icon("undo")}</button>
          <button type="button" class="ve-btn" data-cmd="redo" title="Redo (Ctrl+Shift+Z)">${icon("redo")}</button>
          <button type="button" class="ve-btn" data-cmd="find" title="Find & Replace (Ctrl+F)">${icon("search")}</button>
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
              ${icon("upload", 15)}
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

    this.#root = root;
    this.#toolbar = root.querySelector(".ve-toolbar");
    this.#surface = root.querySelector(".ve-surface");
    this.#overlayHost = root.querySelector(".ve-stage");
    this.#statusEl = root.querySelector("[data-status]");
    this.#linkPopover = root.querySelector("[data-link-popover]");
    this.#imagePopover = root.querySelector("[data-image-popover]");
    this.#fileInput = root.querySelector("[data-file-input]");

    this.#bindUIEvents();
  }

  #initEditor() {
    this.#squire = new Squire(this.#surface, {
      blockTag: "P",
      sanitizeToDOMFragment,
    });

    const onEditorMutate = () => {
      this.#syncFormState();
      this.#syncToolbar();
      this.#emitUpdate();
    };

    // Custom TipTap-style Image Resize & Upload extension
    this.#imageResize = createImageResizeExtension({
      squire: this.#squire,
      surface: this.#surface,
      overlayHost: this.#overlayHost,
      onChange: onEditorMutate,
      getUploadHandler: () => this.#resolveUploadHandler(),
      onStatus: (msg) => {
        if (this.#statusEl) this.#statusEl.textContent = msg || "";
      },
    });

    // Floating selection bubble toolbar (Popover + CSS Anchor Positioning)
    this.#bubbleMenu = createBubbleMenuExtension({
      squire: this.#squire,
      surface: this.#surface,
      overlayHost: this.#overlayHost,
      onCommand: onEditorMutate,
      onOpenLink: () => this.#openLinkPopover(),
      isImageSelected: () => Boolean(this.#imageResize?.getSelectedImage()),
    });

    // Non-destructive Find & Replace (CSS Custom Highlight API)
    this.#findReplace = createFindReplaceExtension({
      surface: this.#surface,
      barSlot: this.#root.querySelector(".ve-find-slot"),
      squire: this.#squire,
      onChange: onEditorMutate,
    });

    this.#extensions = [this.#imageResize, this.#bubbleMenu, this.#findReplace];

    // Extra keyboard shortcuts
    const mod = navigator.platform?.toLowerCase().includes("mac") ? "Meta" : "Ctrl";
    this.#squire.setKeyHandler(`${mod}-k`, (_ed, event) => {
      event.preventDefault();
      this.#openLinkPopover();
    });
    this.#squire.setKeyHandler(`${mod}-f`, (_ed, event) => {
      event.preventDefault();
      this.#findReplace?.open();
    });
    this.#squire.setKeyHandler(`${mod}-Shift-x`, (_ed, event) => {
      event.preventDefault();
      this.exec("strike");
    });

    const onSelectionState = () => {
      this.#syncToolbar();
      this.#emitStateEvent();
    };

    // Squire lifecycle events
    this.#squire.addEventListener("input", onEditorMutate);
    this.#squire.addEventListener("pathChange", onSelectionState);
    this.#squire.addEventListener("select", onSelectionState);
    this.#squire.addEventListener("cursor", onSelectionState);
    this.#squire.addEventListener("undoStateChange", (e) => {
      this.#canUndo = Boolean(e.detail?.canUndo);
      this.#canRedo = Boolean(e.detail?.canRedo);
      onSelectionState();
    });
    this.#squire.addEventListener("blur", () => {
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }

  #bindUIEvents() {
    // Prevent toolbar button mousedown from stealing focus/selection from Squire
    this.#toolbar.addEventListener("mousedown", (e) => {
      if (e.target.closest("button")) e.preventDefault();
    });

    this.#toolbar.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-cmd]");
      if (!btn || btn.disabled) return;
      this.exec(btn.dataset.cmd);
    });

    // Link popover handlers
    const linkForm = this.#linkPopover.querySelector("[data-link-form]");
    const removeLinkBtn = this.#linkPopover.querySelector("[data-remove-link]");

    linkForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const href = linkForm.elements.href.value.trim();
      if (!isSafeUrl(href, "link")) return;
      this.#hidePopover(this.#linkPopover);
      this.#restoreSavedRange();
      this.exec("makeLink", href);
    });

    removeLinkBtn.addEventListener("click", () => {
      this.#hidePopover(this.#linkPopover);
      this.#restoreSavedRange();
      this.exec("removeLink");
    });

    this.#linkPopover.querySelector("[data-close-popover]").addEventListener("click", () => {
      this.#hidePopover(this.#linkPopover);
      this.#restoreSavedRange();
    });

    // Image popover handlers
    const imageForm = this.#imagePopover.querySelector("[data-image-form]");
    imageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const src = imageForm.elements.src.value.trim();
      const alt = imageForm.elements.alt.value.trim();
      if (!isSafeUrl(src, "image")) return;
      this.#hidePopover(this.#imagePopover);
      this.#restoreSavedRange();
      this.#imageResize?.insertImageUrl(src, alt);
      imageForm.reset();
    });

    this.#imagePopover.querySelector("[data-pick-file]").addEventListener("click", () => {
      this.#hidePopover(this.#imagePopover);
      this.#fileInput.value = "";
      this.#fileInput.click();
    });

    this.#imagePopover.querySelector("[data-close-popover]").addEventListener("click", () => {
      this.#hidePopover(this.#imagePopover);
      this.#restoreSavedRange();
    });

    this.#fileInput.addEventListener("change", () => {
      const file = this.#fileInput.files?.[0];
      if (!file) return;
      this.#restoreSavedRange();
      this.#imageResize?.insertImageFile(file);
    });
  }

  #resolveUploadHandler() {
    if (this.#uploadHandler) return this.#uploadHandler;
    const uploadUrl = this.getAttribute("upload-url");
    if (!uploadUrl) return null;

    return async (file) => {
      const resp = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`Upload failed (${resp.status})${text ? `: ${text}` : ""}`);
      }
      const data = await resp.json();
      if (!data?.url) throw new Error("Upload endpoint did not return { url }");
      return data.url;
    };
  }

  #openLinkPopover() {
    if (!this.#squire) return;
    this.#savedRange = this.#squire.getSelection()?.cloneRange() || null;

    const existingHref = this.#findSelectedLinkHref();
    const form = this.#linkPopover.querySelector("[data-link-form]");
    const removeBtn = this.#linkPopover.querySelector("[data-remove-link]");
    form.elements.href.value = existingHref || "";
    removeBtn.hidden = !existingHref;

    this.#showPopoverNearButton(this.#linkPopover, this.#toolbar.querySelector('[data-cmd="link"]'));
    requestAnimationFrame(() => {
      form.elements.href.focus();
      form.elements.href.select();
    });
  }

  #openImagePopover() {
    if (!this.#squire) return;
    this.#savedRange = this.#squire.getSelection()?.cloneRange() || null;
    const form = this.#imagePopover.querySelector("[data-image-form]");
    form.reset();
    this.#showPopoverNearButton(this.#imagePopover, this.#toolbar.querySelector('[data-cmd="image"]'));
    requestAnimationFrame(() => form.elements.src.focus());
  }

  #findSelectedLinkHref() {
    const sel = this.#squire?.getSelection();
    if (!sel) return "";
    let node = sel.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    const anchor = node?.closest?.("a");
    return anchor && this.#surface.contains(anchor) ? anchor.getAttribute("href") || "" : "";
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

  #showPopoverNearButton(popoverEl, btnEl) {
    try {
      if (!popoverEl.matches(":popover-open")) popoverEl.showPopover();
    } catch {
      popoverEl.hidden = false;
    }
    if (!btnEl) return;
    const bRect = btnEl.getBoundingClientRect();
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

  #hidePopover(popoverEl) {
    try {
      if (popoverEl.matches(":popover-open")) popoverEl.hidePopover();
    } catch {
      popoverEl.hidden = true;
    }
  }

  #syncToolbar() {
    if (!this.#toolbar || !this.#squire) return;
    const active = getActiveState(this.#squire);
    for (const btn of this.#toolbar.querySelectorAll("button[data-cmd]")) {
      const cmd = btn.dataset.cmd;
      if (cmd in active) {
        btn.classList.toggle("is-active", active[cmd]);
        btn.setAttribute("aria-pressed", String(active[cmd]));
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

  #applyDisabled(disabled) {
    if (!this.#surface || !this.#toolbar) return;
    this.#surface.setAttribute("contenteditable", disabled ? "false" : "true");
    this.#root.classList.toggle("is-disabled", disabled);
    for (const btn of this.#toolbar.querySelectorAll("button")) {
      btn.disabled = disabled;
    }
    if (disabled) this.#imageResize?.deselect();
  }

  #buildDetail() {
    const text = this.getText();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const images = this.#surface?.querySelectorAll("img").length || 0;
    return {
      html: this.getHTML(),
      text,
      words,
      images,
      active: getActiveState(this.#squire),
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
      ext?.destroy?.();
    }
    this.#extensions = [];
    this.#imageResize = null;
    this.#bubbleMenu = null;
    this.#findReplace = null;
    this.#squire?.destroy();
    this.#squire = null;
    this.#mounted = false;
  }
}

if (!customElements.get("vanilla-editor")) {
  customElements.define("vanilla-editor", VanillaEditorElement);
}

function escapeAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

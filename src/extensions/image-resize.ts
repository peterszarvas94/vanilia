import type Squire from "squire-rte";
import { icon, type IconRenderer } from "../icons.js";
import { isSafeUrl } from "../sanitizer.js";
import { defaultTranslate, type Translate } from "../labels.js";

/**
 * Custom TipTap-style Image Resize, Alignment, Alt-Text & Upload extension for Squire.
 *
 * Keeps all selection handles, live dimension badge, and floating toolbar OUTSIDE
 * the `contenteditable` root so `getHTML()` stays 100% clean.
 */

const MIN_WIDTH = 48;
const HANDLES = [
  { pos: "nw", cursor: "nwse-resize" },
  { pos: "ne", cursor: "nesw-resize" },
  { pos: "se", cursor: "nwse-resize" },
  { pos: "sw", cursor: "nesw-resize" },
  { pos: "w", cursor: "ew-resize" },
  { pos: "e", cursor: "ew-resize" },
];

const WIDTH_PRESETS = ["25%", "50%", "75%", "100%"];

export type ImageAlign = "left" | "center" | "right";

/** Uploads an image file and resolves to its public URL. */
export type UploadHandler = (file: File) => Promise<string>;

export interface ImageResizeOptions {
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

export interface ImageResizeExtension {
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

interface DragState {
  handle: HTMLElement;
  pos: string;
  pointerId: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  maxWidth: number;
  ratio: number;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function createImageResizeExtension({
  squire,
  surface,
  overlayHost,
  editorToolbar,
  onChange,
  onSelectChange,
  getUploadHandler,
  onStatus,
  renderIcon = icon,
  t = defaultTranslate,
}: ImageResizeOptions): ImageResizeExtension {
  // Disable Squire's built-in DOM-polluting image resizer cleanly
  if (squire._imageResizer && typeof squire._imageResizer.destroy === "function") {
    squire._imageResizer.destroy();
  }

  let selectedImg: HTMLImageElement | null = null;
  let dragState: DragState | null = null;
  let altEditing = false;

  // Selection box & handles (inside overlayHost, outside contenteditable)
  const box = document.createElement("div");
  box.className = "ve-img-selection";
  box.hidden = true;

  const dimBadge = document.createElement("div");
  dimBadge.className = "ve-img-badge";
  dimBadge.hidden = true;
  box.appendChild(dimBadge);

  for (const { pos, cursor } of HANDLES) {
    const h = document.createElement("button");
    h.type = "button";
    h.tabIndex = -1;
    h.className = `ve-img-handle ve-img-handle--${pos}`;
    h.dataset.handle = pos;
    h.style.cursor = cursor;
    h.setAttribute("aria-label", t("resizeImage", { handle: pos }));
    h.addEventListener("pointerdown", onHandlePointerDown);
    h.addEventListener("touchstart", preventTouchScroll, { passive: false });
    box.appendChild(h);
  }
  overlayHost.appendChild(box);

  // Floating image toolbar (native Popover API, top-layer)
  const toolbar = document.createElement("div");
  toolbar.className = "ve-popover ve-img-toolbar";
  toolbar.setAttribute("popover", "manual");
  toolbar.setAttribute("role", "toolbar");
  toolbar.setAttribute("aria-label", t("imageOptions"));
  overlayHost.appendChild(toolbar);

  function renderToolbar() {
    if (!selectedImg) return;

    if (altEditing) {
      toolbar.innerHTML = `
        <form class="ve-img-alt-form">
          <input type="text" class="ve-input ve-input--sm" name="alt" placeholder="${escapeAttr(t("altInputPlaceholder"))}" value="${escapeAttr(selectedImg.getAttribute("alt") || "")}" />
          <button type="submit" class="ve-btn ve-btn--sm ve-btn--primary" title="${escapeAttr(t("saveAlt"))}">${renderIcon("check", 14)}</button>
          <button type="button" class="ve-btn ve-btn--sm" data-action="cancel-alt" title="${escapeAttr(t("cancel"))}">${renderIcon("x", 14)}</button>
        </form>
      `;
      const form = toolbar.querySelector("form")!;
      const input = form.querySelector("input")!;
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!selectedImg) return;
        squire.saveUndoState();
        const val = input.value.trim();
        if (val) selectedImg.setAttribute("alt", val);
        else selectedImg.removeAttribute("alt");
        altEditing = false;
        renderToolbar();
        positionOverlay();
        onChange?.();
      });
      toolbar.querySelector('[data-action="cancel-alt"]')!.addEventListener("click", () => {
        altEditing = false;
        renderToolbar();
        positionOverlay();
      });
      requestAnimationFrame(() => input.focus());
      return;
    }

    const currentAlign = selectedImg.getAttribute("data-align") || inferAlign(selectedImg);
    const currentStyleWidth = selectedImg.style.width || "";

    toolbar.innerHTML = `
      <div class="ve-btn-group" role="group" aria-label="${escapeAttr(t("imageWidth"))}">
        ${WIDTH_PRESETS.map(
          (w) => `
          <button type="button" class="ve-btn ve-btn--sm ve-btn--text ${currentStyleWidth === w ? "is-active" : ""}" data-width="${w}" title="${escapeAttr(t("widthPreset", { width: w }))}">${w}</button>
        `,
        ).join("")}
      </div>
      <span class="ve-sep"></span>
      <div class="ve-btn-group" role="group" aria-label="${escapeAttr(t("imageAlignment"))}">
        <button type="button" class="ve-btn ve-btn--sm ${currentAlign === "left" ? "is-active" : ""}" data-align="left" title="${escapeAttr(t("alignLeft"))}">${renderIcon("alignLeft", 14)}</button>
        <button type="button" class="ve-btn ve-btn--sm ${currentAlign === "center" ? "is-active" : ""}" data-align="center" title="${escapeAttr(t("alignCenter"))}">${renderIcon("alignCenter", 14)}</button>
        <button type="button" class="ve-btn ve-btn--sm ${currentAlign === "right" ? "is-active" : ""}" data-align="right" title="${escapeAttr(t("alignRight"))}">${renderIcon("alignRight", 14)}</button>
      </div>
      <span class="ve-sep"></span>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--text ${selectedImg.getAttribute("alt") ? "is-active" : ""}" data-action="edit-alt" title="${escapeAttr(t("editAlt"))}">${escapeAttr(t("altButton"))}</button>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--danger" data-action="delete" title="${escapeAttr(t("deleteImage"))}">${renderIcon("trash", 14)}</button>
    `;
  }

  toolbar.addEventListener("mousedown", (e) => {
    // Allow focusing the alt input, prevent stealing focus on buttons
    if ((e.target as Element).closest("input")) return;
    e.preventDefault();
  });

  toolbar.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest("button");
    if (!btn || !selectedImg) return;

    if (btn.dataset.width) {
      applyWidth(btn.dataset.width);
    } else if (btn.dataset.align) {
      applyAlignment(btn.dataset.align as ImageAlign);
    } else if (btn.dataset.action === "edit-alt") {
      altEditing = true;
      renderToolbar();
      positionOverlay();
    } else if (btn.dataset.action === "delete") {
      deleteSelectedImage();
    }
  });

  function inferAlign(img: HTMLImageElement): ImageAlign {
    if (img.style.marginLeft === "auto" && img.style.marginRight === "auto") return "center";
    if (img.style.marginLeft === "auto") return "right";
    return "left";
  }

  function applyWidth(widthValue: string) {
    if (!selectedImg) return;
    squire.saveUndoState();
    selectedImg.style.width = widthValue;
    selectedImg.style.height = "auto";
    selectedImg.removeAttribute("width");
    selectedImg.removeAttribute("height");
    renderToolbar();
    positionOverlay();
    onChange?.();
  }

  function applyAlignment(align: ImageAlign) {
    if (!selectedImg) return;
    squire.saveUndoState();
    selectedImg.setAttribute("data-align", align);
    selectedImg.style.display = "block";
    if (align === "center") {
      selectedImg.style.marginLeft = "auto";
      selectedImg.style.marginRight = "auto";
    } else if (align === "right") {
      selectedImg.style.marginLeft = "auto";
      selectedImg.style.marginRight = "0";
    } else {
      selectedImg.style.marginLeft = "0";
      selectedImg.style.marginRight = "auto";
    }
    renderToolbar();
    positionOverlay();
    onChange?.();
  }

  function deleteSelectedImage() {
    if (!selectedImg) return;
    const img = selectedImg;
    squire.saveUndoState();
    const parent = img.parentNode;
    deselect();
    img.remove();
    // Ensure empty paragraph still has a <br> sentinel
    if (
      parent instanceof Element &&
      parent !== surface &&
      !parent.textContent &&
      !parent.querySelector("img, br")
    ) {
      parent.appendChild(document.createElement("br"));
    }
    squire.focus();
    onChange?.();
  }

  function selectImage(img: HTMLImageElement) {
    if (!img || !surface.contains(img)) return;
    selectedImg = img;
    altEditing = false;
    box.hidden = false;
    renderToolbar();
    try {
      if (!toolbar.matches(":popover-open")) toolbar.showPopover();
    } catch {
      toolbar.hidden = false;
    }
    positionOverlay();
    requestAnimationFrame(() => {
      if (selectedImg) positionOverlay();
    });
    onSelectChange?.(selectedImg);
  }

  function deselect() {
    if (!selectedImg) return;
    endDrag({ commit: false });
    selectedImg = null;
    altEditing = false;
    box.hidden = true;
    dimBadge.hidden = true;
    try {
      if (toolbar.matches(":popover-open")) toolbar.hidePopover();
    } catch {
      toolbar.hidden = true;
    }
    onSelectChange?.(null);
  }

  function positionOverlay() {
    if (!selectedImg || !surface.contains(selectedImg)) {
      deselect();
      return;
    }
    const hostRect = overlayHost.getBoundingClientRect();
    const imgRect = selectedImg.getBoundingClientRect();

    box.style.top = `${imgRect.top - hostRect.top}px`;
    box.style.left = `${imgRect.left - hostRect.left}px`;
    box.style.width = `${imgRect.width}px`;
    box.style.height = `${imgRect.height}px`;

    // Position top-layer popover cleanly above image, below if near top edge, or clamped inside viewport
    const tbRect = toolbar.getBoundingClientRect();
    const gap = 8;
    const maxTop = Math.max(8, window.innerHeight - tbRect.height - 8);
    let top = imgRect.top - tbRect.height - gap;
    if (top < 8) {
      const below = imgRect.bottom + gap;
      top = below <= maxTop ? below : Math.max(8, Math.min(maxTop, imgRect.top + 8));
    } else if (top > maxTop) {
      top = maxTop;
    }
    let left = imgRect.left + imgRect.width / 2 - tbRect.width / 2;
    left = Math.max(8, Math.min(left, Math.max(8, window.innerWidth - tbRect.width - 8)));

    toolbar.style.top = `${Math.round(top)}px`;
    toolbar.style.left = `${Math.round(left)}px`;
  }

  function onHandlePointerDown(e: PointerEvent) {
    if (!selectedImg) return;
    e.preventDefault();
    e.stopPropagation();

    const handle = e.currentTarget as HTMLElement;
    const pos = handle.dataset.handle ?? "";
    const imgRect = selectedImg.getBoundingClientRect();
    const surfaceStyle = getComputedStyle(surface);
    const maxWidth = Math.max(
      MIN_WIDTH,
      surface.clientWidth -
        parseFloat(surfaceStyle.paddingLeft) -
        parseFloat(surfaceStyle.paddingRight),
    );
    const ratio =
      selectedImg.naturalWidth && selectedImg.naturalHeight
        ? selectedImg.naturalWidth / selectedImg.naturalHeight
        : imgRect.width / (imgRect.height || 1);

    // Record pre-resize state in Squire's undo stack so Ctrl+Z reverts the resize
    squire.saveUndoState();

    dragState = {
      handle,
      pos,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: imgRect.width,
      startHeight: imgRect.height,
      maxWidth,
      ratio,
    };

    overlayHost.classList.add("is-resizing");
    toolbar.style.visibility = "hidden";
    window.addEventListener("touchmove", preventTouchScroll, { passive: false });
    handle.setPointerCapture(e.pointerId);
    handle.addEventListener("pointermove", onHandlePointerMove);
    handle.addEventListener("pointerup", onHandlePointerUp);
    handle.addEventListener("pointercancel", onHandlePointerUp);

    dimBadge.hidden = false;
    updateBadge(imgRect.width, imgRect.height, maxWidth);
  }

  function onHandlePointerMove(e: PointerEvent) {
    if (!dragState || !selectedImg) return;
    e.preventDefault();
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const { pos, startWidth, startHeight, maxWidth, ratio } = dragState;

    let nextWidth = startWidth;
    if (pos.includes("e")) nextWidth = startWidth + dx;
    else if (pos.includes("w")) nextWidth = startWidth - dx;
    else if (pos === "s") nextWidth = (startHeight + dy) * ratio;
    else if (pos === "n") nextWidth = (startHeight - dy) * ratio;

    // Corner handles: respect whichever axis moved more noticeably
    if (pos === "se" || pos === "ne" || pos === "sw" || pos === "nw") {
      const xDelta = pos.includes("e") ? dx : -dx;
      const yDelta = pos.includes("s") ? dy : -dy;
      const wFromX = startWidth + xDelta;
      const wFromY = (startHeight + yDelta) * ratio;
      nextWidth = Math.abs(xDelta) >= Math.abs(yDelta * ratio) ? wFromX : wFromY;
    }

    nextWidth = Math.round(Math.max(MIN_WIDTH, Math.min(nextWidth, maxWidth)));
    const nextHeight = Math.round(nextWidth / ratio);

    selectedImg.style.width = `${nextWidth}px`;
    selectedImg.style.height = "auto";
    selectedImg.removeAttribute("width");
    selectedImg.removeAttribute("height");

    updateBadge(nextWidth, nextHeight, maxWidth);
    positionOverlay();
  }

  function preventTouchScroll(e: Event) {
    e.preventDefault();
  }

  function endDrag({ commit = true } = {}) {
    if (!dragState) return;
    const { handle, pointerId } = dragState;
    try {
      handle.releasePointerCapture(pointerId);
    } catch {
      // ignore if already released
    }
    handle.removeEventListener("pointermove", onHandlePointerMove);
    handle.removeEventListener("pointerup", onHandlePointerUp);
    handle.removeEventListener("pointercancel", onHandlePointerUp);
    window.removeEventListener("touchmove", preventTouchScroll);
    overlayHost.classList.remove("is-resizing");
    toolbar.style.visibility = "";
    dragState = null;
    dimBadge.hidden = true;
    if (commit) {
      renderToolbar();
      positionOverlay();
      onChange?.();
    }
  }

  function onHandlePointerUp() {
    endDrag({ commit: true });
  }

  function updateBadge(w: number, h: number, maxWidth: number) {
    const pct = Math.min(100, Math.round((w / maxWidth) * 100));
    dimBadge.textContent = t("imageSize", {
      width: Math.round(w),
      height: Math.round(h),
      percent: pct,
    });
  }

  // Click selection & outside dismissal
  function onSurfaceClick(e: MouseEvent) {
    const img = (e.target as Element).closest("img");
    if (img && surface.contains(img)) {
      e.preventDefault();
      selectImage(img);
    } else if (selectedImg) {
      deselect();
    }
  }

  function onDocPointerDown(e: PointerEvent) {
    if (!selectedImg) return;
    const path = e.composedPath();
    if (path.includes(selectedImg) || path.includes(box) || path.includes(toolbar)) return;
    // Keep image selected when clicking alignment controls in the main editor toolbar
    if (editorToolbar && path.includes(editorToolbar)) {
      const alignBtn = (e.target as Element | null)?.closest("button[data-cmd^=align]");
      if (alignBtn) return;
    }
    deselect();
  }

  function onDocKeyDown(e: KeyboardEvent) {
    if (!selectedImg || altEditing) return;
    if (e.key === "Escape") {
      e.preventDefault();
      deselect();
      squire.focus();
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      deleteSelectedImage();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const img = selectedImg;
      const range = document.createRange();
      if (e.key === "ArrowLeft") range.setStartBefore(img);
      else range.setStartAfter(img);
      range.collapse(true);
      deselect();
      squire.setSelection(range).focus();
    }
  }

  // Image upload / paste / drag-and-drop
  async function insertImageFile(file: File): Promise<HTMLImageElement | null> {
    if (!file || !file.type.startsWith("image/")) return null;
    onStatus?.(t("uploading", { name: file.name || "image" }));
    try {
      const uploader = getUploadHandler?.();
      const src = uploader ? await uploader(file) : await fileToDataUrl(file);
      if (!src || !isSafeUrl(src, "image")) {
        throw new Error("Image URL rejected by sanitizer");
      }
      const alt = (file.name || "").replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      const img = squire.insertImage(src, { alt, style: "width: 75%; height: auto;" });
      onStatus?.("");
      onChange?.();
      if (img) {
        const selectNow = () => selectImage(img);
        if (img.complete) requestAnimationFrame(selectNow);
        else img.addEventListener("load", selectNow, { once: true });
      }
      return img;
    } catch (err) {
      onStatus?.((err instanceof Error && err.message) || t("uploadFailed"));
      setTimeout(() => onStatus?.(""), 3000);
      return null;
    }
  }

  function insertImageUrl(url: string, alt = ""): HTMLImageElement | null {
    if (!isSafeUrl(url, "image")) return null;
    const img = squire.insertImage(url.trim(), {
      alt: alt.trim(),
      style: "width: 75%; height: auto;",
    });
    onChange?.();
    if (img) {
      const selectNow = () => selectImage(img);
      if (img.complete) requestAnimationFrame(selectNow);
      else img.addEventListener("load", selectNow, { once: true });
    }
    return img;
  }

  function onPasteImage(e: Event) {
    const items = (e as CustomEvent<{ clipboardData?: DataTransfer }>).detail?.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          void insertImageFile(file);
          return;
        }
      }
    }
  }

  function onDragOver(e: DragEvent) {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    e.preventDefault();
    surface.classList.add("ve-drag-over");
  }

  function onDragLeave(e: DragEvent) {
    if (!surface.contains(e.relatedTarget as Node | null)) {
      surface.classList.remove("ve-drag-over");
    }
  }

  function onDrop(e: DragEvent) {
    surface.classList.remove("ve-drag-over");
    const files = Array.from(e.dataTransfer?.files || []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (!files.length) return;
    e.preventDefault();
    e.stopPropagation();
    deselect();
    for (const file of files) {
      void insertImageFile(file);
    }
  }

  const onViewportChange = () => {
    if (selectedImg) positionOverlay();
  };

  const ro = new ResizeObserver(() => {
    if (selectedImg) positionOverlay();
  });
  ro.observe(surface);

  surface.addEventListener("click", onSurfaceClick);
  surface.addEventListener("dragover", onDragOver);
  surface.addEventListener("dragleave", onDragLeave);
  surface.addEventListener("drop", onDrop);
  squire.addEventListener("pasteImage", onPasteImage);
  document.addEventListener("pointerdown", onDocPointerDown, true);
  document.addEventListener("keydown", onDocKeyDown, true);
  window.addEventListener("scroll", onViewportChange, true);
  window.addEventListener("resize", onViewportChange);

  return {
    name: "imageResize",
    selectImage,
    deselect,
    applyAlignment,
    applyWidth,
    getAlignment: () =>
      selectedImg
        ? (selectedImg.getAttribute("data-align") as ImageAlign | null) || inferAlign(selectedImg)
        : null,
    insertImageFile,
    insertImageUrl,
    getSelectedImage: () => selectedImg,
    destroy() {
      deselect();
      ro.disconnect();
      surface.removeEventListener("click", onSurfaceClick);
      surface.removeEventListener("dragover", onDragOver);
      surface.removeEventListener("dragleave", onDragLeave);
      surface.removeEventListener("drop", onDrop);
      squire.removeEventListener("pasteImage", onPasteImage);
      document.removeEventListener("pointerdown", onDocPointerDown, true);
      document.removeEventListener("keydown", onDocKeyDown, true);
      window.removeEventListener("scroll", onViewportChange, true);
      window.removeEventListener("resize", onViewportChange);
      box.remove();
      toolbar.remove();
    },
  };
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

import { icon } from "../icons.js";
import { isSafeUrl } from "../sanitizer.js";

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

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
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
}) {
  // Disable Squire's built-in DOM-polluting image resizer cleanly
  if (squire._imageResizer && typeof squire._imageResizer.destroy === "function") {
    squire._imageResizer.destroy();
  }

  let selectedImg = null;
  let dragState = null;
  let altEditing = false;

  // Selection box & handles (inside overlayHost, outside contenteditable)
  const box = document.createElement("div");
  box.className = "ve-img-selection";
  box.hidden = true;

  const dimBadge = document.createElement("div");
  dimBadge.className = "ve-img-badge";
  dimBadge.hidden = true;
  box.appendChild(dimBadge);

  const handleEls = new Map();
  for (const { pos, cursor } of HANDLES) {
    const h = document.createElement("button");
    h.type = "button";
    h.tabIndex = -1;
    h.className = `ve-img-handle ve-img-handle--${pos}`;
    h.dataset.handle = pos;
    h.style.cursor = cursor;
    h.setAttribute("aria-label", `Resize image (${pos})`);
    h.addEventListener("pointerdown", onHandlePointerDown);
    h.addEventListener("touchstart", preventTouchScroll, { passive: false });
    box.appendChild(h);
    handleEls.set(pos, h);
  }
  overlayHost.appendChild(box);

  // Floating image toolbar (native Popover API, top-layer)
  const toolbar = document.createElement("div");
  toolbar.className = "ve-popover ve-img-toolbar";
  toolbar.setAttribute("popover", "manual");
  toolbar.setAttribute("role", "toolbar");
  toolbar.setAttribute("aria-label", "Image options");
  overlayHost.appendChild(toolbar);

  function renderToolbar() {
    if (!selectedImg) return;

    if (altEditing) {
      toolbar.innerHTML = `
        <form class="ve-img-alt-form">
          <input type="text" class="ve-input ve-input--sm" name="alt" placeholder="Describe this image..." value="${escapeAttr(selectedImg.getAttribute("alt") || "")}" />
          <button type="submit" class="ve-btn ve-btn--sm ve-btn--primary" title="Save alt text">${icon("check", 14)}</button>
          <button type="button" class="ve-btn ve-btn--sm" data-action="cancel-alt" title="Cancel">${icon("x", 14)}</button>
        </form>
      `;
      const form = toolbar.querySelector("form");
      const input = form.querySelector("input");
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
      toolbar.querySelector('[data-action="cancel-alt"]').addEventListener("click", () => {
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
      <div class="ve-btn-group" role="group" aria-label="Image width">
        ${WIDTH_PRESETS.map(
          (w) => `
          <button type="button" class="ve-btn ve-btn--sm ve-btn--text ${currentStyleWidth === w ? "is-active" : ""}" data-width="${w}" title="Width ${w}">${w}</button>
        `,
        ).join("")}
      </div>
      <span class="ve-sep"></span>
      <div class="ve-btn-group" role="group" aria-label="Image alignment">
        <button type="button" class="ve-btn ve-btn--sm ${currentAlign === "left" ? "is-active" : ""}" data-align="left" title="Align left">${icon("alignLeft", 14)}</button>
        <button type="button" class="ve-btn ve-btn--sm ${currentAlign === "center" ? "is-active" : ""}" data-align="center" title="Align center">${icon("alignCenter", 14)}</button>
        <button type="button" class="ve-btn ve-btn--sm ${currentAlign === "right" ? "is-active" : ""}" data-align="right" title="Align right">${icon("alignRight", 14)}</button>
      </div>
      <span class="ve-sep"></span>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--text ${selectedImg.getAttribute("alt") ? "is-active" : ""}" data-action="edit-alt" title="Edit alt text">Alt</button>
      <button type="button" class="ve-btn ve-btn--sm ve-btn--danger" data-action="delete" title="Delete image">${icon("trash", 14)}</button>
    `;
  }

  toolbar.addEventListener("mousedown", (e) => {
    // Allow focusing the alt input, prevent stealing focus on buttons
    if (e.target.closest("input")) return;
    e.preventDefault();
  });

  toolbar.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || !selectedImg) return;

    if (btn.dataset.width) {
      applyWidth(btn.dataset.width);
    } else if (btn.dataset.align) {
      applyAlignment(btn.dataset.align);
    } else if (btn.dataset.action === "edit-alt") {
      altEditing = true;
      renderToolbar();
      positionOverlay();
    } else if (btn.dataset.action === "delete") {
      deleteSelectedImage();
    }
  });

  function inferAlign(img) {
    if (img.style.marginLeft === "auto" && img.style.marginRight === "auto") return "center";
    if (img.style.marginLeft === "auto") return "right";
    return "left";
  }

  function applyWidth(widthValue) {
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

  function applyAlignment(align) {
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
    if (parent && parent !== surface && !parent.textContent && !parent.querySelector("img, br")) {
      parent.appendChild(document.createElement("br"));
    }
    squire.focus();
    onChange?.();
  }

  function selectImage(img) {
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

  function onHandlePointerDown(e) {
    if (!selectedImg) return;
    e.preventDefault();
    e.stopPropagation();

    const handle = e.currentTarget;
    const pos = handle.dataset.handle;
    const imgRect = selectedImg.getBoundingClientRect();
    const surfaceStyle = getComputedStyle(surface);
    const maxWidth = Math.max(
      MIN_WIDTH,
      surface.clientWidth - parseFloat(surfaceStyle.paddingLeft) - parseFloat(surfaceStyle.paddingRight),
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

  function onHandlePointerMove(e) {
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

  function preventTouchScroll(e) {
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

  function updateBadge(w, h, maxWidth) {
    const pct = Math.min(100, Math.round((w / maxWidth) * 100));
    dimBadge.textContent = `${Math.round(w)} × ${Math.round(h)} px · ${pct}%`;
  }

  // Click selection & outside dismissal
  function onSurfaceClick(e) {
    const img = e.target.closest("img");
    if (img && surface.contains(img)) {
      e.preventDefault();
      selectImage(img);
    } else if (selectedImg) {
      deselect();
    }
  }

  function onDocPointerDown(e) {
    if (!selectedImg) return;
    const path = e.composedPath ? e.composedPath() : [e.target];
    if (path.includes(selectedImg) || path.includes(box) || path.includes(toolbar)) return;
    // Keep image selected when clicking alignment controls in the main editor toolbar
    if (editorToolbar && path.includes(editorToolbar)) {
      const alignBtn = e.target?.closest?.("button[data-cmd^=align]");
      if (alignBtn) return;
    }
    deselect();
  }

  function onDocKeyDown(e) {
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
  async function insertImageFile(file) {
    if (!file || !file.type.startsWith("image/")) return null;
    onStatus?.(`Uploading ${file.name || "image"}...`);
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
      onStatus?.(err?.message || "Image upload failed");
      setTimeout(() => onStatus?.(""), 3000);
      return null;
    }
  }

  function insertImageUrl(url, alt = "") {
    if (!isSafeUrl(url, "image")) return null;
    const img = squire.insertImage(url.trim(), { alt: alt.trim(), style: "width: 75%; height: auto;" });
    onChange?.();
    if (img) {
      const selectNow = () => selectImage(img);
      if (img.complete) requestAnimationFrame(selectNow);
      else img.addEventListener("load", selectNow, { once: true });
    }
    return img;
  }

  function onPasteImage(e) {
    const items = e.detail?.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          insertImageFile(file);
          return;
        }
      }
    }
  }

  function onDragOver(e) {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    e.preventDefault();
    surface.classList.add("ve-drag-over");
  }

  function onDragLeave(e) {
    if (!surface.contains(e.relatedTarget)) {
      surface.classList.remove("ve-drag-over");
    }
  }

  function onDrop(e) {
    surface.classList.remove("ve-drag-over");
    const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    e.preventDefault();
    e.stopPropagation();
    deselect();
    for (const file of files) {
      insertImageFile(file);
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
    getAlignment: () => (selectedImg ? selectedImg.getAttribute("data-align") || inferAlign(selectedImg) : null),
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

function escapeAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

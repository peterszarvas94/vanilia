import "tabs";
import { highlightHTML } from "site";

// One shared output inspector for every stack; it never imports/registers the
// editor, so the classic script demo remains independent of the ES module build.
for (const demo of document.querySelectorAll("[data-demo]")) {
  const editor = demo.querySelector("vanilia-editor");
  const tabs = demo.querySelector("site-tabs");
  const panel = demo.querySelector("[data-output-panel]");
  const code = panel.querySelector("code");
  const status = panel.querySelector("[role=status]");
  let timer;
  let controller;
  let revision = 0;

  const update = async () => {
    clearTimeout(timer);
    controller?.abort();
    const current = ++revision;
    if (panel.hidden) return;
    const html = editor.value;
    code.innerHTML = highlightHTML(html);
    if (!html) {
      status.textContent = "The editor is empty.";
      return;
    }
    status.textContent = "Formatting…";
    controller = new AbortController();
    try {
      const response = await fetch(demo.dataset.formatUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: html,
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Formatting failed");
      const formatted = await response.text();
      if (current !== revision) return;
      code.innerHTML = highlightHTML(formatted);
      status.textContent = "Current editor HTML · formatted on the server";
    } catch (error) {
      if (error.name !== "AbortError" && current === revision) {
        status.textContent = "Showing current HTML; formatting is unavailable.";
      }
    }
  };
  editor.addEventListener("editorupdate", () => {
    clearTimeout(timer);
    // Invalidate pending responses immediately; edits may arrive during a fetch.
    revision++;
    controller?.abort();
    if (!panel.hidden) timer = setTimeout(update, 200);
  });
  tabs.addEventListener("tabchange", update);
  void customElements.whenDefined("vanilia-editor").then(update);
}

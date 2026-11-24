// demos/react.tsx
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "vanilia-editor";
function App({ initialHTML }) {
  const [html, setHTML] = useState(initialHTML);
  const [words, setWords] = useState(0);
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
    "vanilia-editor",
    {
      value: html,
      "upload-url": "/api/upload",
      oninput: (event) => setHTML(event.currentTarget.value),
      oneditorupdate: (event) => setWords(event.detail.words)
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setHTML(initialHTML) }, "Reset"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setHTML("<h2>Replaced</h2><p>Set from React state.</p>")
    },
    "Replace content"
  ), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setHTML("") }, "Clear"), /* @__PURE__ */ React.createElement("span", { className: "hint" }, words, " ", words === 1 ? "word" : "words", " \xB7 ", html.length, " characters in React state")));
}
var root = document.getElementById("react-root");
var seed = document.querySelector("#react-seed");
if (!root || !seed) throw new Error("The React demo needs its root and seed template.");
createRoot(root).render(/* @__PURE__ */ React.createElement(App, { initialHTML: seed.innerHTML.trim() }));

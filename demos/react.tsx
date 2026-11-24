import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "vanilia-editor";
import type { VaniliaEditorElement, VaniliaEditorDetail } from "vanilia-editor";

function App({ initialHTML }: { initialHTML: string }) {
  const [html, setHTML] = useState(initialHTML);
  const [words, setWords] = useState(0);

  return (
    <div>
      <vanilia-editor
        value={html}
        upload-url="/api/upload"
        oninput={(event) => setHTML(event.currentTarget.value)}
        oneditorupdate={(event) => setWords(event.detail.words)}
      />
      <div className="row">
        <button type="button" onClick={() => setHTML(initialHTML)}>
          Reset
        </button>
        <button
          type="button"
          onClick={() => setHTML("<h2>Replaced</h2><p>Set from React state.</p>")}
        >
          Replace content
        </button>
        <button type="button" onClick={() => setHTML("")}>
          Clear
        </button>
        <span className="hint">
          {words} {words === 1 ? "word" : "words"} · {html.length} characters in React state
        </span>
      </div>
    </div>
  );
}

const root = document.getElementById("react-root");
const seed = document.querySelector<HTMLTemplateElement>("#react-seed");
if (!root || !seed) throw new Error("The React demo needs its root and seed template.");

createRoot(root).render(<App initialHTML={seed.innerHTML.trim()} />);

// Teach React's JSX types about the editor's property and native custom events.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "vanilia-editor": React.HTMLAttributes<VaniliaEditorElement> & {
        value: string;
        "upload-url"?: string;
        oninput?: (event: Event & { currentTarget: VaniliaEditorElement }) => void;
        oneditorupdate?: (event: CustomEvent<VaniliaEditorDetail>) => void;
      };
    }
  }
}

// Go + Datastar playground: @formatHTML(html) pretty-prints the editor's HTML for the preview
import { formatHTML } from "vanilia-editor";
import { action } from "datastar";

action({ name: "formatHTML", apply: (_ctx, html) => formatHTML(html) });

import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: { "vanilia-editor": "src/index.ts" },
    // ES module for import maps and bundlers, plus a classic script that exposes window.Vanilia
    format: { esm: {}, iife: { dts: false } },
    globalName: "Vanilia",
    platform: "browser",
    // Bundle Squire's unminified build so the output stays readable
    alias: { "squire-rte": "squire-rte/dist/squire-raw.mjs" },
    deps: { onlyBundle: ["squire-rte"] },
    banner: "/*! Vanilia | includes Squire, MIT License, Copyright (c) 2011-2023 Neil Jenkins */",
    copy: [
      { from: "src/styles/editor.css", rename: "vanilia-editor.css" },
      { from: "node_modules/squire-rte/LICENSE", rename: "SQUIRE-LICENSE.txt" },
    ],
  },
  lint: {
    ignorePatterns: ["dist/**", "static/vendor/**"],
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {
    // templates/ are Go templates, not plain HTML
    ignorePatterns: ["dist/**", "static/vendor/**", "templates/**"],
  },
});

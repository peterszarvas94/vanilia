#!/usr/bin/env node
/**
 * Zero-dependency packer that combines the modular ES sources + vendored Squire
 * into two drop-in distribution files:
 *   - dist/vanilia-editor.js  (single self-contained ES module)
 *   - dist/vanilia-editor.css (single self-contained stylesheet with --ve-* CSS variables)
 *
 * Usage:
 *   node scripts/pack.mjs          # generate dist/ files
 *   node scripts/pack.mjs --check  # exit non-zero if dist/ is out of date
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST_DIR = path.join(ROOT, "dist");

const MODULES = [
  { file: "src/icons.js", exports: ["icon"] },
  {
    file: "src/sanitizer.js",
    exports: ["isSafeUrl", "sanitizeToDOMFragment", "normalizeExportHTML", "formatHTML"],
  },
  {
    file: "src/extensions/headings.js",
    exports: ["isHeadingActive", "setParagraph", "toggleHeading"],
  },
  {
    file: "src/extensions/formatting.js",
    exports: ["isActive", "getActiveState", "execCommand"],
  },
  {
    file: "src/extensions/image-resize.js",
    exports: ["createImageResizeExtension"],
  },
  {
    file: "src/extensions/bubble-menu.js",
    exports: ["createBubbleMenuExtension"],
  },
  {
    file: "src/extensions/find-replace.js",
    exports: ["createFindReplaceExtension"],
  },
  {
    file: "src/vanilia-editor.js",
    exports: ["VaniliaEditorElement"],
  },
];

function readUTF8(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function packSquire() {
  const raw = readUTF8("static/vendor/squire.mjs")
    .replace(/\r\n/g, "\n")
    .replace(/\n?\/\/# sourceMappingURL=.*$/m, "")
    .trim();

  const match = raw.match(/export\s*\{\s*([A-Za-z_$][\w$]*)\s+as\s+default\s*\};?\s*$/);
  if (!match) {
    throw new Error("Could not locate default export in static/vendor/squire.mjs");
  }
  const defaultIdent = match[1];
  const body = raw.slice(0, match.index).trimEnd();

  return [
    "// --- static/vendor/squire.mjs (MIT License, Fastmail) ---",
    'const Squire = typeof document !== "undefined" ? (() => {',
    body,
    `return ${defaultIdent};`,
    "})() : null;",
  ].join("\n");
}

function packModule({ file, exports: exportNames }) {
  let code = readUTF8(file).replace(/\r\n/g, "\n");

  // Strip top-level static ES imports (resolved via topological module closures)
  code = code.replace(/^import[\s\S]*?from\s+["'][^"']+["'];?\n?/gm, "");

  // Convert top-level named exports into local declarations
  code = code.replace(/^export\s+(?=(?:async\s+)?function\b|class\b|const\b|let\b|var\b)/gm, "");

  if (/^(?:import|export)\s/m.test(code)) {
    throw new Error(`Unexpected remaining import/export statement in ${file}`);
  }

  const bindings = exportNames.join(", ");
  return [
    `// --- ${file} ---`,
    `const { ${bindings} } = (() => {`,
    code.trim(),
    `  return { ${bindings} };`,
    "})();",
  ].join("\n");
}

function buildJS() {
  const header = [
    "/**",
    " * Vanilia (<vanilia-editor>) — single-file drop-in ES module.",
    " * Generated from src/ + static/vendor/squire.mjs via `node scripts/pack.mjs`.",
    " * Includes Fastmail Squire (MIT License, see static/vendor/SQUIRE-LICENSE.txt).",
    " */",
  ].join("\n");

  const footer = [
    "export {",
    "  VaniliaEditorElement,",
    "  sanitizeToDOMFragment,",
    "  normalizeExportHTML,",
    "  formatHTML,",
    "  isSafeUrl,",
    "  createImageResizeExtension,",
    "  createBubbleMenuExtension,",
    "  createFindReplaceExtension,",
    "};",
    "",
  ].join("\n");

  return [header, packSquire(), ...MODULES.map(packModule), footer].join("\n\n");
}

function buildCSS() {
  const header = [
    "/**",
    " * Vanilia (<vanilia-editor>) — standalone stylesheet.",
    " * Generated from src/styles/editor.css via `node scripts/pack.mjs`.",
    " * Customize via CSS variables (--ve-accent, --ve-bg, --ve-radius, --ve-min-height, etc.).",
    " */",
    "",
  ].join("\n");

  const css = readUTF8("src/styles/editor.css").replace(/\r\n/g, "\n");
  return header + css;
}

const outputs = [
  { path: path.join(DIST_DIR, "vanilia-editor.js"), content: buildJS() },
  { path: path.join(DIST_DIR, "vanilia-editor.css"), content: buildCSS() },
];

const checkOnly = process.argv.includes("--check");

if (checkOnly) {
  let stale = false;
  for (const out of outputs) {
    const existing = fs.existsSync(out.path) ? fs.readFileSync(out.path, "utf8") : null;
    if (existing !== out.content) {
      console.error(`Stale dist artifact: ${path.relative(ROOT, out.path)}`);
      stale = true;
    }
  }
  if (stale) {
    console.error("Run `node scripts/pack.mjs` to update dist/ files.");
    process.exit(1);
  }
  console.log("dist/ artifacts are up to date.");
} else {
  fs.mkdirSync(DIST_DIR, { recursive: true });
  for (const out of outputs) {
    fs.writeFileSync(out.path, out.content, "utf8");
    const kb = (Buffer.byteLength(out.content, "utf8") / 1024).toFixed(1);
    console.log(`Wrote ${path.relative(ROOT, out.path)} (${kb} KB)`);
  }
}

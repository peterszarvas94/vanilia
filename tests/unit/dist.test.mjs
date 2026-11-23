import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

// Node has no import map: stub the external "squire-rte" import (Squire is browser-only anyway)
const distSource = fs.readFileSync(path.join(ROOT, "dist/vanilia-editor.js"), "utf8");
const dist = await import(
  `data:text/javascript,${encodeURIComponent(distSource.replace('import Squire from "squire-rte";', "const Squire = null;"))}`
);

test("dist/ artifacts stay in sync with src/ and static/vendor/squire.mjs", () => {
  const out = execFileSync(process.execPath, [path.join(ROOT, "scripts/pack.mjs"), "--check"], {
    encoding: "utf8",
  });
  assert.match(out, /up to date/);
});

test("dist/vanilia-editor.js imports only squire-rte and exposes public API", () => {
  const imports = distSource.match(/^import\s.*$/gm) || [];
  assert.deepEqual(imports, ['import Squire from "squire-rte";']);
  assert.match(fs.readFileSync(path.join(ROOT, "dist/squire.mjs"), "utf8"), /export\s*\{\s*\w+ as default\s*\}/);

  assert.equal(typeof dist.VaniliaEditorElement, "function");
  assert.equal(typeof dist.isSafeUrl, "function");
  assert.equal(typeof dist.formatHTML, "function");
  assert.equal(typeof dist.sanitizeToDOMFragment, "function");
  assert.equal(typeof dist.normalizeExportHTML, "function");
  assert.equal(typeof dist.createImageResizeExtension, "function");
  assert.equal(typeof dist.createBubbleMenuExtension, "function");
  assert.equal(typeof dist.createFindReplaceExtension, "function");
  assert.equal(typeof dist.setIcons, "function");
  assert.ok(dist.ICON_NAMES.includes("bold"));

  assert.equal(dist.isSafeUrl("https://example.com", "link"), true);
  assert.equal(dist.isSafeUrl("javascript:alert(1)", "link"), false);
  assert.equal(dist.formatHTML("<h2>Hi</h2><p>World</p>"), "<h2>Hi</h2>\n<p>World</p>");
});

test("dist/vanilia-editor.css defines root --ve-* tokens inside @layer ve-tokens", () => {
  const css = fs.readFileSync(path.join(ROOT, "dist/vanilia-editor.css"), "utf8");
  assert.match(css, /@layer ve-tokens, ve-base, ve-chrome, ve-surface, ve-popovers;/);
  assert.match(css, /:root\s*\{[\s\S]*--ve-accent:/);
  assert.match(css, /vanilia-editor\s*\{/);
  assert.match(css, /--ve-min-height:/);
  assert.match(css, /--ve-max-height:/);
  assert.match(css, /--ve-padding-x:/);
  assert.match(css, /--ve-font-size:/);
});

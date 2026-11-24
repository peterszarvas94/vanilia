import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";

const read = (file: string) => readFileSync(new URL(`../dist/${file}`, import.meta.url), "utf8");

test("dist/vanilia-editor.js is one self-contained, readable module", () => {
  const js = read("vanilia-editor.js");
  expect(js).not.toMatch(/^import\s/m);
  expect(js).toMatch(/var Squire = class/);
  expect(js).toMatch(/customElements\.define\("vanilia-editor"/);
  for (const name of [
    "VaniliaEditorElement",
    "setIcons",
    "ICON_NAMES",
    "formatHTML",
    "isSafeUrl",
    "setLabels",
    "defineButton",
    "setTheme",
    "THEME_TOKENS",
    "DEFAULT_TOOLBAR",
    "setShortcuts",
    "DEFAULT_SHORTCUTS",
  ]) {
    expect(js).toMatch(new RegExp(`export \\{[^}]*\\b${name}\\b`));
  }
});

test("dist ships types, the stylesheet and Squire's license", () => {
  expect(read("vanilia-editor.d.ts")).toMatch(/declare class VaniliaEditorElement/);
  expect(read("vanilia-editor.css")).toMatch(
    /@layer ve-tokens, ve-base, ve-chrome, ve-surface, ve-popovers;/,
  );
  expect(read("SQUIRE-LICENSE.txt")).toMatch(/MIT License/);
});

test("dist/vanilia-editor.iife.js is a classic script exposing window.Vanilia", () => {
  const iife = read("vanilia-editor.iife.js");
  expect(iife).not.toMatch(/^\s*(import|export)\s/m);
  expect(iife).toMatch(/^var Vanilia = \(function\(exports\) \{/m);
  expect(iife).toMatch(/customElements\.define\("vanilia-editor"/);
  for (const name of [
    "VaniliaEditorElement",
    "setLabels",
    "defineButton",
    "setShortcuts",
    "setTheme",
  ]) {
    expect(iife).toMatch(new RegExp(`exports\\.${name} = `));
  }
});

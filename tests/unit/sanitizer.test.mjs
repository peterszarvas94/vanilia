import test from "node:test";
import assert from "node:assert/strict";
import { isSafeUrl, formatHTML } from "../../src/sanitizer.js";

test("isSafeUrl allows safe link protocols and blocks XSS schemes", () => {
  assert.equal(isSafeUrl("https://example.com", "link"), true);
  assert.equal(isSafeUrl("http://localhost:4173/docs", "link"), true);
  assert.equal(isSafeUrl("mailto:hi@example.com", "link"), true);
  assert.equal(isSafeUrl("/relative/path", "link"), true);
  assert.equal(isSafeUrl("#section-1", "link"), true);

  assert.equal(isSafeUrl("javascript:alert(1)", "link"), false);
  assert.equal(isSafeUrl("  JaVaScRiPt:alert(1)", "link"), false);
  assert.equal(isSafeUrl("vbscript:msgbox(1)", "link"), false);
  assert.equal(isSafeUrl("data:text/html,<script>alert(1)</script>", "link"), false);
  assert.equal(isSafeUrl("//evil.com/phish", "link"), false);
});

test("isSafeUrl validates image protocols strictly", () => {
  assert.equal(isSafeUrl("https://cdn.example.com/a.png", "image"), true);
  assert.equal(isSafeUrl("/uploads/123", "image"), true);
  assert.equal(isSafeUrl("blob:http://localhost:4173/abc", "image"), true);
  assert.equal(isSafeUrl("data:image/png;base64,iVBORw0KGgo=", "image"), true);
  assert.equal(isSafeUrl("data:image/svg+xml;base64,PHN2Zz4=", "image"), true);

  assert.equal(isSafeUrl("javascript:alert(1)", "image"), false);
  assert.equal(isSafeUrl("data:text/html;base64,PHNjcmlwdD4=", "image"), false);
});

test("formatHTML indents semantic block HTML cleanly", () => {
  const input = "<h2>Title</h2><p>Hello <strong>world</strong></p><ul><li>One</li><li>Two</li></ul>";
  const formatted = formatHTML(input);
  assert.equal(
    formatted,
    [
      "<h2>Title</h2>",
      "<p>Hello <strong>world</strong></p>",
      "<ul>",
      "  <li>One</li>",
      "  <li>Two</li>",
      "</ul>",
    ].join("\n"),
  );
});

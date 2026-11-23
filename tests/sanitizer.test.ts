import { expect, test } from "vite-plus/test";
import { formatHTML, isSafeUrl } from "../src/sanitizer.js";

test("isSafeUrl allows safe link protocols and blocks XSS schemes", () => {
  expect(isSafeUrl("https://example.com", "link")).toBe(true);
  expect(isSafeUrl("http://localhost:4173/docs", "link")).toBe(true);
  expect(isSafeUrl("mailto:hi@example.com", "link")).toBe(true);
  expect(isSafeUrl("/relative/path", "link")).toBe(true);
  expect(isSafeUrl("#section-1", "link")).toBe(true);

  expect(isSafeUrl("javascript:alert(1)", "link")).toBe(false);
  expect(isSafeUrl("  JaVaScRiPt:alert(1)", "link")).toBe(false);
  expect(isSafeUrl("java\u0000script:alert(1)", "link")).toBe(false);
  expect(isSafeUrl("vbscript:msgbox(1)", "link")).toBe(false);
  expect(isSafeUrl("data:text/html,<script>alert(1)</script>", "link")).toBe(false);
  expect(isSafeUrl("//evil.com/phish", "link")).toBe(false);
});

test("isSafeUrl validates image protocols strictly", () => {
  expect(isSafeUrl("https://cdn.example.com/a.png", "image")).toBe(true);
  expect(isSafeUrl("/uploads/123", "image")).toBe(true);
  expect(isSafeUrl("blob:http://localhost:4173/abc", "image")).toBe(true);
  expect(isSafeUrl("data:image/png;base64,iVBORw0KGgo=", "image")).toBe(true);
  expect(isSafeUrl("data:image/svg+xml;base64,PHN2Zz4=", "image")).toBe(true);

  expect(isSafeUrl("javascript:alert(1)", "image")).toBe(false);
  expect(isSafeUrl("data:text/html;base64,PHNjcmlwdD4=", "image")).toBe(false);
});

test("formatHTML indents semantic block HTML cleanly", () => {
  const input =
    "<h2>Title</h2><p>Hello <strong>world</strong></p><ul><li>One</li><li>Two</li></ul>";
  expect(formatHTML(input)).toBe(
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

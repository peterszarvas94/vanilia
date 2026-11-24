/**
 * Typed access to the `--ve-*` CSS custom properties. CSS stays the source of
 * truth: `setTheme()` and `editor.setTheme()` only write those properties.
 */

/** Theme tokens, camelCased: `accentContrast` is `--ve-accent-contrast`. */
export const THEME_TOKENS = Object.freeze([
  "accent",
  "accentContrast",
  "accentSoft",
  "accentRing",
  "accentBorder",
  "accentHover",
  "danger",
  "dangerSoft",
  "bg",
  "surfaceBg",
  "chromeBg",
  "popoverBg",
  "hoverBg",
  "codeBg",
  "shadow",
  "border",
  "borderStrong",
  "text",
  "textMuted",
  "radius",
  "radiusSm",
  "minHeight",
  "maxHeight",
  "paddingX",
  "paddingY",
  "fontSize",
  "lineHeight",
  "fontSans",
  "fontMono",
  "highlightBg",
  "highlightActiveBg",
  "highlightActiveText",
  "iconSize",
  "iconSizeSm",
  "iconStroke",
] as const);

/** Name of a theme token. */
export type ThemeToken = (typeof THEME_TOKENS)[number];

/** Token values (any CSS value). `null` or `""` removes an override. */
export type ThemeTokens = Partial<Record<ThemeToken, string | number | null | undefined>>;

/** Color scheme for the `theme` attribute. */
export type ColorScheme = "light" | "dark" | "auto";

const TOKEN_SET = new Set<string>(THEME_TOKENS);

/** The CSS custom property of a token: `tokenVar("accentSoft")` is `"--ve-accent-soft"`. */
export function tokenVar(token: ThemeToken): string {
  return `--ve-${token.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
}

/** Set or remove token properties on an element's inline style. */
export function applyTokens(style: CSSStyleDeclaration, tokens: ThemeTokens): void {
  for (const [token, value] of Object.entries(tokens)) {
    if (!TOKEN_SET.has(token)) {
      console.warn(`[vanilia-editor] unknown theme token "${token}"`);
      continue;
    }
    const prop = tokenVar(token as ThemeToken);
    if (value == null || value === "") style.removeProperty(prop);
    else style.setProperty(prop, String(value));
  }
}

let globalRule: CSSStyleRule | null = null;

/**
 * Set tokens for every editor on the page. Writes one unlayered `:root` rule, so it
 * beats the built-in defaults but loses to per-editor CSS and `editor.setTheme()`.
 *
 *   setTheme({ accent: "#e11d48", radius: "8px" });
 */
export function setTheme(tokens: ThemeTokens = {}): void {
  if (typeof document === "undefined") return;
  if (!globalRule) {
    const style = document.createElement("style");
    style.dataset.vaniliaTheme = "";
    style.textContent = ":root {}";
    document.head.append(style);
    globalRule = style.sheet!.cssRules[0] as CSSStyleRule;
  }
  applyTokens(globalRule.style, tokens);
}

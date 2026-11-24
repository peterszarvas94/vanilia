package main

import (
	"html/template"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/microcosm-cc/bluemonday"
)

var (
	templates      *template.Template
	sanitizePolicy *bluemonday.Policy
)

func init() {
	p := bluemonday.NewPolicy()
	p.AllowStandardURLs()
	p.AllowRelativeURLs(true)
	p.AllowElements(
		"p", "div", "br", "hr",
		"h1", "h2", "h3", "h4", "h5", "h6",
		"blockquote", "pre", "code",
		"ul", "ol", "li",
		"b", "strong", "i", "em", "u", "s", "del", "sub", "sup", "mark", "span",
		"a", "img", "figure", "figcaption",
		"table", "thead", "tbody", "tfoot", "tr", "th", "td",
	)
	p.AllowAttrs("dir").Matching(regexp.MustCompile(`^(ltr|rtl|auto)$`)).Globally()
	p.AllowAttrs("class").Matching(regexp.MustCompile(`^align-(left|center|right|justify)$`)).Globally()
	p.AllowAttrs("href", "title").OnElements("a")
	p.AllowAttrs("target").Matching(regexp.MustCompile(`^_blank$`)).OnElements("a")
	p.AllowAttrs("rel").Matching(regexp.MustCompile(`^noopener noreferrer$`)).OnElements("a")
	p.AllowAttrs("src", "alt", "title").OnElements("img")
	p.AllowAttrs("data-align").Matching(regexp.MustCompile(`^(left|center|right)$`)).OnElements("img")
	p.AllowAttrs("width", "height").Matching(regexp.MustCompile(`^\d+(\.\d+)?(%|px)?$`)).OnElements("img")
	p.AllowAttrs("colspan", "rowspan").Matching(regexp.MustCompile(`^\d+$`)).OnElements("td", "th")
	p.AllowAttrs("start").Matching(regexp.MustCompile(`^\d+$`)).OnElements("ol")

	// Allow safe inline presentation styles used by alignment and image resizing
	p.AllowStyles("width", "max-width", "height").
		Matching(regexp.MustCompile(`^(auto|\d+(\.\d+)?(%|px))$`)).
		OnElements("img")
	p.AllowStyles("display").
		Matching(regexp.MustCompile(`^(block|inline-block)$`)).
		OnElements("img")
	p.AllowStyles("margin-left", "margin-right").
		Matching(regexp.MustCompile(`^(0(px)?|auto)$`)).
		OnElements("img")
	p.AllowStyles("text-align").
		Matching(regexp.MustCompile(`^(left|center|right|justify)$`)).
		Globally()

	sanitizePolicy = p
}

// mustLoadTemplates parses the page templates in dir and the docs pages in dir/docs.
// Asset files are looked up next to the templates directory.
func mustLoadTemplates(dir string) {
	assetRoot = filepath.Dir(filepath.Clean(dir))
	templates = template.Must(template.New("").Funcs(assetFuncs).ParseGlob(filepath.Join(dir, "*.html")))
	templates = template.Must(templates.ParseGlob(filepath.Join(dir, "docs", "*.html")))
}

func sanitizeEditorHTML(raw string) string {
	cleaned := strings.TrimSpace(sanitizePolicy.Sanitize(raw))
	cleaned = strings.TrimSuffix(cleaned, "<p><br></p>")
	cleaned = strings.TrimSuffix(cleaned, "<p></p>")
	return strings.TrimSpace(cleaned)
}

func normalizeBasePath(basePath string) string {
	trimmed := strings.TrimSpace(basePath)
	if trimmed == "" || trimmed == "/" {
		return ""
	}
	trimmed = strings.TrimSuffix(trimmed, "/")
	if !strings.HasPrefix(trimmed, "/") {
		trimmed = "/" + trimmed
	}
	return trimmed
}

func renderTemplate(c echo.Context, templateName string, data any) error {
	c.Response().Header().Set(echo.HeaderContentType, echo.MIMETextHTMLCharsetUTF8)
	return templates.ExecuteTemplate(c.Response().Writer, templateName, data)
}

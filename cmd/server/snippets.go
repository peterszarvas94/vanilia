package main

import (
	"bytes"
	"encoding/json"
	"go/format"
	"io"
	"net/http"
	"regexp"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/yosssi/gohtml"
	"golang.org/x/net/html"
)

// Formatting is read-only. Return text, never executable markup, to the inspector.
func formatHTMLPost(c echo.Context) error {
	raw, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return err
	}
	return c.String(http.StatusOK, formatHTMLSnippet(string(raw)))
}

var goSnippet = regexp.MustCompile(`(?m)^(package |func |type [A-Za-z_][A-Za-z_0-9]* (struct|interface))`)

var voidTags = map[string]bool{
	"area": true, "base": true, "br": true, "col": true, "embed": true,
	"hr": true, "img": true, "input": true, "link": true, "meta": true,
	"param": true, "source": true, "track": true, "wbr": true,
}

// gohtml expects explicit self-closing void tags. Normalize those tokens for
// its parser, then restore their original spelling in the formatted source.
// Tokenizing keeps quoted > characters and script/style text intact.
func formatHTMLSnippet(source string) string {
	originals := map[string]string{}
	blocks := map[string]string{}
	marker := "VANILIA_SNIPPET_BLOCK"
	for strings.Contains(source, marker) {
		marker += "_"
	}
	var normalized strings.Builder
	tokens := html.NewTokenizer(strings.NewReader(source))
	for kind := tokens.Next(); kind != html.ErrorToken; kind = tokens.Next() {
		raw := string(tokens.Raw())
		if kind == html.StartTagToken {
			token := tokens.Token()
			if snippetLiteral(token) {
				var block strings.Builder
				block.WriteString(raw)
				depth := 1
				for depth > 0 {
					next := tokens.Next()
					if next == html.ErrorToken {
						return source
					}
					block.Write(tokens.Raw())
					name, _ := tokens.TagName()
					if string(name) == token.Data {
						if next == html.StartTagToken {
							depth++
						} else if next == html.EndTagToken {
							depth--
						}
					}
				}
				placeholder := "<div>" + marker + strings.Repeat("_", len(blocks)+1) + "</div>"
				blocks[placeholder] = block.String()
				normalized.WriteString(placeholder)
				continue
			}
			if voidTags[token.Data] {
				closed := strings.TrimSuffix(raw, ">") + "/>"
				originals[closed] = raw
				raw = closed
			}
		}
		normalized.WriteString(raw)
	}
	var result strings.Builder
	formatted := gohtml.Format(normalized.String())
	for placeholder, block := range blocks {
		formatted = strings.ReplaceAll(formatted, placeholder, block)
	}
	tokens = html.NewTokenizer(strings.NewReader(formatted))
	for kind := tokens.Next(); kind != html.ErrorToken; kind = tokens.Next() {
		raw := string(tokens.Raw())
		if original, ok := originals[raw]; kind == html.SelfClosingTagToken && ok {
			raw = original
		}
		result.WriteString(raw)
	}
	return strings.TrimSpace(result.String())
}

func snippetLiteral(token html.Token) bool {
	switch token.Data {
	case "pre", "textarea", "script", "style":
		return true
	case "template":
		for _, attr := range token.Attr {
			if attr.Key == "data-ve-shortcuts" || attr.Key == "data-ve-labels" {
				return true
			}
		}
	}
	return false
}

func init() {
	// Configure once before serving requests; gohtml's settings are global.
	gohtml.Condense = true
	gohtml.InlineTagMaxLength = int(^uint(0) >> 1)
	for _, tag := range strings.Fields("abbr b bdi bdo br cite del dfn i img input kbd label mark q s samp small sub sup time u var wbr") {
		gohtml.InlineTags[tag] = true
	}
}

// formatSnippet only changes displayed source. Never format the live editor's
// HTML: whitespace in inline text, code blocks and script strings is content.
// Keep this a string so html/template still escapes the result inside <code>.
func formatSnippet(source string) string {
	source = strings.TrimSpace(source)
	if strings.HasPrefix(source, "<") {
		return formatHTMLSnippet(source)
	}
	if json.Valid([]byte(source)) {
		var out bytes.Buffer
		if err := json.Indent(&out, []byte(source), "", "  "); err == nil {
			return out.String()
		}
	}
	if goSnippet.MatchString(source) {
		if formatted, err := format.Source([]byte(source)); err == nil {
			return strings.TrimSpace(string(formatted))
		}
	}
	// JavaScript, shell and incomplete examples keep their authored whitespace.
	return source
}

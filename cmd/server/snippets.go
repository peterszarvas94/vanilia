package main

import (
	"bytes"
	"encoding/json"
	"go/format"
	"regexp"
	"strings"

	"github.com/yosssi/gohtml"
	"golang.org/x/net/html"
)

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
	var normalized strings.Builder
	tokens := html.NewTokenizer(strings.NewReader(source))
	for kind := tokens.Next(); kind != html.ErrorToken; kind = tokens.Next() {
		raw := string(tokens.Raw())
		if kind == html.StartTagToken {
			name, _ := tokens.TagName()
			if voidTags[string(name)] {
				closed := strings.TrimSuffix(raw, ">") + "/>"
				originals[closed] = raw
				raw = closed
			}
		}
		normalized.WriteString(raw)
	}
	var result strings.Builder
	tokens = html.NewTokenizer(strings.NewReader(gohtml.Format(normalized.String())))
	for kind := tokens.Next(); kind != html.ErrorToken; kind = tokens.Next() {
		raw := string(tokens.Raw())
		if original, ok := originals[raw]; kind == html.SelfClosingTagToken && ok {
			raw = original
		}
		result.WriteString(raw)
	}
	return strings.TrimSpace(result.String())
}

func init() {
	// Configure once before serving requests; gohtml's settings are global.
	gohtml.Condense = true
	gohtml.InlineTagMaxLength = int(^uint(0) >> 1)
	for _, tag := range strings.Fields("abbr b bdi bdo br cite del dfn i img input kbd label mark q s samp small sub sup time u var wbr") {
		gohtml.InlineTags[tag] = true
	}
	gohtml.IsPreformatted = func(token html.Token) bool {
		switch token.Data {
		case "pre", "textarea", "script", "style":
			return true
		}
		return false
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

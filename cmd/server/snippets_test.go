package main

import (
	"strings"
	"testing"
)

func TestFormatSnippetNestedHTML(t *testing.T) {
	source := `<div x-data="{ html: '' }">
  <template x-ref="seed">
    <h1>Title</h1>
<p>H<sub>2</sub>O and <strong>bold</strong>.</p>
<p><img src="/image.svg" alt="a > b"><br></p><hr>
<ul><li>One<ul><li>Two<ol><li>Three</li></ol></li></ul></li></ul>
  </template>
</div>`
	formatted := formatSnippet(source)
	for _, want := range []string{
		"\n    <h1>Title</h1>\n",
		"\n    <p>H<sub>2</sub>O and <strong>bold</strong>.</p>\n",
		"\n    <ul>\n",
		"\n              <li>Three</li>\n",
		"\n  </template>\n</div>",
	} {
		if !strings.Contains(formatted, want) {
			t.Errorf("missing %q in:\n%s", want, formatted)
		}
	}
	if again := formatSnippet(formatted); again != formatted {
		t.Errorf("formatting is not stable:\n%s", again)
	}
}

func TestFormatSnippetPreservesLiteralContent(t *testing.T) {
	for _, source := range []string{
		"<pre><code>first\n  second &lt;tag&gt;\n\tthird</code></pre>",
		"<textarea>first\n  second</textarea>",
		"<script>\nconst example = `first\n  second < third`;\n</script>",
		"<style>\n.x::before { content: 'a  b'; }\n</style>",
		`<p><a href="/a?x=1&amp;y=2" data-value="a > b">A</a><em>B</em></p>`,
	} {
		if got := formatSnippet(source); got != source {
			t.Errorf("literal content changed:\nwant %s\ngot  %s", source, got)
		}
	}
}

func TestFormatSnippetLanguages(t *testing.T) {
	if got := formatSnippet("func example(){\nreturn\n}"); got != "func example() {\n\treturn\n}" {
		t.Errorf("Go was not formatted: %q", got)
	}
	if got := formatSnippet(`{"imports":{"editor":"/dist/editor.js"}}`); got != "{\n  \"imports\": {\n    \"editor\": \"/dist/editor.js\"\n  }\n}" {
		t.Errorf("JSON was not formatted: %q", got)
	}
	const js = "const example = `first\n  second`;"
	if got := formatSnippet(js); got != js {
		t.Errorf("JavaScript literal changed: %q", got)
	}
}

func TestFormatSnippetLiteralBlocksHaveSeparateLines(t *testing.T) {
	const source = "<vanilia-editor><template data-ve-shortcuts>\n    {\n      \"find\": []\n    }\n  </template></vanilia-editor><pre id=\"output\"></pre><script>\n  const text = `a\n  b`;\n</script>"
	got := formatSnippet(source)
	for _, want := range []string{
		"\n  <template data-ve-shortcuts>\n    {\n      \"find\": []\n    }\n  </template>\n",
		"</vanilia-editor>\n<pre id=\"output\"></pre>\n<script>\n  const text = `a\n  b`;\n</script>",
	} {
		if !strings.Contains(got, want) {
			t.Errorf("missing %q in:\n%s", want, got)
		}
	}
}

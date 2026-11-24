package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestPagesRender(t *testing.T) {
	mustLoadTemplates("../../templates")
	mustLoadExamples("../../templates/examples")
	e := newServer("", newUploadStore())

	pages := map[string]string{
		"/":                   "A rich text editor",
		"/docs/install":       `<h2 id="script-tag">Script tag</h2>`,
		"/docs/labels":        `data-ve-labels`,
		"/docs/exports":       `defineButton(button)`,
		"/examples/basic":     `id="basic"`,
		"/examples/toolbar":   `href="/demos">Demos`,
		"/examples/labels":    `id=&#34;labels-editor&#34;`,
		"/examples/shortcuts": `id=&#34;shortcuts-editor&#34;`,
		"/examples/headless":  `id=&#34;headless-editor&#34;`,
		"/demos/script-tag":   `<script src="/dist/vanilia-editor.iife.js?v=`,
		"/demos/datastar":     `data-panel="code"`,
		"/demos/htmx":         `import "htmx.org";`,
		"/demos/alpine":       `import "alpine";`,
		"/docs/shortcuts":     `data-ve-shortcuts`,
		"/docs/squire":        `class="badge badge--squire"`,
		"/docs/sanitize":      `bluemonday.NewPolicy()`,
		"/docs/browsers":      `aria-current="page">Browser support`,
	}
	for path, want := range pages {
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
		body := rec.Body.String()
		if rec.Code != http.StatusOK {
			t.Errorf("GET %s status = %d, want 200", path, rec.Code)
		}
		if !strings.Contains(body, want) || !strings.HasSuffix(strings.TrimSpace(body), "</html>") {
			t.Errorf("GET %s rendered incompletely (missing %q or </html>)", path, want)
		}
	}
}

func TestSectionIndexesRedirect(t *testing.T) {
	mustLoadTemplates("../../templates")
	mustLoadExamples("../../templates/examples")
	e := newServer("", newUploadStore())

	for path, want := range map[string]string{
		"/docs":                "/docs/install",
		"/examples":            "/examples/basic",
		"/examples/datastar":   "/demos/datastar",
		"/examples/htmx":       "/demos/htmx",
		"/examples/alpine":     "/demos/alpine",
		"/examples/script-tag": "/demos/script-tag",
		"/demos":               "/demos/script-tag",
		"/demo":                "/demos",
	} {
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
		if rec.Code != http.StatusFound || rec.Header().Get("Location") != want {
			t.Errorf("GET %s = %d %q, want redirect to %s", path, rec.Code, rec.Header().Get("Location"), want)
		}
	}
	for _, path := range []string{"/docs/nope", "/examples/nope", "/demos/nope", "/demos/basic", "/demos/playground"} {
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
		if rec.Code != http.StatusNotFound {
			t.Errorf("GET %s = %d, want 404", path, rec.Code)
		}
	}
}

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
	e := newServer("", newContentStore(10, buildSeedContent("")), newUploadStore())

	pages := map[string]string{
		"/":                  "A rich text editor",
		"/docs/install":      `<h2 id="script-tag">Script tag</h2>`,
		"/docs/labels":       `data-ve-labels`,
		"/docs/exports":      `defineButton(button)`,
		"/demos/toolbar":     "<vanilia-editor\n  id=\"toolbar-editor\"",
		"/demos/labels":      `<vanilia-editor id="labels-editor"`,
		"/demos/shortcuts":   `<vanilia-editor id="shortcuts-editor"`,
		"/demos/script-tag":  `<script src="/dist/vanilia-editor.iife.js?v=`,
		"/demos/htmx":        `import "htmx.org";`,
		"/examples/toolbar":  `href="/demos/toolbar">Interactive demo`,
		"/docs/shortcuts":    `data-ve-shortcuts`,
		"/docs/squire":       `class="badge badge--squire"`,
		"/docs/sanitize":     `bluemonday.NewPolicy()`,
		"/docs/browsers":     `aria-current="page">Browser support`,
		"/examples/basic":    `id="basic"`,
		"/examples/headless": `id=&#34;headless-editor&#34;`,
		"/demos/playground":  `id="rendered-preview"`,
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
	e := newServer("", newContentStore(10, buildSeedContent("")), newUploadStore())

	for path, want := range map[string]string{"/docs": "/docs/install", "/examples": "/examples/basic", "/demos": "/demos/script-tag", "/demo": "/demos/playground"} {
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
		if rec.Code != http.StatusFound || rec.Header().Get("Location") != want {
			t.Errorf("GET %s = %d %q, want redirect to %s", path, rec.Code, rec.Header().Get("Location"), want)
		}
	}
	for _, path := range []string{"/docs/nope", "/examples/nope", "/demos/nope"} {
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
		if rec.Code != http.StatusNotFound {
			t.Errorf("GET %s = %d, want 404", path, rec.Code)
		}
	}
}

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
		"/docs/install":      `Option A: link the hosted files`,
		"/docs/sanitize":     `bluemonday.NewPolicy()`,
		"/docs/browsers":     `aria-current="page">Browser support`,
		"/examples/basic":    `id="basic"`,
		"/examples/headless": `id="headless-editor"`,
		"/demo":              `id="rendered-preview"`,
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

	for path, want := range map[string]string{"/docs": "/docs/install", "/examples": "/examples/basic"} {
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
		if rec.Code != http.StatusFound || rec.Header().Get("Location") != want {
			t.Errorf("GET %s = %d %q, want redirect to %s", path, rec.Code, rec.Header().Get("Location"), want)
		}
	}
	for _, path := range []string{"/docs/nope", "/examples/nope"} {
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
		if rec.Code != http.StatusNotFound {
			t.Errorf("GET %s = %d, want 404", path, rec.Code)
		}
	}
}

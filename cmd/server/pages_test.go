package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestPagesRender(t *testing.T) {
	mustLoadTemplates("../../templates/*.html")
	mustLoadExamples("../../templates/examples")
	e := newServer("", newContentStore(10, buildSeedContent("")), newUploadStore())

	pages := map[string]string{
		"/":         "A rich text editor",
		"/docs":     `id="sanitize"`,
		"/examples": `id="headless-editor"`,
		"/demo":     `id="rendered-preview"`,
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

package main

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

func TestExamplesPageIntegrations(t *testing.T) {
	mustLoadTemplates("../../templates/*.html")
	mustLoadExamples("../../templates/examples")
	e := newServer("", newContentStore(10, buildSeedContent("")), newUploadStore())

	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/examples", nil))
	body := rec.Body.String()
	for _, want := range []string{
		"<h2>Integrations</h2>",
		`id="datastar"`, `id="htmx"`, `id="alpine"`,
		"func saveDatastarPost", "func saveHtmxPost",
		`import "htmx.org";`, `import "alpine";`,
	} {
		if !strings.Contains(body, want) {
			t.Errorf("GET /examples is missing %q", want)
		}
	}

	for _, ex := range examples {
		if strings.Contains(ex.Server, "endregion") {
			t.Errorf("%s: server region not extracted cleanly", ex.Slug)
		}
	}
}

func TestIntegrationSaveHandlersSanitize(t *testing.T) {
	mustLoadTemplates("../../templates/*.html")
	mustLoadExamples("../../templates/examples")
	e := newServer("", newContentStore(10, buildSeedContent("")), newUploadStore())
	dirty := `<p>Hi <script>alert(1)</script><a href="javascript:x">link</a></p>`

	form := url.Values{"body": {dirty}}
	req := httptest.NewRequest(http.MethodPost, "/api/htmx/save", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if got := rec.Body.String(); rec.Code != http.StatusOK || strings.Contains(got, "script") || strings.Contains(got, "javascript:") || !strings.Contains(got, "Hi") {
		t.Errorf("htmx save = %d %q", rec.Code, got)
	}

	req = httptest.NewRequest(http.MethodPost, "/api/datastar/save", strings.NewReader(`{"body":"<p>Hi <img src=x onerror=alert(1)></p>"}`))
	req.Header.Set("Content-Type", "application/json")
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	got := rec.Body.String()
	if rec.Code != http.StatusOK || strings.Contains(got, "onerror") || !strings.Contains(got, `id="datastar-output"`) || !strings.Contains(got, "savedAt") {
		t.Errorf("datastar save = %d %q", rec.Code, got)
	}
}

package main

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

func newTestServer(t *testing.T) http.Handler {
	t.Helper()
	mustLoadTemplates("../../templates/*.html")
	mustLoadExamples("../../templates/examples")
	mustLoadIntegrations("../../templates/integrations")
	return newServer("", newContentStore(10, buildSeedContent("")), newUploadStore())
}

func TestIntegrationPages(t *testing.T) {
	e := newTestServer(t)
	pages := map[string]string{
		"/integrations":          `href="/integrations/htmx"`,
		"/integrations/datastar": "func saveDatastarPost",
		"/integrations/htmx":     `hx-post="/integrations/htmx/save"`,
		"/integrations/alpine":   `x-model="html"`,
	}
	for path, want := range pages {
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
		body := rec.Body.String()
		if rec.Code != http.StatusOK || !strings.Contains(body, want) || !strings.HasSuffix(strings.TrimSpace(body), "</html>") {
			t.Errorf("GET %s = %d, want 200 with %q and a complete page", path, rec.Code, want)
		}
	}

	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/integrations/nope", nil))
	if rec.Code != http.StatusNotFound {
		t.Errorf("GET /integrations/nope = %d, want 404", rec.Code)
	}
}

func TestIntegrationServerRegions(t *testing.T) {
	newTestServer(t)
	for _, in := range integrations {
		if in.Slug == "alpine" {
			continue // client-side only
		}
		if !strings.Contains(in.Server, "func save") || strings.Contains(in.Server, "endregion") {
			t.Errorf("%s: server region not extracted cleanly: %q", in.Slug, in.Server)
		}
	}
}

func TestIntegrationSaveHandlersSanitize(t *testing.T) {
	e := newTestServer(t)
	dirty := `<p>Hi <script>alert(1)</script><a href="javascript:x">link</a></p>`

	form := url.Values{"body": {dirty}}
	req := httptest.NewRequest(http.MethodPost, "/integrations/htmx/save", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if got := rec.Body.String(); rec.Code != http.StatusOK || strings.Contains(got, "script") || strings.Contains(got, "javascript:") || !strings.Contains(got, "Hi") {
		t.Errorf("htmx save = %d %q", rec.Code, got)
	}

	req = httptest.NewRequest(http.MethodPost, "/integrations/datastar/save", strings.NewReader(`{"body":"<p>Hi <img src=x onerror=alert(1)></p>"}`))
	req.Header.Set("Content-Type", "application/json")
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	got := rec.Body.String()
	if rec.Code != http.StatusOK || strings.Contains(got, "onerror") || !strings.Contains(got, `id="datastar-output"`) || !strings.Contains(got, "savedAt") {
		t.Errorf("datastar save = %d %q", rec.Code, got)
	}
}

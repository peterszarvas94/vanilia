package main

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

func TestExamplesPageIntegrations(t *testing.T) {
	mustLoadTemplates("../../templates")
	mustLoadExamples("../../templates/examples")
	e := newServer("", newContentStore(10, buildSeedContent("")), newUploadStore())

	for slug, wants := range map[string][]string{
		"datastar": {`id="datastar"`, "func saveDatastarPost"},
		"htmx":     {`id="htmx"`, "func saveHtmxPost", `href="../docs/sanitize"`},
		"alpine":   {`id="alpine"`},
	} {
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/examples/"+slug, nil))
		body := rec.Body.String()
		wants = append(wants, "<h2>Integrations</h2>", `import "htmx.org";`, `import "alpine";`)
		for _, want := range wants {
			if !strings.Contains(body, want) {
				t.Errorf("GET /examples/%s is missing %q", slug, want)
			}
		}
	}

	for _, ex := range examples {
		if strings.Contains(ex.Server, "endregion") {
			t.Errorf("%s: server region not extracted cleanly", ex.Slug)
		}
	}
}

func TestIntegrationSaveHandlersSanitize(t *testing.T) {
	mustLoadTemplates("../../templates")
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

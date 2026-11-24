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

	get := func(path string) string {
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
		if rec.Code != http.StatusOK {
			t.Errorf("GET %s status = %d", path, rec.Code)
		}
		return rec.Body.String()
	}

	// Example pages: code, server code and notes, with a link to the demo, but no live markup or stack modules
	for slug, wants := range map[string][]string{
		"datastar": {"func saveDatastarPost", `href="/demos/playground"`},
		"htmx":     {"func saveHtmxPost", `href="../docs/sanitize"`},
		"alpine":   {`x-model`},
	} {
		body := get("/examples/" + slug)
		wants = append(wants, "<h2>Stacks</h2>", `href="/demos/`+slug+`">Interactive demo`)
		for _, want := range wants {
			if !strings.Contains(body, want) {
				t.Errorf("GET /examples/%s is missing %q", slug, want)
			}
		}
		for _, unwanted := range []string{`import "htmx.org";`, `import "alpine";`, `class="example-preview"`} {
			if strings.Contains(body, unwanted) {
				t.Errorf("GET /examples/%s should not contain %q", slug, unwanted)
			}
		}
	}

	// Demo pages: the live markup and only their own stack's module
	for slug, module := range map[string]string{"htmx": "htmx.org", "alpine": "alpine"} {
		body := get("/demos/" + slug)
		if !strings.Contains(body, `import "`+module+`";`) || !strings.Contains(body, `class="example-preview"`) {
			t.Errorf("GET /demos/%s is missing its module or live markup", slug)
		}
	}
	if body := get("/demos/script-tag"); strings.Contains(body, `import "vanilia-editor";`) {
		t.Errorf("the script tag demo must not import the editor module")
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

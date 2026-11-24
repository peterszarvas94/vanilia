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
	e := newServer("", newUploadStore())

	get := func(path string) string {
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
		if rec.Code != http.StatusOK {
			t.Errorf("GET %s status = %d", path, rec.Code)
		}
		return rec.Body.String()
	}

	// Generic example pages: code only + Demos link, no live markup or stack modules
	for _, slug := range []string{"basic", "form", "toolbar"} {
		body := get("/examples/" + slug)
		for _, want := range []string{"<h2>Examples</h2>", "<h2>Demos</h2>", `href="/demos">Demos`, `<h2 id="code">Code</h2>`} {
			if !strings.Contains(body, want) {
				t.Errorf("GET /examples/%s is missing %q", slug, want)
			}
		}
		for _, unwanted := range []string{`import "htmx.org";`, `import "alpine";`, `class="example-preview"`, `<h2>Stacks</h2>`} {
			if strings.Contains(body, unwanted) {
				t.Errorf("GET /examples/%s should not contain %q", slug, unwanted)
			}
		}
	}

	// Demo pages: live markup, relevant framework code, server handler & notes, and only their own stack's module
	for slug, wants := range map[string][]string{
		"script-tag": {`window.Vanilia`, `<h2 id="notes">Notes</h2>`},
		"datastar":   {`data-bind:body`, "func saveDatastarPost", `<h2 id="server">Server</h2>`, `<h2 id="notes">Notes</h2>`},
		"htmx":       {`hx-post`, `import "htmx.org";`, "func saveHtmxPost", `href="../docs/sanitize"`, `<h2 id="server">Server</h2>`, `<h2 id="notes">Notes</h2>`},
		"alpine":     {`x-model`, `import "alpine";`, `<h2 id="notes">Notes</h2>`},
	} {
		body := get("/demos/" + slug)
		wants = append(wants, `class="demo-panel example-preview"`, `data-panel="code"`, `<h2>Stacks</h2>`)
		for _, want := range wants {
			if !strings.Contains(body, want) {
				t.Errorf("GET /demos/%s is missing %q", slug, want)
			}
		}
	}
	if body := get("/demos/script-tag"); strings.Contains(body, `import "vanilia-editor";`) {
		t.Errorf("the script tag demo must not import the editor module")
	}

	for _, d := range demos {
		if strings.Contains(d.Server, "endregion") {
			t.Errorf("%s: server region not extracted cleanly", d.Slug)
		}
	}
}

func TestIntegrationSaveHandlersSanitize(t *testing.T) {
	mustLoadTemplates("../../templates")
	mustLoadExamples("../../templates/examples")
	e := newServer("", newUploadStore())
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

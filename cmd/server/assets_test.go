package main

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"
)

func TestAssetFingerprints(t *testing.T) {
	mustLoadTemplates("../../templates")
	mustLoadExamples("../../templates/examples")
	e := newServer("", newUploadStore())

	get := func(path string) *httptest.ResponseRecorder {
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
		return rec
	}

	// Every page links its scripts, styles and icon with a content hash
	page := get("/docs/install").Body.String()
	for _, path := range []string{"/dist/vanilia-editor.js", "/dist/vanilia-editor.css", "/static/site.js", "/static/site.css", "/static/favicon.svg"} {
		hash := assetHash(path)
		if len(hash) != 12 {
			t.Fatalf("assetHash(%q) = %q", path, hash)
		}
		if !strings.Contains(page, path+"?v="+hash) {
			t.Errorf("page does not link %s with its fingerprint", path)
		}
	}
	if regexp.MustCompile(`(src|href|"[a-z.]+": )"/(static|dist)/[^"?]+"`).MatchString(page) {
		t.Errorf("page links an asset without a fingerprint")
	}

	// Fingerprinted URLs are cached for good; plain and outdated ones are revalidated
	v := assetHash("/dist/vanilia-editor.js")
	for url, want := range map[string]string{
		"/dist/vanilia-editor.js?v=" + v:   "public, max-age=31536000, immutable",
		"/dist/vanilia-editor.js":          "no-cache",
		"/dist/vanilia-editor.js?v=stale1": "no-cache",
		"/static/site.css":                 "no-cache",
	} {
		rec := get(url)
		if rec.Code != http.StatusOK || rec.Header().Get("Cache-Control") != want {
			t.Errorf("GET %s = %d, Cache-Control %q, want %q", url, rec.Code, rec.Header().Get("Cache-Control"), want)
		}
	}
	if got := get("/dist/vanilia-editor.js").Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Errorf("dist lost its CORS header: %q", got)
	}

	// A live demo loads the fingerprinted files while its displayed code keeps plain paths
	iife := "/dist/vanilia-editor.iife.js"
	demo := get("/demos/script-tag").Body.String()
	if !strings.Contains(demo, `src="`+iife+"?v="+assetHash(iife)+`"`) {
		t.Errorf("script tag demo does not load the fingerprinted script")
	}
	if !strings.Contains(demo, `src=&#34;`+iife+`&#34;`) {
		t.Errorf("script tag demo code block does not show the plain script path")
	}
}

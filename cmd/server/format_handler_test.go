package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHTMLFormatterReturnsTextAndLimitsInput(t *testing.T) {
	mustLoadTemplates("../../templates")
	e := newServer("", newUploadStore())
	source := `<ul><li>One<ul><li>Two</li></ul></li></ul><script>alert(1)</script>`
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, httptest.NewRequest(http.MethodPost, "/api/format-html", strings.NewReader(source)))
	if rec.Code != http.StatusOK || !strings.HasPrefix(rec.Header().Get("Content-Type"), "text/plain") {
		t.Fatalf("formatter response: %d %v", rec.Code, rec.Header())
	}
	if !strings.Contains(rec.Body.String(), "\n      <li>Two</li>\n") || !strings.Contains(rec.Body.String(), "<script>alert(1)</script>") {
		t.Errorf("formatter must indent and preserve inert source text: %s", rec.Body.String())
	}
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, httptest.NewRequest(http.MethodPost, "/api/format-html", strings.NewReader(strings.Repeat("x", 256*1024+1))))
	if rec.Code != http.StatusRequestEntityTooLarge {
		t.Errorf("oversized body status = %d", rec.Code)
	}
}

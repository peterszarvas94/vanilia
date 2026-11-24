package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestSanitizeEditorHTMLPreservesResizedImageAndStripsXSS(t *testing.T) {
	input := `<h2>Hi</h2><p><img src="/uploads/abc" alt="Photo" data-align="center" style="width: 50%; height: auto; display: block; margin-left: auto; margin-right: auto;" onerror="alert(1)"></p><script>alert(1)</script><a href="javascript:alert(1)">bad</a><a href="https://example.com" target="_blank" rel="noopener noreferrer">ok</a>`
	got := sanitizeEditorHTML(input)

	if strings.Contains(got, "<script") || strings.Contains(got, "onerror") || strings.Contains(got, "javascript:") {
		t.Fatalf("sanitizer failed to strip XSS: %s", got)
	}
	if !strings.Contains(got, `data-align="center"`) || !strings.Contains(got, `width: 50%`) {
		t.Fatalf("sanitizer stripped image resize/align attrs: %s", got)
	}
	if !strings.Contains(got, `href="https://example.com"`) {
		t.Fatalf("sanitizer stripped safe link: %s", got)
	}
}

func TestImageUploadAndServe(t *testing.T) {
	// 1x1 transparent PNG
	pngBytes := []byte{
		0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
		0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
		0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
		0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
		0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
		0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
	}

	mustLoadTemplates("../../templates")
	e := newServer("", newUploadStore())

	req := httptest.NewRequest(http.MethodPost, "/api/upload", bytes.NewReader(pngBytes))
	req.Header.Set("Content-Type", "image/png")
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("POST /api/upload = %d (%s)", rec.Code, rec.Body.String())
	}

	var resp struct {
		URL string `json:"url"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil || !strings.HasPrefix(resp.URL, "/uploads/") {
		t.Fatalf("unexpected upload response: %s", rec.Body.String())
	}

	getReq := httptest.NewRequest(http.MethodGet, resp.URL, nil)
	getRec := httptest.NewRecorder()
	e.ServeHTTP(getRec, getReq)
	if getRec.Code != http.StatusOK || !bytes.Equal(getRec.Body.Bytes(), pngBytes) {
		t.Fatalf("GET %s failed: status=%d len=%d", resp.URL, getRec.Code, getRec.Body.Len())
	}
}

func TestSanitizeEditorHTMLPreservesLeftRightImageAlignment(t *testing.T) {
	right := `<p><img src="/assets/sample-mountain.svg" data-align="right" style="width: 50%; height: auto; display: block; margin-left: auto; margin-right: 0px;"></p>`
	gotRight := sanitizeEditorHTML(right)
	if !strings.Contains(gotRight, `data-align="right"`) || !strings.Contains(gotRight, "margin-left: auto") || !strings.Contains(gotRight, "margin-right: 0px") {
		t.Fatalf("right alignment lost: %s", gotRight)
	}

	left := `<p><img src="/assets/sample-mountain.svg" data-align="left" style="width: 50%; height: auto; display: block; margin-left: 0px; margin-right: auto;"></p>`
	gotLeft := sanitizeEditorHTML(left)
	if !strings.Contains(gotLeft, `data-align="left"`) || !strings.Contains(gotLeft, "margin-left: 0px") || !strings.Contains(gotLeft, "margin-right: auto") {
		t.Fatalf("left alignment lost: %s", gotLeft)
	}
}

func TestDistAssetsServedWithCORS(t *testing.T) {
	mustLoadTemplates("../../templates") // also points the file servers at the repo root
	e := newServer("", newUploadStore())

	for _, asset := range []string{"/dist/vanilia-editor.js", "/dist/vanilia-editor.css"} {
		req := httptest.NewRequest(http.MethodGet, asset, nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("GET %s status = %d, want 200", asset, rec.Code)
		}
		if got := rec.Header().Get("Access-Control-Allow-Origin"); got != "*" {
			t.Fatalf("GET %s Access-Control-Allow-Origin = %q, want *", asset, got)
		}
		if rec.Body.Len() < 1000 {
			t.Fatalf("GET %s body unexpectedly small: %d bytes", asset, rec.Body.Len())
		}
	}
}

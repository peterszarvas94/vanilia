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

func TestSessionSaveAndResetFlow(t *testing.T) {
	mustLoadTemplates("../../templates")
	store := newContentStore(10, buildSeedContent(""))
	uploads := newUploadStore()
	e := newServer("", store, uploads)

	// 1. Initial GET /content sets session cookie and streams seed content
	req := httptest.NewRequest(http.MethodGet, "/content", nil)
	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("GET /content status = %d, want 200", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), "datastar-patch-signals") || !strings.Contains(rec.Body.String(), "datastar-patch-elements") {
		t.Fatalf("expected SSE patch events, got: %s", rec.Body.String())
	}
	cookies := rec.Result().Cookies()
	if len(cookies) == 0 {
		t.Fatalf("expected session cookie")
	}

	// 2. PATCH /content saves sanitized HTML
	body, _ := json.Marshal(map[string]string{"editorHtml": "<p>Saved <strong>value</strong></p><script>x()</script>"})
	patchReq := httptest.NewRequest(http.MethodPatch, "/content", bytes.NewReader(body))
	patchReq.Header.Set("Content-Type", "application/json")
	patchReq.AddCookie(cookies[0])
	patchRec := httptest.NewRecorder()
	e.ServeHTTP(patchRec, patchReq)
	if patchRec.Code != http.StatusOK {
		t.Fatalf("PATCH /content status = %d, want 200", patchRec.Code)
	}
	if strings.Contains(patchRec.Body.String(), "<script>") || !strings.Contains(patchRec.Body.String(), "Saved <strong>value</strong>") {
		t.Fatalf("unexpected PATCH response: %s", patchRec.Body.String())
	}

	// 3. Subsequent GET /content returns saved value for same session
	req2 := httptest.NewRequest(http.MethodGet, "/content", nil)
	req2.AddCookie(cookies[0])
	rec2 := httptest.NewRecorder()
	e.ServeHTTP(rec2, req2)
	if !strings.Contains(rec2.Body.String(), "Saved <strong>value</strong>") {
		t.Fatalf("expected saved content on reload, got: %s", rec2.Body.String())
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
	e := newServer("", newContentStore(10, ""), newUploadStore())

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
	t.Chdir("../..")
	e := newServer("", newContentStore(10, ""), newUploadStore())

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

package main

import (
	_ "embed"
	"net/http"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/starfederation/datastar-go/datastar"
)

// This file is embedded into the binary: the code between "// region <slug>" and
// "// endregion" is shown in the matching example on /examples as its server code,
// so the page always shows the handler that actually runs.
//
//go:embed integrations.go
var integrationsSource string

// sourceRegion returns the code between "// region <name>" and "// endregion".
func sourceRegion(src, name string) string {
	_, rest, ok := strings.Cut(src, "// region "+name+"\n")
	if !ok {
		return ""
	}
	region, _, _ := strings.Cut(rest, "// endregion")
	return strings.TrimSpace(region)
}

// region datastar
type postSignals struct {
	Body string `json:"body"`
}

// Datastar posts all signals as JSON; answer with SSE events that patch the page.
func saveDatastarPost(c echo.Context) error {
	var post postSignals
	if err := datastar.ReadSignals(c.Request(), &post); err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	clean := sanitizeEditorHTML(post.Body)

	sse := datastar.NewSSE(c.Response().Writer, c.Request())
	if err := sse.PatchElements(`<div id="datastar-output" class="result ve-prose">` + clean + `</div>`); err != nil {
		return err
	}
	return sse.MarshalAndPatchSignals(map[string]any{"savedAt": time.Now().Format("15:04:05")})
}

// endregion

// region htmx
// The editor is a form field, so htmx sends it as "body" with the rest of the form.
// Respond with the HTML to swap into hx-target.
func saveHtmxPost(c echo.Context) error {
	clean := sanitizeEditorHTML(c.FormValue("body"))
	return c.HTML(http.StatusOK, clean)
}

// endregion

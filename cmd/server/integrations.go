package main

import (
	_ "embed"
	"fmt"
	"html/template"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/starfederation/datastar-go/datastar"
)

// This file is embedded into the binary: the code between "// region <slug>" and
// "// endregion" is shown on /integrations/<slug> as the server side of the demo,
// so the page always shows the handler that actually runs.
//
//go:embed integrations.go
var integrationsSource string

// integration is one page under /integrations. Its demo markup lives in
// templates/integrations/<slug>.html (rendered live and shown as source) and its
// explanation in templates/integrations/<slug>.notes.html.
type integration struct {
	Slug    string
	Name    string
	Tagline string
	// Modules are import-map specifiers the page imports in addition to the site's own
	Modules  []string
	Demo     string
	DemoHTML template.HTML
	Notes    template.HTML
	Server   string
}

var integrationIndex = []integration{
	{Slug: "datastar", Name: "Datastar", Tagline: "Bind the editor to signals and save over SSE."},
	{Slug: "htmx", Name: "htmx", Tagline: "Post the editor like any form field and swap in the server's HTML.", Modules: []string{"htmx.org"}},
	{Slug: "alpine", Name: "Alpine.js", Tagline: "Two-way bind content with x-model and react to editor events.", Modules: []string{"alpine"}},
}

var integrations []integration

func mustLoadIntegrations(dir string) {
	integrations = make([]integration, 0, len(integrationIndex))
	for _, in := range integrationIndex {
		demo, err := os.ReadFile(filepath.Join(dir, in.Slug+".html"))
		if err != nil {
			panic(fmt.Sprintf("load integration %q: %v", in.Slug, err))
		}
		notes, err := os.ReadFile(filepath.Join(dir, in.Slug+".notes.html"))
		if err != nil {
			panic(fmt.Sprintf("load integration notes %q: %v", in.Slug, err))
		}
		in.Demo = strings.TrimSpace(string(demo))
		in.DemoHTML = template.HTML(in.Demo) // trusted, checked-in markup
		in.Notes = template.HTML(notes)
		in.Server = sourceRegion(integrationsSource, in.Slug)
		integrations = append(integrations, in)
	}
}

// sourceRegion returns the code between "// region <name>" and "// endregion".
func sourceRegion(src, name string) string {
	_, rest, ok := strings.Cut(src, "// region "+name+"\n")
	if !ok {
		return ""
	}
	region, _, _ := strings.Cut(rest, "// endregion")
	return strings.TrimSpace(region)
}

func integrationsHandler(basePath string) echo.HandlerFunc {
	return func(c echo.Context) error {
		return renderTemplate(c, "integrations", pageData{
			BasePath:     basePath,
			Active:       "integrations",
			Title:        "Integrations",
			Integrations: integrations,
		})
	}
}

func integrationHandler(basePath string) echo.HandlerFunc {
	return func(c echo.Context) error {
		for i := range integrations {
			in := &integrations[i]
			if in.Slug != c.Param("slug") {
				continue
			}
			return renderTemplate(c, "integration", pageData{
				BasePath:     basePath,
				Active:       "integrations",
				Title:        in.Name,
				Integrations: integrations,
				Integration:  in,
				Modules:      in.Modules,
			})
		}
		return echo.ErrNotFound
	}
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

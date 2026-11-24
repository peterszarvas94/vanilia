package main

import (
	"errors"
	"fmt"
	"html/template"
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	"github.com/labstack/echo/v4"
)

// example is a live snippet on /examples. The same file is rendered as markup
// and shown as source, so the code on the page is always the code that runs.
// Optional parts: <slug>.notes.html is shown under the code, and a
// "// region <slug>" block in integrations.go is shown as the server code.
type example struct {
	Slug        string
	Title       string
	Description template.HTML
	// Group is the sidebar category ("Examples" or "Integrations")
	Group  string
	Source string
	HTML   template.HTML
	Notes  template.HTML
	Server string
}

var exampleIndex = []example{
	{Group: "Examples", Slug: "basic", Title: "Basic editor", Description: "The smallest setup: one element with initial content in a <code>&lt;template&gt;</code>."},
	{Group: "Examples", Slug: "form", Title: "Inside a form", Description: "The editor is form-associated: <code>name</code>, <code>required</code>, <code>FormData</code> and <code>reset</code> work like a native field."},
	{Group: "Examples", Slug: "api", Title: "JavaScript API", Description: "Read and write content, run commands and listen to state updates."},
	{Group: "Examples", Slug: "theme", Title: "Custom theme", Description: "Restyle everything with <code>--ve-*</code> CSS custom properties."},
	{Group: "Examples", Slug: "icons", Title: "Custom icons", Description: "Swap individual icons per editor with <code>&lt;template data-ve-icon&gt;</code>, and tune the built-in ones with CSS."},
	{Group: "Examples", Slug: "headless", Title: "Your own toolbar", Description: "Hide the built-in toolbar with <code>toolbar=\"none\"</code> and drive the editor from your own buttons."},
	{Group: "Examples", Slug: "uploads", Title: "Image uploads", Description: "Upload pasted, dropped and picked images to your server. Without <code>upload-url</code> images are inlined as <code>data:</code> URLs."},
	{Group: "Integrations", Slug: "datastar", Title: "Datastar", Description: "Bind the editor to a signal and save it over SSE."},
	{Group: "Integrations", Slug: "htmx", Title: "htmx", Description: "Post the editor like any form field and swap in the server's HTML."},
	{Group: "Integrations", Slug: "alpine", Title: "Alpine.js", Description: "Bind the content both ways with <code>x-model</code> and react to editor events."},
}

// exampleModules are import-map specifiers the examples page imports for its integrations.
var exampleModules = []string{"htmx.org", "alpine"}

var examples []example

func mustLoadExamples(dir string) {
	examples = make([]example, 0, len(exampleIndex))
	for _, ex := range exampleIndex {
		raw, err := os.ReadFile(filepath.Join(dir, ex.Slug+".html"))
		if err != nil {
			panic(fmt.Sprintf("load example %q: %v", ex.Slug, err))
		}
		src := strings.TrimSpace(string(raw))
		ex.Source = src
		ex.HTML = template.HTML(src) // trusted, checked-in markup

		notes, err := os.ReadFile(filepath.Join(dir, ex.Slug+".notes.html"))
		if err != nil && !errors.Is(err, fs.ErrNotExist) {
			panic(fmt.Sprintf("load example notes %q: %v", ex.Slug, err))
		}
		ex.Notes = template.HTML(notes)
		ex.Server = sourceRegion(integrationsSource, ex.Slug)
		examples = append(examples, ex)
	}
}

type pageData struct {
	BasePath string
	Active   string
	Title    string
	// Docs and examples pages: sidebar, current page and pager
	Section string
	Heading string
	Nav     []navGroup
	Prev    *navItem
	Next    *navItem
	Content template.HTML
	Example *example
	// RenderedPreview fills the demo page's "rendered-preview" block (streamed later via SSE)
	RenderedPreview template.HTML
	// Modules are extra import-map specifiers imported by the page's entry script
	Modules []string
}

func pageHandler(basePath, name, title string) echo.HandlerFunc {
	return func(c echo.Context) error {
		data := pageData{
			BasePath: basePath,
			Active:   name,
			Title:    title,
		}
		return renderTemplate(c, name, data)
	}
}

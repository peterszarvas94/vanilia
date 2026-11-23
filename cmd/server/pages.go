package main

import (
	"fmt"
	"html/template"
	"os"
	"path/filepath"
	"strings"

	"github.com/labstack/echo/v4"
)

// example is a live snippet on /examples. The same file is rendered as markup
// and shown as source, so the code on the page is always the code that runs.
type example struct {
	Slug        string
	Title       string
	Description template.HTML
	Source      string
	HTML        template.HTML
}

var exampleIndex = []example{
	{Slug: "basic", Title: "Basic editor", Description: "The smallest setup: one element with initial content in a <code>&lt;template&gt;</code>."},
	{Slug: "form", Title: "Inside a form", Description: "The editor is form-associated: <code>name</code>, <code>required</code>, <code>FormData</code> and <code>reset</code> work like a native field."},
	{Slug: "api", Title: "JavaScript API", Description: "Read and write content, run commands and listen to state updates."},
	{Slug: "theme", Title: "Custom theme", Description: "Restyle everything with <code>--ve-*</code> CSS custom properties."},
	{Slug: "icons", Title: "Custom icons", Description: "Swap individual icons per editor with <code>&lt;template data-ve-icon&gt;</code>, and tune the built-in ones with CSS."},
	{Slug: "headless", Title: "Your own toolbar", Description: "Hide the built-in toolbar with <code>toolbar=\"none\"</code> and drive the editor from your own buttons."},
	{Slug: "uploads", Title: "Image uploads", Description: "Upload pasted, dropped and picked images to your server. Without <code>upload-url</code> images are inlined as <code>data:</code> URLs."},
}

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
		examples = append(examples, ex)
	}
}

type pageData struct {
	BasePath string
	Active   string
	Title    string
	Examples []example
	// RenderedPreview fills the demo page's "rendered-preview" block (streamed later via SSE)
	RenderedPreview template.HTML
}

func pageHandler(basePath, name, title string) echo.HandlerFunc {
	return func(c echo.Context) error {
		return renderTemplate(c, name, pageData{
			BasePath: basePath,
			Active:   name,
			Title:    title,
			Examples: examples,
		})
	}
}

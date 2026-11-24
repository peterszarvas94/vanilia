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

// example is one snippet in templates/examples/<slug>.html. Generic examples in
// exampleIndex are shown as code on /examples/<slug>; stack demos in demoIndex
// run live alongside their code, server handler and notes on /demos/<slug>.
// Optional parts: <slug>.notes.html is shown under the code, and a
// "// region <slug>" block in integrations.go is shown as the server code.
type example struct {
	Slug        string
	Title       string
	Description template.HTML
	// Group is the sidebar category ("Examples" or "Stacks")
	Group string
	// Stack names the setup the demo runs on, shown as a badge on the demo page
	Stack string
	// Modules are extra import-map specifiers the demo page imports (htmx, Alpine.js)
	Modules []string
	// Classic demos load the editor as a classic script (vanilia-editor.iife.js) instead of the ES module
	Classic bool
	Source  string
	HTML    template.HTML
	Notes   template.HTML
	Server  string
}

var exampleIndex = []example{
	{Group: "Examples", Slug: "basic", Title: "Basic editor", Description: "The smallest setup: one element with initial content in a <code>&lt;template&gt;</code>."},
	{Group: "Examples", Slug: "form", Title: "Inside a form", Description: "The editor is form-associated: <code>name</code>, <code>required</code>, <code>FormData</code> and <code>reset</code> work like a native field."},
	{Group: "Examples", Slug: "api", Title: "JavaScript API", Description: "Read and write content, run commands and listen to state updates."},
	{Group: "Examples", Slug: "theme", Title: "Custom theme", Description: "Restyle everything with <code>--ve-*</code> CSS custom properties, pin light or dark with <code>theme</code>, and set tokens from JavaScript with <code>setTheme()</code>."},
	{Group: "Examples", Slug: "icons", Title: "Custom icons", Description: "Swap individual icons per editor with <code>&lt;template data-ve-icon&gt;</code>, and tune the built-in ones with CSS."},
	{Group: "Examples", Slug: "toolbar", Title: "Toolbar layout", Description: "Pick the toolbar and selection-menu buttons with <code>toolbar</code> and <code>bubble-menu</code>, and add your own with <code>addButton()</code>."},
	{Group: "Examples", Slug: "labels", Title: "Translated labels", Description: "Translate every label with <code>&lt;template data-ve-labels&gt;</code>, and handle plurals with <code>setLabels()</code>."},
	{Group: "Examples", Slug: "shortcuts", Title: "Keyboard shortcuts", Description: "Remap, add and remove shortcuts with <code>&lt;template data-ve-shortcuts&gt;</code> and <code>setShortcuts()</code>, and list them with <code>getShortcuts()</code>."},
	{Group: "Examples", Slug: "headless", Title: "Your own toolbar", Description: "Hide the built-in toolbar with <code>toolbar=\"none\"</code> and drive the editor from your own buttons."},
	{Group: "Examples", Slug: "uploads", Title: "Image uploads", Description: "Upload pasted, dropped and picked images to your server. Without <code>upload-url</code> images are inlined as <code>data:</code> URLs."},
}

var demoIndex = []example{
	{Group: "Stacks", Slug: "script-tag", Title: "Script tag", Stack: "Script tag", Classic: true, Description: "No import map and no modules: one classic <code>&lt;script&gt;</code>, with the API on <code>window.Vanilia</code>."},
	{Group: "Stacks", Slug: "datastar", Title: "Datastar", Stack: "Datastar + Go", Description: "Bind the editor to a signal and save it over SSE."},
	{Group: "Stacks", Slug: "htmx", Title: "htmx", Stack: "htmx + Go", Modules: []string{"htmx.org"}, Description: "Post the editor like any form field and swap in the server's HTML."},
	{Group: "Stacks", Slug: "alpine", Title: "Alpine.js", Stack: "Alpine.js", Modules: []string{"alpine"}, Description: "Bind the content both ways with <code>x-model</code> and react to editor events."},
	{Group: "Stacks", Slug: "react", Title: "React", Stack: "React 19", Description: "Control the editor with React state and native custom-element events."},
}

const demoContentMarker = "<!-- demo-content -->"

var (
	examples    []example
	demos       []example
	demoContent string
)

func loadSnippets(dir string, index []example) []example {
	out := make([]example, 0, len(index))
	for _, ex := range index {
		raw, err := os.ReadFile(filepath.Join(dir, ex.Slug+".html"))
		if err != nil {
			panic(fmt.Sprintf("load example %q: %v", ex.Slug, err))
		}
		src := strings.TrimSpace(string(raw))
		ex.Source = strings.ReplaceAll(src, demoContentMarker, demoContent)
		ex.HTML = template.HTML(strings.ReplaceAll(src, demoContentMarker, demoContent)) // trusted, checked-in markup

		notes, err := os.ReadFile(filepath.Join(dir, ex.Slug+".notes.html"))
		if err != nil && !errors.Is(err, fs.ErrNotExist) {
			panic(fmt.Sprintf("load example notes %q: %v", ex.Slug, err))
		}
		ex.Notes = template.HTML(notes)
		ex.Server = sourceRegion(integrationsSource, ex.Slug)
		out = append(out, ex)
	}
	return out
}

func mustLoadExamples(dir string) {
	raw, err := os.ReadFile(filepath.Join(dir, "_demo-content.html"))
	if err != nil {
		panic(fmt.Sprintf("load shared demo content: %v", err))
	}
	demoContent = strings.TrimSpace(string(raw))
	examples = loadSnippets(dir, exampleIndex)
	demos = loadSnippets(dir, demoIndex)
}

type pageData struct {
	IncludesSquire bool
	BasePath       string
	Active         string
	Title          string
	// Docs and examples pages: sidebar, current page and pager
	Section string
	Heading string
	Nav     []navGroup
	Prev    *navItem
	Next    *navItem
	Content template.HTML
	Example *example
	// DemoContent is the shared rich HTML document loaded into the homepage editor
	DemoContent template.HTML
	// Modules are extra import-map specifiers imported by the page's entry script
	Modules []string
	// ClassicEditor loads the editor as a classic script instead of importing the ES module
	ClassicEditor bool
}

func pageHandler(basePath, name, title string) echo.HandlerFunc {
	return func(c echo.Context) error {
		data := pageData{
			BasePath:    basePath,
			Active:      name,
			Title:       title,
			DemoContent: template.HTML(demoContent),
		}
		return renderTemplate(c, name, data)
	}
}

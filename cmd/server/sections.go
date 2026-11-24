package main

import (
	"bytes"
	"html/template"
	"net/http"

	"github.com/labstack/echo/v4"
)

// doc is one page under /docs, rendered from the "doc/<slug>" template in
// templates/docs/<slug>.html.
type doc struct {
	Group string
	Slug  string
	Title string
}

var docIndex = []doc{
	{Group: "Getting started", Slug: "install", Title: "Installation"},
	{Group: "Getting started", Slug: "usage", Title: "Usage"},
	{Group: "Getting started", Slug: "squire", Title: "Squire & Vanilia"},
	{Group: "Getting started", Slug: "forms", Title: "Forms"},
	{Group: "Getting started", Slug: "typescript", Title: "TypeScript"},
	{Group: "Reference", Slug: "attributes", Title: "Attributes"},
	{Group: "Reference", Slug: "api", Title: "Properties & methods"},
	{Group: "Reference", Slug: "exports", Title: "Module exports"},
	{Group: "Reference", Slug: "commands", Title: "Commands"},
	{Group: "Reference", Slug: "events", Title: "Events"},
	{Group: "Guides", Slug: "toolbar", Title: "Toolbar"},
	{Group: "Guides", Slug: "styling", Title: "Styling & themes"},
	{Group: "Guides", Slug: "icons", Title: "Icons"},
	{Group: "Guides", Slug: "labels", Title: "Labels & translation"},
	{Group: "Guides", Slug: "shortcuts", Title: "Keyboard shortcuts"},
	{Group: "Guides", Slug: "uploads", Title: "Image uploads"},
	{Group: "Guides", Slug: "sanitize", Title: "Sanitizing on the server"},
	{Group: "Guides", Slug: "browsers", Title: "Browser support"},
}

// navItem is one sidebar link.
type navItem struct {
	Href     string
	Title    string
	Current  bool
	External bool
}

// navGroup is one sidebar category.
type navGroup struct {
	Name  string
	Items []navItem
}

// navEntry is one page of a sidebar section, in reading order.
type navEntry struct {
	Group, Slug, Title string
}

// sectionNav builds the sidebar groups (in first-seen order) and the previous
// and next pages around current.

func sectionNav(base string, entries []navEntry, current string) (groups []navGroup, prev, next *navItem) {
	index := map[string]int{}
	for i, e := range entries {
		item := navItem{Href: base + "/" + e.Slug, Title: e.Title, Current: e.Slug == current}
		g, ok := index[e.Group]
		if !ok {
			g = len(groups)
			index[e.Group] = g
			groups = append(groups, navGroup{Name: e.Group})
		}
		groups[g].Items = append(groups[g].Items, item)
		if e.Slug == current {
			if i > 0 {
				p := entries[i-1]
				prev = &navItem{Href: base + "/" + p.Slug, Title: p.Title}
			}
			if i < len(entries)-1 {
				n := entries[i+1]
				next = &navItem{Href: base + "/" + n.Slug, Title: n.Title}
			}
		}
	}
	return groups, prev, next
}

func docsHandler(basePath string) echo.HandlerFunc {
	entries := make([]navEntry, len(docIndex))
	bySlug := map[string]doc{}
	for i, d := range docIndex {
		entries[i] = navEntry{d.Group, d.Slug, d.Title}
		bySlug[d.Slug] = d
	}
	return func(c echo.Context) error {
		d, ok := bySlug[c.Param("slug")]
		if !ok {
			return echo.NewHTTPError(http.StatusNotFound)
		}
		data := pageData{BasePath: basePath, Active: "docs", Title: d.Title + " · Docs", Section: "Docs", Heading: d.Title}
		data.Nav, data.Prev, data.Next = sectionNav(basePath+"/docs", entries, d.Slug)
		var buf bytes.Buffer
		if err := templates.ExecuteTemplate(&buf, "doc/"+d.Slug, data); err != nil {
			return err
		}
		data.Content = template.HTML(buf.String()) // checked-in templates
		return renderTemplate(c, "docs", data)
	}
}

func examplesHandler(basePath string) echo.HandlerFunc {
	return func(c echo.Context) error {
		slug := c.Param("slug")
		entries := make([]navEntry, len(examples))
		var current *example
		for i := range examples {
			ex := &examples[i]
			entries[i] = navEntry{ex.Group, ex.Slug, ex.Title}
			if ex.Slug == slug {
				current = ex
			}
		}
		if current == nil {
			// Framework demos moved from /examples/<slug> to /demos/<slug>
			for i := range demos {
				if demos[i].Slug == slug {
					return c.Redirect(http.StatusFound, basePath+"/demos/"+slug)
				}
			}
			return echo.NewHTTPError(http.StatusNotFound)
		}
		data := pageData{BasePath: basePath, Active: "examples", Title: current.Title + " · Examples", Section: "Examples", Heading: current.Title, Example: current}
		data.Nav, data.Prev, data.Next = sectionNav(basePath+"/examples", entries, current.Slug)
		data.Nav = append(data.Nav, navGroup{
			Name:  "Integration",
			Items: []navItem{{Href: basePath + "/demos", Title: "Interactive demos", External: true}},
		})
		return renderTemplate(c, "examples", data)
	}
}

// demoEntries lists the interactive stack demos in sidebar order.
func demoEntries() []navEntry {
	entries := make([]navEntry, 0, len(demos))
	for _, d := range demos {
		entries = append(entries, navEntry{d.Group, d.Slug, d.Title})
	}
	return entries
}

func demosHandler(basePath string) echo.HandlerFunc {
	return func(c echo.Context) error {
		var current *example
		for i := range demos {
			if demos[i].Slug == c.Param("slug") {
				current = &demos[i]
			}
		}
		if current == nil {
			return echo.NewHTTPError(http.StatusNotFound)
		}
		data := pageData{BasePath: basePath, Active: "demos", Title: current.Title + " · Demos", Section: "Demos", Heading: current.Title, Example: current, Modules: append([]string{"demos"}, current.Modules...), ClassicEditor: current.Classic}
		data.Nav, data.Prev, data.Next = sectionNav(basePath+"/demos", demoEntries(), current.Slug)
		data.Nav = append(data.Nav, navGroup{
			Name:  "Examples",
			Items: []navItem{{Href: basePath + "/examples", Title: "Generic examples", External: true}},
		})
		return renderTemplate(c, "demos", data)
	}
}

// redirectTo sends a section's index to its first page. Browsers keep the
// request's #fragment across the redirect, so old /docs#sanitize links land on
// /docs/install#sanitize, where data-hash-redirect forwards them.
func redirectTo(path string) echo.HandlerFunc {
	return func(c echo.Context) error {
		return c.Redirect(http.StatusFound, path)
	}
}

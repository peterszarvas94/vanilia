package main

import (
	"net/http"
	"os"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/starfederation/datastar-go/datastar"
)

type saveSignals struct {
	EditorHTML string `json:"editorHtml"`
}

func main() {
	mustLoadTemplates("templates/*.html")
	mustLoadExamples("templates/examples")

	basePath := normalizeBasePath(os.Getenv("BASE_PATH"))
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	bind := os.Getenv("BIND")
	if bind == "" {
		bind = ":" + port
	}

	store := newContentStore(defaultMaxEntries, buildSeedContent(basePath))
	uploads := newUploadStore()

	e := newServer(basePath, store, uploads)
	e.Logger.Fatal(e.Start(bind))
}

func newServer(basePath string, store *contentStore, uploads *uploadStore) *echo.Echo {
	e := echo.New()
	e.HideBanner = true

	// Serve standalone vanilla JS/CSS editor assets directly (zero build step)
	e.Static("/src", "src")
	e.Static("/static", "static")
	e.Static("/assets", "assets")

	// Serve single-file drop-in distribution assets with CORS so other projects can link directly
	distGroup := e.Group("/dist", func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			h := c.Response().Header()
			h.Set("Access-Control-Allow-Origin", "*")
			h.Set("Cross-Origin-Resource-Policy", "cross-origin")
			h.Set("Cache-Control", "public, max-age=300")
			return next(c)
		}
	})
	distGroup.Static("/", "dist")

	e.GET("/healthz", func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	})

	e.GET("/", pageHandler(basePath, "home", ""))
	e.GET("/docs", pageHandler(basePath, "docs", "Docs"))
	e.GET("/examples", pageHandler(basePath, "examples", "Examples"))
	e.GET("/demo", pageHandler(basePath, "demo", "Demo"))

	e.GET("/content", func(c echo.Context) error {
		sessionID, err := ensureSessionID(c)
		if err != nil {
			return err
		}
		content := store.loadContent(sessionID)
		sse := datastar.NewSSE(c.Response().Writer, c.Request())
		return sendContentUpdates(sse, content, true, "Loaded from session")
	})

	e.PATCH("/content", func(c echo.Context) error {
		sessionID, err := ensureSessionID(c)
		if err != nil {
			return err
		}

		var signals saveSignals
		if err := datastar.ReadSignals(c.Request(), &signals); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid signals"})
		}

		cleaned := sanitizeEditorHTML(signals.EditorHTML)
		store.saveContent(sessionID, cleaned)

		sse := datastar.NewSSE(c.Response().Writer, c.Request())
		return sendContentUpdates(sse, cleaned, false, "Saved at "+time.Now().Format("15:04:05"))
	}, middleware.BodyLimit("256K"))

	e.POST("/reset", func(c echo.Context) error {
		sessionID, err := ensureSessionID(c)
		if err != nil {
			return err
		}
		content := store.resetContent(sessionID)
		sse := datastar.NewSSE(c.Response().Writer, c.Request())
		return sendContentUpdates(sse, content, true, "Reset to default")
	})

	e.POST("/api/upload", handleImageUpload(basePath, uploads))
	e.GET("/uploads/:id", handleServeUpload(uploads))

	return e
}

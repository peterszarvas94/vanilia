package main

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	mustLoadTemplates("templates")
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

	uploads := newUploadStore()

	e := newServer(basePath, uploads)
	e.Logger.Fatal(e.Start(bind))
}

func newServer(basePath string, uploads *uploadStore) *echo.Echo {
	e := echo.New()
	e.HideBanner = true

	// Pages link these with content fingerprints (?v=hash): cached forever when
	// fingerprinted, revalidated on every use otherwise (see assets.go)
	e.Group("/static", assetCacheControl).Static("/", filepath.Join(assetRoot, "static"))
	e.Group("/assets", assetCacheControl).Static("/", filepath.Join(assetRoot, "assets"))

	// Serve single-file drop-in distribution assets with CORS so other projects can link directly
	distGroup := e.Group("/dist", assetCacheControl, func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			h := c.Response().Header()
			h.Set("Access-Control-Allow-Origin", "*")
			h.Set("Cross-Origin-Resource-Policy", "cross-origin")
			return next(c)
		}
	})
	distGroup.Static("/", filepath.Join(assetRoot, "dist"))

	e.GET("/healthz", func(c echo.Context) error {
		return c.String(http.StatusOK, "ok")
	})

	e.GET("/", pageHandler(basePath, "home", ""))
	e.GET("/docs", redirectTo(basePath+"/docs/"+docIndex[0].Slug))
	e.GET("/docs/:slug", docsHandler(basePath))
	e.GET("/examples", redirectTo(basePath+"/examples/"+exampleIndex[0].Slug))
	e.GET("/examples/:slug", examplesHandler(basePath))
	e.GET("/demos", redirectTo(basePath+"/demos/"+demoIndex[0].Slug))
	e.GET("/demos/:slug", demosHandler(basePath))
	// Old single-page demo URL
	e.GET("/demo", redirectTo(basePath+"/demos"))

	e.POST("/api/upload", handleImageUpload(basePath, uploads))
	e.POST("/api/datastar/save", saveDatastarPost, middleware.BodyLimit("256K"))
	e.POST("/api/htmx/save", saveHtmxPost, middleware.BodyLimit("256K"))
	e.GET("/uploads/:id", handleServeUpload(uploads))

	return e
}

package main

import (
	"crypto/sha256"
	"encoding/hex"
	"html/template"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
)

// Asset fingerprinting: pages link /static, /dist and /assets files as
// "/dist/vanilia-editor.js?v=<content hash>". The hash changes whenever the file
// does, so a versioned URL can be cached forever and a rebuilt file is never
// served stale. Hashes are recomputed when a file's size or modification time
// changes, so a running dev server picks up rebuilds without a restart.

// assetRoot is the directory holding static/, dist/ and assets/ (the templates
// directory's parent, set by mustLoadTemplates).
var assetRoot = "."

// assetPrefixes are the URL prefixes served from files under assetRoot.
var assetPrefixes = []string{"/static/", "/dist/", "/assets/"}

type fingerprint struct {
	size    int64
	modTime time.Time
	hash    string
}

var (
	fingerprintsMu sync.Mutex
	fingerprints   = map[string]fingerprint{}
)

// assetHash returns the short content hash of the file behind an asset URL path,
// or "" when it isn't an asset or can't be read.
func assetHash(urlPath string) string {
	if !isAssetPath(urlPath) || strings.Contains(urlPath, "..") {
		return ""
	}
	file := filepath.Join(assetRoot, filepath.FromSlash(strings.TrimPrefix(urlPath, "/")))
	info, err := os.Stat(file)
	if err != nil || info.IsDir() {
		return ""
	}

	fingerprintsMu.Lock()
	defer fingerprintsMu.Unlock()
	if fp, ok := fingerprints[file]; ok && fp.size == info.Size() && fp.modTime.Equal(info.ModTime()) {
		return fp.hash
	}
	data, err := os.ReadFile(file)
	if err != nil {
		return ""
	}
	sum := sha256.Sum256(data)
	hash := hex.EncodeToString(sum[:])[:12]
	fingerprints[file] = fingerprint{size: info.Size(), modTime: info.ModTime(), hash: hash}
	return hash
}

func isAssetPath(urlPath string) bool {
	for _, prefix := range assetPrefixes {
		if strings.HasPrefix(urlPath, prefix) {
			return true
		}
	}
	return false
}

// asset returns an asset URL path with its fingerprint: asset "/dist/vanilia-editor.js"
// is "/dist/vanilia-editor.js?v=1a2b3c4d5e6f". Templates prefix it with .BasePath.
func asset(urlPath string) string {
	if hash := assetHash(urlPath); hash != "" {
		return urlPath + "?v=" + hash
	}
	return urlPath
}

var assetAttr = regexp.MustCompile(`((?:src|href)=")(/(?:static|dist|assets)/[^"?#]+)(")`)

// fingerprintHTML versions the asset links in trusted markup, such as a live demo
// that loads the editor itself. The example's code is shown without the versions.
func fingerprintHTML(html template.HTML) template.HTML {
	return template.HTML(assetAttr.ReplaceAllStringFunc(string(html), func(m string) string {
		parts := assetAttr.FindStringSubmatch(m)
		return parts[1] + asset(parts[2]) + parts[3]
	}))
}

// assetCacheControl lets browsers keep fingerprinted URLs forever and makes them
// revalidate plain ones on every use (a cheap 304 when unchanged).
func assetCacheControl(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		h := c.Response().Header()
		if v := c.QueryParam("v"); v != "" && v == assetHash(c.Request().URL.Path) {
			h.Set("Cache-Control", "public, max-age=31536000, immutable")
		} else {
			h.Set("Cache-Control", "no-cache")
		}
		return next(c)
	}
}

// assetFuncs are the template functions for asset links.
var assetFuncs = template.FuncMap{"asset": asset, "fingerprintHTML": fingerprintHTML}

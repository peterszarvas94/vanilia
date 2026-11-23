package main

import (
	"crypto/rand"
	"encoding/hex"
	"io"
	"net/http"
	"strings"
	"sync"

	"github.com/labstack/echo/v4"
)

const (
	maxUploadBytes      = 8 * 1024 * 1024  // 8 MB per image
	maxTotalUploadBytes = 64 * 1024 * 1024 // 64 MB total in-memory cap
	maxUploadCount      = 40
)

var allowedUploadTypes = map[string]bool{
	"image/png":  true,
	"image/jpeg": true,
	"image/webp": true,
	"image/gif":  true,
}

type uploadedImage struct {
	id          string
	contentType string
	data        []byte
}

type uploadStore struct {
	mu         sync.RWMutex
	order      []string
	items      map[string]uploadedImage
	totalBytes int
}

func newUploadStore() *uploadStore {
	return &uploadStore{
		items: make(map[string]uploadedImage),
	}
}

func (u *uploadStore) put(contentType string, data []byte) (string, error) {
	buf := make([]byte, 12)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	id := hex.EncodeToString(buf)

	u.mu.Lock()
	defer u.mu.Unlock()

	for len(u.order) > 0 && (len(u.order) >= maxUploadCount || u.totalBytes+len(data) > maxTotalUploadBytes) {
		oldest := u.order[0]
		u.order = u.order[1:]
		if img, ok := u.items[oldest]; ok {
			u.totalBytes -= len(img.data)
			delete(u.items, oldest)
		}
	}

	u.items[id] = uploadedImage{id: id, contentType: contentType, data: data}
	u.order = append(u.order, id)
	u.totalBytes += len(data)
	return id, nil
}

func (u *uploadStore) get(id string) (uploadedImage, bool) {
	u.mu.RLock()
	img, ok := u.items[id]
	u.mu.RUnlock()
	return img, ok
}

func handleImageUpload(basePath string, uploads *uploadStore) echo.HandlerFunc {
	return func(c echo.Context) error {
		limited := io.LimitReader(c.Request().Body, maxUploadBytes+1)
		data, err := io.ReadAll(limited)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Failed to read upload"})
		}
		if len(data) == 0 {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Empty upload"})
		}
		if len(data) > maxUploadBytes {
			return c.JSON(http.StatusRequestEntityTooLarge, map[string]string{"error": "Image exceeds 8 MB limit"})
		}

		detected := http.DetectContentType(data)
		headerType := strings.ToLower(strings.TrimSpace(strings.Split(c.Request().Header.Get("Content-Type"), ";")[0]))
		contentType := detected
		if !allowedUploadTypes[contentType] {
			if allowedUploadTypes[headerType] && strings.HasPrefix(detected, "application/octet-stream") {
				contentType = headerType
			} else {
				return c.JSON(http.StatusUnsupportedMediaType, map[string]string{
					"error": "Unsupported image type (allowed: PNG, JPEG, WebP, GIF)",
				})
			}
		}

		id, err := uploads.put(contentType, data)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Could not store upload"})
		}

		return c.JSON(http.StatusOK, map[string]any{
			"url":         basePath + "/uploads/" + id,
			"size":        len(data),
			"contentType": contentType,
		})
	}
}

func handleServeUpload(uploads *uploadStore) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		img, ok := uploads.get(id)
		if !ok {
			return c.NoContent(http.StatusNotFound)
		}
		c.Response().Header().Set("Cache-Control", "public, max-age=3600")
		c.Response().Header().Set("X-Content-Type-Options", "nosniff")
		return c.Blob(http.StatusOK, img.contentType, img.data)
	}
}

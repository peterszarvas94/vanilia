package main

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"

	"github.com/labstack/echo/v4"
)

const (
	sessionCookieName  = "vw_session_id"
	maxSessionIDLength = 64
)

func ensureSessionID(c echo.Context) (string, error) {
	cookie, err := c.Cookie(sessionCookieName)
	if err == nil && cookie.Value != "" && len(cookie.Value) <= maxSessionIDLength {
		return cookie.Value, nil
	}

	sessionID, err := newSessionID()
	if err != nil {
		return "", err
	}

	c.SetCookie(&http.Cookie{
		Name:     sessionCookieName,
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
	return sessionID, nil
}

func newSessionID() (string, error) {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}

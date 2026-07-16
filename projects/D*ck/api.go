package main

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/wailsapp/wails/v3/pkg/application"
)

type greeting struct {
	Message string `json:"message"`
}

func newAPI() *echo.Echo {
	e := echo.New()
	e.HideBanner = true
	e.HidePort = true

	e.GET("/api/hello", func(c *echo.Context) error {
		return c.JSON(http.StatusOK, greeting{
			Message: "Hello from Echo inside Wails",
		})
	})

	return e
}

func echoMiddleware(e *echo.Echo) application.Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/api" || strings.HasPrefix(r.URL.Path, "/api/") {
				e.ServeHTTP(w, r)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	api := newAPI()

	app := application.New(application.Options{
		Name: "Wails + Echo",
		Assets: application.AssetOptions{
			Handler:    application.AssetFileServerFS(assets),
			Middleware: echoMiddleware(api),
		},
	})

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:  "Wails + Echo",
		Width:  900,
		Height: 600,
		URL:    "/",
	})

	err := app.Run()
	if err != nil {
		log.Fatal(err)
	}
}

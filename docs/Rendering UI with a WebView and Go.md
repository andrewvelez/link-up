# Go WebView + Vite+ Quick Start

This creates a small desktop application without an application framework. Vite+ builds the frontend, Go embeds it, and [`webview_go`](https://github.com/webview/webview_go) displays it using the operating system's WebView.

## 1. Build the frontend

Configure Vite+ to produce a self-contained `dist/index.html`, then run:

```bash
vp build
```

## 2. Create the Go module

```bash
go mod init example.com/my-app
go get github.com/webview/webview_go
```

## 3. Add `main.go`

```go
package main

import (
	_ "embed"

	webview "github.com/webview/webview_go"
)

//go:embed dist/index.html
var frontend string

func main() {
	w := webview.New(false)
	defer w.Destroy()

	w.SetTitle("My App")
	w.SetSize(1024, 720, webview.HintNone)

	if err := w.Bind("hello", func(name string) string {
		return "Hello, " + name
	}); err != nil {
		panic(err)
	}

	w.SetHtml(frontend)
	w.Run()
}
```

## 4. Call Go from JavaScript

Functions registered with `Bind` become asynchronous global JavaScript functions:

```js
const message = await window.hello("Andrew");
console.log(message);
```

## 5. Build the application

```bash
go build -o my-app .
```

For a Windows GUI executable without a console window:

```bash
go build -ldflags="-H windowsgui" -o my-app.exe .
```

Build separately on each target operating system because `webview_go` uses CGO and native WebView libraries.

## How it fits together

- Vite+ produces the frontend as one HTML file.
- `go:embed` stores that HTML inside the executable.
- `SetHtml` loads it into the native WebView.
- `Bind` provides JavaScript-to-Go calls and returns promises.
- `go build` creates the desktop executable.

No local web server, `localhost` URL, Rust, or application framework is required.

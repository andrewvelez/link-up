
Project policy (as described by ChatGPT)
----------------------------------------
* Build always produces the executable.
* Testing always runs the executable.
* Debugging always attaches to the executable.
* Source files are never run directly as the normal workflow.


Initial idea for architecture
-----------------------------
Packaged executable
  ↓
WebView/browser host
  ↓
Bundled SPA UI assets
  ↓
Local HTTP boundary
  ↓
Local Bun runtime
  ↓
Local resources


Initial project structure
-------------------------
hello-webview-app/
  package.json
  src/
    main.js

    host/
      host.js

    runtime/
      server.js
      routes.js

    boundary/
      http.js

    app/
      starter-page.js

    resources/
      resources.js

    ui/
      index.html
      app.js
      styles.css

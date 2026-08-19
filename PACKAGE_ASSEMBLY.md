# Package Assembly

```text
Bun build script
      │
      ├── Compiles ReScript and bundles the web application
      ├── Selects the platform-specific native engine
      ├── Generates the platform support files from templates
      ├── Invokes the platform's packaging and signing tools
      ▼
Installable package
```

Bun is the build orchestrator and is absent at runtime.

Every installable package conceptually contains three things:

1. The native engine.
2. The portable web application.
3. Platform-specific support files.

The primary engineering work is the native engine. It must provide the same behavior on every platform: load the application, render it in a WebView, exchange events, manage its lifecycle, and provide any optional host capabilities.

The application consists of the same HTML, CSS, assets, and ReScript-compiled JavaScript on every platform. Bun creates that application output, combines it with the appropriate native engine, generates the platform support files, and invokes the platform's tools to produce the final package.

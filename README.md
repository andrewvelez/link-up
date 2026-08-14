# Link-Up

Link-Up is a hard local-first Tauri 2 application with a vanilla HTML, CSS,
and JavaScript frontend. Tauri loads the static frontend from `src/` in the
platform webview; the Rust/Tauri host lives in `src-tauri/`.

## Prerequisites

- Install the [Tauri 2 prerequisites](https://v2.tauri.app/start/prerequisites/).
- Install Node.js and npm.

## Install dependencies

```bash
npm install
```

## Run in development

```bash
npm run tauri dev
```

## Build the application

```bash
npm run tauri build
```

## Tests

Automated tests are not configured for the Tauri architecture yet.

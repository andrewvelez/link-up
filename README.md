# Link-Up

Link-Up is a hard local-first Tauri 2 application with a vanilla HTML, CSS,
and JavaScript frontend that is also installable as a browser PWA. Bun bundles
the shared frontend from `src/` into `dist/`; Tauri embeds that output in the
platform webview, while an HTTPS web host can serve it as the PWA. The
Rust/Tauri host lives in `src-tauri/`.

## Prerequisites

- Install the [Tauri 2 prerequisites](https://v2.tauri.app/start/prerequisites/).
- Install [Bun](https://bun.sh/).

## Install dependencies

```bash
bun install
```

## Run the browser/PWA frontend

```bash
bun run dev
```

This creates an unminified Bun bundle and serves it at
`http://127.0.0.1:8080`. Service workers require HTTPS in production;
loopback addresses are allowed for local development. Source changes rebuild
the frontend automatically; refresh the browser or Tauri window to load them.

## Build or preview the browser/PWA frontend

```bash
bun run build
bun run start
```

`bun run build` creates the deployable `dist/` directory. `bun run start`
rebuilds the production assets and serves them locally for inspection. The PWA
is currently configured for deployment at an HTTPS origin's root (`/`), not
under a subpath.

## Run the Tauri application

```bash
bun run tauri dev
```

Tauri starts the Bun frontend development server automatically and loads the
same generated frontend used by the browser PWA.

## Build the Tauri application

```bash
bun run tauri build
```

The Tauri build runs `bun run build` first, then embeds `dist/` in the native
application bundles. Bun is build-time tooling and is not shipped as a runtime
or sidecar.

## Tests

Cucumber is wired but currently contains no scenarios. Browser/PWA and Tauri
runtime test coverage have not yet been configured.

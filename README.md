# Link-Up

Link-Up is a local-first Progressive Web App (PWA) written in ReScript.
ReScript compiles the application, server, build tooling, and tests to JavaScript
ES modules. Bun bundles the browser modules and compiles a standalone executable
that embeds the complete PWA. HTML, CSS, JSON, icons, and vendored third-party
assets retain their native formats.

## Prerequisites

- Bun
- Node.js 20.11 or newer for the ReScript compiler CLI

## Install and run

```bash
bun install
bun run start
```

The server listens on `127.0.0.1` with an available port and prints its URL.
Open that URL in a browser. The startup route redirects to About because
server authentication is not yet implemented.

| Command | Purpose |
| --- | --- |
| `bun run build` | Compile ReScript and build `dist/link-up` with the embedded PWA. |
| `bun run test` | Compile ReScript, build the application, and run the ReScript test suite. |
| `bun run start` | Compile and build, then start the local development server. |
| `bun run res:build` | Compile ReScript source only. |
| `bun run res:watch` | Recompile ReScript when source files change. |
| `bun run res:format` | Format ReScript source. |
| `bun run clean` | Remove generated ReScript compiler output. |

## Development

Edit `.res` files. The compiler generates adjacent `.res.js` ES modules; these
files and `dist/` are ignored by Git. `res:watch` recompiles source but does not
rebundle browser assets or restart the server; rerun `bun run start` to serve
updated assets. The workspace recommends the ReScript VS Code extension.

- `src/server/Authentication.res` defines the typed authentication states.
- `src/server/Routes.res` defines startup redirects and GET/HEAD asset routes.
- `src/server/EmbeddedAssets.res` imports build assets for Bun to embed.
- `src/web/js/AppInitialization.res` initializes browser listeners and the PWA.
- `src/web/ServiceWorker.res` configures Workbox precaching and offline startup.
- `src/bindings/` contains typed bindings to the existing runtime APIs.
- `tools/Build.res` implements the build, test, and start commands.
- `test/*_test_.res` contains Bun tests written in ReScript.

The browser and service-worker entry points use `.resi` interfaces to keep
initialization helpers private. The service worker remains a classic script.

The package commands compile ReScript before invoking the generated build tool.
To call that tool directly after compilation, use
`bun tools/Build.res.js <build|test|start>`. It resolves paths relative to the
project, so it also works when launched from another directory.

## Verification and deployment

Run `bun run test` and deploy the resulting `dist/link-up` only when it exits
with code 0. The tests cover browser initialization, authentication, Workbox
configuration, compiler and bundler failures, test exit-code propagation, and
HTTP behavior. They also relocate the executable and remove its original
assets to verify that it serves the embedded files independently.

`bun run build` does not run tests. Bare `bun test` does not compile ReScript or
build deployment assets; use the package's `bun run test` workflow. None of
these commands deploys the executable.

## Current implementation status

The project contains Home and About pages, a manifest, service-worker
registration, revisioned Workbox precaching, and a standalone application host.
Startup navigation uses the server while online and falls back to cached About
when offline. Explicit Home and About navigation retains the selected page.

Authentication always returns Unknown, including when cookies are present.
Product workflows, local persistence, peer networking, encryption,
notifications, and offline delivery remain unimplemented. The copied product
design and reference materials are in [docs/DESIGN.md](docs/DESIGN.md).

ReScript configuration and import bindings follow the
[official installation guide](https://rescript-lang.org/docs/manual/installation/)
and [import attributes documentation](https://rescript-lang.org/docs/manual/import-from-export-to-js/#use-import-attributes).

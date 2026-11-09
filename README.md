# Link-up

Link-up is a local-first Progressive Web App (PWA) written in vanilla JavaScript,
being built to help gay men discover nearby profiles and communicate privately.
The browser is the PWA runtime. Bun installs dependencies, runs project tasks,
stages browser assets, and compiles the VPS-deployable application host.

## Prerequisites

- Bun.js

## Install dependencies

```bash
bun install
```

## Bun.js build scripts

| Command | Purpose |
| --- | --- |
| `bun run build:dev` | Bundle the application for development, then run tests. |
| `bun run start:dev` | Bundle for development, run tests, then start the local host from source. |
| `bun run deploy:prod` | Bundle for production and run tests. Deployment is currently a TODO. |

For local development, run `bun run start:dev` and open the URL printed at startup.
The host listens on `127.0.0.1` with an operating-system-assigned port. Public
hosting and TLS configuration are outside the current implementation.

### Before production deployment

Run `bun run deploy:prod` and deploy the resulting `dist/link-up` only if the
command succeeds (exit code 0). Automatic deployment is currently a TODO.
All three commands test after bundling and stop if bundling or tests fail.
Bare `bun test` runs the test suite without bundling first.

## Current implementation status

The current checkout contains public default, Home, Profiles, and About pages,
a web app manifest, service-worker registration, automated tests, and the
full-stack executable build pipeline. Build output is generated in `dist/`.
Authentication is not implemented; all current pages are publicly accessible.
Profiles provides a selector for placeholder map, grid, and list views.

The service worker uses bundled Workbox precaching with content revisions.
Startup navigation to `/`, `/default`, and `/default.html` uses the network,
falling back to cached `/` if the request fails. Profiles and About are
precached and served cache-first; Home is excluded from precaching. See
[Service-Worker Cache Design](docs/DESIGN.md#service-worker-cache-design).

Profile creation, local persistence, geographic discovery, search, peer
networking, encryption, messaging, and notifications remain unimplemented.
The design keeps authoritative user data and essential logic on-device while
requiring network access for product functionality. The planned interaction-blocking
overlay for sustained network loss is not yet implemented.

## Project documentation

- [Design and architecture](docs/DESIGN.md)
- [Implementation roadmap](docs/ROADMAP_Detailed.md)
- [Two-device prototype sprint](docs/Speed_Sprint_Detailed.md)
- [Network and search decisions](docs/network-search-decisions.md)

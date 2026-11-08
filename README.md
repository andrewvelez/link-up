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
| `bun run builds` | Build `dist/link-up`, the full-stack executable that embeds and serves the PWA. Does not run tests. |
| `bun run tests` | Build `dist/link-up`, then run the Bun test suite. Use this before production deployment. |
| `bun run starts` | Build and start the local host from source. Does not run tests. |

For local development, run `bun run starts` and open the URL printed at startup.
The host listens on `127.0.0.1` with an operating-system-assigned port. Public
hosting and TLS configuration are outside the current implementation.

### Before production deployment

Run `bun run tests` and deploy the resulting `dist/link-up` only if the command
succeeds (exit code 0). A successful `bun run builds` alone does not establish
that tests pass. No separate build is needed after a successful test run.

Use `bun run tests`, not bare `bun test`, for this workflow: the package script
builds before testing. None of these commands deploys the executable.

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

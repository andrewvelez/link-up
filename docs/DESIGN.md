# Link-up Project Design

Link-up is first and foremost, a free messenger.  Communication between people should be free [https://reticulum.network/zenofreticulum.html].  Private data remains private unless given express permission.  No data is sold or used otherwise.  Link-up is an app helping people to connect for dating with a focus on gay men looking for gay men.  Eventually, it may be an umbrella app for a series of web properties each with their own branding.

Link-up targets $0 ongoing operating costs at launch, with any later costs small enough for limited ad revenue to cover. Limited ad spots are the only planned revenue source.

## Contents

- [Architecture](#architecture)
- [Product Features](#product-features): [Locality](#locality), [Profiles](#profiles), [Messaging](#messaging)
- [Application Lifecycle](#application-lifecycle)
- [Build and Delivery](#build-and-delivery)
- [Project Structure](#project-structure)

## Architecture

Link-up is a local-first, mobile-first Progressive Web App (PWA). Its user interface uses vanilla JavaScript, HTML, Milligram CSS, and standard browser and PWA APIs. The browser is the PWA runtime; Bun installs dependencies, runs project tasks, stages browser assets, and compiles the application host. The working-prototype design favors peer-to-peer exchange wherever practical.

### Local Authority and Storage

Link-up is hard local-first. Its essential business logic executes locally, and its authoritative user data remains under the user's control.

User-owned data, including profile data and images, has its definitive copy on the user's device. This data must remain encrypted. It may be replicated elsewhere when required for sharing or search without displacing the local definitive copy.

Application data that is not user-owned is also stored locally first. It may be synchronized with a backend when it is not shipped as static data. Geographic reference data changes slowly enough to be shipped statically; when its size makes that impractical, it can be segmented by locality and cached on demand.

Local application data will be stored through [granthdb](https://granthlabs.github.io/), using SQLite/WASM with OPFS persistence and an IndexedDB fallback. The schema, data lifecycle, and user-controlled export path have not yet been decided.

The local application boundary is distinct from the external peer boundary:

```text
Link-up PWA ↔ granthdb ↔ SQLite/WASM ↔ OPFS (IndexedDB fallback)

Link-up peer ↔ untrusted network and signalling/relay infrastructure ↔ Link-up peer
```

The integration between local application storage and Converse's message persistence remains an open decision.

### Network Infrastructure and P2P

Peer connections may require signalling, and some connection designs may require relays. Link-up therefore accepts remote signalling and relay infrastructure. Discovery, synchronization, and notification delivery may also rely on remote services as those designs are resolved. These systems must not become the authoritative home of the application or its data.

Peer-to-peer operation is an architectural preference rather than a requirement to eliminate all backend infrastructure. When a backend is necessary, it may replicate or synchronize data without replacing the user's local definitive copy.

The peer transport has not yet been selected. If direct peer connections are used, their privacy implications and whether relay-only connections are required must be resolved before peer networking ships.

### Application and Deployment Runtime

Link-up runs in supported browsers and as an installed PWA, within the browser security model. Browser and installed-PWA capabilities must account for platform support.

The production deployment artifact is `dist/link-up`, a full-stack executable for VPS deployment. It embeds the completed PWA assets and serves them through its local HTTP routes. Its current host listens on `127.0.0.1` with an operating-system-assigned port (`port: 0`) and logs the selected URL at startup; any public VPS-facing proxy or TLS arrangement is outside this project's current design.

All shipped application source lives under `src/`, organized by responsibility: `web/` contains the browser application, and `server/` contains the executable host. The build copies `web/` into `dist/` and stages third-party browser assets from `node_modules/` into `dist/external/`, preserving browser asset URLs. `dist/` is generated build output and is never edited directly.

### Server and Browser Responsibilities

| Responsibility | Link-up browser application | Link-up server |
| --- | --- | --- |
| Routing | Page navigation and any client-side route handling | Matching HTTP requests to page, asset, or API handlers |
| Requests and responses | Making network requests and processing results; service-worker interception | Receiving HTTP requests and returning responses |
| Shared processing | Application initialization, browser events, and service-worker hooks | Middleware around HTTP handlers, such as authentication, validation, and logging |
| UI and data | Rendering the interface, managing local state, and keeping authoritative user data | Serving application assets and providing supporting network capabilities |

The Bun host uses Bun's native HTTP APIs. A server framework would be evaluated for the Bun host independently of browser libraries. Adding server middleware does not require a browser framework or move essential application logic and authoritative data off-device.

## Product Features

### Locality

See [Locality design](locality-design.md) for geographic constraints, components, search, caching, update rules, and service exclusions.

A user's profile location must remain useful for locality search while exposing only the precision the user permits. The privacy amount is configurable. The initial policy model supports two modes: users who choose locality privacy are represented at city-level precision, while users who choose precise location may be represented within a few meters. The design must not expose a more precise profile location than the selected mode permits.

### Profiles

Users can create and update their locally stored Link-up profile.

Users can share their profiles with other Link-up users and view profiles that other users share with them. The Profiles page displays search results. The information included in a profile has not yet been decided.

### Messaging

Users can send and receive private messages with other Link-up users using [Converse](https://conversejs.org/docs/), the selected browser XMPP library. Message history is stored locally on the user's device. XMPP messaging infrastructure must preserve the local-authority boundary described above.

The installed PWA can integrate with platform notifications where supported. How messages or notifications reach a user while Link-up is not active, the XMPP server and connection configuration, and how messages are encrypted have not yet been decided.

## Application Lifecycle

### Application Initialization

`src/web/js/appInit.js` is the shared browser entry point loaded by the default page, Home, Profiles, and About. Its scope is shared listener setup and service-worker registration. Keep feature logic, persistence, networking, and page-specific behavior in separate modules; this entry point calls their initialization functions when needed.

### Connectivity

The application requires network access for all functionality. Local-first refers to local data authority and execution.

After sustained loss of network connectivity, a shaded overlay covers the current page, blocks interaction, and states “The app is offline.” The underlying page remains in place. The overlay disappears automatically when connectivity resumes. Brief interruptions, such as a ten-second drop, do not trigger it.

### Service-Worker Cache Design

Link-up uses [Workbox precaching](https://developer.chrome.com/docs/workbox/modules/workbox-precaching) to make application resources available offline. The build bundles Workbox into the service worker and injects an asset manifest containing URLs and content revisions. The service worker passes this manifest to `precacheAndRoute(self.__WB_MANIFEST)`.

During installation, Workbox downloads new or changed resources and reuses unchanged cached resources. During activation, it removes precache entries that are absent from the current manifest. Requests matching the precache use Workbox's cache-first behavior: cached responses are served first, with a network fallback if a required cache entry is missing. Requests outside the precache use the network unless another service-worker route handles them. The initial page load uses the network while the service worker installs.

The `version` property in `package.json` is the authoritative application version, using `MAJOR_VERSION.YYYYMMDD`. GitHub Actions updates the date after branch pushes using the push date in `America/New_York`; the major number changes manually. Workbox manages precache identity and invalidation through the generated asset revisions. The browser registers the service worker at `./sw.min.js` and uses the service-worker update lifecycle to install and activate changed builds.

The manifest has one stable start URL, `/`, which serves `default.html`. The default page, Home, Profiles, and About are publicly accessible; no authentication is required.

The service worker sends startup navigation to the server and serves cached `/` if the network request fails. The build maps `default.html` to `/` in the precache manifest and excludes Home from precaching. Profiles and About remain precached.

## Build and Delivery

`bun run build` performs these stages in order:

1. In `clean()`, delete `dist/` if it exists.
2. In `copyBuildFiles()`, copy the PWA pages, manifest, and static assets from `src/web/` into `dist/`, then stage HTMX and Milligram from `node_modules/` into `dist/external/`.
3. In `bundle()`, bundle and minify `src/web/sw.js` and Workbox into the intermediate `dist/sw.js`, inject the Workbox asset manifest to produce `dist/sw.min.js`, then remove `dist/sw.js`.
4. Compile `src/server/server.js` and its route-embedded assets into `dist/link-up`.

`bun run start` performs the same build and starts `src/server/server.js` for local development. Neither `build` nor `start` runs tests.

**Before production deployment, run `bun run test`.** This command performs the same build, then runs the Bun test suite and returns its exit code. A build failure stops the command before tests run. Deploy the resulting `dist/link-up` only when the command succeeds (exit code 0); do not deploy after a build or test failure. No separate build is needed after a successful test run.

Bare `bun test` runs the test suite without the build step provided by `bun run test`. None of these commands deploys the executable; deployment is a separate step.

## Project Structure

```text
.
├── build.js
├── bun.lock
├── jsconfig.json
├── package.json
├── docs/
│   ├── DESIGN.md
│   └── archived/
│       └── locality-diagram.png
├── src/
│   ├── web/
│   │   ├── about.html
│   │   ├── default.html
│   │   ├── home.html
│   │   ├── profiles.html
│   │   ├── manifest.json
│   │   ├── sw.js
│   │   ├── icons/
│   │   ├── js/
│   │   │   ├── appInit.js
│   │   │   └── profiles.js
│   │   └── styles/
│   │       └── global.css
│   └── server/
│       ├── routes.js
│       └── server.js
├── test/
│   ├── app.test.js
│   ├── build.test.js
│   └── sw.test.js
└── dist/                         generated
    ├── external/                 staged third-party browser assets
    │   ├── htmx.min.js
    │   └── milligram.min.css
    └── link-up                   VPS deployment executable
```

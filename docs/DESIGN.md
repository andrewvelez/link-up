# Link-Up Architecture Chat 4

## Current Architectural Position

Link-Up is intended to be a privacy-centered gay dating and social application whose core experience remains free. Revenue should come from ancillary commerce, sponsorships, advertising, events, and partnerships rather than restricting basic dating functionality.

The central technical goal is to determine whether users can safely contribute meaningful runtime resources so operating cost does not grow like a conventional centralized dating service. This does not remove central services. It narrows their role.

The current direction is:

```text
Central services establish authority, safety, and rendezvous.
Installed Link-Up PWAs own the application runtime and local state.
Authorized peers communicate directly where practical.
The web-native frontend remains a thin interface.
```

Link-Up is now intended to become a full Progressive Web App. The browser-installed PWA is the primary application runtime and user-facing install target.

## Product and Installation Model

The public website is the entry, trust, onboarding, download, recovery, and update surface:

```text
visit link-up.com
join or download
install and launch Link-Up
use the app without visible browser or local-server details
```

### Installation

Installation should use the Progressive Web App manifest, service worker, HTTPS delivery, browser storage, and PWA lifecycle as first-class application architecture.

The manifest tells the browser how Link-Up should appear and launch when installed, including its name, icon, start URL, display mode, scope, and related metadata.

Link-Up is local-first where browser capabilities allow it. The installed PWA owns the user-facing runtime, local browser state, app-shell caching, update lifecycle, and communication with Link-Up services. Service workers are required for app-shell caching, controlled updates, fetch handling, and eventual offline-tolerant behavior.

The installed PWA is the real application surface. It should launch directly into the application page without exposing browser chrome, local server details, ports, certificates, node terminology, or other implementation details.

The frontend should remain thin:

```text
HTML
CSS
small JavaScript modules
forms and user interaction
browser storage
HTTP requests
WebSocket events
```

The PWA and supporting services should own:

```text
application state
local browser persistence
identity and cryptography
presence
permissions
blocks and reports
peer networking where browser APIs support it
synchronization
media caching
communication with Link-Up services
```

The browser PWA runtime is the application host. Any native or local helper should be optional and explicitly justified.

## Authority and Network Roles

Link-Up remains client-heavy and server-light, not serverless.

The installed PWA should perform as much safe work as practical within browser constraints, including local computation, browser storage, rendering support, encryption, direct peer communication, and authorized media or message transfer.

Remote Link-Up services remain necessary for functions that require shared authority or reliable public reachability:

- Account bootstrap, recovery, and updates.
- Identity and session authority.
- Rendezvous and signaling.
- Capability issuance and validation.
- Profile visibility and presence authorization.
- Blocks, reports, moderation, and abuse controls.
- Exact-location protection.
- Durable reconciliation and fallback.
- Network and cost measurements.

The remote service should be the authority, referee, rendezvous point, and fallback. It should not become the default engine for work that browser-installed clients can safely perform.

## Presence and Profile Model

The earlier idea that nearby clients would carry and redistribute signed profile envelopes has been superseded.

The current rule is:

> Profiles are live presence objects, not replicated content.

A profile is discoverable only while its owner chooses to be visible, normally while actively using Link-Up. Other clients should not cache or relay strangers' profiles as distributed storage.

Profile transfer must be encrypted and constrained by current visibility, audience, block, and location rules. A user may explicitly request permission to save another profile. If the owner approves, that approval should become a scoped, signed, expiring, revocable, and auditable capability.

Revocation can prevent future access, synchronization, or updates. It cannot erase screenshots, exports, memories, or copies made outside Link-Up.

This model reduces retained sensitive data, scraping exposure, breach impact, and the moderation scope of a distributed profile archive. It does not remove the need for safety controls, metadata minimization, reporting, rate limits, fake-user detection, or legal compliance.

## Location and Locality

Location remains the core organizing primitive.

Link-Up should use H3 geocells as the atomic unit of location. H3 resolution should adapt to local density rather than using uniformly sized cells. Dense areas may use small cells; rural areas may use larger cells. The objective is a useful number of nearby visible users, not uniform physical dimensions.

Discovery should expand locally:

```text
current geocell
adjacent geocells
neighborhood
city
metro
```

Exact coordinates should remain private whenever possible. Product language should favor approximate locality such as “nearby” or “in your area” over unnecessarily precise distances.

Locality should also guide rendezvous, routing hints, static-data caching, backup placement, abuse detection, and recovery.

## Data Model

The browser PWA should use browser-managed storage for local application state. IndexedDB is the default candidate for structured local data unless an implementation experiment proves a better browser-native option.

The existing three-part classification remains useful:

- Public data is user-approved data that may be disclosed to an authorized audience. Public does not mean globally visible.
- Private data is user-owned or derived data the application may use but should not expose directly to peers.
- Internal data is operational state required to coordinate and protect the system.

Static internal data, such as geodata, boundaries, protocol constants, and localization files, can be content-addressed, signed, and cached near likely demand.

Dynamic internal state, such as rendezvous records, moderation queues, capability logs, and reconciliation state, may use append-only events, checkpoints, and replicated backups while retaining an authoritative home.

The storage principle remains:

> Global addressability, local availability.

That principle now applies primarily to static internal data, authorized user-owned data, media explicitly transferred between participants, and recoverable operational state—not to ambient replication of live profiles.

## Peer Communication

WebRTC and RTCDataChannel remain the likely direct peer transport for authorized app data and media. Signaling may use WebSocket, HTTPS, or another appropriate rendezvous protocol. TURN relay may be required when direct connections fail or when a privacy mode requires relay-only communication.

Peer communication must not become unrestricted broadcast. Access should be controlled through encrypted, signed, scoped, expiring capabilities and envelopes. Peers may transport authorized data, but transport does not grant authority or permission.

The exact division between direct delivery, relay, mailbox fallback, and durable synchronization has not yet been decided.

## Technology Direction

The current implementation direction is:

```text
Bun.js tooling and local development server
plain JavaScript
JSDoc only where useful
tsc/checkJs for static checking
HTML and CSS
small browser JavaScript modules
PWA manifest
service worker
browser storage
few dependencies
no React
no TypeScript source
```

Bun remains a coherent choice for development tooling and possible Link-Up service implementation, but the PWA runtime must not depend on a required local Bun process.

Go remains a possible future choice for remote, long-lived control-plane services if operational needs justify it. No decision has been made to introduce it.

Htmx remains available as a possible UI tool, but the current repository does not yet establish a final frontend interaction or rendering model.

## Current Repository State

The repository is an early executable and UI-shell prototype, not yet a full PWA.

Current runtime flow:

```text
build.js
  clean
  typecheck
  compile src/main.js into dist/linkup

dist/linkup
  start Bun.serve
  serve route assets
  return 404 for unknown routes
```

The public build commands are:

```text
bun ./build.js build
bun ./build.js start
```

`build` cleans, typechecks, and compiles the executable. Its test runner is currently disabled. `start` performs the build, starts the compiled executable on the first available port from 3000 through 3009, waits for it to respond, and remains attached to the server process.

The implemented source layout is currently:

```text
build.js
src/
  main.js
  routes.js
public/
  landing page
  application page
  styles.css
  manifest
```

`src/main.js` is the local HTTP entrypoint. `src/routes.js` currently maps:

```text
/     -> public landing page
/app  -> application page
```

The separate routes establish a public landing surface and an application surface. The browser assets currently contain only a minimal landing page, an application shell, styling, and a manifest.

The manifest currently supports basic installation metadata. The app still needs a production service worker, cache strategy, offline shell, install verification, update lifecycle, and browser-storage model before it is a full working PWA.

## Work Completed So Far

The project has established:

- A JavaScript-only Bun project with `checkJs`.
- A standalone compiled executable as the normal runtime artifact.
- A build flow that keeps `build` and `start` as the public commands.
- Synchronous cleanup and typechecking subprocesses where practical.
- Local server startup with port fallback and readiness verification through the compiled executable.
- A local TLS configuration for the Bun server.
- A dedicated local core entrypoint and route module.
- Separate landing-page and app routes.
- A minimal web UI shell using Bulma.
- Basic PWA manifest and service-worker experiments.
- JavaScript-only service-worker checking without TypeScript-specific source annotations.
- Project rules favoring small modules, useful native JavaScript annotations, synchronous APIs where appropriate, and deletion over unnecessary abstraction.

No application data model, identity system, geocell implementation, peer transport, browser-storage layer, moderation system, or remote authority service has been implemented in the current source tree.

## Development Goals

The next architectural work should move from the executable shell toward the smallest complete PWA foundation.

Likely areas of work are:

1. Define the full PWA runtime model and remove WebView/local-node assumptions that no longer apply.
2. Implement and verify a production manifest, service worker, app-shell cache, launch behavior, update lifecycle, offline fallback, and browser-storage boundaries.
3. Establish local browser persistence and define ownership of identity, settings, and cached media.
4. Define the minimum account bootstrap and recovery relationship with `link-up.com`.
5. Define presence, visibility, and saved-profile capability semantics.
6. Define the H3-based privacy-preserving location flow.
7. Build a minimal rendezvous and signaling path.
8. Prove one authorized peer-to-peer interaction with a clear fallback path.
9. Add block, report, and revocation behavior before broad discovery.
10. Measure what work peers perform and what remote cost is avoided.

The MVP should prove more than packaging or a dating UI. It should test whether an installed Link-Up PWA can safely perform meaningful application work while remote services retain authority and safety controls.

## Decisions Still Open

The existing discussions do not settle:

- The exact PWA runtime, install, launch, cache, and update model.
- The exact browser API and event protocol.
- The browser-storage schema.
- The identity and key-ownership model.
- The remote service language and deployment architecture.
- The H3 resolution and density thresholds.
- The signaling protocol and rendezvous topology.
- The scope of TURN use.
- Message durability and offline delivery behavior.
- Media-transfer, storage, and retention rules.
- The exact saved-profile capability lifecycle.
- The frontend rendering approach and the role of htmx.
- Update signing, distribution, and recovery details.
- The MVP's numerical cost and peer-contribution success criteria.

These should remain open until each can be decided from a concrete product requirement, threat model, or implementation experiment.

## Working Architecture Statement

```text
Link-Up is an installed Progressive Web App with a web-native UI.

The website brings users into the network.
The installed PWA owns local runtime and state.
Remote services provide authority, safety, rendezvous, and fallback.
Profiles exist as encrypted, permissioned live presence.
Peers communicate directly only when authorized.
Location organizes discovery without exposing unnecessary precision.
The MVP must measure whether browser-installed clients materially reduce central cost.
```

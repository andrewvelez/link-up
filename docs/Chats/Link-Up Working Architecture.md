# Link-Up Architecture Chat 4

## Current Architectural Position

Link-Up is intended to be a privacy-centered gay dating and social application whose core experience remains free. Revenue should come from ancillary commerce, sponsorships, advertising, events, and partnerships rather than restricting basic dating functionality.

The central technical goal is to determine whether users can safely contribute meaningful runtime resources so operating cost does not grow like a conventional centralized dating service. This does not remove central services. It narrows their role.

The current direction is:

```text
Central services establish authority, safety, and rendezvous.
Installed Link-Up nodes own the application runtime and local state.
Authorized peers communicate directly where practical.
The web-native frontend remains a thin interface.
```

Link-Up should feel as approachable as a website or PWA, but the intended application is not ultimately a browser-owned PWA. It is an installed local-node application with a web-native UI.

## Product and Installation Model

The public website is the entry, trust, onboarding, download, recovery, and update surface:

```text
visit link-up.com
join or download
install and launch Link-Up
use the app without visible browser or local-server details
```

The installed application is the real runtime. It should open a chrome-less WebView containing local HTML, CSS, and JavaScript assets. Users should not see `localhost`, ports, certificates, node terminology, or other implementation details.

The frontend should remain thin:

```text
HTML
CSS
small JavaScript modules
forms and user interaction
local HTTP requests
local WebSocket events
```

The local core should own:

```text
application state
local persistence
identity and cryptography
presence
permissions
blocks and reports
P2P networking
synchronization
media caching
local HTTP and WebSocket APIs
communication with Link-Up services
```

WebView is the UI host, not the application runtime.

## Authority and Network Roles

Link-Up remains client-heavy and server-light, not serverless.

The installed local node should perform as much safe work as practical, including local computation, storage, rendering support, encryption, direct peer communication, and authorized media or message transfer.

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

The remote service should be the authority, referee, rendezvous point, and fallback. It should not become the default engine for work that local nodes can safely perform.

## Presence and Profile Model

The earlier idea that nearby clients would carry and redistribute signed profile envelopes has been superseded.

The current rule is:

> Profiles are live presence objects, not replicated content.

A profile is discoverable only while its owner chooses to be visible, normally while actively using Link-Up. Other nodes should not cache or relay strangers' profiles as distributed storage.

Profile transfer must be encrypted and constrained by current visibility, audience, block, and location rules. A user may explicitly request permission to save another profile. If the owner approves, that approval should become a scoped, signed, expiring, revocable, and auditable capability.

Revocation can prevent future access, synchronization, or updates. It cannot erase screenshots, exports, memories, or copies made outside Link-Up.

This model reduces retained sensitive data, scraping exposure, breach impact, and the moderation scope of a distributed profile archive. It does not remove the need for safety controls, metadata minimization, reporting, rate limits, fake-user detection, or legal compliance.

## Location and Locality

Location remains the core organizing primitive.

Link-Up should use density-adaptive geocells as social proximity units rather than fixed-size map tiles. Dense areas may use small cells; rural areas may use larger cells. The objective is a useful number of nearby visible users, not uniform physical dimensions.

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
Bun.js local core
plain JavaScript
JSDoc only where useful
tsc/checkJs for static checking
HTML and CSS
small browser JavaScript modules
few dependencies
no React
no TypeScript source
```

Bun is a coherent choice for the local-node MVP because it can provide the local server, WebSocket support, filesystem and SQLite access, JavaScript tooling, and standalone executable compilation.

Go remains a possible future choice for remote, long-lived control-plane services if operational needs justify it. No decision has been made to introduce it.

Htmx remains available as a possible UI tool, but the current repository does not yet establish a final frontend interaction or rendering model.

## Current Repository State

The repository is an early executable and UI-shell prototype, not yet the full network architecture.

Current runtime flow:

```text
build.js
  clean
  typecheck
  run tests
  compile src/core.js into dist/linkup

dist/linkup
  start Bun.serve
  serve route assets
  return 404 for unknown routes
```

The public build commands are:

```text
bun ./build.js prod
bun ./build.js test
```

`prod` cleans, typechecks, tests, and compiles the executable. `test` performs the same work, starts the compiled executable, waits for it to respond, and opens the application in a browser.

The implemented source layout is currently:

```text
build.js
src/
  core.js
  routes.js
web/
  index.html
  spa.html
  registerServiceWorker.js
  sw.js
  styles.css
  manifest.json
```

`src/core.js` is the local HTTP core. `src/routes.js` currently maps:

```text
/     -> web/index.html
/app  -> web/spa.html
```

The separate routes establish a public landing surface and an application surface. The browser assets currently contain only a minimal landing page, an empty application shell, Bulma styling, a manifest, and a basic service worker.

The service worker and manifest are useful prototype scaffolding, but they do not change the intended final boundary: the installed local node should own the runtime, persistence, networking, and background behavior.

## Work Completed So Far

The project has established:

- A JavaScript-only Bun project with `checkJs`.
- A standalone compiled executable as the normal runtime artifact.
- A build flow that keeps `prod` and `test` as the public commands.
- Synchronous cleanup, typechecking, and test subprocesses where practical.
- Local server startup and browser-launch verification through the compiled executable.
- A local TLS configuration for the Bun server.
- A dedicated local core entrypoint and route module.
- Separate landing-page and app routes.
- A minimal web UI shell using Bulma.
- Basic PWA manifest and service-worker experiments.
- JavaScript-only service-worker checking without TypeScript-specific source annotations.
- Project rules favoring small modules, useful native JavaScript annotations, synchronous APIs where appropriate, and deletion over unnecessary abstraction.

No application data model, identity system, geocell implementation, peer transport, persistence layer, WebView host, moderation system, or remote authority service has been implemented in the current source tree.

## Development Goals

The next architectural work should move from the executable shell toward the smallest end-to-end proof of the local-node model.

Likely areas of work are:

1. Choose the WebView or desktop host that launches the compiled local core and displays the embedded UI without browser chrome.
2. Define the local HTTP and WebSocket boundary between the UI and core.
3. Choose local persistence, likely SQLite plus filesystem storage, and establish ownership of identity, settings, and cached media.
4. Define the minimum account bootstrap and recovery relationship with `link-up.com`.
5. Define presence, visibility, and saved-profile capability semantics.
6. Define the first geocell representation and privacy-preserving location flow.
7. Build a minimal rendezvous and signaling path.
8. Prove one authorized peer-to-peer interaction with a clear fallback path.
9. Add block, report, and revocation behavior before broad discovery.
10. Measure what work peers perform and what remote cost is avoided.

The MVP should prove more than packaging or a dating UI. It should test whether an installed Link-Up node can safely perform meaningful application work while remote services retain authority and safety controls.

## Decisions Still Open

The existing discussions do not settle:

- The WebView or desktop application host.
- The exact local API and event protocol.
- The local database schema.
- The identity and key-ownership model.
- The remote service language and deployment architecture.
- The geocell algorithm and density thresholds.
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
Link-Up is an installed local-node application with a web-native UI.

The website brings users into the network.
The installed app owns local runtime and state.
Remote services provide authority, safety, rendezvous, and fallback.
Profiles exist as encrypted, permissioned live presence.
Peers communicate directly only when authorized.
Location organizes discovery without exposing unnecessary precision.
The MVP must measure whether user-operated nodes materially reduce central cost.
```

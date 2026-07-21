# Link-Up Design

## Current Model

Link-Up is a privacy-centered gay dating and social application whose core experience remains free. Revenue should come from commerce, sponsorships, advertising, events, and partnerships rather than restricting basic dating features.

Link-Up is currently a JavaScript, Bun, and Progressive Web App (PWA) project. Users visit it in a browser and may install it as a PWA. Native packaging is not a requirement.

The architectural goal is to learn how much useful work clients can safely perform so central operating costs do not grow like those of a conventional dating service. Link-Up will still need central services for shared authority, public reachability, safety, and recovery.

The browser application provides the interface and handles work that can safely remain with the user, including:

- Interface and temporary UI state.
- Local encrypted data where practical.
- Presence and peer communication.
- Media processing and transfer where practical.
- Synchronization with peers and Link-Up services.

Bun supports the build process and server-side JavaScript. Remote services handle work that needs shared authority or reliable public availability, including:

- Account bootstrap and recovery.
- Identity and session authority.
- Rendezvous and signaling.
- Visibility and capability validation.
- Blocks, reports, moderation, and abuse controls.
- Exact-location protection.
- Durable fallback and reconciliation.
- Updates to shared application data.

The exact boundary between browser, peer, and remote-service responsibilities should be decided through small implementation experiments. The goal is not to eliminate servers, but to avoid making them perform work that clients can safely perform.

## Presence and Profiles

Profiles are live presence objects, not replicated public content.

A profile is discoverable only while its owner chooses to be visible, normally while actively using Link-Up. Clients should not retain or relay strangers' profiles as a distributed archive.

Profile access must respect visibility, audience, block, and location rules. A saved profile should require the owner's approval through a scoped, expiring, revocable capability.

Revocation can prevent future access and updates. It cannot erase screenshots, exports, or copies made outside Link-Up.

## Location

Location is the main discovery primitive. Link-Up should use H3 geocells whose size adapts to local density: smaller cells in dense areas and larger cells in sparse areas.

Discovery should expand outward only as needed:

```text
current geocell
adjacent geocells
neighborhood
city
metro
```

Exact coordinates should remain private whenever possible. Product language should favor approximate descriptions such as “nearby” over precise distance.

Location may also help with routing, caching, abuse detection, and recovery, but those uses remain to be proven.

## Data

User data includes identity, keys, profiles, messages, media, settings, and application history. It should be encrypted and remain under the user's control.

The browser storage model, backup model, and key-management design are still open. The chosen design should support deliberate export, transfer, restoration, and deletion without treating disposable browser cache as the only copy of important data.

Data falls into three broad groups:

- **Public:** Data the user permits an authorized audience to see. Public does not mean visible to everyone.
- **Private:** User-owned or derived data that should not be exposed to peers.
- **Internal:** Operational data needed to run and protect the system.

Static shared data may be content-addressed, signed, and cached near demand. Dynamic shared state needs an authoritative home even when peers help distribute or back it up.

The storage principle is:

> Global addressability, local availability.

This applies to static shared data, authorized user data, transferred media, and recoverable operational state—not to ambient replication of live profiles.

## Peer Communication

Peer communication may use WebRTC, WebSocket, relays, or browser-compatible libp2p transports. Experiments should determine which transports work reliably in the PWA.

Communication must be encrypted and permissioned. Peer transport does not grant access to the data it carries.

The division between direct delivery, relay, offline delivery, and durable synchronization remains open.

## Technology Direction

```text
JavaScript
Bun
Progressive Web App
HTML and CSS
small browser modules
service worker and web app manifest
browser-compatible peer networking
JSDoc where useful
tsc/checkJs for static checking
few dependencies
no React
no TypeScript source
```

Browser constraints should be tested directly. Htmx is available, but the frontend rendering approach remains open.

## Current Repository State

The repository contains an early Bun-served PWA shell:

- `build.js` cleans, type-checks, and compiles `src/main.js`.
- `src/main.js` starts the Bun HTTPS server.
- `src/routes.js` serves the landing page, application page, and static assets.
- `public/` contains the HTML, CSS, JavaScript, manifest, icons, and service worker.
- `/` is the landing page and `/app` is the application page.
- `src/p2pNode.js` contains an early libp2p experiment but is not connected to the application flow.
- Automated tests cover profile rendering, application routes, and required PWA assets.

Public commands:

```text
bun run build
bun run test
bun run start
```

No complete application data model, identity system, geocell implementation, peer workflow, encrypted storage layer, moderation system, or remote authority service has been implemented.

### Testing

Tests are organized by scope:

- `test/Specs/` contains browser-driven UI specifications.
- `test/Behaviors/` contains service and application behavior tests.
- `test/Units/` contains isolated unit tests.

Current test counts are tracked in `test/TEST_PYRAMID.md`.

## Development Priorities

1. **Complete:** Make the existing PWA shell functional and testable.
2. Define the smallest useful profile, presence, and discovery flow.
3. Choose and test browser storage and encryption boundaries.
4. Connect one browser-compatible peer transport to the application.
5. Add the minimum rendezvous and signaling service.
6. Prove one authorized peer interaction with a clear fallback path.
7. Add block, report, and revocation behavior before broad discovery.
8. Measure client contribution and avoided server cost.

The MVP should test the architecture, not only the interface. It should measure useful client work, reliability, and server cost.

## Open Decisions

- Browser storage, encrypted data, backup, and key ownership.
- Identity and account recovery.
- H3 resolution and density thresholds.
- Browser-compatible peer transports.
- Signaling, rendezvous, relay, and TURN use.
- Offline message delivery and durability.
- Media transfer, storage, and retention.
- Saved-profile capability lifecycle.
- Frontend rendering and the role of htmx.
- PWA update and recovery behavior.
- Numerical MVP targets for reliability, cost, and peer contribution.

These decisions should be made from product requirements, threat models, and implementation results rather than filled in speculatively.

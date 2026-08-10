# Link-Up Project Design

## Architecture

The smallest and most simple decision in architecture is typically the right one.

For the Link-Up project, JavaScript is "good enough". I believe most technical decisions should be made to "good enough".  In all domains, "good enough" should include code that is correct.  In certain domains, "good enough" might mean "feature complete" (think NASA), or "safety features complete" (think a bank).  For this app, the simple decision is JavaScript, which is "good enough".


### Frontend / Backend
---

Link-Up is a mobile-first, installable web application delivered as a PWA. It
uses the hard local-first model described below: authoritative user data and
essential application logic remain on the user's device. Peer-to-peer
networking is a means of exchanging data, but data sovereignty — not
eliminating every server — is the architectural goal.

The frontend uses htmx; Link-Up does not use hyperscript. Small in-page
behaviors that don't warrant a full hypermedia round-trip are implemented as
plain JavaScript event listeners. Link-Up is a hypermedia-driven application
(HDA).

1. #### Genesis:

    > *"thesis: MPA - multi-page application*
    > 
    > *antithesis: SPA - single-page application*
    > 
    > *synthesis: HDA - hypermedia-driven application*
    > 
    > *— @htmx_org"*


#### Local-First

I like to think there are two definitions of "local-first".  First, the *soft* definition:  Local-first software keeps data on the local client machine and uses servers as redundant backups or replication to other clients.  Then, there's the *hard* definition:  Local-first software keeps all user's data with the user.  The user defines where and when that data can be shared.  This app is using the second definition.

#### Network Infrastructure & P2P

Link-Up's authoritative user data and essential logic remain on the user's
device. Browser peer connections require signalling, and some connections
require a TURN relay. Link-Up therefore accepts remote signalling and relay
infrastructure. Discovery, synchronization, and push delivery may also rely on
remote services as those designs are resolved. These systems must not become
the authoritative home of the application or its data.

Direct WebRTC connections expose peer IP addresses. Whether Link-Up permits
direct connections or requires TURN-relay-only connections for privacy remains
open and must be resolved before peer networking ships.

Locally, Link-Up is served by a service worker acting as a local
hypermedia server (see Local Hypermedia Server, below): it answers the
frontend's htmx requests with HTML fragments backed by on-device storage, so
local UI and data workflows behave the same way whether or not a network is
reachable.

### Local Hypermedia Server

htmx needs something that answers `fetch()` requests with HTML fragments; it
does not require that something to be a process listening on a socket.
Link-Up's service worker (`web/sw.js`) is that something: it precaches the
application shell on install, then intercepts same-origin `/api/*` requests,
reads and writes the user's data in IndexedDB, and returns HTML fragments —
including htmx response headers such as `HX-Trigger` — exactly as a remote
server would. Every other request is served from the cache, with in-scope
navigations falling back to the cached shell. The PWA shell must first be
delivered from a trustworthy web origin. Once installed and cached, the service
worker can serve it offline while browser storage remains intact. Because
browsers may evict Cache API and IndexedDB data, Link-Up must request persistent
storage where supported and provide a user-controlled export path.

### Current Proof-of-Concept Boundary

The current proof of concept covers the installable PWA shell and local
hypermedia layer only. Peer discovery, signalling, relaying, WebRTC,
cryptographic identity, encryption, and offline delivery are not implemented
or validated by it.

### PWA UI

The browser is Link-Up's user-interface runtime. The same web application runs
in a browser tab or as an installed PWA on mobile and desktop. The service
worker answers local hypermedia requests in both modes.

```text
Link-Up hypermedia-driven web application
└── browser or installed PWA
    └── page ↔ service worker ↔ on-device storage
```

## Project Structure

```text
features/
└── Cucumber specifications and step definitions

web/
├── index.html          landing/install page
├── app.html             hypermedia application (htmx)
├── app.js                shared client script: SW lifecycle, install prompt, in-page behavior
├── sw.js                 service worker: precache + local hypermedia router
├── styles.css
├── manifest.webmanifest
├── vendor/
│   └── htmx.min.js       vendored, not npm-installed
└── icons/
```

Application code currently lives under `web/`. The service worker owns the
local hypermedia routes and on-device persistence; page scripts own browser UI
behavior and the PWA installation lifecycle.

## Local Authority

Link-Up is hard local-first. Its essential business logic executes
locally, and its authoritative user data remains under the user's control.
Remote systems can provide discovery, signalling, relaying, synchronization,
or other network capabilities, but they remain non-authoritative
infrastructure. Peer-to-peer describes one way Link-Up devices exchange data;
it does not define the local-first guarantee.

The local UI boundary is distinct from the external peer boundary:

```text
Link-Up page ↔ service worker ↔ on-device storage

Link-Up peer ↔ untrusted network and signalling/relay infrastructure ↔ Link-Up peer
```

## Product Features

### Profiles

Users can create and update a Link-Up profile. A user's own profile is stored
locally using the storage available in the browser or installed app.

Users can share their profiles with other Link-Up users and view profiles that
other users share with them. The information included in a profile has not yet
been decided.

### Messaging

Users can send and receive private messages with other Link-Up users. Message
history is stored locally on the user's device.

The installed web app can show system notifications. Receiving a new-message
notification while the PWA is closed requires push infrastructure. How users
connect, how messages reach an offline user, and how messages are encrypted
have not yet been decided.

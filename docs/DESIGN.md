# Link-Up Project Design Doc July 2026

## Architecture

Link-Up uses the JavaScript Core Pattern. The Link-Up web application is a
single-page application that owns the domain rules, state, workflows, and user
interface. It runs on the Web Platform in a browser or WebView.

The browser or WebView is the user-interface runtime. Bun-WebUI is a
replaceable adapter that creates that runtime for the installed application. It
is not the Link-Up application core and does not own Link-Up domain logic.

```text
Link-Up JavaScript SPA
└── WebUI adapter
    └── Bun-WebUI
        └── installed browser or WebView
```

The adapter uses Bun-WebUI's command bridge for fast communication between the
SPA and its installed host. Link-Up operations exposed across that boundary
must be narrowly scoped rather than providing general access to privileged
host capabilities.

### Link-Up UI Architecture Diagram
<img src="./link-up-model-view-adapter.svg" width="800" />

### Link-Up Domain Objects Diagram
<img src="./ports-adapters-10-spokes.png" width="800" />

## Web Application

The web application has two pages:

- `web/index.html` is the PWA landing page. It introduces Link-Up and provides
  the entry point for opening or installing the application.
- `web/app.html` runs the main Link-Up SPA.

The same SPA is used whether Link-Up runs in a regular browser, an installed
browser, or a WebView created through the WebUI adapter.

## Project Structure

```text
features/
└── Cucumber specifications and step definitions

src/
├── WebUI/
├── Network/
├── Data/
└── other Link-Up domains as they are introduced

web/
├── index.html
└── app.html
```

Code under `src/` is organized by domain. Ports are stable JavaScript
contracts, and environment-specific adapters implement those contracts.
Operating systems, devices, storage, networks, services, and native hosts stay
at these replaceable edges.

The JavaScript core must not import native bridges, infrastructure SDKs, or
platform packages directly. An adapter is selected when the application starts
and domain code communicates through its contract.

## Local Authority

Link-Up is local-first and peer-to-peer. Its essential business logic executes
locally, and its authoritative user data remains under the user's control.
Remote systems may provide discovery, relaying, synchronization, or other
network capabilities, but they are not the location of the application.

The local UI boundary is distinct from the external peer boundary:

```text
SPA ↔ local adapter ↔ browser or WebView

Link-Up peer ↔ untrusted network ↔ Link-Up peer
```

## Initial Product Features

### Profiles

Users can create and update a Link-Up profile. A user's own profile is stored
locally using the storage available in the browser or installed app.

Users can share their profiles with other Link-Up users and view profiles that
other users share with them. The information included in a profile has not yet
been decided.

### Messaging

Users can send and receive private messages with other Link-Up users. Message
history is stored locally on the user's device.

The installed app can use native notifications to tell a user when a new
message arrives. How users connect, how messages reach an offline user, and
how messages are encrypted have not yet been decided.

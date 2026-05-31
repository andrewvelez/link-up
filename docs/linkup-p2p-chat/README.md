# LinkUp P2P Chat Demo

Minimal SPA instant messaging demo using modern JavaScript, Bun, htmx, Web Components, and WebRTC `RTCDataChannel`.

The Bun process does two things only:

1. Serves the SPA/static files.
2. Provides a WebSocket signaling endpoint so browsers can exchange WebRTC offers, answers, and ICE candidates.

Chat messages do **not** go through Bun. Once connected, messages move over the browser-to-browser WebRTC data channel.

## Setup

```sh
bun install
bun run dev
```

Open `http://localhost:3000` in two browser tabs.

In tab 1, click **Create room**.

In tab 2, enter the same room ID and click **Join room**.

Then send messages between tabs.

## Bun dependency commands

These are the Bun-native commands that correspond to the included `package.json` dependencies:

```sh
bun add htmx.org
bun add -d @types/bun typescript
```

## Checks

```sh
bun run typecheck
bun test
bun run check
```

## Project layout

```text
public/
  index.html                    # SPA shell; htmx loads the chat fragment
  static/
    app.css
    app.js                      # browser module entrypoint
    config.js                   # WebRTC ICE config
    components/                 # Web Components
    lib/                        # signaling + WebRTC session code
    state/                      # tiny observable store
src/
  app.js                        # Bun fetch handler + static file serving + WS upgrade
  server.js                     # Bun.serve entrypoint
  fragments/chat.html           # htmx-loaded custom element fragment
  signaling/room-hub.js         # signaling-only room hub
test/
  app.test.js
  room-hub.test.js
```

## Notes

This is intentionally a two-peer demo. The signaling hub rejects a third peer in the same room.

`public/static/config.js` defaults to `iceServers: []`, which is good for local development and avoids sending ICE traffic to a third-party STUN server. For internet/NAT testing, add your own STUN/TURN servers there. For privacy-sensitive modes, prefer TURN relay-only configuration.

This is not production identity, discovery, moderation, persistence, or abuse control. Those remain server-authoritative concerns in the larger LinkUp architecture.

# Link-Up Project Design Doc July 2026

## Background

The original design doc described a Bun.js PWA with a strong preference to be fully P2P if possible. The web UI app also should be local first. The GUI will be rendered by a chromeless browser and the data stored and managed locally. To be fully serverless, it would be necessary to cache the full app at first hit and keep the cache indefinitely unless a versioned cache-buster was used. Designs previous to that were for a Bun.js single file executable for portability reasons.

## Current Use Cases

These are the use cases in priority.

1. Android mobile device (or tablet)
2. iPhone mobile device (or iPad)
3. MacOS desktop
4. Windows desktop
5. Linux desktop

As of right now, it is unclear where mobile web fits, so it is not included.

## Challenges

Bun.js only made sense when it was being used as the web app runtime. The benefits of Bun.js came from its API, JavaScriptCore, and additional optimizations. A fully P2P app would not be running on a Node.js/Bun.js style event loop model. The app would be closer to a single HTML file for an SPA. This uses the JavaScript engine in the browser and loses all the benefits of Bun.js.

The technological pièce de résistance is that the app is P2P, locally stored, and served directly from the user’s device. From that goal, a shared SPA inside native application containers is crucial. Packaging the SPA as a single HTML file is a useful deployment choice. This leads to Tauri 2 with Vite+.

## New Design

The app is an SPA delivered in a single file with assets embedded. This is done with a Vite-compatible single-file build plugin used through Vite+. The frontend application is delivered as a self-contained HTML file. In installed mode, it runs alongside the Tauri host, its configuration, permissions, plugins, and platform packaging files. The native app containers are provided by Tauri 2.

```text
Browser version
└── dist/index.html
    Runs directly on domain.com

Installed version
└── Tauri embeds dist/index.html
    Runs inside the native WebView
```

Capabilities of SPA modes:

```text
Shared SPA
├── Browser mode
│   ├── IndexedDB
│   ├── OPFS
│   ├── browser geolocation
│   └── browser networking
│
└── Tauri mode
    ├── Tauri filesystem
    ├── SQLite
    ├── native notifications
    └── other Tauri plugins
```

Calls to Tauri APIs must sit behind platform adapters. The browser build cannot execute Tauri plugin calls, but the rest of the JavaScript application can be identical.

## Initial Product Features

### Profiles

Users can create and update a Link-Up profile. A user’s own profile is stored
locally using the storage available in the browser or installed app.

Users can share their profiles with other Link-Up users and view profiles that
other users share with them. The information included in a profile has not yet
been decided.

### Messaging

Users can send and receive private messages with other Link-Up users. Message
history is stored locally on the user’s device.

The installed app can use native notifications to tell a user when a new
message arrives. How users connect, how messages reach an offline user, and
how messages are encrypted have not yet been decided.

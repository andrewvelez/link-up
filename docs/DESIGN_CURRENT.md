# Link-Up Project Design Doc July 2026

## Background

The original design doc described a Bun.js PWA with a strong preference to be fully P2P if possible.  The web UI app also should be local first.  The GUI will be rendered by a chromeless browser and the data stored and managed locally.  To be fully serverless, it would be necessary to cache the full app at first hit and keep the cache indefinitely unless a versioned cache-buster was used.  Designs previous to that were for a Bun.js single file executable for portability reasons.

## Current Use Cases

These are the use cases in priority.

1. Android mobile device (or tablet)
2. iPhone mobile device (or iPad)
3. MacOS desktop
4. Windows desktop
5. Linux desktop

* As of right now, I'm not sure where "mobile web" (users using the browser on their mobile device without installing) fits in so I'm leaving it out.

## Challenges

Bun.js only made sense when it was being used as the web app runtime.  The benefits of Bun.js came from its API, JavaScriptCore, and additional optimizations.  A fully P2P app would not be running on a Node.js/Bun.js style event loop model.  The app would be closer to a single HTML file for an SPA.  This uses the js engine in the browser and loses all the benefits of Bun.js.

The technological _pièce de résistance_ is that the app is P2P, locally stored, and served directly from the user’s device.  From that goal, a shared SPA inside native application containers is crucial. Packaging the SPA as a single HTML file is a useful deployment choice.  This leads to a tech combo like Tauri 2 with Vite+.

## New Design

The app is an SPA delivered in a single file with assets embedded.  This can be done with a Vite-compatible single-file build plugin used through Vite+.  The frontend application is delivered as a self-contained HTML file. In installed mode, it runs alongside the Tauri host, its configuration, permissions, plugins, and platform packaging files.  The native app containers will be provided by Tauri 2.

The same SPA:
<pre>
Browser version
└── dist/index.html
    Runs directly on domain.com

Installed version
└── Tauri embeds dist/index.html
    Runs inside the native WebView
</pre>

Capabilities of SPA modes:
<pre>
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
</pre>

* Calls to Tauri APIs must therefore sit behind platform adapters. The browser build cannot execute Tauri plugin calls, but the rest of the JavaScript application can be identical.

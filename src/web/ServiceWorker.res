/**
 * @author Andrew Velez
 * @license MIT
 * @description Revisioned cache-first assets with a network-only startup and offline About fallback.
 */
@scope("self") @val external manifest: array<Workbox.entry> = "__WB_MANIFEST"

let matchesStartup = (context: Workbox.context) => {
  context.request.mode == "navigate" &&
    (context.url.pathname == "/" || context.url.pathname == "/Default.html")
}

Workbox.registerRoute(
  matchesStartup,
  Workbox.networkOnly({plugins: [Workbox.fallback({fallbackURL: "/about.html"})]}),
)
Workbox.precacheAndRoute(manifest, {directoryIndex: ""})

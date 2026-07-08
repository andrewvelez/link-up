// @author Andrew Velez 2026

const CACHE_NAME = "link-up-static-v1";
const ASSET_PATHS = [
  "/",
  "/index",
  "/index.html",
  "/app",
  "/manifest.webmanifest",
  "/install.js",
  "/registerServiceWorker.js",
  "/sw.js",
  "/reset.css",
  "/bulma.css",
  "/styles.css",
  "/icons/linkup-192.png",
  "/icons/linkup-512.png",
  "/images/linkup-background.png",
];
const ASSET_SET = new Set(ASSET_PATHS);

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSET_PATHS)),
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET" || url.origin !== location.origin) {
    return;
  }

  if (ASSET_SET.has(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/app")));
  }
});

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) return cachedResponse;

  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());

  return response;
}

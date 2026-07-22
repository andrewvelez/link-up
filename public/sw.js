/**
 * SPDX-FileCopyrightText: 2026 Andrew Velez
 * SPDX-License-Identifier: GPL-3.0-or-later
 * @author Andrew Velez
 * @summary the service worker
 */


const cacheName = "link-up-static-__CACHE_VERSION__";
const assetPaths = [
  "/",
  "/index",
  "/index.html",
  "/app",
  "/manifest.webmanifest",
  "/js/install.js",
  "/js/registerServiceWorker.js",
  "/sw.js",
  "/css/reset.css",
  "/css/bulma.css",
  "/css/styles.css",
  "/icons/linkup-192.png",
  "/icons/linkup-512.png",
  "/images/linkup-background.png",
];
const assetSet = new Set(assetPaths);

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(assetPaths))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(name => name.startsWith("link-up-static-") && name !== cacheName)
          .map(name => caches.delete(name)),
      ))
      .then(() => clients.claim()),
  );
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET" || url.origin !== location.origin) {
    return;
  }

  if (assetSet.has(url.pathname)) {
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
  const cache = await caches.open(cacheName);
  cache.put(request, response.clone());

  return response;
}

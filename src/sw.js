/**
 * @license SPDX-License-Identifier: MIT
 * Copyright (c) 2026 Andrew Velez
 * @desc Link-Up browser PWA offline application-shell service worker.
 */

const cacheName = "link-up-shell-__BUILD_VERSION__";
const precachePath = "/precache.json";

self.addEventListener("install", (event) => {
  event.waitUntil(
    fetch(precachePath, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load the PWA asset list.");
        return response.json();
      })
      .then((assets) => caches.open(cacheName)
        .then((cache) => cache.addAll(
          assets.map((asset) => new Request(asset, { cache: "reload" })),
        ))),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name.startsWith("link-up-shell-") && name !== cacheName)
          .map((name) => caches.delete(name)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/")
        .then((cached) => cached || offlineResponse())),
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cached) => cached || fetch(request))
      .catch(offlineResponse),
  );
});

function offlineResponse() {
  return new Response("Offline and not cached.", {
    status: 504,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

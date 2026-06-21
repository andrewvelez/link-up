/**
 * service worker
 * @author Andrew Velez 2026
 */

/// <reference lib="webworker" />

// @ts-expect-error This file runs in a service worker, not a window.
const worker = /** @type {ServiceWorkerGlobalScope} */ (globalThis);

/** @type {string} */
const CACHE_NAME = "link-up-v1";

/** @type {Array<string>} */
const ASSETS = [
  "/",
  "/index.html",
];

/**
 * @param {string} pathname
 * @returns {boolean}
 */
function isApiPath(pathname) {
  return pathname === "/api" || pathname.startsWith("/api/");
}

/**
 * @param {Request} request
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    await cache.put(request, response.clone());
  }

  return response;
}

/** @param {ExtendableEvent} event */
worker.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
});

/** @param {FetchEvent} event */
worker.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (
    event.request.method !== "GET" ||
    url.origin !== worker.location.origin ||
    isApiPath(url.pathname)
  ) {
    return;
  }

  event.respondWith(cacheFirst(event.request));
});

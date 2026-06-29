/**
 * service worker
 * @author Andrew Velez 2026
 */

const CACHE_NAME = "link-up-v1";

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

self.addEventListener("install", (event) => {
  Reflect.get(event, "waitUntil").call(event,
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
});

self.addEventListener("fetch", (event) => {
  const request = Reflect.get(event, "request");
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== location.origin ||
    isApiPath(url.pathname)
  ) {
    return;
  }

  Reflect.get(event, "respondWith").call(event, cacheFirst(request));
});

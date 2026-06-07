const CACHE_NAME = "link-up-v1";

const ASSETS = [
  "/",
  "/index.html",
];

/** @param {string} pathname */
function isApiPath(pathname) {
  return pathname === "/api" || pathname.startsWith("/api/");
}

/** @param {Request} request */
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
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
});

/** @param {FetchEvent} event */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (
    event.request.method !== "GET" ||
    url.origin !== location.origin ||
    isApiPath(url.pathname)
  ) {
    return;
  }

  event.respondWith(cacheFirst(event.request));
});
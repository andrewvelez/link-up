const CACHE_NAME = "link-up-v1";
const ASSETS = ["/", "/index.html", "/styles.css", "/app.js", "/manifest.json"];

self.addEventListener("install", (e) => {
  // @ts-ignore
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener("fetch", (e) => {
  // @ts-ignore
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
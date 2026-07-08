/**
 * all routes defined here
 * @author Andrew Velez 2026
 */

import indexHtml from "../public/index.html";
import appHtml from "../public/app.html";

/**
 * @param {string} path
 * @param {string} contentType
 */
function asset(path, contentType) {
  return () => new Response(Bun.file(path), {
    headers: {
      "Content-Type": contentType,
    },
  });
}

export const routes = {
  "/": indexHtml,
  "/index": indexHtml,
  "/index.html": indexHtml,
  "/app": appHtml,
  "/manifest.webmanifest": asset("./public/manifest.webmanifest", "application/manifest+json"),
  "/install.js": asset("./public/install.js", "text/javascript; charset=utf-8"),
  "/registerServiceWorker.js": asset("./public/registerServiceWorker.js", "text/javascript; charset=utf-8"),
  "/sw.js": asset("./public/sw.js", "text/javascript; charset=utf-8"),
  "/reset.css": asset("./public/reset.css", "text/css; charset=utf-8"),
  "/bulma.css": asset("./public/bulma.css", "text/css; charset=utf-8"),
  "/styles.css": asset("./public/styles.css", "text/css; charset=utf-8"),
  "/icons/linkup-192.png": asset("./public/icons/linkup-192.png", "image/png"),
  "/icons/linkup-512.png": asset("./public/icons/linkup-512.png", "image/png"),
  "/images/linkup-background.png": asset("./public/images/linkup-background.png", "image/png"),
};

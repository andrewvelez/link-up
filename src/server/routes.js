/**
 * @author Andrew Velez
 * @license MIT
 * @description Defines routes for the PWA files embedded in the executable.
 */

import about from "../../dist/about.html" with { type: "file" };
import appInitialization from "../../dist/js/appInit.js" with { type: "file" };
import login from "../../dist/default.html" with { type: "file" };
import profiles from "../../dist/profiles.html" with { type: "file" };
import profileViews from "../../dist/js/profiles.js" with { type: "file" };
import home from "../../dist/home.html" with { type: "file" };
import manifest from "../../dist/manifest.json" with { type: "file" };
import serviceWorker from "../../dist/sw.min.js" with { type: "file" };
import htmx from "../../dist/external/htmx.min.js" with { type: "file" };
import icon192 from "../../dist/icons/192x192.png" with { type: "file" };
import icon24 from "../../dist/icons/24x24.png" with { type: "file" };
import icon48 from "../../dist/icons/48x48.png" with { type: "file" };
import icon512 from "../../dist/icons/512x512.png" with { type: "file" };
import icon192Named from "../../dist/icons/icon_192.png" with { type: "file" };
import icon24Named from "../../dist/icons/icon_24.png" with { type: "file" };
import icon48Named from "../../dist/icons/icon_48.png" with { type: "file" };
import icon512Named from "../../dist/icons/icon_512.png" with { type: "file" };
import styles from "../../dist/styles/global.css" with { type: "file" };
import milligramStyles from "../../dist/external/milligram.min.css" with { type: "file" };

/**
 * @description Serves an embedded file for GET and HEAD requests.
 * @param {string} path The embedded file path.
 * @returns {Object} A Bun route with GET and HEAD handlers.
 */
function asset(path) {
  const handler = () => new Response(Bun.file(path));
  return { GET: handler, HEAD: handler };
}

export const routes = {
  "/": asset(login),
  "/default": asset(login),
  "/default.html": asset(login),
  "/home": asset(home),
  "/home.html": asset(home),
  "/profiles": asset(profiles),
  "/profiles.html": asset(profiles),
  "/js/profiles.js": asset(profileViews),
  "/about": asset(about),
  "/about.html": asset(about),
  "/js/appInit.js": asset(appInitialization),
  "/manifest.json": asset(manifest),
  "/icons/192x192.png": asset(icon192),
  "/icons/24x24.png": asset(icon24),
  "/icons/48x48.png": asset(icon48),
  "/icons/512x512.png": asset(icon512),
  "/icons/icon_192.png": asset(icon192Named),
  "/icons/icon_24.png": asset(icon24Named),
  "/icons/icon_48.png": asset(icon48Named),
  "/icons/icon_512.png": asset(icon512Named),
  "/external/htmx.min.js": asset(htmx),
  "/styles/global.css": asset(styles),
  "/external/milligram.min.css": asset(milligramStyles),
  "/sw.min.js": asset(serviceWorker),
  "/*": () => new Response("Not found", { status: 404 }),
};

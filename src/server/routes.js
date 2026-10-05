/**
 * @author Andrew Velez 2026
 * @license SPDX-License-Identifier: MIT
 * @description Defines routes for the PWA files embedded in the executable.
 */

import about from "../../dist/about.html" with { type: "file" };
import appInitialization from "../../dist/js/appInitialization.js" with { type: "file" };
import home from "../../dist/home.html" with { type: "file" };
import manifest from "../../dist/manifest.json" with { type: "file" };
import serviceWorker from "../../dist/sw.js" with { type: "file" };
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
import picoStyles from "../../dist/external/pico.cyan.min.css" with { type: "file" };

import { AuthenticationState, getAuthenticationState } from "./authentication.js";

/**
 * @description Serves an embedded file for GET and HEAD requests.
 * @param {string} path The embedded file path.
 * @returns {Object} A Bun route with GET and HEAD handlers.
 */
function asset(path) {
  return {
    GET: () => new Response(Bun.file(path)),
    HEAD: () => new Response(Bun.file(path)),
  };
}

/**
 * @description Selects the startup page for a supported authentication state.
 * @param {import("./authentication.js").AuthenticationStateValue} state The authentication state.
 * @returns {string} The page filename relative to the application root.
 * @throws {Error} If the authentication state is unsupported.
 */
export function getStartPage(state) {
  if (state === AuthenticationState.Unknown) {
    return "about.html";
  } else if (state === AuthenticationState.Known || state === AuthenticationState.Authenticated) {
    return "home.html";
  } else {
    throw new Error("Unsupported authentication state.");
  }
}

/**
 * @description Redirects startup requests using the server authentication API.
 * @param {Request} request The incoming startup request.
 * @returns {Promise<Response>} A temporary redirect to the selected page.
 */
async function redirectStartup(request) {
  const state = await getAuthenticationState(request);
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/${getStartPage(state)}`,
      "Cache-Control": "no-store",
    },
  });
}

const startup = { GET: redirectStartup, HEAD: redirectStartup };

export const routes = {
  "/": startup,
  "/Default.html": startup,
  "/home": asset(home),
  "/home.html": asset(home),
  "/about": asset(about),
  "/about.html": asset(about),
  "/js/appInitialization.js": asset(appInitialization),
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
  "/external/pico.cyan.min.css": asset(picoStyles),
  "/sw.js": asset(serviceWorker),
  "/*": () => new Response("Not found", { status: 404 }),
};

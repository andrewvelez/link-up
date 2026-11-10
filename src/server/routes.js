/**
 * @author Andrew Velez
 * @license MIT
 * @description Defines routes for the PWA files embedded in the executable.
 */

import about from "../../dist/about.html" with { type: "file" };
import appInitialization from "../../dist/js/appInit.js" with { type: "file" };
import login from "../../dist/default.html" with { type: "file" };
import loginComponent from "../../dist/components/login.js" with { type: "file" };
import profiles from "../../dist/profiles.html" with { type: "file" };
import profileViews from "../../dist/js/profiles.js" with { type: "file" };
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

import mockupArtwork from "../../dist/icons/mockup.svg" with { type: "file" };

const pages = {
  Default: login,
  Profiles: profiles,
  About: about,
};

const assets = {
  appInitialization,
  loginComponent,
  profileViews,
  manifest,
  serviceWorker,
  htmx,
  icon192,
  icon24,
  icon48,
  icon512,
  icon192Named,
  icon24Named,
  icon48Named,
  icon512Named,
  styles,
  milligramStyles,
  mockupArtwork,
};

/**
 * @description Serves an embedded file for GET and HEAD requests.
 * @param {string} path The embedded file path.
 * @returns {Object} A Bun route with GET and HEAD handlers.
 */
function asset(path) {
  const handler = () => new Response(Bun.file(path));
  return { GET: handler, HEAD: handler };
}

function redirect(path) {
  const handler = () => new Response(null, { status: 302, headers: { Location: path } });
  return { GET: handler, HEAD: handler };
}

export const routes = {
  "/": asset(pages.Default),
  "/default": redirect("/"),
  "/default.html": redirect("/"),
  "/index": redirect("/"),
  "/index.html": redirect("/"),
  "/Profiles": asset(pages.Profiles),
  "/profiles": redirect("/Profiles"),
  "/profiles.html": redirect("/Profiles"),
  "/About": asset(pages.About),
  "/about": redirect("/About"),
  "/about.html": redirect("/About"),
  "/components/login.js": asset(assets.loginComponent),
  "/js/profiles.js": asset(assets.profileViews),
  "/js/appInit.js": asset(assets.appInitialization),
  "/manifest.json": asset(assets.manifest),
  "/icons/mockup.svg": asset(assets.mockupArtwork),
  "/icons/192x192.png": asset(assets.icon192),
  "/icons/24x24.png": asset(assets.icon24),
  "/icons/48x48.png": asset(assets.icon48),
  "/icons/512x512.png": asset(assets.icon512),
  "/icons/icon_192.png": asset(assets.icon192Named),
  "/icons/icon_24.png": asset(assets.icon24Named),
  "/icons/icon_48.png": asset(assets.icon48Named),
  "/icons/icon_512.png": asset(assets.icon512Named),
  "/external/htmx.min.js": asset(assets.htmx),
  "/styles/global.css": asset(assets.styles),
  "/external/milligram.min.css": asset(assets.milligramStyles),
  "/sw.min.js": asset(assets.serviceWorker),
  "/*": () => new Response("Not found", { status: 404 }),
};

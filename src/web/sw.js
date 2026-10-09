/**
 * @author Andrew Velez
 * @license MIT
 * @description Precaches the PWA and serves each asset cache-first by revisioned URL.
 */

import { PrecacheFallbackPlugin, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkOnly } from "workbox-strategies";

registerRoute(
  ({ request, url }) => request.mode === "navigate" && url.pathname === "/",
  new NetworkOnly({
    plugins: [new PrecacheFallbackPlugin({ fallbackURL: "/" })],
  }),
);

precacheAndRoute(self.__WB_MANIFEST, { directoryIndex: "" });

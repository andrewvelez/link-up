/**
 * core.js - the app api layer
 * by: Andrew Velez 2026
 */

import { routes } from "./routes.js";

Bun.serve({
  hostname: "127.0.0.1",
  port: 3000,
  tls: {
    key: Bun.file("./key.pem"),
    cert: Bun.file("./cert.pem"),
  },
  routes,
  /** @returns {Response} */
  fetch() {
    return new Response("Not Found", { status: 404 });
  },
});

console.log("Listening on http://127.0.0.1:3000");

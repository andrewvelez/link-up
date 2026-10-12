/**
 * @author Andrew Velez
 * @license MIT
 * @description Serves the embedded Link-up PWA from its standalone executable.
 */

import { routes } from "./routes.js";

const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  routes: routes,
});

console.log(`Link-up running at ${server.url}`);

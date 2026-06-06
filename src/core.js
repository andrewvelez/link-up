import { routes } from "./routes.js";

Bun.serve({
  port: 3000,
  routes: routes,
  fetch() {
    return new Response("Not Found", { status: 404 });
  },
});

console.log("Listening on http://127.0.0.1:3000");
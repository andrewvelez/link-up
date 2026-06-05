import { assets } from "./assets.js";

Bun.serve({
  port: 3000,

  fetch(req) {
    const path = new URL(req.url).pathname;

    if (path.startsWith("/api/")) {
      // API handling
    }

    const asset = assets[path];

    return asset !== undefined
      ? new Response(asset)
      : new Response("Not Found", { status: 404 });
  },
});
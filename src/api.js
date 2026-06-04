/**
 * @typedef {object} State
 * @property {Array<object>} users
 */

/** @type {Map<string, import("bun").Blob>} */
const assets = new Map();

for (const file of Bun.embeddedFiles) {
  // Strips the "web/" prefix to match URL paths
  const path = file.name.replace(/^web\//, "");
  assets.set(path === "" ? "index.html" : path, file);
}

Bun.serve({
  port: 3000,
  /** @param {Request} req */
  fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname === "/" ? "index.html" : url.pathname.slice(1);

    // 1. Handle API routes
    if (path.startsWith("api/")) {
      return new Response(JSON.stringify({ message: "Hello from API" }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. Handle Static Assets (Embedded)
    const asset = assets.get(path);
    if (asset) {
      return new Response(asset, {
        headers: { "Content-Type": asset.type }
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});


  console.log("API listening on http://127.0.0.1:4510");
}

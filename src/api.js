// @ts-check

/** @type {Map<string, Blob>} */
const assets = new Map();

for (const file of Bun.embeddedFiles) {
  const path = file.name.replace(/^web\//, "");
  assets.set(path, file);
}

Bun.serve({
  port: 3000,

  /**
   * @param {Request} req
   */
  fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname === "/" ? "index.html" : url.pathname.slice(1);

    if (path.startsWith("api/")) {
      return Response.json({
        message: "Hello from API",
      });
    }

    const asset = assets.get(path);

    if (asset) {
      return new Response(asset, {
        headers: {
          "Content-Type": asset.type || "application/octet-stream",
        },
      });
    }

    return new Response("Not Found", {
      status: 404,
    });
  },
});

console.log("Listening on http://127.0.0.1:3000");
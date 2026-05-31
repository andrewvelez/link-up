/**
 * HTTP app for the P2P chat demo.
 * Bun serves static files and hosts a signaling-only WebSocket endpoint.
 * by: Andrew Velez
 */

import { extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createRoomHub } from "./signaling/room-hub.js";

const DEFAULT_PUBLIC_DIR = new URL("../public/", import.meta.url);
const DEFAULT_FRAGMENT_DIR = new URL("./fragments/", import.meta.url);
const HTMX_FILE = new URL("../node_modules/htmx.org/dist/htmx.min.js", import.meta.url);

/**
 * @typedef {object} AppOptions
 * @property {URL | string} [publicDir]
 * @property {URL | string} [fragmentDir]
 * @property {ReturnType<typeof createRoomHub>} [hub]
 */

/**
 * @param {AppOptions} [options]
 */
export function createHandler(options = {}) {
  const publicDir = toPath(options.publicDir ?? DEFAULT_PUBLIC_DIR);
  const fragmentDir = toPath(options.fragmentDir ?? DEFAULT_FRAGMENT_DIR);
  const htmxPath = toPath(HTMX_FILE);
  const hub = options.hub ?? createRoomHub();

  return {
    /**
     * @param {Request} request
     * @param {import("bun").Server | undefined} server
     */
    fetch(request, server) {
      const url = new URL(request.url);

      if (url.pathname.startsWith("/signal/")) {
        return upgradeSignalSocket(request, server, url);
      }

      if (url.pathname === "/health") {
        return Response.json({ ok: true });
      }

      if (url.pathname === "/static/vendor/htmx.min.js") {
        return fileResponse(htmxPath, "application/javascript; charset=utf-8");
      }

      if (url.pathname === "/fragments/chat.html") {
        return safeFileResponse(fragmentDir, "chat.html");
      }

      const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
      return safeFileResponse(publicDir, pathname);
    },

    websocket: {
      /** @param {import("bun").ServerWebSocket<{ roomId: string, peerId: string }>} ws */
      open(ws) {
        hub.add(ws);
      },

      /**
       * @param {import("bun").ServerWebSocket<{ roomId: string, peerId: string }>} ws
       * @param {string | ArrayBuffer | Uint8Array} message
       */
      message(ws, message) {
        hub.forward(ws, message);
      },

      /** @param {import("bun").ServerWebSocket<{ roomId: string, peerId: string }>} ws */
      close(ws) {
        hub.remove(ws);
      },
    },
  };
}

/**
 * @param {Request} request
 * @param {import("bun").Server | undefined} server
 * @param {URL} url
 */
function upgradeSignalSocket(request, server, url) {
  if (!server) return new Response("WebSocket server unavailable.", { status: 500 });

  const roomId = decodeURIComponent(url.pathname.slice("/signal/".length)).trim();
  const peerId = url.searchParams.get("peerId")?.trim() ?? "";

  if (!roomId || !peerId) {
    return new Response("Missing roomId or peerId.", { status: 400 });
  }

  const upgraded = server.upgrade(request, { data: { roomId, peerId } });
  return upgraded ? undefined : new Response("WebSocket upgrade failed.", { status: 400 });
}

/**
 * @param {string} baseDir
 * @param {string} requestPath
 */
function safeFileResponse(baseDir, requestPath) {
  const decoded = decodeURIComponent(requestPath).replace(/^\/+/, "");
  const candidate = normalize(join(baseDir, decoded));

  if (relative(baseDir, candidate).startsWith("..")) {
    return new Response("Not found.", { status: 404 });
  }

  return fileResponse(candidate, mimeType(candidate));
}

/**
 * @param {string} path
 * @param {string} contentType
 */
function fileResponse(path, contentType) {
  const file = Bun.file(path);
  return new Response(file, {
    headers: {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}

/** @param {string} path */
function mimeType(path) {
  switch (extname(path)) {
    case ".html": return "text/html; charset=utf-8";
    case ".js": return "application/javascript; charset=utf-8";
    case ".css": return "text/css; charset=utf-8";
    case ".json": return "application/json; charset=utf-8";
    case ".svg": return "image/svg+xml";
    case ".ico": return "image/x-icon";
    default: return "application/octet-stream";
  }
}

/** @param {URL | string} value */
function toPath(value) {
  return value instanceof URL ? fileURLToPath(value) : value;
}

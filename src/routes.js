/**
 * all routes defined here
 * @author Andrew Velez 2026
 */

import indexHtml from "../public/index.html";
import appHtml from "../public/app.html";
import { readdir } from "node:fs/promises";

/**
 * @param {string} path
 * @param {string} contentType
 */
function asset(path, contentType) {
  return () => new Response(Bun.file(path), {
    headers: {
      "Content-Type": contentType,
    },
  });
}

const staticFiles = await readdir("./public", { recursive: true });

const staticRoutes = Object.fromEntries(
  staticFiles.map(staticFile => {
    const filePath = `./public/${staticFile}`;

    return [
      `/${staticFile}`,
      asset(filePath, Bun.file(filePath).type),
    ];
  }),
);

export const routes = {
  ...staticRoutes,
  "/": indexHtml,
  "/index": indexHtml,
  "/index.html": indexHtml,
  "/app": appHtml,
  "/app.html": appHtml,
};
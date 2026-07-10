/**
 * @summary all routes defined here
 * @author Andrew Velez 2026
 */

import indexHtml from "../public/index.html";
import appHtml from "../public/app.html";
import { STATIC_FILES } from "./staticFiles.js";

const staticRoutes = Object.fromEntries(
  STATIC_FILES.map(staticFile => [
    staticFile.name?.replace(/^\.?\/?public\//, "/"),
    () => new Response(staticFile, {
      headers: {
        "Content-Type": staticFile.type,
      },
    }),
  ]),
);

export const routes = {
  ...staticRoutes,
  "/": indexHtml,
  "/index": indexHtml,
  "/index.html": indexHtml,
  "/app": appHtml,
  "/app.html": appHtml,
};

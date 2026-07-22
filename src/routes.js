/**
 * SPDX-FileCopyrightText: 2026 Andrew Velez
 * SPDX-License-Identifier: GPL-3.0-or-later
 * @author Andrew Velez
 * @summary routing
 */

import indexHtml from "../public/index.html";
import { renderAppPage } from "./renderAppPage.js";
import { STATIC_FILES } from "./staticFiles.js";

async function appPage() {
  const html = await renderAppPage();

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

const staticRoutes = Object.fromEntries(
  STATIC_FILES.map(staticFile => [
    staticFile.name?.replace(/^\.?\/?public\//, "/"),
    async () => new Response(
      staticFile.name?.endsWith("/sw.js")
        ? (await staticFile.text()).replace(
          "__CACHE_VERSION__",
          Bun.env.LINK_UP_CACHE_VERSION ?? "development",
        )
        : staticFile,
      {
      headers: {
        "Content-Type": staticFile.type,
      },
      },
    ),
  ]),
);

export const routes = {
  ...staticRoutes,
  "/": indexHtml,
  "/index": indexHtml,
  "/index.html": indexHtml,
  "/app": appPage,
  "/app.html": appPage,
};

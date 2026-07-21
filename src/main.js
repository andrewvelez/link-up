/**
 * SPDX-FileCopyrightText: 2026 Andrew Velez
 * SPDX-License-Identifier: GPL-3.0-or-later
 * @author Andrew Velez
 * @summary this module is for the primary business logic (at a high level)
 */

import { routes } from "./routes.js";

function main() {
  try {
    Bun.serve({
      hostname: "127.0.0.1",
      port: Bun.env.PORT ?? 3000,
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
  } catch (error) {
    if (!(error instanceof Error) || Reflect.get(error, "code") !== "EADDRINUSE") {
      throw error;
    }

    return;
  }

  console.log(`Listening on https://127.0.0.1:${Bun.env.PORT ?? 3000}`);
}

main();

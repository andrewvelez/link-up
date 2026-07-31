#! /usr/bin/env bun
/**
 *  SPDX-License-Identifier: MIT
 *  Copyright (c) 2026 Andrew Velez
 *  Link-Up application entry point.
 */

const server = Bun.serve({
  port: 3000,

  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/api/status") {
      return Response.json({ status: "ok" });
    }

    if (request.method === "POST" && url.pathname === "/api/message") {
      const body = await request.json();

      return Response.json({
        received: body,
      });
    }

    return Response.json(
      { error: "Not found" },
      { status: 404 },
    );
  },
});

console.log(`API listening on ${server.url}`);
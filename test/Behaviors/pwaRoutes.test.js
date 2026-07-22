/**
 * SPDX-FileCopyrightText: 2026 Andrew Velez
 * SPDX-License-Identifier: GPL-3.0-or-later
 * @author Andrew Velez
 * @summary tests on the PWA route behavior
 */

import { describe, expect, test } from "bun:test";
import { routes } from "../../src/routes.js";

describe("PWA routes", () => {
  test("maps the landing-page aliases", () => {
    expect(routes["/"]).toBeDefined();
    expect(routes["/index"]).toBe(routes["/"]);
    expect(routes["/index.html"]).toBe(routes["/"]);
  });

  test.each([
    ["/app", "text/html", 'class="profile-grid"'],
    ["/manifest.webmanifest", "application/manifest+json", '"name": "Link-Up"'],
    ["/sw.js", "text/javascript", 'const cacheName = "link-up-static-development"'],
    ["/css/styles.css", "text/css", ".profile-grid"],
    ["/icons/linkup-192.png", "image/png", null],
  ])("serves %s", async (path, contentType, expectedContent) => {
    const handler = routes[path];

    expect(handler).toBeFunction();

    const response = await handler(new Request(`https://link-up.test${path}`));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain(contentType);

    if (expectedContent) {
      expect(await response.text()).toContain(expectedContent);
    }
  });

  test("leaves unknown routes for the server fallback", () => {
    expect(routes["/missing"]).toBeUndefined();
  });
});

/**
 * SPDX-FileCopyrightText: 2026 Andrew Velez
 * SPDX-License-Identifier: GPL-3.0-or-later
 * @author Andrew Velez
 * @summary tests on the basic PWA functionality
 */

import { describe, expect, test } from "bun:test";
import { Profile } from "../src/profile.js";
import { renderAppPage } from "../src/renderAppPage.js";
import { routes } from "../src/routes.js";

describe("profile rendering", () => {
  test("renders profiles into the application shell", async () => {
    const html = await renderAppPage([
      new Profile("alex", "Alex", 28, "/alex.png", "Nearby", 0, 0),
    ]);

    expect(html).toContain('data-profile-id="alex"');
    expect(html).toContain("<h2>Alex, 28</h2>");
    expect(html).not.toContain("{{PROFILE_GRID}}");
  });

  test("escapes profile text and attributes", async () => {
    const html = await renderAppPage([
      new Profile(
        'profile\" onclick=\"alert(1)',
        "<Alex>",
        28,
        'javascript:\"unsafe',
        "Coffee & music",
        0,
        0,
      ),
    ]);

    expect(html).toContain("&lt;Alex&gt;");
    expect(html).toContain("Coffee &amp; music");
    expect(html).toContain("profile&quot;");
    expect(html).not.toContain("<Alex>");
  });
});

describe("PWA routes", () => {
  test("maps the landing-page aliases", () => {
    expect(routes["/"]).toBeDefined();
    expect(routes["/index"]).toBe(routes["/"]);
    expect(routes["/index.html"]).toBe(routes["/"]);
  });

  test.each([
    ["/app", "text/html", 'class="profile-grid"'],
    ["/manifest.webmanifest", "application/manifest+json", '"name": "Link-Up"'],
    ["/sw.js", "text/javascript", 'const cacheName = "link-up-static-v1"'],
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

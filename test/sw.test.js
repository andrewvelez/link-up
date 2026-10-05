/**
 * @author Andrew Velez 2026
 * @license SPDX-License-Identifier: MIT
 * @description Tests the service worker's Workbox precache configuration.
 */

import { afterEach, describe, expect, mock, test } from "bun:test";

const originalSelf = Object.getOwnPropertyDescriptor(globalThis, "self");
const precacheAndRoute = mock(() => {});

const registerRoute = mock(() => {});
const NetworkOnly = mock(function (options) { return { options }; });
const PrecacheFallbackPlugin = mock(function (options) { return { options }; });

mock.module("workbox-precaching", () => ({ precacheAndRoute, PrecacheFallbackPlugin }));
mock.module("workbox-routing", () => ({ registerRoute }));
mock.module("workbox-strategies", () => ({ NetworkOnly }));

/**
 * @description Restores the original global service-worker scope.
 * @returns {undefined}
 */
function restoreSelf() {
  if (originalSelf) {
    Object.defineProperty(globalThis, "self", originalSelf);
  } else {
    delete globalThis.self;
  }
}

afterEach(() => {
  mock.clearAllMocks();
  restoreSelf();
});

describe("service worker", () => {
  test("passes the injected manifest to Workbox precaching", async () => {
    const manifest = [
      { revision: "app-revision", url: "js/appInitialization.js" },
      { revision: "about-revision", url: "about.html" },
    ];

    globalThis.self = { __WB_MANIFEST: manifest };

    await import(`../src/web/sw.js?test=${Date.now()}`);

    expect(precacheAndRoute).toHaveBeenCalledTimes(1);
    expect(precacheAndRoute).toHaveBeenCalledWith(manifest, {
      directoryIndex: "",
    });
    expect(registerRoute).toHaveBeenCalledTimes(1);
    expect(PrecacheFallbackPlugin).toHaveBeenCalledWith({ fallbackURL: "/about.html" });
    const [matches, strategy] = registerRoute.mock.calls[0];
    expect(strategy.options.plugins).toHaveLength(1);
    expect(strategy.options.plugins[0].options.fallbackURL).toBe("/about.html");
    for (const [path, mode, expected] of [
      ["/", "navigate", true],
      ["/Default.html", "navigate", true],
      ["/about.html", "navigate", false],
      ["/home.html", "navigate", false],
      ["/", "cors", false],
    ]) {
      expect(matches({ request: { mode }, url: new URL(path, "https://example.test") })).toBe(expected);
    }
  });
});

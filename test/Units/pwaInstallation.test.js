/**
 * SPDX-FileCopyrightText: 2026 Andrew Velez
 * SPDX-License-Identifier: GPL-3.0-or-later
 * @author Andrew Velez
 * @summary tests on PWA installation
 */

import { describe, expect, test } from "bun:test";
import { runInNewContext } from "node:vm";

describe("PWA installation", () => {
  test("reveals the install button after attaching its click handler", async () => {
    const installScript = await Bun.file(
      new URL("../../public/js/install.js", import.meta.url),
    ).text();
    /** @type {EventListener | undefined} */
    let beforeInstallPromptHandler;
    let clickHandlerAttached = false;
    let hidden = true;

    const installButton = {
      /** @param {string} eventName */
      addEventListener(eventName) {
        if (eventName === "click") clickHandlerAttached = true;
      },
      get hidden() {
        return hidden;
      },
      set hidden(value) {
        if (!value) expect(clickHandlerAttached).toBeTrue();
        hidden = value;
      },
    };

    const browserContext = {
      /** @param {string} selector */
      querySelector(selector) {
        expect(selector).toBe("#install-button");
        return installButton;
      },
    };
    const appWindow = {
      matches: false,
      addEventListener() {},
    };
    const windowContext = {
      /**
       * @param {string} eventName
       * @param {EventListener} handler
       */
      addEventListener(eventName, handler) {
        if (eventName === "beforeinstallprompt") {
          beforeInstallPromptHandler = handler;
        }
      },
    };

    runInNewContext(installScript, {
      console,
      document: browserContext,
      location: { replace() {} },
      matchMedia: () => appWindow,
      window: windowContext,
    });

    expect(hidden).toBeTrue();
    expect(beforeInstallPromptHandler).toBeFunction();

    if (!beforeInstallPromptHandler) throw new Error("Missing beforeinstallprompt handler");
    beforeInstallPromptHandler(new Event("beforeinstallprompt"));

    expect(clickHandlerAttached).toBeTrue();
    expect(hidden).toBeFalse();
  });
});

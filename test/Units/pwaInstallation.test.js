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
    const installPrompt = { hidden: true };
    const firefoxInstallInstructions = { hidden: true };

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
        return {
          "#install-prompt": installPrompt,
          "#install-button": installButton,
          "#firefox-install-instructions": firefoxInstallInstructions,
        }[selector];
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
      navigator: { userAgent: "Chromium" },
      window: windowContext,
    });

    expect(hidden).toBeTrue();
    expect(beforeInstallPromptHandler).toBeFunction();

    if (!beforeInstallPromptHandler) throw new Error("Missing beforeinstallprompt handler");
    beforeInstallPromptHandler(new Event("beforeinstallprompt"));

    expect(clickHandlerAttached).toBeTrue();
    expect(hidden).toBeFalse();
    expect(installPrompt.hidden).toBeFalse();
    expect(firefoxInstallInstructions.hidden).toBeTrue();
  });

  test("shows installation guidance in Firefox on Linux", async () => {
    const installScript = await Bun.file(
      new URL("../../public/js/install.js", import.meta.url),
    ).text();
    const installPrompt = { hidden: true };
    const installButton = { hidden: true, addEventListener() {} };
    const firefoxInstallInstructions = { hidden: true };

    runInNewContext(installScript, {
      console,
      document: {
        /** @param {string} selector */
        querySelector(selector) {
          return {
            "#install-prompt": installPrompt,
            "#install-button": installButton,
            "#firefox-install-instructions": firefoxInstallInstructions,
          }[selector];
        },
      },
      location: { replace() {} },
      matchMedia: () => ({ matches: false, addEventListener() {} }),
      navigator: { userAgent: "Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0" },
      window: { addEventListener() {} },
    });

    expect(installPrompt.hidden).toBeTrue();
    expect(installButton.hidden).toBeTrue();
    expect(firefoxInstallInstructions.hidden).toBeFalse();
  });
});

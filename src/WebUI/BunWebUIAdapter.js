/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 Andrew Velez
 * Creates a Bun-WebUI host for a Link-Up web page. This adapter currently
 * binds no operations: the service worker under `web/` serves the
 * application uniformly, in the browser and inside this window, so no
 * domain logic needs to cross the Bun-WebUI bridge. Add a bound operation
 * here only when a genuine native-only capability is needed, and keep it
 * narrowly scoped.
 */

import { WebUI } from "@webui-dev/bun-webui";

const webUI = new WebUI();

export function bind(operation, callback) {
  webUI.bind(operation, callback);
}

export function setRootFolder(path) {
  webUI.setRootFolder(path);
}

export function open(page) {
  webUI.show(page);
}

export async function wait() {
  await WebUI.wait();
}

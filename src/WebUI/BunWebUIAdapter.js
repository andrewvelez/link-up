/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 Andrew Velez
 * Creates a Bun-WebUI host for a Link-Up web page.
 */

import { WebUI } from "@webui-dev/bun-webui";

const webUI = new WebUI();

export function bind(operation, callback) {
  webUI.bind(operation, callback);
}

export function open(page) {
  webUI.show(page);
}

export async function wait() {
  await WebUI.wait();
}

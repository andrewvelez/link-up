/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 Andrew Velez
 * Creates a Bun-WebUI host for a Link-Up web page.
 */

async function createBunWebUI() {
  const { WebUI } = await import("@webui-dev/bun-webui");

  return new WebUI();
}

export class BunWebUIAdapter {
  #createWebUI;
  #webUI;

  constructor(createWebUI = createBunWebUI) {
    this.#createWebUI = createWebUI;
  }

  async #getWebUI() {
    this.#webUI ??= await this.#createWebUI();

    return this.#webUI;
  }

  async bind(operation, callback) {
    const webUI = await this.#getWebUI();
    webUI.bind(operation, callback);
  }

  async open(page) {
    const webUI = await this.#getWebUI();
    await webUI.show(page);
  }

  async wait() {
    const { WebUI } = await import("@webui-dev/bun-webui");
    await WebUI.wait();
  }
}

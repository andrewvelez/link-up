/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 Andrew Velez
 * Step definitions for the Bun-WebUI adapter specification.
 */

import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";
import { BunWebUIAdapter } from "../../src/WebUI/BunWebUIAdapter.js";

Given("a user has a page to open", function () {
  this.page = "<main>Link-Up</main>";
});

When("they request a WebUI for the page", async function () {
  const createWebUI = () => {
    this.createdWebUIs = (this.createdWebUIs ?? 0) + 1;

    return {
      show: async (page) => {
        this.openedPage = page;
      },
    };
  };
  const adapter = new BunWebUIAdapter(createWebUI);

  await adapter.open(this.page);
});

Then("a WebUI is created for the page", function () {
  assert.equal(this.createdWebUIs, 1);
  assert.equal(this.openedPage, this.page);
});

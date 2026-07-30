// SPDX-License-Identifier: UNLICENSED
// Copyright (c) 2026 Andrew Velez
// Link-Up application entry point.

import { WebUI } from "@webui-dev/bun-webui";
import applicationHtml from "./web/index.html" with { type: "text" };

const applicationWindow = new WebUI();

applicationWindow.bind("getStatus", () => "Link-Up is running");

await applicationWindow.show(applicationHtml);
await WebUI.wait();

#! /usr/bin/env bun
/**
 * @license SPDX-License-Identifier: MIT
 * @author Andrew Velez 2026
 * @desc Link-Up application lifecycle entry point.
 */

import applicationHtml from "../web/index.html" with { type: "text" };
import {
  bind,
  open,
  wait,
} from "./WebUI/BunWebUIAdapter.js";

function getStatus() {
  return "Link-Up is running.";
}

bind("getStatus", getStatus);
open(applicationHtml);
await wait();

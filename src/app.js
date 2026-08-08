#! /usr/bin/env bun
/**
 * @license SPDX-License-Identifier: MIT
 * @author Andrew Velez 2026
 * @desc Link-Up application lifecycle entry point.
 */

import {
  open,
  setRootFolder,
  wait,
} from "./WebUI/BunWebUIAdapter.js";

setRootFolder("./web");
open("app.html");
await wait();

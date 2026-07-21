/**
 * SPDX-FileCopyrightText: 2026 Andrew Velez
 * SPDX-License-Identifier: GPL-3.0-or-later
 * @author Andrew Velez
 * @summary this holds constant for all the static files in the app
 */

import { readdirSync } from "node:fs";

export const STATIC_FILES = Object.freeze(
  readdirSync("./public", { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => Bun.file(`${entry.parentPath}/${entry.name}`)),
);

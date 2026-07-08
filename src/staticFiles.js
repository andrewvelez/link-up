// @author Andrew Velez 2026
// @summary this holds constant for all the static files in the app
// which is generated dynamicall on the first instantiation

import { readdirSync } from "node:fs";

export const STATIC_FILES = Object.freeze(
  readdirSync("./public", { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => Bun.file(`${entry.parentPath}/${entry.name}`)),
);

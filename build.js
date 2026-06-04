#!/usr/bin/env bun

import { $ } from "bun";

await $`rm -f link-up`;

await $`tsc -p tsconfig.json --noEmit`;

/** @type {import("bun").BuildConfig} */
const config = {
  entrypoints: [
    "./src/api.js",
    ...new Bun.Glob("web/**").scanSync("."),
  ],

  compile: {
    target: "bun-linux-x64",
    outfile: "./link-up",
  },
};

const result = await Bun.build(config);

if (!result.success) {
  for (const message of result.logs) {
    console.error(message);
  }

  process.exit(1);
}

console.log("Built ./link-up");
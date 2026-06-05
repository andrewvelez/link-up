#!/usr/bin/env bun

import { $ } from "bun";

await $`tsc -p tsconfig.json --noEmit`;

const result = await Bun.build({
  entrypoints: ["./src/core.js"],

  compile: {
    target: "bun-linux-x64",
    outfile: "./dist/link-up",
  },
});

if (!result.success) {
  process.exit(1);
}
#!/usr/bin/env bun

import { $ } from "bun";

await $`rm -rf dist`;
await $`mkdir -p dist`;

const result = await Bun.build({
  entrypoints: ["src/app.js"],
  target: "bun",
  compile: true,
  outfile: "dist/linkup",
});

if (!result.success) {
  console.error("Build failed");

  for (const message of result.logs) {
    console.error(message);
  }

  process.exit(1);
}

console.log("Built dist/linkup");
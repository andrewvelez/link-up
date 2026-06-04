#!/usr/bin/env bun

import { $ } from "bun";

await $`rm -rf dist`;
await $`mkdir -p dist`;

/** @type {import("bun").BuildConfig} */
const config = {
  entrypoints: ["./src/api.js", ...new Bun.Glob("web/**").scanSync(".")],
  compile: {
    target: "bun-linux-x64", // Change to bun-windows-x64 or bun-darwin-arm64 as needed
    outfile: "./link-up",
  },
};

await Bun.build(config);

console.log("Built dist/linkup");
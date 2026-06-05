#! /usr/bin/env bun

import { $ } from "bun";
import { rm } from "node:fs/promises";
import { parseArgs } from "node:util";

const OUTDIR = "./dist";
const OUTFILE = `${OUTDIR}/link-up`;

async function typecheck() {
  await $`tsc -p tsconfig.json --noEmit`;
}

async function test() {
  await $`bun test`;
}

async function clean() {
  await rm(OUTDIR, {
    recursive: true,
    force: true,
  });
}

async function build() {
  await typecheck();

  const result = await Bun.build({
    entrypoints: ["./src/core.js"],

    compile: {
      target: "bun-linux-x64",
      outfile: OUTFILE,
    },
  });

  if (!result.success) {
    process.exit(1);
  }
}

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    build: { type: "boolean" },
    test: { type: "boolean" },
    clean: { type: "boolean" },
    typecheck: { type: "boolean" },
  },
});

const selected = Object.entries(values)
  .filter(([, enabled]) => enabled)
  .map(([name]) => name);

if (selected.length !== 1) {
  console.error("Usage: bun ./build.js --build | --test | --clean | --typecheck");
  process.exit(1);
}

const commands = {
  build,
  test,
  clean,
  typecheck,
};

await commands[selected[0]]();
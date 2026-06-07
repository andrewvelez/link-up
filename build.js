#!/usr/bin/env bun
/**
 * build.js - build the project in dev, test, prod
 * by: Andrew Velez 2026
 */

import { $ } from "bun";
import { rm } from "node:fs/promises";
import { parseArgs } from "node:util";

const OUTDIR = "./dist";
const OUTFILE = `${OUTDIR}/link-up`;
const ENTRYPOINT = "./src/core.js";
const APP_URL = "http://127.0.0.1:3000/";

function typecheck() {
  return $`tsc -p tsconfig.json --noEmit`;
}

function test() {
  return $`bun test`;
}

function clean() {
  return rm(OUTDIR, {
    recursive: true,
    force: true,
  });
}

function openBrowser() {
  return $`xdg-open ${APP_URL}`.quiet();
}

async function build() {
  await typecheck();

  const result = await Bun.build({
    entrypoints: [ENTRYPOINT],

    compile: {
      target: "bun-linux-x64",
      outfile: OUTFILE,
    },
  });

  if (!result.success) {
    process.exit(1);
  }
}

async function waitForServer() {
  for (;;) {
    try {
      const response = await fetch(APP_URL);

      if (response.ok) {
        return;
      }
    } catch {
      // server is not ready yet
    }

    await Bun.sleep(100);
  }
}

async function serve({ open }) {
  const server = Bun.spawn(["bun", ENTRYPOINT], {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  if (open) {
    await waitForServer();
    await openBrowser();
  }

  await server.exited;
}

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    dev: { type: "boolean" },
    start: { type: "boolean" },
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
  console.error(
    "Usage: bun ./build.js --dev | --start | --build | --test | --clean | --typecheck",
  );
  process.exit(1);
}

const commands = {
  dev: () => serve({ open: true }),
  start: () => serve({ open: true }),
  build,
  test,
  clean,
  typecheck,
};

await commands[selected[0]]();
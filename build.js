#!/usr/bin/env bun
/**
 * build.js - build the project in dev, test, prod
 * by: Andrew Velez 2026
 */

import { $ } from "bun";
import { rm } from "node:fs/promises";
import { parseArgs } from "node:util";

/** @type {string} */
const OUTDIR = "./dist";
/** @type {string} */
const OUTFILE = `${OUTDIR}/link-up`;
/** @type {string} */
const ENTRYPOINT = "./src/core.js";
/** @type {string} */
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
  clean();
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
  for (; ;) {
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

async function serve({ openBrowser }) {
  const server = Bun.spawn(["bun", ENTRYPOINT], {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  if (openBrowser) {
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

const command = commands[selected[0]];

if (!command) {
  process.exit(1);
}

await command();

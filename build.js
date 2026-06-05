#!/usr/bin/env bun

import { $ } from "bun";
import { rm } from "node:fs/promises";
import { parseArgs } from "node:util";

const OUTDIR = "./dist";
const OUTFILE = `${OUTDIR}/link-up`;
const ENTRYPOINT = "./src/core.js";
const APP_URL = "http://127.0.0.1:3000/";

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

async function openBrowser() {
  await $`xdg-open ${APP_URL}`.quiet();
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

async function dev() {
  await serve({ open: true });
}

async function start() {
  await serve({ open: true });
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
  dev,
  start,
  build,
  test,
  clean,
  typecheck,
};

await commands[selected[0]]();
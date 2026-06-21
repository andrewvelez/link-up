#! /usr/bin/env bun
/**
 * build.js - build the project in dev, test, prod
 * by: Andrew Velez 2026
 */

import { $ } from "bun";
import { rm } from "node:fs/promises";
import { parseArgs } from "node:util";


const OUTDIR = "./dist";
const OUTFILE = `${OUTDIR}/linkup`;
const ENTRYPOINT = "./src/server.js";
const PORT = Bun.env.PORT ?? "3000";
const HOST = Bun.env.HOST ?? "127.0.0.1";
const APP_URL = `http://${HOST}:${PORT}/`;
const SERVER_TIMEOUT_MS = 5_000;
const SERVER_POLL_MS = 100;


function openBrowser() {
  if (process.platform === "darwin") {
    return $`open ${APP_URL}`.quiet();
  }

  if (process.platform === "win32") {
    return $`cmd /c start "" ${APP_URL}`.quiet();
  }

  return $`xdg-open ${APP_URL}`.quiet();
}

async function waitForServer() {
  const deadline = performance.now() + SERVER_TIMEOUT_MS;

  while (performance.now() < deadline) {
    const serverIsReady = await fetch(APP_URL).then(
      (response) => response.ok,
      () => false,
    );

    if (serverIsReady) {
      return;
    }

    await Bun.sleep(SERVER_POLL_MS);
  }

  throw new Error(`Timed out waiting for server at ${APP_URL}`);
}

/** @param {string[]} commandNames */
function errorUsage(commandNames) {
  console.error(`Usage: bun ./build.js ${commandNames.join(" | ")}`);
  process.exit(1);
}


function typecheck() {
  return $`${Bun.which("tsc")} -p tsconfig.json --noEmit`;
}

function runTests() {
  return $`bun test`;
}

function clean() {
  return rm(OUTDIR, {
    recursive: true,
    force: true,
  });
}

function compile() {
  return Bun.build({
    entrypoints: [ENTRYPOINT],

    compile: {
      target: "bun-linux-x64",
      outfile: OUTFILE,
    },
  });
}

async function start() {
  const server = Bun.spawn([OUTFILE], {
    env: { ...Bun.env, NODE_ENV: "test" },
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  try {
    await waitForServer();
  } catch (error) {
    server.kill();
    throw error;
  }

  await openBrowser();
  await server.exited;
}

async function prod() {
  await clean();
  await typecheck();
  await runTests();
  await compile();
}

async function test() {
  await clean();
  await typecheck();
  await runTests();
  await compile();
  await start();
}

const commandHandlers = Object.freeze({
  prod,
  test,
});


async function main() {
  const commandNames = Object.keys(commandHandlers);

  const { positionals } = parseArgs({
    args: Bun.argv.slice(2),
    allowPositionals: true,
  });

  if (positionals.length !== 1 || !Object.hasOwn(commandHandlers, positionals[0])) {
    errorUsage(commandNames);
  }

  await commandHandlers[positionals[0]]();
}

await main();

#! /usr/bin/env bun
/**
 * build.js - build the project in dev, test, prod
 * by: Andrew Velez 2026
 */

import { $ } from "bun";
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { parseArgs } from "node:util";
import { ENVIRONMENTS } from "./src/constants.js";


const OUTDIR = "./dist";
const OUTFILE = `${OUTDIR}/linkup`;
const ENTRYPOINT = "./src/core.js";
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


function handleCommandResult({ error, status }) {
  if (error) {
    throw error;
  }

  if (status) {
    process.exit(status);
  }
}

function typecheck() {
  const result = spawnSync(Bun.which("tsc") ?? "tsc", ["-p", "tsconfig.json", "--noEmit"], {
    stdio: "inherit",
  });

  handleCommandResult(result);
}

function runTests() {
  const result = spawnSync(process.execPath, ["test"], {
    stdio: "inherit",
  });

  handleCommandResult(result);
}

function clean() {
  rmSync(OUTDIR, {
    recursive: true,
    force: true,
  });
}

function compile(nodeEnv) {
  return Bun.build({
    entrypoints: [ENTRYPOINT],
    define: {
      "process.env.NODE_ENV": JSON.stringify(nodeEnv),
    },

    compile: {
      target: "bun-linux-x64",
      outfile: OUTFILE,
    },
  });
}

async function verify() {
  await compile(ENVIRONMENTS.DEV);
  runTests();
}

async function start() {
  const server = Bun.spawn([OUTFILE], {
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
  clean();
  typecheck();
  await verify();
  await compile(ENVIRONMENTS.PROD);
}

async function dev() {
  clean();
  typecheck();
  await verify();
}

async function test() {
  clean();
  typecheck();
  await verify();
  await compile(ENVIRONMENTS.TEST);
  await start();
}

const commandHandlers = Object.freeze({
  dev,
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

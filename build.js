#! /usr/bin/env bun
// @author Andrew Velez 2026

import { $ } from "bun";
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { parseArgs } from "node:util";

const OUTDIR = "./dist";
const OUTFILE = `${OUTDIR}/linkup`;
const ENTRYPOINT = "./src/core.js";
const DEFAULT_PORT = 3000;
const HOST = Bun.env.HOST ?? "127.0.0.1";
const APP_URL = new URL(`https://${HOST}:${DEFAULT_PORT}/`);
const SERVER_TIMEOUT_MS = 5_000;
const SERVER_POLL_MS = 100;
let port = DEFAULT_PORT;

export const COMMANDS = Object.freeze({
  build,
  test
});

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
  // const result = spawnSync(process.execPath, ["test"], {
  //   stdio: "inherit",
  // });

  // handleCommandResult(result);
}

function clean() {
  rmSync(OUTDIR, {
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

async function startLocalServer() {

    for (let newPort = port; newPort < (port + 10); newPort++) {
      let server;

      try {
        APP_URL.port = String(newPort);
        server = Bun.spawn([OUTFILE], {
          env: { ...Bun.env, PORT: String(newPort) },
          stdin: "inherit",
          stdout: "inherit",
          stderr: "inherit",
        });
        await waitForServer();
      } catch {
        server?.kill();
        continue;
      }

      await openBrowser();
      await server.exited;
      return;
    }

    throw new Error("Unable to start local server");
}

async function build() {
  clean();
  typecheck();
  await compile();
  runTests();
}

async function test() {
  await build();
  await startLocalServer();
}

async function main() {
  const commandNames = Object.keys(COMMANDS);

  const { positionals } = parseArgs({
    args: Bun.argv.slice(2),
    allowPositionals: true,
  });

  if (positionals.length !== 1 || !Object.hasOwn(COMMANDS, positionals[0])) {
    errorUsage(commandNames);
  }

  await COMMANDS[positionals[0]]();
}

await main();

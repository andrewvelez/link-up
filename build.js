#! /usr/bin/env bun
// @author Andrew Velez 2026

import { $ } from "bun";
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { parseArgs } from "node:util";

const outdir = "./dist";
const outfile = `${outdir}/linkup`;
const entrypoint = "./src/core.js";
const defaultPort = 3000;
const host = Bun.env.HOST ?? "127.0.0.1";
const appUrl = new URL(`https://${host}:${defaultPort}/`);
const serverTimeoutMs = 5_000;
const serverPollMs = 100;
let port = defaultPort;

export const COMMANDS = Object.freeze({
  build,
  start
});

async function startServer() {
  const deadline = performance.now() + serverTimeoutMs;

  while (performance.now() < deadline) {
    const serverIsReady = await fetch(appUrl, {
      tls: { rejectUnauthorized: false },
    }).then(
      (response) => response.ok,
      () => false,
    );

    if (serverIsReady) {
      return;
    }

    await Bun.sleep(serverPollMs);
  }

  throw new Error(`Timed out waiting for server at ${appUrl}`);
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
  rmSync(outdir, {
    recursive: true,
    force: true,
  });
}

function compile() {
  return Bun.build({
    entrypoints: [entrypoint],
    compile: {
      target: "bun-linux-x64",
      outfile,
    },
  });
}

async function startLocalServer() {

    for (let newPort = port; newPort < (port + 10); newPort++) {
      let server;
      appUrl.port = String(newPort);

      try {
        server = Bun.spawn([outfile], {
          env: { ...Bun.env, PORT: String(newPort) },
          stdin: "inherit",
          stdout: "inherit",
          stderr: "inherit",
        });
        await startServer();
        await server.exited;
      } catch {
        continue;
      } finally {
        server?.kill();
      }

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

async function start() {
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

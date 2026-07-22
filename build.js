#! /usr/bin/env bun
/**
 * SPDX-FileCopyrightText: 2026 Andrew Velez
 * SPDX-License-Identifier: GPL-3.0-or-later
 * @author Andrew Velez
 * @summary the build file for the project
 */

import { rmSync } from "node:fs";
import { parseArgs } from "node:util";

const outdir = "./dist";
const outfile = `${outdir}/linkup`;
const entrypoint = "./src/main.js";
const appVersion = (await Bun.file("./package.json").json()).version;
const defaultPort = 3000;
const host = Bun.env.HOST ?? "127.0.0.1";
const appUrl = new URL(`https://${host}:${defaultPort}/`);
const serverTimeoutMs = 5_000;
const serverPollMs = 100;

async function waitForLocalServer() {
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

function typecheck() {
  const result = Bun.spawnSync([Bun.which("tsc") ?? "tsc", "-p", "tsconfig.json", "--noEmit"], {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
}

function runTests() {
  const result = Bun.spawnSync([process.execPath, "test"], {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
}

function clean() {
  rmSync(outdir, {
    recursive: true,
    force: true,
  });
}

/** @param {boolean} [development] */
function compile(development = false) {
  const cacheVersion = development
    ? `${appVersion}-${Date.now()}`
    : appVersion;

  return Bun.build({
    entrypoints: [entrypoint],
    define: {
      "Bun.env.LINK_UP_CACHE_VERSION": JSON.stringify(cacheVersion),
    },
    compile: {
      target: "bun-linux-x64",
      outfile,
    },
  });
}

async function useOrStartLocalServer() {
  const portListener = Bun.spawnSync([
    "ss",
    "-H",
    "-ltnp",
    `sport = :${defaultPort}`,
  ]).stdout.toString();

  if (portListener) {
    console.log(`Server assumed to be running at ${appUrl}`);
    return;
  }

  const server = Bun.spawn([outfile], {
    env: { ...Bun.env, PORT: String(defaultPort) },
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  try {
    await waitForLocalServer();
    await server.exited;
  } finally {
    server.kill();
  }
}

//region " BUN BUILD SCRIPTS "

// The build scripts don't call each other, they call the build-parts.

const commands = Object.freeze({

  // production build for deployment
  async build() {
    clean();
    typecheck();
    await compile();
    runTests();
  },

  // test build for CI automation
  async test() {
    clean();
    typecheck();
    await compile();
    runTests();
  },

  // dev build for local development/testing
  async start() {
    typecheck();
    await compile(true);
    runTests();
    await useOrStartLocalServer();
  }

});

//endregion " BUN BUILD SCRIPTS "

async function main() {
  const { positionals } = parseArgs({
    args: Bun.argv.slice(2),
    allowPositionals: true,
  });

  const commandName = positionals[0];

  if (positionals.length !== 1 || !Object.hasOwn(commands, commandName)) {
    errorUsage(Object.keys(commands));
  }

  await commands[commandName]();
}

await main();

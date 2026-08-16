#! /usr/bin/env bun
/**
 * @license SPDX-License-Identifier: MIT
 * @author Andrew Velez
 * @desc Link-Up build, test, and development commands.
 */

import { cp, rm } from "node:fs/promises";

const cucumberExecutable = "./node_modules/@cucumber/cucumber/bin/cucumber.js";
const WEB_ROOT = "./web";
const DIST_ROOT = "./dist";
const PORT = 8080;

const MIME_TYPES = {
  html: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  json: "application/json; charset=utf-8",
  webmanifest: "application/manifest+json; charset=utf-8",
  png: "image/png",
  svg: "image/svg+xml",
  ico: "image/x-icon",
};

function mimeTypeFor(path) {
  const extension = path.split(".").pop().toLowerCase();
  return MIME_TYPES[extension] ?? "application/octet-stream";
}

function runCucumber() {
  const testResult = Bun.spawnSync(
    [process.execPath, cucumberExecutable, "--config", "./cucumber.js"],
    {
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    },
  );

  if (!testResult.success) {
    throw new Error("Cucumber tests failed.");
  }
}

/**
 * Start runs the build, then serves the production files.
 */
async function start() {
  await build();
  serveStatic(DIST_ROOT, "production");
}

/**
 * Testing runs the build, then runs the tests.
 */
async function test() {
  await build();
  runCucumber();
}

/**
 * This is the production build. It copies the PWA files into `./dist`.
 */
async function build() {
  await rm(DIST_ROOT, { recursive: true, force: true });
  await cp(WEB_ROOT, DIST_ROOT, { recursive: true });
}

/**
 * Serve a directory as a PWA, falling back to its application shell.
 */
function serveStatic(root, mode) {
  Bun.serve({
    port: PORT,
    hostname: "127.0.0.1",

    async fetch(req) {
      const url = new URL(req.url);
      let path = decodeURIComponent(url.pathname);

      if (path === "/" || path.endsWith("/")) path += "index.html";
      if (path.includes("..")) return new Response("No.", { status: 400 });

      const file = Bun.file(root + path);

      if (!(await file.exists())) {
        const shell = Bun.file(root + "/index.html");
        return new Response(shell, {
          status: 200,
          headers: { "Content-Type": MIME_TYPES.html, "Cache-Control": "no-cache" },
        });
      }

      const headers = {
        "Content-Type": mimeTypeFor(path),
        "Cache-Control": "no-cache",
      };

      if (path === "/sw.js") headers["Service-Worker-Allowed"] = "/";

      return new Response(file, { status: 200, headers });
    },
  });

  console.log(`Link-Up ${mode} server -> http://localhost:${PORT}`);
}

/**
 * Dev serves `./web` as static files, unbuilt, so the PWA can be loaded,
 * installed, and iterated on without a compile step. sw.js and the manifest
 * must not be cached by the browser's HTTP cache, or version bumps and install
 * silently do nothing.
 */
function dev() {
  serveStatic(WEB_ROOT, "dev");
  console.log("Load it once, install it, then stop this server and reopen the app.");
}

const commands = Object.freeze({
  start,
  test,
  build,
  dev
});

const command = process.argv[2];

if (!command || !Object.hasOwn(commands, command)) {
  console.error(`Usage: bun ./build.js <${Object.keys(commands).join("|")}>`);
  process.exit(1);
}

await commands[command]();

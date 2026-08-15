#! /usr/bin/env bun
/**
 * @license SPDX-License-Identifier: MIT
 * @author Andrew Velez
 * @desc Link-Up build, test, and development commands.
 */

import { createHash } from "node:crypto";
import { watch } from "node:fs";
import { cp, rm } from "node:fs/promises";
import { relative, sep } from "node:path";

const cucumberExecutable = "./node_modules/@cucumber/cucumber/bin/cucumber.js";
const SOURCE_ROOT = "./src";
const DIST_ROOT = "./dist";
const PORT = 8080;
const HOST = Bun.env.TAURI_DEV_HOST ?? "127.0.0.1";

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
 * Bundle the shared Tauri/PWA frontend and generate its offline asset list.
 */
async function build({ minify = true } = {}) {
  await rm(DIST_ROOT, { recursive: true, force: true });

  const result = await Bun.build({
    entrypoints: [`${SOURCE_ROOT}/index.html`, `${SOURCE_ROOT}/sw.js`],
    outdir: DIST_ROOT,
    target: "browser",
    minify,
    naming: {
      entry: "[name].[ext]",
      chunk: "[name]-[hash].[ext]",
      asset: "[name]-[hash].[ext]",
    },
  });

  if (!result.success) {
    for (const log of result.logs) console.error(log);
    throw new Error("Bun failed to bundle the frontend.");
  }

  await cp(`${SOURCE_ROOT}/icons`, `${DIST_ROOT}/icons`, { recursive: true });

  const assets = new Set([
    "/",
    "/precache.json",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
  ]);

  for (const output of result.outputs) {
    const path = relative(DIST_ROOT, output.path).split(sep).join("/");
    assets.add(`/${path}`);
  }

  const assetPaths = [...assets].sort();
  await versionServiceWorker(assetPaths);
  await Bun.write(`${DIST_ROOT}/precache.json`, `${JSON.stringify(assetPaths, null, 2)}\n`);
}

/**
 * Make the built worker and cache name change whenever its application shell changes.
 */
async function versionServiceWorker(assets) {
  const hash = createHash("sha256");

  for (const asset of assets) {
    hash.update(asset);

    if (asset === "/" || asset === "/precache.json") continue;

    const file = Bun.file(DIST_ROOT + asset);
    if (await file.exists()) hash.update(new Uint8Array(await file.arrayBuffer()));
  }

  const workerPath = `${DIST_ROOT}/sw.js`;
  const worker = await Bun.file(workerPath).text();
  const placeholder = "__BUILD_VERSION__";

  if (!worker.includes(placeholder)) {
    throw new Error("The service worker build-version placeholder is missing.");
  }

  await Bun.write(workerPath, worker.replaceAll(placeholder, hash.digest("hex").slice(0, 12)));
}

/**
 * Serve a directory as a PWA, falling back to its application shell.
 */
function serveStatic(root, mode) {
  const server = Bun.serve({
    port: PORT,
    hostname: HOST,

    async fetch(req) {
      const url = new URL(req.url);
      let path = decodeURIComponent(url.pathname);

      if (path === "/" || path.endsWith("/")) path += "index.html";
      if (path.includes("..")) return new Response("No.", { status: 400 });

      const file = Bun.file(root + path);

      if (!(await file.exists())) {
        if (req.method === "GET" && req.headers.get("accept")?.includes("text/html")) {
          const shell = Bun.file(root + "/index.html");
          return new Response(shell, {
            status: 200,
            headers: { "Content-Type": MIME_TYPES.html, "Cache-Control": "no-cache" },
          });
        }

        return new Response("Not found.", { status: 404 });
      }

      const headers = {
        "Content-Type": mimeTypeFor(path),
        "Cache-Control": "no-cache",
      };

      if (path === "/sw.js") headers["Service-Worker-Allowed"] = "/";

      return new Response(file, { status: 200, headers });
    },
  });

  console.log(`Link-Up ${mode} server -> ${server.url.href}`);
}

/**
 * Rebuild changed frontend sources. Refresh the browser or webview to load them.
 */
function watchFrontend() {
  let debounce;
  let builds = Promise.resolve();

  const watcher = watch(SOURCE_ROOT, { recursive: true }, () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      builds = builds
        .then(() => build({ minify: false }))
        .then(() => console.log("Frontend rebuilt; refresh to load the changes."))
        .catch((error) => console.error("Frontend rebuild failed.", error));
    }, 100);
  });

  watcher.on("error", (error) => console.error("Frontend watcher failed.", error));
}

/**
 * Build an unminified frontend and serve it for browser or Tauri development.
 */
async function dev() {
  await build({ minify: false });
  serveStatic(DIST_ROOT, "development");
  watchFrontend();
}

const commands = Object.freeze({
  start,
  test,
  build,
  dev,
});

const command = process.argv[2];

if (!command || !Object.hasOwn(commands, command)) {
  console.error(`Usage: bun ./build.js <${Object.keys(commands).join("|")}>`);
  process.exit(1);
}

await commands[command]();

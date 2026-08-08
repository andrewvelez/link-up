#! /usr/bin/env bun
/**
 * @license SPDX-License-Identifier: MIT
 * @author Andrew Velez
 * @desc Link-Up build, test, and development commands.
 */

const cucumberExecutable = "./node_modules/@cucumber/cucumber/bin/cucumber.js";

const WEB_ROOT = "./web";
const DEV_PORT = 8080;

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
 * Start runs the build, then runs the executable for development.
 */
async function start() {
  await build();
}

/**
 * Testing runs the build, then runs the tests.
 */
async function test() {
  await build();
  runCucumber();
}

/**
 * This is the production build. It compiles the Bun-side desktop adapter
 * (`src/app.js`) into a native executable. The PWA bundle under `./web`
 * ships as sibling static files served via `hostWindow.setRootFolder()`
 * (see `src/WebUI/BunWebUIAdapter.js`) rather than being embedded into the
 * executable, because a service worker must be registered from a real
 * fetchable URL and cannot be inlined or bundled.
 *
 * This does not verify that the service worker, install, or offline
 * behavior work correctly inside a Bun-WebUI-hosted window — only that the
 * desktop adapter opens the same shell the browser installs. That
 * verification is separate, unstarted follow-up work.
 */
async function build() {
  await Bun.build({
    entrypoints: [
      "./src/app.js"
    ],
    compile: {
      outfile: "./bin/link-up"
    },
    minify: true,
    format: "esm",
    sourcemap: "linked",
    bytecode: true,
  });
}

/**
 * Dev serves `./web` as static files, unbuilt, so the PWA can be loaded,
 * installed, and iterated on without a compile step. Modeled on the
 * proof-of-concept's dev server: sw.js and the manifest must not be cached
 * by the browser's HTTP cache, or version bumps and install silently do
 * nothing.
 */
async function dev() {
  Bun.serve({
    port: DEV_PORT,
    hostname: "127.0.0.1",

    async fetch(req) {
      const url = new URL(req.url);
      let path = decodeURIComponent(url.pathname);

      if (path === "/" || path.endsWith("/")) path += "index.html";
      if (path.includes("..")) return new Response("No.", { status: 400 });

      const file = Bun.file(WEB_ROOT + path);

      if (!(await file.exists())) {
        const shell = Bun.file(WEB_ROOT + "/index.html");
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

  console.log(`Link-Up dev server -> http://localhost:${DEV_PORT}`);
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

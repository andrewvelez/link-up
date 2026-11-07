#!/usr/bin/env bun
/**
 * @author Andrew Velez
 * @license MIT
 * @description Builds and serves Link-up's browser PWA assets with Bun.
 */

import { cpSync, mkdirSync, rmSync } from "node:fs";
import { injectManifest } from "workbox-build";

/**
 * @description Compiles the server entry point into an executable.
 * @returns {Promise} Resolves after compilation succeeds.
 * @throws {Error} If Bun cannot compile the server executable.
 */
async function bundle() {

  /** @type {Object} Bun compilation result containing success and logs properties. */
  const result = await Bun.build({
    entrypoints: ["./src/web/sw.js"],
    outdir: "./dist",
    naming: { entry: "sw.js" },
    target: "browser",
    minify: true,
  });

  if (!result.success) {
    throw new Error(result.logs.join("\n") || "Service-worker build failed.");
  }

  /** @type {Object} Workbox result containing a warnings array. */
  const { warnings } = await injectManifest({
    globDirectory: "./dist",
    globPatterns: ["**/*.{html,js,json,css,svg,png}"],
    globIgnores: ["home.html"],
    modifyURLPrefix: { "default.html": "/" },
    swSrc: "./dist/sw.js",
    swDest: "./dist/sw.min.js",
  });

  rmSync("./dist/sw.js", { force: true });

  if (warnings.length > 0) {
    console.warn("Warnings encountered while injecting the manifest:", warnings.join("\n"));
  }

  /** @type {Object} Bun compilation result containing success and logs properties. */
  const result = await Bun.build({
    entrypoints: ["./src/server/server.js"],
    compile: { outfile: "./dist/link-up" },
    naming: {
      asset: "[name].[ext]",
      entry: "[name].[ext]",
    },
  });

  if (!result.success) {
    throw new Error(result.logs.join("\n") || "Build failed.");
  }

}

/**
 * @description Copies directories for the build.
 */
function copyBuildFiles() {
  rmSync("./dist", { recursive: true, force: true });
  cpSync("./src/web", "./dist", { recursive: true });

  mkdirSync("./dist/external", { recursive: true });
  cpSync("./node_modules/htmx.org/dist/htmx.min.js", "./dist/external/htmx.min.js");
  cpSync("./node_modules/milligram/dist/milligram.min.css", "./dist/external/milligram.min.css");

}

/**
 * @description Removes generated build output.
 * @returns {void}
 */
function clean() {
  rmSync("./dist", { recursive: true, force: true });
}

/**
 * @type {Function}
 * @description Creates a clean production build of the complete application.
 * @returns {Promise} Resolves after all build steps succeed.
 * @throws {Error} If any build step fails.
 */
async function build() {
  clean();
  copyBuildFiles();
  await bundle();
};

/**
 * @type {Function}
 * @description Builds the application and runs its test suite.
 * @returns {Promise} Resolves after the test process exits.
 * @throws {Error} If the build fails or the test process cannot be started.
 */
async function test() {
  await build();

  /** @type {Object} Spawned test process with an exited promise. */
  const testRunner = Bun.spawn([process.execPath, "test"], {
    stdout: "inherit",
    stderr: "inherit",
  });
  process.exitCode = await testRunner.exited;
};

/**
 * @type {Function}
 * @description Builds the application and starts the development server.
 * @returns {Promise} Resolves after the server module loads.
 * @throws {Error} If the build or server-module import fails.
 */
async function start() {
  await build();
  await import("./src/server/server.js");
};

/**
 * @description entrypoint to module
 */
async function main() {
  process.chdir(import.meta.dir);

  const buildCommands = [build, test, start];
  const argvCommand = process.argv[2];
  const cmdFunc = buildCommands.find(cmdFunc => cmdFunc.name === argvCommand);

  if (cmdFunc) {
    await cmdFunc();
  } else {
    throw new Error(`Usage: bun run <${buildCommands.map(cmd => cmd.name).join("|")}>`);
  }
}

if (import.meta.main) {
  await main();
} else {
  throw new Error("build.js must be run directly, not imported.");
}
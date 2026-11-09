#!/usr/bin/env bun
/**
 * @author Andrew Velez
 * @license MIT
 * @description Builds and serves Link-up's browser PWA assets with Bun.
 */

import { cpSync, mkdirSync, rmSync } from "node:fs";
import { injectManifest } from "workbox-build";

/**
 * @description Injects the precache manifest and bundles the client service worker.
 * @returns {Promise} Resolves after the client bundle succeeds.
 * @throws {Error} If manifest injection or client bundling fails.
 */
async function bundleClientJs() {

  /** @type {Object} Workbox result containing a warnings array. */
  const { warnings } = await injectManifest({
    globDirectory: "./dist",
    globPatterns: ["**/*.{html,js,json,css,svg,png}"],
    modifyURLPrefix: { "default.html": "/" },
    swSrc: "./src/web/sw.js",
    swDest: "./dist/sw.js",
  });

  if (warnings.length > 0) {
    console.warn("Warnings encountered while injecting the manifest:", warnings.join("\n"));
  }

  /** @type {Object} Bun compilation result containing success and logs properties. */
  const result = await Bun.build({
    entrypoints: ["./dist/sw.js"],
    outdir: "./dist",
    naming: { entry: "sw.min.js" },
    target: "browser",
    minify: true,
  });

  if (!result.success) {
    throw new Error(result.logs.join("\n") || "Service-worker build failed.");
  }

  rmSync("./dist/sw.js", { force: true });

}

/**
 * @description Compiles the server entry point into an executable.
 * @returns {Promise} Resolves after compilation succeeds.
 * @throws {Error} If Bun cannot compile the server executable.
 */
async function bundleServerExecutable() {

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
  cpSync("./src/web/pages", "./dist", { recursive: true });
  cpSync("./src/web/components", "./dist/components", { recursive: true });
  cpSync("./src/web/scripts", "./dist/js", { recursive: true });
  cpSync("./src/web/styles", "./dist/styles", { recursive: true });
  cpSync("./src/web/images", "./dist/icons", { recursive: true });
  cpSync("./src/web/manifest.json", "./dist/manifest.json");
  cpSync("./src/web/sw.js", "./dist/sw.js");

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
 * @description Creates a clean application bundle for the requested environment.
 * @param {string} environment Development or production environment name.
 * @returns {Promise} Resolves after all build steps succeed.
 * @throws {Error} If any build step fails.
 */
async function bundleApplication(environment) {
  process.env.NODE_ENV = environment;
  clean();
  copyBuildFiles();
  await bundleClientJs();
  await bundleServerExecutable();
};

/**
 * @description Runs the test suite and stops the workflow if tests fail.
 * @returns {void}
 * @throws {Error} If the test process cannot be started.
 */
function runTests() {
  const testRunner = Bun.spawnSync([process.execPath, "test"], {
    env: process.env,
    stdout: "inherit",
    stderr: "inherit",
  });
  if (testRunner.exitCode !== 0) {
    process.exit(testRunner.exitCode);
  }
}

/**
 * @description Starts the development server from source.
 * @returns {Promise} Resolves after the server module loads.
 */
async function startServer() {
  await import("./src/server/server.js");
}

/**
 * @description Bundles and tests the application for development.
 * @returns {Promise} Resolves after bundling and tests succeed.
 */
async function buildDevelopment() {
  await bundleApplication("development");
  runTests();
}

/**
 * @description Bundles, tests, and starts the application for development.
 * @returns {Promise} Resolves after the development server starts.
 */
async function startDevelopment() {
  await bundleApplication("development");
  runTests();
  await startServer();
}

/**
 * @description Bundles and tests the application for production; deployment is TODO.
 * @returns {Promise} Resolves after bundling and tests succeed.
 */
async function deployProduction() {
  await bundleApplication("production");
  runTests();
  // TODO: Deploy the tested production build.
}

/**
 * @description entrypoint to module
 */
async function main() {
  process.chdir(import.meta.dir);

  const buildCommands = [buildDevelopment, startDevelopment, deployProduction];
  const argvCommand = process.argv[2];
  const cmdFunc = buildCommands.find(cmdFunc => cmdFunc.name === argvCommand);

  if (cmdFunc) {
    await cmdFunc();
  } else {
    throw new Error(`Usage: bun build.js <${buildCommands.map(cmd => cmd.name).join("|")}>`);
  }
}

/**
 * @description DO NOT REMOVE
 */
if (import.meta.main) {
  await main();
} else {
  throw new Error("build.js must be run directly, not imported.");
}

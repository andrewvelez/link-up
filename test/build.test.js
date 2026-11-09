/**
 * @author Andrew Velez 2026
 * @license SPDX-License-Identifier: MIT
 * @desc Tests the Bun build command and development server entry point.
 */

import { afterEach, describe, expect, test } from "bun:test";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const fixtureDirectories = [];

function createFixture(environment = "development") {
  const fixtureDirectory = mkdtempSync(join(tmpdir(), "link-up-build-test-"));

  for (const path of ["build.js", "package.json", "src"]) {
    cpSync(join(projectDirectory, path), join(fixtureDirectory, path), {
      recursive: true,
    });
  }

  symlinkSync(
    join(projectDirectory, "node_modules"),
    join(fixtureDirectory, "node_modules"),
    "dir",
  );
  fixtureDirectories.push(fixtureDirectory);
  writeFileSync(join(fixtureDirectory, "regression.test.js"), `
import { expect, test } from "bun:test";

test("tests run after bundling in the selected environment", () => {
  expect(Bun.file("./dist/link-up").size).toBeGreaterThan(0);
  expect(process.env.NODE_ENV).toBe(${JSON.stringify(environment)});
});
`);

  return fixtureDirectory;
}

async function runBuildScript(directory, ...arguments_) {
  const child = Bun.spawn([process.execPath, "build.js", ...arguments_], {
    cwd: directory,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);

  return { exitCode, stderr, stdout };
}

async function readServerUrl(stream, stderr) {
  const decoder = new TextDecoder();
  const reader = stream.getReader();
  let output = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      throw new Error(`The development server exited before startup:\n${output}\n${await stderr}`);
    }

    output += decoder.decode(value, { stream: true });

    const match = output.match(/Link-up running at (http:\/\/\S+)/);
    if (match) {
      await reader.cancel();
      return match[1];
    }
  }
}

afterEach(() => {
  for (const directory of fixtureDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

describe("build", () => {
  test("rejects an unknown command", async () => {
    const result = await runBuildScript(createFixture(), "unknown");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Usage: bun build.js <buildDevelopment|startDevelopment|deployProduction>");
  });

  test("rejects importing the build script as a module", async () => {
    const fixtureDirectory = createFixture();
    const buildScriptUrl = pathToFileURL(
      join(fixtureDirectory, "build.js"),
    ).href;
    const child = Bun.spawn([
      process.execPath,
      "-e",
      `await import(${JSON.stringify(buildScriptUrl)})`,
    ], {
      cwd: fixtureDirectory,
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stderr, exitCode] = await Promise.all([
      new Response(child.stderr).text(),
      child.exited,
    ]);

    expect(exitCode).not.toBe(0);
    expect(stderr).toContain("build.js must be run directly, not imported.");
  });

  test.each([
    ["buildDevelopment", "development"],
    ["deployProduction", "production"],
  ])("%s builds and tests the complete application", async (command, environment) => {
    const fixtureDirectory = createFixture(environment);
    const outputDirectory = join(fixtureDirectory, "dist");
    const staleOutputPath = join(outputDirectory, "stale.txt");

    mkdirSync(outputDirectory);
    writeFileSync(staleOutputPath, "stale output");

    const result = await runBuildScript(fixtureDirectory, command);

    expect(result.exitCode).toBe(0);
    expect(existsSync(staleOutputPath)).toBe(false);

    for (const path of [
      "js/appInit.js",
      "default.html",
      "profiles.html",
      "about.html",
      "manifest.json",
      "styles/global.css",
      "external/milligram.min.css",
      "external/htmx.min.js",
      "sw.min.js",
      "link-up",
    ]) {
      expect(existsSync(join(fixtureDirectory, "dist", path))).toBe(true);
    }

    const serviceWorker = readFileSync(
      join(fixtureDirectory, "dist", "sw.min.js"),
      "utf8",
    );

    expect(serviceWorker).not.toContain("self.__WB_MANIFEST");
    expect(serviceWorker).not.toContain("storage.googleapis.com");
    expect(serviceWorker).not.toContain("importScripts(");
    expect(serviceWorker).not.toContain('from"workbox-precaching"');
    expect(serviceWorker).not.toContain('from "workbox-precaching"');
    expect(serviceWorker).toMatch(
      /"?revision"?:"[a-f0-9]{32}","?url"?:"\/"/,
    );
    expect(serviceWorker).toMatch(
      /"?revision"?:"[a-f0-9]{32}","?url"?:"about\.html"/,
    );
    const manifest = JSON.parse(readFileSync(join(outputDirectory, "manifest.json"), "utf8"));
    expect(manifest.start_url).toBe("/");
    expect(serviceWorker).not.toMatch(/"?url"?:"home\.html"/);
    expect(serviceWorker).toMatch(/"?revision"?:"[a-f0-9]{32}","?url"?:"profiles\.html"/);
    expect(serviceWorker).not.toMatch(/"?url"?:"default\.html"/);
    expect(serviceWorker).not.toMatch(/"?url"?:"sw(?:\.min)?\.js"/);
    expect(existsSync(join(outputDirectory, "Default.html"))).toBe(false);
    expect(existsSync(join(outputDirectory, "js/clerk.js"))).toBe(false);
    expect(existsSync(join(outputDirectory, "sw.js"))).toBe(false);
  });

  test("updates precache revisions when asset contents change", async () => {
    const fixtureDirectory = createFixture();
    const aboutPath = join(fixtureDirectory, "src", "web", "pages", "about.html");
    const workerPath = join(fixtureDirectory, "dist", "sw.min.js");

    for (const content of ["<p>Initial content</p>", "<p>Changed content</p>"]) {
      writeFileSync(aboutPath, content);

      const result = await runBuildScript(fixtureDirectory, "buildDevelopment");

      expect(result.exitCode).toBe(0);
      const revision = createHash("md5").update(content).digest("hex");
      expect(readFileSync(workerPath, "utf8")).toMatch(
        new RegExp(`"?revision"?:"${revision}","?url"?:"about\\.html"`),
      );
    }
  });

  test("fails when the service worker has no manifest placeholder", async () => {
    const fixtureDirectory = createFixture();
    const serviceWorkerPath = join(fixtureDirectory, "src", "web", "sw.js");

    writeFileSync(serviceWorkerPath, "export {};\n");

    const result = await runBuildScript(fixtureDirectory, "buildDevelopment");

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("Unable to find a place to inject the manifest.");
    expect(existsSync(join(fixtureDirectory, "dist", "sw.min.js"))).toBe(false);
    expect(existsSync(join(fixtureDirectory, "dist", "link-up"))).toBe(false);
  });

  test("fails when the service worker cannot compile", async () => {
    const fixtureDirectory = createFixture();
    const serviceWorkerPath = join(fixtureDirectory, "src", "web", "sw.js");

    writeFileSync(serviceWorkerPath, "self.__WB_MANIFEST;\nexport const =;\n");

    const result = await runBuildScript(fixtureDirectory, "buildDevelopment");

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('Expected identifier but found "="');
    expect(result.stderr).toContain("dist/sw.js");
    expect(existsSync(join(fixtureDirectory, "dist", "sw.min.js"))).toBe(false);
    expect(existsSync(join(fixtureDirectory, "dist", "link-up"))).toBe(false);
  });

  test("fails when the server bundle cannot compile", async () => {
    const fixtureDirectory = createFixture();
    const serverPath = join(fixtureDirectory, "src", "server", "server.js");

    writeFileSync(serverPath, "export const =;\n");

    const result = await runBuildScript(fixtureDirectory, "buildDevelopment");

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('Expected identifier but found "="');
    expect(result.stderr).toContain("src/server/server.js");
    expect(existsSync(join(fixtureDirectory, "dist", "sw.min.js"))).toBe(true);
    expect(existsSync(join(fixtureDirectory, "dist", "sw.js"))).toBe(false);
    expect(existsSync(join(fixtureDirectory, "dist", "link-up"))).toBe(false);
  });

  test.each(["buildDevelopment", "startDevelopment", "deployProduction"])("%s stops when tests fail", async (command) => {
    const fixtureDirectory = createFixture();
    const regressionTestPath = join(fixtureDirectory, "regression.test.js");

    writeFileSync(
      regressionTestPath,
      `import { expect, test } from "bun:test";

test("fixture failure", () => {
  expect(true).toBe(false);
});
`,
    );

    const result = await runBuildScript(fixtureDirectory, command);

    expect(result.exitCode).toBe(1);
    expect(result.stdout + result.stderr).toContain("fixture failure");
    expect(result.stdout + result.stderr).not.toContain("Link-up running at");
  });

  test("startDevelopment tests and serves from another working directory", async () => {
    const fixtureDirectory = createFixture();
    const child = Bun.spawn([
      process.execPath,
      join(fixtureDirectory, "build.js"),
      "startDevelopment",
    ], {
      cwd: tmpdir(),
      stdout: "pipe",
      stderr: "pipe",
    });
    const stderr = new Response(child.stderr).text();

    try {
      const serverUrl = await readServerUrl(child.stdout, stderr);
      const response = await fetch(serverUrl);

      expect(response.status).toBe(200);
      expect(await response.text()).toBe(
        readFileSync(join(fixtureDirectory, "dist", "default.html"), "utf8"),
      );
    } finally {
      child.kill();
      await child.exited;
      await stderr;
    }
  }, 15_000);

  test("the executable serves normal HTTP paths and rejects unsupported methods", async () => {
    const fixtureDirectory = createFixture();
    const buildResult = await runBuildScript(fixtureDirectory, "buildDevelopment");
    expect(buildResult.exitCode).toBe(0);

    const child = Bun.spawn([join(fixtureDirectory, "dist", "link-up")], {
      cwd: fixtureDirectory,
      stdout: "pipe",
      stderr: "pipe",
    });
    const stderr = new Response(child.stderr).text();

    try {
      const serverUrl = await readServerUrl(child.stdout, stderr);
      const pageResponse = await fetch(serverUrl);
      const headResponse = await fetch(
        new URL("styles/global.css", serverUrl),
        { method: "HEAD" },
      );
      const postResponse = await fetch(serverUrl, { method: "POST" });
      const missingResponse = await fetch(new URL("missing", serverUrl));
      const serviceWorkerResponse = await fetch(new URL("sw.min.js", serverUrl));

      expect(serviceWorkerResponse.status).toBe(200);
      expect(await serviceWorkerResponse.text()).toBe(
        readFileSync(join(fixtureDirectory, "dist", "sw.min.js"), "utf8"),
      );

      expect(pageResponse.status).toBe(200);
      expect(pageResponse.headers.get("Content-Type")).toContain("text/html");
      expect(await pageResponse.text()).toBe(
        readFileSync(join(fixtureDirectory, "dist", "default.html"), "utf8"),
      );
      expect(headResponse.status).toBe(200);
      expect(postResponse.status).toBe(404);
      expect(missingResponse.status).toBe(404);

      for (const [path, filename] of [
        ["/", "default.html"],
        ["/default", "default.html"],
        ["/default.html", "default.html"],
        ["/profiles", "profiles.html"],
        ["/profiles.html", "profiles.html"],
        ["/about", "about.html"],
        ["/about.html", "about.html"],
      ]) {
        const response = await fetch(new URL(path, serverUrl));

        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toContain("text/html");
        expect(await response.text()).toBe(
          readFileSync(join(fixtureDirectory, "dist", filename), "utf8"),
        );
        const html = readFileSync(join(fixtureDirectory, "dist", filename), "utf8");
        for (const [, resource] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
          expect((await fetch(new URL(resource, serverUrl))).status).toBe(200);
        }
        const head = await fetch(new URL(path, serverUrl), { method: "HEAD" });
        expect(head.status).toBe(200);
        expect(await head.text()).toBe("");
      }

      for (const path of ["/search", "/search.html", "/Default.html", "/js/clerk.js", "/auth/config"]) {
        expect((await fetch(new URL(path, serverUrl))).status).toBe(404);
      }
    } finally {
      child.kill();
      await child.exited;
      await stderr;
    }
  }, 15_000);

});

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
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const fixtureDirectories = [];

function createFixture() {
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

async function readServerUrl(stream) {
  const decoder = new TextDecoder();
  const reader = stream.getReader();
  let output = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      throw new Error(`The development server exited before startup:\n${output}`);
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
    expect(result.stderr).toContain("Usage: bun run <build|test|start>");
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

  test("builds the complete browser application", async () => {
    const fixtureDirectory = createFixture();
    const outputDirectory = join(fixtureDirectory, "dist");
    const staleOutputPath = join(outputDirectory, "stale.txt");

    mkdirSync(outputDirectory);
    writeFileSync(staleOutputPath, "stale output");

    const result = await runBuildScript(fixtureDirectory, "build");

    expect(result.exitCode).toBe(0);
    expect(existsSync(staleOutputPath)).toBe(false);

    for (const path of [
      "js/appInit.js",
      "default.html",
      "home.html",
      "search.html",
      "about.html",
      "manifest.json",
      "styles/global.css",
      "external/pico.cyan.min.css",
      "external/htmx.min.js",
      "sw.js",
      "link-up",
    ]) {
      expect(existsSync(join(fixtureDirectory, "dist", path))).toBe(true);
    }

    const serviceWorker = readFileSync(
      join(fixtureDirectory, "dist", "sw.js"),
      "utf8",
    );

    expect(serviceWorker).not.toContain("self.__WB_MANIFEST");
    expect(serviceWorker).not.toContain("storage.googleapis.com");
    expect(serviceWorker).not.toContain("importScripts(");
    expect(serviceWorker).not.toContain('from"workbox-precaching"');
    expect(serviceWorker).not.toContain('from "workbox-precaching"');
    expect(serviceWorker).toMatch(
      /"revision":"[a-f0-9]{32}","url":"\/"/,
    );
    expect(serviceWorker).toMatch(
      /"revision":"[a-f0-9]{32}","url":"about\.html"/,
    );
    const manifest = JSON.parse(readFileSync(join(outputDirectory, "manifest.json"), "utf8"));
    expect(manifest.start_url).toBe("/");
    expect(serviceWorker).not.toContain('"url":"home.html"');
    expect(serviceWorker).not.toContain('"url":"search.html"');
    expect(serviceWorker).not.toContain('"url":"default.html"');
    expect(existsSync(join(outputDirectory, "Default.html"))).toBe(false);
    expect(existsSync(join(outputDirectory, "js/authentication.js"))).toBe(false);
    expect(existsSync(join(outputDirectory, "sw.bundle.js"))).toBe(false);
  });

  test("fails when the service worker cannot compile", async () => {
    const fixtureDirectory = createFixture();
    const serviceWorkerPath = join(fixtureDirectory, "src", "web", "sw.js");

    writeFileSync(serviceWorkerPath, "import {;\n");

    const result = await runBuildScript(fixtureDirectory, "build");

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("error");
  });

  test("fails when the server bundle cannot compile", async () => {
    const fixtureDirectory = createFixture();
    const serverPath = join(fixtureDirectory, "src", "server", "server.js");

    writeFileSync(serverPath, "export const =;\n");

    const result = await runBuildScript(fixtureDirectory, "build");

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("error");
  });

  test("the test command propagates the test runner exit code", async () => {
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

    const result = await runBuildScript(fixtureDirectory, "test");

    expect(result.exitCode).toBe(1);
    expect(result.stdout + result.stderr).toContain("fixture failure");
  });

  test("the start command serves from another working directory", async () => {
    const fixtureDirectory = createFixture();
    const child = Bun.spawn([
      process.execPath,
      join(fixtureDirectory, "build.js"),
      "start",
    ], {
      cwd: tmpdir(),
      stdout: "pipe",
      stderr: "pipe",
    });
    const stderr = new Response(child.stderr).text();

    try {
      const serverUrl = await readServerUrl(child.stdout);
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
    const buildResult = await runBuildScript(fixtureDirectory, "build");
    expect(buildResult.exitCode).toBe(0);

    const child = Bun.spawn([join(fixtureDirectory, "dist", "link-up")], {
      cwd: fixtureDirectory,
      stdout: "pipe",
      stderr: "pipe",
    });
    const stderr = new Response(child.stderr).text();

    try {
      const serverUrl = await readServerUrl(child.stdout);
      const pageResponse = await fetch(serverUrl);
      const headResponse = await fetch(
        new URL("styles/global.css", serverUrl),
        { method: "HEAD" },
      );
      const postResponse = await fetch(serverUrl, { method: "POST" });
      const missingResponse = await fetch(new URL("missing", serverUrl));

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

      for (const path of ["/home", "/home.html", "/search", "/search.html"]) {
        for (const method of ["GET", "HEAD"]) {
          const response = await fetch(new URL(path, serverUrl), { method, redirect: "manual" });
          expect(response.status).toBe(302);
          expect(response.headers.get("Location")).toBe("/");
          expect(response.headers.get("Cache-Control")).toBe("no-store");
          expect(await response.text()).toBe("");
        }
      }

      for (const path of ["/default.html", "/Default.html"]) {
        expect((await fetch(new URL(path, serverUrl))).status).toBe(404);
      }

      const authenticationResponse = await fetch(new URL("js/authentication.js", serverUrl));
      expect(authenticationResponse.status).toBe(404);
    } finally {
      child.kill();
      await child.exited;
      await stderr;
    }
  }, 15_000);

  test.each(["Known", "Authenticated"])("protects pages for a %s user", async (state) => {
    const fixtureDirectory = createFixture();
    const authenticationPath = join(fixtureDirectory, "src/server/authentication.js");
    writeFileSync(authenticationPath, readFileSync(authenticationPath, "utf8").replace(
      "return AuthenticationState.Unknown;", `return AuthenticationState.${state};`,
    ));
    expect((await runBuildScript(fixtureDirectory, "build")).exitCode).toBe(0);
    const child = Bun.spawn([join(fixtureDirectory, "dist/link-up")], {
      cwd: fixtureDirectory, stdout: "pipe", stderr: "pipe",
    });
    const stderr = new Response(child.stderr).text();
    try {
      const serverUrl = await readServerUrl(child.stdout);
      for (const path of ["/home", "/home.html", "/search", "/search.html"]) {
        for (const method of ["GET", "HEAD"]) {
          const response = await fetch(new URL(path, serverUrl), { method, redirect: "manual" });
          expect(response.headers.get("Cache-Control")).toBe("no-store");
          if (state === "Authenticated") {
            expect(response.status).toBe(200);
            if (method === "GET") {
              const filename = path.includes("home") ? "home.html" : "search.html";
              const html = await response.text();
              expect(html).toBe(readFileSync(join(fixtureDirectory, "dist", filename), "utf8"));
              for (const [, resource] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
                expect((await fetch(new URL(resource, serverUrl))).status).toBe(200);
              }
            } else {
              expect(await response.text()).toBe("");
            }
          } else {
            expect(response.status).toBe(302);
            expect(response.headers.get("Location")).toBe("/");
            expect(await response.text()).toBe("");
          }
        }
      }
    } finally {
      child.kill();
      await child.exited;
      await stderr;
    }
  }, 15_000);

});

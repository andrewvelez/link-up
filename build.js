#! /usr/bin/env bun
/**
 * @license SPDX-License-Identifier: MIT
 * @author Andrew Velez
 * @desc Link-Up build, test, and development commands.
 */

const cucumberExecutable = "./node_modules/@cucumber/cucumber/bin/cucumber.js";

const stripInternalHtmlCommentsPlugin = {
  name: "strip-internal-html-comments",
  setup(builder) {
    builder.onLoad({ filter: /\.html$/ }, async ({ path }) => {
      const html = await Bun.file(path).text();
      const contents = new HTMLRewriter()
        .onDocument({
          comments(comment) {
            if (comment.text.endsWith("!")) {
              comment.remove();
            }
          },
        })
        .transform(html);

      return { contents, loader: "text" };
    });
  },
};

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

async function build() {
  await Bun.build({
    entrypoints: ["./src/app.js"],
    compile: {
      outfile: "./bin/link-up"
    },
    minify: true,
    format: "esm",
    sourcemap: "linked",
    bytecode: true,
    plugins: [stripInternalHtmlCommentsPlugin],
  });
}

async function dev() {
  await import("./index.js");
}

function test() {
  runCucumber();
}

async function ready() {
  test();
  await build();
}

const commands = Object.freeze({
  build,
  dev,
  ready,
  test,
});

const command = process.argv[2];

if (!command || !Object.hasOwn(commands, command)) {
  console.error(`Usage: bun ./build.js <${Object.keys(commands).join("|")}>`);
  process.exit(1);
}

await commands[command]();

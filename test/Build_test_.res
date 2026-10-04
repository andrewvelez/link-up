/**
 * @author Andrew Velez
 * @license MIT
 * @description Tests the build commands and embedded application host.
 */
open BunTest

let projectDirectory: string = Node.join(%raw("import.meta.dir"), "..")
let fixtures = []
let createFixture = () => {
  let directory = Node.temporaryDirectory(Node.join(Node.tmpdir(), "link-up-build-test-"))
  ["tools", "package.json", "rescript.json", "src"]->Array.forEach(path => {
    Node.copy(Node.join(projectDirectory, path), Node.join(directory, path), {recursive: true})
  })
  Node.symlink(Node.join(projectDirectory, "node_modules"), Node.join(directory, "node_modules"))
  Node.mkdir(Node.join(directory, "test"))
  fixtures->Array.push(directory)->ignore
  directory
}
let each = async (values, callback) => {
  for index in 0 to values->Array.length - 1 {
    await callback(values->Array.get(index)->Option.getOrThrow)
  }
}
let runTask = (directory, command) => TestProcess.run(directory, [Node.executable, "run", command])

afterEach(() => {
  fixtures->Array.forEach(directory => Node.remove(directory, {recursive: true, force: true}))
  Array.splice(fixtures, ~start=0, ~remove=fixtures->Array.length, ~insert=[])->ignore
})

test("rejects an unknown build command", async () => {
  let directory = createFixture()
  let result = await TestProcess.run(directory, [Node.executable, "tools/Build.res.js", "unknown"])
  expect(result.exitCode)->toBe(1)
  expect(result.stderr)->toContain("Usage: bun run <build|test|start>")
})

test("rejects importing the build entry point", async () => {
  let directory = createFixture()
  let path = Node.join(directory, "tools/Build.res.js")
  let result = await TestProcess.run(
    directory,
    [Node.executable, "-e", "await import(" ++ JSON.stringifyAny(path)->Option.getOrThrow ++ ")"],
  )
  expect(result.exitCode)->negate->toBe(0)
  expect(result.stderr)->toContain("Build.res.js must be run directly, not imported.")
})

test(
  "builds the complete browser application and removes stale output",
  async () => {
    let directory = createFixture()
    let output = Node.join(directory, "dist")
    Node.mkdir(output)
    Node.write(Node.join(output, "stale.txt"), "stale output")
    let result = await runTask(directory, "build")
    expect(result.exitCode)->toBe(0)
    expect(Node.exists(Node.join(output, "stale.txt")))->toBe(false)
    [
      "js/appInitialization.js",
      "home.html",
      "about.html",
      "manifest.json",
      "styles/global.css",
      "external/pico.cyan.min.css",
      "external/htmx.min.js",
      "sw.js",
      "link-up",
    ]->Array.forEach(path => expect(Node.exists(Node.join(output, path)))->toBe(true))
    let worker = Node.read(Node.join(output, "sw.js"))
    let _ = Node.classicScript(worker)
    [
      "self.__WB_MANIFEST",
      "storage.googleapis.com",
      "importScripts(",
      "from\"workbox-precaching\"",
      "from \"workbox-precaching\"",
    ]->Array.forEach(value => {
      expect(worker)->negate->toContain(value)
    })
    expect(worker)->toContain("\"url\":\"home.html\"")
    expect(worker)->toContain("\"url\":\"about.html\"")
    expect(worker)->toContain("\"revision\":\"")
    expect(Node.read(Node.join(output, "manifest.json")))->toContain("\"start_url\": \"/\"")
    [
      "Default.html",
      "js/authentication.js",
      "sw.bundle.js",
      "ServiceWorker.res",
      "ServiceWorker.res.js",
      "js/AppInitialization.res",
    ]->Array.forEach(path => {
      expect(Node.exists(Node.join(output, path)))->toBe(false)
    })
  },
  ~timeout=30_000,
)

[
  ("src/web/ServiceWorker.res", "service worker"),
  ("src/server/Server.res", "server"),
]->Array.forEach(((path, name)) => {
  test(
    "fails when the " ++ name ++ " cannot compile",
    async () => {
      let directory = createFixture()
      Node.write(Node.join(directory, path), "let =\n")
      let result = await runTask(directory, "build")
      expect(result.exitCode)->negate->toBe(0)
      expect(result.stdout ++ result.stderr)->toContain("Syntax error")
      expect(Node.exists(Node.join(directory, "dist/link-up")))->toBe(false)
    },
    ~timeout=30_000,
  )
})

test(
  "fails when the browser bundle cannot resolve an import",
  async () => {
    let directory = createFixture()
    let path = Node.join(directory, "src/web/js/AppInitialization.res")
    Node.write(
      path,
      "@module(\"missing-browser-dependency\") external missing: unit => unit = \"missing\"\nmissing()\n",
    )
    let result = await runTask(directory, "build")
    expect(result.exitCode)->negate->toBe(0)
    expect(result.stderr)->toContain("missing-browser-dependency")
  },
  ~timeout=30_000,
)

test(
  "the test command propagates the test runner exit code",
  async () => {
    let directory = createFixture()
    Node.copy(
      Node.join(projectDirectory, "test/BunTest.res"),
      Node.join(directory, "test/BunTest.res"),
      {recursive: false},
    )
    Node.write(
      Node.join(directory, "test/Regression_test_.res"),
      "BunTest.test(\"fixture failure\", () => {\n  BunTest.expect(true)->BunTest.toBe(false)\n})\n",
    )
    let result = await runTask(directory, "test")
    expect(result.exitCode)->toBe(1)
    expect(result.stdout ++ result.stderr)->toContain("fixture failure")
  },
  ~timeout=30_000,
)

test(
  "the start command serves from another working directory",
  async () => {
    let directory = createFixture()
    await TestProcess.withServer(
      Node.tmpdir(),
      [Node.executable, Node.join(directory, "tools/Build.res.js"), "start"],
      async url => {
        let response = await Http.fetch(url, {})
        expect(Http.status(response))->toBe(200)
        expect(await Http.text(response))->toBe(Node.read(Node.join(directory, "dist/about.html")))
      },
    )
  },
  ~timeout=30_000,
)

test(
  "the executable embeds every asset and preserves routing after relocation",
  async () => {
    let directory = createFixture()
    let result = await runTask(directory, "build")
    expect(result.exitCode)->toBe(0)
    let executable = Node.join(directory, "link-up")
    Node.copy(Node.join(directory, "dist/link-up"), executable, {recursive: false})
    // Removing the assets proves the executable serves its embedded files.
    Node.remove(Node.join(directory, "dist"), {recursive: true, force: true})
    await TestProcess.withServer(Node.tmpdir(), [executable], async url => {
      let fetch = (path, options) => Http.fetch(Http.href(Http.url(path, url)), options)
      let response = await fetch("/", {})
      expect(Http.status(response))->toBe(200)
      expect(await Http.text(response))->toBe(Node.read(Node.join(directory, "src/web/about.html")))
      await each(["/home", "/home.html", "/about", "/about.html"], async path => {
        let response = await fetch(path, {})
        expect(Http.status(response))->toBe(200)
        expect(Http.headers(response)->Http.header("Content-Type")->Nullable.getOrThrow)->toContain(
          "text/html",
        )
        let filename = if path->String.startsWith("/home") {
          "home.html"
        } else {
          "about.html"
        }
        expect(await Http.text(response))->toBe(
          Node.read(Node.join(directory, "src/web/" ++ filename)),
        )
        let head = await fetch(path, {method: "HEAD"})
        expect(Http.status(head))->toBe(200)
        expect(await Http.text(head))->toBe("")
      })
      await each(["/", "/Default.html"], async path => {
        await each(
          ["GET", "HEAD"],
          async method => {
            let response = await fetch(path, {method, redirect: "manual"})
            expect(Http.status(response))->toBe(302)
            expect(Http.headers(response)->Http.header("Location")->Nullable.getOrThrow)->toBe(
              "/about.html",
            )
            expect(Http.headers(response)->Http.header("Cache-Control")->Nullable.getOrThrow)->toBe(
              "no-store",
            )
            expect(await Http.text(response))->toBe("")
          },
        )
      })
      await each(
        [
          "/js/appInitialization.js",
          "/manifest.json",
          "/sw.js",
          "/styles/global.css",
          "/external/pico.cyan.min.css",
          "/external/htmx.min.js",
          "/icons/192x192.png",
          "/icons/24x24.png",
          "/icons/48x48.png",
          "/icons/512x512.png",
          "/icons/icon_192.png",
          "/icons/icon_24.png",
          "/icons/icon_48.png",
          "/icons/icon_512.png",
        ],
        async path => {
          let response = await fetch(path, {})
          expect(Http.status(response))->toBe(200)
          let head = await fetch(path, {method: "HEAD"})
          expect(Http.status(head))->toBe(200)
          expect(await Http.text(head))->toBe("")
        },
      )
      await each(["/", "/home.html", "/sw.js"], async path => {
        let response = await fetch(path, {method: "POST"})
        expect(Http.status(response))->toBe(404)
      })
      await each(["/missing", "/js/authentication.js"], async path => {
        let response = await fetch(path, {})
        expect(Http.status(response))->toBe(404)
      })
    })
  },
  ~timeout=30_000,
)

/**
 * @author Andrew Velez
 * @license MIT
 * @description Build the ReScript PWA assets and compile the Bun application host.
 */
let outputDirectory = "./dist"
let executablePath = "./dist/link-up"

let bundle = async options => {
  let result = await BunRuntime.build(options)
  if !result.success {
    let messages = result.logs->Array.map(value => String.make(value))->Array.join("\n")
    if messages == "" {
      panic("Build failed.")
    } else {
      panic(messages)
    }
  }
}

let build = async () => {
  Node.remove(outputDirectory, {recursive: true, force: true})
  Node.copy(
    "./src/web",
    outputDirectory,
    {
      recursive: true,
      filter: (source, _destination) => {
        !(source->String.endsWith(".res")) &&
        !(source->String.endsWith(".resi")) &&
        !(source->String.endsWith(".res.js"))
      },
    },
  )
  await bundle({
    entrypoints: ["./src/web/js/AppInitialization.res.js"],
    outdir: "./dist/js",
    naming: {entry: "appInitialization.js"},
    target: "browser",
    minify: true,
  })
  await bundle({
    entrypoints: ["./src/web/ServiceWorker.res.js"],
    outdir: outputDirectory,
    naming: {entry: "sw.bundle.js"},
    target: "browser",
    minify: true,
  })
  let result = await Workbox.injectManifest({
    globDirectory: outputDirectory,
    globPatterns: ["**/*.{html,js,json,css,svg,png}"],
    swSrc: "./dist/sw.bundle.js",
    swDest: "./dist/sw.js",
  })
  Node.remove("./dist/sw.bundle.js", {force: true})
  if result.warnings->Array.length > 0 {
    Console.warn(
      "Warnings encountered while injecting the manifest: " ++ result.warnings->Array.join("\n"),
    )
  }
  await bundle({
    entrypoints: ["./src/server/Server.res.js"],
    compile: {outfile: executablePath},
    naming: {asset: "[name].[ext]", entry: "[name].[ext]"},
  })
}

let test = async () => {
  await build()
  let tests =
    Node.readDirectory("./test")
    ->Array.filter(name => name->String.endsWith("_test_.res.js"))
    ->Array.map(name => "./test/" ++ name)
  if tests->Array.length == 0 {
    panic("No compiled ReScript tests found.")
  }
  let runner = BunRuntime.spawn(
    [Node.executable, "test"]->Array.concat(tests),
    {stdout: "inherit", stderr: "inherit"},
  )
  Node.process.exitCode = await runner.exited
}

let start = async () => {
  await build()
  let _ = await import(Server.server)
}

if !(%raw("import.meta.main")) {
  panic("Build.res.js must be run directly, not imported.")
}
Node.chdir(Node.join(%raw("import.meta.dir"), ".."))
let main = async () => {
  switch Node.argv->Array.get(2) {
  | Some("build") => await build()
  | Some("test") => await test()
  | Some("start") => await start()
  | _ => panic("Usage: bun run <build|test|start>")
  }
}
let _ = await main()

/**
 * @author Andrew Velez
 * @license MIT
 * @description Tests revisioned precaching and startup navigation fallback.
 */
open BunTest

type plugin = {options: Workbox.fallbackOptions}
type strategy = {options: {plugins: array<plugin>}}
type route = {matches: Workbox.context => bool, strategy: strategy}
let originalSelf = TestGlobals.descriptor(TestGlobals.globals, "self")
let precacheAndRoute = mock((_manifest: array<Workbox.entry>, _options: Workbox.precacheOptions) =>
  ()
)
let registered = ref(None)
let registerRoute = mock((matches, strategy) => registered := Some({matches, strategy}))
let networkOnly = mock(options => {options: options})
let fallback = mock(options => {options: options})

mockModule("workbox-precaching", () =>
  {"precacheAndRoute": precacheAndRoute, "PrecacheFallbackPlugin": fallback}
)
mockModule("workbox-routing", () => {"registerRoute": registerRoute})
mockModule("workbox-strategies", () => {"NetworkOnly": networkOnly})

afterEach(() => {
  clear()
  TestGlobals.restore("self", originalSelf)
})

test(
  "precaches revisioned assets and routes startup navigation with an offline fallback",
  async () => {
    let manifest: array<Workbox.entry> = [
      {revision: "app-revision", url: "js/appInitialization.js"},
      {revision: "about-revision", url: "about.html"},
    ]
    TestGlobals.set(TestGlobals.globals, "self", {"__WB_MANIFEST": manifest})
    await TestGlobals.importModule("../src/web/ServiceWorker.res.js")
    expect(precacheAndRoute)->toHaveBeenCalledTimes(1)
    expect(precacheAndRoute)->toHaveBeenCalledWith2(manifest, {Workbox.directoryIndex: ""})
    expect(registerRoute)->toHaveBeenCalledTimes(1)
    expect(fallback)->toHaveBeenCalledWith({Workbox.fallbackURL: "/about.html"})
    let route = registered.contents->Option.getOrThrow
    expect(route.strategy.options.plugins->Array.length)->toBe(1)
    let plugin = route.strategy.options.plugins->Array.get(0)->Option.getOrThrow
    expect(plugin.options.fallbackURL)->toBe("/about.html")
    [
      ("/", "navigate", true),
      ("/Default.html", "navigate", true),
      ("/about.html", "navigate", false),
      ("/home.html", "navigate", false),
      ("/", "cors", false),
    ]->Array.forEach(((path, mode, expected)) => {
      expect(route.matches({request: {mode: mode}, url: {pathname: path}}))->toBe(expected)
    })
  },
)

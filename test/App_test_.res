/**
 * @author Andrew Velez
 * @license MIT
 * @description Tests shared browser initialization and PWA registration.
 */
open BunTest

type button = {mutable hidden: bool, addEventListener: (string, Browser.event => unit) => unit}
type listener = {callback: Browser.event => unit, options: Browser.listenerOptions}
type context = {
  button: button,
  listeners: Dict.t<Browser.event => unit>,
  windowListeners: Dict.t<listener>,
  replace: string => unit,
}
type worker = {register: string => promise<unit>}
type navigator = {share?: Browser.shareData => promise<unit>, serviceWorker?: worker}

let originals =
  ["document", "navigator", "window"]->Array.map(name => (
    name,
    TestGlobals.descriptor(TestGlobals.globals, name),
  ))
let importNumber = ref(0)

let loadApp = async (
  ~share=?,
  ~serviceWorker=?,
  ~href="https://example.test/home.html",
  ~hasButton=true,
  (),
) => {
  let listeners = Dict.make()
  let windowListeners = Dict.make()
  let button = {
    hidden: true,
    addEventListener: mock((name, callback) => Dict.set(listeners, name, callback)),
  }
  let replace = mock((_url: string) => ())
  TestGlobals.set(
    TestGlobals.globals,
    "document",
    {
      "querySelector": mock(selector => {
        if hasButton && selector == "#share-button" {
          Nullable.make(button)
        } else {
          Nullable.null
        }
      }),
    },
  )
  TestGlobals.set(
    TestGlobals.globals,
    "window",
    {
      "location": {"href": href, "replace": replace},
      "addEventListener": mock((name, callback, options) =>
        Dict.set(windowListeners, name, {callback, options})
      ),
    },
  )
  let navigator: navigator = {?share, ?serviceWorker}
  TestGlobals.set(TestGlobals.globals, "navigator", navigator)
  importNumber := importNumber.contents + 1
  await TestGlobals.importModule(
    "../src/web/js/AppInitialization.res.js?test=" ++ Int.toString(importNumber.contents),
  )
  {button, listeners, windowListeners, replace}
}

let click = context => {
  let callback = context.listeners->Dict.get("click")->Option.getOrThrow
  callback(TestGlobals.event)
}
let load = context => {
  let listener = context.windowListeners->Dict.get("load")->Option.getOrThrow
  listener.callback(TestGlobals.event)
}

afterEach(() => {
  restore()
  clear()
  originals->Array.forEach(((name, original)) => TestGlobals.restore(name, original))
})

["/", "/Default.html", "/about.html", "/home.html"]->Array.forEach(path => {
  test("initialization preserves " ++ path, async () => {
    let context = await loadApp(~href="https://example.test" ++ path, ())
    expect(context.replace)->toHaveBeenCalledTimes(0)
  })
})

test("shares the current page without its fragment", async () => {
  let share = mock((_data: Browser.shareData) => Promise.resolve())
  let context = await loadApp(~share, ~href="https://example.test/home.html#section", ())
  expect(context.button.hidden)->toBe(false)
  click(context)
  expect(share)->toHaveBeenCalledWith({
    Browser.title: "Link-Up",
    text: "Take a look at Link-Up.",
    url: "https://example.test/home.html",
  })
})

[("AbortError", 0), ("NotAllowedError", 1)]->Array.forEach(((name, errorCount)) => {
  test("handles a " ++ name ++ " share rejection", async () => {
    let error = {"name": name}
    let errorSpy = spyOn(TestGlobals.console, "error")
    errorSpy->mockImplementation(() => ())
    let share = mock(async (_data: Browser.shareData) => JsExn.throw(error))
    let context = await loadApp(~share, ())
    click(context)
    await Promise.resolve()
    expect(errorSpy)->toHaveBeenCalledTimes(errorCount)
    if errorCount > 0 {
      expect(errorSpy)->toHaveBeenCalledWith2("Unable to share Link-Up.", error)
    }
  })
})

test("registers the service worker once on window load", async () => {
  let register = mock(_url => Promise.resolve())
  let context = await loadApp(~serviceWorker={register: register}, ())
  expect(register)->toHaveBeenCalledTimes(0)
  let listener = context.windowListeners->Dict.get("load")->Option.getOrThrow
  expect(listener.options)->toEqual({Browser.once: true})
  load(context)
  expect(register)->toHaveBeenCalledWith("./sw.js")
})

test("reports a service-worker registration rejection", async () => {
  let error = {"name": "SecurityError"}
  let errorSpy = spyOn(TestGlobals.console, "error")
  errorSpy->mockImplementation(() => ())
  let register = mock(async _url => JsExn.throw(error))
  let context = await loadApp(~serviceWorker={register: register}, ())
  load(context)
  await Promise.resolve()
  expect(errorSpy)->toHaveBeenCalledWith2("Service-worker registration failed.", error)
})

test("leaves unsupported sharing and service workers disabled", async () => {
  let context = await loadApp()
  expect(context.button.hidden)->toBe(true)
  expect(context.listeners->Dict.has("click"))->toBe(false)
  expect(context.windowListeners->Dict.has("load"))->toBe(false)
})

test("initializes an About page without a share button", async () => {
  let share = mock((_data: Browser.shareData) => Promise.resolve())
  let context = await loadApp(~share, ~hasButton=false, ())
  expect(context.listeners->Dict.has("click"))->toBe(false)
})

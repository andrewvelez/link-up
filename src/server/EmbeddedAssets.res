/**
 * @author Andrew Velez
 * @license MIT
 * @description Bun embeds these build outputs in the standalone server executable.
 */
@module({from: "../../dist/about.html", with: {type_: "file"}})
external about: string = "default"
@module({from: "../../dist/js/appInitialization.js", with: {type_: "file"}})
external appInitialization: string = "default"
@module({from: "../../dist/home.html", with: {type_: "file"}})
external home: string = "default"
@module({from: "../../dist/manifest.json", with: {type_: "file"}})
external manifest: string = "default"
@module({from: "../../dist/sw.js", with: {type_: "file"}})
external serviceWorker: string = "default"
@module({from: "../../dist/external/htmx.min.js", with: {type_: "file"}})
external htmx: string = "default"
@module({from: "../../dist/styles/global.css", with: {type_: "file"}})
external styles: string = "default"
@module({from: "../../dist/external/pico.cyan.min.css", with: {type_: "file"}})
external picoStyles: string = "default"
@module({from: "../../dist/icons/192x192.png", with: {type_: "file"}})
external icon192X192: string = "default"
@module({from: "../../dist/icons/24x24.png", with: {type_: "file"}})
external icon24X24: string = "default"
@module({from: "../../dist/icons/48x48.png", with: {type_: "file"}})
external icon48X48: string = "default"
@module({from: "../../dist/icons/512x512.png", with: {type_: "file"}})
external icon512X512: string = "default"
@module({from: "../../dist/icons/icon_192.png", with: {type_: "file"}})
external iconicon192: string = "default"
@module({from: "../../dist/icons/icon_24.png", with: {type_: "file"}})
external iconicon24: string = "default"
@module({from: "../../dist/icons/icon_48.png", with: {type_: "file"}})
external iconicon48: string = "default"
@module({from: "../../dist/icons/icon_512.png", with: {type_: "file"}})
external iconicon512: string = "default"

let files = [
  ("/about.html", about),
  ("/js/appInitialization.js", appInitialization),
  ("/home.html", home),
  ("/manifest.json", manifest),
  ("/sw.js", serviceWorker),
  ("/external/htmx.min.js", htmx),
  ("/styles/global.css", styles),
  ("/external/pico.cyan.min.css", picoStyles),
  ("/icons/192x192.png", icon192X192),
  ("/icons/24x24.png", icon24X24),
  ("/icons/48x48.png", icon48X48),
  ("/icons/512x512.png", icon512X512),
  ("/icons/icon_192.png", iconicon192),
  ("/icons/icon_24.png", iconicon24),
  ("/icons/icon_48.png", iconicon48),
  ("/icons/icon_512.png", iconicon512),
]

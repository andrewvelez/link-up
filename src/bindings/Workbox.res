/**
 * @author Andrew Velez
 * @license MIT
 * @description Workbox precaching and network-only startup fallback bindings.
 */
type entry = {revision: string, url: string}
type plugin
type strategy
type context = {request: {mode: string}, url: {pathname: string}}
type manifestOptions = {
  globDirectory: string,
  globPatterns: array<string>,
  swSrc: string,
  swDest: string,
}
type manifestResult = {warnings: array<string>}

type precacheOptions = {directoryIndex: string}
type fallbackOptions = {fallbackURL: string}
type strategyOptions = {plugins: array<plugin>}

@module("workbox-precaching")
external precacheAndRoute: (array<entry>, precacheOptions) => unit = "precacheAndRoute"
@module("workbox-precaching") @new
external fallback: fallbackOptions => plugin = "PrecacheFallbackPlugin"
@module("workbox-strategies") @new external networkOnly: strategyOptions => strategy = "NetworkOnly"
@module("workbox-routing")
external registerRoute: (context => bool, strategy) => unit = "registerRoute"
@module("workbox-build")
external injectManifest: manifestOptions => promise<manifestResult> = "injectManifest"

/**
 * @author Andrew Velez
 * @license MIT
 * @description The DOM and PWA APIs used by the shared page initializer.
 */
type element
type event
type serviceWorker
type registration
type shareData = {title: string, text: string, url: string}
type navigator = {
  share: Nullable.t<shareData => promise<unit>>,
  serviceWorker: Nullable.t<serviceWorker>,
}
type window = {location: {href: string}}

@val external navigator: navigator = "navigator"
@val external window: window = "window"
@scope("document") @val external querySelector: string => Nullable.t<element> = "querySelector"
@set external setHidden: (element, bool) => unit = "hidden"
@send external onClick: (element, @as("click") _, event => unit) => unit = "addEventListener"
type listenerOptions = {once: bool}
@scope("window") @val
external onLoad: (@as("load") _, event => unit, listenerOptions) => unit = "addEventListener"
@send external share: (navigator, shareData) => promise<unit> = "share"
@send external register: (serviceWorker, string) => promise<registration> = "register"
@scope("console") @val external error: (string, 'error) => unit = "error"

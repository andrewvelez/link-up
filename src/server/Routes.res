/**
 * @author Andrew Velez
 * @license MIT
 * @description Embedded PWA routes and authentication-dependent startup redirects.
 */
let getStartPage = (state: Authentication.state) => {
  switch (state :> string) {
  | "unknown" => "about.html"
  | "known" | "authenticated" => "home.html"
  | _ => panic("Unsupported authentication state.")
  }
}

let asset = path => {
  let serve = async (_request: Http.request) => Http.response(BunRuntime.file(path), {})
  BunRuntime.Methods({get: serve, head: serve})
}

let redirectStartup = async request => {
  let state = await Authentication.getAuthenticationState(request)
  Http.response(
    Nullable.null,
    {
      status: 302,
      headers: Dict.fromArray([
        ("Location", "/" ++ getStartPage(state)),
        ("Cache-Control", "no-store"),
      ]),
    },
  )
}

let routes = {
  let startup = BunRuntime.Methods({get: redirectStartup, head: redirectStartup})
  let routes = Dict.fromArray([
    ("/", startup),
    ("/Default.html", startup),
    ("/home", asset(EmbeddedAssets.home)),
    ("/about", asset(EmbeddedAssets.about)),
    ("/*", BunRuntime.Handler(async _ => Http.response("Not found", {status: 404}))),
  ])
  EmbeddedAssets.files->Array.forEach(((url, path)) => Dict.set(routes, url, asset(path)))
  routes
}

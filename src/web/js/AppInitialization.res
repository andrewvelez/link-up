/**
 * @author Andrew Velez
 * @license MIT
 * @description Shared listener setup and service-worker registration using browser APIs.
 */
let shareLinkUp = async (_event: Browser.event) => {
  try {
    await Browser.share(
      Browser.navigator,
      {
        title: "Link-Up",
        text: "Take a look at Link-Up.",
        url: Browser.window.location.href->String.split("#")->Array.get(0)->Option.getOr(""),
      },
    )
  } catch {
  | JsExn(error) =>
    if JsExn.name(error) != Some("AbortError") {
      Browser.error("Unable to share Link-Up.", error)
    }
  | error => Browser.error("Unable to share Link-Up.", error)
  }
}

let registerServiceWorker = async (_event: Browser.event) => {
  switch Browser.navigator.serviceWorker->Nullable.toOption {
  | Some(worker) =>
    try {
      let _ = await Browser.register(worker, "./sw.js")
    } catch {
    | JsExn(error) => Browser.error("Service-worker registration failed.", error)
    | error => Browser.error("Service-worker registration failed.", error)
    }
  | None => ()
  }
}

let addAppListeners = () => {
  switch (
    Browser.querySelector("#share-button")->Nullable.toOption,
    typeof(Browser.navigator.share),
  ) {
  | (Some(button), #function) =>
    Browser.setHidden(button, false)
    Browser.onClick(button, event => {shareLinkUp(event)->ignore})
  | _ => ()
  }
  if Browser.navigator.serviceWorker->Nullable.toOption->Option.isSome {
    Browser.onLoad(event => {registerServiceWorker(event)->ignore}, {once: true})
  }
}

addAppListeners()

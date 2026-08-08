<!--
SPDX-License-Identifier: MIT
Copyright (c) 2026 Andrew Velez
Description: Practical Bun-WebUI API guide for Link-Up's Bun and browser JavaScript.
-->

# Bun-WebUI HowTo for Bun and JavaScript

This guide explains `@webui-dev/bun-webui` as it is used by Link-Up. It is
written for plain JavaScript running with Bun, even though many upstream
examples use TypeScript syntax.

The guide was verified on 2026-08-06 against:

- Link-Up's pinned `@webui-dev/bun-webui` version: `2.5.7`.
- Bun `1.3.14`.
- The package's installed public declarations and implementation.
- The current [official Bun API reference](https://webui.me/docs.html#/bun).
- The tagged [Bun-WebUI 2.5.7 source](https://github.com/webui-dev/bun-webui/tree/2.5.7).

The old documentation link in Bun-WebUI's README,
`https://webui.me/docs/2.5/#/`, is stale. The Bun-specific page above is the
relevant upstream reference. The separate
[JavaScript Frontend API](https://webui.me/docs.html#/javascript) describes the
browser end of the same bridge; it is not a replacement for the Bun API.

## The short mental model

There are two JavaScript runtimes and two different API objects:

| Where code runs | API object | What it does |
| --- | --- | --- |
| Bun process | `WebUI` with a capital `W` | Creates windows, serves content, binds privileged callbacks, controls lifecycle, and calls browser code. |
| Browser or WebView | `webui` in lowercase | Calls callbacks registered by Bun and reports bridge connection state. |

They are connected like this:

```text
Browser JavaScript
await webui.call("getStatus")
            │
            │ webui.js + local WebSocket bridge
            ▼
Bun-WebUI native library
            │
            ▼
Bun JavaScript
hostWindow.bind("getStatus", callback)
```

Both sides use JavaScript syntax, but they do not share a global scope:

- Bun code can use Bun APIs such as `Bun.file()` and HTML text imports. It does
  not have `document`, DOM elements, or the browser's `window` object.
- Browser code can use the DOM and Web APIs. It cannot use `Bun.file()`, Bun
  FFI, or other privileged Bun APIs.
- `WebUI.Runtime.Bun` does not change this model. See
  [What setRuntime really means](#what-setruntime-really-means).

## Small complete example

### Bun host

This is plain JavaScript. The HTML text import is a Bun feature, not a
Bun-WebUI feature.

```js
import { WebUI } from "@webui-dev/bun-webui";
import applicationHtml from "../web/index.html" with { type: "text" };

const hostWindow = new WebUI();

hostWindow.bind("getStatus", () => "Link-Up is running.");

hostWindow.bind("greet", (event) => {
  const name = event.arg.string(0);
  return `Hello, ${name}.`;
});

await hostWindow.show(applicationHtml);
await WebUI.wait();
```

The usual order is:

1. Create a `WebUI` instance.
2. Apply settings that must take effect before launch.
3. Register callbacks with `bind()`.
4. `await hostWindow.show(...)`.
5. `await WebUI.wait()` so the Bun process remains alive until all windows
   close.

`show()` and `showBrowser()` return `Promise<void>` in version `2.5.7`; await
them so startup and connection errors reach the caller. `showWebView()` is
different: it is synchronous and returns a `boolean`.

### Browser page

`webui.js` is a virtual file served by WebUI. It is not a file that should be
copied into Link-Up. The root-relative URL below is correct when WebUI serves
the page from its local origin. If `show()` opens an external `http://` or
`https://` page, `/webui.js` points at that external origin instead; a page you
control there must load the bridge from the absolute WebUI server URL.

```html
<script src="/webui.js"></script>

<button id="get-status" type="button">Get status</button>
<output id="status">Waiting</output>

<script>
  const button = document.querySelector("#get-status");
  const output = document.querySelector("#status");

  button.addEventListener("click", async () => {
    try {
      output.textContent = await globalThis.webui.call("getStatus");
    } catch (error) {
      output.textContent = `Host unavailable: ${error}`;
    }
  });
</script>
```

The operation name must match exactly on both sides:

```text
hostWindow.bind("getStatus", callback)
                           ▲
await webui.call("getStatus")
```

## How this maps to Link-Up

Link-Up currently keeps Bun-WebUI behind a small host adapter:

| Link-Up code | Upstream operation |
| --- | --- |
| [`bind()`](../../src/WebUI/BunWebUIAdapter.js) | `WebUI.prototype.bind()` |
| [`setRootFolder()`](../../src/WebUI/BunWebUIAdapter.js) | `WebUI.prototype.setRootFolder()` |
| [`open()`](../../src/WebUI/BunWebUIAdapter.js) | `WebUI.prototype.show()` |
| [`wait()`](../../src/WebUI/BunWebUIAdapter.js) | `WebUI.wait()` |

This matches Link-Up's [design](../DESIGN.md): Bun-WebUI is a replaceable,
optional desktop-packaging adapter, not the application core. `bind()` is
exported but currently unused — no operation is registered, because the
service worker under `web/` serves the application uniformly whether it runs
in a browser or inside this window, so no domain logic needs to cross the
Bun-WebUI bridge. Add a bound operation only when a genuine native-only
capability is needed.

[`src/app.js`](../../src/app.js) calls `setRootFolder("./web")` then
`open("app.html")`: the window serves Link-Up's whole static PWA bundle
(`web/app.html`, `web/index.html`, `web/sw.js`, `web/manifest.webmanifest`,
`web/vendor/`, `web/icons/`) from disk, and opens straight into the
hypermedia SPA — the same entry point the installed PWA's manifest
`start_url` uses. This relies on `setRootFolder`'s path resolving relative to
the process's working directory; running the compiled executable from
somewhere other than the repository root is not yet verified to work.

One current detail matters when reading the code: Link-Up's `open()` calls
`webUI.show(page)` without returning its promise. The upstream method is
asynchronous, so the current adapter does not propagate browser-start or
connection failures to `src/app.js`. This guide documents the upstream
`await hostWindow.show(...)` behavior; it does not silently redefine `open()`.

## Calling Bun operations from the page

### Recommended style: explicit operation calls

Use operation names that describe a narrow host capability:

```js
// Bun
hostWindow.bind("formatGreeting", (event) => {
  const name = event.arg.string(0).trim();

  if (name.length === 0 || name.length > 80) {
    return "Please enter a name between 1 and 80 characters.";
  }

  return `Hello, ${name}.`;
});
```

```js
// Browser
const greeting = await globalThis.webui.call("formatGreeting", "Andrew");
```

`webui.call()` is preferable to the generated aliases that WebUI also tries to
create, such as `formatGreeting(...)` and `webui.formatGreeting(...)`. The
explicit form is always clear about crossing the host boundary and avoids
global-name collisions.

Choose binding names that do not match properties already present on either
`globalThis` or the lowercase `webui` object. Alias generation can overwrite a
bridge method even when application code uses explicit calls. In particular,
do not bind names such as `call`, `encode`, `decode`, `isConnected`, or
`setEventCallback`.

### Reading arguments

Every bound Bun callback receives one event object. Browser arguments are read
by zero-based index:

| Accessor | Bun value | Typical browser argument |
| --- | --- | --- |
| `event.arg.string(index)` | `string` | `"Andrew"` |
| `event.arg.number(index)` | integer `number` | `42` |
| `event.arg.float(index)` | floating-point `number` | `12.5` |
| `event.arg.boolean(index)` | `boolean` | `true` |
| `event.arg.size(index)` | byte length as `number` | Inspect an argument's encoded size |

The rest of the event is:

| Property | Meaning |
| --- | --- |
| `event.window` | The `WebUI` instance that received the event. |
| `event.eventType` | One of the Bun-side `WebUI.EventType` values. |
| `event.eventNumber` | The internal event identifier, also used to target a client. |
| `event.element` | The bound operation or element name associated with the event. |

`WebUI.Event` in upstream examples is a TypeScript type alias. It is not a
constructor to instantiate in plain JavaScript.

### Returning structured values

Treat the browser's resolved response as a string. Return JSON explicitly for
objects and arrays:

```js
// Bun
hostWindow.bind("getSummary", () => {
  return JSON.stringify({ status: "ready", peerCount: 0 });
});
```

```js
// Browser
const summary = JSON.parse(
  await globalThis.webui.call("getSummary"),
);
```

Returning `undefined` produces an empty response. Although the wrapper accepts
string, number, and boolean callback results, the frontend bridge ultimately
receives text. Do not return a JavaScript object without serializing it.

Handle expected errors inside a bound callback and return a controlled result.
The wrapper does not provide a dependable protocol for sending a thrown Bun
exception and stack trace back to the browser.

### Element binding versus function binding

`bind()` serves two related purposes:

- If the bound name matches an element `id`, WebUI can automatically report a
  click as `WebUI.EventType.MouseClick`.
- `webui.call(name, ...)` invokes the same binding explicitly as
  `WebUI.EventType.Callback`.

For example, this needs no browser click listener:

```js
hostWindow.bind("save-button", () => {
  return "Saved";
});
```

```html
<button id="save-button" type="button">Save</button>
```

Link-Up's current approach is the explicit function style: the DOM id is
`get-status`, while the host operation is `getStatus`. This avoids accidental
double calls when application code already owns the click listener.

### Catch-all events

Binding an empty name subscribes to all WebUI events:

```js
hostWindow.bind("", (event) => {
  switch (event.eventType) {
    case WebUI.EventType.Connected:
      console.info("Browser connected");
      break;
    case WebUI.EventType.Disconnected:
      console.info("Browser disconnected");
      break;
    case WebUI.EventType.Navigation:
      console.info("Navigation requested:", event.arg.string(0));
      // Intentionally deny it by not calling event.window.navigate(...).
      break;
  }
});
```

This also changes navigation handling: navigation events are sent to the host
for a decision. The sample denies the request. To allow one, validate its URL
and then call `event.window.navigate(allowedUrl)`; the frontend can instead use
`webui.allowNavigation(true)` to permit navigation generally. Use a catch-all
binding only when Link-Up actually needs host policy for these events.

## Calling browser JavaScript from Bun

### `run()` for fire-and-forget code

```js
const message = "Connected";

hostWindow.run(
  `renderHostStatus(${JSON.stringify(message)})`,
);
```

```js
// Browser
function renderHostStatus(message) {
  document.querySelector("#status").textContent = message;
}
```

`run()` returns immediately. It does not return a browser result or report a
browser exception to the caller.

### `script()` when Bun needs a result

```js
const title = await hostWindow.script("return document.title", {
  timeout: 5,
  bufferSize: 64 * 1024,
});
```

`script()` returns `Promise<string>`. Its options are:

- `timeout`: maximum script time in seconds; `0` delegates to WebUI's no-timeout
  behavior.
- `bufferSize`: response-buffer capacity in bytes; the wrapper default is
  `1_024_000` bytes.

The Promise does not make this wrapper nonblocking. `script()` and
`scriptClient()` call synchronous native FFI while waiting for the browser
result, then create a resolved or rejected Promise. They can block Bun until
the result arrives or the timeout expires.

Both `run()` and `script()` execute dynamically supplied code in the page.
Never interpolate untrusted text directly into the script. Prefer a narrow
bound operation in the other direction, or serialize data with
`JSON.stringify()` as shown above.

### `scriptClient()` for one connected tab

`script()` is unavailable when multi-client mode is enabled. Use
`scriptClient()` with the event that identifies the calling client:

```js
WebUI.setMultiClient(true);

hostWindow.bind("getCallingPage", (event) => {
  return hostWindow.scriptClient(
    event,
    "return location.href",
  );
});
```

### `sendRaw()` for Bun-to-browser bytes

```js
// Bun
hostWindow.sendRaw(
  "receiveBytes",
  new Uint8Array([0x01, 0x02, 0x03]),
);
```

```js
// Browser
function receiveBytes(bytes) {
  console.log(bytes instanceof Uint8Array, bytes.byteLength);
}
```

Version `2.5.7` does not expose a corresponding raw-byte getter on the Bun
event object. For browser-to-Bun binary content, use an explicitly verified
encoding such as Base64 or a separate data channel instead of assuming a
`Uint8Array` remains directly accessible.

## Choosing what `show()` serves

`show()`, `showBrowser()`, `showWebView()`, and `startServer()` accept a content
string. WebUI interprets it as one of these forms:

- Complete inline HTML.
- A local HTML file or folder entry path.
- An `http://` or `https://` URL.

### Embedded HTML with Bun

A Bun text import is available as an alternative to serving a folder:

```js
import applicationHtml from "../web/index.html" with { type: "text" };

await hostWindow.show(applicationHtml);
```

This keeps the HTML authorable as HTML while giving Bun-WebUI an inline string.
Bun can embed that string into a compiled executable. Relative CSS, JavaScript,
images, and other resources still need to be served or embedded separately —
which is why this pattern does not work for Link-Up's PWA bundle: a service
worker must be registered from a real fetchable URL, and cannot be inlined or
bundled into one HTML string. Link-Up does not use this pattern.

### Serving a folder

This is what Link-Up currently does, via
[`setRootFolder()`](../../src/WebUI/BunWebUIAdapter.js):

```js
const hostWindow = new WebUI();

hostWindow.setRootFolder("./web");
await hostWindow.show("app.html");
await WebUI.wait();
```

Use `WebUI.setDefaultRootFolder(path)` instead when the same root applies to
every window. `WebUI.setFolderMonitor(true)` enables automatic reloads for
files under the root and is primarily a development option.

### Custom file handler

`setFileHandler()` replaces ordinary file serving for the window. Its async
callback receives a `URL` and must return a complete HTTP response, including
the status line and headers, as a string or `Uint8Array`.

```js
const encoder = new TextEncoder();

function makeResponse(status, contentType, body) {
  const headers = encoder.encode(
    `HTTP/1.1 ${status}\r\n` +
    `Content-Type: ${contentType}\r\n` +
    `Content-Length: ${body.byteLength}\r\n` +
    "\r\n",
  );
  const response = new Uint8Array(headers.byteLength + body.byteLength);
  response.set(headers, 0);
  response.set(body, headers.byteLength);
  return response;
}

hostWindow.setFileHandler(async (url) => {
  if (url.pathname === "/" || url.pathname === "/index.html") {
    const body = await Bun.file("./web/index.html").bytes();
    return makeResponse("200 OK", "text/html; charset=utf-8", body);
  }

  return makeResponse(
    "404 Not Found",
    "text/plain; charset=utf-8",
    encoder.encode("Not found"),
  );
});

await hostWindow.show("index.html");
await WebUI.wait();
```

Build binary responses as bytes. JavaScript string length is not necessarily
the UTF-8 byte length required by `Content-Length`, and concatenating arbitrary
binary bytes into a string can corrupt them.

When a custom file handler is installed, version `2.5.7` deliberately skips
`show()`'s normal browser-status and connection wait. In that mode,
`await show()` means the launch call returned; it does not prove the page is
connected.

Installing either custom handler also changes native configuration for the
whole process: WebUI disables its connection wait and cookie use for every
window, not only the window whose handler was set. The application must then
own the relevant access and authentication policy. This is especially
security-sensitive if any window is public-network accessible.

`setFileHandlerWindow()` is the multi-window form. It receives
`(hostWindow, url)` and supersedes a handler installed with `setFileHandler()`.

## Browser window versus WebView

These APIs are distinct:

```js
// Let WebUI choose an installed browser.
await hostWindow.show(applicationHtml);

// Require a particular installed browser.
await hostWindow.showBrowser(
  applicationHtml,
  WebUI.Browser.Firefox,
);

// Ask for the operating system WebView implementation.
const shown = hostWindow.showWebView(applicationHtml);
if (!shown) {
  throw new Error("WebUI could not create the WebView");
}
await WebUI.wait();
```

`show()` does not mean "embedded WebView." It normally selects and opens an
installed browser. WebView-only methods include `setFrameless()`,
`setTransparent()`, `setResizable()`, `setCloseHandlerWV()`, `minimize()`, and
`maximize()`.

WebView mode depends on platform WebView components. The upstream package
specifically notes that Windows may require `WebView2Loader.dll`.

## API reference by job

This section covers every public member in the `2.5.7` package declarations.
Methods marked advanced expose native, server, process, or FFI details that
Link-Up normally should keep behind its adapter.

### Window creation and lifecycle

| API | Result | Purpose |
| --- | --- | --- |
| `new WebUI()` | `WebUI` instance | Allocate a new native WebUI window. |
| `await hostWindow.show(content)` | `Promise<void>` | Open or refresh content using WebUI's browser selection and wait for a normal bridge connection. |
| `await hostWindow.showBrowser(content, browser)` | `Promise<void>` | Open or refresh content in a requested `WebUI.Browser`. |
| `hostWindow.showWebView(content)` | `boolean` | Synchronously request a platform WebView window. |
| `hostWindow.startServer(content)` | URL `string` | Start WebUI's server without opening a window. |
| `hostWindow.isShown` | `boolean` | Report whether the window is currently shown and connected. |
| `hostWindow.close()` | `void` | Close the window while retaining the instance for possible reuse. |
| `hostWindow.destroy()` | `void` | Close the window and release its native resources; do not reuse it. |
| `hostWindow.focus()` | `void` | Bring the window to the front and focus it. |
| `WebUI.wait()` | `Promise<void>` | Settle after all WebUI windows close or `WebUI.exit()` is called. |
| `WebUI.waitAsync()` | `boolean` | Advanced single native wait/pump check; despite its name, it is not a Promise. |
| `WebUI.exit()` | `void` | Close every window and cause `WebUI.wait()` to finish. |
| `WebUI.clean()` | `void` | Terminal cleanup. WebUI must not be used again in this process. |

`WebUI.wait()` yields to Bun while polling; it does not synchronously freeze the
JavaScript event loop. Avoid a tight loop around `waitAsync()`. If that advanced
API is needed, yield between checks:

```js
while (WebUI.waitAsync()) {
  await Bun.sleep(25);
}
```

### Bindings, events, and browser execution

| API | Result | Purpose |
| --- | --- | --- |
| `hostWindow.bind(name, callback)` | `void` | Register a sync or async Bun callback. Registration is posted to an internal worker. |
| `hostWindow.run(script)` | `void` | Execute browser JavaScript without awaiting a result. |
| `hostWindow.script(script, options)` | `Promise<string>` | Execute browser JavaScript through a blocking native call and obtain a text result. |
| `hostWindow.scriptClient(event, script, options)` | `Promise<string>` | Execute through a blocking native call only for the client represented by an event. |
| `hostWindow.sendRaw(functionName, bytes)` | `void` | Send `Uint8Array` data to a named browser function. |
| `hostWindow.setEventBlocking(status)` | `void` | Ask the native layer to serialize or concurrently process UI events. |
| `WebUI.setMultiClient(status)` | `void` | Permit multiple clients or tabs on one WebUI window. |

### Content, server, and navigation

| API | Result | Purpose |
| --- | --- | --- |
| `hostWindow.setRootFolder(path)` | `void`, throws on failure | Set this window's static content root before `show()`. |
| `WebUI.setDefaultRootFolder(path)` | `boolean` | Set the content root for all windows. |
| `WebUI.setFolderMonitor(status)` | `void` | Toggle automatic reload when root-folder files change. |
| `hostWindow.setFileHandler(callback)` | `void` | Install an async custom HTTP responder. |
| `hostWindow.setFileHandlerWindow(callback)` | `void` | Install the custom responder form that also receives the window. |
| `hostWindow.setPort(port)` | `boolean` | Request a particular WebUI server port. |
| `hostWindow.getPort()` | `number` | Read the running window's port. |
| `hostWindow.getUrl()` | URL `string` | Read the full current WebUI URL. |
| `hostWindow.setPublic(status)` | `void` | Allow or disallow public-network access to the local server. Treat enabling it as security-sensitive. |
| `hostWindow.navigate(url)` | `void` | Navigate the window to another URL. |
| `hostWindow.setProxy(proxyUrl)` | `void` | Set the launched browser's proxy before `show()`. |
| `hostWindow.setRuntime(runtime)` | `void` | Advanced server-side execution policy for requested `.js` and `.ts` files. |
| `hostWindow.setCustomParameters(parameters)` | `void` | Advanced extra command-line parameters for the launched browser. |
| `WebUI.getFreePort()` | `number` | Find a currently unused port; `setPort()` still determines whether it can be reserved. |
| `WebUI.getMimeType(file)` | `string` | Return WebUI's MIME type for a file name. |

### Appearance and window behavior

| API | Result | Purpose |
| --- | --- | --- |
| `hostWindow.setSize(width, height)` | `void` | Set initial width and height in pixels. |
| `hostWindow.setMinimumSize(width, height)` | `void` | Set the minimum window size. |
| `hostWindow.setPosition(x, y)` | `void` | Set the initial screen position. |
| `hostWindow.setCenter()` | `void` | Center the window; call before `show()` for best results. |
| `hostWindow.setHide(status)` | `void` | Start the window hidden when set before `show()`. |
| `hostWindow.setKiosk(status)` | `void` | Toggle kiosk/full-screen behavior. |
| `hostWindow.setFrameless(status)` | `void` | Toggle a WebView frame. |
| `hostWindow.setTransparent(status)` | `void` | Toggle WebView transparency. |
| `hostWindow.setResizable(status)` | `void` | Toggle WebView resizing. |
| `hostWindow.minimize()` | `void` | Minimize a WebView window. |
| `hostWindow.maximize()` | `void` | Maximize a WebView window. |
| `hostWindow.setCloseHandlerWV(allowClose)` | `void` | Set the synchronous WebView close-button policy. This is a flag, not an async callback. |
| `hostWindow.setHighContrast(status)` | `void` | Set high-contrast support for this window. |
| `WebUI.isHighContrast()` | `boolean` | Read the operating system's high-contrast preference. |
| `hostWindow.setIcon(icon, mimeType)` | `void` | Set literal embedded favicon content and its MIME type. SVG text is the clearest supported form. Do not assume a Base64 PNG string is decoded. |

### Browser selection, profiles, and native information

| API | Result | Purpose |
| --- | --- | --- |
| `WebUI.browserExist(browser)` | `boolean` | Check whether a `WebUI.Browser` is available. |
| `hostWindow.getBestBrowser()` | numeric browser id | Ask WebUI which browser it recommends. |
| `WebUI.setBrowserFolder(path)` | `void` | Advanced override for the folder containing a custom browser executable. |
| `hostWindow.setProfile(name, path)` | `void` | Set the launched browser's profile name and directory before `show()`. |
| `hostWindow.deleteProfile()` | `void` | Destructively delete this window's configured browser profile folder. Never point it at Link-Up data. |
| `WebUI.deleteAllProfiles()` | `void` | Destructively delete the browser profile folders known to WebUI. |
| `hostWindow.getParentProcessId()` | numeric PID | Read the launched browser's parent process id. The FFI value may be a `bigint`. |
| `hostWindow.getChildProcessId()` | `number` | Read the last launched browser child process id. |
| `hostWindow.windowId` | `number` | Read this instance's native WebUI window id. |
| `hostWindow.getHwnd()` | FFI pointer | Advanced native window handle (`HWND` on Windows or GTK pointer on Linux). |
| `hostWindow.win32GetHwnd()` | FFI pointer | Advanced Windows-specific handle lookup intended to be more reliable for WebView. |

The word "profile" above means a browser data/profile directory. It is
unrelated to the Link-Up user Profile domain described in
[`docs/DESIGN.md`](../DESIGN.md).

### Process-wide and low-level static APIs

| API | Result | Purpose |
| --- | --- | --- |
| `WebUI.setTimeout(seconds)` | `void` | Set the native browser-start timeout. The Bun wrapper also has its own roughly 30-second connection poll, so `0` does not remove every wrapper-side limit. |
| `WebUI.openUrl(url)` | `void` | Open a URL in the operating system's default browser, outside the controlled WebUI window. |
| `WebUI.setTLSCertificate(certificatePem, privateKeyPem)` | `void`, throws on failure | Configure TLS before serving. It requires a TLS-enabled native WebUI library; the package's automatic download is the ordinary non-TLS build. |
| `WebUI.setLogger(callback)` | `void` | Register an internal logger receiving `(level, message)`; registration is posted to the worker. |
| `WebUI.getLastErrorNumber()` | `number` | Read the native layer's latest error code. |
| `WebUI.getLastErrorMessage()` | `string` | Read the native layer's latest error text. |
| `WebUI.encode(text)` | Base64 `string` | Base64-encode text. This is encoding, not encryption. |
| `WebUI.decode(base64)` | decoded `string` | Base64-decode text. |
| `WebUI.malloc(size)` | FFI pointer | Advanced allocation in WebUI's native memory domain. |
| `WebUI.free(pointer)` | `void` | Free a pointer previously allocated through WebUI. |
| `WebUI.getNewWindowId()` | `number` | Advanced lookup of a free native window number. |
| `WebUI.newWindowId(number)` | `number` | Advanced creation of a native window id. It first destroys an existing window with that id and does not return a usable `WebUI` class instance. |
| `WebUI.version` | `string` | Read the Bun wrapper version, `"2.5.7"` here. It does not identify the downloaded native nightly build. |

Most Link-Up code should not use pointer, native-handle, custom-window-id, or
global-cleanup APIs. If one becomes necessary, keep it inside the host adapter
and document the platform assumptions.

## Runtime enums

These enum objects exist at runtime and can be used from plain JavaScript.

### `WebUI.Browser`

| Name | Value | Meaning |
| --- | ---: | --- |
| `NoBrowser` | 0 | No browser selection. |
| `AnyBrowser` | 1 | Let WebUI choose. |
| `Chrome` | 2 | Google Chrome. |
| `Firefox` | 3 | Mozilla Firefox. |
| `Edge` | 4 | Microsoft Edge. |
| `Safari` | 5 | Apple Safari. |
| `Chromium` | 6 | Chromium. |
| `Opera` | 7 | Opera. |
| `Brave` | 8 | Brave. |
| `Vivaldi` | 9 | Vivaldi. |
| `Epic` | 10 | Epic. |
| `Yandex` | 11 | Yandex. |
| `ChromiumBased` | 12 | Any detected Chromium-based browser. |
| `Webview` | 13 | Native WebView selection. Prefer `showWebView()` for clarity. |

### `WebUI.EventType`

| Name | Value | Meaning on the Bun side |
| --- | ---: | --- |
| `Disconnected` | 0 | A browser client disconnected. |
| `Connected` | 1 | A browser client connected. |
| `MouseClick` | 2 | A bound element was clicked. |
| `Navigation` | 3 | A navigation event was reported. |
| `Callback` | 4 | Browser JavaScript called a bound operation. |

### `WebUI.Runtime`

| Name | Value |
| --- | ---: |
| `None` | 0 |
| `Deno` | 1 |
| `NodeJS` | 2 |
| `Bun` | 3 |

### `WebUI.LoggerLevel`

| Name | Value |
| --- | ---: |
| `Debug` | 0 |
| `Info` | 1 |
| `Error` | 2 |

## What `setRuntime()` really means

This method has a misleading name in a Bun project:

```js
hostWindow.setRuntime(WebUI.Runtime.Bun);
```

It does not:

- Select Bun as the host runtime. The host is already running in Bun.
- Make browser JavaScript run with Bun privileges.
- Affect ordinary callbacks registered with `bind()`.

It configures WebUI's built-in server to treat requested `.js` and `.ts` files
as server-side scripts and execute them using the selected external runtime.
The native core launches the selected `bun`, `deno`, or `node` executable with
the requested file and query string as command-line arguments, captures
standard output, and serves it as `text/plain`. It does not provide CGI headers
or a CGI environment. This is an advanced feature, not the normal way to serve
frontend JavaScript.

Link-Up does not need `setRuntime(WebUI.Runtime.Bun)` for its SPA or its
Bun-WebUI host. Serving ordinary frontend `.js` files as static browser assets
and exposing only narrow `bind()` operations keeps the boundary much easier to
understand and secure.

## The small browser-side API

The separate JavaScript Frontend API page documents the lowercase `webui`
bridge object inside the page. Link-Up currently needs only `webui.call()`.

| Browser API | Purpose |
| --- | --- |
| `await webui.call(name, ...args)` | Call a Bun binding and receive its text response. |
| `webui.isConnected()` | Report whether the bridge and token handshake are connected. |
| `webui.setEventCallback(callback)` | Receive frontend bridge connect/disconnect events. |
| `webui.setLogging(status)` | Toggle bridge diagnostics in the browser console. |
| `webui.encode(text)` / `webui.decode(text)` | Browser-side Base64 helpers. |
| `await webui.isHighContrast()` | Ask the host for the OS high-contrast preference. |
| `webui.allowNavigation(status)` | Control navigation after the Bun side binds all events. |

Do not mix the browser and Bun event enums. They use different names and even
different numeric ordering:

```text
Browser: webui.event.CONNECTED    === 0
Browser: webui.event.DISCONNECTED === 1

Bun:     WebUI.EventType.Disconnected === 0
Bun:     WebUI.EventType.Connected    === 1
```

Always compare an event against the enum from the same runtime.

If a Link-Up page is opened as an ordinary PWA rather than through WebUI, the
virtual `/webui.js` route and lowercase `webui` object are not inherently
available. Shared browser code must feature-detect the host or use a browser
adapter:

```js
const bridge = globalThis.webui;

if (!bridge) {
  console.log("Running without the Bun-WebUI bridge");
} else if (!bridge.isConnected()) {
  console.log("Bun-WebUI bridge present but not connected");
} else {
  const status = await bridge.call("getStatus");
  console.log(status);
}
```

For calls made during initial page startup rather than in response to a later
click, register `setEventCallback()` and also immediately check
`isConnected()`, using an idempotent startup function. The callback reports
later transitions but does not replay a connection that completed before it
was registered.

## Link-Up boundary and security rules

Bun bindings are privileged endpoints reached from browser input. Treat their
arguments as untrusted even when the browser is local.

- Validate type, length, range, and allowed values on every argument.
- Prefer narrow operations such as `saveDraft` or `getStatus` over generic
  filesystem, shell, network, navigation, or evaluation access.
- Never expose a binding that accepts an arbitrary command, file path, URL, or
  script and executes it without a strict policy.
- Do not put secrets in browser-delivered HTML or JavaScript.
- Serialize structured data deliberately and validate it again after parsing.
- Avoid sending stack traces or sensitive host paths back to the page.
- Keep `setPublic(true)` separate from Link-Up's peer-to-peer design. It exposes
  the local WebUI server; it is not Link-Up's peer transport or an
  authentication system.
- Treat custom file handlers as a process-wide security change: version
  `2.5.7` disables WebUI cookie use for all windows when either handler is
  installed.
- Keep `setProfile()` separate from Link-Up user Profiles. It manages browser
  storage directories, not Link-Up domain records.

Only Link-Up's WebUI adapter should import the native package. Add an upstream
capability to that adapter only when the application has a concrete need for
it.

## Native library, Bun build, and version caveats

The npm package is a JavaScript wrapper around a platform-native WebUI shared
library loaded through `bun:ffi`.

Important consequences:

1. Importing `@webui-dev/bun-webui` is not side-effect-free. At module load,
   the package looks for the platform library and downloads it if missing.
2. Version `2.5.7` downloads the native core from WebUI's moving `nightly`
   release URL. The wrapper is pinned by `package.json` and `bun.lock`, but a
   first-time native download is not byte-for-byte pinned by that lockfile.
3. First use can require network access and write access to the installed
   package directory, or next to a compiled executable. A command intended
   only as a syntax check may still trigger native-library resolution.
4. A Bun `--compile` executable is not automatically a single self-contained
   WebUI runtime. The wrapper still loads or caches the correct native `.dll`,
   `.so`, or `.dylib` at runtime.
5. Native libraries are operating-system and architecture specific. Build and
   test each supported target instead of copying one compiled artifact across
   platforms.
6. Browser mode still needs a supported installed browser. WebView mode needs
   the relevant operating-system WebView components.

`WebUI.version` reports the JavaScript wrapper version. It does not prove which
nightly native-core bytes were downloaded.

## Troubleshooting

### `webui is not defined`

- For content served by WebUI, confirm the page contains
  `<script src="/webui.js"></script>`.
- For a controlled external page passed to `show()`, load the bridge from the
  absolute WebUI server URL rather than that page's `/webui.js` route.
- Confirm the page is actually being served or opened by WebUI.
- If the same SPA also runs as an ordinary PWA, use a browser adapter or
  feature detection instead of assuming the bridge exists.

### `No binding was found for "name"`

- Register the operation with `bind()` before `show()`.
- Match capitalization and spelling exactly.
- Prefer `webui.call("name")` over a generated global alias.

### Browser starts, but `show()` rejects with a connection error

- Await `show()` and log the caught error.
- Check the browser console for failure to load `/webui.js`.
- Check `WebUI.getLastErrorNumber()` and `WebUI.getLastErrorMessage()` for
  native diagnostics.
- Verify a supported browser exists with `WebUI.browserExist(...)`.

### Importing or building unexpectedly downloads a file

That is the package resolving its native WebUI library. It is expected by the
`2.5.7` loader when no compatible local library is cached. It is not proof that
the application code itself made a network request.

### A custom file handler serves corrupt content

- Return a complete HTTP response.
- Compute `Content-Length` from bytes, not JavaScript string characters.
- Return a `Uint8Array` for binary content.
- Include a suitable `Content-Type`.

### A callback hangs after throwing

Catch expected failures inside the bound callback and return a controlled text
or JSON result. Do not rely on thrown exceptions being serialized back through
the bridge.

## Source priority and validation boundary

When the references disagree, use this priority:

1. Link-Up's installed `dist/src/webui.d.ts` for the public `2.5.7` signature.
2. The tagged [`src/webui.ts`](https://github.com/webui-dev/bun-webui/blob/2.5.7/src/webui.ts)
   and [`src/types.ts`](https://github.com/webui-dev/bun-webui/blob/2.5.7/src/types.ts)
   for behavior.
3. The [official Bun guide source](https://github.com/webui-dev/website/blob/main/docs/bun.md)
   for intent and platform notes.
4. The [official examples](https://github.com/webui-dev/bun-webui/tree/2.5.7/examples)
   for usage patterns.

The signatures and implementation details in this guide were checked against
the installed source. Browser and WebView presentation, OS-specific window
controls, TLS builds, public-network mode, and low-level pointer APIs were not
all exercised interactively on every platform.

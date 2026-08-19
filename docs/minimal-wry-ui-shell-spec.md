# Minimal Wry UI Shell

Prototype specification and implementation checklist.

## Purpose

Provide a Rust crate that opens one native window containing the platform WebView, loads a caller-provided URL, and passes messages between the web UI and the Rust caller.

```text
Rust application <-> UI-shell crate <-> platform WebView <-> web UI
```

The crate is only a UI boundary. It contains no application, storage, database, networking, or domain behavior.

## Required behavior

1. Create one native top-level window containing one WebView.
2. Load one caller-provided URL, including a loopback URL served by another process.
3. Run the native event loop until either the user closes the window or the Rust caller requests closure.
4. Deliver opaque UTF-8 messages from JavaScript to a Rust callback.
5. Deliver opaque UTF-8 messages from Rust to JavaScript.
6. Resize the WebView with its window.
7. Return an error when the window, WebView, URL load, message delivery, or event loop cannot be initialized.
8. Provide the same public behavior on Android, iOS, Windows, macOS, and Linux, including Linux under X11 and Wayland.

## Proposed Rust API

The exact names may change, but the public capability should remain this small:

```rust
Shell::new(url)
    .on_message(|shell, message| {
        // Application-defined handling.
        shell.send("response")?;
        Ok(())
    })
    .run()?;
```

```rust
impl ShellHandle {
    pub fn send(&self, message: impl Into<String>) -> Result<()>;
    pub fn close(&self) -> Result<()>;
}
```

`run` creates the window and blocks until it closes. The callback receives messages from the web UI. `send` sends a message to the web UI. `close` ends the event loop and closes the window.

## Browser interface

The crate injects one sending function:

```javascript
window.uiShell.send("message");
```

Messages from Rust arrive as one browser event:

```javascript
window.addEventListener("ui-shell-message", event => {
    console.log(event.detail);
});
```

Messages are strings. The crate assigns no meaning or schema to them. Applications may use plain text, JSON, or another encoding without involving the crate.

The crate does not automatically forward DOM events. Frontend code decides which browser events should call `window.uiShell.send()`.

## Implementation boundary

Use Wry for the WebView and JavaScript bridge. Use Tao for the native window and event loop. Retain only the small amount of platform-specific code Wry requires, such as GTK embedding on Linux and mobile initialization.

Mobile test applications may use Wry's recommended `cargo-mobile2` project scaffolding. That scaffolding validates the crate but is not generated, managed, or packaged by the crate.

## Explicitly excluded

- HTTP server or JavaScript runtime
- Storage, database, filesystem, or network API
- Application or domain code
- RPC system, named function binding, request identifiers, or message schema
- Frontend assets, frontend framework, or asset bundling
- Multiple windows, tabs, or embedded child views
- Menus, tray icons, dialogs, notifications, or native widgets
- Browser navigation controls
- Permission, download, clipboard, or developer-tools APIs
- Installers, application packages, signing, updating, or distribution
- C ABI or bindings for languages other than Rust
- Normalization of behavioral differences between browser engines

## Acceptance test

The same small test page and Rust example must run on every target:

1. The WebView loads the supplied URL.
2. Clicking a page button sends `ping` to Rust.
3. Rust sends `pong` back.
4. The page displays `pong`.
5. The native close control exits cleanly.
6. A second page button asks Rust to close the shell, which also exits cleanly.

Passing this test on Android, iOS, Windows, macOS, Linux/X11, and Linux/Wayland completes the prototype.

## Ordered implementation checklist

| Work | Estimated active time |
| --- | ---: |
| Create the crate, pin Wry/Tao, and expose the minimal API | 2–4 hours |
| Open, resize, run, and close one window/WebView | 3–5 hours |
| Implement and safely escape the two-way string bridge | 3–5 hours |
| Add errors and clean event-loop termination | 2–4 hours |
| Build and validate Linux/X11 and Linux/Wayland | 3–5 hours |
| Build and validate Windows and macOS | 4–8 hours |
| Build and validate Android | 4–8 hours |
| Build and validate iOS | 4–8 hours |
| Finish the test page, example, tests, and usage documentation | 3–5 hours |

## Revised estimate

Assuming the five build environments are available and correctly configured:

- **Core implementation:** 10–18 active hours
- **Cross-platform validation and fixes:** 18–30 active hours
- **Total:** **28–48 active hours**, approximately **four to six focused working days**

This estimate excludes time spent obtaining hardware, installing platform SDKs, waiting for signing access, or diagnosing pre-existing toolchain problems.

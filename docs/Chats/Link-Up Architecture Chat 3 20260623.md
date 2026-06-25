# Link-Up Architecture Chat 3

## Summary

This chat clarified that Link-Up should not be treated as a traditional browser-runtime PWA, even though it should preserve the seamless web-to-app experience that makes PWAs appealing.

The original goal was to let users begin at a normal website, such as `link-up.com`, then move smoothly into the real app without feeling like they are installing technical software, running a local server, or using something developer-oriented like `localhost`.

The final direction is an installed local-node application with a web-native user interface.

Externally, Link-Up should feel like a PWA:

```text
visit website
join/download
install/launch
use app with no visible browser chrome
```

Internally, it should not rely on the browser as the application runtime. The installed app should own the runtime, local state, storage, P2P networking, identity, crypto, and synchronization. The HTML/CSS/JS layer should mainly be the GUI.

## Main conclusion

The thing worth keeping from the PWA idea is not the browser-controlled runtime, service worker model, or browser storage model. The thing worth keeping is the seamless web-to-app user experience.

The corrected mental model is:

```text
Website gets users into the network.
Installed local node keeps users in the network.
HTML/CSS/JS remains the UI.
P2P belongs underneath the UI, not inside the webpage alone.
```

## Recommended architecture shape

```text
link-up.com
  public website
  marketing
  download/install page
  account bootstrap
  recovery
  updates
  rendezvous/signaling

Link-Up installed app
  local Bun.js backend/core
  local HTTP/WebSocket API
  embedded static HTML/CSS/JS assets
  chrome-less WebView UI
  SQLite/filesystem storage
  local identity and crypto
  P2P networking
  media cache
  blocks/reports/permissions logic
```

The user should never need to see:

```text
localhost
127.0.0.1
random ports
local server details
P2P node details
```

The installed app can use those internally, but the product presentation should simply be “Link-Up.”

## PWA distinction

A normal PWA is controlled by the browser:

```text
browser owns runtime
service worker owns limited background behavior
browser storage owns local data
browser lifecycle controls execution
```

Link-Up’s clarified model is different:

```text
installed app owns runtime
local node owns background behavior
SQLite/filesystem owns local data
WebView renders the UI
P2P transport runs underneath
```

From the user’s perspective, this may still look like a PWA. Architecturally, it is better understood as a native/local application with a web UI.

## Why not serve the local app as `link-up.com/app`?

The idea of having `link-up.com/index.html` download the app, then having `link-up.com/app` secretly serve the local app, does not work cleanly in a normal browser.

A URL like:

```text
https://link-up.com/app
```

means the browser resolves `link-up.com` through DNS and expects a valid TLS connection for that domain. A local process cannot casually take over that URL without DNS tricks, hosts-file changes, custom certificates, a local proxy/VPN, or app-level request interception.

A certificate can prove control over a domain, but it does not make the domain route to the local machine.

Because of that, the cleaner answer is not to fake `link-up.com` locally. The better answer is to avoid showing a browser address bar after installation.

## Desired install and launch flow

The ideal user flow is:

```text
1. User visits link-up.com
2. User clicks Download / Join / Get Started
3. Installer runs with user consent
4. Installer launches Link-Up
5. Link-Up opens a chrome-less WebView
6. The WebView renders embedded HTML/CSS/JS
7. The UI talks to the local backend
8. The local backend talks to peers and Link-Up services
```

The public website is the entry point and trust surface. The installed app is the real runtime.

The app can later support deep links or app links, such as:

```text
linkup://open
https://link-up.com/open
```

These can hand control from the website back to the installed app after installation.

## Product psychology

A major product insight from the chat was that gay dating users are not usually thinking:

```text
I am installing a local P2P application on my device.
```

They are more likely thinking:

```text
I am going to a gay dating website.
```

Therefore, Link-Up should use the web as the launch surface, marketing surface, trust surface, and onboarding funnel.

The technical architecture can be unusual, but the user story should feel familiar:

```text
I went to the site.
I joined.
It opened like an app.
Now I use it like any other dating app.
```

Avoid user-facing language like:

```text
download client
install node
local server
P2P runtime
desktop daemon
```

Prefer language like:

```text
Open Link-Up
Install Link-Up
Launch Link-Up
Keep me connected
Use Link-Up on this device
```

## Frontend/backend split

The final mental model simplifies the application split.

The frontend should be mostly static assets:

```text
HTML
CSS
JavaScript
static rendering
user interaction
local API calls
```

The backend/local core should own most of the application:

```text
state
SQLite/filesystem
identity
crypto
P2P
sync
presence
media cache
permissions
blocks/reports
local API
WebSocket events
```

The frontend does not need to pretend to be the application runtime. It is the interface layer.

The app shape becomes:

```text
WebView UI
  fetch()
  WebSocket
  forms/events/rendering

Local backend
  owns the app
  exposes HTTP routes
  exposes WebSocket events
  persists data
  talks to peers
  talks to link-up.com when needed
```

This makes the earlier HTML/CSS/JS instinct stronger, not weaker. If the frontend is thin and backend-owned, a heavy frontend framework becomes less necessary.

## Bun.js decision

The decision was made to stick with Bun.js for now.

Reasons:

- The app is being framed as a local-node application, not a giant centralized production backend.
- Bun fits the current shape well: local server, static assets, WebSocket API, SQLite/filesystem access, JavaScript glue, and possible standalone executable builds.
- JavaScript keeps the frontend and backend in one language.
- The JavaScript ecosystem is large.
- Modern JavaScript is considered pleasant enough for this project.
- TypeScript is intentionally avoided because its type system is viewed as increasingly unwieldy and unsound.

The agreed direction is:

```text
Bun.js backend/core
plain JavaScript
JSDoc where useful
tsc/checkJs for sanity checks if helpful
small modules
few dependencies
no React
no TypeScript source
backend owns state
frontend stays thin
```

## Bun vs Go clarification

The earlier recommendation for Go was not because Bun is categorically unstable. It was because Go has a longer operational record for boring, long-running production network services.

The distinction made was:

```text
Bun:
  good for speed, tooling, frontend-adjacent server code,
  local dev, scripts, prototypes, controlled services,
  and this local-node style MVP.

Go:
  better for boring long-lived infrastructure expected
  to run for years at larger scale.
```

Given the clarified Link-Up model, Bun became more reasonable because the local backend is closer to an application runtime than a massive centralized service.

For future production scale, Go could still make sense for remote control-plane services, but Bun is a coherent MVP choice.

## Framework discussion

React was rejected. The user strongly dislikes React.

Shadow DOM was also criticized as going against the principles of the web and MVC-style applications.

The resulting direction is web-native UI without React and without making Shadow DOM a required foundation.

Possible UI approach:

```text
plain HTML
plain CSS
small JavaScript modules
thin local API client
possibly simple component conventions
possibly server/local-rendered HTML fragments
```

Because the backend owns most state and behavior, the frontend can remain simple.

## WebView performance

Using a full browser engine in a WebView does not automatically make the UI slow.

For Link-Up’s UI shape, WebView is suitable:

```text
profiles
grids
chat
settings
forms
filters
onboarding
modals
map controls
```

The likely performance problems are not “WebView exists.” They are:

```text
cold startup
memory use
large DOMs
too much frontend JavaScript
layout thrashing
huge images
bad scrolling/list rendering
over-rendering reactive components
map marker overload
```

The architecture helps performance because:

```text
static assets are local
API is local
database is local
media cache is local
frontend is thin
backend owns state
```

The rule established was:

```text
Use WebView for UI.
Do not make the WebView the app runtime.
Do not make the frontend heavy.
```

The map is likely the heaviest UI piece, especially marker count, clustering, tile loading, viewport updates, and overlays.

## Final architecture statement

The current clarified Link-Up architecture is:

```text
Link-Up is not primarily a PWA.
Link-Up is an installed local-node app with a web-native UI.

The website is the public entry point.
The installer creates the local runtime.
The app opens as a chrome-less WebView.
The frontend is static HTML/CSS/JS.
The backend is a Bun.js local core.
The backend owns state, storage, identity, crypto, P2P, sync, and authority.
The user experience should still feel as seamless as a PWA.
```

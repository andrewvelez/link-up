# Link-Up Roadmap

This document is for outlining the roadmap as it is known currently.

## User Stories

1. As a user, I can use Link-Up on a Mac, Windows, or Linux computer.
2. As a user, I can use Link-Up on an Android phone or tablet.
3. As a user, I can use Link-Up on an iPhone or iPad.
4. As a user, I can create and update my Link-Up profile.
5. As a user, I can verify that my data is stored locally and remains so even after closing and opening the app.
6. As a user, I get the same core Link-Up experience whether I use the browser version or the installed version.
7. As a user, I can choose to share my location with Link-Up when a feature needs it.
8. As a user, I can view a profile another Link-Up user shares with me.
9. As a user, I can share my profile with another Link-Up user.
10. As a user, Link-Up can connect directly to other Link-Up users when a direct connection is available.
11. As a user, I can send a private message to another Link-Up user.
12. As a user, I can receive private messages from another Link-Up user.
13. As a user of the installed PWA, I can receive system notifications from Link-Up.
14. As a user of the installed app, I can receive a notification when a new message arrives.

### _Not yet accepted as a user story._

a. As a user, I can open Link-Up in a supported web browser without installing it.

## Development Sprints

Each sprint represents approximately one week of estimated work, not a required
delivery schedule.

1. **Build the PWA Shell** — Create the landing page (`web/index.html`) and
   the hypermedia application (`web/app.html`), a service worker that precaches the
   shell and serves `/api/*` requests locally from IndexedDB, and a web app
   manifest so the application is installable. Covers technical groundwork
   for user stories 1, 2, 3, and 6, and for the not-yet-accepted
   browser-without-installing story.
2. **Verify the Desktop PWA** — Verify the Link-Up PWA on macOS, Windows, and
   Linux, including installation, offline operation, and the service worker's
   local API in supported desktop browsers. Covers user story 1.
3. **Build the Local Profile** — Create and update a profile, store it locally,
   and restore it after restarting Link-Up. Covers user stories 4 and 5.
4. **Unify Browser and Installed Modes** — Provide the same profile and local
   persistence behavior in a browser tab and as an installed PWA. Covers user
   stories 4, 5, and 6.
5. **Verify the Android Experience** — The PWA install path (sprint 1) already
   delivers an installable Link-Up on Android Chrome; this sprint verifies
   install, icons, and offline behavior on Android phones and tablets and
   addresses platform-specific gaps. Covers user story 2.
6. **Verify the Apple Mobile Experience** — The PWA install path (sprint 1)
   already delivers an installable Link-Up on iOS/iPadOS Safari; this sprint
   verifies install, icons, and offline behavior on iPhones and iPads,
   accounting for iOS-specific constraints: Safari is the only browser with
   reliable install support, there is no automatic install prompt (an
   instructions overlay is needed), and installs attempted from inside
   in-app browsers such as Instagram or Facebook generally fail. Covers user
   story 3.

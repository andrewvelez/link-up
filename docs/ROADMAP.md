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
13. As a user of the installed app, I can receive native notifications from Link-Up.
14. As a user of the installed app, I can receive a notification when a new message arrives.

### _Not yet accepted as a user story._

a. As a user, I can open Link-Up in a supported web browser without installing it.

## Development Sprints

Each sprint represents approximately one week of estimated work, not a required
delivery schedule.

1. **Deliver the Android Application** — Package and verify the single-page
   featureless shell prototype on Android phones and tablets. Covers user story 2.
2. **Deliver the Desktop Applications** — Package and verify the single-page
   featureless shell prototype on macOS, Windows, and Linux. Covers user story 1.
3. **Build the Local Profile** — Create and update a profile, store it locally,
   and restore it after restarting Link-Up. Covers user stories 4 and 5.
4. **Unify Browser and Installed Modes** — Provide the same profile and local
   persistence behavior through the browser and Tauri platform adapters. Covers
   user stories 4, 5, and 6.
5. **Deliver the Apple Mobile Application** — Package and verify the single-page
   featureless shell prototype on iPhones and iPads. Covers user story 3.

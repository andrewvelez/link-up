# AGENTS.md

## Overview

- Ask clarifying questions before changing code unless the task is unambiguous.
- Keep responses pragmatic and concise.
- Do not make changes without first showing the intended diff and getting approval.
- The current design direction for the project is in `docs/DESIGN.md`. All other docs may be out of date.
- Do not declare ~~editor configuration~~ **any file** valid from visual inspection. Identify the reported diagnostic, validate the relevant properties against the active extension/schema, and report what was actually verified. If the diagnostic is unavailable from the workspace, ask for its exact text without claiming validity.
- Leave unresolved architecture decisions explicitly unresolved; do not fill gaps with guesses.

## Architecture

- Link-Up is a Tauri 2 application.
- The frontend lives in `src/` and uses vanilla JavaScript, HTML, and CSS without a frontend framework, TypeScript, or a bundler.
- The Rust/Tauri host lives in `src-tauri/`. Expose native capabilities to the frontend through narrow, explicit Tauri commands and capabilities.

## Build Commands

- Install dependencies: `npm install`
- Build the application: `npm run tauri build`
- Run the application in development: `npm run tauri dev`
- Automated tests are not configured for the Tauri architecture yet; do not claim test coverage.

## Coding Style

- Use vanilla idiomatic modern JavaScript with JavaScript-focused JSDoc in the frontend; do not introduce TypeScript or a frontend framework.
- JSDoc annotations may only use real JavaScript/runtime types when they add useful checking.
- Use idiomatic Rust in `src-tauri/`.
- Prefer more idiomatic and smaller changesets.
- Every new source file that supports comments should contain a valid header comment with the MIT license tag, author name/year, and description.
- Regular code shouldn't be modified solely for tests unless there is a benefit for the regular code as well.
